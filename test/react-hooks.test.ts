/**
 * @jest-environment jsdom
 */

import { useEffect, useState } from 'react';

import {
  renderHook,
  act,
  waitFor,
} from '@testing-library/react';

import * as hooks from '../src/react';

import {
  useLogin,
  withLoadingState,
} from '../src/react';

import unologinWeb from '@unologin/web-sdk';

type Controller = { resolve: () => void; reject: () => void };

/**
 * @returns controllable async function
 */
function controlledAsync() : (() => Promise<void>) & Controller
{
  const controller = 
  {
    resolve: (() => { throw new Error('Not initialized' ); }) as () => void,
    reject: () => {},
  };
  
  const promise = new Promise<void>(
    ((resolve, reject) => 
    {
      controller.resolve = resolve;
      controller.reject = reject;
    }),
  );

  const fn = () => promise;

  return Object.assign(fn, controller);
}

test('withLoadingState', async () => 
{
  const { result } = renderHook(
    () => 
    {
      // controller needs to be created inside the component function
      const controller = controlledAsync();

      const fn = withLoadingState(controller);

      // running fn from outside the component will not work
      // therefore run it from within useEffect based on the ``run`` state
      const [run, setRun] = useState(false);

      useEffect(() => { run && fn(); }, [run]);

      return {
        loading: fn.loading,
        controller,
        // causes fn to be called
        run: () => setRun(true),
      };
    },
  );
  
  expect(result.current.loading)
    .toBe(false);

  act(() => result.current.run());

  expect(result.current.loading)
    .toBe(true);

  act(() => result.current.controller.resolve());

  expect(result.current.loading)
    .toBe(true);
});

test('useLogin', async () => 
{
  const loginController = controlledAsync();

  const startLogin = jest.spyOn(
    unologinWeb,
    'startLogin',
  ).mockImplementation(loginController);
  
  const useRefresh = jest.spyOn(
    hooks,
    'useRefresh',
  );

  const { result } = renderHook(
    () => 
    {
      const refreshController = controlledAsync();
    
      useRefresh.mockReturnValue(
        () => new Promise<boolean>(
          (resolve) => 
          {
            refreshController().then(
              () => resolve(true),
            ); 
          },
        ),
      );

      const login = useLogin();
      const [run, setRun] = useState(false);

      useEffect(() => { run && login({ userClass: 'my_user_class' }); }, [run]);

      return {
        state: { ...login },
        // causes login to be called
        run: () => setRun(true),
        refreshController,
      };
    },
  );

  expect(result.current.state)
    .toStrictEqual({ open: false, loading: false });

  act(result.current.run);

  expect(result.current.state)
    .toStrictEqual({ open: true, loading: true });

  expect(startLogin)
    .toHaveBeenCalledTimes(1);

  expect(startLogin.mock.calls[0][0])
    .toStrictEqual({ userClass: 'my_user_class' });

  act(() => loginController.resolve());

  await waitFor(
    () => expect(result.current.state)
      .toStrictEqual({ loading: true, open: false }),
  );

  act(() => result.current.refreshController.resolve());

  await waitFor(
    () => expect(result.current.state)
      .toStrictEqual({ loading: true, open: false }),
  );
});

test.todo('useLogout');
