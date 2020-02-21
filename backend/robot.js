var Cylon = require('cylon');
const io = require('socket.io-client');
const socket = io('ws://localhost:4444');

var robot = Cylon.robot({

  connections: {
    arduino: { adaptor: 'firmata', port: '/dev/ttyACM0' }
    //loopback: { adaptor: 'loopback' }
  },

  devices: {
   led: { driver: 'led', pin: 13 },
    goal1: { driver: 'button', pin: 12 },
    goal2: { driver: 'button', pin: 10 },
    led1: { driver: 'led', pin: 8 },
    led2: { driver: 'led', pin: 9 },
    button1: { driver: 'button', pin: 6 },
    button2: { driver: 'button', pin: 7 }
  },


  work: function(my) {
    let lastPressTimeRed = 1;
    let lastPressTimeBlue = 1;
    const intervall = 5;
  /*  every((0.5).second(), function() {
      const goal = ['red', 'blue'];
      const color = goal[Math.floor(Math.random() * Math.floor(2))];
      socket.emit('goal',color);
    });*/

       
    my.button1.on('press', function(){
      lastPressTimeRed = Math.floor(Date.now()/1000);
    });

    my.button2.on('press', function(){
      lastPressTimeBlue = Math.floor(Date.now()/1000);
    });

    my.button1.on('release', function(){
      //if(Date.now()/1000 > lastPressTimeRed + intervall){
        /*
        socket.emit('canelDummyGame');
      } else {*/
        socket.emit('buttonClick', 'red');
      //};
    });

    my.button2.on('release', function(){
      /*
      if(Date.now()/1000 > lastPressTimeBlue + intervall){
        socket.emit('canelDummyGame');
      } else {*/
        socket.emit('buttonClick', 'blue');
      //};
    });

    my.goal1.on('push', function () {
      socket.emit('goal', 'red');
    });

    my.goal2.on('push', function () {
      socket.emit('goal', 'blue');
    });


  }

});

module.exports = robot;
