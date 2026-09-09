function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return exports; }; var exports = {}, Op = Object.prototype, hasOwn = Op.hasOwnProperty, defineProperty = Object.defineProperty || function (obj, key, desc) { obj[key] = desc.value; }, $Symbol = "function" == typeof Symbol ? Symbol : {}, iteratorSymbol = $Symbol.iterator || "@@iterator", asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator", toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag"; function define(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: !0, configurable: !0, writable: !0 }), obj[key]; } try { define({}, ""); } catch (err) { define = function define(obj, key, value) { return obj[key] = value; }; } function wrap(innerFn, outerFn, self, tryLocsList) { var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator, generator = Object.create(protoGenerator.prototype), context = new Context(tryLocsList || []); return defineProperty(generator, "_invoke", { value: makeInvokeMethod(innerFn, self, context) }), generator; } function tryCatch(fn, obj, arg) { try { return { type: "normal", arg: fn.call(obj, arg) }; } catch (err) { return { type: "throw", arg: err }; } } exports.wrap = wrap; var ContinueSentinel = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var IteratorPrototype = {}; define(IteratorPrototype, iteratorSymbol, function () { return this; }); var getProto = Object.getPrototypeOf, NativeIteratorPrototype = getProto && getProto(getProto(values([]))); NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype); var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype); function defineIteratorMethods(prototype) { ["next", "throw", "return"].forEach(function (method) { define(prototype, method, function (arg) { return this._invoke(method, arg); }); }); } function AsyncIterator(generator, PromiseImpl) { function invoke(method, arg, resolve, reject) { var record = tryCatch(generator[method], generator, arg); if ("throw" !== record.type) { var result = record.arg, value = result.value; return value && "object" == _typeof(value) && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) { invoke("next", value, resolve, reject); }, function (err) { invoke("throw", err, resolve, reject); }) : PromiseImpl.resolve(value).then(function (unwrapped) { result.value = unwrapped, resolve(result); }, function (error) { return invoke("throw", error, resolve, reject); }); } reject(record.arg); } var previousPromise; defineProperty(this, "_invoke", { value: function value(method, arg) { function callInvokeWithMethodAndArg() { return new PromiseImpl(function (resolve, reject) { invoke(method, arg, resolve, reject); }); } return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(innerFn, self, context) { var state = "suspendedStart"; return function (method, arg) { if ("executing" === state) throw new Error("Generator is already running"); if ("completed" === state) { if ("throw" === method) throw arg; return doneResult(); } for (context.method = method, context.arg = arg;;) { var delegate = context.delegate; if (delegate) { var delegateResult = maybeInvokeDelegate(delegate, context); if (delegateResult) { if (delegateResult === ContinueSentinel) continue; return delegateResult; } } if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) { if ("suspendedStart" === state) throw state = "completed", context.arg; context.dispatchException(context.arg); } else "return" === context.method && context.abrupt("return", context.arg); state = "executing"; var record = tryCatch(innerFn, self, context); if ("normal" === record.type) { if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue; return { value: record.arg, done: context.done }; } "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg); } }; } function maybeInvokeDelegate(delegate, context) { var methodName = context.method, method = delegate.iterator[methodName]; if (undefined === method) return context.delegate = null, "throw" === methodName && delegate.iterator.return && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method) || "return" !== methodName && (context.method = "throw", context.arg = new TypeError("The iterator does not provide a '" + methodName + "' method")), ContinueSentinel; var record = tryCatch(method, delegate.iterator, context.arg); if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel; var info = record.arg; return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel); } function pushTryEntry(locs) { var entry = { tryLoc: locs[0] }; 1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry); } function resetTryEntry(entry) { var record = entry.completion || {}; record.type = "normal", delete record.arg, entry.completion = record; } function Context(tryLocsList) { this.tryEntries = [{ tryLoc: "root" }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0); } function values(iterable) { if (iterable) { var iteratorMethod = iterable[iteratorSymbol]; if (iteratorMethod) return iteratorMethod.call(iterable); if ("function" == typeof iterable.next) return iterable; if (!isNaN(iterable.length)) { var i = -1, next = function next() { for (; ++i < iterable.length;) if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next; return next.value = undefined, next.done = !0, next; }; return next.next = next; } } return { next: doneResult }; } function doneResult() { return { value: undefined, done: !0 }; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, defineProperty(Gp, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), defineProperty(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) { var ctor = "function" == typeof genFun && genFun.constructor; return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name)); }, exports.mark = function (genFun) { return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun; }, exports.awrap = function (arg) { return { __await: arg }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () { return this; }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) { void 0 === PromiseImpl && (PromiseImpl = Promise); var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl); return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) { return result.done ? result.value : iter.next(); }); }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () { return this; }), define(Gp, "toString", function () { return "[object Generator]"; }), exports.keys = function (val) { var object = Object(val), keys = []; for (var key in object) keys.push(key); return keys.reverse(), function next() { for (; keys.length;) { var key = keys.pop(); if (key in object) return next.value = key, next.done = !1, next; } return next.done = !0, next; }; }, exports.values = values, Context.prototype = { constructor: Context, reset: function reset(skipTempReset) { if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined); }, stop: function stop() { this.done = !0; var rootRecord = this.tryEntries[0].completion; if ("throw" === rootRecord.type) throw rootRecord.arg; return this.rval; }, dispatchException: function dispatchException(exception) { if (this.done) throw exception; var context = this; function handle(loc, caught) { return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught; } for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i], record = entry.completion; if ("root" === entry.tryLoc) return handle("end"); if (entry.tryLoc <= this.prev) { var hasCatch = hasOwn.call(entry, "catchLoc"), hasFinally = hasOwn.call(entry, "finallyLoc"); if (hasCatch && hasFinally) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } else if (hasCatch) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); } else { if (!hasFinally) throw new Error("try statement without catch or finally"); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } } } }, abrupt: function abrupt(type, arg) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) { var finallyEntry = entry; break; } } finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null); var record = finallyEntry ? finallyEntry.completion : {}; return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record); }, complete: function complete(record, afterLoc) { if ("throw" === record.type) throw record.arg; return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel; }, finish: function finish(finallyLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel; } }, catch: function _catch(tryLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc === tryLoc) { var record = entry.completion; if ("throw" === record.type) { var thrown = record.arg; resetTryEntry(entry); } return thrown; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(iterable, resultName, nextLoc) { return this.delegate = { iterator: values(iterable), resultName: resultName, nextLoc: nextLoc }, "next" === this.method && (this.arg = undefined), ContinueSentinel; } }, exports; }
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
import { d as r, c as V, y as H, o as c, B as n, x as e, D as C, u as o, M as d, O as h, a as F, s as f } from "./__uno-cab22814.js";
import { s as _ } from "./url-d1de9e2d.js";
import { E as u, _ as v } from "./index.vue_vue_type_style_index_0_lang-1c58e848.js";
import "./url-1b6e2379.js";
var g = e("div", {
    class: "kdocs-cover"
  }, [e("svg", {
    width: "136",
    height: "102",
    viewBox: "0 0 136 102",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, [e("path", {
    d: "M19 3.70276H121C123.485 3.70276 125.5 5.71748 125.5 8.20276V84.4762C125.5 86.9615 123.485 88.9762 121 88.9762H19C16.5147 88.9762 14.5 86.9615 14.5 84.4762V8.20276C14.5 5.71748 16.5147 3.70276 19 3.70276Z",
    fill: "#F9FBFE",
    stroke: "#D5E3F2"
  }), e("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M20.3571 7.82467C20.3571 8.43242 19.8635 8.9251 19.2547 8.9251C18.6459 8.9251 18.1523 8.43242 18.1523 7.82467C18.1523 7.21692 18.6459 6.72424 19.2547 6.72424C19.8635 6.72424 20.3571 7.21692 20.3571 7.82467ZM24.3255 7.82467C24.3255 8.43242 23.8319 8.9251 23.2231 8.9251C22.6143 8.9251 22.1208 8.43242 22.1208 7.82467C22.1208 7.21692 22.6143 6.72424 23.2231 6.72424C23.8319 6.72424 24.3255 7.21692 24.3255 7.82467ZM27.1918 8.9251C27.8006 8.9251 28.2941 8.43242 28.2941 7.82467C28.2941 7.21692 27.8006 6.72424 27.1918 6.72424C26.583 6.72424 26.0894 7.21692 26.0894 7.82467C26.0894 8.43242 26.583 8.9251 27.1918 8.9251Z",
    fill: "#D5E2F2"
  }), e("path", {
    d: "M21.998 12.4426C20.0658 12.4437 18.5 14.0104 18.5 15.9426V81.6345C18.5 83.5675 20.067 85.1345 22 85.1345H118C119.933 85.1345 121.5 83.5675 121.5 81.6345V15.8884C121.5 13.9546 119.932 12.3873 117.998 12.3884L21.998 12.4426Z",
    fill: "white",
    stroke: "#D5E2F2"
  }), e("rect", {
    x: "31.0376",
    y: "25.3214",
    width: "35.5476",
    height: "21.5229",
    rx: "2.67857",
    fill: "#E9F6FF",
    stroke: "#FADDB3",
    "stroke-width": "0.642857"
  }), e("mask", {
    id: "mask0_4788_292658",
    style: {
      "mask-type": "alpha"
    },
    maskUnits: "userSpaceOnUse",
    x: "30",
    y: "25",
    width: "37",
    height: "23"
  }, [e("rect", {
    x: "31.0376",
    y: "25.3214",
    width: "35.5476",
    height: "21.5229",
    rx: "2.67857",
    fill: "#E9F6FF",
    stroke: "#FFDFC7",
    "stroke-width": "0.642857"
  })]), e("g", {
    mask: "url(#mask0_4788_292658)"
  }, [e("path", {
    d: "M43.3353 38.3023C39.1496 36.6244 30.7162 35.139 28.0972 38.3023L28.8115 49.1494L67.621 49.8568C69.1289 44.6691 70.6151 34.0937 67.621 37.1233C61.1924 43.628 53.3353 42.311 43.3353 38.3023Z",
    fill: "#8EBBF2"
  }), e("path", {
    d: "M35.9544 36.8792C33.4782 33.2949 29.6846 34.2993 27.8592 35.7927V47.5829H57.1449C51.9068 46.4578 47.8592 41.8037 44.2878 42.9207C39.764 44.3355 39.0497 41.3595 35.9544 36.8792Z",
    fill: "#75BD8D"
  }), e("path", {
    d: "M57.4001 37.5868C55.8356 37.5868 54.2874 40.5628 51.9064 41.2702C51.6788 42.668 68.1903 43.8093 67.7806 42.5919C67.9627 41.194 68.1475 37.5976 67.3826 36.0825C66.4265 34.1887 64.5025 35.1519 63.8196 36.5046C63.1703 37.7907 61.9486 39.6843 61.4302 39.8554C61.0205 39.9906 59.5255 37.5868 57.4001 37.5868Z",
    fill: "#75BD8D"
  }), e("ellipse", {
    opacity: "0.5",
    cx: "33.3353",
    cy: "27.5933",
    rx: "9.76191",
    ry: "9.66803",
    fill: "white"
  }), e("ellipse", {
    cx: "33.1585",
    cy: "27.419",
    rx: "5.29932",
    ry: "5.24836",
    fill: "#FFD97C"
  }), e("rect", {
    x: "31.0376",
    y: "25.3214",
    width: "35.5476",
    height: "21.5229",
    rx: "2.67857",
    stroke: "#EBF2FA",
    "stroke-width": "0.642857"
  })]), e("rect", {
    opacity: "0.9",
    x: "41.0338",
    y: "28.7732",
    width: "9.52381",
    height: "1.41483",
    rx: "0.707417",
    fill: "white"
  }), e("rect", {
    opacity: "0.9",
    x: "41.0338",
    y: "31.6025",
    width: "18.0952",
    height: "1.41483",
    rx: "0.707417",
    fill: "white"
  }), e("rect", {
    opacity: "0.9",
    x: "41.0338",
    y: "34.4317",
    width: "18.0952",
    height: "1.41483",
    rx: "0.707417",
    fill: "white"
  }), e("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M32 52C32 50.8954 32.8954 50 34 50H63C64.1046 50 65 50.8954 65 52C65 53.1046 64.1046 54 63 54H34C32.8954 54 32 53.1046 32 52Z",
    fill: "#EBF2FA"
  }), e("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M31.2594 59.6486C31.2594 58.544 32.1548 57.6486 33.2594 57.6486H63.2594C64.364 57.6486 65.2594 58.544 65.2594 59.6486C65.2594 60.7532 64.364 61.6486 63.2594 61.6486H33.2594C32.1548 61.6486 31.2594 60.7532 31.2594 59.6486Z",
    fill: "#EBF2FA"
  }), e("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M38.2594 67.1317C38.2594 66.0271 39.1548 65.1317 40.2594 65.1317H63.1394C64.244 65.1317 65.1394 66.0271 65.1394 67.1317C65.1394 68.2363 64.244 69.1317 63.1394 69.1317H40.2594C39.1548 69.1317 38.2594 68.2363 38.2594 67.1317Z",
    fill: "#EBF2FA"
  }), e("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M74.0577 29C74.0577 27.8954 74.9532 27 76.0577 27H93.3911C94.4956 27 95.3911 27.8954 95.3911 29C95.3911 30.1046 94.4956 31 93.3911 31H76.0577C74.9532 31 74.0577 30.1046 74.0577 29Z",
    fill: "#EBF2FA"
  }), e("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M74.0577 38.456C74.0577 37.3514 74.9532 36.456 76.0577 36.456H107.613C108.718 36.456 109.613 37.3514 109.613 38.456C109.613 39.5605 108.718 40.456 107.613 40.456H76.0577C74.9532 40.456 74.0577 39.5605 74.0577 38.456Z",
    fill: "#EBF2FA"
  }), e("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M74.0577 47.9773C74.0577 46.8728 74.9532 45.9773 76.0577 45.9773H103.613C104.718 45.9773 105.613 46.8728 105.613 47.9773C105.613 49.0819 104.718 49.9773 103.613 49.9773H76.0577C74.9532 49.9773 74.0577 49.0819 74.0577 47.9773Z",
    fill: "#EBF2FA"
  }), e("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M74.0577 57.4987C74.0577 56.3941 74.9532 55.4987 76.0577 55.4987H107.613C108.718 55.4987 109.613 56.3941 109.613 57.4987C109.613 58.6033 108.718 59.4987 107.613 59.4987H76.0577C74.9532 59.4987 74.0577 58.6033 74.0577 57.4987Z",
    fill: "#EBF2FA"
  }), e("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M74.0577 67.0201C74.0577 65.9155 74.9532 65.0201 76.0577 65.0201H103.169C104.273 65.0201 105.169 65.9155 105.169 67.0201C105.169 68.1246 104.273 69.0201 103.169 69.0201H76.0577C74.9532 69.0201 74.0577 68.1246 74.0577 67.0201Z",
    fill: "#EBF2FA"
  }), e("path", {
    d: "M23.5 77C23.5 78.3807 24.6193 79.5 26 79.5H27.9556V79H29.9111V79.5H33.8222V79H35.7778V79.5H39.6889V79H41.6444V79.5H45.5556V79H47.5111V79.5H51.4222V79H53.3778V79.5H57.2889V79H59.2444V79.5H63.1556V79H65.1111V79.5H69.0222V79H70.9778V79.5H74.8889V79H76.8444V79.5H80.7556V79H82.7111V79.5H86.6222V79H88.5778V79.5H92.4889V79H94.4444V79.5H98.3556V79H100.311V79.5H104.222V79H106.178V79.5H110.089V79H112.044V79.5H114C115.381 79.5 116.5 78.3807 116.5 77V74.926H116V72.8519H116.5V68.7039H116V66.6298H116.5V62.4818H116V60.4077H116.5V56.2596H116V54.1856H116.5V50.0375H116V47.9635H116.5V43.8154H116V41.7414H116.5V37.5933H116V35.5193H116.5V31.3712H116V29.2972H116.5V25.1491H116V23.0751H116.5V21.001C116.5 19.6198 115.38 18.5003 113.999 18.501L112.043 18.5021L112.043 19.0021L110.088 19.0031L110.088 18.5031L106.176 18.5051L106.177 19.0051L104.221 19.0062L104.221 18.5062L100.31 18.5082L100.31 19.0082L98.3545 19.0092L98.3542 18.5092L94.4431 18.5113L94.4434 19.0113L92.4878 19.0123L92.4876 18.5123L88.5765 18.5144L88.5767 19.0144L86.6212 19.0154L86.6209 18.5154L82.7098 18.5174L82.7101 19.0174L80.7545 19.0185L80.7542 18.5185L76.8431 18.5205L76.8434 19.0205L74.8878 19.0215L74.8876 18.5215L70.9765 18.5236L70.9767 19.0236L69.0212 19.0246L69.0209 18.5246L65.1098 18.5267L65.1101 19.0267L63.1545 19.0277L63.1542 18.5277L59.2431 18.5298L59.2434 19.0298L57.2878 19.0308L57.2876 18.5308L53.3765 18.5328L53.3767 19.0328L51.4212 19.0339L51.4209 18.5339L47.5098 18.5359L47.5101 19.0359L45.5545 19.0369L45.5542 18.5369L41.6431 18.539L41.6434 19.039L39.6878 19.04L39.6876 18.54L35.7765 18.5421L35.7767 19.0421L33.8212 19.0431L33.8209 18.5431L29.9098 18.5451L29.9101 19.0451L27.9545 19.0462L27.9542 18.5462L25.9987 18.5472C24.6185 18.5479 23.5 19.667 23.5 21.0472V23.1195H24V25.1918H23.5V29.3365H24V31.4088H23.5V35.5535H24V37.6258H23.5V41.7704H24V43.8428H23.5V47.9874H24V50.0597H23.5V54.2044H24V56.2767H23.5V60.4214H24V62.4937H23.5V66.6384H24V68.7107H23.5V72.8553H24V74.9277H23.5V77Z",
    stroke: "#9AD7FF",
    "stroke-linejoin": "bevel",
    "stroke-dasharray": "4 2"
  }), e("path", {
    d: "M99.5166 5.0155C99.5166 4.18776 100.187 3.51646 101.015 3.5155L112.398 3.50232C113.227 3.50136 113.9 4.17321 113.9 5.00232V19.897C113.9 20.962 112.821 21.6878 111.835 21.2864L107.651 19.5838C107.046 19.338 106.37 19.338 105.766 19.5838L101.582 21.2864C100.596 21.6878 99.5166 20.962 99.5166 19.897V5.0155Z",
    fill: "#FEF9EA",
    stroke: "#FADDB3"
  }), e("path", {
    d: "M105.621 8.66135C105.983 7.90169 107.064 7.90168 107.426 8.66135L107.787 9.41887C107.935 9.72892 108.231 9.94144 108.572 9.98172L109.379 10.0769C110.231 10.1776 110.569 11.2349 109.933 11.8112L109.373 12.3178C109.112 12.5543 108.995 12.9108 109.064 13.2562L109.216 14.0125C109.384 14.8439 108.505 15.493 107.759 15.0889L107 14.6771C106.703 14.5159 106.344 14.5159 106.047 14.6771L105.287 15.0889C104.541 15.493 103.663 14.8439 103.83 14.0125L103.982 13.2562C104.052 12.9108 103.934 12.5543 103.673 12.3178L103.114 11.8112C102.478 11.2349 102.815 10.1776 103.668 10.0769L104.474 9.98172C104.815 9.94144 105.112 9.72892 105.259 9.41887L105.621 8.66135Z",
    fill: "#FFCA7E"
  }), e("path", {
    d: "M30.5347 72.7565C30.5347 73.585 29.8631 74.2565 29.0347 74.2565H25.1771C24.3444 74.2565 23.6693 74.9316 23.6693 75.7643C23.6693 76.2017 23.1531 76.4344 22.8253 76.1447L21.366 74.8547C20.93 74.4693 20.3681 74.2565 19.7861 74.2565H9.03467C8.20624 74.2565 7.53467 73.585 7.53467 72.7565V56C7.53467 55.1716 8.20624 54.5 9.03467 54.5H29.0347C29.8631 54.5 30.5347 55.1716 30.5347 56V72.7565Z",
    fill: "#FEF9EA",
    stroke: "#FADDB3"
  }), e("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M21.1771 58.5321C21.3457 58.1537 21.7893 57.9836 22.1677 58.1523C22.5462 58.321 22.7162 58.7645 22.5475 59.1429L20.2097 64.388L20.7712 65.6478C21.2528 65.088 21.9663 64.7336 22.7625 64.7336C24.2127 64.7336 25.3883 65.9091 25.3883 67.3593C25.3883 68.8095 24.2127 69.985 22.7625 69.985C21.6409 69.985 20.6836 69.2818 20.3074 68.2922L20.3005 68.2773L19.3884 66.2308L18.4762 68.2773L18.4693 68.2922C18.0931 69.2818 17.1358 69.985 16.0142 69.985C14.564 69.985 13.3884 68.8095 13.3884 67.3593C13.3884 65.9091 14.564 64.7336 16.0142 64.7336C16.8105 64.7336 17.524 65.088 18.0055 65.6478L19.2207 62.9215L19.3868 62.5418L19.3884 62.5452L21.1771 58.5321ZM16.0142 68.4846C16.6357 68.4846 17.1395 67.9808 17.1395 67.3593C17.1395 66.7378 16.6357 66.234 16.0142 66.234C15.3927 66.234 14.8888 66.7378 14.8888 67.3593C14.8888 67.9808 15.3927 68.4846 16.0142 68.4846ZM16.609 58.1523C16.9874 57.9836 17.431 58.1537 17.5996 58.5321L18.863 61.3666L18.0492 63.2263L16.2292 59.1429C16.0605 58.7645 16.2306 58.321 16.609 58.1523ZM21.6372 67.3593C21.6372 67.9808 22.141 68.4846 22.7625 68.4846C23.384 68.4846 23.8879 67.9808 23.8879 67.3593C23.8879 66.7378 23.384 66.234 22.7625 66.234C22.141 66.234 21.6372 66.7378 21.6372 67.3593Z",
    fill: "#FFD97C"
  }), e("path", {
    d: "M90.9016 83.1417C90.9016 85.627 92.9163 87.6417 95.4016 87.6417H128.965C131.451 87.6417 133.465 85.627 133.465 83.1417V61.2849C133.465 58.7997 131.451 56.7849 128.965 56.7849H113.795C112.891 56.7849 112.021 56.4344 111.369 55.807L109.238 53.7573C108.4 52.9506 107.282 52.5 106.118 52.5L95.4016 52.5C92.9163 52.5 90.9016 54.5147 90.9016 57L90.9016 83.1417Z",
    fill: "#B6DAFF",
    stroke: "#9AD7FF"
  }), e("path", {
    d: "M90.9016 87.121C90.9016 89.0485 92.46 90.6132 94.3874 90.621L129.951 90.765C131.89 90.7729 133.465 89.2036 133.465 87.2651V64.9967C133.465 63.0637 131.898 61.4967 129.965 61.4967H110.507C109.82 61.4967 109.163 61.2134 108.69 60.7136L106.013 57.8796C105.352 57.1798 104.431 56.7833 103.469 56.7833H94.4016C92.4686 56.7833 90.9016 58.3503 90.9016 60.2833L90.9016 87.121Z",
    fill: "#D8EAFF",
    stroke: "#9AD7FF"
  }), e("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M97.2511 71.6389C97.2511 70.8171 97.9173 70.1508 98.7392 70.1508H110.644C111.466 70.1508 112.132 70.8171 112.132 71.6389C112.132 72.4608 111.466 73.127 110.644 73.127H98.7392C97.9173 73.127 97.2511 72.4608 97.2511 71.6389Z",
    fill: "#B6DAFF"
  }), e("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M97.2511 77.5913C97.2511 76.7695 97.9173 76.1032 98.7392 76.1032H125.525C126.347 76.1032 127.013 76.7695 127.013 77.5913C127.013 78.4132 126.347 79.0794 125.525 79.0794H98.7392C97.9173 79.0794 97.2511 78.4132 97.2511 77.5913Z",
    fill: "#B6DAFF"
  })])], -1),
  k = {
    class: "kdocs-ext-login-tips-container"
  },
  M = {
    class: "kdocs-ext-login-tips"
  },
  y = {
    class: "kdocs-ext-login-tips"
  },
  w = {
    class: "kdocs-ext-login-tips"
  },
  x = r({
    __name: "App",
    setup: function setup(L) {
      function a() {
        var t, s, l, i;
        (s = (t = window == null ? void 0 : window.top) == null ? void 0 : t.postMessage) == null || s.call(t, {
          type: "gotoLogin"
        }, "*"), (i = (l = window == null ? void 0 : window.top) == null ? void 0 : l.postMessage) == null || i.call(l, {
          type: "dwEvent",
          action: "click_logon",
          page: "notlogin_panel"
        }, "*");
      }
      return function (t, s) {
        var l = v,
          i = _,
          p = u;
        return c(), V(p, null, {
          default: H(function () {
            return [n(l, {
              path: "login"
            }), g, e("div", k, [e("div", M, C(o(d)("login.keyToSave")), 1), e("div", y, C(o(d)("login.sync")), 1), e("div", w, C(o(d)("login.check")), 1)]), n(i, {
              class: "kdocs-login",
              type: "primary",
              onClick: a
            }, {
              default: H(function () {
                return [h(C(o(d)("login.loginFirst")), 1)];
              }),
              _: 1
            })];
          }),
          _: 1
        });
      };
    }
  });
function Z() {
  return _Z.apply(this, arguments);
}
function _Z() {
  _Z = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
    var L;
    return _regeneratorRuntime().wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          L = F(x);
          _context.next = 3;
          return f();
        case 3:
          L.mount("#app");
        case 4:
        case "end":
          return _context.stop();
      }
    }, _callee);
  }));
  return _Z.apply(this, arguments);
}
Z();
