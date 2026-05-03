const buckets = new Map();

const sweepIfStale = (now) => {
    if (buckets.size < 10_000) return;
    for (const [key, b] of buckets) {
        if (b.resetAt < now) buckets.delete(key);
    }
};

const rateLimit = ({ windowMs, max, keyFn = (req) => req.user?.id || req.ip }) =>
    (req, res, next) => {
        const key = keyFn(req);
        if (!key) return next();
        const now = Date.now();
        sweepIfStale(now);
        let b = buckets.get(key);
        if (!b || now > b.resetAt) {
            b = { count: 0, resetAt: now + windowMs };
            buckets.set(key, b);
        }
        b.count += 1;
        if (b.count > max) {
            const retryAfter = Math.ceil((b.resetAt - now) / 1000);
            res.set("Retry-After", String(retryAfter));
            return res.status(429).json({
                success: false,
                error: { message: `Too many requests. Try again in ${retryAfter}s.` },
            });
        }
        next();
    };

export default rateLimit;
