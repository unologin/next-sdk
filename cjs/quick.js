"use strict";
/**
 * Sets up unologin with a standard configuration.
 *
 * Exports a plug-and-play instance of {@link server.UnologinNextJS} along with
 * some helper functions.
 *
 *
 * Requires
 *  ```UNOLOGIN_API_KEY```,
 *  ```NEXT_PUBLIC_UNOLOGIN_APPID```, and
 *  ```UNOLOGIN_COOKIES_DOMAIN```
 * to be in ```process.env```.
 *
 *
 *
 * @module quick
 *
 *
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.withUnologin = exports.nextApiHandler = exports.unologinNextJs = exports.clientSetup = void 0;
const node_sdk_1 = __importStar(require("@unologin/node-sdk"));
const unologinWeb = Promise.resolve().then(() => __importStar(require('@unologin/web-sdk')));
const server_1 = __importDefault(require("./server"));
const realm = {
    frontendUrl: process.env.NEXT_PUBLIC_UNOLOGIN_DEV_FRONTEND_URL ||
        node_sdk_1.realms.live.frontendUrl,
    apiUrl: process.env.NEXT_PUBLIC_UNOLOGIN_DEV_API_URL ||
        node_sdk_1.realms.live.apiUrl,
};
if (typeof window === 'undefined') {
    node_sdk_1.default.setup({
        apiKey: process.env.UNOLOGIN_API_KEY,
        cookiesDomain: process.env.UNOLOGIN_COOKIES_DOMAIN,
        disableSecureCookies: process.env.NODE_ENV === 'development',
        realm,
    });
}
/**
 * Quick setup for the client.
 *
 * @returns void
 */
function clientSetup() {
    if (typeof window !== 'undefined') {
        unologinWeb.then((unologin) => unologin.setup({
            appId: process.env.NEXT_PUBLIC_UNOLOGIN_APPID,
            realm: realm.frontendUrl,
            api: realm.apiUrl,
            callbackUrl: process.env.NEXT_PUBLIC_UNOLOGIN_CALLBACK_URL,
        }));
    }
}
exports.clientSetup = clientSetup;
/**
 * Instance of {@link server.UnologinNextJS} using the default behavior.
 */
exports.unologinNextJs = new server_1.default(node_sdk_1.default);
/**
 * @see {@link server.UnologinNextJS.nextApiHandler}
 */
exports.nextApiHandler = exports.unologinNextJs.nextApiHandler
    .bind(exports.unologinNextJs);
/**
 * @see {@link server.UnologinNextJS.withUnologin}
 */
exports.withUnologin = exports.unologinNextJs.withUnologin
    .bind(exports.unologinNextJs);
