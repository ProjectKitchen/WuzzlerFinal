var Cylon = require('cylon');
const io = require('socket.io-client');
const settings = require('./config/config').settings;
const socket = io('ws://localhost:4444');
let revokeTime = 0;
let revokePlayer = 'none';
let arduinoMega;

var robot = Cylon.robot({

  connections: {
    arduino: { adaptor: 'firmata', port: '/dev/ttyACM0' }
    //loopback: { adaptor: 'loopback' }
  },

  devices: {
    led: { driver: 'led', pin: 13 },
    goalRed: { driver: 'button', pin: 12 },
    goalBlue: { driver: 'button', pin: 10 },
    ledRed: { driver: 'led', pin: 8 },
    ledBlue: { driver: 'led', pin: 9 },
    buttonRed: { driver: 'button', pin: 6 },
    buttonBlue: { driver: 'button', pin: 7 }
  },


  work: function(hwConnection) {
    let lastPressTimeRed = 1;
    let lastPressTimeBlue = 1;
    const intervall = 5;
    
  /*  every((0.5).second(), function() {
      const goal = ['red', 'blue'];
      const color = goal[Math.floor(Math.random() * Math.floor(2))];
      socket.emit('goal',color);
    });*/

    arduinoMega=hwConnection;
    
    arduinoMega.ledRed.turnOn();
    arduinoMega.ledBlue.turnOn();
       
    arduinoMega.buttonRed.on('press', function(){
      lastPressTimeRed = Math.floor(Date.now()/1000);
    });

    arduinoMega.buttonBlue.on('press', function(){
      lastPressTimeBlue = Math.floor(Date.now()/1000);
    });

    arduinoMega.buttonRed.on('release', function(){
      console.log("buttonRed pushed");
      if (revokeTime>0) {
      }
      socket.emit('buttonClick', 'red');
    });

    arduinoMega.buttonBlue.on('release', function(){
      console.log("buttonBlue pushed");
      socket.emit('buttonClick', 'blue');

     /*
      if(Date.now()/1000 > lastPressTimeBlue + intervall){
        socket.emit('cancelLocalGame');
      } */
    });
 
    arduinoMega.goalRed.on('release', function () {
      console.log("Goal red detected");
      socket.emit('goal', 'red');
    });

    arduinoMega.goalBlue.on('release', function () {
      console.log("Goal  blue deteced"); 
      socket.emit('goal', 'blue');
    });    
   },
   
   startRevokePhase: function(data) {
    
      revokeTime=settings.revokeTime;
      revokePlayer=data;
      console.log("start revoke phase for " + data);
      var inter = setInterval(function(data) {
        if (data=='red') {
           arduinoMega.ledRed.toggle();
        } else {arduinoMega.ledBlue.toggle();}
        
        revokeTime--;
        if (revokeTime==0) {
          clearInterval(this);
          console.log("revoke time passed, goal "+ data + " is accepted.");
          socket.emit('goalAccept', data);
          arduinoMega.ledRed.turnOff();
          arduinoMega.ledBlue.turnOff();
        }
        if (revokeTime<0) {
          clearInterval(this);
          console.log(data +" goal canceled!");
          arduinoMega.ledRed.turnOff();
          arduinoMega.ledBlue.turnOff();
          revokeTime=0;
        }
      }, 500, data);
    
   },
   
   getRevokeTime: function() {
    return revokeTime;
   },
   
   getRevokePlayer: function() {
    return revokePlayer;
   },

   doRevoke: function(data) {
    if (revokePlayer == data) {
      revokeTime=-1;
      console.log ("revoke pressed -> cancel "+ data + " goal !");
    }
   },
   
   ledOn: function (data) {
     if (arduinoMega) { 
       if (data=='red') arduinoMega.ledRed.turnOn(); 
       else if (data=='blue') arduinoMega.ledBlue.turnOn();
    }
   },

   ledOff: function (data) {
     if (arduinoMega) { 
       if (data=='red') arduinoMega.ledRed.turnOff(); 
       else if (data=='blue') arduinoMega.ledBlue.turnOff();
     }
   }
}); 


module.exports =  robot;

