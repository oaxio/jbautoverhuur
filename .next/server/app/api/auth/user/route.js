"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/auth/user/route";
exports.ids = ["app/api/auth/user/route"];
exports.modules = {

/***/ "../../client/components/action-async-storage.external":
/*!*******************************************************************************!*\
  !*** external "next/dist/client/components/action-async-storage.external.js" ***!
  \*******************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/action-async-storage.external.js");

/***/ }),

/***/ "../../client/components/request-async-storage.external":
/*!********************************************************************************!*\
  !*** external "next/dist/client/components/request-async-storage.external.js" ***!
  \********************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/request-async-storage.external.js");

/***/ }),

/***/ "../../client/components/static-generation-async-storage.external":
/*!******************************************************************************************!*\
  !*** external "next/dist/client/components/static-generation-async-storage.external.js" ***!
  \******************************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/static-generation-async-storage.external.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "node:crypto":
/*!******************************!*\
  !*** external "node:crypto" ***!
  \******************************/
/***/ ((module) => {

module.exports = require("node:crypto");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2Fuser%2Froute&page=%2Fapi%2Fauth%2Fuser%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2Fuser%2Froute.js&appDir=%2Fhome%2Frunner%2Fworkspace%2Fsrc%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2Fhome%2Frunner%2Fworkspace&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!***************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2Fuser%2Froute&page=%2Fapi%2Fauth%2Fuser%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2Fuser%2Froute.js&appDir=%2Fhome%2Frunner%2Fworkspace%2Fsrc%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2Fhome%2Frunner%2Fworkspace&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \***************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   headerHooks: () => (/* binding */ headerHooks),\n/* harmony export */   originalPathname: () => (/* binding */ originalPathname),\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   requestAsyncStorage: () => (/* binding */ requestAsyncStorage),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   staticGenerationAsyncStorage: () => (/* binding */ staticGenerationAsyncStorage),\n/* harmony export */   staticGenerationBailout: () => (/* binding */ staticGenerationBailout)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/future/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/future/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(rsc)/./node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _home_runner_workspace_src_app_api_auth_user_route_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./src/app/api/auth/user/route.js */ \"(rsc)/./src/app/api/auth/user/route.js\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/auth/user/route\",\n        pathname: \"/api/auth/user\",\n        filename: \"route\",\n        bundlePath: \"app/api/auth/user/route\"\n    },\n    resolvedPagePath: \"/home/runner/workspace/src/app/api/auth/user/route.js\",\n    nextConfigOutput,\n    userland: _home_runner_workspace_src_app_api_auth_user_route_js__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { requestAsyncStorage, staticGenerationAsyncStorage, serverHooks, headerHooks, staticGenerationBailout } = routeModule;\nconst originalPathname = \"/api/auth/user/route\";\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        serverHooks,\n        staticGenerationAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIuanM/bmFtZT1hcHAlMkZhcGklMkZhdXRoJTJGdXNlciUyRnJvdXRlJnBhZ2U9JTJGYXBpJTJGYXV0aCUyRnVzZXIlMkZyb3V0ZSZhcHBQYXRocz0mcGFnZVBhdGg9cHJpdmF0ZS1uZXh0LWFwcC1kaXIlMkZhcGklMkZhdXRoJTJGdXNlciUyRnJvdXRlLmpzJmFwcERpcj0lMkZob21lJTJGcnVubmVyJTJGd29ya3NwYWNlJTJGc3JjJTJGYXBwJnBhZ2VFeHRlbnNpb25zPXRzeCZwYWdlRXh0ZW5zaW9ucz10cyZwYWdlRXh0ZW5zaW9ucz1qc3gmcGFnZUV4dGVuc2lvbnM9anMmcm9vdERpcj0lMkZob21lJTJGcnVubmVyJTJGd29ya3NwYWNlJmlzRGV2PXRydWUmdHNjb25maWdQYXRoPXRzY29uZmlnLmpzb24mYmFzZVBhdGg9JmFzc2V0UHJlZml4PSZuZXh0Q29uZmlnT3V0cHV0PSZwcmVmZXJyZWRSZWdpb249Jm1pZGRsZXdhcmVDb25maWc9ZTMwJTNEISIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7OztBQUFzRztBQUN2QztBQUNjO0FBQ0s7QUFDbEY7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLGdIQUFtQjtBQUMzQztBQUNBLGNBQWMseUVBQVM7QUFDdkI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLFlBQVk7QUFDWixDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0EsUUFBUSx1R0FBdUc7QUFDL0c7QUFDQTtBQUNBLFdBQVcsNEVBQVc7QUFDdEI7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUM2Sjs7QUFFN0oiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9qYi13ZWJhcHAvPzQ0NmEiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQXBwUm91dGVSb3V0ZU1vZHVsZSB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2Z1dHVyZS9yb3V0ZS1tb2R1bGVzL2FwcC1yb3V0ZS9tb2R1bGUuY29tcGlsZWRcIjtcbmltcG9ydCB7IFJvdXRlS2luZCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2Z1dHVyZS9yb3V0ZS1raW5kXCI7XG5pbXBvcnQgeyBwYXRjaEZldGNoIGFzIF9wYXRjaEZldGNoIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvbGliL3BhdGNoLWZldGNoXCI7XG5pbXBvcnQgKiBhcyB1c2VybGFuZCBmcm9tIFwiL2hvbWUvcnVubmVyL3dvcmtzcGFjZS9zcmMvYXBwL2FwaS9hdXRoL3VzZXIvcm91dGUuanNcIjtcbi8vIFdlIGluamVjdCB0aGUgbmV4dENvbmZpZ091dHB1dCBoZXJlIHNvIHRoYXQgd2UgY2FuIHVzZSB0aGVtIGluIHRoZSByb3V0ZVxuLy8gbW9kdWxlLlxuY29uc3QgbmV4dENvbmZpZ091dHB1dCA9IFwiXCJcbmNvbnN0IHJvdXRlTW9kdWxlID0gbmV3IEFwcFJvdXRlUm91dGVNb2R1bGUoe1xuICAgIGRlZmluaXRpb246IHtcbiAgICAgICAga2luZDogUm91dGVLaW5kLkFQUF9ST1VURSxcbiAgICAgICAgcGFnZTogXCIvYXBpL2F1dGgvdXNlci9yb3V0ZVwiLFxuICAgICAgICBwYXRobmFtZTogXCIvYXBpL2F1dGgvdXNlclwiLFxuICAgICAgICBmaWxlbmFtZTogXCJyb3V0ZVwiLFxuICAgICAgICBidW5kbGVQYXRoOiBcImFwcC9hcGkvYXV0aC91c2VyL3JvdXRlXCJcbiAgICB9LFxuICAgIHJlc29sdmVkUGFnZVBhdGg6IFwiL2hvbWUvcnVubmVyL3dvcmtzcGFjZS9zcmMvYXBwL2FwaS9hdXRoL3VzZXIvcm91dGUuanNcIixcbiAgICBuZXh0Q29uZmlnT3V0cHV0LFxuICAgIHVzZXJsYW5kXG59KTtcbi8vIFB1bGwgb3V0IHRoZSBleHBvcnRzIHRoYXQgd2UgbmVlZCB0byBleHBvc2UgZnJvbSB0aGUgbW9kdWxlLiBUaGlzIHNob3VsZFxuLy8gYmUgZWxpbWluYXRlZCB3aGVuIHdlJ3ZlIG1vdmVkIHRoZSBvdGhlciByb3V0ZXMgdG8gdGhlIG5ldyBmb3JtYXQuIFRoZXNlXG4vLyBhcmUgdXNlZCB0byBob29rIGludG8gdGhlIHJvdXRlLlxuY29uc3QgeyByZXF1ZXN0QXN5bmNTdG9yYWdlLCBzdGF0aWNHZW5lcmF0aW9uQXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcywgaGVhZGVySG9va3MsIHN0YXRpY0dlbmVyYXRpb25CYWlsb3V0IH0gPSByb3V0ZU1vZHVsZTtcbmNvbnN0IG9yaWdpbmFsUGF0aG5hbWUgPSBcIi9hcGkvYXV0aC91c2VyL3JvdXRlXCI7XG5mdW5jdGlvbiBwYXRjaEZldGNoKCkge1xuICAgIHJldHVybiBfcGF0Y2hGZXRjaCh7XG4gICAgICAgIHNlcnZlckhvb2tzLFxuICAgICAgICBzdGF0aWNHZW5lcmF0aW9uQXN5bmNTdG9yYWdlXG4gICAgfSk7XG59XG5leHBvcnQgeyByb3V0ZU1vZHVsZSwgcmVxdWVzdEFzeW5jU3RvcmFnZSwgc3RhdGljR2VuZXJhdGlvbkFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MsIGhlYWRlckhvb2tzLCBzdGF0aWNHZW5lcmF0aW9uQmFpbG91dCwgb3JpZ2luYWxQYXRobmFtZSwgcGF0Y2hGZXRjaCwgIH07XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWFwcC1yb3V0ZS5qcy5tYXAiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2Fuser%2Froute&page=%2Fapi%2Fauth%2Fuser%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2Fuser%2Froute.js&appDir=%2Fhome%2Frunner%2Fworkspace%2Fsrc%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2Fhome%2Frunner%2Fworkspace&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./src/app/api/auth/user/route.js":
/*!****************************************!*\
  !*** ./src/app/api/auth/user/route.js ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ GET)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/web/exports/next-response */ \"(rsc)/./node_modules/next/dist/server/web/exports/next-response.js\");\n/* harmony import */ var next_headers__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/headers */ \"(rsc)/./node_modules/next/headers.js\");\n/* harmony import */ var next_headers__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(next_headers__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var iron_session__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! iron-session */ \"(rsc)/./node_modules/iron-session/dist/index.js\");\n/* harmony import */ var _lib_auth__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../../lib/auth */ \"(rsc)/./src/lib/auth.js\");\n\n\n\n\nasync function GET() {\n    const session = await (0,iron_session__WEBPACK_IMPORTED_MODULE_3__.getIronSession)((0,next_headers__WEBPACK_IMPORTED_MODULE_1__.cookies)(), _lib_auth__WEBPACK_IMPORTED_MODULE_2__.sessionOptions);\n    if (!session.user) {\n        return next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__[\"default\"].json(null, {\n            status: 401\n        });\n    }\n    return next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__[\"default\"].json({\n        ...session.user,\n        userId: session.userId ?? null,\n        tenantId: session.tenantId ?? null,\n        tenants: session.tenants ?? [],\n        isSuperAdmin: session.isSuperAdmin ?? false\n    });\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvYXBwL2FwaS9hdXRoL3VzZXIvcm91dGUuanMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQTJDO0FBQ0o7QUFDTztBQUNRO0FBRS9DLGVBQWVJO0lBQ3BCLE1BQU1DLFVBQVUsTUFBTUgsNERBQWNBLENBQUNELHFEQUFPQSxJQUFJRSxxREFBY0E7SUFFOUQsSUFBSSxDQUFDRSxRQUFRQyxJQUFJLEVBQUU7UUFDakIsT0FBT04sa0ZBQVlBLENBQUNPLElBQUksQ0FBQyxNQUFNO1lBQUVDLFFBQVE7UUFBSTtJQUMvQztJQUVBLE9BQU9SLGtGQUFZQSxDQUFDTyxJQUFJLENBQUM7UUFDdkIsR0FBR0YsUUFBUUMsSUFBSTtRQUNmRyxRQUFRSixRQUFRSSxNQUFNLElBQUk7UUFDMUJDLFVBQVVMLFFBQVFLLFFBQVEsSUFBSTtRQUM5QkMsU0FBU04sUUFBUU0sT0FBTyxJQUFJLEVBQUU7UUFDOUJDLGNBQWNQLFFBQVFPLFlBQVksSUFBSTtJQUN4QztBQUNGIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vamItd2ViYXBwLy4vc3JjL2FwcC9hcGkvYXV0aC91c2VyL3JvdXRlLmpzPzM4NTUiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTmV4dFJlc3BvbnNlIH0gZnJvbSAnbmV4dC9zZXJ2ZXInO1xuaW1wb3J0IHsgY29va2llcyB9IGZyb20gJ25leHQvaGVhZGVycyc7XG5pbXBvcnQgeyBnZXRJcm9uU2Vzc2lvbiB9IGZyb20gJ2lyb24tc2Vzc2lvbic7XG5pbXBvcnQgeyBzZXNzaW9uT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL2xpYi9hdXRoJztcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIEdFVCgpIHtcbiAgY29uc3Qgc2Vzc2lvbiA9IGF3YWl0IGdldElyb25TZXNzaW9uKGNvb2tpZXMoKSwgc2Vzc2lvbk9wdGlvbnMpO1xuXG4gIGlmICghc2Vzc2lvbi51c2VyKSB7XG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKG51bGwsIHsgc3RhdHVzOiA0MDEgfSk7XG4gIH1cblxuICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oe1xuICAgIC4uLnNlc3Npb24udXNlcixcbiAgICB1c2VySWQ6IHNlc3Npb24udXNlcklkID8/IG51bGwsXG4gICAgdGVuYW50SWQ6IHNlc3Npb24udGVuYW50SWQgPz8gbnVsbCxcbiAgICB0ZW5hbnRzOiBzZXNzaW9uLnRlbmFudHMgPz8gW10sXG4gICAgaXNTdXBlckFkbWluOiBzZXNzaW9uLmlzU3VwZXJBZG1pbiA/PyBmYWxzZSxcbiAgfSk7XG59XG4iXSwibmFtZXMiOlsiTmV4dFJlc3BvbnNlIiwiY29va2llcyIsImdldElyb25TZXNzaW9uIiwic2Vzc2lvbk9wdGlvbnMiLCJHRVQiLCJzZXNzaW9uIiwidXNlciIsImpzb24iLCJzdGF0dXMiLCJ1c2VySWQiLCJ0ZW5hbnRJZCIsInRlbmFudHMiLCJpc1N1cGVyQWRtaW4iXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./src/app/api/auth/user/route.js\n");

/***/ }),

/***/ "(rsc)/./src/lib/auth.js":
/*!*************************!*\
  !*** ./src/lib/auth.js ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   getOidcConfig: () => (/* binding */ getOidcConfig),\n/* harmony export */   sessionOptions: () => (/* binding */ sessionOptions)\n/* harmony export */ });\n/* harmony import */ var openid_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! openid-client */ \"(rsc)/./node_modules/openid-client/build/index.js\");\n\nconst sessionOptions = {\n    password: process.env.SESSION_SECRET,\n    cookieName: \"jb-autoverhuur-session\",\n    cookieOptions: {\n        secure: \"development\" === \"production\",\n        httpOnly: true,\n        sameSite: \"lax\"\n    }\n};\nlet _oidcConfig = null;\nasync function getOidcConfig() {\n    if (!_oidcConfig) {\n        _oidcConfig = await openid_client__WEBPACK_IMPORTED_MODULE_0__.discovery(new URL(\"https://replit.com/oidc\"), process.env.REPL_ID);\n    }\n    return _oidcConfig;\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvbGliL2F1dGguanMiLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQXdDO0FBRWpDLE1BQU1DLGlCQUFpQjtJQUM1QkMsVUFBVUMsUUFBUUMsR0FBRyxDQUFDQyxjQUFjO0lBQ3BDQyxZQUFZO0lBQ1pDLGVBQWU7UUFDYkMsUUFBUUwsa0JBQXlCO1FBQ2pDTSxVQUFVO1FBQ1ZDLFVBQVU7SUFDWjtBQUNGLEVBQUU7QUFFRixJQUFJQyxjQUFjO0FBRVgsZUFBZUM7SUFDcEIsSUFBSSxDQUFDRCxhQUFhO1FBQ2hCQSxjQUFjLE1BQU1YLG9EQUFnQixDQUNsQyxJQUFJYyxJQUFJLDRCQUNSWCxRQUFRQyxHQUFHLENBQUNXLE9BQU87SUFFdkI7SUFDQSxPQUFPSjtBQUNUIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vamItd2ViYXBwLy4vc3JjL2xpYi9hdXRoLmpzPzg3YmQiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY2xpZW50IGZyb20gJ29wZW5pZC1jbGllbnQnO1xuXG5leHBvcnQgY29uc3Qgc2Vzc2lvbk9wdGlvbnMgPSB7XG4gIHBhc3N3b3JkOiBwcm9jZXNzLmVudi5TRVNTSU9OX1NFQ1JFVCxcbiAgY29va2llTmFtZTogJ2piLWF1dG92ZXJodXVyLXNlc3Npb24nLFxuICBjb29raWVPcHRpb25zOiB7XG4gICAgc2VjdXJlOiBwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ3Byb2R1Y3Rpb24nLFxuICAgIGh0dHBPbmx5OiB0cnVlLFxuICAgIHNhbWVTaXRlOiAnbGF4JyxcbiAgfSxcbn07XG5cbmxldCBfb2lkY0NvbmZpZyA9IG51bGw7XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRPaWRjQ29uZmlnKCkge1xuICBpZiAoIV9vaWRjQ29uZmlnKSB7XG4gICAgX29pZGNDb25maWcgPSBhd2FpdCBjbGllbnQuZGlzY292ZXJ5KFxuICAgICAgbmV3IFVSTCgnaHR0cHM6Ly9yZXBsaXQuY29tL29pZGMnKSxcbiAgICAgIHByb2Nlc3MuZW52LlJFUExfSURcbiAgICApO1xuICB9XG4gIHJldHVybiBfb2lkY0NvbmZpZztcbn1cbiJdLCJuYW1lcyI6WyJjbGllbnQiLCJzZXNzaW9uT3B0aW9ucyIsInBhc3N3b3JkIiwicHJvY2VzcyIsImVudiIsIlNFU1NJT05fU0VDUkVUIiwiY29va2llTmFtZSIsImNvb2tpZU9wdGlvbnMiLCJzZWN1cmUiLCJodHRwT25seSIsInNhbWVTaXRlIiwiX29pZGNDb25maWciLCJnZXRPaWRjQ29uZmlnIiwiZGlzY292ZXJ5IiwiVVJMIiwiUkVQTF9JRCJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./src/lib/auth.js\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/oauth4webapi","vendor-chunks/jose","vendor-chunks/openid-client","vendor-chunks/iron-webcrypto","vendor-chunks/iron-session","vendor-chunks/cookie","vendor-chunks/uncrypto"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2Fuser%2Froute&page=%2Fapi%2Fauth%2Fuser%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2Fuser%2Froute.js&appDir=%2Fhome%2Frunner%2Fworkspace%2Fsrc%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2Fhome%2Frunner%2Fworkspace&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();