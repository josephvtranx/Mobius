const errorHandler = (err, req, res, next) => {
    console.error(err.stack); // Log the error for debugging
    res.status(500).json({ error: 'An unexpected error occurred' });
};

module.exports = errorHandler;

// middleware to handle unexpected errors globally