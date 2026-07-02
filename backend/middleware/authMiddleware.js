const jwt = require("jsonwebtoken")
// import jsonwebtoken library

const authMiddleware = (req, res, next) => {

    const authHeader = req.headers.authorization
    // get Authorization header from request

    if (!authHeader) {
        return res.status(401).json({ message: "No token provided" })
    }
    // if no token sent → reject request

    const token = authHeader.split(" ")[1]
    // Authorization format:
    // Bearer TOKEN
    // so we split and take the token part

    try {

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        // verify token using JWT secret

        req.user = decoded
        // attach decoded user data to request

        next()
        // continue to next middleware / route

    } catch (error) {

        return res.status(401).json({ message: "Invalid token" })
        // reject request if token invalid

    }
}

module.exports = authMiddleware