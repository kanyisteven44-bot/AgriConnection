import React, { useState, useRef, useEffect } from 'react';
import Sidebar from "../components/sidebar";
import PasswordInput from "../components/PasswordInput";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

import { useToast } from "../components/ToastContext";
import * as userService from "../services/userService";
import { colors } from '../constants/theme';
import { fileToBase64 } from '../utils/fileUtils';
import { calculatePasswordStrength } from '../utils/authUtils';

function Profile() {
  const { user, updateUser, logout } = useAuth();
  const { showToast } = useToast();
  const [imagePreview, setImagePreview] = useState(user?.profilePicture || null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [phone, setPhone] = useState(user?.phone || '');
  const [location, setLocation] = useState(user?.location || '');
  const [isSaving, setIsSaving] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setPhone(user.phone || '');
      setLocation(user.location || '');
    }
  }, [user]);

  const handleReset = () => {
    setPhone(user?.phone || '');
    setLocation(user?.location || '');
    setImagePreview(user?.profilePicture || null);
    setSelectedFile(null);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordStrength(0);
    setShowResetConfirm(false);
  };

  const handleDeleteAccount = async () => {
    try {
      await userService.deleteAccount();
      showToast("Account deleted successfully.", "success");
      logout();
    } catch (err) {
      showToast("Failed to delete account. Please contact support.");
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  const handleSaveProfile = async () => {
    // Kenyan Phone Validation (+254 followed by 9 digits)
    const phoneRegex = /^\+254\d{9}$/;

    if (!phoneRegex.test(phone)) {
      showToast("Phone number must follow the +254 format.");
      return;
    }

    setIsSaving(true);

    try {
      // Use FormData to support file upload along with text fields
      const formData = new FormData();
      formData.append('phone', phone);
      formData.append('location', location);
      if (selectedFile) {
        formData.append('profilePicture', selectedFile);
      }

      const data = await userService.updateProfile(formData);
      updateUser(data.user);
      showToast("Profile updated successfully!", "success");
    } catch (err) {
      showToast(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast("Please fill in all password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast("New passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      showToast("Password too short.");
      return;
    }

    setIsUpdatingPassword(true);

    try {
      await userService.updatePassword(currentPassword, newPassword);

      showToast("Password updated successfully!", "success");
      setCurrentPassword('');
      setNewPassword('');
      setPasswordStrength(0);
      setConfirmPassword('');
    } catch (err) {
      showToast(err.message);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      try {
        const base64 = await fileToBase64(file);
        setImagePreview(base64);
      } catch (err) {
        console.error("Error converting file to base64:", err);
      }
    }
  };

  return (
    <div className="dashboard-page" style={{ display: 'flex' }}>
      <Sidebar />

      <div className="dashboard-content" style={{ marginLeft: "240px", padding: "40px", flexGrow: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 style={{ color: colors.primaryGreen, marginBottom: '10px' }}>👤 User Profile</h1>
          <p style={{ color: colors.darkGray, marginBottom: '30px' }}>Manage your account settings and farm information.</p>

          {/* Reset Confirmation Dialog */}
          {showResetConfirm && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 3000,
            }}>
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{
                  backgroundColor: colors.white,
                  padding: '30px',
                  borderRadius: '12px',
                  maxWidth: '400px',
                  textAlign: 'center',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
                }}
              >
                <h3 style={{ color: '#d32f2f', marginBottom: '15px' }}>Discard Changes?</h3>
                <p style={{ color: colors.darkGray, marginBottom: '25px' }}>Are you sure you want to reset the form? All unsaved changes to your phone, location, and picture will be lost.</p>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                  <button onClick={handleReset} style={{ backgroundColor: '#d32f2f', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Yes, Reset</button>
                  <button onClick={() => setShowResetConfirm(false)} style={{ backgroundColor: 'transparent', color: colors.darkGray, border: `1px solid ${colors.lightGray}`, padding: '10px 20px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Go Back</button>
                </div>
              </motion.div>
            </div>
          )}

          {/* Delete Confirmation Dialog */}
          {showDeleteConfirm && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 3000,
            }}>
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{
                  backgroundColor: colors.white,
                  padding: '30px',
                  borderRadius: '12px',
                  maxWidth: '400px',
                  textAlign: 'center',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
                }}
              >
                <h3 style={{ color: '#d32f2f', marginBottom: '15px' }}>Permanently Delete Account?</h3>
                <p style={{ color: colors.darkGray, marginBottom: '25px' }}>This action cannot be undone. All your listings, messages, and profile data will be permanently removed from AgriConnect.</p>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                  <button onClick={handleDeleteAccount} style={{ backgroundColor: '#d32f2f', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Permanently Delete</button>
                  <button onClick={() => setShowDeleteConfirm(false)} style={{ backgroundColor: 'transparent', color: colors.darkGray, border: `1px solid ${colors.lightGray}`, padding: '10px 20px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
                </div>
              </motion.div>
            </div>
          )}

          {/* Profile Picture Section */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            marginBottom: '30px',
            maxWidth: '600px'
          }}>
            <div 
              onClick={handleImageClick}
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                backgroundColor: colors.lightGray,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'pointer',
                overflow: 'hidden',
                border: `3px solid ${colors.primaryGreen}`,
                position: 'relative'
              }}
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Profile Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: '3rem' }}>👤</span>
              )}
              <div style={{
                position: 'absolute',
                bottom: 0,
                width: '100%',
                backgroundColor: 'rgba(11, 93, 59, 0.7)',
                color: 'white',
                fontSize: '0.7rem',
                textAlign: 'center',
                padding: '2px 0'
              }}>EDIT</div>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              style={{ display: 'none' }} 
              accept="image/*" 
            />
            {selectedFile && <p style={{ marginTop: '10px', fontSize: '0.8rem', color: colors.primaryGreen }}>New image selected!</p>}
          </div>

          <div style={{ 
            backgroundColor: colors.white, 
            padding: '30px', 
            borderRadius: '12px', 
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            maxWidth: '600px'
          }}>
            <h2 style={{ color: colors.secondaryGreen, borderBottom: `2px solid ${colors.lightGray}`, paddingBottom: '10px', marginBottom: '20px' }}>
              Personal Information
            </h2>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: '600', color: colors.darkGray, marginBottom: '5px' }}>Full Name</label>
              <p style={{ padding: '10px', backgroundColor: colors.lightGray, borderRadius: '6px' }}>{user?.name || 'N/A'}</p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: '600', color: colors.darkGray, marginBottom: '5px' }}>Email Address</label>
              <p style={{ padding: '10px', backgroundColor: colors.lightGray, borderRadius: '6px' }}>{user?.email || 'N/A'}</p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: '600', color: colors.darkGray, marginBottom: '5px' }}>Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +254 712 345678"
                style={{ width: '100%', padding: '10px', border: `1px solid ${colors.lightGray}`, borderRadius: '6px', fontSize: '1rem', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: '600', color: colors.darkGray, marginBottom: '5px' }}>Farm Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Nairobi, Rift Valley"
                style={{ width: '100%', padding: '10px', border: `1px solid ${colors.lightGray}`, borderRadius: '6px', fontSize: '1rem', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '30px' }}>
              <label style={{ display: 'block', fontWeight: '600', color: colors.darkGray, marginBottom: '5px' }}>Account Type</label>
              <p style={{ display: 'inline-block', padding: '5px 15px', backgroundColor: '#e6f4ea', color: colors.primaryGreen, borderRadius: '20px', fontWeight: 'bold', fontSize: '0.85rem' }}>
                {user?.role?.toUpperCase() || 'FARMER'}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '15px' }}>
              <button 
                style={{ 
                  backgroundColor: colors.primaryGreen, 
                  color: colors.white, 
                  border: 'none', 
                  padding: '12px 25px', 
                  borderRadius: '8px', 
                  fontWeight: '600', 
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  opacity: isSaving ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  minWidth: '160px'
                }}
                disabled={isSaving}
                onClick={handleSaveProfile}
              >
                {isSaving && (
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    style={{ 
                      display: 'inline-block',
                      width: '16px',
                      height: '16px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTop: '2px solid white',
                      borderRadius: '50%'
                    }}
                  />
                )}
                {isSaving ? "Saving..." : "Save Changes"}
              </button>

              {!isSaving && (
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(true)}
                  style={{
                    backgroundColor: 'transparent',
                    color: colors.darkGray,
                    border: `1px solid ${colors.lightGray}`,
                    padding: '12px 25px',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              )}
            </div>

            {/* Security Settings Section */}
            <div style={{ marginTop: '40px', borderTop: `1px solid ${colors.lightGray}`, paddingTop: '20px' }}>
              <h2 style={{ color: colors.secondaryGreen, paddingBottom: '10px', marginBottom: '20px' }}>
                Security Settings
              </h2>

              <PasswordInput 
                label="Current Password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
              />

              <PasswordInput 
                label="New Password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setPasswordStrength(calculatePasswordStrength(e.target.value));
                }}
                autoComplete="new-password"
                showStrengthMeter={true}
                strengthScore={passwordStrength}
              />

              <PasswordInput 
                label="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />

              <button
                disabled={isUpdatingPassword}
                onClick={handleUpdatePassword}
                style={{
                  backgroundColor: colors.primaryGreen,
                  color: colors.white,
                  border: 'none',
                  padding: '12px 25px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: isUpdatingPassword ? 'not-allowed' : 'pointer',
                  opacity: isUpdatingPassword ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  minWidth: '180px'
                }}
              >
                {isUpdatingPassword && (
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    style={{
                      display: 'inline-block',
                      width: '16px',
                      height: '16px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTop: '2px solid white',
                      borderRadius: '50%'
                    }}
                  />
                )}
                {isUpdatingPassword ? "Updating..." : "Update Password"}
              </button>
            </div>

            {/* Danger Zone Section */}
            <div style={{ marginTop: '40px', borderTop: `1px solid ${colors.lightGray}`, paddingTop: '20px' }}>
              <h3 style={{ color: '#d32f2f', fontSize: '1rem', marginBottom: '10px' }}>Danger Zone</h3>
              <p style={{ color: '#666', fontSize: '0.85rem', marginBottom: '15px' }}>Once you delete your account, there is no going back. All your information will be wiped immediately.</p>
              <button 
                onClick={() => setShowDeleteConfirm(true)}
                style={{ 
                  backgroundColor: 'transparent', 
                  color: '#d32f2f', 
                  border: '1px solid #d32f2f', 
                  padding: '10px 20px', 
                  borderRadius: '8px', 
                  fontWeight: '600', 
                  cursor: 'pointer' 
                }}
              >
                Delete Account
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Profile;