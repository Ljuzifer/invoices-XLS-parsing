const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { xlsxController } = require("../controllers/xlsxController");
const { upload, validate, fileValidate } = require("../middlewares");
const monthSchema = require("../schemas/monthSchema");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("uploads"));

app.post("/upload", validate(monthSchema), upload.single("invoicingFile"), fileValidate, xlsxController);

app.use((_, res) => {
    res.status(404).json({ message: "Not found" });
});

app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.message === "Unexpected field" || err.field !== "invoicingFile") {
            err.message = "File field must be named -> invoicingFile";
            next();
        }
    }
    res.status(err.status || 500).json({ message: err.message });
});

module.exports = app;
