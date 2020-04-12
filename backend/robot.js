var Cylon = require('cylon');
const io = require('socket.io-client');
const settings = require('./config/config').settings;
const socket = io('ws://localhost:4444');
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
    
  /*  every((0.5).second(), function() {
      const goal = ['red', 'blue'];
      const color = goal[Math.floor(Math.random() * Math.floor(2))];
      socket.emit('goal',color);
    });*/

    arduinoMega=hwConnection;
    
    arduinoMega.ledRed.turnOn();
    arduinoMega.ledBlue.turnOn();
       
    arduinoMega.buttonRed.on('release', function(){ // button pressed (pullup) 
      console.log("buttonRed pressed");
      socket.emit('buttonPressed', 'red');
    });

    arduinoMega.buttonBlue.on('release', function(){ // button pressed (pullup)
      console.log("buttonBlue pressed");
      socket.emit('buttonPressed', 'blue');
    });

    arduinoMega.buttonRed.on('push', function(){   // button released (pullup) 
      console.log("buttonRed released");
      socket.emit('buttonReleased', 'red');
    });

    arduinoMega.buttonBlue.on('push', function(){    // button released (pullup)
      console.log("buttonBlue released");
      socket.emit('buttonReleased', 'blue');
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
   },
   
   ledsOn: function () {
     if (arduinoMega) { 
       arduinoMega.ledRed.turnOn(); 
       arduinoMega.ledBlue.turnOn();
    }
   },

   ledsOff: function () {
     if (arduinoMega) { 
       arduinoMega.ledRed.turnOff(); 
       arduinoMega.ledBlue.turnOff();
    }
   },

   ledToggle: function (data) {
     if (arduinoMega) { 
       if (data=='red') arduinoMega.ledRed.toggle(); 
       else if (data=='blue') arduinoMega.ledBlue.toggle();
    }
   },

   ledsToggle: function (data) {
     if (arduinoMega) { 
       arduinoMega.ledRed.toggle(); 
       arduinoMega.ledBlue.toggle();
    }
   },

   isButtonReleased: function (data) {
     if (arduinoMega) { 
       if (data=='red') return(arduinoMega.buttonRed.isPressed());    // pullup
       else if (data=='blue') return(arduinoMega.buttonBlue.isPressed());  // pullup
    }
   }
   
}); 
 
module.exports =  robot;

