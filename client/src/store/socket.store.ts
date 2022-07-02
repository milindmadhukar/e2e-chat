import create from "zustand";
import { Socket, io } from "socket.io-client";

interface SocketStore {
  socket: Socket | null;
  setSocket: (socket: Socket) => void;
}

export const useSocket = create<SocketStore>((set) => ({
  socket: null,
  setSocket: (socket: Socket) => {
    set({ socket });
  },
}));
