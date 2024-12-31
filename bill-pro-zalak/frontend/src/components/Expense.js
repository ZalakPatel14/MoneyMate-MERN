import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Form, Button, FormGroup, FormLabel, FormControl } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Expense = () => {
  const { groupId } = useParams(); // Extract groupId from URL params
  const [expenseName, setExpenseName] = useState('');
  const [upiid, setUPIID] = useState('');
  const [expenseMembers, setExpenseMembers] = useState([]);
  const [expenseAmount, setExpenseAmount] = useState('');
  const [groupMembers, setGroupMembers] = useState([]);
  const [setExpensesData, setExpenses] = useState([]);
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    group: '',
    paidBy: '',
    date: '',


  });
  const [loadingMembers, setLoadingMembers] = useState(true);

  useEffect(() => {
  const fetchExpensesByGroup = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/expenses/${groupId}`);
     
      // Check response structure and set expenses accordingly
      if (response.data && Array.isArray(response.data)) {
        console.log(response.data);
        setExpenses(response.data);
      } else {
        console.error('Invalid response structure:', response.data);
        // Optionally handle error state or set expenses to []
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
      // Optionally handle error state
    } finally {
      //setLoading(false); // Assuming you have a setLoading state to manage loading state
    }
  };

  if (groupId) {
    fetchExpensesByGroup();
  }
}, [groupId]);


  useEffect(() => {
    const fetchGroupMembers = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/groups/${groupId}/members`);
        // Check response structure and set groupMembers accordingly
        if (response.data && response.data.members && Array.isArray(response.data.members)) {
         setGroupMembers(response.data.members);
        } else {
          console.error('Invalid response structure:', response.data);
          // Optionally handle error state or set groupMembers to []
        }
      } catch (error) {
        console.error('Error fetching group members:', error);
        // Optionally handle error state
      } finally {
        setLoadingMembers(false);
      }
    };

    if (groupId) {
      fetchGroupMembers();
    }
  }, [groupId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (expenseMembers.length === 0) {
      alert('Please select at least one member for the expense.');
      return; // Exit early if no member is selected
    }
    try {
      const newExpense = {
        groupId,
        expenseName,
        upiid,
        expenseMembers,
        expenseAmount: parseFloat(expenseAmount),
        expenseType: 'GROUP'  
      };

      await axios.post('http://localhost:5000/api/expenses', newExpense);
      alert('Expense added successfully');
      window.location.reload(); 
      // Optionally, redirect or clear form fields
      setExpenseName('');
      setUPIID('');
      setExpenseMembers([]);
      setExpenseAmount('');
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };

  const sendInviteEmail = async (memberId) => {
  try {
    const response = await axios.post(`http://localhost:5000/api/groups/${groupId}/invite/${memberId}`);
    alert(response.data.message); // Success message when email is sent
  } catch (error) {
    console.error('Error sending invite:', error);
    alert('Failed to send invite.');
  }
};

  return (
    <div className="container mt-5">
    <div className="row">
    <div className="col-md-6">
          <h2 className="mb-4">Your Expenses</h2>
          <hr className="hr" />
          
         <table className="table table-bordered">
        <thead>
          <tr>
            <th>Expense</th>
            <th>Amount</th>
            <th>Settlement</th>
          </tr>
        </thead>
        <tbody>
        {setExpensesData.length > 0 ? (
          setExpensesData.map((expense) => (
            <tr key={expense._id}>
              <td>{expense.expenseName}</td>
              <td>${expense.expenseAmount}</td>
              <td>
                <Link to={`/settlement/${expense._id}`} className="btn btn-primary">
                  Settlement
                </Link>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="3" className="text-center">No expenses, Add Now</td>
          </tr>
        )}
      </tbody>
      </table>
        </div>
         <div className="col-md-6">
      <h2 className="mb-4">Add Expense</h2>
       <hr className="hr" />
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <FormLabel>Expense Name:</FormLabel>
          <FormControl
            type="text"
            value={expenseName}
            onChange={(e) => setExpenseName(e.target.value)}
            required
          />
        </FormGroup>
        <FormGroup>
          <FormLabel>UPI ID:</FormLabel>
          <FormControl
            type="text"
            value={upiid}
            onChange={(e) => setUPIID(e.target.value)}
            required
          />
        </FormGroup>
        <FormGroup>
          <FormLabel>Expense Amount:</FormLabel>
          <FormControl
            type="number"
            value={expenseAmount}
            onChange={(e) => setExpenseAmount(e.target.value)}
            required
          />
        </FormGroup>
        <FormGroup>
          <FormLabel>Member involed:</FormLabel>
          {loadingMembers ? (
            <p>Loading group members...</p>
          ) : (
            groupMembers.map((member) => (
              <Form.Check
                key={member._id}
                type="checkbox"
                id={member._id}
                label={member.name}
                onChange={(e) => {
                  if (e.target.checked) {
                    setExpenseMembers((prevMembers) => [...prevMembers, member._id]);
                  } else {
                    setExpenseMembers((prevMembers) =>
                      prevMembers.filter((memId) => memId !== member._id)
                    );
                  }
                }}
              />
            ))
          )}
        </FormGroup>
        <input type="hidden" name="expenseType" value="GROUP" />
        <Button variant="primary" type="submit">
          Add Expense
        </Button>
      </Form>
      </div>
    </div>
     <div className="row">

      <div className="col-md-6 mt-4">

  <h2 className="mb-4">Group Members</h2>
    <hr class="hr"></hr>
  <table className="table table-bordered">
    <thead>
      <tr>
        <th>Member Name</th>
        <th>Invite</th> 
      </tr>
    </thead>
    <tbody>
      {loadingMembers ? (
        <tr>
          <td colSpan="3" className="text-center">Loading members...</td>
        </tr>
      ) : groupMembers.length > 0 ? (
        groupMembers.map((member) => (
          <tr key={member._id}>
          <td>{member.name}</td>
          <td>
            <Button
              variant="primary"
              onClick={() => sendInviteEmail(member._id)}
            >
              Invite
            </Button>
          </td>
        </tr>
        ))
      ) : (
        <tr>
          <td colSpan="3" className="text-center">No members found</td>
        </tr>
      )}
    </tbody>
  </table>
</div>
    </div>
    </div>
   
  );
};

export default Expense;
