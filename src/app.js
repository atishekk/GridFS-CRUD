require("dotenv").config()
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const methodOverride = require('method-override');

const mainRouter = require("./routes")
const store = require("./store")

const app = express();

app.use(methodOverride('_method'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

const mongoose = require("mongoose");
const url = process.env.DB;

const connect = mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true});
connect.then(() => {
    console.log('Database connected');
}, (err) => console.log(err));


const upload = multer({storage: store});

app.use("/", mainRouter(upload));

const port = process.env.PORT;
app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`);
});
