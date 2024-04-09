const cors = require('cors');
const multer = require('multer');
// const upload = multer({ dest: 'resumes/' });
const mongoose = require('mongoose');
const { GridFsStorage } = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const { Query } = require('./models/queryModel');
const { JobApplication } = require('./models/jobApplicationModel');
const { Contact } = require('./models/contactModel');
const { GetInTouch } = require('./models/getIntouchModel');
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const { ObjectId } = require('mongoose').Types;

require('dotenv').config();
mongoose.connect(`${process.env.MONGODB_URI}`);
const conn = mongoose.connection;

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

let gfs;
const uploadDirectory = './uploads';
conn.once('open', () => {
	gfs = Grid(conn.db, mongoose.mongo);
	gfs.collection('uploads');
});
const storage = multer.diskStorage({
	destination: uploadDirectory,
	filename: function (req, file, cb) {
		const uniqueFilename = uuidv4(); // Generate a unique filename
		cb(null, uniqueFilename + '.pdf'); // Append .pdf extension to the filename
	},
});
const upload = multer({ storage });
// Create a user schema
const userSchema = new mongoose.Schema({
	userName: {
		type: String,
		required: true,
		unique: true,
	},
	password: {
		type: String,
		required: true,
	},
});

// Create a user model
const User = mongoose.model('User', userSchema);

app.get('/', async (req, res) => {
	res.json({ message: 'Hi qubicgen api iss working' });
});
// Create a route for signing up
// app.post('/api/signup', async (req, res) => {
// 	const { userName, password } = req.body;

// 	// Hash the password
// 	const hashedPassword = await bcrypt.hash(password, 10);

// 	// Create a new user
// 	const user = new User({
// 		userName,
// 		password: hashedPassword,
// 	});

// 	// Save the user to the database
// 	await user.save();

// 	// Send a success response
// 	res.status(200).json({ message: 'User created successfully' });
// });

app.post('/api/login', (request, response) => {
	console.log(request.body);
	// check if userName exists
	User.findOne({ userName: request.body.userName })

		// if userName exists
		.then((user) => {
			// compare the password entered and the hashed password found
			bcrypt
				.compare(request.body.password, user.password)

				// if the passwords match
				.then((passwordCheck) => {
					// check if password matches
					if (!passwordCheck) {
						return response.status(400).send({
							message: 'Passwords does not match',
						});
					}

					//   create JWT token
					const token = jwt.sign(
						{
							userId: user._id,
							userName: user.userName,
						},
						'RANDOM-TOKEN',
						{ expiresIn: '24h' }
					);

					//   return success response
					response.status(200).send({
						message: 'Login Successful',
						userName: user.userName,
						token,
					});
				})
				// catch error if password does not match
				.catch((error) => {
					response.status(400).send({
						message: 'Passwords does not match',
						error,
					});
				});
		})
		// catch error if userName does not exist
		.catch((e) => {
			response.status(400).send({
				message: 'userName not found',
				e,
			});
		});
});

// Create a route for verifying the token and sending a boolean value

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
	host: 'smtp.hostinger.com',
	port: 587,
	secure: false, // true for 465, false for other ports
	auth: {
		user: `${process.env.EMAIL_SMTP}`,
		pass: `${process.env.EMAIL_SMTP_PASS}`, // your password
	},
});

app.post('/api/queries', async (req, res) => {
	try {
		console.log(req.body);
		const newQuery = new Query(req.body);
		const savedQuery = await newQuery.save();

		// Send email to client
		const clientMailOptions = {
			from: 'support@qubicgen.com',
			to: `${req.body.email}`,
			subject: 'Query Received',
			html: `
			<html>
			<head>
					<style>
							body {
									font-family: Arial, sans-serif;
									margin: 0;
									padding: 0;
							}
							.header {
									text-align: center;
									background-color: #f8f8f8;
							}
							.body-content {
									padding: 20px;
							}
							.footer {
									text-align: center;
									background-color: #f8f8f8;
									padding: 10px;
									margin-top: 20px;
							}
					</style>
			</head>
			<body>


					<div class="header">
							<img src="cid:headerImage" alt="QubicGen Header" style="width: 10%; height: 10%;>
					</div>
					<div class="body-content">
							<p>Dear ${req.body.firstName} ${req.body.lastName},</p>
							<p>

							Thank you for reaching out to us with your query through our "Any Queries?" form. Your questions and feedback are important to us, and we're here to provide the answers and assistance you need. 
							</p>

							<p>

							Our team is currently reviewing your submission, and we aim to get back to you as soon as possible, typically within 24 hours. We appreciate your patience and are committed to ensuring you receive a thorough and thoughtful response. 
							</p>

							<p>

							For immediate assistance, feel free to contact us directly at <a href="mailto:support@qubicgen.com">support@qubicgen.com</a>
							</p>
							<h2>Additional Information:</h2>
							<ul>
									<li>Query Details: ${req.body.message}</li>
							</ul>
							<p>Best regards,</p>
							<p>The QubicGen Team</p>
					</div>

					<div class="footer">
    <p>Warm regards,</p>
    <p>The QubicGen Team</p>
    <p>Mail: <a href="mailto:support@qubicgen.com">support@qubicgen.com</a></p>
    <p>Mob. No: <a href="tel:+919649749845">+91 9649749845</a></p>
    <p><a href="https://www.qubicgen.com">www.qubicgen.com</a></p>
</div>

			</body>
			</html>
			`,
			attachments: [
				{
					filename: 'Qubicbg.png',
					path: 'images/Qubicbg.png',
					cid: 'headerImage',
				},
			],
		};

		await transporter.sendMail(clientMailOptions);

		// Send email to yourself
		const selfMailOptions = {
			from: 'support@qubicgen.com',
			to: 'support@qubicgen.com', // your email
			subject: 'New Query Received',
			text: 'A new query has been received. Check your admin panel for details.',
		};
		await transporter.sendMail(selfMailOptions);

		res.status(201).json(savedQuery);
	} catch (error) {
		console.log(error);
		res.status(400).json({ message: error.message });
	}
});

const type = upload.single('resume');
app.post('/api/upload', type, (req, res) => {
	try {
		if (!req.file) {
			return res.status(400).json({ message: 'No file uploaded' });
		}

		res.status(200).json({
			message: 'File uploaded successfully',
			fileName: req.file.filename,
		});
	} catch (error) {
		console.log(error);
		res.status(400).json({ message: error.message });
	}
});

app.get('/api/resume-download', (req, res) => {
	try {
		const { fileName } = req.query;
		const filePath = `${uploadDirectory}/${fileName}`;
		console.log(filePath);
		// Check if the file exists
		if (!fs.existsSync(filePath)) {
			return res.status(404).json({ message: 'Resume not found' });
		}

		// Set appropriate headers for downloading the file
		res.set({
			'Content-Type': 'application/pdf',
			'Content-Disposition': `attachment; filename="${fileName}"`,
		});

		// Send the file as the response
		fs.createReadStream(filePath).pipe(res);
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: 'Internal server error' });
	}
});
app.post('/api/job-application', async (req, res) => {
	try {
		console.log(req.body, 'rekljaaaaa');

		// Check for duplicate email
		const existingJobApplication = await JobApplication.findOne({
			email: req.body.email,
		});
		if (existingJobApplication.selectedJobRole === req.body.selectedJobRole) {
			return res
				.status(400)
				.json({ message: 'Already Applied' });
		}

		const newJobApplication = new JobApplication(req.body);
		// newJobApplication.resume = req.file._id || req.file.id;
		const savedJobApplication = await newJobApplication.save();

		// Send email to client
		const clientMailOptions = {
			from: 'support@qubicgen.com',
			to: `${req.body.email}`,
			subject: 'Job Application Received',
			html: `
			<html>
			<head>
					<style>
							body {
									font-family: Arial, sans-serif;
									margin: 0;
									padding: 0;
							}
							.header {
									text-align: center;
							}
							.body-content {
									padding: 20px;
							}
							.footer {
									text-align: center;
									background-color: #f8f8f8;
									padding: 10px;
									margin-top: 20px;
							}
					</style>
			</head>
			<body>
					<div class="header">
							<img src="cid:headerImage" alt="QubicGen Header" style="width: 10%; height: 10%;>
					</div>
					<div class="body-content">
							<p>Dear ${req.body.fullName},</p>
							<p>Thank you for submitting your job application. We have successfully received it and our hiring team will carefully review your application.</p>
							<p>We appreciate your interest in joining our team and will be in touch with you regarding the next steps in the recruitment process.</p>
							<h2>Additional Information:</h2>
							<ul>
									<li>Position Applied For: ${req.body.selectedJobRole}</li>
									<li>Experience: ${req.body.workExperience.experienceLevel} years</li>
									<li>Education: ${req.body.education.level} </li>
							</ul>
							<p>Feel free to reach out to us if you have any questions or require further assistance.</p>
							<p>Best regards,</p>
							<p>The QubicGen Hiring Team</p>
					</div>
					<div class="footer">
							<p>Warm regards,</p>
							<p>The QubicGen Hiring Team</p>
					</div>
			</body>
			</html>
			`,
			attachments: [
				{
					filename: 'Qubicbg.png',
					path: 'images/Qubicbg.png',
					cid: 'headerImage',
				},
			],
		};

		await transporter.sendMail(clientMailOptions);

		// Send email to yourself
		const selfMailOptions = {
			from: 'support@qubicgen.com',
			to: 'support@qubicgen.com', // your email
			subject: `New Job Application Received - ${req.body.fullName}`,
			text: `A new job application has been received. Check your admin panel for details from ${req.body.email}.`,
		};
		await transporter.sendMail(selfMailOptions);

		res.status(201).json(savedJobApplication);
	} catch (error) {
		res.status(400).json({ message: error.message });
	}
});

app.post('/api/contact', async (req, res) => {
	try {
		console.log(req.body);

		const newContact = new Contact(req.body);
		const savedContact = await newContact.save();

		// Send email to client
		const clientMailOptions = {
			from: 'support@qubicgen.com',
			to: `${req.body.email}`,
			subject: 'Contact Form Received',
			html: `
			<html>
			<head>
					<style>
							body {
									font-family: Arial, sans-serif;
									margin: 0;
									padding: 0;
							}
							.header {
									text-align: center;
							}
							.body-content {
									padding: 20px;
							}
							.footer {
									text-align: center;
									background-color: #f8f8f8;
									padding: 10px;
									margin-top: 20px;
							}
					</style>
			</head>
			<body>
					<div class="header">
							<img src="cid:headerImage" alt="QubicGen Header" style="width: 10%; height: 10%;">
					</div>
					<div class="body-content">
							<p>Dear ${req.body.fullName},</p>
							<p>Thank you for reaching out to us. We appreciate your interest in our services.</p>
							<p>We have received your contact form and our team will review it promptly.</p>
							<p>If you have any further questions or concerns, please don't hesitate to reach out to us.</p>
							<h2>Contact Form Details:</h2>
							<ul>
									<li>Contact Type: ${req.body.type}</li>
									<li>Contact Message: ${req.body.message}</li>
							</ul>
							<p>Best regards,</p>
							<p>The QubicGen Team</p>
					</div>
					<div class="footer">
							<p>Warm regards,</p>
							<p>The QubicGen Team</p>
					</div>
			</body>
			</html>
			`,
			attachments: [
				{
					filename: 'Qubicbg.png',
					path: 'images/Qubicbg.png',
					cid: 'headerImage',
				},
			],
		};

		await transporter.sendMail(clientMailOptions);

		// Send email to yourself
		const selfMailOptions = {
			from: 'support@qubicgen.com',
			to: 'support@qubicgen.com',
			subject: 'New Contact Form Received',
			text: `A new contact form has been received. Check your admin panel for details. From ${req.body.email}`,
		};
		await transporter.sendMail(selfMailOptions);

		res.status(201).json(savedContact);
	} catch (error) {
		console.log(error);
		res.status(400).json({ message: error.message });
	}
});

app.post('/api/getInTouch', async (req, res) => {
	try {
		console.log(req.body);

		const newGetInTouch = new GetInTouch(req.body);
		const savedGetInTouch = await newGetInTouch.save();
		console.log(savedGetInTouch);

		// Send email to client
		const clientMailOptions = {
			from: 'support@qubicgen.com',
			to: `${req.body.email}`,
			subject: 'Get In Touch Form Received',
			html: `
			<html>
			<head>
					<style>
							body {
									font-family: Arial, sans-serif;
									margin: 0;
									padding: 0;
							}
							.header {
									text-align: center;
							}
							.body-content {
									padding: 20px;
							}
							.footer {
									text-align: center;
									background-color: #f8f8f8;
									padding: 10px;
									margin-top: 20px;
							}
					</style>
			</head>
			<body>
					<div class="header">
							<img src="cid:headerImage" alt="QubicGen Header" style="width: 10%; height: 10%;">
					</div>
					<div class="body-content">
							<p>Dear ${req.body.fullName},</p>
							<p>Thank you for contacting us through the Get In Touch form.</p>
							<p>We have received your message and will respond promptly.</p>
							<p>We value your interest in our services and look forward to assisting you further.</p>
							<h2>Get In Touch Form Details:</h2>
							<ul>
									<li>Contact Message: ${req.body.message}</li>
							</ul>
							<p>Best regards,</p>
							<p>The QubicGen Team</p>
					</div>
					<div class="footer">
							<p>Warm regards,</p>
							<p>The QubicGen Team</p>
					</div>
			</body>
			</html>
			`,
			attachments: [
				{
					filename: 'Qubicbg.png',
					path: 'images/Qubicbg.png',
					cid: 'headerImage',
				},
			],
		};

		await transporter.sendMail(clientMailOptions);

		// Send email to yourself
		const selfMailOptions = {
			from: 'support@qubicgen.com',
			to: 'support@qubicgen.com', // your email
			subject: 'New Get In Touch Form Received',
			text: 'A new get in touch form has been received. Check your admin panel for details.',
		};
		await transporter.sendMail(selfMailOptions);

		res.status(201).json(savedGetInTouch);
	} catch (error) {
		res.status(400).json({ message: error.message });
	}
});

app.get('/api/fetchData', async (req, res) => {
	console.log('here in fetchData');
	try {
		const token = req.headers.authorization?.split('Bearer ')[1]; // Fix token extraction

		if (!token) {
			return res.status(401).json({ message: 'Unauthorized' });
		}

		jwt.verify(token, 'RANDOM-TOKEN', async (err, decoded) => {
			if (err) {
				return res.status(401).json({ message: 'Unauthorized' });
			}
			const queries = await Query.find({});
			const jobApplications = await JobApplication.find({});
			const contacts = await Contact.find({});
			const getInTouches = await GetInTouch.find({});
			const data = { queries, jobApplications, contacts, getInTouches };
			res.status(200).json(data);
		});
	} catch (error) {
		res.status(400).json({ message: error.message });
	}
});

app.listen(port, () => {
	console.log(`Server is running on http://localhost:${port}`);
});
