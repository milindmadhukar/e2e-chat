import { Box, Flex, Text } from "@chakra-ui/react";
import React from "react";
import { useAuth } from "store/auth.store";
import { Message } from "types/chats.types";
import ReactTimeAgo from "react-time-ago";

interface MessageProps extends Message {}

export const ChatMessage: React.FC<MessageProps> = ({
  content,
  recipientUid,
  senderUid,
  timestamp,
}) => {
  const [username, userUid] = useAuth((state) => [state.username, state.uid]);
  const datetime = new Date(timestamp);

  if (content === "CONNECT") {
    return (
      <Flex justifyContent="center" w="full" mb={8}>
        <Box
          maxW="sm"
          w="full"
          bg="whiteAlpha.200"
          color="orange.300"
          px={2}
          py={1.5}
          borderRadius="md"
          textAlign="center"
          fontSize="sm"
        >
          This chat is end to end encrypted. No one can read your messages. Not even us 🔒
        </Box>
      </Flex>
    );
  }

  if (userUid === senderUid) {
    return (
      <Flex justifyContent={"flex-end"} mb={2}>
        <Box
          maxW="70%"
          bg="whiteAlpha.200"
          borderRadius={"md"}
          px={2}
          pt={1}
          pb={1}
          borderBottomRightRadius={0}
        >
          <Text>{content}</Text>
          <Text color="whiteAlpha.500" fontSize="xs">
            <ReactTimeAgo date={datetime} locale="en-US" />
          </Text>
        </Box>
      </Flex>
    );
  }

  return (
    <Flex justifyContent={"flex-start"} mb={2}>
      <Box
        maxW="70%"
        bg="whiteAlpha.200"
        borderBottomLeftRadius={0}
        borderRadius={"md"}
        px={2}
        pt={1}
        pb={1}
      >
        <Text>{content}</Text>
        <Text color="whiteAlpha.500" fontSize="xs">
          <ReactTimeAgo date={datetime} locale="en-US" />
        </Text>
      </Box>
    </Flex>
  );
};
