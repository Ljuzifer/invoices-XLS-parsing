const xlsx = require("xlsx");
const { HttpError, DateConverter, ControllerWrapper, InvoiceCreator, validateFileStructure } = require("../helpers");

function xlsxController(req, res, _) {
    if (!req.file) {
        throw HttpError(400, "No file uploaded");
    }

    if (!req.body?.invoicingMonth) {
        throw HttpError(400, "No month parameter provided or incorrect parameter`s name.");
    }

    const inputMonth = req.body.invoicingMonth;

    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

    const { rowDate, currencyRates } = validateFileStructure(jsonData);

    const InvoicingMonth = DateConverter(rowDate);
    if (InvoicingMonth !== inputMonth) {
        throw HttpError(400, "Invoicing month incorrect!");
    }

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
