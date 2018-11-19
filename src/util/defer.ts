interface Defer<T> {
    promise: Promise<T>,
    resolve: Function,
    reject: Function
};

export default function getDefer<T>(): Defer<T> {
    let promise: Promise<T>;
    let resolve: Function;
    let reject: Function;
    promise = new Promise((r, j) => {
        resolve = r;
        reject = j;
    });
    return {
        promise,
        resolve,
        reject
    };
};

export const resolve = <T>(data) => {
    const defer = getDefer<T>();
    defer.resolve(data);
    return defer.promise;
};
export const reject = <T>(data) => {
    const defer = getDefer<T>();
    defer.reject(data)
    return defer.promise;
};