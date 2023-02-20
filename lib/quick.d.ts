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
/// <reference types="node" />
import UnologinNextJS from './server';
/**
 * Quick setup for the client.
 *
 * @returns void
 */
export declare function clientSetup(): void;
/**
 * Instance of {@link UnologinNextJS} using the default behavior.
 */
export declare const unologinNextJs: UnologinNextJS;
/**
 * @see {@link UnologinNextJS.nextApiHandler}
 */
export declare const nextApiHandler: import("next").NextApiHandler<any>;
/**
 * @see {@link UnologinNextJS.withUnologin}
 */
export declare const withUnologin: (fn: (ctx: import("./server").GetServerSidePropsCtxUnologin) => Promise<import("next").GetServerSidePropsResult<{
    [key: string]: any;
}>>, onError?: import("./server").GetServerSidePropsOnError) => import("next").GetServerSideProps<{
    [key: string]: any;
}, import("querystring").ParsedUrlQuery, import("next").PreviewData>;
