
export class SelectResidence {

  public options: any[] = [
    { value: "Austria", name: "Austria" },
    { value: "EU", name: "Other EU country" },
    { value: "non-EU", name: "Outside EU" }
  ];

  public selected: string = "Austria";

  constructor() {}
}
