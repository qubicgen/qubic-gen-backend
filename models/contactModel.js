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
		default: Date.now,
	},
});
const Contact = mongoose.model('Contact', contactSchema);

module.exports = {
	Contact,
};
