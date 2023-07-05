const fs = require("fs");
const path = require("path");
let files = [];

const getFilesRecursively = (directory) => {
  const filesInDirectory = fs.readdirSync(directory);
  for (const file of filesInDirectory) {
    const absolute = path.join(directory, file);
    if (fs.statSync(absolute).isDirectory()) {
      getFilesRecursively(absolute);
    } else {
      files.push(absolute);
    }
  }
  return files
};

const findAsin = function (str) {
  var patt = new RegExp('(?:[/dp/]|$|[8-])([A-Z0-9]{10})') // amazon or keepa link
  let exec = patt.exec(str)
  return exec ? exec[1] : undefined
}

module.exports = { getFilesRecursively, findAsin }