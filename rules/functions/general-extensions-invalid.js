// Check that extensions are valid
// given is the components of the object, _opts is the list of valid extensions

export default (input, _opts) => {
    const errors = [];
    if (input === null) return errors;

    let validExtensions = [];
    if (_opts.values.length > 0) validExtensions = _opts.values;

    let extension = input.toString();

    if (extension.startsWith("x-") && !validExtensions.includes(extension)) {
        errors.push(`Invalid extension: ${extension}`);
    }

    return errors;
}