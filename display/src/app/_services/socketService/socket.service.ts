import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class SocketService {
  socket: any;
  readonly uri: string = "ws://localhost:4444";

  constructor() {
    this.socket=io(this.uri)
  }

  listen(eventName: string) {
    return new Observable<any>((subscriber)=>{
      this.socket.on(eventName, (data: any) => {
        console.log('>------------------------------------------------------------');
        console.log('Event of Type ' + eventName + ' received with the following data:');
        console.log(data);
        console.log('------------------------------------------------------------<');
        console.log('                            +++                              ');
        subscriber.next(data);
      })
    })
  }
 
  emit(eventName: string, data:any) {
    console.log('>------------------------------------------------------------');
    console.log('Event of Type ' + eventName + ' emitted with the following data:');
    console.log(data);
    console.log('------------------------------------------------------------<');
    console.log('                            +++                              ');
    this.socket.emit(eventName, data);
  }

} 
