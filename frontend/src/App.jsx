import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Customers from './pages/Customers.jsx';
import CustomerDetail from './pages/CustomerDetail.jsx';
import EmailComposer from './pages/EmailComposer.jsx';
import Layout from './components/Layout.jsx';

export default function App() {
  const token = localStorage.getItem('token');
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={token ? <Navigate to="/" /> : <Login />} />
        <Route path="/" element={token ? <Layout><Dashboard /></Layout> : <Navigate to="/login" />} />
        <Route path="/customers" element={token ? <Layout><Customers /></Layout> : <Navigate to="/login" />} />
        <Route path="/customers/:id" element={token ? <Layout><CustomerDetail /></Layout> : <Navigate to="/login" />} />
        <Route path="/email" element={token ? <Layout><EmailComposer /></Layout> : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}
