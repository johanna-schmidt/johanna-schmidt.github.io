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
  public showDataProtection: boolean;
  public showContact: boolean;

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
  public onDataProtectionClicked() {
    this.setShowDataProtection();
  }

  // tslint:disable-next-line:typedef
  public onContactClicked() {
    this.setShowContact();
  }

  // tslint:disable-next-line:typedef
  public onBackClicked() {
    this.setShowWelcome();
  }

  // tslint:disable-next-line:typedef
  private setShowWelcome() {
    this.showWelcome = true;
    this.showStart = false;
    this.showSanityCheck = false;
    this.showStudy = false;
    this.showDataProtection = false;
    this.showContact = false;
  }

  // tslint:disable-next-line:typedef
  private setShowStart() {
    this.showWelcome = false;
    this.showStart = true;
    this.showSanityCheck = false;
    this.showStudy = false;
    this.showDataProtection = false;
    this.showContact = false;
  }

  // tslint:disable-next-line:typedef
  private setShowSanityCheck() {
    this.showWelcome = false;
    this.showStart = false;
    this.showSanityCheck = true;
    this.showStudy = false;
    this.showDataProtection = false;
    this.showContact = false;
  }

  // tslint:disable-next-line:typedef
  private setShowStudy() {
    this.showWelcome = false;
    this.showStart = false;
    this.showSanityCheck = false;
    this.showStudy = true;
    this.showDataProtection = false;
    this.showContact = false;
  }

  // tslint:disable-next-line:typedef
  private setShowDataProtection() {
    this.showWelcome = false;
    this.showStart = false;
    this.showSanityCheck = false;
    this.showStudy = false;
    this.showDataProtection = true;
    this.showContact = false;
  }

  // tslint:disable-next-line:typedef
  private setShowContact() {
    this.showWelcome = false;
    this.showStart = false;
    this.showSanityCheck = false;
    this.showStudy = false;
    this.showDataProtection = false;
    this.showContact = true;
  }
}
