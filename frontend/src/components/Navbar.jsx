import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav>
      <h2>🌾 AgriConnection</h2>

      <div>
        <Link to="/">Home</Link>
        <Link to="/marketplace">Marketplace</Link>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
      </div>
    </nav>
  );
}

export default Navbar;