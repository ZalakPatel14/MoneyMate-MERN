import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const SettlementPage = () => {
  const { expenseId } = useParams();
  const navigate = useNavigate();
  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExpense = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/get_expense/${expenseId}`);
        console.log(response.data);
        setExpense(response.data);
      } catch (err) {
        setError('Error fetching expense details');
      } finally {
        setLoading(false);
      }
    };

    fetchExpense();
  }, [expenseId]);

   const handleMarkAsPaid = async (memberId) => {
    try {
      await axios.post('http://localhost:5000/api/payment-status', {
        expenseId,
        groupId: expense.groupId,
        memberId,
        status: 'paid'
      });
      // Refresh the expense data
      const response = await axios.get(`http://localhost:5000/api/get_expense/${expenseId}`);
      setExpense(response.data);
    } catch (err) {
      console.error('Error marking as paid:', err);
    }
  };

  const handleBack = () => {
    navigate(`/add-expense/${expense.groupId}`); 
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Expense Details</h2>
      <button className="btn btn-secondary mb-3" style={{ float: 'right' }} onClick={handleBack}>Back</button>
      {expense && (
        <div>
          <table className="table table-bordered">
            <thead>
              <tr>
                <th colSpan="3" className="text-center">{expense.expenseName}</th>
              </tr>
              <tr>
                <th>Member</th>
                <th>Amount</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {expense.members && expense.members.length > 0 ? (
                expense.members.map((member, index) => (
                  <tr key={index}>
                    <td>{member.name}</td>
                    <td>${member.amount}</td>
                    <td>
                      {member.status === 'paid' ? (
                        <button className="btn btn-success" disabled>
                          Already Paid
                        </button>
                      ) : (
                        <button className="btn btn-primary" onClick={() => handleMarkAsPaid(member._id)}>
                          Mark as Paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center">No members available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SettlementPage;
