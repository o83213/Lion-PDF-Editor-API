const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const pdfSchema = new Schema({
  fileName: {
    type: String,
    required: true,
  },
  signatureDatas: [{ x: Number, y: Number }],
  textDatas: [{ x: Number, y: Number }],
});
module.exports = mongoose.model("PdfModel", pdfSchema);
