import { axios } from "./axios";

interface User {
  uid: string;
  username: string;
  publicKey: string;
}

export const getUserByUsername = async (username: string) => {
  const res = await axios.get<User>(`/api/users/${username}`);
  return res.data;
}

export const getUserByUid = async (uid: string) => {
  const res = await axios.get<User>(`/api/users/uid/${uid}`);
  return res.data;
}