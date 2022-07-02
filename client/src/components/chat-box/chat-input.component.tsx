import { Box, Button, Flex, Input } from "@chakra-ui/react";
import { AES } from "crypto-js";
import { useActiveChat } from "hooks/useActiveChat";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import toast from "react-hot-toast";
import { useAuth } from "store/auth.store";
import { useChats } from "store/chats.store";
import { useSocket } from "store/socket.store";
import { Message } from "types/chats.types";

export const ChatInput = () => {
  const userUid = useAuth((state) => state.uid);
  const addNewMessage = useChats((state) => state.addNewMessage);
  const activeChat = useActiveChat();
  const socket = useSocket((state) => state.socket);
  
  const [content, setContent] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleMessageSend = useCallback(() => {
    if (content.length === 0) {
      return;
    }
    if (!activeChat) {
      return;
    }
    if (socket) {
      const message: Message = {
        content,
        timestamp: Date.now(),
        senderUid: userUid,
        recipientUid: activeChat.recipientUid,
      };
      addNewMessage(activeChat.recipientUid, { ...message });

      message.content = AES.encrypt(message.content, activeChat.encryptionKey).toString();
      socket.emit("chat-message", message);

      setContent("");
    }
  }, [content, activeChat, addNewMessage, socket, userUid]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [activeChat]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        handleMessageSend();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleMessageSend]);

  return (
    <Flex bg="gray.700" py={2} px={4} bottom={0} position={"absolute"} w="full" columnGap={4}>
      <Input
        ref={inputRef}
        placeholder="Text here..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        bg="blackAlpha.600"
        border="none"
      />
      <Button w="32" variant="outline" colorScheme="teal">Send</Button>
    </Flex>
  );
};
