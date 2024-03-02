const express = require("express");
const cors = require("cors");
const multer = require("multer");
const xlsx = require("xlsx");
const { DateConverter } = require("../helpers");

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("uploads"));

app.post("/upload", upload.single("invoicingFile"), (req, res) => {
    if (!req.file) {
        return res.status(400).send("No file uploaded");
    }
    const inputMonth = req.body.invoicingMonth;

    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

    const dateRow = jsonData[0][0];
    const currencyRow1 = jsonData[1][1];
    const currencyRow2 = jsonData[2][1];
    const currencyRow3 = jsonData[3][1];

    const InvoicingMonth = DateConverter(dateRow);
    if (InvoicingMonth !== inputMonth) {
        return res.status(400).send("Invoicing month incorrect!");
    }
    const currencyRates = {
        USD: parseFloat(currencyRow1),
        EUR: parseFloat(currencyRow2),
        GBP: parseFloat(currencyRow3),
    };
    console.log(InvoicingMonth, currencyRates);

    const headersRow = jsonData[4];
    const columnHeaders = headersRow.map((header) => String(header));

    const realDataStartIndex = 5;
    for (let i = realDataStartIndex; i < jsonData.length; i++) {
        const rowData = jsonData[i];
        const status = rowData[columnHeaders.indexOf("Status")];
        const invoiceNumber = rowData[columnHeaders.indexOf("Invoice #")];

        if (status === "Ready" || invoiceNumber) {
            const requiredFields = [
                "Customer",
                "Cust No'",
                "Project Type",
                "Quantity",
                "Price Per Item",
                "Item Price Currency",
                "Total Price",
                "Invoice Currency",
                "Status",
            ];
            const missingFields = requiredFields.filter((field) => !columnHeaders.includes(field));

            if (missingFields.length > 0) {
                continue;
            }

            const invoice = {};
            invoice["Customer"] = rowData[columnHeaders.indexOf("Customer")];
            invoice["Cust No'"] = rowData[columnHeaders.indexOf("Cust No'")];
            invoice["Project Type"] = rowData[columnHeaders.indexOf("Project Type")];
            invoice["Quantity"] = rowData[columnHeaders.indexOf("Quantity")];
            console.log(invoice);
        }
    }

    const invoicesData = [];
    // for (let i = 0; i < relevantData.length; i++) {
    //     const row = relevantData[i];
    //     const invoice = {
    //         Customer: row[0],
    //         "Cust No'": row[1],
    //         "Project Type": row[2],
    //         Quantity: row[3],
    //         "Price Per Item": row[4],
    //         "Item Price Currency": row[5],
    //         "Total Price": row[6],
    //         "Invoice Currency": row[7],
    //         Status: row[8],
    //         "Invoice #": row[9],
    //         validationErrors: [],
    //     };

    //     invoicesData.push(invoice);
    // }
});

module.exports = app;
