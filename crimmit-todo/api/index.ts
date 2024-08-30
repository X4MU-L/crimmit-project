import axios from "axios";
import Cookies from "js-cookie";
import { ServerError } from "../utils";

const BASE_URL = process.env.AUTH_ROOT_URL_LOCAL!;
const BASE_API = process.env.AUTH_SERVER_LOCAL!;

// Create Axios instances
export const API = axios.create({
  baseURL: BASE_URL,
  timeout: 50000,
  withCredentials: true, // Enable credentials for CSRF protection
});

export const ROOT_API = axios.create({
  baseURL: BASE_API,
  timeout: 50000,
  withCredentials: true, // Enable credentials for CSRF protection
});
