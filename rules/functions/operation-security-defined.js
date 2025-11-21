export default (security, _opts, {document}) => {
    const errors = [];
    if (security === null || typeof security !== 'string') return errors;

    let securitySchemes = document.parserResult.data?.components?.securitySchemes;

    if (securitySchemes && !(security in securitySchemes)) {
        errors.push({message: `Security scheme "${security}" does not exist in Security schema.`, path: []});
    }

    return errors;
}