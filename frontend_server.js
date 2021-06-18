const express = require("express");
const path = require("path");
const app = express();

//note requires path ie: .config({ path: "/fullpath/"})
require('dotenv').config({
    path: path.resolve('./config/.env'),
});

const port = process.env.REACT_PORT;

app.use(express.static(path.join(__dirname, "build")));

app.get("*", function (req, res) {
    res.sendFile(path.join(__dirname, "./website-frontend/build", "index.html"));
});

app.listen(port, () => {
    console.log(`Listening to ${port}`)
});