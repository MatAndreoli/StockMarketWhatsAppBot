const getMessageData = (msg) => {
  const [, ...fiis] = msg
    .replaceAll(/(\,\s+|\,|\s+\,\s+|\s+)/g, ' ')
    .split(' ');
  return fiis.join(',');
};

const boldStr = (str) => (str ? str.replace(/^/, '*').replace(/$/, '*') : '');

module.exports = { getMessageData, boldStr };
