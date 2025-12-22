const fs = require('fs');
const path = require('path');

// Function to recursively copy directories
function copyFolderSync(source, target) {
    // Create target folder if it doesn't exist
    if (!fs.existsSync(target)) {
        fs.mkdirSync(target);
    }

    // Get all files in the source directory
    const files = fs.readdirSync(source);

    // Loop through all files/directories
    files.forEach((file) => {
        const sourcePath = path.join(source, file);
        const targetPath = path.join(target, file);

        // Check if the current path is a file or a directory
        if (fs.statSync(sourcePath).isDirectory()) {
            // Recursively copy subdirectory
            copyFolderSync(sourcePath, targetPath);
        } else {
            // Copy file
            fs.copyFileSync(sourcePath, targetPath);
        }
    });
}

// Example usage:
const sourceFolder = __dirname + '/paddle-setup';
const targetFolder = __dirname + '/';

copyFolderSync(sourceFolder, targetFolder);
console.log('Folder copied successfully!');