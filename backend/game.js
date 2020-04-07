const db = require('./db').init();
const settings = require('./config/config').settings;
const gameStates = require('./config/config').gameStates;

function init() {

/*
  const gameStates = {
    waiting: 'Waiting to start the game.',
    nogame: 'There is no game waiting.',
    playing: 'Game in progress!',
    revoke: 'Press button if goal was invalid!',
    over: 'Game is over!',
    top10updated: 'Top10 list has been updated.'
  };
*/

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

  let game = {
    red:        0,
    blue:       0,
    red_name:   'red',
    blue_name:  'blue',
    red_ready:  false,
    blue_ready: false,
    status:      gameStates.nogame,
    winner:     null
  };

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

  function revokePhase(color){
      game.status = gameStates.revoke;
  }

  function revokeDone(color){
      game.status = gameStates.playing;
  }

  function goal(color){
    let result = {code: 0, gameType: 'regular'};
    if(game.status === gameStates.playing) {
      game[color] += 1;
    }
    if(game.red_name === 'red' && game.blue_name === 'blue'){
      result.gameType = 'dummy';
    }
    if(Math.max(game.red, game.blue) === settings.goalsToWin && game.status === gameStates.playing) {
      game.winner = (game.blue === settings.goalsToWin) ? game.blue_name : game.red_name;
      gameStates.over = 'The winner is ' + game.winner +  '!';
      game.status = gameStates.over;
      result.code = 10;
      return result;
    }
    if(Math.max(game.red, game.blue) === 10 && game.status !== gameStates.playing) {
      result.code = 20;
      return result;
    }
    if(Math.max(game.red, game.blue) !== 10) {
      result.code = 0;
      return result;
    }
  }

  function getGame(){
    return game;
  }

  function finishGame(gameType){
    if(game.status === gameStates.over) {
      if(gameType === 'regular') {
        db.addGame(game.red_name, game.blue_name, game.red, game.blue);
        game.status = gameStates.top10updated;
      } 
    }
  }

  return {
    resetGame: resetGame,
    setGame: setGame,
    startGame: startGame,
    goal: goal,
    playerReady: playerReady,
    finishGame: finishGame,
    getGame: getGame,
    revokePhase: revokePhase,
    revokeDone: revokeDone
  }

}

exports.init = init;
