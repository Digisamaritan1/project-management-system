var fs = require('fs');


const removeFiles = [
    __dirname + "/cron-single.js",
    __dirname + "/Modules/affiliate/controller-installation.js",
]
let countFiles = 0;
const countFilesFun = (filePath) => {
    if (countFiles >= removeFiles.length) {
        console.log("All Files Removed.");
        return;
    }
    if (fs.existsSync(filePath)) {
        fs.unlink(filePath, (err) => {
            if (err) throw err;
            console.log('File deleted!');
            console.log(`${filePath} File is deleted!`);
            countFiles += 1;
            countFilesFun(removeFiles[countFiles]);
        });
    } else {
        console.log(`${filePath} File Not Found!`);
        countFiles += 1;
        countFilesFun(removeFiles[countFiles]);
    }
};
// countFilesFun(removeFiles[countFiles]);

// ----------------------------------------------------------------------------------------------------
// Remove Folder Sections
// ----------------------------------------------------------------------------------------------------

const removeFolders = [
    __dirname + "/frontend/src/plugins/createcompanyinside-single",
    __dirname + "/frontend/src/plugins/register-single",
    __dirname + "/Modules/Admin-single",
]

let countFolders = 0;
const countFoldersFun = (filePath) => {
    if (countFolders >= removeFolders.length) {
        console.log("All Folders Removed.");
        countFilesFun(removeFiles[countFiles]);
        return;
    }
    if (fs.existsSync(filePath)) {
        fs.rmdir(filePath, {recursive: true, force: true}, (err) => {
            if (err) {
                throw err;
            }
            console.log(`${filePath} Folder is deleted!`);
            countFolders += 1;
            countFoldersFun(removeFolders[countFolders]);
        });
    } else {
        console.log(`${filePath} Folder Not Found!`);
        countFolders += 1;
        countFoldersFun(removeFolders[countFolders]);
    }
};
countFoldersFun(removeFolders[countFolders]);
