const EventEmitter = require('events');

class LoggerModule extends EventEmitter {    

    log(msg) {
        console.log('log Msg: ' + msg);
        this.emit('logMsg', {'id' : 1, 'name': 'raja', 'url': 'http://google.com/raja'});
    }
}

module.exports = LoggerModule;