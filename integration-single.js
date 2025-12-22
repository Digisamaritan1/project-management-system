var fs = require('fs');

const renameFolders = [
    {
        new: __dirname + "/frontend/src/plugins/createcompanyinside",
        old: __dirname + "/frontend/src/plugins/createcompanyinside-single"
    },
    {
        new: __dirname + "/frontend/src/plugins/affiliate",
        old: __dirname + "/frontend/src/plugins/affiliate-single"
    },
    {
        new: __dirname + "/frontend/src/plugins/register",
        old: __dirname + "/frontend/src/plugins/register-single"
    },
    {
        new: __dirname + "/Modules/Admin",
        old: __dirname + "/Modules/Admin-single"
    },
    {
        new: __dirname + "/Modules/affiliate/controller.js",
        old: __dirname + "/Modules/affiliate/controller-installation.js"
    },
    {
        new: __dirname + "/cron.js",
        old: __dirname + "/cron-single.js"
    }
];


let countRenameFolders = 0;
const countRenameFoldersFun = (folderPath) => {
    if (countRenameFolders >= renameFolders.length) {
        console.log("All Folders And Files Rename.");
        return;
    }
    if (fs.existsSync(folderPath.old)) {
        fs.rename(folderPath.old, folderPath.new, (err) => {
            if (err) {
              console.error('Error renaming folder:', err);
              throw err;
            } else {
                console.log(`${folderPath} Folders And Files renamed successfully!`);
                countRenameFolders += 1;
                countRenameFoldersFun(renameFolders[countRenameFolders]);
            }
        });
    } else {
        console.log(`${filePath} Folders And Files Not Found!`);
        countRenameFolders += 1;
        countRenameFoldersFun(renameFolders[countRenameFolders]);
    }
};


const removeFiles = [
    __dirname + "/cron.js",
    __dirname + "/Modules/affiliate/controller.js",
]
let countFiles = 0;
const countFilesFun = (filePath) => {
    if (countFiles >= removeFiles.length) {
        console.log("All Files Removed.");
        countRenameFoldersFun(renameFolders[countRenameFolders]);
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
    __dirname + "/frontend/src/plugins/createcompanyinside",
    __dirname + "/frontend/src/plugins/register",
    __dirname + "/frontend/src/plugins/affiliate",
    __dirname + "/Modules/Admin",
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
