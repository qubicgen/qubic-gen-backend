const cors = require('cors');
const mongoose = require('mongoose');
const { Query } = require('./models/queryModel');
const { JobApplication } = require('./models/jobApplicationModel');
const { Contact } = require('./models/contactModel');
const { GetInTouch } = require('./models/getIntouchModel');
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

require('dotenv').config();
mongoose.connect(`${process.env.MONGODB_URI}`);

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

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

// Create a route for signing up
app.post('/api/signup', async (req, res) => {
	const { userName, password } = req.body;

	// Hash the password
	const hashedPassword = await bcrypt.hash(password, 10);

	// Create a new user
	const user = new User({
		userName,
		password: hashedPassword,
	});

	// Save the user to the database
	await user.save();

	// Send a success response
	res.status(200).json({ message: 'User created successfully' });
});

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
			from: 'services@qubicgen.com',
			to: `${req.body.email}`,
			subject: 'Query Received',
			text: `Dear ${req.body.firstName} ${req.body.lastName}, 
	
	We have received your query and appreciate your interest. Our team is currently reviewing your message and will provide a response shortly.
	
	If you have any additional information to share or questions to ask, feel free to reach out to us.
	
	Best regards,
	
	The QubicGen Team`,
	};
		await transporter.sendMail(clientMailOptions);

		// Send email to yourself
		const selfMailOptions = {
			from: 'services@qubicgen.com',
			to: 'qubicgen@gmail.com', // your email
			subject: 'New Query Received',
			text: 'A new query has been received. Check your admin panel for details.',
		};
		await transporter.sendMail(selfMailOptions);

		res.status(201).json(savedQuery);
	} catch (error) {
		res.status(400).json({ message: error.message });
	}
});

app.post('/api/job-application', async (req, res) => {
	try {
		console.log(req.body);

		const newJobApplication = new JobApplication(req.body);
		const savedJobApplication = await newJobApplication.save();

		// Send email to client
		const clientMailOptions = {
			from: 'services@qubicgen.com',
			to: `${req.body.email}`,
			subject: 'Job Application Received',
			text: `Dear ${req.body.fullName}, 
	
	Thank you for submitting your job application. We have successfully received it and our hiring team will carefully review your application.
	
	We appreciate your interest in joining our team and will be in touch with you regarding the next steps in the recruitment process.
	
	Warm regards,
	
	The QubicGen Hiring Team`,
	};
		await transporter.sendMail(clientMailOptions);

		// Send email to yourself
		const selfMailOptions = {
			from: 'services@qubicgen.com',
			to: 'qubicgen@gmail.com', // your email
			subject: 'New Job Application Received',
			text: 'A new job application has been received. Check your admin panel for details.',
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
			from: 'services@qubicgen.com',
			to: `${req.body.email}`,
			subject: 'Contact Form Received',
			text: `Dear ${req.body.fullName}, 
	
	Thank you for reaching out to us. We appreciate your interest in our services. We will review your contact form and get back to you as soon as possible.
	
	If you have any further questions or concerns, please don't hesitate to reach out to us.
	
	Best regards,
	
	The QubicGen Team`,
		};
		await transporter.sendMail(clientMailOptions);

		// Send email to yourself
		const selfMailOptions = {
			from: 'services@qubicgen.com',
			to: 'qubicgen@gmail.com', // your email
			subject: 'New Contact Form Received',
			text: 'A new contact form has been received. Check your admin panel for details.',
		};
		await transporter.sendMail(selfMailOptions);

		res.status(201).json(savedContact);
	} catch (error) {
		res.status(400).json({ message: error.message });
	}
});

app.post('/api/getInTouch', async (req, res) => {
	try {
		console.log(req.body);

		const newGetInTouch = new GetInTouch(req.body);
		const savedGetInTouch = await newGetInTouch.save();

		// Send email to client
		const clientMailOptions = {
			from: 'services@qubicgen.com',
			to: `${req.body.email}`,
			subject: 'Get In Touch Form Received',
			text: `Dear ${req.body.fullName}, 
	
	Thank you for contacting us through the Get In Touch form. We have received your message and will respond promptly.
	
	We value your interest in our services and look forward to assisting you further.
	
	Warm regards,
	
	The QubicGen Team`,
	};
		await transporter.sendMail(clientMailOptions);

		// Send email to yourself	
		const selfMailOptions = {
			from: 'services@qubicgen.com',
			to: 'qubicgen@gmail.com', // your email
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
	try {
		const token = req.headers.authorization?.split('Bearer ')[1]; // Fix token extraction

		if (!token) {
			return res.status(401).json({ message: 'Unauthorized' });
		}

		jwt.verify(token, 'RANDOM-TOKEN', async (err, decoded) => {
			if (err) {
				return res.status(401).json({ message: 'Unauthorized' });
			}

			// Token verified, proceed to fetch data
			const data = await Query.find({});
			res.status(200).json(data);
		});
	} catch (error) {
		res.status(400).json({ message: error.message });
	}
});

app.listen(port, () => {
	console.log(`Server is running on http://localhost:${port}`);
});
