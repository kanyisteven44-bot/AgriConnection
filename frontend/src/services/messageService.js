import API from './api';

export const getInboxMessages = async () => {
  // Dummy data for demonstration
  return [
    {
      _id: "msg1",
      sender: "Sarah Jenkins (Bulk Buyer)",
      subject: "Inquiry about Maize quantity",
      content: "Hi, I'm interested in purchasing a large quantity of your maize. Could you provide more details on availability and bulk pricing?",
      timestamp: "2026-06-12T10:30:00Z",
      read: false,
    },
    {
      _id: "msg2",
      sender: "GreenGrocer Ltd.",
      subject: "Offer for Potatoes",
      content: "We saw your potato listing and would like to make an offer for 500kg. Please let us know if you're open to negotiation.",
      timestamp: "2026-06-11T15:00:00Z",
      read: true,
    },
    {
      _id: "msg3",
      sender: "Local Market Trader",
      subject: "Tomato harvest date",
      content: "When is your next tomato harvest expected? We need a fresh supply for next week.",
      timestamp: "2026-06-10T08:45:00Z",
      read: true,
    },
  ];
};

export const replyToMessage = async (messageId, replyText) => {
  // In a real app: API.post(`/messages/${messageId}/reply`, { content: replyText });
  return { success: true };
};

export const deleteMessage = async (messageId) => {
  // In a real app: API.delete(`/messages/${messageId}`)
  return { success: true };
};

export const markAsRead = async (messageId) => {
  // In a real app: API.patch(`/messages/${messageId}/read`)
  return { success: true };
};

export const markAsUnread = async (messageId) => {
  // In a real app: API.patch(`/messages/${messageId}/unread`)
  return { success: true };
};