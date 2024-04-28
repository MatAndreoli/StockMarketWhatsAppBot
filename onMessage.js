const logger = require('./logger/loggerWinston');
const getFiisData = require('./usecases/fiisData');

const onMessage = async (client, message) => {
  const {body, from} = message;
  logger.info(`Incoming message: ${body}`);

  switch (true) {
    case body.includes('!fiis'):
      await getFiisData(client, from, body);
      break;

    default:
      let optionsMsg ="Hey!!!\nI'm a bot. I can operate the following options:\n";
      optionsMsg += '- *!events limit*: I scrape the Unisal events page and get the events that will happen.\nExample of message:\n\t- !events 5\n';
      optionsMsg +=
        '- *!fiis*: I get data from a list of FIIs from Funds Explorer. You just need to tell me what FIIs you want to get. \n\tExample of message:\n\t- !fiis mxrf11 bcff11 xpto11 ...\n\t- !fiis xpca11,bcff11,xpto11,...\n\t- !fiis mxrf11, bcff11, xpto11, ...';
      client.sendMessage(from, optionsMsg);
      break;
  }
};

module.exports = onMessage;
