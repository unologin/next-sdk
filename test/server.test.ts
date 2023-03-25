
import UnologinNextJS from '../src/server';

import {
  IUnologinClient, 
  UserHandle,
} from '@unologin/node-sdk/types';

import {
  createMocks,
} from './util/http-mocks';

import {
  defaultOptions,
  Options,
} from '@unologin/node-sdk';

import {
  APIError,
} from '@unologin/node-sdk/errors';

const unologin = {
  getOptions: () : Options => 
  {
    return {
      ...defaultOptions,
      apiKey: 'my-api-key',
      appId: 'my-app-id',
    };
  },
} as any as IUnologinClient;

const unologinNextJs = new UnologinNextJS(unologin);

describe('nextApiHandler', () => 
{
  const handler = unologinNextJs.nextApiHandler;

  const resetLoginCookies = jest.spyOn(
    // resetLoginCookies is protected
    unologinNextJs as any,
    'resetLoginCookies',
  ).mockReturnValueOnce(undefined);

  it('GET [...]/login calls handleLoginEvent', async () => 
  {
    const handleLoginEvent = jest.spyOn(unologinNextJs, 'handleLoginEvent');

    const unologinReturnUrl = new URL(
      'https://login.unolog.in/?loginHandlerSuccess=true&loginHandlerMsg=null',
    );

    handleLoginEvent.mockResolvedValueOnce(
      { url: unologinReturnUrl },
    );

    const { req, res } = createMocks(
      {
        url: '/api/unologin/login?token=abc',
        // route handler should be placed in /api/unologin/[unologin].js
        // this populates the query with unologin: 'login'
        query: { unologin: 'login' },
      },
    );

    await handler(req, res);

    expect(res._getStatusCode())
      .toBe(307);

    expect(res._getRedirectUrl())
      .toBe(unologinReturnUrl.href);

    expect(handleLoginEvent)
      .toHaveBeenCalledTimes(1);

    expect(handleLoginEvent)
      .toHaveBeenCalledWith(req, res);

    handleLoginEvent.mockReset();
  });

  it('POST [...]/logout calls logoutHandler', async () => 
  {
    const { req, res } = createMocks(
      {
        url: '/api/unologin/logout',
        query: { unologin: 'logout' },
        method: 'POST',
      },
    );

    await handler(req, res);

    expect(resetLoginCookies)
      .toHaveBeenCalledTimes(1);

    expect(resetLoginCookies)
      .toHaveBeenCalledWith(req, res);
  });

  it('Cannot GET [...]/logout calls logoutHandler', async () => 
  {
    const { req, res } = createMocks(
      {
        url: '/api/unologin/logout',
        query: { unologin: 'logout' },
        method: 'GET',
      },
    );

    await handler(req, res);

    expect(resetLoginCookies)
      .toHaveBeenCalledTimes(0);

    expect(res._getStatusCode())
      .toBe(404);

    expect(res._getData())
      .toBe('Can only log out using POST.');
  });

  it('Requests to non-registered handler returns 404.', async () => 
  {
    const { req, res } = createMocks(
      {
        url: '/api/unologin/somethingElse',
        query: { unologin: 'somethingElse' },
        method: 'GET',
      },
    );

    await handler(req, res);

    expect(res._getStatusCode())
      .toBe(404);

    expect(res._getData())
      .toBe('Cannot GET /api/unologin/somethingElse.');
  });
});

describe('withContext', () => 
{
  it('Returns object with attached req, res', async () => 
  {
    const { req, res } = createMocks();

    const mockNextContext = { req, res } as any;

    const {
      getUserDocument,
      getUserHandleNoAuth,
    } = unologinNextJs.withContext(mockNextContext);

    const mockUserDoc = { foo: 'bar' } as any;
    const mockUserHandle : UserHandle = { appLoginToken: 'abc123' };

    const getUserDocumentSpy = jest.spyOn(
      unologinNextJs.rest,
      'getUserDocument',
    ).mockResolvedValue(mockUserDoc);

    const getUserHandleNoAuthSpy = jest.spyOn(
      unologinNextJs,
      'getUserHandleNoAuth',
    ).mockReturnValue(mockUserHandle);

    expect(getUserHandleNoAuth())
      .toBe(mockUserHandle);

    expect(getUserHandleNoAuthSpy)
      .toHaveBeenCalledWith(req, res);

    expect(await getUserDocument())
      .toBe(mockUserDoc);

    expect(getUserDocumentSpy)
      .toHaveBeenLastCalledWith(mockUserHandle);

    expect(getUserHandleNoAuthSpy)
      .toHaveBeenLastCalledWith(req, res);
  });
});

describe('withUnologin', () => 
{
  type ErrorHandler = Parameters<UnologinNextJS['withUnologin']>[1];

  const errorHandler = jest.fn(
    <ErrorHandler>((_, error) => Promise.resolve({ props: { error } })),
  );

  const resetLoginCookies = jest.spyOn(
    unologinNextJs,
    'resetLoginCookies' as any,
  ).mockReturnValue(null);

  type Handler = Parameters<UnologinNextJS['withUnologin']>[0];

  const innerHandlerFunction = jest.fn(
    <Handler>(() => Promise.resolve({ props: {} })),
  );

  const wrappedHandler = unologinNextJs.withUnologin(
    innerHandlerFunction,
    errorHandler,
  );

  it('Constructs context correctly.', async () => 
  {
    const { req, res } = createMocks();

    const mockNextContext = { req, res } as any;

    await wrappedHandler(mockNextContext);

    expect(innerHandlerFunction)
      .toHaveBeenCalledTimes(1);

    const args = innerHandlerFunction.mock.calls[0][0];

    const { unologin, ...context } = args;

    expect(context)
      .toStrictEqual(mockNextContext);

    // TODO: create a test for withContext(...)
    expect(unologin)
      .toBeTruthy();

    return null as any;
  });

  it('Handles auth errors correctly.', async () => 
  {
    const { req, res } = createMocks();

    const mockNextContext = { req, res } as any;

    const authError = new APIError(401, '', { param: 'user' });

    innerHandlerFunction.mockRejectedValueOnce(authError);

    const serverSideProps = await wrappedHandler(mockNextContext);

    expect(innerHandlerFunction)
      .toHaveBeenCalledTimes(1);

    expect(resetLoginCookies)
      .toHaveBeenCalledTimes(1);

    expect(resetLoginCookies) 
      .toHaveBeenCalledWith(req, res);

    expect(errorHandler)  
      .toHaveBeenCalledTimes(1);

    expect(errorHandler)
      .toHaveBeenCalledWith(mockNextContext, authError);

    expect(serverSideProps)
      .toStrictEqual({ props: { error: authError } });
  });

  it('Forwards non-auth errors.', async () => 
  {
    const { req, res } = createMocks();

    const mockNextContext = { req, res } as any;

    const errors = [
      new Error('Not an auth error'),
      new APIError(401, 'Not an auth error as data is empty.', { }),
    ];

    for (const error of errors)
    {
      innerHandlerFunction.mockRejectedValueOnce(error);

      expect(wrappedHandler(mockNextContext))
        .rejects.toBe(error);
    }
  });
});
