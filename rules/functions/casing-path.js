export default (path, _opts) => {
    if (path === null) {
        return [];
    }

    let pattern = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
    let casingType = 'kebab';
    if (_opts.type) casingType = _opts.type;
    const errors = [];

    switch (_opts.type) {
        case 'flat':
            pattern = /^[a-z][a-z0-9]*$/
            break;
        case 'camel':
            pattern = /^[a-z][a-z0-9]*(?:[A-Z0-9][a-z0-9]+)*$/
            break;
        case 'pascal':
            pattern = /^[A-Z][a-z0-9]*(?:[A-Z0-9][a-z0-9]+)*$/
            break;
        case 'kebab':
            pattern = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/
            break;
        case 'cobol':
            pattern = /^[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)*$/
            break;
        case 'snake':
            pattern = /^[a-z][a-z0-9]*(?:_[a-z0-9]+)*$/
            break;
        case 'macro':
            pattern = /^[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)*$/
            break;
        default:
            break;
    }

    let pathComponents = path.split("/");

    pathComponents.forEach(component => {
        if (!component.match(/^{.*}$/) && !component.match(pattern) && component) {
            errors.push({message: `{$path} MUST be ` + casingType + ` case`})
        }
    })

    return errors;
};
