const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const querySchema = new Schema({
	firstName: String,
	lastName: String,
	email: String,
	jobTitle: String,
	company: String,
	phone: Number,
	address: String,
});
const Query = mongoose.model('Query', querySchema);

module.exports = {
	Query,
};
