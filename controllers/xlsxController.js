const xlsx = require("xlsx");
const { HttpError, DateConverter, ControllerWrapper, InvoiceCreator } = require("../helpers");

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

    const invoicesData = InvoiceCreator(jsonData);

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
