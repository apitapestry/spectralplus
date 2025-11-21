export default (schema, _opts) => {
    const errors = [];
    if (schema === null || typeof schema === 'object') {
        return errors;
    }

    try {
        new RegExp(schema);
    } catch (e) {
        errors.push({
            message: `Invalid regular expression: ${e.message}`, path: []});
        return errors;
    }

    let printableChars = '';
    let modifiedPattern = schema.replace(/{[^]]*}/, "+")
    if (!modifiedPattern.startsWith('^')) {
        modifiedPattern = '^' + modifiedPattern;
    }
    if (!modifiedPattern.endsWith('$')) {
        modifiedPattern += '$';
    }
    for (let i = 32; i < 126; i++) {
        printableChars += String.fromCharCode(i);
    }

    if (printableChars.match(modifiedPattern)) {
        errors.push({
            message: `Pattern matches all printable characters`, path: []});
    }
    return errors;
};
