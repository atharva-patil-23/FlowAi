const errorHandler = (err, req, res, next) => {
    const status = err.status || err.statusCode || 500;

    if (status >= 500) {
        console.error("[errorHandler]", err);
    }

    let message = err.message || "Something went wrong";
    if (err.name === "ValidationError") {
        message = "Validation failed";
    } else if (err.code === 11000) {
        const field = Object.keys(err.keyValue || {})[0] || "field";
        message = `${field} already in use`;
    }

    res.status(status).json({
        success: false,
        error: { message },
    });
};

export default errorHandler;
