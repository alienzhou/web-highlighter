interface Deferred<T> {
    promise: Promise<T>,
    resolve: Function,
    reject: Function
};

export default function getDeferred<T>(): Deferred<T> {
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
    const defer = getDeferred<T>();
    defer.resolve(data);
    return defer.promise;
};

export const reject = <T>(data) => {
    const defer = getDeferred<T>();
    defer.reject(data)
    return defer.promise;
};
