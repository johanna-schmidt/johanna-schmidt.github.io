
export class SelectProfession {

  public options: any[] = [
    { value: "student", name: "Student" },
    { value: "research-edu", name: "Working in research/education" },
    { value: "full-time", name: "Working full-time" },
    { value: "part-time", name: "Working part-time" },
    { value: "retired", name: "Retired" },
    { value: "n/a", name: "Prefer not to say" }
  ];

  public selected: string = "student";

  constructor() {}
}
