/*
*
*
*       Complete the API routing below
*
*
*/

'use strict'

const expect = require('chai').expect
const mongoose = require("mongoose")
const ObjectId = require("mongodb").ObjectId
const {Board, Thread, Reply} = require("../models.js")

mongoose.connect(process.env.MONGO_URI, { useFindAndModify: false, useNewUrlParser: true ,  useUnifiedTopology: true })

module.exports = function(app) {
  
  app.route('/api/boards/')
    // Return a list of boards
    .get((req, res) => {
      Board.find({}).select(["-__v", "-threads"]).then(data => {
        res.json(data)
      })
    })
  
  
  app.route('/api/threads/:board')
    .get((req, res) => {
      // Return a list of 10 most recent bumped threads and 3 most recent replies for each
      Board.aggregate([
        {$match: {name: req.params.board}},
        {$lookup: {
          localField: "threads",
          from: "threads",
          foreignField: "_id",
          as: "threads",
        }},
        {$unwind: "$threads"},        
        {$lookup: {
          localField: "threads.replies",
          from: "replies",
          foreignField: "_id",
          as: "threads.replies"
        }},
        {$project: {
          __v: 0,
          threads: {
            reported: 0,
            deletepassword_: 0,
            __v: 0,
            replies: {
              reported: 0,
              deletepassword_: 0,
              __v: 0,              
            }
          }
        }}        
      ])
      .exec((err, results) => {
        JSON.parse(JSON.stringify(results))
          if (Object.keys(results).length === 0)
            res.json("No Threads found")        
          else {
            // Sort threads by most recent bumped and return max of 10
            results.sort((a, b) => b.threads.bumpedon_ - a.threads.bumpedon_)  
            let modifiedResults = results.slice(0, 10)
            modifiedResults = modifiedResults.map(x => x.threads)
            modifiedResults.map(x => {
              // Sort replies by most recent and limit to 3
              x.replies.sort((a, b) => b.createdon_ - a.createdon_)  
              // FreeCodeCamp version is limit 3
              //  x.replies = x.replies.slice(0, 3)              
              x.replies = x.replies.slice(0, 10)                            
              return x
            })            

            res.json(modifiedResults) 
          }
      })
    })
  
  
    .post((req, res) => {
      const boardName = req.params.board
      // Create and save the thread
      const newThread = new Thread({
        text: req.body.text,
        deletepassword_: req.body.delete_password
      })
      newThread.save().then(data => res.json(data)).catch((err) => res.json({error: err}))
          
      // Search for board, if it doesn't exist make it
      Board.findOne({name: boardName}).then(data => {
        if (data === null) {
          const newBoard = new Board({name: boardName})
          newBoard.save().then(data => {
            data.threads.push(newThread)
            data.save().then().catch((err) => res.json({error: err}))            
          }).catch((err) => res.json({error: err}))
        }
        else {
          // Board found, add the thread
          data.threads.push(newThread)
          data.save().then().catch((err) => res.json({error: err}))
        }        
      })
    })

  
    .put((req, res) => {
      Thread.findByIdAndUpdate(req.body.thread_id, {$set: {reported: true }}).then(data => {
        if (data === null) 
          res.json("Cannot find thread to report")
        else   
          res.json("success")
      }).catch((err) => res.json(err))
    })
    
        
    .delete(async (req, res) => {
      // First check that specified board contains the thread  
      const returnedBoard = await Board.findOne({name: req.params.board, threads: req.body.thread_id}).then(data => data)
      if (returnedBoard) {
        // It does, so delete the thread if password matches
        Thread.findOneAndDelete({_id: req.body.thread_id, deletepassword_: req.body.delete_password})
          .then(data => {
            if (data === null)          
              res.json("incorrect password")
            else {
              //Then delete all replies to the thread
              data.replies.map(reply => Reply.deleteOne({_id: reply}, (err, data) => {if(err) res.json(err)})
              )
              // Then delete the refence to the thread on the board
              Board.findOneAndUpdate({name: req.params.board},
                {$pull: {threads: req.body.thread_id}})
                .catch((err) => res.json(err))
 
              res.json("success")
            }
          })
      }
      else
        res.json("Thread not found on board.")
    })         
  
    
  app.route('/api/replies/:board')
    .get((req, res) => {
      if(!req.query.thread_id)
        return res.json("No thread_id specified")

      Board.findOne({name: req.params.board, threads: req.query.thread_id}).then(data => {
        if (data === null) 
          res.json("Board and thread do not exist")
        else {
          Thread.aggregate([
            {$match: {"_id": ObjectId(req.query.thread_id)}},
            {$lookup: {
              localField: "replies",
              from: "replies",
              foreignField: "_id",
              as: "replies"
            }},
            {$project: {
              reported: 0,
              deletepassword_: 0,
              __v: 0,
              replies: {
                reported: 0,
                deletepassword_: 0,
                __v: 0
              }
            }} 
          ])
          .exec((err, results) => {
            JSON.parse(JSON.stringify(results))
            if (Object.keys(results).length === 0)
              res.json("No replies found")        
            else
              res.json(results[0]) 
          })
        }
      }) 
    }) 
  
      
    .post((req, res) => {
      const boardName = req.params.board
      // First check for Board
      Board.findOne({name: boardName, threads: req.body.thread_id}).then(data => {
        if (data === null) 
          res.json("Board and thread do not exist")
        else {
          // bump the thread and save the reply
          Thread.findOneAndUpdate({_id: req.body.thread_id}, {bumpedon_: new Date()}, {new: true}).then(data => {
            if (data === null) 
              res.json("Thread not found")
            else {            
              // Board and Thread found, save the reply
              const newReply = new Reply({
                text: req.body.text,
                deletepassword_: req.body.delete_password                
              })
              newReply.save().then(data => res.json(data)).catch((err) => res.json({error: err}))        
              data.replies.push(newReply)
              data.save().then().catch((err) => res.json({error: err}))
            }
          }).catch((err) => res.json(err))      
        }
      }).catch((err) => res.json(err))
    })
  
        
    .put((req, res) => {
      Reply.findByIdAndUpdate(req.body.reply_id, {$set: {reported: true }}).then(data => {
        if (data === null) 
          res.json("Cannot find reply to report")
        else   
          res.json("success")
      }).catch((err) => res.json(err))
    })
  
        
    .delete((req, res) => {
      // Change the text of a reply to [deleted]
      Reply.findOneAndUpdate({_id: req.body.reply_id, deletepassword_: req.body.delete_password}, {$set: {text: "[deleted]" }}).then(data => {
        if (data === null) 
          res.json("incorrect password")
        else   
          res.json("success")
      }).catch((err) => res.json(err))      
    })

}
