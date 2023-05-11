const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reportedposts_schema = new Schema(
  {
    // first_name: { type: String, required: [true, "must be entered"] },
    // second_name: { type: String },
    // age: { type: Number,required:[true] },
    // contact: { type: Number,required:[true] },
    username: { type: String },
    email: { type: String },
    postid: { type: String },
    // password: { type: String, required: [true, "must be entered"] },
    comments: [{ text: { type: String }, username: { type: String } }],
    upvotes: { type: Number },
    downvotes: { type: Number },
    topic: { type: String },
    Name: { type: String },
    content: { type: String },
    banned_keywords: { type: String },
    tags: { type: Array },
    concern: { type: String },
    reportedtext: { type: String },
    reportedby: { type: String },
    date: { type: Date },
    ignored: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const reportedposts = new mongoose.model("reportedposts", reportedposts_schema);
module.exports = reportedposts;
