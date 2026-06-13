import { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as authService from "../services/authService";
import Navbar from "../components/Navbar";
import { colors } from '../constants/theme';
import { useToast } from "../components/ToastContext";
import PasswordInput from "../components/PasswordInput";
import './Auth.css'; // Dedicated CSS for auth pages
import { calculatePasswordStrength } from "../utils/authUtils";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const register = async () => {
    // Client-side validation
    if (!name || !email || !password) {
      showToast("All fields are required.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      showToast("Invalid email format.");
      return;
    }
    if (password.length < 6) {
      showToast("Password must be at least 6 characters long.");
      return;
    }

    try {
      await authService.registerUser({
        name,
        email,
        password
      });
      showToast("Registered successfully. Please log in.", "success");
      setTimeout(() => {
        navigate("/login"); // Redirect to login after successful registration
      }, 1500); // Give user time to read success message
    } catch (err) {
      showToast(err.message);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="auth-container card">
        <h2>Register</h2>

        <div className="form-group">
          <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
        </div>

        <div className="form-group">
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        </div>

        <PasswordInput
          placeholder="Password"
          value={password}
          onChange={e => {
            setPassword(e.target.value);
            setPasswordStrength(calculatePasswordStrength(e.target.value));
          }}
          showStrengthMeter={true}
          strengthScore={passwordStrength}
        />

        <button className="auth-button" onClick={register}>Create Account</button>
      </div>
    </div>
  );
}

export default Register;