const Page = require('./helpers/page');
require('../models/User');
require('../models/Blog');

let page;

beforeEach(async () => {
    page = await Page.build();
    await page.goto('http://localhost:3000');
});

afterEach(async () => {
    await page.close();
});

test('Header has the correct text', async () => {
    const text = await page.getContentsOf('a.brand-logo');

    expect(text).toEqual('Blogster');
});

test('Clicking on login starting OAuth flow', async () => {
    await page.click('.right a');

    const url = await page.url();

    expect(url).toMatch(/accounts\.google\.com/);
});

test('When signed in, shows logout button', async () => {
    await page.login()
    const text = await page.getContentsOf('a[href="/auth/logout"]');
    expect(text).toEqual('Logout');
});