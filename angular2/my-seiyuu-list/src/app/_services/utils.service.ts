export class Utils {

  public static unorderedEquals(input: string, name: string): string {
    if (name) {
      input = input.toLowerCase();
      name = name.toLowerCase();

      return (input === name || input.split(' ').reverse().join(' ') === name) && name;
    } else return '';
  }

  public static pluralize(number) {
    return number && (number % 10 > 1 || (number % 10) == 0) ? 's' : '';
  };

  public static readonly theSite: string = 'myanimelist.net';
}
