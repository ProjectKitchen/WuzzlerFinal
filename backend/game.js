const settings = require('./config/config').settings;
const gameStates = require('./config/config').gameStates;
const gameInfo = require('./config/config').gameInfo;


function init() {

  const reset = {
    red:        0,
    blue:       0,
    red_name:   'red',
    blue_name:  'blue',
    red_ready:  false,
    blue_ready: false,
    status:     gameStates.nogame,
    winner:     null
  };

  let game = Object.assign({}, reset);

  function resetGame() {
    game = Object.assign({}, reset);
  }

  function setGame(red_name, blue_name){
      game = Object.assign({}, reset, {red_name, blue_name, status: gameStates.waiting});
  }

  function startGame(){
    if(game.blue_ready && game.red_ready) {
      game = Object.assign({}, game, {status: gameStates.playing});
    }
  }

  function playerReady(color){
    if(game.status === gameStates.waiting || game.status === gameStates.nogame){
      game[color + '_ready'] =  true ;
    }
    if(game.red_ready && game.blue_ready) {
      game.status = gameStates.playing;
    }
  }

  function revokePhase(){
      game.status = gameStates.revoke;
  }

  function abortPhase(){
      game.status = gameStates.abort;
  }

  function playPhase(){
      game.status = gameStates.playing;
  }

  function goal(color){
    let result = {code: gameInfo.gameOngoing, gameType: gameInfo.onlineGame};
    if(game.status === gameStates.playing) {
      game[color] += 1;
    }
    if(game.red_name === 'red' && game.blue_name === 'blue'){
      result.gameType = gameInfo.localGame;
    }
    if(Math.max(game.red, game.blue) === settings.goalsToWin) { 
      game.winner = (game.blue === settings.goalsToWin) ? game.blue_name : game.red_name;
      game.status = 'The winner is ' + game.winner +  '!';
      result.code = gameInfo.gameWon;
    }
    return result;
  }

  function getGame(){
    return game;
  }

  return {
    resetGame: resetGame,
    setGame: setGame,
    startGame: startGame,
    goal: goal,
    playerReady: playerReady,
    getGame: getGame,
    revokePhase: revokePhase,
    abortPhase: abortPhase,
    playPhase: playPhase
  }

}

exports.init = init;
