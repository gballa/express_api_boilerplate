/* eslint-disable no-undef */
const express = require('express'); // (npm install --save express)
const request = require('supertest');

function createApp() {
    app = express();

    var router = express.Router();
    router.route('/').get(function(req, res) {
        return res.json({goodCall: true});
    });

    app.use(router);

    return app;
}

describe('Our server', function() {
    var app;

    // Called once before any of the tests in this block begin.
    before(function(done) {
        app = createApp();
        app.listen(function(err) {
            if (err) { return done(err); }
            done();
        });
    });

    it('should send back a JSON object with goodCall set to true', function() {
        request(app)
            .get('/index')
            .set('Content-Type', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200, function(err, res) {
                if (err) { return done(err); }
                callStatus = res.body.goodCall;
                expect(callStatus).to.equal(true);
                // Done
                done();
            });
    });

});
