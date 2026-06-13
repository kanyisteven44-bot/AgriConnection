import { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as authService from "../services/authService";
import Navbar from "../components/Navbar";
import { colors } from '../constants/theme';
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/ToastContext";
import PasswordInput from "../components/PasswordInput";
import './Auth.css'; // Dedicated CSS for auth pages

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();

  const handleLogin = async () => {
    // Client-side validation
    if (!email || !password) {
      showToast("Email and password are required.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      showToast("Invalid email format.");
      return;
    }

    try {
      const data = await authService.loginUser(email, password);
  
      login(data.token, data.user);
      showToast("Welcome back!", "success");
      // Use a more subtle notification or redirect directly
      // alert("Login successful");
      navigate("/dashboard");
    } catch (err) {
      if (err.status === 403) {
        showToast("Account not verified. Please check your email for the code.");
        return;
      }
      showToast(err.message);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="auth-container card">
        <h2>Login</h2>

        <div className="form-group">
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
        </div>

        <PasswordInput
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          autoComplete="current-password"
        />

        <button className="auth-button" onClick={handleLogin}>Login</button>
      </div>
    </div>
  );
}

export default Login;