import React, { useState, useEffect } from "react";
import Sidebar from "../components/sidebar";
import { motion } from "framer-motion";
import * as messageService from "../services/messageService";
import { colors } from '../constants/theme';
import './Inbox.css';

function Inbox() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  
  const [replyText, setReplyText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setLoading(true);
    setError(null);

    const fetchMessages = async () => {
      try {
        const data = await messageService.getInboxMessages();
        setMessages(data);
        setLoading(false);
      } catch (err) {
        console.error("Inbox fetch error:", err);
        setError("Failed to load messages. Please try again later.");
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  const handleViewMessage = (message) => {
    setSelectedMessage(message);
    messageService.markAsRead(message._id);
    setMessages(prev => 
      prev.map(m => m._id === message._id ? { ...m, read: true } : m)
    );
  };

  const handleReplyClick = () => {
    setShowReplyForm(true);
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) return;
    await messageService.replyToMessage(selectedMessage._id, replyText);
    alert(`Replying to ${selectedMessage.sender} (simulated)`);
    setShowReplyForm(false);
    setReplyText("");
    setSelectedMessage(null); // Optionally close modal after sending reply
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    await messageService.deleteMessage(selectedMessage._id);
    alert(`Message from ${selectedMessage.sender} deleted (simulated).`);
    setSelectedMessage(null); // Close the modal
    setShowDeleteConfirm(false);
    setMessages(prev => prev.filter(m => m._id !== selectedMessage._id));
  };

  const handleMarkAsUnread = async (messageId) => {
    await messageService.markAsUnread(messageId);
    setMessages(prev => 
      prev.map(m => m._id === messageId ? { ...m, read: false } : m)
    );
    closeModal(); // Close modal to see the unread status in the list
  };

  const closeModal = () => {
    setSelectedMessage(null);
    setShowDeleteConfirm(false);
    setShowReplyForm(false);
    setReplyText("");
  };

  const filteredMessages = messages.filter((message) =>
    message.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="inbox-page">
      <Sidebar />

      <div className="inbox-content">
        <h1>✉️ Inbox</h1>
        <p className="inbox-subtitle">Your messages from buyers.</p>

        {/* Message Details Modal */}
        {selectedMessage && (
          <div className="modal-overlay" onClick={closeModal}>
            <motion.div 
              className="modal-card"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <button className="close-modal" onClick={closeModal}>&times;</button>
              <h2 className="modal-title">{selectedMessage.subject}</h2>
              
              <div className="message-detail-header">
                <p><strong>From:</strong> {selectedMessage.sender}</p>
                <p><strong>Date:</strong> {new Date(selectedMessage.timestamp).toLocaleString()}</p>
              </div>

              <div className="message-full-content">
                <p>{selectedMessage.content}</p>
              </div>

              {!showReplyForm ? (
                <div className="modal-actions">
                  <button className="primary-button" onClick={handleReplyClick}>Reply</button>
                  <button className="unread-button" onClick={() => handleMarkAsUnread(selectedMessage._id)}>Mark as Unread</button>
                  <button className="delete-button" onClick={handleDeleteClick}>Delete</button>
                </div>
              ) : (
                <div className="reply-section">
                  <h3>Reply to {selectedMessage.sender}</h3>
                  <textarea
                    className="reply-textarea"
                    placeholder="Type your reply here..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  ></textarea>
                  <div className="reply-actions">
                    <button className="primary-button" onClick={handleSendReply}>Send Reply</button>
                    <button className="details-button" onClick={() => setShowReplyForm(false)}>Cancel</button>
                  </div>
                </div>
              )}

              {showDeleteConfirm && (
                <motion.div 
                  className="delete-confirm-prompt"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p>Are you sure you want to delete this message?</p>
                  <div className="confirm-actions">
                    <button className="primary-button" onClick={confirmDelete}>Yes, Delete</button>
                    <button className="details-button" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        )}

        {loading && <p>Loading messages...</p>}
        {error && <p className="error-message">{error}</p>}
        {!loading && !error && messages.length === 0 && <p>No messages in your inbox.</p>}

        {!loading && !error && messages.length > 0 && (
          <div className="inbox-search">
            <input
              type="text"
              placeholder="Search by sender or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        )}

        {!loading && !error && messages.length > 0 && filteredMessages.length === 0 && (
          <p>No messages match your search criteria.</p>
        )}

        <div className="message-list">
          {!loading && !error && filteredMessages.map((message) => (
            <motion.div
              key={message._id}
              className={`message-card ${message.read ? 'read' : 'unread'}`}
              onClick={() => handleViewMessage(message)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="message-header">
                <span className="message-sender">{message.sender}</span>
                <span className="message-timestamp">{new Date(message.timestamp).toLocaleString()}</span>
              </div>
              <h3 className="message-subject">{message.subject}</h3>
              <p className="message-preview">{message.content.substring(0, 100)}...</p>
              <button className="view-message-button" onClick={(e) => { e.stopPropagation(); handleViewMessage(message); }}>View Message</button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Inbox;