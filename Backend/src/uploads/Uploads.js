import multer from "multer";
import path from "path";
import fs from "fs";

// Make sure the uploads folder exists
const UPLOADS_DIR = path.join(process.cwd(), "Uploads"); // absolute path
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  console.log("Created uploads folder at", UPLOADS_DIR);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const Uploads = multer({ storage });

export default Uploads;