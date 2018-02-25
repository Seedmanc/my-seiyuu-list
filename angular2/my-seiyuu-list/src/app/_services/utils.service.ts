import {env} from "../../environments/environment";

export class Utils {

  static readonly theSite: string = 'myanimelist.net';

  static unorderedEquals(input: string, name: string): string {
    if (name) {
      input = input.toLowerCase();
      name = name.toLowerCase();

      return (input === name || input.split(' ').reverse().join(' ') === name) && name;
    } else return '';
  }

  static pluralize(number) {
    return number !== undefined && (number % 10 > 1 || (number % 10) === 0) ? 's' : '';
  }

  static unique<T>(list: T[], prop?: string): T[] {
    return list.filter((el, i) => list.findIndex(elem => elem === el ||
      elem[prop] && elem[prop] === el[prop]) === i);
  }

  static log(title?: string, mode: string = 'info') {
    return env.loglevel ? (...messages) => console[mode](title, ':', ...messages) : ()=>{};
  }
  static lg(msg: any, mode: string = 'info') {
    return env.loglevel ? () => console[mode](msg) : ()=>{};
  }

}
