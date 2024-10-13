const getFiis = require('../clients/fiisApiClient');
const normalizeData = require('./normalizeData');
const logger = require('../logger/loggerWinston');

const separateFiisWithReports = (fiis) => {
    const fiisWithoutReport = fiis
        .filter(fii => {
            const report = fii.last_management_report;

            return !report || !report.link;
        })
        .map((fii) => fii.code)
        .join(',');

    const fiisWithReport = fiis
        .filter(fii => !fiisWithoutReport.includes(fii.code));

    return [fiisWithReport, fiisWithoutReport];
};

const getNormalizedFiisData = async (fiis) => {
    const response = await getFiis(fiis);
    logger.info('Fiis data gotten successfully');

    const [fiisWithReport, fiisWithoutReport] = separateFiisWithReports(response);

    const normalizedData = await normalizeData(fiisWithReport);

    logger.info('Fiis data normalized successfully');

    return [normalizedData, fiisWithoutReport];
};

module.exports = getNormalizedFiisData;
