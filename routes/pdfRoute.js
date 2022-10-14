// module import
const express = require("express");
const path = require("path");
const fs = require("fs");
// custom file import1
const rootPath = require("../util/rootPath");
const { modifyPdf } = require("../util/modifyPdf");
// pdf model import
const PdfModel = require("../models/pdf");
// create express router
const router = express.Router();
// register route to url and method

router.post("/save-pdf", (req, res, next) => {
  if (!req.files) {
    return res.status(422).json({
      message: "send the pdf file fail!",
    });
  }
  const pdfFile = req.files.pdfFile; // this file data is parse by uploadFile middleware
  // console.log(pdfFile);
  if (!pdfFile) {
    res.status(500).json({
      message: "fail to get the pdf file!",
    });
  }
  // setup file path
  const filePath = path.join(rootPath, "data", "rawPDF", pdfFile.name);
  fs.promises
    .writeFile(filePath, pdfFile.data)
    .then((result) => {
      console.log("write file success!");
      res.status(300).json({
        message: "write file success!",
        fileName: pdfFile.name,
      });
    })
    .catch((err) => console.log(err));
});

router.post("/save-task", async (req, res, next) => {
  // get the data from the request body
  const pdfFileName = req.body.pdfFileName; // this file data is parse by uploadFile middleware
  const signatureArray = JSON.parse(req.body.signatureArray);
  const textArray = JSON.parse(req.body.textArray);
  // console.log(signatureArray);
  // console.log(textArray);
  const newPdfData = new PdfModel({
    fileName: pdfFileName,
    signatureDatas: signatureArray.map((signature) => signature.position),
    textDatas: textArray.map((text) => text.position),
  });
  try {
    const result = await newPdfData.save();
    console.log("pdf save!");
    console.log(result);
  } catch (err) {
    console.log(err);
  }
  res.status(200).json({ message: "success!" });
});

router.get("/get-tasks", async (req, res, next) => {
  try {
    const tasks = await PdfModel.find();
    console.log(tasks);
    res.status(200).json({
      message: "Get all tasks success!",
      tasks: tasks,
    });
  } catch (err) {
    console.log(err);
  }
});

router.get("/get-task/:taskId", async (req, res, next) => {
  const taskId = req.params.taskId;
  console.log(taskId);
  try {
    const task = await PdfModel.findById(taskId);
    console.log(task);
    res.status(200).json({
      message: "Get task success!",
      task: task,
    });
  } catch (err) {
    res.status(404).json({
      message: "task not found!",
      task: [],
    });
  }
});

router.post("/download", async (req, res, next) => {
  // get the data from the request body
  const pdfFileName = req.body.pdfFileName; // this file data is parse by uploadFile middleware
  const signatureArray = JSON.parse(req.body.signatureArray);
  const textArray = JSON.parse(req.body.textArray);
  // create the file path to store the file
  console.log("pdfFileName", pdfFileName);
  console.log("signatureArray", signatureArray);
  console.log("textArray", textArray);
  // read the pdf file
  const pdfFilePath = path.join(rootPath, "data", "rawPDF", pdfFileName);
  console.log(pdfFilePath);
  const pdfFileData = await fs.promises.readFile(pdfFilePath);
  console.log(pdfFileData);
  // edit the pdf file with custom helper function, which return a promise
  const modifyPdfFile = modifyPdf(pdfFileData, signatureArray, textArray);
  console.log(modifyPdfFile);
  //
  const fileName = new Date().getTime().toString() + ".pdf";
  modifyPdfFile
    .then((result) => {
      // store the file in the server disk
      const fileStoredPath = path.join(rootPath, "data", "tasks", fileName);
      console.log(result);
      return fs.promises.writeFile(fileStoredPath, result);
    })
    .then((result) => {
      // after success store the pdf data, return the data with message and pdf file path in the json format
      return res.status(200).json({
        message: "download success!",
        filePath: "data/tasks/" + fileName,
      });
    })
    .catch((err) => {
      console.log(err);
    });
});
module.exports = router;
