import {Utils} from "../_services/utils.service";
import {env} from "../../environments/environment";

export interface Role {
  _id?: number;
  name: string;
  main: boolean;
}

export interface HashOfRoles {
  [key: number]: Role[];
}

export class Anime {
  static activeSeiyuu: number;
  static detailsCache: {
    [key: number]: {title: string, pic: string}
  } = {};

  _id: number;

  private rolesBySeiyuu: HashOfRoles;

  get title(): string {
    return Anime.detailsCache[this._id] ?
      Anime.detailsCache[this._id].title :
      this._id + '';
  }

  get main(): boolean {
    return (this.rolesBySeiyuu[Anime.activeSeiyuu] || []).some(role => role.main);
  }
  get characters(): Role[] {
    return (this.rolesBySeiyuu[Anime.activeSeiyuu] || [])
      .sort((role1, role2) => role1.main == role2.main ? 0 : +role2.main || -1)
      .map(({name, main}) => ({name: Utils.decodeHtml(name), main}));
  }
  get firstCharacter(): string {
    return this.characters[0] && this.characters[0].name;
  }

  get thumb(): string {
    return Anime.detailsCache[this._id] ?
      `//${env.theSite}${Anime.detailsCache[this._id].pic}`.replace(/(\d)\.(\w{3,4})$/, '$1v.$2') :
      '';
  }
  get link(): string {
    return `//${env.theSite}/anime/${this._id}`;
  }


  constructor(anime) {
    Object.assign(this, anime);
    this._id = +this._id;
  }

  toJSON() {
//->stackoverflow whatever
    // start with an empty object (see other alternatives below)
    const jsonObj:any = Object.assign({}, this);

    // add all properties
    const proto = Object.getPrototypeOf(this);
    for (const key of Object.keys(proto)) {
      const desc = Object.getOwnPropertyDescriptor(proto, key);
      const hasGetter = desc && typeof desc.get === 'function';
      if (hasGetter) {
        jsonObj[key] = desc.get();
      }
    }
    // do I look like I know what I'm doing, motherfucker?
    jsonObj.main = this.main;
    jsonObj.link = this.link;
    jsonObj.thumb = this.thumb;
    jsonObj.firstCharacter = this.firstCharacter;
    jsonObj.characters = this.characters;
    jsonObj.title = this.title;

    return jsonObj;
  }
}
