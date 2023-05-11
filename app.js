var express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
var cookieParser = require("cookie-parser");
require("dotenv").config();
// const multer = require("multer");
const bcrypt = require("bcryptjs");
const salt = 10;
var app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set("view engine", "ejs");
app.use(express.json());
app.use(cookieParser());
app.use(express.static("public"));
const mongoose = require("mongoose");
const cors = require("cors");
const person = require("./schemas/people");
const subgreddiit = require("./schemas/subgreddiit");
const follow = require("./schemas/followers_following");
const posts = require("./schemas/posts");
const Savedposts = require("./schemas/savedposts");
const reportedposts = require("./schemas/reportedposts");
const Conversation = require("./schemas/Conversation");
const Message = require("./schemas/message");
const { useNavigate } = require("react-router-dom");
const { response } = require("express");
const base_url = process.env.BASE_URL

server.listen(base_url, () => {
  console.log("hello");
});

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "public/images");
//   },
//   filename: (req, file, cb) => {
//     cb(null, req.body.name);
//   },
// });
// var upload = multer({ storage: storage });
// app.post("/server/upload", upload.single("file"), (req, res) => {
//   try {
//     return res.status(200).json("File uploded successfully");
//   } catch (error) {
//     console.error(error);
//   }
// });
app.use(cors());


const io =new Server(server, {
  cors: {
    origin: "*",
    // methods: ["GET", "POST"],
  },
});

let users = [];

const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
};

const removeUser = (socketId) => {
  users = users.filter((user) => user?.socketId !== socketId);
};

const getUser = (userId) => {
  return users.find((user) => user.userId === userId);
};

io.on("connection", (socket) => {
  //when ceonnect
  console.log("a user connected.");

  //take userId and socketId from user
  socket.on("addUser", (userId) => {
    addUser(userId, socket.id);
    io.emit("getUsers", users);
  });

  //send and get message
  socket.on("sendMessage", ({ senderId, receiverId, text }) => {
    const user = getUser(receiverId);
    io.to(user?.socketId).emit("getMessage", {
      senderId,
      text,
    });
  });

  //when disconnect
  socket.on("disconnect", () => {
    console.log("a user disconnected!");
    removeUser(socket.id);
    io.emit("getUsers", users);
  });
});


const JWT_SECRET = process.env.jwt;

function findate() {
  const date = new Date();

  var day = date.getDate();
  var month = date.getMonth() + 1;
  var year = date.getFullYear();
  var currentDate = `${day}-${month}-${year}`;
  return currentDate;
}
let date = new Date();
let day = date.getTime() - 1 * 24 * 60 * 60 * 1000;
date.setTime(day);
mongoose.set("strictQuery", false);
mongoose
  .connect(
    "mongodb+srv://yatharth_gupta1:GTinfo%402050@cluster0.czyc0cx.mongodb.net/assignment1?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => {
    console.log("connection successful");
    // app.listen(3000);
  })
  .catch((err) => console.log(err));
const router = express.Router();

app.get("/mysubgreddiit/:id", function (req, res) {
  res.send(req.params.id);
});
app.use(router);

const authorization = function (req, res, next) {
  const token = req.body.store;
  // console.log("token")
  if (token) {
    // console.log("token1")
    try {
      const decode = jwt.verify(token, JWT_SECRET);

      req.body.decode = decode;
      if (decode.username !== req.body.q) {
        res.send({ message: 0 });
      } else next();
    } catch (err) {
      console.log(err);
      res.send({ message: 0 });
    }
  } else {
    res.send({ message: 0 });
    console.log("Authorization Error");
  }
};

router.post("/createconvo", async (req, res) => {
  console.log(req.body)
  const all = await Conversation.findOne({
    members: { $all: [req.body.email, req.body.email1] },
  });
  console.log("heeeee", all);
  if (!all) {
    const newConversation = new Conversation({
      members: [req.body.email, req.body.email1],
    });

    try {
      const savedConversation = await newConversation.save();
      res.status(200).json(savedConversation);
    } catch (err) {
      res.status(500).json(err);
    }
  }
  else{
    res.status(200).json("savedConversation");
  }
});

router.post("/getconvo", async (req, res) => {
  console.log("hyhy")
  try {
    const conversation = await Conversation.find({
      members: { $in: [req.body.email] },
    });
    // const found = conversation.postsperday.find((el) => el.Date === currentDate);
    res.status(200).json(conversation);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post("/createmessage", async (req, res) => {
  const newMessage = new Message(req.body);
  console.log("dvdw",newMessage)
  try {
    const savedMessage = await newMessage.save();
    res.status(200).json(savedMessage);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post("/getmessages", async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.body.conversationId,
    });
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post("/auth", authorization, async (req, res) => {
  console.log(req.body);
  // const per = await person.find({});
  return res.send({ message: 1 });
});

router.post("/signup", async (request, response) => {
  const {
    first_name,
    second_name,
    age,
    contact,
    username,
    email,
    password: plainTextPassword,
  } = request.body;
  console.log(request.body);
  const password = await bcrypt.hash(plainTextPassword, salt);
  console.log(password);
  try {
    // storing our user data into database
    const Person = new person({
      first_name: first_name,
      second_name: second_name,
      age: age,
      contact: contact,
      username: username,
      email: email,
      password: password,
    });
    const Follow = new follow({
      username: username,
      email: email,
    });
    Person.save();
    Follow.save((err, user1) => {
      if (err) return console.error(err);
      response.json(user1);
    });
    // return response.redirect("/");
  } catch (error) {
    // console.log(JSON.stringify(error));
    // if (error.code === 11000) {
    //   return res.send({ status: "error", error: "email already exists" });
    // }
    // throw error;
    console.log(error);
  }
});

router.post("/posts", authorization, async (request, response) => {
  var currentDate = findate();
  const { name, des1, email, username, topic, banned, tags, no_of_posts } =
    request.body;
  console.log(request.body);
  try {
    // storing our user data into database
    const Posts = new posts({
      topic: topic,
      username: username,
      email: email,
      upvotes: 0,
      downvotes: 0,
      Name: name,
      content: des1,
      banned_keywords: banned,
      tags: tags,
    });

    Posts.save((err, user1) => {
      if (err) return console.error(err);
      response.json(user1);
    });
    subgreddiit
      .findOneAndUpdate(
        { Name: name },
        { $inc: { no_of_posts: 1 } }
      )
      .then((response) => {
        console.log(response);
      })
      .catch((err) => {
        console.log(err);
      });
    const per2 = await subgreddiit.findOne({ Name: name });
    console.log("helooooo", per2);
    const found = per2.postsperday.find((el) => el.Date === currentDate);
    if (!found) {
      const per4 = await subgreddiit.updateOne(
        {
          Name: name,
        },
        { $addToSet: { postsperday: { Date: currentDate, count: 1 } } }
      );
    } else {
      const per3 = await subgreddiit.updateOne(
        {
          Name: name,
        },
        { $inc: { "postsperday.$[element].count": 1 } },
        {
          // $ifNull:{
          arrayFilters: [{ "element.Date": currentDate }],

          // }
        }
      );
    }
    // return response.redirect("/");
  } catch (error) {
    // console.log(JSON.stringify(error));
    // if (error.code === 11000) {
    //   return res.send({ status: "error", error: "email already exists" });
    // }
    // throw error;
    console.log(error);
  }
});

const verifyUserLogin = async (email, password) => {
  // console.log("he");
  // console.log({ email, password });
  try {
    const user = await person.findOne({ email }).lean();
    // console.log(user);
    if (!user) {
      return { status: "error", error: "user not found" };
    }
    if (await bcrypt.compare(password, user.password)) {
      // creating a JWT token
      token = jwt.sign(
        { id: user._id, username: user.email, type: "user" },
        JWT_SECRET
        // { expiresIn: "2h" }
      );
      return { status: "ok", data: user, token: token };
    }
    return { status: "error", error: "invalid password" };
  } catch (error) {
    console.log(error);
    return { status: "error", error: "timed out" };
  }
};

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  // console.log(req.body);
  const response = await verifyUserLogin(email, password);
  console.log(response);
  if (response.status === "ok") {
    // console.log(response);
    // const token =
    res.send(response);
  } else {
    res.json(response);
  }
});

router.post("/req_data", authorization, async (req, res) => {
  const Email = req.body.email;
  console.log("heheh", Email);
  person.findOne({ email: Email }, function (err, us) {
    res.send({
      message: 1,
      id: us._id,
      first_name: us.first_name,
      second_name: us.second_name,
      username: us.username,
      email: us.email,
      contact: us.contact,
      age: us.age,
    });
  });
});

router.post("/all_users", authorization, async (req, res) => {
  console.log(req.body);
  const per = await person.find({});
  return res.json(per);
});

router.post("/all_savedposts", authorization, async (req, res) => {
  const per = await Savedposts.find({user_email:req.body.q});
  return res.json(per);
});

router.post("/findsub", authorization, async (req, res) => {
  console.log(req.body);
  const Name = req.body.Name;
  const per = await subgreddiit.findOne({ Name: Name });
  console.log(per);
  return res.send(per);
});

router.post("/search", authorization, async (req, res) => {
  console.log(req.body);
  const Name = req.body.Name;
  const regex = new RegExp(`.*${Name}.*`, "i");
  const per = await subgreddiit.find({ Name: regex });
  console.log(per);
  return res.send(per);
});

router.post("/tag", authorization, async (req, res) => {
  console.log(req.body);
  const alltags = req.body.all;
  var final = [{}];
  // alltags.map(async(tag)=>{
  // const regex = new RegExp(`^${tag}$`, "i");
  const per = await subgreddiit.find({ tags: { $in: alltags } });
  //   console.log(per)
  //     final.push(per);
  //   })
  console.log(per);
  console.log(1);
  return res.send(per);
});

router.post("/showcomments", authorization, async (req, res) => {
  console.log(req.body);
  const Name = req.body.Name;
  const per = await posts.findOne({ _id: Name });
  console.log(per.comments);
  return res.send(per.comments);
});

router.post("/showsavedcomments", authorization, async (req, res) => {
  console.log(req.body);
  const Name = req.body.Name;
  const per = await Savedposts.findOne({ _id: Name });
  console.log(per.comments);
  return res.send(per.comments);
});

router.post("/addcomment", authorization, async (req, res) => {
  console.log(req.body);
  const { text, name, username } = req.body;
  const per = await posts.findOneAndUpdate(
    { _id: name },
    { $push: { comments: { text, username } } }
  );
  console.log(per);
  return res.send(per);
});

// router.post("/addreply", authorization, async (req, res) => {
//   console.log(req.body);
//   const { text, id ,parent} = req.body;
//   const per = await posts.findOneAndUpdate(
//     { _id: parent },
//     { $push: { comments: { text, username:"" } } }
//   );
//   const per1 = await posts.findOneAndUpdate(
//     {comments:{$in:id}},
//     { $push: { childids: per. } }
//   );
//   console.log(per);
//   return res.send(per);
// });

router.post("/savepost",authorization, async (req, res) => {
  // console.log(req.body);
  const post = req.body.post;
  const Posts = new Savedposts({
    user_email:req.body.q,
    topic: post.topic,
    username: post.username,
    email: post.email,
    upvotes: post.upvotes,
    downvotes: post.downvotes,
    Name: post.Name,
    content: post.content,
    comments: post.comments,
    banned_keywords: post.banned_keywords,
    tags: post.tags,
    upvoteusernames: post.upvoteusernames,
    downvoteusernames: post.downvoteusernames,
  });
  try {
    const per = Posts.save();
    console.log(per);
    res.send(per);
  } catch (error) {
    console.log(error);
  }
});

router.post("/reportpost", authorization, async (req, res) => {
  // console.log(req.body);
  const post = req.body.post;
  const concern = req.body.concern;
  const reportedtext = req.body.reportedtext;
  const reportedby = req.body.q;
  const postid = req.body.postid;
  const Posts = new reportedposts({
    topic: post.topic,
    username: post.username,
    email: post.email,
    upvotes: post.upvotes,
    downvotes: post.downvotes,
    Name: post.Name,
    content: post.content,
    comments: post.comments,
    banned_keywords: post.banned_keywords,
    tags: post.tags,
    concern: concern,
    reportedtext: reportedtext,
    reportedby: reportedby,
    postid: postid,
    date: new Date(),
  });
  console.log(Posts);
  try {
    const per = Posts.save();
    console.log(per);
    res.send(per);
  } catch (error) {
    console.log(error);
  }
});

router.post("/upvote", authorization, async (req, res) => {
  const { name, up, username } = req.body;
  posts
    .findOneAndUpdate({ _id: name }, { $set: { upvotes: up } })
    .then((response) => {
      console.log(response);
    })
    .catch((err) => {
      console.log(err);
    });
  posts
    .findOneAndUpdate({ _id: name }, { $pull: { upvoteusernames: username } })
    .then((response) => {
      console.log(response);
    })
    .catch((err) => {
      console.log(err);
    });
});

router.post("/upvote1", authorization, async (req, res) => {
  const { name, up, username } = req.body;
  posts
    .findOneAndUpdate({ _id: name }, { $set: { upvotes: up } })
    .then((response) => {
      console.log(response);
    })
    .catch((err) => {
      console.log(err);
    });
  posts
    .findOneAndUpdate({ _id: name }, { $push: { upvoteusernames: username } })
    .then((response) => {
      console.log(response);
    })
    .catch((err) => {
      console.log(err);
    });
});

router.post("/downvote", authorization, async (req, res) => {
  const { name, down, username } = req.body;
  posts
    .findOneAndUpdate({ _id: name }, { $set: { downvotes: down } })
    .then((response) => {
      console.log(response);
    })
    .catch((err) => {
      console.log(err);
    });
  posts
    .findOneAndUpdate({ _id: name }, { $pull: { downvoteusernames: username } })
    .then((response) => {
      console.log(response);
    })
    .catch((err) => {
      console.log(err);
    });
  res.send();
});

router.post("/downvote1", authorization, async (req, res) => {
  const { name, down, username } = req.body;
  posts
    .findOneAndUpdate({ _id: name }, { $set: { downvotes: down } })
    .then((response) => {
      console.log(response);
    })
    .catch((err) => {
      console.log(err);
    });
  posts
    .findOneAndUpdate({ _id: name }, { $push: { downvoteusernames: username } })
    .then((response) => {
      console.log(response);
    })
    .catch((err) => {
      console.log(err);
    });
  res.send();
});

router.post("/findposts", authorization, async (req, res) => {
  console.log("findposts");
  console.log(req.body);
  const Name = req.body.Name;
  const message = req.body.message;
  const per = await posts.find({ Name: Name });
  const per1 = await subgreddiit.find({ Name: Name });
  console.log(per);
  console.log(per1);
  if (message === 1) {
    var block = [];
    block = per1[0].blocked;
    console.log(block);
    per.map((p) => {
      console.log("hello1");
      if (per1[0].blocked?.includes(p.username)) {
        console.log("hello");
        p.username = "Blocked User";
      }
    });
  }
  return res.send(per);
});

router.post("/findmyposts", authorization, async (req, res) => {
  console.log("findmyposts");
  console.log(req.body);
  const email = req.body.email;
  const per = await posts.find({ email: email });
  return res.send(per);
});

router.post("/findinsubg", authorization, async (req, res) => {
  console.log(req.body);
  const { name, username } = req.body;
  const per = await subgreddiit.findOne({ Name: name, followers: username });
  // const ab = await per.findOne({ followers: { $elemMatch: username } })
  console.log(per);
  return res.send(per);
});

router.post("/accept", authorization, async (req, res) => {
  console.log(req.body);
  var currentDate = findate();
  console.log(currentDate);
  const { name, username1, no } = req.body;
  const per = await subgreddiit.findOneAndUpdate(
    { Name: name },
    { $push: { followers: username1 } },
    { $set: { no_of_followers: no + 1 } }
  );
  const per2 = await subgreddiit.findOneAndUpdate(
    { Name: name },
    { $set: { no_of_followers: no + 1 } }
  );
  let a;
  console.log(per2.followersperday);
  const found = per2.followersperday.find((el) => el.Date === currentDate);
  console.log(found);
  if (!found) {
    const per4 = await subgreddiit.updateOne(
      {
        Name: name,
      },
      { $addToSet: { followersperday: { Date: currentDate, count: 1 } } }
    );
  } else {
    const per3 = await subgreddiit.updateOne(
      {
        Name: name,
      },
      { $inc: { "followersperday.$[element].count": 1 } },
      {
        // $ifNull:{
        arrayFilters: [{ "element.Date": currentDate }],

        // }
      }
      // { Name: name,followersperday: {$elemMatch: {Date:currentDate}}},
      // { $inc: { count: 1 } }
    );
  }
  // if (!per3) {
  // const per4 = await subgreddiit.updateOne(
  //   {
  //     Name: name,
  //   },
  //   { $addToSet: { followersperday: { Date: currentDate, count: 1 } } }
  // );

  // console.log(per3);
  const per1 = await subgreddiit.findOneAndUpdate(
    { Name: name },
    { $pull: { request: username1 } }
  );
  // const ab = await per.findOne({ followers: { $elemMatch: username } })
  console.log(per);
  return res.send(per);
});

router.post("/incvisits", authorization, async (req, res) => {
  const name = req.body.Name;
  var currentDate = findate();
  console.log("hi");
  const per2 = await subgreddiit.findOne(
    { Name: name }
    // { $set: { no_of_followers: no + 1 } }
  );
  console.log("hi3");
  const found = per2.visitorsperday.find((el) => el.Date === currentDate);
  if (!found) {
    console.log("hi1");
    const per4 = await subgreddiit.updateOne(
      {
        Name: name,
      },
      { $addToSet: { visitorsperday: { Date: currentDate, count: 1 } } }
    );
    return res.send(per4);
  } else {
    console.log("hi2");
    const per3 = await subgreddiit.updateOne(
      {
        Name: name,
      },
      { $inc: { "visitorsperday.$[element].count": 1 } },
      {
        // $ifNull:{
        arrayFilters: [{ "element.Date": currentDate }],

        // }
      }
    );
    return res.send(per3);
  }
  // { Name: name,followersperday: {$elemMatch: {Date:currentDate}}},
  // { $inc: { count: 1 } }
  // console.log(currentDate);
  // console.log(per3);
});

router.post("/inc_report", authorization, async (req, res) => {
  const name = req.body.Name;
  const per3 = await subgreddiit.updateOne(
    {
      Name: name,
    },
    { $inc: { no_of_rep_posts: 1 } }
  );
  console.log(per3);
  return res.send(per3);
});

router.post("/inc_delete", authorization, async (req, res) => {
  const name = req.body.Name;
  const per3 = await subgreddiit.updateOne(
    {
      Name: name,
    },
    { $inc: { no_of_del_posts: 1 } }
  );
  console.log(per3);
  return res.send(per3);
});

router.post("/leave", authorization, async (req, res) => {
  console.log(req.body);
  const { name, username } = req.body;
  const per = await subgreddiit.findOneAndUpdate(
    { Name: name },
    { $push: { left: username } }
  );
  const per1 = await subgreddiit.findOneAndUpdate(
    { Name: name },
    { $pull: { followers: username } }
  );
  // const ab = await per.findOne({ followers: { $elemMatch: username } })
  if (per && per1) {
    console.log(per);
    return res.send(per);
  }
});

router.post("/reject", authorization, async (req, res) => {
  console.log(req.body);
  const { name, username1 } = req.body;
  const per = await subgreddiit.findOneAndUpdate(
    { Name: name },
    { $pull: { request: username1 } }
  );
  // const ab = await per.findOne({ followers: { $elemMatch: username } })
  console.log(per);
  return res.send(per);
});

router.post("/addinfollowing", authorization, async (req, res) => {
  console.log(req.body);
  const { email, email1 } = req.body;
  try {
    const user1 = await follow.findOneAndUpdate(
      { email: email },
      { $push: { following: email1 } },
      {
        new: true,
      }
    );
    const user2 = await follow.findOneAndUpdate(
      { email: email1 },
      { $push: { followers: email } },
      {
        new: true,
      }
    );
    console.log(user2);
    if (user1 && user2) {
      return res.send({ user1, user2 });
    }
  } catch (error) {
    throw error;
  }
});
router.post("/addinrequest", authorization, async (req, res) => {
  // console.log(req.body);
  // const { email, email1 } = req.body;
  const { name, username } = req.body;
  try {
    const user1 = await subgreddiit.findOneAndUpdate(
      { Name: name },
      { $push: { request: username } },
      {
        new: true,
      }
    );
    if (user1) {
      return res.send(user1);
    }
  } catch (error) {
    throw error;
  }
});
router.post("/deletesub", authorization, async (req, res) => {
  // console.log(req.body);
  // const { email, email1 } = req.body;
  const Name = req.body.Name;
  try {
    const user1 = await subgreddiit.deleteOne({ Name: Name });
    const user2 = await posts.deleteMany({ Name: Name });
    const user3 = await Savedposts.deleteMany({ Name: Name });
    const user4 = await reportedposts.deleteMany({ Name: Name });
    if (user1 && user2) {
      return res.send(user1);
    }
  } catch (error) {
    throw error;
  }
});

router.post("/deletepost", authorization, async (req, res) => {
  // console.log(req.body);
  // const { email, email1 } = req.body;
  const id1 = req.body.id1;
  try {
    const user1 = await Savedposts.deleteOne({ _id: id1 });
    if (user1) {
      return res.send(user1);
    }
  } catch (error) {
    throw error;
  }
});

router.post("/deletepostpermanent", authorization, async (req, res) => {
  // console.log(req.body);
  // const { email, email1 } = req.body;
  const { id1, id2, name } = req.body;
  try {
    const user1 = await posts.deleteOne({ _id: id1 });
    const user2 = await reportedposts.deleteOne({ _id: id2 });
    const user3 = await subgreddiit.findOneAndUpdate(
      { Name: name },
      { $inc: { no_of_posts: -1 } }
    );
    if (user1 && user2) {
      console.log(user1);
      return res.send(user1);
    }
  } catch (error) {
    throw error;
  }
});

router.post("/blockuser", authorization, async (req, res) => {
  // console.log(req.body);
  // const { email, email1 } = req.body;
  const { username, name, id2 } = req.body;
  try {
    const user1 = await subgreddiit.findOneAndUpdate(
      { Name: name },
      { $pull: { followers: username } }
    );
    const user4 = await subgreddiit.findOneAndUpdate(
      { Name: name },
      { $inc: { no_of_followers: -1 } }
    );
    const user2 = await subgreddiit.findOneAndUpdate(
      { Name: name },
      { $push: { blocked: username } }
    );
    const user3 = await reportedposts.deleteOne({ _id: id2 });

    if (user1) {
      return res.send(user1);
    }
  } catch (error) {
    throw error;
  }
});

router.post("/ignore", authorization, async (req, res) => {
  // console.log(req.body);
  // const { email, email1 } = req.body;
  const name = req.body.name;
  try {
    const user1 = await reportedposts.findOneAndUpdate(
      { Name: name },
      { $set: { ignored: true } }
    );
    if (user1) {
      return res.send(user1);
    }
  } catch (error) {
    throw error;
  }
});

router.post("/update", authorization, (req, res) => {
  const data = req.body.user;
  console.log(req.body);
  var message = 1;
  person.findOneAndUpdate({ email: data.email }, data, (err, us) => {});
  follow.findOneAndUpdate(
    { email: data.email },
    { username: data.username },
    (err, us) => {}
  );
  return res.send({ message });
});

router.post("/getfollowers", authorization, (req, res) => {
  const email = req.body.email;
  console.log(req.body);
  follow
    .find({ email: email })
    .then((response) => {
      console.log(response);
      console.log(response[0]?.followers);
      res.send(response[0]?.followers);
    })
    .catch((err) => {
      console.log(err);
    });
});

router.post("/getfollowing", authorization, (req, res) => {
  const email = req.body.email;
  follow
    .find({ email: email })
    .then((response) => {
      console.log(response);
      console.log(response[0]?.following);
      res.send(response[0]?.following);
    })
    .catch((err) => {
      console.log(err);
    });
});

router.post("/getusername", authorization, (req, res) => {
  const email = req.body.email;
  follow
    .find({ email: email })
    .then((response) => {
      console.log(response + "345");
      return res.send(response[0].username);
    })
    .catch((err) => {
      console.log(err);
    });
});
router.post("/getusername1", authorization, (req, res) => {
  const email = req.body.email;
  follow
    .find({ email: email })
    .then((response) => {
      console.log(response + "345");
      console.log(response[0].username);
      return res.send(response[0].username);
    })
    .catch((err) => {
      console.log(err);
    });
});

router.post("/mysubgreddiit", authorization, (req, res) => {
  const email = req.body.email;
  const username = req.body.username;
  const description = req.body.des1;
  const Name = req.body.name;
  const moderator = { username, email };
  const bannedstring = req.body.bannedstring;
  const tagwords = req.body.tagwords;

  const Subgreddiit = new subgreddiit({
    moderator: [moderator],
    followers: [username],
    no_of_followers: 1,
    no_of_posts: 0,
    Name: Name,
    description: description,
    banned_keywords: bannedstring,
    tags: tagwords,
    // image: req.file.filename,
  });
  Subgreddiit.save()
    .then((response) => {
      res.send(response);
    })
    .catch((Err) => {
      console.log(Err);
    });
});
router.post("/mysubgreddiitdata", authorization, async (req, res) => {
  const email = req.body.email;
  console.log(email);
  const all = await subgreddiit.find({
    moderator: { $elemMatch: { email: email } },
  });
  return res.json(all);
});

router.post("/allsubgreddiitdata", authorization, async (req, res) => {
  // const email = req.body.email
  const all = await subgreddiit.find({});
  return res.json(all);
});

router.post("/all_reportedposts", authorization, async (req, res) => {
  // const email = req.body.email
  const name= req.body.name
  console.log(date);
  console.log("hoiiiiiiiiiiiiiiiiii");
  const per = await reportedposts.deleteMany({ date: { $lte: date } });
  // const all = await reportedposts.find({ date: { $gte: date } });
  const all = await reportedposts.find({Name:name});
  console.log("hiiiii", all);
  return res.json(all);
});

router.post("/delete", authorization, async (req, res) => {
  const { email1, email } = req.body;
  console.log({ email, email1 });
  // const res1 = await follow.updateOne({email:email},{$pull:{following:email1}})
  // try{
  //   console.log(res1);
  //   res.send(res1)
  // }
  // catch(err){
  //   console.log(err)
  // }
  // follow.updateOne({email:email},{$pull:{following:email1}})
  // follow.updateOne({email:email1},{$pull:{followers:email}},function(err,us1){
  //   if(err) throw err;
  //   return res.send(us1)
  try {
    const user1 = await follow.updateOne(
      { email: email },
      { $pull: { following: email1 } }
    );
    const user2 = await follow.updateOne(
      { email: email1 },
      { $pull: { followers: email } }
    );
    console.log(user2);
    if (user1 && user2) {
      return res.send({ user1, user2 });
    }
  } catch (error) {
    throw error;
  }
  // const res2 =  follow.findOneAndUpdate({email:email1},{$pull:{followers:email}})
  // try{
  //   console.log(res1);
  // }
  // catch(err){
  //   console.log(err)
  // }
  // if(res1&&res2)
  // return res.send({message:1})
  // else
  // return res.send({message:0})
});
