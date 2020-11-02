import {Component, OnInit} from '@angular/core';
import {ParticipantService} from './participant.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {

  public title: string;

  public showWelcome: boolean;
  public showStart: boolean;
  public showSanityCheck: boolean;
  public showStudy: boolean;

  private startPageListener$: Subscription;

  constructor(private participant: ParticipantService) {
    this.title = 'user-study';
    this.setShowWelcome();
  }

  // tslint:disable-next-line:typedef
  ngOnInit() {
    this.startPageListener$ = this.participant.infoStored$.subscribe((isSet) => {
      if (isSet) {
        this.setShowSanityCheck();
      }
    });
    this.startPageListener$ = this.participant.sanityCheckStored$.subscribe((isSet) => {
      if (isSet) {
        this.setShowStudy();
      }
    });
  }

  // tslint:disable-next-line:typedef
  public onStartClicked() {
    this.setShowStart();
  }

  // tslint:disable-next-line:typedef
  private setShowWelcome() {
    this.showWelcome = true;
    this.showStart = false;
    this.showSanityCheck = false;
    this.showStudy = false;
  }

  // tslint:disable-next-line:typedef
  private setShowStart() {
    this.showWelcome = false;
    this.showStart = true;
    this.showSanityCheck = false;
    this.showStudy = false;
  }

  // tslint:disable-next-line:typedef
  private setShowSanityCheck() {
    this.showWelcome = false;
    this.showStart = false;
    this.showSanityCheck = true;
    this.showStudy = false;
  }

  // tslint:disable-next-line:typedef
  private setShowStudy() {
    this.showWelcome = false;
    this.showStart = false;
    this.showSanityCheck = false;
    this.showStudy = true;
  }
}
