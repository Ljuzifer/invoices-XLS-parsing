const HttpError = require("./HttpError");

const InvoiceCreator = (jsonData, currencyRates) => {
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

            const totalPriceIndex = actualHeaders.indexOf("Total Price");
            const invoiceCurrencyIndex = actualHeaders.indexOf("Invoice Currency");
            const itemPriceCurrencyIndex = actualHeaders.indexOf("Item Price Currency");
            const totalPrice = parseFloat(rowData[totalPriceIndex]);
            const invoiceCurrency = rowData[invoiceCurrencyIndex];
            const itemPriceCurrency = rowData[itemPriceCurrencyIndex];
            const itemPriceCurrencyRate = currencyRates[itemPriceCurrency];

            let totalPriceInInvoiceCurrency = totalPrice;
            if (invoiceCurrency === "ILS") {
                totalPriceInInvoiceCurrency = totalPrice * itemPriceCurrencyRate;
            } else if (itemPriceCurrency !== invoiceCurrency && invoiceCurrency !== "ILS") {
                const invoiceCurrencyRate = currencyRates[invoiceCurrency];
                totalPriceInInvoiceCurrency = (itemPriceCurrencyRate / invoiceCurrencyRate) * totalPrice;
            }

            invoice["Invoice Total"] = isNaN(totalPriceInInvoiceCurrency)
                ? "none"
                : Number(totalPriceInInvoiceCurrency.toFixed(2));

            const validationErrors = [];
            if (!invoice["Customer"]) {
                validationErrors.push("Customer is required");
            }
            if (invoice["Cust No'"] !== 0 && isNaN(invoice["Cust No'"])) {
                validationErrors.push("Cust No' is required");
            }
            if (!invoice["Project Type"]) {
                validationErrors.push("Project Type is required");
            }
            if (invoice["Quantity"] !== 0 && isNaN(invoice["Quantity"])) {
                validationErrors.push("Quantity is required");
            }
            if (invoice["Price Per Item"] !== 0 && isNaN(invoice["Price Per Item"])) {
                validationErrors.push("Price Per Item is required");
            }
            if (!invoice["Item Price Currency"]) {
                validationErrors.push("Item Price Currency is required");
            }
            if (invoice["Total Price"] !== 0 && isNaN(invoice["Total Price"])) {
                validationErrors.push("Total Price is required");
            }
            if (!invoice["Invoice Currency"]) {
                validationErrors.push("Invoice Currency is required");
            }

            invoice["validationErrors"] = validationErrors;

            createdData.push(invoice);
        }
    }
    return createdData;
};

module.exports = InvoiceCreator;
