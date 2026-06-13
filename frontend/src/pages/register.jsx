import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import Navbar from "../components/Navbar";
import { colors } from '../constants/theme';
import '../styles/Auth.css'; // Dedicated CSS for auth pages

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const register = async () => {
    setError(null);
    setSuccess(null);

    // Client-side validation
    if (!name || !email || !password) {
      setError("All fields are required.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Invalid email format.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    try {
      await API.post("/auth/register", {
        name,
        email,
        password
      });
      setSuccess("Registered successfully. Please log in.");
      setTimeout(() => {
        navigate("/login"); // Redirect to login after successful registration
      }, 1500); // Give user time to read success message
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    }
  };

  return (
    <div>
      <Navbar />
      <div className="auth-container card">
        <h2>Register</h2>

        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}

        <div className="form-group">
          <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
        </div>

        <div className="form-group">
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        </div>

        <div className="form-group">
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
        </div>

        <button className="auth-button" onClick={register}>Create Account</button>
      </div>
    </div>
  );
}

export default Register;