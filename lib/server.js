/**
 * @module server
 *
 */
import Cookies from 'cookies';
import HttpHandlers from '@unologin/node-sdk/http-handlers';
import unologin from '@unologin/node-sdk';
import { APIError, } from '@unologin/node-sdk/errors';
/**
 * API handlers and utility functions for server-side Next.js.
 */
export class UnologinNextJS extends HttpHandlers {
    /**
     *
     * @param client client
     */
    constructor(client = unologin) {
        super(client);
        this.rest = unologin.rest;
        /**
         * ServerSideProps sent on auth error.
         *
         * @see {@link withUnologin}
         */
        this.defaultErrorProps = {
            redirect: {
                destination: '/login',
                permanent: false,
            },
        };
        /**
         * Next.js API handler for the login callback.
         *
         * @param req req
         * @param res res
         * @returns Promise<void>
         */
        this.loginHandler = async (req, res) => {
            const { url } = await this.handleLoginEvent(req, res);
            res.redirect(307, url.href);
        };
        /**
         * Next.js API handler for logging out.
         *
         * @param req req
         * @param res res
         * @returns void
         */
        this.logoutHandler = (req, res) => {
            if (req.method === 'POST') {
                this.resetLoginCookies(req, res);
                res.send('OK');
            }
            else {
                res.status(404)
                    .send('Can only log out using POST.');
            }
        };
        /**
         * Handlers for all unologin Next.js API endpoints.
         *
         * @see {@link nextApiHandler}
         */
        this.routeHandlers = {
            login: this.loginHandler.bind(this),
            logout: this.logoutHandler.bind(this),
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
        this.nextApiHandler = (req, res) => {
            const route = req.query.unologin;
            if (typeof (route) === 'string' &&
                route in this.routeHandlers) {
                return this.routeHandlers[route](req, res);
            }
            else {
                res.status(404)
                    .send(`Cannot ${req.method} ${req.url}.`);
            }
        };
        /**
         * Wraps getServerSideProps and attaches ```unologin``` key to ```context```.
         *
         * @see {@link GetServerSidePropsCtxUnologin}
         *
         * @param fn function to execute with context
         * @param onError error handler
         * @returns Promise<void>
         */
        this.withUnologin = (fn, onError = (() => Promise.resolve(this.defaultErrorProps))) => {
            return async (context) => {
                try {
                    return await fn({
                        ...context,
                        unologin: this.withContext(context),
                    });
                }
                catch (error) {
                    if (error instanceof APIError &&
                        error.isAuthError()) {
                        this.resetLoginCookies(
                        // [!] TODO type
                        context.req, context.res);
                        return onError(context, error);
                    }
                    else {
                        throw error;
                    }
                }
            };
        };
        this.rest || (this.rest = client.rest);
    }
    /**
     * @internal
     * @param req req
     * @param res res
     * @param name name
     * @param value value
     * @param options options
     * @returns void
     */
    setCookie(req, res, name, value, options) {
        new Cookies(req, res)
            .set(name, value, options);
    }
    /**
     *
     * @param context context from GetServerSideProps
     * @returns unologin with context {@link UnologinNextJSWithContext}
     */
    withContext(context) {
        // [!] TODO: types in node-api
        const req = context.req;
        const res = context.res;
        /**
         * Important: avoid using 'bind' in here as it's
         * difficult to test using jest.spyOn.
         */
        return {
            ...this,
            getLoginUrlFromLoginEvent: () => this.getLoginUrlFromLoginEvent(req, res),
            getUserHandleNoAuth: () => this.getUserHandleNoAuth(req, res),
            getUserToken: () => this.getUserToken(req, res),
            getUserTokenOptional: () => this.getUserTokenOptional(req, res),
            handleLoginEvent: () => this.handleLoginEvent(req, res),
            getUserDocument: async () => {
                const handle = this.getUserHandleNoAuth(req, res);
                return handle && this.rest.getUserDocument(handle);
            },
        };
    }
}
export default UnologinNextJS;
