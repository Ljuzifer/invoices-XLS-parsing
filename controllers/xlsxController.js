const xlsx = require("xlsx");
const { HttpError, DateConverter, ControllerWrapper } = require("../helpers");

function xlsxController(req, res, _) {
    if (!req.file) {
        throw HttpError(400, "No file uploaded");
    }

    if (!req.body.invoicingMonth) {
        throw HttpError(400, "No month parameter provided");
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

    const headersRow = jsonData[4];
    const columnHeaders = headersRow.map((header) => String(header));
    const invoicesData = [];

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
            invoice["Price Per Item"] = rowData[columnHeaders.indexOf("Price Per Item")];
            invoice["Item Price Currency"] = rowData[columnHeaders.indexOf("Item Price Currency")];
            invoice["Total Price"] = rowData[columnHeaders.indexOf("Total Price")];
            invoice["Invoice Currency"] = rowData[columnHeaders.indexOf("Invoice Currency")];
            invoice["Status"] = rowData[columnHeaders.indexOf("Status")];
            invoice["Invoice #"] = rowData[columnHeaders.indexOf("Invoice #")];

            invoicesData.push(invoice);
        }
    }

    const response = {
        InvoicingMonth,
        currencyRates,
        invoicesData,
    };

    res.status(201).json(response);
}

module.exports = {
    xlsxController: ControllerWrapper(xlsxController),
};
