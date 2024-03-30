const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const getInTouchSchema = new Schema({
	fullName: String,
	email: String,
	message: String,
});
const GetInTouch = mongoose.model('GetInTouch', getInTouchSchema);

module.exports = {
	GetInTouch,
};
