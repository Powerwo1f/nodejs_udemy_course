const Page = require('./helpers/page');

describe('When logged in', async () => {
    let page;

    beforeEach(async () => {
        page = await Page.build();
        await page.goto('http://localhost:3000');
    });

    afterEach(async () => {
        await page.close();
    });

    test('can see blog create form', async () => {
        await page.login();
        await page.click('a.btn-floating');
        const label = await page.getContentsOf('form label');
        expect(label).toEqual('Blog Title');
    });
});
