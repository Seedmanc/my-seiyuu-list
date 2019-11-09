import {env} from "../../environments/environment";

export abstract class Utils {
  private static readonly parser = document.createElement("textarea");

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

  static pluralize(number): string {
    return number !== undefined && (number % 10 > 1 || (number % 10) === 0 || number == 'no') ? 's' : '';
  }

  static unique<T>(list: T[], prop?: string): T[] {
    return list.filter((el, i) => list.findIndex(elem => elem === el ||
      elem[prop] && elem[prop] === el[prop]) === i);
  }

  static asrt(title: string, assertion = (..._) => true) {
    return env.loglevel ?
      (...data) => {
        let result = assertion(...data);
        result && env.loglevel > 1 ?
          console.info(`(${title}) `, ...data) :
          console.assert(result, `(${title})  ${assertion.toString()}`, ...data);
      } :
      ()=>{};
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

  static flattenDeep<T>(arr1): T[] {
    return arr1.reduce((acc, val) => Array.isArray(val) ? acc.concat(Utils.flattenDeep(val)) : acc.concat(val), []);
  }

}
