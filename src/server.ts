
import Cookies from 'cookies';

import type {
  GetServerSideProps,
  NextApiHandler,
  NextApiRequest,
  NextApiResponse,
} from 'next';

import HttpHandlers, {
  Request,
  Response,
} from '@unologin/node-api/build/http-handlers';

import unologin from '@unologin/node-api';

import {
  APIError,
} from '@unologin/node-api/build/errors';

import {
  UserDocument,
} from '@unologin/node-api/build/types';

/** @internal */
export type GetServerSidePropsCtx = Parameters<GetServerSideProps>[0];

export type HandlerFunction<Args extends Array<any>> = 
  (req: Request, res: Response, ...args: Args) => any;

export type UnologinNextJSWithContext = 
{
  [k in keyof UnologinNextJS]: 
    UnologinNextJS[k] extends HandlerFunction<infer Args> ?
      (...args : Args) => ReturnType<UnologinNextJS[k]> :
      UnologinNextJS[k];
} & 
{
  getUserDocument: () => Promise<UserDocument | null>;
}

/** @see {@link UnologinNextJS.withUnologin} */
export interface GetServerSidePropsCtxUnologin 
  extends GetServerSidePropsCtx
{
  unologin: UnologinNextJSWithContext;
}

export type GetServerSidePropsOnError = (
  context : GetServerSidePropsCtx,
  error : unknown
) => ReturnType<GetServerSideProps>;

/**
 * API handlers and utility functions for server-side NextJS.
 */
export class UnologinNextJS
  extends HttpHandlers
{
  public readonly rest = unologin.rest;

  /**
   * ServerSideProps sent on auth error.
   * 
   * @see {@link withUnologin}
   */
  defaultErrorProps = 
  {
    redirect: 
    {
      destination: '/login',
      permanent: false,
    },
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
  protected setCookie(
    req : NextApiRequest,
    res : NextApiResponse,
    name : string,
    value : string,
    options : object,
  )
  {
    new Cookies(req, res)
      .set(name, value, options);
  }

  /**
   * NextJS API handler for the login callback.
   * 
   * @param req req
   * @param res res
   * @returns Promise<void>
   */
  private loginHandler = async (req : NextApiRequest, res : NextApiResponse) => 
  {
    const { url } = await this.handleLoginEvent(req, res);
  
    res.redirect(307, url.href);
  };

  /**
   * NextJS API handler for logging out.
   * 
   * @param req req
   * @param res res
   * @returns void
   */
  private logoutHandler = (req : NextApiRequest, res : NextApiResponse) => 
  {
    if (req.method === 'POST')
    {
      this.resetLoginCookies(req, res);

      res.send('OK');
    }
    else 
    {
      res.status(404)
        .send('Can only log out using POST.');
    }
  };

  /**
   * Handlers for all unologin NextJS API endpoints.
   * 
   * @see {@link nextApiHandler}
   */
  public readonly routeHandlers : { [route: string]: NextApiHandler } = 
    {
      login: this.loginHandler.bind(this),
      logout: this.logoutHandler.bind(this),
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
  public nextApiHandler : NextApiHandler = (
    req : NextApiRequest, 
    res : NextApiResponse,
  ) => 
  {
    const route = req.query.unologin;

    if (
      typeof(route) === 'string' && 
      route in this.routeHandlers
    )
    {
      return this.routeHandlers[route](req, res);
    }
    else 
    {
      res.status(404)
        .send(`Cannot ${req.method} ${req.url}.`);
    }
  };

  /**
   * 
   * @param context context from GetServerSideProps
   * @returns unologin with context {@link UnologinNextJSWithContext}
   */
  withContext(
    context : Pick<GetServerSidePropsCtx, 'req' | 'res'>,
  ) : UnologinNextJSWithContext
  {
    // [!] TODO: types in node-api
    const req = context.req as NextApiRequest;
    const res = context.res as NextApiResponse;

    return {
      ...this,
      // avoid using 'bind' in here as it's difficult to test using jest.spyOn
      getUserHandleNoAuth: () => this.getUserHandleNoAuth(req, res),

      getUserToken: () => this.getUserToken(req, res),

      getUserTokenOptional: () => this.getUserTokenOptional(req, res),

      handleLoginEvent: () => this.handleLoginEvent(req, res),

      getUserDocument: async () => 
      {
        const handle = this.getUserHandleNoAuth(req, res);

        return handle && this.rest.getUserDocument(handle);
      },
    };
  }

  /**
   * Wraps getServerSideProps and attaches ```unologin``` key to ```context```.
   * 
   * @see {@link GetServerSidePropsCtxUnologin}
   * 
   * @param fn function to execute with context
   * @param onError error handler
   * @returns Promise<void>
   */
  public withUnologin = (
    fn : (
      ctx : GetServerSidePropsCtxUnologin
    ) => ReturnType<GetServerSideProps>,
    onError : GetServerSidePropsOnError = (
      () => Promise.resolve(this.defaultErrorProps)
    ),
  ) : GetServerSideProps => 
  {
    return async (context) => 
    {
      try 
      {
        return await fn(
          {
            ...context,
            unologin: this.withContext(context),
          },
        );
      }
      catch (error)
      {
        if (
          error instanceof APIError &&
          error.isAuthError()
        )
        {
          this.resetLoginCookies(
            // [!] TODO type
            context.req as any,
            context.res as any,
          );

          return onError(context, error);
        }
        else 
        {
          throw error;
        }
      }
    }; 
  };
}

export default UnologinNextJS;
