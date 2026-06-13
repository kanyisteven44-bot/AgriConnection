import API from './api';
import { handleServiceError } from '../pages/errorUtils';

export const loginUser = async (email, password) => {
  try {
    const res = await API.post("/auth/login", { email, password });
    return res.data;
  } catch (error) {
    throw handleServiceError(error);
  }
};

export const registerUser = async (userData) => {
  try {
    const res = await API.post("/auth/register", userData);
    return res.data;
  } catch (error) {
    throw handleServiceError(error);
  }
};