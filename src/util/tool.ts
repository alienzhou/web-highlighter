/**
 * in order to support IE 10, so can't use Set
 */
export function unique<T>(arr: Array<T>): Array<T> {
    const record: any = {};
    const res: Array<T> = [];
    for (let i = 0; i< arr.length; i++) {
        const el = arr[i];
        if (!record[el]) {
            res.push(el);
            record[el] = true;
        }
    }
    return res;
}