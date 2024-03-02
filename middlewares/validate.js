const { HttpError } = require("../helpers");

const validate = (schema) => {
    const method = (req, res, next) => {
        const { error } = schema.validate(req.body.invoicingMonth, { allowUnknown: true });
        if (error) {
            next(HttpError(400, error.message));
        }
        next();
    };
    return method;
};

const fileValidate = (req, res, next) => {
    if (!req.file || req.file.mimetype !== "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
        next(HttpError(400, "Uploaded file must be an Excel file in XLSX format"));
    }
    next();
};

module.exports = { validate, fileValidate };
