/**
 * convert dash-joined string to camel case
 */

export default (a: string): string =>
    a.split('-').reduce((str, s, idx) => str + (idx === 0 ? s : s[0].toUpperCase() + s.slice(1)), '');
