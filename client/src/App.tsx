import { Box, Container, Flex, HStack, Text } from "@chakra-ui/react";
import { AddChat } from "components/chat-list/add-chat.component";
import { ChatList } from "components/chat-list/chat-list.component";
import { Navbar } from "components/navbar.component";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./store/auth.store";
import { BACKEND_URL } from "./utils/axios";
import { useSocket } from "store/socket.store";
import { isUnauthorizedError } from "utils/jwt";
import { Chat, Message } from "types/chats.types";
import { useChats } from "store/chats.store";
import { AES, enc } from "crypto-js";
import { getUserByUid } from "utils/user";
import { createSharedSecret } from "utils/dh";
import { ChatBox } from "components/chat-box/chat-box.component";

function App() {
  const [username, token, setUser] = useAuth((state) => [
    state.username,
    state.token,
    state.setUser,
  ]);
  const [socket, setSocket] = useSocket((state) => [
    state.socket,
    state.setSocket,
  ]);
  const { chats, addNewChat, addNewMessage, setActiveChatId } = useChats(
    (state) => ({
      chats: state.chats,
      addNewChat: state.addNewChat,
      addNewMessage: state.addNewMessage,
      setActiveChatId: state.setActiveChatId,
    })
  );

  const handleChatReceive = useCallback(
    async (msg: Message) => {
      console.log("msg received:", msg, chats);
      const chat = chats.find((c) => c.recipientUid === msg.senderUid);
      console.log(chat?.recipientUid, msg.senderUid);
      if (chat) {
        msg.content = AES.decrypt(msg.content, chat.encryptionKey).toString(
          enc.Utf8
        );
        console.log("Content:", msg.content);
        addNewMessage(msg.senderUid, msg);
      } else {
        const sender = await getUserByUid(msg.senderUid);
        if (!sender) {
          throw new Error(
            "Something went wrong while receiving message. Invalid senderUid"
          );
        }
        const publicKey = sender.publicKey;
        const encryptionKey = createSharedSecret(publicKey);
        const decryptedMessage = AES.decrypt(
          msg.content,
          encryptionKey
        ).toString(enc.Utf8);

        msg.content = decryptedMessage;
        const newChat: Chat = {
          messages: [msg],
          encryptionKey,
          chatName: sender.username,
          recipientUid: msg.senderUid,
        };
        console.log("New Chat created", newChat);
        addNewChat(newChat);
      }
    },
    [addNewChat, addNewMessage, chats]
  );

  useEffect(() => {
    if (token && !socket) {
      console.log("Connecting to socket");
      setSocket(
        io(BACKEND_URL, {
          auth: { token: `Bearer ${token}` },
        })
      );
    } else if (socket) {
      if (!socket.connected) socket.connect();

      socket.on("connect", () => {
        console.log("Connected!");
      });

      socket.on("disconnect", () => {
        console.log("Disconnected from socket");
      });

      socket.on("connect_error", (error) => {
        if (isUnauthorizedError(error)) {
          console.log("User token has expired");
          setUser({ uid: "", username: "", token: "" });
        } else {
          console.log(error);
        }
      });

      socket.on("chat-receive", handleChatReceive);

      return () => {
        socket.disconnect();
        socket.removeListener("chat-receive", handleChatReceive);
      };
    }
  }, [token, socket, setSocket, setUser, handleChatReceive]);

  // useEffect(() => {
  //   console.log("Chat:",chats)
  // }, [chats])

  return (
    <Container
      px={0}
      maxW="full"
      maxH="100vh"
      h="100vh"
      display="flex"
      flexDir={"column"}
      overflow="hidden"
    >
      <Navbar />
      {username && (
        <Flex h="100%" borderTop="1px solid" borderColor={"whiteAlpha.200"} flexGrow={1}>
          <Box maxW="sm" borderRight="1px solid" borderColor="whiteAlpha.300">
            <AddChat />
            <ChatList />
          </Box>
          <ChatBox />
        </Flex>
      )}
    </Container>
  );
}

export default App;
