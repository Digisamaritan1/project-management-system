var fs = require('fs');

// ----------------------------------------------------------------------------------------------------
// Remove Folder Sections
// ----------------------------------------------------------------------------------------------------

const removeFolders = [
    // __dirname + "/frontend/src/views/Payment",
    // __dirname + "/frontend/src/views/PaymentChargbee",
    // __dirname + "/frontend/src/views/PaymentPaddle",
    // __dirname + "/frontend/src/views/Settings/Upgrade",
    // __dirname + "/frontend/src/views/Settings/UpgradeChargbee",
    // __dirname + "/frontend/src/views/Settings/UpgradePaddle",
    // __dirname + "/frontend/src/views/Checkout",
    __dirname + "/Modules/chargebee",
    __dirname + "/Modules/paddle",
    // __dirname + "/Modules/Admin/ChargbeePlan",
    // __dirname + "/Modules/Admin/PaddlePlan"
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


// ----------------------------------------------------------------------------------------------------
// Updates Files Sections
// ----------------------------------------------------------------------------------------------------

// const removeFiles = [
//     __dirname + "/frontend/src/views/Settings/Members/UpdateMemeberSubscription.vue",
//     __dirname + "/frontend/src/views/Settings/Members/UpdateMemeberSubscriptionChargbee.vue",
//     __dirname + "/frontend/src/views/Settings/Members/UpdateMemeberSubscriptionPaddle.vue"
// ]

// let countFiles = 0;
// const countFilesFun = (filePath) => {
//     if (countFiles >= removeFiles.length) {
//         console.log("All Files Removed.");
//         return;
//     }
//     if (fs.existsSync(filePath)) {
//         fs.unlink(filePath, (err) => {
//             if (err) throw err;
//             console.log('File deleted!');
//             console.log(`${filePath} File is deleted!`);
//             countFiles += 1;
//             countFilesFun(removeFiles[countFiles]);
//         });
//     } else {
//         console.log(`${filePath} File Not Found!`);
//         countFiles += 1;
//         countFilesFun(removeFiles[countFiles]);
//     }
// };
// countFilesFun(removeFiles[countFiles]);


// ----------------------------------------------------------------------------------------------------
// Updates Files Sections
// ----------------------------------------------------------------------------------------------------

const updateFileArray = [
    // __dirname + "/frontend/src/components/molecules/MemberTable/MemberTable.vue",
    // __dirname + "/frontend/src/views/Settings/Members/Members.vue",
    // __dirname + "/frontend/src/views/Authentication/Register/Register.vue",
    // __dirname + "/frontend/src/components/organisms/Header/Header.vue",
    // __dirname + "/frontend/src/router/index.js",
    // __dirname + "/frontend/src/router/settings/index.js",
    // __dirname + "/frontend/src/components/templates/Settings/Settings.vue",
    // __dirname + "/frontend/public/index.html",
    // __dirname + "/frontend/src/App.vue",
    // __dirname + "/Modules/auth/controller/createUser.js",
    // __dirname + "/Modules/Company/controller.js",
    // __dirname + "/Modules/Company/routes.js",
    // __dirname + "/Modules/Admin/admin.js",
    __dirname + "/index.js"
];

const addFileArray = {
    // [__dirname + "/frontend/src/components/molecules/MemberTable/MemberTable.vue"]: {
    //     data: [{
    //         text: "\n        removeUserProcess(item);"
    //     }, {
    //         text: "\n        deleteDoc(data,isRequest);"
    //     }]
    // },
    // [__dirname + "/frontend/src/views/Settings/Members/Members.vue"]: {
    //     data: [{
    //         text: "\n                            sendMail(userEmail, userDesignation, userRole ,isResend);"
    //     }]
    // },
    // [__dirname + "/frontend/src/components/organisms/Header/Header.vue"]: {
    //     data: [{
    //         text: `\n                       <div>
    //                         <div class="cursor-pointer border-radius-7-px d-flex align-items-center log-out-list font-size-18 font-weight-500 blue" @click="logOut()">
    //                             <img :src="logoutIconMobile" alt="logout" class="pr-10px">
    //                             {{$t('Header.Logout')}}
    //                         </div>
    //                     </div>
    //             `
    //     }]
    // }
}

let count = 0;
const countFun = (filePath) => {
    if (count >= updateFileArray.length) {
        console.log("All Files Updated.");
        return;
    }
    fs.readFile(filePath, 'utf-8', (err, data) => {
        if (err) throw err;
        var newValue = data.replace(/<!-- Start Remove Section Payment -->([\s\S]*?)<!-- End Remove Section Payment -->/g, '');
        if (addFileArray[filePath]?.data?.length) {
            // removeUserProcess(item);
            for (let index = 0; index < addFileArray[filePath]?.data.length; index++) {
                const element = addFileArray[filePath]?.data[index];
                const convertRegex = new RegExp(`<!-- Start Add Section Payment ${index+1} -->([\\s/\\S]*?)<!-- End Add Section Payment ${index+1} -->`, "g");
                newValue = newValue.replace(convertRegex, element.text);
            }
        }
        fs.writeFile(filePath, newValue, 'utf-8', (err) => {
            if (err) throw err;
            console.log(`${filePath} File is updated!`);


            count += 1;
            countFun(updateFileArray[count]);
        });
    });
};
countFun(updateFileArray[count]);
