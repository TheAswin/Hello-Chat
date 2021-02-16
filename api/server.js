import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import Messages from "./dbTweets.js";
import Pusher from "pusher";
import cors from "cors";

const app = express();
const port = process.env.PORT || 5000;

const pusher = new Pusher({
  appId: "1155160",
  key: "f2ccd03741a0cd0d0545",
  secret: "8282efa822a6efe71ce2",
  cluster: "ap2",
  useTLS: true,
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

const connection_url =
  "mongodb+srv://admin:admin@cluster0.hec08.mongodb.net/posts?retryWrites=true&w=majority";
mongoose.connect(connection_url, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.once("open", () => {
  const msgCollection = db.collection("messagecontents");
  const changeStream = msgCollection.watch();

  changeStream.on("change", (change) => {
    if (change.operationType === "insert") {
      const messageDetails = change.fullDocument;
      pusher.trigger("messages", "inserted", {
        displayName: messageDetails.displayName,
        userName: messageDetails.userName,
        verified: messageDetails.verified,
        text: messageDetails.text,
        avatar: messageDetails.avatar,
        image: messageDetails.image,
      });
    } else {
      console.log("Error occured");
    }
  });
});

// API calls
app.get("/api/sync", (req, res) => {
  Messages.find((err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(data);
    }
  });
});

app.post("/api/new", (req, res) => {
  const dbMessage = req.body;

  Messages.create(dbMessage, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(201).send(data);
    }
  });
});

app.listen(port, () => console.log(`Listening on port ${port}`));