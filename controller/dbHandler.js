'use strict';

const ObjectId = require('mongodb').ObjectId;

// Threads OPs

function createThread(db, board, text, deletePwd) {
  const now = new Date();
  const newThread = {
    text,
    delete_password: deletePwd,
    created_on: now,
    bumped_on: now,
    reported: false,
    replies: []
  };

  return db.collection(board).insertOne(newThread);
}

module.exports.createThread = createThread;

function getRecentThreads(db, board) {
  return db.collection(board).aggregate([
    { $limit: 10 },
    { $sort: { bumped_on: -1 } },
    { $project: {
      reported: 0,
      delete_password: 0,
      'replies.reported': 0,
      'replies.delete_password': 0
    }},
    { $addFields: { 
      replycount: { $size: '$replies' },
      replies: { $slice: [ '$replies', -3 ] }
    }}
  ]).toArray();
}

module.exports.getRecentThreads = getRecentThreads;

function deleteThread(db, board, threadId, deletePwd) {
  return db.collection(board).findOneAndDelete({
    _id: ObjectId(threadId),
    delete_password: deletePwd
  });
}

module.exports.deleteThread = deleteThread;

function reportThread(db, board, threadId) {
  return db.collection(board).updateOne({
    _id: ObjectId(threadId)
  }, {
    $set: { reported: true }
  });
}

module.exports.reportThread = reportThread;

// Replies OPs

function createReply(db, board, threadId, text, deletePwd) {
  const now = new Date();
  const newReply = {
    _id: new ObjectId(),
    text,
    created_on: now,
    delete_password: deletePwd,
    reported: false
  };
    
  return db.collection(board).updateOne({
    _id: ObjectId(threadId)
  }, {
    $push: { replies: newReply }
  });
}

module.exports.createReply = createReply;

function getReplies(db, board, threadId) {
  return db.collection(board).findOne({
    _id: ObjectId(threadId)
  }, {
    fields: {
      reported: 0,
      delete_password: 0,
      'replies.reported': 0,
      'replies.delete_password': 0
    }
  });
}

module.exports.getReplies = getReplies;

function deleteReply(db, board, threadId, replyId, delPwd) {
  return db.collection(board).updateOne({
    _id: ObjectId(threadId),
    replies: {
      $elemMatch: {
        _id: ObjectId(replyId),
        delete_password: delPwd
      }
    }
  }, {
    $set: { 'replies.$.text': '[deleted]' }
  });
}

module.exports.deleteReply = deleteReply;

function reportReply(db, board, threadId, replyId) {
  return db.collection(board).updateOne({
    _id: ObjectId(threadId),
    'replies._id': ObjectId(replyId)
  }, {
    $set: { 'replies.$.reported': true }
  });
}

module.exports.reportReply = reportReply;
