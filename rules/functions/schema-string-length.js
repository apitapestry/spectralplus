export default (schema, _opts) => {
    const errors = [];
    if (schema === null || typeof schema === 'object') {
        return errors;
    }

    let lengthType = 'max';
    if (_opts.type) lengthType = _opts.type;

    if (lengthType === 'max') {
        if (isNaN(schema)) {
            let pattern = schema.match(/{\d*,(\d*)}\$/)
            if (pattern && pattern[1] > 1024) {
                errors.push({message: `${schema}`, path: []})
            }
        } else if (schema > 1024) {
            errors.push({message: `${schema}`, path: []})
        }
    } else if (lengthType === 'min') {
        if (isNaN(schema)) {
            let pattern = schema.match(/{(\d*),\d*}\$/)
            if (pattern && pattern[1] === '0') {
                errors.push({message: `${schema}`, path: []})
            }
        } else if (schema === 0) {
            errors.push({message: `${schema}`, path: []})
        }
    }

    return errors;
};
