const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { xlsxController } = require("../controllers/xlsxController");
const { upload } = require("../middlewares");
// const xlsx = require("xlsx");
// const { DateConverter } = require("../helpers");

const app = express();
// const router = express.Router();
// const upload = multer({ dest: "uploads/" });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("uploads"));

// router.post("/upload", upload.single("invoicingFile"), xlsxController);

app.post("/upload", upload.single("invoicingFile"), xlsxController),
    //     (req, res) => {
    //     if (!req.file) {
    //         return res.status(400).send("No file uploaded");
    //     }
    //     const inputMonth = req.body.invoicingMonth;

    //     const workbook = xlsx.readFile(req.file.path);
    //     const sheetName = workbook.SheetNames[0];
    //     const worksheet = workbook.Sheets[sheetName];
    //     const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

    //     const dateRow = jsonData[0][0];
    //     const currencyRow1 = jsonData[1][1];
    //     const currencyRow2 = jsonData[2][1];
    //     const currencyRow3 = jsonData[3][1];

    //     const InvoicingMonth = DateConverter(dateRow);
    //     if (InvoicingMonth !== inputMonth) {
    //         return res.status(400).send("Invoicing month incorrect!");
    //     }
    //     const currencyRates = {
    //         USD: parseFloat(currencyRow1),
    //         EUR: parseFloat(currencyRow2),
    //         GBP: parseFloat(currencyRow3),
    //     };
    //     console.log(InvoicingMonth, currencyRates);

    //     const headersRow = jsonData[4];
    //     const columnHeaders = headersRow.map((header) => String(header));

    //     const realDataStartIndex = 5;
    //     for (let i = realDataStartIndex; i < jsonData.length; i++) {
    //         const rowData = jsonData[i];
    //         const status = rowData[columnHeaders.indexOf("Status")];
    //         const invoiceNumber = rowData[columnHeaders.indexOf("Invoice #")];

    //         if (status === "Ready" || invoiceNumber) {
    //             const requiredFields = [
    //                 "Customer",
    //                 "Cust No'",
    //                 "Project Type",
    //                 "Quantity",
    //                 "Price Per Item",
    //                 "Item Price Currency",
    //                 "Total Price",
    //                 "Invoice Currency",
    //                 "Status",
    //             ];
    //             const missingFields = requiredFields.filter((field) => !columnHeaders.includes(field));

    //             if (missingFields.length > 0) {
    //                 continue;
    //             }

    //             const invoice = {};
    //             invoice["Customer"] = rowData[columnHeaders.indexOf("Customer")];
    //             invoice["Cust No'"] = rowData[columnHeaders.indexOf("Cust No'")];
    //             invoice["Project Type"] = rowData[columnHeaders.indexOf("Project Type")];
    //             invoice["Quantity"] = rowData[columnHeaders.indexOf("Quantity")];
    //             console.log(invoice);
    //         }
    //     }
    // });
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
