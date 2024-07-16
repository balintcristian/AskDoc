import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";

const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: any) => {
    setLoading(true);
    e.preventDefault();

    try {
      if (password.length < 10)
        throw new Error("Password is too short, must be > 9 characters");
      await api.post("/user/register/", { username, password });
      alert("Succesfully made account!");
      navigate("/login");
    } catch (error) {
      alert(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <h1>Register</h1>
      <input
        className="form-input"
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
      />
      <input
        className="form-input"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      {loading && <div>Loading...</div>}
      <button className="form-button" type="submit">
        Register
      </button>
      <button className="form-button" type="button" onClick={() => navigate("/login")}>
        Login
      </button>
    </form>
  );
};

export default Register;
