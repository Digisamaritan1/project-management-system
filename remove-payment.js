var fs = require('fs');

const renameFolders = [
    {
        new: __dirname + "/frontend/src/plugins/chargebee",
        old: __dirname + "/frontend/src/plugins/chargebee-single"
    },
    {
        new: __dirname + "/frontend/src/plugins/affiliate",
        old: __dirname + "/frontend/src/plugins/affiliate-single"
    }
];


let countRenameFolders = 0;
const countRenameFoldersFun = (folderPath) => {
    if (countRenameFolders >= renameFolders.length) {
        console.log("All Folders Rename.");
        return;
    }
    if (fs.existsSync(folderPath.old)) {
        fs.rename(folderPath.old, folderPath.new, (err) => {
            if (err) {
              console.error('Error renaming folder:', err);
              throw err;
            } else {
                console.log(`${folderPath} Folder renamed successfully!`);
                countRenameFolders += 1;
                countRenameFoldersFun(renameFolders[countRenameFolders]);
            }
        });
    } else {
        console.log(`${filePath} Folder Not Found!`);
        countRenameFolders += 1;
        countRenameFoldersFun(renameFolders[countRenameFolders]);
    }
};


// ----------------------------------------------------------------------------------------------------
// Remove Folder Sections
// ----------------------------------------------------------------------------------------------------

const removeFolders = [
    __dirname + "/frontend/src/plugins/chargebee",
    __dirname + "/frontend/src/plugins/affiliate",
    __dirname + "/frontend/src/plugins/paddle-single",
    __dirname + "/Modules/chargebee",
    __dirname + "/Modules/paddle"
]

let countFolders = 0;
const countFoldersFun = (filePath) => {
    if (countFolders >= removeFolders.length) {
        console.log("All Folders Removed.");
        countRenameFoldersFun(renameFolders[countRenameFolders]);
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
