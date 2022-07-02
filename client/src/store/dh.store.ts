import create from "zustand";
import { persist } from "zustand/middleware";

interface DiffieHellmanStore {
  privateKey: string;
  publicKey: string;
  setKeys: (privateKey: string, publicKey: string) => void;
}

export const useDiffieHellman = create(
  persist<DiffieHellmanStore>(
    (set) => ({
      privateKey: "",
      publicKey: "",
      setKeys: (privateKey: string, publicKey: string) => {
        set({ privateKey, publicKey });
      },
    }),
    {
      name: "diffieHellman",
    }
  )
);
