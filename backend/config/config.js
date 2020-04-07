const settings = {
    revokeTime: 5,
    goalsToWin: 5,
    goalSoundPrefix: "applause",
    goalSoundCount: 5,    
    winSoundPrefix: "cheer",
    winSoundCount: 2    
  }

const gameStates = {
  waiting: 'Waiting to start the game.',
  nogame: 'Login or start offline game!',
  playing: 'Game in progress!',
  revoke: 'Press button to revoke if invalid goal!',  
};

const gameInfo = {
  localGame: 'local',
  onlineGame: 'online',
  gameOngoing: 'gameOngoing', 
  gameWon: 'gameWon' 
}

module.exports = {
  settings,
  gameStates,
  gameInfo
}
