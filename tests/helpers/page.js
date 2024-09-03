const puppeteer = require('puppeteer');
const sessionFactory = require('../factories/session.factory');
const userFactory = require('../factories/user.factory');

class CustomPage {
    static async build() {
        const browser = await puppeteer.launch({
            headless: true,
        });
        const page = await browser.newPage();
        const customPage = new CustomPage(page);

        return new Proxy(customPage, {
            get: function(target, property) {
                return customPage[property] || browser[property] || page[property];
            }
        });
    }

    constructor(page) {
        this.page = page;
    }

    async login() {
        const user = await userFactory();
        const {session, sig} = sessionFactory(user);

        await this.page.setCookie({ name:  'session', value: session});
        await this.page.setCookie({ name:  'session.sig', value: sig});
        await this.page.goto('http://localhost:3000/blogs');
        await this.page.waitFor('a[href="/auth/logout"]');
    }

    async getContentsOf(selector) {
        return this.page.$eval(selector, el => el.innerHTML);
    }

    execRequest(action, path, data = null) {
        return this.page.evaluate((_action, _path, _data) => {
            const options = {
                method: _action,
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json'
                }
            };

            if (_action === 'POST') {
                options.body = JSON.stringify(_data);
            }

            return fetch(_path, options).then(res => res.json());
        }, action, path, data);
    }
}

module.exports = CustomPage;

