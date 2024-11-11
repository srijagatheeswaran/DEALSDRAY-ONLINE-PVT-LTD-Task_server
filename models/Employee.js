
const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    mobile_number: { type: String, required: true, unique: true },
    designation: { type: String, required: true },
    gender: { type: String, required: true, enum: ['Male', 'Female'] },
    course: { type: String, required: true },
    imgstore: { type: String } ,
    createDate: { type: String }
});

const Employee = mongoose.model('Employee', employeeSchema);
module.exports = Employee;
