const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const expenseSchema = new Schema({
  groupId: {
    type: Schema.Types.ObjectId,
    ref: 'Group',
    required: function() {
      return this.expenseType !== 'PERSONAL'; // Require groupId if expenseType is not 'PERSONAL'
    }
  },
  expenseName: {
    type: String,
    required: true
  },
  upiid: {
    type: String,
  },
  expenseType: {
    type: String,
    required: true,
    enum: ['GROUP', 'PERSONAL'] // Define possible expense types
  },
  expenseMembers: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    default: null,
    required: function() {
      return this.expenseType !== 'PERSONAL'; // Require expenseMembers if expenseType is not 'PERSONAL'
    }
  },
  expenseAmount: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model('Expense', expenseSchema);
