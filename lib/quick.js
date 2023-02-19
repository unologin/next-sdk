/**
 * Sets up unologin with a standard configuration.
 *
 * Exports a plug-and-play instance of {@link UnologinNextJS} along with
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
import unologinNode from '@unologin/node-api';
import unologinWeb from '@unologin/web-sdk';
import UnologinNextJS from './server';
unologinNode.setup({
    apiKey: process.env.UNOLOGIN_API_KEY,
    cookiesDomain: process.env.UNOLOGIN_COOKIES_DOMAIN,
    disableSecureCookies: process.env.NODE_ENV === 'development',
});
unologinWeb.setup({
    appId: process.env.NEXT_PUBLIC_UNOLOGIN_APPID,
});
/**
 * Instance of {@link UnologinNextJS} using the default behavior.
 */
export const unologinNextJs = new UnologinNextJS(unologinNode);
/**
 * @see {@link UnologinNextJS.nextApiHandler}
 */
export const nextApiHandler = unologinNextJs.nextApiHandler;
/**
 * @see {@link UnologinNextJS.withUnologin}
 */
export const withUnologin = unologinNextJs.withUnologin;
