var Cylon = require('cylon');
const io = require('socket.io-client');
const toolconfig = require('./config/config');
const socket = io('ws://localhost:4444');
let revokeTime = 0;
let revokePlayer = 'none';

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
      console.log("Button1 pushed");
      if (revokeTime>0) {
      }
      socket.emit('buttonClick', 'red');
    });

    my.button2.on('release', function(){
      console.log("Button2 pushed");
      socket.emit('buttonClick', 'blue');

     /*
      if(Date.now()/1000 > lastPressTimeBlue + intervall){
        socket.emit('cancelGame');
      } */
    });
 
    my.goal1.on('release', function () {
      console.log("Goal1 (red)");
      socket.emit('goal', 'red');
    });

    my.goal2.on('release', function () {
      console.log("Goal2 (blue)"); 
      socket.emit('goal', 'blue');
    });

    socket.on('startRevokePhase', data => {
      revokeTime=toolconfig.revokeblock;
      revokePlayer=data;
      console.log("start revoke phase for " + data);
      var inter = setInterval(function(data) {
        if (data=='red') {
           my.led1.toggle();
        } else {my.led2.toggle();}
        
        revokeTime--;
        if (revokeTime==0) {
          clearInterval(this);
          console.log("revoke time passed, goal "+ data + " is accepted.");
          socket.emit('goalAccept', data);
          my.led1.turnOff();
          my.led2.turnOff();
        }
        if (revokeTime<0) {
          clearInterval(this);
          console.log("revoke timer stopped, goal not accepted!");
          my.led1.turnOff();
          my.led2.turnOff();
          revokeTime=0;
        }
      }, 500, data);
    });
    
   }
  
}); 


function getRevokeTime() {
  return revokeTime;
}

function doRevoke(data) {
  if (revokePlayer == data) {
    revokeTime=-1;
    console.log ("revoke Button was pressed.. now stop the timer!");
  }
}


module.exports = {
  robot,
  getRevokeTime,
  doRevoke
}

