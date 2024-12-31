// frontend/src/components/BillSplitter.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Form, Row, Col } from 'react-bootstrap';

const BillSplitter = ({ token }) => {
  const [groups, setGroups] = useState([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [newMemberName, setNewMemberName] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [date, setDate] = useState('');

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/groups', { headers: { Authorization: `Bearer ${token}` } });
        setGroups(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchGroups();
  }, [token]);

  const addGroup = async () => {
    if (newGroupName) {
      try {
        const res = await axios.post('http://localhost:5000/api/groups', { name: newGroupName }, { headers: { Authorization: `Bearer ${token}` } });
        setGroups([...groups, res.data]);
        setNewGroupName('');
      } catch (err) {
        console.error(err);
      }
    }
  };

  const addMember = async (groupId) => {
    if (newMemberName) {
      try {
        const res = await axios.post(`http://localhost:5000/api/groups/${groupId}/members`, { name: newMemberName }, { headers: { Authorization: `Bearer ${token}` } });
        const updatedGroups = groups.map(group => group._id === groupId ? res.data : group);
        setGroups(updatedGroups);
        setNewMemberName('');
      } catch (err) {
        console.error(err);
      }
    }
  };

  const addExpense = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/expenses', { description, amount, type, date, groupId: selectedGroup }, { headers: { Authorization: `Bearer ${token}` } });
      console.log(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Bill Splitter 123</h2>
      <Form onSubmit={(e) => { e.preventDefault(); addGroup(); }}>
        <Form.Group controlId="formNewGroupName">
          <Form.Label>Group Name</Form.Label>
          <Form.Control type="text" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} />
        </Form.Group>
        <Button variant="primary" type="submit">Add Group</Button>
      </Form>
      <div>
        {groups.map(group => (
          <div key={group._id}>
            <h3>{group.name}</h3>
            <Form onSubmit={(e) => { e.preventDefault(); addMember(group._id); }}>
              <Form.Group controlId={`formNewMemberName-${group._id}`}>
                <Form.Label>Member Name</Form.Label>
                <Form.Control type="text" value={newMemberName} onChange={(e) => setNewMemberName(e.target.value)} />
              </Form.Group>
              <Button variant="primary" type="submit">Add Member</Button>
            </Form>
            <ul>
              {group.members && group.members.map(member => (
                <li key={member._id}>{member.name}</li>
              ))}
            </ul>
            <Button variant="secondary" onClick={() => setSelectedGroup(group._id)}>Select Group</Button>
          </div>
        ))}
      </div>
      {selectedGroup && (
        <div>
          <h2>Add Expense</h2>
          <Form onSubmit={addExpense}>
            <Form.Group as={Row} controlId="formDescription">
              <Form.Label column sm="2">Description</Form.Label>
              <Col sm="10">
                <Form.Control type="text" value={description} onChange={(e) => setDescription(e.target.value)} />
              </Col>
            </Form.Group>
            <Form.Group as={Row} controlId="formAmount">
              <Form.Label column sm="2">Amount</Form.Label>
              <Col sm="10">
                <Form.Control type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
              </Col>
            </Form.Group>
            <Form.Group as={Row} controlId="formType">
              <Form.Label column sm="2">Type</Form.Label>
              <Col sm="10">
                <Form.Control as="select" value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </Form.Control>
              </Col>
            </Form.Group>
            <Form.Group as={Row} controlId="formDate">
              <Form.Label column sm="2">Date</Form.Label>
              <Col sm="10">
                <Form.Control type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </Col>
            </Form.Group>
            <Button variant="primary" type="submit">Add Expense</Button>
          </Form>
        </div>
      )}
    </div>
  );
};

export default BillSplitter;
