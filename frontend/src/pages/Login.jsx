import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';

export default function Login() {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState('');
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.access_token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/');
    } catch (err) { setError(err.response?.data?.detail || 'Login failed'); }
  };
  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-lg w-96">
        <h1 className="text-2xl font-bold mb-6 text-blue-400">CRMind Login</h1>
        {error && <p className="text-red-400 mb-4">{error}</p>}
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 mb-4 bg-gray-700 rounded" required />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-2 mb-4 bg-gray-700 rounded" required />
        <button type="submit" className="w-full bg-blue-600 p-2 rounded hover:bg-blue-700">Login</button>
      </form>
    </div>
  );
}
