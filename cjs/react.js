"use strict";
/**
 * @module unologin-hooks
 *
 * Provides utility functions as react hooks.
 */
'use client';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientSessionProvider = exports.useClientSession = exports.useLogout = exports.useLogin = exports.withLoadingState = exports.useRefresh = exports.withState = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const router_1 = require("next/router");
const react_1 = require("react");
const web_sdk_1 = __importDefault(require("@unologin/web-sdk"));
/**
 * Create a function with an attached state object.
 *
 * @param fn fn
 * @param state state
 * @returns CallbackWithState
 */
function withState(fn, state) {
    return Object.assign(fn, state);
}
exports.withState = withState;
/**
 * @internal
 * @returns Function for refreshing page props.
 */
const useRefresh = () => {
    const router = (0, router_1.useRouter)();
    return () => router.replace(router.asPath);
};
exports.useRefresh = useRefresh;
/**
 * Adds a `loading` state which is initially false.
 * Once the callback is invoked, it is set to true.
 * After the callback resolves or rejects, it is set to false again.
 *
 * @param callback callback function
 * @returns callback with a `loading` state
 * @see {@link CallbackWithState}
 */
const withLoadingState = (callback) => {
    const [loading, setLoading] = (0, react_1.useState)(false);
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
exports.withLoadingState = withLoadingState;
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
function useLogin(defaultOptions) {
    const refresh = (0, exports.useRefresh)();
    const [open, setOpen] = (0, react_1.useState)(false);
    const sessionContext = (0, react_1.useContext)(ClientSessionContext);
    const login = (0, exports.withLoadingState)(async (...args) => {
        setOpen(true);
        const opts = args[0];
        try {
            await web_sdk_1.default.startLogin({
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
exports.useLogin = useLogin;
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
const useLogout = (logoutUrl = '/api/unologin/logout') => {
    const refresh = (0, exports.useRefresh)();
    const sessionContext = (0, react_1.useContext)(ClientSessionContext);
    return (0, exports.withLoadingState)(async () => {
        try {
            await fetch(logoutUrl, {
                method: 'POST',
                credentials: 'include',
            });
        }
        finally {
            sessionContext === null || sessionContext === void 0 ? void 0 : sessionContext.refresh();
            refresh();
        }
    });
};
exports.useLogout = useLogout;
const ClientSessionContext = (0, react_1.createContext)(null);
/**
 *
 * @returns SessionContextValue
 */
function useClientSession() {
    const value = (0, react_1.useContext)(ClientSessionContext);
    if (value) {
        return value;
    }
    else {
        throw new Error('Cannot use useClientSession outside of ClientSessionProvider');
    }
}
exports.useClientSession = useClientSession;
/**
 * Wrap components in SessionProvider in order to use {@link useClientSession}
 * @param param0 props use props.loggedIn to set the initial state.
 * @returns Session provider.
 */
function ClientSessionProvider({ children, loggedIn }) {
    const [isLoggedIn, setIsLoggedIn] = (0, react_1.useState)(!!loggedIn);
    (0, react_1.useEffect)(() => setIsLoggedIn(web_sdk_1.default.isLoggedIn()));
    return (0, jsx_runtime_1.jsx)(ClientSessionContext.Provider, { value: {
            isLoggedIn,
            refresh: () => setIsLoggedIn(web_sdk_1.default.isLoggedIn()),
        }, children: children });
}
exports.ClientSessionProvider = ClientSessionProvider;
