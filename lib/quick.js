/**
 * Sets up unologin with a standard configuration.
 *
 * Exports a plug-and-play instance of {@link server.UnologinNextJS} along with
 * some helper functions.
 *
 *
 * Requires
 *  ```UNOLOGIN_API_KEY```,
 *  ```NEXT_PUBLIC_UNOLOGIN_APPID```, and
 *  ```UNOLOGIN_COOKIES_DOMAIN```
 * to be in ```process.env```.
 *
 *
 *
 * @module quick
 *
 *
 */
import unologinNode from '@unologin/node-sdk';
import unologinWeb from '@unologin/web-sdk';
import UnologinNextJS from './server';
if (typeof window === 'undefined') {
    unologinNode.setup({
        apiKey: process.env.UNOLOGIN_API_KEY,
        cookiesDomain: process.env.UNOLOGIN_COOKIES_DOMAIN,
        disableSecureCookies: process.env.NODE_ENV === 'development',
    });
}
/**
 * Quick setup for the client.
 *
 * @returns void
 */
export function clientSetup() {
    if (typeof window !== 'undefined') {
        unologinWeb.setup({
            appId: process.env.NEXT_PUBLIC_UNOLOGIN_APPID,
        });
    }
}
/**
 * Instance of {@link server.UnologinNextJS} using the default behavior.
 */
export const unologinNextJs = new UnologinNextJS(unologinNode);
/**
 * @see {@link server.UnologinNextJS.nextApiHandler}
 */
export const nextApiHandler = unologinNextJs.nextApiHandler
    .bind(unologinNextJs);
/**
 * @see {@link server.UnologinNextJS.withUnologin}
 */
export const withUnologin = unologinNextJs.withUnologin
    .bind(unologinNextJs);
