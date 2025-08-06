// const express = require('express');
// const multer = require('multer');
// const cors = require('cors');
// const fs = require('fs');
// const fsPromises = require('fs').promises;
// const path = require('path');
// const crypto = require('crypto');

// const app = express();
// const PORT = 5000;

// // Directories
// const uploadDir = path.join(__dirname, 'uploads');
// fsPromises.stat(uploadDir).catch(() => fsPromises.mkdir(uploadDir));

// // Middleware
// app.use(cors());
// app.use(express.json());
// app.use(express.static(path.join(__dirname, 'public')));

// // Multer setup for file uploads
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => cb(null, uploadDir),
//     filename: (req, file, cb) => cb(null, file.originalname),
// });
// const upload = multer({ storage });

// // Utility function for secure file deletion
// async function overwriteFile(filePath, passes = 3) {
//     const fileStats = await fsPromises.stat(filePath);
//     const size = fileStats.size;

//     for (let i = 0; i < passes; i++) {
//         const randomData = crypto.randomBytes(size);
//         await fsPromises.writeFile(filePath, randomData);
//     }
// }

// // Encryption Route
// app.post('/encrypt', upload.single('file'), async (req, res) => {
//     try {
//         const file = req.file;
//         const key = req.body.key;

//         if (!file || !key) {
//             return res.status(400).send('File and encryption key are required.');
//         }

//         const paddedKey = crypto.createHash('sha256').update(key).digest().slice(0, 32);
//         const iv = crypto.randomBytes(16);
//         const cipher = crypto.createCipheriv('aes-256-cbc', paddedKey, iv);

//         const input = fs.createReadStream(file.path);
//         const outputFilePath = file.path + '.enc';
//         const output = fs.createWriteStream(outputFilePath);

//         // Write IV and file extension metadata to the output
//         output.write(iv);
//         output.write(Buffer.from(path.extname(file.originalname).padEnd(16, '\0')));

//         input.pipe(cipher).pipe(output).on('finish', async () => {
//             res.download(outputFilePath, 'encrypted_file.enc', async () => {
//                 await fsPromises.unlink(file.path);
//                 await fsPromises.unlink(outputFilePath);
//             });
//         });

//         input.on('error', (err) => {
//             console.error('Error reading input file:', err);
//             res.status(500).send('Error encrypting file.');
//         });

//         output.on('error', (err) => {
//             console.error('Error writing output file:', err);
//             res.status(500).send('Error encrypting file.');
//         });
//     } catch (err) {
//         console.error('Encryption Error:', err);
//         res.status(500).send('An error occurred during encryption.');
//     }
// });

// // Decryption Route
// app.post('/decrypt', upload.single('file'), async (req, res) => {
//     try {
//         const file = req.file;
//         const key = req.body.key;

//         if (!file || !key) {
//             return res.status(400).send('File and decryption key are required.');
//         }

//         const paddedKey = crypto.createHash('sha256').update(key).digest().slice(0, 32);
//         const fileBuffer = await fsPromises.readFile(file.path);

//         const iv = fileBuffer.slice(0, 16);
//         const extBuffer = fileBuffer.slice(16, 32).toString().replace(/\0/g, '');
//         const encryptedData = fileBuffer.slice(32);

//         const decipher = crypto.createDecipheriv('aes-256-cbc', paddedKey, iv);
//         const outputFilePath = file.path + '.dec' + extBuffer;

//         const output = fs.createWriteStream(outputFilePath);

//         output.write(decipher.update(encryptedData));
//         output.end(decipher.final(), async () => {
//             res.download(outputFilePath, 'decrypted_file' + extBuffer, async () => {
//                 await fsPromises.unlink(file.path);
//                 await fsPromises.unlink(outputFilePath);
//             });
//         });

//         output.on('error', (err) => {
//             console.error('Error writing decrypted file:', err);
//             res.status(500).send('Error decrypting file.');
//         });
//     } catch (err) {
//         console.error('Decryption Error:', err);
//         res.status(500).send('An error occurred during decryption.');
//     }
// });

// // Wiping Routes
// app.post('/upload', upload.array('files'), (req, res) => {
//     const files = req.files.map((file) => file.originalname);
//     res.json({ files });
// });

// app.get('/files', async (req, res) => {
//     const files = await fsPromises.readdir(uploadDir);
//     res.json({ files });
// });

// app.post('/delete', async (req, res) => {
//     const { filename } = req.body;
//     const filePath = path.join(uploadDir, filename);

//     try {
//         await fsPromises.access(filePath);
//         await overwriteFile(filePath, 3);
//         await fsPromises.unlink(filePath);
//         res.json({ message: `${filename} deleted securely` });
//     } catch (error) {
//         console.error('Error deleting file:', error);
//         res.status(500).json({ error: 'Error deleting file' });
//     }
// });

// // Start the server
// app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));





const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const fsPromises = require('fs').promises;
const crypto = require('crypto');

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

// Directories
const uploadDir = path.join(__dirname, 'uploads');
fsPromises.stat(uploadDir).catch(() => fsPromises.mkdir(uploadDir));

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, file.originalname),
});
const upload = multer({ storage });

// Nodemailer setup
const transporter = nodemailer.createTransport({
  host: 'sandbox.smtp.mailtrap.io',
  port: 2525,
  auth: {
    user: '15a0c16464e2b4',
    pass: '45f11ab2f2230b',
  },
});

// Utility function for secure file deletion
async function overwriteFile(filePath, passes = 3) {
  const fileStats = await fsPromises.stat(filePath);
  const size = fileStats.size;

  for (let i = 0; i < passes; i++) {
    const randomData = crypto.randomBytes(size);
    await fsPromises.writeFile(filePath, randomData);
  }
}

// Routes
// Default route to pickup.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/pickup.html'));
});

// Route to serve thanku.html
app.get('/thanku.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/thanku.html'));
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
      from: 'sandbox.smtp.mailtrap.io',
      to: email,
      subject: 'Form Submission Confirmation',
      text: `Thank you, ${fullName}, for submitting the form. We will get back to you soon!`,
    };

    await transporter.sendMail(mailOptions);

    // Redirect to the Thank-You page
    res.redirect('/thanku.html');
  } catch (error) {
    console.error('Error saving data or sending email:', error);
    res.status(500).send('An error occurred. Please try again later.');
  }
});

// Encryption Route
app.post('/encrypt', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const key = req.body.key;

    if (!file || !key) {
      return res.status(400).send('File and encryption key are required.');
    }

    const paddedKey = crypto.createHash('sha256').update(key).digest().slice(0, 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', paddedKey, iv);

    const input = fs.createReadStream(file.path);
    const outputFilePath = file.path + '.enc';
    const output = fs.createWriteStream(outputFilePath);

    output.write(iv);
    output.write(Buffer.from(path.extname(file.originalname).padEnd(16, '\0')));

    input.pipe(cipher).pipe(output).on('finish', async () => {
      res.download(outputFilePath, 'encrypted_file.enc', async () => {
        await fsPromises.unlink(file.path);
        await fsPromises.unlink(outputFilePath);
      });
    });

    input.on('error', (err) => {
      console.error('Error reading input file:', err);
      res.status(500).send('Error encrypting file.');
    });

    output.on('error', (err) => {
      console.error('Error writing output file:', err);
      res.status(500).send('Error encrypting file.');
    });
  } catch (err) {
    console.error('Encryption Error:', err);
    res.status(500).send('An error occurred during encryption.');
  }
});

// Decryption Route
app.post('/decrypt', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const key = req.body.key;

    if (!file || !key) {
      return res.status(400).send('File and decryption key are required.');
    }

    const paddedKey = crypto.createHash('sha256').update(key).digest().slice(0, 32);
    const fileBuffer = await fsPromises.readFile(file.path);

    const iv = fileBuffer.slice(0, 16);
    const extBuffer = fileBuffer.slice(16, 32).toString().replace(/\0/g, '');
    const encryptedData = fileBuffer.slice(32);

    const decipher = crypto.createDecipheriv('aes-256-cbc', paddedKey, iv);
    const outputFilePath = file.path + '.dec' + extBuffer;

    const output = fs.createWriteStream(outputFilePath);

    output.write(decipher.update(encryptedData));
    output.end(decipher.final(), async () => {
      res.download(outputFilePath, 'decrypted_file' + extBuffer, async () => {
        await fsPromises.unlink(file.path);
        await fsPromises.unlink(outputFilePath);
      });
    });

    output.on('error', (err) => {
      console.error('Error writing decrypted file:', err);
      res.status(500).send('Error decrypting file.');
    });
  } catch (err) {
    console.error('Decryption Error:', err);
    res.status(500).send('An error occurred during decryption.');
  }
});

// Wiping Routes
app.post('/upload', upload.array('files'), (req, res) => {
  const files = req.files.map((file) => file.originalname);
  res.json({ files });
});

app.get('/files', async (req, res) => {
  const files = await fsPromises.readdir(uploadDir);
  res.json({ files });
});

app.post('/delete', async (req, res) => {
  const { filename } = req.body;
  const filePath = path.join(uploadDir, filename);

  try {
    await fsPromises.access(filePath);
    await overwriteFile(filePath, 3);
    await fsPromises.unlink(filePath);
    res.json({ message: `${filename} deleted securely` });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: 'Error deleting file' });
  }
});

// Start the server
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));

