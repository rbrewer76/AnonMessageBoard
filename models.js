const mongoose = require("mongoose")
const Schema   = mongoose.Schema

const boardSchema = Schema({
//  _id: Schema.Types.ObjectId,
  name: {
    required: true,
    type: String, 
    trim: true,
    min: 5,
    max: 50
  },
  threads: [{type: Schema.Types.ObjectId, ref: 'Thread'}]
})


const threadSchema = Schema({
//  _id: Schema.Types.ObjectId,
  text: {
    required: true,
    type: String, 
    trim: true,
    min: 5,
    max: 100
  },
  deletepassword_: {
    required: true,
    type: String, 
    trim: true,
    min: 5,
    max: 10    
  },
  createdon_: { 
    type: Date, 
    default: Date.now
  },
  bumpedon_: { 
    type: Date, 
    default: Date.now
  },
  reported: {
    type: Boolean, 
    default: false
  },
  replies: [{type: Schema.Types.ObjectId, ref: 'Reply'}]
})


const replySchema = Schema({
//  _id: Schema.Types.ObjectId,
  text: {
    required: true,
    type: String, 
    trim: true,
    min: 5,
    max: 100
  },
  deletepassword_: {
    required: true,
    type: String, 
    trim: true,
    min: 5,
    max: 10    
  },
  createdon_: { 
    type: Date, 
    default: Date.now
  },
  reported: {
    type: Boolean, 
    default: false
  } 
})


const Board = mongoose.model("board", boardSchema)
const Thread = mongoose.model("thread", threadSchema)
const Reply = mongoose.model("reply", replySchema)

module.exports = {Board, Thread, Reply}