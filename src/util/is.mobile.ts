/**
 * is mobile device?
 */

const regMobile: RegExp = /Android|iPhone|BlackBerry|BB10|Opera Mini|Phone|Mobile|Silk|Windows Phone|Mobile(?:.+)Firefox\b/i;
export default function (userAgent: string): boolean {
    return regMobile.test(userAgent);
}
