const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const contactSchema = new Schema({
	fullName: String,
	email: String,
	jobTitle: String,
	company: String,
	phone: Number,
	type: String,
	phone: Number,
	message: String,

});
const Contact = mongoose.model('Contact', contactSchema);

module.exports = {
	Contact,
};
