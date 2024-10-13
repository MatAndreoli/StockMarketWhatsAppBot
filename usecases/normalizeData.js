const shortenUrl = require('../clients/shortenUrl');

const normalizeData = async (data) => {
  const normalizedData = data.map(async (value) => {
    const reportsLink = await shortenUrl(value.reports_link);
    value.reports_link = reportsLink;
    if (!!value.last_management_report?.link) {
      const lastManagementReportLink = await shortenUrl(
        value.last_management_report.link
      );
      value.last_management_report.link = lastManagementReportLink;
    }
    return value;
  });
  return await Promise.all(normalizedData);
};

module.exports = normalizeData;
