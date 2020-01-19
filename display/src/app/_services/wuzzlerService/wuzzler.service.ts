import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from "rxjs";
import { SocketService } from '../socketService/socket.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})

export class WuzzlerService {
  private gamesSubject: BehaviorSubject<any>;
  public games$: Observable<any>;
  games: any = [{red: "red", blue: "blue"}];

  private top10Subject: BehaviorSubject<any>;
  public top10$: Observable<any>;
  top10: any = [];
 
  private gameSubject: BehaviorSubject<any>;
  public game$: Observable<any>;
  game: any = {
    red:        0,
    blue:       0,
    red_name:   "red",
    blue_name:  "blue",
    red_ready:  false,
    blue_ready: false,
    status:      "nogame",
    winner:     null
  }; 

  constructor(
    private socketService: SocketService,
    private router: Router
  ) {

    let initGamesValue = (localStorage.getItem("games")) ? JSON.parse(localStorage.getItem("games")) : this.games;
    this.gamesSubject = new BehaviorSubject<any>(initGamesValue);
    this.games$ = this.gamesSubject.asObservable();
    this.games$.subscribe(val=>this.games=val);

    let initGameValue = (localStorage.getItem("game")) ? JSON.parse(localStorage.getItem("game")) : this.game;
    this.gameSubject = new BehaviorSubject<any>(initGameValue);
    this.game$ = this.gameSubject.asObservable();
    this.game$.subscribe(val=>this.game=val);

    let initTtop10Value = (localStorage.getItem("top10")) ? JSON.parse(localStorage.getItem("top10")) : this.top10;
    this.top10Subject = new BehaviorSubject<any>(initTtop10Value);
    this.top10$ = this.top10Subject.asObservable();
    this.top10$.subscribe(val=>this.top10=val);

    this.socketService.listen("challengeResponse").subscribe( res => {
      this.gamesSubject.next(res.upcomingGames);
      localStorage.setItem('games', JSON.stringify(res.upcomingGames));
    });

    this.socketService.listen("gameUpdate").subscribe( res => {
      this.gameSubject.next(res);
      localStorage.setItem('game', JSON.stringify(res));
    });

    this.socketService.listen("top10update").subscribe( res => {
      this.top10Subject.next(res);
      localStorage.setItem('top10', JSON.stringify(res));
      this.router.navigateByUrl('/top10');
      setTimeout(() => {
        this.router.navigateByUrl('/');
      }, 5000)
    });

  }

  goal(color){
    this.socketService.emit('goal', color);
  }

  playerReady(color){
    this.socketService.emit('playerReady', color);
  }

  getTop10(){
    this.socketService.emit('top10', null);
  }

}
