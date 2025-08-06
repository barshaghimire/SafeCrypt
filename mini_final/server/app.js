const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');

const app = express();
const PORT = 9000;

// Database connection
mongoose
  .connect('mongodb+srv://hello_admin:hello123@safecrypt.q4kd8.mongodb.net/safeCrypt?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));

// Define form schema and model
const formSchema = new mongoose.Schema({
  fullName: String,
  company: String,
  email: String,
  date: String,
  phone: String,
  service: String,
  message: String,
});

const Form = mongoose.model('Form', formSchema);

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public'))); // Serving static files

// Default route to pickup.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/pickup.html'));
});

// Route to serve thanku.html
app.get('/thanku.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/thanku.html'));
});

// Nodemailer setup
const transporter = nodemailer.createTransport({
  host: 'sandbox.smtp.mailtrap.io', // Replace with the "Host" value from Mailtrap
  port: 2525, // Use the "Port" value from Mailtrap
  auth: {
    user: '15a0c16464e2b4', // Replace with the "Username" value from Mailtrap
    pass: '45f11ab2f2230b', // Replace with the "Password" value from Mailtrap
  },
});

// Route to handle form submission
app.post('/submit', async (req, res) => {
  const { fullName, company, email, date, phone, service, message } = req.body;

  try {
    // Save data to the database
    const newForm = new Form({
      fullName,
      company,
      email,
      date,
      phone,
      service,
      message,
    });
    await newForm.save();

    // Send email notification
    const mailOptions = {
      from: 'sandbox.smtp.mailtrap.io', // Replace with your Gmail email
      to: email, // Send confirmation to the user
      subject: 'Form Submission Confirmation',
      text: `Thank you, ${fullName}, for submitting the form. We will get back to you soon!`,
    };

    await transporter.sendMail(mailOptions);

    // Redirect to the Thank-You page
    res.redirect('/thanku.html'); // Ensure thanku.html is in the public directory
  } catch (error) {
    console.error('Error saving data or sending email:', error);
    res.status(500).send('An error occurred. Please try again later.');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
