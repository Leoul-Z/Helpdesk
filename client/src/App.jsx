import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Tickets from './pages/Tickets';
import TicketDetail from './pages/TicketDetail';
import NewTicket from './pages/NewTicket';
import Register from './pages/Register';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('accessToken');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Navigate to="/dashboard" />} />
        
        <Route path="/dashboard" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />
        
        <Route path="/tickets" element={
          <PrivateRoute>
            <Tickets />
          </PrivateRoute>
        } />
        
        <Route path="/new-ticket" element={
          <PrivateRoute>
            <NewTicket />
          </PrivateRoute>
        } />
        
        <Route path="/tickets/:id" element={
          <PrivateRoute>
            <TicketDetail />
          </PrivateRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
