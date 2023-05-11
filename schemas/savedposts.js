const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const savedsposts_schema = new Schema(
  {
    // first_name: { type: String, required: [true, "must be entered"] },
    // second_name: { type: String },
    // age: { type: Number,required:[true] },
    // contact: { type: Number,required:[true] },
    user_email:{ type: String},
    username: { type: String},
    email: { type: String},
    // password: { type: String, required: [true, "must be entered"] },
    comments: [{text:{type:String},username:{type:String}}],
    upvotes: { type: Number },
    downvotes: { type: Number },
    topic:{type:String},
    Name: { type: String },
    content: { type: String },
    banned_keywords: { type: String },
    tags: { type: Array },
    upvoteusernames:{type:Array,default:[]},
    downvoteusernames:{type:Array,default:[]},
  },
  { timestamps: true }
);

const savedsposts = new mongoose.model("savedsposts", savedsposts_schema);
module.exports = savedsposts;
