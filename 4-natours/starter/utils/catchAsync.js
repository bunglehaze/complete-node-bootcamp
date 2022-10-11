module.exports = fn => (req, res, next) => {    // eslint was having tantrum at the syntax used in the course and wanted to compress  it.
    fn(req, res, next).catch(next);
        };