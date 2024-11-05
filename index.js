const cors = require('cors');
const multer = require('multer');
const mongoose = require('mongoose');
const { GridFsStorage } = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const { Query } = require('./models/queryModel');
const { JobApplication } = require('./models/jobApplicationModel');
const { Contact } = require('./models/contactModel');
const { GetInTouch } = require('./models/getIntouchModel');
const Student = require('./models/studentModel');
const Project = require('./models/projectModel');
const { NewJobApplication } = require('./models/newJobModel');
const newJobRoutes = require('./routes/newJobRoutes');
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

const path = require('path');
const { ObjectId } = require('mongoose').Types;
require('dotenv').config();

// For MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI, {
	useNewUrlParser: true,
	useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

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





app.use('/api/newjob', newJobRoutes);

app.get('/api/fetchData', async (req, res) => {
	console.log('here in fetchData');
	try {
	  const token = req.headers.authorization?.split('Bearer ')[1];
  
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
		const students = await Student.find({});
		const projects = await Project.find({});
		const newJobs = await NewJobApplication.find({}); // Add this line
		const data = { 
		  queries, 
		  jobApplications, 
		  contacts, 
		  getInTouches, 
		  students, 
		  projects,
		  newJobs  // Add this line
		};
		res.status(200).json(data);
	  });
	} catch (error) {
	  res.status(400).json({ message: error.message });
	}
  });





// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/resumes');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf' || 
      file.mimetype === 'application/msword' || 
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF and DOC/DOCX files are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});


const uploadDir = path.join(__dirname, 'uploads/resumes');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

// New Job Application Route


app.post('/api/seed-user', async (req, res) => {
	try {
	  const userName = 'qubicgen';
	  const plainPassword = 'QubicGen@123';
  
	  // Check if user already exists
	  const existingUser = await User.findOne({ userName });
	  if (existingUser) {
		return res.status(400).json({ message: 'User already exists.' });
	  }
  
	  // Hash the password
	  const hashedPassword = await bcrypt.hash(plainPassword, 10);
  
	  // Create and save the user
	  const user = new User({
		userName,
		password: hashedPassword,
	  });
  
	  await user.save();
	  res.status(201).json({ message: 'User created successfully.' });
	} catch (error) {
	  res.status(500).json({ message: 'Error seeding user', error: error.message });
	}
  });

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

// Update the transporter configuration
const transporter = nodemailer.createTransport({
	host: 'smtp.hostinger.com',
	port: 465,
	secure: true,
	auth: {
		user: 'services@qubicgen.com', // Use the direct value instead of env variable
		pass: 'ktd865^&#%Q'  // Use the direct value instead of env variable
	},
	debug: true,
	logger: true
});

// Add verification before starting the server
transporter.verify(function (error, success) {
	if (error) {
		console.error('SMTP Verification Error:', error);
		console.log('Current SMTP Settings:', {
			host: 'smtp.hostinger.com',
			port: 465,
			user: 'services@qubicgen.com',
			passLength: 'ktd865^&#%Q'.length || 0
		});
	} else {
		console.log('Server is ready to take our messages');
	}
});

app.post('/api/queries', async (req, res) => {
	try {
		console.log(req.body);
		const newQuery = new Query(req.body);
		const savedQuery = await newQuery.save();

		// Send email to client
		const clientMailOptions = {
			from: `${process.env.SUPPORT_SMTP}`,
			to: `${req.body.email}`,
			subject: 'Queries Received',
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
									text-align: left;
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
        <p>Dear ${req.body.firstName} ${req.body.lastName},</p>
        <p>Thank you for reaching out to us with your query through our website. Your questions and feedback are important to us, and we're here to provide the answers and assistance you need.</p>
        <p>Our team is currently reviewing your submission, and we aim to get back to you as soon as possible, typically within 24 hours. We appreciate your patience and are committed to ensuring you receive a thorough and thoughtful response.</p>
        <p>For immediate assistance, feel free to contact us directly at <a href="mailto:services@qubicgen.com">services@qubicgen.com</a></p>
        <ul>
            <li>Query Details: ${req.body.message}</li>
        </ul>
    </div>
    <div class="footer">
        <p>
            Warm regards, <br>
            The QubicGen Team <br>
            Mail: <a href="mailto:services@qubicgen.com">services@qubicgen.com</a> <br>
            Mob. No: <a href="tel:+919649749845">+91 9649749845</a><br>
            <a href="https://www.qubicgen.com">www.qubicgen.com</a>
        </p>
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
			from: clientMailOptions.from,
			to: 'support@qubicgen.com', // your email
			subject: `Duplicate ${clientMailOptions.subject}`,
			html: clientMailOptions.html,
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
		// const existingJobApplication = await JobApplication.findOne({
		// 	email: req.body.email,
		// });
		// if (existingJobApplication.selectedJobRole === req.body.selectedJobRole) {
		// 	return res.status(400).json({ message: 'Already Applied' });
		// }

		const newJobApplication = new JobApplication(req.body);
		// newJobApplication.resume = req.file._id || req.file.id;
		const savedJobApplication = await newJobApplication.save();

		// Send email to client
		const clientMailOptions = {
			from: `${process.env.SUPPORT_SMTP}`,
			to: `${req.body.email}`,
			subject: `Application Received: ${req.body.fullName} at QubicGen`,
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
									text-align: left;
									background-color: #f8f8f8;
									padding: 10px;
									margin-top: 10px;
							}
					</style>
			</head>
			<body>
    <div class="header">
        <img src="cid:headerImage" alt="QubicGen Header" style="width: 10%; height: 10%;">
    </div>
    <div class="body-content">
        <p>Dear ${req.body.fullName},</p>
        <p>Thank you for applying for the ${req.body.selectedJobRole} position at QubicGen. We've received your application and are in the process of reviewing it.</p>
        <p>If your profile matches our requirements, we'll contact you shortly to discuss the next steps. In the meantime, feel free to explore our work and culture on our website and social media channels.</p>
        <p>We appreciate your interest in joining our team and wish you the best in your job search.</p>
    </div>
    <div class="footer">
        <p>
            Warm regards, <br>
            The QubicGen Team <br>
            Mail: <a href="mailto:services@qubicgen.com">services@qubicgen.com</a> <br>
            Mob. No: <a href="tel:+919649749845">+91 9649749845</a><br>
            <a href="https://www.qubicgen.com">www.qubicgen.com</a>
        </p>
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
			from: clientMailOptions.from,
			to: 'support@qubicgen.com', // your email
			subject: `Duplicate ${clientMailOptions.subject}`,
			html: clientMailOptions.html,
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
									text-align: left;
									background-color: #f8f8f8;
									padding: 10px;
									margin-top: 10px;
							}
					</style>
			</head>
			<body>
					<div class="header">
							<img src="cid:headerImage" alt="QubicGen Header" style="width: 10%; height: 10%;">
					</div>
					<div class="body-content">
							<p>Dear ${req.body.fullName},</p>
							<p>
							Thank you for reaching out to us at QubicGen! We're excited to connect with you and have successfully received your inquiry. Our team is dedicated to providing you with the best possible service and will be reviewing your submission shortly.


							</p>
							

							While you wait, we thought you might be interested in exploring some of the resources we have available on our website, or perhaps check out our latest blog posts and updates:
							<br>

Link to our Website: 	 				<a href="https://www.qubicgen.com">www.qubicgen.com</a>	

<br>

Link to our Blog:					<a href="https://qubic-gen.blogspot.com/ ">https://qubic-gen.blogspot.com/ </a>		





							</p>
							<p>If you have any further questions or concerns, please don't hesitate to reach out to us.</p>


						<h2>Here's what we received from you:
						</h2>
													<ul style={{ listStyle: 'none' }} >
															<li>Name: ${req.body.fullName}</li>
															<li>Mail: ${req.body.email}</li>
															<li> Message: ${req.body.message}</li>
													</ul>

							<p>

							In the meantime, if you have any additional information to add to your query or if you require immediate assistance, please feel free to contact us directly at <a href="tel:+919649749845">+91 9649749845</a> or reply to this email.

							</p>

							<p>

							We aim to respond to all queries within 24-48 hours, and we appreciate your patience. 

							
							</p>

							<p>
							Thank you once again for contacting QubicGen. We're looking forward to assisting you and will be in touch soon!

							</p>
							
					</div>
					<div class="footer">
							<p>
								Warm regards, <br>
								The QubicGen Team <br>
								Mail: <a href="mailto:services@qubicgen.com">services@qubicgen.com</a> <br>
								Mob. No: <a href="tel:+919649749845">+91 9649749845</a><br>
								<a href="https://www.qubicgen.com">www.qubicgen.com</a>
							</p>
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

		// Send email to yourself
		const selfMailOptions = {
			to: 'support@qubicgen.com', // your email
			subject: `Duplicate ${clientMailOptions.subject}`,
			html: clientMailOptions.html,
		};

		if (req.body.type == 'project') {
			clientMailOptions.from = `${process.env.SERVICES_SMTP}`;
			selfMailOptions.from = `${process.env.SERVICES_SMTP}`;
			await transporter.sendMail(selfMailOptions);
			await transporter.sendMail(clientMailOptions);
		} else {
			clientMailOptions.from = `${process.env.TRAINING_SMTP}`;
			selfMailOptions.from = `${process.env.TRAINING_SMTP}`;
			await transporter.sendMail(selfMailOptions);
			await transporter.sendMail(clientMailOptions);
		}

		res.status(201).json(savedContact);
	} catch (error) {
		console.log(error);
		res.status(400).json({ message: error.message });
	}
});





app.get('/', async (req, res) => {
	res.json({ message: 'Hi qubicgen api iss working' });
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





app.post('/api/queries', async (req, res) => {
	try {
		console.log(req.body);
		const newQuery = new Query(req.body);
		const savedQuery = await newQuery.save();

		// Send email to client
		const clientMailOptions = {
			from: `${process.env.SUPPORT_SMTP}`,
			to: `${req.body.email}`,
			subject: 'Queries Received',
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
									text-align: left;
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
        <p>Dear ${req.body.firstName} ${req.body.lastName},</p>
        <p>Thank you for reaching out to us with your query through our website. Your questions and feedback are important to us, and we're here to provide the answers and assistance you need.</p>
        <p>Our team is currently reviewing your submission, and we aim to get back to you as soon as possible, typically within 24 hours. We appreciate your patience and are committed to ensuring you receive a thorough and thoughtful response.</p>
        <p>For immediate assistance, feel free to contact us directly at <a href="mailto:services@qubicgen.com">services@qubicgen.com</a></p>
        <ul>
            <li>Query Details: ${req.body.message}</li>
        </ul>
    </div>
    <div class="footer">
        <p>
            Warm regards, <br>
            The QubicGen Team <br>
            Mail: <a href="mailto:services@qubicgen.com">services@qubicgen.com</a> <br>
            Mob. No: <a href="tel:+919649749845">+91 9649749845</a><br>
            <a href="https://www.qubicgen.com">www.qubicgen.com</a>
        </p>
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
			from: clientMailOptions.from,
			to: 'support@qubicgen.com', // your email
			subject: `Duplicate ${clientMailOptions.subject}`,
			html: clientMailOptions.html,
		};
		await transporter.sendMail(selfMailOptions);

		res.status(201).json(savedQuery);
	} catch (error) {
		console.log(error);
		res.status(400).json({ message: error.message });
	}
});

app.post('/api/job-application', async (req, res) => {
	try {
		console.log(req.body, 'rekljaaaaa');

		// Check for duplicate email
		// const existingJobApplication = await JobApplication.findOne({
		// 	email: req.body.email,
		// });
		// if (existingJobApplication.selectedJobRole === req.body.selectedJobRole) {
		// 	return res.status(400).json({ message: 'Already Applied' });
		// }

		const newJobApplication = new JobApplication(req.body);
		// newJobApplication.resume = req.file._id || req.file.id;
		const savedJobApplication = await newJobApplication.save();

		// Send email to client
		const clientMailOptions = {
			from: `${process.env.SUPPORT_SMTP}`,
			to: `${req.body.email}`,
			subject: `Application Received: ${req.body.fullName} at QubicGen`,
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
									text-align: left;
									background-color: #f8f8f8;
									padding: 10px;
									margin-top: 10px;
							}
					</style>
			</head>
			<body>
    <div class="header">
        <img src="cid:headerImage" alt="QubicGen Header" style="width: 10%; height: 10%;">
    </div>
    <div class="body-content">
        <p>Dear ${req.body.fullName},</p>
        <p>Thank you for applying for the ${req.body.selectedJobRole} position at QubicGen. We've received your application and are in the process of reviewing it.</p>
        <p>If your profile matches our requirements, we'll contact you shortly to discuss the next steps. In the meantime, feel free to explore our work and culture on our website and social media channels.</p>
        <p>We appreciate your interest in joining our team and wish you the best in your job search.</p>
					</div>
					<div class="footer">
							<p>
								Warm regards, <br>
								The QubicGen Team <br>
								Mail: <a href="mailto:services@qubicgen.com">services@qubicgen.com</a> <br>
								Mob. No: <a href="tel:+919649749845">+91 9649749845</a><br>
								<a href="https://www.qubicgen.com">www.qubicgen.com</a>
							</p>
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
			from: clientMailOptions.from,
			to: 'support@qubicgen.com', // your email
			subject: `Duplicate ${clientMailOptions.subject}`,
			html: clientMailOptions.html,
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
									text-align: left;
									background-color: #f8f8f8;
									padding: 10px;
									margin-top: 10px;
							}
					</style>
			</head>
			<body>
					<div class="header">
							<img src="cid:headerImage" alt="QubicGen Header" style="width: 10%; height: 10%;">
					</div>
					<div class="body-content">
							<p>Dear ${req.body.fullName},</p>
							<p>
							Thank you for reaching out to us at QubicGen! We're excited to connect with you and have successfully received your inquiry. Our team is dedicated to providing you with the best possible service and will be reviewing your submission shortly.


							</p>
							

							While you wait, we thought you might be interested in exploring some of the resources we have available on our website, or perhaps check out our latest blog posts and updates:
							<br>

Link to our Website: 	 				<a href="https://www.qubicgen.com">www.qubicgen.com</a>	

<br>

Link to our Blog:					<a href="https://qubic-gen.blogspot.com/ ">https://qubic-gen.blogspot.com/ </a>		





							</p>
							<p>If you have any further questions or concerns, please don't hesitate to reach out to us.</p>


							<h2>Here's what we received from you:
</h2>
							<ul style={{ listStyle: 'none' }} >
									<li>Name: ${req.body.fullName}</li>
									<li>Mail: ${req.body.email}</li>
									<li> Message: ${req.body.message}</li>
							</ul>

							<p>

							In the meantime, if you have any additional information to add to your query or if you require immediate assistance, please feel free to contact us directly at <a href="tel:+919649749845">+91 9649749845</a> or reply to this email.

							</p>

							<p>

							We aim to respond to all queries within 24-48 hours, and we appreciate your patience. 

							
							</p>

							<p>
							Thank you once again for contacting QubicGen. We're looking forward to assisting you and will be in touch soon!

							</p>
							
					</div>
					<div class="footer">
							<p>
								Warm regards, <br>
								The QubicGen Team <br>
								Mail: <a href="mailto:services@qubicgen.com">services@qubicgen.com</a> <br>
								Mob. No: <a href="tel:+919649749845">+91 9649749845</a><br>
								<a href="https://www.qubicgen.com">www.qubicgen.com</a>
							</p>
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

		// Send email to yourself
		const selfMailOptions = {
			to: 'support@qubicgen.com', // your email
			subject: `Duplicate ${clientMailOptions.subject}`,
			html: clientMailOptions.html,
		};

		if (req.body.type == 'project') {
			clientMailOptions.from = `${process.env.SERVICES_SMTP}`;
			selfMailOptions.from = `${process.env.SERVICES_SMTP}`;
			await transporter.sendMail(selfMailOptions);
			await transporter.sendMail(clientMailOptions);
		} else {
			clientMailOptions.from = `${process.env.TRAINING_SMTP}`;
			selfMailOptions.from = `${process.env.TRAINING_SMTP}`;
			await transporter.sendMail(selfMailOptions);
			await transporter.sendMail(clientMailOptions);
		}

		res.status(201).json(savedContact);
	} catch (error) {
		console.log(error);
		res.status(400).json({ message: error.message });
	}
});





app.post('/api/student', async (req, res) => {
	try {
		const { name, email, phone, course, stream, college, message } = req.body;
		
		const newStudent = new Student({
			name,
			email,
			phone,
			course,
			stream,
			college,
			message
		});

		const savedStudent = await newStudent.save();

		// Update email template to include new fields
		const clientMailOptions = {
			to: `${req.body.email}`,
			subject: 'Training Query Received',
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
									text-align: left;
									background-color: #f8f8f8;
									padding: 10px;
									margin-top: 10px;
							}
					</style>
			</head>
			<body>
					<div class="header">
							<img src="cid:headerImage" alt="QubicGen Header" style="width: 10%; height: 10%;">
					</div>
					<div class="body-content">
							<p>Dear ${req.body.name},</p>
							<h2>Student Details:</h2>
							<ul>
									<li>Name: ${req.body.name}</li>
									<li>Email: ${req.body.email}</li>
									<li>Phone: ${req.body.phone}</li>
									<li>Course: ${req.body.course}</li>
									<li>Stream: ${req.body.stream}</li>
									<li>College: ${req.body.college}</li>
									<li>Message: ${req.body.message}</li>
							</ul>
							<p>

							Thank you for your interest in our training program at QubicGen. We appreciate you taking the time to fill out the inquiry form. 


							</p>


							<p>

							Your inquiry has been successfully received, and we're excited to learn more about your training needs. Our team is currently reviewing your submission and will get back to you shortly with more information about the training program you're interested in. 
							</p>
							
							


							We look forward to potentially welcoming you to our training program and helping you achieve your learning goals. 






							</p>
							


							<h2>Here's what we received from you:
</h2>
							<ul style={{ listStyle: 'none' }} >
									<li>Name: ${req.body.name}</li>
									<li>Mail: ${req.body.email}</li>
									<li>Number: ${req.body.phone}</li>
									<li>Course Selected: ${req.body.course}</li>
									<li> Message: ${req.body.message}</li>
							</ul>

							<p>

							In the meantime, if you have any additional information to add to your query or if you require immediate assistance, please feel free to contact us directly at <a href="tel:+919649749845">+91 9649749845</a> or reply to this email.

							</p>

							<p>

							We aim to respond to all queries within 24-48 hours, and we appreciate your patience. 

							
							</p>

							<p>
							Thank you once again for contacting QubicGen. We're looking forward to assisting you and will be in touch soon!

							</p>
							
					</div>
					<div class="footer">
							<p>
								Warm regards, <br>
								The QubicGen Team <br>
								Mail: <a href="mailto:trainings@qubicgen.com">trainings@qubicgen.com</a> <br>
								Mob. No: <a href="tel:+919649749845">+91 9649749845</a><br>
								<a href="https://www.qubicgen.com">www.qubicgen.com</a>
							</p>
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

		// Send email to yourself
		const selfMailOptions = {
			to: 'support@qubicgen.com', // your email
			subject: `Duplicate ${clientMailOptions.subject}`,
			html: clientMailOptions.html,
		};

		if (req.body.type == 'project') {
			clientMailOptions.from = `${process.env.SERVICES_SMTP}`;
			selfMailOptions.from = `${process.env.SERVICES_SMTP}`;
			await transporter.sendMail(selfMailOptions);
			await transporter.sendMail(clientMailOptions);
		} else {
			clientMailOptions.from = `${process.env.TRAINING_SMTP}`;
			selfMailOptions.from = `${process.env.TRAINING_SMTP}`;
			await transporter.sendMail(selfMailOptions);
			await transporter.sendMail(clientMailOptions);
		}

		res.status(201).json(savedStudent);
	} catch (error) {
		console.error(error);
		res.status(400).json({ message: error.message });
	}
});


app.post('/api/project', async (req, res) => {
	try {
		const { name, email, phone, jobTitle, company, message } = req.body;
		
		const newProject = new Project({
			name,
			email,
			phone,
			jobTitle,
			company,
			message
		});

		const savedProject = await newProject.save();

		// Send email to client
		const clientMailOptions = {
			to: `${req.body.email}`,
			subject: 'Your Project Inquiry Received - QubicGen',
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
									text-align: left;
									background-color: #f8f8f8;
									padding: 10px;
									margin-top: 10px;
							}
					</style>
			</head>
			<body>
					<div class="header">
							<img src="cid:headerImage" alt="QubicGen Header" style="width: 10%; height: 10%;">
					</div>
					<div class="body-content">
							<p>Dear ${req.body.name},</p>
							<p>
							Thank you for reaching out to us at QubicGen with your project inquiry. We're excited about the possibility of working together and contributing to the success of your project. 

							</p>
							

						<p>
						Your inquiry has been received, and our team is currently reviewing the details you've provided. We aim to get back to you with our initial thoughts and potential next steps within 24 hours. This will include any additional questions we may have or suggestions to ensure that we fully understand your needs and goals. 


						
						
						</p>


						<h2>Here's what we received from you:
						</h2>
													<ul style={{ listStyle: 'none' }} >
															<li>Name: ${req.body.name}</li>
															<li>Mail: ${req.body.email}</li>
															<li>Number: ${req.body.phone} </li>
															<li> Message: ${req.body.message}</li>
													</ul>
						<p>

						In the meantime, we invite you to visit our portfolio on our website to get a glimpse of our services. if you have any additional information to add to your query or if you require immediate assistance, please feel free to contact us directly at <a href="tel:+919649749845">+91 9649749845</a> or reply to this email.

						
						</p>


							</p>
							<p>
							We appreciate you considering QubicGen for your project needs. Looking forward to the opportunity to discuss how we can bring your vision to life. 

							
							</p>



						
							
					</div>
					<div class="footer">
							<p>
								Warm regards, <br>
								The QubicGen Team <br>
								Mail: <a href="mailto:services@qubicgen.com">services@qubicgen.com</a> <br>
								Mob. No: <a href="tel:+919649749845">+91 9649749845</a><br>
								<a href="https://www.qubicgen.com">www.qubicgen.com</a>
							</p>
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

		// Send email to yourself
		const selfMailOptions = {
			to: 'support@qubicgen.com', // your email
			subject: `Duplicate ${clientMailOptions.subject}`,
			html: clientMailOptions.html,
		};

		if (req.body.type == 'project') {
			clientMailOptions.from = `${process.env.SERVICES_SMTP}`;
			selfMailOptions.from = `${process.env.SERVICES_SMTP}`;
			await transporter.sendMail(selfMailOptions);
			await transporter.sendMail(clientMailOptions);
		} else {
			clientMailOptions.from = `${process.env.TRAINING_SMTP}`;
			selfMailOptions.from = `${process.env.TRAINING_SMTP}`;
			await transporter.sendMail(selfMailOptions);
			await transporter.sendMail(clientMailOptions);
		}

		res.status(201).json(savedProject);
	} catch (error) {
		console.error(error);
		res.status(400).json({ message: error.message });
	}
});











// Import the Project model










app.post('/api/getInTouch', async (req, res) => {
	try {
		const newGetInTouch = new GetInTouch(req.body);
		const savedGetInTouch = await newGetInTouch.save();

		// Customer email template
		const customerEmailContent = `
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
						text-align: left;
						background-color: #f8f8f8;
						padding: 10px;
						margin-top: 10px;
					}
				</style>
			</head>
			<body>
				<div class="header">
					<img src="cid:headerImage" alt="QubicGen Header" style="width: 10%; height: 10%;">
				</div>
				<div class="body-content">
					<p>Dear ${req.body.fullName},</p>
					<p>We're delighted to let you know that we've received your message. Thank you for reaching out!</p>
					<p>At QubicGen, every question, feedback, or comment is important to us. We're here to provide you with the information and assistance you need. Our team is currently reviewing your submission, and we aim to get back to you as promptly as possible. Typically, we respond within 24 hours, but during busy periods, it might take a bit longer.</p>
					<p>For immediate assistance, feel free to contact us directly at support@qubicgen.com</p>
					<p>Thank you once again for reaching out. We look forward to speaking with you soon and are excited about the opportunity to assist you.</p>
					
					<h3>Get In Touch Form Details:</h3>
					<p>Full Name: ${req.body.fullName}</p>
					<p>Email : ${req.body.email}</p>
					<p>Contact Message: ${req.body.message}</p>
				</div>
				<div class="footer">
					<p>
						Warm regards, <br>
						The QubicGen Team <br>
						Mail: <a href="mailto:services@qubicgen.com">services@qubicgen.com</a> <br>
						Mob. No: <a href="tel:+919649749845">+91 9649749845</a><br>
						<a href="https://www.qubicgen.com">www.qubicgen.com</a>
					</p>
				</div>
			</body>
			</html>
		`;

		// Send email to customer
		const customerMailOptions = {
			from: {
				name: 'QubicGen Support',
				address: 'services@qubicgen.com'
			},
			to: req.body.email,
			subject: 'Thank You for Getting in Touch with QubicGen!',
			html: customerEmailContent,
			attachments: [{
				filename: 'Qubicbg.png',
				path: 'images/Qubicbg.png',
				cid: 'headerImage'
			}]
		};

		// Owner notification template
		const ownerEmailContent = `
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
				</style>
			</head>
			<body>
				<div class="header">
					<img src="cid:headerImage" alt="QubicGen Header" style="width: 10%; height: 10%;">
				</div>
				<div class="body-content">
					<h2>New Contact Form Submission</h2>
					<p><strong>Name:</strong> ${req.body.fullName}</p>
					<p><strong>Email:</strong> ${req.body.email}</p>
					<p><strong>Message:</strong> ${req.body.message}</p>
					<p><strong>Submission Time:</strong> ${new Date().toLocaleString()}</p>
				</div>
			</body>
			</html>
		`;

		// Send email to owner
		const ownerMailOptions = {
			from: {
				name: 'QubicGen Contact Form',
				address: 'services@qubicgen.com'
			},
			to: ['support@qubicgen.com', 'services@qubicgen.com'],
			subject: `New Contact Form Submission - ${req.body.fullName}`,
			html: ownerEmailContent,
			attachments: [{
				filename: 'Qubicbg.png',
				path: 'images/Qubicbg.png',
				cid: 'headerImage'
			}]
		};

		try {
			// Send to customer
			const customerInfo = await transporter.sendMail(customerMailOptions);
			console.log('Customer email sent:', customerInfo.messageId);

			// Send to owner
			const ownerInfo = await transporter.sendMail(ownerMailOptions);
			console.log('Owner notification sent:', ownerInfo.messageId);

			res.status(201).json({
				success: true,
				message: 'Your message has been sent successfully',
				data: savedGetInTouch
			});
		} catch (emailError) {
			console.error('Email sending failed:', emailError);
			res.status(201).json({
				success: true,
				message: 'Your message was saved but email notification failed',
				data: savedGetInTouch,
				emailError: emailError.message
			});
		}

	} catch (error) {
		console.error('Error in getInTouch:', error);
		res.status(400).json({
			success: false,
			message: error.message
		});
	}
});

// Add a test endpoint to verify both customer and owner emails
app.get('/test-emails', async (req, res) => {
	try {
		// Test email to owner
		const ownerTestResult = await transporter.sendMail({
			from: {
				name: 'QubicGen Test',
				address: 'services@qubicgen.com'
			},
			to: ['support@qubicgen.com', 'services@qubicgen.com'],
			subject: 'Test Email - Owner Notification',
			text: 'This is a test email for owner notification. Time: ' + new Date().toISOString()
		});

		console.log('Test emails sent:', {
			ownerEmailId: ownerTestResult.messageId
		});

		res.json({
			success: true,
			message: 'Test emails sent successfully',
			ownerEmailId: ownerTestResult.messageId
		});
	} catch (error) {
		console.error('Test email error:', error);
		res.status(500).json({
			success: false,
			error: error.message,
			details: error.response || 'No additional details available'
		});
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
			const students = await Student.find({});
			const projects = await Project.find({});
			const data = { queries, jobApplications, contacts, getInTouches , students, projects };
			res.status(200).json(data);
		});
	} catch (error) {
		res.status(400).json({ message: error.message });
	}
});

app.listen(port, () => {
	console.log(`Server is running on http://localhost:${port}`);
});

// Add this after the User model definition
app.post('/api/create-admin', async (req, res) => {
	try {
		const { userName, password, secretKey } = req.body;
		
		// Verify secret key (you should store this in your .env file)
		if (secretKey !== process.env.ADMIN_SECRET_KEY) {
			return res.status(401).json({ message: 'Invalid secret key' });
		}

		// Check if user already exists
		const existingUser = await User.findOne({ userName });
		if (existingUser) {
			return res.status(400).json({ message: 'Username already exists' });
		}

		// Hash password
		const hashedPassword = await bcrypt.hash(password, 10);

		// Create new user
		const user = new User({
			userName,
			password: hashedPassword
		});

		await user.save();
		res.status(201).json({ message: 'Admin user created successfully' });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});
