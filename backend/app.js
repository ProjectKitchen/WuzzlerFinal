const db=require('./db').init();
const gameM = require('./game').init();
const challengeM = require('./challenge').init();

const cors = require('cors');
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const app = express();
app.use(cors());

const server = http.createServer(app);
const io = socketIO(server);
io.origins('*:*');

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
      let send = false;
      let currentUsers = Object.keys(activeUsers);
      currentUsers.forEach(name => {
        if(activeUsers[name] <= surveyID-1){
          delete activeUsers[name];
          challengeM.rejectChallenge(name);
          challengeM.cancelChallenge(name);
          let res = challengeM.removeGameByPlayer(name);
          send = true;
          console.log(res);
          if(res.firstslot && res.ngames === 0) {
            gameM.resetGame();
            console.log('hi1');
          }
          if(res.firstslot && res.ngames > 0) {
            console.log('hi2');
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
    socketEcho('disconnect', null, 'IN');
    surveyID += 1;
    socketEcho('survey', surveyID, 'OUT');
    io.sockets.emit('survey', surveyID);
  })

  socket.on('surveyResponse', data => {
    socketEcho('surveyResponse', data, 'IN');
    if(data.user !== null) {
      if(activeUsers[data.user]) {
        activeUsers[data.user] = data.surveyID;
      } else {
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
    challengeM.addCHallenge(data);
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
    if(ngames === 1) {
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

  socket.on('goal', data => {
    socketEcho('goal', data, 'IN');
    let ngoals = gameM.goal(data);
    socketEcho('gameUpdate', gameM.getGame(), 'OUT');
    io.sockets.emit('gameUpdate', gameM.getGame()); 
    if(ngoals === 10){
      gameM.finishGame();
      setTimeout(() => {
        let ngames = challengeM.removeGame();
        if(ngames > 0){
          gameM.setGame(challengeM.getData().upcomingGames[0].red, challengeM.getData().upcomingGames[0].blue);
        } else {
          gameM.resetGame();
        }
        socketEcho('gameUpdate', gameM.getGame(), 'OUT');
        io.sockets.emit('gameUpdate', gameM.getGame());
        socketEcho('challengeUpdate', challengeM.getData(), 'OUT');
        io.sockets.emit('challengeUpdate', challengeM.getData());
      }, 7000);
    }
  })

  socket.on('playerReady', data => {
    socketEcho('playerReady', data, 'IN');
    gameM.playerReady(data);
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

server.listen(4444, function(){
  console.log('listening on *:4444');
});
