import React, { useState } from 'react';
import { colors } from '../constants/theme';

const PasswordInput = ({ 
  label, 
  value, 
  onChange, 
  placeholder = "••••••••", 
  autoComplete, 
  strengthScore, 
  showStrengthMeter = false 
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div style={{ marginBottom: '20px' }}>
      {label && <label style={{ display: 'block', fontWeight: '600', color: colors.darkGray, marginBottom: '5px' }}>{label}</label>}
      <div style={{ position: 'relative' }}>
        <input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          style={{ 
            width: '100%', 
            padding: '10px', 
            paddingRight: '45px', 
            border: `1px solid ${colors.lightGray}`, 
            borderRadius: '6px', 
            fontSize: '1rem', 
            outline: 'none', 
            boxSizing: 'border-box' 
          }}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          style={{
            position: 'absolute',
            right: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1.1rem',
            padding: '5px'
          }}
        >
          {showPassword ? '👁️' : '🔒'}
        </button>
      </div>
      {showStrengthMeter && value && (
        <div style={{ marginTop: '8px' }}>
          <div style={{ display: 'flex', gap: '4px', height: '4px', width: '100%', marginBottom: '4px' }}>
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                style={{
                  flex: 1,
                  borderRadius: '2px',
                  backgroundColor: strengthScore >= step 
                    ? (strengthScore <= 1 ? '#d32f2f' : strengthScore >= 3 ? colors.primaryGreen : colors.accentGold) 
                    : colors.lightGray,
                  transition: 'background-color 0.3s ease'
                }}
              />
            ))}
          </div>
          <small style={{ 
            color: strengthScore <= 1 ? '#d32f2f' : strengthScore === 2 ? colors.accentGold : colors.primaryGreen,
            fontWeight: '700',
            fontSize: '0.7rem'
          }}>
            {strengthScore === 1 && "Weak"}
            {strengthScore === 2 && "Fair"}
            {strengthScore === 3 && "Strong"}
            {strengthScore === 4 && "Very Strong"}
          </small>
        </div>
      )}
    </div>
  );
};

export default PasswordInput;