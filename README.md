
Add [unolog·in](https://unolog.in)'s authentication system to your [NextJS](https://nextjs.org/) application. 

The full documentation for this package can be found [here](https://unologin.github.io/unologin/next-sdk).

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

## Creating a NextJS application

If you haven't already, [set up a NextJS application](https://nextjs.org/docs/getting-started). 

## Setting up environment variables

After registering your application, you should be given a config file like this:

```config
UNOLOGIN_API_KEY=...
UNOLOGIN_COOKIES_DOMAIN=...
NEXT_PUBLIC_UNOLOGIN_APPID=...
```
Download the file and place it at the top level of your NextJS project (next to the ```package.json``` file).

## Adding API request handlers

Add your API request handlers by creating a file located at ```pages/api/unologin/[unologin].js``` (or ```.ts```) within your NextJS project.

Add the following lines of code: 

```typescript
import {
  nextApiHandler
} from '@unologin/next/quick';

export default nextApiHandler;
```

## Checking the login state on the server

Wrap [```getServerSideProps```](https://nextjs.org/docs/basic-features/data-fetching/get-server-side-props) in ```withUnologin``` to access user information.



## Checking the login state on the client

The login state can be checked on the client by calling ```useClientSession``` from any component mounted inside the ```ClientSessionProvider``` component.

**IMPORTANT**: 

The client-side session is only meant for updating the UI once the login state changes without making a request to the server.

It should **not be used for authentication or authorization** of any kind. 

````javascript

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

## Creating a login button

```typescript 

``` 
