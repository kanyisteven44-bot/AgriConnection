import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import Navbar from "../components/Navbar";
import { colors } from '../constants/theme';
import '../styles/Auth.css'; // Dedicated CSS for auth pages

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const login = async () => {
    setError(null);

    // Client-side validation
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Invalid email format.");
      return;
    }

    try {
      const res = await API.post("/auth/login", {
        email,
        password
      });
  
      localStorage.setItem("token", res.data.token);
      // Use a more subtle notification or redirect directly
      // alert("Login successful");
      navigate("/dashboard");
    } catch (err) {
      if (err.response?.status === 403) {
        setError("Account not verified. Please check your email for the code.");
        return;
      }
      setError(err.response?.data?.message || "Login failed.");
    }
  };

  return (
    <div>
      <Navbar />
      <div className="auth-container card">
        <h2>Login</h2>

        {error && <p className="error-message">{error}</p>}

        <div className="form-group">
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        </div>

        <div className="form-group">
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
        </div>

        <button className="auth-button" onClick={login}>Login</button>
      </div>
    </div>
  );
}

export default Login;