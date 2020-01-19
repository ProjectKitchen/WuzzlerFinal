var Cylon = require('cylon');
const io = require('socket.io-client');
const socket = io('ws://localhost:4444');

var robot = Cylon.robot({

  connections: {
    //arduino: { adaptor: 'firmata', port: '/dev/ttyACM0' }
    loopback: { adaptor: 'loopback' }
  },

  devices: {
   /* led: { driver: 'led', pin: 13 },
    goal1: { driver: 'button', pin: 12 },
    goal2: { driver: 'button', pin: 10 },
    led1: { driver: 'led', pin: 8 },
    led2: { driver: 'led', pin: 9 },
    button1: { driver: 'button', pin: 6 },
    button2: { driver: 'button', pin: 7 }*/
  },

  work: function() {
    every((3).second(), function() {
      const goal = ['red', 'blue'];
      const color = goal[Math.floor(Math.random() * Math.floor(2))];
      socket.emit('goal',color);
    });
  }

});

module.exports = robot;