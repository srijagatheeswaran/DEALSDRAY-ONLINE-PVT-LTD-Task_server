const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');

const formatDate = (date) => {
    const options = { day: '2-digit', month: 'short', year: '2-digit' };
    return date.toLocaleDateString('en-GB', options).replace(/ /g, '-');
};

router.post('/create', async (req, res) => {
    const { formData } = req.body;
    const { name, email, mobile_number, designation, gender, course, imgstore } = formData;

    if (!name || !email || !mobile_number || !designation || !gender || !course) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const existingEmployee = await Employee.findOne({
            $or: [{ email: email }, { mobile_number: mobile_number }]
        });

        if (existingEmployee) {
            return res.status(400).json({ message: "Employee with this email or mobile number already exists" });
        }

        const newEmployee = new Employee({
            name,
            email,
            mobile_number,
            designation,
            gender,
            course,
            imgstore,
            createDate: formatDate(new Date())
        });

        await newEmployee.save();
        res.status(201).json({ message: "Employee created successfully", employee: newEmployee });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

router.get('/employees', async (req, res) => {
    try {
        const employees = await Employee.find();
        res.status(200).json(employees);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving employee data', error });
    }
});
router.get('/employees/:email', async (req, res) => {
    const { email } = req.params;
    try {
        const employee = await Employee.findOne({ email });
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        res.json(employee);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
router.put('/update', async (req, res) => {
    const { formData } = req.body;
    const { email, name, mobile_number, designation, gender, course, imgstore } = formData;

    if (!email) {
        return res.status(400).json({ message: "Email is required for updating employee details" });
    }

    try {
        
        const employee = await Employee.findOne({ email });

        if (!employee) {
            return res.status(404).json({ message: "Employee with this email not found" });
        }

        
        const existingEmployeeWithMobile = await Employee.findOne({
            mobile_number: mobile_number,
            _id: { $ne: employee._id } 
        });

        if (existingEmployeeWithMobile) {
            return res.status(400).json({ message: "Mobile number is already taken by another employee" });
        }

        if (email !== employee.email) {
            const existingEmployeeWithEmail = await Employee.findOne({ email });

            if (existingEmployeeWithEmail) {
                return res.status(400).json({ message: "Email is already taken by another employee" });
            }
        }

        if (name) employee.name = name;
        if (mobile_number) employee.mobile_number = mobile_number;
        if (designation) employee.designation = designation;
        if (gender) employee.gender = gender;
        if (course) employee.course = course;
        if (imgstore) employee.imgstore = imgstore;

        // Save the updated employee
        const updatedEmployee = await employee.save();
        res.status(200).json({ message: "Employee updated successfully", employee: updatedEmployee });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

router.delete('/delete', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Email is required to delete employee" });
    }

    try {
        const deletedEmployee = await Employee.findOneAndDelete({ email });

        if (!deletedEmployee) {
            return res.status(404).json({ message: "Employee with this email not found" });
        }

        res.status(200).json({ message: "Employee deleted successfully", employee: deletedEmployee });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});
router.get('/search', async (req, res) => {
    const { name } = req.query;

    try {
        const employees = await Employee.find({ name: { $regex: name, $options: 'i' } });
        res.status(200).json(employees);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving employees", error });
    }
});

module.exports = router;
