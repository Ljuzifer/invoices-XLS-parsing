const Joi = require("joi");

const monthSchema = Joi.object({
    invoicingMonth: Joi.string()
        .regex(/^\d{4}-\d{2}$/)
        .required(),
});

module.exports = monthSchema;
