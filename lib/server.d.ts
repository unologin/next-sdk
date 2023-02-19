import type { GetServerSideProps, NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import HttpHandlers from '@unologin/node-api/build/http-handlers';
import { UnologinRestApi } from '@unologin/node-api/build/rest';
import { UserDocument, UserHandle } from '@unologin/node-api/build/types';
/** @internal */
type GetServerSidePropsCtx = Parameters<GetServerSideProps>[0];
/** Contains functions bound to a request context. */
export interface UnologinNextJSWithContext {
    /** @see {@link} UnologinRestApi */
    readonly rest: UnologinRestApi;
    /** @returns UserHandle | null */
    readonly getUserHandle: () => UserHandle | null;
    /** @returns Promise<UserDocument | null> */
    readonly getUserDocument: () => Promise<UserDocument | null>;
}
/** @see {@link UnologinNextJS.withUnologin} */
export interface GetServerSidePropsCtxUnologin extends GetServerSidePropsCtx {
    unologin: UnologinNextJSWithContext;
}
/**
 * API handlers and utility functions for server-side NextJS.
 */
export declare class UnologinNextJS extends HttpHandlers {
    readonly rest: UnologinRestApi;
    /**
     * @internal
     * @param req req
     * @param res res
     * @param name name
     * @param value value
     * @param options options
     * @returns void
     */
    protected setCookie(req: NextApiRequest, res: NextApiResponse, name: string, value: string, options: object): void;
    /**
     * NextJS API handler for the login callback.
     *
     * @param req req
     * @param res res
     * @returns Promise<void>
     */
    private loginHandler;
    /**
     * NextJS API handler for logging out.
     *
     * @param req req
     * @param res res
     * @returns void
     */
    private logoutHandler;
    /**
     * Handlers for all unologin NextJS API endpoints.
     *
     * @see {@link nextApiHandler}
     */
    readonly routeHandlers: {
        [route: string]: NextApiHandler;
    };
    /**
     * Single handler for all unologin related API requests.
     *
     * Create a file called ```[unologin].ts``` or ```[unologin].js```
     * in the directory ```pages/api/unologin/``` in your NextJS project.
     *
     * In this file, set the default export to {@link nextApiHandler}.
     *
     * @example
     *
     * Using the {@link quick}-setup:
     *
     * ```typescript
     *
     * import { nextApiHandler } from '@unologin/next/quick';
     *
     * export default nextApiHandler;
     *
     * ```
     *
     * @example
     *
     * Or using a custom setup:
     *
     * ```typescript
     *
     * import unologinNextJs from 'path/to/your/unologin-instance';
     *
     * export default unologinNextJs.nextApiHandler;
     *
     * ```
     *
     * @param req req
     * @param res res
     * @returns Promise
     */
    nextApiHandler: NextApiHandler;
    /**
     *
     * @param context context from GetServerSideProps
     * @returns unologin with context {@link UnologinNextJSWithContext}
     */
    withContext(context: GetServerSidePropsCtx): UnologinNextJSWithContext;
    /**
     * Wraps getServerSideProps and attaches ```unologin``` key to ```context```.
     *
     * @see {@link GetServerSidePropsCtxUnologin}
     *
     * @param fn function to execute with context
     * @param onError error handler
     * @returns Promise<void>
     */
    withUnologin: (fn: (ctx: GetServerSidePropsCtxUnologin) => ReturnType<GetServerSideProps>, onError?: GetServerSideProps) => GetServerSideProps;
}
export default UnologinNextJS;
