import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import Navbar from "../components/Navbar";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const register = async () => {
    try {
      await API.post("/auth/register", {
        name,
        email,
        password
      });
  
      alert("Registered successfully. Please log in.");
      navigate("/login"); // Redirect to login after successful registration
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div>
      <Navbar />

      <div className="container card" style={{ width: "300px" }}>
        <h2>Register</h2>

        <input placeholder="Name" onChange={e => setName(e.target.value)} />
        <br /><br />

        <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
        <br /><br />

        <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
        <br /><br />

        <button onClick={register}>Create Account</button>
      </div>
    </div>
  );
}

export default Register;