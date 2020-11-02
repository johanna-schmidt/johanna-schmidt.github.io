import { Component, OnInit } from '@angular/core';
import { ParticipantService } from '../participant.service';
import { SelectAge } from './select.age';
import { SelectEducation } from './select.education';
import { SelectResidence } from './select.residence';
import { SelectProfession } from './select.profession';
import { SelectExperience } from './select.experience';

@Component({
  selector: 'app-start',
  templateUrl: './start.component.html',
  styleUrls: ['./start.component.css']
})
export class StartComponent implements OnInit {

  public selectAge: SelectAge;
  public selectEducation: SelectEducation;
  public selectResidence: SelectResidence;
  public selectProfession: SelectProfession;
  public selectExperience: SelectExperience;

  constructor(private participant: ParticipantService) {
    this.selectAge = new SelectAge();
    this.selectEducation = new SelectEducation();
    this.selectResidence = new SelectResidence();
    this.selectProfession = new SelectProfession();
    this.selectExperience = new SelectExperience();
  }

  ngOnInit(): void {}

  // tslint:disable-next-line:typedef
  public onSubmitClicked() {
    const params = {
      age: this.selectAge.selected,
      education: this.selectEducation.selected,
      residence: this.selectResidence.selected,
      profession: this.selectProfession.selected,
      experience: this.selectExperience.selected
    };
    this.participant.storeInfo(params);
  }

}
