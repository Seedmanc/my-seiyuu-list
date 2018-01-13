export class BasicSeiyuu {
  public _id: number;
  public name: string;
  public hits?: number;
  public count?: number;
  public updated: Date;
  public accessed?: Date;
  public namesakes: any[];

  constructor(obj) {
    let temp ={...obj,
        updated: new Date(obj.updated),
        accessed: obj.accessed && new Date(obj.accessed) || new Date(obj.updated)
      };
     this.upgrade(temp);
    }

    public get pending(): boolean {
      return !this['roles'] && !!this.name;
    };

    public upgrade(obj) {
      Object.keys(obj).forEach(key => {
        if (this[key] === undefined) this[key] = obj[key]
      });
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

  constructor(obj) {
    super(obj);
    this.upgrade(obj);
  }
}
