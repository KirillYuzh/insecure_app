import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signup } from "./api";

export default function SignupComponent() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await signup(username, email, name, password);
      navigate("/login/");
    } catch (error) {
      setError("Registration failed. Please try again.");
    }
  };

  return (
    <>
      <div className="card" style={{ marginTop: '4rem', marginLeft: 'auto', marginRight: 'auto', width: '20rem'}}>
        <form onSubmit={handleSubmit}>
          <h2 style={{ textAlign: 'center' }}>Sign Up</h2>
          <br/>
          {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
          <br/>
          <input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <br/>
          <br/>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <br/>
          <br/>
          <input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <br/>
          <br/>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <br/>
          <br/>
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <br/>
          <br/>
          <br/>
          <div style={{ marginLeft: 'auto', marginRight: 'auto', width: 'fit-content' }}>
            <button type="submit">Sign Up</button>
          </div>
        </form>
      </div>
      <h6 style={{ textAlign: 'center', marginTop: '1rem' }}>Already have an account? <a href='/login/' style={{ color: 'var(--silver)'}}>log in</a></h6>
    </>
  );
}