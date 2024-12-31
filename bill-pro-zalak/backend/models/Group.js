// Example Mongoose Schema for Group
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const groupSchema = new Schema({
  groupName: { type: String, required: true },
  members: [
    {
      name: { type: String, required: true },
      email: { type: String, required: true },
    },
  ],
});

const Group = mongoose.model('Group', groupSchema);
module.exports = Group;
