import { Link, useNavigate } from 'react-router-dom';

export default function Layout({ children }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const logout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/login'); };

  return (
    <div className="flex min-h-screen">
      <nav className="w-64 bg-gray-900 p-4 flex flex-col">
        <h1 className="text-xl font-bold text-blue-400 mb-8">CRMind</h1>
        <Link to="/" className="py-2 hover:text-blue-300">Dashboard</Link>
        <Link to="/customers" className="py-2 hover:text-blue-300">Customers</Link>
        <Link to="/email" className="py-2 hover:text-blue-300">AI Email</Link>
        <div className="mt-auto">
          <p className="text-sm text-gray-400">{user.name} ({user.role})</p>
          <button onClick={logout} className="text-red-400 text-sm mt-2">Logout</button>
        </div>
      </nav>
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  );
}
