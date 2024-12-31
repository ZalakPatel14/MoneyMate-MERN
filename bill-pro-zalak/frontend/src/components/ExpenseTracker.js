import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ExpenseTracker = () => {
  const [personalExpenses, setPersonalExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expenseName, setExpenseName] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');

  useEffect(() => {
    const fetchPersonalExpenses = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/personal_expenses');
        setPersonalExpenses(response.data);
      } catch (error) {
        console.error('Error fetching personal expenses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPersonalExpenses();
  }, []);

  const handleAddExpense = async (e) => {
    e.preventDefault();

    if (!expenseName || !expenseAmount) {
      alert('Please fill in all fields.');
      return;
    }

    try {
      const newExpense = {
        expenseName,
        expenseAmount: parseFloat(expenseAmount),
        expenseType: 'PERSONAL'
      };

      const response = await axios.post('http://localhost:5000/api/personal_expenses', newExpense);
      console.log('Expense added successfully:', response.data);

      // Update the local state with the new expense
      setPersonalExpenses([...personalExpenses, response.data]);

      // Clear form fields
      setExpenseName('');
      setExpenseAmount('');
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    try {
      await axios.delete(`http://localhost:5000/api/personal_expenses/${expenseId}`);
      // Remove the deleted expense from the state
      setPersonalExpenses(personalExpenses.filter((expense) => expense._id !== expenseId));
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-md-6">
          <h2 className="mb-4">Personal Expenses</h2>
          <table className="table table-bordered mb-4">
            <thead>
              <tr>
                <th>Expense Name</th>
                <th>Amount</th>
                <th>Delete</th> {/* New Delete Column */}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="3">Loading...</td>
                </tr>
              ) : personalExpenses.length > 0 ? (
                personalExpenses.map((expense) => (
                  <tr key={expense._id}>
                    <td>{expense.expenseName}</td>
                    <td>${expense.expenseAmount}</td>
                    <td>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDeleteExpense(expense._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3">No personal expenses found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="col-md-6">
          <h2 className="mb-4">Add Expense</h2>
          {/* Form for adding expenses */}
          <form onSubmit={handleAddExpense}>
            <div className="form-group">
              <label htmlFor="expenseName">Expense Name:</label>
              <input
                type="text"
                className="form-control"
                id="expenseName"
                value={expenseName}
                onChange={(e) => setExpenseName(e.target.value)}
                required
              />
            </div>
            <div className="form-group mb-2">
              <label htmlFor="expenseAmount">Expense Amount:</label>
              <input
                type="number"
                className="form-control"
                id="expenseAmount"
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary mb-2">
              Add Expense
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ExpenseTracker;
