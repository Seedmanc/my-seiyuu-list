import {Utils} from "../_services/utils.service";

export interface Role {
  _id?: number;
  name: string;
  main: boolean;
}

export interface HashOfRoles {
  [key: number]: Role[]
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
      this._id+'';
  }

  get main(): boolean {
    return (this.rolesBySeiyuu[Anime.activeSeiyuu]||[]).some(role => role.main);
  }
  get characters(): Role[] {
    return (this.rolesBySeiyuu[Anime.activeSeiyuu]||[])
      .sort((role1, role2) => +(role1.main < role2.main))
      .map(({name, main}) => {return {name: Utils.decodeHtml(name), main}});
  }
  get mainCharacter(): string {
    return this.characters[0] && this.characters[0].name;
  }

  get thumb(): string {
    return Anime.detailsCache[this._id] ?
      `//${Utils.theSite}${Anime.detailsCache[this._id].pic}`.replace(/(\d)\.(\w{3,4})$/, '$1v.$2') :
      '';
  }
  get link(): string {
    return `//${Utils.theSite}/anime/${this._id}`;
  }


  constructor(anime) {
    Object.assign(this, anime);
    this._id = +this._id;
  }
}
