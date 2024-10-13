const logger = require('../logger/loggerWinston');
const { getMessageData, modifyStr } = require('./getMessageData');
const getNormalizedFiisData = require('./getNormalizedFiisData');

const MAX_RETRIES = 2;

const buildEventsMsg = (data) => {
  let msg = [];

  data.forEach((value) => {
    const options = { bold: true };
    const status = value.status.includes('-') ? 'baixa' : 'alta';
    const rendDistribution = value.rend_distribution || {};
    const lastManagementReport = value.last_management_report || {};

    const modifiedValues = {
      code: modifyStr(value.code, options),
      name: modifyStr(value.name, options),
      type: modifyStr(value.fii_type, options),
      currentPrice: modifyStr(value.current_price, options),
      status: modifyStr(value.status, {
        ...options,
        span: { position: 'end', value: `${status} últ. dia` },
      }),
      averageDaily: modifyStr(value.average_daily, options),
      lastDividend: modifyStr(value.last_dividend, options),
      dividendYield: modifyStr(value.dividend_yield, {
        ...options,
        span: { position: 'end', value: 'últ. 12 meses' },
      }),
      lastDividendYield: modifyStr(value.last_dividend_yield, options),
      netWorth: modifyStr(value.net_worth, options),
      pvp: modifyStr(value.p_vp, options),
      lastRendDistribution: {
        dividend: modifyStr(rendDistribution.dividend, options),
        incomePercentage: modifyStr(
          rendDistribution.income_percentage,
          options
        ),
        payDay: modifyStr(rendDistribution.future_pay_day, options),
        dataCom: modifyStr(rendDistribution.data_com, options),
      },
      lastManagementReport: modifyStr(lastManagementReport.link, {
        ...options,
        span: { position: 'start', value: lastManagementReport.date },
      }),
    };

    let str = `FII: ${modifiedValues.code}\n`;
    str += `Nome: ${modifiedValues.name}\n`;
    str += `Tipo: ${modifiedValues.type}\n`;
    str += `Preço atual: ${modifiedValues.currentPrice}\n`;
    str += `Status: ${modifiedValues.status}\n`;
    str += `Liquidez Média Diária: ${modifiedValues.averageDaily}\n`;
    str += `Último dividendo: ${modifiedValues.lastDividend}\n`;
    str += `Dividend Yield: ${modifiedValues.dividendYield}\n`;
    str += `Último Dividend Yield: ${modifiedValues.lastDividendYield}\n`;
    str += `Patrimônio Líquido: ${modifiedValues.netWorth}\n`;
    str += `P/VP: ${modifiedValues.pvp}\n`;
    str += `Última Distribuição de Renda:\n`;
    str += `- Dividendo: ${modifiedValues.lastRendDistribution.dividend}\n`;
    str += `- Rendimento: ${modifiedValues.lastRendDistribution.incomePercentage}\n`;
    str += `- Pagamento: ${modifiedValues.lastRendDistribution.payDay}\n`;
    str += `- Data com: ${modifiedValues.lastRendDistribution.dataCom}\n`;
    str += `Último Relatório Gerencial: ${modifiedValues.lastManagementReport}\n`;
    str += `> \`Para mais relatórios desse FII, acesse: ${value.reports_link}\`\n`;
    str += `> \`Para mais info sobre esse FII, acesse: ${value.url}\``;

    msg.push(str);
  });

  return msg;
};

const getFiisData = async (client, from, message, retry = 0) => {
  try {
    if (retry >= MAX_RETRIES) {
      client.sendMessage(from, 'Reached max attempts to get fiis data. Try again...');
      return;
    }

    const fiis = getMessageData(message);

    logger.info(`Retrieving FIIs: ${fiis.replaceAll(',', ' ')}`);

    await client.sendMessage(
      from,
      'Scraping *https://fundsexplorer.com.br/funds/* para pegar os dados, isso pode levar um tempo...'
    );

    const [fiisResponse, fiisWithoutReport] = await getNormalizedFiisData(fiis);

    const msg = buildEventsMsg(fiisResponse);
    msg.forEach((msg) => client.sendMessage(from, msg));

    if (!!fiisWithoutReport) {
      retry++;
      logger.info(`Trying again to get data for fiis: ${fiisWithoutReport.replaceAll(',', ' ')}. Attempt: ${retry}`);
      await getFiisData(client, from, `!fiis ${fiisWithoutReport}`, retry);
    }
  } catch (e) {
    logger.error(`Some error occurred: ${e}`);
    client.sendMessage(from, `Some error occurred: ${e}`);
  }

  logger.info('Fiis data processed successfully.');
};

module.exports = getFiisData;
