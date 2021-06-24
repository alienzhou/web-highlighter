/**
 * support IE 10
 */
export const unique = <T>(arr: T[]): T[] => {
    const res: T[] = [];

    for (const el of arr) {
        if (res.indexOf(el) === -1) {
            res.push(el);
        }
    }

    return res;
};
