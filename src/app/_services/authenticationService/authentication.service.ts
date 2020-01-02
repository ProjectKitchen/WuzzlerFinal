import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SocketService } from '../socketService/socket.service';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })

export class AuthenticationService {
  private currentUserSubject: BehaviorSubject<any>;
  public currentUser$: Observable<any>;
  public currentUser: string;

  private allUsersSubject: BehaviorSubject<any>;
  public allUsers$: Observable<any>;
  public allUsers: Array<string>;

  loggedIn: boolean = false;

  constructor(private socketService: SocketService, private router: Router ) {

    this.currentUserSubject = new BehaviorSubject<any>(localStorage.getItem('currentUser'));
    this.currentUser$ = this.currentUserSubject.asObservable();
    this.currentUser$.subscribe(val => this.currentUser = val);

    let initAllUsersValue = (localStorage.getItem('allUsers')) ? JSON.parse(localStorage.getItem('allUsers')) : this.allUsers;
    this.allUsersSubject = new BehaviorSubject<any>(initAllUsersValue);
    this.allUsers$ = this.allUsersSubject.asObservable();
    this.allUsers$.subscribe(val => {this.allUsers = val; console.log(this.allUsers)});

    if(localStorage.getItem('loggedIn') === 'true') {this.loggedIn = true};

    this.socketService.listen('loginResponse').subscribe( res => {

      localStorage.setItem('loggedIn', 'false');

      if(res.message === 'internal error') {
        alert('Error encounterd when communicating with the user database.')
        return;
      }
  
      if(res.message === 'invalid credentials') {
        alert('Username and/or password incorrect')
        return;
      }

      this.loggedIn = true;
      this.currentUserSubject.next(res.data.name);
      localStorage.setItem('loggedIn', 'true');
      localStorage.setItem('currentUser', res.data.name);
      localStorage.setItem('cookie', res.data.cookie);
     
      this.router.navigate(['/']);
    })

    this.socketService.listen('allUsers').subscribe( res => {
      this.allUsersSubject.next(res);
      localStorage.setItem('allUsers', JSON.stringify(res));
    })

    this.socketService.listen('registerResponse').subscribe( res => {
      if(res.message !== 'OK') {
        alert('Error encounterd when communicating with the user database.')
      } else {
        alert('Registration successfull');
      }
    })

    this.socketService.listen('survey').subscribe( surveyID => {
      this.socketService.emit('surveyResponse', {user: this.currentUser, surveyID});
    })

    this.socketService.listen('serverLogout').subscribe( name => {
      if(name === this.currentUser) {
        this.logout();
      }
    })

  }

  login(loginData: any) {
    this.socketService.emit('login', loginData);
  }

  register(registerData: any) {
    this.socketService.emit('register', registerData);
  }

  logout() {
    this.socketService.emit('logout', this.currentUser);
    localStorage.clear();
    localStorage.setItem('loggedIn', 'false');
    this.loggedIn = false;
    this.currentUserSubject.next(null);
    this.allUsersSubject.next(null);
    this.router.navigate(['/login']);
  }
}
