const schedule = require('node-schedule');
const { readFileSync } = require('fs');
const logger = require('../logger/loggerWinston');
const getFiisData = require('../usecases/fiisData');
const getStocksData = require('../usecases/stocksData');

class Scheduler {
  constructor(client) {
    this.client = client;
    this.jobs = [];
  }

  getSchedulerValues() {
    const values = JSON.parse(
      readFileSync('./scheduler/values.json', { encoding: 'utf8' })
    );
    return values;
  }

  async getContactId(phoneNumber) {
    try {
      const cleanedNumber = phoneNumber.replace(/\D/g, '');

      console.log(cleanedNumber)
      const contact = await this.client.getContactById(`${cleanedNumber}@c.us`);
      return contact.id._serialized;
    } catch (error) {
      logger.error(`Error finding contact for number ${phoneNumber}:`, error);
      throw new Error(`Could not find contact for number: ${phoneNumber}`);
    }
  }

  scheduleMessage(contactId, messageOrCallback, recurrence) {
    try {
      const job = schedule.scheduleJob(recurrence, async () => {
        try {
          if (typeof messageOrCallback === 'function') {
            await messageOrCallback();
          } else {
            await this.client.sendMessage(contactId, messageOrCallback);
          }
          logger.info(`Scheduled message sent to ${contactId}`);
        } catch (error) {
          logger.error(`Error sending scheduled message: ${error}`);
        }
      });

      this.jobs.push({ contactId, job });
      return job;
    } catch (error) {
      logger.error(`Error scheduling message: ${error}`);
      return null;
    }
  }

  async scheduleFiisUpdate(phoneNumber, frequency = '0 9 * * *') {
    const { fiis } = this.getSchedulerValues();
    const contactId = await this.getContactId(phoneNumber);
    return this.scheduleMessage(contactId, async () => {
      try {
        await getFiisData(this.client, contactId, `!fiis ${fiis.join(' ')}`);
      } catch (error) {
        logger.error(`Error in scheduled FIIs update: ${error}`);
      }
    }, frequency);
  }

  async scheduleStocksUpdate(phoneNumber, frequency = '0 9 * * *') {
    const { stocks } = this.getSchedulerValues();
    const contactId = await this.getContactId(phoneNumber);
    return this.scheduleMessage(contactId, async () => {
      try {
        await getStocksData(this.client, contactId, `!stocks ${stocks.join(' ')}`);
      } catch (error) {
        logger.error(`Error in scheduled stocks update: ${error}`);
      }
    }, frequency);
  }

  cancelJob(contactId) {
    const jobIndex = this.jobs.findIndex(job => job.contactId === contactId);
    if (jobIndex !== -1) {
      this.jobs[jobIndex].job.cancel();
      this.jobs.splice(jobIndex, 1);
      logger.info(`Canceled job for ${contactId}`);
    }
  }

  cancelAllJobs() {
    this.jobs.forEach(job => job.job.cancel());
    this.jobs = [];
    logger.info('All scheduled jobs canceled');
  }
}

module.exports = Scheduler;
