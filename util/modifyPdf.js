const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");
const fs = require("fs");
const path = require("path");
const rootPath = require("../util/rootPath");
const fontkit = require("@pdf-lib/fontkit");
//
const kaiuData = fs.readFileSync(
  path.join(rootPath, "public", "fonts", "kaiu.ttf")
);
const modifyPdf = async (pdfFile, signatureArray, textArray) => {
  // open PDF file to DOC
  // Serialize the PDFDocument to bytes (a Uint8Array)
  const pdfDoc = await PDFDocument.load(pdfFile);
  // custom font
  pdfDoc.registerFontkit(fontkit);
  const kaiuFont = await pdfDoc.embedFont(kaiuData);
  // const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman)
  // get the desire page, here we take first page for demo
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];
  // loop the signatures and draw the png image
  signatureArray.forEach(async (signature) => {
    await createSignature(pdfDoc, firstPage, signature);
  });
  // loop the texts and draw the text
  textArray.forEach(async (text) => {
    await createText(firstPage, text, kaiuFont);
    // await drawText(firstPage, text, timesRomanFont);
  });
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
};
// createSignature
const createSignature = async (pdfDoc, page, signature) => {
  // this is the browser px to pdf ratio (browser-px/pdf-scale)
  const scaleRatio = 1.5;
  // get the canvas url and position
  const { dataUrl, position } = signature;
  // transform the canvas url to arrayBuffer
  const pngImageBytes = dataUrl.replace(/^data:image\/png;base64,/, "");
  // get the transform image position x and y
  const deltaX = position.x / scaleRatio;
  const deltaY = position.y / scaleRatio;
  // Embed the PNG image bytes to pdf doc
  const pngImage = await pdfDoc.embedPng(pngImageBytes);
  // adjust the png file width and heigh to the same on the browser
  const pngDims = pngImage.scale(1 / (2 * scaleRatio));
  // Get the width and height of the first page
  // Draw a string of text diagonally across the first page
  page.drawImage(pngImage, {
    x: deltaX,
    y: page.getHeight() - pngDims.height - deltaY, // the y positon is count from the bottom, so use page getHeight to back to the top
    width: pngDims.width,
    height: pngDims.height,
  });
};
// createText
const createText = async (page, text, fontType) => {
  // this is the browser px to pdf ratio (browser-px/pdf-scale)
  const scaleRatio = 1.5;
  // get the text content and position
  const { content, position } = text;
  const fontsize = 12;
  // get the transform position x and y
  const deltaX = position.x / scaleRatio;
  const deltaY = position.y / scaleRatio;
  // Get the width and height of the first page
  // Draw a string of text diagonally across the first page
  page.drawText(content, {
    x: deltaX,
    y: page.getHeight() - fontsize + 3 - deltaY,
    font: fontType,
    size: fontsize,
    color: rgb(0, 0, 0),
  });
};
module.exports = { modifyPdf };
