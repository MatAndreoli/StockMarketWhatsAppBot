const axios = require('axios');
const logger = require('../logger/loggerWinston');
const { azureFunctionUrl } = require('../settings.js');
const { getMessageData, modifyStr } = require('./getMessageData');
const normalizeData = require('./normalizeData');

const buildEventsMsg = (data, showDividends) => {
  let msg = [];

  data.forEach((value) => {
    const options = { bold: true };
    const lastYearLbl = 'últ. 12 meses';
    const statusEmoji = value.status.includes('-') ? '🔴' : '🟢';
    const statusLabel = value.status.includes('-') ? 'baixa' : 'alta';

    const b = (str) => modifyStr(str, options);

    const lines = [
      `🏢 *${value.code}* — _${value.name || ''}_`,
      `📋 Setor: ${b(value.operation_sector)}`,
      ``,
      `━━━ 💰 *Preço & Mercado* ━━━`,
      `💵 Preço atual: ${b(value.current_price)}`,
      `${statusEmoji} Status: ${b(value.status)} _(${statusLabel} ${lastYearLbl})_`,
      `📊 Liquidez Média Diária: ${b(value.average_daily)}`,
      ``,
      `━━━ ⚖️ *Valuation e Retorno* ━━━`,
      `📈 P/L: ${b(value.p_l)}`,
      `⚖️ P/VP: ${b(value.p_vp)}`,
      `🌟 ROE: ${b(value.roe)}`,
      `📉 DY (12m): ${b(value.dividend_yield)}`,
      `📈 CAGR _(lucros 5 anos)_: ${b(value.cagr)}`,
      ``,
      `━━━ 🏦 *Balanço* ━━━`,
      `💼 Patrimônio Líquido: ${b(value.net_worth)}`,
      `💳 Dívida/EBITDA: ${b(value.net_debt_ebitda)}`,
      `🎫 Total de papéis: ${b(value.total_stock_paper)}`,
    ];

    if (value.last_management_report?.link) {
      lines.push(``);
      lines.push(`━━━ 📄 *Último Relatório* ━━━`);
      lines.push(`📎 ${value.last_management_report.date ? `_(${value.last_management_report.date})_ ` : ''}${value.last_management_report.link}`);
    }

    if (showDividends && value.dividends_history) {
      lines.push(``);
      lines.push(`━━━ 💸 *Histórico de Dividendos* ━━━`);
      lines.push(`*Tipo* | *Data Com* | *Pagamento* | *Valor*`);
      
      value.dividends_history.forEach((div) => {
        lines.push(`${b(div.type)} | ${b(div.data_com)} | ${b(div.pay_day)} | ${b(div.value)}`);
      });
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
      `${azureFunctionUrl}/api/stocks?stocks=${stocks}`
    );

    const stocksData = await normalizeData(result.data);

    const msg = buildEventsMsg(stocksData, showDividends);
    msg.forEach((msg) => client.sendMessage(from, msg));
    logger.info('Stocks data processed successfully.');
  } catch (e) {
    logger.error(`Some error occurred: ${e}`);
    await client.sendMessage(from, `Some error occurred: ${e}`);
  }
};

module.exports = getStocksData;
