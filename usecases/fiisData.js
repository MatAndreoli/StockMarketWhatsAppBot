const axios = require('axios');
const logger = require('../logger/loggerWinston');
const { getMessageData, boldStr } = require('./getMessageData');

const buildEventsMsg = async (data) => {
  let msg = [];

  data.forEach((value) => {
    const rendDistribution = value.rend_distribution || {};
    const lastManagementReport = value.last_management_report || {};

    let str = `FII: ${boldStr(value.code)}\n`;
    str += `Nome: ${boldStr(value.name)}\n`;
    str += `Tipo: ${boldStr(value.fii_type)}\n`;
    str += `Preço atual: ${boldStr(value.current_price)}\n`;
    str += `Status: ${boldStr(value.status)} \`(${
      value.status.includes('-') ? 'baixa' : 'alta'
    })\`\n`;
    str += `Liquidez Média Diária: ${boldStr(value.average_daily)}\n`;
    str += `Último dividendo: ${boldStr(value.last_dividend)}\n`;
    str += `Dividend Yield: ${boldStr(
      value.dividend_yield
    )} \`(últ. 12 meses)\`\n`;
    str += `Último Dividend Yield: ${boldStr(value.last_dividend_yield)}\n`;
    str += `Patrimônio Líquido: ${boldStr(value.net_worth)}\n`;
    str += `P/VP: ${boldStr(value.p_vp)}\n`;
    str += `Última Distribuição de Renda:\n`;
    str += `- Dividendo: ${boldStr(rendDistribution.dividend || '')}\n`;
    str += `- Rendimento: ${boldStr(
      rendDistribution.income_percentage || ''
    )}\n`;
    str += `- Pagamento: ${boldStr(rendDistribution.future_pay_day || '')}\n`;
    str += `- Data com: ${boldStr(rendDistribution.data_com || '')}\n`;
    str += `Último Relatório Gerencial: (${boldStr(
      lastManagementReport.date || ''
    )}) ${boldStr(lastManagementReport.link || '')}\n`;
    str += `For more info about this FII, access: ${boldStr(value.url)}`;

    msg.push(str);
  });

  return msg;
};

const getFiisData = async (client, from, message) => {
  try {
    const fiis = getMessageData(message);

    logger.info(`Retrieving FIIs: ${fiis.replaceAll(',', ' ')}`);

    await client.sendMessage(
      from,
      'Scraping https://fundsexplorer.com.br/funds/ to get the data, it will take a while...'
    );

    const result = await axios.get(
      `https://stockmarketfunction.azurewebsites.net/api/fiis?fiis=${fiis}`
    );

    const msg = await buildEventsMsg(result.data);
    msg.forEach((msg) => client.sendMessage(from, msg));
  } catch (e) {
    logger.error(`Some error occurred: ${e}`);
    client.sendMessage(from, `Some error occurred: ${e}`);
  }
};

module.exports = getFiisData;
