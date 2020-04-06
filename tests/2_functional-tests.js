/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

const chaiHttp = require('chai-http')
const chai = require('chai')
const assert = chai.assert
const server = require('../server')

chai.use(chaiHttp)

suite('Functional Tests', () => {

  suite('API ROUTING FOR /api/threads/:board', () => {
    
    // track the id of a created thread so that it can be deleted
    let threadId
    
    suite('POST', () => {
      test('Test POST /api/threads/:board', done => {
        chai.request(server)
          .post('/api/threads/general')
          .send({
            text: 'a test post',
            delete_password: 'deleteme'
          })
          .end((err, res) => {
            assert.equal(res.status, 200)
            assert.property(res.body, '_id')          
            assert.property(res.body, 'text')
            assert.property(res.body, 'deletepassword_')
            assert.property(res.body, 'createdon_')                    
            assert.property(res.body, 'bumpedon_')  
            assert.property(res.body, 'replies')                    
            assert.property(res.body, 'reported')                    
            assert.isArray(res.body.replies)          
            threadId = res.body._id
            done()
          })
      })      
    })
    
    
    suite('GET', () => {
      test('Test GET /api/threads/:board', done => {
        chai.request(server)
          .get('/api/threads/general')
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.property(res.body[0], 'text')
            assert.property(res.body[0], 'createdon_')
            assert.property(res.body[0], 'bumpedon_')
            assert.property(res.body[0], 'replies')
            assert.isUndefined(res.body[0].reported)
            assert.isUndefined(res.body[0].deletepassword_)
            assert.isArray(res.body)
            assert.isArray(res.body[0].replies)          
            done()
          })
      })  
    })

    
    suite('PUT', () => {
      test('Test PUT /api/threads/:board', done => {
        chai.request(server)
          .put('/api/threads/general')
          .send({
            board: 'general',
            thread_id: threadId})
          .end((err, res) => {
            assert.equal(res.status, 200)
            assert.equal(res.text, '"success"')
            done()
          })   
      })
    })    
    
    
    suite('DELETE', () => {
      test('Test DELETE /api/threads/:board', done => {
        chai.request(server)
          .delete('/api/threads/general')
          .send({
            board: 'general',
            thread_id: threadId,
            delete_password: 'deleteme'})
          .end((err, res) => {
            assert.equal(res.status, 200)
            assert.equal(res.text, '"success"')
            done()
          })
      })     
    })
  })    

  
  suite('API ROUTING FOR /api/replies/:board', () => {
    
    // track the id of a created thread and reply so that they can be deleted    
    let threadId
    let replyId
    
    // Need a thread for a reply to be posted to
    suite('POST', () => {
      test('Test POST /api/threads/:board', done => {
        chai.request(server)
          .post('/api/threads/general')
          .send({
            text: 'a test post',
            delete_password: 'deleteme'
          })
          .end((err, res) => {
            assert.equal(res.status, 200)
            assert.property(res.body, '_id')          
            threadId = res.body._id
            done()
          })
      })      
    })
        
    
    suite('POST', () => {
      test('Test POST /api/replies/:board', done => {
        chai.request(server)
          .post('/api/replies/general')
          .send({
            thread_id: threadId,
            text: 'a test reply',
            delete_password: 'deleteme'
          })
          .end((err, res) => {
            assert.equal(res.status, 200)
            assert.property(res.body, '_id')          
            assert.property(res.body, 'text')
            assert.property(res.body, 'deletepassword_')
            assert.property(res.body, 'createdon_')                    
            assert.property(res.body, 'reported')
            replyId = res.body._id          
            done()
          })
      })
    })
    
    
    suite('GET', () => {
      test('Test GET /api/replies/:board', done => {
        chai.request(server)
          .get('/api/replies/general')
          .query({thread_id: threadId})
          .end((err, res) => {
            assert.equal(res.status, 200)
            assert.property(res.body, '_id')
            assert.property(res.body, 'text')
            assert.property(res.body, 'createdon_')
            assert.property(res.body, 'bumpedon_')             
            assert.isUndefined(res.body.reported)
            assert.isUndefined(res.body.deletepassword_)
            assert.isArray(res.body.replies)
            assert.property(res.body.replies[0], '_id')
            assert.property(res.body.replies[0], 'text')
            assert.property(res.body.replies[0], 'createdon_')          
            done()
          })
      })   
    })
   
    
    suite('PUT', () => {
      test('Test PUT /api/replies/:board', done => {
        chai.request(server)
          .put('/api/replies/general')
          .send({
            board: 'general',
            reply_id: replyId})
          .end((err, res)=>  {
            assert.equal(res.status, 200)
            assert.equal(res.text, '"success"')
            done()
          })
      })    
    })
    
    
    suite('DELETE', () => {
      test('Test DELETE /api/replies/:board', done => {
        chai.request(server)
          .delete('/api/replies/general')
          .send({
            board: 'general',
            thread_id: threadId, 
            reply_id: replyId, 
            delete_password: 'deleteme'})
          .end((err, res) => {
            assert.equal(res.status, 200)
            assert.equal(res.text, '"success"')
            done()
          })
      })  
    })
    
    
    suite('DELETE', () => {
      test('Test DELETE /api/threads/:board', done => {
        chai.request(server)
          .delete('/api/threads/general')
          .send({
            board: 'general',
            thread_id: threadId,
            delete_password: 'deleteme'})
          .end((err, res) => {
            assert.equal(res.status, 200)
            assert.equal(res.text, '"success"')
            done()
          })
      })     
    })    

  })

})
