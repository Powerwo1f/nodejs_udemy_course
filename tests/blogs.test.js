const Page = require('./helpers/page');

let page;

beforeEach(async () => {
    page = await Page.build();
    await page.goto('http://localhost:3000');
});

afterEach(async () => {
    await page.close();
});

describe('When logged in', () => {

    beforeEach(async () => {
        await page.login();
        await page.click('a.btn-floating');
    });

    test('can see blog create form', async () => {
        const label = await page.getContentsOf('form label');
        expect(label).toEqual('Blog Title');
    });

    describe('And using valid inputs', () => {
        test('submitting takes user to review screen', async () => {
            await page.type('.title input', 'My Title');
            await page.type('.content input', 'My Content');
            await page.click('form button');

            const text = await page.getContentsOf('h5');
            expect(text).toEqual('Please confirm your entries');
        });

        test('submitting then saving adds blog to index page', async () => {
            await page.type('.title input', 'My Title');
            await page.type('.content input', 'My Content');
            await page.click('form button');
            await page.click('button.green');

            await page.waitFor('.card');

            const title = await page.getContentsOf('.card-title');
            const content = await page.getContentsOf('p');
            expect(title).toEqual('My Title');
            expect(content).toEqual('My Content');
        });
    });

    describe('And using invalid inputs', () => {
        beforeEach(async () => {
            await page.click('form button');
        });

        test('the form shows an error message', async () => {
            const titleError = await page.getContentsOf('.title .red-text');
            const ContentError = await page.getContentsOf('.content .red-text');
            expect(titleError).toEqual('You must provide a value');
            expect(ContentError).toEqual('You must provide a value');
        });
    });
});

describe('User is not logged in', () => {
    test('User cannot create blog posts', async () => {
       const result = await page.execRequest('POST', '/api/blogs', { title: 'My Title', content: 'My Content' });

       expect(result).toEqual({ error: 'You must log in!' });
    });

    test('User cannot get a list of posts', async () => {
        const result = await page.execRequest('GET', '/api/blogs');

        expect(result).toEqual({ error: 'You must log in!' });
    });
});
