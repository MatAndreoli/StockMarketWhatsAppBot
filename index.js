const qrcode = require("qrcode-terminal");
const onMessageCallback = require("./onMessage");
const logger = require("./logger/loggerWinston");
const Scheduler = require("./scheduler");
const { Client, LocalAuth } = require("whatsapp-web.js");

const client = new Client({
  puppeteer: {
    args: ["--no-sandbox"],
  },
  webVersionCache: {
    type: "remote",
    remotePath:
      "https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.3000.1029384238-alpha.html",
  },
  authStrategy: new LocalAuth(),
});

client.initialize();

client.on("authenticated", () => {
  logger.info("Authenticated");
});

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("ready", async () => {
  logger.info("Client is ready!");

  try {
    const scheduler = new Scheduler(client);

    const { fiisFrequency, numbers } = scheduler.getSchedulerValues();
    numbers.forEach((number) => {
      scheduler.scheduleFiisUpdate(number, fiisFrequency);
      // scheduler.scheduleStocksUpdate(number, frequency);
    });
  } catch (error) {
    logger.error("Error setting up scheduler:", error);
  }
});

client.on(
  "message",
  async (message) => await onMessageCallback(client, message),
);
