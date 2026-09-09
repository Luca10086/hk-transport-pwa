var _mi, _Jc;
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return exports; }; var exports = {}, Op = Object.prototype, hasOwn = Op.hasOwnProperty, defineProperty = Object.defineProperty || function (obj, key, desc) { obj[key] = desc.value; }, $Symbol = "function" == typeof Symbol ? Symbol : {}, iteratorSymbol = $Symbol.iterator || "@@iterator", asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator", toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag"; function define(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: !0, configurable: !0, writable: !0 }), obj[key]; } try { define({}, ""); } catch (err) { define = function define(obj, key, value) { return obj[key] = value; }; } function wrap(innerFn, outerFn, self, tryLocsList) { var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator, generator = Object.create(protoGenerator.prototype), context = new Context(tryLocsList || []); return defineProperty(generator, "_invoke", { value: makeInvokeMethod(innerFn, self, context) }), generator; } function tryCatch(fn, obj, arg) { try { return { type: "normal", arg: fn.call(obj, arg) }; } catch (err) { return { type: "throw", arg: err }; } } exports.wrap = wrap; var ContinueSentinel = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var IteratorPrototype = {}; define(IteratorPrototype, iteratorSymbol, function () { return this; }); var getProto = Object.getPrototypeOf, NativeIteratorPrototype = getProto && getProto(getProto(values([]))); NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype); var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype); function defineIteratorMethods(prototype) { ["next", "throw", "return"].forEach(function (method) { define(prototype, method, function (arg) { return this._invoke(method, arg); }); }); } function AsyncIterator(generator, PromiseImpl) { function invoke(method, arg, resolve, reject) { var record = tryCatch(generator[method], generator, arg); if ("throw" !== record.type) { var result = record.arg, value = result.value; return value && "object" == _typeof(value) && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) { invoke("next", value, resolve, reject); }, function (err) { invoke("throw", err, resolve, reject); }) : PromiseImpl.resolve(value).then(function (unwrapped) { result.value = unwrapped, resolve(result); }, function (error) { return invoke("throw", error, resolve, reject); }); } reject(record.arg); } var previousPromise; defineProperty(this, "_invoke", { value: function value(method, arg) { function callInvokeWithMethodAndArg() { return new PromiseImpl(function (resolve, reject) { invoke(method, arg, resolve, reject); }); } return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(innerFn, self, context) { var state = "suspendedStart"; return function (method, arg) { if ("executing" === state) throw new Error("Generator is already running"); if ("completed" === state) { if ("throw" === method) throw arg; return doneResult(); } for (context.method = method, context.arg = arg;;) { var delegate = context.delegate; if (delegate) { var delegateResult = maybeInvokeDelegate(delegate, context); if (delegateResult) { if (delegateResult === ContinueSentinel) continue; return delegateResult; } } if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) { if ("suspendedStart" === state) throw state = "completed", context.arg; context.dispatchException(context.arg); } else "return" === context.method && context.abrupt("return", context.arg); state = "executing"; var record = tryCatch(innerFn, self, context); if ("normal" === record.type) { if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue; return { value: record.arg, done: context.done }; } "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg); } }; } function maybeInvokeDelegate(delegate, context) { var methodName = context.method, method = delegate.iterator[methodName]; if (undefined === method) return context.delegate = null, "throw" === methodName && delegate.iterator.return && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method) || "return" !== methodName && (context.method = "throw", context.arg = new TypeError("The iterator does not provide a '" + methodName + "' method")), ContinueSentinel; var record = tryCatch(method, delegate.iterator, context.arg); if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel; var info = record.arg; return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel); } function pushTryEntry(locs) { var entry = { tryLoc: locs[0] }; 1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry); } function resetTryEntry(entry) { var record = entry.completion || {}; record.type = "normal", delete record.arg, entry.completion = record; } function Context(tryLocsList) { this.tryEntries = [{ tryLoc: "root" }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0); } function values(iterable) { if (iterable) { var iteratorMethod = iterable[iteratorSymbol]; if (iteratorMethod) return iteratorMethod.call(iterable); if ("function" == typeof iterable.next) return iterable; if (!isNaN(iterable.length)) { var i = -1, next = function next() { for (; ++i < iterable.length;) if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next; return next.value = undefined, next.done = !0, next; }; return next.next = next; } } return { next: doneResult }; } function doneResult() { return { value: undefined, done: !0 }; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, defineProperty(Gp, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), defineProperty(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) { var ctor = "function" == typeof genFun && genFun.constructor; return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name)); }, exports.mark = function (genFun) { return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun; }, exports.awrap = function (arg) { return { __await: arg }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () { return this; }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) { void 0 === PromiseImpl && (PromiseImpl = Promise); var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl); return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) { return result.done ? result.value : iter.next(); }); }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () { return this; }), define(Gp, "toString", function () { return "[object Generator]"; }), exports.keys = function (val) { var object = Object(val), keys = []; for (var key in object) keys.push(key); return keys.reverse(), function next() { for (; keys.length;) { var key = keys.pop(); if (key in object) return next.value = key, next.done = !1, next; } return next.done = !0, next; }; }, exports.values = values, Context.prototype = { constructor: Context, reset: function reset(skipTempReset) { if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined); }, stop: function stop() { this.done = !0; var rootRecord = this.tryEntries[0].completion; if ("throw" === rootRecord.type) throw rootRecord.arg; return this.rval; }, dispatchException: function dispatchException(exception) { if (this.done) throw exception; var context = this; function handle(loc, caught) { return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught; } for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i], record = entry.completion; if ("root" === entry.tryLoc) return handle("end"); if (entry.tryLoc <= this.prev) { var hasCatch = hasOwn.call(entry, "catchLoc"), hasFinally = hasOwn.call(entry, "finallyLoc"); if (hasCatch && hasFinally) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } else if (hasCatch) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); } else { if (!hasFinally) throw new Error("try statement without catch or finally"); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } } } }, abrupt: function abrupt(type, arg) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) { var finallyEntry = entry; break; } } finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null); var record = finallyEntry ? finallyEntry.completion : {}; return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record); }, complete: function complete(record, afterLoc) { if ("throw" === record.type) throw record.arg; return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel; }, finish: function finish(finallyLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel; } }, catch: function _catch(tryLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc === tryLoc) { var record = entry.completion; if ("throw" === record.type) { var thrown = record.arg; resetTryEntry(entry); } return thrown; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(iterable, resultName, nextLoc) { return this.delegate = { iterator: values(iterable), resultName: resultName, nextLoc: nextLoc }, "next" === this.method && (this.arg = undefined), ContinueSentinel; } }, exports; }
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e2) { throw _e2; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e3) { didErr = true; err = _e3; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArrayLimit(arr, i) { var _i = null == arr ? null : "undefined" != typeof Symbol && arr[Symbol.iterator] || arr["@@iterator"]; if (null != _i) { var _s, _e, _x, _r, _arr = [], _n = !0, _d = !1; try { if (_x = (_i = _i.call(arr)).next, 0 === i) { if (Object(_i) !== _i) return; _n = !1; } else for (; !(_n = (_s = _x.call(_i)).done) && (_arr.push(_s.value), _arr.length !== i); _n = !0); } catch (err) { _d = !0, _e = err; } finally { try { if (!_n && null != _i.return && (_r = _i.return(), Object(_r) !== _r)) return; } finally { if (_d) throw _e; } } return _arr; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
import { P as $e, e as pe, Q as fr, R as fe, S as ln, T as vr, w as K, U as mr, b as H, g as ct, u as a, j as gr, r as J, N as Ye, L as cn, V as ce, W, d as z, t as de, o as P, c as U, y as Z, k as Ot, x as O, p as j, E as ue, v as xt, X as Ft, l as Y, B as R, F as ot, n as Be, K as hr, Y as br, q as D, z as Ne, m as X, G as un, Z as Cr, _ as yr, $ as wr, A as Se, i as Et, a0 as dn, a1 as pn, a2 as fn, a3 as Er, D as _, h as vn, a4 as Sr, a5 as mn, a6 as se, I as kr, a7 as Hr, C as nt, O as ye, a8 as Vr, a9 as To, M as re, H as Ir, a as Tr, s as Mr } from "./__uno-cab22814.js";
import { i as be, t as gn, o as Pe, k as oe, x as Mo, y as Or, z as Jr, A as Pr, B as hn, d as B, C as Je, f as Oo, D as Lr, F as Zr, G as Rr, b as te, a as we, _ as x, w as He, H as Vt, I as Jo, n as rt, q as Xe, c as It, E as ze, J as zr, K as Nr, L as Ar, M as Po, N as Dt, s as Kt, O as Br, h as Ut, P as Dr, e as jr, g as Qr, j as qr, Q as Yr, R as xr, S as Lo } from "./url-d1de9e2d.js";
import { k as Fr, a as Kr, b as Zo } from "./url-1b6e2379.js";
import { _ as Ur } from "./index.vue_vue_type_style_index_0_lang-52d723f8.js";
import { t as Gt, f as Tt, u as Gr, g as bn, i as Xt, o as Xr, a as Cn, U as st, C as jt, I as Qt, d as Wr, h as _r, j as zt, k as $r, l as es, m as ts, n as os, p as ns, b as rs, e as ss, q as as, E as ls, c as is } from "./usePath-da3794e6.js";
import { u as cs } from "./useSettingConfig-f3713183.js";
import "./path-e6e5c517.js";
import "./index-28ec3cbd.js";
var ne = function ne(e, t) {
    var _ref = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
      _ref$checkForDefaultP = _ref.checkForDefaultPrevented,
      o = _ref$checkForDefaultP === void 0 ? !0 : _ref$checkForDefaultP;
    return function (r) {
      var s = e == null ? void 0 : e(r);
      if (o === !1 || !s) return t == null ? void 0 : t(r);
    };
  },
  Ro = function Ro(e) {
    return function (t) {
      return t.pointerType === "mouse" ? e(t) : void 0;
    };
  };
function us(e) {
  return e === void 0;
}
var gt;
var ds = function ds(e) {
    var t;
    if (!be) return 0;
    if (gt !== void 0) return gt;
    var o = document.createElement("div");
    o.className = "".concat(e, "-scrollbar__wrap"), o.style.visibility = "hidden", o.style.width = "100px", o.style.position = "absolute", o.style.top = "-9999px", document.body.appendChild(o);
    var n = o.offsetWidth;
    o.style.overflow = "scroll";
    var r = document.createElement("div");
    r.style.width = "100%", o.appendChild(r);
    var s = r.offsetWidth;
    return (t = o.parentNode) == null || t.removeChild(o), gt = n - s, gt;
  },
  Wt = function Wt() {
    for (var _len = arguments.length, e = new Array(_len), _key = 0; _key < _len; _key++) {
      e[_key] = arguments[_key];
    }
    return function (t) {
      e.forEach(function (o) {
        $e(o) ? o(t) : o.value = t;
      });
    };
  },
  $ = {
    tab: "Tab",
    enter: "Enter",
    space: "Space",
    left: "ArrowLeft",
    up: "ArrowUp",
    right: "ArrowRight",
    down: "ArrowDown",
    esc: "Escape",
    delete: "Delete",
    backspace: "Backspace",
    numpadEnter: "NumpadEnter",
    pageUp: "PageUp",
    pageDown: "PageDown",
    home: "Home",
    end: "End"
  },
  ps = function ps(e) {
    return [""].concat(_toConsumableArray(gn)).includes(e);
  };
var St = function (e) {
  return e[e.TEXT = 1] = "TEXT", e[e.CLASS = 2] = "CLASS", e[e.STYLE = 4] = "STYLE", e[e.PROPS = 8] = "PROPS", e[e.FULL_PROPS = 16] = "FULL_PROPS", e[e.HYDRATE_EVENTS = 32] = "HYDRATE_EVENTS", e[e.STABLE_FRAGMENT = 64] = "STABLE_FRAGMENT", e[e.KEYED_FRAGMENT = 128] = "KEYED_FRAGMENT", e[e.UNKEYED_FRAGMENT = 256] = "UNKEYED_FRAGMENT", e[e.NEED_PATCH = 512] = "NEED_PATCH", e[e.DYNAMIC_SLOTS = 1024] = "DYNAMIC_SLOTS", e[e.HOISTED = -1] = "HOISTED", e[e.BAIL = -2] = "BAIL", e;
}(St || {});
var fs = function fs(e, t, o) {
    var n = {
      offsetX: 0,
      offsetY: 0
    };
    var r = function r(i) {
        var c = i.clientX,
          u = i.clientY,
          _n2 = n,
          f = _n2.offsetX,
          d = _n2.offsetY,
          b = e.value.getBoundingClientRect(),
          v = b.left,
          p = b.top,
          g = b.width,
          h = b.height,
          m = document.documentElement.clientWidth,
          S = document.documentElement.clientHeight,
          k = -v + f,
          y = -p + d,
          V = m - v - g + f,
          E = S - p - h + d,
          w = function w(I) {
            var T = Math.min(Math.max(f + I.clientX - c, k), V),
              N = Math.min(Math.max(d + I.clientY - u, y), E);
            n = {
              offsetX: T,
              offsetY: N
            }, e.value.style.transform = "translate(".concat(Pe(T), ", ").concat(Pe(N), ")");
          },
          C = function C() {
            document.removeEventListener("mousemove", w), document.removeEventListener("mouseup", C);
          };
        document.addEventListener("mousemove", w), document.addEventListener("mouseup", C);
      },
      s = function s() {
        t.value && e.value && t.value.addEventListener("mousedown", r);
      },
      l = function l() {
        t.value && e.value && t.value.removeEventListener("mousedown", r);
      };
    pe(function () {
      fr(function () {
        o.value ? s() : l();
      });
    }), fe(function () {
      l();
    });
  },
  vs = function vs(e) {
    var t = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    ln(e) || Gt("[useLockscreen]", "You need to pass a ref param to this function");
    var o = t.ns || oe("popup"),
      n = vr(function () {
        return o.bm("parent", "hidden");
      });
    if (!be || Mo(document.body, n.value)) return;
    var r = 0,
      s = !1,
      l = "0";
    var i = function i() {
      setTimeout(function () {
        Pr(document == null ? void 0 : document.body, n.value), s && document && (document.body.style.width = l);
      }, 200);
    };
    K(e, function (c) {
      if (!c) {
        i();
        return;
      }
      s = !Mo(document.body, n.value), s && (l = document.body.style.width), r = ds(o.namespace.value);
      var u = document.documentElement.clientHeight < document.body.scrollHeight,
        f = Or(document.body, "overflowY");
      r > 0 && (u || f === "scroll") && s && (document.body.style.width = "calc(100% - ".concat(r, "px)")), Jr(document.body, n.value);
    }), mr(function () {
      return i();
    });
  },
  ms = hn({
    type: B(Boolean),
    default: null
  }),
  gs = hn({
    type: B(Function)
  }),
  yn = function yn(e) {
    var _r2;
    var t = "update:".concat(e),
      o = "onUpdate:".concat(e),
      n = [t],
      r = (_r2 = {}, _defineProperty(_r2, e, ms), _defineProperty(_r2, o, gs), _r2);
    return {
      useModelToggle: function useModelToggle(_ref2) {
        var l = _ref2.indicator,
          i = _ref2.toggleReason,
          c = _ref2.shouldHideWhenRouteChanges,
          u = _ref2.shouldProceed,
          f = _ref2.onShow,
          d = _ref2.onHide;
        var b = ct(),
          v = b.emit,
          p = b.props,
          g = H(function () {
            return $e(p[o]);
          }),
          h = H(function () {
            return p[e] === null;
          }),
          m = function m(w) {
            l.value !== !0 && (l.value = !0, i && (i.value = w), $e(f) && f(w));
          },
          S = function S(w) {
            l.value !== !1 && (l.value = !1, i && (i.value = w), $e(d) && d(w));
          },
          k = function k(w) {
            if (p.disabled === !0 || $e(u) && !u()) return;
            var C = g.value && be;
            C && v(t, !0), (h.value || !C) && m(w);
          },
          y = function y(w) {
            if (p.disabled === !0 || !be) return;
            var C = g.value && be;
            C && v(t, !1), (h.value || !C) && S(w);
          },
          V = function V(w) {
            Je(w) && (p.disabled && w ? g.value && v(t, !1) : l.value !== w && (w ? m() : S()));
          },
          E = function E() {
            l.value ? y() : k();
          };
        return K(function () {
          return p[e];
        }, V), c && b.appContext.config.globalProperties.$route !== void 0 && K(function () {
          return _objectSpread({}, b.proxy.$route);
        }, function () {
          c.value && l.value && y();
        }), pe(function () {
          V(p[e]);
        }), {
          hide: y,
          show: k,
          toggle: E,
          hasUpdateHandler: g
        };
      },
      useModelToggleProps: r,
      useModelToggleEmits: n
    };
  };
yn("modelValue");
var le = "top",
  ge = "bottom",
  he = "right",
  ie = "left",
  _t = "auto",
  ut = [le, ge, he, ie],
  xe = "start",
  at = "end",
  hs = "clippingParents",
  wn = "viewport",
  _e = "popper",
  bs = "reference",
  zo = ut.reduce(function (e, t) {
    return e.concat([t + "-" + xe, t + "-" + at]);
  }, []),
  $t = [].concat(ut, [_t]).reduce(function (e, t) {
    return e.concat([t, t + "-" + xe, t + "-" + at]);
  }, []),
  Cs = "beforeRead",
  ys = "read",
  ws = "afterRead",
  Es = "beforeMain",
  Ss = "main",
  ks = "afterMain",
  Hs = "beforeWrite",
  Vs = "write",
  Is = "afterWrite",
  Ts = [Cs, ys, ws, Es, Ss, ks, Hs, Vs, Is];
function ke(e) {
  return e ? (e.nodeName || "").toLowerCase() : null;
}
function Ce(e) {
  if (e == null) return window;
  if (e.toString() !== "[object Window]") {
    var t = e.ownerDocument;
    return t && t.defaultView || window;
  }
  return e;
}
function Fe(e) {
  var t = Ce(e).Element;
  return e instanceof t || e instanceof Element;
}
function me(e) {
  var t = Ce(e).HTMLElement;
  return e instanceof t || e instanceof HTMLElement;
}
function eo(e) {
  if ((typeof ShadowRoot === "undefined" ? "undefined" : _typeof(ShadowRoot)) > "u") return !1;
  var t = Ce(e).ShadowRoot;
  return e instanceof t || e instanceof ShadowRoot;
}
function Ms(e) {
  var t = e.state;
  Object.keys(t.elements).forEach(function (o) {
    var n = t.styles[o] || {},
      r = t.attributes[o] || {},
      s = t.elements[o];
    !me(s) || !ke(s) || (Object.assign(s.style, n), Object.keys(r).forEach(function (l) {
      var i = r[l];
      i === !1 ? s.removeAttribute(l) : s.setAttribute(l, i === !0 ? "" : i);
    }));
  });
}
function Os(e) {
  var t = e.state,
    o = {
      popper: {
        position: t.options.strategy,
        left: "0",
        top: "0",
        margin: "0"
      },
      arrow: {
        position: "absolute"
      },
      reference: {}
    };
  return Object.assign(t.elements.popper.style, o.popper), t.styles = o, t.elements.arrow && Object.assign(t.elements.arrow.style, o.arrow), function () {
    Object.keys(t.elements).forEach(function (n) {
      var r = t.elements[n],
        s = t.attributes[n] || {},
        l = Object.keys(t.styles.hasOwnProperty(n) ? t.styles[n] : o[n]),
        i = l.reduce(function (c, u) {
          return c[u] = "", c;
        }, {});
      !me(r) || !ke(r) || (Object.assign(r.style, i), Object.keys(s).forEach(function (c) {
        r.removeAttribute(c);
      }));
    });
  };
}
var En = {
  name: "applyStyles",
  enabled: !0,
  phase: "write",
  fn: Ms,
  effect: Os,
  requires: ["computeStyles"]
};
function Ee(e) {
  return e.split("-")[0];
}
var Ae = Math.max,
  Mt = Math.min,
  Ke = Math.round;
function Ue(e, t) {
  t === void 0 && (t = !1);
  var o = e.getBoundingClientRect(),
    n = 1,
    r = 1;
  if (me(e) && t) {
    var s = e.offsetHeight,
      l = e.offsetWidth;
    l > 0 && (n = Ke(o.width) / l || 1), s > 0 && (r = Ke(o.height) / s || 1);
  }
  return {
    width: o.width / n,
    height: o.height / r,
    top: o.top / r,
    right: o.right / n,
    bottom: o.bottom / r,
    left: o.left / n,
    x: o.left / n,
    y: o.top / r
  };
}
function to(e) {
  var t = Ue(e),
    o = e.offsetWidth,
    n = e.offsetHeight;
  return Math.abs(t.width - o) <= 1 && (o = t.width), Math.abs(t.height - n) <= 1 && (n = t.height), {
    x: e.offsetLeft,
    y: e.offsetTop,
    width: o,
    height: n
  };
}
function Sn(e, t) {
  var o = t.getRootNode && t.getRootNode();
  if (e.contains(t)) return !0;
  if (o && eo(o)) {
    var n = t;
    do {
      if (n && e.isSameNode(n)) return !0;
      n = n.parentNode || n.host;
    } while (n);
  }
  return !1;
}
function Te(e) {
  return Ce(e).getComputedStyle(e);
}
function Js(e) {
  return ["table", "td", "th"].indexOf(ke(e)) >= 0;
}
function Le(e) {
  return ((Fe(e) ? e.ownerDocument : e.document) || window.document).documentElement;
}
function Jt(e) {
  return ke(e) === "html" ? e : e.assignedSlot || e.parentNode || (eo(e) ? e.host : null) || Le(e);
}
function No(e) {
  return !me(e) || Te(e).position === "fixed" ? null : e.offsetParent;
}
function Ps(e) {
  var t = navigator.userAgent.toLowerCase().indexOf("firefox") !== -1,
    o = navigator.userAgent.indexOf("Trident") !== -1;
  if (o && me(e)) {
    var n = Te(e);
    if (n.position === "fixed") return null;
  }
  var r = Jt(e);
  for (eo(r) && (r = r.host); me(r) && ["html", "body"].indexOf(ke(r)) < 0;) {
    var s = Te(r);
    if (s.transform !== "none" || s.perspective !== "none" || s.contain === "paint" || ["transform", "perspective"].indexOf(s.willChange) !== -1 || t && s.willChange === "filter" || t && s.filter && s.filter !== "none") return r;
    r = r.parentNode;
  }
  return null;
}
function dt(e) {
  for (var t = Ce(e), o = No(e); o && Js(o) && Te(o).position === "static";) o = No(o);
  return o && (ke(o) === "html" || ke(o) === "body" && Te(o).position === "static") ? t : o || Ps(e) || t;
}
function oo(e) {
  return ["top", "bottom"].indexOf(e) >= 0 ? "x" : "y";
}
function et(e, t, o) {
  return Ae(e, Mt(t, o));
}
function Ls(e, t, o) {
  var n = et(e, t, o);
  return n > o ? o : n;
}
function kn() {
  return {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  };
}
function Hn(e) {
  return Object.assign({}, kn(), e);
}
function Vn(e, t) {
  return t.reduce(function (o, n) {
    return o[n] = e, o;
  }, {});
}
var Zs = function Zs(e, t) {
  return e = typeof e == "function" ? e(Object.assign({}, t.rects, {
    placement: t.placement
  })) : e, Hn(typeof e != "number" ? e : Vn(e, ut));
};
function Rs(e) {
  var t,
    o = e.state,
    n = e.name,
    r = e.options,
    s = o.elements.arrow,
    l = o.modifiersData.popperOffsets,
    i = Ee(o.placement),
    c = oo(i),
    u = [ie, he].indexOf(i) >= 0,
    f = u ? "height" : "width";
  if (!(!s || !l)) {
    var d = Zs(r.padding, o),
      b = to(s),
      v = c === "y" ? le : ie,
      p = c === "y" ? ge : he,
      g = o.rects.reference[f] + o.rects.reference[c] - l[c] - o.rects.popper[f],
      h = l[c] - o.rects.reference[c],
      m = dt(s),
      S = m ? c === "y" ? m.clientHeight || 0 : m.clientWidth || 0 : 0,
      k = g / 2 - h / 2,
      y = d[v],
      V = S - b[f] - d[p],
      E = S / 2 - b[f] / 2 + k,
      w = et(y, E, V),
      C = c;
    o.modifiersData[n] = (t = {}, t[C] = w, t.centerOffset = w - E, t);
  }
}
function zs(e) {
  var t = e.state,
    o = e.options,
    n = o.element,
    r = n === void 0 ? "[data-popper-arrow]" : n;
  r != null && (typeof r == "string" && (r = t.elements.popper.querySelector(r), !r) || !Sn(t.elements.popper, r) || (t.elements.arrow = r));
}
var Ns = {
  name: "arrow",
  enabled: !0,
  phase: "main",
  fn: Rs,
  effect: zs,
  requires: ["popperOffsets"],
  requiresIfExists: ["preventOverflow"]
};
function Ge(e) {
  return e.split("-")[1];
}
var As = {
  top: "auto",
  right: "auto",
  bottom: "auto",
  left: "auto"
};
function Bs(e) {
  var t = e.x,
    o = e.y,
    n = window,
    r = n.devicePixelRatio || 1;
  return {
    x: Ke(t * r) / r || 0,
    y: Ke(o * r) / r || 0
  };
}
function Ao(e) {
  var t,
    o = e.popper,
    n = e.popperRect,
    r = e.placement,
    s = e.variation,
    l = e.offsets,
    i = e.position,
    c = e.gpuAcceleration,
    u = e.adaptive,
    f = e.roundOffsets,
    d = e.isFixed,
    b = l.x,
    v = b === void 0 ? 0 : b,
    p = l.y,
    g = p === void 0 ? 0 : p,
    h = typeof f == "function" ? f({
      x: v,
      y: g
    }) : {
      x: v,
      y: g
    };
  v = h.x, g = h.y;
  var m = l.hasOwnProperty("x"),
    S = l.hasOwnProperty("y"),
    k = ie,
    y = le,
    V = window;
  if (u) {
    var E = dt(o),
      w = "clientHeight",
      C = "clientWidth";
    if (E === Ce(o) && (E = Le(o), Te(E).position !== "static" && i === "absolute" && (w = "scrollHeight", C = "scrollWidth")), E = E, r === le || (r === ie || r === he) && s === at) {
      y = ge;
      var I = d && E === V && V.visualViewport ? V.visualViewport.height : E[w];
      g -= I - n.height, g *= c ? 1 : -1;
    }
    if (r === ie || (r === le || r === ge) && s === at) {
      k = he;
      var T = d && E === V && V.visualViewport ? V.visualViewport.width : E[C];
      v -= T - n.width, v *= c ? 1 : -1;
    }
  }
  var N = Object.assign({
      position: i
    }, u && As),
    A = f === !0 ? Bs({
      x: v,
      y: g
    }) : {
      x: v,
      y: g
    };
  if (v = A.x, g = A.y, c) {
    var F;
    return Object.assign({}, N, (F = {}, F[y] = S ? "0" : "", F[k] = m ? "0" : "", F.transform = (V.devicePixelRatio || 1) <= 1 ? "translate(" + v + "px, " + g + "px)" : "translate3d(" + v + "px, " + g + "px, 0)", F));
  }
  return Object.assign({}, N, (t = {}, t[y] = S ? g + "px" : "", t[k] = m ? v + "px" : "", t.transform = "", t));
}
function Ds(e) {
  var t = e.state,
    o = e.options,
    n = o.gpuAcceleration,
    r = n === void 0 ? !0 : n,
    s = o.adaptive,
    l = s === void 0 ? !0 : s,
    i = o.roundOffsets,
    c = i === void 0 ? !0 : i,
    u = {
      placement: Ee(t.placement),
      variation: Ge(t.placement),
      popper: t.elements.popper,
      popperRect: t.rects.popper,
      gpuAcceleration: r,
      isFixed: t.options.strategy === "fixed"
    };
  t.modifiersData.popperOffsets != null && (t.styles.popper = Object.assign({}, t.styles.popper, Ao(Object.assign({}, u, {
    offsets: t.modifiersData.popperOffsets,
    position: t.options.strategy,
    adaptive: l,
    roundOffsets: c
  })))), t.modifiersData.arrow != null && (t.styles.arrow = Object.assign({}, t.styles.arrow, Ao(Object.assign({}, u, {
    offsets: t.modifiersData.arrow,
    position: "absolute",
    adaptive: !1,
    roundOffsets: c
  })))), t.attributes.popper = Object.assign({}, t.attributes.popper, {
    "data-popper-placement": t.placement
  });
}
var In = {
    name: "computeStyles",
    enabled: !0,
    phase: "beforeWrite",
    fn: Ds,
    data: {}
  },
  ht = {
    passive: !0
  };
function js(e) {
  var t = e.state,
    o = e.instance,
    n = e.options,
    r = n.scroll,
    s = r === void 0 ? !0 : r,
    l = n.resize,
    i = l === void 0 ? !0 : l,
    c = Ce(t.elements.popper),
    u = [].concat(t.scrollParents.reference, t.scrollParents.popper);
  return s && u.forEach(function (f) {
    f.addEventListener("scroll", o.update, ht);
  }), i && c.addEventListener("resize", o.update, ht), function () {
    s && u.forEach(function (f) {
      f.removeEventListener("scroll", o.update, ht);
    }), i && c.removeEventListener("resize", o.update, ht);
  };
}
var Tn = {
    name: "eventListeners",
    enabled: !0,
    phase: "write",
    fn: function fn() {},
    effect: js,
    data: {}
  },
  Qs = {
    left: "right",
    right: "left",
    bottom: "top",
    top: "bottom"
  };
function kt(e) {
  return e.replace(/left|right|bottom|top/g, function (t) {
    return Qs[t];
  });
}
var qs = {
  start: "end",
  end: "start"
};
function Bo(e) {
  return e.replace(/start|end/g, function (t) {
    return qs[t];
  });
}
function no(e) {
  var t = Ce(e),
    o = t.pageXOffset,
    n = t.pageYOffset;
  return {
    scrollLeft: o,
    scrollTop: n
  };
}
function ro(e) {
  return Ue(Le(e)).left + no(e).scrollLeft;
}
function Ys(e) {
  var t = Ce(e),
    o = Le(e),
    n = t.visualViewport,
    r = o.clientWidth,
    s = o.clientHeight,
    l = 0,
    i = 0;
  return n && (r = n.width, s = n.height, /^((?!chrome|android).)*safari/i.test(navigator.userAgent) || (l = n.offsetLeft, i = n.offsetTop)), {
    width: r,
    height: s,
    x: l + ro(e),
    y: i
  };
}
function xs(e) {
  var t,
    o = Le(e),
    n = no(e),
    r = (t = e.ownerDocument) == null ? void 0 : t.body,
    s = Ae(o.scrollWidth, o.clientWidth, r ? r.scrollWidth : 0, r ? r.clientWidth : 0),
    l = Ae(o.scrollHeight, o.clientHeight, r ? r.scrollHeight : 0, r ? r.clientHeight : 0),
    i = -n.scrollLeft + ro(e),
    c = -n.scrollTop;
  return Te(r || o).direction === "rtl" && (i += Ae(o.clientWidth, r ? r.clientWidth : 0) - s), {
    width: s,
    height: l,
    x: i,
    y: c
  };
}
function so(e) {
  var t = Te(e),
    o = t.overflow,
    n = t.overflowX,
    r = t.overflowY;
  return /auto|scroll|overlay|hidden/.test(o + r + n);
}
function Mn(e) {
  return ["html", "body", "#document"].indexOf(ke(e)) >= 0 ? e.ownerDocument.body : me(e) && so(e) ? e : Mn(Jt(e));
}
function tt(e, t) {
  var o;
  t === void 0 && (t = []);
  var n = Mn(e),
    r = n === ((o = e.ownerDocument) == null ? void 0 : o.body),
    s = Ce(n),
    l = r ? [s].concat(s.visualViewport || [], so(n) ? n : []) : n,
    i = t.concat(l);
  return r ? i : i.concat(tt(Jt(l)));
}
function qt(e) {
  return Object.assign({}, e, {
    left: e.x,
    top: e.y,
    right: e.x + e.width,
    bottom: e.y + e.height
  });
}
function Fs(e) {
  var t = Ue(e);
  return t.top = t.top + e.clientTop, t.left = t.left + e.clientLeft, t.bottom = t.top + e.clientHeight, t.right = t.left + e.clientWidth, t.width = e.clientWidth, t.height = e.clientHeight, t.x = t.left, t.y = t.top, t;
}
function Do(e, t) {
  return t === wn ? qt(Ys(e)) : Fe(t) ? Fs(t) : qt(xs(Le(e)));
}
function Ks(e) {
  var t = tt(Jt(e)),
    o = ["absolute", "fixed"].indexOf(Te(e).position) >= 0,
    n = o && me(e) ? dt(e) : e;
  return Fe(n) ? t.filter(function (r) {
    return Fe(r) && Sn(r, n) && ke(r) !== "body";
  }) : [];
}
function Us(e, t, o) {
  var n = t === "clippingParents" ? Ks(e) : [].concat(t),
    r = [].concat(n, [o]),
    s = r[0],
    l = r.reduce(function (i, c) {
      var u = Do(e, c);
      return i.top = Ae(u.top, i.top), i.right = Mt(u.right, i.right), i.bottom = Mt(u.bottom, i.bottom), i.left = Ae(u.left, i.left), i;
    }, Do(e, s));
  return l.width = l.right - l.left, l.height = l.bottom - l.top, l.x = l.left, l.y = l.top, l;
}
function On(e) {
  var t = e.reference,
    o = e.element,
    n = e.placement,
    r = n ? Ee(n) : null,
    s = n ? Ge(n) : null,
    l = t.x + t.width / 2 - o.width / 2,
    i = t.y + t.height / 2 - o.height / 2,
    c;
  switch (r) {
    case le:
      c = {
        x: l,
        y: t.y - o.height
      };
      break;
    case ge:
      c = {
        x: l,
        y: t.y + t.height
      };
      break;
    case he:
      c = {
        x: t.x + t.width,
        y: i
      };
      break;
    case ie:
      c = {
        x: t.x - o.width,
        y: i
      };
      break;
    default:
      c = {
        x: t.x,
        y: t.y
      };
  }
  var u = r ? oo(r) : null;
  if (u != null) {
    var f = u === "y" ? "height" : "width";
    switch (s) {
      case xe:
        c[u] = c[u] - (t[f] / 2 - o[f] / 2);
        break;
      case at:
        c[u] = c[u] + (t[f] / 2 - o[f] / 2);
        break;
    }
  }
  return c;
}
function lt(e, t) {
  t === void 0 && (t = {});
  var o = t,
    n = o.placement,
    r = n === void 0 ? e.placement : n,
    s = o.boundary,
    l = s === void 0 ? hs : s,
    i = o.rootBoundary,
    c = i === void 0 ? wn : i,
    u = o.elementContext,
    f = u === void 0 ? _e : u,
    d = o.altBoundary,
    b = d === void 0 ? !1 : d,
    v = o.padding,
    p = v === void 0 ? 0 : v,
    g = Hn(typeof p != "number" ? p : Vn(p, ut)),
    h = f === _e ? bs : _e,
    m = e.rects.popper,
    S = e.elements[b ? h : f],
    k = Us(Fe(S) ? S : S.contextElement || Le(e.elements.popper), l, c),
    y = Ue(e.elements.reference),
    V = On({
      reference: y,
      element: m,
      strategy: "absolute",
      placement: r
    }),
    E = qt(Object.assign({}, m, V)),
    w = f === _e ? E : y,
    C = {
      top: k.top - w.top + g.top,
      bottom: w.bottom - k.bottom + g.bottom,
      left: k.left - w.left + g.left,
      right: w.right - k.right + g.right
    },
    I = e.modifiersData.offset;
  if (f === _e && I) {
    var T = I[r];
    Object.keys(C).forEach(function (N) {
      var A = [he, ge].indexOf(N) >= 0 ? 1 : -1,
        F = [le, ge].indexOf(N) >= 0 ? "y" : "x";
      C[N] += T[F] * A;
    });
  }
  return C;
}
function Gs(e, t) {
  t === void 0 && (t = {});
  var o = t,
    n = o.placement,
    r = o.boundary,
    s = o.rootBoundary,
    l = o.padding,
    i = o.flipVariations,
    c = o.allowedAutoPlacements,
    u = c === void 0 ? $t : c,
    f = Ge(n),
    d = f ? i ? zo : zo.filter(function (p) {
      return Ge(p) === f;
    }) : ut,
    b = d.filter(function (p) {
      return u.indexOf(p) >= 0;
    });
  b.length === 0 && (b = d);
  var v = b.reduce(function (p, g) {
    return p[g] = lt(e, {
      placement: g,
      boundary: r,
      rootBoundary: s,
      padding: l
    })[Ee(g)], p;
  }, {});
  return Object.keys(v).sort(function (p, g) {
    return v[p] - v[g];
  });
}
function Xs(e) {
  if (Ee(e) === _t) return [];
  var t = kt(e);
  return [Bo(e), t, Bo(t)];
}
function Ws(e) {
  var t = e.state,
    o = e.options,
    n = e.name;
  if (!t.modifiersData[n]._skip) {
    for (var r = o.mainAxis, s = r === void 0 ? !0 : r, l = o.altAxis, i = l === void 0 ? !0 : l, c = o.fallbackPlacements, u = o.padding, f = o.boundary, d = o.rootBoundary, b = o.altBoundary, v = o.flipVariations, p = v === void 0 ? !0 : v, g = o.allowedAutoPlacements, h = t.options.placement, m = Ee(h), S = m === h, k = c || (S || !p ? [kt(h)] : Xs(h)), y = [h].concat(k).reduce(function (Ze, Ie) {
        return Ze.concat(Ee(Ie) === _t ? Gs(t, {
          placement: Ie,
          boundary: f,
          rootBoundary: d,
          padding: u,
          flipVariations: p,
          allowedAutoPlacements: g
        }) : Ie);
      }, []), V = t.rects.reference, E = t.rects.popper, w = new Map(), C = !0, I = y[0], T = 0; T < y.length; T++) {
      var N = y[T],
        A = Ee(N),
        F = Ge(N) === xe,
        Q = [le, ge].indexOf(A) >= 0,
        G = Q ? "width" : "height",
        L = lt(t, {
          placement: N,
          boundary: f,
          rootBoundary: d,
          altBoundary: b,
          padding: u
        }),
        M = Q ? F ? he : ie : F ? ge : le;
      V[G] > E[G] && (M = kt(M));
      var ee = kt(M),
        ae = [];
      if (s && ae.push(L[A] <= 0), i && ae.push(L[M] <= 0, L[ee] <= 0), ae.every(function (Ze) {
        return Ze;
      })) {
        I = N, C = !1;
        break;
      }
      w.set(N, ae);
    }
    if (C) for (var Ve = p ? 3 : 1, q = function q(Ze) {
        var Ie = y.find(function (vt) {
          var We = w.get(vt);
          if (We) return We.slice(0, Ze).every(function (De) {
            return De;
          });
        });
        if (Ie) return I = Ie, "break";
      }, Me = Ve; Me > 0; Me--) {
      var ft = q(Me);
      if (ft === "break") break;
    }
    t.placement !== I && (t.modifiersData[n]._skip = !0, t.placement = I, t.reset = !0);
  }
}
var _s = {
  name: "flip",
  enabled: !0,
  phase: "main",
  fn: Ws,
  requiresIfExists: ["offset"],
  data: {
    _skip: !1
  }
};
function jo(e, t, o) {
  return o === void 0 && (o = {
    x: 0,
    y: 0
  }), {
    top: e.top - t.height - o.y,
    right: e.right - t.width + o.x,
    bottom: e.bottom - t.height + o.y,
    left: e.left - t.width - o.x
  };
}
function Qo(e) {
  return [le, he, ge, ie].some(function (t) {
    return e[t] >= 0;
  });
}
function $s(e) {
  var t = e.state,
    o = e.name,
    n = t.rects.reference,
    r = t.rects.popper,
    s = t.modifiersData.preventOverflow,
    l = lt(t, {
      elementContext: "reference"
    }),
    i = lt(t, {
      altBoundary: !0
    }),
    c = jo(l, n),
    u = jo(i, r, s),
    f = Qo(c),
    d = Qo(u);
  t.modifiersData[o] = {
    referenceClippingOffsets: c,
    popperEscapeOffsets: u,
    isReferenceHidden: f,
    hasPopperEscaped: d
  }, t.attributes.popper = Object.assign({}, t.attributes.popper, {
    "data-popper-reference-hidden": f,
    "data-popper-escaped": d
  });
}
var ea = {
  name: "hide",
  enabled: !0,
  phase: "main",
  requiresIfExists: ["preventOverflow"],
  fn: $s
};
function ta(e, t, o) {
  var n = Ee(e),
    r = [ie, le].indexOf(n) >= 0 ? -1 : 1,
    s = typeof o == "function" ? o(Object.assign({}, t, {
      placement: e
    })) : o,
    l = s[0],
    i = s[1];
  return l = l || 0, i = (i || 0) * r, [ie, he].indexOf(n) >= 0 ? {
    x: i,
    y: l
  } : {
    x: l,
    y: i
  };
}
function oa(e) {
  var t = e.state,
    o = e.options,
    n = e.name,
    r = o.offset,
    s = r === void 0 ? [0, 0] : r,
    l = $t.reduce(function (f, d) {
      return f[d] = ta(d, t.rects, s), f;
    }, {}),
    i = l[t.placement],
    c = i.x,
    u = i.y;
  t.modifiersData.popperOffsets != null && (t.modifiersData.popperOffsets.x += c, t.modifiersData.popperOffsets.y += u), t.modifiersData[n] = l;
}
var na = {
  name: "offset",
  enabled: !0,
  phase: "main",
  requires: ["popperOffsets"],
  fn: oa
};
function ra(e) {
  var t = e.state,
    o = e.name;
  t.modifiersData[o] = On({
    reference: t.rects.reference,
    element: t.rects.popper,
    strategy: "absolute",
    placement: t.placement
  });
}
var Jn = {
  name: "popperOffsets",
  enabled: !0,
  phase: "read",
  fn: ra,
  data: {}
};
function sa(e) {
  return e === "x" ? "y" : "x";
}
function aa(e) {
  var t = e.state,
    o = e.options,
    n = e.name,
    r = o.mainAxis,
    s = r === void 0 ? !0 : r,
    l = o.altAxis,
    i = l === void 0 ? !1 : l,
    c = o.boundary,
    u = o.rootBoundary,
    f = o.altBoundary,
    d = o.padding,
    b = o.tether,
    v = b === void 0 ? !0 : b,
    p = o.tetherOffset,
    g = p === void 0 ? 0 : p,
    h = lt(t, {
      boundary: c,
      rootBoundary: u,
      padding: d,
      altBoundary: f
    }),
    m = Ee(t.placement),
    S = Ge(t.placement),
    k = !S,
    y = oo(m),
    V = sa(y),
    E = t.modifiersData.popperOffsets,
    w = t.rects.reference,
    C = t.rects.popper,
    I = typeof g == "function" ? g(Object.assign({}, t.rects, {
      placement: t.placement
    })) : g,
    T = typeof I == "number" ? {
      mainAxis: I,
      altAxis: I
    } : Object.assign({
      mainAxis: 0,
      altAxis: 0
    }, I),
    N = t.modifiersData.offset ? t.modifiersData.offset[t.placement] : null,
    A = {
      x: 0,
      y: 0
    };
  if (E) {
    if (s) {
      var F,
        Q = y === "y" ? le : ie,
        G = y === "y" ? ge : he,
        L = y === "y" ? "height" : "width",
        M = E[y],
        ee = M + h[Q],
        ae = M - h[G],
        Ve = v ? -C[L] / 2 : 0,
        q = S === xe ? w[L] : C[L],
        Me = S === xe ? -C[L] : -w[L],
        ft = t.elements.arrow,
        Ze = v && ft ? to(ft) : {
          width: 0,
          height: 0
        },
        Ie = t.modifiersData["arrow#persistent"] ? t.modifiersData["arrow#persistent"].padding : kn(),
        vt = Ie[Q],
        We = Ie[G],
        De = et(0, w[L], Ze[L]),
        ar = k ? w[L] / 2 - Ve - De - vt - T.mainAxis : q - De - vt - T.mainAxis,
        lr = k ? -w[L] / 2 + Ve + De + We + T.mainAxis : Me + De + We + T.mainAxis,
        Zt = t.elements.arrow && dt(t.elements.arrow),
        ir = Zt ? y === "y" ? Zt.clientTop || 0 : Zt.clientLeft || 0 : 0,
        Co = (F = N == null ? void 0 : N[y]) != null ? F : 0,
        cr = M + ar - Co - ir,
        ur = M + lr - Co,
        yo = et(v ? Mt(ee, cr) : ee, M, v ? Ae(ae, ur) : ae);
      E[y] = yo, A[y] = yo - M;
    }
    if (i) {
      var wo,
        dr = y === "x" ? le : ie,
        pr = y === "x" ? ge : he,
        Re = E[V],
        mt = V === "y" ? "height" : "width",
        Eo = Re + h[dr],
        So = Re - h[pr],
        Rt = [le, ie].indexOf(m) !== -1,
        ko = (wo = N == null ? void 0 : N[V]) != null ? wo : 0,
        Ho = Rt ? Eo : Re - w[mt] - C[mt] - ko + T.altAxis,
        Vo = Rt ? Re + w[mt] + C[mt] - ko - T.altAxis : So,
        Io = v && Rt ? Ls(Ho, Re, Vo) : et(v ? Ho : Eo, Re, v ? Vo : So);
      E[V] = Io, A[V] = Io - Re;
    }
    t.modifiersData[n] = A;
  }
}
var la = {
  name: "preventOverflow",
  enabled: !0,
  phase: "main",
  fn: aa,
  requiresIfExists: ["offset"]
};
function ia(e) {
  return {
    scrollLeft: e.scrollLeft,
    scrollTop: e.scrollTop
  };
}
function ca(e) {
  return e === Ce(e) || !me(e) ? no(e) : ia(e);
}
function ua(e) {
  var t = e.getBoundingClientRect(),
    o = Ke(t.width) / e.offsetWidth || 1,
    n = Ke(t.height) / e.offsetHeight || 1;
  return o !== 1 || n !== 1;
}
function da(e, t, o) {
  o === void 0 && (o = !1);
  var n = me(t),
    r = me(t) && ua(t),
    s = Le(t),
    l = Ue(e, r),
    i = {
      scrollLeft: 0,
      scrollTop: 0
    },
    c = {
      x: 0,
      y: 0
    };
  return (n || !n && !o) && ((ke(t) !== "body" || so(s)) && (i = ca(t)), me(t) ? (c = Ue(t, !0), c.x += t.clientLeft, c.y += t.clientTop) : s && (c.x = ro(s))), {
    x: l.left + i.scrollLeft - c.x,
    y: l.top + i.scrollTop - c.y,
    width: l.width,
    height: l.height
  };
}
function pa(e) {
  var t = new Map(),
    o = new Set(),
    n = [];
  e.forEach(function (s) {
    t.set(s.name, s);
  });
  function r(s) {
    o.add(s.name);
    var l = [].concat(s.requires || [], s.requiresIfExists || []);
    l.forEach(function (i) {
      if (!o.has(i)) {
        var c = t.get(i);
        c && r(c);
      }
    }), n.push(s);
  }
  return e.forEach(function (s) {
    o.has(s.name) || r(s);
  }), n;
}
function fa(e) {
  var t = pa(e);
  return Ts.reduce(function (o, n) {
    return o.concat(t.filter(function (r) {
      return r.phase === n;
    }));
  }, []);
}
function va(e) {
  var t;
  return function () {
    return t || (t = new Promise(function (o) {
      Promise.resolve().then(function () {
        t = void 0, o(e());
      });
    })), t;
  };
}
function ma(e) {
  var t = e.reduce(function (o, n) {
    var r = o[n.name];
    return o[n.name] = r ? Object.assign({}, r, n, {
      options: Object.assign({}, r.options, n.options),
      data: Object.assign({}, r.data, n.data)
    }) : n, o;
  }, {});
  return Object.keys(t).map(function (o) {
    return t[o];
  });
}
var qo = {
  placement: "bottom",
  modifiers: [],
  strategy: "absolute"
};
function Yo() {
  for (var e = arguments.length, t = new Array(e), o = 0; o < e; o++) t[o] = arguments[o];
  return !t.some(function (n) {
    return !(n && typeof n.getBoundingClientRect == "function");
  });
}
function ao(e) {
  e === void 0 && (e = {});
  var t = e,
    o = t.defaultModifiers,
    n = o === void 0 ? [] : o,
    r = t.defaultOptions,
    s = r === void 0 ? qo : r;
  return function (l, i, c) {
    c === void 0 && (c = s);
    var u = {
        placement: "bottom",
        orderedModifiers: [],
        options: Object.assign({}, qo, s),
        modifiersData: {},
        elements: {
          reference: l,
          popper: i
        },
        attributes: {},
        styles: {}
      },
      f = [],
      d = !1,
      b = {
        state: u,
        setOptions: function setOptions(g) {
          var h = typeof g == "function" ? g(u.options) : g;
          p(), u.options = Object.assign({}, s, u.options, h), u.scrollParents = {
            reference: Fe(l) ? tt(l) : l.contextElement ? tt(l.contextElement) : [],
            popper: tt(i)
          };
          var m = fa(ma([].concat(n, u.options.modifiers)));
          return u.orderedModifiers = m.filter(function (S) {
            return S.enabled;
          }), v(), b.update();
        },
        forceUpdate: function forceUpdate() {
          if (!d) {
            var g = u.elements,
              h = g.reference,
              m = g.popper;
            if (Yo(h, m)) {
              u.rects = {
                reference: da(h, dt(m), u.options.strategy === "fixed"),
                popper: to(m)
              }, u.reset = !1, u.placement = u.options.placement, u.orderedModifiers.forEach(function (C) {
                return u.modifiersData[C.name] = Object.assign({}, C.data);
              });
              for (var S = 0; S < u.orderedModifiers.length; S++) {
                if (u.reset === !0) {
                  u.reset = !1, S = -1;
                  continue;
                }
                var k = u.orderedModifiers[S],
                  y = k.fn,
                  V = k.options,
                  E = V === void 0 ? {} : V,
                  w = k.name;
                typeof y == "function" && (u = y({
                  state: u,
                  options: E,
                  name: w,
                  instance: b
                }) || u);
              }
            }
          }
        },
        update: va(function () {
          return new Promise(function (g) {
            b.forceUpdate(), g(u);
          });
        }),
        destroy: function destroy() {
          p(), d = !0;
        }
      };
    if (!Yo(l, i)) return b;
    b.setOptions(c).then(function (g) {
      !d && c.onFirstUpdate && c.onFirstUpdate(g);
    });
    function v() {
      u.orderedModifiers.forEach(function (g) {
        var h = g.name,
          m = g.options,
          S = m === void 0 ? {} : m,
          k = g.effect;
        if (typeof k == "function") {
          var y = k({
              state: u,
              name: h,
              instance: b,
              options: S
            }),
            V = function V() {};
          f.push(y || V);
        }
      });
    }
    function p() {
      f.forEach(function (g) {
        return g();
      }), f = [];
    }
    return b;
  };
}
ao();
var ga = [Tn, Jn, In, En];
ao({
  defaultModifiers: ga
});
var ha = [Tn, Jn, In, En, na, _s, la, Ns, ea],
  ba = ao({
    defaultModifiers: ha
  });
var Ca = function Ca(e, t) {
  var o = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var n = {
      name: "updateState",
      enabled: !0,
      phase: "write",
      fn: function fn(_ref3) {
        var c = _ref3.state;
        var u = ya(c);
        Object.assign(l.value, u);
      },
      requires: ["computeStyles"]
    },
    r = H(function () {
      var _a2 = a(o),
        c = _a2.onFirstUpdate,
        u = _a2.placement,
        f = _a2.strategy,
        d = _a2.modifiers;
      return {
        onFirstUpdate: c,
        placement: u || "bottom",
        strategy: f || "absolute",
        modifiers: [].concat(_toConsumableArray(d || []), [n, {
          name: "applyStyles",
          enabled: !1
        }])
      };
    }),
    s = gr(),
    l = J({
      styles: {
        popper: {
          position: a(r).strategy,
          left: "0",
          top: "0"
        },
        arrow: {
          position: "absolute"
        }
      },
      attributes: {}
    }),
    i = function i() {
      s.value && (s.value.destroy(), s.value = void 0);
    };
  return K(r, function (c) {
    var u = a(s);
    u && u.setOptions(c);
  }, {
    deep: !0
  }), K([e, t], function (_ref4) {
    var _ref5 = _slicedToArray(_ref4, 2),
      c = _ref5[0],
      u = _ref5[1];
    i(), !(!c || !u) && (s.value = ba(c, u, a(r)));
  }), fe(function () {
    i();
  }), {
    state: H(function () {
      var c;
      return _objectSpread({}, ((c = a(s)) == null ? void 0 : c.state) || {});
    }),
    styles: H(function () {
      return a(l).styles;
    }),
    attributes: H(function () {
      return a(l).attributes;
    }),
    update: function update() {
      var c;
      return (c = a(s)) == null ? void 0 : c.update();
    },
    forceUpdate: function forceUpdate() {
      var c;
      return (c = a(s)) == null ? void 0 : c.forceUpdate();
    },
    instanceRef: H(function () {
      return a(s);
    })
  };
};
function ya(e) {
  var t = Object.keys(e.elements),
    o = Oo(t.map(function (r) {
      return [r, e.styles[r] || {}];
    })),
    n = Oo(t.map(function (r) {
      return [r, e.attributes[r]];
    }));
  return {
    styles: o,
    attributes: n
  };
}
var Pn = function Pn(e) {
  if (!e) return {
    onClick: Ye,
    onMousedown: Ye,
    onMouseup: Ye
  };
  var t = !1,
    o = !1;
  return {
    onClick: function onClick(l) {
      t && o && e(l), t = o = !1;
    },
    onMousedown: function onMousedown(l) {
      t = l.target === l.currentTarget;
    },
    onMouseup: function onMouseup(l) {
      o = l.target === l.currentTarget;
    }
  };
};
function xo() {
  var e;
  var t = function t(n, r) {
      o(), e = window.setTimeout(n, r);
    },
    o = function o() {
      return window.clearTimeout(e);
    };
  return Lr(function () {
    return o();
  }), {
    registerTimeout: t,
    cancelTimeout: o
  };
}
var Qe = [];
var Fo = function Fo(e) {
    var t = e;
    t.key === $.esc && Qe.forEach(function (o) {
      return o(t);
    });
  },
  wa = function wa(e) {
    pe(function () {
      Qe.length === 0 && document.addEventListener("keydown", Fo), be && Qe.push(e);
    }), fe(function () {
      Qe = Qe.filter(function (t) {
        return t !== e;
      }), Qe.length === 0 && be && document.removeEventListener("keydown", Fo);
    });
  };
var Ko;
var Ln = function Ln() {
    var e = Zr(),
      t = Rr(),
      o = H(function () {
        return "".concat(e.value, "-popper-container-").concat(t.prefix);
      }),
      n = H(function () {
        return "#".concat(o.value);
      });
    return {
      id: o,
      selector: n
    };
  },
  Ea = function Ea(e) {
    var t = document.createElement("div");
    return t.id = e, document.body.appendChild(t), t;
  },
  Sa = function Sa() {
    var _Ln = Ln(),
      e = _Ln.id,
      t = _Ln.selector;
    return cn(function () {
      be && !Ko && !document.body.querySelector(t.value) && (Ko = Ea(e.value));
    }), {
      id: e,
      selector: t
    };
  },
  ka = te({
    showAfter: {
      type: Number,
      default: 0
    },
    hideAfter: {
      type: Number,
      default: 200
    },
    autoClose: {
      type: Number,
      default: 0
    }
  }),
  Ha = function Ha(_ref6) {
    var e = _ref6.showAfter,
      t = _ref6.hideAfter,
      o = _ref6.autoClose,
      n = _ref6.open,
      r = _ref6.close;
    var _xo = xo(),
      s = _xo.registerTimeout,
      _xo2 = xo(),
      l = _xo2.registerTimeout,
      i = _xo2.cancelTimeout;
    return {
      onOpen: function onOpen(f) {
        s(function () {
          n(f);
          var d = a(o);
          we(d) && d > 0 && l(function () {
            r(f);
          }, d);
        }, a(e));
      },
      onClose: function onClose(f) {
        i(), s(function () {
          r(f);
        }, a(t));
      }
    };
  },
  Zn = Symbol("elForwardRef"),
  Va = function Va(e) {
    ce(Zn, {
      setForwardRef: function setForwardRef(o) {
        e.value = o;
      }
    });
  },
  Ia = function Ia(e) {
    return {
      mounted: function mounted(t) {
        e(t);
      },
      updated: function updated(t) {
        e(t);
      },
      unmounted: function unmounted() {
        e(null);
      }
    };
  },
  Uo = J(0),
  Ta = 2e3,
  Ma = Symbol("zIndexContextKey"),
  Rn = function Rn(e) {
    var t = e || W(Ma, void 0),
      o = H(function () {
        var s = a(t);
        return we(s) ? s : Ta;
      }),
      n = H(function () {
        return o.value + Uo.value;
      });
    return {
      initialZIndex: o,
      currentZIndex: n,
      nextZIndex: function nextZIndex() {
        return Uo.value++, n.value;
      }
    };
  },
  qe = 4,
  Oa = {
    vertical: {
      offset: "offsetHeight",
      scroll: "scrollTop",
      scrollSize: "scrollHeight",
      size: "height",
      key: "vertical",
      axis: "Y",
      client: "clientY",
      direction: "top"
    },
    horizontal: {
      offset: "offsetWidth",
      scroll: "scrollLeft",
      scrollSize: "scrollWidth",
      size: "width",
      key: "horizontal",
      axis: "X",
      client: "clientX",
      direction: "left"
    }
  },
  Ja = function Ja(_ref7) {
    var _ref8;
    var e = _ref7.move,
      t = _ref7.size,
      o = _ref7.bar;
    return _ref8 = {}, _defineProperty(_ref8, o.size, t), _defineProperty(_ref8, "transform", "translate".concat(o.axis, "(").concat(e, "%)")), _ref8;
  },
  zn = Symbol("scrollbarContextKey"),
  Pa = te({
    vertical: Boolean,
    size: String,
    move: Number,
    ratio: {
      type: Number,
      required: !0
    },
    always: Boolean
  }),
  La = "Thumb",
  Za = z({
    __name: "thumb",
    props: Pa,
    setup: function setup(e) {
      var t = e,
        o = W(zn),
        n = oe("scrollbar");
      o || Gt(La, "can not inject scrollbar context");
      var r = J(),
        s = J(),
        l = J({}),
        i = J(!1);
      var c = !1,
        u = !1,
        f = be ? document.onselectstart : null;
      var d = H(function () {
          return Oa[t.vertical ? "vertical" : "horizontal"];
        }),
        b = H(function () {
          return Ja({
            size: t.size,
            move: t.move,
            bar: d.value
          });
        }),
        v = H(function () {
          return Math.pow(r.value[d.value.offset], 2) / o.wrapElement[d.value.scrollSize] / t.ratio / s.value[d.value.offset];
        }),
        p = function p(E) {
          var w;
          if (E.stopPropagation(), E.ctrlKey || [1, 2].includes(E.button)) return;
          (w = window.getSelection()) == null || w.removeAllRanges(), h(E);
          var C = E.currentTarget;
          C && (l.value[d.value.axis] = C[d.value.offset] - (E[d.value.client] - C.getBoundingClientRect()[d.value.direction]));
        },
        g = function g(E) {
          if (!s.value || !r.value || !o.wrapElement) return;
          var w = Math.abs(E.target.getBoundingClientRect()[d.value.direction] - E[d.value.client]),
            C = s.value[d.value.offset] / 2,
            I = (w - C) * 100 * v.value / r.value[d.value.offset];
          o.wrapElement[d.value.scroll] = I * o.wrapElement[d.value.scrollSize] / 100;
        },
        h = function h(E) {
          E.stopImmediatePropagation(), c = !0, document.addEventListener("mousemove", m), document.addEventListener("mouseup", S), f = document.onselectstart, document.onselectstart = function () {
            return !1;
          };
        },
        m = function m(E) {
          if (!r.value || !s.value || c === !1) return;
          var w = l.value[d.value.axis];
          if (!w) return;
          var C = (r.value.getBoundingClientRect()[d.value.direction] - E[d.value.client]) * -1,
            I = s.value[d.value.offset] - w,
            T = (C - I) * 100 * v.value / r.value[d.value.offset];
          o.wrapElement[d.value.scroll] = T * o.wrapElement[d.value.scrollSize] / 100;
        },
        S = function S() {
          c = !1, l.value[d.value.axis] = 0, document.removeEventListener("mousemove", m), document.removeEventListener("mouseup", S), V(), u && (i.value = !1);
        },
        k = function k() {
          u = !1, i.value = !!t.size;
        },
        y = function y() {
          u = !0, i.value = c;
        };
      fe(function () {
        V(), document.removeEventListener("mouseup", S);
      });
      var V = function V() {
        document.onselectstart !== f && (document.onselectstart = f);
      };
      return Tt(de(o, "scrollbarElement"), "mousemove", k), Tt(de(o, "scrollbarElement"), "mouseleave", y), function (E, w) {
        return P(), U(Ft, {
          name: a(n).b("fade"),
          persisted: ""
        }, {
          default: Z(function () {
            return [Ot(O("div", {
              ref_key: "instance",
              ref: r,
              class: j([a(n).e("bar"), a(n).is(a(d).key)]),
              onMousedown: g
            }, [O("div", {
              ref_key: "thumb",
              ref: s,
              class: j(a(n).e("thumb")),
              style: ue(a(b)),
              onMousedown: p
            }, null, 38)], 34), [[xt, E.always || i.value]])];
          }),
          _: 1
        }, 8, ["name"]);
      };
    }
  });
var Go = x(Za, [["__file", "/home/runner/work/element-plus/element-plus/packages/components/scrollbar/src/thumb.vue"]]);
var Ra = te({
    always: {
      type: Boolean,
      default: !0
    },
    width: String,
    height: String,
    ratioX: {
      type: Number,
      default: 1
    },
    ratioY: {
      type: Number,
      default: 1
    }
  }),
  za = z({
    __name: "bar",
    props: Ra,
    setup: function setup(e, _ref9) {
      var t = _ref9.expose;
      var o = e,
        n = J(0),
        r = J(0);
      return t({
        handleScroll: function handleScroll(l) {
          if (l) {
            var i = l.offsetHeight - qe,
              c = l.offsetWidth - qe;
            r.value = l.scrollTop * 100 / i * o.ratioY, n.value = l.scrollLeft * 100 / c * o.ratioX;
          }
        }
      }), function (l, i) {
        return P(), Y(ot, null, [R(Go, {
          move: n.value,
          ratio: l.ratioX,
          size: l.width,
          always: l.always
        }, null, 8, ["move", "ratio", "size", "always"]), R(Go, {
          move: r.value,
          ratio: l.ratioY,
          size: l.height,
          vertical: "",
          always: l.always
        }, null, 8, ["move", "ratio", "size", "always"])], 64);
      };
    }
  });
var Na = x(za, [["__file", "/home/runner/work/element-plus/element-plus/packages/components/scrollbar/src/bar.vue"]]);
var Aa = te({
    height: {
      type: [String, Number],
      default: ""
    },
    maxHeight: {
      type: [String, Number],
      default: ""
    },
    native: {
      type: Boolean,
      default: !1
    },
    wrapStyle: {
      type: B([String, Object, Array]),
      default: ""
    },
    wrapClass: {
      type: [String, Array],
      default: ""
    },
    viewClass: {
      type: [String, Array],
      default: ""
    },
    viewStyle: {
      type: [String, Array, Object],
      default: ""
    },
    noresize: Boolean,
    tag: {
      type: String,
      default: "div"
    },
    always: Boolean,
    minSize: {
      type: Number,
      default: 20
    }
  }),
  Ba = {
    scroll: function scroll(_ref10) {
      var e = _ref10.scrollTop,
        t = _ref10.scrollLeft;
      return [e, t].every(we);
    }
  },
  Da = "ElScrollbar",
  ja = z({
    name: Da
  }),
  Qa = z(_objectSpread(_objectSpread({}, ja), {}, {
    props: Aa,
    emits: Ba,
    setup: function setup(e, _ref11) {
      var t = _ref11.expose,
        o = _ref11.emit;
      var n = e,
        r = oe("scrollbar");
      var s, l;
      var i = J(),
        c = J(),
        u = J(),
        f = J("0"),
        d = J("0"),
        b = J(),
        v = J(1),
        p = J(1),
        g = H(function () {
          var w = {};
          return n.height && (w.height = Pe(n.height)), n.maxHeight && (w.maxHeight = Pe(n.maxHeight)), [n.wrapStyle, w];
        }),
        h = H(function () {
          return [n.wrapClass, r.e("wrap"), _defineProperty({}, r.em("wrap", "hidden-default"), !n.native)];
        }),
        m = H(function () {
          return [r.e("view"), n.viewClass];
        }),
        S = function S() {
          var w;
          c.value && ((w = b.value) == null || w.handleScroll(c.value), o("scroll", {
            scrollTop: c.value.scrollTop,
            scrollLeft: c.value.scrollLeft
          }));
        };
      function k(w, C) {
        un(w) ? c.value.scrollTo(w) : we(w) && we(C) && c.value.scrollTo(w, C);
      }
      var y = function y(w) {
          we(w) && (c.value.scrollTop = w);
        },
        V = function V(w) {
          we(w) && (c.value.scrollLeft = w);
        },
        E = function E() {
          if (!c.value) return;
          var w = c.value.offsetHeight - qe,
            C = c.value.offsetWidth - qe,
            I = Math.pow(w, 2) / c.value.scrollHeight,
            T = Math.pow(C, 2) / c.value.scrollWidth,
            N = Math.max(I, n.minSize),
            A = Math.max(T, n.minSize);
          v.value = I / (w - I) / (N / (w - N)), p.value = T / (C - T) / (A / (C - A)), d.value = N + qe < w ? "".concat(N, "px") : "", f.value = A + qe < C ? "".concat(A, "px") : "";
        };
      return K(function () {
        return n.noresize;
      }, function (w) {
        var _Gr;
        w ? (s == null || s(), l == null || l()) : ((_Gr = Gr(u, E), s = _Gr.stop), l = Tt("resize", E));
      }, {
        immediate: !0
      }), K(function () {
        return [n.maxHeight, n.height];
      }, function () {
        n.native || Be(function () {
          var w;
          E(), c.value && ((w = b.value) == null || w.handleScroll(c.value));
        });
      }), ce(zn, hr({
        scrollbarElement: i,
        wrapElement: c
      })), pe(function () {
        n.native || Be(function () {
          E();
        });
      }), br(function () {
        return E();
      }), t({
        wrapRef: c,
        update: E,
        scrollTo: k,
        setScrollTop: y,
        setScrollLeft: V,
        handleScroll: S
      }), function (w, C) {
        return P(), Y("div", {
          ref_key: "scrollbarRef",
          ref: i,
          class: j(a(r).b())
        }, [O("div", {
          ref_key: "wrapRef",
          ref: c,
          class: j(a(h)),
          style: ue(a(g)),
          onScroll: S
        }, [(P(), U(Ne(w.tag), {
          ref_key: "resizeRef",
          ref: u,
          class: j(a(m)),
          style: ue(w.viewStyle)
        }, {
          default: Z(function () {
            return [D(w.$slots, "default")];
          }),
          _: 3
        }, 8, ["class", "style"]))], 38), w.native ? X("v-if", !0) : (P(), U(Na, {
          key: 0,
          ref_key: "barRef",
          ref: b,
          height: d.value,
          width: f.value,
          always: w.always,
          "ratio-x": p.value,
          "ratio-y": v.value
        }, null, 8, ["height", "width", "always", "ratio-x", "ratio-y"]))], 2);
      };
    }
  }));
var qa = x(Qa, [["__file", "/home/runner/work/element-plus/element-plus/packages/components/scrollbar/src/scrollbar.vue"]]);
var Ya = He(qa),
  lo = Symbol("popper"),
  Nn = Symbol("popperContent"),
  xa = ["dialog", "grid", "group", "listbox", "menu", "navigation", "tooltip", "tree"],
  An = te({
    role: {
      type: String,
      values: xa,
      default: "tooltip"
    }
  }),
  Fa = z({
    name: "ElPopper",
    inheritAttrs: !1
  }),
  Ka = z(_objectSpread(_objectSpread({}, Fa), {}, {
    props: An,
    setup: function setup(e, _ref13) {
      var t = _ref13.expose;
      var o = e,
        n = J(),
        r = J(),
        s = J(),
        l = J(),
        i = H(function () {
          return o.role;
        }),
        c = {
          triggerRef: n,
          popperInstanceRef: r,
          contentRef: s,
          referenceRef: l,
          role: i
        };
      return t(c), ce(lo, c), function (u, f) {
        return D(u.$slots, "default");
      };
    }
  }));
var Ua = x(Ka, [["__file", "/home/runner/work/element-plus/element-plus/packages/components/popper/src/popper.vue"]]);
var Bn = te({
    arrowOffset: {
      type: Number,
      default: 5
    }
  }),
  Ga = z({
    name: "ElPopperArrow",
    inheritAttrs: !1
  }),
  Xa = z(_objectSpread(_objectSpread({}, Ga), {}, {
    props: Bn,
    setup: function setup(e, _ref14) {
      var t = _ref14.expose;
      var o = e,
        n = oe("popper"),
        _W = W(Nn, void 0),
        r = _W.arrowOffset,
        s = _W.arrowRef,
        l = _W.arrowStyle;
      return K(function () {
        return o.arrowOffset;
      }, function (i) {
        r.value = i;
      }), fe(function () {
        s.value = void 0;
      }), t({
        arrowRef: s
      }), function (i, c) {
        return P(), Y("span", {
          ref_key: "arrowRef",
          ref: s,
          class: j(a(n).e("arrow")),
          style: ue(a(l)),
          "data-popper-arrow": ""
        }, null, 6);
      };
    }
  }));
var Wa = x(Xa, [["__file", "/home/runner/work/element-plus/element-plus/packages/components/popper/src/arrow.vue"]]);
var _a = "ElOnlyChild",
  Dn = z({
    name: _a,
    setup: function setup(e, _ref15) {
      var t = _ref15.slots,
        o = _ref15.attrs;
      var n;
      var r = W(Zn),
        s = Ia((n = r == null ? void 0 : r.setForwardRef) != null ? n : Ye);
      return function () {
        var l;
        var i = (l = t.default) == null ? void 0 : l.call(t, o);
        if (!i || i.length > 1) return null;
        var c = jn(i);
        return c ? Ot(Cr(c, o), [[s]]) : null;
      };
    }
  });
function jn(e) {
  if (!e) return null;
  var t = e;
  var _iterator = _createForOfIteratorHelper(t),
    _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var o = _step.value;
      if (un(o)) switch (o.type) {
        case wr:
          continue;
        case yr:
        case "svg":
          return Xo(o);
        case ot:
          return jn(o.children);
        default:
          return o;
      }
      return Xo(o);
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  return null;
}
function Xo(e) {
  var t = oe("only-child");
  return R("span", {
    class: t.e("content")
  }, [e]);
}
var Qn = te({
    virtualRef: {
      type: B(Object)
    },
    virtualTriggering: Boolean,
    onMouseenter: {
      type: B(Function)
    },
    onMouseleave: {
      type: B(Function)
    },
    onClick: {
      type: B(Function)
    },
    onKeydown: {
      type: B(Function)
    },
    onFocus: {
      type: B(Function)
    },
    onBlur: {
      type: B(Function)
    },
    onContextmenu: {
      type: B(Function)
    },
    id: String,
    open: Boolean
  }),
  $a = z({
    name: "ElPopperTrigger",
    inheritAttrs: !1
  }),
  el = z(_objectSpread(_objectSpread({}, $a), {}, {
    props: Qn,
    setup: function setup(e, _ref16) {
      var t = _ref16.expose;
      var o = e,
        _W2 = W(lo, void 0),
        n = _W2.role,
        r = _W2.triggerRef;
      Va(r);
      var s = H(function () {
          return i.value ? o.id : void 0;
        }),
        l = H(function () {
          if (n && n.value === "tooltip") return o.open && o.id ? o.id : void 0;
        }),
        i = H(function () {
          if (n && n.value !== "tooltip") return n.value;
        }),
        c = H(function () {
          return i.value ? "".concat(o.open) : void 0;
        });
      var u;
      return pe(function () {
        K(function () {
          return o.virtualRef;
        }, function (f) {
          f && (r.value = bn(f));
        }, {
          immediate: !0
        }), K(r, function (f, d) {
          u == null || u(), u = void 0, Vt(f) && (["onMouseenter", "onMouseleave", "onClick", "onKeydown", "onFocus", "onBlur", "onContextmenu"].forEach(function (b) {
            var v;
            var p = o[b];
            p && (f.addEventListener(b.slice(2).toLowerCase(), p), (v = d == null ? void 0 : d.removeEventListener) == null || v.call(d, b.slice(2).toLowerCase(), p));
          }), u = K([s, l, i, c], function (b) {
            ["aria-controls", "aria-describedby", "aria-haspopup", "aria-expanded"].forEach(function (v, p) {
              Xt(b[p]) ? f.removeAttribute(v) : f.setAttribute(v, b[p]);
            });
          }, {
            immediate: !0
          })), Vt(d) && ["aria-controls", "aria-describedby", "aria-haspopup", "aria-expanded"].forEach(function (b) {
            return d.removeAttribute(b);
          });
        }, {
          immediate: !0
        });
      }), fe(function () {
        u == null || u(), u = void 0;
      }), t({
        triggerRef: r
      }), function (f, d) {
        return f.virtualTriggering ? X("v-if", !0) : (P(), U(a(Dn), Se({
          key: 0
        }, f.$attrs, {
          "aria-controls": a(s),
          "aria-describedby": a(l),
          "aria-expanded": a(c),
          "aria-haspopup": a(i)
        }), {
          default: Z(function () {
            return [D(f.$slots, "default")];
          }),
          _: 3
        }, 16, ["aria-controls", "aria-describedby", "aria-expanded", "aria-haspopup"]));
      };
    }
  }));
var tl = x(el, [["__file", "/home/runner/work/element-plus/element-plus/packages/components/popper/src/trigger.vue"]]);
var Nt = "focus-trap.focus-after-trapped",
  At = "focus-trap.focus-after-released",
  ol = "focus-trap.focusout-prevented",
  Wo = {
    cancelable: !0,
    bubbles: !1
  },
  nl = {
    cancelable: !0,
    bubbles: !1
  },
  _o = "focusAfterTrapped",
  $o = "focusAfterReleased",
  io = Symbol("elFocusTrap"),
  co = J(),
  Pt = J(0),
  uo = J(0);
var bt = 0;
var qn = function qn(e) {
    var t = [],
      o = document.createTreeWalker(e, NodeFilter.SHOW_ELEMENT, {
        acceptNode: function acceptNode(n) {
          var r = n.tagName === "INPUT" && n.type === "hidden";
          return n.disabled || n.hidden || r ? NodeFilter.FILTER_SKIP : n.tabIndex >= 0 || n === document.activeElement ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
        }
      });
    for (; o.nextNode();) t.push(o.currentNode);
    return t;
  },
  en = function en(e, t) {
    var _iterator2 = _createForOfIteratorHelper(e),
      _step2;
    try {
      for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
        var o = _step2.value;
        if (!rl(o, t)) return o;
      }
    } catch (err) {
      _iterator2.e(err);
    } finally {
      _iterator2.f();
    }
  },
  rl = function rl(e, t) {
    if (getComputedStyle(e).visibility === "hidden") return !0;
    for (; e;) {
      if (t && e === t) return !1;
      if (getComputedStyle(e).display === "none") return !0;
      e = e.parentElement;
    }
    return !1;
  },
  sl = function sl(e) {
    var t = qn(e),
      o = en(t, e),
      n = en(t.reverse(), e);
    return [o, n];
  },
  al = function al(e) {
    return e instanceof HTMLInputElement && "select" in e;
  },
  Oe = function Oe(e, t) {
    if (e && e.focus) {
      var o = document.activeElement;
      e.focus({
        preventScroll: !0
      }), uo.value = window.performance.now(), e !== o && al(e) && t && e.select();
    }
  };
function tn(e, t) {
  var o = _toConsumableArray(e),
    n = e.indexOf(t);
  return n !== -1 && o.splice(n, 1), o;
}
var ll = function ll() {
    var e = [];
    return {
      push: function push(n) {
        var r = e[0];
        r && n !== r && r.pause(), e = tn(e, n), e.unshift(n);
      },
      remove: function remove(n) {
        var r, s;
        e = tn(e, n), (s = (r = e[0]) == null ? void 0 : r.resume) == null || s.call(r);
      }
    };
  },
  il = function il(e) {
    var t = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : !1;
    var o = document.activeElement;
    var _iterator3 = _createForOfIteratorHelper(e),
      _step3;
    try {
      for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
        var n = _step3.value;
        if (Oe(n, t), document.activeElement !== o) return;
      }
    } catch (err) {
      _iterator3.e(err);
    } finally {
      _iterator3.f();
    }
  },
  on = ll(),
  cl = function cl() {
    return Pt.value > uo.value;
  },
  Ct = function Ct() {
    co.value = "pointer", Pt.value = window.performance.now();
  },
  nn = function nn() {
    co.value = "keyboard", Pt.value = window.performance.now();
  },
  ul = function ul() {
    return pe(function () {
      bt === 0 && (document.addEventListener("mousedown", Ct), document.addEventListener("touchstart", Ct), document.addEventListener("keydown", nn)), bt++;
    }), fe(function () {
      bt--, bt <= 0 && (document.removeEventListener("mousedown", Ct), document.removeEventListener("touchstart", Ct), document.removeEventListener("keydown", nn));
    }), {
      focusReason: co,
      lastUserFocusTimestamp: Pt,
      lastAutomatedFocusTimestamp: uo
    };
  },
  yt = function yt(e) {
    return new CustomEvent(ol, _objectSpread(_objectSpread({}, nl), {}, {
      detail: e
    }));
  },
  dl = z({
    name: "ElFocusTrap",
    inheritAttrs: !1,
    props: {
      loop: Boolean,
      trapped: Boolean,
      focusTrapEl: Object,
      focusStartEl: {
        type: [Object, String],
        default: "first"
      }
    },
    emits: [_o, $o, "focusin", "focusout", "focusout-prevented", "release-requested"],
    setup: function setup(e, _ref17) {
      var t = _ref17.emit;
      var o = J();
      var n, r;
      var _ul = ul(),
        s = _ul.focusReason;
      wa(function (p) {
        e.trapped && !l.paused && t("release-requested", p);
      });
      var l = {
          paused: !1,
          pause: function pause() {
            this.paused = !0;
          },
          resume: function resume() {
            this.paused = !1;
          }
        },
        i = function i(p) {
          if (!e.loop && !e.trapped || l.paused) return;
          var g = p.key,
            h = p.altKey,
            m = p.ctrlKey,
            S = p.metaKey,
            k = p.currentTarget,
            y = p.shiftKey,
            V = e.loop,
            E = g === $.tab && !h && !m && !S,
            w = document.activeElement;
          if (E && w) {
            var C = k,
              _sl = sl(C),
              _sl2 = _slicedToArray(_sl, 2),
              I = _sl2[0],
              T = _sl2[1];
            if (I && T) {
              if (!y && w === T) {
                var A = yt({
                  focusReason: s.value
                });
                t("focusout-prevented", A), A.defaultPrevented || (p.preventDefault(), V && Oe(I, !0));
              } else if (y && [I, C].includes(w)) {
                var _A = yt({
                  focusReason: s.value
                });
                t("focusout-prevented", _A), _A.defaultPrevented || (p.preventDefault(), V && Oe(T, !0));
              }
            } else if (w === C) {
              var _A2 = yt({
                focusReason: s.value
              });
              t("focusout-prevented", _A2), _A2.defaultPrevented || p.preventDefault();
            }
          }
        };
      ce(io, {
        focusTrapRef: o,
        onKeydown: i
      }), K(function () {
        return e.focusTrapEl;
      }, function (p) {
        p && (o.value = p);
      }, {
        immediate: !0
      }), K([o], function (_ref18, _ref19) {
        var _ref20 = _slicedToArray(_ref18, 1),
          p = _ref20[0];
        var _ref21 = _slicedToArray(_ref19, 1),
          g = _ref21[0];
        p && (p.addEventListener("keydown", i), p.addEventListener("focusin", f), p.addEventListener("focusout", d)), g && (g.removeEventListener("keydown", i), g.removeEventListener("focusin", f), g.removeEventListener("focusout", d));
      });
      var c = function c(p) {
          t(_o, p);
        },
        u = function u(p) {
          return t($o, p);
        },
        f = function f(p) {
          var g = a(o);
          if (!g) return;
          var h = p.target,
            m = p.relatedTarget,
            S = h && g.contains(h);
          e.trapped || m && g.contains(m) || (n = m), S && t("focusin", p), !l.paused && e.trapped && (S ? r = h : Oe(r, !0));
        },
        d = function d(p) {
          var g = a(o);
          if (!(l.paused || !g)) if (e.trapped) {
            var h = p.relatedTarget;
            !Xt(h) && !g.contains(h) && setTimeout(function () {
              if (!l.paused && e.trapped) {
                var m = yt({
                  focusReason: s.value
                });
                t("focusout-prevented", m), m.defaultPrevented || Oe(r, !0);
              }
            }, 0);
          } else {
            var _h = p.target;
            _h && g.contains(_h) || t("focusout", p);
          }
        };
      function b() {
        return _b.apply(this, arguments);
      }
      function _b() {
        _b = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
          var p, g, m;
          return _regeneratorRuntime().wrap(function _callee$(_context) {
            while (1) switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return Be();
              case 2:
                p = a(o);
                if (p) {
                  on.push(l);
                  g = p.contains(document.activeElement) ? n : document.activeElement;
                  if (n = g, !p.contains(g)) {
                    m = new Event(Nt, Wo);
                    p.addEventListener(Nt, c), p.dispatchEvent(m), m.defaultPrevented || Be(function () {
                      var S = e.focusStartEl;
                      Et(S) || (Oe(S), document.activeElement !== S && (S = "first")), S === "first" && il(qn(p), !0), (document.activeElement === g || S === "container") && Oe(p);
                    });
                  }
                }
              case 4:
              case "end":
                return _context.stop();
            }
          }, _callee);
        }));
        return _b.apply(this, arguments);
      }
      function v() {
        var p = a(o);
        if (p) {
          var _n3;
          p.removeEventListener(Nt, c);
          var g = new CustomEvent(At, _objectSpread(_objectSpread({}, Wo), {}, {
            detail: {
              focusReason: s.value
            }
          }));
          p.addEventListener(At, u), p.dispatchEvent(g), !g.defaultPrevented && (s.value == "keyboard" || !cl() || p.contains(document.activeElement)) && Oe((_n3 = n) !== null && _n3 !== void 0 ? _n3 : document.body), p.removeEventListener(At, c), on.remove(l);
        }
      }
      return pe(function () {
        e.trapped && b(), K(function () {
          return e.trapped;
        }, function (p) {
          p ? b() : v();
        });
      }), fe(function () {
        e.trapped && v();
      }), {
        onKeydown: i
      };
    }
  });
function pl(e, t, o, n, r, s) {
  return D(e.$slots, "default", {
    handleKeydown: e.onKeydown
  });
}
var Yn = x(dl, [["render", pl], ["__file", "/home/runner/work/element-plus/element-plus/packages/components/focus-trap/src/focus-trap.vue"]]);
var fl = ["fixed", "absolute"],
  vl = te({
    boundariesPadding: {
      type: Number,
      default: 0
    },
    fallbackPlacements: {
      type: B(Array),
      default: void 0
    },
    gpuAcceleration: {
      type: Boolean,
      default: !0
    },
    offset: {
      type: Number,
      default: 12
    },
    placement: {
      type: String,
      values: $t,
      default: "bottom"
    },
    popperOptions: {
      type: B(Object),
      default: function _default() {
        return {};
      }
    },
    strategy: {
      type: String,
      values: fl,
      default: "absolute"
    }
  }),
  xn = te(_objectSpread(_objectSpread({}, vl), {}, {
    id: String,
    style: {
      type: B([String, Array, Object])
    },
    className: {
      type: B([String, Array, Object])
    },
    effect: {
      type: String,
      default: "dark"
    },
    visible: Boolean,
    enterable: {
      type: Boolean,
      default: !0
    },
    pure: Boolean,
    focusOnShow: {
      type: Boolean,
      default: !1
    },
    trapping: {
      type: Boolean,
      default: !1
    },
    popperClass: {
      type: B([String, Array, Object])
    },
    popperStyle: {
      type: B([String, Array, Object])
    },
    referenceEl: {
      type: B(Object)
    },
    triggerTargetEl: {
      type: B(Object)
    },
    stopPopperMouseEvent: {
      type: Boolean,
      default: !0
    },
    ariaLabel: {
      type: String,
      default: void 0
    },
    virtualTriggering: Boolean,
    zIndex: Number
  })),
  ml = {
    mouseenter: function mouseenter(e) {
      return e instanceof MouseEvent;
    },
    mouseleave: function mouseleave(e) {
      return e instanceof MouseEvent;
    },
    focus: function focus() {
      return !0;
    },
    blur: function blur() {
      return !0;
    },
    close: function close() {
      return !0;
    }
  },
  gl = function gl(e) {
    var t = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    var o = e.placement,
      n = e.strategy,
      r = e.popperOptions,
      s = _objectSpread(_objectSpread({
        placement: o,
        strategy: n
      }, r), {}, {
        modifiers: [].concat(_toConsumableArray(bl(e)), _toConsumableArray(t))
      });
    return Cl(s, r == null ? void 0 : r.modifiers), s;
  },
  hl = function hl(e) {
    if (be) return bn(e);
  };
function bl(e) {
  var t = e.offset,
    o = e.gpuAcceleration,
    n = e.fallbackPlacements;
  return [{
    name: "offset",
    options: {
      offset: [0, t !== null && t !== void 0 ? t : 12]
    }
  }, {
    name: "preventOverflow",
    options: {
      padding: {
        top: 2,
        bottom: 2,
        left: 5,
        right: 5
      }
    }
  }, {
    name: "flip",
    options: {
      padding: 5,
      fallbackPlacements: n
    }
  }, {
    name: "computeStyles",
    options: {
      gpuAcceleration: o
    }
  }];
}
function Cl(e, t) {
  t && (e.modifiers = [].concat(_toConsumableArray(e.modifiers), _toConsumableArray(t !== null && t !== void 0 ? t : [])));
}
var yl = 0,
  wl = function wl(e) {
    var _W3 = W(lo, void 0),
      t = _W3.popperInstanceRef,
      o = _W3.contentRef,
      n = _W3.triggerRef,
      r = _W3.role,
      s = J(),
      l = J(),
      i = H(function () {
        return {
          name: "eventListeners",
          enabled: !!e.visible
        };
      }),
      c = H(function () {
        var m;
        var S = a(s),
          k = (m = a(l)) != null ? m : yl;
        return {
          name: "arrow",
          enabled: !us(S),
          options: {
            element: S,
            padding: k
          }
        };
      }),
      u = H(function () {
        return _objectSpread({
          onFirstUpdate: function onFirstUpdate() {
            p();
          }
        }, gl(e, [a(c), a(i)]));
      }),
      f = H(function () {
        return hl(e.referenceEl) || a(n);
      }),
      _Ca = Ca(f, o, u),
      d = _Ca.attributes,
      b = _Ca.state,
      v = _Ca.styles,
      p = _Ca.update,
      g = _Ca.forceUpdate,
      h = _Ca.instanceRef;
    return K(h, function (m) {
      return t.value = m;
    }), pe(function () {
      K(function () {
        var m;
        return (m = a(f)) == null ? void 0 : m.getBoundingClientRect();
      }, function () {
        p();
      });
    }), {
      attributes: d,
      arrowRef: s,
      contentRef: o,
      instanceRef: h,
      state: b,
      styles: v,
      role: r,
      forceUpdate: g,
      update: p
    };
  },
  El = function El(e, _ref22) {
    var t = _ref22.attributes,
      o = _ref22.styles,
      n = _ref22.role;
    var _Rn = Rn(),
      r = _Rn.nextZIndex,
      s = oe("popper"),
      l = H(function () {
        return a(t).popper;
      }),
      i = J(e.zIndex || r()),
      c = H(function () {
        return [s.b(), s.is("pure", e.pure), s.is(e.effect), e.popperClass];
      }),
      u = H(function () {
        return [{
          zIndex: a(i)
        }, a(o).popper, e.popperStyle || {}];
      }),
      f = H(function () {
        return n.value === "dialog" ? "false" : void 0;
      }),
      d = H(function () {
        return a(o).arrow || {};
      });
    return {
      ariaModal: f,
      arrowStyle: d,
      contentAttrs: l,
      contentClass: c,
      contentStyle: u,
      contentZIndex: i,
      updateZIndex: function updateZIndex() {
        i.value = e.zIndex || r();
      }
    };
  },
  Sl = function Sl(e, t) {
    var o = J(!1),
      n = J();
    return {
      focusStartRef: n,
      trapped: o,
      onFocusAfterReleased: function onFocusAfterReleased(u) {
        var f;
        ((f = u.detail) == null ? void 0 : f.focusReason) !== "pointer" && (n.value = "first", t("blur"));
      },
      onFocusAfterTrapped: function onFocusAfterTrapped() {
        t("focus");
      },
      onFocusInTrap: function onFocusInTrap(u) {
        e.visible && !o.value && (u.target && (n.value = u.target), o.value = !0);
      },
      onFocusoutPrevented: function onFocusoutPrevented(u) {
        e.trapping || (u.detail.focusReason === "pointer" && u.preventDefault(), o.value = !1);
      },
      onReleaseRequested: function onReleaseRequested() {
        o.value = !1, t("close");
      }
    };
  },
  kl = z({
    name: "ElPopperContent"
  }),
  Hl = z(_objectSpread(_objectSpread({}, kl), {}, {
    props: xn,
    emits: ml,
    setup: function setup(e, _ref23) {
      var t = _ref23.expose,
        o = _ref23.emit;
      var n = e,
        _Sl = Sl(n, o),
        r = _Sl.focusStartRef,
        s = _Sl.trapped,
        l = _Sl.onFocusAfterReleased,
        i = _Sl.onFocusAfterTrapped,
        c = _Sl.onFocusInTrap,
        u = _Sl.onFocusoutPrevented,
        f = _Sl.onReleaseRequested,
        _wl = wl(n),
        d = _wl.attributes,
        b = _wl.arrowRef,
        v = _wl.contentRef,
        p = _wl.styles,
        g = _wl.instanceRef,
        h = _wl.role,
        m = _wl.update,
        _El = El(n, {
          styles: p,
          attributes: d,
          role: h
        }),
        S = _El.ariaModal,
        k = _El.arrowStyle,
        y = _El.contentAttrs,
        V = _El.contentClass,
        E = _El.contentStyle,
        w = _El.updateZIndex,
        C = W(Jo, void 0),
        I = J();
      ce(Nn, {
        arrowStyle: k,
        arrowRef: b,
        arrowOffset: I
      }), C && (C.addInputId || C.removeInputId) && ce(Jo, _objectSpread(_objectSpread({}, C), {}, {
        addInputId: Ye,
        removeInputId: Ye
      }));
      var T;
      var N = function N() {
          var F = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : !0;
          m(), F && w();
        },
        A = function A() {
          N(!1), n.visible && n.focusOnShow ? s.value = !0 : n.visible === !1 && (s.value = !1);
        };
      return pe(function () {
        K(function () {
          return n.triggerTargetEl;
        }, function (F, Q) {
          T == null || T(), T = void 0;
          var G = a(F || v.value),
            L = a(Q || v.value);
          Vt(G) && (T = K([h, function () {
            return n.ariaLabel;
          }, S, function () {
            return n.id;
          }], function (M) {
            ["role", "aria-label", "aria-modal", "id"].forEach(function (ee, ae) {
              Xt(M[ae]) ? G.removeAttribute(ee) : G.setAttribute(ee, M[ae]);
            });
          }, {
            immediate: !0
          })), L !== G && Vt(L) && ["role", "aria-label", "aria-modal", "id"].forEach(function (M) {
            L.removeAttribute(M);
          });
        }, {
          immediate: !0
        }), K(function () {
          return n.visible;
        }, A, {
          immediate: !0
        });
      }), fe(function () {
        T == null || T(), T = void 0;
      }), t({
        popperContentRef: v,
        popperInstanceRef: g,
        updatePopper: N,
        contentStyle: E
      }), function (F, Q) {
        return P(), Y("div", Se({
          ref_key: "contentRef",
          ref: v
        }, a(y), {
          style: a(E),
          class: a(V),
          tabindex: "-1",
          onMouseenter: Q[0] || (Q[0] = function (G) {
            return F.$emit("mouseenter", G);
          }),
          onMouseleave: Q[1] || (Q[1] = function (G) {
            return F.$emit("mouseleave", G);
          })
        }), [R(a(Yn), {
          trapped: a(s),
          "trap-on-focus-in": !0,
          "focus-trap-el": a(v),
          "focus-start-el": a(r),
          onFocusAfterTrapped: a(i),
          onFocusAfterReleased: a(l),
          onFocusin: a(c),
          onFocusoutPrevented: a(u),
          onReleaseRequested: a(f)
        }, {
          default: Z(function () {
            return [D(F.$slots, "default")];
          }),
          _: 3
        }, 8, ["trapped", "focus-trap-el", "focus-start-el", "onFocusAfterTrapped", "onFocusAfterReleased", "onFocusin", "onFocusoutPrevented", "onReleaseRequested"])], 16);
      };
    }
  }));
var Vl = x(Hl, [["__file", "/home/runner/work/element-plus/element-plus/packages/components/popper/src/content.vue"]]);
var Il = He(Ua),
  po = Symbol("elTooltip"),
  ve = te(_objectSpread(_objectSpread(_objectSpread({}, ka), xn), {}, {
    appendTo: {
      type: B([String, Object])
    },
    content: {
      type: String,
      default: ""
    },
    rawContent: {
      type: Boolean,
      default: !1
    },
    persistent: Boolean,
    ariaLabel: String,
    visible: {
      type: B(Boolean),
      default: null
    },
    transition: String,
    teleported: {
      type: Boolean,
      default: !0
    },
    disabled: Boolean
  })),
  it = te(_objectSpread(_objectSpread({}, Qn), {}, {
    disabled: Boolean,
    trigger: {
      type: B([String, Array]),
      default: "hover"
    },
    triggerKeys: {
      type: B(Array),
      default: function _default() {
        return [$.enter, $.space];
      }
    }
  })),
  _yn = yn("visible"),
  Tl = _yn.useModelToggleProps,
  Ml = _yn.useModelToggleEmits,
  Ol = _yn.useModelToggle,
  Jl = te(_objectSpread(_objectSpread(_objectSpread(_objectSpread(_objectSpread(_objectSpread({}, An), Tl), ve), it), Bn), {}, {
    showArrow: {
      type: Boolean,
      default: !0
    }
  })),
  Pl = [].concat(_toConsumableArray(Ml), ["before-show", "before-hide", "show", "hide", "open", "close"]),
  Ll = function Ll(e, t) {
    return dn(e) ? e.includes(t) : e === t;
  },
  je = function je(e, t, o) {
    return function (n) {
      Ll(a(e), t) && o(n);
    };
  },
  Zl = z({
    name: "ElTooltipTrigger"
  }),
  Rl = z(_objectSpread(_objectSpread({}, Zl), {}, {
    props: it,
    setup: function setup(e, _ref12) {
      var t = _ref12.expose;
      var o = e,
        n = oe("tooltip"),
        _W4 = W(po, void 0),
        r = _W4.controlled,
        s = _W4.id,
        l = _W4.open,
        i = _W4.onOpen,
        c = _W4.onClose,
        u = _W4.onToggle,
        f = J(null),
        d = function d() {
          if (a(r) || o.disabled) return !0;
        },
        b = de(o, "trigger"),
        v = ne(d, je(b, "hover", i)),
        p = ne(d, je(b, "hover", c)),
        g = ne(d, je(b, "click", function (y) {
          y.button === 0 && u(y);
        })),
        h = ne(d, je(b, "focus", i)),
        m = ne(d, je(b, "focus", c)),
        S = ne(d, je(b, "contextmenu", function (y) {
          y.preventDefault(), u(y);
        })),
        k = ne(d, function (y) {
          var V = y.code;
          o.triggerKeys.includes(V) && (y.preventDefault(), u(y));
        });
      return t({
        triggerRef: f
      }), function (y, V) {
        return P(), U(a(tl), {
          id: a(s),
          "virtual-ref": y.virtualRef,
          open: a(l),
          "virtual-triggering": y.virtualTriggering,
          class: j(a(n).e("trigger")),
          onBlur: a(m),
          onClick: a(g),
          onContextmenu: a(S),
          onFocus: a(h),
          onMouseenter: a(v),
          onMouseleave: a(p),
          onKeydown: a(k)
        }, {
          default: Z(function () {
            return [D(y.$slots, "default")];
          }),
          _: 3
        }, 8, ["id", "virtual-ref", "open", "virtual-triggering", "class", "onBlur", "onClick", "onContextmenu", "onFocus", "onMouseenter", "onMouseleave", "onKeydown"]);
      };
    }
  }));
var zl = x(Rl, [["__file", "/home/runner/work/element-plus/element-plus/packages/components/tooltip/src/trigger.vue"]]);
var Nl = z({
    name: "ElTooltipContent",
    inheritAttrs: !1
  }),
  Al = z(_objectSpread(_objectSpread({}, Nl), {}, {
    props: ve,
    setup: function setup(e, _ref24) {
      var t = _ref24.expose;
      var o = e,
        _Ln2 = Ln(),
        n = _Ln2.selector,
        r = oe("tooltip"),
        s = J(null),
        l = J(!1),
        _W5 = W(po, void 0),
        i = _W5.controlled,
        c = _W5.id,
        u = _W5.open,
        f = _W5.trigger,
        d = _W5.onClose,
        b = _W5.onOpen,
        v = _W5.onShow,
        p = _W5.onHide,
        g = _W5.onBeforeShow,
        h = _W5.onBeforeHide,
        m = H(function () {
          return o.transition || "".concat(r.namespace.value, "-fade-in-linear");
        }),
        S = H(function () {
          return o.persistent;
        });
      fe(function () {
        l.value = !0;
      });
      var k = H(function () {
          return a(S) ? !0 : a(u);
        }),
        y = H(function () {
          return o.disabled ? !1 : a(u);
        }),
        V = H(function () {
          return o.appendTo || n.value;
        }),
        E = H(function () {
          var M;
          return (M = o.style) != null ? M : {};
        }),
        w = H(function () {
          return !a(u);
        }),
        C = function C() {
          p();
        },
        I = function I() {
          if (a(i)) return !0;
        },
        T = ne(I, function () {
          o.enterable && a(f) === "hover" && b();
        }),
        N = ne(I, function () {
          a(f) === "hover" && d();
        }),
        A = function A() {
          var M, ee;
          (ee = (M = s.value) == null ? void 0 : M.updatePopper) == null || ee.call(M), g == null || g();
        },
        F = function F() {
          h == null || h();
        },
        Q = function Q() {
          v(), L = Xr(H(function () {
            var M;
            return (M = s.value) == null ? void 0 : M.popperContentRef;
          }), function () {
            if (a(i)) return;
            a(f) !== "hover" && d();
          });
        },
        G = function G() {
          o.virtualTriggering || d();
        };
      var L;
      return K(function () {
        return a(u);
      }, function (M) {
        M || L == null || L();
      }, {
        flush: "post"
      }), K(function () {
        return o.content;
      }, function () {
        var M, ee;
        (ee = (M = s.value) == null ? void 0 : M.updatePopper) == null || ee.call(M);
      }), t({
        contentRef: s
      }), function (M, ee) {
        return P(), U(pn, {
          disabled: !M.teleported,
          to: a(V)
        }, [R(Ft, {
          name: a(m),
          onAfterLeave: C,
          onBeforeEnter: A,
          onAfterEnter: Q,
          onBeforeLeave: F
        }, {
          default: Z(function () {
            return [a(k) ? Ot((P(), U(a(Vl), Se({
              key: 0,
              id: a(c),
              ref_key: "contentRef",
              ref: s
            }, M.$attrs, {
              "aria-label": M.ariaLabel,
              "aria-hidden": a(w),
              "boundaries-padding": M.boundariesPadding,
              "fallback-placements": M.fallbackPlacements,
              "gpu-acceleration": M.gpuAcceleration,
              offset: M.offset,
              placement: M.placement,
              "popper-options": M.popperOptions,
              strategy: M.strategy,
              effect: M.effect,
              enterable: M.enterable,
              pure: M.pure,
              "popper-class": M.popperClass,
              "popper-style": [M.popperStyle, a(E)],
              "reference-el": M.referenceEl,
              "trigger-target-el": M.triggerTargetEl,
              visible: a(y),
              "z-index": M.zIndex,
              onMouseenter: a(T),
              onMouseleave: a(N),
              onBlur: G,
              onClose: a(d)
            }), {
              default: Z(function () {
                return [l.value ? X("v-if", !0) : D(M.$slots, "default", {
                  key: 0
                })];
              }),
              _: 3
            }, 16, ["id", "aria-label", "aria-hidden", "boundaries-padding", "fallback-placements", "gpu-acceleration", "offset", "placement", "popper-options", "strategy", "effect", "enterable", "pure", "popper-class", "popper-style", "reference-el", "trigger-target-el", "visible", "z-index", "onMouseenter", "onMouseleave", "onClose"])), [[xt, a(y)]]) : X("v-if", !0)];
          }),
          _: 3
        }, 8, ["name"])], 8, ["disabled", "to"]);
      };
    }
  }));
var Bl = x(Al, [["__file", "/home/runner/work/element-plus/element-plus/packages/components/tooltip/src/content.vue"]]);
var Dl = ["innerHTML"],
  jl = {
    key: 1
  },
  Ql = z({
    name: "ElTooltip"
  }),
  ql = z(_objectSpread(_objectSpread({}, Ql), {}, {
    props: Jl,
    emits: Pl,
    setup: function setup(e, _ref25) {
      var t = _ref25.expose,
        o = _ref25.emit;
      var n = e;
      Sa();
      var r = rt(),
        s = J(),
        l = J(),
        i = function i() {
          var m;
          var S = a(s);
          S && ((m = S.popperInstanceRef) == null || m.update());
        },
        c = J(!1),
        u = J(),
        _Ol = Ol({
          indicator: c,
          toggleReason: u
        }),
        f = _Ol.show,
        d = _Ol.hide,
        b = _Ol.hasUpdateHandler,
        _Ha = Ha({
          showAfter: de(n, "showAfter"),
          hideAfter: de(n, "hideAfter"),
          autoClose: de(n, "autoClose"),
          open: f,
          close: d
        }),
        v = _Ha.onOpen,
        p = _Ha.onClose,
        g = H(function () {
          return Je(n.visible) && !b.value;
        });
      ce(po, {
        controlled: g,
        id: r,
        open: fn(c),
        trigger: de(n, "trigger"),
        onOpen: function onOpen(m) {
          v(m);
        },
        onClose: function onClose(m) {
          p(m);
        },
        onToggle: function onToggle(m) {
          a(c) ? p(m) : v(m);
        },
        onShow: function onShow() {
          o("show", u.value);
        },
        onHide: function onHide() {
          o("hide", u.value);
        },
        onBeforeShow: function onBeforeShow() {
          o("before-show", u.value);
        },
        onBeforeHide: function onBeforeHide() {
          o("before-hide", u.value);
        },
        updatePopper: i
      }), K(function () {
        return n.disabled;
      }, function (m) {
        m && c.value && (c.value = !1);
      });
      var h = function h() {
        var m, S;
        var k = (S = (m = l.value) == null ? void 0 : m.contentRef) == null ? void 0 : S.popperContentRef;
        return k && k.contains(document.activeElement);
      };
      return Er(function () {
        return c.value && d();
      }), t({
        popperRef: s,
        contentRef: l,
        isFocusInsideContent: h,
        updatePopper: i,
        onOpen: v,
        onClose: p,
        hide: d
      }), function (m, S) {
        return P(), U(a(Il), {
          ref_key: "popperRef",
          ref: s,
          role: m.role
        }, {
          default: Z(function () {
            return [R(zl, {
              disabled: m.disabled,
              trigger: m.trigger,
              "trigger-keys": m.triggerKeys,
              "virtual-ref": m.virtualRef,
              "virtual-triggering": m.virtualTriggering
            }, {
              default: Z(function () {
                return [m.$slots.default ? D(m.$slots, "default", {
                  key: 0
                }) : X("v-if", !0)];
              }),
              _: 3
            }, 8, ["disabled", "trigger", "trigger-keys", "virtual-ref", "virtual-triggering"]), R(Bl, {
              ref_key: "contentRef",
              ref: l,
              "aria-label": m.ariaLabel,
              "boundaries-padding": m.boundariesPadding,
              content: m.content,
              disabled: m.disabled,
              effect: m.effect,
              enterable: m.enterable,
              "fallback-placements": m.fallbackPlacements,
              "hide-after": m.hideAfter,
              "gpu-acceleration": m.gpuAcceleration,
              offset: m.offset,
              persistent: m.persistent,
              "popper-class": m.popperClass,
              "popper-style": m.popperStyle,
              placement: m.placement,
              "popper-options": m.popperOptions,
              pure: m.pure,
              "raw-content": m.rawContent,
              "reference-el": m.referenceEl,
              "trigger-target-el": m.triggerTargetEl,
              "show-after": m.showAfter,
              strategy: m.strategy,
              teleported: m.teleported,
              transition: m.transition,
              "virtual-triggering": m.virtualTriggering,
              "z-index": m.zIndex,
              "append-to": m.appendTo
            }, {
              default: Z(function () {
                return [D(m.$slots, "content", {}, function () {
                  return [m.rawContent ? (P(), Y("span", {
                    key: 0,
                    innerHTML: m.content
                  }, null, 8, Dl)) : (P(), Y("span", jl, _(m.content), 1))];
                }), m.showArrow ? (P(), U(a(Wa), {
                  key: 0,
                  "arrow-offset": m.arrowOffset
                }, null, 8, ["arrow-offset"])) : X("v-if", !0)];
              }),
              _: 3
            }, 8, ["aria-label", "boundaries-padding", "content", "disabled", "effect", "enterable", "fallback-placements", "hide-after", "gpu-acceleration", "offset", "persistent", "popper-class", "popper-style", "placement", "popper-options", "pure", "raw-content", "reference-el", "trigger-target-el", "show-after", "strategy", "teleported", "transition", "virtual-triggering", "z-index", "append-to"])];
          }),
          _: 3
        }, 8, ["role"]);
      };
    }
  }));
var Yl = x(ql, [["__file", "/home/runner/work/element-plus/element-plus/packages/components/tooltip/src/tooltip.vue"]]);
var fo = He(Yl),
  xl = z({
    name: "ElContainer"
  }),
  Fl = z(_objectSpread(_objectSpread({}, xl), {}, {
    props: {
      direction: {
        type: String
      }
    },
    setup: function setup(e) {
      var t = e,
        o = vn(),
        n = oe("container"),
        r = H(function () {
          return t.direction === "vertical" ? !0 : t.direction === "horizontal" ? !1 : o && o.default ? o.default().some(function (l) {
            var i = l.type.name;
            return i === "ElHeader" || i === "ElFooter";
          }) : !1;
        });
      return function (s, l) {
        return P(), Y("section", {
          class: j([a(n).b(), a(n).is("vertical", a(r))])
        }, [D(s.$slots, "default")], 2);
      };
    }
  }));
var Kl = x(Fl, [["__file", "/home/runner/work/element-plus/element-plus/packages/components/container/src/container.vue"]]);
var Ul = z({
    name: "ElAside"
  }),
  Gl = z(_objectSpread(_objectSpread({}, Ul), {}, {
    props: {
      width: {
        type: String,
        default: null
      }
    },
    setup: function setup(e) {
      var t = e,
        o = oe("aside"),
        n = H(function () {
          return t.width ? o.cssVarBlock({
            width: t.width
          }) : {};
        });
      return function (r, s) {
        return P(), Y("aside", {
          class: j(a(o).b()),
          style: ue(a(n))
        }, [D(r.$slots, "default")], 6);
      };
    }
  }));
var Fn = x(Gl, [["__file", "/home/runner/work/element-plus/element-plus/packages/components/container/src/aside.vue"]]);
var Xl = z({
    name: "ElFooter"
  }),
  Wl = z(_objectSpread(_objectSpread({}, Xl), {}, {
    props: {
      height: {
        type: String,
        default: null
      }
    },
    setup: function setup(e) {
      var t = e,
        o = oe("footer"),
        n = H(function () {
          return t.height ? o.cssVarBlock({
            height: t.height
          }) : {};
        });
      return function (r, s) {
        return P(), Y("footer", {
          class: j(a(o).b()),
          style: ue(a(n))
        }, [D(r.$slots, "default")], 6);
      };
    }
  }));
var Kn = x(Wl, [["__file", "/home/runner/work/element-plus/element-plus/packages/components/container/src/footer.vue"]]);
var _l = z({
    name: "ElHeader"
  }),
  $l = z(_objectSpread(_objectSpread({}, _l), {}, {
    props: {
      height: {
        type: String,
        default: null
      }
    },
    setup: function setup(e) {
      var t = e,
        o = oe("header"),
        n = H(function () {
          return t.height ? o.cssVarBlock({
            height: t.height
          }) : {};
        });
      return function (r, s) {
        return P(), Y("header", {
          class: j(a(o).b()),
          style: ue(a(n))
        }, [D(r.$slots, "default")], 6);
      };
    }
  }));
var Un = x($l, [["__file", "/home/runner/work/element-plus/element-plus/packages/components/container/src/header.vue"]]);
var ei = z({
    name: "ElMain"
  }),
  ti = z(_objectSpread(_objectSpread({}, ei), {}, {
    setup: function setup(e) {
      var t = oe("main");
      return function (o, n) {
        return P(), Y("main", {
          class: j(a(t).b())
        }, [D(o.$slots, "default")], 2);
      };
    }
  }));
var Gn = x(ti, [["__file", "/home/runner/work/element-plus/element-plus/packages/components/container/src/main.vue"]]);
He(Kl, {
  Aside: Fn,
  Footer: Kn,
  Header: Un,
  Main: Gn
});
Xe(Fn);
Xe(Kn);
var oi = Xe(Un);
Xe(Gn);
var ni = te({
    mask: {
      type: Boolean,
      default: !0
    },
    customMaskEvent: {
      type: Boolean,
      default: !1
    },
    overlayClass: {
      type: B([String, Array, Object])
    },
    zIndex: {
      type: B([String, Number])
    }
  }),
  ri = {
    click: function click(e) {
      return e instanceof MouseEvent;
    }
  },
  si = "overlay";
var ai = z({
  name: "ElOverlay",
  props: ni,
  emits: ri,
  setup: function setup(e, _ref26) {
    var t = _ref26.slots,
      o = _ref26.emit;
    var n = oe(si),
      r = function r(c) {
        o("click", c);
      },
      _Pn = Pn(e.customMaskEvent ? void 0 : r),
      s = _Pn.onClick,
      l = _Pn.onMousedown,
      i = _Pn.onMouseup;
    return function () {
      return e.mask ? R("div", {
        class: [n.b(), e.overlayClass],
        style: {
          zIndex: e.zIndex
        },
        onClick: s,
        onMousedown: l,
        onMouseup: i
      }, [D(t, "default")], St.STYLE | St.CLASS | St.PROPS, ["onClick", "onMouseup", "onMousedown"]) : Sr("div", {
        class: e.overlayClass,
        style: {
          zIndex: e.zIndex,
          position: "fixed",
          top: "0px",
          right: "0px",
          bottom: "0px",
          left: "0px"
        }
      }, [D(t, "default")]);
    };
  }
});
var li = ai,
  Xn = Symbol("dialogInjectionKey"),
  Wn = te({
    center: {
      type: Boolean,
      default: !1
    },
    alignCenter: {
      type: Boolean,
      default: !1
    },
    closeIcon: {
      type: It
    },
    customClass: {
      type: String,
      default: ""
    },
    draggable: {
      type: Boolean,
      default: !1
    },
    fullscreen: {
      type: Boolean,
      default: !1
    },
    showClose: {
      type: Boolean,
      default: !0
    },
    title: {
      type: String,
      default: ""
    }
  }),
  ii = {
    close: function close() {
      return !0;
    }
  },
  ci = ["aria-label"],
  ui = ["id"],
  di = z({
    name: "ElDialogContent"
  }),
  pi = z(_objectSpread(_objectSpread({}, di), {}, {
    props: Wn,
    emits: ii,
    setup: function setup(e) {
      var t = e,
        _Cn = Cn(),
        o = _Cn.t,
        n = zr.Close,
        _W6 = W(Xn),
        r = _W6.dialogRef,
        s = _W6.headerRef,
        l = _W6.bodyId,
        i = _W6.ns,
        c = _W6.style,
        _W7 = W(io),
        u = _W7.focusTrapRef,
        f = Wt(u, r),
        d = H(function () {
          return t.draggable;
        });
      return fs(r, s, d), function (b, v) {
        return P(), Y("div", {
          ref: a(f),
          class: j([a(i).b(), a(i).is("fullscreen", b.fullscreen), a(i).is("draggable", a(d)), a(i).is("align-center", b.alignCenter), _defineProperty({}, a(i).m("center"), b.center), b.customClass]),
          style: ue(a(c)),
          tabindex: "-1"
        }, [O("header", {
          ref_key: "headerRef",
          ref: s,
          class: j(a(i).e("header"))
        }, [D(b.$slots, "header", {}, function () {
          return [O("span", {
            role: "heading",
            class: j(a(i).e("title"))
          }, _(b.title), 3)];
        }), b.showClose ? (P(), Y("button", {
          key: 0,
          "aria-label": a(o)("el.dialog.close"),
          class: j(a(i).e("headerbtn")),
          type: "button",
          onClick: v[0] || (v[0] = function (p) {
            return b.$emit("close");
          })
        }, [R(a(ze), {
          class: j(a(i).e("close"))
        }, {
          default: Z(function () {
            return [(P(), U(Ne(b.closeIcon || a(n))))];
          }),
          _: 1
        }, 8, ["class"])], 10, ci)) : X("v-if", !0)], 2), O("div", {
          id: a(l),
          class: j(a(i).e("body"))
        }, [D(b.$slots, "default")], 10, ui), b.$slots.footer ? (P(), Y("footer", {
          key: 0,
          class: j(a(i).e("footer"))
        }, [D(b.$slots, "footer")], 2)) : X("v-if", !0)], 6);
      };
    }
  }));
var fi = x(pi, [["__file", "/home/runner/work/element-plus/element-plus/packages/components/dialog/src/dialog-content.vue"]]);
var vi = te(_objectSpread(_objectSpread({}, Wn), {}, {
    appendToBody: {
      type: Boolean,
      default: !1
    },
    beforeClose: {
      type: B(Function)
    },
    destroyOnClose: {
      type: Boolean,
      default: !1
    },
    closeOnClickModal: {
      type: Boolean,
      default: !0
    },
    closeOnPressEscape: {
      type: Boolean,
      default: !0
    },
    lockScroll: {
      type: Boolean,
      default: !0
    },
    modal: {
      type: Boolean,
      default: !0
    },
    openDelay: {
      type: Number,
      default: 0
    },
    closeDelay: {
      type: Number,
      default: 0
    },
    top: {
      type: String
    },
    modelValue: {
      type: Boolean,
      default: !1
    },
    modalClass: String,
    width: {
      type: [String, Number]
    },
    zIndex: {
      type: Number
    },
    trapFocus: {
      type: Boolean,
      default: !1
    }
  })),
  mi = (_mi = {
    open: function open() {
      return !0;
    },
    opened: function opened() {
      return !0;
    },
    close: function close() {
      return !0;
    },
    closed: function closed() {
      return !0;
    }
  }, _defineProperty(_mi, st, function (e) {
    return Je(e);
  }), _defineProperty(_mi, "openAutoFocus", function openAutoFocus() {
    return !0;
  }), _defineProperty(_mi, "closeAutoFocus", function closeAutoFocus() {
    return !0;
  }), _mi),
  gi = function gi(e, t) {
    var n = ct().emit,
      _Rn2 = Rn(),
      r = _Rn2.nextZIndex;
    var s = "";
    var l = rt(),
      i = rt(),
      c = J(!1),
      u = J(!1),
      f = J(!1),
      d = J(e.zIndex || r());
    var b, v;
    var p = Nr("namespace", Ar),
      g = H(function () {
        var Q = {},
          G = "--".concat(p.value, "-dialog");
        return e.fullscreen || (e.top && (Q["".concat(G, "-margin-top")] = e.top), e.width && (Q["".concat(G, "-width")] = Pe(e.width))), Q;
      }),
      h = H(function () {
        return e.alignCenter ? {
          display: "flex"
        } : {};
      });
    function m() {
      n("opened");
    }
    function S() {
      n("closed"), n(st, !1), e.destroyOnClose && (f.value = !1);
    }
    function k() {
      n("close");
    }
    function y() {
      var _Po;
      v == null || v(), b == null || b(), e.openDelay && e.openDelay > 0 ? (_Po = Po(function () {
        return C();
      }, e.openDelay), b = _Po.stop, _Po) : C();
    }
    function V() {
      var _Po2;
      b == null || b(), v == null || v(), e.closeDelay && e.closeDelay > 0 ? (_Po2 = Po(function () {
        return I();
      }, e.closeDelay), v = _Po2.stop, _Po2) : I();
    }
    function E() {
      function Q(G) {
        G || (u.value = !0, c.value = !1);
      }
      e.beforeClose ? e.beforeClose(Q) : V();
    }
    function w() {
      e.closeOnClickModal && E();
    }
    function C() {
      be && (c.value = !0);
    }
    function I() {
      c.value = !1;
    }
    function T() {
      n("openAutoFocus");
    }
    function N() {
      n("closeAutoFocus");
    }
    function A(Q) {
      var G;
      ((G = Q.detail) == null ? void 0 : G.focusReason) === "pointer" && Q.preventDefault();
    }
    e.lockScroll && vs(c);
    function F() {
      e.closeOnPressEscape && E();
    }
    return K(function () {
      return e.modelValue;
    }, function (Q) {
      Q ? (u.value = !1, y(), f.value = !0, d.value = e.zIndex ? d.value++ : r(), Be(function () {
        n("open"), t.value && (t.value.scrollTop = 0);
      })) : c.value && V();
    }), K(function () {
      return e.fullscreen;
    }, function (Q) {
      t.value && (Q ? (s = t.value.style.transform, t.value.style.transform = "") : t.value.style.transform = s);
    }), pe(function () {
      e.modelValue && (c.value = !0, f.value = !0, y());
    }), {
      afterEnter: m,
      afterLeave: S,
      beforeLeave: k,
      handleClose: E,
      onModalClick: w,
      close: V,
      doClose: I,
      onOpenAutoFocus: T,
      onCloseAutoFocus: N,
      onCloseRequested: F,
      onFocusoutPrevented: A,
      titleId: l,
      bodyId: i,
      closed: u,
      style: g,
      overlayDialogStyle: h,
      rendered: f,
      visible: c,
      zIndex: d
    };
  },
  hi = ["aria-label", "aria-labelledby", "aria-describedby"],
  bi = z({
    name: "ElDialog",
    inheritAttrs: !1
  }),
  Ci = z(_objectSpread(_objectSpread({}, bi), {}, {
    props: vi,
    emits: mi,
    setup: function setup(e, _ref28) {
      var t = _ref28.expose;
      var o = e,
        n = vn();
      Dt({
        scope: "el-dialog",
        from: "the title slot",
        replacement: "the header slot",
        version: "3.0.0",
        ref: "https://element-plus.org/en-US/component/dialog.html#slots"
      }, H(function () {
        return !!n.title;
      })), Dt({
        scope: "el-dialog",
        from: "custom-class",
        replacement: "class",
        version: "2.3.0",
        ref: "https://element-plus.org/en-US/component/dialog.html#attributes",
        type: "Attribute"
      }, H(function () {
        return !!o.customClass;
      }));
      var r = oe("dialog"),
        s = J(),
        l = J(),
        i = J(),
        _gi = gi(o, s),
        c = _gi.visible,
        u = _gi.titleId,
        f = _gi.bodyId,
        d = _gi.style,
        b = _gi.overlayDialogStyle,
        v = _gi.rendered,
        p = _gi.zIndex,
        g = _gi.afterEnter,
        h = _gi.afterLeave,
        m = _gi.beforeLeave,
        S = _gi.handleClose,
        k = _gi.onModalClick,
        y = _gi.onOpenAutoFocus,
        V = _gi.onCloseAutoFocus,
        E = _gi.onCloseRequested,
        w = _gi.onFocusoutPrevented;
      ce(Xn, {
        dialogRef: s,
        headerRef: l,
        bodyId: f,
        ns: r,
        rendered: v,
        style: d
      });
      var C = Pn(k),
        I = H(function () {
          return o.draggable && !o.fullscreen;
        });
      return t({
        visible: c,
        dialogContentRef: i
      }), function (T, N) {
        return P(), U(pn, {
          to: "body",
          disabled: !T.appendToBody
        }, [R(Ft, {
          name: "dialog-fade",
          onAfterEnter: a(g),
          onAfterLeave: a(h),
          onBeforeLeave: a(m),
          persisted: ""
        }, {
          default: Z(function () {
            return [Ot(R(a(li), {
              "custom-mask-event": "",
              mask: T.modal,
              "overlay-class": T.modalClass,
              "z-index": a(p)
            }, {
              default: Z(function () {
                return [O("div", {
                  role: "dialog",
                  "aria-modal": "true",
                  "aria-label": T.title || void 0,
                  "aria-labelledby": T.title ? void 0 : a(u),
                  "aria-describedby": a(f),
                  class: j("".concat(a(r).namespace.value, "-overlay-dialog")),
                  style: ue(a(b)),
                  onClick: N[0] || (N[0] = function () {
                    var _a3;
                    return a(C).onClick && (_a3 = a(C)).onClick.apply(_a3, arguments);
                  }),
                  onMousedown: N[1] || (N[1] = function () {
                    var _a4;
                    return a(C).onMousedown && (_a4 = a(C)).onMousedown.apply(_a4, arguments);
                  }),
                  onMouseup: N[2] || (N[2] = function () {
                    var _a5;
                    return a(C).onMouseup && (_a5 = a(C)).onMouseup.apply(_a5, arguments);
                  })
                }, [R(a(Yn), {
                  loop: "",
                  trapped: a(c),
                  "focus-start-el": "container",
                  onFocusAfterTrapped: a(y),
                  onFocusAfterReleased: a(V),
                  onFocusoutPrevented: a(w),
                  onReleaseRequested: a(E)
                }, {
                  default: Z(function () {
                    return [a(v) ? (P(), U(fi, Se({
                      key: 0,
                      ref_key: "dialogContentRef",
                      ref: i
                    }, T.$attrs, {
                      "custom-class": T.customClass,
                      center: T.center,
                      "align-center": T.alignCenter,
                      "close-icon": T.closeIcon,
                      draggable: a(I),
                      fullscreen: T.fullscreen,
                      "show-close": T.showClose,
                      title: T.title,
                      onClose: a(S)
                    }), mn({
                      header: Z(function () {
                        return [T.$slots.title ? D(T.$slots, "title", {
                          key: 1
                        }) : D(T.$slots, "header", {
                          key: 0,
                          close: a(S),
                          titleId: a(u),
                          titleClass: a(r).e("title")
                        })];
                      }),
                      default: Z(function () {
                        return [D(T.$slots, "default")];
                      }),
                      _: 2
                    }, [T.$slots.footer ? {
                      name: "footer",
                      fn: Z(function () {
                        return [D(T.$slots, "footer")];
                      })
                    } : void 0]), 1040, ["custom-class", "center", "align-center", "close-icon", "draggable", "fullscreen", "show-close", "title", "onClose"])) : X("v-if", !0)];
                  }),
                  _: 3
                }, 8, ["trapped", "onFocusAfterTrapped", "onFocusAfterReleased", "onFocusoutPrevented", "onReleaseRequested"])], 46, hi)];
              }),
              _: 3
            }, 8, ["mask", "overlay-class", "z-index"]), [[xt, a(c)]])];
          }),
          _: 3
        }, 8, ["onAfterEnter", "onAfterLeave", "onBeforeLeave"])], 8, ["disabled"]);
      };
    }
  }));
var yi = x(Ci, [["__file", "/home/runner/work/element-plus/element-plus/packages/components/dialog/src/dialog.vue"]]);
var wi = He(yi),
  Ei = te({
    direction: {
      type: String,
      values: ["horizontal", "vertical"],
      default: "horizontal"
    },
    contentPosition: {
      type: String,
      values: ["left", "center", "right"],
      default: "center"
    },
    borderStyle: {
      type: B(String),
      default: "solid"
    }
  }),
  Si = z({
    name: "ElDivider"
  }),
  ki = z(_objectSpread(_objectSpread({}, Si), {}, {
    props: Ei,
    setup: function setup(e) {
      var t = e,
        o = oe("divider"),
        n = H(function () {
          return o.cssVar({
            "border-style": t.borderStyle
          });
        });
      return function (r, s) {
        return P(), Y("div", {
          class: j([a(o).b(), a(o).m(r.direction)]),
          style: ue(a(n)),
          role: "separator"
        }, [r.$slots.default && r.direction !== "vertical" ? (P(), Y("div", {
          key: 0,
          class: j([a(o).e("text"), a(o).is(r.contentPosition)])
        }, [D(r.$slots, "default")], 2)) : X("v-if", !0)], 6);
      };
    }
  }));
var Hi = x(ki, [["__file", "/home/runner/work/element-plus/element-plus/packages/components/divider/src/divider.vue"]]);
var Vi = He(Hi),
  Ii = z({
    inheritAttrs: !1
  });
function Ti(e, t, o, n, r, s) {
  return D(e.$slots, "default");
}
var Mi = x(Ii, [["render", Ti], ["__file", "/home/runner/work/element-plus/element-plus/packages/components/collection/src/collection.vue"]]);
var Oi = z({
  name: "ElCollectionItem",
  inheritAttrs: !1
});
function Ji(e, t, o, n, r, s) {
  return D(e.$slots, "default");
}
var Pi = x(Oi, [["render", Ji], ["__file", "/home/runner/work/element-plus/element-plus/packages/components/collection/src/collection-item.vue"]]);
var _n = "data-el-collection-item",
  $n = function $n(e) {
    var t = "El".concat(e, "Collection"),
      o = "".concat(t, "Item"),
      n = Symbol(t),
      r = Symbol(o),
      s = _objectSpread(_objectSpread({}, Mi), {}, {
        name: t,
        setup: function setup() {
          var i = J(null),
            c = new Map();
          ce(n, {
            itemMap: c,
            getItems: function getItems() {
              var f = a(i);
              if (!f) return [];
              var d = Array.from(f.querySelectorAll("[".concat(_n, "]")));
              return _toConsumableArray(c.values()).sort(function (v, p) {
                return d.indexOf(v.ref) - d.indexOf(p.ref);
              });
            },
            collectionRef: i
          });
        }
      }),
      l = _objectSpread(_objectSpread({}, Pi), {}, {
        name: o,
        setup: function setup(i, _ref27) {
          var c = _ref27.attrs;
          var u = J(null),
            f = W(n, void 0);
          ce(r, {
            collectionItemRef: u
          }), pe(function () {
            var d = a(u);
            d && f.itemMap.set(d, _objectSpread({
              ref: d
            }, c));
          }), fe(function () {
            var d = a(u);
            f.itemMap.delete(d);
          });
        }
      });
    return {
      COLLECTION_INJECTION_KEY: n,
      COLLECTION_ITEM_INJECTION_KEY: r,
      ElCollection: s,
      ElCollectionItem: l
    };
  },
  Li = te({
    style: {
      type: B([String, Array, Object])
    },
    currentTabId: {
      type: B(String)
    },
    defaultCurrentTabId: String,
    loop: Boolean,
    dir: {
      type: String,
      values: ["ltr", "rtl"],
      default: "ltr"
    },
    orientation: {
      type: B(String)
    },
    onBlur: Function,
    onFocus: Function,
    onMousedown: Function
  }),
  _$n = $n("RovingFocusGroup"),
  Zi = _$n.ElCollection,
  Ri = _$n.ElCollectionItem,
  vo = _$n.COLLECTION_INJECTION_KEY,
  zi = _$n.COLLECTION_ITEM_INJECTION_KEY,
  mo = Symbol("elRovingFocusGroup"),
  er = Symbol("elRovingFocusGroupItem"),
  Ni = {
    ArrowLeft: "prev",
    ArrowUp: "prev",
    ArrowRight: "next",
    ArrowDown: "next",
    PageUp: "first",
    Home: "first",
    PageDown: "last",
    End: "last"
  },
  Ai = function Ai(e, t) {
    if (t !== "rtl") return e;
    switch (e) {
      case $.right:
        return $.left;
      case $.left:
        return $.right;
      default:
        return e;
    }
  },
  Bi = function Bi(e, t, o) {
    var n = Ai(e.key, o);
    if (!(t === "vertical" && [$.left, $.right].includes(n)) && !(t === "horizontal" && [$.up, $.down].includes(n))) return Ni[n];
  },
  Di = function Di(e, t) {
    return e.map(function (o, n) {
      return e[(n + t) % e.length];
    });
  },
  go = function go(e) {
    var _document = document,
      t = _document.activeElement;
    var _iterator4 = _createForOfIteratorHelper(e),
      _step4;
    try {
      for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
        var o = _step4.value;
        if (o === t || (o.focus(), t !== document.activeElement)) return;
      }
    } catch (err) {
      _iterator4.e(err);
    } finally {
      _iterator4.f();
    }
  },
  rn = "currentTabIdChange",
  sn = "rovingFocusGroup.entryFocus",
  ji = {
    bubbles: !1,
    cancelable: !0
  },
  Qi = z({
    name: "ElRovingFocusGroupImpl",
    inheritAttrs: !1,
    props: Li,
    emits: [rn, "entryFocus"],
    setup: function setup(e, _ref29) {
      var t = _ref29.emit;
      var o;
      var n = J((o = e.currentTabId || e.defaultCurrentTabId) != null ? o : null),
        r = J(!1),
        s = J(!1),
        l = J(null),
        _W8 = W(vo, void 0),
        i = _W8.getItems,
        c = H(function () {
          return [{
            outline: "none"
          }, e.style];
        }),
        u = function u(g) {
          t(rn, g);
        },
        f = function f() {
          r.value = !0;
        },
        d = ne(function (g) {
          var h;
          (h = e.onMousedown) == null || h.call(e, g);
        }, function () {
          s.value = !0;
        }),
        b = ne(function (g) {
          var h;
          (h = e.onFocus) == null || h.call(e, g);
        }, function (g) {
          var h = !a(s),
            m = g.target,
            S = g.currentTarget;
          if (m === S && h && !a(r)) {
            var k = new Event(sn, ji);
            if (S == null || S.dispatchEvent(k), !k.defaultPrevented) {
              var y = i().filter(function (I) {
                  return I.focusable;
                }),
                V = y.find(function (I) {
                  return I.active;
                }),
                E = y.find(function (I) {
                  return I.id === a(n);
                }),
                C = [V, E].concat(_toConsumableArray(y)).filter(Boolean).map(function (I) {
                  return I.ref;
                });
              go(C);
            }
          }
          s.value = !1;
        }),
        v = ne(function (g) {
          var h;
          (h = e.onBlur) == null || h.call(e, g);
        }, function () {
          r.value = !1;
        }),
        p = function p() {
          for (var _len2 = arguments.length, g = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            g[_key2] = arguments[_key2];
          }
          t.apply(void 0, ["entryFocus"].concat(g));
        };
      ce(mo, {
        currentTabbedId: fn(n),
        loop: de(e, "loop"),
        tabIndex: H(function () {
          return a(r) ? -1 : 0;
        }),
        rovingFocusGroupRef: l,
        rovingFocusGroupRootStyle: c,
        orientation: de(e, "orientation"),
        dir: de(e, "dir"),
        onItemFocus: u,
        onItemShiftTab: f,
        onBlur: v,
        onFocus: b,
        onMousedown: d
      }), K(function () {
        return e.currentTabId;
      }, function (g) {
        n.value = g !== null && g !== void 0 ? g : null;
      }), Tt(l, sn, p);
    }
  });
function qi(e, t, o, n, r, s) {
  return D(e.$slots, "default");
}
var Yi = x(Qi, [["render", qi], ["__file", "/home/runner/work/element-plus/element-plus/packages/components/roving-focus-group/src/roving-focus-group-impl.vue"]]);
var xi = z({
  name: "ElRovingFocusGroup",
  components: {
    ElFocusGroupCollection: Zi,
    ElRovingFocusGroupImpl: Yi
  }
});
function Fi(e, t, o, n, r, s) {
  var l = se("el-roving-focus-group-impl"),
    i = se("el-focus-group-collection");
  return P(), U(i, null, {
    default: Z(function () {
      return [R(l, kr(Hr(e.$attrs)), {
        default: Z(function () {
          return [D(e.$slots, "default")];
        }),
        _: 3
      }, 16)];
    }),
    _: 3
  });
}
var Ki = x(xi, [["render", Fi], ["__file", "/home/runner/work/element-plus/element-plus/packages/components/roving-focus-group/src/roving-focus-group.vue"]]);
var Ui = z({
  components: {
    ElRovingFocusCollectionItem: Ri
  },
  props: {
    focusable: {
      type: Boolean,
      default: !0
    },
    active: {
      type: Boolean,
      default: !1
    }
  },
  emits: ["mousedown", "focus", "keydown"],
  setup: function setup(e, _ref30) {
    var t = _ref30.emit;
    var _W9 = W(mo, void 0),
      o = _W9.currentTabbedId,
      n = _W9.loop,
      r = _W9.onItemFocus,
      s = _W9.onItemShiftTab,
      _W10 = W(vo, void 0),
      l = _W10.getItems,
      i = rt(),
      c = J(null),
      u = ne(function (v) {
        t("mousedown", v);
      }, function (v) {
        e.focusable ? r(a(i)) : v.preventDefault();
      }),
      f = ne(function (v) {
        t("focus", v);
      }, function () {
        r(a(i));
      }),
      d = ne(function (v) {
        t("keydown", v);
      }, function (v) {
        var p = v.key,
          g = v.shiftKey,
          h = v.target,
          m = v.currentTarget;
        if (p === $.tab && g) {
          s();
          return;
        }
        if (h !== m) return;
        var S = Bi(v);
        if (S) {
          v.preventDefault();
          var y = l().filter(function (V) {
            return V.focusable;
          }).map(function (V) {
            return V.ref;
          });
          switch (S) {
            case "last":
              {
                y.reverse();
                break;
              }
            case "prev":
            case "next":
              {
                S === "prev" && y.reverse();
                var V = y.indexOf(m);
                y = n.value ? Di(y, V + 1) : y.slice(V + 1);
                break;
              }
          }
          Be(function () {
            go(y);
          });
        }
      }),
      b = H(function () {
        return o.value === a(i);
      });
    return ce(er, {
      rovingFocusGroupItemRef: c,
      tabIndex: H(function () {
        return a(b) ? 0 : -1;
      }),
      handleMousedown: u,
      handleFocus: f,
      handleKeydown: d
    }), {
      id: i,
      handleKeydown: d,
      handleFocus: f,
      handleMousedown: u
    };
  }
});
function Gi(e, t, o, n, r, s) {
  var l = se("el-roving-focus-collection-item");
  return P(), U(l, {
    id: e.id,
    focusable: e.focusable,
    active: e.active
  }, {
    default: Z(function () {
      return [D(e.$slots, "default")];
    }),
    _: 3
  }, 8, ["id", "focusable", "active"]);
}
var Xi = x(Ui, [["render", Gi], ["__file", "/home/runner/work/element-plus/element-plus/packages/components/roving-focus-group/src/roving-focus-item.vue"]]);
var Ht = te({
    trigger: it.trigger,
    effect: _objectSpread(_objectSpread({}, ve.effect), {}, {
      default: "light"
    }),
    type: {
      type: B(String)
    },
    placement: {
      type: B(String),
      default: "bottom"
    },
    popperOptions: {
      type: B(Object),
      default: function _default() {
        return {};
      }
    },
    id: String,
    size: {
      type: String,
      default: ""
    },
    splitButton: Boolean,
    hideOnClick: {
      type: Boolean,
      default: !0
    },
    loop: {
      type: Boolean,
      default: !0
    },
    showTimeout: {
      type: Number,
      default: 150
    },
    hideTimeout: {
      type: Number,
      default: 150
    },
    tabindex: {
      type: B([Number, String]),
      default: 0
    },
    maxHeight: {
      type: B([Number, String]),
      default: ""
    },
    popperClass: {
      type: String,
      default: ""
    },
    disabled: {
      type: Boolean,
      default: !1
    },
    role: {
      type: String,
      default: "menu"
    },
    buttonProps: {
      type: B(Object)
    },
    teleported: ve.teleported
  }),
  tr = te({
    command: {
      type: [Object, String, Number],
      default: function _default() {
        return {};
      }
    },
    disabled: Boolean,
    divided: Boolean,
    textValue: String,
    icon: {
      type: It
    }
  }),
  Wi = te({
    onKeydown: {
      type: B(Function)
    }
  }),
  _i = [$.down, $.pageDown, $.home],
  or = [$.up, $.pageUp, $.end],
  $i = [].concat(_i, or),
  _$n2 = $n("Dropdown"),
  ec = _$n2.ElCollection,
  tc = _$n2.ElCollectionItem,
  oc = _$n2.COLLECTION_INJECTION_KEY,
  nc = _$n2.COLLECTION_ITEM_INJECTION_KEY,
  Lt = Symbol("elDropdown"),
  rc = Kt.ButtonGroup,
  sc = z({
    name: "ElDropdown",
    components: {
      ElButton: Kt,
      ElButtonGroup: rc,
      ElScrollbar: Ya,
      ElDropdownCollection: ec,
      ElTooltip: fo,
      ElRovingFocusGroup: Ki,
      ElOnlyChild: Dn,
      ElIcon: ze,
      ArrowDown: Br
    },
    props: Ht,
    emits: ["visible-change", "click", "command"],
    setup: function setup(e, _ref31) {
      var t = _ref31.emit;
      var o = ct(),
        n = oe("dropdown"),
        _Cn2 = Cn(),
        r = _Cn2.t,
        s = J(),
        l = J(),
        i = J(null),
        c = J(null),
        u = J(null),
        f = J(null),
        d = J(!1),
        b = [$.enter, $.space, $.down],
        v = H(function () {
          return {
            maxHeight: Pe(e.maxHeight)
          };
        }),
        p = H(function () {
          return [n.m(y.value)];
        }),
        g = rt().value,
        h = H(function () {
          return e.id || g;
        });
      K([s, de(e, "trigger")], function (_ref32, _ref33) {
        var _ref34 = _slicedToArray(_ref32, 2),
          L = _ref34[0],
          M = _ref34[1];
        var _ref35 = _slicedToArray(_ref33, 1),
          ee = _ref35[0];
        var ae, Ve, q;
        var Me = dn(M) ? M : [M];
        (ae = ee == null ? void 0 : ee.$el) != null && ae.removeEventListener && ee.$el.removeEventListener("pointerenter", E), (Ve = L == null ? void 0 : L.$el) != null && Ve.removeEventListener && L.$el.removeEventListener("pointerenter", E), (q = L == null ? void 0 : L.$el) != null && q.addEventListener && Me.includes("hover") && L.$el.addEventListener("pointerenter", E);
      }, {
        immediate: !0
      }), fe(function () {
        var L, M;
        (M = (L = s.value) == null ? void 0 : L.$el) != null && M.removeEventListener && s.value.$el.removeEventListener("pointerenter", E);
      });
      function m() {
        S();
      }
      function S() {
        var L;
        (L = i.value) == null || L.onClose();
      }
      function k() {
        var L;
        (L = i.value) == null || L.onOpen();
      }
      var y = Ut();
      function V() {
        for (var _len3 = arguments.length, L = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
          L[_key3] = arguments[_key3];
        }
        t.apply(void 0, ["command"].concat(L));
      }
      function E() {
        var L, M;
        (M = (L = s.value) == null ? void 0 : L.$el) == null || M.focus();
      }
      function w() {}
      function C() {
        var L = a(c);
        L == null || L.focus(), f.value = null;
      }
      function I(L) {
        f.value = L;
      }
      function T(L) {
        d.value || (L.preventDefault(), L.stopImmediatePropagation());
      }
      function N() {
        t("visible-change", !0);
      }
      function A(L) {
        (L == null ? void 0 : L.type) === "keydown" && c.value.focus();
      }
      function F() {
        t("visible-change", !1);
      }
      return ce(Lt, {
        contentRef: c,
        role: H(function () {
          return e.role;
        }),
        triggerId: h,
        isUsingKeyboard: d,
        onItemEnter: w,
        onItemLeave: C
      }), ce("elDropdown", {
        instance: o,
        dropdownSize: y,
        handleClick: m,
        commandHandler: V,
        trigger: de(e, "trigger"),
        hideOnClick: de(e, "hideOnClick")
      }), {
        t: r,
        ns: n,
        scrollbar: u,
        wrapStyle: v,
        dropdownTriggerKls: p,
        dropdownSize: y,
        triggerId: h,
        triggerKeys: b,
        currentTabId: f,
        handleCurrentTabIdChange: I,
        handlerMainButtonClick: function handlerMainButtonClick(L) {
          t("click", L);
        },
        handleEntryFocus: T,
        handleClose: S,
        handleOpen: k,
        handleBeforeShowTooltip: N,
        handleShowTooltip: A,
        handleBeforeHideTooltip: F,
        onFocusAfterTrapped: function onFocusAfterTrapped(L) {
          var M, ee;
          L.preventDefault(), (ee = (M = c.value) == null ? void 0 : M.focus) == null || ee.call(M, {
            preventScroll: !0
          });
        },
        popperRef: i,
        contentRef: c,
        triggeringElementRef: s,
        referenceElementRef: l
      };
    }
  });
function ac(e, t, o, n, r, s) {
  var l;
  var i = se("el-dropdown-collection"),
    c = se("el-roving-focus-group"),
    u = se("el-scrollbar"),
    f = se("el-only-child"),
    d = se("el-tooltip"),
    b = se("el-button"),
    v = se("arrow-down"),
    p = se("el-icon"),
    g = se("el-button-group");
  return P(), Y("div", {
    class: j([e.ns.b(), e.ns.is("disabled", e.disabled)])
  }, [R(d, {
    ref: "popperRef",
    role: e.role,
    effect: e.effect,
    "fallback-placements": ["bottom", "top"],
    "popper-options": e.popperOptions,
    "gpu-acceleration": !1,
    "hide-after": e.trigger === "hover" ? e.hideTimeout : 0,
    "manual-mode": !0,
    placement: e.placement,
    "popper-class": [e.ns.e("popper"), e.popperClass],
    "reference-element": (l = e.referenceElementRef) == null ? void 0 : l.$el,
    trigger: e.trigger,
    "trigger-keys": e.triggerKeys,
    "trigger-target-el": e.contentRef,
    "show-after": e.trigger === "hover" ? e.showTimeout : 0,
    "stop-popper-mouse-event": !1,
    "virtual-ref": e.triggeringElementRef,
    "virtual-triggering": e.splitButton,
    disabled: e.disabled,
    transition: "".concat(e.ns.namespace.value, "-zoom-in-top"),
    teleported: e.teleported,
    pure: "",
    persistent: "",
    onBeforeShow: e.handleBeforeShowTooltip,
    onShow: e.handleShowTooltip,
    onBeforeHide: e.handleBeforeHideTooltip
  }, mn({
    content: Z(function () {
      return [R(u, {
        ref: "scrollbar",
        "wrap-style": e.wrapStyle,
        tag: "div",
        "view-class": e.ns.e("list")
      }, {
        default: Z(function () {
          return [R(c, {
            loop: e.loop,
            "current-tab-id": e.currentTabId,
            orientation: "horizontal",
            onCurrentTabIdChange: e.handleCurrentTabIdChange,
            onEntryFocus: e.handleEntryFocus
          }, {
            default: Z(function () {
              return [R(i, null, {
                default: Z(function () {
                  return [D(e.$slots, "dropdown")];
                }),
                _: 3
              })];
            }),
            _: 3
          }, 8, ["loop", "current-tab-id", "onCurrentTabIdChange", "onEntryFocus"])];
        }),
        _: 3
      }, 8, ["wrap-style", "view-class"])];
    }),
    _: 2
  }, [e.splitButton ? void 0 : {
    name: "default",
    fn: Z(function () {
      return [R(f, {
        id: e.triggerId,
        ref: "triggeringElementRef",
        role: "button",
        tabindex: e.tabindex
      }, {
        default: Z(function () {
          return [D(e.$slots, "default")];
        }),
        _: 3
      }, 8, ["id", "tabindex"])];
    })
  }]), 1032, ["role", "effect", "popper-options", "hide-after", "placement", "popper-class", "reference-element", "trigger", "trigger-keys", "trigger-target-el", "show-after", "virtual-ref", "virtual-triggering", "disabled", "transition", "teleported", "onBeforeShow", "onShow", "onBeforeHide"]), e.splitButton ? (P(), U(g, {
    key: 0
  }, {
    default: Z(function () {
      return [R(b, Se({
        ref: "referenceElementRef"
      }, e.buttonProps, {
        size: e.dropdownSize,
        type: e.type,
        disabled: e.disabled,
        tabindex: e.tabindex,
        onClick: e.handlerMainButtonClick
      }), {
        default: Z(function () {
          return [D(e.$slots, "default")];
        }),
        _: 3
      }, 16, ["size", "type", "disabled", "tabindex", "onClick"]), R(b, Se({
        id: e.triggerId,
        ref: "triggeringElementRef"
      }, e.buttonProps, {
        role: "button",
        size: e.dropdownSize,
        type: e.type,
        class: e.ns.e("caret-button"),
        disabled: e.disabled,
        tabindex: e.tabindex,
        "aria-label": e.t("el.dropdown.toggleDropdown")
      }), {
        default: Z(function () {
          return [R(p, {
            class: j(e.ns.e("icon"))
          }, {
            default: Z(function () {
              return [R(v)];
            }),
            _: 1
          }, 8, ["class"])];
        }),
        _: 1
      }, 16, ["id", "size", "type", "class", "disabled", "tabindex", "aria-label"])];
    }),
    _: 3
  })) : X("v-if", !0)], 2);
}
var lc = x(sc, [["render", ac], ["__file", "/home/runner/work/element-plus/element-plus/packages/components/dropdown/src/dropdown.vue"]]);
var ic = z({
    name: "DropdownItemImpl",
    components: {
      ElIcon: ze
    },
    props: tr,
    emits: ["pointermove", "pointerleave", "click", "clickimpl"],
    setup: function setup(e, _ref36) {
      var t = _ref36.emit;
      var o = oe("dropdown"),
        _W11 = W(Lt, void 0),
        n = _W11.role,
        _W12 = W(nc, void 0),
        r = _W12.collectionItemRef,
        _W13 = W(zi, void 0),
        s = _W13.collectionItemRef,
        _W14 = W(er, void 0),
        l = _W14.rovingFocusGroupItemRef,
        i = _W14.tabIndex,
        c = _W14.handleFocus,
        u = _W14.handleKeydown,
        f = _W14.handleMousedown,
        d = Wt(r, s, l),
        b = H(function () {
          return n.value === "menu" ? "menuitem" : n.value === "navigation" ? "link" : "button";
        }),
        v = ne(function (p) {
          var g = p.code;
          if (g === $.enter || g === $.space) return p.preventDefault(), p.stopImmediatePropagation(), t("clickimpl", p), !0;
        }, u);
      return {
        ns: o,
        itemRef: d,
        dataset: _defineProperty({}, _n, ""),
        role: b,
        tabIndex: i,
        handleFocus: c,
        handleKeydown: v,
        handleMousedown: f
      };
    }
  }),
  cc = ["aria-disabled", "tabindex", "role"];
function uc(e, t, o, n, r, s) {
  var l = se("el-icon");
  return P(), Y(ot, null, [e.divided ? (P(), Y("li", Se({
    key: 0,
    role: "separator",
    class: e.ns.bem("menu", "item", "divided")
  }, e.$attrs), null, 16)) : X("v-if", !0), O("li", Se({
    ref: e.itemRef
  }, _objectSpread(_objectSpread({}, e.dataset), e.$attrs), {
    "aria-disabled": e.disabled,
    class: [e.ns.be("menu", "item"), e.ns.is("disabled", e.disabled)],
    tabindex: e.tabIndex,
    role: e.role,
    onClick: t[0] || (t[0] = function (i) {
      return e.$emit("clickimpl", i);
    }),
    onFocus: t[1] || (t[1] = function () {
      return e.handleFocus && e.handleFocus.apply(e, arguments);
    }),
    onKeydown: t[2] || (t[2] = nt(function () {
      return e.handleKeydown && e.handleKeydown.apply(e, arguments);
    }, ["self"])),
    onMousedown: t[3] || (t[3] = function () {
      return e.handleMousedown && e.handleMousedown.apply(e, arguments);
    }),
    onPointermove: t[4] || (t[4] = function (i) {
      return e.$emit("pointermove", i);
    }),
    onPointerleave: t[5] || (t[5] = function (i) {
      return e.$emit("pointerleave", i);
    })
  }), [e.icon ? (P(), U(l, {
    key: 0
  }, {
    default: Z(function () {
      return [(P(), U(Ne(e.icon)))];
    }),
    _: 1
  })) : X("v-if", !0), D(e.$slots, "default")], 16, cc)], 64);
}
var dc = x(ic, [["render", uc], ["__file", "/home/runner/work/element-plus/element-plus/packages/components/dropdown/src/dropdown-item-impl.vue"]]);
var nr = function nr() {
    var e = W("elDropdown", {}),
      t = H(function () {
        return e == null ? void 0 : e.dropdownSize;
      });
    return {
      elDropdown: e,
      _elDropdownSize: t
    };
  },
  pc = z({
    name: "ElDropdownItem",
    components: {
      ElDropdownCollectionItem: tc,
      ElRovingFocusItem: Xi,
      ElDropdownItemImpl: dc
    },
    inheritAttrs: !1,
    props: tr,
    emits: ["pointermove", "pointerleave", "click"],
    setup: function setup(e, _ref37) {
      var t = _ref37.emit,
        o = _ref37.attrs;
      var _nr = nr(),
        n = _nr.elDropdown,
        r = ct(),
        s = J(null),
        l = H(function () {
          var v, p;
          return (p = (v = a(s)) == null ? void 0 : v.textContent) != null ? p : "";
        }),
        _W15 = W(Lt, void 0),
        i = _W15.onItemEnter,
        c = _W15.onItemLeave,
        u = ne(function (v) {
          return t("pointermove", v), v.defaultPrevented;
        }, Ro(function (v) {
          if (e.disabled) {
            c(v);
            return;
          }
          var p = v.currentTarget;
          p === document.activeElement || p.contains(document.activeElement) || (i(v), v.defaultPrevented || p == null || p.focus());
        })),
        f = ne(function (v) {
          return t("pointerleave", v), v.defaultPrevented;
        }, Ro(function (v) {
          c(v);
        })),
        d = ne(function (v) {
          if (!e.disabled) return t("click", v), v.type !== "keydown" && v.defaultPrevented;
        }, function (v) {
          var p, g, h;
          if (e.disabled) {
            v.stopImmediatePropagation();
            return;
          }
          (p = n == null ? void 0 : n.hideOnClick) != null && p.value && ((g = n.handleClick) == null || g.call(n)), (h = n.commandHandler) == null || h.call(n, e.command, r, v);
        }),
        b = H(function () {
          return _objectSpread(_objectSpread({}, e), o);
        });
      return {
        handleClick: d,
        handlePointerMove: u,
        handlePointerLeave: f,
        textContent: l,
        propsAndAttrs: b
      };
    }
  });
function fc(e, t, o, n, r, s) {
  var l;
  var i = se("el-dropdown-item-impl"),
    c = se("el-roving-focus-item"),
    u = se("el-dropdown-collection-item");
  return P(), U(u, {
    disabled: e.disabled,
    "text-value": (l = e.textValue) != null ? l : e.textContent
  }, {
    default: Z(function () {
      return [R(c, {
        focusable: !e.disabled
      }, {
        default: Z(function () {
          return [R(i, Se(e.propsAndAttrs, {
            onPointerleave: e.handlePointerLeave,
            onPointermove: e.handlePointerMove,
            onClickimpl: e.handleClick
          }), {
            default: Z(function () {
              return [D(e.$slots, "default")];
            }),
            _: 3
          }, 16, ["onPointerleave", "onPointermove", "onClickimpl"])];
        }),
        _: 3
      }, 8, ["focusable"])];
    }),
    _: 3
  }, 8, ["disabled", "text-value"]);
}
var rr = x(pc, [["render", fc], ["__file", "/home/runner/work/element-plus/element-plus/packages/components/dropdown/src/dropdown-item.vue"]]);
var vc = z({
    name: "ElDropdownMenu",
    props: Wi,
    setup: function setup(e) {
      var t = oe("dropdown"),
        _nr2 = nr(),
        o = _nr2._elDropdownSize,
        n = o.value,
        _W16 = W(io, void 0),
        r = _W16.focusTrapRef,
        s = _W16.onKeydown,
        _W17 = W(Lt, void 0),
        l = _W17.contentRef,
        i = _W17.role,
        c = _W17.triggerId,
        _W18 = W(oc, void 0),
        u = _W18.collectionRef,
        f = _W18.getItems,
        _W19 = W(mo, void 0),
        d = _W19.rovingFocusGroupRef,
        b = _W19.rovingFocusGroupRootStyle,
        v = _W19.tabIndex,
        p = _W19.onBlur,
        g = _W19.onFocus,
        h = _W19.onMousedown,
        _W20 = W(vo, void 0),
        m = _W20.collectionRef,
        S = H(function () {
          return [t.b("menu"), t.bm("menu", n == null ? void 0 : n.value)];
        }),
        k = Wt(l, u, r, d, m),
        y = ne(function (E) {
          var w;
          (w = e.onKeydown) == null || w.call(e, E);
        }, function (E) {
          var w = E.currentTarget,
            C = E.code,
            I = E.target;
          if (w.contains(I), $.tab === C && E.stopImmediatePropagation(), E.preventDefault(), I !== a(l) || !$i.includes(C)) return;
          var N = f().filter(function (A) {
            return !A.disabled;
          }).map(function (A) {
            return A.ref;
          });
          or.includes(C) && N.reverse(), go(N);
        });
      return {
        size: n,
        rovingFocusGroupRootStyle: b,
        tabIndex: v,
        dropdownKls: S,
        role: i,
        triggerId: c,
        dropdownListWrapperRef: k,
        handleKeydown: function handleKeydown(E) {
          y(E), s(E);
        },
        onBlur: p,
        onFocus: g,
        onMousedown: h
      };
    }
  }),
  mc = ["role", "aria-labelledby"];
function gc(e, t, o, n, r, s) {
  return P(), Y("ul", {
    ref: e.dropdownListWrapperRef,
    class: j(e.dropdownKls),
    style: ue(e.rovingFocusGroupRootStyle),
    tabindex: -1,
    role: e.role,
    "aria-labelledby": e.triggerId,
    onBlur: t[0] || (t[0] = function () {
      return e.onBlur && e.onBlur.apply(e, arguments);
    }),
    onFocus: t[1] || (t[1] = function () {
      return e.onFocus && e.onFocus.apply(e, arguments);
    }),
    onKeydown: t[2] || (t[2] = nt(function () {
      return e.handleKeydown && e.handleKeydown.apply(e, arguments);
    }, ["self"])),
    onMousedown: t[3] || (t[3] = nt(function () {
      return e.onMousedown && e.onMousedown.apply(e, arguments);
    }, ["self"]))
  }, [D(e.$slots, "default")], 46, mc);
}
var sr = x(vc, [["render", gc], ["__file", "/home/runner/work/element-plus/element-plus/packages/components/dropdown/src/dropdown-menu.vue"]]);
var hc = He(lc, {
    DropdownItem: rr,
    DropdownMenu: sr
  }),
  bc = Xe(rr),
  Cc = Xe(sr),
  yc = te({
    trigger: it.trigger,
    placement: Ht.placement,
    disabled: it.disabled,
    visible: ve.visible,
    transition: ve.transition,
    popperOptions: Ht.popperOptions,
    tabindex: Ht.tabindex,
    content: ve.content,
    popperStyle: ve.popperStyle,
    popperClass: ve.popperClass,
    enterable: _objectSpread(_objectSpread({}, ve.enterable), {}, {
      default: !0
    }),
    effect: _objectSpread(_objectSpread({}, ve.effect), {}, {
      default: "light"
    }),
    teleported: ve.teleported,
    title: String,
    width: {
      type: [String, Number],
      default: 150
    },
    offset: {
      type: Number,
      default: void 0
    },
    showAfter: {
      type: Number,
      default: 0
    },
    hideAfter: {
      type: Number,
      default: 200
    },
    autoClose: {
      type: Number,
      default: 0
    },
    showArrow: {
      type: Boolean,
      default: !0
    },
    persistent: {
      type: Boolean,
      default: !0
    },
    "onUpdate:visible": {
      type: Function
    }
  }),
  wc = {
    "update:visible": function updateVisible(e) {
      return Je(e);
    },
    "before-enter": function beforeEnter() {
      return !0;
    },
    "before-leave": function beforeLeave() {
      return !0;
    },
    "after-enter": function afterEnter() {
      return !0;
    },
    "after-leave": function afterLeave() {
      return !0;
    }
  },
  Ec = "onUpdate:visible",
  Sc = z({
    name: "ElPopover"
  }),
  kc = z(_objectSpread(_objectSpread({}, Sc), {}, {
    props: yc,
    emits: wc,
    setup: function setup(e, _ref38) {
      var t = _ref38.expose,
        o = _ref38.emit;
      var n = e,
        r = H(function () {
          return n[Ec];
        }),
        s = oe("popover"),
        l = J(),
        i = H(function () {
          var h;
          return (h = a(l)) == null ? void 0 : h.popperRef;
        }),
        c = H(function () {
          return [{
            width: Pe(n.width)
          }, n.popperStyle];
        }),
        u = H(function () {
          return [s.b(), n.popperClass, _defineProperty({}, s.m("plain"), !!n.content)];
        }),
        f = H(function () {
          return n.transition === "".concat(s.namespace.value, "-fade-in-linear");
        }),
        d = function d() {
          var h;
          (h = l.value) == null || h.hide();
        },
        b = function b() {
          o("before-enter");
        },
        v = function v() {
          o("before-leave");
        },
        p = function p() {
          o("after-enter");
        },
        g = function g() {
          o("update:visible", !1), o("after-leave");
        };
      return t({
        popperRef: i,
        hide: d
      }), function (h, m) {
        return P(), U(a(fo), Se({
          ref_key: "tooltipRef",
          ref: l
        }, h.$attrs, {
          trigger: h.trigger,
          placement: h.placement,
          disabled: h.disabled,
          visible: h.visible,
          transition: h.transition,
          "popper-options": h.popperOptions,
          tabindex: h.tabindex,
          content: h.content,
          offset: h.offset,
          "show-after": h.showAfter,
          "hide-after": h.hideAfter,
          "auto-close": h.autoClose,
          "show-arrow": h.showArrow,
          "aria-label": h.title,
          effect: h.effect,
          enterable: h.enterable,
          "popper-class": a(u),
          "popper-style": a(c),
          teleported: h.teleported,
          persistent: h.persistent,
          "gpu-acceleration": a(f),
          "onUpdate:visible": a(r),
          onBeforeShow: b,
          onBeforeHide: v,
          onShow: p,
          onHide: g
        }), {
          content: Z(function () {
            return [h.title ? (P(), Y("div", {
              key: 0,
              class: j(a(s).e("title")),
              role: "title"
            }, _(h.title), 3)) : X("v-if", !0), D(h.$slots, "default", {}, function () {
              return [ye(_(h.content), 1)];
            })];
          }),
          default: Z(function () {
            return [h.$slots.reference ? D(h.$slots, "reference", {
              key: 0
            }) : X("v-if", !0)];
          }),
          _: 3
        }, 16, ["trigger", "placement", "disabled", "visible", "transition", "popper-options", "tabindex", "content", "offset", "show-after", "hide-after", "auto-close", "show-arrow", "aria-label", "effect", "enterable", "popper-class", "popper-style", "teleported", "persistent", "gpu-acceleration", "onUpdate:visible"]);
      };
    }
  }));
var Hc = x(kc, [["__file", "/home/runner/work/element-plus/element-plus/packages/components/popover/src/popover.vue"]]);
var an = function an(e, t) {
  var o = t.arg || t.value,
    n = o == null ? void 0 : o.popperRef;
  n && (n.triggerRef = e);
};
var Vc = {
  mounted: function mounted(e, t) {
    an(e, t);
  },
  updated: function updated(e, t) {
    an(e, t);
  }
};
var Ic = "popover",
  Tc = Dr(Vc, Ic),
  Mc = He(Hc, {
    directive: Tc
  }),
  Oc = te({
    modelValue: {
      type: [Boolean, String, Number],
      default: !1
    },
    disabled: {
      type: Boolean,
      default: !1
    },
    loading: {
      type: Boolean,
      default: !1
    },
    size: {
      type: String,
      validator: ps
    },
    width: {
      type: [String, Number],
      default: ""
    },
    inlinePrompt: {
      type: Boolean,
      default: !1
    },
    activeIcon: {
      type: It
    },
    inactiveIcon: {
      type: It
    },
    activeText: {
      type: String,
      default: ""
    },
    inactiveText: {
      type: String,
      default: ""
    },
    activeValue: {
      type: [Boolean, String, Number],
      default: !0
    },
    inactiveValue: {
      type: [Boolean, String, Number],
      default: !1
    },
    activeColor: {
      type: String,
      default: ""
    },
    inactiveColor: {
      type: String,
      default: ""
    },
    borderColor: {
      type: String,
      default: ""
    },
    name: {
      type: String,
      default: ""
    },
    validateEvent: {
      type: Boolean,
      default: !0
    },
    beforeChange: {
      type: B(Function)
    },
    id: String,
    tabindex: {
      type: [String, Number]
    },
    value: {
      type: [Boolean, String, Number],
      default: !1
    }
  }),
  Jc = (_Jc = {}, _defineProperty(_Jc, st, function (e) {
    return Je(e) || Et(e) || we(e);
  }), _defineProperty(_Jc, jt, function (e) {
    return Je(e) || Et(e) || we(e);
  }), _defineProperty(_Jc, Qt, function (e) {
    return Je(e) || Et(e) || we(e);
  }), _Jc),
  Pc = ["onClick"],
  Lc = ["id", "aria-checked", "aria-disabled", "name", "true-value", "false-value", "disabled", "tabindex", "onKeydown"],
  Zc = ["aria-hidden"],
  Rc = ["aria-hidden"],
  zc = ["aria-hidden"],
  Yt = "ElSwitch",
  Nc = z({
    name: Yt
  }),
  Ac = z(_objectSpread(_objectSpread({}, Nc), {}, {
    props: Oc,
    emits: Jc,
    setup: function setup(e, _ref40) {
      var t = _ref40.expose,
        o = _ref40.emit;
      var n = e,
        r = ct(),
        _jr = jr(),
        s = _jr.formItem,
        l = Ut(),
        i = oe("switch");
      (function (C) {
        C.forEach(function (I) {
          Dt({
            from: I[0],
            replacement: I[1],
            scope: Yt,
            version: "2.3.0",
            ref: "https://element-plus.org/en-US/component/switch.html#attributes",
            type: "Attribute"
          }, H(function () {
            var T;
            return !!((T = r.vnode.props) != null && T[I[2]]);
          }));
        });
      })([['"value"', '"model-value" or "v-model"', "value"], ['"active-color"', "CSS var `--el-switch-on-color`", "activeColor"], ['"inactive-color"', "CSS var `--el-switch-off-color`", "inactiveColor"], ['"border-color"', "CSS var `--el-switch-border-color`", "borderColor"]]);
      var _Qr = Qr(n, {
          formItemContext: s
        }),
        u = _Qr.inputId,
        f = qr(H(function () {
          return n.loading;
        })),
        d = J(n.modelValue !== !1),
        b = J(),
        v = J(),
        p = H(function () {
          return [i.b(), i.m(l.value), i.is("disabled", f.value), i.is("checked", k.value)];
        }),
        g = H(function () {
          return [i.e("label"), i.em("label", "left"), i.is("active", !k.value)];
        }),
        h = H(function () {
          return [i.e("label"), i.em("label", "right"), i.is("active", k.value)];
        }),
        m = H(function () {
          return {
            width: Pe(n.width)
          };
        });
      K(function () {
        return n.modelValue;
      }, function () {
        d.value = !0;
      }), K(function () {
        return n.value;
      }, function () {
        d.value = !1;
      });
      var S = H(function () {
          return d.value ? n.modelValue : n.value;
        }),
        k = H(function () {
          return S.value === n.activeValue;
        });
      [n.activeValue, n.inactiveValue].includes(S.value) || (o(st, n.inactiveValue), o(jt, n.inactiveValue), o(Qt, n.inactiveValue)), K(k, function (C) {
        var I;
        b.value.checked = C, n.validateEvent && ((I = s == null ? void 0 : s.validate) == null || I.call(s, "change").catch(function (T) {
          return Wr();
        }));
      });
      var y = function y() {
          var C = k.value ? n.inactiveValue : n.activeValue;
          o(st, C), o(jt, C), o(Qt, C), Be(function () {
            b.value.checked = k.value;
          });
        },
        V = function V() {
          if (f.value) return;
          var C = n.beforeChange;
          if (!C) {
            y();
            return;
          }
          var I = C();
          [To(I), Je(I)].includes(!0) || Gt(Yt, "beforeChange must return type `Promise<boolean>` or `boolean`"), To(I) ? I.then(function (N) {
            N && y();
          }).catch(function (N) {}) : I && y();
        },
        E = H(function () {
          return i.cssVarBlock(_objectSpread(_objectSpread(_objectSpread({}, n.activeColor ? {
            "on-color": n.activeColor
          } : null), n.inactiveColor ? {
            "off-color": n.inactiveColor
          } : null), n.borderColor ? {
            "border-color": n.borderColor
          } : null));
        }),
        w = function w() {
          var C, I;
          (I = (C = b.value) == null ? void 0 : C.focus) == null || I.call(C);
        };
      return pe(function () {
        b.value.checked = k.value;
      }), t({
        focus: w,
        checked: k
      }), function (C, I) {
        return P(), Y("div", {
          class: j(a(p)),
          style: ue(a(E)),
          onClick: nt(V, ["prevent"])
        }, [O("input", {
          id: a(u),
          ref_key: "input",
          ref: b,
          class: j(a(i).e("input")),
          type: "checkbox",
          role: "switch",
          "aria-checked": a(k),
          "aria-disabled": a(f),
          name: C.name,
          "true-value": C.activeValue,
          "false-value": C.inactiveValue,
          disabled: a(f),
          tabindex: C.tabindex,
          onChange: y,
          onKeydown: Vr(V, ["enter"])
        }, null, 42, Lc), !C.inlinePrompt && (C.inactiveIcon || C.inactiveText) ? (P(), Y("span", {
          key: 0,
          class: j(a(g))
        }, [C.inactiveIcon ? (P(), U(a(ze), {
          key: 0
        }, {
          default: Z(function () {
            return [(P(), U(Ne(C.inactiveIcon)))];
          }),
          _: 1
        })) : X("v-if", !0), !C.inactiveIcon && C.inactiveText ? (P(), Y("span", {
          key: 1,
          "aria-hidden": a(k)
        }, _(C.inactiveText), 9, Zc)) : X("v-if", !0)], 2)) : X("v-if", !0), O("span", {
          ref_key: "core",
          ref: v,
          class: j(a(i).e("core")),
          style: ue(a(m))
        }, [C.inlinePrompt ? (P(), Y("div", {
          key: 0,
          class: j(a(i).e("inner"))
        }, [C.activeIcon || C.inactiveIcon ? (P(), U(a(ze), {
          key: 0,
          class: j(a(i).is("icon"))
        }, {
          default: Z(function () {
            return [(P(), U(Ne(a(k) ? C.activeIcon : C.inactiveIcon)))];
          }),
          _: 1
        }, 8, ["class"])) : C.activeText || C.inactiveText ? (P(), Y("span", {
          key: 1,
          class: j(a(i).is("text")),
          "aria-hidden": !a(k)
        }, _(a(k) ? C.activeText : C.inactiveText), 11, Rc)) : X("v-if", !0)], 2)) : X("v-if", !0), O("div", {
          class: j(a(i).e("action"))
        }, [C.loading ? (P(), U(a(ze), {
          key: 0,
          class: j(a(i).is("loading"))
        }, {
          default: Z(function () {
            return [R(a(Yr))];
          }),
          _: 1
        }, 8, ["class"])) : X("v-if", !0)], 2)], 6), !C.inlinePrompt && (C.activeIcon || C.activeText) ? (P(), Y("span", {
          key: 1,
          class: j(a(h))
        }, [C.activeIcon ? (P(), U(a(ze), {
          key: 0
        }, {
          default: Z(function () {
            return [(P(), U(Ne(C.activeIcon)))];
          }),
          _: 1
        })) : X("v-if", !0), !C.activeIcon && C.activeText ? (P(), Y("span", {
          key: 1,
          "aria-hidden": !a(k)
        }, _(C.activeText), 9, zc)) : X("v-if", !0)], 2)) : X("v-if", !0)], 14, Pc);
      };
    }
  }));
var Bc = x(Ac, [["__file", "/home/runner/work/element-plus/element-plus/packages/components/switch/src/switch.vue"]]);
var Dc = He(Bc),
  jc = te({
    type: {
      type: String,
      values: ["primary", "success", "info", "warning", "danger", ""],
      default: ""
    },
    size: {
      type: String,
      values: gn,
      default: ""
    },
    truncated: {
      type: Boolean
    },
    tag: {
      type: String,
      default: "span"
    }
  }),
  Qc = z({
    name: "ElText"
  }),
  qc = z(_objectSpread(_objectSpread({}, Qc), {}, {
    props: jc,
    setup: function setup(e) {
      var t = e,
        o = Ut(),
        n = oe("text"),
        r = H(function () {
          return [n.b(), n.m(t.type), n.m(o.value), n.is("truncated", t.truncated)];
        });
      return function (s, l) {
        return P(), U(Ne(s.tag), {
          class: j(a(r))
        }, {
          default: Z(function () {
            return [D(s.$slots, "default")];
          }),
          _: 3
        }, 8, ["class"]);
      };
    }
  }));
var Yc = x(qc, [["__file", "/home/runner/work/element-plus/element-plus/packages/components/text/src/text.vue"]]);
var xc = He(Yc);
var Fc = z({
  __name: "index",
  emits: ["onClose", "onConrim"],
  setup: function setup(e, _ref41) {
    var t = _ref41.emit;
    var o = Fr + "/public/web/finderNew?isSelectFolder=true";
    function n(r) {
      var s, l;
      if (((s = r.data) == null ? void 0 : s.groupid) !== void 0 || ((l = r.data) == null ? void 0 : l.id) !== void 0) {
        t("onConrim", r.data);
        return;
      }
      t("onClose");
    }
    return cn(function () {
      var r;
      (r = window == null ? void 0 : window.addEventListener) == null || r.call(window, "message", n);
    }), fe(function () {
      var r;
      (r = window == null ? void 0 : window.removeEventListener) == null || r.call(window, "message", n);
    }), function (r, s) {
      return P(), Y("iframe", {
        class: "main",
        src: o
      });
    };
  }
});
var Kc = function Kc(e, t) {
    var o = e.__vccOpts || e;
    var _iterator5 = _createForOfIteratorHelper(t),
      _step5;
    try {
      for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
        var _step5$value = _slicedToArray(_step5.value, 2),
          n = _step5$value[0],
          r = _step5$value[1];
        o[n] = r;
      }
    } catch (err) {
      _iterator5.e(err);
    } finally {
      _iterator5.f();
    }
    return o;
  },
  Uc = Kc(Fc, [["__scopeId", "data-v-1b61f3c0"]]);
var Gc = "/kdocs/assets/icon-f201c060.svg";
var Xc = function Xc() {
    var e = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
    var t = _r();
    var o,
      n = [];
    var r = ts(),
      s = new Set(),
      l = new Set(),
      i = function i(u, f) {
        switch (u.status) {
          case "undeliverable":
            n.some(function (d) {
              return d.message.messageID === u.message.messageID;
            }) || (n = [].concat(_toConsumableArray(n), [{
              message: u.message,
              resolvedDestination: u.resolvedDestination
            }]));
            return;
          case "deliverable":
            n = n.reduce(function (d, b) {
              return b.resolvedDestination === u.deliverableTo ? (zt.toBackground(f, {
                type: "deliver",
                message: b.message
              }), d) : [].concat(_toConsumableArray(d), [b]);
            }, []);
            return;
          case "delivered":
            u.receipt.message.messageType === "message" && r.add(u.receipt);
            return;
          case "incoming":
            u.message.messageType === "reply" && r.remove(u.message.messageID), s.forEach(function (d) {
              return d(u.message, f);
            });
            return;
          case "terminated":
            {
              var d = r.entries().filter(function (b) {
                return u.fingerprint === b.to;
              });
              r.remove(d), d.forEach(function (_ref42) {
                var b = _ref42.message;
                return l.forEach(function (v) {
                  return v(b);
                });
              });
            }
        }
      },
      c = function c() {
        o = $r.runtime.connect({
          name: es({
            endpointName: e,
            fingerprint: t
          })
        }), o.onMessage.addListener(i), o.onDisconnect.addListener(c), zt.toBackground(o, {
          type: "sync",
          pendingResponses: r.entries(),
          pendingDeliveries: _toConsumableArray(new Set(n.map(function (_ref43) {
            var u = _ref43.resolvedDestination;
            return u;
          })))
        });
      };
    return c(), {
      onFailure: function onFailure(u) {
        l.add(u);
      },
      onMessage: function onMessage(u) {
        s.add(u);
      },
      postMessage: function postMessage(u) {
        zt.toBackground(o, {
          type: "deliver",
          message: u
        });
      }
    };
  },
  Bt,
  Wc = function Wc(e, t, o) {
    var _Bt;
    return (_Bt = Bt) !== null && _Bt !== void 0 ? _Bt : Bt = new Promise(function (n) {
      var r = function r(l) {
          var _l$data = l.data,
            i = _l$data.cmd,
            c = _l$data.scope,
            u = _l$data.context,
            f = l.ports;
          if (i === "webext-port-offer" && c === t && u !== e) return window.removeEventListener("message", r), f[0].onmessage = o, f[0].postMessage("port-accepted"), n(f[0]);
        },
        s = function s() {
          var l = new MessageChannel();
          l.port1.onmessage = function (i) {
            if (i.data === "port-accepted") return window.removeEventListener("message", r), n(l.port1);
            o == null || o(i);
          }, window.postMessage({
            cmd: "webext-port-offer",
            scope: t,
            context: e
          }, "*", [l.port2]);
        };
      window.addEventListener("message", r), e === "window" ? setTimeout(s, 0) : s();
    });
  },
  _c = function _c(e) {
    var t,
      o = !1,
      n,
      r;
    return {
      enable: function enable() {
        return o = !0;
      },
      onMessage: function onMessage(s) {
        return n = s;
      },
      postMessage: function () {
        var _postMessage = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(s) {
          return _regeneratorRuntime().wrap(function _callee2$(_context2) {
            while (1) switch (_context2.prev = _context2.next) {
              case 0:
                if (!(e !== "content-script" && e !== "window")) {
                  _context2.next = 2;
                  break;
                }
                throw new Error("Endpoint does not use postMessage");
              case 2:
                if (o) {
                  _context2.next = 4;
                  break;
                }
                throw new Error("Communication with window has not been allowed");
              case 4:
                $c(t);
                _context2.next = 7;
                return r;
              case 7:
                return _context2.abrupt("return", _context2.sent.postMessage(s));
              case 8:
              case "end":
                return _context2.stop();
            }
          }, _callee2);
        }));
        function postMessage(_x2) {
          return _postMessage.apply(this, arguments);
        }
        return postMessage;
      }(),
      setNamespace: function setNamespace(s) {
        if (t) throw new Error("Namespace once set cannot be changed");
        t = s, r = Wc(e, s, function (_ref44) {
          var l = _ref44.data;
          return n == null ? void 0 : n(l);
        });
      }
    };
  };
function $c(e) {
  if (typeof e != "string" || e.trim().length === 0) throw new Error("webext-bridge uses window.postMessage to talk with other \"window\"(s) for message routingwhich is global/conflicting operation in case there are other scripts using webext-bridge. Call Bridge#setNamespace(nsps) to isolate your app. Example: setNamespace('com.facebook.react-devtools'). Make sure to use same namespace across all your scripts whereever window.postMessage is likely to be used`");
}
var ho = _c("content-script"),
  bo = Xc(),
  pt = os("content-script", function (e) {
    e.destination.context === "window" ? ho.postMessage(e) : bo.postMessage(e);
  });
ho.onMessage(function (e) {
  e.origin = {
    context: "window",
    tabId: null
  }, pt.handleMessage(e);
});
bo.onMessage(pt.handleMessage);
bo.onFailure(function (e) {
  if (e.origin.context === "window") {
    ho.postMessage({
      type: "error",
      transactionID: e.transactionId
    });
    return;
  }
  pt.endTransaction(e.transactionId);
});
var wt = pt.sendMessage,
  Yu = pt.onMessage;
ns(pt);
var eu = {
    class: "flex kdocs-ext-title"
  },
  tu = O("img", {
    class: "kdocs-header-avatar",
    src: Gc
  }, null, -1),
  ou = {
    class: "el-dropdown-link navbar-bg-hover select-none"
  },
  nu = ["src"],
  ru = {
    class: "dark:text-white"
  },
  su = {
    class: "kdocs-options-container"
  },
  au = {
    class: "main-content-header"
  },
  lu = {
    class: "kdocs-options-title"
  },
  iu = {
    class: "kdocs-options-subtitle flex"
  },
  cu = {
    class: "el-form-item asterisk-left"
  },
  uu = {
    class: "el-form-item__label"
  },
  du = {
    class: "el-form-item__content"
  },
  pu = {
    class: "el-form-item asterisk-left"
  },
  fu = {
    class: "el-form-item__label"
  },
  vu = {
    class: "el-form-item__content"
  },
  mu = {
    class: "el-form-item asterisk-left"
  },
  gu = {
    class: "el-form-item__label"
  },
  hu = {
    class: "kdocs-setting-edit"
  },
  bu = O("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 16 16",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, [O("g", {
    "clip-path": "url(#clip0_1165_242063)"
  }, [O("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M8.04004 6C8.59232 6 9.04004 5.55228 9.04004 5C9.04004 4.44772 8.59232 4 8.04004 4C7.48775 4 7.04004 4.44772 7.04004 5C7.04004 5.55228 7.48775 6 8.04004 6Z",
    fill: "#333333"
  }), O("path", {
    d: "M7.25 7.99994H7.75C8.02614 7.99994 8.25 8.2238 8.25 8.49994V11.4999M8.25 11.4999H7.25M8.25 11.4999H9.25",
    stroke: "#333333",
    "stroke-width": "1.5",
    "stroke-linecap": "round",
    "stroke-linejoin": "round"
  }), O("circle", {
    cx: "8",
    cy: "8.00015",
    r: "6.75",
    stroke: "#333333",
    "stroke-width": "1.5"
  })]), O("defs", null, [O("clipPath", {
    id: "clip0_1165_242063"
  }, [O("rect", {
    width: "16",
    height: "16",
    fill: "white"
  })])])], -1),
  Cu = {
    class: "el-form-item__content"
  },
  yu = {
    class: "el-form-item asterisk-left"
  },
  wu = {
    class: "el-form-item__label"
  },
  Eu = {
    class: "kdocs-setting-edit"
  },
  Su = O("div", {
    class: "flex"
  }, [O("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 16 16",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, [O("g", {
    "clip-path": "url(#clip0_1165_242063)"
  }, [O("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M8.04004 6C8.59232 6 9.04004 5.55228 9.04004 5C9.04004 4.44772 8.59232 4 8.04004 4C7.48775 4 7.04004 4.44772 7.04004 5C7.04004 5.55228 7.48775 6 8.04004 6Z",
    fill: "#333333"
  }), O("path", {
    d: "M7.25 7.99994H7.75C8.02614 7.99994 8.25 8.2238 8.25 8.49994V11.4999M8.25 11.4999H7.25M8.25 11.4999H9.25",
    stroke: "#333333",
    "stroke-width": "1.5",
    "stroke-linecap": "round",
    "stroke-linejoin": "round"
  }), O("circle", {
    cx: "8",
    cy: "8.00015",
    r: "6.75",
    stroke: "#333333",
    "stroke-width": "1.5"
  })]), O("defs", null, [O("clipPath", {
    id: "clip0_1165_242063"
  }, [O("rect", {
    width: "16",
    height: "16",
    fill: "white"
  })])])])], -1),
  ku = O("svg", {
    width: "272",
    height: "328",
    viewBox: "0 0 272 328",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    "xmlns:xlink": "http://www.w3.org/1999/xlink"
  }, [O("path", {
    d: "M1.568 5.402H12.474V6.382H10.136V10.092H13.202V11.058H10.136V17.26H9.114V11.058H5.068C4.942 12.5 4.676 13.69 4.256 14.642C3.724 15.818 2.842 16.728 1.61 17.372L1.064 16.504C2.198 15.86 2.996 15.006 3.444 13.942C3.738 13.13 3.934 12.178 4.046 11.058H0.812V10.092H4.102C4.102 9.91 4.116 9.742 4.116 9.602V6.382H1.568V5.402ZM5.152 6.382V9.602C5.152 9.77 5.138 9.938 5.138 10.092H9.114V6.382H5.152ZM26.222 12.066V17.456H25.242V16.728H19.082V17.456H18.102V12.066H26.222ZM19.082 15.776H25.242V13.018H19.082V15.776ZM25.382 7.026H17.192V9.224H25.382V7.026ZM17.192 10.162V10.764C17.178 13.34 16.562 15.566 15.33 17.414L14.546 16.714C15.638 15.174 16.184 13.2 16.198 10.764V6.074H20.86C20.664 5.542 20.44 5.052 20.188 4.604L21.238 4.436C21.448 4.912 21.658 5.458 21.882 6.074H26.376V10.162H17.192ZM31.192 9.504V9.868C31.108 13.004 30.464 15.496 29.288 17.358L28.546 16.588C29.568 14.964 30.114 12.724 30.198 9.868V5.668C33.81 5.626 37.044 5.304 39.928 4.702L40.432 5.612C37.688 6.172 34.608 6.48 31.192 6.564V8.524H41.272V9.504H31.192ZM40.166 11.464V17.4H39.158V16.742H33.488V17.4H32.48V11.464H40.166ZM33.488 15.762H39.158V12.43H33.488V15.762ZM44.604 14.334C44.912 14.334 45.178 14.46 45.374 14.726C45.556 14.978 45.654 15.3 45.654 15.706C45.654 16.322 45.472 16.868 45.108 17.344C44.744 17.792 44.254 18.1 43.666 18.254V17.568C44.03 17.442 44.324 17.232 44.548 16.952C44.758 16.658 44.856 16.35 44.856 16.014C44.8 16.042 44.688 16.07 44.548 16.07C44.31 16.07 44.114 15.986 43.946 15.818C43.778 15.65 43.694 15.44 43.694 15.202C43.694 14.936 43.778 14.726 43.946 14.572C44.114 14.404 44.324 14.334 44.604 14.334ZM58.324 9.63C57.848 10.274 57.344 10.876 56.798 11.45L56.476 10.386C57.988 8.678 59.094 6.704 59.78 4.492L60.718 4.94C60.354 6.046 59.892 7.096 59.332 8.076V17.4H58.324V9.63ZM67.34 10.134C68.054 11.786 68.67 13.564 69.202 15.468L68.32 15.86C67.76 13.816 67.13 11.996 66.444 10.428L67.34 10.134ZM62.524 7.25C62.076 8.342 61.558 9.322 60.97 10.218L60.102 9.686C61.166 8.132 61.936 6.41 62.412 4.52L63.364 4.716C63.224 5.262 63.056 5.78 62.888 6.27H68.852V6.928C68.628 7.796 68.348 8.65 67.998 9.49L67.032 9.21C67.354 8.622 67.62 7.978 67.83 7.25H62.524ZM64.274 17.302H62.44L62.23 16.35C62.818 16.392 63.392 16.42 63.924 16.42C64.274 16.42 64.456 16.238 64.456 15.874V8.426H65.436V16.126C65.436 16.91 65.044 17.302 64.274 17.302ZM62.174 10.246L63.084 10.498C62.58 12.444 61.922 14.152 61.11 15.622L60.172 15.286C60.928 13.97 61.6 12.29 62.174 10.246ZM75.39 11.352H80.71V9.938H81.718V11.352H83.412V12.318H81.718V16.098C81.718 16.938 81.27 17.358 80.374 17.358H78.512L78.302 16.392C78.904 16.434 79.478 16.462 80.024 16.462C80.472 16.462 80.71 16.252 80.71 15.846V12.318H75.39V11.352ZM73.542 4.562H74.564V17.386H73.542V12.752C72.618 13.62 71.764 14.306 70.98 14.824L70.532 13.858C71.372 13.354 72.366 12.57 73.542 11.534V4.562ZM77.168 12.892C77.952 13.746 78.54 14.488 78.96 15.132L78.176 15.692C77.742 14.992 77.154 14.208 76.426 13.354L77.168 12.892ZM78.148 6.522C77.504 7.264 76.706 7.88 75.74 8.384L75.096 7.6C76.622 6.844 77.644 5.822 78.176 4.548L79.212 4.744C79.086 5.038 78.946 5.318 78.792 5.598H82.88V6.466C82.082 8.51 79.87 9.952 76.258 10.778L75.754 9.882C76.86 9.644 77.826 9.35 78.666 9.014C78.218 8.594 77.77 8.244 77.336 7.936L78.05 7.39C78.568 7.768 79.058 8.174 79.52 8.608C80.57 8.034 81.326 7.334 81.788 6.522H78.148ZM71.414 6.2C72.072 7.152 72.632 8.174 73.108 9.252L72.226 9.616C71.722 8.44 71.162 7.418 70.546 6.55L71.414 6.2ZM89.026 11.086H92.232V8.482H93.254V11.086H96.6V12.066H93.254V15.93H97.23V16.924H88.452V15.93H92.232V12.066H89.026V11.086ZM86.772 11.702C86.254 12.234 85.708 12.752 85.12 13.242L84.49 12.416C86.24 10.974 87.598 9.322 88.578 7.46H84.98V6.466H89.054C89.334 5.822 89.586 5.15 89.782 4.464L90.832 4.59C90.636 5.234 90.426 5.864 90.174 6.466H97.216V7.46H89.726C89.18 8.566 88.522 9.602 87.766 10.554V17.442H86.772V11.702ZM99.26 14.628L98.952 13.774C99.148 13.69 99.26 13.578 99.26 13.438V5.766H100.24V13.41C100.94 13.214 101.64 12.976 102.34 12.71V4.632H103.334V17.316H102.34V13.69C101.36 14.04 100.324 14.348 99.26 14.628ZM106.19 7.684C106.022 8.132 105.854 8.552 105.672 8.944C106.176 10.316 106.82 11.576 107.632 12.724C108.472 11.296 108.92 9.616 109.004 7.684H106.19ZM105.084 10.036C104.818 10.456 104.538 10.834 104.244 11.184L103.614 10.414C104.762 8.958 105.546 6.984 105.952 4.52L106.96 4.688C106.82 5.402 106.666 6.074 106.498 6.69H111.174V7.684H109.97C109.872 9.98 109.312 11.954 108.276 13.578C109.2 14.726 110.264 15.748 111.496 16.644L110.81 17.456C109.592 16.546 108.542 15.538 107.66 14.446C106.736 15.608 105.546 16.574 104.09 17.358L103.516 16.448C104.986 15.72 106.162 14.782 107.03 13.634C106.246 12.514 105.588 11.324 105.084 10.036ZM112.91 5.458H116.172V4.562H117.208V5.458H120.806V4.576H121.842V5.458H125.104V6.34H121.842V7.11H122.556V7.894H123.676C123.536 7.516 123.382 7.166 123.214 6.844L124.068 6.704C124.208 7.054 124.362 7.446 124.502 7.894H125.202V8.748H122.57C122.626 10.526 122.738 11.898 122.906 12.85C122.934 13.018 122.962 13.172 122.99 13.312C123.382 12.276 123.648 11.072 123.788 9.686L124.642 9.868C124.418 11.856 123.984 13.466 123.326 14.726C123.41 15.006 123.494 15.244 123.592 15.44C123.844 15.972 124.054 16.252 124.194 16.252C124.362 16.238 124.53 15.608 124.67 14.348L125.398 14.754C125.16 16.49 124.81 17.358 124.362 17.358C123.998 17.358 123.592 17.008 123.172 16.336C123.032 16.112 122.92 15.874 122.808 15.594C122.276 16.322 121.66 16.896 120.96 17.316L120.484 16.56L120.722 16.406H117.054V9.574H121.044V10.386H119.812V11.604H121.03V14.264H119.812V15.594H121.044V16.168C121.576 15.72 122.038 15.174 122.43 14.516C122.304 14.11 122.192 13.676 122.108 13.2C121.884 12.052 121.744 10.568 121.688 8.748H116.27V13.018C116.242 14.838 115.92 16.294 115.304 17.4L114.576 16.742C115.08 15.846 115.332 14.614 115.36 13.018V12.864H114.24C114.184 14.74 113.834 16.042 113.218 16.784L112.518 16.238C113.078 15.622 113.386 14.502 113.442 12.864H112.644V12.024H115.36V10.61H113.218V7.418H114.086V9.77H115.36V7.894H121.674V7.32H120.806V6.34H117.208V7.306H116.172V6.34H112.91V5.458ZM119.014 10.386H117.88V11.604H119.014V10.386ZM117.88 12.346V13.508H120.246V12.346H117.88ZM117.88 14.264V15.594H119.014V14.264H117.88ZM132.594 14.222C132.146 13.508 131.698 12.836 131.264 12.206C130.76 13.578 130.144 14.754 129.43 15.734L128.786 14.95C129.514 13.914 130.116 12.682 130.592 11.268C129.92 10.372 129.262 9.56 128.618 8.818L129.248 8.216C129.766 8.762 130.326 9.42 130.914 10.204C131.18 9.224 131.404 8.16 131.572 7.04L132.496 7.208C132.272 8.65 131.978 9.966 131.614 11.156C132.146 11.884 132.706 12.682 133.266 13.55L132.594 14.222ZM136.696 14.866C136.22 14.04 135.744 13.27 135.282 12.542C134.722 13.914 134.064 15.09 133.308 16.07L132.664 15.3C133.448 14.236 134.106 12.99 134.624 11.562C133.98 10.61 133.35 9.742 132.706 8.958L133.336 8.356C133.84 8.93 134.4 9.63 134.988 10.47C135.296 9.42 135.534 8.286 135.73 7.082L136.682 7.25C136.43 8.804 136.094 10.204 135.674 11.464C136.206 12.276 136.78 13.186 137.382 14.194L136.696 14.866ZM137.34 17.316H135.926L135.66 16.336L137.004 16.378C137.396 16.378 137.592 16.182 137.592 15.804V6.102H128.408V17.372H127.414V5.136H138.586V16.028C138.586 16.882 138.166 17.316 137.34 17.316ZM151.326 7.628V14.25H150.318V8.608H143.626V14.278H142.618V7.628H146.16C146.3 7.138 146.398 6.634 146.468 6.102H140.84V5.15H153.16V6.102H147.532C147.448 6.634 147.35 7.152 147.21 7.628H151.326ZM147.924 14.278C149.73 14.894 151.382 15.622 152.866 16.49L152.25 17.442C150.654 16.448 149.03 15.664 147.364 15.104L147.924 14.278ZM146.482 9.448H147.518V11.674C147.462 13.214 146.958 14.432 146.034 15.356C145.138 16.21 143.668 16.868 141.624 17.344L141.05 16.448C143.08 16 144.494 15.412 145.292 14.67C146.048 13.9 146.44 12.906 146.482 11.674V9.448ZM159.18 5.612V15.93H158.2V14.992H156.128V16.266H155.148V5.612H159.18ZM156.128 14.054H158.2V10.68H156.128V14.054ZM156.128 9.742H158.2V6.536H156.128V9.742ZM161.196 9.784C162.064 11.1 162.736 12.248 163.198 13.228L162.358 13.816C161.868 12.766 161.21 11.59 160.37 10.302L161.196 9.784ZM164.388 17.26H161.938L161.728 16.28C162.54 16.308 163.31 16.336 164.052 16.336C164.458 16.336 164.668 16.112 164.668 15.678V8.104H159.824V7.138H164.668V4.674H165.69V7.138H167.412V8.104H165.69V15.93C165.69 16.812 165.256 17.26 164.388 17.26ZM169.05 5.29H180.95V6.284H176.386C176.134 6.858 175.84 7.418 175.518 7.95V17.428H174.482V9.434C173.166 11.072 171.444 12.528 169.316 13.802L168.658 12.92C171.822 11.1 174.034 8.888 175.266 6.284H169.05V5.29ZM177.282 9.056C178.892 10.33 180.236 11.604 181.328 12.878L180.558 13.662C179.578 12.43 178.248 11.128 176.554 9.742L177.282 9.056ZM183.12 5.206H194.894V6.158H189.504V7.6H193.69V12.906H195.3V13.858H193.69V15.93C193.69 16.882 193.256 17.358 192.416 17.358H191.044L190.778 16.378L192.094 16.42C192.5 16.42 192.71 16.182 192.71 15.706V13.858H185.29V17.4H184.31V13.858H182.7V12.906H184.31V7.6H188.496V6.158H183.12V5.206ZM185.29 12.906H188.496V11.128H185.29V12.906ZM189.504 12.906H192.71V11.128H189.504V12.906ZM185.29 10.232H188.496V8.524H185.29V10.232ZM189.504 8.524V10.232H192.71V8.524H189.504ZM199.57 9.882H201.614V8.468H198.968V9.84C198.968 10.68 198.912 11.478 198.828 12.234H201.614V10.778H199.57V9.882ZM198.688 13.158C198.408 14.726 197.946 16.14 197.302 17.4L196.49 16.672C197.442 14.908 197.932 12.626 197.946 9.84V5.108H208.334V8.468H206.388V9.882H208.586V10.778H206.388V12.234H209.048V13.158H204.554C204.918 13.802 205.38 14.348 205.912 14.824C206.542 14.488 207.144 13.97 207.718 13.242L208.418 13.928C207.914 14.544 207.34 15.048 206.696 15.412C207.508 15.93 208.432 16.294 209.496 16.518L209.006 17.47C206.43 16.826 204.61 15.384 203.546 13.158H201.642V16.224C202.552 16 203.336 15.734 204.008 15.44L204.204 16.364C203.14 16.756 201.88 17.092 200.424 17.386L200.144 16.504C200.48 16.378 200.648 16.14 200.648 15.804V13.158H198.688ZM205.408 8.468H202.58V9.882H205.408V8.468ZM202.58 12.234H205.408V10.778H202.58V12.234ZM207.326 6.032H198.968V7.558H207.326V6.032ZM216.258 17.232H214.452L214.242 16.252C214.83 16.28 215.376 16.308 215.908 16.308C216.328 16.308 216.538 16.098 216.538 15.706V9.882H211.036V8.888H222.964V9.882H217.56V15.958C217.56 16.798 217.126 17.232 216.258 17.232ZM213.192 11.422L214.186 11.632C213.598 13.564 212.786 15.23 211.722 16.63L210.84 16.084C211.918 14.684 212.702 13.13 213.192 11.422ZM220.584 11.282C221.536 12.794 222.376 14.39 223.076 16.098L222.152 16.518C221.396 14.656 220.57 13.018 219.674 11.59L220.584 11.282ZM212.324 5.332H221.718V6.312H212.324V5.332ZM229.306 6.102H233.058C232.848 5.542 232.61 5.024 232.33 4.548L233.38 4.38C233.604 4.884 233.842 5.458 234.066 6.102H237.44V7.012H233.366C232.484 8.342 231.714 9.294 231.056 9.868C232.064 9.826 233.072 9.77 234.08 9.7C234.444 9.21 234.78 8.678 235.088 8.118L235.942 8.566C234.584 11.114 232.596 12.85 229.992 13.788L229.46 12.948C231 12.43 232.288 11.632 233.324 10.568C232.232 10.638 231.056 10.694 229.81 10.736L229.586 9.868C229.67 9.84 229.726 9.812 229.782 9.784C230.426 9.434 231.252 8.51 232.26 7.012H229.306V6.102ZM234.206 14.586C232.834 15.79 231.238 16.714 229.418 17.33L228.872 16.462C232.246 15.384 234.78 13.298 236.46 10.19L237.314 10.652C236.614 11.912 235.788 13.032 234.85 13.984C235.858 14.852 236.726 15.72 237.454 16.602L236.726 17.33C236.096 16.462 235.256 15.538 234.206 14.586ZM226.296 4.73C227.22 5.43 227.99 6.13 228.634 6.83L227.948 7.516C227.374 6.858 226.59 6.158 225.596 5.416L226.296 4.73ZM224.588 8.846H227.612V15.09C228.102 14.684 228.62 14.208 229.166 13.676L229.446 14.74C228.592 15.552 227.682 16.28 226.73 16.91L226.338 16.014C226.534 15.832 226.646 15.636 226.646 15.412V9.812H224.588V8.846ZM240.058 9.098L239.82 11.366H242.802C242.802 13.718 242.718 15.272 242.578 16C242.396 16.812 241.682 17.232 240.436 17.288C240.114 17.288 239.778 17.26 239.442 17.232L239.19 16.294C239.526 16.322 239.862 16.35 240.212 16.35C241.038 16.35 241.514 16.084 241.64 15.58C241.78 15.048 241.85 13.928 241.85 12.248H238.798L239.162 8.216H241.71V6.032H238.952V5.15H242.69V9.098H240.058ZM243.894 6.83H247.968C248.388 6.074 248.738 5.29 249.046 4.464L250.012 4.8C249.704 5.556 249.354 6.242 248.962 6.83H250.782V12.444H247.8V13.802H251.398V14.74H247.8V17.428H246.82V14.74H243.278V13.802H246.82V12.444H243.894V6.83ZM249.872 11.59V10.078H247.8V11.59H249.872ZM246.82 11.59V10.078H244.79V11.59H246.82ZM244.79 9.238H246.82V7.684H244.79V9.238ZM247.8 7.684V9.238H249.872V7.684H247.8ZM245.546 4.548C245.966 5.122 246.33 5.738 246.638 6.382L245.77 6.76C245.434 6.032 245.042 5.402 244.622 4.842L245.546 4.548ZM8.33 28.97C9.814 29.362 11.172 29.852 12.404 30.426L11.9 31.182C10.584 30.524 9.24 30.006 7.868 29.642L8.33 28.97ZM5.614 28.97L6.174 29.614C5.054 30.244 3.668 30.776 1.988 31.21L1.596 30.384C3.22 30.02 4.55 29.558 5.614 28.97ZM12.138 31.616V39.428H11.158V38.798H2.87V39.428H1.89V31.616H5.768C5.992 31.196 6.16 30.762 6.272 30.328L7.238 30.468C7.126 30.874 6.958 31.252 6.762 31.616H12.138ZM2.87 37.93H11.158V32.442H2.87V37.93ZM6.146 34.864C6.678 35.088 7.21 35.312 7.714 35.564C8.274 35.158 8.68 34.71 8.932 34.22H6.202C5.684 34.78 5.012 35.298 4.186 35.746L3.654 35.032C4.914 34.388 5.782 33.59 6.23 32.666L7.126 32.834C7.028 33.058 6.916 33.268 6.776 33.478H9.842V34.164C9.59 34.85 9.142 35.452 8.512 35.97C9.128 36.278 9.702 36.614 10.248 36.964L9.646 37.664C9.03 37.23 8.414 36.838 7.77 36.488C6.874 37.02 5.74 37.454 4.354 37.79L3.92 37.006C5.124 36.754 6.118 36.432 6.916 36.04C6.468 35.802 6.006 35.578 5.558 35.382L6.146 34.864ZM12.88 27.668V29.614H11.928V28.522H2.072V29.81H1.12V27.668H6.538C6.37 27.304 6.202 26.968 6.006 26.66L7.056 26.492C7.224 26.842 7.378 27.234 7.546 27.668H12.88ZM16.604 36.334C16.912 36.334 17.178 36.46 17.374 36.726C17.556 36.978 17.654 37.3 17.654 37.706C17.654 38.322 17.472 38.868 17.108 39.344C16.744 39.792 16.254 40.1 15.666 40.254V39.568C16.03 39.442 16.324 39.232 16.548 38.952C16.758 38.658 16.856 38.35 16.856 38.014C16.8 38.042 16.688 38.07 16.548 38.07C16.31 38.07 16.114 37.986 15.946 37.818C15.778 37.65 15.694 37.44 15.694 37.202C15.694 36.936 15.778 36.726 15.946 36.572C16.114 36.404 16.324 36.334 16.604 36.334ZM28.756 27.472H41.244V28.438H35.518C35.35 29.152 35.126 29.838 34.832 30.482H40.446V37.846C40.446 38.812 40.026 39.302 39.2 39.302H37.912L37.632 38.28L38.85 38.322C39.242 38.322 39.438 38.084 39.438 37.622V31.448H37.086V38.896H36.106V31.448H33.866V38.896H32.886V31.448H30.758V39.316H29.736V30.482H33.642C33.95 29.838 34.174 29.152 34.328 28.438H28.756V27.472ZM44.8 27.038H53.312V31.896H44.8V27.038ZM52.318 31.042V29.894H45.794V31.042H52.318ZM45.794 29.068H52.318V27.906H45.794V29.068ZM48.65 33.856H42.812V32.932H55.202V33.856H49.672V35.438H53.704V36.334H49.672V38.196C50.344 38.252 51.156 38.294 52.08 38.294C53.284 38.294 54.306 38.28 55.132 38.252L54.852 39.204C53.844 39.204 52.948 39.19 52.15 39.176C49.84 39.176 48.272 38.994 47.446 38.644C46.732 38.322 46.088 37.706 45.528 36.782C44.982 37.818 44.282 38.672 43.442 39.358L42.784 38.532C44.072 37.496 44.954 36.096 45.416 34.346L46.368 34.514C46.228 35.032 46.074 35.522 45.892 35.984C46.48 36.964 47.152 37.58 47.88 37.846C48.104 37.916 48.356 37.986 48.65 38.042V33.856ZM57.064 27.836H62.468C62.524 27.388 62.58 26.954 62.622 26.52L63.644 26.66C63.602 27.066 63.56 27.458 63.504 27.836H68.936V28.802H63.35C63.28 29.208 63.196 29.6 63.112 29.964H67.144V38.14H69.216V39.078H56.798V38.14H58.8V29.964H62.076C62.16 29.572 62.244 29.18 62.314 28.802H57.064V27.836ZM59.794 38.14H66.15V36.908H59.794V38.14ZM59.794 36.082H66.15V34.892H59.794V36.082ZM59.794 34.08H66.15V32.904H59.794V34.08ZM59.794 32.078H66.15V30.86H59.794V32.078ZM77.406 28.928C77.77 29.558 78.092 30.244 78.4 31H79.772C80.164 30.3 80.486 29.558 80.766 28.774L81.718 29.11C81.452 29.81 81.158 30.44 80.836 31H83.104V31.966H75.292V31H77.434C77.154 30.384 76.874 29.824 76.58 29.32L77.406 28.928ZM79.254 26.478C79.408 26.87 79.562 27.318 79.716 27.808H82.852V28.732H75.614V27.808H78.694C78.54 27.388 78.372 26.996 78.204 26.646L79.254 26.478ZM72.268 39.274H71.05L70.84 38.294C71.218 38.322 71.582 38.35 71.918 38.35C72.282 38.35 72.478 38.168 72.478 37.804V34.36C71.918 34.584 71.344 34.794 70.77 34.976L70.518 33.968C71.176 33.8 71.834 33.59 72.478 33.338V30.216H70.77V29.25H72.478V26.604H73.514V29.25H74.676V30.216H73.514V32.904C73.906 32.708 74.298 32.512 74.69 32.302V33.324C74.298 33.534 73.906 33.73 73.514 33.912V38.056C73.514 38.868 73.094 39.274 72.268 39.274ZM78.022 32.358L78.988 32.47C78.848 32.848 78.694 33.212 78.526 33.562H83.328V34.542H81.788C81.578 35.578 81.144 36.46 80.486 37.174C81.438 37.622 82.362 38.098 83.244 38.602L82.698 39.414C81.858 38.896 80.892 38.378 79.772 37.846C78.848 38.518 77.378 39.064 75.362 39.456L74.97 38.546C76.594 38.252 77.854 37.86 78.722 37.356C77.868 36.964 76.958 36.586 75.978 36.194C76.356 35.62 76.692 35.074 76.986 34.542H75.11V33.562H77.504C77.7 33.142 77.868 32.75 78.022 32.358ZM80.836 34.542H78.008C77.756 34.976 77.49 35.396 77.21 35.788C78.022 36.096 78.806 36.418 79.562 36.754C80.192 36.166 80.612 35.438 80.836 34.542ZM85.792 26.786C86.73 27.514 87.528 28.228 88.172 28.956L87.444 29.67C86.884 28.984 86.1 28.242 85.106 27.444L85.792 26.786ZM93.926 39.148C93.17 39.148 92.344 39.134 91.462 39.12C90.566 39.106 89.852 39.022 89.292 38.868C88.746 38.7 88.256 38.35 87.822 37.846C87.64 37.608 87.458 37.496 87.29 37.496C86.954 37.496 86.408 38.14 85.638 39.428L84.882 38.742C85.624 37.566 86.282 36.852 86.856 36.6V32.344H84.854V31.42H87.794V36.656C87.906 36.74 88.018 36.852 88.13 36.978C88.466 37.384 88.816 37.678 89.208 37.86C89.628 38.056 90.258 38.168 91.07 38.196C91.798 38.21 92.708 38.224 93.786 38.224C94.444 38.224 95.116 38.21 95.802 38.196C96.474 38.182 97.006 38.168 97.37 38.14L97.132 39.148H93.926ZM89.138 28.774H90.79V26.548H91.756V28.774H93.968V26.562H94.948V28.774H96.726V29.712H94.948V32.498H97.174V33.45H94.948V37.468H93.968V33.45H91.476C91.112 35.13 90.384 36.376 89.306 37.188L88.704 36.376C89.586 35.746 90.188 34.766 90.496 33.45H88.648V32.498H90.678C90.748 31.966 90.79 31.406 90.79 30.818V29.712H89.138V28.774ZM91.756 29.712V30.594C91.756 31.266 91.714 31.91 91.644 32.498H93.968V29.712H91.756ZM104.384 29.81C103.74 28.634 102.97 27.738 102.074 27.094L102.914 26.562C104.16 27.43 105.21 29.012 106.078 31.28C107.394 34.626 109.144 36.992 111.356 38.378L110.726 39.19C108.458 37.818 106.61 35.27 105.168 31.574C105.084 31.35 105.014 31.154 104.944 30.986C104.02 34.556 102.088 37.3 99.148 39.204L98.546 38.35C101.542 36.39 103.488 33.534 104.384 29.81ZM115.612 26.478L116.564 26.912C116.228 27.948 115.808 28.914 115.318 29.838V39.428H114.296V31.49C113.82 32.148 113.316 32.778 112.77 33.366L112.434 32.288C113.89 30.608 114.954 28.662 115.612 26.478ZM117.39 27.192H123.998V31.602H121.184V33.128H125.216V34.108H122.178C122.976 35.508 124.068 36.726 125.454 37.762L124.81 38.644C123.41 37.426 122.262 35.914 121.352 34.108H121.184V39.4H120.176V34.108H120.008C119.07 36.054 117.894 37.566 116.48 38.658L115.906 37.748C117.25 36.824 118.342 35.62 119.182 34.108H116.284V33.128H120.176V31.602H117.39V27.192ZM123.004 30.636V28.158H118.384V30.636H123.004ZM127.078 27.99H130.886C131.068 27.5 131.236 27.01 131.376 26.506L132.398 26.632C132.258 27.094 132.118 27.542 131.964 27.99H139.132V28.97H131.586C131.068 30.174 130.424 31.28 129.668 32.288V39.414H128.688V33.492C128.212 34.01 127.722 34.5 127.19 34.976L126.56 34.178C128.268 32.68 129.57 30.944 130.48 28.97H127.078V27.99ZM130.76 34.5H134.82V33.198C135.618 32.75 136.374 32.232 137.102 31.616H131.838V30.678H138.39V31.616C137.634 32.316 136.78 32.988 135.828 33.618V34.5H139.328V35.466H135.828V38.112C135.828 38.938 135.408 39.358 134.582 39.358H132.832L132.566 38.406C133.07 38.42 133.602 38.434 134.176 38.434C134.596 38.434 134.82 38.21 134.82 37.79V35.466H130.76V34.5ZM144.844 32.414L144.62 31.56C144.704 31.532 144.774 31.504 144.83 31.476C145.362 31.14 146.034 30.286 146.874 28.9H144.424V27.99H148.33C148.134 27.472 147.924 26.996 147.7 26.562L148.722 26.394C148.946 26.87 149.142 27.402 149.338 27.99H153.02V28.9H147.91C147.252 30.062 146.678 30.916 146.174 31.462C147.784 31.378 149.38 31.238 150.976 31.042C150.668 30.636 150.36 30.23 150.024 29.81L150.85 29.32C151.802 30.468 152.516 31.462 153.02 32.33L152.194 32.918C151.998 32.568 151.774 32.218 151.55 31.854C149.492 32.092 147.252 32.274 144.844 32.414ZM141.834 26.758C142.688 27.36 143.402 27.962 143.99 28.564L143.276 29.278C142.744 28.704 142.03 28.102 141.106 27.458L141.834 26.758ZM141.498 30.104C142.38 30.776 143.122 31.462 143.71 32.134L142.996 32.862C142.464 32.218 141.722 31.532 140.784 30.804L141.498 30.104ZM142.926 33.828L143.822 34.178C143.262 35.97 142.66 37.65 141.988 39.218L141.05 38.812C141.778 37.188 142.394 35.536 142.926 33.828ZM147.7 33.058H148.722V39.12H147.7V33.058ZM145.432 33.044H146.412C146.356 34.878 146.174 36.222 145.866 37.076C145.53 37.972 144.956 38.742 144.172 39.386L143.528 38.588C144.2 38.042 144.676 37.398 144.956 36.642C145.222 35.9 145.376 34.696 145.432 33.044ZM152.096 39.26H151.396C150.584 39.26 150.192 38.896 150.192 38.168V33.058H151.158V37.986C151.158 38.196 151.242 38.308 151.424 38.336H152.04C152.292 38.308 152.432 38.154 152.46 37.846C152.516 37.51 152.544 36.964 152.544 36.222L153.426 36.558C153.426 37.79 153.342 38.546 153.174 38.826C153.006 39.078 152.656 39.232 152.096 39.26ZM160.594 27.08H166.404V31.126H160.594V27.08ZM165.424 30.216V27.976H161.588V30.216H165.424ZM160.048 32.428H167.006V33.352H163.954V35.144H166.572V36.054H163.954V37.944H167.342V38.896H159.488V37.944H162.918V36.054H160.37V35.144H162.918V33.352H160.048V32.428ZM154.812 30.398H156.856V28.368C156.268 28.452 155.652 28.536 155.022 28.606L154.826 27.654C156.576 27.486 158.13 27.192 159.474 26.772L159.824 27.724C159.194 27.906 158.522 28.06 157.822 28.2V30.398H159.628V31.364H157.822V32.106C158.48 32.75 159.152 33.478 159.824 34.276L159.264 35.116C158.704 34.248 158.214 33.548 157.822 33.03V39.344H156.856V33.03C156.366 34.402 155.722 35.634 154.924 36.74L154.49 35.62C155.554 34.374 156.31 32.96 156.758 31.364H154.812V30.398Z",
    fill: "#0D0D0D",
    "fill-opacity": "0.9"
  }), O("rect", {
    y: "52",
    width: "272",
    height: "276",
    rx: "12",
    fill: "#F5F5F5"
  }), O("rect", {
    x: "12",
    y: "64",
    width: "248",
    height: "252",
    fill: "url(#pattern0)"
  }), O("defs", null, [O("pattern", {
    id: "pattern0",
    patternContentUnits: "objectBoundingBox",
    width: "1",
    height: "1"
  }, [O("use", {
    "xlink:href": "#image0_4957_311898",
    transform: "matrix(0.00155848 0 0 0.00153374 -0.0018306 0)"
  })]), O("image", {
    id: "image0_4957_311898",
    width: "644",
    height: "652",
    "xlink:href": "data:image/png;base64,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JKnjDISSJEkdZyCUJEnqOAOhJElSx83PRtS6deuy008/Pb985JFHZldddVU2DJs3b842btzYaNmDDz44e+SRR7I2uI8kSdIwjWwgBKEw/Z267bbbsvvvvz9r47jjjsuWL1++w3Vr167NzjjjjJ73Peigg7J77703O+aYY7I2brnlljzQSpIkDctIB8I6a9asyW6//fZW96FaVwyEkiRJc11nA+EwUMk7//zzd7iuWD284IILdvg3TcgRTI844oidqoE2GUuSpGHrbCC87LLLdgpvvSxevLj2dpqFezXvFgMhzdYRCM866ywrkJIkadqNLVmy5KVc2LBhw7eyOY5w1as/H4GNfnnT+ZiIPoSrVq3KrrjiisnrN23alA9MwaJFi7K999578jb6LF566aWZJEnSMCxduvRl/LbJeJoRAMsGuYBgGOEwlpUkSRq2kQqEVNfSPncxxQuVt2juTStwg0ZF713vetcO19WNKj755JPzymHRtddem0mSJE2XkQqEhx12WHbPPffkl2maXbFiRX552bJlOzQTH3300Vm/CHC33npr6W1bt26trP6VOemkk/IAyxQ4iEElBkJJkjSdRrbJ+O677568XGx6bRPa2iCE8tMGVcwIgAw4cc5BSZI03UY2EDLPYHjwwQeziy++OLv66qvzf1dN5cIZR9IBHmWjisuaeCVJkuaykQyENMEWq4AxtQuhMJqVi6jURbWOaWno49cLzdRNRi0Ps++iJEnSVIxkICz2waPaR+WPUEh1MOYC5Dpu64WpZbhfsTpI6Iz+f01QqZQkSZptRi4QllUHGVTCgA+akQmLVOvOPPPM7M1vfnN+mcmgqQgWEQQvueSSfH2EyLKzjLQZAEL/QAaSpNJpZmyOliRJM2FeNmIioBUHZ9BUHNVAfhP2CGOEvTSUpWgOjnDZphLYRkyNAwOhJEmaCSNVISQMRoCjmkfoC4QtrnvooYfyvoHp2UKqThdH9ZCpYKgssl5+0tBG6CzrjxhzD3Iqure97W073JYOdkE6KplKpiRJ0nQbuUAIglpZtY2AFtXANIjVTfVCWIwQx31oak7Rt/CQQw7Jq4ksmzYrU4ksjmgmVMZgFbYl1s32RuUybieMSpIkDdtIBcKo5p1//vmVy0ToikoiYbBuYEkaFpnbsBgIYz0MGClWGmlmTquUNFuzvljn6aefPnlbVC1v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"
  })])], -1),
  Hu = {
    class: "el-form-item__content"
  },
  Vu = {
    class: "el-form-item asterisk-left"
  },
  Iu = {
    class: "el-form-item__label"
  },
  Tu = {
    class: "el-form-item__content"
  },
  Mu = {
    class: "kdocs-ext-keymap"
  },
  Ou = {
    class: "kdocs-options-footer"
  },
  Ju = {
    class: "main-content-header"
  },
  Pu = {
    class: "kdocs-options-footer-content"
  },
  Lu = {
    key: 0,
    class: "kdocs-toast-warpper"
  },
  Zu = z({
    __name: "App",
    setup: function setup(e) {
      var _rs = rs({
          isSetting: !0,
          needLogin: !0
        }),
        t = _rs.userInfo,
        o = _rs.allPath,
        n = _rs.toast,
        r = _rs.dialogVisible,
        s = _rs.onFinderConfirm,
        l = _rs.openKdocsPath,
        i = _rs.onFinderClose,
        _cs = cs(),
        c = _cs.getSettingConfigs,
        u = c(),
        f = H(function () {
          var k;
          return (k = t.value) != null && k.nickname ? {
            marginRight: "10px"
          } : {};
        });
      function d() {
        return _d2.apply(this, arguments);
      }
      function _d2() {
        _d2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3() {
          return _regeneratorRuntime().wrap(function _callee3$(_context3) {
            while (1) switch (_context3.prev = _context3.next) {
              case 0:
                _context3.prev = 0;
                _context3.next = 3;
                return as();
              case 3:
                xr(!0);
                h("click_logout");
                _context3.next = 10;
                break;
              case 7:
                _context3.prev = 7;
                _context3.t0 = _context3["catch"](0);
                Lo();
              case 10:
              case "end":
                return _context3.stop();
            }
          }, _callee3, null, [[0, 7]]);
        }));
        return _d2.apply(this, arguments);
      }
      var b = [{
          name: re("setting.tutorial"),
          link: Kr,
          dw: "click_tutorial"
        }, {
          name: re("setting.downloadKdocs"),
          link: Zo,
          dw: "click_download_kdocs"
        }, {
          name: re("setting.kdocsLaste"),
          link: Zo,
          dw: "click_home"
        }],
        v = navigator.userAgent.match(/Mac OS X/i) ? "Option+R" : "Alt+R",
        p = H(function () {
          var k, y, V, E, w;
          return (k = a(t)) != null && k.nickname ? a(t).nickname.length > 6 ? ((E = (V = (y = a(t)) == null ? void 0 : y.nickname) == null ? void 0 : V.slice) == null ? void 0 : E.call(V, 0, 6)) + "..." : (w = a(t)) == null ? void 0 : w.nickname : "";
        });
      function g() {
        r.value = !0, wt("dwEvent", {
          action: "click_editpath",
          page: "settings"
        }, "background").catch(function () {});
      }
      pe(function () {
        wt("dwEvent", {
          action: "show",
          page: "settings"
        }, "background").catch(function () {});
      });
      function h(k) {
        wt("dwEvent", {
          action: k,
          page: "settings"
        }, "background").catch(function () {});
      }
      function m() {
        Lo(), h("click_home");
      }
      function S() {
        l(), wt("dwEvent", {
          type: "dwEvent",
          action: "click_openpath",
          page: "settings"
        }, "background").catch(function () {});
      }
      return function (k, y) {
        var V = bc,
          E = Vi,
          w = Cc,
          C = hc,
          I = oi,
          T = ls,
          N = is,
          A = xc,
          F = Kt,
          Q = Dc,
          G = fo,
          L = Mc,
          M = ss,
          ee = Ur,
          ae = Uc,
          Ve = wi;
        return P(), Y(ot, null, [R(I, {
          class: "kdocs-ext-header"
        }, {
          default: Z(function () {
            return [O("div", eu, [tu, O("span", null, _(a(re)("extName")), 1)]), a(t) ? (P(), U(C, {
              key: 0,
              trigger: "click"
            }, {
              dropdown: Z(function () {
                return [R(w, {
                  class: "logout"
                }, {
                  default: Z(function () {
                    return [R(V, {
                      onClick: y[0] || (y[0] = function (q) {
                        return m();
                      })
                    }, {
                      default: Z(function () {
                        return [ye(_(a(re)("setting.title")), 1)];
                      }),
                      _: 1
                    }), R(E, {
                      style: {
                        margin: 0
                      }
                    }), R(V, {
                      onClick: d
                    }, {
                      default: Z(function () {
                        return [ye(_(a(re)("setting.logout")), 1)];
                      }),
                      _: 1
                    })];
                  }),
                  _: 1
                })];
              }),
              default: Z(function () {
                return [O("span", ou, [O("img", {
                  src: a(t).pic,
                  style: ue(a(f))
                }, null, 12, nu), O("p", ru, _(a(p)), 1)])];
              }),
              _: 1
            })) : X("", !0)];
          }),
          _: 1
        }), O("div", su, [R(M, {
          class: "kdocs-options-form"
        }, {
          default: Z(function () {
            return [R(T, null, {
              label: Z(function () {
                return [O("span", au, _(a(re)("setting.setting")), 1)];
              }),
              _: 1
            }), R(E), R(T, null, {
              label: Z(function () {
                return [O("div", lu, _(a(re)("setting.defSaveLoa")), 1), O("div", iu, [R(N, {
                  underline: !1,
                  class: "kdocs-options-subtitle",
                  onClick: S
                }, {
                  default: Z(function () {
                    return [ye(_(a(o)), 1)];
                  }),
                  _: 1
                }), R(A, {
                  class: "kdocs-options-subtitle kdocs-options-open",
                  onClick: S,
                  type: "primary"
                }, {
                  default: Z(function () {
                    return [ye(_(a(re)("setting.open")), 1)];
                  }),
                  _: 1
                })])];
              }),
              default: Z(function () {
                return [R(F, {
                  type: "primary",
                  onClick: g
                }, {
                  default: Z(function () {
                    return [ye(_(a(re)("setting.change")), 1)];
                  }),
                  _: 1
                })];
              }),
              _: 1
            }), R(E), O("div", cu, [O("label", uu, _(a(re)("setting.successOpen")), 1), O("div", du, [R(Q, {
              onClick: y[1] || (y[1] = nt(function () {}, ["stop"])),
              modelValue: a(u).successOpen,
              "onUpdate:modelValue": y[2] || (y[2] = function (q) {
                return a(u).successOpen = q;
              }),
              onChange: y[3] || (y[3] = function (q) {
                return h(q ? "open_autoopenfile" : "close_autoopenfile");
              })
            }, null, 8, ["modelValue"])])]), R(E), O("div", pu, [O("label", fu, _(a(re)("setting.selectPopup")), 1), O("div", vu, [R(Q, {
              modelValue: a(u).selectPopup,
              "onUpdate:modelValue": y[4] || (y[4] = function (q) {
                return a(u).selectPopup = q;
              }),
              onChange: y[5] || (y[5] = function (q) {
                return h(q ? "open_selectionbutton" : "close_selectionbutton");
              })
            }, null, 8, ["modelValue"])])]), R(E), O("div", mu, [O("label", gu, [O("div", hu, [ye(_(a(re)("setting.partWebPageDisplay")) + " ", 1), R(G, {
              content: a(re)("setting.tipsTools")
            }, {
              default: Z(function () {
                return [bu];
              }),
              _: 1
            }, 8, ["content"])])]), O("div", Cu, [R(Q, {
              modelValue: a(u).partWebPageDisplay,
              "onUpdate:modelValue": y[6] || (y[6] = function (q) {
                return a(u).partWebPageDisplay = q;
              }),
              onChange: y[7] || (y[7] = function (q) {
                return h(q ? "open_lowerrightentrance" : "close_lowerrightentrance");
              })
            }, null, 8, ["modelValue"])])]), R(E), O("div", yu, [O("label", wu, [O("div", Eu, [ye(_(a(re)("setting.cantShowEditPopup")) + " ", 1), R(L, {
              placement: "bottom-start",
              "popper-class": "kdocs-setting-popover",
              width: 400,
              trigger: "hover",
              "show-arrow": !1
            }, {
              reference: Z(function () {
                return [Su];
              }),
              default: Z(function () {
                return [ku];
              }),
              _: 1
            })])]), O("div", Hu, [R(Q, {
              modelValue: a(u).cantShowEditPopup,
              "onUpdate:modelValue": y[8] || (y[8] = function (q) {
                return a(u).cantShowEditPopup = q;
              }),
              onChange: y[9] || (y[9] = function (q) {
                return h(q ? "open_autoclipper" : "close_autoclipper");
              })
            }, null, 8, ["modelValue"])])]), R(E), O("div", Vu, [O("label", Iu, _(a(re)("setting.shortcuts")), 1), O("div", Tu, [O("div", Mu, [ye(_(a(re)("setting.shortcutsLabel")), 1), O("span", null, _(a(v)), 1)]), R(Q, {
              modelValue: a(u).shortcuts,
              "onUpdate:modelValue": y[10] || (y[10] = function (q) {
                return a(u).shortcuts = q;
              }),
              onChange: y[11] || (y[11] = function (q) {
                return h(q ? "open_shortcutkeys" : "close_shortcutkeys");
              })
            }, null, 8, ["modelValue"])])]), R(E)];
          }),
          _: 1
        }), O("section", Ou, [O("header", Ju, _(a(re)("setting.helpSup")), 1), R(E), O("div", Pu, [(P(), Y(ot, null, Ir(b, function (q) {
          return R(N, {
            key: q.name,
            class: "kdocs-options-footer-links",
            href: q.link,
            target: "_blank",
            onClick: function onClick(Me) {
              return h(q.dw);
            }
          }, {
            default: Z(function () {
              return [ye(_(q.name), 1)];
            }),
            _: 2
          }, 1032, ["href", "onClick"]);
        }), 64))])])]), a(n).visible ? (P(), Y("div", Lu, [R(ee, {
          message: a(n).message
        }, null, 8, ["message"])])) : X("", !0), R(Ve, {
          class: "kdocs-finder-container",
          title: "选择网页收藏的保存路径",
          width: "800px",
          modelValue: a(r),
          "onUpdate:modelValue": y[12] || (y[12] = function (q) {
            return ln(r) ? r.value = q : null;
          })
        }, {
          default: Z(function () {
            return [R(ae, {
              onOnConrim: a(s),
              onOnClose: a(i)
            }, null, 8, ["onOnConrim", "onOnClose"])];
          }),
          _: 1
        }, 8, ["modelValue"])], 64);
      };
    }
  });
function Ru() {
  return _Ru.apply(this, arguments);
}
function _Ru() {
  _Ru = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee4() {
    var e;
    return _regeneratorRuntime().wrap(function _callee4$(_context4) {
      while (1) switch (_context4.prev = _context4.next) {
        case 0:
          e = Tr(Zu);
          _context4.next = 3;
          return Mr();
        case 3:
          e.mount("#app");
        case 4:
        case "end":
          return _context4.stop();
      }
    }, _callee4);
  }));
  return _Ru.apply(this, arguments);
}
Ru();
