import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import Navbar from "../components/Navbar";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const login = async () => {
    try {
      const res = await API.post("/auth/login", {
        email,
        password
      });
  
      localStorage.setItem("token", res.data.token);
      alert("Login successful");
      navigate("/dashboard");
    } catch (err) {
      if (err.response?.status === 403) {
        alert("Account not verified. Please check your email for the code.");
        return;
      }
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div>
      <Navbar />

      <div className="container card" style={{ width: "300px" }}>
        <h2>Login</h2>

        <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
        <br /><br />

        <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
        <br /><br />

        <button onClick={login}>Login</button>
      </div>
    </div>
  );
}

export default Login;