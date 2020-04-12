const settings = {
    revokeBlinkPeriods: 5,
    revokeBlinkTime: 500,      // milliseconds
    abortBlinkPeriods: 30,
    abortBlinkTime: 100,       // milliseconds
    goalsToWin: 5,
    endGameDisplayTime: 7000,  // milliseconds

    goalSoundPrefix: "applause",
    goalSoundCount: 5,    
    winSoundPrefix: "cheer",
    winSoundCount: 2,    
    booSoundPrefix: "boo",
    booSoundCount: 3,
    backgroundSoundPrefix: "bg",
    backgroundSoundCount: 5,    
    endGameWhistleSound: "whistle2"
  }

const gameStates = {
  waiting: 'Waiting to start the game.',
  nogame: 'Login or start offline game!',
  playing: 'Game in progress!',
  revoke: 'Press button to revoke invalid goal!',
  abort: 'Hold both buttons to abort game'
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
