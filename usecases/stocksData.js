const axios = require('axios');
const logger = require('../logger/loggerWinston');
const { getMessageData, modifyStr } = require('./getMessageData');
const normalizeData = require('./normalizeData');

const buildEventsMsg = (data, showDividends) => {
  let msg = [];

  data.forEach((value) => {
    const options = { bold: true };
    const lastYearLbl = 'últ. 12 meses';
    const status = value.status.includes('-') ? 'baixa' : 'alta';
    const modifiedValues = {
      code: modifyStr(value.code, options),
      name: modifyStr(value.name, options),
      operationSector: modifyStr(value.operation_sector, options),
      currentPrice: modifyStr(value.current_price, options),
      status: modifyStr(value.status, {
        ...options,
        span: { position: 'end', value: `${status} ${lastYearLbl}` },
      }),
      averageDaily: modifyStr(value.average_daily, options),
      dividendYield: modifyStr(value.dividend_yield, {
        ...options,
        span: { position: 'end', value: lastYearLbl },
      }),
      netWorth: modifyStr(value.net_worth, options),
      pvp: modifyStr(value.p_vp, options),
      pl: modifyStr(value.p_l, options),
      roe: modifyStr(value.roe, options),
      cagr: modifyStr(value.cagr, {
        ...options,
        span: { position: 'end', value: 'lucros 5 anos' },
      }),
      netDebtEbitda: modifyStr(value.net_debt_ebitda, options),
      totalStockPaper: modifyStr(value.total_stock_paper, options),
      lastManagementReport: modifyStr(value.last_management_report?.link, {
        ...options,
        span: {
          position: 'start',
          value: value.last_management_report?.date || '',
        },
      }),
    };

    let str = `Ticker: ${modifiedValues.code}\n`;
    str += `Nome: ${modifiedValues.name}\n`;
    str += `Setor: ${modifiedValues.operationSector}\n`;
    str += `Preço atual: ${modifiedValues.currentPrice}\n`;
    str += `Status: ${modifiedValues.status}\n`;
    str += `Liquidez Média Diária: ${modifiedValues.averageDaily}\n`;
    str += `Dividend Yield: ${modifiedValues.dividendYield}\n`;
    str += `Patrimônio Líquido: ${modifiedValues.netWorth}\n`;
    str += `P/VP: ${modifiedValues.pvp}\n`;
    str += `P/L: ${modifiedValues.pl}\n`;
    str += `ROE: ${modifiedValues.roe}\n`;
    str += `CAGR: ${modifiedValues.cagr}\n`;
    str += `Dívida Líquida/EBITDA: ${modifiedValues.netDebtEbitda}\n`;
    str += `Total de papéis: ${modifiedValues.totalStockPaper}\n`;
    str += `Último Relatório Trimestral: ${modifiedValues.lastManagementReport}\n`;

    if (showDividends && value.dividends_history) {
      str += `Histórico de Dividendos: \n`;
      str += `*Tipo*\t\t*Data Com*\t\t*Pagamento*\t\t*Valor*\n`;

      value.dividends_history.forEach((value, i) => {
        str += `${modifyStr(value.type, options)}\t\t${modifyStr(
          value.data_com,
          options
        )}\t\t${modifyStr(value.pay_day, options)}\t\t${modifyStr(
          value.value,
          options
        )}\n`;
      });
    }

    str += `> \`Para mais relatórios dessa ação, acesse: ${value.reports_link}\`\n`;
    str += `> \`Para mais info sobre essa ação, acesse: ${value.url}\``;

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
      'Scraping *https://investidor10.com.br/acoes/* para pegar os dados, isso pode levar um tempo...'
    );

    const result = await axios.get(
      `https://stockmarketfunction.azurewebsites.net/api/stocks?stocks=${stocks}`
    );

    const stocksData = await normalizeData(result.data);

    const msg = buildEventsMsg(stocksData, showDividends);
    msg.forEach((msg) => client.sendMessage(from, msg));
  } catch (e) {
    logger.error(`Some error occurred: ${e}`);
    client.sendMessage(from, `Some error occurred: ${e}`);
  }
};

module.exports = getStocksData;
