const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const signup_schema = new Schema(
  {
    first_name: { type: String, required: [true, "must be entered"] },
    second_name: { type: String },
    age: { type: Number,required:[true] },
    contact: { type: Number,required:[true] },
    username: { type: String,required:[true] ,unique:true},
    email: { type: String, required: [true, "must be entered"] ,unique:true},
    password: { type: String, required: [true, "must be entered"] },
  },
  { timestamps: true }
);

const person = new mongoose.model("person", signup_schema);
module.exports = person;
