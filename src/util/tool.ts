/**
 * support IE 10
 */
export const unique = <T>(arr: T[]): T[] => {
    const res: T[] = [];

    for (const el of arr) {
        if (!res.includes(el)) {
            res.push(el);
        }
    }

    return res;
};
