import { AppPage } from './app.po';
import {$, browser, by, protractor} from "protractor";

describe('my-seiyuu-list App', () => {
  let page: AppPage;
  let EC = protractor.ExpectedConditions;

  beforeEach(() => {
    page = new AppPage();
    AppPage.navigateTo();
  });

  it('should display document title', () => {
    browser.getTitle().then(title => {
      expect(title).toBe('My Seiyuu List')
    });
  });

  it('should unlock input, hide spinner and display stats upon loading', () => {
    expect(page.searchInput().isEnabled()).toBeTruthy();
    expect(page.statusBar().getText()).toBeTruthy();
    expect(page.searchSpinner().isPresent()).toBeFalsy();
  });

  fit('should toggle disqus when clicked', () => {
    expect(page.disqusContainer().isDisplayed()).toBeFalsy();
    page.toggleDisqus().click();
    browser.wait(EC.visibilityOf(page.disqusContainer()), 5000);
    expect(page.disqusContainer().$('iframe').isPresent()).toBeTruthy();
    page.toggleDisqus().click();
    expect(page.disqusContainer().isDisplayed()).toBeFalsy();
  });

});
