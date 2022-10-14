// main module
const express = require("express");
const fileUpload = require("express-fileupload");
const bodyParser = require("body-parser");
const path = require("path");
const mongoose = require("mongoose");
// custom router
const pdfRoutes = require("./routes/pdfRoute");
// initialize server
const app = express();
// json parser
app.use(bodyParser.json()); // application/json
app.use(fileUpload()); // use for parse file
// set up the general allowed header for CORS policy
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // allow all server
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  ); // allow the typical REST API methods
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization"); // allow content type and authorization, the second one is for setting JWT use
  next();
});
// static middleware for expose data
app.use(express.static(path.join(__dirname, "public")));
app.use("/data", express.static(path.join(__dirname, "data"))); // reveal the data to the frontend to download the pdf file
// custom pdf routes
app.use(pdfRoutes);
//
mongoose
  .connect(
    "mongodb+srv://o83213:eE14011106@cluster0.p6lnq.mongodb.net/pdf-signature?retryWrites=true",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then((result) => {
    app.listen(8080);
  })
  .catch((err) => console.log(err));
