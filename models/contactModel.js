const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const contactSchema = new Schema({
	fullName: String,
	email: String,
	jobTitle: String,
	company: String,
	type: String,
	phone: Number,
	message: String,
	date: {
		type: Date,
		default: () => {
			const ISTOffset = 330 * 60 * 1000; // Offset in milliseconds for IST (UTC+5:30)
			const dateIST = new Date(Date.now() + ISTOffset);
			return dateIST;
		},
	},
});
const Contact = mongoose.model('Contact', contactSchema);

module.exports = {
	Contact,
};
