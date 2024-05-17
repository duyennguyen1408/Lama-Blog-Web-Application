import express from "express";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import postRoutes from "./routes/posts.js";
import cookieParser from "cookie-parser";
import multer from "multer";
import { db } from "./db.js";

const aws = require('aws-sdk');
const bodyParser = require('body-parser');
const multerS3 = require('multer-s3');

aws.config.update({
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    region: process.env.AWS_REGION
});

const app = express();
const s3 = new aws.S3();

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());

db.connect((error) => {
    if (error) {
        console.error("Error connecting to MySQL database:", error);
    } else {
        console.log("Connected to MySQL database!");
    }
});

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, "../client/public/upload");
//     },
//     filename: function (req, file, cb) {
//         cb(null, Date.now() + file.originalname);
//     },
// });

// const upload = multer({ storage });

const upload = multer({ 
    storage: multerS3({
        s3: s3,
        acl: 'public_read',
        bucket: process.env.S3_BUCKET_NAME,
        key: function (req, file, cb) {
            console.log(file);
            cb(null, file.originalname); //use Date.now() for unique file keys
        }
    })
})

app.post("/api/upload", upload.single("file"), function (req, res) {
    const file = req.file;
    res.status(200).json(file.filename);
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);

app.listen(8800, () => {
    console.log("Connected!");
});
