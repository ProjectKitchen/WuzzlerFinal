import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from "../_services/authenticationService/authentication.service";
import { ChallengeService } from "../_services/challengeService/challenge.service";
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Modal1Component } from '../_modals/modal1/modal1.component';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  usersLoggedIn: any;

  constructor(
    private authenticationService: AuthenticationService,
    private challengeService: ChallengeService,
    public matDialog: MatDialog
    ) { }

  ngOnInit() {

  } 

  getAvailableUsers(userlist, me){
    let results = [];
    let playersInGames = [];
    this.challengeService.games.forEach(item=>{
      if(item.red === me) {playersInGames.push(item.blue)};
      if(item.blue === me) {playersInGames.push(item.red)};
    })
    userlist.forEach(item=>{
      if(item!==me && !this.challengeService.challenged.includes(item) && !playersInGames.includes(item)){
        results.push(item);
      }
    })
    return results;
  }

  openModal1(name){
    console.log(name);
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.id = "modal-component";
    dialogConfig.height = "250px";
    dialogConfig.width = "400px";
    dialogConfig.data = {name: name};
    const modalDialog = this.matDialog.open(Modal1Component, dialogConfig);
  }

}
