const axios = require('axios');
const logger = require('../logger/loggerWinston');
const { getMessageData, boldStr } = require('./getMessageData');

const buildEventsMsg = async (data, showDividends) => {
  let msg = [];

  data.forEach((value) => {
    let str = `Ticker: ${boldStr(value.code)}\n`;
    str += `Nome: ${boldStr(value.name)}\n`;
    str += `Setor: ${boldStr(value.operation_sector)}\n`;
    str += `Preço atual: ${boldStr(value.current_price)}\n`;
    str += `Status: ${boldStr(value.status)} \`(${
      value.status.includes('-') ? 'baixa' : 'alta'
    })\`\n`;
    str += `Liquidez Média Diária: ${boldStr(value.average_daily)}\n`;
    // str += `Último dividendo: ${boldStr(value.last_dividend)}\n`;
    str += `Dividend Yield: ${boldStr(
      value.dividend_yield
    )} \`(últ. 12 meses)\`\n`;
    str += `Patrimônio Líquido: ${boldStr(value.net_worth)}\n`;
    str += `P/VP: ${boldStr(value.p_vp)}\n`;
    str += `P/L: ${boldStr(value.p_l)}\n`;
    str += `ROE: ${boldStr(value.roe)}\n`;
    str += `CAGR: ${boldStr(value.cagr)} \`(Lucros 5 anos)\`\n`;
    str += `Dívida Líquida/EBITDA: ${boldStr(value.net_debt_ebitda)}\n`;
    str += `Total de papéis: ${boldStr(value.total_stock_paper)}\n`;
    if (showDividends && value.dividends_history) {
      str += `Histórico de Dividendos: \n`;
      str += `*Tipo*\t\t*Data Com*\t\t*Pagamento*\t\t*Valor*\n`;

      value.dividends_history.forEach((value, i) => {
        str += `${boldStr(value.type)}\t\t${boldStr(
          value.data_com
        )}\t\t${boldStr(value.pay_day)}\t\t${boldStr(value.value)}\n`;
      });
    }
    str += `For more info about this Stock, access: ${boldStr(value.url)}`;

    msg.push(str);
  });

  return msg;
};

const getStocksData = async (client, from, message) => {
  try {
    const rawStocks = getMessageData(message);
    const showDividends = rawStocks.includes('dividends');
    const stocks = rawStocks.replace(',dividends', '');

    logger.info(`Retrieving Stocks: ${stocks.replaceAll(',', ' ')}`);

    await client.sendMessage(
      from,
      'Scraping https://investidor10.com.br/acoes/ to get the data, it will take a while...'
    );

    const result = await axios.get(
      `https://stockmarketfunction.azurewebsites.net/api/stocks?stocks=${stocks}`
    );

    const msg = await buildEventsMsg(result.data, showDividends);
    msg.forEach((msg) => client.sendMessage(from, msg));
  } catch (e) {
    logger.error(`Some error occurred: ${e}`);
    client.sendMessage(from, `Some error occurred: ${e}`);
  }
};

module.exports = getStocksData;
