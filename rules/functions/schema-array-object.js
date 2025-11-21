export default (property, _opts, {path}) => {
    const errors = [];
    if (property) {
        return errors;
    }

    let count = 0;
    const keys = Object.keys(property);
    keys.forEach((key) => {
        if (property[key].type !== 'array') {
            count++;
        }
    })
    if (count === 0) {
        errors.push({message: path[path.length - 2]});
    }
    return errors;
};
