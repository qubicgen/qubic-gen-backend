const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const getInTouchSchema = new Schema({
	firstName: String,
	lastName: String,
	email: String,
	jobTitle: String,
	company: String,
	phone: Number,
	address: String,
});
const GetInTouch = mongoose.model('GetInTouch', getInTouchSchema);

module.exports = {
  GetInTouch,
};
