
export class SelectExperience {

  public options: any[] = [
    { value: "none", name: "No experience" },
    { value: "media", name: "I notice them sometimes in newspapers or TV" },
    { value: "experienced", name: "I interact with them regularly" },
    { value: "expert", name: "I create them myself" }
  ];

  public selected: string = "none";

  constructor() {}
}
