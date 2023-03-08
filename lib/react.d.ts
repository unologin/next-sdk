/**
 * @module unologin-hooks
 *
 * Provides utility functions as react hooks.
 */
import { PropsWithChildren } from 'react';
/**
 * Function with an attached state object.
 */
export type CallbackWithState<Fn extends (...args: any[]) => any, State extends object> = Fn & State;
/**
 * Create a function with an attached state object.
 *
 * @param fn fn
 * @param state state
 * @returns CallbackWithState
 */
export declare function withState<Fn extends (...args: any[]) => any, State extends object>(fn: Fn, state: State): CallbackWithState<Fn, State>;
/**
 * @internal
 * @returns Function for refreshing page props.
 */
export declare const useRefresh: () => () => Promise<boolean>;
/**
 * Adds a `loading` state which is initially false.
 * Once the callback is invoked, it is set to true.
 * After the callback resolves or rejects, it is set to false again.
 *
 * @param callback callback function
 * @returns callback with a `loading` state
 * @see {@link CallbackWithState}
 */
export declare const withLoadingState: <A extends any[], R>(callback: (...args: A) => Promise<R>) => CallbackWithState<(...args: A) => Promise<R>, {
    loading: boolean;
}>;
/**
 * Returns a stateful function to initiate the unologin login flow.
 *
 * The ```login``` function returns a ```Promise```.
 *
 * The ```Promise``` will resolve after successful login.
 *
 * The ```Promise``` will reject otherwise.
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
export declare const useLogin: () => CallbackWithState<CallbackWithState<(opts: import("@unologin/web-sdk/lib/login").LoginOptions) => Promise<void>, {
    loading: boolean;
}>, {
    open: boolean;
}>;
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
export declare const useLogout: (logoutUrl?: string | URL) => CallbackWithState<() => Promise<void>, {
    loading: boolean;
}>;
export type ClientSessionContextValue = {
    /**
     * Indicates that the user is logged in.
     * *Do not use for auth - * only use for client side UI etc.
     */
    isLoggedIn: boolean;
    /** @internal */
    refresh: () => void;
};
/**
 *
 * @returns SessionContextValue
 */
export declare function useClientSession(): ClientSessionContextValue;
/**
 * Wrap components in SessionProvider in order to use {@link useClientSession}
 * @param param0 props
 * @returns Session provider.
 */
export declare function ClientSessionProvider({ children }: PropsWithChildren<{}>): JSX.Element;
