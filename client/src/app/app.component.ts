import { Component } from '@angular/core';
import { AuthenticationService } from './_services/authenticationService/authentication.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent {
  title = 'wuzzler';
  currentUser: boolean = true;

  constructor(private authenticationService: AuthenticationService) {
  }

}
 