import React from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

class Dashboard extends React.Component {
  render() {
    return (
      <div className="container mt-5">
        <h2 className="text-center mb-4">Dashboard</h2>
        
        <div className="row mb-4">
          <div className="col text-center">
            <Link to="/expense-tracker">
              <button className="btn btn-primary mx-2">Expense Management</button>
            </Link>
            <Link to="/bill-splitter">
              <button className="btn btn-secondary mx-2">Bill Splitter</button>
            </Link>
          </div>
        </div>
      </div>
    );
  }
}

export default Dashboard;
