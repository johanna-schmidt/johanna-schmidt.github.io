import { Component, OnInit } from '@angular/core';
import { RadioGroup } from './radio';
import { ParticipantService } from '../participant.service';

@Component({
  selector: 'app-sanitycheck',
  templateUrl: './sanitycheck.component.html',
  styleUrls: ['./sanitycheck.component.css']
})
export class SanitycheckComponent implements OnInit {

  public showFirst: boolean;
  public showSecond: boolean;
  public errorOccured: boolean;

  public radio1: RadioGroup;
  public radio2: RadioGroup;

  constructor(private participant: ParticipantService) {
    this.showFirst = true;
    this.showSecond = false;
    this.errorOccured = false;
    this.radio1 = new RadioGroup();
    this.radio2 = new RadioGroup();
  }

  ngOnInit(): void {}

  // tslint:disable-next-line:typedef
  public submitFirst() {
    if (this.radio1.value === undefined || this.radio1.value === '') {
      this.errorOccured = true;
    } else {
      this.showFirst = false;
      this.showSecond = true;
      this.errorOccured = false;
    }
  }

  // tslint:disable-next-line:typedef
  public submitSecond() {
    if (this.radio2.value === undefined || this.radio2.value === '') {
      this.errorOccured = true;
    } else {
      const params = {
        q1: this.radio1.value,
        q2: this.radio2.value
      };
      this.participant.storeSanityCheck(params);
    }
  }

}
