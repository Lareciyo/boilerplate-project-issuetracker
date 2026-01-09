const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

let testId;

suite('Functional Tests', function() {

  suite('POST /api/issues/{project}', function() {

    test('Create an issue with every field', function(done) {
      chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title',
          issue_text: 'Text',
          created_by: 'Tester',
          assigned_to: 'Dev',
          status_text: 'In QA'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.property(res.body, '_id');
          testId = res.body._id;
          done();
        });
    });

    test('Create an issue with only required fields', function(done) {
      chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Required',
          issue_text: 'Only',
          created_by: 'Tester'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          done();
        });
    });

    test('Create an issue with missing required fields', function(done) {
      chai.request(server)
        .post('/api/issues/test')
        .send({ issue_title: 'Missing' })
        .end(function(err, res) {
          assert.equal(res.body.error, 'required field(s) missing');
          done();
        });
    });
  });

  suite('GET /api/issues/{project}', function() {

    test('View issues on a project', function(done) {
      chai.request(server)
        .get('/api/issues/test')
        .end(function(err, res) {
          assert.isArray(res.body);
          done();
        });
    });

    test('View issues with one filter', function(done) {
      chai.request(server)
        .get('/api/issues/test')
        .query({ open: true })
        .end(function(err, res) {
          assert.isArray(res.body);
          done();
        });
    });

    test('View issues with multiple filters', function(done) {
      chai.request(server)
        .get('/api/issues/test')
        .query({ open: true, created_by: 'Tester' })
        .end(function(err, res) {
          assert.isArray(res.body);
          done();
        });
    });
  });

  suite('PUT /api/issues/{project}', function() {

    test('Update one field', function(done) {
      chai.request(server)
        .put('/api/issues/test')
        .send({ _id: testId, issue_title: 'Updated' })
        .end(function(err, res) {
          assert.equal(res.body.result, 'successfully updated');
          done();
        });
    });

    test('Update multiple fields', function(done) {
      chai.request(server)
        .put('/api/issues/test')
        .send({ _id: testId, issue_text: 'Updated', status_text: 'Done' })
        .end(function(err, res) {
          assert.equal(res.body.result, 'successfully updated');
          done();
        });
    });

    test('Update with missing _id', function(done) {
      chai.request(server)
        .put('/api/issues/test')
        .send({ issue_title: 'Fail' })
        .end(function(err, res) {
          assert.equal(res.body.error, 'missing _id');
          done();
        });
    });

    test('Update with no fields to update', function(done) {
      chai.request(server)
        .put('/api/issues/test')
        .send({ _id: testId })
        .end(function(err, res) {
          assert.equal(res.body.error, 'no update field(s) sent');
          done();
        });
    });

    test('Update with invalid _id', function(done) {
      chai.request(server)
        .put('/api/issues/test')
        .send({ _id: 'badid', issue_title: 'Fail' })
        .end(function(err, res) {
          assert.equal(res.body.error, 'could not update');
          done();
        });
    });
  });

  suite('DELETE /api/issues/{project}', function() {

    test('Delete an issue', function(done) {
      chai.request(server)
        .delete('/api/issues/test')
        .send({ _id: testId })
        .end(function(err, res) {
          assert.equal(res.body.result, 'successfully deleted');
          done();
        });
    });

    test('Delete with invalid _id', function(done) {
      chai.request(server)
        .delete('/api/issues/test')
        .send({ _id: 'badid' })
        .end(function(err, res) {
          assert.equal(res.body.error, 'could not delete');
          done();
        });
    });

    test('Delete with missing _id', function(done) {
      chai.request(server)
        .delete('/api/issues/test')
        .send({})
        .end(function(err, res) {
          assert.equal(res.body.error, 'missing _id');
          done();
        });
    });
  });
});
