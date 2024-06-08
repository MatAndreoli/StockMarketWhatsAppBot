const logger = require('./logger/loggerWinston');
const getFiisData = require('./usecases/fiisData');
const getStocksData = require('./usecases/stocksData');

const onMessage = async (client, message) => {
  const { body, from } = message;
  logger.info(`Incoming message: ${body}`);

  switch (true) {
    case body.includes('!fiis'):
      await getFiisData(client, from, body);
      break;

    case body.includes('!stocks'):
      await getStocksData(client, from, body);
      break;

    default:
      let optionsMsg =
        "Hey there!!!\nI'm your friendly bot, here to help you with FIIs and Stocks data. Here's what I can do for you:\n";
      await client.sendMessage(from, optionsMsg);

      optionsMsg =
        "*FIIS Data:* \n- Use the command `!fiis` followed by the ticker symbols of the FIIs you're interested in. \n- You can separate the symbols with spaces, commas, or a mix of both. \n*Examples:* \n> `!fiis mxrf11 bcff11 xpto11`\n> `!fiis xpca11,bcff11,xpto11`\n> `!fiis mxrf11, bcff11, xpto11`\n";
      await client.sendMessage(from, optionsMsg);

      optionsMsg =
        "*Stocks Data:* \n- Use the command `!stocks` followed by the ticker symbols of the Stocks you're interested in. \n- You can separate the symbols with spaces, commas, or a mix of both.\n- You can pass `dividends` to show a table with the dividends history. \n*Examples:* \n> `!stocks petr4 vale3 itub4`\n> `!stocks abev3,petr4,vale3`\n> `!stocks itub4, abev3, petr4 dividends`";
      await client.sendMessage(from, optionsMsg);
      break;
  }
};

module.exports = onMessage;
