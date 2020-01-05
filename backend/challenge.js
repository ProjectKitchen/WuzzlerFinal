function init() {

    let challenges = [];
    let upcomingGames = [];
  
    function addChallenge(challenge) {
      const { challenger, challenged } = challenge;
      let notFound = true;
      challenges.forEach(item => {
        if(item.challenged === challenged && item.challenger === challenger) {
          notFound = false;
        }
      });
      if(notFound) {
        challenges.push(challenge);
      }
    }
  
    function cancelChallenge(challenge) {
      const { challenger, challenged } = challenge;
      let position = [];
      challenges.forEach((item, i) => {
        if(item.challenged === challenged && item.challenger === challenger ) {
          position.push(i);
        }
      })
      for(let e = position.length-1; e > -1; e--) {
        challenges.splice(position[e],1);
      }
    }
  
    function acceptChallenge(challenge){
      let position = [];
      const { challenger, challenged } = challenge;
      challenges.forEach((item, i) => {
        if((item.challenged === challenged && item.challenger === challenger) || (item.challenged === challenger && item.challenger === challenged)) {
          position.push(i);
        }
      })
      for(let e = position.length-1; e>-1; e--) {
        challenges.splice(position[e],1);
      }
      upcomingGames.push({red: challenger, blue: challenged});
      return upcomingGames.length;
    }
  
    function rejectChallenge(challenge) {
      const { challenger, challenged } = challenge;
      challenges.forEach((item, i) => {
        if((item.challenged === challenged && item.challenger === challenger)) {
          challenges.splice(i, 1);
        }
      })
    }
  
    function removeGame(){
      upcomingGames.shift();
      return upcomingGames.length;
    }
  
    function removeGameByPlayers(gameinfo){
      let position = -1;
    upcomingGames.forEach((item, i) => {
      if(gameinfo.red === item.red & gameinfo.blue === item.blue) {
        position = i;
      }
    })
    if(position > -1) {
      upcomingGames.splice(position, 1);
    }
    return upcomingGames.length;
    }

    function removeGameByPlayer(player){
      let newgamelist = [];
      let firstslot = false;
      if(upcomingGames.length>1){
        if(upcomingGames[0].red === player || upcomingGames[0].blue === player) {
          firstslot = true;
        }
      }
      upcomingGames.forEach((game, i) => {
        if(game.red !== player && game.blue !== player){
          newgamelist.push(game);
        }
      })
      upcomingGames =[...newgamelist];
      return {firstslot, ngames: newgamelist.length, nextgame: newgamelist[0]};
    }
  
    function getData(){
      return {
        challenges,
        upcomingGames
      }
    }
  
    return {
      addChallenge: addChallenge,
      cancelChallenge: cancelChallenge,
      acceptChallenge: acceptChallenge,
      rejectChallenge: rejectChallenge,
      removeGame: removeGame,
      removeGameByPlayer: removeGameByPlayer,
      removeGameByPlayers: removeGameByPlayers,
      getData: getData
    }
  }
  
  exports.init = init;