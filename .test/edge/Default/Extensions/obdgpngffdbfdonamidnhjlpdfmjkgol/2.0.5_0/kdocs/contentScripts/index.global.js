function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _get() { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get.bind(); } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(arguments.length < 3 ? target : receiver); } return desc.value; }; } return _get.apply(this, arguments); }
function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }
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
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return exports; }; var exports = {}, Op = Object.prototype, hasOwn = Op.hasOwnProperty, defineProperty = Object.defineProperty || function (obj, key, desc) { obj[key] = desc.value; }, $Symbol = "function" == typeof Symbol ? Symbol : {}, iteratorSymbol = $Symbol.iterator || "@@iterator", asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator", toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag"; function define(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: !0, configurable: !0, writable: !0 }), obj[key]; } try { define({}, ""); } catch (err) { define = function define(obj, key, value) { return obj[key] = value; }; } function wrap(innerFn, outerFn, self, tryLocsList) { var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator, generator = Object.create(protoGenerator.prototype), context = new Context(tryLocsList || []); return defineProperty(generator, "_invoke", { value: makeInvokeMethod(innerFn, self, context) }), generator; } function tryCatch(fn, obj, arg) { try { return { type: "normal", arg: fn.call(obj, arg) }; } catch (err) { return { type: "throw", arg: err }; } } exports.wrap = wrap; var ContinueSentinel = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var IteratorPrototype = {}; define(IteratorPrototype, iteratorSymbol, function () { return this; }); var getProto = Object.getPrototypeOf, NativeIteratorPrototype = getProto && getProto(getProto(values([]))); NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype); var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype); function defineIteratorMethods(prototype) { ["next", "throw", "return"].forEach(function (method) { define(prototype, method, function (arg) { return this._invoke(method, arg); }); }); } function AsyncIterator(generator, PromiseImpl) { function invoke(method, arg, resolve, reject) { var record = tryCatch(generator[method], generator, arg); if ("throw" !== record.type) { var result = record.arg, value = result.value; return value && "object" == _typeof(value) && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) { invoke("next", value, resolve, reject); }, function (err) { invoke("throw", err, resolve, reject); }) : PromiseImpl.resolve(value).then(function (unwrapped) { result.value = unwrapped, resolve(result); }, function (error) { return invoke("throw", error, resolve, reject); }); } reject(record.arg); } var previousPromise; defineProperty(this, "_invoke", { value: function value(method, arg) { function callInvokeWithMethodAndArg() { return new PromiseImpl(function (resolve, reject) { invoke(method, arg, resolve, reject); }); } return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(innerFn, self, context) { var state = "suspendedStart"; return function (method, arg) { if ("executing" === state) throw new Error("Generator is already running"); if ("completed" === state) { if ("throw" === method) throw arg; return doneResult(); } for (context.method = method, context.arg = arg;;) { var delegate = context.delegate; if (delegate) { var delegateResult = maybeInvokeDelegate(delegate, context); if (delegateResult) { if (delegateResult === ContinueSentinel) continue; return delegateResult; } } if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) { if ("suspendedStart" === state) throw state = "completed", context.arg; context.dispatchException(context.arg); } else "return" === context.method && context.abrupt("return", context.arg); state = "executing"; var record = tryCatch(innerFn, self, context); if ("normal" === record.type) { if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue; return { value: record.arg, done: context.done }; } "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg); } }; } function maybeInvokeDelegate(delegate, context) { var methodName = context.method, method = delegate.iterator[methodName]; if (undefined === method) return context.delegate = null, "throw" === methodName && delegate.iterator.return && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method) || "return" !== methodName && (context.method = "throw", context.arg = new TypeError("The iterator does not provide a '" + methodName + "' method")), ContinueSentinel; var record = tryCatch(method, delegate.iterator, context.arg); if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel; var info = record.arg; return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel); } function pushTryEntry(locs) { var entry = { tryLoc: locs[0] }; 1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry); } function resetTryEntry(entry) { var record = entry.completion || {}; record.type = "normal", delete record.arg, entry.completion = record; } function Context(tryLocsList) { this.tryEntries = [{ tryLoc: "root" }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0); } function values(iterable) { if (iterable) { var iteratorMethod = iterable[iteratorSymbol]; if (iteratorMethod) return iteratorMethod.call(iterable); if ("function" == typeof iterable.next) return iterable; if (!isNaN(iterable.length)) { var i = -1, next = function next() { for (; ++i < iterable.length;) if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next; return next.value = undefined, next.done = !0, next; }; return next.next = next; } } return { next: doneResult }; } function doneResult() { return { value: undefined, done: !0 }; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, defineProperty(Gp, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), defineProperty(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) { var ctor = "function" == typeof genFun && genFun.constructor; return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name)); }, exports.mark = function (genFun) { return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun; }, exports.awrap = function (arg) { return { __await: arg }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () { return this; }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) { void 0 === PromiseImpl && (PromiseImpl = Promise); var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl); return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) { return result.done ? result.value : iter.next(); }); }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () { return this; }), define(Gp, "toString", function () { return "[object Generator]"; }), exports.keys = function (val) { var object = Object(val), keys = []; for (var key in object) keys.push(key); return keys.reverse(), function next() { for (; keys.length;) { var key = keys.pop(); if (key in object) return next.value = key, next.done = !1, next; } return next.done = !0, next; }; }, exports.values = values, Context.prototype = { constructor: Context, reset: function reset(skipTempReset) { if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined); }, stop: function stop() { this.done = !0; var rootRecord = this.tryEntries[0].completion; if ("throw" === rootRecord.type) throw rootRecord.arg; return this.rval; }, dispatchException: function dispatchException(exception) { if (this.done) throw exception; var context = this; function handle(loc, caught) { return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught; } for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i], record = entry.completion; if ("root" === entry.tryLoc) return handle("end"); if (entry.tryLoc <= this.prev) { var hasCatch = hasOwn.call(entry, "catchLoc"), hasFinally = hasOwn.call(entry, "finallyLoc"); if (hasCatch && hasFinally) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } else if (hasCatch) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); } else { if (!hasFinally) throw new Error("try statement without catch or finally"); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } } } }, abrupt: function abrupt(type, arg) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) { var finallyEntry = entry; break; } } finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null); var record = finallyEntry ? finallyEntry.completion : {}; return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record); }, complete: function complete(record, afterLoc) { if ("throw" === record.type) throw record.arg; return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel; }, finish: function finish(finallyLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel; } }, catch: function _catch(tryLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc === tryLoc) { var record = entry.completion; if ("throw" === record.type) { var thrown = record.arg; resetTryEntry(entry); } return thrown; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(iterable, resultName, nextLoc) { return this.delegate = { iterator: values(iterable), resultName: resultName, nextLoc: nextLoc }, "next" === this.method && (this.arg = undefined), ContinueSentinel; } }, exports; }
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArrayLimit(arr, i) { var _i = null == arr ? null : "undefined" != typeof Symbol && arr[Symbol.iterator] || arr["@@iterator"]; if (null != _i) { var _s, _e, _x, _r, _arr = [], _n = !0, _d = !1; try { if (_x = (_i = _i.call(arr)).next, 0 === i) { if (Object(_i) !== _i) return; _n = !1; } else for (; !(_n = (_s = _x.call(_i)).done) && (_arr.push(_s.value), _arr.length !== i); _n = !0); } catch (err) { _d = !0, _e = err; } finally { try { if (!_n && null != _i.return && (_r = _i.return(), Object(_r) !== _r)) return; } finally { if (_d) throw _e; } } return _arr; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e5) { throw _e5; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e6) { didErr = true; err = _e6; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
var md = Object.defineProperty;
var hd = function hd(Ze, ee, Oe) {
  return ee in Ze ? md(Ze, ee, {
    enumerable: !0,
    configurable: !0,
    writable: !0,
    value: Oe
  }) : Ze[ee] = Oe;
};
var Es = function Es(Ze, ee, Oe) {
  return hd(Ze, _typeof(ee) != "symbol" ? ee + "" : ee, Oe), Oe;
};
(function () {
  "use strict";

  function Ze(e, t) {
    var n = Object.create(null),
      r = e.split(",");
    for (var s = 0; s < r.length; s++) n[r[s]] = !0;
    return t ? function (s) {
      return !!n[s.toLowerCase()];
    } : function (s) {
      return !!n[s];
    };
  }
  var ee = {},
    Oe = [],
    Pe = function Pe() {},
    aa = function aa() {
      return !1;
    },
    la = /^on[^a-z]/,
    un = function un(e) {
      return la.test(e);
    },
    sr = function sr(e) {
      return e.startsWith("onUpdate:");
    },
    he = Object.assign,
    or = function or(e, t) {
      var n = e.indexOf(t);
      n > -1 && e.splice(n, 1);
    },
    ca = Object.prototype.hasOwnProperty,
    te = function te(e, t) {
      return ca.call(e, t);
    },
    V = Array.isArray,
    Bt = function Bt(e) {
      return fn(e) === "[object Map]";
    },
    ua = function ua(e) {
      return fn(e) === "[object Set]";
    },
    Q = function Q(e) {
      return typeof e == "function";
    },
    pe = function pe(e) {
      return typeof e == "string";
    },
    ir = function ir(e) {
      return _typeof(e) == "symbol";
    },
    fe = function fe(e) {
      return e !== null && _typeof(e) == "object";
    },
    vs = function vs(e) {
      return fe(e) && Q(e.then) && Q(e.catch);
    },
    fa = Object.prototype.toString,
    fn = function fn(e) {
      return fa.call(e);
    },
    da = function da(e) {
      return fn(e).slice(8, -1);
    },
    ga = function ga(e) {
      return fn(e) === "[object Object]";
    },
    ar = function ar(e) {
      return pe(e) && e !== "NaN" && e[0] !== "-" && "" + parseInt(e, 10) === e;
    },
    dn = Ze(",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"),
    gn = function gn(e) {
      var t = Object.create(null);
      return function (n) {
        return t[n] || (t[n] = e(n));
      };
    },
    ma = /-(\w)/g,
    vt = gn(function (e) {
      return e.replace(ma, function (t, n) {
        return n ? n.toUpperCase() : "";
      });
    }),
    ha = /\B([A-Z])/g,
    Mt = gn(function (e) {
      return e.replace(ha, "-$1").toLowerCase();
    }),
    Ms = gn(function (e) {
      return e.charAt(0).toUpperCase() + e.slice(1);
    }),
    lr = gn(function (e) {
      return e ? "on".concat(Ms(e)) : "";
    }),
    zt = function zt(e, t) {
      return !Object.is(e, t);
    },
    cr = function cr(e, t) {
      for (var n = 0; n < e.length; n++) e[n](t);
    },
    mn = function mn(e, t, n) {
      Object.defineProperty(e, t, {
        configurable: !0,
        enumerable: !1,
        value: n
      });
    },
    pa = function pa(e) {
      var t = parseFloat(e);
      return isNaN(t) ? e : t;
    };
  var Ts;
  var ur = function ur() {
    return Ts || (Ts = (typeof globalThis === "undefined" ? "undefined" : _typeof(globalThis)) < "u" ? globalThis : (typeof self === "undefined" ? "undefined" : _typeof(self)) < "u" ? self : (typeof window === "undefined" ? "undefined" : _typeof(window)) < "u" ? window : (typeof global === "undefined" ? "undefined" : _typeof(global)) < "u" ? global : {});
  };
  function Tt(e) {
    if (V(e)) {
      var t = {};
      for (var n = 0; n < e.length; n++) {
        var r = e[n],
          s = pe(r) ? wa(r) : Tt(r);
        if (s) for (var o in s) t[o] = s[o];
      }
      return t;
    } else {
      if (pe(e)) return e;
      if (fe(e)) return e;
    }
  }
  var Aa = /;(?![^(]*\))/g,
    xa = /:([^]+)/,
    ba = /\/\*[^]*?\*\//g;
  function wa(e) {
    var t = {};
    return e.replace(ba, "").split(Aa).forEach(function (n) {
      if (n) {
        var r = n.split(xa);
        r.length > 1 && (t[r[0].trim()] = r[1].trim());
      }
    }), t;
  }
  function fr(e) {
    var t = "";
    if (pe(e)) t = e;else if (V(e)) for (var n = 0; n < e.length; n++) {
      var r = fr(e[n]);
      r && (t += r + " ");
    } else if (fe(e)) for (var _n2 in e) e[_n2] && (t += _n2 + " ");
    return t.trim();
  }
  var ya = Ze("itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly");
  function Cs(e) {
    return !!e || e === "";
  }
  var Te;
  var _a = /*#__PURE__*/function () {
    function _a() {
      var t = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : !1;
      _classCallCheck(this, _a);
      this.detached = t, this._active = !0, this.effects = [], this.cleanups = [], this.parent = Te, !t && Te && (this.index = (Te.scopes || (Te.scopes = [])).push(this) - 1);
    }
    _createClass(_a, [{
      key: "active",
      get: function get() {
        return this._active;
      }
    }, {
      key: "run",
      value: function run(t) {
        if (this._active) {
          var n = Te;
          try {
            return Te = this, t();
          } finally {
            Te = n;
          }
        }
      }
    }, {
      key: "on",
      value: function on() {
        Te = this;
      }
    }, {
      key: "off",
      value: function off() {
        Te = this.parent;
      }
    }, {
      key: "stop",
      value: function stop(t) {
        if (this._active) {
          var n, r;
          for (n = 0, r = this.effects.length; n < r; n++) this.effects[n].stop();
          for (n = 0, r = this.cleanups.length; n < r; n++) this.cleanups[n]();
          if (this.scopes) for (n = 0, r = this.scopes.length; n < r; n++) this.scopes[n].stop(!0);
          if (!this.detached && this.parent && !t) {
            var s = this.parent.scopes.pop();
            s && s !== this && (this.parent.scopes[this.index] = s, s.index = this.index);
          }
          this.parent = void 0, this._active = !1;
        }
      }
    }]);
    return _a;
  }();
  function Ea(e) {
    var t = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Te;
    t && t.active && t.effects.push(e);
  }
  function Ss() {
    return Te;
  }
  function va(e) {
    Te && Te.cleanups.push(e);
  }
  var dr = function dr(e) {
      var t = new Set(e);
      return t.w = 0, t.n = 0, t;
    },
    Os = function Os(e) {
      return (e.w & st) > 0;
    },
    Is = function Is(e) {
      return (e.n & st) > 0;
    },
    Ma = function Ma(_ref) {
      var e = _ref.deps;
      if (e.length) for (var t = 0; t < e.length; t++) e[t].w |= st;
    },
    Ta = function Ta(e) {
      var t = e.deps;
      if (t.length) {
        var n = 0;
        for (var r = 0; r < t.length; r++) {
          var s = t[r];
          Os(s) && !Is(s) ? s.delete(e) : t[n++] = s, s.w &= ~st, s.n &= ~st;
        }
        t.length = n;
      }
    },
    gr = new WeakMap();
  var Ht = 0,
    st = 1;
  var mr = 30;
  var De;
  var gt = Symbol(""),
    hr = Symbol("");
  var pr = /*#__PURE__*/function () {
    function pr(t) {
      var n = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var r = arguments.length > 2 ? arguments[2] : undefined;
      _classCallCheck(this, pr);
      this.fn = t, this.scheduler = n, this.active = !0, this.deps = [], this.parent = void 0, Ea(this, r);
    }
    _createClass(pr, [{
      key: "run",
      value: function run() {
        if (!this.active) return this.fn();
        var t = De,
          n = ot;
        for (; t;) {
          if (t === this) return;
          t = t.parent;
        }
        try {
          return this.parent = De, De = this, ot = !0, st = 1 << ++Ht, Ht <= mr ? Ma(this) : Ns(this), this.fn();
        } finally {
          Ht <= mr && Ta(this), st = 1 << --Ht, De = this.parent, ot = n, this.parent = void 0, this.deferStop && this.stop();
        }
      }
    }, {
      key: "stop",
      value: function stop() {
        De === this ? this.deferStop = !0 : this.active && (Ns(this), this.onStop && this.onStop(), this.active = !1);
      }
    }]);
    return pr;
  }();
  function Ns(e) {
    var t = e.deps;
    if (t.length) {
      for (var n = 0; n < t.length; n++) t[n].delete(e);
      t.length = 0;
    }
  }
  var ot = !0;
  var Ps = [];
  function Ct() {
    Ps.push(ot), ot = !1;
  }
  function St() {
    var e = Ps.pop();
    ot = e === void 0 ? !0 : e;
  }
  function Ee(e, t, n) {
    if (ot && De) {
      var r = gr.get(e);
      r || gr.set(e, r = new Map());
      var s = r.get(n);
      s || r.set(n, s = dr()), Ds(s);
    }
  }
  function Ds(e, t) {
    var n = !1;
    Ht <= mr ? Is(e) || (e.n |= st, n = !Os(e)) : n = !e.has(De), n && (e.add(De), De.deps.push(e));
  }
  function Xe(e, t, n, r, s, o) {
    var i = gr.get(e);
    if (!i) return;
    var a = [];
    if (t === "clear") a = _toConsumableArray(i.values());else if (n === "length" && V(e)) {
      var l = Number(r);
      i.forEach(function (c, u) {
        (u === "length" || u >= l) && a.push(c);
      });
    } else switch (n !== void 0 && a.push(i.get(n)), t) {
      case "add":
        V(e) ? ar(n) && a.push(i.get("length")) : (a.push(i.get(gt)), Bt(e) && a.push(i.get(hr)));
        break;
      case "delete":
        V(e) || (a.push(i.get(gt)), Bt(e) && a.push(i.get(hr)));
        break;
      case "set":
        Bt(e) && a.push(i.get(gt));
        break;
    }
    if (a.length === 1) a[0] && Ar(a[0]);else {
      var _l2 = [];
      var _iterator = _createForOfIteratorHelper(a),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var c = _step.value;
          c && _l2.push.apply(_l2, _toConsumableArray(c));
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      Ar(dr(_l2));
    }
  }
  function Ar(e, t) {
    var n = V(e) ? e : _toConsumableArray(e);
    var _iterator2 = _createForOfIteratorHelper(n),
      _step2;
    try {
      for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
        var r = _step2.value;
        r.computed && Rs(r);
      }
    } catch (err) {
      _iterator2.e(err);
    } finally {
      _iterator2.f();
    }
    var _iterator3 = _createForOfIteratorHelper(n),
      _step3;
    try {
      for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
        var _r2 = _step3.value;
        _r2.computed || Rs(_r2);
      }
    } catch (err) {
      _iterator3.e(err);
    } finally {
      _iterator3.f();
    }
  }
  function Rs(e, t) {
    (e !== De || e.allowRecurse) && (e.scheduler ? e.scheduler() : e.run());
  }
  var Ca = Ze("__proto__,__v_isRef,__isVue"),
    ks = new Set(Object.getOwnPropertyNames(Symbol).filter(function (e) {
      return e !== "arguments" && e !== "caller";
    }).map(function (e) {
      return Symbol[e];
    }).filter(ir)),
    Sa = xr(),
    Oa = xr(!1, !0),
    Ia = xr(!0),
    js = Na();
  function Na() {
    var e = {};
    return ["includes", "indexOf", "lastIndexOf"].forEach(function (t) {
      e[t] = function () {
        var r = re(this);
        for (var o = 0, i = this.length; o < i; o++) Ee(r, "get", o + "");
        for (var _len = arguments.length, n = new Array(_len), _key = 0; _key < _len; _key++) {
          n[_key] = arguments[_key];
        }
        var s = r[t].apply(r, n);
        return s === -1 || s === !1 ? r[t].apply(r, _toConsumableArray(n.map(re))) : s;
      };
    }), ["push", "pop", "shift", "unshift", "splice"].forEach(function (t) {
      e[t] = function () {
        Ct();
        for (var _len2 = arguments.length, n = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          n[_key2] = arguments[_key2];
        }
        var r = re(this)[t].apply(this, n);
        return St(), r;
      };
    }), e;
  }
  function Pa(e) {
    var t = re(this);
    return Ee(t, "has", e), t.hasOwnProperty(e);
  }
  function xr() {
    var e = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : !1;
    var t = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : !1;
    return function (r, s, o) {
      if (s === "__v_isReactive") return !e;
      if (s === "__v_isReadonly") return e;
      if (s === "__v_isShallow") return t;
      if (s === "__v_raw" && o === (e ? t ? Ya : qs : t ? Ws : Hs).get(r)) return r;
      var i = V(r);
      if (!e) {
        if (i && te(js, s)) return Reflect.get(js, s, o);
        if (s === "hasOwnProperty") return Pa;
      }
      var a = Reflect.get(r, s, o);
      return (ir(s) ? ks.has(s) : Ca(s)) || (e || Ee(r, "get", s), t) ? a : be(a) ? i && ar(s) ? a : a.value : fe(a) ? e ? Ks(a) : yr(a) : a;
    };
  }
  var Da = Ls(),
    Ra = Ls(!0);
  function Ls() {
    var e = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : !1;
    return function (n, r, s, o) {
      var i = n[r];
      if (It(i) && be(i) && !be(s)) return !1;
      if (!e && (!yn(s) && !It(s) && (i = re(i), s = re(s)), !V(n) && be(i) && !be(s))) return i.value = s, !0;
      var a = V(n) && ar(r) ? Number(r) < n.length : te(n, r),
        l = Reflect.set(n, r, s, o);
      return n === re(o) && (a ? zt(s, i) && Xe(n, "set", r, s) : Xe(n, "add", r, s)), l;
    };
  }
  function ka(e, t) {
    var n = te(e, t);
    e[t];
    var r = Reflect.deleteProperty(e, t);
    return r && n && Xe(e, "delete", t, void 0), r;
  }
  function ja(e, t) {
    var n = Reflect.has(e, t);
    return (!ir(t) || !ks.has(t)) && Ee(e, "has", t), n;
  }
  function La(e) {
    return Ee(e, "iterate", V(e) ? "length" : gt), Reflect.ownKeys(e);
  }
  var $s = {
      get: Sa,
      set: Da,
      deleteProperty: ka,
      has: ja,
      ownKeys: La
    },
    $a = {
      get: Ia,
      set: function set(e, t) {
        return !0;
      },
      deleteProperty: function deleteProperty(e, t) {
        return !0;
      }
    },
    Fa = he({}, $s, {
      get: Oa,
      set: Ra
    }),
    br = function br(e) {
      return e;
    },
    hn = function hn(e) {
      return Reflect.getPrototypeOf(e);
    };
  function pn(e, t) {
    var n = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : !1;
    var r = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : !1;
    e = e.__v_raw;
    var s = re(e),
      o = re(t);
    n || (t !== o && Ee(s, "get", t), Ee(s, "get", o));
    var _hn = hn(s),
      i = _hn.has,
      a = r ? br : n ? Er : Wt;
    if (i.call(s, t)) return a(e.get(t));
    if (i.call(s, o)) return a(e.get(o));
    e !== s && e.get(t);
  }
  function An(e) {
    var t = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : !1;
    var n = this.__v_raw,
      r = re(n),
      s = re(e);
    return t || (e !== s && Ee(r, "has", e), Ee(r, "has", s)), e === s ? n.has(e) : n.has(e) || n.has(s);
  }
  function xn(e) {
    var t = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : !1;
    return e = e.__v_raw, !t && Ee(re(e), "iterate", gt), Reflect.get(e, "size", e);
  }
  function Fs(e) {
    e = re(e);
    var t = re(this);
    return hn(t).has.call(t, e) || (t.add(e), Xe(t, "add", e, e)), this;
  }
  function Us(e, t) {
    t = re(t);
    var n = re(this),
      _hn2 = hn(n),
      r = _hn2.has,
      s = _hn2.get;
    var o = r.call(n, e);
    o || (e = re(e), o = r.call(n, e));
    var i = s.call(n, e);
    return n.set(e, t), o ? zt(t, i) && Xe(n, "set", e, t) : Xe(n, "add", e, t), this;
  }
  function Bs(e) {
    var t = re(this),
      _hn3 = hn(t),
      n = _hn3.has,
      r = _hn3.get;
    var s = n.call(t, e);
    s || (e = re(e), s = n.call(t, e)), r && r.call(t, e);
    var o = t.delete(e);
    return s && Xe(t, "delete", e, void 0), o;
  }
  function zs() {
    var e = re(this),
      t = e.size !== 0,
      n = e.clear();
    return t && Xe(e, "clear", void 0, void 0), n;
  }
  function bn(e, t) {
    return function (r, s) {
      var o = this,
        i = o.__v_raw,
        a = re(i),
        l = t ? br : e ? Er : Wt;
      return !e && Ee(a, "iterate", gt), i.forEach(function (c, u) {
        return r.call(s, l(c), l(u), o);
      });
    };
  }
  function wn(e, t, n) {
    return function () {
      var s = this.__v_raw,
        o = re(s),
        i = Bt(o),
        a = e === "entries" || e === Symbol.iterator && i,
        l = e === "keys" && i,
        c = s[e].apply(s, arguments),
        u = n ? br : t ? Er : Wt;
      return !t && Ee(o, "iterate", l ? hr : gt), _defineProperty({
        next: function next() {
          var _c$next = c.next(),
            d = _c$next.value,
            A = _c$next.done;
          return A ? {
            value: d,
            done: A
          } : {
            value: a ? [u(d[0]), u(d[1])] : u(d),
            done: A
          };
        }
      }, Symbol.iterator, function () {
        return this;
      });
    };
  }
  function it(e) {
    return function () {
      return e === "delete" ? !1 : this;
    };
  }
  function Ua() {
    var e = {
        get: function get(o) {
          return pn(this, o);
        },
        get size() {
          return xn(this);
        },
        has: An,
        add: Fs,
        set: Us,
        delete: Bs,
        clear: zs,
        forEach: bn(!1, !1)
      },
      t = {
        get: function get(o) {
          return pn(this, o, !1, !0);
        },
        get size() {
          return xn(this);
        },
        has: An,
        add: Fs,
        set: Us,
        delete: Bs,
        clear: zs,
        forEach: bn(!1, !0)
      },
      n = {
        get: function get(o) {
          return pn(this, o, !0);
        },
        get size() {
          return xn(this, !0);
        },
        has: function has(o) {
          return An.call(this, o, !0);
        },
        add: it("add"),
        set: it("set"),
        delete: it("delete"),
        clear: it("clear"),
        forEach: bn(!0, !1)
      },
      r = {
        get: function get(o) {
          return pn(this, o, !0, !0);
        },
        get size() {
          return xn(this, !0);
        },
        has: function has(o) {
          return An.call(this, o, !0);
        },
        add: it("add"),
        set: it("set"),
        delete: it("delete"),
        clear: it("clear"),
        forEach: bn(!0, !0)
      };
    return ["keys", "values", "entries", Symbol.iterator].forEach(function (o) {
      e[o] = wn(o, !1, !1), n[o] = wn(o, !0, !1), t[o] = wn(o, !1, !0), r[o] = wn(o, !0, !0);
    }), [e, n, t, r];
  }
  var _Ua = Ua(),
    _Ua2 = _slicedToArray(_Ua, 4),
    Ba = _Ua2[0],
    za = _Ua2[1],
    Ha = _Ua2[2],
    Wa = _Ua2[3];
  function wr(e, t) {
    var n = t ? e ? Wa : Ha : e ? za : Ba;
    return function (r, s, o) {
      return s === "__v_isReactive" ? !e : s === "__v_isReadonly" ? e : s === "__v_raw" ? r : Reflect.get(te(n, s) && s in r ? n : r, s, o);
    };
  }
  var qa = {
      get: wr(!1, !1)
    },
    Ka = {
      get: wr(!1, !0)
    },
    Ja = {
      get: wr(!0, !1)
    },
    Hs = new WeakMap(),
    Ws = new WeakMap(),
    qs = new WeakMap(),
    Ya = new WeakMap();
  function Va(e) {
    switch (e) {
      case "Object":
      case "Array":
        return 1;
      case "Map":
      case "Set":
      case "WeakMap":
      case "WeakSet":
        return 2;
      default:
        return 0;
    }
  }
  function Qa(e) {
    return e.__v_skip || !Object.isExtensible(e) ? 0 : Va(da(e));
  }
  function yr(e) {
    return It(e) ? e : _r(e, !1, $s, qa, Hs);
  }
  function Za(e) {
    return _r(e, !1, Fa, Ka, Ws);
  }
  function Ks(e) {
    return _r(e, !0, $a, Ja, qs);
  }
  function _r(e, t, n, r, s) {
    if (!fe(e) || e.__v_raw && !(t && e.__v_isReactive)) return e;
    var o = s.get(e);
    if (o) return o;
    var i = Qa(e);
    if (i === 0) return e;
    var a = new Proxy(e, i === 2 ? r : n);
    return s.set(e, a), a;
  }
  function Ot(e) {
    return It(e) ? Ot(e.__v_raw) : !!(e && e.__v_isReactive);
  }
  function It(e) {
    return !!(e && e.__v_isReadonly);
  }
  function yn(e) {
    return !!(e && e.__v_isShallow);
  }
  function Js(e) {
    return Ot(e) || It(e);
  }
  function re(e) {
    var t = e && e.__v_raw;
    return t ? re(t) : e;
  }
  function Ys(e) {
    return mn(e, "__v_skip", !0), e;
  }
  var Wt = function Wt(e) {
      return fe(e) ? yr(e) : e;
    },
    Er = function Er(e) {
      return fe(e) ? Ks(e) : e;
    };
  function Vs(e) {
    ot && De && (e = re(e), Ds(e.dep || (e.dep = dr())));
  }
  function Qs(e, t) {
    e = re(e);
    var n = e.dep;
    n && Ar(n);
  }
  function be(e) {
    return !!(e && e.__v_isRef === !0);
  }
  function Ae(e) {
    return Zs(e, !1);
  }
  function Xa(e) {
    return Zs(e, !0);
  }
  function Zs(e, t) {
    return be(e) ? e : new Ga(e, t);
  }
  var Ga = /*#__PURE__*/function () {
    function Ga(t, n) {
      _classCallCheck(this, Ga);
      this.__v_isShallow = n, this.dep = void 0, this.__v_isRef = !0, this._rawValue = n ? t : re(t), this._value = n ? t : Wt(t);
    }
    _createClass(Ga, [{
      key: "value",
      get: function get() {
        return Vs(this), this._value;
      },
      set: function set(t) {
        var n = this.__v_isShallow || yn(t) || It(t);
        t = n ? t : re(t), zt(t, this._rawValue) && (this._rawValue = t, this._value = n ? t : Wt(t), Qs(this));
      }
    }]);
    return Ga;
  }();
  function ce(e) {
    return be(e) ? e.value : e;
  }
  var el = {
    get: function get(e, t, n) {
      return ce(Reflect.get(e, t, n));
    },
    set: function set(e, t, n, r) {
      var s = e[t];
      return be(s) && !be(n) ? (s.value = n, !0) : Reflect.set(e, t, n, r);
    }
  };
  function Xs(e) {
    return Ot(e) ? e : new Proxy(e, el);
  }
  var tl = /*#__PURE__*/function () {
    function tl(t, n, r, s) {
      var _this = this;
      _classCallCheck(this, tl);
      this._setter = n, this.dep = void 0, this.__v_isRef = !0, this.__v_isReadonly = !1, this._dirty = !0, this.effect = new pr(t, function () {
        _this._dirty || (_this._dirty = !0, Qs(_this));
      }), this.effect.computed = this, this.effect.active = this._cacheable = !s, this.__v_isReadonly = r;
    }
    _createClass(tl, [{
      key: "value",
      get: function get() {
        var t = re(this);
        return Vs(t), (t._dirty || !t._cacheable) && (t._dirty = !1, t._value = t.effect.run()), t._value;
      },
      set: function set(t) {
        this._setter(t);
      }
    }]);
    return tl;
  }();
  function nl(e, t) {
    var n = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : !1;
    var r, s;
    var o = Q(e);
    return o ? (r = e, s = Pe) : (r = e.get, s = e.set), new tl(r, s, o || !s, n);
  }
  function Ad(e) {}
  function at(e, t, n, r) {
    var s;
    try {
      s = r ? e.apply(void 0, _toConsumableArray(r)) : e();
    } catch (o) {
      _n(o, t, n);
    }
    return s;
  }
  function Re(e, t, n, r) {
    if (Q(e)) {
      var o = at(e, t, n, r);
      return o && vs(o) && o.catch(function (i) {
        _n(i, t, n);
      }), o;
    }
    var s = [];
    for (var _o2 = 0; _o2 < e.length; _o2++) s.push(Re(e[_o2], t, n, r));
    return s;
  }
  function _n(e, t, n) {
    var r = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : !0;
    var s = t ? t.vnode : null;
    if (t) {
      var o = t.parent;
      var i = t.proxy,
        a = n;
      for (; o;) {
        var c = o.ec;
        if (c) {
          for (var u = 0; u < c.length; u++) if (c[u](e, i, a) === !1) return;
        }
        o = o.parent;
      }
      var l = t.appContext.config.errorHandler;
      if (l) {
        at(l, null, 10, [e, i, a]);
        return;
      }
    }
    rl(e, n, s, r);
  }
  function rl(e, t, n) {
    var r = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : !0;
    console.error(e);
  }
  var qt = !1,
    vr = !1;
  var we = [];
  var Ue = 0;
  var Nt = [];
  var Ge = null,
    mt = 0;
  var Gs = Promise.resolve();
  var Mr = null;
  function sl(e) {
    var t = Mr || Gs;
    return e ? t.then(this ? e.bind(this) : e) : t;
  }
  function ol(e) {
    var t = Ue + 1,
      n = we.length;
    for (; t < n;) {
      var r = t + n >>> 1;
      Kt(we[r]) < e ? t = r + 1 : n = r;
    }
    return t;
  }
  function Tr(e) {
    (!we.length || !we.includes(e, qt && e.allowRecurse ? Ue + 1 : Ue)) && (e.id == null ? we.push(e) : we.splice(ol(e.id), 0, e), eo());
  }
  function eo() {
    !qt && !vr && (vr = !0, Mr = Gs.then(ro));
  }
  function il(e) {
    var t = we.indexOf(e);
    t > Ue && we.splice(t, 1);
  }
  function al(e) {
    V(e) ? Nt.push.apply(Nt, _toConsumableArray(e)) : (!Ge || !Ge.includes(e, e.allowRecurse ? mt + 1 : mt)) && Nt.push(e), eo();
  }
  function to(e) {
    var t = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : qt ? Ue + 1 : 0;
    for (; t < we.length; t++) {
      var n = we[t];
      n && n.pre && (we.splice(t, 1), t--, n());
    }
  }
  function no(e) {
    if (Nt.length) {
      var t = _toConsumableArray(new Set(Nt));
      if (Nt.length = 0, Ge) {
        var _Ge;
        (_Ge = Ge).push.apply(_Ge, _toConsumableArray(t));
        return;
      }
      for (Ge = t, Ge.sort(function (n, r) {
        return Kt(n) - Kt(r);
      }), mt = 0; mt < Ge.length; mt++) Ge[mt]();
      Ge = null, mt = 0;
    }
  }
  var Kt = function Kt(e) {
      return e.id == null ? 1 / 0 : e.id;
    },
    ll = function ll(e, t) {
      var n = Kt(e) - Kt(t);
      if (n === 0) {
        if (e.pre && !t.pre) return -1;
        if (t.pre && !e.pre) return 1;
      }
      return n;
    };
  function ro(e) {
    vr = !1, qt = !0, we.sort(ll);
    var t = Pe;
    try {
      for (Ue = 0; Ue < we.length; Ue++) {
        var n = we[Ue];
        n && n.active !== !1 && at(n, null, 14);
      }
    } finally {
      Ue = 0, we.length = 0, no(), qt = !1, Mr = null, (we.length || Nt.length) && ro();
    }
  }
  function cl(e, t) {
    if (e.isUnmounted) return;
    var r = e.vnode.props || ee;
    for (var _len3 = arguments.length, n = new Array(_len3 > 2 ? _len3 - 2 : 0), _key3 = 2; _key3 < _len3; _key3++) {
      n[_key3 - 2] = arguments[_key3];
    }
    var s = n;
    var o = t.startsWith("update:"),
      i = o && t.slice(7);
    if (i && i in r) {
      var u = "".concat(i === "modelValue" ? "model" : i, "Modifiers"),
        _ref3 = r[u] || ee,
        d = _ref3.number,
        A = _ref3.trim;
      A && (s = n.map(function (m) {
        return pe(m) ? m.trim() : m;
      })), d && (s = n.map(pa));
    }
    var a,
      l = r[a = lr(t)] || r[a = lr(vt(t))];
    !l && o && (l = r[a = lr(Mt(t))]), l && Re(l, e, 6, s);
    var c = r[a + "Once"];
    if (c) {
      if (!e.emitted) e.emitted = {};else if (e.emitted[a]) return;
      e.emitted[a] = !0, Re(c, e, 6, s);
    }
  }
  function so(e, t) {
    var n = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : !1;
    var r = t.emitsCache,
      s = r.get(e);
    if (s !== void 0) return s;
    var o = e.emits;
    var i = {},
      a = !1;
    if (!Q(e)) {
      var l = function l(c) {
        var u = so(c, t, !0);
        u && (a = !0, he(i, u));
      };
      !n && t.mixins.length && t.mixins.forEach(l), e.extends && l(e.extends), e.mixins && e.mixins.forEach(l);
    }
    return !o && !a ? (fe(e) && r.set(e, null), null) : (V(o) ? o.forEach(function (l) {
      return i[l] = null;
    }) : he(i, o), fe(e) && r.set(e, i), i);
  }
  function En(e, t) {
    return !e || !un(t) ? !1 : (t = t.slice(2).replace(/Once$/, ""), te(e, t[0].toLowerCase() + t.slice(1)) || te(e, Mt(t)) || te(e, t));
  }
  var ke = null,
    oo = null;
  function vn(e) {
    var t = ke;
    return ke = e, oo = e && e.type.__scopeId || null, t;
  }
  function ul(e) {
    var t = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : ke;
    var n = arguments.length > 2 ? arguments[2] : undefined;
    if (!t || e._n) return e;
    var r = function r() {
      r._d && Oo(-1);
      var o = vn(t);
      var i;
      try {
        i = e.apply(void 0, arguments);
      } finally {
        vn(o), r._d && Oo(1);
      }
      return i;
    };
    return r._n = !0, r._c = !0, r._d = !0, r;
  }
  function xd() {}
  function Cr(e) {
    var t = e.type,
      n = e.vnode,
      r = e.proxy,
      s = e.withProxy,
      o = e.props,
      _e$propsOptions = _slicedToArray(e.propsOptions, 1),
      i = _e$propsOptions[0],
      a = e.slots,
      l = e.attrs,
      c = e.emit,
      u = e.render,
      d = e.renderCache,
      A = e.data,
      m = e.setupState,
      h = e.ctx,
      _ = e.inheritAttrs;
    var I, R;
    var U = vn(e);
    try {
      if (n.shapeFlag & 4) {
        var B = s || r;
        I = He(u.call(B, B, d, o, m, A, h)), R = l;
      } else {
        var _B = t;
        I = He(_B.length > 1 ? _B(o, {
          attrs: l,
          slots: a,
          emit: c
        }) : _B(o, null)), R = t.props ? l : fl(l);
      }
    } catch (B) {
      Zt.length = 0, _n(B, e, 1), I = tt(xt);
    }
    var L = I;
    if (R && _ !== !1) {
      var _B2 = Object.keys(R),
        _L = L,
        Z = _L.shapeFlag;
      _B2.length && Z & 7 && (i && _B2.some(sr) && (R = dl(R, i)), L = Pt(L, R));
    }
    return n.dirs && (L = Pt(L), L.dirs = L.dirs ? L.dirs.concat(n.dirs) : n.dirs), n.transition && (L.transition = n.transition), I = L, vn(U), I;
  }
  var fl = function fl(e) {
      var t;
      for (var n in e) (n === "class" || n === "style" || un(n)) && ((t || (t = {}))[n] = e[n]);
      return t;
    },
    dl = function dl(e, t) {
      var n = {};
      for (var r in e) (!sr(r) || !(r.slice(9) in t)) && (n[r] = e[r]);
      return n;
    };
  function gl(e, t, n) {
    var r = e.props,
      s = e.children,
      o = e.component,
      i = t.props,
      a = t.children,
      l = t.patchFlag,
      c = o.emitsOptions;
    if (t.dirs || t.transition) return !0;
    if (n && l >= 0) {
      if (l & 1024) return !0;
      if (l & 16) return r ? io(r, i, c) : !!i;
      if (l & 8) {
        var u = t.dynamicProps;
        for (var d = 0; d < u.length; d++) {
          var A = u[d];
          if (i[A] !== r[A] && !En(c, A)) return !0;
        }
      }
    } else return (s || a) && (!a || !a.$stable) ? !0 : r === i ? !1 : r ? i ? io(r, i, c) : !0 : !!i;
    return !1;
  }
  function io(e, t, n) {
    var r = Object.keys(t);
    if (r.length !== Object.keys(e).length) return !0;
    for (var s = 0; s < r.length; s++) {
      var o = r[s];
      if (t[o] !== e[o] && !En(n, o)) return !0;
    }
    return !1;
  }
  function ml(_ref4, n) {
    var e = _ref4.vnode,
      t = _ref4.parent;
    for (; t && t.subTree === e;) (e = t.vnode).el = n, t = t.parent;
  }
  var hl = function hl(e) {
    return e.__isSuspense;
  };
  function pl(e, t) {
    var _t$effects;
    t && t.pendingBranch ? V(e) ? (_t$effects = t.effects).push.apply(_t$effects, _toConsumableArray(e)) : t.effects.push(e) : al(e);
  }
  var Mn = {};
  function Jt(e, t, n) {
    return ao(e, t, n);
  }
  function ao(e, t) {
    var _ref5 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : ee,
      n = _ref5.immediate,
      r = _ref5.deep,
      s = _ref5.flush,
      o = _ref5.onTrack,
      i = _ref5.onTrigger;
    var a;
    var l = Ss() === ((a = ye) == null ? void 0 : a.scope) ? ye : null;
    var c,
      u = !1,
      d = !1;
    if (be(e) ? (c = function c() {
      return e.value;
    }, u = yn(e)) : Ot(e) ? (c = function c() {
      return e;
    }, r = !0) : V(e) ? (d = !0, u = e.some(function (B) {
      return Ot(B) || yn(B);
    }), c = function c() {
      return e.map(function (B) {
        if (be(B)) return B.value;
        if (Ot(B)) return ht(B);
        if (Q(B)) return at(B, l, 2);
      });
    }) : Q(e) ? t ? c = function c() {
      return at(e, l, 2);
    } : c = function c() {
      if (!(l && l.isUnmounted)) return A && A(), Re(e, l, 3, [m]);
    } : c = Pe, t && r) {
      var B = c;
      c = function c() {
        return ht(B());
      };
    }
    var A,
      m = function m(B) {
        A = U.onStop = function () {
          at(B, l, 4);
        };
      },
      h;
    if (en) if (m = Pe, t ? n && Re(t, l, 3, [c(), d ? [] : void 0, m]) : c(), s === "sync") {
      var _B3 = gc();
      h = _B3.__watcherHandles || (_B3.__watcherHandles = []);
    } else return Pe;
    var _ = d ? new Array(e.length).fill(Mn) : Mn;
    var I = function I() {
      if (U.active) if (t) {
        var _B4 = U.run();
        (r || u || (d ? _B4.some(function (Z, se) {
          return zt(Z, _[se]);
        }) : zt(_B4, _))) && (A && A(), Re(t, l, 3, [_B4, _ === Mn ? void 0 : d && _[0] === Mn ? [] : _, m]), _ = _B4);
      } else U.run();
    };
    I.allowRecurse = !!t;
    var R;
    s === "sync" ? R = I : s === "post" ? R = function R() {
      return ve(I, l && l.suspense);
    } : (I.pre = !0, l && (I.id = l.uid), R = function R() {
      return Tr(I);
    });
    var U = new pr(c, R);
    t ? n ? I() : _ = U.run() : s === "post" ? ve(U.run.bind(U), l && l.suspense) : U.run();
    var L = function L() {
      U.stop(), l && l.scope && or(l.scope.effects, U);
    };
    return h && h.push(L), L;
  }
  function Al(e, t, n) {
    var r = this.proxy,
      s = pe(e) ? e.includes(".") ? lo(r, e) : function () {
        return r[e];
      } : e.bind(r, r);
    var o;
    Q(t) ? o = t : (o = t.handler, n = t);
    var i = ye;
    Rt(this);
    var a = ao(s, o.bind(r), n);
    return i ? Rt(i) : bt(), a;
  }
  function lo(e, t) {
    var n = t.split(".");
    return function () {
      var r = e;
      for (var s = 0; s < n.length && r; s++) r = r[n[s]];
      return r;
    };
  }
  function ht(e, t) {
    if (!fe(e) || e.__v_skip || (t = t || new Set(), t.has(e))) return e;
    if (t.add(e), be(e)) ht(e.value, t);else if (V(e)) for (var n = 0; n < e.length; n++) ht(e[n], t);else if (ua(e) || Bt(e)) e.forEach(function (n) {
      ht(n, t);
    });else if (ga(e)) for (var _n3 in e) ht(e[_n3], t);
    return e;
  }
  function xl(e, t) {
    var n = ke;
    if (n === null) return e;
    var r = $n(n) || n.proxy,
      s = e.dirs || (e.dirs = []);
    for (var o = 0; o < t.length; o++) {
      var _t$o = _slicedToArray(t[o], 4),
        i = _t$o[0],
        a = _t$o[1],
        l = _t$o[2],
        _t$o$ = _t$o[3],
        c = _t$o$ === void 0 ? ee : _t$o$;
      i && (Q(i) && (i = {
        mounted: i,
        updated: i
      }), i.deep && ht(a), s.push({
        dir: i,
        instance: r,
        value: a,
        oldValue: void 0,
        arg: l,
        modifiers: c
      }));
    }
    return e;
  }
  function pt(e, t, n, r) {
    var s = e.dirs,
      o = t && t.dirs;
    for (var i = 0; i < s.length; i++) {
      var a = s[i];
      o && (a.oldValue = o[i].value);
      var l = a.dir[r];
      l && (Ct(), Re(l, n, 8, [e.el, a, e, t]), St());
    }
  }
  function bl(e, t) {
    return Q(e) ? function () {
      return he({
        name: e.name
      }, t, {
        setup: e
      });
    }() : e;
  }
  var Tn = function Tn(e) {
      return !!e.type.__asyncLoader;
    },
    co = function co(e) {
      return e.type.__isKeepAlive;
    };
  function wl(e, t) {
    uo(e, "a", t);
  }
  function yl(e, t) {
    uo(e, "da", t);
  }
  function uo(e, t) {
    var n = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : ye;
    var r = e.__wdc || (e.__wdc = function () {
      var s = n;
      for (; s;) {
        if (s.isDeactivated) return;
        s = s.parent;
      }
      return e();
    });
    if (Cn(t, r, n), n) {
      var s = n.parent;
      for (; s && s.parent;) co(s.parent.vnode) && _l(r, t, n, s), s = s.parent;
    }
  }
  function _l(e, t, n, r) {
    var s = Cn(t, e, r, !0);
    On(function () {
      or(r[t], s);
    }, n);
  }
  function Cn(e, t) {
    var n = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : ye;
    var r = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : !1;
    if (n) {
      var s = n[e] || (n[e] = []),
        o = t.__weh || (t.__weh = function () {
          if (n.isUnmounted) return;
          Ct(), Rt(n);
          for (var _len4 = arguments.length, i = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
            i[_key4] = arguments[_key4];
          }
          var a = Re(t, n, e, i);
          return bt(), St(), a;
        });
      return r ? s.unshift(o) : s.push(o), o;
    }
  }
  var et = function et(e) {
      return function (t) {
        var n = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : ye;
        return (!en || e === "sp") && Cn(e, function () {
          return t.apply(void 0, arguments);
        }, n);
      };
    },
    Sn = et("bm"),
    Sr = et("m"),
    El = et("bu"),
    vl = et("u"),
    Ml = et("bum"),
    On = et("um"),
    Tl = et("sp"),
    Cl = et("rtg"),
    Sl = et("rtc");
  function Ol(e) {
    var t = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : ye;
    Cn("ec", e, t);
  }
  var Il = Symbol.for("v-ndc"),
    Or = function Or(e) {
      return e ? jo(e) ? $n(e) || e.proxy : Or(e.parent) : null;
    },
    Yt = he(Object.create(null), {
      $: function $(e) {
        return e;
      },
      $el: function $el(e) {
        return e.vnode.el;
      },
      $data: function $data(e) {
        return e.data;
      },
      $props: function $props(e) {
        return e.props;
      },
      $attrs: function $attrs(e) {
        return e.attrs;
      },
      $slots: function $slots(e) {
        return e.slots;
      },
      $refs: function $refs(e) {
        return e.refs;
      },
      $parent: function $parent(e) {
        return Or(e.parent);
      },
      $root: function $root(e) {
        return Or(e.root);
      },
      $emit: function $emit(e) {
        return e.emit;
      },
      $options: function $options(e) {
        return Pr(e);
      },
      $forceUpdate: function $forceUpdate(e) {
        return e.f || (e.f = function () {
          return Tr(e.update);
        });
      },
      $nextTick: function $nextTick(e) {
        return e.n || (e.n = sl.bind(e.proxy));
      },
      $watch: function $watch(e) {
        return Al.bind(e);
      }
    }),
    Ir = function Ir(e, t) {
      return e !== ee && !e.__isScriptSetup && te(e, t);
    },
    Nl = {
      get: function get(_ref6, t) {
        var e = _ref6._;
        var n = e.ctx,
          r = e.setupState,
          s = e.data,
          o = e.props,
          i = e.accessCache,
          a = e.type,
          l = e.appContext;
        var c;
        if (t[0] !== "$") {
          var m = i[t];
          if (m !== void 0) switch (m) {
            case 1:
              return r[t];
            case 2:
              return s[t];
            case 4:
              return n[t];
            case 3:
              return o[t];
          } else {
            if (Ir(r, t)) return i[t] = 1, r[t];
            if (s !== ee && te(s, t)) return i[t] = 2, s[t];
            if ((c = e.propsOptions[0]) && te(c, t)) return i[t] = 3, o[t];
            if (n !== ee && te(n, t)) return i[t] = 4, n[t];
            Nr && (i[t] = 0);
          }
        }
        var u = Yt[t];
        var d, A;
        if (u) return t === "$attrs" && Ee(e, "get", t), u(e);
        if ((d = a.__cssModules) && (d = d[t])) return d;
        if (n !== ee && te(n, t)) return i[t] = 4, n[t];
        if (A = l.config.globalProperties, te(A, t)) return A[t];
      },
      set: function set(_ref7, t, n) {
        var e = _ref7._;
        var r = e.data,
          s = e.setupState,
          o = e.ctx;
        return Ir(s, t) ? (s[t] = n, !0) : r !== ee && te(r, t) ? (r[t] = n, !0) : te(e.props, t) || t[0] === "$" && t.slice(1) in e ? !1 : (o[t] = n, !0);
      },
      has: function has(_ref8, i) {
        var _ref8$_ = _ref8._,
          e = _ref8$_.data,
          t = _ref8$_.setupState,
          n = _ref8$_.accessCache,
          r = _ref8$_.ctx,
          s = _ref8$_.appContext,
          o = _ref8$_.propsOptions;
        var a;
        return !!n[i] || e !== ee && te(e, i) || Ir(t, i) || (a = o[0]) && te(a, i) || te(r, i) || te(Yt, i) || te(s.config.globalProperties, i);
      },
      defineProperty: function defineProperty(e, t, n) {
        return n.get != null ? e._.accessCache[t] = 0 : te(n, "value") && this.set(e, t, n.value, null), Reflect.defineProperty(e, t, n);
      }
    };
  function fo(e) {
    return V(e) ? e.reduce(function (t, n) {
      return t[n] = null, t;
    }, {}) : e;
  }
  var Nr = !0;
  function Pl(e) {
    var t = Pr(e),
      n = e.proxy,
      r = e.ctx;
    Nr = !1, t.beforeCreate && go(t.beforeCreate, e, "bc");
    var s = t.data,
      o = t.computed,
      i = t.methods,
      a = t.watch,
      l = t.provide,
      c = t.inject,
      u = t.created,
      d = t.beforeMount,
      A = t.mounted,
      m = t.beforeUpdate,
      h = t.updated,
      _ = t.activated,
      I = t.deactivated,
      R = t.beforeDestroy,
      U = t.beforeUnmount,
      L = t.destroyed,
      B = t.unmounted,
      Z = t.render,
      se = t.renderTracked,
      ae = t.renderTriggered,
      w = t.errorCaptured,
      b = t.serverPrefetch,
      v = t.expose,
      $ = t.inheritAttrs,
      Y = t.components,
      j = t.directives,
      S = t.filters;
    if (c && Dl(c, r, null), i) for (var x in i) {
      var P = i[x];
      Q(P) && (r[x] = P.bind(n));
    }
    if (s) {
      var _x2 = s.call(n, n);
      fe(_x2) && (e.data = yr(_x2));
    }
    if (Nr = !0, o) {
      var _loop = function _loop() {
        var P = o[_x3],
          z = Q(P) ? P.bind(n, n) : Q(P.get) ? P.get.bind(n, n) : Pe,
          W = !Q(P) && Q(P.set) ? P.set.bind(n) : Pe,
          X = wt({
            get: z,
            set: W
          });
        Object.defineProperty(r, _x3, {
          enumerable: !0,
          configurable: !0,
          get: function get() {
            return X.value;
          },
          set: function set(oe) {
            return X.value = oe;
          }
        });
      };
      for (var _x3 in o) {
        _loop();
      }
    }
    if (a) for (var _x4 in a) mo(a[_x4], r, n, _x4);
    if (l) {
      var _x5 = Q(l) ? l.call(n) : l;
      Reflect.ownKeys(_x5).forEach(function (P) {
        Fl(P, _x5[P]);
      });
    }
    u && go(u, e, "c");
    function C(x, P) {
      V(P) ? P.forEach(function (z) {
        return x(z.bind(n));
      }) : P && x(P.bind(n));
    }
    if (C(Sn, d), C(Sr, A), C(El, m), C(vl, h), C(wl, _), C(yl, I), C(Ol, w), C(Sl, se), C(Cl, ae), C(Ml, U), C(On, B), C(Tl, b), V(v)) if (v.length) {
      var _x6 = e.exposed || (e.exposed = {});
      v.forEach(function (P) {
        Object.defineProperty(_x6, P, {
          get: function get() {
            return n[P];
          },
          set: function set(z) {
            return n[P] = z;
          }
        });
      });
    } else e.exposed || (e.exposed = {});
    Z && e.render === Pe && (e.render = Z), $ != null && (e.inheritAttrs = $), Y && (e.components = Y), j && (e.directives = j);
  }
  function Dl(e, t) {
    var n = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : Pe;
    V(e) && (e = Dr(e));
    var _loop2 = function _loop2() {
      var s = e[r];
      var o;
      fe(s) ? "default" in s ? o = Pn(s.from || r, s.default, !0) : o = Pn(s.from || r) : o = Pn(s), be(o) ? Object.defineProperty(t, r, {
        enumerable: !0,
        configurable: !0,
        get: function get() {
          return o.value;
        },
        set: function set(i) {
          return o.value = i;
        }
      }) : t[r] = o;
    };
    for (var r in e) {
      _loop2();
    }
  }
  function go(e, t, n) {
    Re(V(e) ? e.map(function (r) {
      return r.bind(t.proxy);
    }) : e.bind(t.proxy), t, n);
  }
  function mo(e, t, n, r) {
    var s = r.includes(".") ? lo(n, r) : function () {
      return n[r];
    };
    if (pe(e)) {
      var o = t[e];
      Q(o) && Jt(s, o);
    } else if (Q(e)) Jt(s, e.bind(n));else if (fe(e)) if (V(e)) e.forEach(function (o) {
      return mo(o, t, n, r);
    });else {
      var _o3 = Q(e.handler) ? e.handler.bind(n) : t[e.handler];
      Q(_o3) && Jt(s, _o3, e);
    }
  }
  function Pr(e) {
    var t = e.type,
      n = t.mixins,
      r = t.extends,
      _e$appContext = e.appContext,
      s = _e$appContext.mixins,
      o = _e$appContext.optionsCache,
      i = _e$appContext.config.optionMergeStrategies,
      a = o.get(t);
    var l;
    return a ? l = a : !s.length && !n && !r ? l = t : (l = {}, s.length && s.forEach(function (c) {
      return In(l, c, i, !0);
    }), In(l, t, i)), fe(t) && o.set(t, l), l;
  }
  function In(e, t, n) {
    var r = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : !1;
    var s = t.mixins,
      o = t.extends;
    o && In(e, o, n, !0), s && s.forEach(function (i) {
      return In(e, i, n, !0);
    });
    for (var i in t) if (!(r && i === "expose")) {
      var a = Rl[i] || n && n[i];
      e[i] = a ? a(e[i], t[i]) : t[i];
    }
    return e;
  }
  var Rl = {
    data: ho,
    props: po,
    emits: po,
    methods: Vt,
    computed: Vt,
    beforeCreate: _e,
    created: _e,
    beforeMount: _e,
    mounted: _e,
    beforeUpdate: _e,
    updated: _e,
    beforeDestroy: _e,
    beforeUnmount: _e,
    destroyed: _e,
    unmounted: _e,
    activated: _e,
    deactivated: _e,
    errorCaptured: _e,
    serverPrefetch: _e,
    components: Vt,
    directives: Vt,
    watch: jl,
    provide: ho,
    inject: kl
  };
  function ho(e, t) {
    return t ? e ? function () {
      return he(Q(e) ? e.call(this, this) : e, Q(t) ? t.call(this, this) : t);
    } : t : e;
  }
  function kl(e, t) {
    return Vt(Dr(e), Dr(t));
  }
  function Dr(e) {
    if (V(e)) {
      var t = {};
      for (var n = 0; n < e.length; n++) t[e[n]] = e[n];
      return t;
    }
    return e;
  }
  function _e(e, t) {
    return e ? _toConsumableArray(new Set([].concat(e, t))) : t;
  }
  function Vt(e, t) {
    return e ? he(Object.create(null), e, t) : t;
  }
  function po(e, t) {
    return e ? V(e) && V(t) ? _toConsumableArray(new Set([].concat(_toConsumableArray(e), _toConsumableArray(t)))) : he(Object.create(null), fo(e), fo(t !== null && t !== void 0 ? t : {})) : t;
  }
  function jl(e, t) {
    if (!e) return t;
    if (!t) return e;
    var n = he(Object.create(null), e);
    for (var r in t) n[r] = _e(e[r], t[r]);
    return n;
  }
  function Ao() {
    return {
      app: null,
      config: {
        isNativeTag: aa,
        performance: !1,
        globalProperties: {},
        optionMergeStrategies: {},
        errorHandler: void 0,
        warnHandler: void 0,
        compilerOptions: {}
      },
      mixins: [],
      components: {},
      directives: {},
      provides: Object.create(null),
      optionsCache: new WeakMap(),
      propsCache: new WeakMap(),
      emitsCache: new WeakMap()
    };
  }
  var Ll = 0;
  function $l(e, t) {
    return function (r) {
      var s = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      Q(r) || (r = he({}, r)), s != null && !fe(s) && (s = null);
      var o = Ao(),
        i = new Set();
      var a = !1;
      var l = o.app = {
        _uid: Ll++,
        _component: r,
        _props: s,
        _container: null,
        _context: o,
        _instance: null,
        version: mc,
        get config() {
          return o.config;
        },
        set config(c) {},
        use: function use(c) {
          for (var _len5 = arguments.length, u = new Array(_len5 > 1 ? _len5 - 1 : 0), _key5 = 1; _key5 < _len5; _key5++) {
            u[_key5 - 1] = arguments[_key5];
          }
          return i.has(c) || (c && Q(c.install) ? (i.add(c), c.install.apply(c, [l].concat(u))) : Q(c) && (i.add(c), c.apply(void 0, [l].concat(u)))), l;
        },
        mixin: function mixin(c) {
          return o.mixins.includes(c) || o.mixins.push(c), l;
        },
        component: function component(c, u) {
          return u ? (o.components[c] = u, l) : o.components[c];
        },
        directive: function directive(c, u) {
          return u ? (o.directives[c] = u, l) : o.directives[c];
        },
        mount: function mount(c, u, d) {
          if (!a) {
            var A = tt(r, s);
            return A.appContext = o, u && t ? t(A, c) : e(A, c, d), a = !0, l._container = c, c.__vue_app__ = l, $n(A.component) || A.component.proxy;
          }
        },
        unmount: function unmount() {
          a && (e(null, l._container), delete l._container.__vue_app__);
        },
        provide: function provide(c, u) {
          return o.provides[c] = u, l;
        },
        runWithContext: function runWithContext(c) {
          Nn = l;
          try {
            return c();
          } finally {
            Nn = null;
          }
        }
      };
      return l;
    };
  }
  var Nn = null;
  function Fl(e, t) {
    if (ye) {
      var n = ye.provides;
      var r = ye.parent && ye.parent.provides;
      r === n && (n = ye.provides = Object.create(r)), n[e] = t;
    }
  }
  function Pn(e, t) {
    var n = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : !1;
    var r = ye || ke;
    if (r || Nn) {
      var s = r ? r.parent == null ? r.vnode.appContext && r.vnode.appContext.provides : r.parent.provides : Nn._context.provides;
      if (s && e in s) return s[e];
      if (arguments.length > 1) return n && Q(t) ? t.call(r && r.proxy) : t;
    }
  }
  function Ul(e, t, n) {
    var r = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : !1;
    var s = {},
      o = {};
    mn(o, jn, 1), e.propsDefaults = Object.create(null), xo(e, t, s, o);
    for (var i in e.propsOptions[0]) i in s || (s[i] = void 0);
    n ? e.props = r ? s : Za(s) : e.type.props ? e.props = s : e.props = o, e.attrs = o;
  }
  function Bl(e, t, n, r) {
    var s = e.props,
      o = e.attrs,
      i = e.vnode.patchFlag,
      a = re(s),
      _e$propsOptions2 = _slicedToArray(e.propsOptions, 1),
      l = _e$propsOptions2[0];
    var c = !1;
    if ((r || i > 0) && !(i & 16)) {
      if (i & 8) {
        var u = e.vnode.dynamicProps;
        for (var d = 0; d < u.length; d++) {
          var A = u[d];
          if (En(e.emitsOptions, A)) continue;
          var m = t[A];
          if (l) {
            if (te(o, A)) m !== o[A] && (o[A] = m, c = !0);else {
              var h = vt(A);
              s[h] = Rr(l, a, h, m, e, !1);
            }
          } else m !== o[A] && (o[A] = m, c = !0);
        }
      }
    } else {
      xo(e, t, s, o) && (c = !0);
      var _u2;
      for (var _d2 in a) (!t || !te(t, _d2) && ((_u2 = Mt(_d2)) === _d2 || !te(t, _u2))) && (l ? n && (n[_d2] !== void 0 || n[_u2] !== void 0) && (s[_d2] = Rr(l, a, _d2, void 0, e, !0)) : delete s[_d2]);
      if (o !== a) for (var _d3 in o) (!t || !te(t, _d3)) && (delete o[_d3], c = !0);
    }
    c && Xe(e, "set", "$attrs");
  }
  function xo(e, t, n, r) {
    var _e$propsOptions3 = _slicedToArray(e.propsOptions, 2),
      s = _e$propsOptions3[0],
      o = _e$propsOptions3[1];
    var i = !1,
      a;
    if (t) for (var l in t) {
      if (dn(l)) continue;
      var c = t[l];
      var u = void 0;
      s && te(s, u = vt(l)) ? !o || !o.includes(u) ? n[u] = c : (a || (a = {}))[u] = c : En(e.emitsOptions, l) || (!(l in r) || c !== r[l]) && (r[l] = c, i = !0);
    }
    if (o) {
      var _l3 = re(n),
        _c2 = a || ee;
      for (var _u3 = 0; _u3 < o.length; _u3++) {
        var d = o[_u3];
        n[d] = Rr(s, _l3, d, _c2[d], e, !te(_c2, d));
      }
    }
    return i;
  }
  function Rr(e, t, n, r, s, o) {
    var i = e[n];
    if (i != null) {
      var a = te(i, "default");
      if (a && r === void 0) {
        var l = i.default;
        if (i.type !== Function && !i.skipFactory && Q(l)) {
          var c = s.propsDefaults;
          n in c ? r = c[n] : (Rt(s), r = c[n] = l.call(null, t), bt());
        } else r = l;
      }
      i[0] && (o && !a ? r = !1 : i[1] && (r === "" || r === Mt(n)) && (r = !0));
    }
    return r;
  }
  function bo(e, t) {
    var n = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : !1;
    var r = t.propsCache,
      s = r.get(e);
    if (s) return s;
    var o = e.props,
      i = {},
      a = [];
    var l = !1;
    if (!Q(e)) {
      var u = function u(d) {
        l = !0;
        var _bo = bo(d, t, !0),
          _bo2 = _slicedToArray(_bo, 2),
          A = _bo2[0],
          m = _bo2[1];
        he(i, A), m && a.push.apply(a, _toConsumableArray(m));
      };
      !n && t.mixins.length && t.mixins.forEach(u), e.extends && u(e.extends), e.mixins && e.mixins.forEach(u);
    }
    if (!o && !l) return fe(e) && r.set(e, Oe), Oe;
    if (V(o)) for (var _u4 = 0; _u4 < o.length; _u4++) {
      var d = vt(o[_u4]);
      wo(d) && (i[d] = ee);
    } else if (o) for (var _u5 in o) {
      var _d4 = vt(_u5);
      if (wo(_d4)) {
        var A = o[_u5],
          m = i[_d4] = V(A) || Q(A) ? {
            type: A
          } : he({}, A);
        if (m) {
          var h = Eo(Boolean, m.type),
            _ = Eo(String, m.type);
          m[0] = h > -1, m[1] = _ < 0 || h < _, (h > -1 || te(m, "default")) && a.push(_d4);
        }
      }
    }
    var c = [i, a];
    return fe(e) && r.set(e, c), c;
  }
  function wo(e) {
    return e[0] !== "$";
  }
  function yo(e) {
    var t = e && e.toString().match(/^\s*(function|class) (\w+)/);
    return t ? t[2] : e === null ? "null" : "";
  }
  function _o(e, t) {
    return yo(e) === yo(t);
  }
  function Eo(e, t) {
    return V(t) ? t.findIndex(function (n) {
      return _o(n, e);
    }) : Q(t) && _o(t, e) ? 0 : -1;
  }
  var vo = function vo(e) {
      return e[0] === "_" || e === "$stable";
    },
    kr = function kr(e) {
      return V(e) ? e.map(He) : [He(e)];
    },
    zl = function zl(e, t, n) {
      if (t._n) return t;
      var r = ul(function () {
        return kr(t.apply(void 0, arguments));
      }, n);
      return r._c = !1, r;
    },
    Mo = function Mo(e, t, n) {
      var r = e._ctx;
      var _loop3 = function _loop3() {
        if (vo(s)) return "continue";
        var o = e[s];
        if (Q(o)) t[s] = zl(s, o, r);else if (o != null) {
          var i = kr(o);
          t[s] = function () {
            return i;
          };
        }
      };
      for (var s in e) {
        var _ret = _loop3();
        if (_ret === "continue") continue;
      }
    },
    To = function To(e, t) {
      var n = kr(t);
      e.slots.default = function () {
        return n;
      };
    },
    Hl = function Hl(e, t) {
      if (e.vnode.shapeFlag & 32) {
        var n = t._;
        n ? (e.slots = re(t), mn(t, "_", n)) : Mo(t, e.slots = {});
      } else e.slots = {}, t && To(e, t);
      mn(e.slots, jn, 1);
    },
    Wl = function Wl(e, t, n) {
      var r = e.vnode,
        s = e.slots;
      var o = !0,
        i = ee;
      if (r.shapeFlag & 32) {
        var a = t._;
        a ? n && a === 1 ? o = !1 : (he(s, t), !n && a === 1 && delete s._) : (o = !t.$stable, Mo(t, s)), i = t;
      } else t && (To(e, t), i = {
        default: 1
      });
      if (o) for (var _a2 in s) !vo(_a2) && !(_a2 in i) && delete s[_a2];
    };
  function jr(e, t, n, r) {
    var s = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : !1;
    if (V(e)) {
      e.forEach(function (A, m) {
        return jr(A, t && (V(t) ? t[m] : t), n, r, s);
      });
      return;
    }
    if (Tn(r) && !s) return;
    var o = r.shapeFlag & 4 ? $n(r.component) || r.component.proxy : r.el,
      i = s ? null : o,
      a = e.i,
      l = e.r,
      c = t && t.r,
      u = a.refs === ee ? a.refs = {} : a.refs,
      d = a.setupState;
    if (c != null && c !== l && (pe(c) ? (u[c] = null, te(d, c) && (d[c] = null)) : be(c) && (c.value = null)), Q(l)) at(l, a, 12, [i, u]);else {
      var A = pe(l),
        m = be(l);
      if (A || m) {
        var h = function h() {
          if (e.f) {
            var _ = A ? te(d, l) ? d[l] : u[l] : l.value;
            s ? V(_) && or(_, o) : V(_) ? _.includes(o) || _.push(o) : A ? (u[l] = [o], te(d, l) && (d[l] = u[l])) : (l.value = [o], e.k && (u[e.k] = l.value));
          } else A ? (u[l] = i, te(d, l) && (d[l] = i)) : m && (l.value = i, e.k && (u[e.k] = i));
        };
        i ? (h.id = -1, ve(h, n)) : h();
      }
    }
  }
  var ve = pl;
  function ql(e) {
    return Kl(e);
  }
  function Kl(e, t) {
    var _t2, _t3;
    var n = ur();
    n.__VUE__ = !0;
    var r = e.insert,
      s = e.remove,
      o = e.patchProp,
      i = e.createElement,
      a = e.createText,
      l = e.createComment,
      c = e.setText,
      u = e.setElementText,
      d = e.parentNode,
      A = e.nextSibling,
      _e$setScopeId = e.setScopeId,
      m = _e$setScopeId === void 0 ? Pe : _e$setScopeId,
      h = e.insertStaticContent,
      _ = function _(f, g, y) {
        var T = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
        var M = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
        var D = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : null;
        var F = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : !1;
        var N = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : null;
        var k = arguments.length > 8 && arguments[8] !== undefined ? arguments[8] : !!g.dynamicChildren;
        if (f === g) return;
        f && !Gt(f, g) && (T = Ye(f), oe(f, M, D, !0), f = null), g.patchFlag === -2 && (k = !1, g.dynamicChildren = null);
        var O = g.type,
          q = g.ref,
          H = g.shapeFlag;
        switch (O) {
          case Rn:
            I(f, g, y, T);
            break;
          case xt:
            R(f, g, y, T);
            break;
          case Fr:
            f == null && U(g, y, T, F);
            break;
          case Be:
            Y(f, g, y, T, M, D, F, N, k);
            break;
          default:
            H & 1 ? Z(f, g, y, T, M, D, F, N, k) : H & 6 ? j(f, g, y, T, M, D, F, N, k) : (H & 64 || H & 128) && O.process(f, g, y, T, M, D, F, N, k, ue);
        }
        q != null && M && jr(q, f && f.ref, D, g || f, !g);
      },
      I = function I(f, g, y, T) {
        if (f == null) r(g.el = a(g.children), y, T);else {
          var M = g.el = f.el;
          g.children !== f.children && c(M, g.children);
        }
      },
      R = function R(f, g, y, T) {
        f == null ? r(g.el = l(g.children || ""), y, T) : g.el = f.el;
      },
      U = function U(f, g, y, T) {
        var _h = h(f.children, g, y, T, f.el, f.anchor);
        var _h2 = _slicedToArray(_h, 2);
        f.el = _h2[0];
        f.anchor = _h2[1];
      },
      L = function L(_ref9, y, T) {
        var f = _ref9.el,
          g = _ref9.anchor;
        var M;
        for (; f && f !== g;) M = A(f), r(f, y, T), f = M;
        r(g, y, T);
      },
      B = function B(_ref10) {
        var f = _ref10.el,
          g = _ref10.anchor;
        var y;
        for (; f && f !== g;) y = A(f), s(f), f = y;
        s(g);
      },
      Z = function Z(f, g, y, T, M, D, F, N, k) {
        F = F || g.type === "svg", f == null ? se(g, y, T, M, D, F, N, k) : b(f, g, M, D, F, N, k);
      },
      se = function se(f, g, y, T, M, D, F, N) {
        var k, O;
        var q = f.type,
          H = f.props,
          K = f.shapeFlag,
          J = f.transition,
          G = f.dirs;
        if (k = f.el = i(f.type, D, H && H.is, H), K & 8 ? u(k, f.children) : K & 16 && w(f.children, k, null, T, M, D && q !== "foreignObject", F, N), G && pt(f, null, T, "created"), ae(k, f, f.scopeId, F, T), H) {
          for (var ie in H) ie !== "value" && !dn(ie) && o(k, ie, null, H[ie], D, f.children, T, M, xe);
          "value" in H && o(k, "value", null, H.value), (O = H.onVnodeBeforeMount) && We(O, T, f);
        }
        G && pt(f, null, T, "beforeMount");
        var le = (!M || M && !M.pendingBranch) && J && !J.persisted;
        le && J.beforeEnter(k), r(k, g, y), ((O = H && H.onVnodeMounted) || le || G) && ve(function () {
          O && We(O, T, f), le && J.enter(k), G && pt(f, null, T, "mounted");
        }, M);
      },
      ae = function ae(f, g, y, T, M) {
        if (y && m(f, y), T) for (var D = 0; D < T.length; D++) m(f, T[D]);
        if (M) {
          var _D = M.subTree;
          if (g === _D) {
            var F = M.vnode;
            ae(f, F, F.scopeId, F.slotScopeIds, M.parent);
          }
        }
      },
      w = function w(f, g, y, T, M, D, F, N) {
        var k = arguments.length > 8 && arguments[8] !== undefined ? arguments[8] : 0;
        for (var O = k; O < f.length; O++) {
          var q = f[O] = N ? lt(f[O]) : He(f[O]);
          _(null, q, g, y, T, M, D, F, N);
        }
      },
      b = function b(f, g, y, T, M, D, F) {
        var N = g.el = f.el;
        var k = g.patchFlag,
          O = g.dynamicChildren,
          q = g.dirs;
        k |= f.patchFlag & 16;
        var H = f.props || ee,
          K = g.props || ee;
        var J;
        y && At(y, !1), (J = K.onVnodeBeforeUpdate) && We(J, y, g, f), q && pt(g, f, y, "beforeUpdate"), y && At(y, !0);
        var G = M && g.type !== "foreignObject";
        if (O ? v(f.dynamicChildren, O, N, y, T, G, D) : F || P(f, g, N, null, y, T, G, D, !1), k > 0) {
          if (k & 16) $(N, g, H, K, y, T, M);else if (k & 2 && H.class !== K.class && o(N, "class", null, K.class, M), k & 4 && o(N, "style", H.style, K.style, M), k & 8) {
            var le = g.dynamicProps;
            for (var ie = 0; ie < le.length; ie++) {
              var de = le[ie],
                Fe = H[de],
                Ut = K[de];
              (Ut !== Fe || de === "value") && o(N, de, Fe, Ut, M, f.children, y, T, xe);
            }
          }
          k & 1 && f.children !== g.children && u(N, g.children);
        } else !F && O == null && $(N, g, H, K, y, T, M);
        ((J = K.onVnodeUpdated) || q) && ve(function () {
          J && We(J, y, g, f), q && pt(g, f, y, "updated");
        }, T);
      },
      v = function v(f, g, y, T, M, D, F) {
        for (var N = 0; N < g.length; N++) {
          var k = f[N],
            O = g[N],
            q = k.el && (k.type === Be || !Gt(k, O) || k.shapeFlag & 70) ? d(k.el) : y;
          _(k, O, q, null, T, M, D, F, !0);
        }
      },
      $ = function $(f, g, y, T, M, D, F) {
        if (y !== T) {
          if (y !== ee) for (var N in y) !dn(N) && !(N in T) && o(f, N, y[N], null, F, g.children, M, D, xe);
          for (var _N in T) {
            if (dn(_N)) continue;
            var k = T[_N],
              O = y[_N];
            k !== O && _N !== "value" && o(f, _N, O, k, F, g.children, M, D, xe);
          }
          "value" in T && o(f, "value", y.value, T.value);
        }
      },
      Y = function Y(f, g, y, T, M, D, F, N, k) {
        var O = g.el = f ? f.el : a(""),
          q = g.anchor = f ? f.anchor : a("");
        var H = g.patchFlag,
          K = g.dynamicChildren,
          J = g.slotScopeIds;
        J && (N = N ? N.concat(J) : J), f == null ? (r(O, y, T), r(q, y, T), w(g.children, y, q, M, D, F, N, k)) : H > 0 && H & 64 && K && f.dynamicChildren ? (v(f.dynamicChildren, K, y, M, D, F, N), (g.key != null || M && g === M.subTree) && Lr(f, g, !0)) : P(f, g, y, q, M, D, F, N, k);
      },
      j = function j(f, g, y, T, M, D, F, N, k) {
        g.slotScopeIds = N, f == null ? g.shapeFlag & 512 ? M.ctx.activate(g, y, T, F, k) : S(g, y, T, M, D, F, k) : p(f, g, k);
      },
      S = function S(f, g, y, T, M, D, F) {
        var N = f.component = ic(f, T, M);
        if (co(f) && (N.ctx.renderer = ue), ac(N), N.asyncDep) {
          if (M && M.registerDep(N, C), !f.el) {
            var k = N.subTree = tt(xt);
            R(null, k, g, y);
          }
          return;
        }
        C(N, f, g, y, M, D, F);
      },
      p = function p(f, g, y) {
        var T = g.component = f.component;
        if (gl(f, g, y)) {
          if (T.asyncDep && !T.asyncResolved) {
            x(T, g, y);
            return;
          } else T.next = g, il(T.update), T.update();
        } else g.el = f.el, T.vnode = g;
      },
      C = function C(f, g, y, T, M, D, F) {
        var N = function N() {
            if (f.isMounted) {
              var q = f.next,
                H = f.bu,
                K = f.u,
                J = f.parent,
                G = f.vnode,
                le = q,
                ie;
              At(f, !1), q ? (q.el = G.el, x(f, q, F)) : q = G, H && cr(H), (ie = q.props && q.props.onVnodeBeforeUpdate) && We(ie, J, q, G), At(f, !0);
              var de = Cr(f),
                Fe = f.subTree;
              f.subTree = de, _(Fe, de, d(Fe.el), Ye(Fe), f, M, D), q.el = de.el, le === null && ml(f, de.el), K && ve(K, M), (ie = q.props && q.props.onVnodeUpdated) && ve(function () {
                return We(ie, J, q, G);
              }, M);
            } else {
              var _q;
              var _g = g,
                _H = _g.el,
                _K = _g.props,
                _J = f.bm,
                _G = f.m,
                _le = f.parent,
                _ie = Tn(g);
              if (At(f, !1), _J && cr(_J), !_ie && (_q = _K && _K.onVnodeBeforeMount) && We(_q, _le, g), At(f, !0), _H && rt) {
                var _de = function _de() {
                  f.subTree = Cr(f), rt(_H, f.subTree, f, M, null);
                };
                _ie ? g.type.__asyncLoader().then(function () {
                  return !f.isUnmounted && _de();
                }) : _de();
              } else {
                var _de2 = f.subTree = Cr(f);
                _(null, _de2, y, T, f, M, D), g.el = _de2.el;
              }
              if (_G && ve(_G, M), !_ie && (_q = _K && _K.onVnodeMounted)) {
                var _de3 = g;
                ve(function () {
                  return We(_q, _le, _de3);
                }, M);
              }
              (g.shapeFlag & 256 || _le && Tn(_le.vnode) && _le.vnode.shapeFlag & 256) && f.a && ve(f.a, M), f.isMounted = !0, g = y = T = null;
            }
          },
          k = f.effect = new pr(N, function () {
            return Tr(O);
          }, f.scope),
          O = f.update = function () {
            return k.run();
          };
        O.id = f.uid, At(f, !0), O();
      },
      x = function x(f, g, y) {
        g.component = f;
        var T = f.vnode.props;
        f.vnode = g, f.next = null, Bl(f, g.props, T, y), Wl(f, g.children, y), Ct(), to(), St();
      },
      P = function P(f, g, y, T, M, D, F, N) {
        var k = arguments.length > 8 && arguments[8] !== undefined ? arguments[8] : !1;
        var O = f && f.children,
          q = f ? f.shapeFlag : 0,
          H = g.children,
          K = g.patchFlag,
          J = g.shapeFlag;
        if (K > 0) {
          if (K & 128) {
            W(O, H, y, T, M, D, F, N, k);
            return;
          } else if (K & 256) {
            z(O, H, y, T, M, D, F, N, k);
            return;
          }
        }
        J & 8 ? (q & 16 && xe(O, M, D), H !== O && u(y, H)) : q & 16 ? J & 16 ? W(O, H, y, T, M, D, F, N, k) : xe(O, M, D, !0) : (q & 8 && u(y, ""), J & 16 && w(H, y, T, M, D, F, N, k));
      },
      z = function z(f, g, y, T, M, D, F, N, k) {
        f = f || Oe, g = g || Oe;
        var O = f.length,
          q = g.length,
          H = Math.min(O, q);
        var K;
        for (K = 0; K < H; K++) {
          var J = g[K] = k ? lt(g[K]) : He(g[K]);
          _(f[K], J, y, null, M, D, F, N, k);
        }
        O > q ? xe(f, M, D, !0, !1, H) : w(g, y, T, M, D, F, N, k, H);
      },
      W = function W(f, g, y, T, M, D, F, N, k) {
        var O = 0;
        var q = g.length;
        var H = f.length - 1,
          K = q - 1;
        for (; O <= H && O <= K;) {
          var J = f[O],
            G = g[O] = k ? lt(g[O]) : He(g[O]);
          if (Gt(J, G)) _(J, G, y, null, M, D, F, N, k);else break;
          O++;
        }
        for (; O <= H && O <= K;) {
          var _J2 = f[H],
            _G2 = g[K] = k ? lt(g[K]) : He(g[K]);
          if (Gt(_J2, _G2)) _(_J2, _G2, y, null, M, D, F, N, k);else break;
          H--, K--;
        }
        if (O > H) {
          if (O <= K) {
            var _J3 = K + 1,
              _G3 = _J3 < q ? g[_J3].el : T;
            for (; O <= K;) _(null, g[O] = k ? lt(g[O]) : He(g[O]), y, _G3, M, D, F, N, k), O++;
          }
        } else if (O > K) for (; O <= H;) oe(f[O], M, D, !0), O++;else {
          var _J4 = O,
            _G4 = O,
            le = new Map();
          for (O = _G4; O <= K; O++) {
            var Se = g[O] = k ? lt(g[O]) : He(g[O]);
            Se.key != null && le.set(Se.key, O);
          }
          var ie,
            de = 0;
          var Fe = K - _G4 + 1;
          var Ut = !1,
            sa = 0;
          var cn = new Array(Fe);
          for (O = 0; O < Fe; O++) cn[O] = 0;
          for (O = _J4; O <= H; O++) {
            var _Se = f[O];
            if (de >= Fe) {
              oe(_Se, M, D, !0);
              continue;
            }
            var Qe = void 0;
            if (_Se.key != null) Qe = le.get(_Se.key);else for (ie = _G4; ie <= K; ie++) if (cn[ie - _G4] === 0 && Gt(_Se, g[ie])) {
              Qe = ie;
              break;
            }
            Qe === void 0 ? oe(_Se, M, D, !0) : (cn[Qe - _G4] = O + 1, Qe >= sa ? sa = Qe : Ut = !0, _(_Se, g[Qe], y, null, M, D, F, N, k), de++);
          }
          var oa = Ut ? Jl(cn) : Oe;
          for (ie = oa.length - 1, O = Fe - 1; O >= 0; O--) {
            var _Se2 = _G4 + O,
              _Qe = g[_Se2],
              ia = _Se2 + 1 < q ? g[_Se2 + 1].el : T;
            cn[O] === 0 ? _(null, _Qe, y, ia, M, D, F, N, k) : Ut && (ie < 0 || O !== oa[ie] ? X(_Qe, y, ia, 2) : ie--);
          }
        }
      },
      X = function X(f, g, y, T) {
        var M = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
        var D = f.el,
          F = f.type,
          N = f.transition,
          k = f.children,
          O = f.shapeFlag;
        if (O & 6) {
          X(f.component.subTree, g, y, T);
          return;
        }
        if (O & 128) {
          f.suspense.move(g, y, T);
          return;
        }
        if (O & 64) {
          F.move(f, g, y, ue);
          return;
        }
        if (F === Be) {
          r(D, g, y);
          for (var H = 0; H < k.length; H++) X(k[H], g, y, T);
          r(f.anchor, g, y);
          return;
        }
        if (F === Fr) {
          L(f, g, y);
          return;
        }
        if (T !== 2 && O & 1 && N) {
          if (T === 0) N.beforeEnter(D), r(D, g, y), ve(function () {
            return N.enter(D);
          }, M);else {
            var _H2 = N.leave,
              K = N.delayLeave,
              J = N.afterLeave,
              G = function G() {
                return r(D, g, y);
              },
              le = function le() {
                _H2(D, function () {
                  G(), J && J();
                });
              };
            K ? K(D, G, le) : le();
          }
        } else r(D, g, y);
      },
      oe = function oe(f, g, y) {
        var T = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : !1;
        var M = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : !1;
        var D = f.type,
          F = f.props,
          N = f.ref,
          k = f.children,
          O = f.dynamicChildren,
          q = f.shapeFlag,
          H = f.patchFlag,
          K = f.dirs;
        if (N != null && jr(N, null, y, f, !0), q & 256) {
          g.ctx.deactivate(f);
          return;
        }
        var J = q & 1 && K,
          G = !Tn(f);
        var le;
        if (G && (le = F && F.onVnodeBeforeUnmount) && We(le, g, f), q & 6) dt(f.component, y, T);else {
          if (q & 128) {
            f.suspense.unmount(y, T);
            return;
          }
          J && pt(f, null, g, "beforeUnmount"), q & 64 ? f.type.remove(f, g, y, M, ue, T) : O && (D !== Be || H > 0 && H & 64) ? xe(O, g, y, !1, !0) : (D === Be && H & 384 || !M && q & 16) && xe(k, g, y), T && me(f);
        }
        (G && (le = F && F.onVnodeUnmounted) || J) && ve(function () {
          le && We(le, g, f), J && pt(f, null, g, "unmounted");
        }, y);
      },
      me = function me(f) {
        var g = f.type,
          y = f.el,
          T = f.anchor,
          M = f.transition;
        if (g === Be) {
          Me(y, T);
          return;
        }
        if (g === Fr) {
          B(f);
          return;
        }
        var D = function D() {
          s(y), M && !M.persisted && M.afterLeave && M.afterLeave();
        };
        if (f.shapeFlag & 1 && M && !M.persisted) {
          var F = M.leave,
            N = M.delayLeave,
            k = function k() {
              return F(y, D);
            };
          N ? N(f.el, D, k) : k();
        } else D();
      },
      Me = function Me(f, g) {
        var y;
        for (; f !== g;) y = A(f), s(f), f = y;
        s(g);
      },
      dt = function dt(f, g, y) {
        var T = f.bum,
          M = f.scope,
          D = f.update,
          F = f.subTree,
          N = f.um;
        T && cr(T), M.stop(), D && (D.active = !1, oe(F, f, g, y)), N && ve(N, g), ve(function () {
          f.isUnmounted = !0;
        }, g), g && g.pendingBranch && !g.isUnmounted && f.asyncDep && !f.asyncResolved && f.suspenseId === g.pendingId && (g.deps--, g.deps === 0 && g.resolve());
      },
      xe = function xe(f, g, y) {
        var T = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : !1;
        var M = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : !1;
        var D = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 0;
        for (var F = D; F < f.length; F++) oe(f[F], g, y, T, M);
      },
      Ye = function Ye(f) {
        return f.shapeFlag & 6 ? Ye(f.component.subTree) : f.shapeFlag & 128 ? f.suspense.next() : A(f.anchor || f.el);
      },
      Ve = function Ve(f, g, y) {
        f == null ? g._vnode && oe(g._vnode, null, null, !0) : _(g._vnode || null, f, g, null, null, null, y), to(), no(), g._vnode = f;
      },
      ue = {
        p: _,
        um: oe,
        m: X,
        r: me,
        mt: S,
        mc: w,
        pc: P,
        pbc: v,
        n: Ye,
        o: e
      };
    var Ne, rt;
    return t && (_t2 = t(ue), _t3 = _slicedToArray(_t2, 2), Ne = _t3[0], rt = _t3[1], _t2), {
      render: Ve,
      hydrate: Ne,
      createApp: $l(Ve, Ne)
    };
  }
  function At(_ref11, n) {
    var e = _ref11.effect,
      t = _ref11.update;
    e.allowRecurse = t.allowRecurse = n;
  }
  function Lr(e, t) {
    var n = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : !1;
    var r = e.children,
      s = t.children;
    if (V(r) && V(s)) for (var o = 0; o < r.length; o++) {
      var i = r[o];
      var a = s[o];
      a.shapeFlag & 1 && !a.dynamicChildren && ((a.patchFlag <= 0 || a.patchFlag === 32) && (a = s[o] = lt(s[o]), a.el = i.el), n || Lr(i, a)), a.type === Rn && (a.el = i.el);
    }
  }
  function Jl(e) {
    var t = e.slice(),
      n = [0];
    var r, s, o, i, a;
    var l = e.length;
    for (r = 0; r < l; r++) {
      var c = e[r];
      if (c !== 0) {
        if (s = n[n.length - 1], e[s] < c) {
          t[r] = s, n.push(r);
          continue;
        }
        for (o = 0, i = n.length - 1; o < i;) a = o + i >> 1, e[n[a]] < c ? o = a + 1 : i = a;
        c < e[n[o]] && (o > 0 && (t[r] = n[o - 1]), n[o] = r);
      }
    }
    for (o = n.length, i = n[o - 1]; o-- > 0;) n[o] = i, i = t[i];
    return n;
  }
  var Yl = function Yl(e) {
      return e.__isTeleport;
    },
    Qt = function Qt(e) {
      return e && (e.disabled || e.disabled === "");
    },
    Co = function Co(e) {
      return (typeof SVGElement === "undefined" ? "undefined" : _typeof(SVGElement)) < "u" && e instanceof SVGElement;
    },
    $r = function $r(e, t) {
      var n = e && e.to;
      return pe(n) ? t ? t(n) : null : n;
    },
    Vl = {
      __isTeleport: !0,
      process: function process(e, t, n, r, s, o, i, a, l, c) {
        var u = c.mc,
          d = c.pc,
          A = c.pbc,
          _c$o = c.o,
          m = _c$o.insert,
          h = _c$o.querySelector,
          _ = _c$o.createText,
          I = _c$o.createComment,
          R = Qt(t.props);
        var U = t.shapeFlag,
          L = t.children,
          B = t.dynamicChildren;
        if (e == null) {
          var Z = t.el = _(""),
            se = t.anchor = _("");
          m(Z, n, r), m(se, n, r);
          var ae = t.target = $r(t.props, h),
            w = t.targetAnchor = _("");
          ae && (m(w, ae), i = i || Co(ae));
          var b = function b(v, $) {
            U & 16 && u(L, v, $, s, o, i, a, l);
          };
          R ? b(n, se) : ae && b(ae, w);
        } else {
          t.el = e.el;
          var _Z = t.anchor = e.anchor,
            _se = t.target = e.target,
            _ae = t.targetAnchor = e.targetAnchor,
            _w = Qt(e.props),
            _b = _w ? n : _se,
            v = _w ? _Z : _ae;
          if (i = i || Co(_se), B ? (A(e.dynamicChildren, B, _b, s, o, i, a), Lr(e, t, !0)) : l || d(e, t, _b, v, s, o, i, a, !1), R) _w || Dn(t, n, _Z, c, 1);else if ((t.props && t.props.to) !== (e.props && e.props.to)) {
            var $ = t.target = $r(t.props, h);
            $ && Dn(t, $, null, c, 0);
          } else _w && Dn(t, _se, _ae, c, 1);
        }
        So(t);
      },
      remove: function remove(e, t, n, r, _ref12, i) {
        var s = _ref12.um,
          o = _ref12.o.remove;
        var a = e.shapeFlag,
          l = e.children,
          c = e.anchor,
          u = e.targetAnchor,
          d = e.target,
          A = e.props;
        if (d && o(u), (i || !Qt(A)) && (o(c), a & 16)) for (var m = 0; m < l.length; m++) {
          var h = l[m];
          s(h, t, n, !0, !!h.dynamicChildren);
        }
      },
      move: Dn,
      hydrate: Ql
    };
  function Dn(e, t, n, _ref13) {
    var r = _ref13.o.insert,
      s = _ref13.m;
    var o = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 2;
    o === 0 && r(e.targetAnchor, t, n);
    var i = e.el,
      a = e.anchor,
      l = e.shapeFlag,
      c = e.children,
      u = e.props,
      d = o === 2;
    if (d && r(i, t, n), (!d || Qt(u)) && l & 16) for (var A = 0; A < c.length; A++) s(c[A], t, n, 2);
    d && r(a, t, n);
  }
  function Ql(e, t, n, r, s, o, _ref14, c) {
    var _ref14$o = _ref14.o,
      i = _ref14$o.nextSibling,
      a = _ref14$o.parentNode,
      l = _ref14$o.querySelector;
    var u = t.target = $r(t.props, l);
    if (u) {
      var d = u._lpa || u.firstChild;
      if (t.shapeFlag & 16) if (Qt(t.props)) t.anchor = c(i(e), t, a(e), n, r, s, o), t.targetAnchor = d;else {
        t.anchor = i(e);
        var A = d;
        for (; A;) if (A = i(A), A && A.nodeType === 8 && A.data === "teleport anchor") {
          t.targetAnchor = A, u._lpa = t.targetAnchor && i(t.targetAnchor);
          break;
        }
        c(d, t, u, n, r, s, o);
      }
      So(t);
    }
    return t.anchor && i(t.anchor);
  }
  var Zl = Vl;
  function So(e) {
    var t = e.ctx;
    if (t && t.ut) {
      var n = e.children[0].el;
      for (; n !== e.targetAnchor;) n.nodeType === 1 && n.setAttribute("data-v-owner", t.uid), n = n.nextSibling;
      t.ut();
    }
  }
  var Be = Symbol.for("v-fgt"),
    Rn = Symbol.for("v-txt"),
    xt = Symbol.for("v-cmt"),
    Fr = Symbol.for("v-stc"),
    Zt = [];
  var je = null;
  function kn() {
    var e = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : !1;
    Zt.push(je = e ? null : []);
  }
  function Xl() {
    Zt.pop(), je = Zt[Zt.length - 1] || null;
  }
  var Xt = 1;
  function Oo(e) {
    Xt += e;
  }
  function Io(e) {
    return e.dynamicChildren = Xt > 0 ? je || Oe : null, Xl(), Xt > 0 && je && je.push(e), e;
  }
  function No(e, t, n, r, s, o) {
    return Io(ze(e, t, n, r, s, o, !0));
  }
  function Po(e, t, n, r, s) {
    return Io(tt(e, t, n, r, s, !0));
  }
  function Gl(e) {
    return e ? e.__v_isVNode === !0 : !1;
  }
  function Gt(e, t) {
    return e.type === t.type && e.key === t.key;
  }
  var jn = "__vInternal",
    Do = function Do(_ref15) {
      var e = _ref15.key;
      return e !== null && e !== void 0 ? e : null;
    },
    Ln = function Ln(_ref16) {
      var e = _ref16.ref,
        t = _ref16.ref_key,
        n = _ref16.ref_for;
      return typeof e == "number" && (e = "" + e), e != null ? pe(e) || be(e) || Q(e) ? {
        i: ke,
        r: e,
        k: t,
        f: !!n
      } : e : null;
    };
  function ze(e) {
    var t = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    var n = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    var r = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
    var s = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
    var o = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : e === Be ? 0 : 1;
    var i = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : !1;
    var a = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : !1;
    var l = {
      __v_isVNode: !0,
      __v_skip: !0,
      type: e,
      props: t,
      key: t && Do(t),
      ref: t && Ln(t),
      scopeId: oo,
      slotScopeIds: null,
      children: n,
      component: null,
      suspense: null,
      ssContent: null,
      ssFallback: null,
      dirs: null,
      transition: null,
      el: null,
      anchor: null,
      target: null,
      targetAnchor: null,
      staticCount: 0,
      shapeFlag: o,
      patchFlag: r,
      dynamicProps: s,
      dynamicChildren: null,
      appContext: null,
      ctx: ke
    };
    return a ? (Ur(l, n), o & 128 && e.normalize(l)) : n && (l.shapeFlag |= pe(n) ? 8 : 16), Xt > 0 && !i && je && (l.patchFlag > 0 || o & 6) && l.patchFlag !== 32 && je.push(l), l;
  }
  var tt = ec;
  function ec(e) {
    var t = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    var n = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    var r = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
    var s = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
    var o = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : !1;
    if ((!e || e === Il) && (e = xt), Gl(e)) {
      var a = Pt(e, t, !0);
      return n && Ur(a, n), Xt > 0 && !o && je && (a.shapeFlag & 6 ? je[je.indexOf(e)] = a : je.push(a)), a.patchFlag |= -2, a;
    }
    if (fc(e) && (e = e.__vccOpts), t) {
      t = tc(t);
      var _t4 = t,
        _a3 = _t4.class,
        l = _t4.style;
      _a3 && !pe(_a3) && (t.class = fr(_a3)), fe(l) && (Js(l) && !V(l) && (l = he({}, l)), t.style = Tt(l));
    }
    var i = pe(e) ? 1 : hl(e) ? 128 : Yl(e) ? 64 : fe(e) ? 4 : Q(e) ? 2 : 0;
    return ze(e, t, n, r, s, i, o, !0);
  }
  function tc(e) {
    return e ? Js(e) || jn in e ? he({}, e) : e : null;
  }
  function Pt(e, t) {
    var n = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : !1;
    var r = e.props,
      s = e.ref,
      o = e.patchFlag,
      i = e.children,
      a = t ? rc(r || {}, t) : r;
    return {
      __v_isVNode: !0,
      __v_skip: !0,
      type: e.type,
      props: a,
      key: a && Do(a),
      ref: t && t.ref ? n && s ? V(s) ? s.concat(Ln(t)) : [s, Ln(t)] : Ln(t) : s,
      scopeId: e.scopeId,
      slotScopeIds: e.slotScopeIds,
      children: i,
      target: e.target,
      targetAnchor: e.targetAnchor,
      staticCount: e.staticCount,
      shapeFlag: e.shapeFlag,
      patchFlag: t && e.type !== Be ? o === -1 ? 16 : o | 16 : o,
      dynamicProps: e.dynamicProps,
      dynamicChildren: e.dynamicChildren,
      appContext: e.appContext,
      dirs: e.dirs,
      transition: e.transition,
      component: e.component,
      suspense: e.suspense,
      ssContent: e.ssContent && Pt(e.ssContent),
      ssFallback: e.ssFallback && Pt(e.ssFallback),
      el: e.el,
      anchor: e.anchor,
      ctx: e.ctx,
      ce: e.ce
    };
  }
  function Ro() {
    var e = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : " ";
    var t = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    return tt(Rn, null, e, t);
  }
  function nc() {
    var e = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
    var t = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : !1;
    return t ? (kn(), Po(xt, null, e)) : tt(xt, null, e);
  }
  function He(e) {
    return e == null || typeof e == "boolean" ? tt(xt) : V(e) ? tt(Be, null, e.slice()) : _typeof(e) == "object" ? lt(e) : tt(Rn, null, String(e));
  }
  function lt(e) {
    return e.el === null && e.patchFlag !== -1 || e.memo ? e : Pt(e);
  }
  function Ur(e, t) {
    var n = 0;
    var r = e.shapeFlag;
    if (t == null) t = null;else if (V(t)) n = 16;else if (_typeof(t) == "object") {
      if (r & 65) {
        var s = t.default;
        s && (s._c && (s._d = !1), Ur(e, s()), s._c && (s._d = !0));
        return;
      } else {
        n = 32;
        var _s2 = t._;
        !_s2 && !(jn in t) ? t._ctx = ke : _s2 === 3 && ke && (ke.slots._ === 1 ? t._ = 1 : (t._ = 2, e.patchFlag |= 1024));
      }
    } else Q(t) ? (t = {
      default: t,
      _ctx: ke
    }, n = 32) : (t = String(t), r & 64 ? (n = 16, t = [Ro(t)]) : n = 8);
    e.children = t, e.shapeFlag |= n;
  }
  function rc() {
    var t = {};
    for (var n = 0; n < arguments.length; n++) {
      var r = n < 0 || arguments.length <= n ? undefined : arguments[n];
      for (var s in r) if (s === "class") t.class !== r.class && (t.class = fr([t.class, r.class]));else if (s === "style") t.style = Tt([t.style, r.style]);else if (un(s)) {
        var o = t[s],
          i = r[s];
        i && o !== i && !(V(o) && o.includes(i)) && (t[s] = o ? [].concat(o, i) : i);
      } else s !== "" && (t[s] = r[s]);
    }
    return t;
  }
  function We(e, t, n) {
    var r = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
    Re(e, t, 7, [n, r]);
  }
  var sc = Ao();
  var oc = 0;
  function ic(e, t, n) {
    var r = e.type,
      s = (t ? t.appContext : e.appContext) || sc,
      o = {
        uid: oc++,
        vnode: e,
        type: r,
        parent: t,
        appContext: s,
        root: null,
        next: null,
        subTree: null,
        effect: null,
        update: null,
        scope: new _a(!0),
        render: null,
        proxy: null,
        exposed: null,
        exposeProxy: null,
        withProxy: null,
        provides: t ? t.provides : Object.create(s.provides),
        accessCache: null,
        renderCache: [],
        components: null,
        directives: null,
        propsOptions: bo(r, s),
        emitsOptions: so(r, s),
        emit: null,
        emitted: null,
        propsDefaults: ee,
        inheritAttrs: r.inheritAttrs,
        ctx: ee,
        data: ee,
        props: ee,
        attrs: ee,
        slots: ee,
        refs: ee,
        setupState: ee,
        setupContext: null,
        attrsProxy: null,
        slotsProxy: null,
        suspense: n,
        suspenseId: n ? n.pendingId : 0,
        asyncDep: null,
        asyncResolved: !1,
        isMounted: !1,
        isUnmounted: !1,
        isDeactivated: !1,
        bc: null,
        c: null,
        bm: null,
        m: null,
        bu: null,
        u: null,
        um: null,
        bum: null,
        da: null,
        a: null,
        rtg: null,
        rtc: null,
        ec: null,
        sp: null
      };
    return o.ctx = {
      _: o
    }, o.root = t ? t.root : o, o.emit = cl.bind(null, o), e.ce && e.ce(o), o;
  }
  var ye = null,
    Br,
    Dt,
    ko = "__VUE_INSTANCE_SETTERS__";
  (Dt = ur()[ko]) || (Dt = ur()[ko] = []), Dt.push(function (e) {
    return ye = e;
  }), Br = function Br(e) {
    Dt.length > 1 ? Dt.forEach(function (t) {
      return t(e);
    }) : Dt[0](e);
  };
  var Rt = function Rt(e) {
      Br(e), e.scope.on();
    },
    bt = function bt() {
      ye && ye.scope.off(), Br(null);
    };
  function jo(e) {
    return e.vnode.shapeFlag & 4;
  }
  var en = !1;
  function ac(e) {
    var t = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : !1;
    en = t;
    var _e$vnode = e.vnode,
      n = _e$vnode.props,
      r = _e$vnode.children,
      s = jo(e);
    Ul(e, n, s, t), Hl(e, r);
    var o = s ? lc(e, t) : void 0;
    return en = !1, o;
  }
  function lc(e, t) {
    var n = e.type;
    e.accessCache = Object.create(null), e.proxy = Ys(new Proxy(e.ctx, Nl));
    var r = n.setup;
    if (r) {
      var s = e.setupContext = r.length > 1 ? uc(e) : null;
      Rt(e), Ct();
      var o = at(r, e, 0, [e.props, s]);
      if (St(), bt(), vs(o)) {
        if (o.then(bt, bt), t) return o.then(function (i) {
          Lo(e, i, t);
        }).catch(function (i) {
          _n(i, e, 0);
        });
        e.asyncDep = o;
      } else Lo(e, o, t);
    } else Fo(e, t);
  }
  function Lo(e, t, n) {
    Q(t) ? e.type.__ssrInlineRender ? e.ssrRender = t : e.render = t : fe(t) && (e.setupState = Xs(t)), Fo(e, n);
  }
  var $o;
  function Fo(e, t, n) {
    var r = e.type;
    if (!e.render) {
      if (!t && $o && !r.render) {
        var s = r.template || Pr(e).template;
        if (s) {
          var _e$appContext$config = e.appContext.config,
            o = _e$appContext$config.isCustomElement,
            i = _e$appContext$config.compilerOptions,
            a = r.delimiters,
            l = r.compilerOptions,
            c = he(he({
              isCustomElement: o,
              delimiters: a
            }, i), l);
          r.render = $o(s, c);
        }
      }
      e.render = r.render || Pe;
    }
    Rt(e), Ct(), Pl(e), St(), bt();
  }
  function cc(e) {
    return e.attrsProxy || (e.attrsProxy = new Proxy(e.attrs, {
      get: function get(t, n) {
        return Ee(e, "get", "$attrs"), t[n];
      }
    }));
  }
  function uc(e) {
    var t = function t(n) {
      e.exposed = n || {};
    };
    return {
      get attrs() {
        return cc(e);
      },
      slots: e.slots,
      emit: e.emit,
      expose: t
    };
  }
  function $n(e) {
    if (e.exposed) return e.exposeProxy || (e.exposeProxy = new Proxy(Xs(Ys(e.exposed)), {
      get: function get(t, n) {
        if (n in t) return t[n];
        if (n in Yt) return Yt[n](e);
      },
      has: function has(t, n) {
        return n in t || n in Yt;
      }
    }));
  }
  function fc(e) {
    return Q(e) && "__vccOpts" in e;
  }
  var wt = function wt(e, t) {
      return nl(e, t, en);
    },
    dc = Symbol.for("v-scx"),
    gc = function gc() {
      return Pn(dc);
    },
    mc = "3.3.4",
    hc = "http://www.w3.org/2000/svg",
    yt = (typeof document === "undefined" ? "undefined" : _typeof(document)) < "u" ? document : null,
    Uo = yt && yt.createElement("template"),
    pc = {
      insert: function insert(e, t, n) {
        t.insertBefore(e, n || null);
      },
      remove: function remove(e) {
        var t = e.parentNode;
        t && t.removeChild(e);
      },
      createElement: function createElement(e, t, n, r) {
        var s = t ? yt.createElementNS(hc, e) : yt.createElement(e, n ? {
          is: n
        } : void 0);
        return e === "select" && r && r.multiple != null && s.setAttribute("multiple", r.multiple), s;
      },
      createText: function createText(e) {
        return yt.createTextNode(e);
      },
      createComment: function createComment(e) {
        return yt.createComment(e);
      },
      setText: function setText(e, t) {
        e.nodeValue = t;
      },
      setElementText: function setElementText(e, t) {
        e.textContent = t;
      },
      parentNode: function parentNode(e) {
        return e.parentNode;
      },
      nextSibling: function nextSibling(e) {
        return e.nextSibling;
      },
      querySelector: function querySelector(e) {
        return yt.querySelector(e);
      },
      setScopeId: function setScopeId(e, t) {
        e.setAttribute(t, "");
      },
      insertStaticContent: function insertStaticContent(e, t, n, r, s, o) {
        var i = n ? n.previousSibling : t.lastChild;
        if (s && (s === o || s.nextSibling)) for (; t.insertBefore(s.cloneNode(!0), n), !(s === o || !(s = s.nextSibling)););else {
          Uo.innerHTML = r ? "<svg>".concat(e, "</svg>") : e;
          var a = Uo.content;
          if (r) {
            var l = a.firstChild;
            for (; l.firstChild;) a.appendChild(l.firstChild);
            a.removeChild(l);
          }
          t.insertBefore(a, n);
        }
        return [i ? i.nextSibling : t.firstChild, n ? n.previousSibling : t.lastChild];
      }
    };
  function Ac(e, t, n) {
    var r = e._vtc;
    r && (t = (t ? [t].concat(_toConsumableArray(r)) : _toConsumableArray(r)).join(" ")), t == null ? e.removeAttribute("class") : n ? e.setAttribute("class", t) : e.className = t;
  }
  function xc(e, t, n) {
    var r = e.style,
      s = pe(n);
    if (n && !s) {
      if (t && !pe(t)) for (var o in t) n[o] == null && zr(r, o, "");
      for (var _o4 in n) zr(r, _o4, n[_o4]);
    } else {
      var _o5 = r.display;
      s ? t !== n && (r.cssText = n) : t && e.removeAttribute("style"), "_vod" in e && (r.display = _o5);
    }
  }
  var Bo = /\s*!important$/;
  function zr(e, t, n) {
    if (V(n)) n.forEach(function (r) {
      return zr(e, t, r);
    });else if (n == null && (n = ""), t.startsWith("--")) e.setProperty(t, n);else {
      var r = bc(e, t);
      Bo.test(n) ? e.setProperty(Mt(r), n.replace(Bo, ""), "important") : e[r] = n;
    }
  }
  var zo = ["Webkit", "Moz", "ms"],
    Hr = {};
  function bc(e, t) {
    var n = Hr[t];
    if (n) return n;
    var r = vt(t);
    if (r !== "filter" && r in e) return Hr[t] = r;
    r = Ms(r);
    for (var s = 0; s < zo.length; s++) {
      var o = zo[s] + r;
      if (o in e) return Hr[t] = o;
    }
    return t;
  }
  var Ho = "http://www.w3.org/1999/xlink";
  function wc(e, t, n, r, s) {
    if (r && t.startsWith("xlink:")) n == null ? e.removeAttributeNS(Ho, t.slice(6, t.length)) : e.setAttributeNS(Ho, t, n);else {
      var o = ya(t);
      n == null || o && !Cs(n) ? e.removeAttribute(t) : e.setAttribute(t, o ? "" : n);
    }
  }
  function yc(e, t, n, r, s, o, i) {
    if (t === "innerHTML" || t === "textContent") {
      var _n4;
      r && i(r, s, o), e[t] = (_n4 = n) !== null && _n4 !== void 0 ? _n4 : "";
      return;
    }
    var a = e.tagName;
    if (t === "value" && a !== "PROGRESS" && !a.includes("-")) {
      var _n5;
      e._value = n;
      var c = a === "OPTION" ? e.getAttribute("value") : e.value,
        u = (_n5 = n) !== null && _n5 !== void 0 ? _n5 : "";
      c !== u && (e.value = u), n == null && e.removeAttribute(t);
      return;
    }
    var l = !1;
    if (n === "" || n == null) {
      var _c3 = _typeof(e[t]);
      _c3 === "boolean" ? n = Cs(n) : n == null && _c3 === "string" ? (n = "", l = !0) : _c3 === "number" && (n = 0, l = !0);
    }
    try {
      e[t] = n;
    } catch (_unused) {}
    l && e.removeAttribute(t);
  }
  function _c(e, t, n, r) {
    e.addEventListener(t, n, r);
  }
  function Ec(e, t, n, r) {
    e.removeEventListener(t, n, r);
  }
  function vc(e, t, n, r) {
    var s = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
    var o = e._vei || (e._vei = {}),
      i = o[t];
    if (r && i) i.value = r;else {
      var _Mc = Mc(t),
        _Mc2 = _slicedToArray(_Mc, 2),
        a = _Mc2[0],
        l = _Mc2[1];
      if (r) {
        var c = o[t] = Sc(r, s);
        _c(e, a, c, l);
      } else i && (Ec(e, a, i, l), o[t] = void 0);
    }
  }
  var Wo = /(?:Once|Passive|Capture)$/;
  function Mc(e) {
    var t;
    if (Wo.test(e)) {
      t = {};
      var r;
      for (; r = e.match(Wo);) e = e.slice(0, e.length - r[0].length), t[r[0].toLowerCase()] = !0;
    }
    return [e[2] === ":" ? e.slice(3) : Mt(e.slice(2)), t];
  }
  var Wr = 0;
  var Tc = Promise.resolve(),
    Cc = function Cc() {
      return Wr || (Tc.then(function () {
        return Wr = 0;
      }), Wr = Date.now());
    };
  function Sc(e, t) {
    var n = function n(r) {
      if (!r._vts) r._vts = Date.now();else if (r._vts <= n.attached) return;
      Re(Oc(r, n.value), t, 5, [r]);
    };
    return n.value = e, n.attached = Cc(), n;
  }
  function Oc(e, t) {
    if (V(t)) {
      var n = e.stopImmediatePropagation;
      return e.stopImmediatePropagation = function () {
        n.call(e), e._stopped = !0;
      }, t.map(function (r) {
        return function (s) {
          return !s._stopped && r && r(s);
        };
      });
    } else return t;
  }
  var qo = /^on[a-z]/,
    Ic = function Ic(e, t, n, r) {
      var s = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : !1;
      var o = arguments.length > 5 ? arguments[5] : undefined;
      var i = arguments.length > 6 ? arguments[6] : undefined;
      var a = arguments.length > 7 ? arguments[7] : undefined;
      var l = arguments.length > 8 ? arguments[8] : undefined;
      t === "class" ? Ac(e, r, s) : t === "style" ? xc(e, n, r) : un(t) ? sr(t) || vc(e, t, n, r, i) : (t[0] === "." ? (t = t.slice(1), !0) : t[0] === "^" ? (t = t.slice(1), !1) : Nc(e, t, r, s)) ? yc(e, t, r, o, i, a, l) : (t === "true-value" ? e._trueValue = r : t === "false-value" && (e._falseValue = r), wc(e, t, r, s));
    };
  function Nc(e, t, n, r) {
    return r ? !!(t === "innerHTML" || t === "textContent" || t in e && qo.test(t) && Q(n)) : t === "spellcheck" || t === "draggable" || t === "translate" || t === "form" || t === "list" && e.tagName === "INPUT" || t === "type" && e.tagName === "TEXTAREA" || qo.test(t) && pe(n) ? !1 : t in e;
  }
  var Pc = ["ctrl", "shift", "alt", "meta"],
    Dc = {
      stop: function stop(e) {
        return e.stopPropagation();
      },
      prevent: function prevent(e) {
        return e.preventDefault();
      },
      self: function self(e) {
        return e.target !== e.currentTarget;
      },
      ctrl: function ctrl(e) {
        return !e.ctrlKey;
      },
      shift: function shift(e) {
        return !e.shiftKey;
      },
      alt: function alt(e) {
        return !e.altKey;
      },
      meta: function meta(e) {
        return !e.metaKey;
      },
      left: function left(e) {
        return "button" in e && e.button !== 0;
      },
      middle: function middle(e) {
        return "button" in e && e.button !== 1;
      },
      right: function right(e) {
        return "button" in e && e.button !== 2;
      },
      exact: function exact(e, t) {
        return Pc.some(function (n) {
          return e["".concat(n, "Key")] && !t.includes(n);
        });
      }
    },
    Ko = function Ko(e, t) {
      return function (n) {
        for (var s = 0; s < t.length; s++) {
          var o = Dc[t[s]];
          if (o && o(n, t)) return;
        }
        for (var _len6 = arguments.length, r = new Array(_len6 > 1 ? _len6 - 1 : 0), _key6 = 1; _key6 < _len6; _key6++) {
          r[_key6 - 1] = arguments[_key6];
        }
        return e.apply(void 0, [n].concat(r));
      };
    },
    Rc = {
      beforeMount: function beforeMount(e, _ref17, _ref18) {
        var t = _ref17.value;
        var n = _ref18.transition;
        e._vod = e.style.display === "none" ? "" : e.style.display, n && t ? n.beforeEnter(e) : tn(e, t);
      },
      mounted: function mounted(e, _ref19, _ref20) {
        var t = _ref19.value;
        var n = _ref20.transition;
        n && t && n.enter(e);
      },
      updated: function updated(e, _ref21, _ref22) {
        var t = _ref21.value,
          n = _ref21.oldValue;
        var r = _ref22.transition;
        !t != !n && (r ? t ? (r.beforeEnter(e), tn(e, !0), r.enter(e)) : r.leave(e, function () {
          tn(e, !1);
        }) : tn(e, t));
      },
      beforeUnmount: function beforeUnmount(e, _ref23) {
        var t = _ref23.value;
        tn(e, t);
      }
    };
  function tn(e, t) {
    e.style.display = t ? e._vod : "none";
  }
  var kc = he({
    patchProp: Ic
  }, pc);
  var Jo;
  function jc() {
    return Jo || (Jo = ql(kc));
  }
  var Lc = function Lc() {
    var _jc;
    var t = (_jc = jc()).createApp.apply(_jc, arguments),
      n = t.mount;
    return t.mount = function (r) {
      var s = $c(r);
      if (!s) return;
      var o = t._component;
      !Q(o) && !o.render && !o.template && (o.template = s.innerHTML), s.innerHTML = "";
      var i = n(s, !1, s instanceof SVGElement);
      return s instanceof Element && (s.removeAttribute("v-cloak"), s.setAttribute("data-v-app", "")), i;
    }, t;
  };
  function $c(e) {
    return pe(e) ? document.querySelector(e) : e;
  }
  var Fc = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0xMC4zODIgMC43MzM3MzRDMTAuNjA2OCAwLjIyOTI4OSAxMS4xOTggMC4wMDI2MjM2OCAxMS43MDI0IDAuMjI3NDY0QzEyLjIwNjkgMC40NTIzMDQgMTIuNDMzNiAxLjA0MzUxIDEyLjIwODcgMS41NDc5NUw5LjA5MjYgOC41MzkxN0w5Ljg0MTE3IDEwLjIxODZDMTAuNDgzIDkuNDcyNTIgMTEuNDM0MSA5LjAwMDA0IDEyLjQ5NTUgOS4wMDAwNEMxNC40Mjg1IDkuMDAwMDQgMTUuOTk1NSAxMC41NjcgMTUuOTk1NSAxMi41QzE1Ljk5NTUgMTQuNDMzIDE0LjQyODUgMTYgMTIuNDk1NSAxNkMxMS4wMDA1IDE2IDkuNzI0MzcgMTUuMDYyNyA5LjIyMjg3IDEzLjc0MzVMOS4yMTM3OCAxMy43MjM3TDcuOTk3NzcgMTAuOTk1NUw2Ljc4MTc2IDEzLjcyMzdMNi43NzI2NiAxMy43NDM1QzYuMjcxMTcgMTUuMDYyNyA0Ljk5NTA1IDE2IDMuNSAxNkMxLjU2NyAxNiAwIDE0LjQzMyAwIDEyLjVDMCAxMC41NjcgMS41NjcgOS4wMDAwNCAzLjUgOS4wMDAwNEM0LjU2MTQyIDkuMDAwMDQgNS41MTI0OSA5LjQ3MjUyIDYuMTU0MzYgMTAuMjE4Nkw3Ljc4NTE5IDYuNTU5NzZMNy45OTU4MSA2LjA3ODQ0TDcuOTk3NzcgNi4wODI4M0wxMC4zODIgMC43MzM3MzRaTTMuNSAxNEM0LjMyODQzIDE0IDUgMTMuMzI4NSA1IDEyLjVDNSAxMS42NzE2IDQuMzI4NDMgMTEgMy41IDExQzIuNjcxNTcgMTEgMiAxMS42NzE2IDIgMTIuNUMyIDEzLjMyODUgMi42NzE1NyAxNCAzLjUgMTRaTTQuMjkzMDkgMC4yMjc0NjRDNC43OTc1NCAwLjAwMjYyMzY4IDUuMzg4NzQgMC4yMjkyODkgNS42MTM1OCAwLjczMzczNEw3LjI5NzYgNC41MTE5NUw2LjIxMjgzIDYuOTkwODhMMy43ODY4MiAxLjU0Nzk1QzMuNTYxOTggMS4wNDM1MSAzLjc4ODY1IDAuNDUyMzA0IDQuMjkzMDkgMC4yMjc0NjRaTTEwLjk5NTUgMTIuNUMxMC45OTU1IDEzLjMyODUgMTEuNjY3MSAxNCAxMi40OTU1IDE0QzEzLjMyNCAxNCAxMy45OTU1IDEzLjMyODUgMTMuOTk1NSAxMi41QzEzLjk5NTUgMTEuNjcxNiAxMy4zMjQgMTEgMTIuNDk1NSAxMUMxMS42NjcxIDExIDEwLjk5NTUgMTEuNjcxNiAxMC45OTU1IDEyLjVaIiBmaWxsPSIjNkM1QUZCIi8+Cjwvc3ZnPgo=",
    bd = "";
  function Uc(e) {
    return Ss() ? (va(e), !0) : !1;
  }
  function qr(e) {
    return typeof e == "function" ? e() : ce(e);
  }
  var Bc = (typeof window === "undefined" ? "undefined" : _typeof(window)) < "u",
    zc = function zc() {};
  function Hc(e, t) {
    function n() {
      var _this2 = this;
      for (var _len7 = arguments.length, r = new Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
        r[_key7] = arguments[_key7];
      }
      return new Promise(function (s, o) {
        Promise.resolve(e(function () {
          return t.apply(_this2, r);
        }, {
          fn: t,
          thisArg: _this2,
          args: r
        })).then(s).catch(o);
      });
    }
    return n;
  }
  var Wc = function Wc(e) {
    return e();
  };
  function qc(e) {
    var t = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : !1;
    var n = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "Timeout";
    return new Promise(function (r, s) {
      setTimeout(t ? function () {
        return s(n);
      } : r, e);
    });
  }
  var Yo = Object.getOwnPropertySymbols,
    Kc = Object.prototype.hasOwnProperty,
    Jc = Object.prototype.propertyIsEnumerable,
    Yc = function Yc(e, t) {
      var n = {};
      for (var r in e) Kc.call(e, r) && t.indexOf(r) < 0 && (n[r] = e[r]);
      if (e != null && Yo) {
        var _iterator4 = _createForOfIteratorHelper(Yo(e)),
          _step4;
        try {
          for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
            var r = _step4.value;
            t.indexOf(r) < 0 && Jc.call(e, r) && (n[r] = e[r]);
          }
        } catch (err) {
          _iterator4.e(err);
        } finally {
          _iterator4.f();
        }
      }
      return n;
    };
  function Vc(e, t) {
    var n = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var r = n,
      _r$eventFilter = r.eventFilter,
      s = _r$eventFilter === void 0 ? Wc : _r$eventFilter,
      o = Yc(r, ["eventFilter"]);
    return Jt(e, Hc(s, t), o);
  }
  function Qc(e) {
    var t;
    var n = qr(e);
    return (t = n == null ? void 0 : n.$el) != null ? t : n;
  }
  var _t = Bc ? window : void 0;
  function qe() {
    var _e2, _e3;
    var t, n, r, s;
    for (var _len8 = arguments.length, e = new Array(_len8), _key8 = 0; _key8 < _len8; _key8++) {
      e[_key8] = arguments[_key8];
    }
    if (typeof e[0] == "string" || Array.isArray(e[0]) ? ((n = e[0], r = e[1], s = e[2]), t = _t) : (_e2 = e, _e3 = _slicedToArray(_e2, 4), t = _e3[0], n = _e3[1], r = _e3[2], s = _e3[3], _e2), !t) return zc;
    Array.isArray(n) || (n = [n]), Array.isArray(r) || (r = [r]);
    var o = [],
      i = function i() {
        o.forEach(function (u) {
          return u();
        }), o.length = 0;
      },
      a = function a(u, d, A, m) {
        return u.addEventListener(d, A, m), function () {
          return u.removeEventListener(d, A, m);
        };
      },
      l = Jt(function () {
        return [Qc(t), qr(s)];
      }, function (_ref24) {
        var _ref25 = _slicedToArray(_ref24, 2),
          u = _ref25[0],
          d = _ref25[1];
        i(), u && o.push.apply(o, _toConsumableArray(n.flatMap(function (A) {
          return r.map(function (m) {
            return a(u, A, m, d);
          });
        })));
      }, {
        immediate: !0,
        flush: "post"
      }),
      c = function c() {
        l(), i();
      };
    return Uc(c), c;
  }
  var Fn = (typeof globalThis === "undefined" ? "undefined" : _typeof(globalThis)) < "u" ? globalThis : (typeof window === "undefined" ? "undefined" : _typeof(window)) < "u" ? window : (typeof global === "undefined" ? "undefined" : _typeof(global)) < "u" ? global : (typeof self === "undefined" ? "undefined" : _typeof(self)) < "u" ? self : {},
    Un = "__vueuse_ssr_handlers__",
    Zc = Xc();
  function Xc() {
    return Un in Fn || (Fn[Un] = Fn[Un] || {}), Fn[Un];
  }
  function Gc(e, t) {
    return Zc[e] || t;
  }
  function eu(e) {
    return e == null ? "any" : e instanceof Set ? "set" : e instanceof Map ? "map" : e instanceof Date ? "date" : typeof e == "boolean" ? "boolean" : typeof e == "string" ? "string" : _typeof(e) == "object" ? "object" : Number.isNaN(e) ? "any" : "number";
  }
  var tu = {
    boolean: {
      read: function read(e) {
        return e === "true";
      },
      write: function write(e) {
        return String(e);
      }
    },
    object: {
      read: function read(e) {
        return JSON.parse(e);
      },
      write: function write(e) {
        return JSON.stringify(e);
      }
    },
    number: {
      read: function read(e) {
        return Number.parseFloat(e);
      },
      write: function write(e) {
        return String(e);
      }
    },
    any: {
      read: function read(e) {
        return e;
      },
      write: function write(e) {
        return String(e);
      }
    },
    string: {
      read: function read(e) {
        return e;
      },
      write: function write(e) {
        return String(e);
      }
    },
    map: {
      read: function read(e) {
        return new Map(JSON.parse(e));
      },
      write: function write(e) {
        return JSON.stringify(Array.from(e.entries()));
      }
    },
    set: {
      read: function read(e) {
        return new Set(JSON.parse(e));
      },
      write: function write(e) {
        return JSON.stringify(Array.from(e));
      }
    },
    date: {
      read: function read(e) {
        return new Date(e);
      },
      write: function write(e) {
        return e.toISOString();
      }
    }
  };
  function nu(e) {
    var t = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var _t$delayEnter = t.delayEnter,
      n = _t$delayEnter === void 0 ? 0 : _t$delayEnter,
      _t$delayLeave = t.delayLeave,
      r = _t$delayLeave === void 0 ? 0 : _t$delayLeave,
      _t$window = t.window,
      s = _t$window === void 0 ? _t : _t$window,
      o = Ae(!1);
    var i;
    var a = function a(l) {
      var c = l ? n : r;
      i && (clearTimeout(i), i = void 0), c ? i = setTimeout(function () {
        return o.value = l;
      }, c) : o.value = l;
    };
    return s && (qe(e, "mouseenter", function () {
      return a(!0);
    }, {
      passive: !0
    }), qe(e, "mouseleave", function () {
      return a(!1);
    }, {
      passive: !0
    })), o;
  }
  var ru = {
    page: function page(e) {
      return [e.pageX, e.pageY];
    },
    client: function client(e) {
      return [e.clientX, e.clientY];
    },
    screen: function screen(e) {
      return [e.screenX, e.screenY];
    },
    movement: function movement(e) {
      return e instanceof Touch ? null : [e.movementX, e.movementY];
    }
  };
  function su() {
    var e = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var _e$type = e.type,
      t = _e$type === void 0 ? "page" : _e$type,
      _e$touch = e.touch,
      n = _e$touch === void 0 ? !0 : _e$touch,
      _e$resetOnTouchEnds = e.resetOnTouchEnds,
      r = _e$resetOnTouchEnds === void 0 ? !1 : _e$resetOnTouchEnds,
      _e$initialValue = e.initialValue,
      s = _e$initialValue === void 0 ? {
        x: 0,
        y: 0
      } : _e$initialValue,
      _e$window = e.window,
      o = _e$window === void 0 ? _t : _e$window,
      _e$target = e.target,
      i = _e$target === void 0 ? o : _e$target,
      a = e.eventFilter,
      l = Ae(s.x),
      c = Ae(s.y),
      u = Ae(null),
      d = typeof t == "function" ? t : ru[t],
      A = function A(R) {
        var _U;
        var U = d(R);
        U && ((_U = _slicedToArray(U, 2), l.value = _U[0], c.value = _U[1]), u.value = "mouse");
      },
      m = function m(R) {
        if (R.touches.length > 0) {
          var _U2;
          var U = d(R.touches[0]);
          U && ((_U2 = _slicedToArray(U, 2), l.value = _U2[0], c.value = _U2[1]), u.value = "touch");
        }
      },
      h = function h() {
        l.value = s.x, c.value = s.y;
      },
      _ = a ? function (R) {
        return a(function () {
          return A(R);
        }, {});
      } : function (R) {
        return A(R);
      },
      I = a ? function (R) {
        return a(function () {
          return m(R);
        }, {});
      } : function (R) {
        return m(R);
      };
    return i && (qe(i, "mousemove", _, {
      passive: !0
    }), qe(i, "dragover", _, {
      passive: !0
    }), n && t !== "movement" && (qe(i, "touchstart", I, {
      passive: !0
    }), qe(i, "touchmove", I, {
      passive: !0
    }), r && qe(i, "touchend", h, {
      passive: !0
    }))), {
      x: l,
      y: c,
      sourceType: u
    };
  }
  var ou = Object.defineProperty,
    Vo = Object.getOwnPropertySymbols,
    iu = Object.prototype.hasOwnProperty,
    au = Object.prototype.propertyIsEnumerable,
    Qo = function Qo(e, t, n) {
      return t in e ? ou(e, t, {
        enumerable: !0,
        configurable: !0,
        writable: !0,
        value: n
      }) : e[t] = n;
    },
    Zo = function Zo(e, t) {
      for (var n in t || (t = {})) iu.call(t, n) && Qo(e, n, t[n]);
      if (Vo) {
        var _iterator5 = _createForOfIteratorHelper(Vo(t)),
          _step5;
        try {
          for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
            var n = _step5.value;
            au.call(t, n) && Qo(e, n, t[n]);
          }
        } catch (err) {
          _iterator5.e(err);
        } finally {
          _iterator5.f();
        }
      }
      return e;
    };
  function lu(e, t, n) {
    var r = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
    var s;
    var _r$flush = r.flush,
      o = _r$flush === void 0 ? "pre" : _r$flush,
      _r$deep = r.deep,
      i = _r$deep === void 0 ? !0 : _r$deep,
      _r$listenToStorageCha = r.listenToStorageChanges,
      a = _r$listenToStorageCha === void 0 ? !0 : _r$listenToStorageCha,
      _r$writeDefaults = r.writeDefaults,
      l = _r$writeDefaults === void 0 ? !0 : _r$writeDefaults,
      _r$mergeDefaults = r.mergeDefaults,
      c = _r$mergeDefaults === void 0 ? !1 : _r$mergeDefaults,
      u = r.shallow,
      _r$window = r.window,
      d = _r$window === void 0 ? _t : _r$window,
      A = r.eventFilter,
      _r$onError = r.onError,
      m = _r$onError === void 0 ? function (L) {
        console.error(L);
      } : _r$onError,
      h = qr(t),
      _ = eu(h),
      I = (u ? Xa : Ae)(t),
      R = (s = r.serializer) != null ? s : tu[_];
    if (!n) try {
      n = Gc("getDefaultStorage", function () {
        var L;
        return (L = _t) == null ? void 0 : L.localStorage;
      })();
    } catch (L) {
      m(L);
    }
    function U(_x7) {
      return _U3.apply(this, arguments);
    }
    function _U3() {
      _U3 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(L) {
        var B, Z;
        return _regeneratorRuntime().wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              if (!n || L && L.key !== e) {
                _context2.next = 38;
                break;
              }
              _context2.prev = 1;
              if (!L) {
                _context2.next = 6;
                break;
              }
              _context2.t0 = L.newValue;
              _context2.next = 9;
              break;
            case 6:
              _context2.next = 8;
              return n.getItem(e);
            case 8:
              _context2.t0 = _context2.sent;
            case 9:
              B = _context2.t0;
              if (!(B == null)) {
                _context2.next = 23;
                break;
              }
              I.value = h;
              _context2.t1 = l && h !== null;
              if (!_context2.t1) {
                _context2.next = 21;
                break;
              }
              _context2.t2 = n;
              _context2.t3 = e;
              _context2.next = 18;
              return R.write(h);
            case 18:
              _context2.t4 = _context2.sent;
              _context2.next = 21;
              return _context2.t2.setItem.call(_context2.t2, _context2.t3, _context2.t4);
            case 21:
              _context2.next = 33;
              break;
            case 23:
              if (!c) {
                _context2.next = 30;
                break;
              }
              _context2.next = 26;
              return R.read(B);
            case 26:
              Z = _context2.sent;
              typeof c == "function" ? I.value = c(Z, h) : _ === "object" && !Array.isArray(Z) ? I.value = Zo(Zo({}, h), Z) : I.value = Z;
              _context2.next = 33;
              break;
            case 30:
              _context2.next = 32;
              return R.read(B);
            case 32:
              I.value = _context2.sent;
            case 33:
              _context2.next = 38;
              break;
            case 35:
              _context2.prev = 35;
              _context2.t5 = _context2["catch"](1);
              m(_context2.t5);
            case 38:
            case "end":
              return _context2.stop();
          }
        }, _callee2, null, [[1, 35]]);
      }));
      return _U3.apply(this, arguments);
    }
    return U(), d && a && qe(d, "storage", function (L) {
      return Promise.resolve().then(function () {
        return U(L);
      });
    }), n && Vc(I, /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
      return _regeneratorRuntime().wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            if (!(I.value == null)) {
              _context.next = 6;
              break;
            }
            _context.next = 4;
            return n.removeItem(e);
          case 4:
            _context.next = 13;
            break;
          case 6:
            _context.t0 = n;
            _context.t1 = e;
            _context.next = 10;
            return R.write(I.value);
          case 10:
            _context.t2 = _context.sent;
            _context.next = 13;
            return _context.t0.setItem.call(_context.t0, _context.t1, _context.t2);
          case 13:
            _context.next = 18;
            break;
          case 15:
            _context.prev = 15;
            _context.t3 = _context["catch"](0);
            m(_context.t3);
          case 18:
          case "end":
            return _context.stop();
        }
      }, _callee, null, [[0, 15]]);
    })), {
      flush: o,
      deep: i,
      eventFilter: A
    }), I;
  }
  function cu(e) {
    var t;
    var n = (t = e.rangeCount) != null ? t : 0,
      r = new Array(n);
    for (var s = 0; s < n; s++) {
      var o = e.getRangeAt(s);
      r[s] = o;
    }
    return r;
  }
  function uu() {
    var e = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var _e$window2 = e.window,
      t = _e$window2 === void 0 ? _t : _e$window2,
      n = Ae(null),
      r = wt(function () {
        var a, l;
        return (l = (a = n.value) == null ? void 0 : a.toString()) != null ? l : "";
      }),
      s = wt(function () {
        return n.value ? cu(n.value) : [];
      }),
      o = wt(function () {
        return s.value.map(function (a) {
          return a.getBoundingClientRect();
        });
      });
    function i() {
      n.value = null, t && (n.value = t.getSelection());
    }
    return t && qe(t.document, "selectionchange", i), {
      text: r,
      rects: o,
      ranges: s,
      selection: n
    };
  }
  function fu() {
    var _ref27 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      _ref27$window = _ref27.window,
      e = _ref27$window === void 0 ? _t : _ref27$window;
    if (!e) return {
      x: Ae(0),
      y: Ae(0)
    };
    var t = Ae(e.scrollX),
      n = Ae(e.scrollY);
    return qe(e, "scroll", function () {
      t.value = e.scrollX, n.value = e.scrollY;
    }, {
      capture: !1,
      passive: !0
    }), {
      x: t,
      y: n
    };
  }
  var Xo = "https://www.kdocs.cn",
    Go = Xo + "/latest";
  var Kr = (typeof globalThis === "undefined" ? "undefined" : _typeof(globalThis)) < "u" ? globalThis : (typeof window === "undefined" ? "undefined" : _typeof(window)) < "u" ? window : (typeof global === "undefined" ? "undefined" : _typeof(global)) < "u" ? global : (typeof self === "undefined" ? "undefined" : _typeof(self)) < "u" ? self : {};
  function Jr(e) {
    return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
  }
  var ei = {
    exports: {}
  };
  (function (e, t) {
    (function (n, r) {
      r(e);
    })((typeof globalThis === "undefined" ? "undefined" : _typeof(globalThis)) < "u" ? globalThis : (typeof self === "undefined" ? "undefined" : _typeof(self)) < "u" ? self : Kr, function (n) {
      var r, s;
      if (!((s = (r = globalThis.chrome) == null ? void 0 : r.runtime) != null && s.id)) throw new Error("This script should only be loaded in a browser extension.");
      if (_typeof(globalThis.browser) > "u" || Object.getPrototypeOf(globalThis.browser) !== Object.prototype) {
        var o = "The message port closed before a response was received.",
          i = function i(a) {
            var l = {
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
            if (Object.keys(l).length === 0) throw new Error("api-metadata.json has not been included in browser-polyfill");
            var c = /*#__PURE__*/function (_WeakMap) {
              _inherits(c, _WeakMap);
              var _super = _createSuper(c);
              function c(b) {
                var _this3;
                var v = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : void 0;
                _classCallCheck(this, c);
                _this3 = _super.call(this, v), _this3.createItem = b;
                return _this3;
              }
              _createClass(c, [{
                key: "get",
                value: function get(b) {
                  return this.has(b) || this.set(b, this.createItem(b)), _get(_getPrototypeOf(c.prototype), "get", this).call(this, b);
                }
              }]);
              return c;
            }( /*#__PURE__*/_wrapNativeSuper(WeakMap));
            var u = function u(w) {
                return w && _typeof(w) == "object" && typeof w.then == "function";
              },
              d = function d(w, b) {
                return function () {
                  for (var _len9 = arguments.length, v = new Array(_len9), _key9 = 0; _key9 < _len9; _key9++) {
                    v[_key9] = arguments[_key9];
                  }
                  a.runtime.lastError ? w.reject(new Error(a.runtime.lastError.message)) : b.singleCallbackArg || v.length <= 1 && b.singleCallbackArg !== !1 ? w.resolve(v[0]) : w.resolve(v);
                };
              },
              A = function A(w) {
                return w == 1 ? "argument" : "arguments";
              },
              m = function m(w, b) {
                return function ($) {
                  for (var _len10 = arguments.length, Y = new Array(_len10 > 1 ? _len10 - 1 : 0), _key10 = 1; _key10 < _len10; _key10++) {
                    Y[_key10 - 1] = arguments[_key10];
                  }
                  if (Y.length < b.minArgs) throw new Error("Expected at least ".concat(b.minArgs, " ").concat(A(b.minArgs), " for ").concat(w, "(), got ").concat(Y.length));
                  if (Y.length > b.maxArgs) throw new Error("Expected at most ".concat(b.maxArgs, " ").concat(A(b.maxArgs), " for ").concat(w, "(), got ").concat(Y.length));
                  return new Promise(function (j, S) {
                    if (b.fallbackToNoCallback) try {
                      $[w].apply($, Y.concat([d({
                        resolve: j,
                        reject: S
                      }, b)]));
                    } catch (p) {
                      console.warn("".concat(w, " API method doesn't seem to support the callback parameter, falling back to call it without a callback: "), p), $[w].apply($, Y), b.fallbackToNoCallback = !1, b.noCallback = !0, j();
                    } else b.noCallback ? ($[w].apply($, Y), j()) : $[w].apply($, Y.concat([d({
                      resolve: j,
                      reject: S
                    }, b)]));
                  });
                };
              },
              h = function h(w, b, v) {
                return new Proxy(b, {
                  apply: function apply($, Y, j) {
                    return v.call.apply(v, [Y, w].concat(_toConsumableArray(j)));
                  }
                });
              };
            var _ = Function.call.bind(Object.prototype.hasOwnProperty);
            var I = function I(w) {
                var b = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
                var v = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
                var $ = Object.create(null),
                  Y = {
                    has: function has(S, p) {
                      return p in w || p in $;
                    },
                    get: function get(S, p, C) {
                      if (p in $) return $[p];
                      if (!(p in w)) return;
                      var x = w[p];
                      if (typeof x == "function") {
                        if (typeof b[p] == "function") x = h(w, w[p], b[p]);else if (_(v, p)) {
                          var P = m(p, v[p]);
                          x = h(w, w[p], P);
                        } else x = x.bind(w);
                      } else if (_typeof(x) == "object" && x !== null && (_(b, p) || _(v, p))) x = I(x, b[p], v[p]);else if (_(v, "*")) x = I(x, b[p], v["*"]);else return Object.defineProperty($, p, {
                        configurable: !0,
                        enumerable: !0,
                        get: function get() {
                          return w[p];
                        },
                        set: function set(P) {
                          w[p] = P;
                        }
                      }), x;
                      return $[p] = x, x;
                    },
                    set: function set(S, p, C, x) {
                      return p in $ ? $[p] = C : w[p] = C, !0;
                    },
                    defineProperty: function defineProperty(S, p, C) {
                      return Reflect.defineProperty($, p, C);
                    },
                    deleteProperty: function deleteProperty(S, p) {
                      return Reflect.deleteProperty($, p);
                    }
                  },
                  j = Object.create(w);
                return new Proxy(j, Y);
              },
              R = function R(w) {
                return {
                  addListener: function addListener(b, v) {
                    for (var _len11 = arguments.length, $ = new Array(_len11 > 2 ? _len11 - 2 : 0), _key11 = 2; _key11 < _len11; _key11++) {
                      $[_key11 - 2] = arguments[_key11];
                    }
                    b.addListener.apply(b, [w.get(v)].concat($));
                  },
                  hasListener: function hasListener(b, v) {
                    return b.hasListener(w.get(v));
                  },
                  removeListener: function removeListener(b, v) {
                    b.removeListener(w.get(v));
                  }
                };
              },
              U = new c(function (w) {
                return typeof w != "function" ? w : function (v) {
                  var $ = I(v, {}, {
                    getContent: {
                      minArgs: 0,
                      maxArgs: 0
                    }
                  });
                  w($);
                };
              }),
              L = new c(function (w) {
                return typeof w != "function" ? w : function (v, $, Y) {
                  var j = !1,
                    S,
                    p = new Promise(function (z) {
                      S = function S(W) {
                        j = !0, z(W);
                      };
                    }),
                    C;
                  try {
                    C = w(v, $, S);
                  } catch (z) {
                    C = Promise.reject(z);
                  }
                  var x = C !== !0 && u(C);
                  if (C !== !0 && !x && !j) return !1;
                  var P = function P(z) {
                    z.then(function (W) {
                      Y(W);
                    }, function (W) {
                      var X;
                      W && (W instanceof Error || typeof W.message == "string") ? X = W.message : X = "An unexpected error occurred", Y({
                        __mozWebExtensionPolyfillReject__: !0,
                        message: X
                      });
                    }).catch(function (W) {
                      console.error("Failed to send onMessage rejected reply", W);
                    });
                  };
                  return P(x ? C : p), !0;
                };
              }),
              B = function B(_ref28, v) {
                var w = _ref28.reject,
                  b = _ref28.resolve;
                a.runtime.lastError ? a.runtime.lastError.message === o ? b() : w(new Error(a.runtime.lastError.message)) : v && v.__mozWebExtensionPolyfillReject__ ? w(new Error(v.message)) : b(v);
              },
              Z = function Z(w, b, v) {
                for (var _len12 = arguments.length, $ = new Array(_len12 > 3 ? _len12 - 3 : 0), _key12 = 3; _key12 < _len12; _key12++) {
                  $[_key12 - 3] = arguments[_key12];
                }
                if ($.length < b.minArgs) throw new Error("Expected at least ".concat(b.minArgs, " ").concat(A(b.minArgs), " for ").concat(w, "(), got ").concat($.length));
                if ($.length > b.maxArgs) throw new Error("Expected at most ".concat(b.maxArgs, " ").concat(A(b.maxArgs), " for ").concat(w, "(), got ").concat($.length));
                return new Promise(function (Y, j) {
                  var S = B.bind(null, {
                    resolve: Y,
                    reject: j
                  });
                  $.push(S), v.sendMessage.apply(v, $);
                });
              },
              se = {
                devtools: {
                  network: {
                    onRequestFinished: R(U)
                  }
                },
                runtime: {
                  onMessage: R(L),
                  onMessageExternal: R(L),
                  sendMessage: Z.bind(null, "sendMessage", {
                    minArgs: 1,
                    maxArgs: 3
                  })
                },
                tabs: {
                  sendMessage: Z.bind(null, "sendMessage", {
                    minArgs: 2,
                    maxArgs: 3
                  })
                }
              },
              ae = {
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
            return l.privacy = {
              network: {
                "*": ae
              },
              services: {
                "*": ae
              },
              websites: {
                "*": ae
              }
            }, I(a, se, l);
          };
        n.exports = i(chrome);
      } else n.exports = globalThis.browser;
    });
  })(ei);
  var Le = ei.exports;
  var du = function du() {
      var e = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : !1;
      if (e) {
        window && (window.location.href = Go);
        return;
      }
      window == null || window.open(Go);
    },
    gu = function gu(e) {
      return Le.runtime.getURL("kdocs/".concat(e, "/index.html"));
    };
  var Yr = {
    exports: {}
  };
  var mu = function mu(e) {
      return (typeof crypto === "undefined" ? "undefined" : _typeof(crypto)) < "u" && typeof crypto.getRandomValues == "function" ? function () {
        var t = crypto.getRandomValues(new Uint8Array(1))[0];
        return (t >= e ? t % e : t).toString(e);
      } : function () {
        return Math.floor(Math.random() * e).toString(e);
      };
    },
    ti = function ti() {
      var e = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 7;
      var t = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : !1;
      return Array.from({
        length: e
      }, mu(t ? 16 : 36)).join("");
    };
  Yr.exports = ti, Yr.exports.default = ti;
  var hu = Yr.exports;
  var Bn = Jr(hu);
  var ni = function ni() {
      return "uid::".concat(Bn(7));
    },
    ri = function ri(e) {
      var t = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : ["endpointName", "fingerprint"];
      return _typeof(e) == "object" && e !== null && t.every(function (n) {
        return n in e;
      });
    },
    pu = function pu(e) {
      if (!ri(e)) throw new TypeError("Invalid connection args");
      return JSON.stringify(e);
    },
    Au = function Au(e) {
      try {
        var t = JSON.parse(e);
        return ri(t) ? t : null;
      } catch (_unused2) {
        return null;
      }
    },
    si = function si() {
      var e = [];
      return {
        add: function add() {
          for (var _len13 = arguments.length, t = new Array(_len13), _key13 = 0; _key13 < _len13; _key13++) {
            t[_key13] = arguments[_key13];
          }
          e = [].concat(_toConsumableArray(e), t);
        },
        remove: function remove(t) {
          e = typeof t == "string" ? e.filter(function (n) {
            return n.message.transactionId !== t;
          }) : e.filter(function (n) {
            return !t.includes(n);
          });
        },
        entries: function entries() {
          return e;
        }
      };
    },
    ct = /*#__PURE__*/function () {
      function ct() {
        _classCallCheck(this, ct);
      }
      _createClass(ct, null, [{
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
      return ct;
    }(),
    oi = {
      exports: {}
    };
  (function (e, t) {
    (function (n, r) {
      r(e);
    })((typeof globalThis === "undefined" ? "undefined" : _typeof(globalThis)) < "u" ? globalThis : (typeof self === "undefined" ? "undefined" : _typeof(self)) < "u" ? self : Kr, function (n) {
      if ((typeof globalThis === "undefined" ? "undefined" : _typeof(globalThis)) != "object" || (typeof chrome === "undefined" ? "undefined" : _typeof(chrome)) != "object" || !chrome || !chrome.runtime || !chrome.runtime.id) throw new Error("This script should only be loaded in a browser extension.");
      if (_typeof(globalThis.browser) > "u" || Object.getPrototypeOf(globalThis.browser) !== Object.prototype) {
        var r = "The message port closed before a response was received.",
          s = "Returning a Promise is the preferred way to send a reply from an onMessage/onMessageExternal listener, as the sendResponse will be removed from the specs (See https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/API/runtime/onMessage)",
          o = function o(i) {
            var a = {
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
            if (Object.keys(a).length === 0) throw new Error("api-metadata.json has not been included in browser-polyfill");
            var l = /*#__PURE__*/function (_WeakMap2) {
              _inherits(l, _WeakMap2);
              var _super2 = _createSuper(l);
              function l(b) {
                var _this4;
                var v = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : void 0;
                _classCallCheck(this, l);
                _this4 = _super2.call(this, v), _this4.createItem = b;
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
            var c = function c(w) {
                return w && _typeof(w) == "object" && typeof w.then == "function";
              },
              u = function u(w, b) {
                return function () {
                  for (var _len14 = arguments.length, v = new Array(_len14), _key14 = 0; _key14 < _len14; _key14++) {
                    v[_key14] = arguments[_key14];
                  }
                  i.runtime.lastError ? w.reject(new Error(i.runtime.lastError.message)) : b.singleCallbackArg || v.length <= 1 && b.singleCallbackArg !== !1 ? w.resolve(v[0]) : w.resolve(v);
                };
              },
              d = function d(w) {
                return w == 1 ? "argument" : "arguments";
              },
              A = function A(w, b) {
                return function ($) {
                  for (var _len15 = arguments.length, Y = new Array(_len15 > 1 ? _len15 - 1 : 0), _key15 = 1; _key15 < _len15; _key15++) {
                    Y[_key15 - 1] = arguments[_key15];
                  }
                  if (Y.length < b.minArgs) throw new Error("Expected at least ".concat(b.minArgs, " ").concat(d(b.minArgs), " for ").concat(w, "(), got ").concat(Y.length));
                  if (Y.length > b.maxArgs) throw new Error("Expected at most ".concat(b.maxArgs, " ").concat(d(b.maxArgs), " for ").concat(w, "(), got ").concat(Y.length));
                  return new Promise(function (j, S) {
                    if (b.fallbackToNoCallback) try {
                      $[w].apply($, Y.concat([u({
                        resolve: j,
                        reject: S
                      }, b)]));
                    } catch (p) {
                      console.warn("".concat(w, " API method doesn't seem to support the callback parameter, falling back to call it without a callback: "), p), $[w].apply($, Y), b.fallbackToNoCallback = !1, b.noCallback = !0, j();
                    } else b.noCallback ? ($[w].apply($, Y), j()) : $[w].apply($, Y.concat([u({
                      resolve: j,
                      reject: S
                    }, b)]));
                  });
                };
              },
              m = function m(w, b, v) {
                return new Proxy(b, {
                  apply: function apply($, Y, j) {
                    return v.call.apply(v, [Y, w].concat(_toConsumableArray(j)));
                  }
                });
              };
            var h = Function.call.bind(Object.prototype.hasOwnProperty);
            var _ = function _(w) {
                var b = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
                var v = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
                var $ = Object.create(null),
                  Y = {
                    has: function has(S, p) {
                      return p in w || p in $;
                    },
                    get: function get(S, p, C) {
                      if (p in $) return $[p];
                      if (!(p in w)) return;
                      var x = w[p];
                      if (typeof x == "function") {
                        if (typeof b[p] == "function") x = m(w, w[p], b[p]);else if (h(v, p)) {
                          var P = A(p, v[p]);
                          x = m(w, w[p], P);
                        } else x = x.bind(w);
                      } else if (_typeof(x) == "object" && x !== null && (h(b, p) || h(v, p))) x = _(x, b[p], v[p]);else if (h(v, "*")) x = _(x, b[p], v["*"]);else return Object.defineProperty($, p, {
                        configurable: !0,
                        enumerable: !0,
                        get: function get() {
                          return w[p];
                        },
                        set: function set(P) {
                          w[p] = P;
                        }
                      }), x;
                      return $[p] = x, x;
                    },
                    set: function set(S, p, C, x) {
                      return p in $ ? $[p] = C : w[p] = C, !0;
                    },
                    defineProperty: function defineProperty(S, p, C) {
                      return Reflect.defineProperty($, p, C);
                    },
                    deleteProperty: function deleteProperty(S, p) {
                      return Reflect.deleteProperty($, p);
                    }
                  },
                  j = Object.create(w);
                return new Proxy(j, Y);
              },
              I = function I(w) {
                return {
                  addListener: function addListener(b, v) {
                    for (var _len16 = arguments.length, $ = new Array(_len16 > 2 ? _len16 - 2 : 0), _key16 = 2; _key16 < _len16; _key16++) {
                      $[_key16 - 2] = arguments[_key16];
                    }
                    b.addListener.apply(b, [w.get(v)].concat($));
                  },
                  hasListener: function hasListener(b, v) {
                    return b.hasListener(w.get(v));
                  },
                  removeListener: function removeListener(b, v) {
                    b.removeListener(w.get(v));
                  }
                };
              },
              R = new l(function (w) {
                return typeof w != "function" ? w : function (v) {
                  var $ = _(v, {}, {
                    getContent: {
                      minArgs: 0,
                      maxArgs: 0
                    }
                  });
                  w($);
                };
              });
            var U = !1;
            var L = new l(function (w) {
                return typeof w != "function" ? w : function (v, $, Y) {
                  var j = !1,
                    S,
                    p = new Promise(function (z) {
                      S = function S(W) {
                        U || (console.warn(s, new Error().stack), U = !0), j = !0, z(W);
                      };
                    }),
                    C;
                  try {
                    C = w(v, $, S);
                  } catch (z) {
                    C = Promise.reject(z);
                  }
                  var x = C !== !0 && c(C);
                  if (C !== !0 && !x && !j) return !1;
                  var P = function P(z) {
                    z.then(function (W) {
                      Y(W);
                    }, function (W) {
                      var X;
                      W && (W instanceof Error || typeof W.message == "string") ? X = W.message : X = "An unexpected error occurred", Y({
                        __mozWebExtensionPolyfillReject__: !0,
                        message: X
                      });
                    }).catch(function (W) {
                      console.error("Failed to send onMessage rejected reply", W);
                    });
                  };
                  return P(x ? C : p), !0;
                };
              }),
              B = function B(_ref29, v) {
                var w = _ref29.reject,
                  b = _ref29.resolve;
                i.runtime.lastError ? i.runtime.lastError.message === r ? b() : w(new Error(i.runtime.lastError.message)) : v && v.__mozWebExtensionPolyfillReject__ ? w(new Error(v.message)) : b(v);
              },
              Z = function Z(w, b, v) {
                for (var _len17 = arguments.length, $ = new Array(_len17 > 3 ? _len17 - 3 : 0), _key17 = 3; _key17 < _len17; _key17++) {
                  $[_key17 - 3] = arguments[_key17];
                }
                if ($.length < b.minArgs) throw new Error("Expected at least ".concat(b.minArgs, " ").concat(d(b.minArgs), " for ").concat(w, "(), got ").concat($.length));
                if ($.length > b.maxArgs) throw new Error("Expected at most ".concat(b.maxArgs, " ").concat(d(b.maxArgs), " for ").concat(w, "(), got ").concat($.length));
                return new Promise(function (Y, j) {
                  var S = B.bind(null, {
                    resolve: Y,
                    reject: j
                  });
                  $.push(S), v.sendMessage.apply(v, $);
                });
              },
              se = {
                devtools: {
                  network: {
                    onRequestFinished: I(R)
                  }
                },
                runtime: {
                  onMessage: I(L),
                  onMessageExternal: I(L),
                  sendMessage: Z.bind(null, "sendMessage", {
                    minArgs: 1,
                    maxArgs: 3
                  })
                },
                tabs: {
                  sendMessage: Z.bind(null, "sendMessage", {
                    minArgs: 2,
                    maxArgs: 3
                  })
                }
              },
              ae = {
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
            return a.privacy = {
              network: {
                "*": ae
              },
              services: {
                "*": ae
              },
              websites: {
                "*": ae
              }
            }, _(i, se, a);
          };
        n.exports = o(chrome);
      } else n.exports = globalThis.browser;
    });
  })(oi);
  var xu = oi.exports;
  var ii = Jr(xu);
  var bu = function bu() {
      var e = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
      var t = ni();
      var n,
        r = [];
      var s = si(),
        o = new Set(),
        i = new Set(),
        a = function a(c, u) {
          switch (c.status) {
            case "undeliverable":
              r.some(function (d) {
                return d.message.messageID === c.message.messageID;
              }) || (r = [].concat(_toConsumableArray(r), [{
                message: c.message,
                resolvedDestination: c.resolvedDestination
              }]));
              return;
            case "deliverable":
              r = r.reduce(function (d, A) {
                return A.resolvedDestination === c.deliverableTo ? (ct.toBackground(u, {
                  type: "deliver",
                  message: A.message
                }), d) : [].concat(_toConsumableArray(d), [A]);
              }, []);
              return;
            case "delivered":
              c.receipt.message.messageType === "message" && s.add(c.receipt);
              return;
            case "incoming":
              c.message.messageType === "reply" && s.remove(c.message.messageID), o.forEach(function (d) {
                return d(c.message, u);
              });
              return;
            case "terminated":
              {
                var d = s.entries().filter(function (A) {
                  return c.fingerprint === A.to;
                });
                s.remove(d), d.forEach(function (_ref30) {
                  var A = _ref30.message;
                  return i.forEach(function (m) {
                    return m(A);
                  });
                });
              }
          }
        },
        l = function l() {
          n = ii.runtime.connect({
            name: pu({
              endpointName: e,
              fingerprint: t
            })
          }), n.onMessage.addListener(a), n.onDisconnect.addListener(l), ct.toBackground(n, {
            type: "sync",
            pendingResponses: s.entries(),
            pendingDeliveries: _toConsumableArray(new Set(r.map(function (_ref31) {
              var c = _ref31.resolvedDestination;
              return c;
            })))
          });
        };
      return l(), {
        onFailure: function onFailure(c) {
          i.add(c);
        },
        onMessage: function onMessage(c) {
          o.add(c);
        },
        postMessage: function postMessage(c) {
          ct.toBackground(n, {
            type: "deliver",
            message: c
          });
        }
      };
    },
    Vr,
    wu = function wu(e, t, n) {
      var _Vr;
      return (_Vr = Vr) !== null && _Vr !== void 0 ? _Vr : Vr = new Promise(function (r) {
        var s = function s(i) {
            var _i$data = i.data,
              a = _i$data.cmd,
              l = _i$data.scope,
              c = _i$data.context,
              u = i.ports;
            if (a === "webext-port-offer" && l === t && c !== e) return window.removeEventListener("message", s), u[0].onmessage = n, u[0].postMessage("port-accepted"), r(u[0]);
          },
          o = function o() {
            var i = new MessageChannel();
            i.port1.onmessage = function (a) {
              if (a.data === "port-accepted") return window.removeEventListener("message", s), r(i.port1);
              n == null || n(a);
            }, window.postMessage({
              cmd: "webext-port-offer",
              scope: t,
              context: e
            }, "*", [i.port2]);
          };
        window.addEventListener("message", s), e === "window" ? setTimeout(o, 0) : o();
      });
    },
    yu = function yu(e) {
      var t,
        n = !1,
        r,
        s;
      return {
        enable: function enable() {
          return n = !0;
        },
        onMessage: function onMessage(o) {
          return r = o;
        },
        postMessage: function () {
          var _postMessage = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3(o) {
            return _regeneratorRuntime().wrap(function _callee3$(_context3) {
              while (1) switch (_context3.prev = _context3.next) {
                case 0:
                  if (!(e !== "content-script" && e !== "window")) {
                    _context3.next = 2;
                    break;
                  }
                  throw new Error("Endpoint does not use postMessage");
                case 2:
                  if (n) {
                    _context3.next = 4;
                    break;
                  }
                  throw new Error("Communication with window has not been allowed");
                case 4:
                  _u(t);
                  _context3.next = 7;
                  return s;
                case 7:
                  return _context3.abrupt("return", _context3.sent.postMessage(o));
                case 8:
                case "end":
                  return _context3.stop();
              }
            }, _callee3);
          }));
          function postMessage(_x8) {
            return _postMessage.apply(this, arguments);
          }
          return postMessage;
        }(),
        setNamespace: function setNamespace(o) {
          if (t) throw new Error("Namespace once set cannot be changed");
          t = o, s = wu(e, o, function (_ref32) {
            var i = _ref32.data;
            return r == null ? void 0 : r(i);
          });
        }
      };
    };
  function _u(e) {
    if (typeof e != "string" || e.trim().length === 0) throw new Error("webext-bridge uses window.postMessage to talk with other \"window\"(s) for message routingwhich is global/conflicting operation in case there are other scripts using webext-bridge. Call Bridge#setNamespace(nsps) to isolate your app. Example: setNamespace('com.facebook.react-devtools'). Make sure to use same namespace across all your scripts whereever window.postMessage is likely to be used`");
  }
  var Eu = Object.defineProperty,
    vu = Object.defineProperties,
    Mu = Object.getOwnPropertyDescriptors,
    ai = Object.getOwnPropertySymbols,
    Tu = Object.prototype.hasOwnProperty,
    Cu = Object.prototype.propertyIsEnumerable,
    li = function li(e, t, n) {
      return t in e ? Eu(e, t, {
        enumerable: !0,
        configurable: !0,
        writable: !0,
        value: n
      }) : e[t] = n;
    },
    ut = function ut(e, t) {
      for (var n in t || (t = {})) Tu.call(t, n) && li(e, n, t[n]);
      if (ai) {
        var _iterator6 = _createForOfIteratorHelper(ai(t)),
          _step6;
        try {
          for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
            var n = _step6.value;
            Cu.call(t, n) && li(e, n, t[n]);
          }
        } catch (err) {
          _iterator6.e(err);
        } finally {
          _iterator6.f();
        }
      }
      return e;
    },
    Qr = function Qr(e, t) {
      return vu(e, Mu(t));
    },
    Su = /^((?:background$)|devtools|popup|options|content-script|window)(?:@(\d+)(?:\.(\d+))?)?$/,
    Zr = function Zr(e) {
      var _ref33 = e.match(Su) || [],
        _ref34 = _slicedToArray(_ref33, 4),
        t = _ref34[1],
        n = _ref34[2],
        r = _ref34[3];
      return {
        context: t,
        tabId: +n,
        frameId: r ? +r : void 0
      };
    },
    zn = function zn(_ref35) {
      var e = _ref35.context,
        t = _ref35.tabId,
        n = _ref35.frameId;
      return ["background", "popup", "options"].includes(e) ? e : "".concat(e, "@").concat(t).concat(n ? ".".concat(n) : "");
    };
  var Ou = [{
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
    Xr = Symbol(".toJSON was called"),
    Iu = function Iu(e) {
      e[Xr] = !0;
      var t = e.toJSON();
      return delete e[Xr], t;
    },
    ci = function ci(_ref36) {
      var e = _ref36.from,
        t = _ref36.seen,
        n = _ref36.to_,
        r = _ref36.forceEnumerable,
        s = _ref36.maxDepth,
        o = _ref36.depth;
      var i = n || (Array.isArray(e) ? [] : {});
      if (t.push(e), o >= s) return i;
      if (typeof e.toJSON == "function" && e[Xr] !== !0) return Iu(e);
      for (var _i2 = 0, _Object$entries = Object.entries(e); _i2 < _Object$entries.length; _i2++) {
        var _Object$entries$_i = _slicedToArray(_Object$entries[_i2], 2),
          a = _Object$entries$_i[0],
          l = _Object$entries$_i[1];
        if (typeof Buffer == "function" && Buffer.isBuffer(l)) {
          i[a] = "[object Buffer]";
          continue;
        }
        if (l !== null && _typeof(l) == "object" && typeof l.pipe == "function") {
          i[a] = "[object Stream]";
          continue;
        }
        if (typeof l != "function") {
          if (!l || _typeof(l) != "object") {
            i[a] = l;
            continue;
          }
          if (!t.includes(e[a])) {
            o++, i[a] = ci({
              from: e[a],
              seen: _toConsumableArray(t),
              forceEnumerable: r,
              maxDepth: s,
              depth: o
            });
            continue;
          }
          i[a] = "[Circular]";
        }
      }
      for (var _i3 = 0, _Ou = Ou; _i3 < _Ou.length; _i3++) {
        var _Ou$_i = _Ou[_i3],
          _a4 = _Ou$_i.property,
          _l4 = _Ou$_i.enumerable;
        typeof e[_a4] == "string" && Object.defineProperty(i, _a4, {
          value: e[_a4],
          enumerable: r ? !0 : _l4,
          configurable: !0,
          writable: !0
        });
      }
      return i;
    };
  function Nu(e) {
    var t = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var _t$maxDepth = t.maxDepth,
      n = _t$maxDepth === void 0 ? Number.POSITIVE_INFINITY : _t$maxDepth;
    return _typeof(e) == "object" && e !== null ? ci({
      from: e,
      seen: [],
      forceEnumerable: !0,
      maxDepth: n,
      depth: 0
    }) : typeof e == "function" ? "[Function: ".concat(e.name || "anonymous", "]") : e;
  }
  var ui = function ui() {
    return {
      events: {},
      emit: function emit(e) {
        for (var _len18 = arguments.length, t = new Array(_len18 > 1 ? _len18 - 1 : 0), _key18 = 1; _key18 < _len18; _key18++) {
          t[_key18 - 1] = arguments[_key18];
        }
        (this.events[e] || []).forEach(function (n) {
          return n.apply(void 0, t);
        });
      },
      on: function on(e, t) {
        var _this5 = this;
        return (this.events[e] = this.events[e] || []).push(t), function () {
          return _this5.events[e] = (_this5.events[e] || []).filter(function (n) {
            return n !== t;
          });
        };
      }
    };
  };
  var fi = function fi(e, t, n) {
      var r = Bn(),
        s = new Map(),
        o = new Map(),
        i = function i(a) {
          if (a.destination.context === e && !a.destination.frameId && !a.destination.tabId) {
            n == null || n(a);
            var l = a.transactionId,
              c = a.messageID,
              u = a.messageType,
              d = function d() {
                var m = s.get(l);
                if (m) {
                  var h = a.err,
                    _ = a.data;
                  if (h) {
                    var I = h,
                      R = self[I.name],
                      U = new (typeof R == "function" ? R : Error)(I.message);
                    for (var L in I) U[L] = I[L];
                    m.reject(U);
                  } else m.resolve(_);
                  s.delete(l);
                }
              },
              A = /*#__PURE__*/function () {
                var _ref37 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee4() {
                  var m, h, _, I;
                  return _regeneratorRuntime().wrap(function _callee4$(_context4) {
                    while (1) switch (_context4.prev = _context4.next) {
                      case 0:
                        _ = !1;
                        _context4.prev = 1;
                        I = o.get(c);
                        if (!(typeof I == "function")) {
                          _context4.next = 9;
                          break;
                        }
                        _context4.next = 6;
                        return I({
                          sender: a.origin,
                          id: c,
                          data: a.data,
                          timestamp: a.timestamp
                        });
                      case 6:
                        m = _context4.sent;
                        _context4.next = 10;
                        break;
                      case 9:
                        throw _ = !0, new Error("[webext-bridge] No handler registered in '".concat(e, "' to accept messages with id '").concat(c, "'"));
                      case 10:
                        _context4.next = 15;
                        break;
                      case 12:
                        _context4.prev = 12;
                        _context4.t0 = _context4["catch"](1);
                        h = _context4.t0;
                      case 15:
                        _context4.prev = 15;
                        if (!(h && (a.err = Nu(h)), i(Qr(ut({}, a), {
                          messageType: "reply",
                          data: m,
                          origin: {
                            context: e,
                            tabId: null
                          },
                          destination: a.origin,
                          hops: []
                        })), h && !_)) {
                          _context4.next = 18;
                          break;
                        }
                        throw m;
                      case 18:
                        return _context4.finish(15);
                      case 19:
                      case "end":
                        return _context4.stop();
                    }
                  }, _callee4, null, [[1, 12, 15, 19]]);
                }));
                return function A() {
                  return _ref37.apply(this, arguments);
                };
              }();
            switch (u) {
              case "reply":
                return d();
              case "message":
                return A();
            }
          }
          return a.hops.push("".concat(e, "::").concat(r)), t(a);
        };
      return {
        handleMessage: i,
        endTransaction: function endTransaction(a) {
          var l = s.get(a);
          l == null || l.reject("Transaction was ended before it could complete"), s.delete(a);
        },
        sendMessage: function sendMessage(a, l) {
          var c = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "background";
          var u = typeof c == "string" ? Zr(c) : c,
            d = "Bridge#sendMessage ->";
          if (!u.context) throw new TypeError("".concat(d, " Destination must be any one of known destinations"));
          return new Promise(function (A, m) {
            var h = {
              messageID: a,
              data: l,
              destination: u,
              messageType: "message",
              transactionId: Bn(),
              origin: {
                context: e,
                tabId: null
              },
              hops: [],
              timestamp: Date.now()
            };
            s.set(h.transactionId, {
              resolve: A,
              reject: m
            });
            try {
              i(h);
            } catch (_) {
              s.delete(h.transactionId), m(_);
            }
          });
        },
        onMessage: function onMessage(a, l) {
          return o.set(a, l), function () {
            return o.delete(a);
          };
        }
      };
    },
    kt = /*#__PURE__*/function () {
      function kt(e, t) {
        var _this6 = this;
        _classCallCheck(this, kt);
        this.endpointRuntime = e, this.streamInfo = t, this.emitter = ui(), this.isClosed = !1, this.handleStreamClose = function () {
          _this6.isClosed || (_this6.isClosed = !0, _this6.emitter.emit("closed", !0), _this6.emitter.events = {});
        }, kt.initDone || (e.onMessage("__crx_bridge_stream_transfer__", function (n) {
          var _n$data = n.data,
            r = _n$data.streamId,
            s = _n$data.streamTransfer,
            o = _n$data.action,
            i = kt.openStreams.get(r);
          i && !i.isClosed && (o === "transfer" && i.emitter.emit("message", s), o === "close" && (kt.openStreams.delete(r), i.handleStreamClose()));
        }), kt.initDone = !0), kt.openStreams.set(this.streamInfo.streamId, this);
      }
      _createClass(kt, [{
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
          var n = this.emitter.on(e, t);
          return Object.assign(n, {
            dispose: n,
            close: n
          });
        }
      }]);
      return kt;
    }(),
    Hn = kt;
  Hn.initDone = !1, Hn.openStreams = new Map();
  var di = function di(e) {
      var t = new Map(),
        n = new Map(),
        r = ui();
      e.onMessage("__crx_bridge_stream_open__", function (i) {
        return new Promise(function (a) {
          var l = i.sender,
            c = i.data,
            u = c.channel;
          var d = !1,
            A = function A() {};
          var m = function m() {
            var h = n.get(u);
            typeof h == "function" ? (h(new Hn(e, Qr(ut({}, c), {
              endpoint: l
            }))), d && A(), a(!0)) : d || (d = !0, A = r.on("did-change-stream-callbacks", m));
          };
          m();
        });
      });
      function s(_x9, _x10) {
        return _s3.apply(this, arguments);
      }
      function _s3() {
        _s3 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee5(i, a) {
          var l, c, u;
          return _regeneratorRuntime().wrap(function _callee5$(_context5) {
            while (1) switch (_context5.prev = _context5.next) {
              case 0:
                if (!t.has(i)) {
                  _context5.next = 2;
                  break;
                }
                throw new Error("webext-bridge: A Stream is already open at this channel");
              case 2:
                l = typeof a == "string" ? Zr(a) : a, c = {
                  streamId: Bn(),
                  channel: i,
                  endpoint: l
                }, u = new Hn(e, c);
                u.onClose(function () {
                  return t.delete(i);
                });
                _context5.next = 6;
                return e.sendMessage("__crx_bridge_stream_open__", c, l);
              case 6:
                t.set(i, u);
                return _context5.abrupt("return", u);
              case 8:
              case "end":
                return _context5.stop();
            }
          }, _callee5);
        }));
        return _s3.apply(this, arguments);
      }
      function o(i, a) {
        if (n.has(i)) throw new Error("webext-bridge: This channel has already been claimed. Stream allows only one-on-one communication");
        n.set(i, a), r.emit("did-change-stream-callbacks");
      }
      return {
        openStream: s,
        onOpenStreamChannel: o
      };
    },
    Gr = yu("content-script"),
    es = bu(),
    nn = fi("content-script", function (e) {
      e.destination.context === "window" ? Gr.postMessage(e) : es.postMessage(e);
    });
  Gr.onMessage(function (e) {
    e.origin = {
      context: "window",
      tabId: null
    }, nn.handleMessage(e);
  }), es.onMessage(nn.handleMessage), es.onFailure(function (e) {
    if (e.origin.context === "window") {
      Gr.postMessage({
        type: "error",
        transactionID: e.transactionId
      });
      return;
    }
    nn.endTransaction(e.transactionId);
  });
  var jt = nn.sendMessage,
    ts = nn.onMessage;
  di(nn);
  var Pu = {
      removeItem: function removeItem(e) {
        return Le.storage.local.remove(e);
      },
      setItem: function setItem(e, t) {
        return Le.storage.local.set(_defineProperty({}, e, t));
      },
      getItem: function getItem(e) {
        return _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee6() {
          return _regeneratorRuntime().wrap(function _callee6$(_context6) {
            while (1) switch (_context6.prev = _context6.next) {
              case 0:
                _context6.next = 2;
                return Le.storage.local.get(e);
              case 2:
                _context6.t0 = e;
                return _context6.abrupt("return", _context6.sent[_context6.t0]);
              case 4:
              case "end":
                return _context6.stop();
            }
          }, _callee6);
        }))();
      }
    },
    ns = function ns(e, t, n) {
      return lu(e, t, Pu, n);
    },
    gi = "KDOCS_EXT_ConfigLocalStorage_config",
    rs = "KDOCS_EXT_ConfigLocalStorage_Global",
    ss = "KDOCS_EXT_ConvertInfoLocalStorage_Global",
    os = {
      successOpen: !0,
      selectPopup: !1,
      partWebPageDisplay: !0,
      cantShowEditPopup: !1,
      shortcuts: !0
    },
    mi = function mi() {
      function e() {
        return ns(gi, os);
      }
      function t() {
        return _t5.apply(this, arguments);
      }
      function _t5() {
        _t5 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee7() {
          var n, r;
          return _regeneratorRuntime().wrap(function _callee7$(_context7) {
            while (1) switch (_context7.prev = _context7.next) {
              case 0:
                _context7.prev = 0;
                n = gi;
                _context7.next = 4;
                return Le.storage.local.get(n);
              case 4:
                _context7.t0 = n;
                r = _context7.sent[_context7.t0];
                _context7.prev = 6;
                return _context7.abrupt("return", JSON.parse(r));
              case 10:
                _context7.prev = 10;
                _context7.t1 = _context7["catch"](6);
                return _context7.abrupt("return", r || os);
              case 13:
                _context7.next = 18;
                break;
              case 15:
                _context7.prev = 15;
                _context7.t2 = _context7["catch"](0);
                return _context7.abrupt("return", os);
              case 18:
              case "end":
                return _context7.stop();
            }
          }, _callee7, null, [[0, 15], [6, 10]]);
        }));
        return _t5.apply(this, arguments);
      }
      return {
        getSettingConfigs: e,
        getSettingConfigsNoRef: t
      };
    };
  function hi(e, t) {
    return function () {
      return e.apply(t, arguments);
    };
  }
  var Du = Object.prototype.toString,
    is = Object.getPrototypeOf,
    Wn = function (e) {
      return function (t) {
        var n = Du.call(t);
        return e[n] || (e[n] = n.slice(8, -1).toLowerCase());
      };
    }(Object.create(null)),
    Ke = function Ke(e) {
      return e = e.toLowerCase(), function (t) {
        return Wn(t) === e;
      };
    },
    qn = function qn(e) {
      return function (t) {
        return _typeof(t) === e;
      };
    },
    Lt = Array.isArray,
    rn = qn("undefined");
  function Ru(e) {
    return e !== null && !rn(e) && e.constructor !== null && !rn(e.constructor) && Ie(e.constructor.isBuffer) && e.constructor.isBuffer(e);
  }
  var pi = Ke("ArrayBuffer");
  function ku(e) {
    var t;
    return (typeof ArrayBuffer === "undefined" ? "undefined" : _typeof(ArrayBuffer)) < "u" && ArrayBuffer.isView ? t = ArrayBuffer.isView(e) : t = e && e.buffer && pi(e.buffer), t;
  }
  var ju = qn("string"),
    Ie = qn("function"),
    Ai = qn("number"),
    Kn = function Kn(e) {
      return e !== null && _typeof(e) == "object";
    },
    Lu = function Lu(e) {
      return e === !0 || e === !1;
    },
    Jn = function Jn(e) {
      if (Wn(e) !== "object") return !1;
      var t = is(e);
      return (t === null || t === Object.prototype || Object.getPrototypeOf(t) === null) && !(Symbol.toStringTag in e) && !(Symbol.iterator in e);
    },
    $u = Ke("Date"),
    Fu = Ke("File"),
    Uu = Ke("Blob"),
    Bu = Ke("FileList"),
    zu = function zu(e) {
      return Kn(e) && Ie(e.pipe);
    },
    Hu = function Hu(e) {
      var t;
      return e && (typeof FormData == "function" && e instanceof FormData || Ie(e.append) && ((t = Wn(e)) === "formdata" || t === "object" && Ie(e.toString) && e.toString() === "[object FormData]"));
    },
    Wu = Ke("URLSearchParams"),
    qu = function qu(e) {
      return e.trim ? e.trim() : e.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
    };
  function sn(e, t) {
    var _ref38 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
      _ref38$allOwnKeys = _ref38.allOwnKeys,
      n = _ref38$allOwnKeys === void 0 ? !1 : _ref38$allOwnKeys;
    if (e === null || _typeof(e) > "u") return;
    var r, s;
    if (_typeof(e) != "object" && (e = [e]), Lt(e)) for (r = 0, s = e.length; r < s; r++) t.call(null, e[r], r, e);else {
      var o = n ? Object.getOwnPropertyNames(e) : Object.keys(e),
        i = o.length;
      var a;
      for (r = 0; r < i; r++) a = o[r], t.call(null, e[a], a, e);
    }
  }
  function xi(e, t) {
    t = t.toLowerCase();
    var n = Object.keys(e);
    var r = n.length,
      s;
    for (; r-- > 0;) if (s = n[r], t === s.toLowerCase()) return s;
    return null;
  }
  var bi = function () {
      return (typeof globalThis === "undefined" ? "undefined" : _typeof(globalThis)) < "u" ? globalThis : (typeof self === "undefined" ? "undefined" : _typeof(self)) < "u" ? self : (typeof window === "undefined" ? "undefined" : _typeof(window)) < "u" ? window : global;
    }(),
    wi = function wi(e) {
      return !rn(e) && e !== bi;
    };
  function as() {
    var _ref39 = wi(this) && this || {},
      e = _ref39.caseless,
      t = {},
      n = function n(r, s) {
        var o = e && xi(t, s) || s;
        Jn(t[o]) && Jn(r) ? t[o] = as(t[o], r) : Jn(r) ? t[o] = as({}, r) : Lt(r) ? t[o] = r.slice() : t[o] = r;
      };
    for (var r = 0, s = arguments.length; r < s; r++) arguments[r] && sn(arguments[r], n);
    return t;
  }
  var Ku = function Ku(e, t, n) {
      var _ref40 = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {},
        r = _ref40.allOwnKeys;
      return sn(t, function (s, o) {
        n && Ie(s) ? e[o] = hi(s, n) : e[o] = s;
      }, {
        allOwnKeys: r
      }), e;
    },
    Ju = function Ju(e) {
      return e.charCodeAt(0) === 65279 && (e = e.slice(1)), e;
    },
    Yu = function Yu(e, t, n, r) {
      e.prototype = Object.create(t.prototype, r), e.prototype.constructor = e, Object.defineProperty(e, "super", {
        value: t.prototype
      }), n && Object.assign(e.prototype, n);
    },
    Vu = function Vu(e, t, n, r) {
      var s, o, i;
      var a = {};
      if (t = t || {}, e == null) return t;
      do {
        for (s = Object.getOwnPropertyNames(e), o = s.length; o-- > 0;) i = s[o], (!r || r(i, e, t)) && !a[i] && (t[i] = e[i], a[i] = !0);
        e = n !== !1 && is(e);
      } while (e && (!n || n(e, t)) && e !== Object.prototype);
      return t;
    },
    Qu = function Qu(e, t, n) {
      e = String(e), (n === void 0 || n > e.length) && (n = e.length), n -= t.length;
      var r = e.indexOf(t, n);
      return r !== -1 && r === n;
    },
    Zu = function Zu(e) {
      if (!e) return null;
      if (Lt(e)) return e;
      var t = e.length;
      if (!Ai(t)) return null;
      var n = new Array(t);
      for (; t-- > 0;) n[t] = e[t];
      return n;
    },
    Xu = function (e) {
      return function (t) {
        return e && t instanceof e;
      };
    }((typeof Uint8Array === "undefined" ? "undefined" : _typeof(Uint8Array)) < "u" && is(Uint8Array)),
    Gu = function Gu(e, t) {
      var r = (e && e[Symbol.iterator]).call(e);
      var s;
      for (; (s = r.next()) && !s.done;) {
        var o = s.value;
        t.call(e, o[0], o[1]);
      }
    },
    ef = function ef(e, t) {
      var n;
      var r = [];
      for (; (n = e.exec(t)) !== null;) r.push(n);
      return r;
    },
    tf = Ke("HTMLFormElement"),
    nf = function nf(e) {
      return e.toLowerCase().replace(/[-_\s]([a-z\d])(\w*)/g, function (n, r, s) {
        return r.toUpperCase() + s;
      });
    },
    yi = function (_ref41) {
      var e = _ref41.hasOwnProperty;
      return function (t, n) {
        return e.call(t, n);
      };
    }(Object.prototype),
    rf = Ke("RegExp"),
    _i = function _i(e, t) {
      var n = Object.getOwnPropertyDescriptors(e),
        r = {};
      sn(n, function (s, o) {
        t(s, o, e) !== !1 && (r[o] = s);
      }), Object.defineProperties(e, r);
    },
    sf = function sf(e) {
      _i(e, function (t, n) {
        if (Ie(e) && ["arguments", "caller", "callee"].indexOf(n) !== -1) return !1;
        var r = e[n];
        if (Ie(r)) {
          if (t.enumerable = !1, "writable" in t) {
            t.writable = !1;
            return;
          }
          t.set || (t.set = function () {
            throw Error("Can not rewrite read-only method '" + n + "'");
          });
        }
      });
    },
    of = function of(e, t) {
      var n = {},
        r = function r(s) {
          s.forEach(function (o) {
            n[o] = !0;
          });
        };
      return Lt(e) ? r(e) : r(String(e).split(t)), n;
    },
    af = function af() {},
    lf = function lf(e, t) {
      return e = +e, Number.isFinite(e) ? e : t;
    },
    ls = "abcdefghijklmnopqrstuvwxyz",
    Ei = "0123456789",
    vi = {
      DIGIT: Ei,
      ALPHA: ls,
      ALPHA_DIGIT: ls + ls.toUpperCase() + Ei
    },
    cf = function cf() {
      var e = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 16;
      var t = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : vi.ALPHA_DIGIT;
      var n = "";
      var r = t.length;
      for (; e--;) n += t[Math.random() * r | 0];
      return n;
    };
  function uf(e) {
    return !!(e && Ie(e.append) && e[Symbol.toStringTag] === "FormData" && e[Symbol.iterator]);
  }
  var ff = function ff(e) {
      var t = new Array(10),
        n = function n(r, s) {
          if (Kn(r)) {
            if (t.indexOf(r) >= 0) return;
            if (!("toJSON" in r)) {
              t[s] = r;
              var o = Lt(r) ? [] : {};
              return sn(r, function (i, a) {
                var l = n(i, s + 1);
                !rn(l) && (o[a] = l);
              }), t[s] = void 0, o;
            }
          }
          return r;
        };
      return n(e, 0);
    },
    df = Ke("AsyncFunction"),
    E = {
      isArray: Lt,
      isArrayBuffer: pi,
      isBuffer: Ru,
      isFormData: Hu,
      isArrayBufferView: ku,
      isString: ju,
      isNumber: Ai,
      isBoolean: Lu,
      isObject: Kn,
      isPlainObject: Jn,
      isUndefined: rn,
      isDate: $u,
      isFile: Fu,
      isBlob: Uu,
      isRegExp: rf,
      isFunction: Ie,
      isStream: zu,
      isURLSearchParams: Wu,
      isTypedArray: Xu,
      isFileList: Bu,
      forEach: sn,
      merge: as,
      extend: Ku,
      trim: qu,
      stripBOM: Ju,
      inherits: Yu,
      toFlatObject: Vu,
      kindOf: Wn,
      kindOfTest: Ke,
      endsWith: Qu,
      toArray: Zu,
      forEachEntry: Gu,
      matchAll: ef,
      isHTMLForm: tf,
      hasOwnProperty: yi,
      hasOwnProp: yi,
      reduceDescriptors: _i,
      freezeMethods: sf,
      toObjectSet: of,
      toCamelCase: nf,
      noop: af,
      toFiniteNumber: lf,
      findKey: xi,
      global: bi,
      isContextDefined: wi,
      ALPHABET: vi,
      generateString: cf,
      isSpecCompliantForm: uf,
      toJSONObject: ff,
      isAsyncFn: df,
      isThenable: function isThenable(e) {
        return e && (Kn(e) || Ie(e)) && Ie(e.then) && Ie(e.catch);
      }
    };
  function ne(e, t, n, r, s) {
    Error.call(this), Error.captureStackTrace ? Error.captureStackTrace(this, this.constructor) : this.stack = new Error().stack, this.message = e, this.name = "AxiosError", t && (this.code = t), n && (this.config = n), r && (this.request = r), s && (this.response = s);
  }
  E.inherits(ne, Error, {
    toJSON: function toJSON() {
      return {
        message: this.message,
        name: this.name,
        description: this.description,
        number: this.number,
        fileName: this.fileName,
        lineNumber: this.lineNumber,
        columnNumber: this.columnNumber,
        stack: this.stack,
        config: E.toJSONObject(this.config),
        code: this.code,
        status: this.response && this.response.status ? this.response.status : null
      };
    }
  });
  var Mi = ne.prototype,
    Ti = {};
  ["ERR_BAD_OPTION_VALUE", "ERR_BAD_OPTION", "ECONNABORTED", "ETIMEDOUT", "ERR_NETWORK", "ERR_FR_TOO_MANY_REDIRECTS", "ERR_DEPRECATED", "ERR_BAD_RESPONSE", "ERR_BAD_REQUEST", "ERR_CANCELED", "ERR_NOT_SUPPORT", "ERR_INVALID_URL"].forEach(function (e) {
    Ti[e] = {
      value: e
    };
  }), Object.defineProperties(ne, Ti), Object.defineProperty(Mi, "isAxiosError", {
    value: !0
  }), ne.from = function (e, t, n, r, s, o) {
    var i = Object.create(Mi);
    return E.toFlatObject(e, i, function (l) {
      return l !== Error.prototype;
    }, function (a) {
      return a !== "isAxiosError";
    }), ne.call(i, e.message, t, n, r, s), i.cause = e, i.name = e.name, o && Object.assign(i, o), i;
  };
  var gf = null;
  function cs(e) {
    return E.isPlainObject(e) || E.isArray(e);
  }
  function Ci(e) {
    return E.endsWith(e, "[]") ? e.slice(0, -2) : e;
  }
  function Si(e, t, n) {
    return e ? e.concat(t).map(function (s, o) {
      return s = Ci(s), !n && o ? "[" + s + "]" : s;
    }).join(n ? "." : "") : t;
  }
  function mf(e) {
    return E.isArray(e) && !e.some(cs);
  }
  var hf = E.toFlatObject(E, {}, null, function (t) {
    return /^is[A-Z]/.test(t);
  });
  function Yn(e, t, n) {
    if (!E.isObject(e)) throw new TypeError("target must be an object");
    t = t || new FormData(), n = E.toFlatObject(n, {
      metaTokens: !0,
      dots: !1,
      indexes: !1
    }, !1, function (_, I) {
      return !E.isUndefined(I[_]);
    });
    var r = n.metaTokens,
      s = n.visitor || u,
      o = n.dots,
      i = n.indexes,
      l = (n.Blob || (typeof Blob === "undefined" ? "undefined" : _typeof(Blob)) < "u" && Blob) && E.isSpecCompliantForm(t);
    if (!E.isFunction(s)) throw new TypeError("visitor must be a function");
    function c(h) {
      if (h === null) return "";
      if (E.isDate(h)) return h.toISOString();
      if (!l && E.isBlob(h)) throw new ne("Blob is not supported. Use a Buffer instead.");
      return E.isArrayBuffer(h) || E.isTypedArray(h) ? l && typeof Blob == "function" ? new Blob([h]) : Buffer.from(h) : h;
    }
    function u(h, _, I) {
      var R = h;
      if (h && !I && _typeof(h) == "object") {
        if (E.endsWith(_, "{}")) _ = r ? _ : _.slice(0, -2), h = JSON.stringify(h);else if (E.isArray(h) && mf(h) || (E.isFileList(h) || E.endsWith(_, "[]")) && (R = E.toArray(h))) return _ = Ci(_), R.forEach(function (L, B) {
          !(E.isUndefined(L) || L === null) && t.append(i === !0 ? Si([_], B, o) : i === null ? _ : _ + "[]", c(L));
        }), !1;
      }
      return cs(h) ? !0 : (t.append(Si(I, _, o), c(h)), !1);
    }
    var d = [],
      A = Object.assign(hf, {
        defaultVisitor: u,
        convertValue: c,
        isVisitable: cs
      });
    function m(h, _) {
      if (!E.isUndefined(h)) {
        if (d.indexOf(h) !== -1) throw Error("Circular reference detected in " + _.join("."));
        d.push(h), E.forEach(h, function (R, U) {
          (!(E.isUndefined(R) || R === null) && s.call(t, R, E.isString(U) ? U.trim() : U, _, A)) === !0 && m(R, _ ? _.concat(U) : [U]);
        }), d.pop();
      }
    }
    if (!E.isObject(e)) throw new TypeError("data must be an object");
    return m(e), t;
  }
  function Oi(e) {
    var t = {
      "!": "%21",
      "'": "%27",
      "(": "%28",
      ")": "%29",
      "~": "%7E",
      "%20": "+",
      "%00": "\0"
    };
    return encodeURIComponent(e).replace(/[!'()~]|%20|%00/g, function (r) {
      return t[r];
    });
  }
  function us(e, t) {
    this._pairs = [], e && Yn(e, this, t);
  }
  var Ii = us.prototype;
  Ii.append = function (t, n) {
    this._pairs.push([t, n]);
  }, Ii.toString = function (t) {
    var n = t ? function (r) {
      return t.call(this, r, Oi);
    } : Oi;
    return this._pairs.map(function (s) {
      return n(s[0]) + "=" + n(s[1]);
    }, "").join("&");
  };
  function pf(e) {
    return encodeURIComponent(e).replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "+").replace(/%5B/gi, "[").replace(/%5D/gi, "]");
  }
  function Ni(e, t, n) {
    if (!t) return e;
    var r = n && n.encode || pf,
      s = n && n.serialize;
    var o;
    if (s ? o = s(t, n) : o = E.isURLSearchParams(t) ? t.toString() : new us(t, n).toString(r), o) {
      var i = e.indexOf("#");
      i !== -1 && (e = e.slice(0, i)), e += (e.indexOf("?") === -1 ? "?" : "&") + o;
    }
    return e;
  }
  var Af = /*#__PURE__*/function () {
    function Af() {
      _classCallCheck(this, Af);
      this.handlers = [];
    }
    _createClass(Af, [{
      key: "use",
      value: function use(t, n, r) {
        return this.handlers.push({
          fulfilled: t,
          rejected: n,
          synchronous: r ? r.synchronous : !1,
          runWhen: r ? r.runWhen : null
        }), this.handlers.length - 1;
      }
    }, {
      key: "eject",
      value: function eject(t) {
        this.handlers[t] && (this.handlers[t] = null);
      }
    }, {
      key: "clear",
      value: function clear() {
        this.handlers && (this.handlers = []);
      }
    }, {
      key: "forEach",
      value: function forEach(t) {
        E.forEach(this.handlers, function (r) {
          r !== null && t(r);
        });
      }
    }]);
    return Af;
  }();
  var Pi = Af,
    Di = {
      silentJSONParsing: !0,
      forcedJSONParsing: !0,
      clarifyTimeoutError: !1
    },
    xf = (typeof URLSearchParams === "undefined" ? "undefined" : _typeof(URLSearchParams)) < "u" ? URLSearchParams : us,
    bf = (typeof FormData === "undefined" ? "undefined" : _typeof(FormData)) < "u" ? FormData : null,
    wf = (typeof Blob === "undefined" ? "undefined" : _typeof(Blob)) < "u" ? Blob : null,
    yf = function () {
      var e;
      return (typeof navigator === "undefined" ? "undefined" : _typeof(navigator)) < "u" && ((e = navigator.product) === "ReactNative" || e === "NativeScript" || e === "NS") ? !1 : (typeof window === "undefined" ? "undefined" : _typeof(window)) < "u" && (typeof document === "undefined" ? "undefined" : _typeof(document)) < "u";
    }(),
    _f = function () {
      return (typeof WorkerGlobalScope === "undefined" ? "undefined" : _typeof(WorkerGlobalScope)) < "u" && self instanceof WorkerGlobalScope && typeof self.importScripts == "function";
    }(),
    Je = {
      isBrowser: !0,
      classes: {
        URLSearchParams: xf,
        FormData: bf,
        Blob: wf
      },
      isStandardBrowserEnv: yf,
      isStandardBrowserWebWorkerEnv: _f,
      protocols: ["http", "https", "file", "blob", "url", "data"]
    };
  function Ef(e, t) {
    return Yn(e, new Je.classes.URLSearchParams(), Object.assign({
      visitor: function visitor(n, r, s, o) {
        return Je.isNode && E.isBuffer(n) ? (this.append(r, n.toString("base64")), !1) : o.defaultVisitor.apply(this, arguments);
      }
    }, t));
  }
  function vf(e) {
    return E.matchAll(/\w+|\[(\w*)]/g, e).map(function (t) {
      return t[0] === "[]" ? "" : t[1] || t[0];
    });
  }
  function Mf(e) {
    var t = {},
      n = Object.keys(e);
    var r;
    var s = n.length;
    var o;
    for (r = 0; r < s; r++) o = n[r], t[o] = e[o];
    return t;
  }
  function Ri(e) {
    function t(n, r, s, o) {
      var i = n[o++];
      var a = Number.isFinite(+i),
        l = o >= n.length;
      return i = !i && E.isArray(s) ? s.length : i, l ? (E.hasOwnProp(s, i) ? s[i] = [s[i], r] : s[i] = r, !a) : ((!s[i] || !E.isObject(s[i])) && (s[i] = []), t(n, r, s[i], o) && E.isArray(s[i]) && (s[i] = Mf(s[i])), !a);
    }
    if (E.isFormData(e) && E.isFunction(e.entries)) {
      var n = {};
      return E.forEachEntry(e, function (r, s) {
        t(vf(r), s, n, 0);
      }), n;
    }
    return null;
  }
  var Tf = {
    "Content-Type": void 0
  };
  function Cf(e, t, n) {
    if (E.isString(e)) try {
      return (t || JSON.parse)(e), E.trim(e);
    } catch (r) {
      if (r.name !== "SyntaxError") throw r;
    }
    return (n || JSON.stringify)(e);
  }
  var Vn = {
    transitional: Di,
    adapter: ["xhr", "http"],
    transformRequest: [function (t, n) {
      var r = n.getContentType() || "",
        s = r.indexOf("application/json") > -1,
        o = E.isObject(t);
      if (o && E.isHTMLForm(t) && (t = new FormData(t)), E.isFormData(t)) return s && s ? JSON.stringify(Ri(t)) : t;
      if (E.isArrayBuffer(t) || E.isBuffer(t) || E.isStream(t) || E.isFile(t) || E.isBlob(t)) return t;
      if (E.isArrayBufferView(t)) return t.buffer;
      if (E.isURLSearchParams(t)) return n.setContentType("application/x-www-form-urlencoded;charset=utf-8", !1), t.toString();
      var a;
      if (o) {
        if (r.indexOf("application/x-www-form-urlencoded") > -1) return Ef(t, this.formSerializer).toString();
        if ((a = E.isFileList(t)) || r.indexOf("multipart/form-data") > -1) {
          var l = this.env && this.env.FormData;
          return Yn(a ? {
            "files[]": t
          } : t, l && new l(), this.formSerializer);
        }
      }
      return o || s ? (n.setContentType("application/json", !1), Cf(t)) : t;
    }],
    transformResponse: [function (t) {
      var n = this.transitional || Vn.transitional,
        r = n && n.forcedJSONParsing,
        s = this.responseType === "json";
      if (t && E.isString(t) && (r && !this.responseType || s)) {
        var i = !(n && n.silentJSONParsing) && s;
        try {
          return JSON.parse(t);
        } catch (a) {
          if (i) throw a.name === "SyntaxError" ? ne.from(a, ne.ERR_BAD_RESPONSE, this, null, this.response) : a;
        }
      }
      return t;
    }],
    timeout: 0,
    xsrfCookieName: "XSRF-TOKEN",
    xsrfHeaderName: "X-XSRF-TOKEN",
    maxContentLength: -1,
    maxBodyLength: -1,
    env: {
      FormData: Je.classes.FormData,
      Blob: Je.classes.Blob
    },
    validateStatus: function validateStatus(t) {
      return t >= 200 && t < 300;
    },
    headers: {
      common: {
        Accept: "application/json, text/plain, */*"
      }
    }
  };
  E.forEach(["delete", "get", "head"], function (t) {
    Vn.headers[t] = {};
  }), E.forEach(["post", "put", "patch"], function (t) {
    Vn.headers[t] = E.merge(Tf);
  });
  var fs = Vn,
    Sf = E.toObjectSet(["age", "authorization", "content-length", "content-type", "etag", "expires", "from", "host", "if-modified-since", "if-unmodified-since", "last-modified", "location", "max-forwards", "proxy-authorization", "referer", "retry-after", "user-agent"]),
    Of = function Of(e) {
      var t = {};
      var n, r, s;
      return e && e.split("\n").forEach(function (i) {
        s = i.indexOf(":"), n = i.substring(0, s).trim().toLowerCase(), r = i.substring(s + 1).trim(), !(!n || t[n] && Sf[n]) && (n === "set-cookie" ? t[n] ? t[n].push(r) : t[n] = [r] : t[n] = t[n] ? t[n] + ", " + r : r);
      }), t;
    },
    ki = Symbol("internals");
  function on(e) {
    return e && String(e).trim().toLowerCase();
  }
  function Qn(e) {
    return e === !1 || e == null ? e : E.isArray(e) ? e.map(Qn) : String(e);
  }
  function If(e) {
    var t = Object.create(null),
      n = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
    var r;
    for (; r = n.exec(e);) t[r[1]] = r[2];
    return t;
  }
  var Nf = function Nf(e) {
    return /^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(e.trim());
  };
  function ds(e, t, n, r, s) {
    if (E.isFunction(r)) return r.call(this, t, n);
    if (s && (t = n), !!E.isString(t)) {
      if (E.isString(r)) return t.indexOf(r) !== -1;
      if (E.isRegExp(r)) return r.test(t);
    }
  }
  function Pf(e) {
    return e.trim().toLowerCase().replace(/([a-z\d])(\w*)/g, function (t, n, r) {
      return n.toUpperCase() + r;
    });
  }
  function Df(e, t) {
    var n = E.toCamelCase(" " + t);
    ["get", "set", "has"].forEach(function (r) {
      Object.defineProperty(e, r + n, {
        value: function value(s, o, i) {
          return this[r].call(this, t, s, o, i);
        },
        configurable: !0
      });
    });
  }
  var Zn = /*#__PURE__*/function (_Symbol$iterator, _Symbol$toStringTag) {
    function Zn(t) {
      _classCallCheck(this, Zn);
      t && this.set(t);
    }
    _createClass(Zn, [{
      key: "set",
      value: function set(t, n, r) {
        var s = this;
        function o(a, l, c) {
          var u = on(l);
          if (!u) throw new Error("header name must be a non-empty string");
          var d = E.findKey(s, u);
          (!d || s[d] === void 0 || c === !0 || c === void 0 && s[d] !== !1) && (s[d || l] = Qn(a));
        }
        var i = function i(a, l) {
          return E.forEach(a, function (c, u) {
            return o(c, u, l);
          });
        };
        return E.isPlainObject(t) || t instanceof this.constructor ? i(t, n) : E.isString(t) && (t = t.trim()) && !Nf(t) ? i(Of(t), n) : t != null && o(n, t, r), this;
      }
    }, {
      key: "get",
      value: function get(t, n) {
        if (t = on(t), t) {
          var r = E.findKey(this, t);
          if (r) {
            var s = this[r];
            if (!n) return s;
            if (n === !0) return If(s);
            if (E.isFunction(n)) return n.call(this, s, r);
            if (E.isRegExp(n)) return n.exec(s);
            throw new TypeError("parser must be boolean|regexp|function");
          }
        }
      }
    }, {
      key: "has",
      value: function has(t, n) {
        if (t = on(t), t) {
          var r = E.findKey(this, t);
          return !!(r && this[r] !== void 0 && (!n || ds(this, this[r], r, n)));
        }
        return !1;
      }
    }, {
      key: "delete",
      value: function _delete(t, n) {
        var r = this;
        var s = !1;
        function o(i) {
          if (i = on(i), i) {
            var a = E.findKey(r, i);
            a && (!n || ds(r, r[a], a, n)) && (delete r[a], s = !0);
          }
        }
        return E.isArray(t) ? t.forEach(o) : o(t), s;
      }
    }, {
      key: "clear",
      value: function clear(t) {
        var n = Object.keys(this);
        var r = n.length,
          s = !1;
        for (; r--;) {
          var o = n[r];
          (!t || ds(this, this[o], o, t, !0)) && (delete this[o], s = !0);
        }
        return s;
      }
    }, {
      key: "normalize",
      value: function normalize(t) {
        var n = this,
          r = {};
        return E.forEach(this, function (s, o) {
          var i = E.findKey(r, o);
          if (i) {
            n[i] = Qn(s), delete n[o];
            return;
          }
          var a = t ? Pf(o) : String(o).trim();
          a !== o && delete n[o], n[a] = Qn(s), r[a] = !0;
        }), this;
      }
    }, {
      key: "concat",
      value: function concat() {
        var _this$constructor;
        for (var _len19 = arguments.length, t = new Array(_len19), _key19 = 0; _key19 < _len19; _key19++) {
          t[_key19] = arguments[_key19];
        }
        return (_this$constructor = this.constructor).concat.apply(_this$constructor, [this].concat(t));
      }
    }, {
      key: "toJSON",
      value: function toJSON(t) {
        var n = Object.create(null);
        return E.forEach(this, function (r, s) {
          r != null && r !== !1 && (n[s] = t && E.isArray(r) ? r.join(", ") : r);
        }), n;
      }
    }, {
      key: _Symbol$iterator,
      value: function value() {
        return Object.entries(this.toJSON())[Symbol.iterator]();
      }
    }, {
      key: "toString",
      value: function toString() {
        return Object.entries(this.toJSON()).map(function (_ref42) {
          var _ref43 = _slicedToArray(_ref42, 2),
            t = _ref43[0],
            n = _ref43[1];
          return t + ": " + n;
        }).join("\n");
      }
    }, {
      key: _Symbol$toStringTag,
      get: function get() {
        return "AxiosHeaders";
      }
    }], [{
      key: "from",
      value: function from(t) {
        return t instanceof this ? t : new this(t);
      }
    }, {
      key: "concat",
      value: function concat(t) {
        var r = new this(t);
        for (var _len20 = arguments.length, n = new Array(_len20 > 1 ? _len20 - 1 : 0), _key20 = 1; _key20 < _len20; _key20++) {
          n[_key20 - 1] = arguments[_key20];
        }
        return n.forEach(function (s) {
          return r.set(s);
        }), r;
      }
    }, {
      key: "accessor",
      value: function accessor(t) {
        var r = (this[ki] = this[ki] = {
            accessors: {}
          }).accessors,
          s = this.prototype;
        function o(i) {
          var a = on(i);
          r[a] || (Df(s, i), r[a] = !0);
        }
        return E.isArray(t) ? t.forEach(o) : o(t), this;
      }
    }]);
    return Zn;
  }(Symbol.iterator, Symbol.toStringTag);
  Zn.accessor(["Content-Type", "Content-Length", "Accept", "Accept-Encoding", "User-Agent", "Authorization"]), E.freezeMethods(Zn.prototype), E.freezeMethods(Zn);
  var nt = Zn;
  function gs(e, t) {
    var n = this || fs,
      r = t || n,
      s = nt.from(r.headers);
    var o = r.data;
    return E.forEach(e, function (a) {
      o = a.call(n, o, s.normalize(), t ? t.status : void 0);
    }), s.normalize(), o;
  }
  function ji(e) {
    return !!(e && e.__CANCEL__);
  }
  function an(e, t, n) {
    ne.call(this, e !== null && e !== void 0 ? e : "canceled", ne.ERR_CANCELED, t, n), this.name = "CanceledError";
  }
  E.inherits(an, ne, {
    __CANCEL__: !0
  });
  function Rf(e, t, n) {
    var r = n.config.validateStatus;
    !n.status || !r || r(n.status) ? e(n) : t(new ne("Request failed with status code " + n.status, [ne.ERR_BAD_REQUEST, ne.ERR_BAD_RESPONSE][Math.floor(n.status / 100) - 4], n.config, n.request, n));
  }
  var kf = Je.isStandardBrowserEnv ? function () {
    return {
      write: function write(n, r, s, o, i, a) {
        var l = [];
        l.push(n + "=" + encodeURIComponent(r)), E.isNumber(s) && l.push("expires=" + new Date(s).toGMTString()), E.isString(o) && l.push("path=" + o), E.isString(i) && l.push("domain=" + i), a === !0 && l.push("secure"), document.cookie = l.join("; ");
      },
      read: function read(n) {
        var r = document.cookie.match(new RegExp("(^|;\\s*)(" + n + ")=([^;]*)"));
        return r ? decodeURIComponent(r[3]) : null;
      },
      remove: function remove(n) {
        this.write(n, "", Date.now() - 864e5);
      }
    };
  }() : function () {
    return {
      write: function write() {},
      read: function read() {
        return null;
      },
      remove: function remove() {}
    };
  }();
  function jf(e) {
    return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(e);
  }
  function Lf(e, t) {
    return t ? e.replace(/\/+$/, "") + "/" + t.replace(/^\/+/, "") : e;
  }
  function Li(e, t) {
    return e && !jf(t) ? Lf(e, t) : t;
  }
  var $f = Je.isStandardBrowserEnv ? function () {
    var t = /(msie|trident)/i.test(navigator.userAgent),
      n = document.createElement("a");
    var r;
    function s(o) {
      var i = o;
      return t && (n.setAttribute("href", i), i = n.href), n.setAttribute("href", i), {
        href: n.href,
        protocol: n.protocol ? n.protocol.replace(/:$/, "") : "",
        host: n.host,
        search: n.search ? n.search.replace(/^\?/, "") : "",
        hash: n.hash ? n.hash.replace(/^#/, "") : "",
        hostname: n.hostname,
        port: n.port,
        pathname: n.pathname.charAt(0) === "/" ? n.pathname : "/" + n.pathname
      };
    }
    return r = s(window.location.href), function (i) {
      var a = E.isString(i) ? s(i) : i;
      return a.protocol === r.protocol && a.host === r.host;
    };
  }() : function () {
    return function () {
      return !0;
    };
  }();
  function Ff(e) {
    var t = /^([-+\w]{1,25})(:?\/\/|:)/.exec(e);
    return t && t[1] || "";
  }
  function Uf(e, t) {
    e = e || 10;
    var n = new Array(e),
      r = new Array(e);
    var s = 0,
      o = 0,
      i;
    return t = t !== void 0 ? t : 1e3, function (l) {
      var c = Date.now(),
        u = r[o];
      i || (i = c), n[s] = l, r[s] = c;
      var d = o,
        A = 0;
      for (; d !== s;) A += n[d++], d = d % e;
      if (s = (s + 1) % e, s === o && (o = (o + 1) % e), c - i < t) return;
      var m = u && c - u;
      return m ? Math.round(A * 1e3 / m) : void 0;
    };
  }
  function $i(e, t) {
    var n = 0;
    var r = Uf(50, 250);
    return function (s) {
      var o = s.loaded,
        i = s.lengthComputable ? s.total : void 0,
        a = o - n,
        l = r(a),
        c = o <= i;
      n = o;
      var u = {
        loaded: o,
        total: i,
        progress: i ? o / i : void 0,
        bytes: a,
        rate: l || void 0,
        estimated: l && i && c ? (i - o) / l : void 0,
        event: s
      };
      u[t ? "download" : "upload"] = !0, e(u);
    };
  }
  var Xn = {
    http: gf,
    xhr: (typeof XMLHttpRequest === "undefined" ? "undefined" : _typeof(XMLHttpRequest)) < "u" && function (e) {
      return new Promise(function (n, r) {
        var s = e.data;
        var o = nt.from(e.headers).normalize(),
          i = e.responseType;
        var a;
        function l() {
          e.cancelToken && e.cancelToken.unsubscribe(a), e.signal && e.signal.removeEventListener("abort", a);
        }
        E.isFormData(s) && (Je.isStandardBrowserEnv || Je.isStandardBrowserWebWorkerEnv ? o.setContentType(!1) : o.setContentType("multipart/form-data;", !1));
        var c = new XMLHttpRequest();
        if (e.auth) {
          var m = e.auth.username || "",
            h = e.auth.password ? unescape(encodeURIComponent(e.auth.password)) : "";
          o.set("Authorization", "Basic " + btoa(m + ":" + h));
        }
        var u = Li(e.baseURL, e.url);
        c.open(e.method.toUpperCase(), Ni(u, e.params, e.paramsSerializer), !0), c.timeout = e.timeout;
        function d() {
          if (!c) return;
          var m = nt.from("getAllResponseHeaders" in c && c.getAllResponseHeaders()),
            _ = {
              data: !i || i === "text" || i === "json" ? c.responseText : c.response,
              status: c.status,
              statusText: c.statusText,
              headers: m,
              config: e,
              request: c
            };
          Rf(function (R) {
            n(R), l();
          }, function (R) {
            r(R), l();
          }, _), c = null;
        }
        if ("onloadend" in c ? c.onloadend = d : c.onreadystatechange = function () {
          !c || c.readyState !== 4 || c.status === 0 && !(c.responseURL && c.responseURL.indexOf("file:") === 0) || setTimeout(d);
        }, c.onabort = function () {
          c && (r(new ne("Request aborted", ne.ECONNABORTED, e, c)), c = null);
        }, c.onerror = function () {
          r(new ne("Network Error", ne.ERR_NETWORK, e, c)), c = null;
        }, c.ontimeout = function () {
          var h = e.timeout ? "timeout of " + e.timeout + "ms exceeded" : "timeout exceeded";
          var _ = e.transitional || Di;
          e.timeoutErrorMessage && (h = e.timeoutErrorMessage), r(new ne(h, _.clarifyTimeoutError ? ne.ETIMEDOUT : ne.ECONNABORTED, e, c)), c = null;
        }, Je.isStandardBrowserEnv) {
          var _m = (e.withCredentials || $f(u)) && e.xsrfCookieName && kf.read(e.xsrfCookieName);
          _m && o.set(e.xsrfHeaderName, _m);
        }
        s === void 0 && o.setContentType(null), "setRequestHeader" in c && E.forEach(o.toJSON(), function (h, _) {
          c.setRequestHeader(_, h);
        }), E.isUndefined(e.withCredentials) || (c.withCredentials = !!e.withCredentials), i && i !== "json" && (c.responseType = e.responseType), typeof e.onDownloadProgress == "function" && c.addEventListener("progress", $i(e.onDownloadProgress, !0)), typeof e.onUploadProgress == "function" && c.upload && c.upload.addEventListener("progress", $i(e.onUploadProgress)), (e.cancelToken || e.signal) && (a = function a(m) {
          c && (r(!m || m.type ? new an(null, e, c) : m), c.abort(), c = null);
        }, e.cancelToken && e.cancelToken.subscribe(a), e.signal && (e.signal.aborted ? a() : e.signal.addEventListener("abort", a)));
        var A = Ff(u);
        if (A && Je.protocols.indexOf(A) === -1) {
          r(new ne("Unsupported protocol " + A + ":", ne.ERR_BAD_REQUEST, e));
          return;
        }
        c.send(s || null);
      });
    }
  };
  E.forEach(Xn, function (e, t) {
    if (e) {
      try {
        Object.defineProperty(e, "name", {
          value: t
        });
      } catch (_unused5) {}
      Object.defineProperty(e, "adapterName", {
        value: t
      });
    }
  });
  var Bf = {
    getAdapter: function getAdapter(e) {
      e = E.isArray(e) ? e : [e];
      var _e4 = e,
        t = _e4.length;
      var n, r;
      for (var s = 0; s < t && (n = e[s], !(r = E.isString(n) ? Xn[n.toLowerCase()] : n)); s++);
      if (!r) throw r === !1 ? new ne("Adapter ".concat(n, " is not supported by the environment"), "ERR_NOT_SUPPORT") : new Error(E.hasOwnProp(Xn, n) ? "Adapter '".concat(n, "' is not available in the build") : "Unknown adapter '".concat(n, "'"));
      if (!E.isFunction(r)) throw new TypeError("adapter is not a function");
      return r;
    },
    adapters: Xn
  };
  function ms(e) {
    if (e.cancelToken && e.cancelToken.throwIfRequested(), e.signal && e.signal.aborted) throw new an(null, e);
  }
  function Fi(e) {
    return ms(e), e.headers = nt.from(e.headers), e.data = gs.call(e, e.transformRequest), ["post", "put", "patch"].indexOf(e.method) !== -1 && e.headers.setContentType("application/x-www-form-urlencoded", !1), Bf.getAdapter(e.adapter || fs.adapter)(e).then(function (r) {
      return ms(e), r.data = gs.call(e, e.transformResponse, r), r.headers = nt.from(r.headers), r;
    }, function (r) {
      return ji(r) || (ms(e), r && r.response && (r.response.data = gs.call(e, e.transformResponse, r.response), r.response.headers = nt.from(r.response.headers))), Promise.reject(r);
    });
  }
  var Ui = function Ui(e) {
    return e instanceof nt ? e.toJSON() : e;
  };
  function $t(e, t) {
    t = t || {};
    var n = {};
    function r(c, u, d) {
      return E.isPlainObject(c) && E.isPlainObject(u) ? E.merge.call({
        caseless: d
      }, c, u) : E.isPlainObject(u) ? E.merge({}, u) : E.isArray(u) ? u.slice() : u;
    }
    function s(c, u, d) {
      if (E.isUndefined(u)) {
        if (!E.isUndefined(c)) return r(void 0, c, d);
      } else return r(c, u, d);
    }
    function o(c, u) {
      if (!E.isUndefined(u)) return r(void 0, u);
    }
    function i(c, u) {
      if (E.isUndefined(u)) {
        if (!E.isUndefined(c)) return r(void 0, c);
      } else return r(void 0, u);
    }
    function a(c, u, d) {
      if (d in t) return r(c, u);
      if (d in e) return r(void 0, c);
    }
    var l = {
      url: o,
      method: o,
      data: o,
      baseURL: i,
      transformRequest: i,
      transformResponse: i,
      paramsSerializer: i,
      timeout: i,
      timeoutMessage: i,
      withCredentials: i,
      adapter: i,
      responseType: i,
      xsrfCookieName: i,
      xsrfHeaderName: i,
      onUploadProgress: i,
      onDownloadProgress: i,
      decompress: i,
      maxContentLength: i,
      maxBodyLength: i,
      beforeRedirect: i,
      transport: i,
      httpAgent: i,
      httpsAgent: i,
      cancelToken: i,
      socketPath: i,
      responseEncoding: i,
      validateStatus: a,
      headers: function headers(c, u) {
        return s(Ui(c), Ui(u), !0);
      }
    };
    return E.forEach(Object.keys(Object.assign({}, e, t)), function (u) {
      var d = l[u] || s,
        A = d(e[u], t[u], u);
      E.isUndefined(A) && d !== a || (n[u] = A);
    }), n;
  }
  var Bi = "1.4.0",
    hs = {};
  ["object", "boolean", "number", "function", "string", "symbol"].forEach(function (e, t) {
    hs[e] = function (r) {
      return _typeof(r) === e || "a" + (t < 1 ? "n " : " ") + e;
    };
  });
  var zi = {};
  hs.transitional = function (t, n, r) {
    function s(o, i) {
      return "[Axios v" + Bi + "] Transitional option '" + o + "'" + i + (r ? ". " + r : "");
    }
    return function (o, i, a) {
      if (t === !1) throw new ne(s(i, " has been removed" + (n ? " in " + n : "")), ne.ERR_DEPRECATED);
      return n && !zi[i] && (zi[i] = !0, console.warn(s(i, " has been deprecated since v" + n + " and will be removed in the near future"))), t ? t(o, i, a) : !0;
    };
  };
  function zf(e, t, n) {
    if (_typeof(e) != "object") throw new ne("options must be an object", ne.ERR_BAD_OPTION_VALUE);
    var r = Object.keys(e);
    var s = r.length;
    for (; s-- > 0;) {
      var o = r[s],
        i = t[o];
      if (i) {
        var a = e[o],
          l = a === void 0 || i(a, o, e);
        if (l !== !0) throw new ne("option " + o + " must be " + l, ne.ERR_BAD_OPTION_VALUE);
        continue;
      }
      if (n !== !0) throw new ne("Unknown option " + o, ne.ERR_BAD_OPTION);
    }
  }
  var ps = {
      assertOptions: zf,
      validators: hs
    },
    ft = ps.validators;
  var Gn = /*#__PURE__*/function () {
    function Gn(t) {
      _classCallCheck(this, Gn);
      this.defaults = t, this.interceptors = {
        request: new Pi(),
        response: new Pi()
      };
    }
    _createClass(Gn, [{
      key: "request",
      value: function request(t, n) {
        typeof t == "string" ? (n = n || {}, n.url = t) : n = t || {}, n = $t(this.defaults, n);
        var _n6 = n,
          r = _n6.transitional,
          s = _n6.paramsSerializer,
          o = _n6.headers;
        r !== void 0 && ps.assertOptions(r, {
          silentJSONParsing: ft.transitional(ft.boolean),
          forcedJSONParsing: ft.transitional(ft.boolean),
          clarifyTimeoutError: ft.transitional(ft.boolean)
        }, !1), s != null && (E.isFunction(s) ? n.paramsSerializer = {
          serialize: s
        } : ps.assertOptions(s, {
          encode: ft.function,
          serialize: ft.function
        }, !0)), n.method = (n.method || this.defaults.method || "get").toLowerCase();
        var i;
        i = o && E.merge(o.common, o[n.method]), i && E.forEach(["delete", "get", "head", "post", "put", "patch", "common"], function (h) {
          delete o[h];
        }), n.headers = nt.concat(i, o);
        var a = [];
        var l = !0;
        this.interceptors.request.forEach(function (_) {
          typeof _.runWhen == "function" && _.runWhen(n) === !1 || (l = l && _.synchronous, a.unshift(_.fulfilled, _.rejected));
        });
        var c = [];
        this.interceptors.response.forEach(function (_) {
          c.push(_.fulfilled, _.rejected);
        });
        var u,
          d = 0,
          A;
        if (!l) {
          var h = [Fi.bind(this), void 0];
          for (h.unshift.apply(h, a), h.push.apply(h, c), A = h.length, u = Promise.resolve(n); d < A;) u = u.then(h[d++], h[d++]);
          return u;
        }
        A = a.length;
        var m = n;
        for (d = 0; d < A;) {
          var _h3 = a[d++],
            _ = a[d++];
          try {
            m = _h3(m);
          } catch (I) {
            _.call(this, I);
            break;
          }
        }
        try {
          u = Fi.call(this, m);
        } catch (h) {
          return Promise.reject(h);
        }
        for (d = 0, A = c.length; d < A;) u = u.then(c[d++], c[d++]);
        return u;
      }
    }, {
      key: "getUri",
      value: function getUri(t) {
        t = $t(this.defaults, t);
        var n = Li(t.baseURL, t.url);
        return Ni(n, t.params, t.paramsSerializer);
      }
    }]);
    return Gn;
  }();
  E.forEach(["delete", "get", "head", "options"], function (t) {
    Gn.prototype[t] = function (n, r) {
      return this.request($t(r || {}, {
        method: t,
        url: n,
        data: (r || {}).data
      }));
    };
  }), E.forEach(["post", "put", "patch"], function (t) {
    function n(r) {
      return function (o, i, a) {
        return this.request($t(a || {}, {
          method: t,
          headers: r ? {
            "Content-Type": "multipart/form-data"
          } : {},
          url: o,
          data: i
        }));
      };
    }
    Gn.prototype[t] = n(), Gn.prototype[t + "Form"] = n(!0);
  });
  var er = Gn;
  var As = /*#__PURE__*/function () {
    function As(t) {
      _classCallCheck(this, As);
      if (typeof t != "function") throw new TypeError("executor must be a function.");
      var n;
      this.promise = new Promise(function (o) {
        n = o;
      });
      var r = this;
      this.promise.then(function (s) {
        if (!r._listeners) return;
        var o = r._listeners.length;
        for (; o-- > 0;) r._listeners[o](s);
        r._listeners = null;
      }), this.promise.then = function (s) {
        var o;
        var i = new Promise(function (a) {
          r.subscribe(a), o = a;
        }).then(s);
        return i.cancel = function () {
          r.unsubscribe(o);
        }, i;
      }, t(function (o, i, a) {
        r.reason || (r.reason = new an(o, i, a), n(r.reason));
      });
    }
    _createClass(As, [{
      key: "throwIfRequested",
      value: function throwIfRequested() {
        if (this.reason) throw this.reason;
      }
    }, {
      key: "subscribe",
      value: function subscribe(t) {
        if (this.reason) {
          t(this.reason);
          return;
        }
        this._listeners ? this._listeners.push(t) : this._listeners = [t];
      }
    }, {
      key: "unsubscribe",
      value: function unsubscribe(t) {
        if (!this._listeners) return;
        var n = this._listeners.indexOf(t);
        n !== -1 && this._listeners.splice(n, 1);
      }
    }], [{
      key: "source",
      value: function source() {
        var t;
        return {
          token: new As(function (s) {
            t = s;
          }),
          cancel: t
        };
      }
    }]);
    return As;
  }();
  var Hf = As;
  function Wf(e) {
    return function (n) {
      return e.apply(null, n);
    };
  }
  function qf(e) {
    return E.isObject(e) && e.isAxiosError === !0;
  }
  var xs = {
    Continue: 100,
    SwitchingProtocols: 101,
    Processing: 102,
    EarlyHints: 103,
    Ok: 200,
    Created: 201,
    Accepted: 202,
    NonAuthoritativeInformation: 203,
    NoContent: 204,
    ResetContent: 205,
    PartialContent: 206,
    MultiStatus: 207,
    AlreadyReported: 208,
    ImUsed: 226,
    MultipleChoices: 300,
    MovedPermanently: 301,
    Found: 302,
    SeeOther: 303,
    NotModified: 304,
    UseProxy: 305,
    Unused: 306,
    TemporaryRedirect: 307,
    PermanentRedirect: 308,
    BadRequest: 400,
    Unauthorized: 401,
    PaymentRequired: 402,
    Forbidden: 403,
    NotFound: 404,
    MethodNotAllowed: 405,
    NotAcceptable: 406,
    ProxyAuthenticationRequired: 407,
    RequestTimeout: 408,
    Conflict: 409,
    Gone: 410,
    LengthRequired: 411,
    PreconditionFailed: 412,
    PayloadTooLarge: 413,
    UriTooLong: 414,
    UnsupportedMediaType: 415,
    RangeNotSatisfiable: 416,
    ExpectationFailed: 417,
    ImATeapot: 418,
    MisdirectedRequest: 421,
    UnprocessableEntity: 422,
    Locked: 423,
    FailedDependency: 424,
    TooEarly: 425,
    UpgradeRequired: 426,
    PreconditionRequired: 428,
    TooManyRequests: 429,
    RequestHeaderFieldsTooLarge: 431,
    UnavailableForLegalReasons: 451,
    InternalServerError: 500,
    NotImplemented: 501,
    BadGateway: 502,
    ServiceUnavailable: 503,
    GatewayTimeout: 504,
    HttpVersionNotSupported: 505,
    VariantAlsoNegotiates: 506,
    InsufficientStorage: 507,
    LoopDetected: 508,
    NotExtended: 510,
    NetworkAuthenticationRequired: 511
  };
  Object.entries(xs).forEach(function (_ref44) {
    var _ref45 = _slicedToArray(_ref44, 2),
      e = _ref45[0],
      t = _ref45[1];
    xs[t] = e;
  });
  var Kf = xs;
  function Hi(e) {
    var t = new er(e),
      n = hi(er.prototype.request, t);
    return E.extend(n, er.prototype, t, {
      allOwnKeys: !0
    }), E.extend(n, t, null, {
      allOwnKeys: !0
    }), n.create = function (s) {
      return Hi($t(e, s));
    }, n;
  }
  var ge = Hi(fs);
  ge.Axios = er, ge.CanceledError = an, ge.CancelToken = Hf, ge.isCancel = ji, ge.VERSION = Bi, ge.toFormData = Yn, ge.AxiosError = ne, ge.Cancel = ge.CanceledError, ge.all = function (t) {
    return Promise.all(t);
  }, ge.spread = Wf, ge.isAxiosError = qf, ge.mergeConfig = $t, ge.AxiosHeaders = nt, ge.formToJSON = function (e) {
    return Ri(E.isHTMLForm(e) ? new FormData(e) : e);
  }, ge.HttpStatusCode = Kf, ge.default = ge;
  var Wi = ge,
    qi = "https://kdocs.cn",
    Ki = /*#__PURE__*/function () {
      var _ref46 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee8(e) {
        var t, n;
        return _regeneratorRuntime().wrap(function _callee8$(_context8) {
          while (1) switch (_context8.prev = _context8.next) {
            case 0:
              _context8.prev = 0;
              _context8.next = 3;
              return Le.cookies.get({
                url: qi,
                name: "csrf"
              });
            case 3:
              t = _context8.sent;
              if (!(t != null && t.value)) {
                _context8.next = 8;
                break;
              }
              e["X-CSRFToken"] = t.value;
              _context8.next = 12;
              break;
            case 8:
              n = Jf();
              _context8.next = 11;
              return Le.cookies.set({
                url: qi,
                name: "csrf",
                value: n,
                domain: ".kdocs.cn",
                path: "/",
                secure: !1,
                storeId: "0",
                httpOnly: !1
              });
            case 11:
              e["X-CSRFToken"] = n;
            case 12:
              _context8.next = 16;
              break;
            case 14:
              _context8.prev = 14;
              _context8.t0 = _context8["catch"](0);
            case 16:
              return _context8.abrupt("return", e);
            case 17:
            case "end":
              return _context8.stop();
          }
        }, _callee8, null, [[0, 14]]);
      }));
      return function Ki(_x11) {
        return _ref46.apply(this, arguments);
      };
    }();
  function Jf() {
    var e = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678",
      t = e.length;
    var n = "";
    for (var r = 0; r < 32; r++) n += e.charAt(Math.floor(Math.random() * t));
    return n;
  }
  var Yf = {
      timeout: 1e4,
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json"
      },
      withCredentials: !0
    },
    $e = /*#__PURE__*/function () {
      function $e() {
        _classCallCheck(this, $e);
        this.httpInterceptorsRequest(), this.httpInterceptorsResponse();
      }
      _createClass($e, [{
        key: "httpInterceptorsRequest",
        value: function httpInterceptorsRequest() {
          $e.axiosInstance.interceptors.request.use(function (t) {
            return typeof t.beforeRequestCallback == "function" ? (t.beforeRequestCallback(t), t) : ($e.initConfig.beforeRequestCallback && $e.initConfig.beforeRequestCallback(t), t);
          }, function (t) {
            return Promise.reject(t);
          });
        }
      }, {
        key: "httpInterceptorsResponse",
        value: function httpInterceptorsResponse() {
          $e.axiosInstance.interceptors.response.use(function (n) {
            var r = n.config;
            return typeof r.beforeResponseCallback == "function" ? (r.beforeResponseCallback(n), n.data) : ($e.initConfig.beforeResponseCallback && $e.initConfig.beforeResponseCallback(n), n.data);
          }, function (n) {
            var r = n;
            return r.isCancelRequest = Wi.isCancel(r), Promise.reject(r);
          });
        }
      }, {
        key: "request",
        value: function request(t, n, r, s) {
          var o = _objectSpread(_objectSpread({
            method: t,
            url: n
          }, r), s);
          return new Promise( /*#__PURE__*/function () {
            var _ref47 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee9(i, a) {
              return _regeneratorRuntime().wrap(function _callee9$(_context9) {
                while (1) switch (_context9.prev = _context9.next) {
                  case 0:
                    _context9.next = 2;
                    return Ki((r == null ? void 0 : r.headers) || {});
                  case 2:
                    o.headers = _context9.sent;
                    $e.axiosInstance.request(o).then(function (l) {
                      i(l);
                    }).catch(function (l) {
                      a(l);
                    });
                  case 4:
                  case "end":
                    return _context9.stop();
                }
              }, _callee9);
            }));
            return function (_x12, _x13) {
              return _ref47.apply(this, arguments);
            };
          }());
        }
      }]);
      return $e;
    }();
  Es($e, "initConfig", {}), Es($e, "axiosInstance", Wi.create(Yf));
  var bs = $e;
  var Vf = new bs();
  var Qf = /*#__PURE__*/function () {
    function Qf() {
      _classCallCheck(this, Qf);
    }
    _createClass(Qf, [{
      key: "request",
      value: function request(t, n, r) {
        return new Promise( /*#__PURE__*/function () {
          var _ref48 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee11(s, o) {
            var l, i, a;
            return _regeneratorRuntime().wrap(function _callee11$(_context11) {
              while (1) switch (_context11.prev = _context11.next) {
                case 0:
                  i = {
                    method: (t == null ? void 0 : t.toUpperCase()) || "GET"
                  };
                  (!i.method || i.method === "GET") && (l = Object.keys((r == null ? void 0 : r.params) || {})) != null && l.length && (n = "".concat(n, "?").concat(JSON.stringify(r.params)));
                  _context11.next = 4;
                  return Ki((r == null ? void 0 : r.headers) || {});
                case 4:
                  a = _context11.sent;
                  i.headers = _objectSpread({
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                  }, a || {});
                  try {
                    a["Content-Type"] === "multipart/form-data" ? i.body = r == null ? void 0 : r.data : r != null && r.data && (i.body = JSON.stringify(r.data));
                  } catch (_unused7) {}
                  fetch(n, i).then( /*#__PURE__*/function () {
                    var _ref49 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee10(c) {
                      var u;
                      return _regeneratorRuntime().wrap(function _callee10$(_context10) {
                        while (1) switch (_context10.prev = _context10.next) {
                          case 0:
                            _context10.prev = 0;
                            _context10.next = 3;
                            return c.json();
                          case 3:
                            u = _context10.sent;
                            _context10.next = 9;
                            break;
                          case 6:
                            _context10.prev = 6;
                            _context10.t0 = _context10["catch"](0);
                            u = c;
                          case 9:
                            if (!(c.status !== 200)) {
                              _context10.next = 11;
                              break;
                            }
                            throw {
                              response: u
                            };
                          case 11:
                            return _context10.abrupt("return", u);
                          case 12:
                          case "end":
                            return _context10.stop();
                        }
                      }, _callee10, null, [[0, 6]]);
                    }));
                    return function (_x16) {
                      return _ref49.apply(this, arguments);
                    };
                  }()).then(function (c) {
                    s(c);
                  }).catch(function (c) {
                    o(c);
                  });
                case 8:
                case "end":
                  return _context11.stop();
              }
            }, _callee11);
          }));
          return function (_x14, _x15) {
            return _ref48.apply(this, arguments);
          };
        }());
      }
    }]);
    return Qf;
  }();
  var Zf = new Qf(),
    Xf = function () {
      return typeof XMLHttpRequest == "function" ? Vf : Zf;
    }(),
    Gf = function Gf(e) {
      var t = Array.isArray(e) ? e.join(",") : e;
      return new Promise(function (n, r) {
        Xf.request("get", Xo + "/kdg/api/v1/params/baseOperation/sub_keys?subKeys=".concat(t)).then(function (s) {
          n(s.data);
        }).catch(r);
      });
    };
  var Ji = {
    exports: {}
  };
  (function (e, t) {
    (function (n, r) {
      e.exports = r();
    })(Kr, function () {
      var n = 1e3,
        r = 6e4,
        s = 36e5,
        o = "millisecond",
        i = "second",
        a = "minute",
        l = "hour",
        c = "day",
        u = "week",
        d = "month",
        A = "quarter",
        m = "year",
        h = "date",
        _ = "Invalid Date",
        I = /^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[Tt\s]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/,
        R = /\[([^\]]+)]|Y{1,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g,
        U = {
          name: "en",
          weekdays: "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),
          months: "January_February_March_April_May_June_July_August_September_October_November_December".split("_"),
          ordinal: function ordinal(j) {
            var S = ["th", "st", "nd", "rd"],
              p = j % 100;
            return "[" + j + (S[(p - 20) % 10] || S[p] || S[0]) + "]";
          }
        },
        L = function L(j, S, p) {
          var C = String(j);
          return !C || C.length >= S ? j : "" + Array(S + 1 - C.length).join(p) + j;
        },
        B = {
          s: L,
          z: function z(j) {
            var S = -j.utcOffset(),
              p = Math.abs(S),
              C = Math.floor(p / 60),
              x = p % 60;
            return (S <= 0 ? "+" : "-") + L(C, 2, "0") + ":" + L(x, 2, "0");
          },
          m: function j(S, p) {
            if (S.date() < p.date()) return -j(p, S);
            var C = 12 * (p.year() - S.year()) + (p.month() - S.month()),
              x = S.clone().add(C, d),
              P = p - x < 0,
              z = S.clone().add(C + (P ? -1 : 1), d);
            return +(-(C + (p - x) / (P ? x - z : z - x)) || 0);
          },
          a: function a(j) {
            return j < 0 ? Math.ceil(j) || 0 : Math.floor(j);
          },
          p: function p(j) {
            return {
              M: d,
              y: m,
              w: u,
              d: c,
              D: h,
              h: l,
              m: a,
              s: i,
              ms: o,
              Q: A
            }[j] || String(j || "").toLowerCase().replace(/s$/, "");
          },
          u: function u(j) {
            return j === void 0;
          }
        },
        Z = "en",
        se = {};
      se[Z] = U;
      var ae = function ae(j) {
          return j instanceof $;
        },
        w = function j(S, p, C) {
          var x;
          if (!S) return Z;
          if (typeof S == "string") {
            var P = S.toLowerCase();
            se[P] && (x = P), p && (se[P] = p, x = P);
            var z = S.split("-");
            if (!x && z.length > 1) return j(z[0]);
          } else {
            var W = S.name;
            se[W] = S, x = W;
          }
          return !C && x && (Z = x), x || !C && Z;
        },
        b = function b(j, S) {
          if (ae(j)) return j.clone();
          var p = _typeof(S) == "object" ? S : {};
          return p.date = j, p.args = arguments, new $(p);
        },
        v = B;
      v.l = w, v.i = ae, v.w = function (j, S) {
        return b(j, {
          locale: S.$L,
          utc: S.$u,
          x: S.$x,
          $offset: S.$offset
        });
      };
      var $ = function () {
          function j(p) {
            this.$L = w(p.locale, null, !0), this.parse(p);
          }
          var S = j.prototype;
          return S.parse = function (p) {
            this.$d = function (C) {
              var x = C.date,
                P = C.utc;
              if (x === null) return new Date(NaN);
              if (v.u(x)) return new Date();
              if (x instanceof Date) return new Date(x);
              if (typeof x == "string" && !/Z$/i.test(x)) {
                var z = x.match(I);
                if (z) {
                  var W = z[2] - 1 || 0,
                    X = (z[7] || "0").substring(0, 3);
                  return P ? new Date(Date.UTC(z[1], W, z[3] || 1, z[4] || 0, z[5] || 0, z[6] || 0, X)) : new Date(z[1], W, z[3] || 1, z[4] || 0, z[5] || 0, z[6] || 0, X);
                }
              }
              return new Date(x);
            }(p), this.$x = p.x || {}, this.init();
          }, S.init = function () {
            var p = this.$d;
            this.$y = p.getFullYear(), this.$M = p.getMonth(), this.$D = p.getDate(), this.$W = p.getDay(), this.$H = p.getHours(), this.$m = p.getMinutes(), this.$s = p.getSeconds(), this.$ms = p.getMilliseconds();
          }, S.$utils = function () {
            return v;
          }, S.isValid = function () {
            return this.$d.toString() !== _;
          }, S.isSame = function (p, C) {
            var x = b(p);
            return this.startOf(C) <= x && x <= this.endOf(C);
          }, S.isAfter = function (p, C) {
            return b(p) < this.startOf(C);
          }, S.isBefore = function (p, C) {
            return this.endOf(C) < b(p);
          }, S.$g = function (p, C, x) {
            return v.u(p) ? this[C] : this.set(x, p);
          }, S.unix = function () {
            return Math.floor(this.valueOf() / 1e3);
          }, S.valueOf = function () {
            return this.$d.getTime();
          }, S.startOf = function (p, C) {
            var x = this,
              P = !!v.u(C) || C,
              z = v.p(p),
              W = function W(Ve, ue) {
                var Ne = v.w(x.$u ? Date.UTC(x.$y, ue, Ve) : new Date(x.$y, ue, Ve), x);
                return P ? Ne : Ne.endOf(c);
              },
              X = function X(Ve, ue) {
                return v.w(x.toDate()[Ve].apply(x.toDate("s"), (P ? [0, 0, 0, 0] : [23, 59, 59, 999]).slice(ue)), x);
              },
              oe = this.$W,
              me = this.$M,
              Me = this.$D,
              dt = "set" + (this.$u ? "UTC" : "");
            switch (z) {
              case m:
                return P ? W(1, 0) : W(31, 11);
              case d:
                return P ? W(1, me) : W(0, me + 1);
              case u:
                var xe = this.$locale().weekStart || 0,
                  Ye = (oe < xe ? oe + 7 : oe) - xe;
                return W(P ? Me - Ye : Me + (6 - Ye), me);
              case c:
              case h:
                return X(dt + "Hours", 0);
              case l:
                return X(dt + "Minutes", 1);
              case a:
                return X(dt + "Seconds", 2);
              case i:
                return X(dt + "Milliseconds", 3);
              default:
                return this.clone();
            }
          }, S.endOf = function (p) {
            return this.startOf(p, !1);
          }, S.$set = function (p, C) {
            var x,
              P = v.p(p),
              z = "set" + (this.$u ? "UTC" : ""),
              W = (x = {}, x[c] = z + "Date", x[h] = z + "Date", x[d] = z + "Month", x[m] = z + "FullYear", x[l] = z + "Hours", x[a] = z + "Minutes", x[i] = z + "Seconds", x[o] = z + "Milliseconds", x)[P],
              X = P === c ? this.$D + (C - this.$W) : C;
            if (P === d || P === m) {
              var oe = this.clone().set(h, 1);
              oe.$d[W](X), oe.init(), this.$d = oe.set(h, Math.min(this.$D, oe.daysInMonth())).$d;
            } else W && this.$d[W](X);
            return this.init(), this;
          }, S.set = function (p, C) {
            return this.clone().$set(p, C);
          }, S.get = function (p) {
            return this[v.p(p)]();
          }, S.add = function (p, C) {
            var x,
              P = this;
            p = Number(p);
            var z = v.p(C),
              W = function W(me) {
                var Me = b(P);
                return v.w(Me.date(Me.date() + Math.round(me * p)), P);
              };
            if (z === d) return this.set(d, this.$M + p);
            if (z === m) return this.set(m, this.$y + p);
            if (z === c) return W(1);
            if (z === u) return W(7);
            var X = (x = {}, x[a] = r, x[l] = s, x[i] = n, x)[z] || 1,
              oe = this.$d.getTime() + p * X;
            return v.w(oe, this);
          }, S.subtract = function (p, C) {
            return this.add(-1 * p, C);
          }, S.format = function (p) {
            var C = this,
              x = this.$locale();
            if (!this.isValid()) return x.invalidDate || _;
            var P = p || "YYYY-MM-DDTHH:mm:ssZ",
              z = v.z(this),
              W = this.$H,
              X = this.$m,
              oe = this.$M,
              me = x.weekdays,
              Me = x.months,
              dt = x.meridiem,
              xe = function xe(ue, Ne, rt, f) {
                return ue && (ue[Ne] || ue(C, P)) || rt[Ne].slice(0, f);
              },
              Ye = function Ye(ue) {
                return v.s(W % 12 || 12, ue, "0");
              },
              Ve = dt || function (ue, Ne, rt) {
                var f = ue < 12 ? "AM" : "PM";
                return rt ? f.toLowerCase() : f;
              };
            return P.replace(R, function (ue, Ne) {
              return Ne || function (rt) {
                switch (rt) {
                  case "YY":
                    return String(C.$y).slice(-2);
                  case "YYYY":
                    return v.s(C.$y, 4, "0");
                  case "M":
                    return oe + 1;
                  case "MM":
                    return v.s(oe + 1, 2, "0");
                  case "MMM":
                    return xe(x.monthsShort, oe, Me, 3);
                  case "MMMM":
                    return xe(Me, oe);
                  case "D":
                    return C.$D;
                  case "DD":
                    return v.s(C.$D, 2, "0");
                  case "d":
                    return String(C.$W);
                  case "dd":
                    return xe(x.weekdaysMin, C.$W, me, 2);
                  case "ddd":
                    return xe(x.weekdaysShort, C.$W, me, 3);
                  case "dddd":
                    return me[C.$W];
                  case "H":
                    return String(W);
                  case "HH":
                    return v.s(W, 2, "0");
                  case "h":
                    return Ye(1);
                  case "hh":
                    return Ye(2);
                  case "a":
                    return Ve(W, X, !0);
                  case "A":
                    return Ve(W, X, !1);
                  case "m":
                    return String(X);
                  case "mm":
                    return v.s(X, 2, "0");
                  case "s":
                    return String(C.$s);
                  case "ss":
                    return v.s(C.$s, 2, "0");
                  case "SSS":
                    return v.s(C.$ms, 3, "0");
                  case "Z":
                    return z;
                }
                return null;
              }(ue) || z.replace(":", "");
            });
          }, S.utcOffset = function () {
            return 15 * -Math.round(this.$d.getTimezoneOffset() / 15);
          }, S.diff = function (p, C, x) {
            var P,
              z = this,
              W = v.p(C),
              X = b(p),
              oe = (X.utcOffset() - this.utcOffset()) * r,
              me = this - X,
              Me = function Me() {
                return v.m(z, X);
              };
            switch (W) {
              case m:
                P = Me() / 12;
                break;
              case d:
                P = Me();
                break;
              case A:
                P = Me() / 3;
                break;
              case u:
                P = (me - oe) / 6048e5;
                break;
              case c:
                P = (me - oe) / 864e5;
                break;
              case l:
                P = me / s;
                break;
              case a:
                P = me / r;
                break;
              case i:
                P = me / n;
                break;
              default:
                P = me;
            }
            return x ? P : v.a(P);
          }, S.daysInMonth = function () {
            return this.endOf(d).$D;
          }, S.$locale = function () {
            return se[this.$L];
          }, S.locale = function (p, C) {
            if (!p) return this.$L;
            var x = this.clone(),
              P = w(p, C, !0);
            return P && (x.$L = P), x;
          }, S.clone = function () {
            return v.w(this.$d, this);
          }, S.toDate = function () {
            return new Date(this.valueOf());
          }, S.toJSON = function () {
            return this.isValid() ? this.toISOString() : null;
          }, S.toISOString = function () {
            return this.$d.toISOString();
          }, S.toString = function () {
            return this.$d.toUTCString();
          }, j;
        }(),
        Y = $.prototype;
      return b.prototype = Y, [["$ms", o], ["$s", i], ["$m", a], ["$H", l], ["$W", c], ["$M", d], ["$y", m], ["$D", h]].forEach(function (j) {
        Y[j[1]] = function (S) {
          return this.$g(S, j[0], j[1]);
        };
      }), b.extend = function (j, S) {
        return j.$i || (j(S, $, b), j.$i = !0), b;
      }, b.locale = w, b.isDayjs = ae, b.unix = function (j) {
        return b(1e3 * j);
      }, b.en = se[Z], b.Ls = se, b.p = {}, b;
    });
  })(Ji);
  var ed = Ji.exports;
  var ws = Jr(ed),
    Yi = "BrowserPlugin_GeneralConfig",
    Vi = 50,
    Qi = ["https://mp.weixin.qq.com/s", "https://www.zhihu.com/question/", "https://www.zhihu.com/pub/reader/", "https://www.zhihu.com/topic/", "https://daily.zhihu.com/story/", "https://www.xiaohongshu.com/explore/", "https://www.jianshu.com/p/", "https://blog.csdn.net/csdnnews/article/details/", "https://blog.csdn.net/*/article/details/", "https://bbs.csdn.net/topics/", "https://wenku.csdn.net/answer/", "https://www.cnblogs.com/*/p/", "https://www.toutiao.com/article/", "https://www.toutiao.com/w/", "https://www.huxiu.com/article/", "https://www.36kr.com/p/", "https://sspai.com/post/", "https://www.ithome.com/0/", "https://www.yicai.com/news/"],
    Zi = ["https://www.wps.cn", "https://kdocs.cn", "https://www.kdocs.cn", "https://docs.qq.com", "https://feishu.cn", "https://shimo.im", "https://pan.baidu.com", "https://www.weiyun.com", "https://account.wps.cn"],
    tr = {
      blackUrls: Zi,
      popIconMinShow: Vi,
      whiteUrls: Qi,
      expires: 0
    },
    Xi = function Xi() {
      return {
        initSubKeys: function () {
          var _initSubKeys = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee12() {
            var s, o, i, a, _ref50, _ref50$blackUrls, l, _ref50$popIconMinShow, c, _ref50$whiteUrls, u;
            return _regeneratorRuntime().wrap(function _callee12$(_context12) {
              while (1) switch (_context12.prev = _context12.next) {
                case 0:
                  s = ns(rs, tr);
                  _context12.prev = 1;
                  o = ws().valueOf();
                  if (!(s.value.expires > o)) {
                    _context12.next = 5;
                    break;
                  }
                  return _context12.abrupt("return", s.value);
                case 5:
                  _context12.next = 7;
                  return Gf(Yi);
                case 7:
                  i = _context12.sent;
                  a = ws().endOf("day").valueOf();
                  _ref50 = (i == null ? void 0 : i[Yi]) || {};
                  _ref50$blackUrls = _ref50.blackUrls;
                  l = _ref50$blackUrls === void 0 ? [] : _ref50$blackUrls;
                  _ref50$popIconMinShow = _ref50.popIconMinShow;
                  c = _ref50$popIconMinShow === void 0 ? 50 : _ref50$popIconMinShow;
                  _ref50$whiteUrls = _ref50.whiteUrls;
                  u = _ref50$whiteUrls === void 0 ? [] : _ref50$whiteUrls;
                  l.length && (s.value.blackUrls = l), u.length && (s.value.whiteUrls = u), c > 0 && (s.value.popIconMinShow = c), s.value.expires = a;
                  _context12.next = 22;
                  break;
                case 19:
                  _context12.prev = 19;
                  _context12.t0 = _context12["catch"](1);
                  s.value.blackUrls = Zi, s.value.whiteUrls = Qi, s.value.popIconMinShow = Vi;
                case 22:
                  return _context12.abrupt("return", s.value);
                case 23:
                case "end":
                  return _context12.stop();
              }
            }, _callee12, null, [[1, 19]]);
          }));
          function initSubKeys() {
            return _initSubKeys.apply(this, arguments);
          }
          return initSubKeys;
        }(),
        getSubKeys: function getSubKeys() {
          return ns(rs, tr);
        },
        getSubKeysNoRef: function () {
          var _getSubKeysNoRef = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee13() {
            var s, o;
            return _regeneratorRuntime().wrap(function _callee13$(_context13) {
              while (1) switch (_context13.prev = _context13.next) {
                case 0:
                  _context13.prev = 0;
                  s = rs;
                  _context13.next = 4;
                  return Le.storage.local.get(s);
                case 4:
                  _context13.t0 = s;
                  o = _context13.sent[_context13.t0];
                  _context13.prev = 6;
                  return _context13.abrupt("return", JSON.parse(o));
                case 10:
                  _context13.prev = 10;
                  _context13.t1 = _context13["catch"](6);
                  return _context13.abrupt("return", o || tr);
                case 13:
                  _context13.next = 18;
                  break;
                case 15:
                  _context13.prev = 15;
                  _context13.t2 = _context13["catch"](0);
                  return _context13.abrupt("return", tr);
                case 18:
                case "end":
                  return _context13.stop();
              }
            }, _callee13, null, [[0, 15], [6, 10]]);
          }));
          function getSubKeysNoRef() {
            return _getSubKeysNoRef.apply(this, arguments);
          }
          return getSubKeysNoRef;
        }(),
        whetherDomainLegally: function whetherDomainLegally(s) {
          var o = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
          var _o$reduce = o.reduce(function (u, d) {
              return d != null && d.includes("/*/") ? u.specialArr.push(d) : u.publicArr.push(d), u;
            }, {
              publicArr: [],
              specialArr: []
            }),
            i = _o$reduce.publicArr,
            a = _o$reduce.specialArr;
          return (i == null ? void 0 : i.some(function (u) {
            return s.startsWith(u);
          })) || (a == null ? void 0 : a.some(function (u) {
            var _u$split = u.split("/*/"),
              _u$split2 = _slicedToArray(_u$split, 2),
              d = _u$split2[0],
              A = _u$split2[1];
            return s.startsWith(d + "/") && s.includes("/" + A);
          })) ? !0 : o.some(function (u) {
            return s.includes(u);
          });
        }
      };
    };
  function ys() {
    var e = (document == null ? void 0 : document.characterSet) || (document == null ? void 0 : document.charset) || "",
      t = document.title;
    if ((e == null ? void 0 : e.toLowerCase()) === "utf-8" || !e) return t;
    var n = encodeURIComponent(document.title);
    return decodeURIComponent(n);
  }
  var _mi = mi(),
    td = _mi.getSettingConfigsNoRef,
    _Xi = Xi(),
    nd = _Xi.getSubKeysNoRef,
    Gi = function Gi() {
      var e = Ae(null),
        t = 26,
        _uu = uu(),
        n = _uu.text,
        r = _uu.ranges,
        _su = su(),
        s = _su.x,
        o = _su.y,
        _fu = fu(),
        i = _fu.x,
        a = _fu.y,
        l = Ae({
          show: !1,
          text: "",
          style: {}
        }),
        c = Ae(""),
        u = Ae(""),
        d = Ae({
          x: 0,
          y: 0
        });
      function A() {
        d.value = {
          x: s.value - i.value,
          y: o.value - a.value
        };
      }
      function m() {
        return _m2.apply(this, arguments);
      }
      function _m2() {
        _m2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee14() {
          var _ref52;
          var se, _yield$td, I, _yield$nd, R, U, L, B, Z;
          return _regeneratorRuntime().wrap(function _callee14$(_context14) {
            while (1) switch (_context14.prev = _context14.next) {
              case 0:
                _context14.next = 2;
                return td();
              case 2:
                _yield$td = _context14.sent;
                I = _yield$td.selectPopup;
                _context14.next = 6;
                return nd();
              case 6:
                _yield$nd = _context14.sent;
                R = _yield$nd.popIconMinShow;
                if (!(!I || !ce(n))) {
                  _context14.next = 11;
                  break;
                }
                l.value = {
                  show: !1,
                  text: "",
                  style: {}
                };
                return _context14.abrupt("return");
              case 11:
                U = ce(s) - ce(i), L = ce(o) - ce(a);
                B = -100, Z = -100;
                U > ce(d).x && L > ce(d).y ? (B = U - t, Z = L) : U > ce(d).x && L < ce(d).y ? (B = U - t, Z = L - t) : U < ce(d).x && L > ce(d).y ? (B = U, Z = L) : U < ce(d).x && L < ce(d).y && (B = U, Z = L - t), l.value = {
                  show: n.value.length > R,
                  style: {
                    transform: "translate(".concat(B, "px, ").concat(Z, "px)")
                  },
                  text: ce(n)
                }, c.value = h(), u.value = (_ref52 = (se = n.value) == null ? void 0 : se.slice(0, 30)) !== null && _ref52 !== void 0 ? _ref52 : ys(), l.value.show && jt("dwEvent", {
                  action: "show_entrance_suspension"
                }, "background").catch(function () {});
              case 14:
              case "end":
                return _context14.stop();
            }
          }, _callee14);
        }));
        return _m2.apply(this, arguments);
      }
      function h() {
        var U;
        var I = (U = ce(r)) == null ? void 0 : U[0],
          R = document.createElement("div");
        return R.appendChild(I == null ? void 0 : I.cloneContents()), R.innerHTML || ce(n);
      }
      function _() {
        var _ref51;
        var I;
        jt("clickIcon", {
          text: c.value,
          title: u.value,
          url: (_ref51 = (I = window == null ? void 0 : window.location) == null ? void 0 : I.href) !== null && _ref51 !== void 0 ? _ref51 : "",
          type: "content",
          dwName: "click_entrance_suspension"
        }, "background").catch(function () {}), l.value = {
          show: !1,
          text: "",
          style: {}
        };
      }
      return Sn(function () {
        document.addEventListener("mouseup", m), document.addEventListener("mousedown", A);
      }), On(function () {
        document.removeEventListener("mouseup", m), document.removeEventListener("mousedown", A);
      }), {
        result: l,
        onCollectionClick: _,
        kdocsExtIcon: e,
        getContentFromSelection: h
      };
    },
    ea = {
      type: "page",
      title: ""
    },
    rd = function rd() {
      var e = function e(s) {
          Le.storage.local.set(_defineProperty({}, ss, JSON.stringify(s))).catch(function () {});
        },
        t = /*#__PURE__*/function () {
          var _ref53 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee15() {
            var s, _o6;
            return _regeneratorRuntime().wrap(function _callee15$(_context15) {
              while (1) switch (_context15.prev = _context15.next) {
                case 0:
                  _context15.prev = 0;
                  s = ss;
                  _context15.next = 4;
                  return Le.storage.local.get(s);
                case 4:
                  _context15.t0 = s;
                  _o6 = _context15.sent[_context15.t0];
                  _context15.prev = 6;
                  return _context15.abrupt("return", JSON.parse(_o6));
                case 10:
                  _context15.prev = 10;
                  _context15.t1 = _context15["catch"](6);
                  return _context15.abrupt("return", _o6 || ea);
                case 13:
                  _context15.next = 18;
                  break;
                case 15:
                  _context15.prev = 15;
                  _context15.t2 = _context15["catch"](0);
                  return _context15.abrupt("return", ea);
                case 18:
                case "end":
                  return _context15.stop();
              }
            }, _callee15, null, [[0, 15], [6, 10]]);
          }));
          return function t() {
            return _ref53.apply(this, arguments);
          };
        }();
      return {
        setConvertInfo: e,
        removeConvertInfo: function removeConvertInfo() {
          Le.storage.local.remove(ss).catch(function () {});
        },
        updateConvertInfo: function () {
          var _updateConvertInfo = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee16(s) {
            var _o7;
            return _regeneratorRuntime().wrap(function _callee16$(_context16) {
              while (1) switch (_context16.prev = _context16.next) {
                case 0:
                  _context16.prev = 0;
                  _context16.next = 3;
                  return t();
                case 3:
                  _o7 = _context16.sent;
                  Object.keys(s).forEach(function (i) {
                    _o7[i] = s[i];
                  }), e(_o7);
                  _context16.next = 9;
                  break;
                case 7:
                  _context16.prev = 7;
                  _context16.t0 = _context16["catch"](0);
                case 9:
                case "end":
                  return _context16.stop();
              }
            }, _callee16, null, [[0, 7]]);
          }));
          function updateConvertInfo(_x17) {
            return _updateConvertInfo.apply(this, arguments);
          }
          return updateConvertInfo;
        }(),
        getConvertInfoNoRef: t
      };
    },
    _rd = rd(),
    sd = _rd.updateConvertInfo,
    _s = "kdocs__0501__ext_",
    ta = "kdocs_web_cut_iframe_box",
    od = function od() {
      var _Gi = Gi(),
        e = _Gi.getContentFromSelection,
        t = Ae();
      function n(m) {
        var h, _;
        try {
          if (m) {
            var R = (h = document == null ? void 0 : document.getElementById) == null ? void 0 : h.call(document, _s + m);
            R && ((_ = document == null ? void 0 : document.body) == null || _.removeChild(R));
            return;
          }
          var I = A();
          I.innerHTML = "";
        } catch (_unused15) {}
      }
      function r() {
        o({
          name: "loading",
          styles: {
            width: "336px",
            height: "60px",
            right: "20px",
            top: "20px",
            overflow: "hidden",
            border: "3px solid #e4e7ed",
            background: "#fff",
            "box-sizing": "border-box",
            "border-radius": "8px",
            "box-shadow": "0 12px 32px rgba(13, 13, 13, 0.08)",
            display: "none"
          },
          appendBody: !0
        });
      }
      function s() {
        var m = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : !0;
        var h;
        try {
          n();
          var _ = (h = document == null ? void 0 : document.getElementById) == null ? void 0 : h.call(document, _s + "loading");
          _ && (_.style.display = m ? "block" : "none");
        } catch (_unused16) {}
      }
      function o(_ref54) {
        var m = _ref54.styles,
          _ref54$name = _ref54.name,
          h = _ref54$name === void 0 ? "path" : _ref54$name,
          _ref54$params = _ref54.params,
          _ = _ref54$params === void 0 ? {} : _ref54$params,
          _ref54$appendBody = _ref54.appendBody,
          I = _ref54$appendBody === void 0 ? !1 : _ref54$appendBody;
        s(!1), !I && n();
        try {
          var R = A(),
            U = _s + h,
            L = document.createElement("iframe");
          L.id = U, L.setAttribute("allowtransparency", "true"), L.style.position = "fixed", L.style.zIndex = "2147483648", Object.keys(m).forEach(function (B) {
            L.style[B] = m[B];
          }), L.src = Object.keys(_).reduce(function (B, Z, se) {
            return B + (se === 0 ? "?" : "&") + "".concat(Z, "=").concat(_[Z]);
          }, gu(h)), I ? document.body.appendChild(L) : R.appendChild(L);
        } catch (_unused17) {}
      }
      function i(_x18) {
        return _i4.apply(this, arguments);
      }
      function _i4() {
        _i4 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee18(m) {
          var h;
          return _regeneratorRuntime().wrap(function _callee18$(_context18) {
            while (1) switch (_context18.prev = _context18.next) {
              case 0:
                h = m.data;
                _context18.t0 = h.type;
                _context18.next = _context18.t0 === "dwEvent" ? 4 : _context18.t0 === "showLogin" ? 6 : _context18.t0 === "toast" ? 8 : _context18.t0 === "loading" ? 10 : _context18.t0 === "notice" ? 12 : _context18.t0 === "path" ? 12 : _context18.t0 === "login" ? 12 : _context18.t0 === "collect" ? 14 : _context18.t0 === "gotoLogin" ? 18 : 19;
                break;
              case 4:
                delete h.type, jt("dwEvent", h, "background").catch(function () {});
                return _context18.abrupt("break", 19);
              case 6:
                l();
                return _context18.abrupt("break", 19);
              case 8:
                c({
                  message: m.data.message || ""
                });
                return _context18.abrupt("break", 19);
              case 10:
                s(!1);
                return _context18.abrupt("break", 19);
              case 12:
                n();
                return _context18.abrupt("break", 19);
              case 14:
                _context18.next = 16;
                return sd({
                  title: h.title || ""
                });
              case 16:
                u({});
                return _context18.abrupt("break", 19);
              case 18:
                n(), du();
              case 19:
              case "end":
                return _context18.stop();
            }
          }, _callee18);
        }));
        return _i4.apply(this, arguments);
      }
      function a() {
        var m = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        o({
          styles: {
            width: "326px",
            height: "358px",
            right: "20px",
            top: "20px",
            overflow: "hidden",
            border: "3px solid #e4e7ed",
            background: "#fff",
            "box-shadow": "0 12px 32px rgba(13, 13, 13, 0.08)",
            "border-radius": "12px",
            "box-sizing": "border-box"
          },
          params: m
        });
      }
      function l() {
        o({
          name: "login",
          styles: {
            width: "326px",
            height: "322px",
            right: "20px",
            top: "20px",
            overflow: "hidden",
            border: "3px solid #e4e7ed",
            background: "#fff",
            "box-shadow": "0 12px 32px rgba(13, 13, 13, 0.08)",
            "border-radius": "12px",
            "box-sizing": "border-box"
          }
        });
      }
      function c(_x19) {
        return _c4.apply(this, arguments);
      }
      function _c4() {
        _c4 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee19(m) {
          return _regeneratorRuntime().wrap(function _callee19$(_context19) {
            while (1) switch (_context19.prev = _context19.next) {
              case 0:
                o({
                  name: "toast",
                  styles: {
                    width: "166px",
                    height: "54px",
                    right: "0",
                    left: "0",
                    margin: "auto",
                    top: "72px",
                    overflow: "hidden",
                    border: "3px solid #e4e7ed",
                    background: "#fff",
                    "border-radius": "8px",
                    "box-sizing": "border-box"
                  },
                  params: m,
                  appendBody: !0
                });
                _context19.next = 3;
                return qc(3e3);
              case 3:
                n("toast");
              case 4:
              case "end":
                return _context19.stop();
            }
          }, _callee19);
        }));
        return _c4.apply(this, arguments);
      }
      function u(m) {
        o({
          name: "notice",
          styles: {
            width: "336px",
            height: "60px",
            right: "20px",
            top: "20px",
            overflow: "hidden",
            border: "3px solid #e4e7ed",
            background: "#fff",
            "box-sizing": "border-box",
            "border-radius": "8px",
            "box-shadow": "0 12px 32px rgba(13, 13, 13, 0.08)"
          },
          params: m
        });
      }
      function d() {
        var _ref55, _ref56;
        var m, h, _, I;
        s(!0), jt("clickIcon", {
          text: (_ref55 = (_ = (h = (m = document == null ? void 0 : document.getElementsByTagName) == null ? void 0 : m.call(document, "html")) == null ? void 0 : h[0]) == null ? void 0 : _.outerHTML) !== null && _ref55 !== void 0 ? _ref55 : "",
          title: ys(),
          url: (_ref56 = (I = window == null ? void 0 : window.location) == null ? void 0 : I.href) !== null && _ref56 !== void 0 ? _ref56 : "",
          type: "page",
          dwName: "click_entrance_lowerright"
        }, "background").catch(function () {});
      }
      function A() {
        var _;
        var m = document.getElementById(ta);
        if (m) return m;
        var h = document.createElement("figure");
        return h.id = ta, (_ = document == null ? void 0 : document.body) == null || _.appendChild(h), h;
      }
      return ts("showIframe", function (m) {
        switch (m.data.type) {
          case "toast":
            c({
              message: m.data.message || ""
            });
            break;
          case "loading":
            s(m.data.visible || !1);
            break;
          case "path":
            a({
              type: m.data.contextPage || "page"
            }), jt("dwEvent", {
              action: "show_panel",
              page: "edit_panel"
            }, "background").catch(function () {});
            break;
          case "login":
            l(), jt("dwEvent", {
              action: "show_panel",
              page: "notlogin_panel"
            }, "background").catch(function () {});
            break;
          default:
            u({
              error: m.data.error ? "true" : "false"
            });
            break;
        }
      }), ts("getContent", /*#__PURE__*/function () {
        var _ref57 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee17(m) {
          var _ref58, _ref59;
          var I, R, U, L, h, _;
          return _regeneratorRuntime().wrap(function _callee17$(_context17) {
            while (1) switch (_context17.prev = _context17.next) {
              case 0:
                h = ys(), _ = (_ref58 = (I = window == null ? void 0 : window.location) == null ? void 0 : I.href) !== null && _ref58 !== void 0 ? _ref58 : "";
                return _context17.abrupt("return", (s(!0), m.data.type === "image" ? {
                  data: "",
                  title: "收藏图片_" + ws().format("YYYYMMDD_HHmm")
                } : m.data.type === "content" ? {
                  data: e(),
                  title: h
                } : {
                  data: (_ref59 = (L = (U = (R = document == null ? void 0 : document.getElementsByTagName) == null ? void 0 : R.call(document, "html")) == null ? void 0 : U[0]) == null ? void 0 : L.outerHTML) !== null && _ref59 !== void 0 ? _ref59 : "",
                  title: h,
                  url: _
                }));
              case 2:
              case "end":
                return _context17.stop();
            }
          }, _callee17);
        }));
        return function (_x20) {
          return _ref57.apply(this, arguments);
        };
      }()), ts("isAlive", function () {
        return !0;
      }), Sn(function () {
        var m;
        (m = window == null ? void 0 : window.addEventListener) == null || m.call(window, "message", i);
      }), On(function () {
        var m;
        n(), (m = window == null ? void 0 : window.removeEventListener) == null || m.call(window, "message", i);
      }), Sr(function () {
        r();
      }), {
        createIframe: o,
        removeIframe: n,
        sendHtmlContent: d,
        onLoadingIframeStateChange: s,
        iframeContent: t
      };
    };
  var ln = si(),
    Ce = new Map(),
    Ft = new Map(),
    nr = new Map(),
    na = function na(e, t) {
      return Ft.set(e, (Ft.get(e) || new Set()).add(t)), function () {
        var n = Ft.get(e);
        n != null && n.delete(t) && (n == null ? void 0 : n.size) === 0 && Ft.delete(e);
      };
    },
    ra = function ra(e, t) {
      nr.set(e, (nr.get(e) || new Set()).add(t));
    },
    Et = function Et(e) {
      return {
        withFingerprint: function withFingerprint(t) {
          var n = function n(s) {
              return {
                and: function and() {
                  return s;
                }
              };
            },
            r = {
              aboutIncomingMessage: function aboutIncomingMessage(s) {
                var o = Ce.get(e);
                return ct.toExtensionContext(o.port, {
                  status: "incoming",
                  message: s
                }), n(r);
              },
              aboutSuccessfulDelivery: function aboutSuccessfulDelivery(s) {
                var o = Ce.get(e);
                return ct.toExtensionContext(o.port, {
                  status: "delivered",
                  receipt: s
                }), n(r);
              },
              aboutMessageUndeliverability: function aboutMessageUndeliverability(s, o) {
                var i = Ce.get(e);
                return (i == null ? void 0 : i.fingerprint) === t && ct.toExtensionContext(i.port, {
                  status: "undeliverable",
                  resolvedDestination: s,
                  message: o
                }), n(r);
              },
              whenDeliverableTo: function whenDeliverableTo(s) {
                var o = function o() {
                  var i = Ce.get(e);
                  if ((i == null ? void 0 : i.fingerprint) === t && Ce.has(s)) return ct.toExtensionContext(i.port, {
                    status: "deliverable",
                    deliverableTo: s
                  }), !0;
                };
                if (!o()) {
                  var i = na(s, o);
                  ra(t, i);
                }
                return n(r);
              },
              aboutSessionEnded: function aboutSessionEnded(s) {
                var o = Ce.get(e);
                return (o == null ? void 0 : o.fingerprint) === t && ct.toExtensionContext(o.port, {
                  status: "terminated",
                  fingerprint: s
                }), n(r);
              }
            };
          return r;
        }
      };
    },
    id = ni(),
    rr = fi("background", function (e) {
      var t;
      if (e.origin.context === "background" && ["content-script", "devtools "].includes(e.destination.context) && !e.destination.tabId) throw new TypeError("When sending messages from background page, use @tabId syntax to target specific tab");
      var n = zn(ut(ut({}, e.origin), e.origin.context === "window" && {
          context: "content-script"
        })),
        r = zn(Qr(ut(ut({}, e.destination), e.destination.context === "window" && {
          context: "content-script"
        }), {
          tabId: e.destination.tabId || e.origin.tabId
        }));
      e.destination.tabId = null, e.destination.frameId = null;
      var s = function s() {
          return Ce.get(r);
        },
        o = function o() {
          return Ce.get(n);
        },
        i = function i() {
          var a;
          Et(r).withFingerprint(s().fingerprint).aboutIncomingMessage(e);
          var l = {
            message: e,
            to: s().fingerprint,
            from: {
              endpointId: n,
              fingerprint: (a = o()) == null ? void 0 : a.fingerprint
            }
          };
          e.messageType === "message" && ln.add(l), e.messageType === "reply" && ln.remove(e.messageID), o() && Et(n).withFingerprint(o().fingerprint).aboutSuccessfulDelivery(l);
        };
      (t = s()) != null && t.port ? i() : e.messageType === "message" && (e.origin.context === "background" ? na(r, i) : o() && Et(n).withFingerprint(o().fingerprint).aboutMessageUndeliverability(r, e).and().whenDeliverableTo(r));
    }, function (e) {
      var t = zn(ut(ut({}, e.origin), e.origin.context === "window" && {
          context: "content-script"
        })),
        n = Ce.get(t),
        r = {
          message: e,
          to: id,
          from: {
            endpointId: t,
            fingerprint: n.fingerprint
          }
        };
      Et(t).withFingerprint(n.fingerprint).aboutSuccessfulDelivery(r);
    });
  ii.runtime.onConnect.addListener(function (e) {
    var t;
    var n = Au(e.name);
    if (!n) return;
    n.endpointName || (n.endpointName = zn({
      context: "content-script",
      tabId: e.sender.tab.id,
      frameId: e.sender.frameId
    }));
    var _Zr = Zr(n.endpointName),
      r = _Zr.tabId,
      s = _Zr.frameId;
    Ce.set(n.endpointName, {
      fingerprint: n.fingerprint,
      port: e
    }), (t = Ft.get(n.endpointName)) == null || t.forEach(function (o) {
      return o();
    }), Ft.delete(n.endpointName), ra(n.fingerprint, function () {
      var o = ln.entries().filter(function (i) {
        return i.to === n.fingerprint;
      });
      ln.remove(o), o.forEach(function (i) {
        i.from.endpointId === "background" ? rr.endTransaction(i.message.transactionId) : Et(i.from.endpointId).withFingerprint(i.from.fingerprint).aboutSessionEnded(n.fingerprint);
      });
    }), e.onDisconnect.addListener(function () {
      var o, i;
      ((o = Ce.get(n.endpointName)) == null ? void 0 : o.fingerprint) === n.fingerprint && Ce.delete(n.endpointName), (i = nr.get(n.fingerprint)) == null || i.forEach(function (a) {
        return a();
      }), nr.delete(n.fingerprint);
    }), e.onMessage.addListener(function (o) {
      var i, a;
      if (o.type === "sync") {
        var _l5 = _toConsumableArray(Ce.values()).map(function (u) {
            return u.fingerprint;
          }),
          _c5 = o.pendingResponses.filter(function (u) {
            return _l5.includes(u.to);
          });
        ln.add.apply(ln, _toConsumableArray(_c5)), o.pendingResponses.filter(function (u) {
          return !_l5.includes(u.to);
        }).forEach(function (u) {
          return Et(n.endpointName).withFingerprint(n.fingerprint).aboutSessionEnded(u.to);
        }), o.pendingDeliveries.forEach(function (u) {
          return Et(n.endpointName).withFingerprint(n.fingerprint).whenDeliverableTo(u);
        });
        return;
      }
      o.type === "deliver" && (a = (i = o.message) == null ? void 0 : i.origin) != null && a.context && (o.message.origin.tabId = r, o.message.origin.frameId = s, rr.handleMessage(o.message));
    });
  });
  var ad = rr.sendMessage,
    vd = rr.onMessage;
  di(rr);
  var ld = ze("img", {
      src: Fc,
      class: "kdocs-webcut-ext-icon",
      style: {
        width: "100%",
        height: "100%"
      }
    }, null, -1),
    cd = ze("div", {
      style: {
        width: "0px",
        height: "0px",
        "border-top": "6px solid rgb(31, 35, 41)",
        "border-left": "6px solid transparent",
        "border-right": "6px solid transparent",
        position: "absolute",
        bottom: "-6px",
        left: "0px",
        right: "0px",
        margin: "auto"
      }
    }, null, -1),
    ud = ["onClick"],
    fd = [ze("svg", {
      width: "28",
      height: "28",
      viewBox: "0 0 28 28",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg"
    }, [ze("rect", {
      x: "0.5",
      y: "0.5",
      width: "27",
      height: "27",
      rx: "5.5",
      fill: "white"
    }), ze("path", {
      d: "M16.5 19L14.1564 14.6734M12.309 11.2628L10 6.99997M11.5 19L18 6.99997M12 17.5C12 18.8807 10.8807 20 9.5 20C8.11929 20 7 18.8807 7 17.5C7 16.1193 8.11929 15 9.5 15C10.8807 15 12 16.1193 12 17.5ZM21 17.5C21 18.8807 19.8807 20 18.5 20C17.1193 20 16 18.8807 16 17.5C16 16.1193 17.1193 15 18.5 15C19.8807 15 21 16.1193 21 17.5Z",
      stroke: "#333333",
      "stroke-width": "1.5",
      "stroke-linecap": "round",
      "stroke-linejoin": "round"
    }), ze("rect", {
      x: "0.5",
      y: "0.5",
      width: "27",
      height: "27",
      rx: "5.5",
      stroke: "#CCCCCC"
    })], -1)],
    dd = bl({
      __name: "App",
      setup: function setup(e) {
        var _mi2 = mi(),
          t = _mi2.getSettingConfigsNoRef,
          _Xi2 = Xi(),
          n = _Xi2.getSubKeysNoRef,
          r = _Xi2.whetherDomainLegally,
          _od = od(),
          s = _od.sendHtmlContent,
          o = _od.onLoadingIframeStateChange,
          _Gi2 = Gi(),
          i = _Gi2.result,
          a = _Gi2.onCollectionClick,
          l = _Gi2.kdocsExtIcon,
          c = wt(function () {
            return _objectSpread(_objectSpread({
              position: "fixed",
              width: "28px",
              left: "0px",
              top: "0px",
              height: "28px",
              cursor: "pointer"
            }, i.value.style), {}, {
              "will-change": "transform",
              "font-size": "0px"
            });
          }),
          u = Ae(!1);
        Sn( /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee20() {
          var U, _yield$t, I, _yield$n, R;
          return _regeneratorRuntime().wrap(function _callee20$(_context20) {
            while (1) switch (_context20.prev = _context20.next) {
              case 0:
                _context20.next = 2;
                return t();
              case 2:
                _yield$t = _context20.sent;
                I = _yield$t.partWebPageDisplay;
                _context20.next = 6;
                return n();
              case 6:
                _yield$n = _context20.sent;
                R = _yield$n.whiteUrls;
                u.value = r((U = window == null ? void 0 : window.location) == null ? void 0 : U.href, R) && I;
              case 9:
              case "end":
                return _context20.stop();
            }
          }, _callee20);
        }))), Sr(function () {
          ce(u) && ad("dwEvent", {
            action: "show_entrance_lowerright"
          }, "background").catch(function () {});
        });
        function d() {
          o(!0), a();
        }
        var A = Ae(null),
          m = nu(A),
          h = wt(function () {
            var I = {
              position: "fixed",
              "z-index": "99999",
              right: "60px",
              bottom: "70px",
              width: "52px",
              height: "52px",
              padding: "8px",
              border: "2px solid rgba(31, 35, 41, 0.1)",
              "box-sizing": "border-box",
              "box-shadow": "rgba(31, 35, 41, 0.08) 0px 6px 24px",
              "border-radius": "12px",
              "text-align": "center",
              "font-weight": "500",
              background: "#ffffff",
              "font-size": "10px",
              color: "rgb(81, 86, 93)",
              "line-height": "13px",
              cursor: "pointer"
            };
            return m.value ? _objectSpread(_objectSpread({}, I), {}, {
              transform: "translateY(-4px)",
              transition: "all 0.3s ease-out 0s"
            }) : I;
          }),
          _ = wt(function () {
            var I = {
              position: "absolute",
              top: "-47px",
              right: "-40px",
              width: "130px",
              height: "36px",
              "background-color": "rgb(31, 35, 41)",
              "text-align": "center",
              "border-radius": "4px",
              color: "rgb(255, 255, 255)",
              "font-size": "12px",
              "line-height": "36px",
              "pointer-events": "none",
              opacity: "0"
            };
            return m.value ? _objectSpread(_objectSpread({}, I), {}, {
              opacity: "1",
              transition: "opacity 0.3s ease-out 0s"
            }) : I;
          });
        return function (I, R) {
          return kn(), No(Be, null, [u.value ? (kn(), No("div", {
            key: 0,
            ref_key: "myHoverEle",
            ref: A,
            style: Tt(ce(h)),
            onClick: R[0] || (R[0] = Ko(function () {
              return ce(s) && ce(s).apply(void 0, arguments);
            }, ["stop"]))
          }, [ld, ze("div", {
            style: Tt(ce(_))
          }, [Ro(" 收藏网页到金山文档 "), cd], 4)], 4)) : nc("", !0), (kn(), Po(Zl, {
            to: "body"
          }, [xl(ze("div", {
            ref_key: "kdocsExtIcon",
            ref: l,
            style: Tt([ce(c), {
              "z-index": "999999999999999999999 !important"
            }]),
            onClick: Ko(d, ["stop", "prevent"])
          }, fd, 12, ud), [[Rc, ce(i).show]])]))], 64);
        };
      }
    });
  function gd() {
    return _gd.apply(this, arguments);
  }
  function _gd() {
    _gd = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee21() {
      var e, t, n, r, s, _o8;
      return _regeneratorRuntime().wrap(function _callee21$(_context21) {
        while (1) switch (_context21.prev = _context21.next) {
          case 0:
            _context21.prev = 0;
            n = document.createElement("div"), r = document.createElement("div"), s = document.createElement("link"), _o8 = ((e = n.attachShadow) == null ? void 0 : e.call(n, {
              mode: "closed"
            })) || n;
            if (!(s.setAttribute("rel", "stylesheet"), _o8.appendChild(s), _o8.appendChild(r), !(document != null && document.body))) {
              _context21.next = 4;
              break;
            }
            return _context21.abrupt("return");
          case 4:
            (t = document == null ? void 0 : document.body) == null || t.appendChild(n), Lc(dd).mount(r);
            _context21.next = 9;
            break;
          case 7:
            _context21.prev = 7;
            _context21.t0 = _context21["catch"](0);
          case 9:
          case "end":
            return _context21.stop();
        }
      }, _callee21, null, [[0, 7]]);
    }));
    return _gd.apply(this, arguments);
  }
  gd();
})();
