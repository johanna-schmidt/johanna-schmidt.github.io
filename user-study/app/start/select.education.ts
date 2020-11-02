
export class SelectEducation {

  public options: any[] = [
    { value: "high-school", name: "High School" },
    { value: "bachelor", name: "Bachelor's Degree" },
    { value: "master", name: "Master's Degree" },
    { value: "phd", name: "PhD or higher" },
    { value: "trade-school", name: "Trade School" },
    { value: "n/a", name: "Prefer not to say" }
  ];

  public selected: string = "high-school";

  constructor() {}
}
