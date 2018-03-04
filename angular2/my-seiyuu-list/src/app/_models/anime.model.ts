import {Utils} from "../_services/utils.service";

export interface Role {
  _id: number;
  name: string;
  main: boolean;
}

export class Anime {
  static activeSeiyuu: number;

  _id: number;
  rolesBySeiyuu: {[key: number]: Role[]};
  title?: string;
  pic?: string;

  get titleText() {
    return this.title || this._id+'';
  }

  get main() {
    return this.rolesBySeiyuu[Anime.activeSeiyuu].some(role => role.main);
  }
  get characters() {
    return this.rolesBySeiyuu[Anime.activeSeiyuu]
      .sort((role1, role2) => +(role1.main > role2.main))
      .map(role => role.name);
  }
  get mainCharacter() {
    return this.characters[0];
  }

  get thumb(): string {
    return `//${Utils.theSite}${this.pic}`;
  }
  get link(): string {
    return `//${Utils.theSite}/anime/${this._id}`;
  }

  constructor(anime) {
    Object.assign(this, anime);
    this._id = +this._id;
  }
}
