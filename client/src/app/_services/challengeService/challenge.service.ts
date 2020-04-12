import { Injectable } from '@angular/core';
import { SocketService } from '../socketService/socket.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthenticationService } from '../authenticationService/authentication.service';


@Injectable({
  providedIn: 'root'
})

export class ChallengeService {
  private challengedBySubject: BehaviorSubject<any>;
  public challengedBy$: Observable<any>;
  challengedBy: string[] = [];
  private challengedSubject: BehaviorSubject<any>;
  public challenged$: Observable<any>;
  challenged: string[] = [];
  private gamesSubject: BehaviorSubject<any>;
  public games$: Observable<any>;
  games: any = [];
 
  constructor(
    private socketService: SocketService,
    private authenticationService: AuthenticationService
  ) {

    let initChallengedByValue = (localStorage.getItem('challengedBy')) ? JSON.parse(localStorage.getItem('challengedBy')) : this.challengedBy;
    this.challengedBySubject = new BehaviorSubject<any>(initChallengedByValue);
    this.challengedBy$ = this.challengedBySubject.asObservable();
    this.challengedBy$.subscribe(val=>this.challengedBy=val);

    let initGamesValue = (localStorage.getItem('games')) ? JSON.parse(localStorage.getItem('games')) : this.games;
    this.gamesSubject = new BehaviorSubject<any>(initGamesValue);
    this.games$ = this.gamesSubject.asObservable();
    this.games$.subscribe(val=>this.games=val);

    let initChallengedValue = (localStorage.getItem('challenged')) ? JSON.parse(localStorage.getItem('challenged')) : this.challenged;
    this.challengedSubject = new BehaviorSubject<any>(initChallengedValue);
    this.challenged$ = this.challengedSubject.asObservable();
    this.challenged$.subscribe(val=>this.challenged=val);
    
    this.socketService.listen('challengeUpdate').subscribe( res => {
      let { challenges, upcomingGames } = res;
      let challenged = [];
      let challengedBy = [];
      challenges.forEach(item => {
        if(authenticationService.currentUser === item.challenger) {
          challenged.push(item.challenged);
        }
        if(authenticationService.currentUser === item.challenged) {
          challengedBy.push(item.challenger);
        }
      })
      localStorage.setItem('challenged', JSON.stringify(challenged));
      localStorage.setItem('challengedBy', JSON.stringify(challengedBy));
      localStorage.setItem('games', JSON.stringify(upcomingGames));
      this.challengedBySubject.next(challengedBy);
      this.challengedSubject.next(challenged);
      this.gamesSubject.next(upcomingGames);
    })
    
  }

  addChallenge(challenged: string) {
    let challengeData = {challenger: this.authenticationService.currentUser, challenged: challenged};
    this.socketService.emit('addChallenge', challengeData)
  }

  cancelChallenge(challenged: string) {
    let challengeData = {challenger: this.authenticationService.currentUser, challenged: challenged};
    this.socketService.emit('cancelChallenge', challengeData)
  }

  acceptChallenge(challenger: string) {
    let challengeData = {challenger: challenger, challenged: this.authenticationService.currentUser};
    this.socketService.emit('acceptChallenge', challengeData)
  }

  rejectChallenge(challenger: string) {
    let challengeData = {challenger: challenger, challenged: this.authenticationService.currentUser};
    this.socketService.emit('rejectChallenge', challengeData)
  }

  cancelGame(gametext: string){
    console.log ("User " + localStorage.getItem('currentUser') + " wants to cancel game " + gametext);
    const gameinfo = gametext.split(' vs. ');
    if (gameinfo[0] == localStorage.getItem('currentUser') || gameinfo[1] == localStorage.getItem('currentUser')) {
      let game = {red: gameinfo[0], blue: gameinfo[1]};
      this.socketService.emit('cancelGame', game);
      console.log ("->  cancel game done! ");
    } 
    else {
      console.log ("->  not allowed to cancel game! ");
    }
  }

}
