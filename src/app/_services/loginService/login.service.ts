import { Injectable, OnInit } from '@angular/core';
import { SocketService} from '../socketService/socket.service';
import { Router, ActivatedRoute } from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class LoginService implements OnInit {
  loginResponse: any;

  constructor(
    private socketService: SocketService,
    private router: Router,
  ) { 
    console.log("hi");

    this.socketService.listen('loginResponse').subscribe( res => {
      console.log('loginResponse');
      console.log(res);
      this.router.navigate(["/"])
    })

    this.socketService.listen('allUsers').subscribe( res => {
      console.log('allUsers');
      console.log(res);
    })
  } 

  ngOnInit() {
    console.log("hi");

    this.socketService.listen('loginResponse').subscribe( res => {
      console.log('loginResponse');
      console.log(res);
    })

    this.socketService.listen('allUsers').subscribe( res => {
      console.log('allUsers');
      console.log(res);
    })

    this.socketService.socket.on('loginResponse', (res)=> console.log(res));

  }

  login(loginData) {
    this.socketService.emit('login', loginData);
  }

}
