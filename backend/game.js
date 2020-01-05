const db = require('./db').init();

function init() {

  const gameStates = {
    waiting: 'Waiting to start the game.',
    playing: 'Game in progress!',
    over: 'Game is over!',
    nogame: 'There is no game waiting.',
    top10updated: 'Top10 list has been updated.'
  };

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
    if(game.status === gameStates.playing  || game.status === gameStates.nogame || game.status === gameStates.top10updated || game.status === gameStates.waiting) {
      game = Object.assign({}, reset, {red_name, blue_name, status: gameStates.waiting});
    }
  }

  function startGame(){
    if(game.blue_ready && game.red_ready) {
      game = Object.assign({}, game, {status: gameStates.playing});
    }
  }

  function playerReady(color){
    if(game.status === gameStates.waiting){
      game[color + '_ready'] = !game[color +'_ready'] ;
    }
    if(game.red_ready && game.blue_ready) {
      game.status = gameStates.playing;
    }
  }

  function goal(color){
    if(game.status === gameStates.playing) {
      game[color] += 1;
    }
    if(Math.max(game.red, game.blue) === 10 && game.status === gameStates.playing) {
      game.winner = (game.blue === 10) ? game.blue_name : game.red_name;
      gameStates.over = 'The winner is ' + game.winner +  '. Top10 list has been updated.';
      game.status = gameStates.over;
      return 10;
    }
    if(Math.max(game.red, game.blue) === 10 && game.status !== gameStates.playing) {
      return 20;
    }

    return 0;
  }

  function getGame(){
    return game;
  }

  function finishGame(){
    if(game.status === gameStates.over) {
      db.addGame(game.red_name, game.blue_name, game.red, game.blue);
      game.status = gameStates.top10updated;
    }
  }

  return {
    resetGame: resetGame,
    setGame: setGame,
    startGame: startGame,
    goal: goal,
    playerReady: playerReady,
    finishGame: finishGame,
    getGame: getGame

  }

}

exports.init = init;