const Browser = require('zombie');
const assert = require('assert');


// Browser.localhost('localhost', 3000);
describe('Can access main page and dummy', function() {
    const browser = new Browser();
    before(function() {
        return browser.visit('http://localhost:3000');
    });

    describe('main page', function() {
        it('should be successful', function() {
            browser.assert.success();
        });
        it('should see welcome page', function() {
            browser.assert.text('title', 'Express');
            browser.assert.text('h1', 'Express');
        });
    });

    describe('dummy', function() {
        it('should have 404 error', function(done) {
            browser.visit('http://localhost:3000/applicants', function () {
                assert.equal(browser.errors.length, 1);
                done()
            });
        });
    });
});

Browser.localhost('api.localhost', 3000);
describe('Can access API main page and some endpoint', function() {
    const browser = new Browser();
    before(function(done) {
        browser.visit('', done);
    });

    describe('main page', function() {
        it('should be successful', function() {
            browser.assert.success();
        });
        it('should see welcome page', function() {
            browser.assert.text('h1', 'API reference');
        });
    });

    describe('endpoint', function() {
        before(function(done) {
            browser.visit('/applicants', done);
        });
        it('should be successful', function() {
            browser.assert.success();
        });
        it('should receive some json object', function() {
            browser.assert.text('body', /{.*}/);
        });
    });
});