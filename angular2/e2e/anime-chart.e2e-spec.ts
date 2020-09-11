import { protractor, browser, by, element } from "protractor";
import {SeiyuuPage} from "./po/seiyuu.po";
import {AppPage} from "./po/app.po";
import {AnimePage} from "./po/anime.po";

describe('anime chart lookups', () => {
  let seiyuu: SeiyuuPage;
  let page: AppPage;
  let EC = protractor.ExpectedConditions;
  let to = 5000;

  beforeEach(() => {
    seiyuu = new SeiyuuPage();
    page = new AppPage();
    AppPage.navigateTo();
    browser.wait(()=>page.statusBar().getText(), to);
  });

  it('should toggle between anime list and chart w/o extra requests for 2 seiyuu', () => {
     browser.get('/#/anime/578,53');
     expect((new AnimePage()).rolesTable().isDisplayed()).toBeTruthy();
     expect(element(by.css('#chart')).isPresent()).toBeFalsy();
     expect(page.statusBar().getText()).toContain('shared anime found');

     browser.manage().logs().get('browser')
       .then(browserLog => {
         expect(browserLog.filter(event => event.message.includes('Anime requested')).length).toBeLessThanOrEqual(2);
       });

     page.toggleChart().click();
     browser.wait(EC.presenceOf(element(by.css('#chart'))), to);
     expect((new AnimePage()).rolesTable().isDisplayed()).toBeFalsy();
     expect(element(by.css('#chart')).isDisplayed()).toBeTruthy();
     expect(element(by.css('.legend')).isDisplayed()).toBeTruthy();
     expect(page.statusBar().getText()).toBe('highlight a seiyuu to view their characters on anime hover');

     browser.manage().logs().get('browser')
       .then(browserLog => {
         expect(browserLog.filter(event => event.message.includes('Anime requested')).length).toBe(0);
       });
  });

  it('should be unavailable for a single seiyuu', () => {
    browser.get('/#/anime/578');
    expect(page.toggleChart().isDisplayed()).toBeTruthy();

    expect(page.toggleChart().getAttribute("title")).toBeTruthy();
    page.toggleChart().$('label').click().then(
      () => {
        fail("Element should not be clickable for Observer");
      },
      (err) => {
        expect(err.message.toString()).toBeTruthy();
      });
  });

  it('should become available with 2+ seiyuu', () => {
    browser.get('/#/anime/578,578000');
    expect(page.toggleChart().isDisplayed()).toBeTruthy();

    expect(page.toggleChart().getAttribute("title")).toBeFalsy();
    page.toggleChart().$('label').click().then(
      () => {
      },
      (err) => {
        expect(err.message.toString()).toBeFalsy();
      });
  });

  it('should show anime for multiple seiyuu, switching roles on hover', () => {
    browser.get('/#/anime/81,53');

    page.toggleChart().click();
    browser.wait(EC.presenceOf(element(by.css('#chart'))), to);

    expect(element.all(by.css('#chart .cell')).count()).toBe(4);
    expect(element.all(by.css('#chart .cell.c1-1 > a')).count()).toBe(10);
    expect(element.all(by.css('#chart .cell > a')).count()).toBe(10);

    page.searchInput().sendKeys('Koshimizu Ami');
    browser.wait(EC.presenceOf( seiyuu.panel('Koshimizu Ami').photo()), to);
    expect(element.all(by.css('#chart .cell')).count()).toBe(9);
    expect(element.all(by.css('#chart .cell > a')).count()).toBe(40);

    expect(element.all(by.css('.cell.c0-0 > a')).count()).toBe(6);
    expect(element.all(by.css('.cell.c0-1 > a')).count()).toBe(0);
    expect(element.all(by.css('.cell.c1-0 > a')).count()).toBe(3);
    expect(element.all(by.css('.cell.c1-2 > a')).count()).toBe(10);
    expect(element.all(by.css('.cell.c2-1 > a')).count()).toBe(11);
    expect(element.all(by.css('.cell.c2-2 > a')).count()).toBe(10);

    element(by.css('.cell.c1-0 > a')).getSize().then(({width}) => expect(width).toBeGreaterThan(40));

    expect(element(by.css('.cell.c1-0 > a')).getAttribute('title')).toContain('Lemon Angel Project');
    seiyuu.panel('Chihara Minori').container.click();
    expect(element(by.css('.cell.c1-0 > a')).getAttribute('title')).toContain('Campbell Erika');
    seiyuu.panel('Koshimizu Ami').container.click();
    expect(element(by.css('.cell.c1-0 > a')).getAttribute('title')).toContain('Yuuki Saya');
  });

  it('should switch away from chart when less than 2 seiyuu are selected', () => {
    browser.get('/#/anime/578,578000');
    page.toggleChart().click();
    browser.wait(EC.presenceOf(element(by.css('#chart'))), to);
    seiyuu.panel('Maeda Konomi').close().click();
    expect((new AnimePage()).rolesTable().isDisplayed()).toBeTruthy();
    expect(element(by.css('#chart')).isPresent()).toBeFalsy();
  });
});
