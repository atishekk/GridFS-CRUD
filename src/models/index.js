const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema({
    _id: String,
    name: {
        type: String,
        index: {unique: true}
    }
});

const EmployeeSchema = new mongoose.Schema({
    _id: String,
    name: {
        type: String,
        index: {unique: true}
    },
    filename: {
        type: String
    }
})

const Admin = mongoose.model('Admin', AdminSchema);
const Employee = mongoose.model('Employee', EmployeeSchema);

module.exports = {
    Admin,
    Employee
};
