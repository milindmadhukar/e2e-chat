import { Box } from "@chakra-ui/react";
import React from "react";
import { useChats } from "store/chats.store";

export const ChatList = () => {
  const [chats, activeChatId, setActiveChatId] = useChats((state) => [
    state.chats,
    state.activeChatId,
    state.setActiveChatId,
  ]);

  return (
    <Box minW="80" w="full" h="full" bgColor="blackAlpha.400" >
      {chats.map((chat, i) => {
        const isActiveChat = chat.recipientUid === activeChatId;
        return (
          <Box
            key={i}
            pr={2}
            w="full"
            bg={isActiveChat ? "whiteAlpha.50" : "blackAlpha.200"}
            color={isActiveChat ? "whiteAlpha.700" : "whiteAlpha.500"}
            _hover={{
              cursor: "pointer",
              bg: "whiteAlpha.300",
            }}
            onClick={() => setActiveChatId(chat.recipientUid)}
          >
            <Box py={3} px={4} borderBottom="1px solid" borderColor="gray.700">
              {chat.chatName}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};
