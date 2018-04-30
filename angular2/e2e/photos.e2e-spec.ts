
import {browser, by, element, protractor} from "protractor";
import {PhotoPage} from "./photos.po";
import {AppPage} from "./app.po";
import {SeiyuuPage} from "./seiyuu.po";

describe('photo lookups', () => {
  let page: PhotoPage;
  let app: AppPage;
  let seiyuu: SeiyuuPage;
  let EC = protractor.ExpectedConditions;

  beforeEach(() => {
    page = new PhotoPage();
    app = new AppPage();
    seiyuu = new SeiyuuPage();
    PhotoPage.navigateTo();
  });

  it('should load photo when a seiyuu is selected from photo page', () => {
    let name = 'Chihara Minori';
    app.searchInput().sendKeys(name);
    let panel = seiyuu.panel(name);
    browser.wait(EC.presenceOf(panel.photo()), 5000);
    browser.wait(EC.presenceOf(element(by.css('#thumbContainer > span.thumb'))), 5000);
    expect(page.thumbs().count()).toBeTruthy();
  });

});
