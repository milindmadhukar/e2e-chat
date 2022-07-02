import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { authorize } from "@thream/socketio-jwt";
import bcrypt from "bcrypt";
import amqp from "amqplib";
import { PrismaClient } from "@prisma/client";
import { PrismaClientUnknownRequestError } from "@prisma/client/runtime";
import { channel } from "diagnostics_channel";
import { Message } from "./types/chats.types";

dotenv.config({
  path: "../.env",
});

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;
const AMQP_URL = process.env.AMQP_URL || "amqp://localhost:5672";

if (!JWT_SECRET) throw new Error("JWT_SECRET is not defined");

const prisma = new PrismaClient();

const app = express();
const server = http.createServer(app);
let amqpConnection: amqp.Connection;
let chatChannel: amqp.Channel;

// Express code start

app.use(cors());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.json());

// Express api route declaration ends here

app.post("/api/sign-up", async (req, res) => {
  const { username, password, publicKey } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 9);
    const user = await prisma.user.create({
      data: {
        username,
        hashedPassword,
        publicKey,
      },
    });

    return res.status(200).json({
      uid: user.uid,
      username: user.username,
    });
  } catch (error: any | PrismaClientUnknownRequestError) {
    console.error(error);
    if (error.code === "P2002") {
      return res.status(400).json({
        errorMessage: "Username already exists",
      });
    }
    return res.status(500).json({
      errorMessage: "Something went wrong",
    });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        username: req.body.username,
      },
    });
    if (!user) {
      console.log("Invalid user auth attempted");
      return res.status(400).json({ error: "User not found" });
    }
    const passIsValid = bcrypt.compare(req.body.password, user.hashedPassword);
    if (!passIsValid) {
      return res.status(400).json({ errorMessage: "User not found" });
    }
    const token = jwt.sign(
      {
        uid: user.uid,
      },
      JWT_SECRET,
      {
        expiresIn: "30d",
      }
    );

    return res.status(200).json({
      uid: user.uid,
      username: user.username,
      token,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      errorMessage: "Something went wrong",
    });
  }
});

app.get("/api/users/:username", async (req, res) => {
  const { username } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: {
        username,
      },
    });
    if (!user) {
      return res.status(404).json({ errorMessage: "User not found" });
    }
    return res.status(200).json({
      uid: user.uid,
      username: user.username,
      publicKey: user.publicKey,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      errorMessage: "Something went wrong",
    });
  }
});

app.get("/api/users/uid/:uid", async (req, res) => {
  const { uid } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: {
        uid,
      },
    });
    if (!user) {
      return res.status(404).json({ errorMessage: "User not found" });
    }
    return res.status(200).json({
      uid: user.uid,
      username: user.username,
      publicKey: user.publicKey,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      errorMessage: "Something went wrong",
    });
  }
});

// Express api route declaration ends here


// Socket IO code starts here
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});

io.use(
  authorize({
    secret: JWT_SECRET,
  })
);

io.on("connection", async (socket) => {
  console.log(socket.decodedToken);
  const userUid = socket.decodedToken.uid;
  if (!userUid) {
    throw new Error("User uid is not defined");
  }
  await chatChannel.assertQueue(userUid);

  const chatChannelConsume = await chatChannel.consume(userUid, (message) => {
    if (message) {
      const msg: Message = JSON.parse(message.content.toString());
      console.log("Receiving message", msg)
      socket.emit("chat-receive", msg);
      chatChannel.ack(message);
    }
  })

  socket.on("chat-message", (message: Partial<Message>) => {
    if (!message.content || !message.senderUid || !message.timestamp || !message.recipientUid) {
      console.log("Invalid message");
      return;
    }
    console.log("New Message", message);
    chatChannel.sendToQueue(message.recipientUid, Buffer.from(JSON.stringify(message)));
  });

  socket.on("disconnect", () => {
    console.log(socket.decodedToken.uid, "disconnected");
    chatChannel.cancel(chatChannelConsume.consumerTag)
  })
});

// Socket IO code ends here

const main = async () => {
  amqpConnection = await amqp.connect(AMQP_URL);
  chatChannel = await amqpConnection.createChannel();
  
  console.log("Connected to RammbitMQ");

  server.listen(PORT, () => {
    console.log("Server running on PORT", PORT);
  });
};

main();
