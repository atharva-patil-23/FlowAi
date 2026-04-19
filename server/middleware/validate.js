const validate =
    (schema, source = "body") =>
    (req, res, next) => {
        const result = schema.safeParse(req[source]);
        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: {
                    message: "Validation failed",
                    issues: result.error.issues.map((i) => ({
                        path: i.path.join("."),
                        message: i.message,
                    })),
                },
            });
        }
        req[source] = result.data;
        next();
    };

export default validate;
