import {env} from "../../environments/environment";

export class Utils {
  private static readonly parser = document.createElement("textarea");

  static readonly theSite: string = 'myanimelist.net';

  static unorderedCompare(input: string, name: string): string {
    if (name) {
      input = input.toLowerCase();
      name = name.toLowerCase();

      return (input === name || input.split(' ').reverse().join(' ') === name) && name;
    } else return '';
  }

  static kanjiCompare(input: string, names: string[]): boolean {
    const joint = input.replace(/\s+/g, '');

    return  names.some(name => name === joint);
  }

  static pluralize(number) {
    return number !== undefined && (number % 10 > 1 || (number % 10) === 0 || number == 'no') ? 's' : '';
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

  static decodeHtml(html: string): string {
    if (!html.match(/&\S{4};/))
      return html;

    Utils.parser.innerHTML = html;

    return Utils.parser.value;
  }

  static compareLists(x: any[], y: any[], field = 'name'): boolean {
    return x.map(e => e[field]).join() == y.map(e => e[field]).join();
  } //TODO either test or get rid of

}
