const HttpError = require("./HttpError");

const InvoiceCreator = (jsonData) => {
    const requiredHeaders = [
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

    const headersRow = jsonData[4];
    const actualHeaders = headersRow.map((header) => String(header));

    if (!requiredHeaders.every((header) => actualHeaders.includes(header))) {
        throw HttpError(400, "Missing or incorrect headers in file");
    }

    const createdData = [];
    const realDataStartIndex = 5;
    for (let i = realDataStartIndex; i < jsonData.length; i++) {
        const rowData = jsonData[i];
        const status = rowData[actualHeaders.indexOf("Status")];
        const invoiceNumber = rowData[actualHeaders.indexOf("Invoice #")];

        if (status === "Ready" || invoiceNumber) {
            const invoice = {};
            const missingFields = requiredHeaders.filter((field) => !actualHeaders.includes(field));

            if (missingFields.length > 0) {
                continue;
            }

            invoice["Customer"] = rowData[actualHeaders.indexOf("Customer")];
            invoice["Cust No'"] = rowData[actualHeaders.indexOf("Cust No'")];
            invoice["Project Type"] = rowData[actualHeaders.indexOf("Project Type")];
            invoice["Quantity"] = rowData[actualHeaders.indexOf("Quantity")];
            invoice["Price Per Item"] = rowData[actualHeaders.indexOf("Price Per Item")];
            invoice["Item Price Currency"] = rowData[actualHeaders.indexOf("Item Price Currency")];
            invoice["Total Price"] = rowData[actualHeaders.indexOf("Total Price")];
            invoice["Invoice Currency"] = rowData[actualHeaders.indexOf("Invoice Currency")];
            invoice["Status"] = rowData[actualHeaders.indexOf("Status")];
            invoice["Invoice #"] = rowData[actualHeaders.indexOf("Invoice #")];

            createdData.push(invoice);
        }
    }
    return createdData;
};

module.exports = InvoiceCreator;
