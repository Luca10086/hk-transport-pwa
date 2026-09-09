import { d as s, o as i, l as a, x as n, D as o, J as c } from "./__uno-cab22814.js";
var d = {
    class: "kdv-message"
  },
  l = c('<i class="kd-icon"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><g clip-path="url(#icon-5f2b8d1446549828)"><path d="M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16Z" fill="#0A6CFF"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M8 13C8.55228 13 9 12.5523 9 12V7C9 6.44772 8.55228 6 8 6C7.44772 6 7 6.44772 7 7V12C7 12.5523 7.44772 13 8 13ZM7 4C7 4.55228 7.44772 5 8 5V5C8.55228 5 9 4.55228 9 4V4C9 3.44772 8.55228 3 8 3V3C7.44772 3 7 3.44772 7 4V4Z" fill="white"></path></g><defs><clipPath id="icon-5f2b8d1446549828"><rect width="16" height="16" fill="white"></rect></clipPath></defs></svg></i>', 1),
  p = {
    class: "kdv-message__content"
  },
  C = s({
    __name: "index",
    props: {
      message: {
        type: String,
        default: function _default() {
          return "";
        }
      }
    },
    setup: function setup(e) {
      var t = e;
      return function (_, r) {
        return i(), a("div", d, [l, n("p", p, o(t.message), 1)]);
      };
    }
  });
export { C as _ };
