import {Role} from "./anime.model";
import {env} from "../../environments/environment";

export class BasicSeiyuu {
  _id?: number;
  count?: number;

  name: string;
  alternate_name: string[];

  updated?: Date;
  accessed?: Date;

  namesakes: BasicSeiyuu[];


  constructor(obj) {
    const temp = obj.namesakes ?
      obj :
      {...obj,
        updated: obj.updated && new Date(obj.updated)
      };

    this.upgrade(temp);
    this.alternate_name = this.alternate_name || [];
    this.namesakes = this.namesakes || [];
  }

  get pending(): boolean {
    return !this['roles'] && !!this.name;
  }

  get link(): string {
    return `//${env.theSite}/people/${this._id}`;
  }

  get displayName() {
    return this.hasNamesakes ?
      this.namesakes[0].name :
      this.name;
  }

  get hasNamesakes() {
    return this.namesakes && !!this.namesakes.length;
  }

  upgrade(obj) {
    Object.keys(obj).forEach(key => {
      if (this[key] === undefined) this[key] = obj[key];
    });
    let date = obj.accessed || obj.updated;
    this.accessed = date && new Date(date) || this.accessed;
    return this;
  }

  protected get photo(): string {
    return this['pic'] && `//${env.theSite}${this['pic']}`;
  }
  protected get thumb(): string {
    return this.photo && this.photo.replace('.jp', 'v.jp');
  }
}

export class Seiyuu extends BasicSeiyuu {
  roles?: Role[];
  hits?: number;

  private pic?: string;

  constructor(obj) {
    super(obj);
  }

}
