const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const route = require("./route/route");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let DBString = "mongodb+srv://Mahesh8985:lz9fOW52615YVat4@cluster0.l5fafvk.mongodb.net/URLShorten";
mongoose.connect(DBString, { useNewUrlParser: true })
        .then(() => console.log("MongoDB is connected"))
        .catch((err) => console.log(err));

app.use('/', route);

app.listen(process.env.PORT || 3000, function () {
    console.log("Express server listening on port " + (process.env.PORT || 3000));
});
