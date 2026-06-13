import API from './api';
import { handleServiceError } from '../pages/errorUtils';

export const updateProfile = async (formData) => {
  try {
    const res = await API.put('/auth/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  } catch (error) {
    throw handleServiceError(error);
  }
};

export const updatePassword = async (currentPassword, newPassword) => {
  // Simulated API call. In real usage: 
  // const res = await API.put('/auth/update-password', { currentPassword, newPassword });
  // return res.data;
  
  await new Promise(resolve => setTimeout(resolve, 1500));
  return { success: true };
};

export const deleteAccount = async () => {
  // Simulated API call: 
  // await API.delete('/auth/profile');
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { success: true };
};