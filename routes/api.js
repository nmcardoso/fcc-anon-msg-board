/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
const MongoClient = require('mongodb').MongoClient;

const dbHandler = require('../controller/dbHandler');

const CONN_STR = process.env.MLAB_URI;

module.exports = function (app) {
  
  app.route('/api/threads/:board')
    .get((req, res) => {
      const board = req.params.board;
      
      MongoClient.connect(CONN_STR, async (err, db) => {
        try {
          let r = await dbHandler.getRecentThreads(db, board);
          res.json(r);
        } catch(e) {
          console.log(e);
        }
      })
    })
    .post((req, res) => {
      const board = req.params.board;
      const text = req.body.text;
      const delPwd = req.body.delete_password;
    
      MongoClient.connect(CONN_STR, async (err, db) => {
        try {
          let r = await dbHandler.createThread(db, board, text, delPwd);
          //console.log(r);
        } catch(e) {
          console.log(e);
        }
        
        res.redirect(`/b/${board}/`);
        
        db.close();
      });
    })
    .put((req, res) => {
      const board = req.params.board;
      const threadId = req.body.thread_id;
    
      MongoClient.connect(CONN_STR, async (err, db) => {
        try {
          let r = await dbHandler.reportThread(db, board, threadId);
          
          let txt;
          if (r.modifiedCount === 1) txt = 'success';
          else txt = 'fail';
          
          res.status(200).type('text').send(txt);
        } catch(e) {
          console.log(e);
        }
        
        db.close();
      });
    })
    .delete((req, res) => {
      const board = req.params.board;
      const threadId = req.body.thread_id;
      const delPwd = req.body.delete_password;
    
      MongoClient.connect(CONN_STR, async (err, db) => {
        try {
          let r = await dbHandler.deleteThread(db, board, threadId, delPwd);
          
          let txt;
          if (r.value) txt = 'success';
          else txt = 'incorrect password';
          
          res.status(200).type('text').send(txt);
        } catch(e) {
          console.log(e);
        }
        
        db.close();
      })
    });
    
  app.route('/api/replies/:board')
    .get((req, res) => {
      const board = req.params.board;
      const threadId = req.query.thread_id;
    
      MongoClient.connect(CONN_STR, async (err, db) => {
        try {
          let r = await dbHandler.getReplies(db, board, threadId);
          res.json(r);
        } catch(e) {
          console.log(e);
        }
        
        db.close();
      });
    })
    .post((req, res) => {
      const board = req.params.board;
      const text = req.body.text;
      const threadId = req.body.thread_id;
      const delPwd = req.body.delete_password;
    
      MongoClient.connect(CONN_STR, async (err, db) => {
        try {
          let r = await dbHandler.createReply(db, board, threadId, text, delPwd);
          //console.log(r);
        } catch(e) {
          console.log(e);
        }
        
        res.redirect(`/b/${board}/${threadId}`);
        
        db.close();
      });
    })
    .put((req, res) => {
      const board = req.params.board;
      const threadId = req.body.thread_id;
      const replyId = req.body.reply_id;
    
      MongoClient.connect(CONN_STR, async (err, db) => {
        try {
          let r = await dbHandler.reportReply(db, board, threadId, replyId);
          
          let txt;
          if (r.modifiedCount === 1) txt = 'success';
          else txt = 'fail';
          
          res.status(200).type('text').send(txt);
        } catch(e) {
          console.log(e);
        }
      });
    })
    .delete((req, res) => {
      const board = req.params.board;
      const threadId = req.body.thread_id;
      const replyId = req.body.reply_id;
      const delPwd = req.body.delete_password;
    
      MongoClient.connect(CONN_STR, async (err, db) => {
        try {
          let r = await dbHandler.deleteReply(db, board, threadId, replyId, delPwd);
          
          let txt;
          if (r.modifiedCount === 1) txt = 'success';
          else txt = 'incorrect password';
          
          res.status(200).type('text').send(txt);
        } catch(e) {
          console.log(e);
        }
      });
    });

};
