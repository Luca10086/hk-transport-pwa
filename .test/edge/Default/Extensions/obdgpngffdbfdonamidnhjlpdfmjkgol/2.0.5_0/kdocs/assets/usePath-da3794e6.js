var _excluded = ["trigger"];
function _get() { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get.bind(); } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(arguments.length < 3 ? target : receiver); } return desc.value; }; } return _get.apply(this, arguments); }
function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }
function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }
function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return exports; }; var exports = {}, Op = Object.prototype, hasOwn = Op.hasOwnProperty, defineProperty = Object.defineProperty || function (obj, key, desc) { obj[key] = desc.value; }, $Symbol = "function" == typeof Symbol ? Symbol : {}, iteratorSymbol = $Symbol.iterator || "@@iterator", asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator", toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag"; function define(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: !0, configurable: !0, writable: !0 }), obj[key]; } try { define({}, ""); } catch (err) { define = function define(obj, key, value) { return obj[key] = value; }; } function wrap(innerFn, outerFn, self, tryLocsList) { var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator, generator = Object.create(protoGenerator.prototype), context = new Context(tryLocsList || []); return defineProperty(generator, "_invoke", { value: makeInvokeMethod(innerFn, self, context) }), generator; } function tryCatch(fn, obj, arg) { try { return { type: "normal", arg: fn.call(obj, arg) }; } catch (err) { return { type: "throw", arg: err }; } } exports.wrap = wrap; var ContinueSentinel = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var IteratorPrototype = {}; define(IteratorPrototype, iteratorSymbol, function () { return this; }); var getProto = Object.getPrototypeOf, NativeIteratorPrototype = getProto && getProto(getProto(values([]))); NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype); var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype); function defineIteratorMethods(prototype) { ["next", "throw", "return"].forEach(function (method) { define(prototype, method, function (arg) { return this._invoke(method, arg); }); }); } function AsyncIterator(generator, PromiseImpl) { function invoke(method, arg, resolve, reject) { var record = tryCatch(generator[method], generator, arg); if ("throw" !== record.type) { var result = record.arg, value = result.value; return value && "object" == _typeof(value) && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) { invoke("next", value, resolve, reject); }, function (err) { invoke("throw", err, resolve, reject); }) : PromiseImpl.resolve(value).then(function (unwrapped) { result.value = unwrapped, resolve(result); }, function (error) { return invoke("throw", error, resolve, reject); }); } reject(record.arg); } var previousPromise; defineProperty(this, "_invoke", { value: function value(method, arg) { function callInvokeWithMethodAndArg() { return new PromiseImpl(function (resolve, reject) { invoke(method, arg, resolve, reject); }); } return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(innerFn, self, context) { var state = "suspendedStart"; return function (method, arg) { if ("executing" === state) throw new Error("Generator is already running"); if ("completed" === state) { if ("throw" === method) throw arg; return doneResult(); } for (context.method = method, context.arg = arg;;) { var delegate = context.delegate; if (delegate) { var delegateResult = maybeInvokeDelegate(delegate, context); if (delegateResult) { if (delegateResult === ContinueSentinel) continue; return delegateResult; } } if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) { if ("suspendedStart" === state) throw state = "completed", context.arg; context.dispatchException(context.arg); } else "return" === context.method && context.abrupt("return", context.arg); state = "executing"; var record = tryCatch(innerFn, self, context); if ("normal" === record.type) { if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue; return { value: record.arg, done: context.done }; } "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg); } }; } function maybeInvokeDelegate(delegate, context) { var methodName = context.method, method = delegate.iterator[methodName]; if (undefined === method) return context.delegate = null, "throw" === methodName && delegate.iterator.return && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method) || "return" !== methodName && (context.method = "throw", context.arg = new TypeError("The iterator does not provide a '" + methodName + "' method")), ContinueSentinel; var record = tryCatch(method, delegate.iterator, context.arg); if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel; var info = record.arg; return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel); } function pushTryEntry(locs) { var entry = { tryLoc: locs[0] }; 1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry); } function resetTryEntry(entry) { var record = entry.completion || {}; record.type = "normal", delete record.arg, entry.completion = record; } function Context(tryLocsList) { this.tryEntries = [{ tryLoc: "root" }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0); } function values(iterable) { if (iterable) { var iteratorMethod = iterable[iteratorSymbol]; if (iteratorMethod) return iteratorMethod.call(iterable); if ("function" == typeof iterable.next) return iterable; if (!isNaN(iterable.length)) { var i = -1, next = function next() { for (; ++i < iterable.length;) if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next; return next.value = undefined, next.done = !0, next; }; return next.next = next; } } return { next: doneResult }; } function doneResult() { return { value: undefined, done: !0 }; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, defineProperty(Gp, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), defineProperty(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) { var ctor = "function" == typeof genFun && genFun.constructor; return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name)); }, exports.mark = function (genFun) { return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun; }, exports.awrap = function (arg) { return { __await: arg }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () { return this; }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) { void 0 === PromiseImpl && (PromiseImpl = Promise); var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl); return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) { return result.done ? result.value : iter.next(); }); }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () { return this; }), define(Gp, "toString", function () { return "[object Generator]"; }), exports.keys = function (val) { var object = Object(val), keys = []; for (var key in object) keys.push(key); return keys.reverse(), function next() { for (; keys.length;) { var key = keys.pop(); if (key in object) return next.value = key, next.done = !1, next; } return next.done = !0, next; }; }, exports.values = values, Context.prototype = { constructor: Context, reset: function reset(skipTempReset) { if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined); }, stop: function stop() { this.done = !0; var rootRecord = this.tryEntries[0].completion; if ("throw" === rootRecord.type) throw rootRecord.arg; return this.rval; }, dispatchException: function dispatchException(exception) { if (this.done) throw exception; var context = this; function handle(loc, caught) { return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught; } for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i], record = entry.completion; if ("root" === entry.tryLoc) return handle("end"); if (entry.tryLoc <= this.prev) { var hasCatch = hasOwn.call(entry, "catchLoc"), hasFinally = hasOwn.call(entry, "finallyLoc"); if (hasCatch && hasFinally) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } else if (hasCatch) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); } else { if (!hasFinally) throw new Error("try statement without catch or finally"); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } } } }, abrupt: function abrupt(type, arg) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) { var finallyEntry = entry; break; } } finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null); var record = finallyEntry ? finallyEntry.completion : {}; return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record); }, complete: function complete(record, afterLoc) { if ("throw" === record.type) throw record.arg; return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel; }, finish: function finish(finallyLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel; } }, catch: function _catch(tryLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc === tryLoc) { var record = entry.completion; if ("throw" === record.type) { var thrown = record.arg; resetTryEntry(entry); } return thrown; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(iterable, resultName, nextLoc) { return this.delegate = { iterator: values(iterable), resultName: resultName, nextLoc: nextLoc }, "next" === this.method && (this.arg = undefined), ContinueSentinel; } }, exports; }
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }
function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
function _wrapNativeSuper(Class) { var _cache = typeof Map === "function" ? new Map() : undefined; _wrapNativeSuper = function _wrapNativeSuper(Class) { if (Class === null || !_isNativeFunction(Class)) return Class; if (typeof Class !== "function") { throw new TypeError("Super expression must either be null or a function"); } if (typeof _cache !== "undefined") { if (_cache.has(Class)) return _cache.get(Class); _cache.set(Class, Wrapper); } function Wrapper() { return _construct(Class, arguments, _getPrototypeOf(this).constructor); } Wrapper.prototype = Object.create(Class.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } }); return _setPrototypeOf(Wrapper, Class); }; return _wrapNativeSuper(Class); }
function _construct(Parent, args, Class) { if (_isNativeReflectConstruct()) { _construct = Reflect.construct.bind(); } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }
function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
function _isNativeFunction(fn) { return Function.toString.call(fn).indexOf("[native code]") !== -1; }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e4) { throw _e4; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e5) { didErr = true; err = _e5; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _iterableToArrayLimit(arr, i) { var _i = null == arr ? null : "undefined" != typeof Symbol && arr[Symbol.iterator] || arr["@@iterator"]; if (null != _i) { var _s, _e, _x, _r, _arr = [], _n = !0, _d = !1; try { if (_x = (_i = _i.call(arr)).next, 0 === i) { if (Object(_i) !== _i) return; _n = !1; } else for (; !(_n = (_s = _x.call(_i)).done) && (_arr.push(_s.value), _arr.length !== i); _n = !0); } catch (err) { _d = !0, _e = err; } finally { try { if (!_n && null != _i.return && (_r = _i.return(), Object(_r) !== _r)) return; } finally { if (_d) throw _e; } } return _arr; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
import { w as Ae, r as z, W as je, b as R, u as j, S as Rn, a0 as Dn, i as ut, d as ce, V as Nr, K as Ve, aa as qr, o as ne, l as ze, q as be, p as ae, P as Rr, e as Dr, R as Lr, Y as Ln, B as Ge, F as kn, n as kr, h as Bn, y as ke, c as ft, z as Br, E as Ut, O as Wn, D as Vt, m as $e, x as zt, ab as Un, ac as Wr, ad as Vn, M as Re, L as zn, ae as Gt } from "./__uno-cab22814.js";
import { D as Ur, T as Vr, i as Gn, U as Kn, W as Hn, X as Jn, Y as zr, Z as Yn, b as Ye, d as dt, C as Gr, t as Kr, h as Hr, k as Ze, $ as Et, _ as St, I as gt, n as Zn, a0 as Qn, o as Kt, w as Jr, q as Xn, c as ea, E as ta, S as ra, a1 as Ht } from "./url-d1de9e2d.js";
import { c as Yr } from "./url-1b6e2379.js";
import { s as na, r as aa, g as ia, a as sa, b as oa } from "./path-e6e5c517.js";
import { g as la, h as ca, s as ua } from "./index-28ec3cbd.js";
function ye(e) {
  var t;
  var r = Vr(e);
  return (t = r == null ? void 0 : r.$el) != null ? t : r;
}
var $t = Gn ? window : void 0;
function nt() {
  var _e2, _e3;
  var t, r, n, a;
  for (var _len = arguments.length, e = new Array(_len), _key = 0; _key < _len; _key++) {
    e[_key] = arguments[_key];
  }
  if (Yn(e[0]) || Array.isArray(e[0]) ? ((r = e[0], n = e[1], a = e[2]), t = $t) : (_e2 = e, _e3 = _slicedToArray(_e2, 4), t = _e3[0], r = _e3[1], n = _e3[2], a = _e3[3], _e2), !t) return zr;
  Array.isArray(r) || (r = [r]), Array.isArray(n) || (n = [n]);
  var s = [],
    i = function i() {
      s.forEach(function (c) {
        return c();
      }), s.length = 0;
    },
    o = function o(c, y, g, v) {
      return c.addEventListener(y, g, v), function () {
        return c.removeEventListener(y, g, v);
      };
    },
    l = Ae(function () {
      return [ye(t), Vr(a)];
    }, function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2),
        c = _ref2[0],
        y = _ref2[1];
      i(), c && s.push.apply(s, _toConsumableArray(r.flatMap(function (g) {
        return n.map(function (v) {
          return o(c, g, v, y);
        });
      })));
    }, {
      immediate: !0,
      flush: "post"
    }),
    f = function f() {
      l(), i();
    };
  return Ur(f), f;
}
var Jt = !1;
function yu(e, t) {
  var r = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var _r$window = r.window,
    n = _r$window === void 0 ? $t : _r$window,
    _r$ignore = r.ignore,
    a = _r$ignore === void 0 ? [] : _r$ignore,
    _r$capture = r.capture,
    s = _r$capture === void 0 ? !0 : _r$capture,
    _r$detectIframe = r.detectIframe,
    i = _r$detectIframe === void 0 ? !1 : _r$detectIframe;
  if (!n) return;
  Jn && !Jt && (Jt = !0, Array.from(n.document.body.children).forEach(function (g) {
    return g.addEventListener("click", zr);
  }));
  var o = !0;
  var l = function l(g) {
      return a.some(function (v) {
        if (typeof v == "string") return Array.from(n.document.querySelectorAll(v)).some(function (A) {
          return A === g.target || g.composedPath().includes(A);
        });
        {
          var A = ye(v);
          return A && (g.target === A || g.composedPath().includes(A));
        }
      });
    },
    c = [nt(n, "click", function (g) {
      var v = ye(e);
      if (!(!v || v === g.target || g.composedPath().includes(v))) {
        if (g.detail === 0 && (o = !l(g)), !o) {
          o = !0;
          return;
        }
        t(g);
      }
    }, {
      passive: !0,
      capture: s
    }), nt(n, "pointerdown", function (g) {
      var v = ye(e);
      v && (o = !g.composedPath().includes(v) && !l(g));
    }, {
      passive: !0
    }), i && nt(n, "blur", function (g) {
      var v;
      var A = ye(e);
      ((v = n.document.activeElement) == null ? void 0 : v.tagName) === "IFRAME" && !(A != null && A.contains(n.document.activeElement)) && t(g);
    })].filter(Boolean);
  return function () {
    return c.forEach(function (g) {
      return g();
    });
  };
}
function fa(e) {
  var t = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : !1;
  var r = z(),
    n = function n() {
      return r.value = !!e();
    };
  return n(), Kn(n, t), r;
}
var Yt = (typeof globalThis === "undefined" ? "undefined" : _typeof(globalThis)) < "u" ? globalThis : (typeof window === "undefined" ? "undefined" : _typeof(window)) < "u" ? window : (typeof global === "undefined" ? "undefined" : _typeof(global)) < "u" ? global : (typeof self === "undefined" ? "undefined" : _typeof(self)) < "u" ? self : {},
  Zt = "__vueuse_ssr_handlers__";
Yt[Zt] = Yt[Zt] || {};
var Qt = Object.getOwnPropertySymbols,
  da = Object.prototype.hasOwnProperty,
  ga = Object.prototype.propertyIsEnumerable,
  pa = function pa(e, t) {
    var r = {};
    for (var n in e) da.call(e, n) && t.indexOf(n) < 0 && (r[n] = e[n]);
    if (e != null && Qt) {
      var _iterator = _createForOfIteratorHelper(Qt(e)),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var n = _step.value;
          t.indexOf(n) < 0 && ga.call(e, n) && (r[n] = e[n]);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    }
    return r;
  };
function ma(e, t) {
  var r = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var n = r,
    _n$window = n.window,
    a = _n$window === void 0 ? $t : _n$window,
    s = pa(n, ["window"]);
  var i;
  var o = fa(function () {
      return a && "ResizeObserver" in a;
    }),
    l = function l() {
      i && (i.disconnect(), i = void 0);
    },
    f = Ae(function () {
      return ye(e);
    }, function (y) {
      l(), o.value && a && y && (i = new ResizeObserver(t), i.observe(y, s));
    }, {
      immediate: !0,
      flush: "post"
    }),
    c = function c() {
      l(), f();
    };
  return Ur(c), {
    isSupported: o,
    stop: c
  };
}
var Xt;
(function (e) {
  e.UP = "UP", e.RIGHT = "RIGHT", e.DOWN = "DOWN", e.LEFT = "LEFT", e.NONE = "NONE";
})(Xt || (Xt = {}));
var ha = Object.defineProperty,
  er = Object.getOwnPropertySymbols,
  ya = Object.prototype.hasOwnProperty,
  va = Object.prototype.propertyIsEnumerable,
  tr = function tr(e, t, r) {
    return t in e ? ha(e, t, {
      enumerable: !0,
      configurable: !0,
      writable: !0,
      value: r
    }) : e[t] = r;
  },
  ba = function ba(e, t) {
    for (var r in t || (t = {})) ya.call(t, r) && tr(e, r, t[r]);
    if (er) {
      var _iterator2 = _createForOfIteratorHelper(er(t)),
        _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var r = _step2.value;
          va.call(t, r) && tr(e, r, t[r]);
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
    }
    return e;
  };
var Aa = {
  easeInSine: [.12, 0, .39, 0],
  easeOutSine: [.61, 1, .88, 1],
  easeInOutSine: [.37, 0, .63, 1],
  easeInQuad: [.11, 0, .5, 0],
  easeOutQuad: [.5, 1, .89, 1],
  easeInOutQuad: [.45, 0, .55, 1],
  easeInCubic: [.32, 0, .67, 0],
  easeOutCubic: [.33, 1, .68, 1],
  easeInOutCubic: [.65, 0, .35, 1],
  easeInQuart: [.5, 0, .75, 0],
  easeOutQuart: [.25, 1, .5, 1],
  easeInOutQuart: [.76, 0, .24, 1],
  easeInQuint: [.64, 0, .78, 0],
  easeOutQuint: [.22, 1, .36, 1],
  easeInOutQuint: [.83, 0, .17, 1],
  easeInExpo: [.7, 0, .84, 0],
  easeOutExpo: [.16, 1, .3, 1],
  easeInOutExpo: [.87, 0, .13, 1],
  easeInCirc: [.55, 0, 1, .45],
  easeOutCirc: [0, .55, .45, 1],
  easeInOutCirc: [.85, 0, .15, 1],
  easeInBack: [.36, 0, .66, -.56],
  easeOutBack: [.34, 1.56, .64, 1],
  easeInOutBack: [.68, -.6, .32, 1.6]
};
ba({
  linear: Hn
}, Aa);
var wa = (typeof global === "undefined" ? "undefined" : _typeof(global)) == "object" && global && global.Object === Object && global;
var Zr = wa;
var xa = (typeof self === "undefined" ? "undefined" : _typeof(self)) == "object" && self && self.Object === Object && self,
  _a = Zr || xa || Function("return this")();
var J = _a;
var Ta = J.Symbol;
var X = Ta;
var Qr = Object.prototype,
  Oa = Qr.hasOwnProperty,
  Ea = Qr.toString,
  Oe = X ? X.toStringTag : void 0;
function Sa(e) {
  var t = Oa.call(e, Oe),
    r = e[Oe];
  try {
    e[Oe] = void 0;
    var n = !0;
  } catch (_unused) {}
  var a = Ea.call(e);
  return n && (t ? e[Oe] = r : delete e[Oe]), a;
}
var $a = Object.prototype,
  Pa = $a.toString;
function Ia(e) {
  return Pa.call(e);
}
var Fa = "[object Null]",
  ja = "[object Undefined]",
  rr = X ? X.toStringTag : void 0;
function xe(e) {
  return e == null ? e === void 0 ? ja : Fa : rr && rr in Object(e) ? Sa(e) : Ia(e);
}
function _e(e) {
  return e != null && _typeof(e) == "object";
}
var Ca = "[object Symbol]";
function Pt(e) {
  return _typeof(e) == "symbol" || _e(e) && xe(e) == Ca;
}
function Ma(e, t) {
  for (var r = -1, n = e == null ? 0 : e.length, a = Array(n); ++r < n;) a[r] = t(e[r], r, e);
  return a;
}
var Na = Array.isArray;
var ue = Na;
var qa = 1 / 0,
  nr = X ? X.prototype : void 0,
  ar = nr ? nr.toString : void 0;
function Xr(e) {
  if (typeof e == "string") return e;
  if (ue(e)) return Ma(e, Xr) + "";
  if (Pt(e)) return ar ? ar.call(e) : "";
  var t = e + "";
  return t == "0" && 1 / e == -qa ? "-0" : t;
}
function oe(e) {
  var t = _typeof(e);
  return e != null && (t == "object" || t == "function");
}
var Ra = "[object AsyncFunction]",
  Da = "[object Function]",
  La = "[object GeneratorFunction]",
  ka = "[object Proxy]";
function en(e) {
  if (!oe(e)) return !1;
  var t = xe(e);
  return t == Da || t == La || t == Ra || t == ka;
}
var Ba = J["__core-js_shared__"];
var at = Ba;
var ir = function () {
  var e = /[^.]+$/.exec(at && at.keys && at.keys.IE_PROTO || "");
  return e ? "Symbol(src)_1." + e : "";
}();
function Wa(e) {
  return !!ir && ir in e;
}
var Ua = Function.prototype,
  Va = Ua.toString;
function fe(e) {
  if (e != null) {
    try {
      return Va.call(e);
    } catch (_unused2) {}
    try {
      return e + "";
    } catch (_unused3) {}
  }
  return "";
}
var za = /[\\^$.*+?()[\]{}|]/g,
  Ga = /^\[object .+?Constructor\]$/,
  Ka = Function.prototype,
  Ha = Object.prototype,
  Ja = Ka.toString,
  Ya = Ha.hasOwnProperty,
  Za = RegExp("^" + Ja.call(Ya).replace(za, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$");
function Qa(e) {
  if (!oe(e) || Wa(e)) return !1;
  var t = en(e) ? Za : Ga;
  return t.test(fe(e));
}
function Xa(e, t) {
  return e == null ? void 0 : e[t];
}
function de(e, t) {
  var r = Xa(e, t);
  return Qa(r) ? r : void 0;
}
var ei = de(J, "WeakMap");
var pt = ei;
var sr = Object.create,
  ti = function () {
    function e() {}
    return function (t) {
      if (!oe(t)) return {};
      if (sr) return sr(t);
      e.prototype = t;
      var r = new e();
      return e.prototype = void 0, r;
    };
  }();
var ri = ti;
function ni(e, t) {
  var r = -1,
    n = e.length;
  for (t || (t = Array(n)); ++r < n;) t[r] = e[r];
  return t;
}
var ai = function () {
  try {
    var e = de(Object, "defineProperty");
    return e({}, "", {}), e;
  } catch (_unused4) {}
}();
var or = ai;
function ii(e, t) {
  for (var r = -1, n = e == null ? 0 : e.length; ++r < n && t(e[r], r, e) !== !1;);
  return e;
}
var si = 9007199254740991,
  oi = /^(?:0|[1-9]\d*)$/;
function tn(e, t) {
  var _t2;
  var r = _typeof(e);
  return t = (_t2 = t) !== null && _t2 !== void 0 ? _t2 : si, !!t && (r == "number" || r != "symbol" && oi.test(e)) && e > -1 && e % 1 == 0 && e < t;
}
function rn(e, t, r) {
  t == "__proto__" && or ? or(e, t, {
    configurable: !0,
    enumerable: !0,
    value: r,
    writable: !0
  }) : e[t] = r;
}
function nn(e, t) {
  return e === t || e !== e && t !== t;
}
var li = Object.prototype,
  ci = li.hasOwnProperty;
function It(e, t, r) {
  var n = e[t];
  (!(ci.call(e, t) && nn(n, r)) || r === void 0 && !(t in e)) && rn(e, t, r);
}
function Qe(e, t, r, n) {
  var a = !r;
  r || (r = {});
  for (var s = -1, i = t.length; ++s < i;) {
    var o = t[s],
      l = n ? n(r[o], e[o], o, r, e) : void 0;
    l === void 0 && (l = e[o]), a ? rn(r, o, l) : It(r, o, l);
  }
  return r;
}
var ui = 9007199254740991;
function an(e) {
  return typeof e == "number" && e > -1 && e % 1 == 0 && e <= ui;
}
function sn(e) {
  return e != null && an(e.length) && !en(e);
}
var fi = Object.prototype;
function Ft(e) {
  var t = e && e.constructor,
    r = typeof t == "function" && t.prototype || fi;
  return e === r;
}
function di(e, t) {
  for (var r = -1, n = Array(e); ++r < e;) n[r] = t(r);
  return n;
}
var gi = "[object Arguments]";
function lr(e) {
  return _e(e) && xe(e) == gi;
}
var on = Object.prototype,
  pi = on.hasOwnProperty,
  mi = on.propertyIsEnumerable,
  hi = lr(function () {
    return arguments;
  }()) ? lr : function (e) {
    return _e(e) && pi.call(e, "callee") && !mi.call(e, "callee");
  };
var yi = hi;
function vi() {
  return !1;
}
var ln = (typeof exports === "undefined" ? "undefined" : _typeof(exports)) == "object" && exports && !exports.nodeType && exports,
  cr = ln && (typeof module === "undefined" ? "undefined" : _typeof(module)) == "object" && module && !module.nodeType && module,
  bi = cr && cr.exports === ln,
  ur = bi ? J.Buffer : void 0,
  Ai = ur ? ur.isBuffer : void 0,
  wi = Ai || vi;
var cn = wi;
var xi = "[object Arguments]",
  _i = "[object Array]",
  Ti = "[object Boolean]",
  Oi = "[object Date]",
  Ei = "[object Error]",
  Si = "[object Function]",
  $i = "[object Map]",
  Pi = "[object Number]",
  Ii = "[object Object]",
  Fi = "[object RegExp]",
  ji = "[object Set]",
  Ci = "[object String]",
  Mi = "[object WeakMap]",
  Ni = "[object ArrayBuffer]",
  qi = "[object DataView]",
  Ri = "[object Float32Array]",
  Di = "[object Float64Array]",
  Li = "[object Int8Array]",
  ki = "[object Int16Array]",
  Bi = "[object Int32Array]",
  Wi = "[object Uint8Array]",
  Ui = "[object Uint8ClampedArray]",
  Vi = "[object Uint16Array]",
  zi = "[object Uint32Array]",
  q = {};
q[Ri] = q[Di] = q[Li] = q[ki] = q[Bi] = q[Wi] = q[Ui] = q[Vi] = q[zi] = !0;
q[xi] = q[_i] = q[Ni] = q[Ti] = q[qi] = q[Oi] = q[Ei] = q[Si] = q[$i] = q[Pi] = q[Ii] = q[Fi] = q[ji] = q[Ci] = q[Mi] = !1;
function Gi(e) {
  return _e(e) && an(e.length) && !!q[xe(e)];
}
function jt(e) {
  return function (t) {
    return e(t);
  };
}
var un = (typeof exports === "undefined" ? "undefined" : _typeof(exports)) == "object" && exports && !exports.nodeType && exports,
  Pe = un && (typeof module === "undefined" ? "undefined" : _typeof(module)) == "object" && module && !module.nodeType && module,
  Ki = Pe && Pe.exports === un,
  it = Ki && Zr.process,
  Hi = function () {
    try {
      var e = Pe && Pe.require && Pe.require("util").types;
      return e || it && it.binding && it.binding("util");
    } catch (_unused5) {}
  }();
var we = Hi;
var fr = we && we.isTypedArray,
  Ji = fr ? jt(fr) : Gi;
var Yi = Ji;
var Zi = Object.prototype,
  Qi = Zi.hasOwnProperty;
function fn(e, t) {
  var r = ue(e),
    n = !r && yi(e),
    a = !r && !n && cn(e),
    s = !r && !n && !a && Yi(e),
    i = r || n || a || s,
    o = i ? di(e.length, String) : [],
    l = o.length;
  for (var f in e) (t || Qi.call(e, f)) && !(i && (f == "length" || a && (f == "offset" || f == "parent") || s && (f == "buffer" || f == "byteLength" || f == "byteOffset") || tn(f, l))) && o.push(f);
  return o;
}
function dn(e, t) {
  return function (r) {
    return e(t(r));
  };
}
var Xi = dn(Object.keys, Object);
var es = Xi;
var ts = Object.prototype,
  rs = ts.hasOwnProperty;
function ns(e) {
  if (!Ft(e)) return es(e);
  var t = [];
  for (var r in Object(e)) rs.call(e, r) && r != "constructor" && t.push(r);
  return t;
}
function Ct(e) {
  return sn(e) ? fn(e) : ns(e);
}
function as(e) {
  var t = [];
  if (e != null) for (var r in Object(e)) t.push(r);
  return t;
}
var is = Object.prototype,
  ss = is.hasOwnProperty;
function os(e) {
  if (!oe(e)) return as(e);
  var t = Ft(e),
    r = [];
  for (var n in e) n == "constructor" && (t || !ss.call(e, n)) || r.push(n);
  return r;
}
function Mt(e) {
  return sn(e) ? fn(e, !0) : os(e);
}
var ls = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,
  cs = /^\w*$/;
function us(e, t) {
  if (ue(e)) return !1;
  var r = _typeof(e);
  return r == "number" || r == "symbol" || r == "boolean" || e == null || Pt(e) ? !0 : cs.test(e) || !ls.test(e) || t != null && e in Object(t);
}
var fs = de(Object, "create");
var Ce = fs;
function ds() {
  this.__data__ = Ce ? Ce(null) : {}, this.size = 0;
}
function gs(e) {
  var t = this.has(e) && delete this.__data__[e];
  return this.size -= t ? 1 : 0, t;
}
var ps = "__lodash_hash_undefined__",
  ms = Object.prototype,
  hs = ms.hasOwnProperty;
function ys(e) {
  var t = this.__data__;
  if (Ce) {
    var r = t[e];
    return r === ps ? void 0 : r;
  }
  return hs.call(t, e) ? t[e] : void 0;
}
var vs = Object.prototype,
  bs = vs.hasOwnProperty;
function As(e) {
  var t = this.__data__;
  return Ce ? t[e] !== void 0 : bs.call(t, e);
}
var ws = "__lodash_hash_undefined__";
function xs(e, t) {
  var r = this.__data__;
  return this.size += this.has(e) ? 0 : 1, r[e] = Ce && t === void 0 ? ws : t, this;
}
function le(e) {
  var t = -1,
    r = e == null ? 0 : e.length;
  for (this.clear(); ++t < r;) {
    var n = e[t];
    this.set(n[0], n[1]);
  }
}
le.prototype.clear = ds;
le.prototype.delete = gs;
le.prototype.get = ys;
le.prototype.has = As;
le.prototype.set = xs;
function _s() {
  this.__data__ = [], this.size = 0;
}
function Xe(e, t) {
  for (var r = e.length; r--;) if (nn(e[r][0], t)) return r;
  return -1;
}
var Ts = Array.prototype,
  Os = Ts.splice;
function Es(e) {
  var t = this.__data__,
    r = Xe(t, e);
  if (r < 0) return !1;
  var n = t.length - 1;
  return r == n ? t.pop() : Os.call(t, r, 1), --this.size, !0;
}
function Ss(e) {
  var t = this.__data__,
    r = Xe(t, e);
  return r < 0 ? void 0 : t[r][1];
}
function $s(e) {
  return Xe(this.__data__, e) > -1;
}
function Ps(e, t) {
  var r = this.__data__,
    n = Xe(r, e);
  return n < 0 ? (++this.size, r.push([e, t])) : r[n][1] = t, this;
}
function Y(e) {
  var t = -1,
    r = e == null ? 0 : e.length;
  for (this.clear(); ++t < r;) {
    var n = e[t];
    this.set(n[0], n[1]);
  }
}
Y.prototype.clear = _s;
Y.prototype.delete = Es;
Y.prototype.get = Ss;
Y.prototype.has = $s;
Y.prototype.set = Ps;
var Is = de(J, "Map");
var Me = Is;
function Fs() {
  this.size = 0, this.__data__ = {
    hash: new le(),
    map: new (Me || Y)(),
    string: new le()
  };
}
function js(e) {
  var t = _typeof(e);
  return t == "string" || t == "number" || t == "symbol" || t == "boolean" ? e !== "__proto__" : e === null;
}
function et(e, t) {
  var r = e.__data__;
  return js(t) ? r[typeof t == "string" ? "string" : "hash"] : r.map;
}
function Cs(e) {
  var t = et(this, e).delete(e);
  return this.size -= t ? 1 : 0, t;
}
function Ms(e) {
  return et(this, e).get(e);
}
function Ns(e) {
  return et(this, e).has(e);
}
function qs(e, t) {
  var r = et(this, e),
    n = r.size;
  return r.set(e, t), this.size += r.size == n ? 0 : 1, this;
}
function ee(e) {
  var t = -1,
    r = e == null ? 0 : e.length;
  for (this.clear(); ++t < r;) {
    var n = e[t];
    this.set(n[0], n[1]);
  }
}
ee.prototype.clear = Fs;
ee.prototype.delete = Cs;
ee.prototype.get = Ms;
ee.prototype.has = Ns;
ee.prototype.set = qs;
var Rs = "Expected a function";
function Nt(e, t) {
  if (typeof e != "function" || t != null && typeof t != "function") throw new TypeError(Rs);
  var r = function r() {
    var n = arguments,
      a = t ? t.apply(this, n) : n[0],
      s = r.cache;
    if (s.has(a)) return s.get(a);
    var i = e.apply(this, n);
    return r.cache = s.set(a, i) || s, i;
  };
  return r.cache = new (Nt.Cache || ee)(), r;
}
Nt.Cache = ee;
var Ds = 500;
function Ls(e) {
  var t = Nt(e, function (n) {
      return r.size === Ds && r.clear(), n;
    }),
    r = t.cache;
  return t;
}
var ks = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g,
  Bs = /\\(\\)?/g,
  Ws = Ls(function (e) {
    var t = [];
    return e.charCodeAt(0) === 46 && t.push(""), e.replace(ks, function (r, n, a, s) {
      t.push(a ? s.replace(Bs, "$1") : n || r);
    }), t;
  });
var Us = Ws;
function Vs(e) {
  return e == null ? "" : Xr(e);
}
function gn(e, t) {
  return ue(e) ? e : us(e, t) ? [e] : Us(Vs(e));
}
var zs = 1 / 0;
function pn(e) {
  if (typeof e == "string" || Pt(e)) return e;
  var t = e + "";
  return t == "0" && 1 / e == -zs ? "-0" : t;
}
function Gs(e, t) {
  t = gn(t, e);
  for (var r = 0, n = t.length; e != null && r < n;) e = e[pn(t[r++])];
  return r && r == n ? e : void 0;
}
function mn(e, t, r) {
  var n = e == null ? void 0 : Gs(e, t);
  return n === void 0 ? r : n;
}
function hn(e, t) {
  for (var r = -1, n = t.length, a = e.length; ++r < n;) e[a + r] = t[r];
  return e;
}
var Ks = dn(Object.getPrototypeOf, Object);
var yn = Ks;
function mt() {
  if (!arguments.length) return [];
  var e = arguments[0];
  return ue(e) ? e : [e];
}
function Hs() {
  this.__data__ = new Y(), this.size = 0;
}
function Js(e) {
  var t = this.__data__,
    r = t.delete(e);
  return this.size = t.size, r;
}
function Ys(e) {
  return this.__data__.get(e);
}
function Zs(e) {
  return this.__data__.has(e);
}
var Qs = 200;
function Xs(e, t) {
  var r = this.__data__;
  if (r instanceof Y) {
    var n = r.__data__;
    if (!Me || n.length < Qs - 1) return n.push([e, t]), this.size = ++r.size, this;
    r = this.__data__ = new ee(n);
  }
  return r.set(e, t), this.size = r.size, this;
}
function Te(e) {
  var t = this.__data__ = new Y(e);
  this.size = t.size;
}
Te.prototype.clear = Hs;
Te.prototype.delete = Js;
Te.prototype.get = Ys;
Te.prototype.has = Zs;
Te.prototype.set = Xs;
function eo(e, t) {
  return e && Qe(t, Ct(t), e);
}
function to(e, t) {
  return e && Qe(t, Mt(t), e);
}
var vn = (typeof exports === "undefined" ? "undefined" : _typeof(exports)) == "object" && exports && !exports.nodeType && exports,
  dr = vn && (typeof module === "undefined" ? "undefined" : _typeof(module)) == "object" && module && !module.nodeType && module,
  ro = dr && dr.exports === vn,
  gr = ro ? J.Buffer : void 0,
  pr = gr ? gr.allocUnsafe : void 0;
function no(e, t) {
  if (t) return e.slice();
  var r = e.length,
    n = pr ? pr(r) : new e.constructor(r);
  return e.copy(n), n;
}
function ao(e, t) {
  for (var r = -1, n = e == null ? 0 : e.length, a = 0, s = []; ++r < n;) {
    var i = e[r];
    t(i, r, e) && (s[a++] = i);
  }
  return s;
}
function bn() {
  return [];
}
var io = Object.prototype,
  so = io.propertyIsEnumerable,
  mr = Object.getOwnPropertySymbols,
  oo = mr ? function (e) {
    return e == null ? [] : (e = Object(e), ao(mr(e), function (t) {
      return so.call(e, t);
    }));
  } : bn;
var qt = oo;
function lo(e, t) {
  return Qe(e, qt(e), t);
}
var co = Object.getOwnPropertySymbols,
  uo = co ? function (e) {
    for (var t = []; e;) hn(t, qt(e)), e = yn(e);
    return t;
  } : bn;
var An = uo;
function fo(e, t) {
  return Qe(e, An(e), t);
}
function wn(e, t, r) {
  var n = t(e);
  return ue(e) ? n : hn(n, r(e));
}
function go(e) {
  return wn(e, Ct, qt);
}
function po(e) {
  return wn(e, Mt, An);
}
var mo = de(J, "DataView");
var ht = mo;
var ho = de(J, "Promise");
var yt = ho;
var yo = de(J, "Set");
var vt = yo;
var hr = "[object Map]",
  vo = "[object Object]",
  yr = "[object Promise]",
  vr = "[object Set]",
  br = "[object WeakMap]",
  Ar = "[object DataView]",
  bo = fe(ht),
  Ao = fe(Me),
  wo = fe(yt),
  xo = fe(vt),
  _o = fe(pt),
  re = xe;
(ht && re(new ht(new ArrayBuffer(1))) != Ar || Me && re(new Me()) != hr || yt && re(yt.resolve()) != yr || vt && re(new vt()) != vr || pt && re(new pt()) != br) && (re = function re(e) {
  var t = xe(e),
    r = t == vo ? e.constructor : void 0,
    n = r ? fe(r) : "";
  if (n) switch (n) {
    case bo:
      return Ar;
    case Ao:
      return hr;
    case wo:
      return yr;
    case xo:
      return vr;
    case _o:
      return br;
  }
  return t;
});
var Rt = re;
var To = Object.prototype,
  Oo = To.hasOwnProperty;
function Eo(e) {
  var t = e.length,
    r = new e.constructor(t);
  return t && typeof e[0] == "string" && Oo.call(e, "index") && (r.index = e.index, r.input = e.input), r;
}
var So = J.Uint8Array;
var wr = So;
function Dt(e) {
  var t = new e.constructor(e.byteLength);
  return new wr(t).set(new wr(e)), t;
}
function $o(e, t) {
  var r = t ? Dt(e.buffer) : e.buffer;
  return new e.constructor(r, e.byteOffset, e.byteLength);
}
var Po = /\w*$/;
function Io(e) {
  var t = new e.constructor(e.source, Po.exec(e));
  return t.lastIndex = e.lastIndex, t;
}
var xr = X ? X.prototype : void 0,
  _r = xr ? xr.valueOf : void 0;
function Fo(e) {
  return _r ? Object(_r.call(e)) : {};
}
function jo(e, t) {
  var r = t ? Dt(e.buffer) : e.buffer;
  return new e.constructor(r, e.byteOffset, e.length);
}
var Co = "[object Boolean]",
  Mo = "[object Date]",
  No = "[object Map]",
  qo = "[object Number]",
  Ro = "[object RegExp]",
  Do = "[object Set]",
  Lo = "[object String]",
  ko = "[object Symbol]",
  Bo = "[object ArrayBuffer]",
  Wo = "[object DataView]",
  Uo = "[object Float32Array]",
  Vo = "[object Float64Array]",
  zo = "[object Int8Array]",
  Go = "[object Int16Array]",
  Ko = "[object Int32Array]",
  Ho = "[object Uint8Array]",
  Jo = "[object Uint8ClampedArray]",
  Yo = "[object Uint16Array]",
  Zo = "[object Uint32Array]";
function Qo(e, t, r) {
  var n = e.constructor;
  switch (t) {
    case Bo:
      return Dt(e);
    case Co:
    case Mo:
      return new n(+e);
    case Wo:
      return $o(e, r);
    case Uo:
    case Vo:
    case zo:
    case Go:
    case Ko:
    case Ho:
    case Jo:
    case Yo:
    case Zo:
      return jo(e, r);
    case No:
      return new n();
    case qo:
    case Lo:
      return new n(e);
    case Ro:
      return Io(e);
    case Do:
      return new n();
    case ko:
      return Fo(e);
  }
}
function Xo(e) {
  return typeof e.constructor == "function" && !Ft(e) ? ri(yn(e)) : {};
}
var el = "[object Map]";
function tl(e) {
  return _e(e) && Rt(e) == el;
}
var Tr = we && we.isMap,
  rl = Tr ? jt(Tr) : tl;
var nl = rl;
var al = "[object Set]";
function il(e) {
  return _e(e) && Rt(e) == al;
}
var Or = we && we.isSet,
  sl = Or ? jt(Or) : il;
var ol = sl;
var ll = 1,
  cl = 2,
  ul = 4,
  xn = "[object Arguments]",
  fl = "[object Array]",
  dl = "[object Boolean]",
  gl = "[object Date]",
  pl = "[object Error]",
  _n = "[object Function]",
  ml = "[object GeneratorFunction]",
  hl = "[object Map]",
  yl = "[object Number]",
  Tn = "[object Object]",
  vl = "[object RegExp]",
  bl = "[object Set]",
  Al = "[object String]",
  wl = "[object Symbol]",
  xl = "[object WeakMap]",
  _l = "[object ArrayBuffer]",
  Tl = "[object DataView]",
  Ol = "[object Float32Array]",
  El = "[object Float64Array]",
  Sl = "[object Int8Array]",
  $l = "[object Int16Array]",
  Pl = "[object Int32Array]",
  Il = "[object Uint8Array]",
  Fl = "[object Uint8ClampedArray]",
  jl = "[object Uint16Array]",
  Cl = "[object Uint32Array]",
  M = {};
M[xn] = M[fl] = M[_l] = M[Tl] = M[dl] = M[gl] = M[Ol] = M[El] = M[Sl] = M[$l] = M[Pl] = M[hl] = M[yl] = M[Tn] = M[vl] = M[bl] = M[Al] = M[wl] = M[Il] = M[Fl] = M[jl] = M[Cl] = !0;
M[pl] = M[_n] = M[xl] = !1;
function Be(e, t, r, n, a, s) {
  var i,
    o = t & ll,
    l = t & cl,
    f = t & ul;
  if (r && (i = a ? r(e, n, a, s) : r(e)), i !== void 0) return i;
  if (!oe(e)) return e;
  var c = ue(e);
  if (c) {
    if (i = Eo(e), !o) return ni(e, i);
  } else {
    var y = Rt(e),
      g = y == _n || y == ml;
    if (cn(e)) return no(e, o);
    if (y == Tn || y == xn || g && !a) {
      if (i = l || g ? {} : Xo(e), !o) return l ? fo(e, to(i, e)) : lo(e, eo(i, e));
    } else {
      if (!M[y]) return a ? e : {};
      i = Qo(e, y, o);
    }
  }
  s || (s = new Te());
  var v = s.get(e);
  if (v) return v;
  s.set(e, i), ol(e) ? e.forEach(function (m) {
    i.add(Be(m, t, r, m, e, s));
  }) : nl(e) && e.forEach(function (m, u) {
    i.set(u, Be(m, t, r, u, e, s));
  });
  var A = f ? l ? po : go : l ? Mt : Ct,
    p = c ? void 0 : A(e);
  return ii(p || e, function (m, u) {
    p && (u = m, m = e[u]), It(i, u, Be(m, t, r, u, e, s));
  }), i;
}
var Ml = 4;
function Er(e) {
  return Be(e, Ml);
}
function vu(e) {
  return e == null;
}
function Nl(e, t, r, n) {
  if (!oe(e)) return e;
  t = gn(t, e);
  for (var a = -1, s = t.length, i = s - 1, o = e; o != null && ++a < s;) {
    var l = pn(t[a]),
      f = r;
    if (l === "__proto__" || l === "constructor" || l === "prototype") return e;
    if (a != i) {
      var c = o[l];
      f = n ? n(c, l, o) : void 0, f === void 0 && (f = oe(c) ? c : tn(t[a + 1]) ? [] : {});
    }
    It(o, l, f), o = o[l];
  }
  return e;
}
function ql(e, t, r) {
  return e == null ? e : Nl(e, t, r);
}
var st = function st(e, t, r) {
  return {
    get value() {
      return mn(e, t, r);
    },
    set value(n) {
      ql(e, t, n);
    }
  };
};
var Rl = /*#__PURE__*/function (_Error) {
  _inherits(Rl, _Error);
  var _super = _createSuper(Rl);
  function Rl(t) {
    var _this;
    _classCallCheck(this, Rl);
    _this = _super.call(this, t), _this.name = "ElementPlusError";
    return _this;
  }
  return _createClass(Rl);
}( /*#__PURE__*/_wrapNativeSuper(Error));
function Dl(e, t) {
  throw new Rl("[".concat(e, "] ").concat(t));
}
function bu(e, t) {}
var Au = "update:modelValue",
  wu = "change",
  xu = "input";
var Ll = {
  name: "en",
  el: {
    colorpicker: {
      confirm: "OK",
      clear: "Clear",
      defaultLabel: "color picker",
      description: "current color is {color}. press enter to select a new color."
    },
    datepicker: {
      now: "Now",
      today: "Today",
      cancel: "Cancel",
      clear: "Clear",
      confirm: "OK",
      dateTablePrompt: "Use the arrow keys and enter to select the day of the month",
      monthTablePrompt: "Use the arrow keys and enter to select the month",
      yearTablePrompt: "Use the arrow keys and enter to select the year",
      selectedDate: "Selected date",
      selectDate: "Select date",
      selectTime: "Select time",
      startDate: "Start Date",
      startTime: "Start Time",
      endDate: "End Date",
      endTime: "End Time",
      prevYear: "Previous Year",
      nextYear: "Next Year",
      prevMonth: "Previous Month",
      nextMonth: "Next Month",
      year: "",
      month1: "January",
      month2: "February",
      month3: "March",
      month4: "April",
      month5: "May",
      month6: "June",
      month7: "July",
      month8: "August",
      month9: "September",
      month10: "October",
      month11: "November",
      month12: "December",
      week: "week",
      weeks: {
        sun: "Sun",
        mon: "Mon",
        tue: "Tue",
        wed: "Wed",
        thu: "Thu",
        fri: "Fri",
        sat: "Sat"
      },
      weeksFull: {
        sun: "Sunday",
        mon: "Monday",
        tue: "Tuesday",
        wed: "Wednesday",
        thu: "Thursday",
        fri: "Friday",
        sat: "Saturday"
      },
      months: {
        jan: "Jan",
        feb: "Feb",
        mar: "Mar",
        apr: "Apr",
        may: "May",
        jun: "Jun",
        jul: "Jul",
        aug: "Aug",
        sep: "Sep",
        oct: "Oct",
        nov: "Nov",
        dec: "Dec"
      }
    },
    inputNumber: {
      decrease: "decrease number",
      increase: "increase number"
    },
    select: {
      loading: "Loading",
      noMatch: "No matching data",
      noData: "No data",
      placeholder: "Select"
    },
    dropdown: {
      toggleDropdown: "Toggle Dropdown"
    },
    cascader: {
      noMatch: "No matching data",
      loading: "Loading",
      placeholder: "Select",
      noData: "No data"
    },
    pagination: {
      goto: "Go to",
      pagesize: "/page",
      total: "Total {total}",
      pageClassifier: "",
      page: "Page",
      prev: "Go to previous page",
      next: "Go to next page",
      currentPage: "page {pager}",
      prevPages: "Previous {pager} pages",
      nextPages: "Next {pager} pages",
      deprecationWarning: "Deprecated usages detected, please refer to the el-pagination documentation for more details"
    },
    dialog: {
      close: "Close this dialog"
    },
    drawer: {
      close: "Close this dialog"
    },
    messagebox: {
      title: "Message",
      confirm: "OK",
      cancel: "Cancel",
      error: "Illegal input",
      close: "Close this dialog"
    },
    upload: {
      deleteTip: "press delete to remove",
      delete: "Delete",
      preview: "Preview",
      continue: "Continue"
    },
    slider: {
      defaultLabel: "slider between {min} and {max}",
      defaultRangeStartLabel: "pick start value",
      defaultRangeEndLabel: "pick end value"
    },
    table: {
      emptyText: "No Data",
      confirmFilter: "Confirm",
      resetFilter: "Reset",
      clearFilter: "All",
      sumText: "Sum"
    },
    tree: {
      emptyText: "No Data"
    },
    transfer: {
      noMatch: "No matching data",
      noData: "No data",
      titles: ["List 1", "List 2"],
      filterPlaceholder: "Enter keyword",
      noCheckedFormat: "{total} items",
      hasCheckedFormat: "{checked}/{total} checked"
    },
    image: {
      error: "FAILED"
    },
    pageHeader: {
      title: "Back"
    },
    popconfirm: {
      confirmButtonText: "Yes",
      cancelButtonText: "No"
    }
  }
};
var kl = function kl(e) {
    return function (t, r) {
      return Bl(t, r, j(e));
    };
  },
  Bl = function Bl(e, t, r) {
    return mn(r, e, e).replace(/\{(\w+)\}/g, function (n, a) {
      var s;
      return "".concat((s = t == null ? void 0 : t[a]) != null ? s : "{".concat(a, "}"));
    });
  },
  Wl = function Wl(e) {
    var t = R(function () {
        return j(e).name;
      }),
      r = Rn(e) ? e : z(e);
    return {
      lang: t,
      locale: r,
      t: kl(e)
    };
  },
  Ul = Symbol("localeContextKey"),
  _u = function _u(e) {
    var t = e || je(Ul, z());
    return Wl(R(function () {
      return t.value || Ll;
    }));
  },
  Vl = Ye({
    size: {
      type: String,
      values: Kr
    },
    disabled: Boolean
  }),
  zl = Ye(_objectSpread(_objectSpread({}, Vl), {}, {
    model: Object,
    rules: {
      type: dt(Object)
    },
    labelPosition: {
      type: String,
      values: ["left", "right", "top"],
      default: "right"
    },
    requireAsteriskPosition: {
      type: String,
      values: ["left", "right"],
      default: "left"
    },
    labelWidth: {
      type: [String, Number],
      default: ""
    },
    labelSuffix: {
      type: String,
      default: ""
    },
    inline: Boolean,
    inlineMessage: Boolean,
    statusIcon: Boolean,
    showMessage: {
      type: Boolean,
      default: !0
    },
    validateOnRuleChange: {
      type: Boolean,
      default: !0
    },
    hideRequiredAsterisk: Boolean,
    scrollToError: Boolean,
    scrollIntoViewOptions: {
      type: [Object, Boolean]
    }
  })),
  Gl = {
    validate: function validate(e, t, r) {
      return (Dn(e) || ut(e)) && Gr(t) && ut(r);
    }
  };
function Kl() {
  var e = z([]),
    t = R(function () {
      if (!e.value.length) return "0";
      var s = Math.max.apply(Math, _toConsumableArray(e.value));
      return s ? "".concat(s, "px") : "";
    });
  function r(s) {
    var i = e.value.indexOf(s);
    return i === -1 && t.value, i;
  }
  function n(s, i) {
    if (s && i) {
      var o = r(i);
      e.value.splice(o, 1, s);
    } else s && e.value.push(s);
  }
  function a(s) {
    var i = r(s);
    i > -1 && e.value.splice(i, 1);
  }
  return {
    autoLabelWidth: t,
    registerLabelWidth: n,
    deregisterLabelWidth: a
  };
}
var De = function De(e, t) {
    var r = mt(t);
    return r.length > 0 ? e.filter(function (n) {
      return n.prop && r.includes(n.prop);
    }) : e;
  },
  Hl = "ElForm",
  Jl = ce({
    name: Hl
  }),
  Yl = ce(_objectSpread(_objectSpread({}, Jl), {}, {
    props: zl,
    emits: Gl,
    setup: function setup(e, _ref3) {
      var t = _ref3.expose,
        r = _ref3.emit;
      var n = e,
        a = [],
        s = Hr(),
        i = Ze("form"),
        o = R(function () {
          var _ref4;
          var w = n.labelPosition,
            d = n.inline;
          return [i.b(), i.m(s.value || "default"), (_ref4 = {}, _defineProperty(_ref4, i.m("label-".concat(w)), w), _defineProperty(_ref4, i.m("inline"), d), _ref4)];
        }),
        l = function l(w) {
          a.push(w);
        },
        f = function f(w) {
          w.prop && a.splice(a.indexOf(w), 1);
        },
        c = function c() {
          var w = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
          n.model && De(a, w).forEach(function (d) {
            return d.resetField();
          });
        },
        y = function y() {
          var w = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
          De(a, w).forEach(function (d) {
            return d.clearValidate();
          });
        },
        g = R(function () {
          return !!n.model;
        }),
        v = function v(w) {
          if (a.length === 0) return [];
          var d = De(a, w);
          return d.length ? d : [];
        },
        A = /*#__PURE__*/function () {
          var _ref5 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(w) {
            return _regeneratorRuntime().wrap(function _callee$(_context) {
              while (1) switch (_context.prev = _context.next) {
                case 0:
                  return _context.abrupt("return", m(void 0, w));
                case 1:
                case "end":
                  return _context.stop();
              }
            }, _callee);
          }));
          return function A(_x2) {
            return _ref5.apply(this, arguments);
          };
        }(),
        p = /*#__PURE__*/function () {
          var _ref6 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2() {
            var w,
              d,
              _,
              _iterator3,
              _step3,
              P,
              _args2 = arguments;
            return _regeneratorRuntime().wrap(function _callee2$(_context2) {
              while (1) switch (_context2.prev = _context2.next) {
                case 0:
                  w = _args2.length > 0 && _args2[0] !== undefined ? _args2[0] : [];
                  if (g.value) {
                    _context2.next = 3;
                    break;
                  }
                  return _context2.abrupt("return", !1);
                case 3:
                  d = v(w);
                  if (!(d.length === 0)) {
                    _context2.next = 6;
                    break;
                  }
                  return _context2.abrupt("return", !0);
                case 6:
                  _ = {};
                  _iterator3 = _createForOfIteratorHelper(d);
                  _context2.prev = 8;
                  _iterator3.s();
                case 10:
                  if ((_step3 = _iterator3.n()).done) {
                    _context2.next = 22;
                    break;
                  }
                  P = _step3.value;
                  _context2.prev = 12;
                  _context2.next = 15;
                  return P.validate("");
                case 15:
                  _context2.next = 20;
                  break;
                case 17:
                  _context2.prev = 17;
                  _context2.t0 = _context2["catch"](12);
                  _ = _objectSpread(_objectSpread({}, _), _context2.t0);
                case 20:
                  _context2.next = 10;
                  break;
                case 22:
                  _context2.next = 27;
                  break;
                case 24:
                  _context2.prev = 24;
                  _context2.t1 = _context2["catch"](8);
                  _iterator3.e(_context2.t1);
                case 27:
                  _context2.prev = 27;
                  _iterator3.f();
                  return _context2.finish(27);
                case 30:
                  return _context2.abrupt("return", Object.keys(_).length === 0 ? !0 : Promise.reject(_));
                case 31:
                case "end":
                  return _context2.stop();
              }
            }, _callee2, null, [[8, 24, 27, 30], [12, 17]]);
          }));
          return function p() {
            return _ref6.apply(this, arguments);
          };
        }(),
        m = /*#__PURE__*/function () {
          var _ref7 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3() {
            var w,
              d,
              _,
              P,
              $,
              _args3 = arguments;
            return _regeneratorRuntime().wrap(function _callee3$(_context3) {
              while (1) switch (_context3.prev = _context3.next) {
                case 0:
                  w = _args3.length > 0 && _args3[0] !== undefined ? _args3[0] : [];
                  d = _args3.length > 1 ? _args3[1] : undefined;
                  _ = !Rr(d);
                  _context3.prev = 3;
                  _context3.next = 6;
                  return p(w);
                case 6:
                  P = _context3.sent;
                  return _context3.abrupt("return", (P === !0 && (d == null || d(P)), P));
                case 10:
                  _context3.prev = 10;
                  _context3.t0 = _context3["catch"](3);
                  if (!(_context3.t0 instanceof Error)) {
                    _context3.next = 14;
                    break;
                  }
                  throw _context3.t0;
                case 14:
                  $ = _context3.t0;
                  return _context3.abrupt("return", (n.scrollToError && u(Object.keys($)[0]), d == null || d(!1, $), _ && Promise.reject($)));
                case 16:
                case "end":
                  return _context3.stop();
              }
            }, _callee3, null, [[3, 10]]);
          }));
          return function m() {
            return _ref7.apply(this, arguments);
          };
        }(),
        u = function u(w) {
          var d;
          var _ = De(a, w)[0];
          _ && ((d = _.$el) == null || d.scrollIntoView(n.scrollIntoViewOptions));
        };
      return Ae(function () {
        return n.rules;
      }, function () {
        n.validateOnRuleChange && A().catch(function (w) {
          return void 0;
        });
      }, {
        deep: !0
      }), Nr(Et, Ve(_objectSpread(_objectSpread({}, qr(n)), {}, {
        emit: r,
        resetFields: c,
        clearValidate: y,
        validateField: m,
        addField: l,
        removeField: f
      }, Kl()))), t({
        validate: A,
        validateField: m,
        resetFields: c,
        clearValidate: y,
        scrollToField: u
      }), function (w, d) {
        return ne(), ze("form", {
          class: ae(j(o))
        }, [be(w.$slots, "default")], 2);
      };
    }
  }));
var Zl = St(Yl, [["__file", "/home/runner/work/element-plus/element-plus/packages/components/form/src/form.vue"]]);
function ie() {
  return ie = Object.assign ? Object.assign.bind() : function (e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r) Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, ie.apply(this, arguments);
}
function Ql(e, t) {
  e.prototype = Object.create(t.prototype), e.prototype.constructor = e, Ne(e, t);
}
function bt(e) {
  return bt = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (r) {
    return r.__proto__ || Object.getPrototypeOf(r);
  }, bt(e);
}
function Ne(e, t) {
  return Ne = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (n, a) {
    return n.__proto__ = a, n;
  }, Ne(e, t);
}
function Xl() {
  if ((typeof Reflect === "undefined" ? "undefined" : _typeof(Reflect)) > "u" || !Reflect.construct || Reflect.construct.sham) return !1;
  if (typeof Proxy == "function") return !0;
  try {
    return Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})), !0;
  } catch (_unused6) {
    return !1;
  }
}
function We(e, t, r) {
  return Xl() ? We = Reflect.construct.bind() : We = function We(a, s, i) {
    var o = [null];
    o.push.apply(o, s);
    var l = Function.bind.apply(a, o),
      f = new l();
    return i && Ne(f, i.prototype), f;
  }, We.apply(null, arguments);
}
function ec(e) {
  return Function.toString.call(e).indexOf("[native code]") !== -1;
}
function At(e) {
  var t = typeof Map == "function" ? new Map() : void 0;
  return At = function At(n) {
    if (n === null || !ec(n)) return n;
    if (typeof n != "function") throw new TypeError("Super expression must either be null or a function");
    if (_typeof(t) < "u") {
      if (t.has(n)) return t.get(n);
      t.set(n, a);
    }
    function a() {
      return We(n, arguments, bt(this).constructor);
    }
    return a.prototype = Object.create(n.prototype, {
      constructor: {
        value: a,
        enumerable: !1,
        writable: !0,
        configurable: !0
      }
    }), Ne(a, n);
  }, At(e);
}
var tc = /%[sdj%]/g,
  rc = function rc() {};
(typeof process === "undefined" ? "undefined" : _typeof(process)) < "u" && process.env;
function wt(e) {
  if (!e || !e.length) return null;
  var t = {};
  return e.forEach(function (r) {
    var n = r.field;
    t[n] = t[n] || [], t[n].push(r);
  }), t;
}
function G(e) {
  for (var t = arguments.length, r = new Array(t > 1 ? t - 1 : 0), n = 1; n < t; n++) r[n - 1] = arguments[n];
  var a = 0,
    s = r.length;
  if (typeof e == "function") return e.apply(null, r);
  if (typeof e == "string") {
    var i = e.replace(tc, function (o) {
      if (o === "%%") return "%";
      if (a >= s) return o;
      switch (o) {
        case "%s":
          return String(r[a++]);
        case "%d":
          return Number(r[a++]);
        case "%j":
          try {
            return JSON.stringify(r[a++]);
          } catch (_unused7) {
            return "[Circular]";
          }
          break;
        default:
          return o;
      }
    });
    return i;
  }
  return e;
}
function nc(e) {
  return e === "string" || e === "url" || e === "hex" || e === "email" || e === "date" || e === "pattern";
}
function D(e, t) {
  return !!(e == null || t === "array" && Array.isArray(e) && !e.length || nc(t) && typeof e == "string" && !e);
}
function ac(e, t, r) {
  var n = [],
    a = 0,
    s = e.length;
  function i(o) {
    n.push.apply(n, o || []), a++, a === s && r(n);
  }
  e.forEach(function (o) {
    t(o, i);
  });
}
function Sr(e, t, r) {
  var n = 0,
    a = e.length;
  function s(i) {
    if (i && i.length) {
      r(i);
      return;
    }
    var o = n;
    n = n + 1, o < a ? t(e[o], s) : r([]);
  }
  s([]);
}
function ic(e) {
  var t = [];
  return Object.keys(e).forEach(function (r) {
    t.push.apply(t, e[r] || []);
  }), t;
}
var $r = function (e) {
  Ql(t, e);
  function t(r, n) {
    var a;
    return a = e.call(this, "Async Validation Error") || this, a.errors = r, a.fields = n, a;
  }
  return t;
}(At(Error));
function sc(e, t, r, n, a) {
  if (t.first) {
    var s = new Promise(function (g, v) {
      var A = function A(u) {
          return n(u), u.length ? v(new $r(u, wt(u))) : g(a);
        },
        p = ic(e);
      Sr(p, r, A);
    });
    return s.catch(function (g) {
      return g;
    }), s;
  }
  var i = t.firstFields === !0 ? Object.keys(e) : t.firstFields || [],
    o = Object.keys(e),
    l = o.length,
    f = 0,
    c = [],
    y = new Promise(function (g, v) {
      var A = function A(m) {
        if (c.push.apply(c, m), f++, f === l) return n(c), c.length ? v(new $r(c, wt(c))) : g(a);
      };
      o.length || (n(c), g(a)), o.forEach(function (p) {
        var m = e[p];
        i.indexOf(p) !== -1 ? Sr(m, r, A) : ac(m, r, A);
      });
    });
  return y.catch(function (g) {
    return g;
  }), y;
}
function oc(e) {
  return !!(e && e.message !== void 0);
}
function lc(e, t) {
  for (var r = e, n = 0; n < t.length; n++) {
    if (r == null) return r;
    r = r[t[n]];
  }
  return r;
}
function Pr(e, t) {
  return function (r) {
    var n;
    return e.fullFields ? n = lc(t, e.fullFields) : n = t[r.field || e.fullField], oc(r) ? (r.field = r.field || e.fullField, r.fieldValue = n, r) : {
      message: typeof r == "function" ? r() : r,
      fieldValue: n,
      field: r.field || e.fullField
    };
  };
}
function Ir(e, t) {
  if (t) {
    for (var r in t) if (t.hasOwnProperty(r)) {
      var n = t[r];
      _typeof(n) == "object" && _typeof(e[r]) == "object" ? e[r] = ie({}, e[r], n) : e[r] = n;
    }
  }
  return e;
}
var On = function On(t, r, n, a, s, i) {
    t.required && (!n.hasOwnProperty(t.field) || D(r, i || t.type)) && a.push(G(s.messages.required, t.fullField));
  },
  cc = function cc(t, r, n, a, s) {
    (/^\s+$/.test(r) || r === "") && a.push(G(s.messages.whitespace, t.fullField));
  },
  Le,
  uc = function uc() {
    if (Le) return Le;
    var e = "[a-fA-F\\d:]",
      t = function t(_) {
        return _ && _.includeBoundaries ? "(?:(?<=\\s|^)(?=" + e + ")|(?<=" + e + ")(?=\\s|$))" : "";
      },
      r = "(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]\\d|\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]\\d|\\d)){3}",
      n = "[a-fA-F\\d]{1,4}",
      a = ("\n(?:\n(?:" + n + ":){7}(?:" + n + "|:)|                                    // 1:2:3:4:5:6:7::  1:2:3:4:5:6:7:8\n(?:" + n + ":){6}(?:" + r + "|:" + n + "|:)|                             // 1:2:3:4:5:6::    1:2:3:4:5:6::8   1:2:3:4:5:6::8  1:2:3:4:5:6::1.2.3.4\n(?:" + n + ":){5}(?::" + r + "|(?::" + n + "){1,2}|:)|                   // 1:2:3:4:5::      1:2:3:4:5::7:8   1:2:3:4:5::8    1:2:3:4:5::7:1.2.3.4\n(?:" + n + ":){4}(?:(?::" + n + "){0,1}:" + r + "|(?::" + n + "){1,3}|:)| // 1:2:3:4::        1:2:3:4::6:7:8   1:2:3:4::8      1:2:3:4::6:7:1.2.3.4\n(?:" + n + ":){3}(?:(?::" + n + "){0,2}:" + r + "|(?::" + n + "){1,4}|:)| // 1:2:3::          1:2:3::5:6:7:8   1:2:3::8        1:2:3::5:6:7:1.2.3.4\n(?:" + n + ":){2}(?:(?::" + n + "){0,3}:" + r + "|(?::" + n + "){1,5}|:)| // 1:2::            1:2::4:5:6:7:8   1:2::8          1:2::4:5:6:7:1.2.3.4\n(?:" + n + ":){1}(?:(?::" + n + "){0,4}:" + r + "|(?::" + n + "){1,6}|:)| // 1::              1::3:4:5:6:7:8   1::8            1::3:4:5:6:7:1.2.3.4\n(?::(?:(?::" + n + "){0,5}:" + r + "|(?::" + n + "){1,7}|:))             // ::2:3:4:5:6:7:8  ::2:3:4:5:6:7:8  ::8             ::1.2.3.4\n)(?:%[0-9a-zA-Z]{1,})?                                             // %eth0            %1\n").replace(/\s*\/\/.*$/gm, "").replace(/\n/g, "").trim(),
      s = new RegExp("(?:^" + r + "$)|(?:^" + a + "$)"),
      i = new RegExp("^" + r + "$"),
      o = new RegExp("^" + a + "$"),
      l = function l(_) {
        return _ && _.exact ? s : new RegExp("(?:" + t(_) + r + t(_) + ")|(?:" + t(_) + a + t(_) + ")", "g");
      };
    l.v4 = function (d) {
      return d && d.exact ? i : new RegExp("" + t(d) + r + t(d), "g");
    }, l.v6 = function (d) {
      return d && d.exact ? o : new RegExp("" + t(d) + a + t(d), "g");
    };
    var f = "(?:(?:[a-z]+:)?//)",
      c = "(?:\\S+(?::\\S*)?@)?",
      y = l.v4().source,
      g = l.v6().source,
      v = "(?:(?:[a-z\\u00a1-\\uffff0-9][-_]*)*[a-z\\u00a1-\\uffff0-9]+)",
      A = "(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*",
      p = "(?:\\.(?:[a-z\\u00a1-\\uffff]{2,}))",
      m = "(?::\\d{2,5})?",
      u = '(?:[/?#][^\\s"]*)?',
      w = "(?:" + f + "|www\\.)" + c + "(?:localhost|" + y + "|" + g + "|" + v + A + p + ")" + m + u;
    return Le = new RegExp("(?:^" + w + "$)", "i"), Le;
  },
  Fr = {
    email: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+\.)+[a-zA-Z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]{2,}))$/,
    hex: /^#?([a-f0-9]{6}|[a-f0-9]{3})$/i
  },
  Se = {
    integer: function integer(t) {
      return Se.number(t) && parseInt(t, 10) === t;
    },
    float: function float(t) {
      return Se.number(t) && !Se.integer(t);
    },
    array: function array(t) {
      return Array.isArray(t);
    },
    regexp: function regexp(t) {
      if (t instanceof RegExp) return !0;
      try {
        return !!new RegExp(t);
      } catch (_unused8) {
        return !1;
      }
    },
    date: function date(t) {
      return typeof t.getTime == "function" && typeof t.getMonth == "function" && typeof t.getYear == "function" && !isNaN(t.getTime());
    },
    number: function number(t) {
      return isNaN(t) ? !1 : typeof t == "number";
    },
    object: function object(t) {
      return _typeof(t) == "object" && !Se.array(t);
    },
    method: function method(t) {
      return typeof t == "function";
    },
    email: function email(t) {
      return typeof t == "string" && t.length <= 320 && !!t.match(Fr.email);
    },
    url: function url(t) {
      return typeof t == "string" && t.length <= 2048 && !!t.match(uc());
    },
    hex: function hex(t) {
      return typeof t == "string" && !!t.match(Fr.hex);
    }
  },
  fc = function fc(t, r, n, a, s) {
    if (t.required && r === void 0) {
      On(t, r, n, a, s);
      return;
    }
    var i = ["integer", "float", "array", "regexp", "object", "method", "email", "number", "date", "url", "hex"],
      o = t.type;
    i.indexOf(o) > -1 ? Se[o](r) || a.push(G(s.messages.types[o], t.fullField, t.type)) : o && _typeof(r) !== t.type && a.push(G(s.messages.types[o], t.fullField, t.type));
  },
  dc = function dc(t, r, n, a, s) {
    var i = typeof t.len == "number",
      o = typeof t.min == "number",
      l = typeof t.max == "number",
      f = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g,
      c = r,
      y = null,
      g = typeof r == "number",
      v = typeof r == "string",
      A = Array.isArray(r);
    if (g ? y = "number" : v ? y = "string" : A && (y = "array"), !y) return !1;
    A && (c = r.length), v && (c = r.replace(f, "_").length), i ? c !== t.len && a.push(G(s.messages[y].len, t.fullField, t.len)) : o && !l && c < t.min ? a.push(G(s.messages[y].min, t.fullField, t.min)) : l && !o && c > t.max ? a.push(G(s.messages[y].max, t.fullField, t.max)) : o && l && (c < t.min || c > t.max) && a.push(G(s.messages[y].range, t.fullField, t.min, t.max));
  },
  me = "enum",
  gc = function gc(t, r, n, a, s) {
    t[me] = Array.isArray(t[me]) ? t[me] : [], t[me].indexOf(r) === -1 && a.push(G(s.messages[me], t.fullField, t[me].join(", ")));
  },
  pc = function pc(t, r, n, a, s) {
    if (t.pattern) {
      if (t.pattern instanceof RegExp) t.pattern.lastIndex = 0, t.pattern.test(r) || a.push(G(s.messages.pattern.mismatch, t.fullField, r, t.pattern));else if (typeof t.pattern == "string") {
        var i = new RegExp(t.pattern);
        i.test(r) || a.push(G(s.messages.pattern.mismatch, t.fullField, r, t.pattern));
      }
    }
  },
  E = {
    required: On,
    whitespace: cc,
    type: fc,
    range: dc,
    enum: gc,
    pattern: pc
  },
  mc = function mc(t, r, n, a, s) {
    var i = [],
      o = t.required || !t.required && a.hasOwnProperty(t.field);
    if (o) {
      if (D(r, "string") && !t.required) return n();
      E.required(t, r, a, i, s, "string"), D(r, "string") || (E.type(t, r, a, i, s), E.range(t, r, a, i, s), E.pattern(t, r, a, i, s), t.whitespace === !0 && E.whitespace(t, r, a, i, s));
    }
    n(i);
  },
  hc = function hc(t, r, n, a, s) {
    var i = [],
      o = t.required || !t.required && a.hasOwnProperty(t.field);
    if (o) {
      if (D(r) && !t.required) return n();
      E.required(t, r, a, i, s), r !== void 0 && E.type(t, r, a, i, s);
    }
    n(i);
  },
  yc = function yc(t, r, n, a, s) {
    var i = [],
      o = t.required || !t.required && a.hasOwnProperty(t.field);
    if (o) {
      if (r === "" && (r = void 0), D(r) && !t.required) return n();
      E.required(t, r, a, i, s), r !== void 0 && (E.type(t, r, a, i, s), E.range(t, r, a, i, s));
    }
    n(i);
  },
  vc = function vc(t, r, n, a, s) {
    var i = [],
      o = t.required || !t.required && a.hasOwnProperty(t.field);
    if (o) {
      if (D(r) && !t.required) return n();
      E.required(t, r, a, i, s), r !== void 0 && E.type(t, r, a, i, s);
    }
    n(i);
  },
  bc = function bc(t, r, n, a, s) {
    var i = [],
      o = t.required || !t.required && a.hasOwnProperty(t.field);
    if (o) {
      if (D(r) && !t.required) return n();
      E.required(t, r, a, i, s), D(r) || E.type(t, r, a, i, s);
    }
    n(i);
  },
  Ac = function Ac(t, r, n, a, s) {
    var i = [],
      o = t.required || !t.required && a.hasOwnProperty(t.field);
    if (o) {
      if (D(r) && !t.required) return n();
      E.required(t, r, a, i, s), r !== void 0 && (E.type(t, r, a, i, s), E.range(t, r, a, i, s));
    }
    n(i);
  },
  wc = function wc(t, r, n, a, s) {
    var i = [],
      o = t.required || !t.required && a.hasOwnProperty(t.field);
    if (o) {
      if (D(r) && !t.required) return n();
      E.required(t, r, a, i, s), r !== void 0 && (E.type(t, r, a, i, s), E.range(t, r, a, i, s));
    }
    n(i);
  },
  xc = function xc(t, r, n, a, s) {
    var i = [],
      o = t.required || !t.required && a.hasOwnProperty(t.field);
    if (o) {
      if (r == null && !t.required) return n();
      E.required(t, r, a, i, s, "array"), r != null && (E.type(t, r, a, i, s), E.range(t, r, a, i, s));
    }
    n(i);
  },
  _c = function _c(t, r, n, a, s) {
    var i = [],
      o = t.required || !t.required && a.hasOwnProperty(t.field);
    if (o) {
      if (D(r) && !t.required) return n();
      E.required(t, r, a, i, s), r !== void 0 && E.type(t, r, a, i, s);
    }
    n(i);
  },
  Tc = "enum",
  Oc = function Oc(t, r, n, a, s) {
    var i = [],
      o = t.required || !t.required && a.hasOwnProperty(t.field);
    if (o) {
      if (D(r) && !t.required) return n();
      E.required(t, r, a, i, s), r !== void 0 && E[Tc](t, r, a, i, s);
    }
    n(i);
  },
  Ec = function Ec(t, r, n, a, s) {
    var i = [],
      o = t.required || !t.required && a.hasOwnProperty(t.field);
    if (o) {
      if (D(r, "string") && !t.required) return n();
      E.required(t, r, a, i, s), D(r, "string") || E.pattern(t, r, a, i, s);
    }
    n(i);
  },
  Sc = function Sc(t, r, n, a, s) {
    var i = [],
      o = t.required || !t.required && a.hasOwnProperty(t.field);
    if (o) {
      if (D(r, "date") && !t.required) return n();
      if (E.required(t, r, a, i, s), !D(r, "date")) {
        var l;
        r instanceof Date ? l = r : l = new Date(r), E.type(t, l, a, i, s), l && E.range(t, l.getTime(), a, i, s);
      }
    }
    n(i);
  },
  $c = function $c(t, r, n, a, s) {
    var i = [],
      o = Array.isArray(r) ? "array" : _typeof(r);
    E.required(t, r, a, i, s, o), n(i);
  },
  ot = function ot(t, r, n, a, s) {
    var i = t.type,
      o = [],
      l = t.required || !t.required && a.hasOwnProperty(t.field);
    if (l) {
      if (D(r, i) && !t.required) return n();
      E.required(t, r, a, o, s, i), D(r, i) || E.type(t, r, a, o, s);
    }
    n(o);
  },
  Pc = function Pc(t, r, n, a, s) {
    var i = [],
      o = t.required || !t.required && a.hasOwnProperty(t.field);
    if (o) {
      if (D(r) && !t.required) return n();
      E.required(t, r, a, i, s);
    }
    n(i);
  },
  Ie = {
    string: mc,
    method: hc,
    number: yc,
    boolean: vc,
    regexp: bc,
    integer: Ac,
    float: wc,
    array: xc,
    object: _c,
    enum: Oc,
    pattern: Ec,
    date: Sc,
    url: ot,
    hex: ot,
    email: ot,
    required: $c,
    any: Pc
  };
function xt() {
  return {
    default: "Validation error on field %s",
    required: "%s is required",
    enum: "%s must be one of %s",
    whitespace: "%s cannot be empty",
    date: {
      format: "%s date %s is invalid for format %s",
      parse: "%s date could not be parsed, %s is invalid ",
      invalid: "%s date %s is invalid"
    },
    types: {
      string: "%s is not a %s",
      method: "%s is not a %s (function)",
      array: "%s is not an %s",
      object: "%s is not an %s",
      number: "%s is not a %s",
      date: "%s is not a %s",
      boolean: "%s is not a %s",
      integer: "%s is not an %s",
      float: "%s is not a %s",
      regexp: "%s is not a valid %s",
      email: "%s is not a valid %s",
      url: "%s is not a valid %s",
      hex: "%s is not a valid %s"
    },
    string: {
      len: "%s must be exactly %s characters",
      min: "%s must be at least %s characters",
      max: "%s cannot be longer than %s characters",
      range: "%s must be between %s and %s characters"
    },
    number: {
      len: "%s must equal %s",
      min: "%s cannot be less than %s",
      max: "%s cannot be greater than %s",
      range: "%s must be between %s and %s"
    },
    array: {
      len: "%s must be exactly %s in length",
      min: "%s cannot be less than %s in length",
      max: "%s cannot be greater than %s in length",
      range: "%s must be between %s and %s in length"
    },
    pattern: {
      mismatch: "%s value %s does not match pattern %s"
    },
    clone: function clone() {
      var t = JSON.parse(JSON.stringify(this));
      return t.clone = this.clone, t;
    }
  };
}
var _t = xt(),
  qe = function () {
    function e(r) {
      this.rules = null, this._messages = _t, this.define(r);
    }
    var t = e.prototype;
    return t.define = function (n) {
      var a = this;
      if (!n) throw new Error("Cannot configure a schema with no rules");
      if (_typeof(n) != "object" || Array.isArray(n)) throw new Error("Rules must be an object");
      this.rules = {}, Object.keys(n).forEach(function (s) {
        var i = n[s];
        a.rules[s] = Array.isArray(i) ? i : [i];
      });
    }, t.messages = function (n) {
      return n && (this._messages = Ir(xt(), n)), this._messages;
    }, t.validate = function (n, a, s) {
      var i = this;
      a === void 0 && (a = {}), s === void 0 && (s = function s() {});
      var o = n,
        l = a,
        f = s;
      if (typeof l == "function" && (f = l, l = {}), !this.rules || Object.keys(this.rules).length === 0) return f && f(null, o), Promise.resolve(o);
      function c(p) {
        var m = [],
          u = {};
        function w(_) {
          if (Array.isArray(_)) {
            var P;
            m = (P = m).concat.apply(P, _);
          } else m.push(_);
        }
        for (var d = 0; d < p.length; d++) w(p[d]);
        m.length ? (u = wt(m), f(m, u)) : f(null, o);
      }
      if (l.messages) {
        var y = this.messages();
        y === _t && (y = xt()), Ir(y, l.messages), l.messages = y;
      } else l.messages = this.messages();
      var g = {},
        v = l.keys || Object.keys(this.rules);
      v.forEach(function (p) {
        var m = i.rules[p],
          u = o[p];
        m.forEach(function (w) {
          var d = w;
          typeof d.transform == "function" && (o === n && (o = ie({}, o)), u = o[p] = d.transform(u)), typeof d == "function" ? d = {
            validator: d
          } : d = ie({}, d), d.validator = i.getValidationMethod(d), d.validator && (d.field = p, d.fullField = d.fullField || p, d.type = i.getType(d), g[p] = g[p] || [], g[p].push({
            rule: d,
            value: u,
            source: o,
            field: p
          }));
        });
      });
      var A = {};
      return sc(g, l, function (p, m) {
        var u = p.rule,
          w = (u.type === "object" || u.type === "array") && (_typeof(u.fields) == "object" || _typeof(u.defaultField) == "object");
        w = w && (u.required || !u.required && p.value), u.field = p.field;
        function d($, B) {
          return ie({}, B, {
            fullField: u.fullField + "." + $,
            fullFields: u.fullFields ? [].concat(u.fullFields, [$]) : [$]
          });
        }
        function _($) {
          $ === void 0 && ($ = []);
          var B = Array.isArray($) ? $ : [$];
          !l.suppressWarning && B.length && e.warning("async-validator:", B), B.length && u.message !== void 0 && (B = [].concat(u.message));
          var h = B.map(Pr(u, o));
          if (l.first && h.length) return A[u.field] = 1, m(h);
          if (!w) m(h);else {
            if (u.required && !p.value) return u.message !== void 0 ? h = [].concat(u.message).map(Pr(u, o)) : l.error && (h = [l.error(u, G(l.messages.required, u.field))]), m(h);
            var b = {};
            u.defaultField && Object.keys(p.value).map(function (I) {
              b[I] = u.defaultField;
            }), b = ie({}, b, p.rule.fields);
            var T = {};
            Object.keys(b).forEach(function (I) {
              var C = b[I],
                W = Array.isArray(C) ? C : [C];
              T[I] = W.map(d.bind(null, I));
            });
            var S = new e(T);
            S.messages(l.messages), p.rule.options && (p.rule.options.messages = l.messages, p.rule.options.error = l.error), S.validate(p.value, p.rule.options || l, function (I) {
              var C = [];
              h && h.length && C.push.apply(C, h), I && I.length && C.push.apply(C, I), m(C.length ? C : null);
            });
          }
        }
        var P;
        if (u.asyncValidator) P = u.asyncValidator(u, p.value, _, p.source, l);else if (u.validator) {
          try {
            P = u.validator(u, p.value, _, p.source, l);
          } catch ($) {
            console.error == null || console.error($), l.suppressValidatorError || setTimeout(function () {
              throw $;
            }, 0), _($.message);
          }
          P === !0 ? _() : P === !1 ? _(typeof u.message == "function" ? u.message(u.fullField || u.field) : u.message || (u.fullField || u.field) + " fails") : P instanceof Array ? _(P) : P instanceof Error && _(P.message);
        }
        P && P.then && P.then(function () {
          return _();
        }, function ($) {
          return _($);
        });
      }, function (p) {
        c(p);
      }, o);
    }, t.getType = function (n) {
      if (n.type === void 0 && n.pattern instanceof RegExp && (n.type = "pattern"), typeof n.validator != "function" && n.type && !Ie.hasOwnProperty(n.type)) throw new Error(G("Unknown rule type %s", n.type));
      return n.type || "string";
    }, t.getValidationMethod = function (n) {
      if (typeof n.validator == "function") return n.validator;
      var a = Object.keys(n),
        s = a.indexOf("message");
      return s !== -1 && a.splice(s, 1), a.length === 1 && a[0] === "required" ? Ie.required : Ie[this.getType(n)] || void 0;
    }, e;
  }();
qe.register = function (t, r) {
  if (typeof r != "function") throw new Error("Cannot register a validator by type, validator is not a function");
  Ie[t] = r;
};
qe.warning = rc;
qe.messages = _t;
qe.validators = Ie;
var Ic = ["", "error", "validating", "success"],
  Fc = Ye({
    label: String,
    labelWidth: {
      type: [String, Number],
      default: ""
    },
    prop: {
      type: dt([String, Array])
    },
    required: {
      type: Boolean,
      default: void 0
    },
    rules: {
      type: dt([Object, Array])
    },
    error: String,
    validateStatus: {
      type: String,
      values: Ic
    },
    for: String,
    inlineMessage: {
      type: [String, Boolean],
      default: ""
    },
    showMessage: {
      type: Boolean,
      default: !0
    },
    size: {
      type: String,
      values: Kr
    }
  }),
  jr = "ElLabelWrap";
var jc = ce({
  name: jr,
  props: {
    isAutoWidth: Boolean,
    updateAll: Boolean
  },
  setup: function setup(e, _ref8) {
    var t = _ref8.slots;
    var r = je(Et, void 0),
      n = je(gt);
    n || Dl(jr, "usage: <el-form-item><label-wrap /></el-form-item>");
    var a = Ze("form"),
      s = z(),
      i = z(0),
      o = function o() {
        var c;
        if ((c = s.value) != null && c.firstElementChild) {
          var y = window.getComputedStyle(s.value.firstElementChild).width;
          return Math.ceil(Number.parseFloat(y));
        } else return 0;
      },
      l = function l() {
        var c = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "update";
        kr(function () {
          t.default && e.isAutoWidth && (c === "update" ? i.value = o() : c === "remove" && (r == null || r.deregisterLabelWidth(i.value)));
        });
      },
      f = function f() {
        return l("update");
      };
    return Dr(function () {
      f();
    }), Lr(function () {
      l("remove");
    }), Ln(function () {
      return f();
    }), Ae(i, function (c, y) {
      e.updateAll && (r == null || r.registerLabelWidth(c, y));
    }), ma(R(function () {
      var c, y;
      return (y = (c = s.value) == null ? void 0 : c.firstElementChild) != null ? y : null;
    }), f), function () {
      var c, y;
      if (!t) return null;
      var g = e.isAutoWidth;
      if (g) {
        var v = r == null ? void 0 : r.autoLabelWidth,
          A = n == null ? void 0 : n.hasLabel,
          p = {};
        if (A && v && v !== "auto") {
          var m = Math.max(0, Number.parseInt(v, 10) - i.value),
            u = r.labelPosition === "left" ? "marginRight" : "marginLeft";
          m && (p[u] = "".concat(m, "px"));
        }
        return Ge("div", {
          ref: s,
          class: [a.be("item", "label-wrap")],
          style: p
        }, [(c = t.default) == null ? void 0 : c.call(t)]);
      } else return Ge(kn, {
        ref: s
      }, [(y = t.default) == null ? void 0 : y.call(t)]);
    };
  }
});
var Cc = ["role", "aria-labelledby"],
  Mc = ce({
    name: "ElFormItem"
  }),
  Nc = ce(_objectSpread(_objectSpread({}, Mc), {}, {
    props: Fc,
    setup: function setup(e, _ref9) {
      var t = _ref9.expose;
      var r = e,
        n = Bn(),
        a = je(Et, void 0),
        s = je(gt, void 0),
        i = Hr(void 0, {
          formItem: !1
        }),
        o = Ze("form-item"),
        l = Zn().value,
        f = z([]),
        c = z(""),
        y = Qn(c, 100),
        g = z(""),
        v = z();
      var A,
        p = !1;
      var m = R(function () {
          if ((a == null ? void 0 : a.labelPosition) === "top") return {};
          var x = Kt(r.labelWidth || (a == null ? void 0 : a.labelWidth) || "");
          return x ? {
            width: x
          } : {};
        }),
        u = R(function () {
          if ((a == null ? void 0 : a.labelPosition) === "top" || a != null && a.inline) return {};
          if (!r.label && !r.labelWidth && b) return {};
          var x = Kt(r.labelWidth || (a == null ? void 0 : a.labelWidth) || "");
          return !r.label && !n.label ? {
            marginLeft: x
          } : {};
        }),
        w = R(function () {
          return [o.b(), o.m(i.value), o.is("error", c.value === "error"), o.is("validating", c.value === "validating"), o.is("success", c.value === "success"), o.is("required", W.value || r.required), o.is("no-asterisk", a == null ? void 0 : a.hideRequiredAsterisk), (a == null ? void 0 : a.requireAsteriskPosition) === "right" ? "asterisk-right" : "asterisk-left", _defineProperty({}, o.m("feedback"), a == null ? void 0 : a.statusIcon)];
        }),
        d = R(function () {
          return Gr(r.inlineMessage) ? r.inlineMessage : (a == null ? void 0 : a.inlineMessage) || !1;
        }),
        _ = R(function () {
          return [o.e("error"), _defineProperty({}, o.em("error", "inline"), d.value)];
        }),
        P = R(function () {
          return r.prop ? ut(r.prop) ? r.prop : r.prop.join(".") : "";
        }),
        $ = R(function () {
          return !!(r.label || n.label);
        }),
        B = R(function () {
          return r.for || f.value.length === 1 ? f.value[0] : void 0;
        }),
        h = R(function () {
          return !B.value && $.value;
        }),
        b = !!s,
        T = R(function () {
          var x = a == null ? void 0 : a.model;
          if (!(!x || !r.prop)) return st(x, r.prop).value;
        }),
        S = R(function () {
          var x = r.required,
            F = [];
          r.rules && F.push.apply(F, _toConsumableArray(mt(r.rules)));
          var k = a == null ? void 0 : a.rules;
          if (k && r.prop) {
            var L = st(k, r.prop).value;
            L && F.push.apply(F, _toConsumableArray(mt(L)));
          }
          if (x !== void 0) {
            var _L = F.map(function (H, pe) {
              return [H, pe];
            }).filter(function (_ref12) {
              var _ref13 = _slicedToArray(_ref12, 1),
                H = _ref13[0];
              return Object.keys(H).includes("required");
            });
            if (_L.length > 0) {
              var _iterator4 = _createForOfIteratorHelper(_L),
                _step4;
              try {
                for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
                  var _step4$value = _slicedToArray(_step4.value, 2),
                    H = _step4$value[0],
                    pe = _step4$value[1];
                  H.required !== x && (F[pe] = _objectSpread(_objectSpread({}, H), {}, {
                    required: x
                  }));
                }
              } catch (err) {
                _iterator4.e(err);
              } finally {
                _iterator4.f();
              }
            } else F.push({
              required: x
            });
          }
          return F;
        }),
        I = R(function () {
          return S.value.length > 0;
        }),
        C = function C(x) {
          return S.value.filter(function (k) {
            return !k.trigger || !x ? !0 : Array.isArray(k.trigger) ? k.trigger.includes(x) : k.trigger === x;
          }).map(function (_ref14) {
            var k = _ref14.trigger,
              L = _objectWithoutProperties(_ref14, _excluded);
            return L;
          });
        },
        W = R(function () {
          return S.value.some(function (x) {
            return x.required;
          });
        }),
        O = R(function () {
          var x;
          return y.value === "error" && r.showMessage && ((x = a == null ? void 0 : a.showMessage) != null ? x : !0);
        }),
        U = R(function () {
          return "".concat(r.label || "").concat((a == null ? void 0 : a.labelSuffix) || "");
        }),
        N = function N(x) {
          c.value = x;
        },
        Z = function Z(x) {
          var F, k;
          var L = x.errors,
            H = x.fields;
          (!L || !H) && console.error(x), N("error"), g.value = L ? (k = (F = L == null ? void 0 : L[0]) == null ? void 0 : F.message) != null ? k : "".concat(r.prop, " is required") : "", a == null || a.emit("validate", r.prop, !1, g.value);
        },
        te = function te() {
          N("success"), a == null || a.emit("validate", r.prop, !0, "");
        },
        K = /*#__PURE__*/function () {
          var _ref15 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee4(x) {
            var F;
            return _regeneratorRuntime().wrap(function _callee4$(_context4) {
              while (1) switch (_context4.prev = _context4.next) {
                case 0:
                  F = P.value;
                  return _context4.abrupt("return", new qe(_defineProperty({}, F, x)).validate(_defineProperty({}, F, T.value), {
                    firstFields: !0
                  }).then(function () {
                    return te(), !0;
                  }).catch(function (L) {
                    return Z(L), Promise.reject(L);
                  }));
                case 2:
                case "end":
                  return _context4.stop();
              }
            }, _callee4);
          }));
          return function K(_x3) {
            return _ref15.apply(this, arguments);
          };
        }(),
        ge = /*#__PURE__*/function () {
          var _ref16 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee5(x, F) {
            var k, L;
            return _regeneratorRuntime().wrap(function _callee5$(_context5) {
              while (1) switch (_context5.prev = _context5.next) {
                case 0:
                  if (!(p || !r.prop)) {
                    _context5.next = 2;
                    break;
                  }
                  return _context5.abrupt("return", !1);
                case 2:
                  k = Rr(F);
                  if (I.value) {
                    _context5.next = 5;
                    break;
                  }
                  return _context5.abrupt("return", (F == null || F(!1), !1));
                case 5:
                  L = C(x);
                  return _context5.abrupt("return", L.length === 0 ? (F == null || F(!0), !0) : (N("validating"), K(L).then(function () {
                    return F == null || F(!0), !0;
                  }).catch(function (H) {
                    var pe = H.fields;
                    return F == null || F(!1, pe), k ? !1 : Promise.reject(pe);
                  })));
                case 7:
                case "end":
                  return _context5.stop();
              }
            }, _callee5);
          }));
          return function ge(_x4, _x5) {
            return _ref16.apply(this, arguments);
          };
        }(),
        tt = function tt() {
          N(""), g.value = "", p = !1;
        },
        Wt = /*#__PURE__*/function () {
          var _ref17 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee6() {
            var x, F;
            return _regeneratorRuntime().wrap(function _callee6$(_context6) {
              while (1) switch (_context6.prev = _context6.next) {
                case 0:
                  x = a == null ? void 0 : a.model;
                  if (!(!x || !r.prop)) {
                    _context6.next = 3;
                    break;
                  }
                  return _context6.abrupt("return");
                case 3:
                  F = st(x, r.prop);
                  p = !0;
                  F.value = Er(A);
                  _context6.next = 8;
                  return kr();
                case 8:
                  tt();
                  p = !1;
                case 10:
                case "end":
                  return _context6.stop();
              }
            }, _callee6);
          }));
          return function Wt() {
            return _ref17.apply(this, arguments);
          };
        }(),
        Nn = function Nn(x) {
          f.value.includes(x) || f.value.push(x);
        },
        qn = function qn(x) {
          f.value = f.value.filter(function (F) {
            return F !== x;
          });
        };
      Ae(function () {
        return r.error;
      }, function (x) {
        g.value = x || "", N(x ? "error" : "");
      }, {
        immediate: !0
      }), Ae(function () {
        return r.validateStatus;
      }, function (x) {
        return N(x || "");
      });
      var rt = Ve(_objectSpread(_objectSpread({}, qr(r)), {}, {
        $el: v,
        size: i,
        validateState: c,
        labelId: l,
        inputIds: f,
        isGroup: h,
        hasLabel: $,
        addInputId: Nn,
        removeInputId: qn,
        resetField: Wt,
        clearValidate: tt,
        validate: ge
      }));
      return Nr(gt, rt), Dr(function () {
        r.prop && (a == null || a.addField(rt), A = Er(T.value));
      }), Lr(function () {
        a == null || a.removeField(rt);
      }), t({
        size: i,
        validateMessage: g,
        validateState: c,
        validate: ge,
        clearValidate: tt,
        resetField: Wt
      }), function (x, F) {
        var k;
        return ne(), ze("div", {
          ref_key: "formItemRef",
          ref: v,
          class: ae(j(w)),
          role: j(h) ? "group" : void 0,
          "aria-labelledby": j(h) ? j(l) : void 0
        }, [Ge(j(jc), {
          "is-auto-width": j(m).width === "auto",
          "update-all": ((k = j(a)) == null ? void 0 : k.labelWidth) === "auto"
        }, {
          default: ke(function () {
            return [j($) ? (ne(), ft(Br(j(B) ? "label" : "div"), {
              key: 0,
              id: j(l),
              for: j(B),
              class: ae(j(o).e("label")),
              style: Ut(j(m))
            }, {
              default: ke(function () {
                return [be(x.$slots, "label", {
                  label: j(U)
                }, function () {
                  return [Wn(Vt(j(U)), 1)];
                })];
              }),
              _: 3
            }, 8, ["id", "for", "class", "style"])) : $e("v-if", !0)];
          }),
          _: 3
        }, 8, ["is-auto-width", "update-all"]), zt("div", {
          class: ae(j(o).e("content")),
          style: Ut(j(u))
        }, [be(x.$slots, "default"), Ge(Un, {
          name: "".concat(j(o).namespace.value, "-zoom-in-top")
        }, {
          default: ke(function () {
            return [j(O) ? be(x.$slots, "error", {
              key: 0,
              error: g.value
            }, function () {
              return [zt("div", {
                class: ae(j(_))
              }, Vt(g.value), 3)];
            }) : $e("v-if", !0)];
          }),
          _: 3
        }, 8, ["name"])], 6)], 10, Cc);
      };
    }
  }));
var En = St(Nc, [["__file", "/home/runner/work/element-plus/element-plus/packages/components/form/src/form-item.vue"]]);
var Tu = Jr(Zl, {
    FormItem: En
  }),
  Ou = Xn(En),
  qc = Ye({
    type: {
      type: String,
      values: ["primary", "success", "warning", "info", "danger", "default"],
      default: "default"
    },
    underline: {
      type: Boolean,
      default: !0
    },
    disabled: {
      type: Boolean,
      default: !1
    },
    href: {
      type: String,
      default: ""
    },
    icon: {
      type: ea
    }
  }),
  Rc = {
    click: function click(e) {
      return e instanceof MouseEvent;
    }
  },
  Dc = ["href"],
  Lc = ce({
    name: "ElLink"
  }),
  kc = ce(_objectSpread(_objectSpread({}, Lc), {}, {
    props: qc,
    emits: Rc,
    setup: function setup(e, _ref18) {
      var t = _ref18.emit;
      var r = e,
        n = Ze("link"),
        a = R(function () {
          return [n.b(), n.m(r.type), n.is("disabled", r.disabled), n.is("underline", r.underline && !r.disabled)];
        });
      function s(i) {
        r.disabled || t("click", i);
      }
      return function (i, o) {
        return ne(), ze("a", {
          class: ae(j(a)),
          href: i.disabled || !i.href ? void 0 : i.href,
          onClick: s
        }, [i.icon ? (ne(), ft(j(ta), {
          key: 0
        }, {
          default: ke(function () {
            return [(ne(), ft(Br(i.icon)))];
          }),
          _: 1
        })) : $e("v-if", !0), i.$slots.default ? (ne(), ze("span", {
          key: 1,
          class: ae(j(n).e("inner"))
        }, [be(i.$slots, "default")], 2)) : $e("v-if", !0), i.$slots.icon ? be(i.$slots, "icon", {
          key: 2
        }) : $e("v-if", !0)], 10, Dc);
      };
    }
  }));
var Bc = St(kc, [["__file", "/home/runner/work/element-plus/element-plus/packages/components/link/src/link.vue"]]);
var Eu = Jr(Bc);
var Sn = ia(),
  Wc = function Wc() {
    return new Promise(function (e, t) {
      Sn.request("post", Yr + "/p/auth/check").then(function (r) {
        e(r), na(r);
      }).catch(function (r) {
        t(r), aa();
      });
    });
  },
  Su = function Su() {
    return Sn.request("post", Yr + "/p/logout");
  };
var Lt = {
  exports: {}
};
var Uc = function Uc(e) {
    return (typeof crypto === "undefined" ? "undefined" : _typeof(crypto)) < "u" && typeof crypto.getRandomValues == "function" ? function () {
      var t = crypto.getRandomValues(new Uint8Array(1))[0];
      return (t >= e ? t % e : t).toString(e);
    } : function () {
      return Math.floor(Math.random() * e).toString(e);
    };
  },
  $n = function $n() {
    var e = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 7;
    var t = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : !1;
    return Array.from({
      length: e
    }, Uc(t ? 16 : 36)).join("");
  };
Lt.exports = $n;
Lt.exports.default = $n;
var Vc = Lt.exports;
var Ke = Wr(Vc);
var zc = function zc() {
    return "uid::".concat(Ke(7));
  },
  Pn = function Pn(e) {
    var t = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : ["endpointName", "fingerprint"];
    return _typeof(e) == "object" && e !== null && t.every(function (r) {
      return r in e;
    });
  },
  $u = function $u(e) {
    if (!Pn(e)) throw new TypeError("Invalid connection args");
    return JSON.stringify(e);
  },
  Gc = function Gc(e) {
    try {
      var t = JSON.parse(e);
      return Pn(t) ? t : null;
    } catch (_unused9) {
      return null;
    }
  },
  Kc = function Kc() {
    var e = [];
    return {
      add: function add() {
        for (var _len2 = arguments.length, t = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          t[_key2] = arguments[_key2];
        }
        e = [].concat(_toConsumableArray(e), t);
      },
      remove: function remove(t) {
        e = typeof t == "string" ? e.filter(function (r) {
          return r.message.transactionId !== t;
        }) : e.filter(function (r) {
          return !t.includes(r);
        });
      },
      entries: function entries() {
        return e;
      }
    };
  },
  Ee = /*#__PURE__*/function () {
    function Ee() {
      _classCallCheck(this, Ee);
    }
    _createClass(Ee, null, [{
      key: "toBackground",
      value: function toBackground(e, t) {
        return e.postMessage(t);
      }
    }, {
      key: "toExtensionContext",
      value: function toExtensionContext(e, t) {
        return e.postMessage(t);
      }
    }]);
    return Ee;
  }(),
  Hc = Object.defineProperty,
  Jc = Object.defineProperties,
  Yc = Object.getOwnPropertyDescriptors,
  Cr = Object.getOwnPropertySymbols,
  Zc = Object.prototype.hasOwnProperty,
  Qc = Object.prototype.propertyIsEnumerable,
  Mr = function Mr(e, t, r) {
    return t in e ? Hc(e, t, {
      enumerable: !0,
      configurable: !0,
      writable: !0,
      value: r
    }) : e[t] = r;
  },
  Q = function Q(e, t) {
    for (var r in t || (t = {})) Zc.call(t, r) && Mr(e, r, t[r]);
    if (Cr) {
      var _iterator5 = _createForOfIteratorHelper(Cr(t)),
        _step5;
      try {
        for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
          var r = _step5.value;
          Qc.call(t, r) && Mr(e, r, t[r]);
        }
      } catch (err) {
        _iterator5.e(err);
      } finally {
        _iterator5.f();
      }
    }
    return e;
  },
  kt = function kt(e, t) {
    return Jc(e, Yc(t));
  },
  Xc = /^((?:background$)|devtools|popup|options|content-script|window)(?:@(\d+)(?:\.(\d+))?)?$/,
  Bt = function Bt(e) {
    var _ref19 = e.match(Xc) || [],
      _ref20 = _slicedToArray(_ref19, 4),
      t = _ref20[1],
      r = _ref20[2],
      n = _ref20[3];
    return {
      context: t,
      tabId: +r,
      frameId: n ? +n : void 0
    };
  },
  Ue = function Ue(_ref21) {
    var e = _ref21.context,
      t = _ref21.tabId,
      r = _ref21.frameId;
    return ["background", "popup", "options"].includes(e) ? e : "".concat(e, "@").concat(t).concat(r ? ".".concat(r) : "");
  };
var eu = [{
    property: "name",
    enumerable: !1
  }, {
    property: "message",
    enumerable: !1
  }, {
    property: "stack",
    enumerable: !1
  }, {
    property: "code",
    enumerable: !0
  }],
  Tt = Symbol(".toJSON was called"),
  tu = function tu(e) {
    e[Tt] = !0;
    var t = e.toJSON();
    return delete e[Tt], t;
  },
  In = function In(_ref22) {
    var e = _ref22.from,
      t = _ref22.seen,
      r = _ref22.to_,
      n = _ref22.forceEnumerable,
      a = _ref22.maxDepth,
      s = _ref22.depth;
    var i = r || (Array.isArray(e) ? [] : {});
    if (t.push(e), s >= a) return i;
    if (typeof e.toJSON == "function" && e[Tt] !== !0) return tu(e);
    for (var _i2 = 0, _Object$entries = Object.entries(e); _i2 < _Object$entries.length; _i2++) {
      var _Object$entries$_i = _slicedToArray(_Object$entries[_i2], 2),
        o = _Object$entries$_i[0],
        l = _Object$entries$_i[1];
      if (typeof Buffer == "function" && Buffer.isBuffer(l)) {
        i[o] = "[object Buffer]";
        continue;
      }
      if (l !== null && _typeof(l) == "object" && typeof l.pipe == "function") {
        i[o] = "[object Stream]";
        continue;
      }
      if (typeof l != "function") {
        if (!l || _typeof(l) != "object") {
          i[o] = l;
          continue;
        }
        if (!t.includes(e[o])) {
          s++, i[o] = In({
            from: e[o],
            seen: _toConsumableArray(t),
            forceEnumerable: n,
            maxDepth: a,
            depth: s
          });
          continue;
        }
        i[o] = "[Circular]";
      }
    }
    for (var _i3 = 0, _eu = eu; _i3 < _eu.length; _i3++) {
      var _eu$_i = _eu[_i3],
        _o2 = _eu$_i.property,
        _l2 = _eu$_i.enumerable;
      typeof e[_o2] == "string" && Object.defineProperty(i, _o2, {
        value: e[_o2],
        enumerable: n ? !0 : _l2,
        configurable: !0,
        writable: !0
      });
    }
    return i;
  };
function ru(e) {
  var t = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var _t$maxDepth = t.maxDepth,
    r = _t$maxDepth === void 0 ? Number.POSITIVE_INFINITY : _t$maxDepth;
  return _typeof(e) == "object" && e !== null ? In({
    from: e,
    seen: [],
    forceEnumerable: !0,
    maxDepth: r,
    depth: 0
  }) : typeof e == "function" ? "[Function: ".concat(e.name || "anonymous", "]") : e;
}
var Fn = function Fn() {
  return {
    events: {},
    emit: function emit(e) {
      for (var _len3 = arguments.length, t = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
        t[_key3 - 1] = arguments[_key3];
      }
      (this.events[e] || []).forEach(function (r) {
        return r.apply(void 0, t);
      });
    },
    on: function on(e, t) {
      var _this2 = this;
      return (this.events[e] = this.events[e] || []).push(t), function () {
        return _this2.events[e] = (_this2.events[e] || []).filter(function (r) {
          return r !== t;
        });
      };
    }
  };
};
var nu = function nu(e, t, r) {
    var n = Ke(),
      a = new Map(),
      s = new Map(),
      i = function i(o) {
        if (o.destination.context === e && !o.destination.frameId && !o.destination.tabId) {
          r == null || r(o);
          var l = o.transactionId,
            f = o.messageID,
            c = o.messageType,
            y = function y() {
              var v = a.get(l);
              if (v) {
                var A = o.err,
                  p = o.data;
                if (A) {
                  var m = A,
                    u = self[m.name],
                    w = new (typeof u == "function" ? u : Error)(m.message);
                  for (var d in m) w[d] = m[d];
                  v.reject(w);
                } else v.resolve(p);
                a.delete(l);
              }
            },
            g = /*#__PURE__*/function () {
              var _ref23 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee7() {
                var v, A, p, m;
                return _regeneratorRuntime().wrap(function _callee7$(_context7) {
                  while (1) switch (_context7.prev = _context7.next) {
                    case 0:
                      p = !1;
                      _context7.prev = 1;
                      m = s.get(f);
                      if (!(typeof m == "function")) {
                        _context7.next = 9;
                        break;
                      }
                      _context7.next = 6;
                      return m({
                        sender: o.origin,
                        id: f,
                        data: o.data,
                        timestamp: o.timestamp
                      });
                    case 6:
                      v = _context7.sent;
                      _context7.next = 10;
                      break;
                    case 9:
                      throw p = !0, new Error("[webext-bridge] No handler registered in '".concat(e, "' to accept messages with id '").concat(f, "'"));
                    case 10:
                      _context7.next = 15;
                      break;
                    case 12:
                      _context7.prev = 12;
                      _context7.t0 = _context7["catch"](1);
                      A = _context7.t0;
                    case 15:
                      _context7.prev = 15;
                      if (!(A && (o.err = ru(A)), i(kt(Q({}, o), {
                        messageType: "reply",
                        data: v,
                        origin: {
                          context: e,
                          tabId: null
                        },
                        destination: o.origin,
                        hops: []
                      })), A && !p)) {
                        _context7.next = 18;
                        break;
                      }
                      throw v;
                    case 18:
                      return _context7.finish(15);
                    case 19:
                    case "end":
                      return _context7.stop();
                  }
                }, _callee7, null, [[1, 12, 15, 19]]);
              }));
              return function g() {
                return _ref23.apply(this, arguments);
              };
            }();
          switch (c) {
            case "reply":
              return y();
            case "message":
              return g();
          }
        }
        return o.hops.push("".concat(e, "::").concat(n)), t(o);
      };
    return {
      handleMessage: i,
      endTransaction: function endTransaction(o) {
        var l = a.get(o);
        l == null || l.reject("Transaction was ended before it could complete"), a.delete(o);
      },
      sendMessage: function sendMessage(o, l) {
        var f = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "background";
        var c = typeof f == "string" ? Bt(f) : f,
          y = "Bridge#sendMessage ->";
        if (!c.context) throw new TypeError("".concat(y, " Destination must be any one of known destinations"));
        return new Promise(function (g, v) {
          var A = {
            messageID: o,
            data: l,
            destination: c,
            messageType: "message",
            transactionId: Ke(),
            origin: {
              context: e,
              tabId: null
            },
            hops: [],
            timestamp: Date.now()
          };
          a.set(A.transactionId, {
            resolve: g,
            reject: v
          });
          try {
            i(A);
          } catch (p) {
            a.delete(A.transactionId), v(p);
          }
        });
      },
      onMessage: function onMessage(o, l) {
        return s.set(o, l), function () {
          return s.delete(o);
        };
      }
    };
  },
  he = /*#__PURE__*/function () {
    function he(e, t) {
      var _this3 = this;
      _classCallCheck(this, he);
      this.endpointRuntime = e, this.streamInfo = t, this.emitter = Fn(), this.isClosed = !1, this.handleStreamClose = function () {
        _this3.isClosed || (_this3.isClosed = !0, _this3.emitter.emit("closed", !0), _this3.emitter.events = {});
      }, he.initDone || (e.onMessage("__crx_bridge_stream_transfer__", function (r) {
        var _r$data = r.data,
          n = _r$data.streamId,
          a = _r$data.streamTransfer,
          s = _r$data.action,
          i = he.openStreams.get(n);
        i && !i.isClosed && (s === "transfer" && i.emitter.emit("message", a), s === "close" && (he.openStreams.delete(n), i.handleStreamClose()));
      }), he.initDone = !0), he.openStreams.set(this.streamInfo.streamId, this);
    }
    _createClass(he, [{
      key: "info",
      get: function get() {
        return this.streamInfo;
      }
    }, {
      key: "send",
      value: function send(e) {
        if (this.isClosed) throw new Error("Attempting to send a message over closed stream. Use stream.onClose(<callback>) to keep an eye on stream status");
        this.endpointRuntime.sendMessage("__crx_bridge_stream_transfer__", {
          streamId: this.streamInfo.streamId,
          streamTransfer: e,
          action: "transfer"
        }, this.streamInfo.endpoint);
      }
    }, {
      key: "close",
      value: function close(e) {
        e && this.send(e), this.handleStreamClose(), this.endpointRuntime.sendMessage("__crx_bridge_stream_transfer__", {
          streamId: this.streamInfo.streamId,
          streamTransfer: null,
          action: "close"
        }, this.streamInfo.endpoint);
      }
    }, {
      key: "onMessage",
      value: function onMessage(e) {
        return this.getDisposable("message", e);
      }
    }, {
      key: "onClose",
      value: function onClose(e) {
        return this.getDisposable("closed", e);
      }
    }, {
      key: "getDisposable",
      value: function getDisposable(e, t) {
        var r = this.emitter.on(e, t);
        return Object.assign(r, {
          dispose: r,
          close: r
        });
      }
    }]);
    return he;
  }(),
  He = he;
He.initDone = !1;
He.openStreams = new Map();
var au = function au(e) {
    var t = new Map(),
      r = new Map(),
      n = Fn();
    e.onMessage("__crx_bridge_stream_open__", function (i) {
      return new Promise(function (o) {
        var l = i.sender,
          f = i.data,
          c = f.channel;
        var y = !1,
          g = function g() {};
        var v = function v() {
          var A = r.get(c);
          typeof A == "function" ? (A(new He(e, kt(Q({}, f), {
            endpoint: l
          }))), y && g(), o(!0)) : y || (y = !0, g = n.on("did-change-stream-callbacks", v));
        };
        v();
      });
    });
    function a(_x6, _x7) {
      return _a2.apply(this, arguments);
    }
    function _a2() {
      _a2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee8(i, o) {
        var l, f, c;
        return _regeneratorRuntime().wrap(function _callee8$(_context8) {
          while (1) switch (_context8.prev = _context8.next) {
            case 0:
              if (!t.has(i)) {
                _context8.next = 2;
                break;
              }
              throw new Error("webext-bridge: A Stream is already open at this channel");
            case 2:
              l = typeof o == "string" ? Bt(o) : o, f = {
                streamId: Ke(),
                channel: i,
                endpoint: l
              }, c = new He(e, f);
              c.onClose(function () {
                return t.delete(i);
              });
              _context8.next = 6;
              return e.sendMessage("__crx_bridge_stream_open__", f, l);
            case 6:
              t.set(i, c);
              return _context8.abrupt("return", c);
            case 8:
            case "end":
              return _context8.stop();
          }
        }, _callee8);
      }));
      return _a2.apply(this, arguments);
    }
    function s(i, o) {
      if (r.has(i)) throw new Error("webext-bridge: This channel has already been claimed. Stream allows only one-on-one communication");
      r.set(i, o), n.emit("did-change-stream-callbacks");
    }
    return {
      openStream: a,
      onOpenStreamChannel: s
    };
  },
  jn = {
    exports: {}
  };
(function (e, t) {
  (function (r, n) {
    n(e);
  })((typeof globalThis === "undefined" ? "undefined" : _typeof(globalThis)) < "u" ? globalThis : (typeof self === "undefined" ? "undefined" : _typeof(self)) < "u" ? self : Vn, function (r) {
    if ((typeof globalThis === "undefined" ? "undefined" : _typeof(globalThis)) != "object" || (typeof chrome === "undefined" ? "undefined" : _typeof(chrome)) != "object" || !chrome || !chrome.runtime || !chrome.runtime.id) throw new Error("This script should only be loaded in a browser extension.");
    if (_typeof(globalThis.browser) > "u" || Object.getPrototypeOf(globalThis.browser) !== Object.prototype) {
      var n = "The message port closed before a response was received.",
        a = "Returning a Promise is the preferred way to send a reply from an onMessage/onMessageExternal listener, as the sendResponse will be removed from the specs (See https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/API/runtime/onMessage)",
        s = function s(i) {
          var o = {
            alarms: {
              clear: {
                minArgs: 0,
                maxArgs: 1
              },
              clearAll: {
                minArgs: 0,
                maxArgs: 0
              },
              get: {
                minArgs: 0,
                maxArgs: 1
              },
              getAll: {
                minArgs: 0,
                maxArgs: 0
              }
            },
            bookmarks: {
              create: {
                minArgs: 1,
                maxArgs: 1
              },
              get: {
                minArgs: 1,
                maxArgs: 1
              },
              getChildren: {
                minArgs: 1,
                maxArgs: 1
              },
              getRecent: {
                minArgs: 1,
                maxArgs: 1
              },
              getSubTree: {
                minArgs: 1,
                maxArgs: 1
              },
              getTree: {
                minArgs: 0,
                maxArgs: 0
              },
              move: {
                minArgs: 2,
                maxArgs: 2
              },
              remove: {
                minArgs: 1,
                maxArgs: 1
              },
              removeTree: {
                minArgs: 1,
                maxArgs: 1
              },
              search: {
                minArgs: 1,
                maxArgs: 1
              },
              update: {
                minArgs: 2,
                maxArgs: 2
              }
            },
            browserAction: {
              disable: {
                minArgs: 0,
                maxArgs: 1,
                fallbackToNoCallback: !0
              },
              enable: {
                minArgs: 0,
                maxArgs: 1,
                fallbackToNoCallback: !0
              },
              getBadgeBackgroundColor: {
                minArgs: 1,
                maxArgs: 1
              },
              getBadgeText: {
                minArgs: 1,
                maxArgs: 1
              },
              getPopup: {
                minArgs: 1,
                maxArgs: 1
              },
              getTitle: {
                minArgs: 1,
                maxArgs: 1
              },
              openPopup: {
                minArgs: 0,
                maxArgs: 0
              },
              setBadgeBackgroundColor: {
                minArgs: 1,
                maxArgs: 1,
                fallbackToNoCallback: !0
              },
              setBadgeText: {
                minArgs: 1,
                maxArgs: 1,
                fallbackToNoCallback: !0
              },
              setIcon: {
                minArgs: 1,
                maxArgs: 1
              },
              setPopup: {
                minArgs: 1,
                maxArgs: 1,
                fallbackToNoCallback: !0
              },
              setTitle: {
                minArgs: 1,
                maxArgs: 1,
                fallbackToNoCallback: !0
              }
            },
            browsingData: {
              remove: {
                minArgs: 2,
                maxArgs: 2
              },
              removeCache: {
                minArgs: 1,
                maxArgs: 1
              },
              removeCookies: {
                minArgs: 1,
                maxArgs: 1
              },
              removeDownloads: {
                minArgs: 1,
                maxArgs: 1
              },
              removeFormData: {
                minArgs: 1,
                maxArgs: 1
              },
              removeHistory: {
                minArgs: 1,
                maxArgs: 1
              },
              removeLocalStorage: {
                minArgs: 1,
                maxArgs: 1
              },
              removePasswords: {
                minArgs: 1,
                maxArgs: 1
              },
              removePluginData: {
                minArgs: 1,
                maxArgs: 1
              },
              settings: {
                minArgs: 0,
                maxArgs: 0
              }
            },
            commands: {
              getAll: {
                minArgs: 0,
                maxArgs: 0
              }
            },
            contextMenus: {
              remove: {
                minArgs: 1,
                maxArgs: 1
              },
              removeAll: {
                minArgs: 0,
                maxArgs: 0
              },
              update: {
                minArgs: 2,
                maxArgs: 2
              }
            },
            cookies: {
              get: {
                minArgs: 1,
                maxArgs: 1
              },
              getAll: {
                minArgs: 1,
                maxArgs: 1
              },
              getAllCookieStores: {
                minArgs: 0,
                maxArgs: 0
              },
              remove: {
                minArgs: 1,
                maxArgs: 1
              },
              set: {
                minArgs: 1,
                maxArgs: 1
              }
            },
            devtools: {
              inspectedWindow: {
                eval: {
                  minArgs: 1,
                  maxArgs: 2,
                  singleCallbackArg: !1
                }
              },
              panels: {
                create: {
                  minArgs: 3,
                  maxArgs: 3,
                  singleCallbackArg: !0
                },
                elements: {
                  createSidebarPane: {
                    minArgs: 1,
                    maxArgs: 1
                  }
                }
              }
            },
            downloads: {
              cancel: {
                minArgs: 1,
                maxArgs: 1
              },
              download: {
                minArgs: 1,
                maxArgs: 1
              },
              erase: {
                minArgs: 1,
                maxArgs: 1
              },
              getFileIcon: {
                minArgs: 1,
                maxArgs: 2
              },
              open: {
                minArgs: 1,
                maxArgs: 1,
                fallbackToNoCallback: !0
              },
              pause: {
                minArgs: 1,
                maxArgs: 1
              },
              removeFile: {
                minArgs: 1,
                maxArgs: 1
              },
              resume: {
                minArgs: 1,
                maxArgs: 1
              },
              search: {
                minArgs: 1,
                maxArgs: 1
              },
              show: {
                minArgs: 1,
                maxArgs: 1,
                fallbackToNoCallback: !0
              }
            },
            extension: {
              isAllowedFileSchemeAccess: {
                minArgs: 0,
                maxArgs: 0
              },
              isAllowedIncognitoAccess: {
                minArgs: 0,
                maxArgs: 0
              }
            },
            history: {
              addUrl: {
                minArgs: 1,
                maxArgs: 1
              },
              deleteAll: {
                minArgs: 0,
                maxArgs: 0
              },
              deleteRange: {
                minArgs: 1,
                maxArgs: 1
              },
              deleteUrl: {
                minArgs: 1,
                maxArgs: 1
              },
              getVisits: {
                minArgs: 1,
                maxArgs: 1
              },
              search: {
                minArgs: 1,
                maxArgs: 1
              }
            },
            i18n: {
              detectLanguage: {
                minArgs: 1,
                maxArgs: 1
              },
              getAcceptLanguages: {
                minArgs: 0,
                maxArgs: 0
              }
            },
            identity: {
              launchWebAuthFlow: {
                minArgs: 1,
                maxArgs: 1
              }
            },
            idle: {
              queryState: {
                minArgs: 1,
                maxArgs: 1
              }
            },
            management: {
              get: {
                minArgs: 1,
                maxArgs: 1
              },
              getAll: {
                minArgs: 0,
                maxArgs: 0
              },
              getSelf: {
                minArgs: 0,
                maxArgs: 0
              },
              setEnabled: {
                minArgs: 2,
                maxArgs: 2
              },
              uninstallSelf: {
                minArgs: 0,
                maxArgs: 1
              }
            },
            notifications: {
              clear: {
                minArgs: 1,
                maxArgs: 1
              },
              create: {
                minArgs: 1,
                maxArgs: 2
              },
              getAll: {
                minArgs: 0,
                maxArgs: 0
              },
              getPermissionLevel: {
                minArgs: 0,
                maxArgs: 0
              },
              update: {
                minArgs: 2,
                maxArgs: 2
              }
            },
            pageAction: {
              getPopup: {
                minArgs: 1,
                maxArgs: 1
              },
              getTitle: {
                minArgs: 1,
                maxArgs: 1
              },
              hide: {
                minArgs: 1,
                maxArgs: 1,
                fallbackToNoCallback: !0
              },
              setIcon: {
                minArgs: 1,
                maxArgs: 1
              },
              setPopup: {
                minArgs: 1,
                maxArgs: 1,
                fallbackToNoCallback: !0
              },
              setTitle: {
                minArgs: 1,
                maxArgs: 1,
                fallbackToNoCallback: !0
              },
              show: {
                minArgs: 1,
                maxArgs: 1,
                fallbackToNoCallback: !0
              }
            },
            permissions: {
              contains: {
                minArgs: 1,
                maxArgs: 1
              },
              getAll: {
                minArgs: 0,
                maxArgs: 0
              },
              remove: {
                minArgs: 1,
                maxArgs: 1
              },
              request: {
                minArgs: 1,
                maxArgs: 1
              }
            },
            runtime: {
              getBackgroundPage: {
                minArgs: 0,
                maxArgs: 0
              },
              getPlatformInfo: {
                minArgs: 0,
                maxArgs: 0
              },
              openOptionsPage: {
                minArgs: 0,
                maxArgs: 0
              },
              requestUpdateCheck: {
                minArgs: 0,
                maxArgs: 0
              },
              sendMessage: {
                minArgs: 1,
                maxArgs: 3
              },
              sendNativeMessage: {
                minArgs: 2,
                maxArgs: 2
              },
              setUninstallURL: {
                minArgs: 1,
                maxArgs: 1
              }
            },
            sessions: {
              getDevices: {
                minArgs: 0,
                maxArgs: 1
              },
              getRecentlyClosed: {
                minArgs: 0,
                maxArgs: 1
              },
              restore: {
                minArgs: 0,
                maxArgs: 1
              }
            },
            storage: {
              local: {
                clear: {
                  minArgs: 0,
                  maxArgs: 0
                },
                get: {
                  minArgs: 0,
                  maxArgs: 1
                },
                getBytesInUse: {
                  minArgs: 0,
                  maxArgs: 1
                },
                remove: {
                  minArgs: 1,
                  maxArgs: 1
                },
                set: {
                  minArgs: 1,
                  maxArgs: 1
                }
              },
              managed: {
                get: {
                  minArgs: 0,
                  maxArgs: 1
                },
                getBytesInUse: {
                  minArgs: 0,
                  maxArgs: 1
                }
              },
              sync: {
                clear: {
                  minArgs: 0,
                  maxArgs: 0
                },
                get: {
                  minArgs: 0,
                  maxArgs: 1
                },
                getBytesInUse: {
                  minArgs: 0,
                  maxArgs: 1
                },
                remove: {
                  minArgs: 1,
                  maxArgs: 1
                },
                set: {
                  minArgs: 1,
                  maxArgs: 1
                }
              }
            },
            tabs: {
              captureVisibleTab: {
                minArgs: 0,
                maxArgs: 2
              },
              create: {
                minArgs: 1,
                maxArgs: 1
              },
              detectLanguage: {
                minArgs: 0,
                maxArgs: 1
              },
              discard: {
                minArgs: 0,
                maxArgs: 1
              },
              duplicate: {
                minArgs: 1,
                maxArgs: 1
              },
              executeScript: {
                minArgs: 1,
                maxArgs: 2
              },
              get: {
                minArgs: 1,
                maxArgs: 1
              },
              getCurrent: {
                minArgs: 0,
                maxArgs: 0
              },
              getZoom: {
                minArgs: 0,
                maxArgs: 1
              },
              getZoomSettings: {
                minArgs: 0,
                maxArgs: 1
              },
              goBack: {
                minArgs: 0,
                maxArgs: 1
              },
              goForward: {
                minArgs: 0,
                maxArgs: 1
              },
              highlight: {
                minArgs: 1,
                maxArgs: 1
              },
              insertCSS: {
                minArgs: 1,
                maxArgs: 2
              },
              move: {
                minArgs: 2,
                maxArgs: 2
              },
              query: {
                minArgs: 1,
                maxArgs: 1
              },
              reload: {
                minArgs: 0,
                maxArgs: 2
              },
              remove: {
                minArgs: 1,
                maxArgs: 1
              },
              removeCSS: {
                minArgs: 1,
                maxArgs: 2
              },
              sendMessage: {
                minArgs: 2,
                maxArgs: 3
              },
              setZoom: {
                minArgs: 1,
                maxArgs: 2
              },
              setZoomSettings: {
                minArgs: 1,
                maxArgs: 2
              },
              update: {
                minArgs: 1,
                maxArgs: 2
              }
            },
            topSites: {
              get: {
                minArgs: 0,
                maxArgs: 0
              }
            },
            webNavigation: {
              getAllFrames: {
                minArgs: 1,
                maxArgs: 1
              },
              getFrame: {
                minArgs: 1,
                maxArgs: 1
              }
            },
            webRequest: {
              handlerBehaviorChanged: {
                minArgs: 0,
                maxArgs: 0
              }
            },
            windows: {
              create: {
                minArgs: 0,
                maxArgs: 1
              },
              get: {
                minArgs: 1,
                maxArgs: 2
              },
              getAll: {
                minArgs: 0,
                maxArgs: 1
              },
              getCurrent: {
                minArgs: 0,
                maxArgs: 1
              },
              getLastFocused: {
                minArgs: 0,
                maxArgs: 1
              },
              remove: {
                minArgs: 1,
                maxArgs: 1
              },
              update: {
                minArgs: 2,
                maxArgs: 2
              }
            }
          };
          if (Object.keys(o).length === 0) throw new Error("api-metadata.json has not been included in browser-polyfill");
          var l = /*#__PURE__*/function (_WeakMap) {
            _inherits(l, _WeakMap);
            var _super2 = _createSuper(l);
            function l(b) {
              var _this4;
              var T = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : void 0;
              _classCallCheck(this, l);
              _this4 = _super2.call(this, T), _this4.createItem = b;
              return _this4;
            }
            _createClass(l, [{
              key: "get",
              value: function get(b) {
                return this.has(b) || this.set(b, this.createItem(b)), _get(_getPrototypeOf(l.prototype), "get", this).call(this, b);
              }
            }]);
            return l;
          }( /*#__PURE__*/_wrapNativeSuper(WeakMap));
          var f = function f(h) {
              return h && _typeof(h) == "object" && typeof h.then == "function";
            },
            c = function c(h, b) {
              return function () {
                for (var _len4 = arguments.length, T = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
                  T[_key4] = arguments[_key4];
                }
                i.runtime.lastError ? h.reject(new Error(i.runtime.lastError.message)) : b.singleCallbackArg || T.length <= 1 && b.singleCallbackArg !== !1 ? h.resolve(T[0]) : h.resolve(T);
              };
            },
            y = function y(h) {
              return h == 1 ? "argument" : "arguments";
            },
            g = function g(h, b) {
              return function (S) {
                for (var _len5 = arguments.length, I = new Array(_len5 > 1 ? _len5 - 1 : 0), _key5 = 1; _key5 < _len5; _key5++) {
                  I[_key5 - 1] = arguments[_key5];
                }
                if (I.length < b.minArgs) throw new Error("Expected at least ".concat(b.minArgs, " ").concat(y(b.minArgs), " for ").concat(h, "(), got ").concat(I.length));
                if (I.length > b.maxArgs) throw new Error("Expected at most ".concat(b.maxArgs, " ").concat(y(b.maxArgs), " for ").concat(h, "(), got ").concat(I.length));
                return new Promise(function (C, W) {
                  if (b.fallbackToNoCallback) try {
                    S[h].apply(S, I.concat([c({
                      resolve: C,
                      reject: W
                    }, b)]));
                  } catch (O) {
                    console.warn("".concat(h, " API method doesn't seem to support the callback parameter, falling back to call it without a callback: "), O), S[h].apply(S, I), b.fallbackToNoCallback = !1, b.noCallback = !0, C();
                  } else b.noCallback ? (S[h].apply(S, I), C()) : S[h].apply(S, I.concat([c({
                    resolve: C,
                    reject: W
                  }, b)]));
                });
              };
            },
            v = function v(h, b, T) {
              return new Proxy(b, {
                apply: function apply(S, I, C) {
                  return T.call.apply(T, [I, h].concat(_toConsumableArray(C)));
                }
              });
            };
          var A = Function.call.bind(Object.prototype.hasOwnProperty);
          var p = function p(h) {
              var b = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
              var T = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
              var S = Object.create(null),
                I = {
                  has: function has(W, O) {
                    return O in h || O in S;
                  },
                  get: function get(W, O, U) {
                    if (O in S) return S[O];
                    if (!(O in h)) return;
                    var N = h[O];
                    if (typeof N == "function") {
                      if (typeof b[O] == "function") N = v(h, h[O], b[O]);else if (A(T, O)) {
                        var Z = g(O, T[O]);
                        N = v(h, h[O], Z);
                      } else N = N.bind(h);
                    } else if (_typeof(N) == "object" && N !== null && (A(b, O) || A(T, O))) N = p(N, b[O], T[O]);else if (A(T, "*")) N = p(N, b[O], T["*"]);else return Object.defineProperty(S, O, {
                      configurable: !0,
                      enumerable: !0,
                      get: function get() {
                        return h[O];
                      },
                      set: function set(Z) {
                        h[O] = Z;
                      }
                    }), N;
                    return S[O] = N, N;
                  },
                  set: function set(W, O, U, N) {
                    return O in S ? S[O] = U : h[O] = U, !0;
                  },
                  defineProperty: function defineProperty(W, O, U) {
                    return Reflect.defineProperty(S, O, U);
                  },
                  deleteProperty: function deleteProperty(W, O) {
                    return Reflect.deleteProperty(S, O);
                  }
                },
                C = Object.create(h);
              return new Proxy(C, I);
            },
            m = function m(h) {
              return {
                addListener: function addListener(b, T) {
                  for (var _len6 = arguments.length, S = new Array(_len6 > 2 ? _len6 - 2 : 0), _key6 = 2; _key6 < _len6; _key6++) {
                    S[_key6 - 2] = arguments[_key6];
                  }
                  b.addListener.apply(b, [h.get(T)].concat(S));
                },
                hasListener: function hasListener(b, T) {
                  return b.hasListener(h.get(T));
                },
                removeListener: function removeListener(b, T) {
                  b.removeListener(h.get(T));
                }
              };
            },
            u = new l(function (h) {
              return typeof h != "function" ? h : function (T) {
                var S = p(T, {}, {
                  getContent: {
                    minArgs: 0,
                    maxArgs: 0
                  }
                });
                h(S);
              };
            });
          var w = !1;
          var d = new l(function (h) {
              return typeof h != "function" ? h : function (T, S, I) {
                var C = !1,
                  W,
                  O = new Promise(function (te) {
                    W = function W(K) {
                      w || (console.warn(a, new Error().stack), w = !0), C = !0, te(K);
                    };
                  }),
                  U;
                try {
                  U = h(T, S, W);
                } catch (te) {
                  U = Promise.reject(te);
                }
                var N = U !== !0 && f(U);
                if (U !== !0 && !N && !C) return !1;
                var Z = function Z(te) {
                  te.then(function (K) {
                    I(K);
                  }, function (K) {
                    var ge;
                    K && (K instanceof Error || typeof K.message == "string") ? ge = K.message : ge = "An unexpected error occurred", I({
                      __mozWebExtensionPolyfillReject__: !0,
                      message: ge
                    });
                  }).catch(function (K) {
                    console.error("Failed to send onMessage rejected reply", K);
                  });
                };
                return Z(N ? U : O), !0;
              };
            }),
            _ = function _(_ref24, T) {
              var h = _ref24.reject,
                b = _ref24.resolve;
              i.runtime.lastError ? i.runtime.lastError.message === n ? b() : h(new Error(i.runtime.lastError.message)) : T && T.__mozWebExtensionPolyfillReject__ ? h(new Error(T.message)) : b(T);
            },
            P = function P(h, b, T) {
              for (var _len7 = arguments.length, S = new Array(_len7 > 3 ? _len7 - 3 : 0), _key7 = 3; _key7 < _len7; _key7++) {
                S[_key7 - 3] = arguments[_key7];
              }
              if (S.length < b.minArgs) throw new Error("Expected at least ".concat(b.minArgs, " ").concat(y(b.minArgs), " for ").concat(h, "(), got ").concat(S.length));
              if (S.length > b.maxArgs) throw new Error("Expected at most ".concat(b.maxArgs, " ").concat(y(b.maxArgs), " for ").concat(h, "(), got ").concat(S.length));
              return new Promise(function (I, C) {
                var W = _.bind(null, {
                  resolve: I,
                  reject: C
                });
                S.push(W), T.sendMessage.apply(T, S);
              });
            },
            $ = {
              devtools: {
                network: {
                  onRequestFinished: m(u)
                }
              },
              runtime: {
                onMessage: m(d),
                onMessageExternal: m(d),
                sendMessage: P.bind(null, "sendMessage", {
                  minArgs: 1,
                  maxArgs: 3
                })
              },
              tabs: {
                sendMessage: P.bind(null, "sendMessage", {
                  minArgs: 2,
                  maxArgs: 3
                })
              }
            },
            B = {
              clear: {
                minArgs: 1,
                maxArgs: 1
              },
              get: {
                minArgs: 1,
                maxArgs: 1
              },
              set: {
                minArgs: 1,
                maxArgs: 1
              }
            };
          return o.privacy = {
            network: {
              "*": B
            },
            services: {
              "*": B
            },
            websites: {
              "*": B
            }
          }, p(i, $, o);
        };
      r.exports = s(chrome);
    } else r.exports = globalThis.browser;
  });
})(jn);
var iu = jn.exports;
var su = Wr(iu);
var Fe = Kc(),
  V = new Map(),
  ve = new Map(),
  Je = new Map(),
  Cn = function Cn(e, t) {
    return ve.set(e, (ve.get(e) || new Set()).add(t)), function () {
      var r = ve.get(e);
      r != null && r.delete(t) && (r == null ? void 0 : r.size) === 0 && ve.delete(e);
    };
  },
  Mn = function Mn(e, t) {
    Je.set(e, (Je.get(e) || new Set()).add(t));
  },
  se = function se(e) {
    return {
      withFingerprint: function withFingerprint(t) {
        var r = function r(a) {
            return {
              and: function and() {
                return a;
              }
            };
          },
          n = {
            aboutIncomingMessage: function aboutIncomingMessage(a) {
              var s = V.get(e);
              return Ee.toExtensionContext(s.port, {
                status: "incoming",
                message: a
              }), r(n);
            },
            aboutSuccessfulDelivery: function aboutSuccessfulDelivery(a) {
              var s = V.get(e);
              return Ee.toExtensionContext(s.port, {
                status: "delivered",
                receipt: a
              }), r(n);
            },
            aboutMessageUndeliverability: function aboutMessageUndeliverability(a, s) {
              var i = V.get(e);
              return (i == null ? void 0 : i.fingerprint) === t && Ee.toExtensionContext(i.port, {
                status: "undeliverable",
                resolvedDestination: a,
                message: s
              }), r(n);
            },
            whenDeliverableTo: function whenDeliverableTo(a) {
              var s = function s() {
                var i = V.get(e);
                if ((i == null ? void 0 : i.fingerprint) === t && V.has(a)) return Ee.toExtensionContext(i.port, {
                  status: "deliverable",
                  deliverableTo: a
                }), !0;
              };
              if (!s()) {
                var i = Cn(a, s);
                Mn(t, i);
              }
              return r(n);
            },
            aboutSessionEnded: function aboutSessionEnded(a) {
              var s = V.get(e);
              return (s == null ? void 0 : s.fingerprint) === t && Ee.toExtensionContext(s.port, {
                status: "terminated",
                fingerprint: a
              }), r(n);
            }
          };
        return n;
      }
    };
  },
  ou = zc(),
  Ot = nu("background", function (e) {
    var t;
    if (e.origin.context === "background" && ["content-script", "devtools "].includes(e.destination.context) && !e.destination.tabId) throw new TypeError("When sending messages from background page, use @tabId syntax to target specific tab");
    var r = Ue(Q(Q({}, e.origin), e.origin.context === "window" && {
        context: "content-script"
      })),
      n = Ue(kt(Q(Q({}, e.destination), e.destination.context === "window" && {
        context: "content-script"
      }), {
        tabId: e.destination.tabId || e.origin.tabId
      }));
    e.destination.tabId = null, e.destination.frameId = null;
    var a = function a() {
        return V.get(n);
      },
      s = function s() {
        return V.get(r);
      },
      i = function i() {
        var o;
        se(n).withFingerprint(a().fingerprint).aboutIncomingMessage(e);
        var l = {
          message: e,
          to: a().fingerprint,
          from: {
            endpointId: r,
            fingerprint: (o = s()) == null ? void 0 : o.fingerprint
          }
        };
        e.messageType === "message" && Fe.add(l), e.messageType === "reply" && Fe.remove(e.messageID), s() && se(r).withFingerprint(s().fingerprint).aboutSuccessfulDelivery(l);
      };
    (t = a()) != null && t.port ? i() : e.messageType === "message" && (e.origin.context === "background" ? Cn(n, i) : s() && se(r).withFingerprint(s().fingerprint).aboutMessageUndeliverability(n, e).and().whenDeliverableTo(n));
  }, function (e) {
    var t = Ue(Q(Q({}, e.origin), e.origin.context === "window" && {
        context: "content-script"
      })),
      r = V.get(t),
      n = {
        message: e,
        to: ou,
        from: {
          endpointId: t,
          fingerprint: r.fingerprint
        }
      };
    se(t).withFingerprint(r.fingerprint).aboutSuccessfulDelivery(n);
  });
su.runtime.onConnect.addListener(function (e) {
  var t;
  var r = Gc(e.name);
  if (!r) return;
  r.endpointName || (r.endpointName = Ue({
    context: "content-script",
    tabId: e.sender.tab.id,
    frameId: e.sender.frameId
  }));
  var _Bt = Bt(r.endpointName),
    n = _Bt.tabId,
    a = _Bt.frameId;
  V.set(r.endpointName, {
    fingerprint: r.fingerprint,
    port: e
  }), (t = ve.get(r.endpointName)) == null || t.forEach(function (s) {
    return s();
  }), ve.delete(r.endpointName), Mn(r.fingerprint, function () {
    var s = Fe.entries().filter(function (i) {
      return i.to === r.fingerprint;
    });
    Fe.remove(s), s.forEach(function (i) {
      i.from.endpointId === "background" ? Ot.endTransaction(i.message.transactionId) : se(i.from.endpointId).withFingerprint(i.from.fingerprint).aboutSessionEnded(r.fingerprint);
    });
  }), e.onDisconnect.addListener(function () {
    var s, i;
    ((s = V.get(r.endpointName)) == null ? void 0 : s.fingerprint) === r.fingerprint && V.delete(r.endpointName), (i = Je.get(r.fingerprint)) == null || i.forEach(function (o) {
      return o();
    }), Je.delete(r.fingerprint);
  }), e.onMessage.addListener(function (s) {
    var i, o;
    if (s.type === "sync") {
      var l = _toConsumableArray(V.values()).map(function (c) {
          return c.fingerprint;
        }),
        f = s.pendingResponses.filter(function (c) {
          return l.includes(c.to);
        });
      Fe.add.apply(Fe, _toConsumableArray(f)), s.pendingResponses.filter(function (c) {
        return !l.includes(c.to);
      }).forEach(function (c) {
        return se(r.endpointName).withFingerprint(r.fingerprint).aboutSessionEnded(c.to);
      }), s.pendingDeliveries.forEach(function (c) {
        return se(r.endpointName).withFingerprint(r.fingerprint).whenDeliverableTo(c);
      });
      return;
    }
    s.type === "deliver" && (o = (i = s.message) == null ? void 0 : i.origin) != null && o.context && (s.message.origin.tabId = n, s.message.origin.frameId = a, Ot.handleMessage(s.message));
  });
});
au(Ot);
var lu = ["应用", "网页收藏"],
  cu = "我的云文档";
function lt() {
  return _lt.apply(this, arguments);
}
function _lt() {
  _lt = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee14() {
    var _ref30;
    var t, _yield$sa, e;
    return _regeneratorRuntime().wrap(function _callee14$(_context14) {
      while (1) switch (_context14.prev = _context14.next) {
        case 0:
          _context14.next = 2;
          return sa();
        case 2:
          _yield$sa = _context14.sent;
          e = _yield$sa.data;
          return _context14.abrupt("return", {
            groupid: e.groupID,
            fid: e.fileID,
            path: (_ref30 = (t = e.pathName) == null ? void 0 : t.split("/")) !== null && _ref30 !== void 0 ? _ref30 : [cu].concat(lu),
            pathExist: e.pathExist
          });
        case 5:
        case "end":
          return _context14.stop();
      }
    }, _callee14);
  }));
  return _lt.apply(this, arguments);
}
var uu = function (e) {
  return e[e.Loading = 1] = "Loading", e[e.Success = 2] = "Success", e[e.Fail = 3] = "Fail", e;
}(uu || {});
var ct = !1;
function fu() {
  var _la = la(location.href),
    _la2 = _slicedToArray(_la, 1),
    _la2$ = _la2[0],
    e = _la2$ === void 0 ? "false" : _la2$,
    t = z(e === "true");
  function r(_x8) {
    return _r2.apply(this, arguments);
  }
  function _r2() {
    _r2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee9(a) {
      var _ref26;
      var _ref25, s, i, o, l;
      return _regeneratorRuntime().wrap(function _callee9$(_context9) {
        while (1) switch (_context9.prev = _context9.next) {
          case 0:
            _ref25 = a || {}, s = _ref25.groupid, i = _ref25.params, o = _ref25.name;
            l = (_ref26 = a == null ? void 0 : a.id) !== null && _ref26 !== void 0 ? _ref26 : 0;
            o === "Device" && i != null && i.deviceid && (l = i.deviceid);
            _context9.next = 5;
            return oa(l, s);
          case 5:
            n();
          case 6:
          case "end":
            return _context9.stop();
        }
      }, _callee9);
    }));
    return _r2.apply(this, arguments);
  }
  function n() {
    t.value = !1;
  }
  return {
    dialogVisible: t,
    finderConfirm: r,
    onFinderClose: n
  };
}
var Pu = function Pu(_ref27) {
  var _ref27$needLogin = _ref27.needLogin,
    e = _ref27$needLogin === void 0 ? !1 : _ref27$needLogin,
    _ref27$isSetting = _ref27.isSetting,
    t = _ref27$isSetting === void 0 ? !1 : _ref27$isSetting;
  var r = z(1),
    n = Ve({
      path: [],
      groupid: 0,
      fid: 0
    }),
    a = Ve({
      visible: !1,
      message: Re("setting.SaveContentFirst")
    }),
    s = z();
  function i() {
    return _i4.apply(this, arguments);
  }
  function _i4() {
    _i4 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee10() {
      return _regeneratorRuntime().wrap(function _callee10$(_context10) {
        while (1) switch (_context10.prev = _context10.next) {
          case 0:
            _context10.next = 2;
            return Wc();
          case 2:
            s.value = _context10.sent;
          case 3:
          case "end":
            return _context10.stop();
        }
      }, _callee10);
    }));
    return _i4.apply(this, arguments);
  }
  function o() {
    return _o3.apply(this, arguments);
  }
  function _o3() {
    _o3 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee11() {
      var _yield$lt, m, u, w;
      return _regeneratorRuntime().wrap(function _callee11$(_context11) {
        while (1) switch (_context11.prev = _context11.next) {
          case 0:
            _context11.prev = 0;
            r.value = 1;
            _context11.t0 = e;
            if (!_context11.t0) {
              _context11.next = 6;
              break;
            }
            _context11.next = 6;
            return i();
          case 6:
            _context11.next = 8;
            return lt();
          case 8:
            _yield$lt = _context11.sent;
            m = _yield$lt.groupid;
            u = _yield$lt.fid;
            w = _yield$lt.path;
            n.groupid = m, n.fid = u, n.path = w, r.value = 2;
            _context11.next = 18;
            break;
          case 15:
            _context11.prev = 15;
            _context11.t1 = _context11["catch"](0);
            r.value = 3, e && ra(!0);
          case 18:
          case "end":
            return _context11.stop();
        }
      }, _callee11, null, [[0, 15]]);
    }));
    return _o3.apply(this, arguments);
  }
  function l() {
    a.visible = !0, Gt(3e3).then(function () {
      a.visible = !1;
    }).catch(function () {});
  }
  function f() {
    return _f.apply(this, arguments);
  }
  function _f() {
    _f = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee12() {
      var m, u, _yield$lt2, w, d, _, P, $, _ref29;
      return _regeneratorRuntime().wrap(function _callee12$(_context12) {
        while (1) switch (_context12.prev = _context12.next) {
          case 0:
            _context12.prev = 0;
            _context12.next = 3;
            return lt();
          case 3:
            _yield$lt2 = _context12.sent;
            w = _yield$lt2.groupid;
            d = _yield$lt2.fid;
            _ = _yield$lt2.pathExist;
            P = _yield$lt2.path;
            if (!(_ ? w !== n.groupid || d !== (n == null ? void 0 : n.fid) ? a.message = Re("setting.PathMissing") : a.message = "" : a.message = Re("setting.SaveContentFirst"), n.groupid = w, n.fid = d, n.path = P, a.message)) {
              _context12.next = 14;
              break;
            }
            if (!t) {
              _context12.next = 12;
              break;
            }
            l();
            return _context12.abrupt("return");
          case 12:
            (u = (m = window == null ? void 0 : window.top) == null ? void 0 : m.postMessage) == null || u.call(m, {
              type: "toast",
              message: a.message
            }, "*");
            return _context12.abrupt("return");
          case 14:
            $ = j(s);
            if (!ca($)) {
              _context12.next = 18;
              break;
            }
            Ht({
              cropid: (_ref29 = $ == null ? void 0 : $.companyid) !== null && _ref29 !== void 0 ? _ref29 : "",
              groupid: n.groupid,
              fid: n.fid
            });
            return _context12.abrupt("return");
          case 18:
            Ht({
              fid: n.fid
            });
            _context12.next = 23;
            break;
          case 21:
            _context12.prev = 21;
            _context12.t0 = _context12["catch"](0);
          case 23:
          case "end":
            return _context12.stop();
        }
      }, _callee12, null, [[0, 21]]);
    }));
    return _f.apply(this, arguments);
  }
  zn(function () {
    o();
  });
  var c = R(function () {
      return ua(n.path || []);
    }),
    y = R(function () {
      var _ref28;
      var m;
      return (_ref28 = (m = n.path) == null ? void 0 : m.join(" > ")) !== null && _ref28 !== void 0 ? _ref28 : "";
    }),
    _fu = fu(),
    g = _fu.dialogVisible,
    v = _fu.finderConfirm,
    A = _fu.onFinderClose;
  function p(_x9) {
    return _p.apply(this, arguments);
  }
  function _p() {
    _p = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee13(m) {
      var _yield$lt3, u, w, d;
      return _regeneratorRuntime().wrap(function _callee13$(_context13) {
        while (1) switch (_context13.prev = _context13.next) {
          case 0:
            if (ct) {
              _context13.next = 18;
              break;
            }
            ct = !0;
            _context13.prev = 2;
            _context13.next = 5;
            return v(m);
          case 5:
            _context13.next = 7;
            return lt();
          case 7:
            _yield$lt3 = _context13.sent;
            u = _yield$lt3.groupid;
            w = _yield$lt3.fid;
            d = _yield$lt3.path;
            n.groupid = u, n.fid = w, n.path = d;
            _context13.next = 17;
            break;
          case 14:
            _context13.prev = 14;
            _context13.t0 = _context13["catch"](2);
            a.message = Re("setting.unsupSelection"), l();
          case 17:
            Gt(500).then(function () {
              ct = !1;
            });
          case 18:
          case "end":
            return _context13.stop();
        }
      }, _callee13, null, [[2, 14]]);
    }));
    return _p.apply(this, arguments);
  }
  return {
    toast: a,
    info: n,
    disPlayPath: c,
    allPath: y,
    userInfo: s,
    dialogVisible: g,
    openKdocsPath: f,
    onFinderConfirm: p,
    onFinderClose: A,
    initPath: o,
    pathState: r
  };
};
export { wu as C, Ou as E, xu as I, uu as P, Au as U, _u as a, Pu as b, Eu as c, bu as d, Tu as e, nt as f, ye as g, zc as h, vu as i, Ee as j, su as k, $u as l, Kc as m, nu as n, yu as o, au as p, Su as q, Dl as t, ma as u };
