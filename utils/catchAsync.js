// Wrapper function that will wrap around all of our async functions so that if there are any errors, they will be caught and pushed to next which is then where we will handle all of the errors.

module.exports = func => {
    return (req, res, next) => {
        func(req, res, next).catch(next);
    }
}