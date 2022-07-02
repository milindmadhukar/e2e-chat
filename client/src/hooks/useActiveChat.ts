import { useMemo } from "react";
import { useChats } from "store/chats.store";

export const useActiveChat = () => {
  const [chats, activeChatId] = useChats((state) => [
    state.chats,
    state.activeChatId,
  ]);
  const activeChat = useMemo(() => {
    if (!activeChatId) return null;
    return chats.find((chat) => chat.recipientUid === activeChatId);
  }, [activeChatId, chats]);

  return activeChat;
};
