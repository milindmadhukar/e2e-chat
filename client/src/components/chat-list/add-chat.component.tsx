import { Box, Button, Flex, Input } from "@chakra-ui/react";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "store/auth.store";
import { useChats } from "store/chats.store";
import { useDiffieHellman } from "store/dh.store";
import { axios } from "utils/axios";
import { createSharedSecret } from "utils/dh";
import { Chat, Message } from "types/chats.types";
import { useSocket } from "store/socket.store";
import { AES, enc } from "crypto-js";
import { getUserByUsername } from "utils/user";

export const AddChat = () => {
  const [username, userUid] = useAuth((state) => [state.username, state.uid]);
  const [chats, addNewChat, activeChatId, setActiveChatId] = useChats(
    (state) => [
      state.chats,
      state.addNewChat,
      state.activeChatId,
      state.setActiveChatId,
    ]
  );
  const socket = useSocket((state) => state.socket);
  const [privateKey, publicKey] = useDiffieHellman((state) => [
    state.privateKey,
    state.publicKey,
  ]);
  const [searchUsername, setSearchUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSearchUsernameChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSearchUsername(e.target.value);
  };

  const handleAddChatClick: React.FormEventHandler<HTMLDivElement> = async (
    e
  ) => {
    e.preventDefault();
    setIsLoading(true);
    if (searchUsername === username) {
      toast.error("You can't add yourself to a chat");
    } else if (searchUsername.length === 0) {
      toast.error("Please enter a username");
    } else if (!socket || !socket?.connected) {
      toast.error("Please connect to the server");
    } else {
      try {
        const otherUser = await getUserByUsername(searchUsername);
        const {
          username: otherUsername,
          uid: otherUserUid,
          publicKey: otherPublicKey,
        } = otherUser;

        const chat: Chat | undefined = chats.find(
          (c) => c.recipientUid === otherUserUid
        );

        if (chat) {
          return toast.error("Chat already exists");
        }

        console.log("otherPublicKey:", otherPublicKey);
        const encryptionKey = createSharedSecret(otherPublicKey);

        // Use this message to create the chat and check if encryption keys work
        // Thsi message will be hidden from the user
        const connectMessage: Message = {
          content: "CONNECT",
          senderUid: userUid,
          recipientUid: otherUserUid,
          timestamp: new Date().getTime(),
        };

        const newChat: Chat = {
          messages: [{ ...connectMessage }],
          chatName: otherUsername,
          encryptionKey,
          recipientUid: otherUserUid,
        };

        addNewChat(newChat);
        setActiveChatId(newChat.recipientUid);

        connectMessage.content = AES.encrypt(
          connectMessage.content,
          encryptionKey
        ).toString();

        socket.emit("chat-message", connectMessage);
        setSearchUsername("");
        // chat name will be username
      } catch (error: any) {
        const errorMessage: string | undefined =
          error.response?.data?.errorMessage;
        if (errorMessage) {
          toast.error(errorMessage);
        } else {
          console.error(error);
        }
      } finally {
        setIsLoading(false);
      }
    }
    setIsLoading(false);
  };

  return (
    <Flex as="form" onSubmit={handleAddChatClick}>
      <Input
        borderRadius={0}
        onChange={handleSearchUsernameChange}
        value={searchUsername}
        placeholder="Search user to chat with"
        name="username"
      />
      <Button isLoading={isLoading} type="submit" w={32} borderRadius={0}>
        Add Chat
      </Button>
    </Flex>
  );
};
