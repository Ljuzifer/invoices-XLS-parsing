const requiredHeaders = require("../public/requiredHeaders");
const HttpError = require("./HttpError");

const validateFileStructure = (jsonData) => {
    const rowDate = jsonData[0].find((cell) => !isNaN(Date.parse(cell)));

    if (!rowDate) {
        throw HttpError(400, "There are no date in the first row!");
    }

    let currencyRates = {};

    jsonData.forEach((row) => {
        row.forEach((cell, cellIndex) => {
            if (typeof cell === "string" && cell.includes("Rate")) {
                const currency = cell.split(" ")[0];
                const rateIndex = cellIndex + 1;
                const rate = parseFloat(row[rateIndex]);
                if (!isNaN(rate)) {
                    currencyRates[currency] = rate;
                }
            }
        });
    });

    if (Object.keys(currencyRates).length === 0) {
        throw HttpError(400, "Currency data is missing or currency rates are incorrect!");
    }

    let headerRowIndex = jsonData.findIndex((row) => requiredHeaders.every((header) => row.includes(header)));

    if (headerRowIndex === -1) {
        throw HttpError(400, "Headers in file not found!");
    }

    const headers = jsonData[headerRowIndex];
    const stringHeaders = headers.map((header) => String(header));

    if (!requiredHeaders.every((header) => stringHeaders.includes(header))) {
        throw HttpError(400, "Missing or incorrect headers in file");
    }

    return { rowDate, currencyRates, headerRowIndex };
};

module.exports = validateFileStructure;
