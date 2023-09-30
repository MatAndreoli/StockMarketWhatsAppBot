const { createLogger, transports } = require('winston');

const loggerWinston = createLogger({
  transports: [new transports.Console()],
});

loggerWinston.on('error', (info) => {
  loggerWinston.log(info);
});

module.exports = loggerWinston;
