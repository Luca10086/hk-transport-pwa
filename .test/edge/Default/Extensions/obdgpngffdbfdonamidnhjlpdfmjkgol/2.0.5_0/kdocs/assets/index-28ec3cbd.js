var p = function p(t) {
    var _ref;
    var a;
    var c = new URL(t);
    return (_ref = (a = c == null ? void 0 : c.searchParams) == null ? void 0 : a.values()) !== null && _ref !== void 0 ? _ref : [];
  },
  l = function l(t) {
    return t && ((t == null ? void 0 : t.companyid) > 0 && (t == null ? void 0 : t.is_company_account) || (t == null ? void 0 : t.companyid) > 0 && !(t != null && t.is_company_account) && (t == null ? void 0 : t.current_companyid) === (t == null ? void 0 : t.companyid));
  },
  y = function y(t) {
    var c = t.length;
    var a = 0;
    for (var e = 0; e < c; e++) t.charCodeAt(e) > 127 && a++, a++;
    return a;
  },
  m = function m(t, c) {
    var a = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "...";
    return t && y(t) > c ? o(t, c) + (a || "") : t;
  },
  o = function o(t, c) {
    var a = 0,
      e = "";
    for (var h = 0; h < t.length && (/[\u4e00-\u9fa5]/.test(t[h]) ? a += 2 : a += 1, !(a > c)); h++) e += t[h];
    return e;
  };
var S = function S(t) {
  var c = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : ">";
  var a = t.join(c);
  if (y(a) <= 60) return a;
  var e = t;
  t.length > 4 && (e = [t[0], t[1], "...", t[t.length - 1]]);
  for (var n = 0, g = e.length; n < g; n++) {
    var d = e.join(c);
    if (y(d) <= 60) return d;
    e[n] = m(e[n], 10);
  }
  var h = e.join(c);
  return t.length === 4 && y(h) > 60 && (e[2] = "..."), e.join(c);
};
export { p as g, l as h, S as s };
