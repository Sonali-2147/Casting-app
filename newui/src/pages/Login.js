import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';

export default function Login({ setIsAuthenticated }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:8004/api/method/login', {
        usr: username,
        pwd: password
      }, { withCredentials: true });

      if (response.data && response.data.message === 'Logged In') {
        setIsAuthenticated(true);
        toast.success('Login successful!');
        navigate('/upload');
      } else {
        toast.error('Invalid credentials');
      }
    } catch (error) {
      toast.error('Login failed. Check credentials or server.');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundImage: "url('https://img.freepik.com/free-vector/gradient-technological-background_23-2148884155.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <div
        style={{
          backgroundColor: 'white', // Fix typo 'whte' → 'white'
          padding: '24px',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          width: '100%',
          maxWidth: '400px'
        }}
      >
        <h2
          style={{
            fontSize: '24px',
            fontWeight: 'bold',
            marginBottom: '16px',
            textAlign: 'center'
          }}
        >
          Login
        </h2>
  
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            marginBottom: '12px',
            borderRadius: '6px',
            border: '1px solid #ccc',
            fontSize: '16px',
            outline: 'none'
          }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            marginBottom: '16px',
            borderRadius: '6px',
            border: '1px solid #ccc',
            fontSize: '16px',
            outline: 'none'
          }}
        />
  
        <button
          onClick={handleLogin}
          style={{
            width: '100%',
            backgroundColor: '#4f46e5',
            color: '#ffffff',
            padding: '10px',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            border: 'none'
          }}
        >
          Login
        </button>
      </div>
    </div>
  );
}  