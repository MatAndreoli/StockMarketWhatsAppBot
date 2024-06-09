const getMessageData = (msg) => {
  const [, ...fiis] = msg
    .replaceAll(/(\,\s+|\,|\s+\,\s+|\s+)/g, ' ')
    .split(' ');
  return fiis.join(',');
};

const boldStr = (str) => str.replace(/^/, '*').replace(/$/, '*');

const modifyStr = (str, options = {}) => {
  if (!!!str) return '';

  var modifiedStr;
  if (options) {
    const { bold = false, span = undefined } = options;
    if (bold) {
      modifiedStr = boldStr(str);
    }
    if (span) {
      const { position, value } = span;
      const modifiedValue = `\`(${value})\``;
      modifiedStr =
        position == 'end'
          ? `${modifiedStr} ${modifiedValue}`
          : `${modifiedValue} ${modifiedStr}`;
    }
  }
  return modifiedStr;
};

module.exports = { getMessageData, modifyStr };
