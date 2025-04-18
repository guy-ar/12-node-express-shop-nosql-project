const fs = require('fs');
const deleteFile = (filePath) => {
    fs.unlink(filePath, (err) => { // delete file in the file system based on filePath
        if (err) {
            throw err
        }
    });
}

exports.deleteFile = deleteFile