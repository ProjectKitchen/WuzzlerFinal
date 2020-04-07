const settings = {
    revokeTime: 5,
    goalsToWin: 5
  }

const gameStates = {
  waiting: 'Waiting to start the game.',
  nogame: 'There is no game waiting.',
  playing: 'Game in progress!',
  revoke: 'Press button if goal was invalid!',  
  over: 'Game is over!',
  top10updated: 'Top10 list has been updated.'
};

module.exports = {
  settings,
  gameStates
}
