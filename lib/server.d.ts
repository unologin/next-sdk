import type { GetServerSideProps, NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import HttpHandlers, { Request, Response } from '@unologin/node-api/build/http-handlers';
import { UserDocument } from '@unologin/node-api/build/types';
/** @internal */
export type GetServerSidePropsCtx = Parameters<GetServerSideProps>[0];
export type HandlerFunction<Args extends Array<any>> = (req: Request, res: Response, ...args: Args) => any;
export type UnologinNextJSWithContext = {
    [k in keyof UnologinNextJS]: UnologinNextJS[k] extends HandlerFunction<infer Args> ? (...args: Args) => ReturnType<UnologinNextJS[k]> : UnologinNextJS[k];
} & {
    getUserDocument: () => Promise<UserDocument | null>;
};
/** @see {@link UnologinNextJS.withUnologin} */
export interface GetServerSidePropsCtxUnologin extends GetServerSidePropsCtx {
    unologin: UnologinNextJSWithContext;
}
export type GetServerSidePropsOnError = (context: GetServerSidePropsCtx, error: unknown) => ReturnType<GetServerSideProps>;
/**
 * API handlers and utility functions for server-side Next.js.
 */
export declare class UnologinNextJS extends HttpHandlers {
    readonly rest: import("@unologin/node-api/build/rest").UnologinRestApi;
    /**
     * ServerSideProps sent on auth error.
     *
     * @see {@link withUnologin}
     */
    defaultErrorProps: {
        redirect: {
            destination: string;
            permanent: boolean;
        };
    };
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
     * Next.js API handler for the login callback.
     *
     * @param req req
     * @param res res
     * @returns Promise<void>
     */
    private loginHandler;
    /**
     * Next.js API handler for logging out.
     *
     * @param req req
     * @param res res
     * @returns void
     */
    private logoutHandler;
    /**
     * Handlers for all unologin Next.js API endpoints.
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
     * in the directory ```pages/api/unologin/``` in your Next.js project.
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
    withContext(context: Pick<GetServerSidePropsCtx, 'req' | 'res'>): UnologinNextJSWithContext;
    /**
     * Wraps getServerSideProps and attaches ```unologin``` key to ```context```.
     *
     * @see {@link GetServerSidePropsCtxUnologin}
     *
     * @param fn function to execute with context
     * @param onError error handler
     * @returns Promise<void>
     */
    withUnologin: (fn: (ctx: GetServerSidePropsCtxUnologin) => ReturnType<GetServerSideProps>, onError?: GetServerSidePropsOnError) => GetServerSideProps;
}
export default UnologinNextJS;
