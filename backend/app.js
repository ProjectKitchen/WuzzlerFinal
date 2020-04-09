const db=require('./db').init();
const gameM = require('./game').init();
const challengeM = require('./challenge').init();
const robot = require('./robot');
const gameStates = require('./config/config').gameStates;
const settings = require('./config/config').settings;
const gameInfo = require('./config/config').gameInfo;
var exec = require('child_process').exec;

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
let actsound

function puts(error, stdout, stderr) { console.log(stdout) }

function playSound(name,random_options){
    selection = Math.round(Math.random()*random_options);
    if (selection==0) selection=1;
    soundfile_name="./wav/"+name+String(selection)+".wav";
    console.log ("play sound " + soundfile_name);
    if (actsound) {
      console.log ("stop act sound");
      actsound.kill();
    }
    actsound=exec("omxplayer "+soundfile_name, puts);
}

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

  socket.on('cancelLocalGame', () => {
    socketEcho('cancelLocalGame', 'NA', 'IN');
    if(gameM.getGame().red_name === 'red' && gameM.getGame().blue_name === 'blue') {
      gameM.resetGame();
      robot.ledOn('red');
      robot.ledOn('blue');
    }
    socketEcho('gameUpdate', gameM.getGame(), 'OUT');
    io.sockets.emit('gameUpdate', gameM.getGame());
  })

  socket.on('goal', data => {
    console.log ("should we revoke? ");
    if (gameM.getGame().status == gameStates.playing && robot.getRevokeTime() ==0) {
      playSound(settings.goalSoundPrefix,settings.goalSoundCount);
      robot.startRevokePhase(data);      
      gameM.revokePhase(data);
      socketEcho('gameUpdate', gameM.getGame(), 'OUT');
      io.sockets.emit('gameUpdate', gameM.getGame());
  
    } else { 
      console.log ("no game running!");
    }
  });
  
  socket.on('goalAccept', data => {
    console.log ("goal for player "  + data);
    gameM.revokeDone(data);
    //socketEcho('goal', data, 'IN');
    //console.log(gameM.getGame());
    //console.log(info);
    
    let info = gameM.goal(data);
    if(info.code === gameInfo.gameWon) {
      //socketEcho('gameUpdate', gameM.getGame(), 'OUT');
      playSound(settings.winSoundPrefix,settings.winSoundCount);
      io.sockets.emit('gameUpdate', gameM.getGame());

      if (info.gameType === gameInfo.localGame){
        setTimeout(() => {
          let ngames = challengeM.getData().upcomingGames.length;
          if(ngames === 0) {
             gameM.resetGame();
          } else {
            gameM.setGame(challengeM.getData().upcomingGames[0].red, challengeM.getData().upcomingGames[0].blue);
          }
         // socketEcho('gameUpdate', gameM.getGame(), 'OUT');
         // socketEcho('challengeUpdate', challengeM.getData(), 'OUT');
          io.sockets.emit('gameUpdate', gameM.getGame());
          io.sockets.emit('challengeUpdate', challengeM.getData());
          if(ngames === 0) io.sockets.emit('switchToTop10', null);
          robot.ledOn('red');
          robot.ledOn('blue');
        }, 7000);
      }
      else {    // online game
        let game = gameM.getGame();
        db.addGame(game.red_name, game.blue_name, game.red, game.blue);

        setTimeout(() => {
          let ngames = challengeM.removeGame();
          if(ngames > 0){
            gameM.setGame(challengeM.getData().upcomingGames[0].red, challengeM.getData().upcomingGames[0].blue);
          } else {
            gameM.resetGame();
          }
          db.getTop10('all', res => {
            if(res.message === 'OK') {
              socketEcho('top10update', res.data, 'OUT');
              io.sockets.emit('top10update', res.data);
            }
          })
          // socketEcho('gameUpdate', gameM.getGame(), 'OUT');
          // socketEcho('challengeUpdate', challengeM.getData(), 'OUT');
          io.sockets.emit('gameUpdate', gameM.getGame());
          io.sockets.emit('challengeUpdate', challengeM.getData());
          if(ngames === 0) io.sockets.emit('switchToTop10', null);
          robot.ledOn('red');
          robot.ledOn('blue');
        }, 7000);
      }
    }

    if(info.code === gameInfo.gameOngoing && gameM.getGame().status === gameStates.playing) {
      io.sockets.emit('gameUpdate', gameM.getGame());
    }
  })

  socket.on('buttonClick', data => {
    if(gameM.getGame().status === gameStates.revoke  && robot.getRevokePlayer()==data) {
        console.log("Revoke false goal for "+ data);
        robot.doRevoke(data);
        gameM.revokeDone(data);
        socketEcho('gameUpdate', gameM.getGame(), 'OUT');
        io.sockets.emit('gameUpdate', gameM.getGame());
    }
     
    if(!gameM.getGame()[`${data}_ready`]) {
      socketEcho('playerReady', data, 'IN');
      robot.ledOff(data);
      gameM.playerReady(data);
      socketEcho('gameUpdate', gameM.getGame(), 'OUT');
      io.sockets.emit('gameUpdate', gameM.getGame());
    }
  }) 

  socket.on('cancelGame', data => {
    socketEcho('cancelGame', data, 'IN');
    let ngames = challengeM.removeGameByPlayers(data);
    if (gameM.getGame().status === gameStates.nogame || gameM.getGame().status === gameStates.waiting) {
      if(ngames === 0) {
        gameM.resetGame();
      } else {
        gameM.setGame(challengeM.getData().upcomingGames[0].red, challengeM.getData().upcomingGames[0].blue);
      }
      robot.ledOn('red');
      robot.ledOn('blue');
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

console.log('starting robot');
robot.start();
console.log('robot started');


server.listen(4444, function(){
  console.log('listening on *:4444');
});
