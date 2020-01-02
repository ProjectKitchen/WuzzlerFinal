import { Component, OnInit } from '@angular/core';
import { WuzzlerService } from 'src/app/_services/wuzzlerService/wuzzler.service';

@Component({
  selector: 'app-status',
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.scss']
})
export class StatusComponent implements OnInit {
  redPlayer: string = "red";
  bluePlayer: string = "blue";
  gameStatus: string = "";

  constructor(
    private wuzzlerService: WuzzlerService
  ) { }
 
  ngOnInit(
  ) {
    if(this.wuzzlerService.games.length > 0) {
      this.redPlayer=this.wuzzlerService.games[0].red;
      this.bluePlayer=this.wuzzlerService.games[0].blue;
      this.gameStatus="Game ready to start";
    }
  }

}
 