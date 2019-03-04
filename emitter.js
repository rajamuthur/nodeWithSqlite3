var EventEmitter = require('events');
var emitter = new EventEmitter();

emitter.on('firstEvent', () => {
    console.log('Event fired');
});

emitter.emit('firstEvent');

// var fireOnEvent = () => {
//     console.log('Event fired');
// }