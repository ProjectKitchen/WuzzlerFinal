import { Component, OnInit } from '@angular/core';
import { WuzzlerService } from 'src/app/_services/wuzzlerService/wuzzler.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

  constructor(private wuzzlerService: WuzzlerService) { }

  ngOnInit() {
  }

  updateScreenStatus(status: string) {
    this.wuzzlerService.screenstatus = status;
    console.log(this.wuzzlerService.screenstatus);
  }

}
  