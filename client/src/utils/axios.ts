import Axios from "axios"

export const BACKEND_URL =  process.env.BACKEND_URL || "http://localhost:5000"

export const axios = Axios.create({
  baseURL: BACKEND_URL,
})