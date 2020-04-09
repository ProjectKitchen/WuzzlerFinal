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
    let lastPressTimeRed = 0;
    let lastPressTimeBlue = 0;
    let timeToCancelGame = 0;
    let firstRedPush=1;
    let firstBluePush=1;
    const intervall = 5;
    
  /*  every((0.5).second(), function() {
      const goal = ['red', 'blue'];
      const color = goal[Math.floor(Math.random() * Math.floor(2))];
      socket.emit('goal',color);
    });*/

    arduinoMega=hwConnection;
    
    arduinoMega.ledRed.turnOn();
    arduinoMega.ledBlue.turnOn();
       
    arduinoMega.buttonRed.on('release', function(){
      lastPressTimeRed = Math.floor(Date.now()/1000);
      if (lastPressTimeBlue > 0) {
         console.log("hold both buttons for 3 seconds to cancel game!");
         timeToCancelGame=lastPressTimeRed+3;
      } 
      else timeToCancelGame=0;
    });

    arduinoMega.buttonBlue.on('release', function(){
      lastPressTimeBlue = Math.floor(Date.now()/1000);
      if (lastPressTimeRed > 0) {
         console.log("hold both buttons for 3 seconds to cancel game! ");
         timeToCancelGame=lastPressTimeBlue+3;
      }
      else timeToCancelGame=0;
    });

    arduinoMega.buttonRed.on('push', function(){
      if (firstRedPush==1) { firstRedPush=0; return;}
      lastPressTimeRed =0;
      if ((timeToCancelGame>0) && (Math.floor(Date.now()/1000) >= timeToCancelGame)) {
         timeToCancelGame=0;
         firstBluePush=1;
         console.log(" *** CANCEL GAME ***");
         // socket.emit('cancelLocalGame');         
      }
      else {
        console.log("buttonRed pushed");
        socket.emit('buttonClick', 'red');
      }
    });

    arduinoMega.buttonBlue.on('push', function(){
      if (firstBluePush==1) { firstBluePush=0; return;}
      lastPressTimeBlue =0;
      if ((timeToCancelGame>0) && (Math.floor(Date.now()/1000) >= timeToCancelGame)) {
         timeToCancelGame=0;
         firstRedPush=1;
         console.log(" *** CANCEL GAME ***");
         // socket.emit('cancelLocalGame');         
      }
      else {
        console.log("buttonBlue pushed");
        socket.emit('buttonClick', 'blue');
      }
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

