import { protractor, browser, by, element} from "protractor";
import {SeiyuuPage} from "./seiyuu.po";
import {AppPage} from "./app.po";

describe('seiyuu lookups', () => {
  let seiyuu: SeiyuuPage;
  let page: AppPage;
  let EC = protractor.ExpectedConditions;
  let cm = 'Chihara Minori';
  let mk = 'Maeda Konomi';
  let dj = 'Davidyuk Jenya';
  let to = 10000;

  beforeEach(() => {
    seiyuu = new SeiyuuPage();
    page = new AppPage();
    AppPage.navigateTo();
    browser.wait(()=>page.statusBar().getText(), to);
  });

  it('should display dropdown list', () => {
    expect(page.searchInput().getAttribute('list')).toBeFalsy();
    page.searchInput().sendKeys('Chi');
    expect(page.searchInput().getAttribute('list')).toBeTruthy();
    expect(page.listOption(cm).isPresent()).toBeTruthy();
  });

  it('should display error on failed search', () => {
    page.searchInput().sendKeys('derp\n');
    expect(page.statusBar().getText()).toBe('"derp" is not found');
  });

  it('should find seiyuu by full name', () => {
    expect(seiyuu.containers().count()).toBeFalsy();
    page.searchInput().sendKeys(cm);
    expect(seiyuu.containers().count()).toBe(1);
    expect(browser.getTitle()).toBe(`My Seiyuu List - ${cm}`)
  });

  it('should show photo upon seiyuu loading', () => {
    page.searchInput().sendKeys(cm);
    let panel = seiyuu.panel(cm);
    expect(panel.container.isPresent()).toBeTruthy();
    expect(panel.photo().isPresent()).toBeTruthy();
  });

  it('should add another seiyuu', () => {
    page.searchInput().sendKeys(cm);
    let panel = seiyuu.panel(cm);
    expect(panel.container.isPresent()).toBeTruthy();

    let name = 'Koshimizu Ami';
    page.searchInput().sendKeys(name);
    let panel2 = seiyuu.panel(name);
    expect(panel2.container.isPresent()).toBeTruthy();
    expect(seiyuu.containers().count()).toBe(2);
    expect(browser.getTitle()).toBe(`My Seiyuu List - ${cm}, ${name}`)
  });

  it('should prevent selecting duplicates', () => {
    expect(seiyuu.containers().count()).toBeFalsy();
    page.searchInput().sendKeys(cm.toLowerCase());
    expect(seiyuu.containers().count()).toBe(1);
    page.searchInput().sendKeys(`derp\n`);
    page.searchInput().sendKeys(` ${cm} \n`);
    expect(seiyuu.containers().count()).toBe(1);
    expect(page.statusBar().getText()).toBe(`"${cm}" is already selected`);
  });

  it('should remove a seiyuu', () => {
    page.searchInput().sendKeys(cm);
    let panel = seiyuu.panel(cm);
    expect(panel.container.isPresent()).toBeTruthy();
    panel.close().click();
    expect(panel.container.isPresent()).toBeFalsy();
    expect(browser.getTitle()).toBe('My Seiyuu List')
  });

  it('should find namesakes by name', () => {
    expect(seiyuu.containers().count()).toBeFalsy();
    page.searchInput().sendKeys(mk.toLowerCase());
    let panel = seiyuu.panel(mk, true);
    expect(seiyuu.containers().count()).toBe(1);
    expect(browser.getTitle()).toBe('My Seiyuu List');
    browser.wait(EC.presenceOf( panel.picks().get(0)), to);
    expect( panel.picks().count()).toBe(2);
    expect( panel.picks().get(0).$('img').isPresent()).toBeTruthy();
  });

  it('should pick a namesake from the list', () => {
    page.searchInput().sendKeys(mk);
    let panel = seiyuu.panel(mk, true);
    browser.wait(EC.presenceOf( panel.picks().get(0)), to);
    panel.picks().get(0).click();
    expect(seiyuu.containers().count()).toBe(1);
    expect(seiyuu.panel(mk, false).photo().isPresent()).toBeTruthy();
  });

  it('should allow a list of namesakes along with a selected seiyuu from it', () => {
    page.searchInput().sendKeys(mk);
    let panel = seiyuu.panel(mk, true);
    browser.wait(EC.presenceOf( panel.picks().get(0)), to);
    panel.picks().get(0).click();
    expect(seiyuu.containers().count()).toBe(1);
    page.searchInput().sendKeys('derp\n');
    page.searchInput().sendKeys(mk);
    browser.wait(EC.presenceOf( seiyuu.containers().get(1).$('.pick')), to);
    expect(seiyuu.containers().get(1).getAttribute('className')).toContain('namesake');
  });

  it('should remove seiyuu and namesakes separately', () => {
    page.searchInput().sendKeys(mk);
    let panel = seiyuu.panel(mk, true);
    browser.wait(EC.presenceOf( panel.picks().get(0)), to);
    panel.picks().get(0).click();

    page.searchInput().clear();
    page.searchInput().sendKeys(dj);
    browser.wait(EC.presenceOf( seiyuu.panel(dj, true).picks().get(0)), to);
    seiyuu.panel(dj, true).picks().get(0).click();

    page.searchInput().clear();
    page.searchInput().sendKeys(mk);
    browser.wait(EC.presenceOf( seiyuu.panel(mk, true).picks().get(0)), to);
    let mk1 = seiyuu.containers().get(0);
    let mk2 = seiyuu.containers().get(2);
    mk2.$('.close').click();
    expect(mk2.isPresent()).toBeFalsy();
    expect(mk1.isPresent()).toBeTruthy();

    page.searchInput().clear();
    page.searchInput().sendKeys(dj);
    browser.wait(EC.presenceOf( seiyuu.panel(dj, true).picks().get(0)), to);
    let dj1 = seiyuu.containers().get(1);
    let dj2 = seiyuu.containers().get(2);
    dj1.$('.close').click();
    expect(seiyuu.panel(dj, false).container.isPresent()).toBeFalsy();
    expect(seiyuu.panel(dj, true).container.isPresent()).toBeTruthy();
  });

  it('should prevent selecting duplicates from namesakes', () => {
    page.searchInput().sendKeys(mk);
    let panel = seiyuu.panel(mk, true);
    browser.wait(EC.presenceOf( panel.picks().get(0)), to);
    panel.picks().get(0).click();

    page.searchInput().clear();
    page.searchInput().sendKeys('derp\n');
    page.searchInput().sendKeys(mk);
    panel = seiyuu.panel(mk, true);
    browser.wait(EC.presenceOf( panel.picks().get(0)), to);
    panel.picks().get(0).click();
    expect(element.all(by.css('.seiyuu:not(.namesake)')).count()).toBe(1);
    expect(page.statusBar().getText()).toBe(`"${mk}" is already selected`);
  });

  it('should limit selections to 4', () => {
    page.searchInput().sendKeys('Mizuki Nana');
    page.searchInput().sendKeys('Koshimizu Ami');
    page.searchInput().sendKeys(cm);
    page.searchInput().sendKeys(dj);

    expect(page.statusBar().getText()).toBeFalsy();
    expect(seiyuu.containers().count()).toBe(4);
    page.searchInput().sendKeys(mk);
    expect(seiyuu.containers().count()).toBe(4);
    expect(page.statusBar().getText()).toBe('maximum of 4 people are allowed');
  });
});
