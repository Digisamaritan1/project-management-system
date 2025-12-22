const multer = require("multer");
const fs = require("fs");
const commonctrl = require('./common/controller');

var storage = multer.diskStorage({
    destination:function(req, file, callback) {
      let storagePath = "";
      if (req.body.key === "logo" && req.body.type === "admin") {
        storagePath = `${__dirname}/../../public/images/admin-logo`;
      }

      if (req.body.key === "logo" && req.body.type === "web") {
        storagePath = `${__dirname}/../../public/images/web-logo`;
      }

      if (req.body.key === "logo" && req.body.type === "desktop") {
        storagePath = `${__dirname}/../../public/images/desktop-logo`;
      }

      if (req.body.key === "favicon") {
        storagePath = `${__dirname}/../../public/images/favicon`;
      }

      if (req.body.key === "logo" && req.body.type === "emailTemplateLogo") {
        storagePath = `${__dirname}/../../public/images/emailTemplateLogo`;
      }

      if (!fs.existsSync(storagePath)) {
        fs.mkdirSync(storagePath);
      }

      callback(null, storagePath);
    },
    filename : function(request, file, callback) {
      var temp_file_arr = file.originalname.split(".");

      var temp_file_name = temp_file_arr[0];

      var temp_file_extension = temp_file_arr[1];

      callback(null, 'default' + '.' + temp_file_extension);
    }
});
const fileFilter = (req, file, cb) => {
    let storagePath = "";
    if (req.body.key === "logo" && req.body.type === "admin") {
      storagePath = `${__dirname}/../../public/images/admin-logo`;
    }

    if (req.body.key === "logo" && req.body.type === "web") {
      storagePath = `${__dirname}/../../public/images/web-logo`;
    }

    if (req.body.key === "logo" && req.body.type === "desktop") {
      storagePath = `${__dirname}/../../public/images/desktop-logo`;
    }

    if (req.body.key === "favicon") {
      storagePath = `${__dirname}/../../public/images/favicon`;
    }
    if (req.body.key === "logo" && req.body.type === "emailTemplateLogo") {
      storagePath = `${__dirname}/../../public/images/emailTemplateLogo`;
    }
    if (file.mimetype === 'image/jpg' || file.mimetype === 'image/svg' || file.mimetype === 'image/svg+xml' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {

      if (!fs.existsSync(storagePath)) {
        fs.mkdirSync(storagePath);
      }

      let files = fs.readdirSync(storagePath);
      files.forEach((tmpFile) => {
        fs.unlinkSync(storagePath + "/" + tmpFile);
      })
      cb(null, true);
    } else {
        cb(new Error("image should be png or jpeg extension"), false)
    }
}
const upload = multer({ storage: storage, fileFilter: fileFilter });




exports.init = (app) => {
  app.get('/api/v1/getEnv', commonctrl.getEnv);
  app.get("/api/v1/getlogo", commonctrl.getlogo);
  app.post("/api/v1/uploadLogoFile",upload.single("file"), commonctrl.uploadLogoFile);
  app.post('/api/v1/saveBrandSettingsData',commonctrl.saveBrandSettingsData)
  app.get('/api/v1/getBrandSettingsData',commonctrl.getBrandSettingsData)
};