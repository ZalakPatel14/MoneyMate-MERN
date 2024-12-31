const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const paymentStatusSchema = new Schema({
  expenseId: {
    type: Schema.Types.ObjectId,
    ref: 'Expense',
    required: true
  },
  groupId: {
    type: Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  memberId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['paid', 'unpaid'],
    default: 'unpaid'
  }
});

module.exports = mongoose.model('PaymentStatus', paymentStatusSchema);
