// App.js
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Signup from './Signup'; // Kayıt sayfası
import Login from './login';
import Home from './home';
import Profil from './Profil';
import AdminProfil from './AdminProfil';
import ForgotPassword from './ForgotPassword ';
import CustomerPanel from './CustomerPanel';
import ProductPanel from './ProductPanel'
import LogPanel from './LogPanel'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<Signup />} />  
        <Route path="/" element={<Login />} />   
        <Route path="/home" element={<Home />} />   
        <Route path="/profil" element={<Profil />} />    
        <Route path="/adminprofil" element={<AdminProfil />} />    
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/customerpanel" element={<CustomerPanel />} />
        <Route path="/productpanel" element={<ProductPanel />} />
        <Route path="/logpanel" element={<LogPanel />} />
        <Route path="*" element={<div>404 - Sayfa Bulunamadı</div>} /> {/* Geçersiz URL'ler için */}
      </Routes>
    </Router>
  );
}

export default App;
