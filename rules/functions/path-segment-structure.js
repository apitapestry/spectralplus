export default (path, _opts) => {
    const errors = [];
    if (path === null) return errors;

    const nonQueryPathPattern = /^(?:\/api)?(?:\/v\d)?\/?(?:\/[a-z\-]+\/{[a-zA-Z\-]+})*(?:\/[a-z\-]+)?$/;
    let segments = path.split('/');

    if (segments.length === 2 && !segments[1].endsWith("-summary") && !path.match(nonQueryPathPattern)) {
        errors.push({message: `Path is not valid`, path: []});
    }

    return errors;
}