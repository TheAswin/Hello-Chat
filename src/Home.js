import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import "./Home.css";
import axios from "./axios";
import { firebase } from "./firebase";
import Sidebar from "./Sidebar";
import Feed from "./Feed";
import Widgets from "./Widgets";
/* import { io } from "socket.io-client"; */
import Pusher from "pusher-js";

function Home() {
  var history = useHistory();
  var URL = null;

  const [ws, setws] = useState(null);
  const [shouldStart, setShouldStart] = useState(false);
  const [messages, setMessages] = useState([]);
  /*  const [socket, setSocket] = useState(null);

  const checkForUpdates = () => {
    setSocket(io("wss://hello-chat.vercel.app"));
  };

  useEffect(() => {
    if (socket) {
      socket.on("connect", () => {
        console.log("connected");
      });

      socket.on("disconnect", () => {
        console.log("disconnected"); // undefined
      });

      socket.on("error", (error) => console.log(error));
    }
  }, [socket]); */

  useEffect(() => {
    var pusher = new Pusher("f2ccd03741a0cd0d0545", {
      cluster: "ap2",
    });

    var channel = pusher.subscribe("messages");
    channel.bind("inserted", function (data) {
      setMessages([JSON.parse(data.message), ...messages]);
    });
  }, [messages]);

  /*  useEffect(() => {
    if (socket) {
      socket.on("newMessage", (message) => {
        const newMessage = JSON.parse(message);
        setMessages([newMessage, ...messages]);
      });
    }
  }, [socket, messages]); */

  useEffect(() => {
    firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        setShouldStart(true);
      } else {
        setShouldStart(false);
        history.push("/");
      }
    });
  }, []);

  useEffect(() => {
    if (shouldStart) {
      axios.get("api/sync").then((response) => {
        setMessages(response.data);
      });
    }
  }, [shouldStart]);

  /*  useEffect(() => {
    if (ws) {
      ws.onopen = () => {
        console.log("connected");
      };

      ws.onerror = (err) => {
        console.log(err);
      };

      ws.onclose = () => {
        console.log("disconnected");
      };
    }
  }, [ws]);

  useEffect(() => {
    if (messages) {
      if (ws) {
        ws.onmessage = (evt) => {
          var newMessage = JSON.parse(evt.data);
          setMessages([newMessage, ...messages]);
        };
      }
    }
  }, [messages, ws]); */

  return (
    <div className="home">
      <Sidebar />
      {messages && <Feed posts={messages} />}
      <Widgets />
    </div>
  );
}

export default Home;
