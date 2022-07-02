import { Box, Flex } from "@chakra-ui/react";
import React, { useMemo } from "react";
import { useChats } from "store/chats.store";
import { ChatInput } from "./chat-input.component";
import { ChatMessage } from "./chat-message.component";

export const ChatBox = () => {
  const [chats, activeChatId] = useChats((state) => [
    state.chats,
    state.activeChatId,
  ]);

  const activeChat = useMemo(
    () => chats.find((chat) => chat.recipientUid === activeChatId),
    [activeChatId, chats]
  );

  return (
    <Flex w="full" h="full" flexDir={"column"} bg="blackAlpha.400"  position={"relative"}>
      <Box w="full" px={3} h="2xl"  overflowY="auto">
        <Flex direction="column" justifyContent={"flex-end"} pb="16" pt="5" >
          {activeChat?.messages.map((message, i) => (
            <ChatMessage key={message.timestamp} {...message} />
          ))}
        </Flex>
      </Box>
      <ChatInput />
    </Flex>
  );
};
