const ControllerWrapper = (controller) => {
    const method = async (req, res, next) => {
        try {
            await controller(req, res, next);
        } catch (error) {
            next(error);
        }
    };

    return method;
};

module.exports = ControllerWrapper;
