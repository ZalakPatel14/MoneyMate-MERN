// frontend/src/App.js
import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import Expense from './components/Expense';
// import BillSplitter from './components/BillSplitter';
import Header from './components/Header';
import 'bootstrap/dist/css/bootstrap.min.css';
import GroupForm from './components/GroupForm'; 
import GroupList from './components/GroupList'; 
import Settlement from './components/Settlement';
import ExpenseTracker from './components/ExpenseTracker';

const App = () => {
  const [token, setToken] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setToken(token);
    }
  }, []);

  const handleLogout = () => {
    setToken('');
    localStorage.removeItem('token');
  };

  return (
    <div className="App">
      <Header isLoggedIn={!!token} handleLogout={handleLogout} />
      <div className="container mt-5">
        <Routes>
          {!token ? (
            <Route path="*" element={<Auth setToken={setToken} />} />
          ) : (
            <>
              <Route path="/" element={<Dashboard />} />
              <Route path="/add-expense/:groupId" element={<Expense token={token} handleLogout={handleLogout} />} />
              <Route path="/bill-splitter" element={<GroupList token={token} handleLogout={handleLogout} />} />
           
            <Route path="/add-group" element={<GroupForm token={token} handleLogout={handleLogout} />} />
            <Route path="/settlement/:expenseId" element={<Settlement token={token} handleLogout={handleLogout} />} />
            <Route path="/expense-tracker" element={<ExpenseTracker token={token} handleLogout={handleLogout} />} />
            // </>
          )}
        </Routes>
      </div>
    </div>
  );
};

export default App;
