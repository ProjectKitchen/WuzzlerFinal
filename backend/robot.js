var Cylon = require('cylon');
const io = require('socket.io-client');
var keypress = require('keypress');
const settings = require('./config/config').settings;
const socket = io('ws://localhost:4444');
var exec = require('child_process').exec;
let arduinoMega;

var redPressed=false;
var bluePressed=false;

process.stdin.setRawMode(true);
process.stdin.resume();

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
	else {                                        // switch emulation via keyboard
       if (data=='red') return(!redPressed);         
       else if (data=='blue') return(!bluePressed); 
	}

   }
   
}); 


// use keypress events to emulate the microcontroller connection (for test purposes)

keypress(process.stdin);

process.stdin.on('keypress', function (ch, key) {
  console.log('got "keypress"', key);
  if (key.name == 'y') {
    console.log('goal red');
    socket.emit('goal', 'red');
  }
  if (key.name == 'x') {
    console.log('goal blue');
    socket.emit('goal', 'blue');
  }
  if (key.name == 'a') {
    console.log('button red released');
	redPressed=false;
    socket.emit('buttonReleased', 'red');
  }
  if (key.name == 's') {
    console.log('button blue released');
	bluePressed=false;
    socket.emit('buttonReleased', 'blue');
  }
  if (key.name == 'q') {
    console.log('button red pressed');
	redPressed=true;
    socket.emit('buttonPressed', 'red');
  }
  if (key.name == 'w') {
    console.log('button blue pressed');
	bluePressed=true;
    socket.emit('buttonPressed', 'blue');
  }

  if (key.ctrl && key.name == 'c') {
    process.stdin.pause();
    console.log('received Ctrl+C! Please press again to terminate backend!');
    process.stdin.setRawMode(false);
    process.stdin.resume();

  }

});
 

setTimeout(function () {
  if (!arduinoMega) { 
      console.log ("Arduino connection not established - please use keyboard (q,a,y/w,s,x) to emulate game actions!");
      socket.emit('buttonReleased', 'red'); 
      socket.emit('buttonReleased', 'blue');
  } else {console.log ("Arduino connection established");}
}, 5000);
 
module.exports =  robot;

