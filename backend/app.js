const db=require('./db').init();
const gameM = require('./game').init();
const challengeM = require('./challenge').init();
const sound = require('./sound');
const robot = require('./robot');
const gameStates = require('./config/config').gameStates;
const settings = require('./config/config').settings;
const gameInfo = require('./config/config').gameInfo;

const cors = require('cors');
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const app = express();
app.use(cors());

const server = http.createServer(app);
const io = socketIO(server);
io.origins('*:*');

let lastRevokeTime = 1;
let revokeTime = 0;
let revokePlayer = 'none';
let ignoreRedButton=1;
let ignoreBlueButton=1; 
let lastPressTimeRed = 0;
let lastPressTimeBlue = 0;
let playTime=0;

function socketEcho(eventName, data, type) {
  let txt = (type === 'IN') ? '" received with the following data:' : '" emitted with the following data:';
  console.log('>-----------------------------------------------');
  console.log('Event of Type "' + eventName + txt);
  console.log(data);
  console.log('-----------------------------------------------<');
  console.log('                     +++                        ');
}
 
let surveyID = 0;
let connectionID = 0;
let activeUsers = {};

io.on('connection', socket => {
  connectionID += 1;
  socketEcho('connection', connectionID, 'IN');

  socketEcho('survey', surveyID, 'OUT');
  io.sockets.emit('survey', surveyID);

  socketEcho('challengeUpdate', challengeM.getData(), 'OUT');
  io.sockets.emit('challengeUpdate', challengeM.getData());

  socketEcho('gameUpdate', gameM.getGame(), 'OUT');
  io.sockets.emit('gameUpdate', gameM.getGame());

  if(surveyID === 0){
    setInterval(() => {
      console.log ("---> survey " + surveyID); 
      let send = false;
      let currentUsers = Object.keys(activeUsers);
      currentUsers.forEach(name => {
        if(activeUsers[name] <= surveyID-1){
          console.log ("!!! DELETING USER: " + name +" ID= " + activeUsers[name] +" Survey=" + surveyID-1);
          delete activeUsers[name];
          challengeM.rejectChallenge(name);
          challengeM.cancelChallenge(name);
          let res = challengeM.removeGameByPlayer(name);
          send = true;
          console.log(res);
          if(res.firstslot && res.ngames === 0) {
            gameM.resetGame();
          }
          if(res.firstslot && res.ngames > 0) {
            gameM.setGame(res.nextgame.red, res.nextgame.blue);
          }
        }
      })
      if(send) {
        socketEcho('allUsers', Object.keys(activeUsers), 'OUT');
        io.sockets.emit('allUsers', Object.keys(activeUsers));
    
        socketEcho('challengeUpdate', challengeM.getData(), 'OUT');
        io.sockets.emit('challengeUpdate', challengeM.getData());

        socketEcho('gameUpdate', gameM.getGame(), 'OUT');
        io.sockets.emit('gameUpdate', gameM.getGame());
      }
      if (gameM.getGame().status == gameStates.playing) {
         if (playTime % 3 == 0) {
           console.log("time for some arena ambience!");
           sound.playSound(settings.backgroundSoundPrefix,settings.backgroundSoundCount);
         }
         playTime+=1;
      }
    }, 10000);
    surveyID += 1;
  } 

  socket.on('disconnect', (a) => {
    console.log ("!!! DISCONNECTION detected, Survey=" + surveyID);
    // ignore the disconnection event, because this is sent when smartphones go into standby !!  (-> prevent user logout!)
      // socketEcho('disconnect', null, 'IN');
      // socketEcho('survey', surveyID, 'OUT');
      // surveyID += 1;
      // io.sockets.emit('survey', surveyID);
  })

  socket.on('surveyResponse', data => {
    socketEcho('surveyResponse', data, 'IN');
    if(data.user !== null) {
      if(activeUsers[data.user]) {
        console.log ("!!! Updating SurveyID " + data.surveyID + " for user "+ data.user);
        activeUsers[data.user] = data.surveyID;
      } else {
        console.log ("!!! User data not found, logout " + data.user);
        socketEcho('serverLogout', data.user, 'OUT');
        io.sockets.emit('serverLogout', data.user);
      }
    }
    console.log(activeUsers);
  })

  socket.on('login', loginData => {
    socketEcho('login', loginData, 'IN');
    const { username, password } = loginData;

    db.login(username, password, (res)=>{
      socketEcho('loginResponse', res, 'OUT');
      socket.emit('loginResponse', res);

      if(res.message == 'login ok') {
        activeUsers[res.data.name] = surveyID;
        socketEcho('allUsers', Object.keys(activeUsers), 'OUT');
        io.sockets.emit('allUsers', Object.keys(activeUsers));
      }
    })
  });

  socket.on('register', registerData => {
    socketEcho('register', registerData, 'IN');
    const { username, password } = registerData;
    db.register(username, password, (res) => {
      socketEcho('registerResponse', res, 'OUT');
      socket.emit('registerResponse', res);
    })
  })

  socket.on('logout', username => {
    socketEcho('logout', username, 'IN');
    delete activeUsers[username];
    surveyID += 1;
    socketEcho('survey', surveyID, 'OUT');
    io.sockets.emit('survey', surveyID);
    socketEcho('allUsers', Object.keys(activeUsers), 'OUT');
    socket.broadcast.emit('allUsers', Object.keys(activeUsers));
  })

  socket.on('addChallenge', data => {
    socketEcho('addChallenge', data, 'IN');
    challengeM.addChallenge(data);
    socketEcho('challengeUpdate', challengeM.getData(), 'OUT');
    io.sockets.emit('challengeUpdate', challengeM.getData());
  })

  socket.on('cancelChallenge', data => {
    socketEcho('cancelChallenge', data, 'IN');
    challengeM.cancelChallenge(data);
    socketEcho('challengeUpdate', challengeM.getData(), 'OUT');
    io.sockets.emit('challengeUpdate', challengeM.getData());
  })

  socket.on('acceptChallenge', data => {
    socketEcho('acceptChallenge', data, 'IN');
    let ngames = challengeM.acceptChallenge(data);
    if(ngames === 1 && gameM.getGame().status === gameStates.nogame) {
      gameM.setGame(data.challenger, data.challenged);
    }

    socketEcho('challengeUpdate', challengeM.getData(), 'OUT');
    io.sockets.emit('challengeUpdate', challengeM.getData());

    socketEcho('gameUpdate', gameM.getGame(), 'OUT');
    io.sockets.emit('gameUpdate', gameM.getGame());
  })

  socket.on('rejectChallenge', data => {
    socketEcho('rejectChallenge', data, 'IN');
    challengeM.rejectChallenge(data);
    socketEcho('challengeUpdate', challengeM.getData(), 'OUT');
    io.sockets.emit('challengeUpdate', challengeM.getData());
  })

  socket.on('buttonReleased', data => {
    if (data == 'red') {
      if (ignoreRedButton==1) { ignoreRedButton=0; return;}
      lastPressTimeRed =0;
      if (gameM.getGame().status != gameStates.abort) {
        buttonClick(data);
      }
    } else {
      if (ignoreBlueButton==1) { ignoreBlueButton=0; return;}
      lastPressTimeBlue =0;
      if (gameM.getGame().status != gameStates.abort) {
        buttonClick(data);
      }
    }      
  })
  
  socket.on('buttonPressed', data => {
    if (data == 'red') {
      lastPressTimeRed = Math.floor(Date.now()/1000);
      if (lastPressTimeBlue > 0 && gameM.getGame().status == gameStates.playing) {
         startAbortGameInterval();
      } 
    } else {
      lastPressTimeBlue = Math.floor(Date.now()/1000);
      if (lastPressTimeRed > 0 && gameM.getGame().status == gameStates.playing) {
         startAbortGameInterval();
      }
    }      
  })

  socket.on('goal', data => {
    console.log ("should we revoke? ");
    if (gameM.getGame().status == gameStates.playing && revokeTime==0) {
      sound.playSound(settings.goalSoundPrefix,settings.goalSoundCount);
      startRevokePhase(data);      
      gameM.revokePhase();
      socketEcho('gameUpdate', gameM.getGame(), 'OUT');
      io.sockets.emit('gameUpdate', gameM.getGame());
  
    } else { 
      console.log ("no game running!");
    }
  });
 
  socket.on('cancelGame', data => {
    socketEcho('cancelGame', data, 'IN');
    let ngames = challengeM.removeGameByPlayers(data);
    if (gameM.getGame().status === gameStates.nogame || gameM.getGame().status === gameStates.waiting) {
      if(ngames === 0) {
        gameM.resetGame();
      } else {
        gameM.setGame(challengeM.getData().upcomingGames[0].red, challengeM.getData().upcomingGames[0].blue);
      }
      robot.ledsOn();
    }
    socketEcho('challengeUpdate', challengeM.getData(), 'OUT');
    io.sockets.emit('challengeUpdate', challengeM.getData());
    socketEcho('gameUpdate', gameM.getGame(), 'OUT');
    io.sockets.emit('gameUpdate', gameM.getGame());
  })

  socket.on('top10', res => {
    socketEcho('top10', res, 'IN');
    db.getTop10('all', res => {
      if(res.message === 'OK') {
        socketEcho('top10update', res.data, 'OUT');
        socket.emit('top10update', res.data);
      }
    })
  });
});


function buttonClick (data)  {
    if(gameM.getGame().status === gameStates.revoke  && revokePlayer==data) {
        console.log("Revoke false goal for "+ data);
        revokeTime=-1;
        console.log ("revoke pressed -> cancel "+ data + " goal !");
        gameM.playPhase();
        socketEcho('gameUpdate', gameM.getGame(), 'OUT');
        io.sockets.emit('gameUpdate', gameM.getGame());
    }
     
    if(!gameM.getGame()[`${data}_ready`]) {
      socketEcho('playerReady', data, 'IN');
      robot.ledOff(data);
      gameM.playerReady(data);
      socketEcho('gameUpdate', gameM.getGame(), 'OUT');
      io.sockets.emit('gameUpdate', gameM.getGame());
      if (gameM.getGame().status == gameStates.playing) {
        challengeM.removeGame();
        io.sockets.emit('challengeUpdate', challengeM.getData());
      }
    }
  }


function abortGame () {
    sound.playSound(settings.endGameWhistleSound);
    if(gameM.getGame().red_name === 'red' && gameM.getGame().blue_name === 'blue') {
      console.log ("-> aborting local game! ");
    } else {
      console.log ("-> aborting ongoing challenge ");
      challengeM.removeGame();
    }

    let remainingGames = challengeM.getData().upcomingGames.length;
    if(remainingGames === 0) {
       gameM.resetGame();
    } else {
      gameM.setGame(challengeM.getData().upcomingGames[0].red, challengeM.getData().upcomingGames[0].blue);
    }
    // socketEcho('gameUpdate', gameM.getGame(), 'OUT');
    io.sockets.emit('gameUpdate', gameM.getGame());
    // socketEcho('challengeUpdate', challengeM.getData(), 'OUT');
    io.sockets.emit('challengeUpdate', challengeM.getData());
    // if(remainingGames === 0) io.sockets.emit('switchToTop10', null);
    robot.ledsOn();
}

function startRevokePhase (data) {    
    revokeTime=settings.revokeBlinkPeriods;
    revokePlayer=data;
    console.log("start revoke phase for " + data);
    var inter = setInterval(function(data) {
      robot.ledToggle(data);
      revokeTime--;
      if (revokeTime==0) {
        clearInterval(this);
        console.log("revoke time passed, goal "+ data + " is accepted.");
        goalAccept(data);
        robot.ledsOff();
      }
      if (revokeTime<0) {
        clearInterval(this);
        console.log(data +" goal canceled!");
        sound.playSound(settings.booSoundPrefix,settings.booSoundCount);
        robot.ledsOff();
        revokeTime=0;
      }
    }, settings.revokeBlinkTime, data);
}

 
function goalAccept (data) {
    console.log ("goal for player "  + data);
    gameM.playPhase();   // to exit revoke mode 
    
    let info = gameM.goal(data);
    if(info.code === gameInfo.gameWon) {
      sound.playSound(settings.winSoundPrefix,settings.winSoundCount);
      //socketEcho('gameUpdate', gameM.getGame(), 'OUT');
      io.sockets.emit('gameUpdate', gameM.getGame());
      
      setTimeout(() => {
        if (info.gameType === gameInfo.onlineGame) {
          let game = gameM.getGame();
          db.addGame(game.red_name, game.blue_name, game.red, game.blue);
          //challengeM.removeGame();

          db.getTop10('all', res => {
            if(res.message === 'OK') {
              socketEcho('top10update', res.data, 'OUT');
              io.sockets.emit('top10update', res.data);
            }
          })
        }

        let remainingGames = challengeM.getData().upcomingGames.length;
        if(remainingGames === 0) {
           gameM.resetGame();
        } else {
          gameM.setGame(challengeM.getData().upcomingGames[0].red, challengeM.getData().upcomingGames[0].blue);
        }
        // socketEcho('gameUpdate', gameM.getGame(), 'OUT');
        io.sockets.emit('gameUpdate', gameM.getGame());
        // socketEcho('challengeUpdate', challengeM.getData(), 'OUT');
        io.sockets.emit('challengeUpdate', challengeM.getData());
        if(remainingGames === 0) {
           // socketEcho('switchToTop10', null, 'OUT');
           io.sockets.emit('switchToTop10', null);
         }
        robot.ledsOn();
      }, settings.endGameDisplayTime);
    }

    if(info.code === gameInfo.gameOngoing && gameM.getGame().status === gameStates.playing) {
      io.sockets.emit('gameUpdate', gameM.getGame());
    }
  }


function startAbortGameInterval () {
    let abortGameTime=settings.abortBlinkPeriods;

    console.log("hold both buttons for 3 seconds to abort game!");
    gameM.abortPhase();
    io.sockets.emit('gameUpdate', gameM.getGame());         

    robot.ledsOff();
    var abortGameInter = setInterval(function(data) {
      robot.ledsToggle();
      abortGameTime--;
      if (abortGameTime==0) {
        clearInterval(this);
        robot.ledsOff();
        console.log(" *** Abort GAME ***");
        abortGame();                
        ignoreBlueButton=1;
        ignoreRedButton=1;
      }
      else {
        if (robot.isButtonReleased('blue')) {
           clearInterval(this);
           gameM.playPhase();
           io.sockets.emit('gameUpdate', gameM.getGame());
           ignoreBlueButton=1;
         }    
        if (robot.isButtonReleased('red')) {
           clearInterval(this);
           gameM.playPhase();
           io.sockets.emit('gameUpdate', gameM.getGame());
           ignoreRedButton=1;
         }    
      }
    }, settings.abortBlinkTime);    
 }
   


console.log('starting robot');
robot.start();
console.log('robot started');


server.listen(4444, function(){
  console.log('listening on *:4444');
});
