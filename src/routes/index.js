const express = require("express");
const mongoose = require("mongoose");
const path = require('path');
const fs = require('fs');

const { Admin, Employee } = require("../models")

module.exports = (upload) => {
    const mainRouter = express.Router();
    const url = process.env.DB;
    //create a GridFS Bucket to store the files
    const connect = mongoose.createConnection(url, { useNewUrlParser: true, useUnifiedTopology: true });
    let GridFs;
    connect.once('open', () => {
        GridFs = new mongoose.mongo.GridFSBucket(connect.db, {
            bucketName: 'uploads'
        });
    });

    // Send the index.html file
    mainRouter.get('/', (_, res) =>{
        res.sendFile(__dirname + "/views/index.html")
    })

    // NOTE: Admin Operations are not implemented in the UI
    // body format
    // json: {
    // _id: <Admin ID>,
    // name: <Admin's name
    // }
    //create an Admin
    mainRouter.post("/admin", async (req, res) => {
        try{
            console.log(req);
            const admin = await Admin.create(req.body);
            res.status(201).json({admin: admin});
            res.redirect()
        } catch(err) {
            res.status(400).json({err: err.message});
        }
    });

    //Get all admins
    mainRouter.get("/admin", async (_, res) => {
        try {
            const admins = await Admin.find();
            res.status(200).json({admins: admins});
        } catch(err) {
            res.status(400).json({err: err.message});
        }
    });

    //Update admins with object passed in
    mainRouter.put("/admin", async(req, res) => {
        try {
            const body = req.body;
            const admin = await Admin.findById(body._id);
            if (!admin) {
                throw new Error("No such Admin");
            }
            const updated = await Admin.findOneAndUpdate({_id: body._id}, body, {new: true});
            res.status(202).json({admin: updated});

        } catch(err) {
            res.status(400).json({err: err.message});
        }
    });

    //Delete employees
    mainRouter.delete("/admin", async(req, res) => {
        try {
            const body = req.body;
            const admin = await Admin.findById(body._id);
            if (!admin) {
                throw new Error("No such Admin");
            }
            const deleted = await Admin.findOneAndDelete({_id: body._id});
            res.status(204).json({admin: deleted});
        } catch(err) {
            console.log(err);
            res.status(400).json({err: err.message});
        }
    });

    mainRouter.get("/admin/:id", async(req, res) => {
        try {
            const admin = await Admin.findById(req.params.id);
            if (!admin) {
                throw new Error("No such Admin");
            }
            res.status(200).json({admin: admin});
        } catch(err) {
            console.log(err);
            res.status(400).json({err: err.message});
        }
    });

    // Employee Operations
    // body format
    // json: {
    // _id: <Employee ID>,
    // name: <Employee's name
    // }
    //create an employee
    mainRouter.post("/employee", async (req, res) => {
        try{
            const employee = await Employee.create(req.body);
            res.status(201).json({employee: employee});
        } catch(err) {
            res.status(400).json({err: err.message});
        }
    });

    //get all employees
    //List all the employee currently in the system
    mainRouter.get("/employee", async (_, res) => {
        try {
            const employees = await Employee.find();
            let response = `<body><h4>Employees </h4><div id="res"></div>`;
            employees.forEach(emp => {
                response = response.concat(`<fieldset> 
                    id: ${emp.id} <br/> name: ${emp.name} <br/> 
                    <a href="/file/${emp.filename}"> file </a> <br/> 
                    <button onclick="deletefile('/file/${emp.filename}')">delete file</button>
                    <button onclick="deleteemp('/employee', '${emp._id}')">delete employee</button>
                    </fieldset>`)
            })
            response = response.concat(`
            <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js">
                  </script>
            <script>

                function deletefile(u) {
                    $.ajax({
                        url: u,
                        type: 'DELETE',
                        success: function (response) {
                            alert("File deleted")
                        },
                        error: function(a, b) {
                            alert('File does not exist')
                        }
                    });
                }
                function deleteemp(u, id) {
                    $.ajax({
                        url: u,
                        type: 'DELETE',
                        data: {_id: id},
                        success: function (response) {
                            location.reload();
                        },
                        error: function(a, b) {
                            alert('Could not delete the employee')
                        }
                    });
                }
            </script></body>`)
            res.status(200).send(response);
        } catch(err) {
            res.status(400).json({err: err.message});
        }
    });

    //Update employees
    mainRouter.put("/employee", async(req, res) => {
        try {
            const body = req.body;
            const employee = await Employee.findById(body._id);
            if (!employee) {
                throw new Error("No such Employee");
            }
            const updated = await Employee.findOneAndUpdate({_id: body._id}, body, {new: true});
            res.status(202).json({employee: updated});

        } catch(err) {
            res.status(400).json({err: err.message});
        }
    });

    //Delete employees
    mainRouter.delete("/employee", async(req, res) => {
        try {
            const body = req.body;
            const employee = await Employee.findById(body._id);
            if (!employee) {
                throw new Error("No such Employee");
            }
            const deleted = await Employee.findOneAndDelete({_id: body._id});
            res.status(204).json({employee: deleted});
        } catch(err) {
            console.log(err);
            res.status(400).json({err: err.message});
        }
    });

    // Get a single employee
    mainRouter.get("/employee/:id", async(req, res) => {
        try {
            const employee = await Employee.findById(req.params.id);
            if (!employee) {
                throw new Error("No such Employee");
            }
            res.status(200).json({employee: employee});
        } catch(err) {
            console.log(err);
            res.status(400).json({err: err.message});
        }
    });

    //File Methods
    //Upload files to the server, Currently allows max 5 at a time can be increased to more
    mainRouter.post("/upload", upload.array('file', 5), (req, res) => {
        res.status(200).json({
            success: true,
        });
    });

    //Get a file based on it filename, Retrieves the file and stream it to the response object
    mainRouter.get("/file/:filename", (req, res) => {
        GridFs.find({filename: req.params.filename}).toArray((err, files) => {
            if (!files[0] || files.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No files available',
                });
            }
            GridFs.openDownloadStream(files[0]._id).pipe(res);
        });
    });

    mainRouter.delete("/file/:filename", (req, res) => {
        GridFs.find({filename: req.params.filename}).toArray((err, files) => {
            if (!files[0] || files.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No files available',
                });
            }
            GridFs.delete(files[0]._id).then(() => {
                res.status(204).send("File Deleted successfully")
            });
        });
    })

    return mainRouter
}
