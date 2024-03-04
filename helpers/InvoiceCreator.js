const requiredHeaders = require("../public/requiredHeaders");
const HttpError = require("./HttpError");
const validateFileStructure = require("./validateFileStructure");

const InvoiceCreator = (jsonData) => {
    const { currencyRates, headerRowIndex } = validateFileStructure(jsonData);
    const headersRow = jsonData[headerRowIndex];

    const createdData = [];
    const realDataStartIndex = headerRowIndex + 1;

    for (let i = realDataStartIndex; i < jsonData.length; i++) {
        const rowData = jsonData[i];
        const status = rowData[headersRow.indexOf("Status")];
        const invoiceNumber = rowData[headersRow.indexOf("Invoice #")];

        if (status === "Ready" || invoiceNumber) {
            const invoice = {};
            const missingFields = requiredHeaders.filter((field) => !headersRow.includes(field));

            if (missingFields.length > 0) {
                continue;
            }

            invoice["Customer"] = rowData[headersRow.indexOf("Customer")];
            invoice["Cust No'"] = rowData[headersRow.indexOf("Cust No'")];
            invoice["Project Type"] = rowData[headersRow.indexOf("Project Type")];
            invoice["Quantity"] = rowData[headersRow.indexOf("Quantity")];
            invoice["Price Per Item"] = rowData[headersRow.indexOf("Price Per Item")];
            invoice["Item Price Currency"] = rowData[headersRow.indexOf("Item Price Currency")];
            invoice["Total Price"] = rowData[headersRow.indexOf("Total Price")];
            invoice["Invoice Currency"] = rowData[headersRow.indexOf("Invoice Currency")];
            invoice["Status"] = rowData[headersRow.indexOf("Status")];
            invoice["Invoice #"] = rowData[headersRow.indexOf("Invoice #")];

            const totalPriceIndex = headersRow.indexOf("Total Price");
            const invoiceCurrencyIndex = headersRow.indexOf("Invoice Currency");
            const itemPriceCurrencyIndex = headersRow.indexOf("Item Price Currency");
            const totalPrice = parseFloat(rowData[totalPriceIndex]);
            const invoiceCurrency = rowData[invoiceCurrencyIndex];
            const itemPriceCurrency = rowData[itemPriceCurrencyIndex];
            const itemPriceCurrencyRate = currencyRates[itemPriceCurrency];

            let totalPriceInInvoiceCurrency = totalPrice;

            if (invoiceCurrency === "ILS" && itemPriceCurrency !== "ILS") {
                totalPriceInInvoiceCurrency = totalPrice * itemPriceCurrencyRate;
            } else if (invoiceCurrency === "ILS" && itemPriceCurrency === "ILS") {
                totalPriceInInvoiceCurrency = totalPrice;
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
