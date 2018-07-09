/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  
  let testId1;
  let testId2;
  let testId3;
  let text = Math.floor(Math.random() * 100000);

  suite('API ROUTING FOR /api/threads/:board', function() {
    
    suite('POST', function() {
      test('Create 2 threads', function(done) {
        chai.request(server)
        .post('/api/threads/test')
        .send({
          text: text,
          delete_password: 'pwd'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.redirects.length, 1);
        });
        
        chai.request(server)
        .post('/api/threads/test')
        .send({
          text: text,
          delete_password: 'pwd'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.redirects.length, 1);
          
          done();
        });
      });
    });
    
    suite('GET', function() {
      test('Get last 10 threads with at most 3 replies each', function(done) {
        chai.request(server)
          .get('/api/threads/test')
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            assert.isAtMost(res.body.length, 10);
            assert.isObject(res.body[0]);
            assert.property(res.body[0], '_id');
            assert.property(res.body[0], 'text');
            assert.property(res.body[0], 'created_on');
            assert.property(res.body[0], 'bumped_on');
            assert.property(res.body[0], 'replies');
            assert.property(res.body[0], 'replycount');
            assert.notProperty(res.body[0], 'delete_password');
            assert.notProperty(res.body[0], 'reported');
            assert.isArray(res.body[0].replies);
            assert.isAtMost(res.body[0].replies.length, 3);
          
            testId1 = res.body[0]._id;
            testId2 = res.body[1]._id;
          
            done();
          });
      });
    });
    
    suite('DELETE', function() {
      test('Delete one thread with incorrect password', function(done) {
        chai.request(server)
          .delete('/api/threads/test')
          .send({
            thread_id: testId1,
            delete_password: 'wrong_pwd'
          })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'incorrect password');
          
            done();
          });
      });
      
      test('Delete one thread with correct password', function(done) {
        chai.request(server)
          .delete('/api/threads/test')
          .send({
            thread_id: testId2,
            delete_password: 'pwd'
          })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'success');
          
            done();
          });
      });
    });
    
    suite('PUT', function() {
      test('Report one thread', function(done) {
        chai.request(server)
          .put('/api/threads/test')
          .send({
            thread_id: testId1,
          })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'success');
          
            done();
          });
      });
    });
    

  });
  
  suite('API ROUTING FOR /api/replies/:board', function() {
    
    suite('POST', function() {
      test('Seccessfully creates a reply', function(done) {
        chai.request(server)
          .post('/api/replies/test')
          .send({
            thread_id: testId1,
            text: text,
            delete_password: 'pwd'
          })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.redirects.length, 1);
          
            done();
          });
      })
    });
    
    suite('GET', function() {
      test('Get all replies of a thread', function(done) {
        chai.request(server)
          .get('/api/replies/test')
          .query({
            thread_id: testId1
          })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.isObject(res.body);
            assert.property(res.body, '_id');
            assert.property(res.body, 'text');
            assert.property(res.body, 'created_on');
            assert.property(res.body, 'bumped_on');
            assert.property(res.body, 'replies');
            assert.notProperty(res.body, 'reported');
            assert.notProperty(res.body, 'delete_password');
            assert.isArray(res.body.replies);
            assert.isAtLeast(res.body.replies.length, 1);
            assert.isObject(res.body.replies[0]);
            assert.property(res.body.replies[0], '_id');
            assert.property(res.body.replies[0], 'text');
            assert.property(res.body.replies[0], 'created_on');
            assert.notProperty(res.body.replies[0], 'delete_password');
            assert.notProperty(res.body.replies[0], 'reported');
          
            testId3 = res.body.replies[0]._id;
          
            done();
          });
      });
      
    });
    
    suite('PUT', function() {
      test('Successfully report a reply', function(done) {
        chai.request(server)
          .put('/api/replies/test')
          .send({
            thread_id: testId1,
            reply_id: testId3
          })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'success');

            done();
        });
      });
    });
    
    suite('DELETE', function() {
      test('Delete one reply with correct password', function(done) {
        chai.request(server)
          .delete('/api/replies/test')
          .send({
            thread_id: testId1,
            reply_id: testId3,
            delete_password: 'pwd'
          })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'success');
          
            done();
          });
      });
      
    });
    
  });

});
