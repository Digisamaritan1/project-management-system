const fs = require("fs");

const removeFolders = [
    __dirname + "/frontend/src/plugins/customFieldView-single"
]

let countFolders = 0;
const countFoldersFun = (filePath) => {
    if (countFolders >= removeFolders.length) {
        console.log("All Folders Removed.");
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