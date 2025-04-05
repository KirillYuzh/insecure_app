import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "./api";


export default function LoginComponent() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(username, password);
    navigate("/account/");
  };

  return (
    <>
      <div className="card" style={{ marginTop: '4rem', marginLeft: 'auto', marginRight: 'auto', width: '20rem'}}>
        <form onSubmit={handleSubmit}>
          <h2 style={{ textAlign: 'center' }}>Login</h2>
          <br/>
          <br/>
          <input
            placeholder="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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
          <br/>
          <div style={{ marginLeft: 'auto', marginRight: 'auto', width: 'fit-content' }}>
            <button type="submit">Log in</button>
          </div>
        </form>
      </div>
      <h6 style={{ textAlign: 'center', marginTop: '1rem' }}>Don't have an account? <a href='/signup/' style={{ color: 'var(--silver)'}}>sign up</a></h6>
    </>
  );
}