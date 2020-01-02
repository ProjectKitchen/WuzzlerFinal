import { Component, OnInit } from '@angular/core';
import { WuzzlerService } from 'src/app/_services/wuzzlerService/wuzzler.service';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit {
  private colnames: any;

  constructor(
    private wuzzlerService: WuzzlerService
  ) { 
    this.wuzzlerService.getTop10();
  }

  ngOnInit() {
  }

  getColNames(data){
    if(data.length>0){
      return Object.keys(data[0]);
    } else {
      return [];
    }
  }

}
  