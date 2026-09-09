function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return exports; }; var exports = {}, Op = Object.prototype, hasOwn = Op.hasOwnProperty, defineProperty = Object.defineProperty || function (obj, key, desc) { obj[key] = desc.value; }, $Symbol = "function" == typeof Symbol ? Symbol : {}, iteratorSymbol = $Symbol.iterator || "@@iterator", asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator", toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag"; function define(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: !0, configurable: !0, writable: !0 }), obj[key]; } try { define({}, ""); } catch (err) { define = function define(obj, key, value) { return obj[key] = value; }; } function wrap(innerFn, outerFn, self, tryLocsList) { var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator, generator = Object.create(protoGenerator.prototype), context = new Context(tryLocsList || []); return defineProperty(generator, "_invoke", { value: makeInvokeMethod(innerFn, self, context) }), generator; } function tryCatch(fn, obj, arg) { try { return { type: "normal", arg: fn.call(obj, arg) }; } catch (err) { return { type: "throw", arg: err }; } } exports.wrap = wrap; var ContinueSentinel = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var IteratorPrototype = {}; define(IteratorPrototype, iteratorSymbol, function () { return this; }); var getProto = Object.getPrototypeOf, NativeIteratorPrototype = getProto && getProto(getProto(values([]))); NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype); var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype); function defineIteratorMethods(prototype) { ["next", "throw", "return"].forEach(function (method) { define(prototype, method, function (arg) { return this._invoke(method, arg); }); }); } function AsyncIterator(generator, PromiseImpl) { function invoke(method, arg, resolve, reject) { var record = tryCatch(generator[method], generator, arg); if ("throw" !== record.type) { var result = record.arg, value = result.value; return value && "object" == _typeof(value) && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) { invoke("next", value, resolve, reject); }, function (err) { invoke("throw", err, resolve, reject); }) : PromiseImpl.resolve(value).then(function (unwrapped) { result.value = unwrapped, resolve(result); }, function (error) { return invoke("throw", error, resolve, reject); }); } reject(record.arg); } var previousPromise; defineProperty(this, "_invoke", { value: function value(method, arg) { function callInvokeWithMethodAndArg() { return new PromiseImpl(function (resolve, reject) { invoke(method, arg, resolve, reject); }); } return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(innerFn, self, context) { var state = "suspendedStart"; return function (method, arg) { if ("executing" === state) throw new Error("Generator is already running"); if ("completed" === state) { if ("throw" === method) throw arg; return doneResult(); } for (context.method = method, context.arg = arg;;) { var delegate = context.delegate; if (delegate) { var delegateResult = maybeInvokeDelegate(delegate, context); if (delegateResult) { if (delegateResult === ContinueSentinel) continue; return delegateResult; } } if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) { if ("suspendedStart" === state) throw state = "completed", context.arg; context.dispatchException(context.arg); } else "return" === context.method && context.abrupt("return", context.arg); state = "executing"; var record = tryCatch(innerFn, self, context); if ("normal" === record.type) { if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue; return { value: record.arg, done: context.done }; } "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg); } }; } function maybeInvokeDelegate(delegate, context) { var methodName = context.method, method = delegate.iterator[methodName]; if (undefined === method) return context.delegate = null, "throw" === methodName && delegate.iterator.return && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method) || "return" !== methodName && (context.method = "throw", context.arg = new TypeError("The iterator does not provide a '" + methodName + "' method")), ContinueSentinel; var record = tryCatch(method, delegate.iterator, context.arg); if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel; var info = record.arg; return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel); } function pushTryEntry(locs) { var entry = { tryLoc: locs[0] }; 1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry); } function resetTryEntry(entry) { var record = entry.completion || {}; record.type = "normal", delete record.arg, entry.completion = record; } function Context(tryLocsList) { this.tryEntries = [{ tryLoc: "root" }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0); } function values(iterable) { if (iterable) { var iteratorMethod = iterable[iteratorSymbol]; if (iteratorMethod) return iteratorMethod.call(iterable); if ("function" == typeof iterable.next) return iterable; if (!isNaN(iterable.length)) { var i = -1, next = function next() { for (; ++i < iterable.length;) if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next; return next.value = undefined, next.done = !0, next; }; return next.next = next; } } return { next: doneResult }; } function doneResult() { return { value: undefined, done: !0 }; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, defineProperty(Gp, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), defineProperty(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) { var ctor = "function" == typeof genFun && genFun.constructor; return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name)); }, exports.mark = function (genFun) { return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun; }, exports.awrap = function (arg) { return { __await: arg }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () { return this; }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) { void 0 === PromiseImpl && (PromiseImpl = Promise); var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl); return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) { return result.done ? result.value : iter.next(); }); }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () { return this; }), define(Gp, "toString", function () { return "[object Generator]"; }), exports.keys = function (val) { var object = Object(val), keys = []; for (var key in object) keys.push(key); return keys.reverse(), function next() { for (; keys.length;) { var key = keys.pop(); if (key in object) return next.value = key, next.done = !1, next; } return next.done = !0, next; }; }, exports.values = values, Context.prototype = { constructor: Context, reset: function reset(skipTempReset) { if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined); }, stop: function stop() { this.done = !0; var rootRecord = this.tryEntries[0].completion; if ("throw" === rootRecord.type) throw rootRecord.arg; return this.rval; }, dispatchException: function dispatchException(exception) { if (this.done) throw exception; var context = this; function handle(loc, caught) { return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught; } for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i], record = entry.completion; if ("root" === entry.tryLoc) return handle("end"); if (entry.tryLoc <= this.prev) { var hasCatch = hasOwn.call(entry, "catchLoc"), hasFinally = hasOwn.call(entry, "finallyLoc"); if (hasCatch && hasFinally) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } else if (hasCatch) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); } else { if (!hasFinally) throw new Error("try statement without catch or finally"); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } } } }, abrupt: function abrupt(type, arg) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) { var finallyEntry = entry; break; } } finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null); var record = finallyEntry ? finallyEntry.completion : {}; return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record); }, complete: function complete(record, afterLoc) { if ("throw" === record.type) throw record.arg; return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel; }, finish: function finish(finallyLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel; } }, catch: function _catch(tryLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc === tryLoc) { var record = entry.completion; if ("throw" === record.type) { var thrown = record.arg; resetTryEntry(entry); } return thrown; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(iterable, resultName, nextLoc) { return this.delegate = { iterator: values(iterable), resultName: resultName, nextLoc: nextLoc }, "next" === this.method && (this.arg = undefined), ContinueSentinel; } }, exports; }
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _iterableToArrayLimit(arr, i) { var _i = null == arr ? null : "undefined" != typeof Symbol && arr[Symbol.iterator] || arr["@@iterator"]; if (null != _i) { var _s, _e, _x, _r, _arr = [], _n = !0, _d = !1; try { if (_x = (_i = _i.call(arr)).next, 0 === i) { if (Object(_i) !== _i) return; _n = !1; } else for (; !(_n = (_s = _x.call(_i)).done) && (_arr.push(_s.value), _arr.length !== i); _n = !0); } catch (err) { _d = !0, _e = err; } finally { try { if (!_n && null != _i.return && (_r = _i.return(), Object(_r) !== _r)) return; } finally { if (_d) throw _e; } } return _arr; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
var ve = Object.defineProperty;
var Ge = function Ge(e, t, n) {
  return t in e ? ve(e, t, {
    enumerable: !0,
    configurable: !0,
    writable: !0,
    value: n
  }) : e[t] = n;
};
var K = function K(e, t, n) {
  return Ge(e, _typeof(t) != "symbol" ? t + "" : t, n), n;
};
import { ag as N, ak as Oe, al as re } from "./__uno-cab22814.js";
import { k as Ae, v as ge, d as Xe } from "./url-1b6e2379.js";
function Te(e, t) {
  return function () {
    return e.apply(t, arguments);
  };
}
var Qe = Object.prototype.toString,
  se = Object.getPrototypeOf,
  H = function (e) {
    return function (t) {
      var n = Qe.call(t);
      return e[n] || (e[n] = n.slice(8, -1).toLowerCase());
    };
  }(Object.create(null)),
  A = function A(e) {
    return e = e.toLowerCase(), function (t) {
      return H(t) === e;
    };
  },
  J = function J(e) {
    return function (t) {
      return _typeof(t) === e;
    };
  },
  F = Array.isArray,
  U = J("undefined");
function Ye(e) {
  return e !== null && !U(e) && e.constructor !== null && !U(e.constructor) && E(e.constructor.isBuffer) && e.constructor.isBuffer(e);
}
var Ce = A("ArrayBuffer");
function Ze(e) {
  var t;
  return (typeof ArrayBuffer === "undefined" ? "undefined" : _typeof(ArrayBuffer)) < "u" && ArrayBuffer.isView ? t = ArrayBuffer.isView(e) : t = e && e.buffer && Ce(e.buffer), t;
}
var et = J("string"),
  E = J("function"),
  Ne = J("number"),
  z = function z(e) {
    return e !== null && _typeof(e) == "object";
  },
  tt = function tt(e) {
    return e === !0 || e === !1;
  },
  _ = function _(e) {
    if (H(e) !== "object") return !1;
    var t = se(e);
    return (t === null || t === Object.prototype || Object.getPrototypeOf(t) === null) && !(Symbol.toStringTag in e) && !(Symbol.iterator in e);
  },
  nt = A("Date"),
  rt = A("File"),
  st = A("Blob"),
  ot = A("FileList"),
  it = function it(e) {
    return z(e) && E(e.pipe);
  },
  at = function at(e) {
    var t;
    return e && (typeof FormData == "function" && e instanceof FormData || E(e.append) && ((t = H(e)) === "formdata" || t === "object" && E(e.toString) && e.toString() === "[object FormData]"));
  },
  ct = A("URLSearchParams"),
  ut = function ut(e) {
    return e.trim ? e.trim() : e.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
  };
function B(e, t) {
  var _ref = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
    _ref$allOwnKeys = _ref.allOwnKeys,
    n = _ref$allOwnKeys === void 0 ? !1 : _ref$allOwnKeys;
  if (e === null || _typeof(e) > "u") return;
  var r, s;
  if (_typeof(e) != "object" && (e = [e]), F(e)) for (r = 0, s = e.length; r < s; r++) t.call(null, e[r], r, e);else {
    var o = n ? Object.getOwnPropertyNames(e) : Object.keys(e),
      i = o.length;
    var u;
    for (r = 0; r < i; r++) u = o[r], t.call(null, e[u], u, e);
  }
}
function xe(e, t) {
  t = t.toLowerCase();
  var n = Object.keys(e);
  var r = n.length,
    s;
  for (; r-- > 0;) if (s = n[r], t === s.toLowerCase()) return s;
  return null;
}
var Pe = function () {
    return (typeof globalThis === "undefined" ? "undefined" : _typeof(globalThis)) < "u" ? globalThis : (typeof self === "undefined" ? "undefined" : _typeof(self)) < "u" ? self : (typeof window === "undefined" ? "undefined" : _typeof(window)) < "u" ? window : global;
  }(),
  Fe = function Fe(e) {
    return !U(e) && e !== Pe;
  };
function Y() {
  var _ref2 = Fe(this) && this || {},
    e = _ref2.caseless,
    t = {},
    n = function n(r, s) {
      var o = e && xe(t, s) || s;
      _(t[o]) && _(r) ? t[o] = Y(t[o], r) : _(r) ? t[o] = Y({}, r) : F(r) ? t[o] = r.slice() : t[o] = r;
    };
  for (var r = 0, s = arguments.length; r < s; r++) arguments[r] && B(arguments[r], n);
  return t;
}
var lt = function lt(e, t, n) {
    var _ref3 = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {},
      r = _ref3.allOwnKeys;
    return B(t, function (s, o) {
      n && E(s) ? e[o] = Te(s, n) : e[o] = s;
    }, {
      allOwnKeys: r
    }), e;
  },
  ft = function ft(e) {
    return e.charCodeAt(0) === 65279 && (e = e.slice(1)), e;
  },
  dt = function dt(e, t, n, r) {
    e.prototype = Object.create(t.prototype, r), e.prototype.constructor = e, Object.defineProperty(e, "super", {
      value: t.prototype
    }), n && Object.assign(e.prototype, n);
  },
  ht = function ht(e, t, n, r) {
    var s, o, i;
    var u = {};
    if (t = t || {}, e == null) return t;
    do {
      for (s = Object.getOwnPropertyNames(e), o = s.length; o-- > 0;) i = s[o], (!r || r(i, e, t)) && !u[i] && (t[i] = e[i], u[i] = !0);
      e = n !== !1 && se(e);
    } while (e && (!n || n(e, t)) && e !== Object.prototype);
    return t;
  },
  pt = function pt(e, t, n) {
    e = String(e), (n === void 0 || n > e.length) && (n = e.length), n -= t.length;
    var r = e.indexOf(t, n);
    return r !== -1 && r === n;
  },
  mt = function mt(e) {
    if (!e) return null;
    if (F(e)) return e;
    var t = e.length;
    if (!Ne(t)) return null;
    var n = new Array(t);
    for (; t-- > 0;) n[t] = e[t];
    return n;
  },
  yt = function (e) {
    return function (t) {
      return e && t instanceof e;
    };
  }((typeof Uint8Array === "undefined" ? "undefined" : _typeof(Uint8Array)) < "u" && se(Uint8Array)),
  wt = function wt(e, t) {
    var r = (e && e[Symbol.iterator]).call(e);
    var s;
    for (; (s = r.next()) && !s.done;) {
      var o = s.value;
      t.call(e, o[0], o[1]);
    }
  },
  bt = function bt(e, t) {
    var n;
    var r = [];
    for (; (n = e.exec(t)) !== null;) r.push(n);
    return r;
  },
  Et = A("HTMLFormElement"),
  St = function St(e) {
    return e.toLowerCase().replace(/[-_\s]([a-z\d])(\w*)/g, function (n, r, s) {
      return r.toUpperCase() + s;
    });
  },
  le = function (_ref4) {
    var e = _ref4.hasOwnProperty;
    return function (t, n) {
      return e.call(t, n);
    };
  }(Object.prototype),
  Rt = A("RegExp"),
  ke = function ke(e, t) {
    var n = Object.getOwnPropertyDescriptors(e),
      r = {};
    B(n, function (s, o) {
      t(s, o, e) !== !1 && (r[o] = s);
    }), Object.defineProperties(e, r);
  },
  Ot = function Ot(e) {
    ke(e, function (t, n) {
      if (E(e) && ["arguments", "caller", "callee"].indexOf(n) !== -1) return !1;
      var r = e[n];
      if (E(r)) {
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
  At = function At(e, t) {
    var n = {},
      r = function r(s) {
        s.forEach(function (o) {
          n[o] = !0;
        });
      };
    return F(e) ? r(e) : r(String(e).split(t)), n;
  },
  gt = function gt() {},
  Tt = function Tt(e, t) {
    return e = +e, Number.isFinite(e) ? e : t;
  },
  v = "abcdefghijklmnopqrstuvwxyz",
  fe = "0123456789",
  Ue = {
    DIGIT: fe,
    ALPHA: v,
    ALPHA_DIGIT: v + v.toUpperCase() + fe
  },
  Ct = function Ct() {
    var e = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 16;
    var t = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Ue.ALPHA_DIGIT;
    var n = "";
    var r = t.length;
    for (; e--;) n += t[Math.random() * r | 0];
    return n;
  };
function Nt(e) {
  return !!(e && E(e.append) && e[Symbol.toStringTag] === "FormData" && e[Symbol.iterator]);
}
var xt = function xt(e) {
    var t = new Array(10),
      n = function n(r, s) {
        if (z(r)) {
          if (t.indexOf(r) >= 0) return;
          if (!("toJSON" in r)) {
            t[s] = r;
            var o = F(r) ? [] : {};
            return B(r, function (i, u) {
              var d = n(i, s + 1);
              !U(d) && (o[u] = d);
            }), t[s] = void 0, o;
          }
        }
        return r;
      };
    return n(e, 0);
  },
  Pt = A("AsyncFunction"),
  Ft = function Ft(e) {
    return e && (z(e) || E(e)) && E(e.then) && E(e.catch);
  },
  a = {
    isArray: F,
    isArrayBuffer: Ce,
    isBuffer: Ye,
    isFormData: at,
    isArrayBufferView: Ze,
    isString: et,
    isNumber: Ne,
    isBoolean: tt,
    isObject: z,
    isPlainObject: _,
    isUndefined: U,
    isDate: nt,
    isFile: rt,
    isBlob: st,
    isRegExp: Rt,
    isFunction: E,
    isStream: it,
    isURLSearchParams: ct,
    isTypedArray: yt,
    isFileList: ot,
    forEach: B,
    merge: Y,
    extend: lt,
    trim: ut,
    stripBOM: ft,
    inherits: dt,
    toFlatObject: ht,
    kindOf: H,
    kindOfTest: A,
    endsWith: pt,
    toArray: mt,
    forEachEntry: wt,
    matchAll: bt,
    isHTMLForm: Et,
    hasOwnProperty: le,
    hasOwnProp: le,
    reduceDescriptors: ke,
    freezeMethods: Ot,
    toObjectSet: At,
    toCamelCase: St,
    noop: gt,
    toFiniteNumber: Tt,
    findKey: xe,
    global: Pe,
    isContextDefined: Fe,
    ALPHABET: Ue,
    generateString: Ct,
    isSpecCompliantForm: Nt,
    toJSONObject: xt,
    isAsyncFn: Pt,
    isThenable: Ft
  };
function m(e, t, n, r, s) {
  Error.call(this), Error.captureStackTrace ? Error.captureStackTrace(this, this.constructor) : this.stack = new Error().stack, this.message = e, this.name = "AxiosError", t && (this.code = t), n && (this.config = n), r && (this.request = r), s && (this.response = s);
}
a.inherits(m, Error, {
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
      config: a.toJSONObject(this.config),
      code: this.code,
      status: this.response && this.response.status ? this.response.status : null
    };
  }
});
var Be = m.prototype,
  De = {};
["ERR_BAD_OPTION_VALUE", "ERR_BAD_OPTION", "ECONNABORTED", "ETIMEDOUT", "ERR_NETWORK", "ERR_FR_TOO_MANY_REDIRECTS", "ERR_DEPRECATED", "ERR_BAD_RESPONSE", "ERR_BAD_REQUEST", "ERR_CANCELED", "ERR_NOT_SUPPORT", "ERR_INVALID_URL"].forEach(function (e) {
  De[e] = {
    value: e
  };
});
Object.defineProperties(m, De);
Object.defineProperty(Be, "isAxiosError", {
  value: !0
});
m.from = function (e, t, n, r, s, o) {
  var i = Object.create(Be);
  return a.toFlatObject(e, i, function (d) {
    return d !== Error.prototype;
  }, function (u) {
    return u !== "isAxiosError";
  }), m.call(i, e.message, t, n, r, s), i.cause = e, i.name = e.name, o && Object.assign(i, o), i;
};
var kt = null;
function Z(e) {
  return a.isPlainObject(e) || a.isArray(e);
}
function Le(e) {
  return a.endsWith(e, "[]") ? e.slice(0, -2) : e;
}
function de(e, t, n) {
  return e ? e.concat(t).map(function (s, o) {
    return s = Le(s), !n && o ? "[" + s + "]" : s;
  }).join(n ? "." : "") : t;
}
function Ut(e) {
  return a.isArray(e) && !e.some(Z);
}
var Bt = a.toFlatObject(a, {}, null, function (t) {
  return /^is[A-Z]/.test(t);
});
function $(e, t, n) {
  if (!a.isObject(e)) throw new TypeError("target must be an object");
  t = t || new FormData(), n = a.toFlatObject(n, {
    metaTokens: !0,
    dots: !1,
    indexes: !1
  }, !1, function (p, g) {
    return !a.isUndefined(g[p]);
  });
  var r = n.metaTokens,
    s = n.visitor || l,
    o = n.dots,
    i = n.indexes,
    d = (n.Blob || (typeof Blob === "undefined" ? "undefined" : _typeof(Blob)) < "u" && Blob) && a.isSpecCompliantForm(t);
  if (!a.isFunction(s)) throw new TypeError("visitor must be a function");
  function c(f) {
    if (f === null) return "";
    if (a.isDate(f)) return f.toISOString();
    if (!d && a.isBlob(f)) throw new m("Blob is not supported. Use a Buffer instead.");
    return a.isArrayBuffer(f) || a.isTypedArray(f) ? d && typeof Blob == "function" ? new Blob([f]) : Buffer.from(f) : f;
  }
  function l(f, p, g) {
    var S = f;
    if (f && !g && _typeof(f) == "object") {
      if (a.endsWith(p, "{}")) p = r ? p : p.slice(0, -2), f = JSON.stringify(f);else if (a.isArray(f) && Ut(f) || (a.isFileList(f) || a.endsWith(p, "[]")) && (S = a.toArray(f))) return p = Le(p), S.forEach(function (L, Ke) {
        !(a.isUndefined(L) || L === null) && t.append(i === !0 ? de([p], Ke, o) : i === null ? p : p + "[]", c(L));
      }), !1;
    }
    return Z(f) ? !0 : (t.append(de(g, p, o), c(f)), !1);
  }
  var h = [],
    b = Object.assign(Bt, {
      defaultVisitor: l,
      convertValue: c,
      isVisitable: Z
    });
  function y(f, p) {
    if (!a.isUndefined(f)) {
      if (h.indexOf(f) !== -1) throw Error("Circular reference detected in " + p.join("."));
      h.push(f), a.forEach(f, function (S, x) {
        (!(a.isUndefined(S) || S === null) && s.call(t, S, a.isString(x) ? x.trim() : x, p, b)) === !0 && y(S, p ? p.concat(x) : [x]);
      }), h.pop();
    }
  }
  if (!a.isObject(e)) throw new TypeError("data must be an object");
  return y(e), t;
}
function he(e) {
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
function oe(e, t) {
  this._pairs = [], e && $(e, this, t);
}
var _e = oe.prototype;
_e.append = function (t, n) {
  this._pairs.push([t, n]);
};
_e.toString = function (t) {
  var n = t ? function (r) {
    return t.call(this, r, he);
  } : he;
  return this._pairs.map(function (s) {
    return n(s[0]) + "=" + n(s[1]);
  }, "").join("&");
};
function Dt(e) {
  return encodeURIComponent(e).replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "+").replace(/%5B/gi, "[").replace(/%5D/gi, "]");
}
function je(e, t, n) {
  if (!t) return e;
  var r = n && n.encode || Dt,
    s = n && n.serialize;
  var o;
  if (s ? o = s(t, n) : o = a.isURLSearchParams(t) ? t.toString() : new oe(t, n).toString(r), o) {
    var i = e.indexOf("#");
    i !== -1 && (e = e.slice(0, i)), e += (e.indexOf("?") === -1 ? "?" : "&") + o;
  }
  return e;
}
var Lt = /*#__PURE__*/function () {
  function Lt() {
    _classCallCheck(this, Lt);
    this.handlers = [];
  }
  _createClass(Lt, [{
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
      a.forEach(this.handlers, function (r) {
        r !== null && t(r);
      });
    }
  }]);
  return Lt;
}();
var pe = Lt,
  Ie = {
    silentJSONParsing: !0,
    forcedJSONParsing: !0,
    clarifyTimeoutError: !1
  },
  _t = (typeof URLSearchParams === "undefined" ? "undefined" : _typeof(URLSearchParams)) < "u" ? URLSearchParams : oe,
  jt = (typeof FormData === "undefined" ? "undefined" : _typeof(FormData)) < "u" ? FormData : null,
  It = (typeof Blob === "undefined" ? "undefined" : _typeof(Blob)) < "u" ? Blob : null,
  qt = function () {
    var e;
    return (typeof navigator === "undefined" ? "undefined" : _typeof(navigator)) < "u" && ((e = navigator.product) === "ReactNative" || e === "NativeScript" || e === "NS") ? !1 : (typeof window === "undefined" ? "undefined" : _typeof(window)) < "u" && (typeof document === "undefined" ? "undefined" : _typeof(document)) < "u";
  }(),
  Mt = function () {
    return (typeof WorkerGlobalScope === "undefined" ? "undefined" : _typeof(WorkerGlobalScope)) < "u" && self instanceof WorkerGlobalScope && typeof self.importScripts == "function";
  }(),
  O = {
    isBrowser: !0,
    classes: {
      URLSearchParams: _t,
      FormData: jt,
      Blob: It
    },
    isStandardBrowserEnv: qt,
    isStandardBrowserWebWorkerEnv: Mt,
    protocols: ["http", "https", "file", "blob", "url", "data"]
  };
function Ht(e, t) {
  return $(e, new O.classes.URLSearchParams(), Object.assign({
    visitor: function visitor(n, r, s, o) {
      return O.isNode && a.isBuffer(n) ? (this.append(r, n.toString("base64")), !1) : o.defaultVisitor.apply(this, arguments);
    }
  }, t));
}
function Jt(e) {
  return a.matchAll(/\w+|\[(\w*)]/g, e).map(function (t) {
    return t[0] === "[]" ? "" : t[1] || t[0];
  });
}
function zt(e) {
  var t = {},
    n = Object.keys(e);
  var r;
  var s = n.length;
  var o;
  for (r = 0; r < s; r++) o = n[r], t[o] = e[o];
  return t;
}
function qe(e) {
  function t(n, r, s, o) {
    var i = n[o++];
    var u = Number.isFinite(+i),
      d = o >= n.length;
    return i = !i && a.isArray(s) ? s.length : i, d ? (a.hasOwnProp(s, i) ? s[i] = [s[i], r] : s[i] = r, !u) : ((!s[i] || !a.isObject(s[i])) && (s[i] = []), t(n, r, s[i], o) && a.isArray(s[i]) && (s[i] = zt(s[i])), !u);
  }
  if (a.isFormData(e) && a.isFunction(e.entries)) {
    var n = {};
    return a.forEachEntry(e, function (r, s) {
      t(Jt(r), s, n, 0);
    }), n;
  }
  return null;
}
var $t = {
  "Content-Type": void 0
};
function Vt(e, t, n) {
  if (a.isString(e)) try {
    return (t || JSON.parse)(e), a.trim(e);
  } catch (r) {
    if (r.name !== "SyntaxError") throw r;
  }
  return (n || JSON.stringify)(e);
}
var V = {
  transitional: Ie,
  adapter: ["xhr", "http"],
  transformRequest: [function (t, n) {
    var r = n.getContentType() || "",
      s = r.indexOf("application/json") > -1,
      o = a.isObject(t);
    if (o && a.isHTMLForm(t) && (t = new FormData(t)), a.isFormData(t)) return s && s ? JSON.stringify(qe(t)) : t;
    if (a.isArrayBuffer(t) || a.isBuffer(t) || a.isStream(t) || a.isFile(t) || a.isBlob(t)) return t;
    if (a.isArrayBufferView(t)) return t.buffer;
    if (a.isURLSearchParams(t)) return n.setContentType("application/x-www-form-urlencoded;charset=utf-8", !1), t.toString();
    var u;
    if (o) {
      if (r.indexOf("application/x-www-form-urlencoded") > -1) return Ht(t, this.formSerializer).toString();
      if ((u = a.isFileList(t)) || r.indexOf("multipart/form-data") > -1) {
        var d = this.env && this.env.FormData;
        return $(u ? {
          "files[]": t
        } : t, d && new d(), this.formSerializer);
      }
    }
    return o || s ? (n.setContentType("application/json", !1), Vt(t)) : t;
  }],
  transformResponse: [function (t) {
    var n = this.transitional || V.transitional,
      r = n && n.forcedJSONParsing,
      s = this.responseType === "json";
    if (t && a.isString(t) && (r && !this.responseType || s)) {
      var i = !(n && n.silentJSONParsing) && s;
      try {
        return JSON.parse(t);
      } catch (u) {
        if (i) throw u.name === "SyntaxError" ? m.from(u, m.ERR_BAD_RESPONSE, this, null, this.response) : u;
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
    FormData: O.classes.FormData,
    Blob: O.classes.Blob
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
a.forEach(["delete", "get", "head"], function (t) {
  V.headers[t] = {};
});
a.forEach(["post", "put", "patch"], function (t) {
  V.headers[t] = a.merge($t);
});
var ie = V,
  Wt = a.toObjectSet(["age", "authorization", "content-length", "content-type", "etag", "expires", "from", "host", "if-modified-since", "if-unmodified-since", "last-modified", "location", "max-forwards", "proxy-authorization", "referer", "retry-after", "user-agent"]),
  Kt = function Kt(e) {
    var t = {};
    var n, r, s;
    return e && e.split("\n").forEach(function (i) {
      s = i.indexOf(":"), n = i.substring(0, s).trim().toLowerCase(), r = i.substring(s + 1).trim(), !(!n || t[n] && Wt[n]) && (n === "set-cookie" ? t[n] ? t[n].push(r) : t[n] = [r] : t[n] = t[n] ? t[n] + ", " + r : r);
    }), t;
  },
  me = Symbol("internals");
function k(e) {
  return e && String(e).trim().toLowerCase();
}
function j(e) {
  return e === !1 || e == null ? e : a.isArray(e) ? e.map(j) : String(e);
}
function vt(e) {
  var t = Object.create(null),
    n = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
  var r;
  for (; r = n.exec(e);) t[r[1]] = r[2];
  return t;
}
var Gt = function Gt(e) {
  return /^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(e.trim());
};
function G(e, t, n, r, s) {
  if (a.isFunction(r)) return r.call(this, t, n);
  if (s && (t = n), !!a.isString(t)) {
    if (a.isString(r)) return t.indexOf(r) !== -1;
    if (a.isRegExp(r)) return r.test(t);
  }
}
function Xt(e) {
  return e.trim().toLowerCase().replace(/([a-z\d])(\w*)/g, function (t, n, r) {
    return n.toUpperCase() + r;
  });
}
function Qt(e, t) {
  var n = a.toCamelCase(" " + t);
  ["get", "set", "has"].forEach(function (r) {
    Object.defineProperty(e, r + n, {
      value: function value(s, o, i) {
        return this[r].call(this, t, s, o, i);
      },
      configurable: !0
    });
  });
}
var W = /*#__PURE__*/function (_Symbol$iterator, _Symbol$toStringTag) {
  function W(t) {
    _classCallCheck(this, W);
    t && this.set(t);
  }
  _createClass(W, [{
    key: "set",
    value: function set(t, n, r) {
      var s = this;
      function o(u, d, c) {
        var l = k(d);
        if (!l) throw new Error("header name must be a non-empty string");
        var h = a.findKey(s, l);
        (!h || s[h] === void 0 || c === !0 || c === void 0 && s[h] !== !1) && (s[h || d] = j(u));
      }
      var i = function i(u, d) {
        return a.forEach(u, function (c, l) {
          return o(c, l, d);
        });
      };
      return a.isPlainObject(t) || t instanceof this.constructor ? i(t, n) : a.isString(t) && (t = t.trim()) && !Gt(t) ? i(Kt(t), n) : t != null && o(n, t, r), this;
    }
  }, {
    key: "get",
    value: function get(t, n) {
      if (t = k(t), t) {
        var r = a.findKey(this, t);
        if (r) {
          var s = this[r];
          if (!n) return s;
          if (n === !0) return vt(s);
          if (a.isFunction(n)) return n.call(this, s, r);
          if (a.isRegExp(n)) return n.exec(s);
          throw new TypeError("parser must be boolean|regexp|function");
        }
      }
    }
  }, {
    key: "has",
    value: function has(t, n) {
      if (t = k(t), t) {
        var r = a.findKey(this, t);
        return !!(r && this[r] !== void 0 && (!n || G(this, this[r], r, n)));
      }
      return !1;
    }
  }, {
    key: "delete",
    value: function _delete(t, n) {
      var r = this;
      var s = !1;
      function o(i) {
        if (i = k(i), i) {
          var u = a.findKey(r, i);
          u && (!n || G(r, r[u], u, n)) && (delete r[u], s = !0);
        }
      }
      return a.isArray(t) ? t.forEach(o) : o(t), s;
    }
  }, {
    key: "clear",
    value: function clear(t) {
      var n = Object.keys(this);
      var r = n.length,
        s = !1;
      for (; r--;) {
        var o = n[r];
        (!t || G(this, this[o], o, t, !0)) && (delete this[o], s = !0);
      }
      return s;
    }
  }, {
    key: "normalize",
    value: function normalize(t) {
      var n = this,
        r = {};
      return a.forEach(this, function (s, o) {
        var i = a.findKey(r, o);
        if (i) {
          n[i] = j(s), delete n[o];
          return;
        }
        var u = t ? Xt(o) : String(o).trim();
        u !== o && delete n[o], n[u] = j(s), r[u] = !0;
      }), this;
    }
  }, {
    key: "concat",
    value: function concat() {
      var _this$constructor;
      for (var _len = arguments.length, t = new Array(_len), _key = 0; _key < _len; _key++) {
        t[_key] = arguments[_key];
      }
      return (_this$constructor = this.constructor).concat.apply(_this$constructor, [this].concat(t));
    }
  }, {
    key: "toJSON",
    value: function toJSON(t) {
      var n = Object.create(null);
      return a.forEach(this, function (r, s) {
        r != null && r !== !1 && (n[s] = t && a.isArray(r) ? r.join(", ") : r);
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
      return Object.entries(this.toJSON()).map(function (_ref5) {
        var _ref6 = _slicedToArray(_ref5, 2),
          t = _ref6[0],
          n = _ref6[1];
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
      for (var _len2 = arguments.length, n = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        n[_key2 - 1] = arguments[_key2];
      }
      return n.forEach(function (s) {
        return r.set(s);
      }), r;
    }
  }, {
    key: "accessor",
    value: function accessor(t) {
      var r = (this[me] = this[me] = {
          accessors: {}
        }).accessors,
        s = this.prototype;
      function o(i) {
        var u = k(i);
        r[u] || (Qt(s, i), r[u] = !0);
      }
      return a.isArray(t) ? t.forEach(o) : o(t), this;
    }
  }]);
  return W;
}(Symbol.iterator, Symbol.toStringTag);
W.accessor(["Content-Type", "Content-Length", "Accept", "Accept-Encoding", "User-Agent", "Authorization"]);
a.freezeMethods(W.prototype);
a.freezeMethods(W);
var T = W;
function X(e, t) {
  var n = this || ie,
    r = t || n,
    s = T.from(r.headers);
  var o = r.data;
  return a.forEach(e, function (u) {
    o = u.call(n, o, s.normalize(), t ? t.status : void 0);
  }), s.normalize(), o;
}
function Me(e) {
  return !!(e && e.__CANCEL__);
}
function D(e, t, n) {
  m.call(this, e !== null && e !== void 0 ? e : "canceled", m.ERR_CANCELED, t, n), this.name = "CanceledError";
}
a.inherits(D, m, {
  __CANCEL__: !0
});
function Yt(e, t, n) {
  var r = n.config.validateStatus;
  !n.status || !r || r(n.status) ? e(n) : t(new m("Request failed with status code " + n.status, [m.ERR_BAD_REQUEST, m.ERR_BAD_RESPONSE][Math.floor(n.status / 100) - 4], n.config, n.request, n));
}
var Zt = O.isStandardBrowserEnv ? function () {
  return {
    write: function write(n, r, s, o, i, u) {
      var d = [];
      d.push(n + "=" + encodeURIComponent(r)), a.isNumber(s) && d.push("expires=" + new Date(s).toGMTString()), a.isString(o) && d.push("path=" + o), a.isString(i) && d.push("domain=" + i), u === !0 && d.push("secure"), document.cookie = d.join("; ");
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
function en(e) {
  return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(e);
}
function tn(e, t) {
  return t ? e.replace(/\/+$/, "") + "/" + t.replace(/^\/+/, "") : e;
}
function He(e, t) {
  return e && !en(t) ? tn(e, t) : t;
}
var nn = O.isStandardBrowserEnv ? function () {
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
    var u = a.isString(i) ? s(i) : i;
    return u.protocol === r.protocol && u.host === r.host;
  };
}() : function () {
  return function () {
    return !0;
  };
}();
function rn(e) {
  var t = /^([-+\w]{1,25})(:?\/\/|:)/.exec(e);
  return t && t[1] || "";
}
function sn(e, t) {
  e = e || 10;
  var n = new Array(e),
    r = new Array(e);
  var s = 0,
    o = 0,
    i;
  return t = t !== void 0 ? t : 1e3, function (d) {
    var c = Date.now(),
      l = r[o];
    i || (i = c), n[s] = d, r[s] = c;
    var h = o,
      b = 0;
    for (; h !== s;) b += n[h++], h = h % e;
    if (s = (s + 1) % e, s === o && (o = (o + 1) % e), c - i < t) return;
    var y = l && c - l;
    return y ? Math.round(b * 1e3 / y) : void 0;
  };
}
function ye(e, t) {
  var n = 0;
  var r = sn(50, 250);
  return function (s) {
    var o = s.loaded,
      i = s.lengthComputable ? s.total : void 0,
      u = o - n,
      d = r(u),
      c = o <= i;
    n = o;
    var l = {
      loaded: o,
      total: i,
      progress: i ? o / i : void 0,
      bytes: u,
      rate: d || void 0,
      estimated: d && i && c ? (i - o) / d : void 0,
      event: s
    };
    l[t ? "download" : "upload"] = !0, e(l);
  };
}
var on = (typeof XMLHttpRequest === "undefined" ? "undefined" : _typeof(XMLHttpRequest)) < "u",
  an = on && function (e) {
    return new Promise(function (n, r) {
      var s = e.data;
      var o = T.from(e.headers).normalize(),
        i = e.responseType;
      var u;
      function d() {
        e.cancelToken && e.cancelToken.unsubscribe(u), e.signal && e.signal.removeEventListener("abort", u);
      }
      a.isFormData(s) && (O.isStandardBrowserEnv || O.isStandardBrowserWebWorkerEnv ? o.setContentType(!1) : o.setContentType("multipart/form-data;", !1));
      var c = new XMLHttpRequest();
      if (e.auth) {
        var y = e.auth.username || "",
          f = e.auth.password ? unescape(encodeURIComponent(e.auth.password)) : "";
        o.set("Authorization", "Basic " + btoa(y + ":" + f));
      }
      var l = He(e.baseURL, e.url);
      c.open(e.method.toUpperCase(), je(l, e.params, e.paramsSerializer), !0), c.timeout = e.timeout;
      function h() {
        if (!c) return;
        var y = T.from("getAllResponseHeaders" in c && c.getAllResponseHeaders()),
          p = {
            data: !i || i === "text" || i === "json" ? c.responseText : c.response,
            status: c.status,
            statusText: c.statusText,
            headers: y,
            config: e,
            request: c
          };
        Yt(function (S) {
          n(S), d();
        }, function (S) {
          r(S), d();
        }, p), c = null;
      }
      if ("onloadend" in c ? c.onloadend = h : c.onreadystatechange = function () {
        !c || c.readyState !== 4 || c.status === 0 && !(c.responseURL && c.responseURL.indexOf("file:") === 0) || setTimeout(h);
      }, c.onabort = function () {
        c && (r(new m("Request aborted", m.ECONNABORTED, e, c)), c = null);
      }, c.onerror = function () {
        r(new m("Network Error", m.ERR_NETWORK, e, c)), c = null;
      }, c.ontimeout = function () {
        var f = e.timeout ? "timeout of " + e.timeout + "ms exceeded" : "timeout exceeded";
        var p = e.transitional || Ie;
        e.timeoutErrorMessage && (f = e.timeoutErrorMessage), r(new m(f, p.clarifyTimeoutError ? m.ETIMEDOUT : m.ECONNABORTED, e, c)), c = null;
      }, O.isStandardBrowserEnv) {
        var _y = (e.withCredentials || nn(l)) && e.xsrfCookieName && Zt.read(e.xsrfCookieName);
        _y && o.set(e.xsrfHeaderName, _y);
      }
      s === void 0 && o.setContentType(null), "setRequestHeader" in c && a.forEach(o.toJSON(), function (f, p) {
        c.setRequestHeader(p, f);
      }), a.isUndefined(e.withCredentials) || (c.withCredentials = !!e.withCredentials), i && i !== "json" && (c.responseType = e.responseType), typeof e.onDownloadProgress == "function" && c.addEventListener("progress", ye(e.onDownloadProgress, !0)), typeof e.onUploadProgress == "function" && c.upload && c.upload.addEventListener("progress", ye(e.onUploadProgress)), (e.cancelToken || e.signal) && (u = function u(y) {
        c && (r(!y || y.type ? new D(null, e, c) : y), c.abort(), c = null);
      }, e.cancelToken && e.cancelToken.subscribe(u), e.signal && (e.signal.aborted ? u() : e.signal.addEventListener("abort", u)));
      var b = rn(l);
      if (b && O.protocols.indexOf(b) === -1) {
        r(new m("Unsupported protocol " + b + ":", m.ERR_BAD_REQUEST, e));
        return;
      }
      c.send(s || null);
    });
  },
  I = {
    http: kt,
    xhr: an
  };
a.forEach(I, function (e, t) {
  if (e) {
    try {
      Object.defineProperty(e, "name", {
        value: t
      });
    } catch (_unused) {}
    Object.defineProperty(e, "adapterName", {
      value: t
    });
  }
});
var cn = {
  getAdapter: function getAdapter(e) {
    e = a.isArray(e) ? e : [e];
    var _e2 = e,
      t = _e2.length;
    var n, r;
    for (var s = 0; s < t && (n = e[s], !(r = a.isString(n) ? I[n.toLowerCase()] : n)); s++);
    if (!r) throw r === !1 ? new m("Adapter ".concat(n, " is not supported by the environment"), "ERR_NOT_SUPPORT") : new Error(a.hasOwnProp(I, n) ? "Adapter '".concat(n, "' is not available in the build") : "Unknown adapter '".concat(n, "'"));
    if (!a.isFunction(r)) throw new TypeError("adapter is not a function");
    return r;
  },
  adapters: I
};
function Q(e) {
  if (e.cancelToken && e.cancelToken.throwIfRequested(), e.signal && e.signal.aborted) throw new D(null, e);
}
function we(e) {
  return Q(e), e.headers = T.from(e.headers), e.data = X.call(e, e.transformRequest), ["post", "put", "patch"].indexOf(e.method) !== -1 && e.headers.setContentType("application/x-www-form-urlencoded", !1), cn.getAdapter(e.adapter || ie.adapter)(e).then(function (r) {
    return Q(e), r.data = X.call(e, e.transformResponse, r), r.headers = T.from(r.headers), r;
  }, function (r) {
    return Me(r) || (Q(e), r && r.response && (r.response.data = X.call(e, e.transformResponse, r.response), r.response.headers = T.from(r.response.headers))), Promise.reject(r);
  });
}
var be = function be(e) {
  return e instanceof T ? e.toJSON() : e;
};
function P(e, t) {
  t = t || {};
  var n = {};
  function r(c, l, h) {
    return a.isPlainObject(c) && a.isPlainObject(l) ? a.merge.call({
      caseless: h
    }, c, l) : a.isPlainObject(l) ? a.merge({}, l) : a.isArray(l) ? l.slice() : l;
  }
  function s(c, l, h) {
    if (a.isUndefined(l)) {
      if (!a.isUndefined(c)) return r(void 0, c, h);
    } else return r(c, l, h);
  }
  function o(c, l) {
    if (!a.isUndefined(l)) return r(void 0, l);
  }
  function i(c, l) {
    if (a.isUndefined(l)) {
      if (!a.isUndefined(c)) return r(void 0, c);
    } else return r(void 0, l);
  }
  function u(c, l, h) {
    if (h in t) return r(c, l);
    if (h in e) return r(void 0, c);
  }
  var d = {
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
    validateStatus: u,
    headers: function headers(c, l) {
      return s(be(c), be(l), !0);
    }
  };
  return a.forEach(Object.keys(Object.assign({}, e, t)), function (l) {
    var h = d[l] || s,
      b = h(e[l], t[l], l);
    a.isUndefined(b) && h !== u || (n[l] = b);
  }), n;
}
var Je = "1.4.0",
  ae = {};
["object", "boolean", "number", "function", "string", "symbol"].forEach(function (e, t) {
  ae[e] = function (r) {
    return _typeof(r) === e || "a" + (t < 1 ? "n " : " ") + e;
  };
});
var Ee = {};
ae.transitional = function (t, n, r) {
  function s(o, i) {
    return "[Axios v" + Je + "] Transitional option '" + o + "'" + i + (r ? ". " + r : "");
  }
  return function (o, i, u) {
    if (t === !1) throw new m(s(i, " has been removed" + (n ? " in " + n : "")), m.ERR_DEPRECATED);
    return n && !Ee[i] && (Ee[i] = !0, console.warn(s(i, " has been deprecated since v" + n + " and will be removed in the near future"))), t ? t(o, i, u) : !0;
  };
};
function un(e, t, n) {
  if (_typeof(e) != "object") throw new m("options must be an object", m.ERR_BAD_OPTION_VALUE);
  var r = Object.keys(e);
  var s = r.length;
  for (; s-- > 0;) {
    var o = r[s],
      i = t[o];
    if (i) {
      var u = e[o],
        d = u === void 0 || i(u, o, e);
      if (d !== !0) throw new m("option " + o + " must be " + d, m.ERR_BAD_OPTION_VALUE);
      continue;
    }
    if (n !== !0) throw new m("Unknown option " + o, m.ERR_BAD_OPTION);
  }
}
var ee = {
    assertOptions: un,
    validators: ae
  },
  C = ee.validators;
var M = /*#__PURE__*/function () {
  function M(t) {
    _classCallCheck(this, M);
    this.defaults = t, this.interceptors = {
      request: new pe(),
      response: new pe()
    };
  }
  _createClass(M, [{
    key: "request",
    value: function request(t, n) {
      typeof t == "string" ? (n = n || {}, n.url = t) : n = t || {}, n = P(this.defaults, n);
      var _n2 = n,
        r = _n2.transitional,
        s = _n2.paramsSerializer,
        o = _n2.headers;
      r !== void 0 && ee.assertOptions(r, {
        silentJSONParsing: C.transitional(C.boolean),
        forcedJSONParsing: C.transitional(C.boolean),
        clarifyTimeoutError: C.transitional(C.boolean)
      }, !1), s != null && (a.isFunction(s) ? n.paramsSerializer = {
        serialize: s
      } : ee.assertOptions(s, {
        encode: C.function,
        serialize: C.function
      }, !0)), n.method = (n.method || this.defaults.method || "get").toLowerCase();
      var i;
      i = o && a.merge(o.common, o[n.method]), i && a.forEach(["delete", "get", "head", "post", "put", "patch", "common"], function (f) {
        delete o[f];
      }), n.headers = T.concat(i, o);
      var u = [];
      var d = !0;
      this.interceptors.request.forEach(function (p) {
        typeof p.runWhen == "function" && p.runWhen(n) === !1 || (d = d && p.synchronous, u.unshift(p.fulfilled, p.rejected));
      });
      var c = [];
      this.interceptors.response.forEach(function (p) {
        c.push(p.fulfilled, p.rejected);
      });
      var l,
        h = 0,
        b;
      if (!d) {
        var f = [we.bind(this), void 0];
        for (f.unshift.apply(f, u), f.push.apply(f, c), b = f.length, l = Promise.resolve(n); h < b;) l = l.then(f[h++], f[h++]);
        return l;
      }
      b = u.length;
      var y = n;
      for (h = 0; h < b;) {
        var _f = u[h++],
          p = u[h++];
        try {
          y = _f(y);
        } catch (g) {
          p.call(this, g);
          break;
        }
      }
      try {
        l = we.call(this, y);
      } catch (f) {
        return Promise.reject(f);
      }
      for (h = 0, b = c.length; h < b;) l = l.then(c[h++], c[h++]);
      return l;
    }
  }, {
    key: "getUri",
    value: function getUri(t) {
      t = P(this.defaults, t);
      var n = He(t.baseURL, t.url);
      return je(n, t.params, t.paramsSerializer);
    }
  }]);
  return M;
}();
a.forEach(["delete", "get", "head", "options"], function (t) {
  M.prototype[t] = function (n, r) {
    return this.request(P(r || {}, {
      method: t,
      url: n,
      data: (r || {}).data
    }));
  };
});
a.forEach(["post", "put", "patch"], function (t) {
  function n(r) {
    return function (o, i, u) {
      return this.request(P(u || {}, {
        method: t,
        headers: r ? {
          "Content-Type": "multipart/form-data"
        } : {},
        url: o,
        data: i
      }));
    };
  }
  M.prototype[t] = n(), M.prototype[t + "Form"] = n(!0);
});
var q = M;
var ce = /*#__PURE__*/function () {
  function ce(t) {
    _classCallCheck(this, ce);
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
      var i = new Promise(function (u) {
        r.subscribe(u), o = u;
      }).then(s);
      return i.cancel = function () {
        r.unsubscribe(o);
      }, i;
    }, t(function (o, i, u) {
      r.reason || (r.reason = new D(o, i, u), n(r.reason));
    });
  }
  _createClass(ce, [{
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
        token: new ce(function (s) {
          t = s;
        }),
        cancel: t
      };
    }
  }]);
  return ce;
}();
var ln = ce;
function fn(e) {
  return function (n) {
    return e.apply(null, n);
  };
}
function dn(e) {
  return a.isObject(e) && e.isAxiosError === !0;
}
var te = {
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
Object.entries(te).forEach(function (_ref7) {
  var _ref8 = _slicedToArray(_ref7, 2),
    e = _ref8[0],
    t = _ref8[1];
  te[t] = e;
});
var hn = te;
function ze(e) {
  var t = new q(e),
    n = Te(q.prototype.request, t);
  return a.extend(n, q.prototype, t, {
    allOwnKeys: !0
  }), a.extend(n, t, null, {
    allOwnKeys: !0
  }), n.create = function (s) {
    return ze(P(e, s));
  }, n;
}
var w = ze(ie);
w.Axios = q;
w.CanceledError = D;
w.CancelToken = ln;
w.isCancel = Me;
w.VERSION = Je;
w.toFormData = $;
w.AxiosError = m;
w.Cancel = w.CanceledError;
w.all = function (t) {
  return Promise.all(t);
};
w.spread = fn;
w.isAxiosError = dn;
w.mergeConfig = P;
w.AxiosHeaders = T;
w.formToJSON = function (e) {
  return qe(a.isHTMLForm(e) ? new FormData(e) : e);
};
w.HttpStatusCode = hn;
w.default = w;
var Se = w,
  Re = "https://kdocs.cn",
  $e = /*#__PURE__*/function () {
    var _ref9 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(e) {
      var t, n;
      return _regeneratorRuntime().wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            _context.next = 3;
            return N.cookies.get({
              url: Re,
              name: "csrf"
            });
          case 3:
            t = _context.sent;
            if (!(t != null && t.value)) {
              _context.next = 8;
              break;
            }
            e["X-CSRFToken"] = t.value;
            _context.next = 12;
            break;
          case 8:
            n = pn();
            _context.next = 11;
            return N.cookies.set({
              url: Re,
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
            _context.next = 16;
            break;
          case 14:
            _context.prev = 14;
            _context.t0 = _context["catch"](0);
          case 16:
            return _context.abrupt("return", e);
          case 17:
          case "end":
            return _context.stop();
        }
      }, _callee, null, [[0, 14]]);
    }));
    return function $e(_x2) {
      return _ref9.apply(this, arguments);
    };
  }();
function pn() {
  var e = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678",
    t = e.length;
  var n = "";
  for (var r = 0; r < 32; r++) n += e.charAt(Math.floor(Math.random() * t));
  return n;
}
var mn = {
    timeout: 1e4,
    headers: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json"
    },
    withCredentials: !0
  },
  R = /*#__PURE__*/function () {
    function R() {
      _classCallCheck(this, R);
      this.httpInterceptorsRequest(), this.httpInterceptorsResponse();
    }
    _createClass(R, [{
      key: "httpInterceptorsRequest",
      value: function httpInterceptorsRequest() {
        R.axiosInstance.interceptors.request.use(function (t) {
          return typeof t.beforeRequestCallback == "function" ? (t.beforeRequestCallback(t), t) : (R.initConfig.beforeRequestCallback && R.initConfig.beforeRequestCallback(t), t);
        }, function (t) {
          return Promise.reject(t);
        });
      }
    }, {
      key: "httpInterceptorsResponse",
      value: function httpInterceptorsResponse() {
        R.axiosInstance.interceptors.response.use(function (n) {
          var r = n.config;
          return typeof r.beforeResponseCallback == "function" ? (r.beforeResponseCallback(n), n.data) : (R.initConfig.beforeResponseCallback && R.initConfig.beforeResponseCallback(n), n.data);
        }, function (n) {
          var r = n;
          return r.isCancelRequest = Se.isCancel(r), Promise.reject(r);
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
          var _ref10 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(i, u) {
            return _regeneratorRuntime().wrap(function _callee2$(_context2) {
              while (1) switch (_context2.prev = _context2.next) {
                case 0:
                  _context2.next = 2;
                  return $e((r == null ? void 0 : r.headers) || {});
                case 2:
                  o.headers = _context2.sent;
                  R.axiosInstance.request(o).then(function (d) {
                    i(d);
                  }).catch(function (d) {
                    u(d);
                  });
                case 4:
                case "end":
                  return _context2.stop();
              }
            }, _callee2);
          }));
          return function (_x3, _x4) {
            return _ref10.apply(this, arguments);
          };
        }());
      }
    }]);
    return R;
  }();
K(R, "initConfig", {}), K(R, "axiosInstance", Se.create(mn));
var ne = R;
var yn = new ne();
var wn = /*#__PURE__*/function () {
  function wn() {
    _classCallCheck(this, wn);
  }
  _createClass(wn, [{
    key: "request",
    value: function request(t, n, r) {
      return new Promise( /*#__PURE__*/function () {
        var _ref11 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee4(s, o) {
          var d, i, u;
          return _regeneratorRuntime().wrap(function _callee4$(_context4) {
            while (1) switch (_context4.prev = _context4.next) {
              case 0:
                i = {
                  method: (t == null ? void 0 : t.toUpperCase()) || "GET"
                };
                (!i.method || i.method === "GET") && (d = Object.keys((r == null ? void 0 : r.params) || {})) != null && d.length && (n = "".concat(n, "?").concat(JSON.stringify(r.params)));
                _context4.next = 4;
                return $e((r == null ? void 0 : r.headers) || {});
              case 4:
                u = _context4.sent;
                i.headers = _objectSpread({
                  Accept: "application/json, text/plain, */*",
                  "Content-Type": "application/json"
                }, u || {});
                try {
                  u["Content-Type"] === "multipart/form-data" ? i.body = r == null ? void 0 : r.data : r != null && r.data && (i.body = JSON.stringify(r.data));
                } catch (_unused3) {}
                fetch(n, i).then( /*#__PURE__*/function () {
                  var _ref12 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3(c) {
                    var l;
                    return _regeneratorRuntime().wrap(function _callee3$(_context3) {
                      while (1) switch (_context3.prev = _context3.next) {
                        case 0:
                          _context3.prev = 0;
                          _context3.next = 3;
                          return c.json();
                        case 3:
                          l = _context3.sent;
                          _context3.next = 9;
                          break;
                        case 6:
                          _context3.prev = 6;
                          _context3.t0 = _context3["catch"](0);
                          l = c;
                        case 9:
                          if (!(c.status !== 200)) {
                            _context3.next = 11;
                            break;
                          }
                          throw {
                            response: l
                          };
                        case 11:
                          return _context3.abrupt("return", l);
                        case 12:
                        case "end":
                          return _context3.stop();
                      }
                    }, _callee3, null, [[0, 6]]);
                  }));
                  return function (_x7) {
                    return _ref12.apply(this, arguments);
                  };
                }()).then(function (c) {
                  s(c);
                }).catch(function (c) {
                  o(c);
                });
              case 8:
              case "end":
                return _context4.stop();
            }
          }, _callee4);
        }));
        return function (_x5, _x6) {
          return _ref11.apply(this, arguments);
        };
      }());
    }
  }]);
  return wn;
}();
var bn = new wn(),
  Ve = function Ve() {
    return typeof XMLHttpRequest == "function" ? yn : bn;
  },
  We = Ve(),
  En = function En() {
    return We.request("get", Ae + "/kd/api/old_user");
  },
  Sn = function Sn() {
    return We.request("post", Ae + "/kd/api/old_user");
  },
  Cn = function Cn(e) {
    N.storage.local.set(_defineProperty({}, re, JSON.stringify(e))).catch(function () {});
  },
  Rn = /*#__PURE__*/function () {
    var _ref13 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee5() {
      var e, t;
      return _regeneratorRuntime().wrap(function _callee5$(_context5) {
        while (1) switch (_context5.prev = _context5.next) {
          case 0:
            _context5.prev = 0;
            e = re;
            _context5.next = 4;
            return N.storage.local.get(e);
          case 4:
            _context5.t0 = e;
            t = _context5.sent[_context5.t0];
            return _context5.abrupt("return", JSON.parse(t));
          case 9:
            _context5.prev = 9;
            _context5.t1 = _context5["catch"](0);
          case 11:
            return _context5.abrupt("return", null);
          case 12:
          case "end":
            return _context5.stop();
        }
      }, _callee5, null, [[0, 9]]);
    }));
    return function Rn() {
      return _ref13.apply(this, arguments);
    };
  }(),
  Nn = function Nn() {
    N.storage.local.remove(re).catch(function () {});
  },
  On = /*#__PURE__*/function () {
    var _ref14 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee6() {
      var e, t;
      return _regeneratorRuntime().wrap(function _callee6$(_context6) {
        while (1) switch (_context6.prev = _context6.next) {
          case 0:
            _context6.prev = 0;
            e = Oe;
            _context6.next = 4;
            return N.storage.local.get(e);
          case 4:
            _context6.t0 = e;
            t = _context6.sent[_context6.t0];
            return _context6.abrupt("return", JSON.parse(t));
          case 9:
            _context6.prev = 9;
            _context6.t1 = _context6["catch"](0);
          case 11:
            return _context6.abrupt("return", null);
          case 12:
          case "end":
            return _context6.stop();
        }
      }, _callee6, null, [[0, 9]]);
    }));
    return function On() {
      return _ref14.apply(this, arguments);
    };
  }(),
  xn = /*#__PURE__*/function () {
    var _ref15 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee7() {
      var e, t, n, r, s, o;
      return _regeneratorRuntime().wrap(function _callee7$(_context7) {
        while (1) switch (_context7.prev = _context7.next) {
          case 0:
            _context7.prev = 0;
            _context7.next = 3;
            return Rn();
          case 3:
            n = _context7.sent;
            r = ((e = n == null ? void 0 : n.userid) == null ? void 0 : e.toString()) || "";
            _context7.next = 7;
            return On();
          case 7:
            _context7.t0 = _context7.sent;
            if (_context7.t0) {
              _context7.next = 10;
              break;
            }
            _context7.t0 = {};
          case 10:
            s = _context7.t0;
            if (!((s == null ? void 0 : s[r]) === "true")) {
              _context7.next = 13;
              break;
            }
            return _context7.abrupt("return", "0");
          case 13:
            _context7.next = 15;
            return En();
          case 15:
            o = _context7.sent;
            s[r] = "true";
            N.storage.local.set(_defineProperty({}, Oe, JSON.stringify(s))).catch(function () {});
            if (!((t = o == null ? void 0 : o.data) != null && t.isOldUser)) {
              _context7.next = 22;
              break;
            }
            _context7.t1 = "0";
            _context7.next = 25;
            break;
          case 22:
            _context7.next = 24;
            return Sn();
          case 24:
            _context7.t1 = "1";
          case 25:
            return _context7.abrupt("return", _context7.t1);
          case 28:
            _context7.prev = 28;
            _context7.t2 = _context7["catch"](0);
            return _context7.abrupt("return", "");
          case 31:
          case "end":
            return _context7.stop();
        }
      }, _callee7, null, [[0, 28]]);
    }));
    return function xn() {
      return _ref15.apply(this, arguments);
    };
  }(),
  ue = Ve(),
  Pn = function Pn(e) {
    return ue.request("get", Xe + "/api/v5/files/".concat(e, "/metadata"), {
      params: {
        with_link: !0
      }
    });
  },
  Fn = function Fn() {
    return ue.request("get", ge + "/html2fp/pulg/dir");
  },
  kn = function kn(e, t) {
    return ue.request("put", ge + "/html2fp/pulg/dir", {
      data: {
        fileID: e,
        groupID: t
      }
    });
  };
export { Fn as a, kn as b, Pn as c, xn as d, Se as e, Ve as g, Nn as r, Cn as s };
