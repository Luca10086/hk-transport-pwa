function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _iterableToArrayLimit(arr, i) { var _i = null == arr ? null : "undefined" != typeof Symbol && arr[Symbol.iterator] || arr["@@iterator"]; if (null != _i) { var _s, _e, _x, _r, _arr = [], _n = !0, _d = !1; try { if (_x = (_i = _i.call(arr)).next, 0 === i) { if (Object(_i) !== _i) return; _n = !1; } else for (; !(_n = (_s = _x.call(_i)).done) && (_arr.push(_s.value), _arr.length !== i); _n = !0); } catch (err) { _d = !0, _e = err; } finally { try { if (!_n && null != _i.return && (_r = _i.return(), Object(_r) !== _r)) return; } finally { if (_d) throw _e; } } return _arr; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return exports; }; var exports = {}, Op = Object.prototype, hasOwn = Op.hasOwnProperty, defineProperty = Object.defineProperty || function (obj, key, desc) { obj[key] = desc.value; }, $Symbol = "function" == typeof Symbol ? Symbol : {}, iteratorSymbol = $Symbol.iterator || "@@iterator", asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator", toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag"; function define(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: !0, configurable: !0, writable: !0 }), obj[key]; } try { define({}, ""); } catch (err) { define = function define(obj, key, value) { return obj[key] = value; }; } function wrap(innerFn, outerFn, self, tryLocsList) { var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator, generator = Object.create(protoGenerator.prototype), context = new Context(tryLocsList || []); return defineProperty(generator, "_invoke", { value: makeInvokeMethod(innerFn, self, context) }), generator; } function tryCatch(fn, obj, arg) { try { return { type: "normal", arg: fn.call(obj, arg) }; } catch (err) { return { type: "throw", arg: err }; } } exports.wrap = wrap; var ContinueSentinel = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var IteratorPrototype = {}; define(IteratorPrototype, iteratorSymbol, function () { return this; }); var getProto = Object.getPrototypeOf, NativeIteratorPrototype = getProto && getProto(getProto(values([]))); NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype); var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype); function defineIteratorMethods(prototype) { ["next", "throw", "return"].forEach(function (method) { define(prototype, method, function (arg) { return this._invoke(method, arg); }); }); } function AsyncIterator(generator, PromiseImpl) { function invoke(method, arg, resolve, reject) { var record = tryCatch(generator[method], generator, arg); if ("throw" !== record.type) { var result = record.arg, value = result.value; return value && "object" == _typeof(value) && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) { invoke("next", value, resolve, reject); }, function (err) { invoke("throw", err, resolve, reject); }) : PromiseImpl.resolve(value).then(function (unwrapped) { result.value = unwrapped, resolve(result); }, function (error) { return invoke("throw", error, resolve, reject); }); } reject(record.arg); } var previousPromise; defineProperty(this, "_invoke", { value: function value(method, arg) { function callInvokeWithMethodAndArg() { return new PromiseImpl(function (resolve, reject) { invoke(method, arg, resolve, reject); }); } return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(innerFn, self, context) { var state = "suspendedStart"; return function (method, arg) { if ("executing" === state) throw new Error("Generator is already running"); if ("completed" === state) { if ("throw" === method) throw arg; return doneResult(); } for (context.method = method, context.arg = arg;;) { var delegate = context.delegate; if (delegate) { var delegateResult = maybeInvokeDelegate(delegate, context); if (delegateResult) { if (delegateResult === ContinueSentinel) continue; return delegateResult; } } if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) { if ("suspendedStart" === state) throw state = "completed", context.arg; context.dispatchException(context.arg); } else "return" === context.method && context.abrupt("return", context.arg); state = "executing"; var record = tryCatch(innerFn, self, context); if ("normal" === record.type) { if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue; return { value: record.arg, done: context.done }; } "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg); } }; } function maybeInvokeDelegate(delegate, context) { var methodName = context.method, method = delegate.iterator[methodName]; if (undefined === method) return context.delegate = null, "throw" === methodName && delegate.iterator.return && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method) || "return" !== methodName && (context.method = "throw", context.arg = new TypeError("The iterator does not provide a '" + methodName + "' method")), ContinueSentinel; var record = tryCatch(method, delegate.iterator, context.arg); if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel; var info = record.arg; return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel); } function pushTryEntry(locs) { var entry = { tryLoc: locs[0] }; 1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry); } function resetTryEntry(entry) { var record = entry.completion || {}; record.type = "normal", delete record.arg, entry.completion = record; } function Context(tryLocsList) { this.tryEntries = [{ tryLoc: "root" }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0); } function values(iterable) { if (iterable) { var iteratorMethod = iterable[iteratorSymbol]; if (iteratorMethod) return iteratorMethod.call(iterable); if ("function" == typeof iterable.next) return iterable; if (!isNaN(iterable.length)) { var i = -1, next = function next() { for (; ++i < iterable.length;) if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next; return next.value = undefined, next.done = !0, next; }; return next.next = next; } } return { next: doneResult }; } function doneResult() { return { value: undefined, done: !0 }; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, defineProperty(Gp, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), defineProperty(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) { var ctor = "function" == typeof genFun && genFun.constructor; return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name)); }, exports.mark = function (genFun) { return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun; }, exports.awrap = function (arg) { return { __await: arg }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () { return this; }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) { void 0 === PromiseImpl && (PromiseImpl = Promise); var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl); return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) { return result.done ? result.value : iter.next(); }); }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () { return this; }), define(Gp, "toString", function () { return "[object Generator]"; }), exports.keys = function (val) { var object = Object(val), keys = []; for (var key in object) keys.push(key); return keys.reverse(), function next() { for (; keys.length;) { var key = keys.pop(); if (key in object) return next.value = key, next.done = !1, next; } return next.done = !0, next; }; }, exports.values = values, Context.prototype = { constructor: Context, reset: function reset(skipTempReset) { if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined); }, stop: function stop() { this.done = !0; var rootRecord = this.tryEntries[0].completion; if ("throw" === rootRecord.type) throw rootRecord.arg; return this.rval; }, dispatchException: function dispatchException(exception) { if (this.done) throw exception; var context = this; function handle(loc, caught) { return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught; } for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i], record = entry.completion; if ("root" === entry.tryLoc) return handle("end"); if (entry.tryLoc <= this.prev) { var hasCatch = hasOwn.call(entry, "catchLoc"), hasFinally = hasOwn.call(entry, "finallyLoc"); if (hasCatch && hasFinally) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } else if (hasCatch) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); } else { if (!hasFinally) throw new Error("try statement without catch or finally"); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } } } }, abrupt: function abrupt(type, arg) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) { var finallyEntry = entry; break; } } finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null); var record = finallyEntry ? finallyEntry.completion : {}; return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record); }, complete: function complete(record, afterLoc) { if ("throw" === record.type) throw record.arg; return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel; }, finish: function finish(finallyLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel; } }, catch: function _catch(tryLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc === tryLoc) { var record = entry.completion; if ("throw" === record.type) { var thrown = record.arg; resetTryEntry(entry); } return thrown; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(iterable, resultName, nextLoc) { return this.delegate = { iterator: values(iterable), resultName: resultName, nextLoc: nextLoc }, "next" === this.method && (this.arg = undefined), ContinueSentinel; } }, exports; }
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
import { r as x, ae as A, b as U, af as D, u as r, M as C, d as L, L as P, l as k, x as g, p as N, O as V, D as B, E as T, m as j, o as b, J as I, a as q, s as z } from "./__uno-cab22814.js";
import { g as E } from "./index-28ec3cbd.js";
import { u as Z } from "./useSettingConfig-f3713183.js";
import { v as F } from "./url-1b6e2379.js";
import { g as G, c as O, d as $, e as R } from "./path-e6e5c517.js";
import { u as H } from "./useConvertInfo-7db30bfb.js";
var s = function (e) {
  return e.success = "success", e.fail = "fail", e.spaceFull = "spaceFull", e.loading = "loading", e.error = "error", e;
}(s || {});
var M = G(),
  J = function J(e) {
    return M.request("post", F + "/html2fp/pulg/convert/create", {
      data: e
    });
  },
  K = function K(e) {
    var o = new FormData();
    return o.append("file", e.file), o.append("name", e.name), M.request("post", F + "/html2fp/pulg/convert/pic", {
      data: o,
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
  },
  Q = function Q(e) {
    return M.request("get", F + "/html2fp/pulg/convert/query", {
      params: {
        jobID: e
      }
    });
  },
  W = /*#__PURE__*/function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(e) {
      var u, d, f, i, _, o;
      return _regeneratorRuntime().wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return O(e);
          case 2:
            o = _context.sent;
            return _context.abrupt("return", {
              linUrl: ((u = o == null ? void 0 : o.fileinfo) == null ? void 0 : u.link_url) || "",
              fileid: ((d = o == null ? void 0 : o.fileinfo) == null ? void 0 : d.fileid) || "",
              filesize: ((f = o == null ? void 0 : o.fileinfo) == null ? void 0 : f.fsize) || 0,
              filetype: ((i = o == null ? void 0 : o.fileinfo) == null ? void 0 : i.ftype) || "",
              groupid: ((_ = o == null ? void 0 : o.fileinfo) == null ? void 0 : _.groupid) || 0
            });
          case 4:
          case "end":
            return _context.stop();
        }
      }, _callee);
    }));
    return function W(_x) {
      return _ref.apply(this, arguments);
    };
  }(),
  _H = H(),
  X = _H.getConvertInfoNoRef,
  Y = _H.removeConvertInfo,
  tt = function tt() {
    var e = x("");
    function o(_x2, _x3, _x4, _x5) {
      return _o.apply(this, arguments);
    }
    function _o() {
      _o = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(t, n, l, v) {
        var _yield$W, w, h, y, a, p, c;
        return _regeneratorRuntime().wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return W(n);
            case 2:
              _yield$W = _context2.sent;
              w = _yield$W.fileid;
              h = _yield$W.linUrl;
              y = _yield$W.filetype;
              a = _yield$W.filesize;
              p = _yield$W.groupid;
              e.value = h, Y(), i({
                action: "clipper_success",
                url: t.url,
                title: t.title,
                cliptype: l,
                fileid: w
              });
              _context2.next = 11;
              return $();
            case 11:
              c = _context2.sent;
              i({
                dwEvtName: "active_init",
                action: "webpage_import",
                fileid: w,
                filetype: y,
                groupid: p,
                filesize: a,
                costtime: v,
                source: "browserplugin_clip",
                isnewuser: c
              });
            case 13:
            case "end":
              return _context2.stop();
          }
        }, _callee2);
      }));
      return _o.apply(this, arguments);
    }
    function u(_x6) {
      return _u.apply(this, arguments);
    }
    function _u() {
      _u = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3(t) {
        var n;
        return _regeneratorRuntime().wrap(function _callee3$(_context3) {
          while (1) switch (_context3.prev = _context3.next) {
            case 0:
              _context3.next = 2;
              return Q(t);
            case 2:
              n = _context3.sent;
              if (!(n.code === 0 && n.data.status === 1)) {
                _context3.next = 7;
                break;
              }
              _context3.t0 = n.data.fileID;
              _context3.next = 10;
              break;
            case 7:
              _context3.next = 9;
              return A(2e3);
            case 9:
              _context3.t0 = u(t);
            case 10:
              return _context3.abrupt("return", _context3.t0);
            case 11:
            case "end":
              return _context3.stop();
          }
        }, _callee3);
      }));
      return _u.apply(this, arguments);
    }
    function d(t) {
      return new Promise(function (n) {
        R.get(t, {
          responseType: "blob"
        }).then(function (l) {
          n(l.data);
        }).catch(function () {
          n(void 0);
        });
      });
    }
    function f(_x7) {
      return _f.apply(this, arguments);
    }
    function _f() {
      _f = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee4(t) {
        var n;
        return _regeneratorRuntime().wrap(function _callee4$(_context4) {
          while (1) switch (_context4.prev = _context4.next) {
            case 0:
              _context4.next = 2;
              return d(t);
            case 2:
              n = _context4.sent;
              _context4.t0 = n;
              if (_context4.t0) {
                _context4.next = 8;
                break;
              }
              _context4.next = 7;
              return d("https://image.baidu.com/search/down?url=".concat(t));
            case 7:
              n = _context4.sent;
            case 8:
              return _context4.abrupt("return", n);
            case 9:
            case "end":
              return _context4.stop();
          }
        }, _callee4);
      }));
      return _f.apply(this, arguments);
    }
    function i(t) {
      var n, l;
      try {
        (l = (n = window == null ? void 0 : window.top) == null ? void 0 : n.postMessage) == null || l.call(n, _objectSpread({
          type: "dwEvent"
        }, t), "*");
      } catch (_unused) {}
    }
    function _() {
      return _2.apply(this, arguments);
    }
    function _2() {
      _2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee5() {
        var l, v, w, h, y, a, p, t, n, c, m, _c, _m, S, _ref2, _ref3, _ref4, _ref5, _m2;
        return _regeneratorRuntime().wrap(function _callee5$(_context5) {
          while (1) switch (_context5.prev = _context5.next) {
            case 0:
              n = Date.now();
              _context5.prev = 1;
              _context5.next = 4;
              return X();
            case 4:
              t = _context5.sent;
              if (!(t.text && t.url)) {
                _context5.next = 17;
                break;
              }
              i({
                action: "clipper_star",
                url: t.url,
                title: t.title,
                cliptype: t.type === "page" ? "webpage" : "part_content"
              });
              _context5.next = 9;
              return J({
                url: t.url,
                title: t.title,
                content: t.text,
                ispart: t.type !== "page"
              });
            case 9:
              c = _context5.sent;
              if (!(c.code === 0)) {
                _context5.next = 17;
                break;
              }
              _context5.next = 13;
              return u(c.data.jobID);
            case 13:
              m = _context5.sent;
              _context5.next = 16;
              return o(t, m, t.type === "page" ? "webpage" : "part_content", Date.now() - n);
            case 16:
              return _context5.abrupt("return", s.success);
            case 17:
              if (!t.imgUrl) {
                _context5.next = 30;
                break;
              }
              i({
                action: "clipper_star",
                url: t.url,
                title: t.title,
                cliptype: "picture"
              });
              _context5.next = 21;
              return f(t.imgUrl);
            case 21:
              _c = _context5.sent;
              if (!_c) {
                _context5.next = 30;
                break;
              }
              _m = "".concat(t.title, ".").concat((w = (v = (l = _c == null ? void 0 : _c.type) == null ? void 0 : l.split) == null ? void 0 : v.call(l, "/")) == null ? void 0 : w.pop());
              _context5.next = 26;
              return K({
                name: _m,
                file: _c
              });
            case 26:
              S = _context5.sent;
              _context5.next = 29;
              return o(t, S.data.fileID, "picture", Date.now() - n);
            case 29:
              return _context5.abrupt("return", s.success);
            case 30:
              _context5.next = 37;
              break;
            case 32:
              _context5.prev = 32;
              _context5.t0 = _context5["catch"](1);
              _m2 = "picture";
              if (!(t != null && t.text && t != null && t.url && (_m2 = (t == null ? void 0 : t.type) === "page" ? "webpage" : "part_content"), i({
                action: "clipper_fail",
                url: (_ref2 = t == null ? void 0 : t.url) !== null && _ref2 !== void 0 ? _ref2 : "",
                title: (_ref3 = t == null ? void 0 : t.title) !== null && _ref3 !== void 0 ? _ref3 : "",
                cliptype: _m2,
                error: (_ref4 = (_ref5 = (y = (h = _context5.t0 == null ? void 0 : _context5.t0.response) == null ? void 0 : h.data) == null ? void 0 : y.msg) !== null && _ref5 !== void 0 ? _ref5 : _context5.t0.message) !== null && _ref4 !== void 0 ? _ref4 : ""
              }), ((p = (a = _context5.t0 == null ? void 0 : _context5.t0.response) == null ? void 0 : a.data) == null ? void 0 : p.code) === 14)) {
                _context5.next = 37;
                break;
              }
              return _context5.abrupt("return", s.spaceFull);
            case 37:
              return _context5.abrupt("return", s.fail);
            case 38:
            case "end":
              return _context5.stop();
          }
        }, _callee5, null, [[1, 32]]);
      }));
      return _2.apply(this, arguments);
    }
    return {
      startConvert: _,
      kdocsUrl: e,
      onSendMessage: i
    };
  },
  et = function et() {
    var e = x(0),
      o = x(s.loading),
      u = U(function () {
        switch (r(o)) {
          case s.success:
            return {
              content: C("notice.clipSucc"),
              append: C("notice.clickView"),
              color: "#409eff"
            };
          case s.fail:
            return {
              content: C("notice.clipFail"),
              append: C("notice.clickRetry"),
              color: "#409eff"
            };
          case s.spaceFull:
            return {
              content: C("notice.clipSpaceFull"),
              append: "",
              color: "#409eff"
            };
          case s.error:
            return {
              content: C("notice.clipForbid"),
              append: "",
              color: "#000"
            };
          default:
            return {
              content: C("notice.clipping"),
              append: "".concat(r(e), "%"),
              color: "rgba(13, 13, 13, 0.9)"
            };
        }
      });
    function d() {
      e.value = 0;
      var _D = D(function () {
          if (r(e) >= 99) {
            f();
            return;
          }
          e.value = r(e) + 1;
        }, 200),
        f = _D.pause;
    }
    return {
      tips: u,
      state: o,
      progress: e,
      startProgress: d
    };
  },
  ot = {
    class: "kdocs-webcut-notification"
  },
  nt = {
    key: 0,
    class: "circular",
    width: "16",
    height: "16",
    viewBox: "0 0 16 16",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  },
  it = I('<path d="M8 14C9.09286 14 10.1175 13.7078 11 13.1973" stroke="#3B64FC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path><path d="M8 2C11.3137 2 14 4.6863 14 7.99996C14 10.2208 12.7934 12.1598 11 13.1973" stroke="url(#paint0_linear_4939_32595)" stroke-width="2" stroke-linejoin="round"></path><path d="M8 2C4.68629 2 2 4.6863 2 8C2 11.3137 4.68629 14 8 14" stroke="url(#paint1_linear_4939_32595)" stroke-width="2" stroke-linejoin="round"></path><defs><linearGradient id="paint0_linear_4939_32595" x1="8" y1="12" x2="8" y2="3" gradientUnits="userSpaceOnUse"><stop stop-color="#0A6CFF"></stop><stop offset="1" stop-color="#0A6CFF" stop-opacity="0.5"></stop></linearGradient><linearGradient id="paint1_linear_4939_32595" x1="7.5" y1="14" x2="8" y2="3" gradientUnits="userSpaceOnUse"><stop stop-color="#0A6CFF" stop-opacity="0"></stop><stop offset="1" stop-color="#0A6CFF" stop-opacity="0.5"></stop></linearGradient></defs>', 4),
  st = [it],
  ct = {
    key: 1,
    width: "16",
    height: "16",
    viewBox: "0 0 16 16",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  },
  rt = I('<g clip-path="url(#clip0_4939_32620)"><path d="M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16Z" fill="#00A147"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M12.6009 5.19891C12.9329 5.53086 12.9329 6.06905 12.6009 6.40099L7.78109 11.2208C7.44914 11.5528 6.91095 11.5528 6.57901 11.2208L3.89886 8.5407C3.56692 8.20876 3.56692 7.67057 3.89886 7.33862C4.23081 7.00668 4.769 7.00668 5.10094 7.33862L7.18005 9.41772L11.3989 5.19891C11.7308 4.86696 12.269 4.86696 12.6009 5.19891Z" fill="white"></path></g><defs><clipPath id="clip0_4939_32620"><rect width="16" height="16" fill="white"></rect></clipPath></defs>', 2),
  at = [rt],
  lt = {
    key: 2,
    width: "16",
    height: "16",
    viewBox: "0 0 16 16",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  },
  pt = g("path", {
    d: "M6.2521 2.02338C7.01671 0.664083 8.97379 0.664081 9.7384 2.02338L15.7422 12.0196C16.4921 13.3528 15.5145 15.0001 13.9848 15.0001H2.00486C0.475212 15.0001 -0.488216 13.3528 0.261714 12.0196L6.2521 2.02338Z",
    fill: "#E2651A"
  }, null, -1),
  ut = g("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M8 5C8.55228 5 9 5.44772 9 6V9C9 9.55228 8.55228 10 8 10C7.44772 10 7 9.55228 7 9V6C7 5.44772 7.44772 5 8 5ZM7 12C7 11.4477 7.44772 11 8 11C8.55228 11 9 11.4477 9 12C9 12.5523 8.55228 13 8 13C7.44772 13 7 12.5523 7 12Z",
    fill: "white"
  }, null, -1),
  dt = [pt, ut],
  ft = {
    class: "kdocs-webcut-notification__group"
  },
  _t = {
    class: "kdocs-webcut-notification__title"
  },
  wt = g("svg", {
    width: "24",
    height: "24",
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, [g("path", {
    d: "M7 17.0003L17 7.00027M7 7.00027L17 17.0003",
    stroke: "#757575",
    "stroke-width": "1.5",
    "stroke-linecap": "round",
    "stroke-linejoin": "round"
  })], -1),
  gt = [wt],
  ht = L({
    __name: "App",
    setup: function setup(e) {
      var _Z = Z(),
        o = _Z.getSettingConfigsNoRef,
        _tt = tt(),
        u = _tt.startConvert,
        d = _tt.kdocsUrl,
        f = _tt.onSendMessage,
        _et = et(),
        i = _et.state,
        _ = _et.tips,
        t = _et.startProgress,
        _E = E(location.href),
        _E2 = _slicedToArray(_E, 1),
        _E2$ = _E2[0],
        n = _E2$ === void 0 ? "false" : _E2$;
      function l() {
        if (r(i) === s.success) {
          window == null || window.open(r(d)), f({
            action: "click_openfile"
          }), h();
          return;
        }
        r(i) === s.fail && (i.value = s.loading, t(), w(), f({
          action: "click_retry"
        }));
      }
      P(function () {
        v();
      });
      function v() {
        return _v.apply(this, arguments);
      }
      function _v() {
        _v = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee6() {
          return _regeneratorRuntime().wrap(function _callee6$(_context6) {
            while (1) switch (_context6.prev = _context6.next) {
              case 0:
                if (!(n === "true")) {
                  _context6.next = 3;
                  break;
                }
                i.value = s.error;
                return _context6.abrupt("return");
              case 3:
                t(), w();
              case 4:
              case "end":
                return _context6.stop();
            }
          }, _callee6);
        }));
        return _v.apply(this, arguments);
      }
      function w() {
        return _w.apply(this, arguments);
      }
      function _w() {
        _w = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee7() {
          var a, _yield$o, p;
          return _regeneratorRuntime().wrap(function _callee7$(_context7) {
            while (1) switch (_context7.prev = _context7.next) {
              case 0:
                i.value = s.loading;
                _context7.next = 3;
                return u();
              case 3:
                i.value = _context7.sent;
                a = r(i) === s.success;
                _context7.next = 7;
                return o();
              case 7:
                _yield$o = _context7.sent;
                p = _yield$o.successOpen;
                p && a && l();
              case 10:
              case "end":
                return _context7.stop();
            }
          }, _callee7);
        }));
        return _w.apply(this, arguments);
      }
      function h() {
        var a, p;
        (p = (a = window == null ? void 0 : window.top) == null ? void 0 : a.postMessage) == null || p.call(a, {
          type: "notice"
        }, "*");
      }
      var y = U(function () {
        var a = r(i);
        return a === s.fail || a === s.error ? "kdocs-webcut-notification--warning" : "kdocs-webcut-notification--success";
      });
      return function (a, p) {
        return b(), k("div", ot, [g("i", {
          class: N(["kdocs-webcut-icon kdocs-webcut-notification__icon", y.value])
        }, [r(i) === r(s).loading ? (b(), k("svg", nt, st)) : r(i) === r(s).success ? (b(), k("svg", ct, at)) : (b(), k("svg", lt, dt))], 2), g("div", ft, [g("h2", _t, [V(B(r(_).content) + " ", 1), r(_).append ? (b(), k("span", {
          key: 0,
          style: T({
            color: r(_).color
          }),
          onClick: l
        }, B(r(_).append), 5)) : j("", !0)]), g("div", {
          class: "kdocs-webcut-icon kdocs-webcut-notification__closeBtn",
          onClick: h
        }, gt)])]);
      };
    }
  });
function Ct() {
  return _Ct.apply(this, arguments);
}
function _Ct() {
  _Ct = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee8() {
    var e;
    return _regeneratorRuntime().wrap(function _callee8$(_context8) {
      while (1) switch (_context8.prev = _context8.next) {
        case 0:
          e = q(ht);
          _context8.next = 3;
          return z();
        case 3:
          e.mount("#app");
        case 4:
        case "end":
          return _context8.stop();
      }
    }, _callee8);
  }));
  return _Ct.apply(this, arguments);
}
Ct();
