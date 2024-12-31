import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Auth = ({ setToken }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setToken(token);
    }
  }, [setToken]);

  const handleAuth = async (e) => {
    e.preventDefault();
    const endpoint = isRegister ? 'http://localhost:5000/api/register' : 'http://localhost:5000/api/login';
    const data = isRegister ? { name, email, password } : { email, password };

    if (isRegister && (!name || !email || !password)) {
      setError('Please fill in all fields');
      return;
    }

    try {
      const res = await axios.post(endpoint, data);
      const token = res.data.token;
      setToken(token);
      localStorage.setItem('token', token);
      setError('');
      navigate('/');
    } catch (err) {
      if (err.response && err.response.data && err.response.data.msg) {
        setError(err.response.data.msg);
      } else {
        setError('Server error');
      }
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: 'auto', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
      <h2>{isRegister ? 'Register' : 'Login'}</h2>
      <form onSubmit={handleAuth}>
        {isRegister && (
          <div style={{ marginBottom: '10px' }}>
            <label>Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', padding: '8px' }} />
          </div>
        )}
        <div style={{ marginBottom: '10px' }}>
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '8px' }} />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '8px' }} />
        </div>
        <button type="submit" style={{ backgroundColor: '#007bff', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer' }}>{isRegister ? 'Register' : 'Login'}</button>
        <button type="button" onClick={() => setIsRegister(!isRegister)} style={{ backgroundColor: '#dc3545', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', marginLeft: '10px' }}>
          {isRegister ? 'Switch to Login' : 'Switch to Register'}
        </button>
      </form>
      {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
    </div>
  );
};

export default Auth;
