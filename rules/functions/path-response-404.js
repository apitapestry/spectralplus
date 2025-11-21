export default (response, _opts, {path}) => {
  const errors = [];
  if (response === null || typeof response !== 'object') {
    return [];
  }

  let is404Needed = _opts.is404Needed;
  let opPath = path[path.length - 3];
  let segments = opPath.split('/')
      .filter(segment => segment)
      .filter(segment => !segment.startsWith('action'));
  let pathHasKey = opPath.match(/{.*}/);
  let isSystemAction = opPath.includes('/system-action');
  let has404Error = response.hasOwnProperty('404');

  if (isSystemAction && is404Needed && !has404Error) {
    errors.push({message: opPath});
  }

  if (!isSystemAction && is404Needed && !has404Error && pathHasKey) {
    errors.push({message: opPath});
  }

  if (!isSystemAction && is404Needed && has404Error && (segments.length === 0 || !pathHasKey)) {
    errors.push({message: opPath});
  }

  return errors;
};
