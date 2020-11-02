import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class ParticipantService {

  // User study contents
  private studyParticipantInfo: any;
  private studySanityCheck: any;
  private studyData: any;

  public infoStored$: BehaviorSubject<boolean>;
  public sanityCheckStored$: BehaviorSubject<boolean>;

  constructor() {
    this.infoStored$ = new BehaviorSubject<boolean>(false);
    this.sanityCheckStored$ = new BehaviorSubject<boolean>(false);
  }

  // tslint:disable-next-line:typedef
  public storeInfo($params: any) {
    this.studyParticipantInfo = $params;
    this.infoStored$.next(true);
  }

  // tslint:disable-next-line:typedef
  public storeSanityCheck($params: any) {
    this.studySanityCheck = $params;
    this.sanityCheckStored$.next(true);
  }

}
