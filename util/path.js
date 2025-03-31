const path = require('path');

const mainFilePath = require.main.filename;
//module.exports = path.dirname(process.mainModule.filename);
module.exports = path.dirname(mainFilePath);