const {GridFsStorage} = require("multer-gridfs-storage");
const {Employee} = require("./models");
const path = require('path');

const store = new GridFsStorage({
    url: process.env.DB,
    file: (_ , file) => {
        return new Promise((resolve, reject) => {
            const id = path.parse(file.originalname).name;
            Employee.findById(id).then(emp => {
                if(!emp) return reject(`Invalid file: ${file.originalname}`)
                else {
                    emp.filename = file.originalname;
                    emp.save().then(() => {
                        return resolve({
                            filename: file.originalname,
                            bucketName: "uploads"
                        });
                    });
                }
            }, (err) => console.log(err));
        });
    }
});
module.exports = store;
