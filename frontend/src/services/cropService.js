import API from './api';
import { handleServiceError } from '../pages/errorUtils';

export const getCrops = async () => {
  try {
    const res = await API.get("/crops");
    return res.data;
  } catch (error) {
    throw handleServiceError(error);
  }
};

export const sendMessageToFarmer = async (cropId, messageText) => {
  // In a full app: await API.post("/messages", { cropId, messageText })
  return { success: true };
};

export const getBuyers = async () => {
  // Mocking data for now; could easily be replaced by an API call
  return [
    { _id: "b1", name: "GreenLife Millers", interest: "Maize", location: "Nairobi", demand: "High", rating: 4.8, verified: true },
    { _id: "b2", name: "Harvest Traders Ltd", interest: "Maize", location: "Eldoret", demand: "Medium", rating: 4.5, verified: true },
    { _id: "b3", name: "Umoja Co-op", interest: "Vegetables", location: "Nakuru", demand: "High", rating: 4.9, verified: true },
    { _id: "b4", name: "Fresh Express", interest: "Tomatoes", location: "Mombasa", demand: "Low", rating: 4.2, verified: false },
  ];
};