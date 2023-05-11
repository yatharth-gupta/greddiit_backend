const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const follow_schema = new Schema(
  {
    username: { type: String, required: [true], unique: true },
    email: { type: String, required: [true, "must be entered"], unique: true },
    followers: { type: Array ,"default" :[],items: { type: 'string', uniqueItems: true }},
    following: { type: Array, "default": [],items: { type: 'string', uniqueItems: true } },
  },
  { timestamps: true }
);

const follow = new mongoose.model("follow", follow_schema);
module.exports = follow;
