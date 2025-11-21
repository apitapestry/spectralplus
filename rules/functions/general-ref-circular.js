export default (ref, _opts, {document}) => {
    const errors = [];
    if (ref === null || document.source === null) return errors;

    let contractName = document.source;

    if (ref.includes(contractName)) {
        errors.push(`Invalid ref: circular reference detected in ${contractName} at ${ref}`);
    }

    return errors;
}