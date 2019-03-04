const LoggerModule = require('./loggerModule');
const path = require('path');
var logger = new LoggerModule();

console.log('__dirname: ', __dirname);
console.log('__filename: ', __filename);

logger.on('logMsg', (args) => {
    console.log('Msg Logged:', path.parse(args.url))
});

logger.log('Calling LoggerModule')