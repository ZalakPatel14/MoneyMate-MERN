import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const GroupList = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);

  const fetchGroups = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/groups');
      setGroups(response.data);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleAddGroup = () => {
    navigate('/add-group');
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Groups</h1>
      <div className="d-flex justify-content-end mb-3">
        <button className="btn btn-primary" onClick={handleAddGroup}>Add Group</button>
      </div>
      
      <table className="table table-striped">
        <thead>
          <tr>
            <th scope="col">Group Name</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((group) => (
            <tr key={group._id}>
              <td>{group.groupName}</td>
              <td>
                <button className="btn btn-secondary" onClick={() => navigate(`/add-expense/${group._id}`)}>Add Expense</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GroupList;
