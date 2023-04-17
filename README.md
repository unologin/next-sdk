
Add [unolog·in](https://unolog.in) to your [Next.js](https://Next.js.org/) application. 

The full documentation for this package can be found [here](https://unologin.github.io/next-sdk).

Documentation for other packages and useful guides can be found on our [documentation page](https://unolog.in/developers/).

# Installation

Install via [npm](https://www.npmjs.com/):
```bash 
npm install @unologin/next
``` 
Install via [yarn](https://yarnpkg.com/):
```bash
yarn add @unologin/next
```

# Quick Setup

## Creating a Next.js application

If you haven't already, [set up a Next.js application](https://Next.js.org/docs/getting-started). 

## Registering your application

To use unolog·in, click [here](https://dashboard.unolog.in/) to register your application. 

## Setting up environment variables

After registering your application, you should be given a config file like this:

```bash
UNOLOGIN_API_KEY=...
UNOLOGIN_COOKIES_DOMAIN=...
NEXT_PUBLIC_UNOLOGIN_APPID=...
```
Download the file and place it at the top level of your Next.js project (next to the ```package.json``` file).

## Adding API request handlers

Add your API request handlers by creating a file located at ```pages/api/unologin/[unologin].js``` (or ```.ts```) within your Next.js project.

Add the following lines of code: 

```typescript
import {
  nextApiHandler
} from '@unologin/next/quick';

export default nextApiHandler;
```

This will handle all unolog·in related event handlers for you.

## Setting up the client library

Set up the client library by importing ```clientSetup``` and running in the component file you plan on using it.

```javascript
import {
  clientSetup,
} from '@unologin/next/quick';

clientSetup();
```

## Done!

Congratulations, your application now has authentication, registration, login and more.

# Usage

## Starting the login flow

The login flow can be initiated by calling the ```login``` function returned by calling the ```useLogin``` hook.

```JSX

import {
  useLogin,
} from '@unologin/next/react';

function LoginButton()
{
  const login = useLogin();

  return <button onClick={() => login()}>
    log in
  </button>
}

```

This will start the login flow, but won't react in any way once it has completed. 

Keep on reading to see how to tell if the user is logged in.

## Checking the login state on the client

The login state can be checked on the client by calling ```useClientSession``` from any component mounted inside the ```ClientSessionProvider``` component.

**IMPORTANT**: 

The client-side session is intended for updating the UI once the login state changes without making a request to the server.

It should **not be used for authentication or authorization** of any kind. 

````JSX

import {
  useClientSession,
  ClientSessionProvider
} from '@unologin/next/react';

const MyComponent = () => 
{
  const { isLoggedIn } = useClientSession();

  return isLoggedIn ? 
    'You are logged in :-)' :
    'You are not logged in :-(';
};

const MyApp = () => <ClientSessionProvider>
  <MyComponent />
</ClientSessionProvider>;

````

## useLogin and useLogout

Use the ```useLogin``` and ```useLogout``` hooks to perform login and logout operations.

```JSX 

import {
  useLogin,
  useLogout,
  useClientSession
} from '@unologin/next/react';

function LoginButton()
{
  /**
   * login(...) may be called with or without. 
   * arguments and returns a Promise which 
   * resolves after successful login.
   * 
   * Use ```login.loading``` and ```login.open``` 
   * to determine the current state
   * of the login process 
   */
  const login = useLogin();

  return <button 
    disabled={login.loading}
    onClick={
      () => login({ userClass: 'users_default' })
    }
  >
    log in
  </button>;
}

function LogoutButton()
{
  /**
   * logout() is always called without arguments
   * and returns a Promise which resolves
   * after the user is logged out.
   * 
   * Use ```logout.loading``` to determine
   * the state of the logout operation.
   */
  const logout = useLogout();

  return <button 
    disabled={logout.loading}
    onClick={
      () => logout()
    }
  >
    log out
  </button>;
}

/**
 * Renders either login- or logout button
 * depending on the state of the ClientSessionContext.
 * 
 * Needs to be rendered inside a ClientSessionContext.
 */
function LoginLogout()
{
  const { isLoggedIn } = useClientSession();

  return isLoggedIn ?
    <LogoutButton /> :
    <LoginButton />;
}
```
When using our ```LoginLogout``` component, make sure it is a descendant of the ```ClientSessionProvider``` element. 

It is recommended to wrap the contents of your app in ```ClientSessionProvider``` once. 

```JSX

import {
  ClientSessionProvider
} from '@unologin/react'

function MyApp()
{
  return <ClientSessionProvider>
    <LoginLogout />
  </ClientSessionProvider>
}

``` 

## Displaying user information

To display user information, create a new component which makes use of [```getServerSideProps```](https://Next.js.org/docs/basic-features/data-fetching/get-server-side-props).


By wrapping ```getServerSideProps``` using ```withUnologin```, any authentication errors are automatically handled and the ```context.unologin``` object is aware of the current request. 

```JSX

import {
  withUnologin
} from "@unologin/next/quick";

/**
 * Display my user info as formatted JSON.
 */
export default function MyInfo(props)
{
  return <pre>
    {JSON.stringify(props.user, null, 2)}
  </pre>;
}

export const getServerSideProps = withUnologin(
  async (context) => 
  {
    /**
     * The context object can be used
     * like the context object passed 
     * to getServerSideProps.
     * 
     * The ```unologin``` object can be used 
     * like an instance of ```UnologinNextJS```
     * but does not require ```req``` or ```res``` 
     * to be passed to any functions.
     */
    const { unologin } = context;

    return {
      props: 
      {
        /** No further parameters required. */
        user: await unologin.getUserDocument(),
      },
    };
  },
);
```

## Advanced server-side usage

This package extends [@unologin/node-sdk](https://www.npmjs.com/package/@unologin/node-sdk), specifically the class ```UnologinNextJs``` extends the [HttpHandlers](https://unologin.github.io/node-sdk/classes/http_handlers.HttpHandlers.html). 

The ```@unologin/next/quick``` module will perform the required setup for you. 

```javascript
/**
 * With no setup required:
 */

import { 
  unologinNextJs 
} from '@unologin/next/quick' 

/** 
 * With manual setup:
 */
import UnologinNextJs 
  from '@unologin/next/server';

import unologin
  from '@unologin/node-sdk';

/**
 * You can provide your own instance of the unologin node-sdk.
 */
const unologinNextJs = new UnologinNextJs(unologin)

```

As a consequence, all [@unologin/node-sdk](https://www.npmjs.com/package/@unologin/node-sdk)-functions are available through the ```unologinNextJs``` object. 

Here's an example of how to use it within an API route:

```javascript

const token = unologinNextJs.getUserTokenOptional(req, res);

/** if the user is logged in */
if (token)
{
  /** Perform protected actions here. */
}

/**
 * or
 */

/** Will throw APIError if not logged in. */
const token = unologinNextJs.getUserToken(req, res);

/** Perform protected actions here. */

```

See the [node-sdk documentation](https://unologin.github.io/node-sdk) for more information.
