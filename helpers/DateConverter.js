const DateConverter = (date) => {
    const parts = date?.split(" ");
    const month = parts[0];
    const year = parts[1];
    const monthsMap = {
        Jan: "01",
        Feb: "02",
        Mar: "03",
        Apr: "04",
        May: "05",
        Jun: "06",
        Jul: "07",
        Aug: "08",
        Sep: "09",
        Oct: "10",
        Nov: "11",
        Dec: "12",
    };

    const monthNumber = monthsMap[month];

    const invoicingDate = `${year}-${monthNumber}`;

    return invoicingDate;
};

module.exports = DateConverter;
