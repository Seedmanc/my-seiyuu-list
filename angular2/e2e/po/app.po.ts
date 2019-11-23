import { browser, by, element } from 'protractor';

export class AppPage {
  static navigateTo(url = '') {
    return browser.get('/' + url);
  }

  searchInput() {
    return element(by.css('#searchQuery'));
  }

  searchSpinner() {
    return element(by.css('#statusWrapper > msl-spinner'));
  }

  statusBar() {
    return element(by.css('#status'));
  }

  toggleDisqus() {
    return element(by.css('.toggle-disqus'));
  }

  disqusContainer() {
    return element(by.css('#disqus_thread'));
  }

  listOption(name:string) {
    return element(by.css(`#vanames option[value="${name}"]`))
  }

  tabs() {
    return element(by.css(`msl-tabs`)).$$('a');
  }

  try() {
    return element(by.css(`.try`));
  }

  tryLink(n?:number) {
    return typeof n != 'undefined' ?
      element(by.css(`.try`)).$$(`a.suggestion:nth-of-type(${n})`):
      element(by.css(`.try`)).$$(`a.suggestion`);
  }

  toggleChart() {
    return element(by.css('.msl-toggle-chart'));
  }
}
