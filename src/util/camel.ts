export default (str: string): string => (
    str.split('-').reduce((str, s, idx) => str + (idx === 0 ? s: s[0].toUpperCase() + s.slice(1)), '')
);
