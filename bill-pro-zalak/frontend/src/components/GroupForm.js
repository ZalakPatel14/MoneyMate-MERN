import React from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const GroupForm = ({ onGroupAdded }) => {
  const navigate = useNavigate();

  const [state, setState] = React.useState({
    groupName: '',
    members: [{ name: '', email: '' }],
    error: '',
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleMemberChange = (event, index) => {
    const { name, value } = event.target;
    const updatedMembers = [...state.members];
    updatedMembers[index] = { ...updatedMembers[index], [name]: value };
    setState((prevState) => ({
      ...prevState,
      members: updatedMembers,
    }));
  };

  const handleAddMember = () => {
    setState((prevState) => ({
      ...prevState,
      members: [...prevState.members, { name: '', email: '' }],
    }));
  };

  const handleRemoveMember = (index) => {
    const updatedMembers = [...state.members];
    updatedMembers.splice(index, 1);
    setState((prevState) => ({
      ...prevState,
      members: updatedMembers,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { groupName, members } = state;
    try {
      const response = await axios.post('http://localhost:5000/api/groups', {
        groupName,
        members,
      });
      console.log('Group added:', response.data);

      alert('Group added');
      navigate('/bill-splitter');

      if (onGroupAdded) {
        onGroupAdded();
      }
    } catch (error) {
      console.error('Error adding group:', error);
      setState((prevState) => ({
        ...prevState,
        error: 'Failed to add group',
      }));
    }
  };

  return (
    <div className="container mt-5">
   <div className="row justify-content-center">
      <div className="col-sm-10">
      <h2 className="text-center mb-4">Add Group</h2>
      <form onSubmit={handleSubmit} className="needs-validation" noValidate>
        <div className="form-group col-sm-11 mb-3">
          <label htmlFor="groupName">Group Name:</label>
          <input
            type="text"
            className="form-control"
            id="groupName"
            name="groupName"
            value={state.groupName}
            onChange={handleChange}
            required
          />
        </div>

        {state.members.map((member, index) => (
          <div key={index} className="form-group row align-items-end mb-3">
            <div className="col-md-5">
              <label htmlFor={`memberName-${index}`}>Member Name:</label>
              <input
                type="text"
                className="form-control"
                id={`memberName-${index}`}
                name="name"
                value={member.name}
                onChange={(e) => handleMemberChange(e, index)}
                required
              />
            </div>
            <div className="col-md-5">
              <label htmlFor={`memberEmail-${index}`}>Member Email:</label>
              <input
                type="email"
                className="form-control"
                id={`memberEmail-${index}`}
                name="email"
                value={member.email}
                onChange={(e) => handleMemberChange(e, index)}
                required
              />
            </div>
            <div className="col-md-2">
              {/* Icon for remove, disabled for first row */}
              {index === 0 ? (
                <i className="fa fa-times fa-lg text-secondary" style={{ cursor: 'not-allowed' }} />
              ) : (
                <i className="fa fa-times fa-lg text-danger" style={{ cursor: 'pointer' }} onClick={() => handleRemoveMember(index)} />
              )}
            </div>
          </div>
        ))}

        <div className="row form-group">
        <div className="col-md-4">
          <button
            type="button"
            className="btn btn-success mb-3"
            onClick={handleAddMember}
          >
            <i className="fa fa-plus mr-2"></i> Add Member
          </button>
          </div>
        </div>

      
        <div className="row form-group col-sm-11">
          <button type="submit" className="btn btn-secondary btn-block">
            Create Group
          </button>
        </div>
      </form>

      {state.error && <p className="text-danger mt-3">{state.error}</p>}
      </div>
      </div>
    </div>
  );
};

export default GroupForm;
