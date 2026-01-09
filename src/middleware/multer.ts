import multer from "multer";
import fs from "fs";
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "./public";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileName = uniqueSuffix + "-" + file.originalname;
    cb(null, fileName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
});
export default upload;
