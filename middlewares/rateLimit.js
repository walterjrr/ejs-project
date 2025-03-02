const rateLimit = require('express-rate-limit')

const ratelimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 3, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    message: 'Too many requests from this IP, please try again after 15 minutes',
    statusCode: 429,

})

module.exports = ratelimiter