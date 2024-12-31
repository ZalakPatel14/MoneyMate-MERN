const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const User = require('./models/User');
const Expense = require('./models/Expense');
const Group = require('./models/Group');
const PaymentStatus = require('./models/PaymentStatus');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB Connected'))
  .catch(err => console.error(err));

// Register User
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    user = new User({ name, email, password });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    const payload = { user: { id: user.id } };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 360000 }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Login User
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const payload = { user: { id: user.id } };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 360000 }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});


// Get Expenses
app.get('/api/expenses', async (req, res) => {
  const { token } = req.headers;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.user.id;

    const expenses = await Expense.find({ user: userId });
    res.json(expenses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Create a new group
app.post('/api/groups', async (req, res) => {
  try {
    const { groupName, members } = req.body;

    // Example validation
    if (!groupName || !members) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Example logic to save group data to database
    const newGroup = new Group({ groupName, members });
    await newGroup.save();

    res.status(201).json(newGroup);
  } catch (err) {
   res.status(500).json({ message: 'Server Error' });
  }
});



// Endpoint to get all groups
app.get('/api/groups', async (req, res) => {
  try {
    const groups = await Group.find();
    res.json(groups);
  } catch (error) {
    console.error('Error fetching groups:', error);
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
});



app.get('/api/groups/:groupId/members', async (req, res) => {
  const { groupId } = req.params;
  try {
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    
    // Modify the response structure to include group details and members
    const response = {
      _id: group._id,
      groupName: group.groupName,
      members: group.members,
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching group members:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});



// Route to fetch expenses by group
app.get('/api/expenses/:groupId', async (req, res) => {
  const groupId = req.params.groupId;

  try {
    const expenses = await Expense.find({ groupId });
    res.json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});


// API endpoint to add an expense
// app.post('/api/expenses', async (req, res) => {
//   const { groupId, expenseName, upiid, expenseMembers, expenseAmount } = req.body;

//   try {
//     const newExpense = new Expense({
//       groupId,
//       expenseName,
//       upiid,
//       expenseMembers,
//       expenseAmount,
//     });

//     const savedExpense = await newExpense.save();
//     res.status(201).json(savedExpense);
//   } catch (error) {
//     console.error('Error adding expense:', error);
//     res.status(500).json({ message: 'Failed to add expense' });
//   }
// });

// POST endpoint to add an expense
app.post('/api/expenses', async (req, res) => {
  const { groupId, expenseName, upiid, expenseAmount, expenseType } = req.body;

  try {
    let expenseMembers = null; // Default to null for PERSONAL expenses

    // Set groupId and expenseMembers based on expenseType
    if (expenseType !== 'PERSONAL') {
      // Ensure groupId and expenseMembers are provided for GROUP expenses
      expenseMembers = req.body.expenseMembers || null;

      if (!groupId || !expenseMembers) {
        return res.status(400).json({ message: 'groupId and expenseMembers are required for GROUP expenses' });
      }
    }

    const newExpense = new Expense({
      groupId: expenseType !== 'PERSONAL' ? groupId : null,
      expenseName,
      upiid,
      expenseMembers: expenseType !== 'PERSONAL' ? expenseMembers : null,
      expenseAmount,
      expenseType
    });

    const savedExpense = await newExpense.save();
    res.status(201).json(savedExpense);
  } catch (error) {
    console.error('Error adding expense:', error);
    res.status(500).json({ message: 'Failed to add expense' });
  }
});



app.get('/api/get_expense/:expenseId', async (req, res) => {
  const { expenseId } = req.params;

  try {
    // Fetch the expense by ID
    const expense = await Expense.findById(expenseId);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Fetch the group details using the groupId from the expense
    const group = await Group.findById(expense.groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Fetch payment status for each member
    const memberPayments = await PaymentStatus.find({ expenseId });

    // Map member IDs from expense to member names in the group
    const members = expense.expenseMembers.map(memberId => {
      const member = group.members.find(member => member._id.toString() === memberId.toString());
      const paymentStatus = memberPayments.find(ps => ps.memberId.toString() === memberId.toString());
      return {
         _id: member ? member._id : null,
        name: member ? member.name : 'Unknown Member',
        amount: (expense.expenseAmount / expense.expenseMembers.length).toFixed(2),
        status: paymentStatus ? paymentStatus.status : 'unpaid'
      };
    });

    // Construct the response
    res.json({
      expenseName: expense.expenseName,
      groupId: expense.groupId,
      members
    });
  } catch (error) {
    console.error('Error fetching expense:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Route to update payment status
app.post('/api/payment-status', async (req, res) => {
  const { expenseId, groupId, memberId, status } = req.body;
  try {
    const paymentStatus = await PaymentStatus.findOneAndUpdate(
      { expenseId, groupId, memberId },
      { status },
      { upsert: true, new: true }
    );
    res.status(200).json(paymentStatus);
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ error: 'Failed to update payment status' });
  }
});


app.get('/api/personal_expenses', async (req, res) => {
  console.log("enter");
  try {
    const personalExpenses = await Expense.find({ expenseType: 'PERSONAL' });
    res.json(personalExpenses);
  } catch (error) {
    console.error('Error fetching personal expenses:', error);
    res.status(500).json({ message: 'Failed to fetch personal expenses' });
  }
});

app.post('/api/personal_expenses', async (req, res) => {
  const { expenseName, expenseAmount } = req.body;

  try {
    if (!expenseName || !expenseAmount) {
      return res.status(400).json({ message: 'Expense name and amount are required' });
    }

    const newPersonalExpense = new Expense({
      expenseName,
      expenseAmount,
      expenseType: 'PERSONAL', // Assuming it's a personal expense
      groupId: null, // Set groupId to null for personal expenses
      expenseMembers: null, // Set expenseMembers to null for personal expenses
    });

    const savedExpense = await newPersonalExpense.save();
    res.status(201).json(savedExpense);
  } catch (error) {
    console.error('Error adding personal expense:', error);
    res.status(500).json({ message: 'Failed to add personal expense' });
  }
});

app.delete('/api/personal_expenses/:id', async (req, res) => {
  const expenseId = req.params.id;

  try {
    const deletedExpense = await Expense.findByIdAndDelete(expenseId);
    
    if (deletedExpense) {
      res.status(200).json({ message: 'Expense deleted successfully', deletedExpense });
    } else {
      res.status(404).json({ message: 'Expense not found' });
    }
  } catch (error) {
    console.error('Error deleting personal expense:', error);
    res.status(500).json({ message: 'Failed to delete personal expense' });
  }
});

// New route to send invite email
app.post('/api/groups/:groupId/invite/:memberId', async (req, res) => {
  const { groupId, memberId } = req.params;
  console.log(req.params);
  try {
    // Fetch the group and member details
    const group = await Group.findById(groupId);
    const member = group.members.id(memberId); // Assuming members are sub-documents
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    // Configure Nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'zalaksuranizp@gmail.com', // Replace with your email
        pass: 'crpb ztmn nxkt aczg',  // Replace with your email password or app password
      },
    });
     const inviteUrl = `http://localhost:3000/register?groupId=${groupId}&email=${member.email}`;
    // Mail content
    const mailOptions = {
      from: 'zalaksuranizp@gmail.com', // Sender email
      to: member.email,                // Recipient email (from member data)
      subject: `You're invited to join the group: ${group.groupName}`,
      text: `Hello ${member.name},\n\nYou are invited to join the group "${group.groupName}". Here is your invite link:\n\n${inviteUrl}\n\nBest regards,\nYour Team`
    };
    // Send the email
    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: `Invitation email sent to ${member.name}` });
  } catch (error) {
    console.error('Error sending invitation:', error);
    res.status(500).json({ message: 'Failed to send invite' });
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
