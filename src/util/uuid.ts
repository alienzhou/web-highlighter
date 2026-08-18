/**
 * generate UUID
 */

/* eslint-disable @typescript-eslint/restrict-plus-operands */
export default function createUUID(a?): string {
    return a
        ? (a ^ ((Math.random() * 16) >> (a / 4))).toString(16)
        : (([1e7] as unknown as string) + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, createUUID);
}
