import { Chat, Message } from "types/chats.types";
import create from "zustand";
import { persist } from "zustand/middleware";

interface ChatsStore {
  chats: Chat[];
  activeChatId: string;
  setActiveChatId: (chatName: string) => void;
  addNewChat: (chat: Chat) => void;
  addNewMessage: (recipientUid: string, message: Message) => void;
}

export const useChats = create(
  persist<ChatsStore>(
    (set) => ({
      chats: [],
      activeChatId: "",
      setActiveChatId: (chatId: string) => {
        set({ activeChatId: chatId });
      },
      addNewChat: (chat: Chat) => {
        set((state) => ({
          chats: [chat, ...state.chats],
        }));
      },
      addNewMessage: (recipientUid, message) => {
        set((state) => ({
          chats: state.chats.map((chat) => {
            if (recipientUid === chat.recipientUid) {
              return { ...chat, messages: [...chat.messages, message] };
            }
            return chat;
          }),
        }));
      },
    }),
    {
      name: "chats",
    }
  )
);
