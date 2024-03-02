const { HttpError } = require("../helpers");

const validate = (schema) => {
    const method = (req, res, next) => {
        const { error } = schema.validate(req.body);
        if (error) {
            next(HttpError(400, error.message));
        }
        next();
    };
    return method;
};

module.exports = validate;
