import {browser, by, element, protractor} from "protractor";
import {PhotoPage} from "./photos.po";
import {AppPage} from "./app.po";
import {SeiyuuPage} from "./seiyuu.po";

describe('photo lookups', () => {
  let page: PhotoPage;
  let app: AppPage;
  let seiyuu: SeiyuuPage;
  let EC = protractor.ExpectedConditions;
  let to = 5000;

  beforeEach(() => {
    page = new PhotoPage();
    app = new AppPage();
    seiyuu = new SeiyuuPage();
    PhotoPage.navigateTo();
  });

  it('should load photo when a seiyuu is selected from photo page', () => {
    AppPage.navigateTo('#/photos/9673');
    let panel = seiyuu.panel('Davidyuk Jenya');
    browser.wait(EC.presenceOf(page.spinner()), to);
    browser.wait(EC.presenceOf(panel.photo()), to);
    browser.wait(EC.presenceOf(element(by.css('#thumbContainer > span.thumb'))), to);
    expect(page.thumbs().count()).toBeTruthy();
    expect(page.next().getAttribute('disabled')).toBeTruthy();
    expect(page.prev().getAttribute('disabled')).toBeTruthy();
    expect(page.page().getText()).toBe('0');
    expect(app.statusBar().getText()).toBe('1 image found');
    expect(page.more().getAttribute('href')).toBe('http://koe.booru.org/index.php?page=post&s=list&tags=~davidyuk_jenya');
  });

  it('should update list as seiyuu are added and removed', () => {
    let name = 'Chihara Minori';
    app.searchInput().sendKeys(name);
    let panel = seiyuu.panel(name);

    browser.wait(EC.presenceOf(element(by.css('#thumbContainer > span.thumb'))), to);
    expect(page.thumbs().count()).toBe(20);
    expect(page.next().getAttribute('disabled')).toBeFalsy();
    expect(page.more().isPresent()).toBeFalsy();

    let name2 = 'Koshimizu Ami';
    app.searchInput().clear();
    app.searchInput().sendKeys(name2);
    let panel2 = seiyuu.panel(name2);
    browser.wait(EC.presenceOf(page.spinner()), to);
    browser.wait(EC.presenceOf(panel2.photo()), to);
    expect(page.thumbs().count()).toBeLessThan(20);
    expect(page.next().getAttribute('disabled')).toBeTruthy();

    expect(app.statusBar().getText()).toContain('images found');
    expect(page.more().getAttribute('href')).toBe('http://koe.booru.org/index.php?page=post&s=list&tags=~chihara_minori+~koshimizu_ami');
    panel.close().click();
    expect(page.thumbs().count()).toBe(20);

    panel2.close().click();
    expect(page.thumbs().count()).toBe(0);
    expect(app.statusBar().getText()).toBe('');
  });

  it('should switch pages', () => {
    let name2 = 'Koshimizu Ami';
    let x = '0';
    let y = 0;
    app.searchInput().sendKeys(name2);
    let panel2 = seiyuu.panel(name2);
    browser.wait(EC.presenceOf(page.spinner()), to);
    browser.wait(EC.presenceOf(panel2.photo()), to);
    expect(page.next().getAttribute('disabled')).toBeFalsy();
    expect(page.prev().getAttribute('disabled')).toBeTruthy();

    app.statusBar().getText().then(count => x=count);
    page.page().getText().then(count => y=+count);
    expect(page.page().getText()).toBe('0');
    page.next().click();
    expect(page.page().getText()).toBeGreaterThan(y);
    page.page().getText().then(count => y=+count);
    expect(page.prev().getAttribute('disabled')).toBeFalsy();

    page.prev().click();
    expect(page.page().getText()).toBe('0');
    expect(page.spinner().isPresent()).toBeFalsy();

    page.next().click();
    page.next().click();
    expect(page.next().getAttribute('disabled')).toBeTruthy();
    expect( app.statusBar().getText() ).not.toBe(x); //not guaranteed

    expect(page.thumbs().get(0).$('a').getAttribute('target')).toBe('_blank');
  });

});
