const logger = require('../logger/loggerWinston');
const { getMessageData, modifyStr } = require('./getMessageData');
const getNormalizedFiisData = require('./getNormalizedFiisData');

const MAX_RETRIES = 2;

const buildEventsMsg = (data) => {
  let msg = [];

  data.forEach((value) => {
    const options = { bold: true };
    const statusEmoji = value.status.includes('-') ? '🔴' : '🟢';
    const statusLabel = value.status.includes('-') ? 'baixa' : 'alta';
    const rendDistribution = value.rend_distribution || {};
    const lastManagementReport = value.last_management_report || {};

    const b = (str) => modifyStr(str, options);

    const lines = [
      `🏢 *${value.code}* — _${value.name || ''}_`,
      `📋 Tipo: ${b(value.fii_type)}`,
      ``,
      `━━━ 💰 *Preço & Mercado* ━━━`,
      `💵 Preço atual: ${b(value.current_price)}`,
      `${statusEmoji} Status: ${b(value.status)} _(${statusLabel} últ. 12 meses)_`,
      `📊 Liquidez Média Diária: ${b(value.average_daily)}`,
      ``,
      `━━━ 📈 *Dividendos* ━━━`,
      `💲 Último dividendo: ${b(value.last_dividend)}`,
      `📈 DY (12m): ${b(value.dividend_yield)}`,
      `📈 Último DY: ${b(value.last_dividend_yield)}`,
      ``,
      `━━━ 🏦 *Patrimônio* ━━━`,
      `💼 Patrimônio Líquido: ${b(value.net_worth)}`,
      `⚖️ P/VP: ${b(value.p_vp)}`,
      ``,
      `━━━ 📅 *Última Distribuição* ━━━`,
      `  💲 Dividendo: ${b(rendDistribution.dividend)}`,
      `  📊 Rendimento: ${b(rendDistribution.income_percentage)}`,
      `  📆 Pagamento: ${b(rendDistribution.future_pay_day)}`,
      `  📌 Data com: ${b(rendDistribution.data_com)}`,
    ];

    if (lastManagementReport.link) {
      lines.push(``);
      lines.push(`━━━ 📄 *Relatório Gerencial* ━━━`);
      lines.push(`📎 ${lastManagementReport.date ? `_(${lastManagementReport.date})_ ` : ''}${lastManagementReport.link}`);
    }

    lines.push(``);
    lines.push(`━━━━━━━━━━━━━━━━━━`);
    if (value.reports_link) {
      lines.push(`🔗 Relatórios: ${value.reports_link}`);
    }
    if (value.url) {
      lines.push(`🔗 Mais info: ${value.url}`);
    }

    msg.push(lines.filter(l => l !== undefined).join('\n'));
  });

  return msg;
};

const getFiisData = async (client, from, message, retry = 0) => {
  try {
    if (retry === 0) {
      await client.sendMessage(
        from,
        'Scraping *https://fundsexplorer.com.br/funds/* para pegar os dados, isso pode levar um tempo...'
      );
    }

    if (retry >= MAX_RETRIES) {
      await client.sendMessage(from, `Reached max attempts to get fiis data. Try again: ${message}`);
      return;
    }

    const fiis = getMessageData(message);
    logger.info(`Retrieving FIIs: ${fiis.replaceAll(',', ' ')}`);

    const [fiisResponse, fiisWithoutReport] = await getNormalizedFiisData(fiis);

    const msg = buildEventsMsg(fiisResponse);
    for (const m of msg) {
      client.sendMessage(from, m);
    }

    if (fiisWithoutReport && fiisWithoutReport.length > 0) {
      logger.info(`Trying again to get data for fiis: ${fiisWithoutReport.replaceAll(',', ' ')}. Attempt: ${retry + 1}`);
      await new Promise(r => setTimeout(r, 3000));
      await getFiisData(client, from, `!fiis ${fiisWithoutReport}`, retry + 1);
    } else {
      logger.info('Fiis data processed successfully.');
    }
  } catch (e) {
    logger.error(`Some error occurred: ${e}`);
    await client.sendMessage(from, `Some error occurred: ${e}`);
  }
};

module.exports = getFiisData;
