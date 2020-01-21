import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ChallengeService } from 'src/app/_services/challengeService/challenge.service';
  
@Component({
  selector: 'app-modal1',
  templateUrl: './modal1.component.html',
  styleUrls: ['./modal1.component.scss']
})
export class Modal1Component implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<Modal1Component>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private challengeService: ChallengeService,
  ) { }

  ngOnInit() {
  }

  closeModal() {
    this.dialogRef.close();
  } 

  acceptChallenge(name) {
    this.challengeService.acceptChallenge(name);
    this.dialogRef.close();
  }

  rejectChallenge(name) {
    this.challengeService.rejectChallenge(name);
    this.dialogRef.close();
  }

}
