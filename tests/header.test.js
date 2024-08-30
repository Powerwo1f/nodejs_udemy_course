const puppeteer = require('puppeteer');
const sessionFactory = require('./factories/session.factory');
const userFactory = require('./factories/user.factory');

let browser, page;

beforeEach(async () => {
    browser = await puppeteer.launch({
        headless: false,
    });
    page = await browser.newPage();
    await page.goto('http://localhost:3000');
});

afterEach(async () => {
    await browser.close();
});

test('Header has the correct text', async () => {
    const text = await page.$eval('a.brand-logo', el => el.innerHTML);

    expect(text).toEqual('Blogster');
});

test('Clicking on login starting OAuth flow', async () => {
    await page.click('.right a');

    const url = await page.url();

    expect(url).toMatch(/accounts\.google\.com/);
});

test('When signed in, shows logout button', async () => {
    await page.login();

    const user = await userFactory();
    const {session, sig} = sessionFactory(user);

    await page.setCookie({ name:  'session', value: session});
    await page.setCookie({ name:  'session.sig', value: sig});
    await page.goto('http://localhost:3000');
    await page.waitFor('a[href="/auth/logout"]');

    const text = await page.$eval('a[href="/auth/logout"]', el => el.innerHTML);
    expect(text).toEqual('Logout');
});