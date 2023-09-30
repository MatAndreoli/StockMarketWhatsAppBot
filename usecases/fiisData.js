const logger = require('../logger/loggerWinston');
const axios = require('axios');
const path = require('path');
const { readFile } = require('fs/promises');
const { API_URL } = require('../vars');

const boldStr = (str) => (str ? str.replace(/^/, '*').replace(/$/, '*') : '');

const buildEventsMsg = async () => {
  let msg = [];
  const data = await readFile(
    path.resolve(__dirname, '../../WebScraper/fiisdata.json'),
    { encoding: 'utf8' }
  );

  JSON.parse(data).forEach((value) => {
    const rendDistribution = value.rend_distribution || {};
    const lastManagementReport = value.last_management_report || {};

    let str = `FII: ${boldStr(value.code)}\n`;
    str += `Nome: ${boldStr(value.name)}\n`;
    str += `Tipo: ${boldStr(value.fii_type)}\n`;
    str += `Preço atual: ${boldStr(value.current_price)}\n`;
    str += `Status: ${boldStr(value.status)} (${
      value.status.includes('-') ? 'baixa' : 'alta'
    })\n`;
    str += `Liquidez Média Diária: ${boldStr(value.average_daily)}\n`;
    str += `Último dividendo: ${boldStr(value.last_dividend)}\n`;
    str += `Dividend Yield: ${boldStr(value.dividend_yield)} (últ. 12 meses)\n`;
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

const getMsgFiis = (msg) => {
  const [, ...fiis] = msg
    .replaceAll(/(\,\s+|\,|\s+\,\s+|\s+)/g, ' ')
    .split(' ');
  return fiis.join(',');
};

const getFiisData = async (client, from, message) => {
  try {
    const fiis = getMsgFiis(message);

    logger.info(`Retrieving FIIs: ${fiis.replaceAll(',', ' ')}`);

    client.sendMessage(
      from,
      'Scraping https://fundsexplorer.com.br/funds/:fii/ to get the data, it will take a while...'
    );

    await axios.get(`${API_URL}/fiis?fiis=${fiis}`);

    const msg = await buildEventsMsg();
    msg.forEach((msg) => client.sendMessage(from, msg));

    client.sendMessage(
      from,
      'For more info about FIIs, you can access https://fundsexplorer.com.br/'
    );
  } catch (e) {
    logger.error(`Some error occurred: ${e}`);
    client.sendMessage(from, `Some error occurred: ${e}`);
  }
};

module.exports = getFiisData;
