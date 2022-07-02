import create from "zustand";
import { persist } from "zustand/middleware";

interface UserSession {
  username: string;
  uid: string;
  token: string;
}

interface AuthStore extends UserSession {
  setUser: (user: UserSession) => void;
}

export const useAuth = create(
  persist<AuthStore>(
    (set, get) => ({
      username: "",
      uid: "",
      token: "",
      setUser: (user: UserSession) => {
        set(user);
      },
    }),
    {
      name: "auth",
    }
  )
);
