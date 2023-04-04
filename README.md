
** This project is in development **

Add [unolog·in](https://unolog.in)'s authentication system to your [Next.js](https://Next.js.org/) application. 

The full documentation for this package can be found [here](https://unologin.github.io/next-sdk).

Documentation for other packages and other useful guides can be found on our [documentation page](https://dashboard.unolog.in/docs).

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

## Registering your application

To use unolog·in, click [here](https://dashboard.unolog.in/) to register your application. 

## Creating a Next.js application

If you haven't already, [set up a Next.js application](https://Next.js.org/docs/getting-started). 

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

## Checking the login state on the server

Wrap [```getServerSideProps```](https://Next.js.org/docs/basic-features/data-fetching/get-server-side-props) in ```withUnologin``` to access user information.

By using ```useUnologin```, any authentication errors are automatically handled and the ```context.unologin``` object is aware of the current request. 

```javascript
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
        user: await unologin.getUserDocument(),
      },
    };
  },
);
``` 

## Setting up the client library

Set up the client library by importing ```clientSetup``` and running it.

```javascript
import {
  clientSetup,
} from '@unologin/next/quick';

clientSetup();
```

## Checking the login state on the client

The login state can be checked on the client by calling ```useClientSession``` from any component mounted inside the ```ClientSessionProvider``` component.

**IMPORTANT**: 

The client-side session is only meant for updating the UI once the login state changes without making a request to the server.

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
   * arugments and returns a Promise which 
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
