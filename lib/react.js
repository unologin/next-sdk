import { jsx as _jsx } from "react/jsx-runtime";
/**
 * @module unologin-hooks
 *
 * Provides utility functions as react hooks.
 */
import { useRouter, } from 'next/router';
import { createContext, useContext, useEffect, useState, } from 'react';
import unologin from '@unologin/web-sdk';
/**
 * Create a function with an attached state object.
 *
 * @param fn fn
 * @param state state
 * @returns CallbackWithState
 */
export function withState(fn, state) {
    return Object.assign(fn, state);
}
/**
 * @internal
 * @returns Function for refreshing page props.
 */
export const useRefresh = () => {
    const router = useRouter();
    return () => router.replace(router.asPath);
};
/**
 * Adds a `loading` state which is initially false.
 * Once the callback is invoked, it is set to true.
 * After the callback resolves or rejects, it is set to false again.
 *
 * @param callback callback function
 * @returns callback with a `loading` state
 * @see {@link CallbackWithState}
 */
export const withLoadingState = (callback) => {
    const [loading, setLoading] = useState(false);
    const res = async (...args) => {
        setLoading(true);
        try {
            return await callback(...args);
        }
        finally {
            setLoading(false);
        }
    };
    return withState(res, { loading });
};
/**
 * Returns a stateful function to initiate the unologin login flow.
 *
 * The ```login``` function returns a ```Promise```.
 *
 * The ```Promise``` will resolve after successful login.
 *
 * The ```Promise``` will reject otherwise.
 *
 * @param defaultOptions default values for options passed to the returned login() function.
 *
 * @example
 * ```javascript
 * function LoginButtonExample()
 * {
 *   const login = useLogin();
 *
 *   // login.loading is true once the login is initiated.
 *   // It is reset to false after the user information is available.
 *   console.log(login.loading)
 *
 *   // login.open is true for as long as the login window is open.
 *   console.log(login.open)
 *
 *   return <button
 *     disabled={login.loading}
 *     onClick={() => login({ userClass: 'users_default })}
 *   >
 *     log in
 *   </button>;
 * }
 * ```
 *
 * @returns Asynchronous function to initiate login flow.
 */
export function useLogin(defaultOptions) {
    const refresh = useRefresh();
    const [open, setOpen] = useState(false);
    const sessionContext = useContext(ClientSessionContext);
    const login = withLoadingState(async (...args) => {
        setOpen(true);
        const opts = args[0];
        try {
            await unologin.startLogin({
                ...(defaultOptions || {}),
                ...(opts || {}),
            });
        }
        finally {
            sessionContext === null || sessionContext === void 0 ? void 0 : sessionContext.refresh();
        }
        setOpen(false);
        await refresh();
    });
    return withState(login, { open });
}
/**
 *
 * Returns a stateful asynchronous logout function.
 *
 * The ```Promise``` will resolve after successful logout.
 *
 * The ```Promise``` will reject otherwise.
 *
 * @example
 *
 * ```javascript
 * function LogoutButtonExample()
 * {
 *   const logout = useLogout();
 *
 *   // logout.loading is true once the logout function is called.
 *   // It resets to false after the function resolves or rejects.
 *   console.log(logout.loading);
 *
 *   return <button
 *     disabled={login.loading}
 *     onClick={() => logout()}
 *   >
 *     log out
 *   </button>;
 * }
 * ```
 *
 * @param logoutUrl Optional logout URL.
 * @returns Stateful asynchronous logout function.
 */
export const useLogout = (logoutUrl = '/api/unologin/logout') => {
    const refresh = useRefresh();
    const sessionContext = useContext(ClientSessionContext);
    return withLoadingState(async () => {
        try {
            await fetch(logoutUrl, { method: 'POST' });
        }
        finally {
            sessionContext === null || sessionContext === void 0 ? void 0 : sessionContext.refresh();
            refresh();
        }
    });
};
const ClientSessionContext = createContext(null);
/**
 *
 * @returns SessionContextValue
 */
export function useClientSession() {
    const value = useContext(ClientSessionContext);
    if (value) {
        return value;
    }
    else {
        throw new Error('Cannot use useClientSession outside of ClientSessionProvider');
    }
}
/**
 * Wrap components in SessionProvider in order to use {@link useClientSession}
 * @param param0 props use props.loggedIn to set the initial state.
 * @returns Session provider.
 */
export function ClientSessionProvider({ children, loggedIn }) {
    const [isLoggedIn, setIsLoggedIn] = useState(!!loggedIn);
    useEffect(() => setIsLoggedIn(unologin.isLoggedIn()));
    return _jsx(ClientSessionContext.Provider, { value: {
            isLoggedIn,
            refresh: () => setIsLoggedIn(unologin.isLoggedIn()),
        }, children: children });
}
