export class BasicSeiyuu {
  public _id: number;
  public name: string;
  public hits?: number;
  public count?: number;
  public updated: Date;
  public accessed?: Date;

  constructor(obj) {
    let temp ={...obj,
        updated: new Date(obj.updated),
        accessed: obj.accessed && new Date(obj.accessed) || new Date(obj.updated)
      };
      Object.keys(temp).forEach(key => this[key] = temp[key]);
    }
}

export class Seiyuu extends BasicSeiyuu {

  public _id: number;
  public name: string;
  public pic: string;
  public count: number;
  public hits: number;
  private roles: {
    _id: number,
    name: string,
    main: boolean,
  }[];
  public l?:boolean;
  public c?:boolean;

  public get pending(): boolean {
    return !this.pic && !!this.name;
  };

  constructor(obj) {
    super(obj);
    Object.keys(obj).forEach(key => {
      if (!this[key]) this[key] = obj[key]
    });
  }
}
