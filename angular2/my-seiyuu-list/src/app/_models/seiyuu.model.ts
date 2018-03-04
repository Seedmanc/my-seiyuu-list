import {Utils} from "../_services/utils.service";
import {Role} from "./anime.model";

abstract class NamedEntity {
  protected name: string;
}

export class BasicSeiyuu extends NamedEntity {
  public _id?: number;
  public name: string;
  public alternate_name: string[];
  public hits?: number;
  public count?: number;
  public updated?: Date;
  public accessed?: Date;

  constructor(obj) {
    super();
    const temp = {...obj,
        updated: new Date(obj.updated),
        accessed: obj.accessed && new Date(obj.accessed) || new Date(obj.updated)
      };
     this.upgrade(temp);
    this.alternate_name = this.alternate_name || [];
    }

  public get pending(): boolean {
    return !this['roles'] && !!this.name;
  }

  public get link(): string {
    return `//${Utils.theSite}/people/${this._id}`;
  }

  public upgrade(obj) {
    Object.keys(obj).forEach(key => {
      if (this[key] === undefined) this[key] = obj[key];
    });
    return this;
  }
  protected get photo(): string {
    return this['pic'] && `//${Utils.theSite}${this['pic']}`;
  }
  protected get thumb(): string {
    return this.photo && this.photo.replace('.jp', 'v.jp');
  }
}

export class Seiyuu extends BasicSeiyuu {

  private pic?: string;
  public roles?: Role[];
  public l?: boolean;
  public c?: boolean;

  constructor(obj) {
    super(obj);
  }

}

export class Namesake extends NamedEntity {

  get name() {
    return this.namesakes && this.namesakes[0] && this.namesakes[0].name;
  }
  namesakes: BasicSeiyuu[];

  constructor(nmsks: BasicSeiyuu[]) {
    super();  //since when do we call constructors on abstract classes, Idea?
    this.namesakes = nmsks;
  }

}
