const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { xlsxController } = require("../controllers/xlsxController");
const { upload } = require("../middlewares");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("uploads"));

app.post("/upload", upload.single("invoicingFile"), xlsxController);

app.use((req, res) => {
    res.status(404).json({ message: "Not found" });
});

app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.message === "Unexpected field" || err.field !== "invoicingMonth") {
            next(HttpError(400, "Field must be named -> invoicingMonth"));
        }
    }
    res.status(err.status || 500).json({ message: err.message });
});

module.exports = app;
