(function(func) {
  typeof exports === "object" && typeof module !== "undefined"
    ? (module.exports = func())
    : (window.AlfaSocket = func());
})(function() {
  "use strict";

  function foo() {
    return "foo is working";
  }

  var funcs = {
    Foo: foo,
  };

  return funcs;
});
