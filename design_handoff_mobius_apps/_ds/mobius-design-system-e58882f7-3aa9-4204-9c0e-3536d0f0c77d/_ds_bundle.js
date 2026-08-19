/* @ds-bundle: {"namespace":"Mobius","components":[{"name":"ActionButtons","sourcePath":"components/general/ActionButtons/ActionButtons.jsx"},{"name":"CalendarWidget","sourcePath":"components/general/CalendarWidget/CalendarWidget.jsx"},{"name":"Modal","sourcePath":"components/general/Modal/Modal.jsx"},{"name":"SearchableDropdown","sourcePath":"components/general/SearchableDropdown/SearchableDropdown.jsx"},{"name":"SummaryCard","sourcePath":"components/general/SummaryCard/SummaryCard.jsx"}],"sourceHashes":{"components/general/ActionButtons/ActionButtons.jsx":"926395897cfa","components/general/ActionButtons/ActionButtons.d.ts":"49dcbd50ea8b","components/general/ActionButtons/ActionButtons.prompt.md":"caa15d961b78","components/general/CalendarWidget/CalendarWidget.jsx":"de5c72ffed60","components/general/CalendarWidget/CalendarWidget.d.ts":"203de37f4835","components/general/CalendarWidget/CalendarWidget.prompt.md":"5873ed54bcc6","components/general/Modal/Modal.jsx":"14979cee5758","components/general/Modal/Modal.d.ts":"aa439ffb3df4","components/general/Modal/Modal.prompt.md":"63669f90bf13","components/general/SearchableDropdown/SearchableDropdown.jsx":"fae2e5daaaa9","components/general/SearchableDropdown/SearchableDropdown.d.ts":"68bdbb14bddd","components/general/SearchableDropdown/SearchableDropdown.prompt.md":"83343a064427","components/general/SummaryCard/SummaryCard.jsx":"e366c98c4f84","components/general/SummaryCard/SummaryCard.d.ts":"de6ccc6ce81a","components/general/SummaryCard/SummaryCard.prompt.md":"4f69e494a5d0"},"inlinedExternals":["@wojtekmaj/date-utils","clsx","d3-array","d3-color","d3-format","d3-interpolate","d3-path","d3-scale","d3-shape","d3-time","d3-time-format","decimal.js-light","es-toolkit","eventemitter3","get-user-locale","immer","internmap","map-age-cleaner","mem","mimic-fn","object-assign","p-defer","prop-types","react-calendar","recharts","reselect","tiny-invariant","use-sync-external-store","victory-vendor","warning"],"builtBy":"cc-design-sync"} */
var Mobius = (() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __esm = (fn, res, err) => function __init() {
    if (err) throw err[0];
    try {
      return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
    } catch (e) {
      throw err = [e], e;
    }
  };
  var __commonJS = (cb, mod) => function __require() {
    try {
      return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
    } catch (e) {
      throw mod = 0, e;
    }
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

  // <define:import.meta.env>
  var init_define_import_meta_env = __esm({
    "<define:import.meta.env>"() {
    }
  });

  // shim:react-shim
  var require_react_shim = __commonJS({
    "shim:react-shim"(exports, module) {
      init_define_import_meta_env();
      var R = window.React;
      function np(p, k) {
        var o = {};
        for (var x2 in p) if (x2 !== "children") o[x2] = p[x2];
        if (k !== void 0) o.key = k;
        return o;
      }
      function jsx(t, p, k) {
        var c = p && p.children;
        return c === void 0 ? R.createElement(t, np(p, k)) : R.createElement(t, np(p, k), c);
      }
      function jsxs(t, p, k) {
        return R.createElement.apply(R, [t, np(p, k)].concat(p.children));
      }
      module.exports = R;
      module.exports.jsx = jsx;
      module.exports.jsxs = jsxs;
      module.exports.jsxDEV = function(t, p, k, s) {
        return (s ? jsxs : jsx)(t, p, k);
      };
      module.exports.Fragment = R.Fragment;
    }
  });

  // shim:react-dom-shim
  var require_react_dom_shim = __commonJS({
    "shim:react-dom-shim"(exports, module) {
      init_define_import_meta_env();
      var D = window.ReactDOM;
      var n = function() {
      };
      module.exports = Object.assign({ preload: n, preinit: n, preconnect: n, prefetchDNS: n, preloadModule: n, preinitModule: n }, D);
    }
  });

  // client/node_modules/es-toolkit/dist/_internal/isUnsafeProperty.js
  var require_isUnsafeProperty = __commonJS({
    "client/node_modules/es-toolkit/dist/_internal/isUnsafeProperty.js"(exports) {
      "use strict";
      init_define_import_meta_env();
      Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
      function isUnsafeProperty(key) {
        return key === "__proto__";
      }
      exports.isUnsafeProperty = isUnsafeProperty;
    }
  });

  // client/node_modules/es-toolkit/dist/compat/_internal/isDeepKey.js
  var require_isDeepKey = __commonJS({
    "client/node_modules/es-toolkit/dist/compat/_internal/isDeepKey.js"(exports) {
      "use strict";
      init_define_import_meta_env();
      Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
      function isDeepKey(key) {
        switch (typeof key) {
          case "number":
          case "symbol": {
            return false;
          }
          case "string": {
            return key.includes(".") || key.includes("[") || key.includes("]");
          }
        }
      }
      exports.isDeepKey = isDeepKey;
    }
  });

  // client/node_modules/es-toolkit/dist/compat/_internal/toKey.js
  var require_toKey = __commonJS({
    "client/node_modules/es-toolkit/dist/compat/_internal/toKey.js"(exports) {
      "use strict";
      init_define_import_meta_env();
      Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
      function toKey(value) {
        if (typeof value === "string" || typeof value === "symbol") {
          return value;
        }
        if (Object.is(value?.valueOf?.(), -0)) {
          return "-0";
        }
        return String(value);
      }
      exports.toKey = toKey;
    }
  });

  // client/node_modules/es-toolkit/dist/compat/util/toPath.js
  var require_toPath = __commonJS({
    "client/node_modules/es-toolkit/dist/compat/util/toPath.js"(exports) {
      "use strict";
      init_define_import_meta_env();
      Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
      function toPath(deepKey) {
        const result = [];
        const length = deepKey.length;
        if (length === 0) {
          return result;
        }
        let index = 0;
        let key = "";
        let quoteChar = "";
        let bracket = false;
        if (deepKey.charCodeAt(0) === 46) {
          result.push("");
          index++;
        }
        while (index < length) {
          const char = deepKey[index];
          if (quoteChar) {
            if (char === "\\" && index + 1 < length) {
              index++;
              key += deepKey[index];
            } else if (char === quoteChar) {
              quoteChar = "";
            } else {
              key += char;
            }
          } else if (bracket) {
            if (char === '"' || char === "'") {
              quoteChar = char;
            } else if (char === "]") {
              bracket = false;
              result.push(key);
              key = "";
            } else {
              key += char;
            }
          } else {
            if (char === "[") {
              bracket = true;
              if (key) {
                result.push(key);
                key = "";
              }
            } else if (char === ".") {
              if (key) {
                result.push(key);
                key = "";
              }
            } else {
              key += char;
            }
          }
          index++;
        }
        if (key) {
          result.push(key);
        }
        return result;
      }
      exports.toPath = toPath;
    }
  });

  // client/node_modules/es-toolkit/dist/compat/object/get.js
  var require_get = __commonJS({
    "client/node_modules/es-toolkit/dist/compat/object/get.js"(exports) {
      "use strict";
      init_define_import_meta_env();
      Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
      var isUnsafeProperty = require_isUnsafeProperty();
      var isDeepKey = require_isDeepKey();
      var toKey = require_toKey();
      var toPath = require_toPath();
      function get5(object, path2, defaultValue) {
        if (object == null) {
          return defaultValue;
        }
        switch (typeof path2) {
          case "string": {
            if (isUnsafeProperty.isUnsafeProperty(path2)) {
              return defaultValue;
            }
            const result = object[path2];
            if (result === void 0) {
              if (isDeepKey.isDeepKey(path2)) {
                return get5(object, toPath.toPath(path2), defaultValue);
              } else {
                return defaultValue;
              }
            }
            return result;
          }
          case "number":
          case "symbol": {
            if (typeof path2 === "number") {
              path2 = toKey.toKey(path2);
            }
            const result = object[path2];
            if (result === void 0) {
              return defaultValue;
            }
            return result;
          }
          default: {
            if (Array.isArray(path2)) {
              return getWithPath(object, path2, defaultValue);
            }
            if (Object.is(path2?.valueOf(), -0)) {
              path2 = "-0";
            } else {
              path2 = String(path2);
            }
            if (isUnsafeProperty.isUnsafeProperty(path2)) {
              return defaultValue;
            }
            const result = object[path2];
            if (result === void 0) {
              return defaultValue;
            }
            return result;
          }
        }
      }
      function getWithPath(object, path2, defaultValue) {
        if (path2.length === 0) {
          return defaultValue;
        }
        let current2 = object;
        for (let index = 0; index < path2.length; index++) {
          if (current2 == null) {
            return defaultValue;
          }
          if (isUnsafeProperty.isUnsafeProperty(path2[index])) {
            return defaultValue;
          }
          current2 = current2[path2[index]];
        }
        if (current2 === void 0) {
          return defaultValue;
        }
        return current2;
      }
      exports.get = get5;
    }
  });

  // client/node_modules/es-toolkit/compat/get.js
  var require_get2 = __commonJS({
    "client/node_modules/es-toolkit/compat/get.js"(exports, module) {
      init_define_import_meta_env();
      module.exports = require_get().get;
    }
  });

  // shim:react-is-shim
  var require_react_is_shim = __commonJS({
    "shim:react-is-shim"(exports) {
      init_define_import_meta_env();
      var R = window.React;
      var FWD = /* @__PURE__ */ Symbol.for("react.forward_ref");
      var MEMO = /* @__PURE__ */ Symbol.for("react.memo");
      var PORTAL = /* @__PURE__ */ Symbol.for("react.portal");
      var LAZY = /* @__PURE__ */ Symbol.for("react.lazy");
      function tt(o) {
        return o != null && typeof o === "object" ? R.isValidElement(o) ? o.type && o.type.$$typeof || o.type : o.$$typeof : void 0;
      }
      exports.typeOf = tt;
      exports.isElement = R.isValidElement;
      exports.isValidElementType = function(t) {
        return typeof t === "string" || typeof t === "function" || t === R.Fragment || t === R.Suspense || t === R.StrictMode || t === R.Profiler || t != null && typeof t === "object" && t.$$typeof != null;
      };
      exports.isFragment = function(o) {
        return R.isValidElement(o) && o.type === R.Fragment;
      };
      exports.isSuspense = function(o) {
        return R.isValidElement(o) && o.type === R.Suspense;
      };
      exports.isPortal = function(o) {
        return o != null && o.$$typeof === PORTAL;
      };
      exports.isForwardRef = function(o) {
        return tt(o) === FWD;
      };
      exports.isMemo = function(o) {
        return tt(o) === MEMO;
      };
      exports.isLazy = function(o) {
        return tt(o) === LAZY;
      };
      exports.isContextProvider = exports.isContextConsumer = exports.isProfiler = exports.isStrictMode = function() {
        return false;
      };
      exports.ForwardRef = FWD;
      exports.Memo = MEMO;
      exports.Portal = PORTAL;
      exports.Lazy = LAZY;
      exports.Fragment = R.Fragment;
      exports.Suspense = R.Suspense;
      exports.StrictMode = R.StrictMode;
      exports.Profiler = R.Profiler;
    }
  });

  // client/node_modules/es-toolkit/dist/compat/_internal/compareValues.js
  var require_compareValues = __commonJS({
    "client/node_modules/es-toolkit/dist/compat/_internal/compareValues.js"(exports) {
      "use strict";
      init_define_import_meta_env();
      Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
      function getPriority(a) {
        if (typeof a === "symbol") {
          return 1;
        }
        if (a === null) {
          return 2;
        }
        if (a === void 0) {
          return 3;
        }
        if (a !== a) {
          return 4;
        }
        return 0;
      }
      var compareValues = (a, b, order) => {
        if (a !== b) {
          const aPriority = getPriority(a);
          const bPriority = getPriority(b);
          if (aPriority === bPriority && aPriority === 0) {
            if (a < b) {
              return order === "desc" ? 1 : -1;
            }
            if (a > b) {
              return order === "desc" ? -1 : 1;
            }
          }
          return order === "desc" ? bPriority - aPriority : aPriority - bPriority;
        }
        return 0;
      };
      exports.compareValues = compareValues;
    }
  });

  // client/node_modules/es-toolkit/dist/compat/predicate/isSymbol.js
  var require_isSymbol = __commonJS({
    "client/node_modules/es-toolkit/dist/compat/predicate/isSymbol.js"(exports) {
      "use strict";
      init_define_import_meta_env();
      Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
      function isSymbol(value) {
        return typeof value === "symbol" || value instanceof Symbol;
      }
      exports.isSymbol = isSymbol;
    }
  });

  // client/node_modules/es-toolkit/dist/compat/_internal/isKey.js
  var require_isKey = __commonJS({
    "client/node_modules/es-toolkit/dist/compat/_internal/isKey.js"(exports) {
      "use strict";
      init_define_import_meta_env();
      Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
      var isSymbol = require_isSymbol();
      var regexIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/;
      var regexIsPlainProp = /^\w*$/;
      function isKey(value, object) {
        if (Array.isArray(value)) {
          return false;
        }
        if (typeof value === "number" || typeof value === "boolean" || value == null || isSymbol.isSymbol(value)) {
          return true;
        }
        return typeof value === "string" && (regexIsPlainProp.test(value) || !regexIsDeepProp.test(value)) || object != null && Object.hasOwn(object, value);
      }
      exports.isKey = isKey;
    }
  });

  // client/node_modules/es-toolkit/dist/compat/array/orderBy.js
  var require_orderBy = __commonJS({
    "client/node_modules/es-toolkit/dist/compat/array/orderBy.js"(exports) {
      "use strict";
      init_define_import_meta_env();
      Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
      var compareValues = require_compareValues();
      var isKey = require_isKey();
      var toPath = require_toPath();
      function orderBy(collection, criteria, orders, guard) {
        if (collection == null) {
          return [];
        }
        orders = guard ? void 0 : orders;
        if (!Array.isArray(collection)) {
          collection = Object.values(collection);
        }
        if (!Array.isArray(criteria)) {
          criteria = criteria == null ? [null] : [criteria];
        }
        if (criteria.length === 0) {
          criteria = [null];
        }
        if (!Array.isArray(orders)) {
          orders = orders == null ? [] : [orders];
        }
        orders = orders.map((order) => String(order));
        const getValueByNestedPath = (object, path2) => {
          let target = object;
          for (let i = 0; i < path2.length && target != null; ++i) {
            target = target[path2[i]];
          }
          return target;
        };
        const getValueByCriterion = (criterion, object) => {
          if (object == null || criterion == null) {
            return object;
          }
          if (typeof criterion === "object" && "key" in criterion) {
            if (Object.hasOwn(object, criterion.key)) {
              return object[criterion.key];
            }
            return getValueByNestedPath(object, criterion.path);
          }
          if (typeof criterion === "function") {
            return criterion(object);
          }
          if (Array.isArray(criterion)) {
            return getValueByNestedPath(object, criterion);
          }
          if (typeof object === "object") {
            return object[criterion];
          }
          return object;
        };
        const preparedCriteria = criteria.map((criterion) => {
          if (Array.isArray(criterion) && criterion.length === 1) {
            criterion = criterion[0];
          }
          if (criterion == null || typeof criterion === "function" || Array.isArray(criterion) || isKey.isKey(criterion)) {
            return criterion;
          }
          return { key: criterion, path: toPath.toPath(criterion) };
        });
        const preparedCollection = collection.map((item) => ({
          original: item,
          criteria: preparedCriteria.map((criterion) => getValueByCriterion(criterion, item))
        }));
        return preparedCollection.slice().sort((a, b) => {
          for (let i = 0; i < preparedCriteria.length; i++) {
            const comparedResult = compareValues.compareValues(a.criteria[i], b.criteria[i], orders[i]);
            if (comparedResult !== 0) {
              return comparedResult;
            }
          }
          return 0;
        }).map((item) => item.original);
      }
      exports.orderBy = orderBy;
    }
  });

  // client/node_modules/es-toolkit/dist/array/flatten.js
  var require_flatten = __commonJS({
    "client/node_modules/es-toolkit/dist/array/flatten.js"(exports) {
      "use strict";
      init_define_import_meta_env();
      Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
      function flatten(arr, depth = 1) {
        const result = [];
        const flooredDepth = Math.floor(depth);
        const recursive = (arr2, currentDepth) => {
          for (let i = 0; i < arr2.length; i++) {
            const item = arr2[i];
            if (Array.isArray(item) && currentDepth < flooredDepth) {
              recursive(item, currentDepth + 1);
            } else {
              result.push(item);
            }
          }
        };
        recursive(arr, 0);
        return result;
      }
      exports.flatten = flatten;
    }
  });

  // client/node_modules/es-toolkit/dist/compat/_internal/isIndex.js
  var require_isIndex = __commonJS({
    "client/node_modules/es-toolkit/dist/compat/_internal/isIndex.js"(exports) {
      "use strict";
      init_define_import_meta_env();
      Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
      var IS_UNSIGNED_INTEGER = /^(?:0|[1-9]\d*)$/;
      function isIndex(value, length = Number.MAX_SAFE_INTEGER) {
        switch (typeof value) {
          case "number": {
            return Number.isInteger(value) && value >= 0 && value < length;
          }
          case "symbol": {
            return false;
          }
          case "string": {
            return IS_UNSIGNED_INTEGER.test(value);
          }
        }
      }
      exports.isIndex = isIndex;
    }
  });

  // client/node_modules/es-toolkit/dist/predicate/isLength.js
  var require_isLength = __commonJS({
    "client/node_modules/es-toolkit/dist/predicate/isLength.js"(exports) {
      "use strict";
      init_define_import_meta_env();
      Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
      function isLength(value) {
        return Number.isSafeInteger(value) && value >= 0;
      }
      exports.isLength = isLength;
    }
  });

  // client/node_modules/es-toolkit/dist/compat/predicate/isArrayLike.js
  var require_isArrayLike = __commonJS({
    "client/node_modules/es-toolkit/dist/compat/predicate/isArrayLike.js"(exports) {
      "use strict";
      init_define_import_meta_env();
      Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
      var isLength = require_isLength();
      function isArrayLike(value) {
        return value != null && typeof value !== "function" && isLength.isLength(value.length);
      }
      exports.isArrayLike = isArrayLike;
    }
  });

  // client/node_modules/es-toolkit/dist/compat/predicate/isObject.js
  var require_isObject = __commonJS({
    "client/node_modules/es-toolkit/dist/compat/predicate/isObject.js"(exports) {
      "use strict";
      init_define_import_meta_env();
      Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
      function isObject(value) {
        return value !== null && (typeof value === "object" || typeof value === "function");
      }
      exports.isObject = isObject;
    }
  });

  // client/node_modules/es-toolkit/dist/compat/util/eq.js
  var require_eq = __commonJS({
    "client/node_modules/es-toolkit/dist/compat/util/eq.js"(exports) {
      "use strict";
      init_define_import_meta_env();
      Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
      function eq(value, other) {
        return value === other || Number.isNaN(value) && Number.isNaN(other);
      }
      exports.eq = eq;
    }
  });

  // client/node_modules/es-toolkit/dist/compat/_internal/isIterateeCall.js
  var require_isIterateeCall = __commonJS({
    "client/node_modules/es-toolkit/dist/compat/_internal/isIterateeCall.js"(exports) {
      "use strict";
      init_define_import_meta_env();
      Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
      var isIndex = require_isIndex();
      var isArrayLike = require_isArrayLike();
      var isObject = require_isObject();
      var eq = require_eq();
      function isIterateeCall(value, index, object) {
        if (!isObject.isObject(object)) {
          return false;
        }
        if (typeof index === "number" && isArrayLike.isArrayLike(object) && isIndex.isIndex(index) && index < object.length || typeof index === "string" && index in object) {
          return eq.eq(object[index], value);
        }
        return false;
      }
      exports.isIterateeCall = isIterateeCall;
    }
  });

  // client/node_modules/es-toolkit/dist/compat/array/sortBy.js
  var require_sortBy = __commonJS({
    "client/node_modules/es-toolkit/dist/compat/array/sortBy.js"(exports) {
      "use strict";
      init_define_import_meta_env();
      Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
      var orderBy = require_orderBy();
      var flatten = require_flatten();
      var isIterateeCall = require_isIterateeCall();
      function sortBy3(collection, ...criteria) {
        const length = criteria.length;
        if (length > 1 && isIterateeCall.isIterateeCall(collection, criteria[0], criteria[1])) {
          criteria = [];
        } else if (length > 2 && isIterateeCall.isIterateeCall(criteria[0], criteria[1], criteria[2])) {
          criteria = [criteria[0]];
        }
        return orderBy.orderBy(collection, flatten.flatten(criteria), ["asc"]);
      }
      exports.sortBy = sortBy3;
    }
  });

  // client/node_modules/es-toolkit/compat/sortBy.js
  var require_sortBy2 = __commonJS({
    "client/node_modules/es-toolkit/compat/sortBy.js"(exports, module) {
      init_define_import_meta_env();
      module.exports = require_sortBy().sortBy;
    }
  });

  // client/node_modules/use-sync-external-store/cjs/use-sync-external-store-shim.development.js
  var require_use_sync_external_store_shim_development = __commonJS({
    "client/node_modules/use-sync-external-store/cjs/use-sync-external-store-shim.development.js"(exports) {
      "use strict";
      init_define_import_meta_env();
      (function() {
        function is2(x2, y2) {
          return x2 === y2 && (0 !== x2 || 1 / x2 === 1 / y2) || x2 !== x2 && y2 !== y2;
        }
        function useSyncExternalStore$2(subscribe, getSnapshot) {
          didWarnOld18Alpha || void 0 === React49.startTransition || (didWarnOld18Alpha = true, console.error(
            "You are using an outdated, pre-release alpha of React 18 that does not support useSyncExternalStore. The use-sync-external-store shim will not work correctly. Upgrade to a newer pre-release."
          ));
          var value = getSnapshot();
          if (!didWarnUncachedGetSnapshot) {
            var cachedValue = getSnapshot();
            objectIs(value, cachedValue) || (console.error(
              "The result of getSnapshot should be cached to avoid an infinite loop"
            ), didWarnUncachedGetSnapshot = true);
          }
          cachedValue = useState10({
            inst: { value, getSnapshot }
          });
          var inst = cachedValue[0].inst, forceUpdate = cachedValue[1];
          useLayoutEffect2(
            function() {
              inst.value = value;
              inst.getSnapshot = getSnapshot;
              checkIfSnapshotChanged(inst) && forceUpdate({ inst });
            },
            [subscribe, value, getSnapshot]
          );
          useEffect15(
            function() {
              checkIfSnapshotChanged(inst) && forceUpdate({ inst });
              return subscribe(function() {
                checkIfSnapshotChanged(inst) && forceUpdate({ inst });
              });
            },
            [subscribe]
          );
          useDebugValue2(value);
          return value;
        }
        function checkIfSnapshotChanged(inst) {
          var latestGetSnapshot = inst.getSnapshot;
          inst = inst.value;
          try {
            var nextValue = latestGetSnapshot();
            return !objectIs(inst, nextValue);
          } catch (error) {
            return true;
          }
        }
        function useSyncExternalStore$1(subscribe, getSnapshot) {
          return getSnapshot();
        }
        "undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ && "function" === typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(Error());
        var React49 = require_react_shim(), objectIs = "function" === typeof Object.is ? Object.is : is2, useState10 = React49.useState, useEffect15 = React49.useEffect, useLayoutEffect2 = React49.useLayoutEffect, useDebugValue2 = React49.useDebugValue, didWarnOld18Alpha = false, didWarnUncachedGetSnapshot = false, shim = "undefined" === typeof window || "undefined" === typeof window.document || "undefined" === typeof window.document.createElement ? useSyncExternalStore$1 : useSyncExternalStore$2;
        exports.useSyncExternalStore = void 0 !== React49.useSyncExternalStore ? React49.useSyncExternalStore : shim;
        "undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ && "function" === typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(Error());
      })();
    }
  });

  // client/node_modules/use-sync-external-store/shim/index.js
  var require_shim = __commonJS({
    "client/node_modules/use-sync-external-store/shim/index.js"(exports, module) {
      "use strict";
      init_define_import_meta_env();
      if (false) {
        module.exports = null;
      } else {
        module.exports = require_use_sync_external_store_shim_development();
      }
    }
  });

  // client/node_modules/use-sync-external-store/cjs/use-sync-external-store-shim/with-selector.development.js
  var require_with_selector_development = __commonJS({
    "client/node_modules/use-sync-external-store/cjs/use-sync-external-store-shim/with-selector.development.js"(exports) {
      "use strict";
      init_define_import_meta_env();
      (function() {
        function is2(x2, y2) {
          return x2 === y2 && (0 !== x2 || 1 / x2 === 1 / y2) || x2 !== x2 && y2 !== y2;
        }
        "undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ && "function" === typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(Error());
        var React49 = require_react_shim(), shim = require_shim(), objectIs = "function" === typeof Object.is ? Object.is : is2, useSyncExternalStore2 = shim.useSyncExternalStore, useRef7 = React49.useRef, useEffect15 = React49.useEffect, useMemo6 = React49.useMemo, useDebugValue2 = React49.useDebugValue;
        exports.useSyncExternalStoreWithSelector = function(subscribe, getSnapshot, getServerSnapshot, selector, isEqual2) {
          var instRef = useRef7(null);
          if (null === instRef.current) {
            var inst = { hasValue: false, value: null };
            instRef.current = inst;
          } else inst = instRef.current;
          instRef = useMemo6(
            function() {
              function memoizedSelector(nextSnapshot) {
                if (!hasMemo) {
                  hasMemo = true;
                  memoizedSnapshot = nextSnapshot;
                  nextSnapshot = selector(nextSnapshot);
                  if (void 0 !== isEqual2 && inst.hasValue) {
                    var currentSelection = inst.value;
                    if (isEqual2(currentSelection, nextSnapshot))
                      return memoizedSelection = currentSelection;
                  }
                  return memoizedSelection = nextSnapshot;
                }
                currentSelection = memoizedSelection;
                if (objectIs(memoizedSnapshot, nextSnapshot))
                  return currentSelection;
                var nextSelection = selector(nextSnapshot);
                if (void 0 !== isEqual2 && isEqual2(currentSelection, nextSelection))
                  return memoizedSnapshot = nextSnapshot, currentSelection;
                memoizedSnapshot = nextSnapshot;
                return memoizedSelection = nextSelection;
              }
              var hasMemo = false, memoizedSnapshot, memoizedSelection, maybeGetServerSnapshot = void 0 === getServerSnapshot ? null : getServerSnapshot;
              return [
                function() {
                  return memoizedSelector(getSnapshot());
                },
                null === maybeGetServerSnapshot ? void 0 : function() {
                  return memoizedSelector(maybeGetServerSnapshot());
                }
              ];
            },
            [getSnapshot, getServerSnapshot, selector, isEqual2]
          );
          var value = useSyncExternalStore2(subscribe, instRef[0], instRef[1]);
          useEffect15(
            function() {
              inst.hasValue = true;
              inst.value = value;
            },
            [value]
          );
          useDebugValue2(value);
          return value;
        };
        "undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ && "function" === typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(Error());
      })();
    }
  });

  // client/node_modules/use-sync-external-store/shim/with-selector.js
  var require_with_selector = __commonJS({
    "client/node_modules/use-sync-external-store/shim/with-selector.js"(exports, module) {
      "use strict";
      init_define_import_meta_env();
      if (false) {
        module.exports = null;
      } else {
        module.exports = require_with_selector_development();
      }
    }
  });

  // client/node_modules/es-toolkit/dist/predicate/isPlainObject.js
  var require_isPlainObject = __commonJS({
    "client/node_modules/es-toolkit/dist/predicate/isPlainObject.js"(exports) {
      "use strict";
      init_define_import_meta_env();
      Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
      function isPlainObject3(value) {
        if (!value || typeof value !== "object") {
          return false;
        }
        const proto2 = Object.getPrototypeOf(value);
        const hasObjectPrototype = proto2 === null || proto2 === Object.prototype || Object.getPrototypeOf(proto2) === null;
        if (!hasObjectPrototype) {
          return false;
        }
        return Object.prototype.toString.call(value) === "[object Object]";
      }
      exports.isPlainObject = isPlainObject3;
    }
  });

  // client/node_modules/es-toolkit/dist/compat/_internal/getSymbols.js
  var require_getSymbols = __commonJS({
    "client/node_modules/es-toolkit/dist/compat/_internal/getSymbols.js"(exports) {
      "use strict";
      init_define_import_meta_env();
      Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
      function getSymbols(object) {
        return Object.getOwnPropertySymbols(object).filter((symbol) => Object.prototype.propertyIsEnumerable.call(object, symbol));
      }
      exports.getSymbols = getSymbols;
    }
  });

  // client/node_modules/es-toolkit/dist/compat/_internal/getTag.js
  var require_getTag = __commonJS({
    "client/node_modules/es-toolkit/dist/compat/_internal/getTag.js"(exports) {
      "use strict";
      init_define_import_meta_env();
      Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
      function getTag(value) {
        if (value == null) {
          return value === void 0 ? "[object Undefined]" : "[object Null]";
        }
        return Object.prototype.toString.call(value);
      }
      exports.getTag = getTag;
    }
  });

  // client/node_modules/es-toolkit/dist/compat/_internal/tags.js
  var require_tags = __commonJS({
    "client/node_modules/es-toolkit/dist/compat/_internal/tags.js"(exports) {
      "use strict";
      init_define_import_meta_env();
      Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
      var regexpTag = "[object RegExp]";
      var stringTag = "[object String]";
      var numberTag = "[object Number]";
      var booleanTag = "[object Boolean]";
      var argumentsTag = "[object Arguments]";
      var symbolTag = "[object Symbol]";
      var dateTag = "[object Date]";
      var mapTag = "[object Map]";
      var setTag = "[object Set]";
      var arrayTag = "[object Array]";
      var functionTag = "[object Function]";
      var arrayBufferTag = "[object ArrayBuffer]";
      var objectTag = "[object Object]";
      var errorTag = "[object Error]";
      var dataViewTag = "[object DataView]";
      var uint8ArrayTag = "[object Uint8Array]";
      var uint8ClampedArrayTag = "[object Uint8ClampedArray]";
      var uint16ArrayTag = "[object Uint16Array]";
      var uint32ArrayTag = "[object Uint32Array]";
      var bigUint64ArrayTag = "[object BigUint64Array]";
      var int8ArrayTag = "[object Int8Array]";
      var int16ArrayTag = "[object Int16Array]";
      var int32ArrayTag = "[object Int32Array]";
      var bigInt64ArrayTag = "[object BigInt64Array]";
      var float32ArrayTag = "[object Float32Array]";
      var float64ArrayTag = "[object Float64Array]";
      exports.argumentsTag = argumentsTag;
      exports.arrayBufferTag = arrayBufferTag;
      exports.arrayTag = arrayTag;
      exports.bigInt64ArrayTag = bigInt64ArrayTag;
      exports.bigUint64ArrayTag = bigUint64ArrayTag;
      exports.booleanTag = booleanTag;
      exports.dataViewTag = dataViewTag;
      exports.dateTag = dateTag;
      exports.errorTag = errorTag;
      exports.float32ArrayTag = float32ArrayTag;
      exports.float64ArrayTag = float64ArrayTag;
      exports.functionTag = functionTag;
      exports.int16ArrayTag = int16ArrayTag;
      exports.int32ArrayTag = int32ArrayTag;
      exports.int8ArrayTag = int8ArrayTag;
      exports.mapTag = mapTag;
      exports.numberTag = numberTag;
      exports.objectTag = objectTag;
      exports.regexpTag = regexpTag;
      exports.setTag = setTag;
      exports.stringTag = stringTag;
      exports.symbolTag = symbolTag;
      exports.uint16ArrayTag = uint16ArrayTag;
      exports.uint32ArrayTag = uint32ArrayTag;
      exports.uint8ArrayTag = uint8ArrayTag;
      exports.uint8ClampedArrayTag = uint8ClampedArrayTag;
    }
  });

  // client/node_modules/es-toolkit/dist/predicate/isEqualWith.js
  var require_isEqualWith = __commonJS({
    "client/node_modules/es-toolkit/dist/predicate/isEqualWith.js"(exports) {
      "use strict";
      init_define_import_meta_env();
      Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
      var isPlainObject3 = require_isPlainObject();
      var getSymbols = require_getSymbols();
      var getTag = require_getTag();
      var tags = require_tags();
      var eq = require_eq();
      function isEqualWith(a, b, areValuesEqual) {
        return isEqualWithImpl(a, b, void 0, void 0, void 0, void 0, areValuesEqual);
      }
      function isEqualWithImpl(a, b, property, aParent, bParent, stack, areValuesEqual) {
        const result = areValuesEqual(a, b, property, aParent, bParent, stack);
        if (result !== void 0) {
          return result;
        }
        if (typeof a === typeof b) {
          switch (typeof a) {
            case "bigint":
            case "string":
            case "boolean":
            case "symbol":
            case "undefined": {
              return a === b;
            }
            case "number": {
              return a === b || Object.is(a, b);
            }
            case "function": {
              return a === b;
            }
            case "object": {
              return areObjectsEqual(a, b, stack, areValuesEqual);
            }
          }
        }
        return areObjectsEqual(a, b, stack, areValuesEqual);
      }
      function areObjectsEqual(a, b, stack, areValuesEqual) {
        if (Object.is(a, b)) {
          return true;
        }
        let aTag = getTag.getTag(a);
        let bTag = getTag.getTag(b);
        if (aTag === tags.argumentsTag) {
          aTag = tags.objectTag;
        }
        if (bTag === tags.argumentsTag) {
          bTag = tags.objectTag;
        }
        if (aTag !== bTag) {
          return false;
        }
        switch (aTag) {
          case tags.stringTag:
            return a.toString() === b.toString();
          case tags.numberTag: {
            const x2 = a.valueOf();
            const y2 = b.valueOf();
            return eq.eq(x2, y2);
          }
          case tags.booleanTag:
          case tags.dateTag:
          case tags.symbolTag:
            return Object.is(a.valueOf(), b.valueOf());
          case tags.regexpTag: {
            return a.source === b.source && a.flags === b.flags;
          }
          case tags.functionTag: {
            return a === b;
          }
        }
        stack = stack ?? /* @__PURE__ */ new Map();
        const aStack = stack.get(a);
        const bStack = stack.get(b);
        if (aStack != null && bStack != null) {
          return aStack === b;
        }
        stack.set(a, b);
        stack.set(b, a);
        try {
          switch (aTag) {
            case tags.mapTag: {
              if (a.size !== b.size) {
                return false;
              }
              for (const [key, value] of a.entries()) {
                if (!b.has(key) || !isEqualWithImpl(value, b.get(key), key, a, b, stack, areValuesEqual)) {
                  return false;
                }
              }
              return true;
            }
            case tags.setTag: {
              if (a.size !== b.size) {
                return false;
              }
              const aValues = Array.from(a.values());
              const bValues = Array.from(b.values());
              for (let i = 0; i < aValues.length; i++) {
                const aValue = aValues[i];
                const index = bValues.findIndex((bValue) => {
                  return isEqualWithImpl(aValue, bValue, void 0, a, b, stack, areValuesEqual);
                });
                if (index === -1) {
                  return false;
                }
                bValues.splice(index, 1);
              }
              return true;
            }
            case tags.arrayTag:
            case tags.uint8ArrayTag:
            case tags.uint8ClampedArrayTag:
            case tags.uint16ArrayTag:
            case tags.uint32ArrayTag:
            case tags.bigUint64ArrayTag:
            case tags.int8ArrayTag:
            case tags.int16ArrayTag:
            case tags.int32ArrayTag:
            case tags.bigInt64ArrayTag:
            case tags.float32ArrayTag:
            case tags.float64ArrayTag: {
              if (typeof Buffer !== "undefined" && Buffer.isBuffer(a) !== Buffer.isBuffer(b)) {
                return false;
              }
              if (a.length !== b.length) {
                return false;
              }
              for (let i = 0; i < a.length; i++) {
                if (!isEqualWithImpl(a[i], b[i], i, a, b, stack, areValuesEqual)) {
                  return false;
                }
              }
              return true;
            }
            case tags.arrayBufferTag: {
              if (a.byteLength !== b.byteLength) {
                return false;
              }
              return areObjectsEqual(new Uint8Array(a), new Uint8Array(b), stack, areValuesEqual);
            }
            case tags.dataViewTag: {
              if (a.byteLength !== b.byteLength || a.byteOffset !== b.byteOffset) {
                return false;
              }
              return areObjectsEqual(new Uint8Array(a), new Uint8Array(b), stack, areValuesEqual);
            }
            case tags.errorTag: {
              return a.name === b.name && a.message === b.message;
            }
            case tags.objectTag: {
              const areEqualInstances = areObjectsEqual(a.constructor, b.constructor, stack, areValuesEqual) || isPlainObject3.isPlainObject(a) && isPlainObject3.isPlainObject(b);
              if (!areEqualInstances) {
                return false;
              }
              const aKeys = [...Object.keys(a), ...getSymbols.getSymbols(a)];
              const bKeys = [...Object.keys(b), ...getSymbols.getSymbols(b)];
              if (aKeys.length !== bKeys.length) {
                return false;
              }
              for (let i = 0; i < aKeys.length; i++) {
                const propKey = aKeys[i];
                const aProp = a[propKey];
                if (!Object.hasOwn(b, propKey)) {
                  return false;
                }
                const bProp = b[propKey];
                if (!isEqualWithImpl(aProp, bProp, propKey, a, b, stack, areValuesEqual)) {
                  return false;
                }
              }
              return true;
            }
            default: {
              return false;
            }
          }
        } finally {
          stack.delete(a);
          stack.delete(b);
        }
      }
      exports.isEqualWith = isEqualWith;
    }
  });

  // client/node_modules/es-toolkit/dist/function/noop.js
  var require_noop = __commonJS({
    "client/node_modules/es-toolkit/dist/function/noop.js"(exports) {
      "use strict";
      init_define_import_meta_env();
      Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
      function noop6() {
      }
      exports.noop = noop6;
    }
  });

  // client/node_modules/es-toolkit/dist/predicate/isEqual.js
  var require_isEqual = __commonJS({
    "client/node_modules/es-toolkit/dist/predicate/isEqual.js"(exports) {
      "use strict";
      init_define_import_meta_env();
      Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
      var isEqualWith = require_isEqualWith();
      var noop6 = require_noop();
      function isEqual2(a, b) {
        return isEqualWith.isEqualWith(a, b, noop6.noop);
      }
      exports.isEqual = isEqual2;
    }
  });

  // client/node_modules/es-toolkit/compat/isEqual.js
  var require_isEqual2 = __commonJS({
    "client/node_modules/es-toolkit/compat/isEqual.js"(exports, module) {
      init_define_import_meta_env();
      module.exports = require_isEqual().isEqual;
    }
  });

  // client/node_modules/es-toolkit/dist/compat/util/toNumber.js
  var require_toNumber = __commonJS({
    "client/node_modules/es-toolkit/dist/compat/util/toNumber.js"(exports) {
      "use strict";
      init_define_import_meta_env();
      Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
      var isSymbol = require_isSymbol();
      function toNumber(value) {
        if (isSymbol.isSymbol(value)) {
          return NaN;
        }
        return Number(value);
      }
      exports.toNumber = toNumber;
    }
  });

  // client/node_modules/es-toolkit/dist/compat/util/toFinite.js
  var require_toFinite = __commonJS({
    "client/node_modules/es-toolkit/dist/compat/util/toFinite.js"(exports) {
      "use strict";
      init_define_import_meta_env();
      Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
      var toNumber = require_toNumber();
      function toFinite(value) {
        if (!value) {
          return value === 0 ? value : 0;
        }
        value = toNumber.toNumber(value);
        if (value === Infinity || value === -Infinity) {
          const sign2 = value < 0 ? -1 : 1;
          return sign2 * Number.MAX_VALUE;
        }
        return value === value ? value : 0;
      }
      exports.toFinite = toFinite;
    }
  });

  // client/node_modules/es-toolkit/dist/compat/math/range.js
  var require_range = __commonJS({
    "client/node_modules/es-toolkit/dist/compat/math/range.js"(exports) {
      "use strict";
      init_define_import_meta_env();
      Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
      var isIterateeCall = require_isIterateeCall();
      var toFinite = require_toFinite();
      function range4(start, end, step) {
        if (step && typeof step !== "number" && isIterateeCall.isIterateeCall(start, end, step)) {
          end = step = void 0;
        }
        start = toFinite.toFinite(start);
        if (end === void 0) {
          end = start;
          start = 0;
        } else {
          end = toFinite.toFinite(end);
        }
        step = step === void 0 ? start < end ? 1 : -1 : toFinite.toFinite(step);
        const length = Math.max(Math.ceil((end - start) / (step || 1)), 0);
        const result = new Array(length);
        for (let index = 0; index < length; index++) {
          result[index] = start;
          start += step;
        }
        return result;
      }
      exports.range = range4;
    }
  });

  // client/node_modules/es-toolkit/compat/range.js
  var require_range2 = __commonJS({
    "client/node_modules/es-toolkit/compat/range.js"(exports, module) {
      init_define_import_meta_env();
      module.exports = require_range().range;
    }
  });

  // client/node_modules/decimal.js-light/decimal.js
  var require_decimal = __commonJS({
    "client/node_modules/decimal.js-light/decimal.js"(exports, module) {
      init_define_import_meta_env();
      (function(globalScope) {
        "use strict";
        var MAX_DIGITS = 1e9, Decimal3 = {
          // These values must be integers within the stated ranges (inclusive).
          // Most of these values can be changed during run-time using `Decimal.config`.
          // The maximum number of significant digits of the result of a calculation or base conversion.
          // E.g. `Decimal.config({ precision: 20 });`
          precision: 20,
          // 1 to MAX_DIGITS
          // The rounding mode used by default by `toInteger`, `toDecimalPlaces`, `toExponential`,
          // `toFixed`, `toPrecision` and `toSignificantDigits`.
          //
          // ROUND_UP         0 Away from zero.
          // ROUND_DOWN       1 Towards zero.
          // ROUND_CEIL       2 Towards +Infinity.
          // ROUND_FLOOR      3 Towards -Infinity.
          // ROUND_HALF_UP    4 Towards nearest neighbour. If equidistant, up.
          // ROUND_HALF_DOWN  5 Towards nearest neighbour. If equidistant, down.
          // ROUND_HALF_EVEN  6 Towards nearest neighbour. If equidistant, towards even neighbour.
          // ROUND_HALF_CEIL  7 Towards nearest neighbour. If equidistant, towards +Infinity.
          // ROUND_HALF_FLOOR 8 Towards nearest neighbour. If equidistant, towards -Infinity.
          //
          // E.g.
          // `Decimal.rounding = 4;`
          // `Decimal.rounding = Decimal.ROUND_HALF_UP;`
          rounding: 4,
          // 0 to 8
          // The exponent value at and beneath which `toString` returns exponential notation.
          // JavaScript numbers: -7
          toExpNeg: -7,
          // 0 to -MAX_E
          // The exponent value at and above which `toString` returns exponential notation.
          // JavaScript numbers: 21
          toExpPos: 21,
          // 0 to MAX_E
          // The natural logarithm of 10.
          // 115 digits
          LN10: "2.302585092994045684017991454684364207601101488628772976033327900967572609677352480235997205089598298341967784042286"
        }, external = true, decimalError = "[DecimalError] ", invalidArgument = decimalError + "Invalid argument: ", exponentOutOfRange = decimalError + "Exponent out of range: ", mathfloor = Math.floor, mathpow = Math.pow, isDecimal = /^(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i, ONE, BASE = 1e7, LOG_BASE = 7, MAX_SAFE_INTEGER = 9007199254740991, MAX_E = mathfloor(MAX_SAFE_INTEGER / LOG_BASE), P = {};
        P.absoluteValue = P.abs = function() {
          var x2 = new this.constructor(this);
          if (x2.s) x2.s = 1;
          return x2;
        };
        P.comparedTo = P.cmp = function(y2) {
          var i, j, xdL, ydL, x2 = this;
          y2 = new x2.constructor(y2);
          if (x2.s !== y2.s) return x2.s || -y2.s;
          if (x2.e !== y2.e) return x2.e > y2.e ^ x2.s < 0 ? 1 : -1;
          xdL = x2.d.length;
          ydL = y2.d.length;
          for (i = 0, j = xdL < ydL ? xdL : ydL; i < j; ++i) {
            if (x2.d[i] !== y2.d[i]) return x2.d[i] > y2.d[i] ^ x2.s < 0 ? 1 : -1;
          }
          return xdL === ydL ? 0 : xdL > ydL ^ x2.s < 0 ? 1 : -1;
        };
        P.decimalPlaces = P.dp = function() {
          var x2 = this, w = x2.d.length - 1, dp = (w - x2.e) * LOG_BASE;
          w = x2.d[w];
          if (w) for (; w % 10 == 0; w /= 10) dp--;
          return dp < 0 ? 0 : dp;
        };
        P.dividedBy = P.div = function(y2) {
          return divide(this, new this.constructor(y2));
        };
        P.dividedToIntegerBy = P.idiv = function(y2) {
          var x2 = this, Ctor = x2.constructor;
          return round(divide(x2, new Ctor(y2), 0, 1), Ctor.precision);
        };
        P.equals = P.eq = function(y2) {
          return !this.cmp(y2);
        };
        P.exponent = function() {
          return getBase10Exponent(this);
        };
        P.greaterThan = P.gt = function(y2) {
          return this.cmp(y2) > 0;
        };
        P.greaterThanOrEqualTo = P.gte = function(y2) {
          return this.cmp(y2) >= 0;
        };
        P.isInteger = P.isint = function() {
          return this.e > this.d.length - 2;
        };
        P.isNegative = P.isneg = function() {
          return this.s < 0;
        };
        P.isPositive = P.ispos = function() {
          return this.s > 0;
        };
        P.isZero = function() {
          return this.s === 0;
        };
        P.lessThan = P.lt = function(y2) {
          return this.cmp(y2) < 0;
        };
        P.lessThanOrEqualTo = P.lte = function(y2) {
          return this.cmp(y2) < 1;
        };
        P.logarithm = P.log = function(base) {
          var r2, x2 = this, Ctor = x2.constructor, pr = Ctor.precision, wpr = pr + 5;
          if (base === void 0) {
            base = new Ctor(10);
          } else {
            base = new Ctor(base);
            if (base.s < 1 || base.eq(ONE)) throw Error(decimalError + "NaN");
          }
          if (x2.s < 1) throw Error(decimalError + (x2.s ? "NaN" : "-Infinity"));
          if (x2.eq(ONE)) return new Ctor(0);
          external = false;
          r2 = divide(ln(x2, wpr), ln(base, wpr), wpr);
          external = true;
          return round(r2, pr);
        };
        P.minus = P.sub = function(y2) {
          var x2 = this;
          y2 = new x2.constructor(y2);
          return x2.s == y2.s ? subtract(x2, y2) : add(x2, (y2.s = -y2.s, y2));
        };
        P.modulo = P.mod = function(y2) {
          var q, x2 = this, Ctor = x2.constructor, pr = Ctor.precision;
          y2 = new Ctor(y2);
          if (!y2.s) throw Error(decimalError + "NaN");
          if (!x2.s) return round(new Ctor(x2), pr);
          external = false;
          q = divide(x2, y2, 0, 1).times(y2);
          external = true;
          return x2.minus(q);
        };
        P.naturalExponential = P.exp = function() {
          return exp(this);
        };
        P.naturalLogarithm = P.ln = function() {
          return ln(this);
        };
        P.negated = P.neg = function() {
          var x2 = new this.constructor(this);
          x2.s = -x2.s || 0;
          return x2;
        };
        P.plus = P.add = function(y2) {
          var x2 = this;
          y2 = new x2.constructor(y2);
          return x2.s == y2.s ? add(x2, y2) : subtract(x2, (y2.s = -y2.s, y2));
        };
        P.precision = P.sd = function(z) {
          var e, sd, w, x2 = this;
          if (z !== void 0 && z !== !!z && z !== 1 && z !== 0) throw Error(invalidArgument + z);
          e = getBase10Exponent(x2) + 1;
          w = x2.d.length - 1;
          sd = w * LOG_BASE + 1;
          w = x2.d[w];
          if (w) {
            for (; w % 10 == 0; w /= 10) sd--;
            for (w = x2.d[0]; w >= 10; w /= 10) sd++;
          }
          return z && e > sd ? e : sd;
        };
        P.squareRoot = P.sqrt = function() {
          var e, n, pr, r2, s, t, wpr, x2 = this, Ctor = x2.constructor;
          if (x2.s < 1) {
            if (!x2.s) return new Ctor(0);
            throw Error(decimalError + "NaN");
          }
          e = getBase10Exponent(x2);
          external = false;
          s = Math.sqrt(+x2);
          if (s == 0 || s == 1 / 0) {
            n = digitsToString(x2.d);
            if ((n.length + e) % 2 == 0) n += "0";
            s = Math.sqrt(n);
            e = mathfloor((e + 1) / 2) - (e < 0 || e % 2);
            if (s == 1 / 0) {
              n = "5e" + e;
            } else {
              n = s.toExponential();
              n = n.slice(0, n.indexOf("e") + 1) + e;
            }
            r2 = new Ctor(n);
          } else {
            r2 = new Ctor(s.toString());
          }
          pr = Ctor.precision;
          s = wpr = pr + 3;
          for (; ; ) {
            t = r2;
            r2 = t.plus(divide(x2, t, wpr + 2)).times(0.5);
            if (digitsToString(t.d).slice(0, wpr) === (n = digitsToString(r2.d)).slice(0, wpr)) {
              n = n.slice(wpr - 3, wpr + 1);
              if (s == wpr && n == "4999") {
                round(t, pr + 1, 0);
                if (t.times(t).eq(x2)) {
                  r2 = t;
                  break;
                }
              } else if (n != "9999") {
                break;
              }
              wpr += 4;
            }
          }
          external = true;
          return round(r2, pr);
        };
        P.times = P.mul = function(y2) {
          var carry, e, i, k, r2, rL, t, xdL, ydL, x2 = this, Ctor = x2.constructor, xd = x2.d, yd = (y2 = new Ctor(y2)).d;
          if (!x2.s || !y2.s) return new Ctor(0);
          y2.s *= x2.s;
          e = x2.e + y2.e;
          xdL = xd.length;
          ydL = yd.length;
          if (xdL < ydL) {
            r2 = xd;
            xd = yd;
            yd = r2;
            rL = xdL;
            xdL = ydL;
            ydL = rL;
          }
          r2 = [];
          rL = xdL + ydL;
          for (i = rL; i--; ) r2.push(0);
          for (i = ydL; --i >= 0; ) {
            carry = 0;
            for (k = xdL + i; k > i; ) {
              t = r2[k] + yd[i] * xd[k - i - 1] + carry;
              r2[k--] = t % BASE | 0;
              carry = t / BASE | 0;
            }
            r2[k] = (r2[k] + carry) % BASE | 0;
          }
          for (; !r2[--rL]; ) r2.pop();
          if (carry) ++e;
          else r2.shift();
          y2.d = r2;
          y2.e = e;
          return external ? round(y2, Ctor.precision) : y2;
        };
        P.toDecimalPlaces = P.todp = function(dp, rm) {
          var x2 = this, Ctor = x2.constructor;
          x2 = new Ctor(x2);
          if (dp === void 0) return x2;
          checkInt32(dp, 0, MAX_DIGITS);
          if (rm === void 0) rm = Ctor.rounding;
          else checkInt32(rm, 0, 8);
          return round(x2, dp + getBase10Exponent(x2) + 1, rm);
        };
        P.toExponential = function(dp, rm) {
          var str, x2 = this, Ctor = x2.constructor;
          if (dp === void 0) {
            str = toString(x2, true);
          } else {
            checkInt32(dp, 0, MAX_DIGITS);
            if (rm === void 0) rm = Ctor.rounding;
            else checkInt32(rm, 0, 8);
            x2 = round(new Ctor(x2), dp + 1, rm);
            str = toString(x2, true, dp + 1);
          }
          return str;
        };
        P.toFixed = function(dp, rm) {
          var str, y2, x2 = this, Ctor = x2.constructor;
          if (dp === void 0) return toString(x2);
          checkInt32(dp, 0, MAX_DIGITS);
          if (rm === void 0) rm = Ctor.rounding;
          else checkInt32(rm, 0, 8);
          y2 = round(new Ctor(x2), dp + getBase10Exponent(x2) + 1, rm);
          str = toString(y2.abs(), false, dp + getBase10Exponent(y2) + 1);
          return x2.isneg() && !x2.isZero() ? "-" + str : str;
        };
        P.toInteger = P.toint = function() {
          var x2 = this, Ctor = x2.constructor;
          return round(new Ctor(x2), getBase10Exponent(x2) + 1, Ctor.rounding);
        };
        P.toNumber = function() {
          return +this;
        };
        P.toPower = P.pow = function(y2) {
          var e, k, pr, r2, sign2, yIsInt, x2 = this, Ctor = x2.constructor, guard = 12, yn = +(y2 = new Ctor(y2));
          if (!y2.s) return new Ctor(ONE);
          x2 = new Ctor(x2);
          if (!x2.s) {
            if (y2.s < 1) throw Error(decimalError + "Infinity");
            return x2;
          }
          if (x2.eq(ONE)) return x2;
          pr = Ctor.precision;
          if (y2.eq(ONE)) return round(x2, pr);
          e = y2.e;
          k = y2.d.length - 1;
          yIsInt = e >= k;
          sign2 = x2.s;
          if (!yIsInt) {
            if (sign2 < 0) throw Error(decimalError + "NaN");
          } else if ((k = yn < 0 ? -yn : yn) <= MAX_SAFE_INTEGER) {
            r2 = new Ctor(ONE);
            e = Math.ceil(pr / LOG_BASE + 4);
            external = false;
            for (; ; ) {
              if (k % 2) {
                r2 = r2.times(x2);
                truncate(r2.d, e);
              }
              k = mathfloor(k / 2);
              if (k === 0) break;
              x2 = x2.times(x2);
              truncate(x2.d, e);
            }
            external = true;
            return y2.s < 0 ? new Ctor(ONE).div(r2) : round(r2, pr);
          }
          sign2 = sign2 < 0 && y2.d[Math.max(e, k)] & 1 ? -1 : 1;
          x2.s = 1;
          external = false;
          r2 = y2.times(ln(x2, pr + guard));
          external = true;
          r2 = exp(r2);
          r2.s = sign2;
          return r2;
        };
        P.toPrecision = function(sd, rm) {
          var e, str, x2 = this, Ctor = x2.constructor;
          if (sd === void 0) {
            e = getBase10Exponent(x2);
            str = toString(x2, e <= Ctor.toExpNeg || e >= Ctor.toExpPos);
          } else {
            checkInt32(sd, 1, MAX_DIGITS);
            if (rm === void 0) rm = Ctor.rounding;
            else checkInt32(rm, 0, 8);
            x2 = round(new Ctor(x2), sd, rm);
            e = getBase10Exponent(x2);
            str = toString(x2, sd <= e || e <= Ctor.toExpNeg, sd);
          }
          return str;
        };
        P.toSignificantDigits = P.tosd = function(sd, rm) {
          var x2 = this, Ctor = x2.constructor;
          if (sd === void 0) {
            sd = Ctor.precision;
            rm = Ctor.rounding;
          } else {
            checkInt32(sd, 1, MAX_DIGITS);
            if (rm === void 0) rm = Ctor.rounding;
            else checkInt32(rm, 0, 8);
          }
          return round(new Ctor(x2), sd, rm);
        };
        P.toString = P.valueOf = P.val = P.toJSON = function() {
          var x2 = this, e = getBase10Exponent(x2), Ctor = x2.constructor;
          return toString(x2, e <= Ctor.toExpNeg || e >= Ctor.toExpPos);
        };
        function add(x2, y2) {
          var carry, d, e, i, k, len, xd, yd, Ctor = x2.constructor, pr = Ctor.precision;
          if (!x2.s || !y2.s) {
            if (!y2.s) y2 = new Ctor(x2);
            return external ? round(y2, pr) : y2;
          }
          xd = x2.d;
          yd = y2.d;
          k = x2.e;
          e = y2.e;
          xd = xd.slice();
          i = k - e;
          if (i) {
            if (i < 0) {
              d = xd;
              i = -i;
              len = yd.length;
            } else {
              d = yd;
              e = k;
              len = xd.length;
            }
            k = Math.ceil(pr / LOG_BASE);
            len = k > len ? k + 1 : len + 1;
            if (i > len) {
              i = len;
              d.length = 1;
            }
            d.reverse();
            for (; i--; ) d.push(0);
            d.reverse();
          }
          len = xd.length;
          i = yd.length;
          if (len - i < 0) {
            i = len;
            d = yd;
            yd = xd;
            xd = d;
          }
          for (carry = 0; i; ) {
            carry = (xd[--i] = xd[i] + yd[i] + carry) / BASE | 0;
            xd[i] %= BASE;
          }
          if (carry) {
            xd.unshift(carry);
            ++e;
          }
          for (len = xd.length; xd[--len] == 0; ) xd.pop();
          y2.d = xd;
          y2.e = e;
          return external ? round(y2, pr) : y2;
        }
        function checkInt32(i, min2, max2) {
          if (i !== ~~i || i < min2 || i > max2) {
            throw Error(invalidArgument + i);
          }
        }
        function digitsToString(d) {
          var i, k, ws, indexOfLastWord = d.length - 1, str = "", w = d[0];
          if (indexOfLastWord > 0) {
            str += w;
            for (i = 1; i < indexOfLastWord; i++) {
              ws = d[i] + "";
              k = LOG_BASE - ws.length;
              if (k) str += getZeroString(k);
              str += ws;
            }
            w = d[i];
            ws = w + "";
            k = LOG_BASE - ws.length;
            if (k) str += getZeroString(k);
          } else if (w === 0) {
            return "0";
          }
          for (; w % 10 === 0; ) w /= 10;
          return str + w;
        }
        var divide = /* @__PURE__ */ (function() {
          function multiplyInteger(x2, k) {
            var temp, carry = 0, i = x2.length;
            for (x2 = x2.slice(); i--; ) {
              temp = x2[i] * k + carry;
              x2[i] = temp % BASE | 0;
              carry = temp / BASE | 0;
            }
            if (carry) x2.unshift(carry);
            return x2;
          }
          function compare(a, b, aL, bL) {
            var i, r2;
            if (aL != bL) {
              r2 = aL > bL ? 1 : -1;
            } else {
              for (i = r2 = 0; i < aL; i++) {
                if (a[i] != b[i]) {
                  r2 = a[i] > b[i] ? 1 : -1;
                  break;
                }
              }
            }
            return r2;
          }
          function subtract2(a, b, aL) {
            var i = 0;
            for (; aL--; ) {
              a[aL] -= i;
              i = a[aL] < b[aL] ? 1 : 0;
              a[aL] = i * BASE + a[aL] - b[aL];
            }
            for (; !a[0] && a.length > 1; ) a.shift();
          }
          return function(x2, y2, pr, dp) {
            var cmp, e, i, k, prod, prodL, q, qd, rem, remL, rem0, sd, t, xi, xL, yd0, yL, yz, Ctor = x2.constructor, sign2 = x2.s == y2.s ? 1 : -1, xd = x2.d, yd = y2.d;
            if (!x2.s) return new Ctor(x2);
            if (!y2.s) throw Error(decimalError + "Division by zero");
            e = x2.e - y2.e;
            yL = yd.length;
            xL = xd.length;
            q = new Ctor(sign2);
            qd = q.d = [];
            for (i = 0; yd[i] == (xd[i] || 0); ) ++i;
            if (yd[i] > (xd[i] || 0)) --e;
            if (pr == null) {
              sd = pr = Ctor.precision;
            } else if (dp) {
              sd = pr + (getBase10Exponent(x2) - getBase10Exponent(y2)) + 1;
            } else {
              sd = pr;
            }
            if (sd < 0) return new Ctor(0);
            sd = sd / LOG_BASE + 2 | 0;
            i = 0;
            if (yL == 1) {
              k = 0;
              yd = yd[0];
              sd++;
              for (; (i < xL || k) && sd--; i++) {
                t = k * BASE + (xd[i] || 0);
                qd[i] = t / yd | 0;
                k = t % yd | 0;
              }
            } else {
              k = BASE / (yd[0] + 1) | 0;
              if (k > 1) {
                yd = multiplyInteger(yd, k);
                xd = multiplyInteger(xd, k);
                yL = yd.length;
                xL = xd.length;
              }
              xi = yL;
              rem = xd.slice(0, yL);
              remL = rem.length;
              for (; remL < yL; ) rem[remL++] = 0;
              yz = yd.slice();
              yz.unshift(0);
              yd0 = yd[0];
              if (yd[1] >= BASE / 2) ++yd0;
              do {
                k = 0;
                cmp = compare(yd, rem, yL, remL);
                if (cmp < 0) {
                  rem0 = rem[0];
                  if (yL != remL) rem0 = rem0 * BASE + (rem[1] || 0);
                  k = rem0 / yd0 | 0;
                  if (k > 1) {
                    if (k >= BASE) k = BASE - 1;
                    prod = multiplyInteger(yd, k);
                    prodL = prod.length;
                    remL = rem.length;
                    cmp = compare(prod, rem, prodL, remL);
                    if (cmp == 1) {
                      k--;
                      subtract2(prod, yL < prodL ? yz : yd, prodL);
                    }
                  } else {
                    if (k == 0) cmp = k = 1;
                    prod = yd.slice();
                  }
                  prodL = prod.length;
                  if (prodL < remL) prod.unshift(0);
                  subtract2(rem, prod, remL);
                  if (cmp == -1) {
                    remL = rem.length;
                    cmp = compare(yd, rem, yL, remL);
                    if (cmp < 1) {
                      k++;
                      subtract2(rem, yL < remL ? yz : yd, remL);
                    }
                  }
                  remL = rem.length;
                } else if (cmp === 0) {
                  k++;
                  rem = [0];
                }
                qd[i++] = k;
                if (cmp && rem[0]) {
                  rem[remL++] = xd[xi] || 0;
                } else {
                  rem = [xd[xi]];
                  remL = 1;
                }
              } while ((xi++ < xL || rem[0] !== void 0) && sd--);
            }
            if (!qd[0]) qd.shift();
            q.e = e;
            return round(q, dp ? pr + getBase10Exponent(q) + 1 : pr);
          };
        })();
        function exp(x2, sd) {
          var denominator, guard, pow2, sum, t, wpr, i = 0, k = 0, Ctor = x2.constructor, pr = Ctor.precision;
          if (getBase10Exponent(x2) > 16) throw Error(exponentOutOfRange + getBase10Exponent(x2));
          if (!x2.s) return new Ctor(ONE);
          if (sd == null) {
            external = false;
            wpr = pr;
          } else {
            wpr = sd;
          }
          t = new Ctor(0.03125);
          while (x2.abs().gte(0.1)) {
            x2 = x2.times(t);
            k += 5;
          }
          guard = Math.log(mathpow(2, k)) / Math.LN10 * 2 + 5 | 0;
          wpr += guard;
          denominator = pow2 = sum = new Ctor(ONE);
          Ctor.precision = wpr;
          for (; ; ) {
            pow2 = round(pow2.times(x2), wpr);
            denominator = denominator.times(++i);
            t = sum.plus(divide(pow2, denominator, wpr));
            if (digitsToString(t.d).slice(0, wpr) === digitsToString(sum.d).slice(0, wpr)) {
              while (k--) sum = round(sum.times(sum), wpr);
              Ctor.precision = pr;
              return sd == null ? (external = true, round(sum, pr)) : sum;
            }
            sum = t;
          }
        }
        function getBase10Exponent(x2) {
          var e = x2.e * LOG_BASE, w = x2.d[0];
          for (; w >= 10; w /= 10) e++;
          return e;
        }
        function getLn10(Ctor, sd, pr) {
          if (sd > Ctor.LN10.sd()) {
            external = true;
            if (pr) Ctor.precision = pr;
            throw Error(decimalError + "LN10 precision limit exceeded");
          }
          return round(new Ctor(Ctor.LN10), sd);
        }
        function getZeroString(k) {
          var zs = "";
          for (; k--; ) zs += "0";
          return zs;
        }
        function ln(y2, sd) {
          var c, c0, denominator, e, numerator, sum, t, wpr, x2, n = 1, guard = 10, x3 = y2, xd = x3.d, Ctor = x3.constructor, pr = Ctor.precision;
          if (x3.s < 1) throw Error(decimalError + (x3.s ? "NaN" : "-Infinity"));
          if (x3.eq(ONE)) return new Ctor(0);
          if (sd == null) {
            external = false;
            wpr = pr;
          } else {
            wpr = sd;
          }
          if (x3.eq(10)) {
            if (sd == null) external = true;
            return getLn10(Ctor, wpr);
          }
          wpr += guard;
          Ctor.precision = wpr;
          c = digitsToString(xd);
          c0 = c.charAt(0);
          e = getBase10Exponent(x3);
          if (Math.abs(e) < 15e14) {
            while (c0 < 7 && c0 != 1 || c0 == 1 && c.charAt(1) > 3) {
              x3 = x3.times(y2);
              c = digitsToString(x3.d);
              c0 = c.charAt(0);
              n++;
            }
            e = getBase10Exponent(x3);
            if (c0 > 1) {
              x3 = new Ctor("0." + c);
              e++;
            } else {
              x3 = new Ctor(c0 + "." + c.slice(1));
            }
          } else {
            t = getLn10(Ctor, wpr + 2, pr).times(e + "");
            x3 = ln(new Ctor(c0 + "." + c.slice(1)), wpr - guard).plus(t);
            Ctor.precision = pr;
            return sd == null ? (external = true, round(x3, pr)) : x3;
          }
          sum = numerator = x3 = divide(x3.minus(ONE), x3.plus(ONE), wpr);
          x2 = round(x3.times(x3), wpr);
          denominator = 3;
          for (; ; ) {
            numerator = round(numerator.times(x2), wpr);
            t = sum.plus(divide(numerator, new Ctor(denominator), wpr));
            if (digitsToString(t.d).slice(0, wpr) === digitsToString(sum.d).slice(0, wpr)) {
              sum = sum.times(2);
              if (e !== 0) sum = sum.plus(getLn10(Ctor, wpr + 2, pr).times(e + ""));
              sum = divide(sum, new Ctor(n), wpr);
              Ctor.precision = pr;
              return sd == null ? (external = true, round(sum, pr)) : sum;
            }
            sum = t;
            denominator += 2;
          }
        }
        function parseDecimal(x2, str) {
          var e, i, len;
          if ((e = str.indexOf(".")) > -1) str = str.replace(".", "");
          if ((i = str.search(/e/i)) > 0) {
            if (e < 0) e = i;
            e += +str.slice(i + 1);
            str = str.substring(0, i);
          } else if (e < 0) {
            e = str.length;
          }
          for (i = 0; str.charCodeAt(i) === 48; ) ++i;
          for (len = str.length; str.charCodeAt(len - 1) === 48; ) --len;
          str = str.slice(i, len);
          if (str) {
            len -= i;
            e = e - i - 1;
            x2.e = mathfloor(e / LOG_BASE);
            x2.d = [];
            i = (e + 1) % LOG_BASE;
            if (e < 0) i += LOG_BASE;
            if (i < len) {
              if (i) x2.d.push(+str.slice(0, i));
              for (len -= LOG_BASE; i < len; ) x2.d.push(+str.slice(i, i += LOG_BASE));
              str = str.slice(i);
              i = LOG_BASE - str.length;
            } else {
              i -= len;
            }
            for (; i--; ) str += "0";
            x2.d.push(+str);
            if (external && (x2.e > MAX_E || x2.e < -MAX_E)) throw Error(exponentOutOfRange + e);
          } else {
            x2.s = 0;
            x2.e = 0;
            x2.d = [0];
          }
          return x2;
        }
        function round(x2, sd, rm) {
          var i, j, k, n, rd, doRound, w, xdi, xd = x2.d;
          for (n = 1, k = xd[0]; k >= 10; k /= 10) n++;
          i = sd - n;
          if (i < 0) {
            i += LOG_BASE;
            j = sd;
            w = xd[xdi = 0];
          } else {
            xdi = Math.ceil((i + 1) / LOG_BASE);
            k = xd.length;
            if (xdi >= k) return x2;
            w = k = xd[xdi];
            for (n = 1; k >= 10; k /= 10) n++;
            i %= LOG_BASE;
            j = i - LOG_BASE + n;
          }
          if (rm !== void 0) {
            k = mathpow(10, n - j - 1);
            rd = w / k % 10 | 0;
            doRound = sd < 0 || xd[xdi + 1] !== void 0 || w % k;
            doRound = rm < 4 ? (rd || doRound) && (rm == 0 || rm == (x2.s < 0 ? 3 : 2)) : rd > 5 || rd == 5 && (rm == 4 || doRound || rm == 6 && // Check whether the digit to the left of the rounding digit is odd.
            (i > 0 ? j > 0 ? w / mathpow(10, n - j) : 0 : xd[xdi - 1]) % 10 & 1 || rm == (x2.s < 0 ? 8 : 7));
          }
          if (sd < 1 || !xd[0]) {
            if (doRound) {
              k = getBase10Exponent(x2);
              xd.length = 1;
              sd = sd - k - 1;
              xd[0] = mathpow(10, (LOG_BASE - sd % LOG_BASE) % LOG_BASE);
              x2.e = mathfloor(-sd / LOG_BASE) || 0;
            } else {
              xd.length = 1;
              xd[0] = x2.e = x2.s = 0;
            }
            return x2;
          }
          if (i == 0) {
            xd.length = xdi;
            k = 1;
            xdi--;
          } else {
            xd.length = xdi + 1;
            k = mathpow(10, LOG_BASE - i);
            xd[xdi] = j > 0 ? (w / mathpow(10, n - j) % mathpow(10, j) | 0) * k : 0;
          }
          if (doRound) {
            for (; ; ) {
              if (xdi == 0) {
                if ((xd[0] += k) == BASE) {
                  xd[0] = 1;
                  ++x2.e;
                }
                break;
              } else {
                xd[xdi] += k;
                if (xd[xdi] != BASE) break;
                xd[xdi--] = 0;
                k = 1;
              }
            }
          }
          for (i = xd.length; xd[--i] === 0; ) xd.pop();
          if (external && (x2.e > MAX_E || x2.e < -MAX_E)) {
            throw Error(exponentOutOfRange + getBase10Exponent(x2));
          }
          return x2;
        }
        function subtract(x2, y2) {
          var d, e, i, j, k, len, xd, xe, xLTy, yd, Ctor = x2.constructor, pr = Ctor.precision;
          if (!x2.s || !y2.s) {
            if (y2.s) y2.s = -y2.s;
            else y2 = new Ctor(x2);
            return external ? round(y2, pr) : y2;
          }
          xd = x2.d;
          yd = y2.d;
          e = y2.e;
          xe = x2.e;
          xd = xd.slice();
          k = xe - e;
          if (k) {
            xLTy = k < 0;
            if (xLTy) {
              d = xd;
              k = -k;
              len = yd.length;
            } else {
              d = yd;
              e = xe;
              len = xd.length;
            }
            i = Math.max(Math.ceil(pr / LOG_BASE), len) + 2;
            if (k > i) {
              k = i;
              d.length = 1;
            }
            d.reverse();
            for (i = k; i--; ) d.push(0);
            d.reverse();
          } else {
            i = xd.length;
            len = yd.length;
            xLTy = i < len;
            if (xLTy) len = i;
            for (i = 0; i < len; i++) {
              if (xd[i] != yd[i]) {
                xLTy = xd[i] < yd[i];
                break;
              }
            }
            k = 0;
          }
          if (xLTy) {
            d = xd;
            xd = yd;
            yd = d;
            y2.s = -y2.s;
          }
          len = xd.length;
          for (i = yd.length - len; i > 0; --i) xd[len++] = 0;
          for (i = yd.length; i > k; ) {
            if (xd[--i] < yd[i]) {
              for (j = i; j && xd[--j] === 0; ) xd[j] = BASE - 1;
              --xd[j];
              xd[i] += BASE;
            }
            xd[i] -= yd[i];
          }
          for (; xd[--len] === 0; ) xd.pop();
          for (; xd[0] === 0; xd.shift()) --e;
          if (!xd[0]) return new Ctor(0);
          y2.d = xd;
          y2.e = e;
          return external ? round(y2, pr) : y2;
        }
        function toString(x2, isExp, sd) {
          var k, e = getBase10Exponent(x2), str = digitsToString(x2.d), len = str.length;
          if (isExp) {
            if (sd && (k = sd - len) > 0) {
              str = str.charAt(0) + "." + str.slice(1) + getZeroString(k);
            } else if (len > 1) {
              str = str.charAt(0) + "." + str.slice(1);
            }
            str = str + (e < 0 ? "e" : "e+") + e;
          } else if (e < 0) {
            str = "0." + getZeroString(-e - 1) + str;
            if (sd && (k = sd - len) > 0) str += getZeroString(k);
          } else if (e >= len) {
            str += getZeroString(e + 1 - len);
            if (sd && (k = sd - e - 1) > 0) str = str + "." + getZeroString(k);
          } else {
            if ((k = e + 1) < len) str = str.slice(0, k) + "." + str.slice(k);
            if (sd && (k = sd - len) > 0) {
              if (e + 1 === len) str += ".";
              str += getZeroString(k);
            }
          }
          return x2.s < 0 ? "-" + str : str;
        }
        function truncate(arr, len) {
          if (arr.length > len) {
            arr.length = len;
            return true;
          }
        }
        function clone(obj) {
          var i, p, ps;
          function Decimal4(value) {
            var x2 = this;
            if (!(x2 instanceof Decimal4)) return new Decimal4(value);
            x2.constructor = Decimal4;
            if (value instanceof Decimal4) {
              x2.s = value.s;
              x2.e = value.e;
              x2.d = (value = value.d) ? value.slice() : value;
              return;
            }
            if (typeof value === "number") {
              if (value * 0 !== 0) {
                throw Error(invalidArgument + value);
              }
              if (value > 0) {
                x2.s = 1;
              } else if (value < 0) {
                value = -value;
                x2.s = -1;
              } else {
                x2.s = 0;
                x2.e = 0;
                x2.d = [0];
                return;
              }
              if (value === ~~value && value < 1e7) {
                x2.e = 0;
                x2.d = [value];
                return;
              }
              return parseDecimal(x2, value.toString());
            } else if (typeof value !== "string") {
              throw Error(invalidArgument + value);
            }
            if (value.charCodeAt(0) === 45) {
              value = value.slice(1);
              x2.s = -1;
            } else {
              x2.s = 1;
            }
            if (isDecimal.test(value)) parseDecimal(x2, value);
            else throw Error(invalidArgument + value);
          }
          Decimal4.prototype = P;
          Decimal4.ROUND_UP = 0;
          Decimal4.ROUND_DOWN = 1;
          Decimal4.ROUND_CEIL = 2;
          Decimal4.ROUND_FLOOR = 3;
          Decimal4.ROUND_HALF_UP = 4;
          Decimal4.ROUND_HALF_DOWN = 5;
          Decimal4.ROUND_HALF_EVEN = 6;
          Decimal4.ROUND_HALF_CEIL = 7;
          Decimal4.ROUND_HALF_FLOOR = 8;
          Decimal4.clone = clone;
          Decimal4.config = Decimal4.set = config;
          if (obj === void 0) obj = {};
          if (obj) {
            ps = ["precision", "rounding", "toExpNeg", "toExpPos", "LN10"];
            for (i = 0; i < ps.length; ) if (!obj.hasOwnProperty(p = ps[i++])) obj[p] = this[p];
          }
          Decimal4.config(obj);
          return Decimal4;
        }
        function config(obj) {
          if (!obj || typeof obj !== "object") {
            throw Error(decimalError + "Object expected");
          }
          var i, p, v, ps = [
            "precision",
            1,
            MAX_DIGITS,
            "rounding",
            0,
            8,
            "toExpNeg",
            -1 / 0,
            0,
            "toExpPos",
            0,
            1 / 0
          ];
          for (i = 0; i < ps.length; i += 3) {
            if ((v = obj[p = ps[i]]) !== void 0) {
              if (mathfloor(v) === v && v >= ps[i + 1] && v <= ps[i + 2]) this[p] = v;
              else throw Error(invalidArgument + p + ": " + v);
            }
          }
          if ((v = obj[p = "LN10"]) !== void 0) {
            if (v == Math.LN10) this[p] = new this(v);
            else throw Error(invalidArgument + p + ": " + v);
          }
          return this;
        }
        Decimal3 = clone(Decimal3);
        Decimal3["default"] = Decimal3.Decimal = Decimal3;
        ONE = new Decimal3(1);
        if (typeof define == "function" && define.amd) {
          define(function() {
            return Decimal3;
          });
        } else if (typeof module != "undefined" && module.exports) {
          module.exports = Decimal3;
        } else {
          if (!globalScope) {
            globalScope = typeof self != "undefined" && self && self.self == self ? self : Function("return this")();
          }
          globalScope.Decimal = Decimal3;
        }
      })(exports);
    }
  });

  // client/node_modules/eventemitter3/index.js
  var require_eventemitter3 = __commonJS({
    "client/node_modules/eventemitter3/index.js"(exports, module) {
      "use strict";
      init_define_import_meta_env();
      var has2 = Object.prototype.hasOwnProperty;
      var prefix = "~";
      function Events() {
      }
      if (Object.create) {
        Events.prototype = /* @__PURE__ */ Object.create(null);
        if (!new Events().__proto__) prefix = false;
      }
      function EE(fn, context, once) {
        this.fn = fn;
        this.context = context;
        this.once = once || false;
      }
      function addListener2(emitter, event, fn, context, once) {
        if (typeof fn !== "function") {
          throw new TypeError("The listener must be a function");
        }
        var listener2 = new EE(fn, context || emitter, once), evt = prefix ? prefix + event : event;
        if (!emitter._events[evt]) emitter._events[evt] = listener2, emitter._eventsCount++;
        else if (!emitter._events[evt].fn) emitter._events[evt].push(listener2);
        else emitter._events[evt] = [emitter._events[evt], listener2];
        return emitter;
      }
      function clearEvent(emitter, evt) {
        if (--emitter._eventsCount === 0) emitter._events = new Events();
        else delete emitter._events[evt];
      }
      function EventEmitter2() {
        this._events = new Events();
        this._eventsCount = 0;
      }
      EventEmitter2.prototype.eventNames = function eventNames() {
        var names = [], events, name;
        if (this._eventsCount === 0) return names;
        for (name in events = this._events) {
          if (has2.call(events, name)) names.push(prefix ? name.slice(1) : name);
        }
        if (Object.getOwnPropertySymbols) {
          return names.concat(Object.getOwnPropertySymbols(events));
        }
        return names;
      };
      EventEmitter2.prototype.listeners = function listeners(event) {
        var evt = prefix ? prefix + event : event, handlers = this._events[evt];
        if (!handlers) return [];
        if (handlers.fn) return [handlers.fn];
        for (var i = 0, l = handlers.length, ee = new Array(l); i < l; i++) {
          ee[i] = handlers[i].fn;
        }
        return ee;
      };
      EventEmitter2.prototype.listenerCount = function listenerCount(event) {
        var evt = prefix ? prefix + event : event, listeners = this._events[evt];
        if (!listeners) return 0;
        if (listeners.fn) return 1;
        return listeners.length;
      };
      EventEmitter2.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
        var evt = prefix ? prefix + event : event;
        if (!this._events[evt]) return false;
        var listeners = this._events[evt], len = arguments.length, args, i;
        if (listeners.fn) {
          if (listeners.once) this.removeListener(event, listeners.fn, void 0, true);
          switch (len) {
            case 1:
              return listeners.fn.call(listeners.context), true;
            case 2:
              return listeners.fn.call(listeners.context, a1), true;
            case 3:
              return listeners.fn.call(listeners.context, a1, a2), true;
            case 4:
              return listeners.fn.call(listeners.context, a1, a2, a3), true;
            case 5:
              return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
            case 6:
              return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
          }
          for (i = 1, args = new Array(len - 1); i < len; i++) {
            args[i - 1] = arguments[i];
          }
          listeners.fn.apply(listeners.context, args);
        } else {
          var length = listeners.length, j;
          for (i = 0; i < length; i++) {
            if (listeners[i].once) this.removeListener(event, listeners[i].fn, void 0, true);
            switch (len) {
              case 1:
                listeners[i].fn.call(listeners[i].context);
                break;
              case 2:
                listeners[i].fn.call(listeners[i].context, a1);
                break;
              case 3:
                listeners[i].fn.call(listeners[i].context, a1, a2);
                break;
              case 4:
                listeners[i].fn.call(listeners[i].context, a1, a2, a3);
                break;
              default:
                if (!args) for (j = 1, args = new Array(len - 1); j < len; j++) {
                  args[j - 1] = arguments[j];
                }
                listeners[i].fn.apply(listeners[i].context, args);
            }
          }
        }
        return true;
      };
      EventEmitter2.prototype.on = function on(event, fn, context) {
        return addListener2(this, event, fn, context, false);
      };
      EventEmitter2.prototype.once = function once(event, fn, context) {
        return addListener2(this, event, fn, context, true);
      };
      EventEmitter2.prototype.removeListener = function removeListener2(event, fn, context, once) {
        var evt = prefix ? prefix + event : event;
        if (!this._events[evt]) return this;
        if (!fn) {
          clearEvent(this, evt);
          return this;
        }
        var listeners = this._events[evt];
        if (listeners.fn) {
          if (listeners.fn === fn && (!once || listeners.once) && (!context || listeners.context === context)) {
            clearEvent(this, evt);
          }
        } else {
          for (var i = 0, events = [], length = listeners.length; i < length; i++) {
            if (listeners[i].fn !== fn || once && !listeners[i].once || context && listeners[i].context !== context) {
              events.push(listeners[i]);
            }
          }
          if (events.length) this._events[evt] = events.length === 1 ? events[0] : events;
          else clearEvent(this, evt);
        }
        return this;
      };
      EventEmitter2.prototype.removeAllListeners = function removeAllListeners(event) {
        var evt;
        if (event) {
          evt = prefix ? prefix + event : event;
          if (this._events[evt]) clearEvent(this, evt);
        } else {
          this._events = new Events();
          this._eventsCount = 0;
        }
        return this;
      };
      EventEmitter2.prototype.off = EventEmitter2.prototype.removeListener;
      EventEmitter2.prototype.addListener = EventEmitter2.prototype.on;
      EventEmitter2.prefixed = prefix;
      EventEmitter2.EventEmitter = EventEmitter2;
      if ("undefined" !== typeof module) {
        module.exports = EventEmitter2;
      }
    }
  });

  // client/node_modules/es-toolkit/dist/function/debounce.js
  var require_debounce = __commonJS({
    "client/node_modules/es-toolkit/dist/function/debounce.js"(exports) {
      "use strict";
      init_define_import_meta_env();
      Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
      function debounce(func, debounceMs, { signal, edges } = {}) {
        let pendingThis = void 0;
        let pendingArgs = null;
        const leading = edges != null && edges.includes("leading");
        const trailing = edges == null || edges.includes("trailing");
        const invoke = () => {
          if (pendingArgs !== null) {
            func.apply(pendingThis, pendingArgs);
            pendingThis = void 0;
            pendingArgs = null;
          }
        };
        const onTimerEnd = () => {
          if (trailing) {
            invoke();
          }
          cancel();
        };
        let timeoutId = null;
        const schedule = () => {
          if (timeoutId != null) {
            clearTimeout(timeoutId);
          }
          timeoutId = setTimeout(() => {
            timeoutId = null;
            onTimerEnd();
          }, debounceMs);
        };
        const cancelTimer = () => {
          if (timeoutId !== null) {
            clearTimeout(timeoutId);
            timeoutId = null;
          }
        };
        const cancel = () => {
          cancelTimer();
          pendingThis = void 0;
          pendingArgs = null;
        };
        const flush = () => {
          cancelTimer();
          invoke();
        };
        const debounced = function(...args) {
          if (signal?.aborted) {
            return;
          }
          pendingThis = this;
          pendingArgs = args;
          const isFirstCall = timeoutId == null;
          schedule();
          if (leading && isFirstCall) {
            invoke();
          }
        };
        debounced.schedule = schedule;
        debounced.cancel = cancel;
        debounced.flush = flush;
        signal?.addEventListener("abort", cancel, { once: true });
        return debounced;
      }
      exports.debounce = debounce;
    }
  });

  // client/node_modules/es-toolkit/dist/compat/function/debounce.js
  var require_debounce2 = __commonJS({
    "client/node_modules/es-toolkit/dist/compat/function/debounce.js"(exports) {
      "use strict";
      init_define_import_meta_env();
      Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
      var debounce$1 = require_debounce();
      function debounce(func, debounceMs = 0, options = {}) {
        if (typeof options !== "object") {
          options = {};
        }
        const { leading = false, trailing = true, maxWait } = options;
        const edges = Array(2);
        if (leading) {
          edges[0] = "leading";
        }
        if (trailing) {
          edges[1] = "trailing";
        }
        let result = void 0;
        let pendingAt = null;
        const _debounced = debounce$1.debounce(function(...args) {
          result = func.apply(this, args);
          pendingAt = null;
        }, debounceMs, { edges });
        const debounced = function(...args) {
          if (maxWait != null) {
            if (pendingAt === null) {
              pendingAt = Date.now();
            }
            if (Date.now() - pendingAt >= maxWait) {
              result = func.apply(this, args);
              pendingAt = Date.now();
              _debounced.cancel();
              _debounced.schedule();
              return result;
            }
          }
          _debounced.apply(this, args);
          return result;
        };
        const flush = () => {
          _debounced.flush();
          return result;
        };
        debounced.cancel = _debounced.cancel;
        debounced.flush = flush;
        return debounced;
      }
      exports.debounce = debounce;
    }
  });

  // client/node_modules/es-toolkit/dist/compat/function/throttle.js
  var require_throttle = __commonJS({
    "client/node_modules/es-toolkit/dist/compat/function/throttle.js"(exports) {
      "use strict";
      init_define_import_meta_env();
      Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
      var debounce = require_debounce2();
      function throttle2(func, throttleMs = 0, options = {}) {
        if (typeof options !== "object") {
          options = {};
        }
        const { leading = true, trailing = true } = options;
        return debounce.debounce(func, throttleMs, {
          leading,
          trailing,
          maxWait: throttleMs
        });
      }
      exports.throttle = throttle2;
    }
  });

  // client/node_modules/es-toolkit/compat/throttle.js
  var require_throttle2 = __commonJS({
    "client/node_modules/es-toolkit/compat/throttle.js"(exports, module) {
      init_define_import_meta_env();
      module.exports = require_throttle().throttle;
    }
  });

  // client/node_modules/es-toolkit/dist/array/last.js
  var require_last = __commonJS({
    "client/node_modules/es-toolkit/dist/array/last.js"(exports) {
      "use strict";
      init_define_import_meta_env();
      Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
      function last2(arr) {
        return arr[arr.length - 1];
      }
      exports.last = last2;
    }
  });

  // client/node_modules/es-toolkit/dist/compat/_internal/toArray.js
  var require_toArray = __commonJS({
    "client/node_modules/es-toolkit/dist/compat/_internal/toArray.js"(exports) {
      "use strict";
      init_define_import_meta_env();
      Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
      function toArray2(value) {
        return Array.isArray(value) ? value : Array.from(value);
      }
      exports.toArray = toArray2;
    }
  });

  // client/node_modules/es-toolkit/dist/compat/array/last.js
  var require_last2 = __commonJS({
    "client/node_modules/es-toolkit/dist/compat/array/last.js"(exports) {
      "use strict";
      init_define_import_meta_env();
      Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
      var last$1 = require_last();
      var toArray2 = require_toArray();
      var isArrayLike = require_isArrayLike();
      function last2(array) {
        if (!isArrayLike.isArrayLike(array)) {
          return void 0;
        }
        return last$1.last(toArray2.toArray(array));
      }
      exports.last = last2;
    }
  });

  // client/node_modules/es-toolkit/compat/last.js
  var require_last3 = __commonJS({
    "client/node_modules/es-toolkit/compat/last.js"(exports, module) {
      init_define_import_meta_env();
      module.exports = require_last2().last;
    }
  });

  // client/node_modules/use-sync-external-store/cjs/use-sync-external-store-with-selector.development.js
  var require_use_sync_external_store_with_selector_development = __commonJS({
    "client/node_modules/use-sync-external-store/cjs/use-sync-external-store-with-selector.development.js"(exports) {
      "use strict";
      init_define_import_meta_env();
      (function() {
        function is2(x2, y2) {
          return x2 === y2 && (0 !== x2 || 1 / x2 === 1 / y2) || x2 !== x2 && y2 !== y2;
        }
        "undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ && "function" === typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(Error());
        var React49 = require_react_shim(), objectIs = "function" === typeof Object.is ? Object.is : is2, useSyncExternalStore2 = React49.useSyncExternalStore, useRef7 = React49.useRef, useEffect15 = React49.useEffect, useMemo6 = React49.useMemo, useDebugValue2 = React49.useDebugValue;
        exports.useSyncExternalStoreWithSelector = function(subscribe, getSnapshot, getServerSnapshot, selector, isEqual2) {
          var instRef = useRef7(null);
          if (null === instRef.current) {
            var inst = { hasValue: false, value: null };
            instRef.current = inst;
          } else inst = instRef.current;
          instRef = useMemo6(
            function() {
              function memoizedSelector(nextSnapshot) {
                if (!hasMemo) {
                  hasMemo = true;
                  memoizedSnapshot = nextSnapshot;
                  nextSnapshot = selector(nextSnapshot);
                  if (void 0 !== isEqual2 && inst.hasValue) {
                    var currentSelection = inst.value;
                    if (isEqual2(currentSelection, nextSnapshot))
                      return memoizedSelection = currentSelection;
                  }
                  return memoizedSelection = nextSnapshot;
                }
                currentSelection = memoizedSelection;
                if (objectIs(memoizedSnapshot, nextSnapshot))
                  return currentSelection;
                var nextSelection = selector(nextSnapshot);
                if (void 0 !== isEqual2 && isEqual2(currentSelection, nextSelection))
                  return memoizedSnapshot = nextSnapshot, currentSelection;
                memoizedSnapshot = nextSnapshot;
                return memoizedSelection = nextSelection;
              }
              var hasMemo = false, memoizedSnapshot, memoizedSelection, maybeGetServerSnapshot = void 0 === getServerSnapshot ? null : getServerSnapshot;
              return [
                function() {
                  return memoizedSelector(getSnapshot());
                },
                null === maybeGetServerSnapshot ? void 0 : function() {
                  return memoizedSelector(maybeGetServerSnapshot());
                }
              ];
            },
            [getSnapshot, getServerSnapshot, selector, isEqual2]
          );
          var value = useSyncExternalStore2(subscribe, instRef[0], instRef[1]);
          useEffect15(
            function() {
              inst.hasValue = true;
              inst.value = value;
            },
            [value]
          );
          useDebugValue2(value);
          return value;
        };
        "undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ && "function" === typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(Error());
      })();
    }
  });

  // client/node_modules/use-sync-external-store/with-selector.js
  var require_with_selector2 = __commonJS({
    "client/node_modules/use-sync-external-store/with-selector.js"(exports, module) {
      "use strict";
      init_define_import_meta_env();
      if (false) {
        module.exports = null;
      } else {
        module.exports = require_use_sync_external_store_with_selector_development();
      }
    }
  });

  // client/node_modules/object-assign/index.js
  var require_object_assign = __commonJS({
    "client/node_modules/object-assign/index.js"(exports, module) {
      "use strict";
      init_define_import_meta_env();
      var getOwnPropertySymbols = Object.getOwnPropertySymbols;
      var hasOwnProperty = Object.prototype.hasOwnProperty;
      var propIsEnumerable = Object.prototype.propertyIsEnumerable;
      function toObject(val) {
        if (val === null || val === void 0) {
          throw new TypeError("Object.assign cannot be called with null or undefined");
        }
        return Object(val);
      }
      function shouldUseNative() {
        try {
          if (!Object.assign) {
            return false;
          }
          var test1 = new String("abc");
          test1[5] = "de";
          if (Object.getOwnPropertyNames(test1)[0] === "5") {
            return false;
          }
          var test2 = {};
          for (var i = 0; i < 10; i++) {
            test2["_" + String.fromCharCode(i)] = i;
          }
          var order2 = Object.getOwnPropertyNames(test2).map(function(n) {
            return test2[n];
          });
          if (order2.join("") !== "0123456789") {
            return false;
          }
          var test3 = {};
          "abcdefghijklmnopqrst".split("").forEach(function(letter) {
            test3[letter] = letter;
          });
          if (Object.keys(Object.assign({}, test3)).join("") !== "abcdefghijklmnopqrst") {
            return false;
          }
          return true;
        } catch (err) {
          return false;
        }
      }
      module.exports = shouldUseNative() ? Object.assign : function(target, source) {
        var from;
        var to = toObject(target);
        var symbols;
        for (var s = 1; s < arguments.length; s++) {
          from = Object(arguments[s]);
          for (var key in from) {
            if (hasOwnProperty.call(from, key)) {
              to[key] = from[key];
            }
          }
          if (getOwnPropertySymbols) {
            symbols = getOwnPropertySymbols(from);
            for (var i = 0; i < symbols.length; i++) {
              if (propIsEnumerable.call(from, symbols[i])) {
                to[symbols[i]] = from[symbols[i]];
              }
            }
          }
        }
        return to;
      };
    }
  });

  // client/node_modules/prop-types/lib/ReactPropTypesSecret.js
  var require_ReactPropTypesSecret = __commonJS({
    "client/node_modules/prop-types/lib/ReactPropTypesSecret.js"(exports, module) {
      "use strict";
      init_define_import_meta_env();
      var ReactPropTypesSecret = "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED";
      module.exports = ReactPropTypesSecret;
    }
  });

  // client/node_modules/prop-types/lib/has.js
  var require_has = __commonJS({
    "client/node_modules/prop-types/lib/has.js"(exports, module) {
      init_define_import_meta_env();
      module.exports = Function.call.bind(Object.prototype.hasOwnProperty);
    }
  });

  // client/node_modules/prop-types/checkPropTypes.js
  var require_checkPropTypes = __commonJS({
    "client/node_modules/prop-types/checkPropTypes.js"(exports, module) {
      "use strict";
      init_define_import_meta_env();
      var printWarning = function() {
      };
      if (true) {
        ReactPropTypesSecret = require_ReactPropTypesSecret();
        loggedTypeFailures = {};
        has2 = require_has();
        printWarning = function(text) {
          var message = "Warning: " + text;
          if (typeof console !== "undefined") {
            console.error(message);
          }
          try {
            throw new Error(message);
          } catch (x2) {
          }
        };
      }
      var ReactPropTypesSecret;
      var loggedTypeFailures;
      var has2;
      function checkPropTypes(typeSpecs, values, location, componentName, getStack) {
        if (true) {
          for (var typeSpecName in typeSpecs) {
            if (has2(typeSpecs, typeSpecName)) {
              var error;
              try {
                if (typeof typeSpecs[typeSpecName] !== "function") {
                  var err = Error(
                    (componentName || "React class") + ": " + location + " type `" + typeSpecName + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + typeof typeSpecs[typeSpecName] + "`.This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`."
                  );
                  err.name = "Invariant Violation";
                  throw err;
                }
                error = typeSpecs[typeSpecName](values, typeSpecName, componentName, location, null, ReactPropTypesSecret);
              } catch (ex) {
                error = ex;
              }
              if (error && !(error instanceof Error)) {
                printWarning(
                  (componentName || "React class") + ": type specification of " + location + " `" + typeSpecName + "` is invalid; the type checker function must return `null` or an `Error` but returned a " + typeof error + ". You may have forgotten to pass an argument to the type checker creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and shape all require an argument)."
                );
              }
              if (error instanceof Error && !(error.message in loggedTypeFailures)) {
                loggedTypeFailures[error.message] = true;
                var stack = getStack ? getStack() : "";
                printWarning(
                  "Failed " + location + " type: " + error.message + (stack != null ? stack : "")
                );
              }
            }
          }
        }
      }
      checkPropTypes.resetWarningCache = function() {
        if (true) {
          loggedTypeFailures = {};
        }
      };
      module.exports = checkPropTypes;
    }
  });

  // client/node_modules/prop-types/factoryWithTypeCheckers.js
  var require_factoryWithTypeCheckers = __commonJS({
    "client/node_modules/prop-types/factoryWithTypeCheckers.js"(exports, module) {
      "use strict";
      init_define_import_meta_env();
      var ReactIs = require_react_is_shim();
      var assign2 = require_object_assign();
      var ReactPropTypesSecret = require_ReactPropTypesSecret();
      var has2 = require_has();
      var checkPropTypes = require_checkPropTypes();
      var printWarning = function() {
      };
      if (true) {
        printWarning = function(text) {
          var message = "Warning: " + text;
          if (typeof console !== "undefined") {
            console.error(message);
          }
          try {
            throw new Error(message);
          } catch (x2) {
          }
        };
      }
      function emptyFunctionThatReturnsNull() {
        return null;
      }
      module.exports = function(isValidElement8, throwOnDirectAccess) {
        var ITERATOR_SYMBOL = typeof Symbol === "function" && Symbol.iterator;
        var FAUX_ITERATOR_SYMBOL = "@@iterator";
        function getIteratorFn(maybeIterable) {
          var iteratorFn = maybeIterable && (ITERATOR_SYMBOL && maybeIterable[ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL]);
          if (typeof iteratorFn === "function") {
            return iteratorFn;
          }
        }
        var ANONYMOUS = "<<anonymous>>";
        var ReactPropTypes = {
          array: createPrimitiveTypeChecker("array"),
          bigint: createPrimitiveTypeChecker("bigint"),
          bool: createPrimitiveTypeChecker("boolean"),
          func: createPrimitiveTypeChecker("function"),
          number: createPrimitiveTypeChecker("number"),
          object: createPrimitiveTypeChecker("object"),
          string: createPrimitiveTypeChecker("string"),
          symbol: createPrimitiveTypeChecker("symbol"),
          any: createAnyTypeChecker(),
          arrayOf: createArrayOfTypeChecker,
          element: createElementTypeChecker(),
          elementType: createElementTypeTypeChecker(),
          instanceOf: createInstanceTypeChecker,
          node: createNodeChecker(),
          objectOf: createObjectOfTypeChecker,
          oneOf: createEnumTypeChecker,
          oneOfType: createUnionTypeChecker,
          shape: createShapeTypeChecker,
          exact: createStrictShapeTypeChecker
        };
        function is2(x2, y2) {
          if (x2 === y2) {
            return x2 !== 0 || 1 / x2 === 1 / y2;
          } else {
            return x2 !== x2 && y2 !== y2;
          }
        }
        function PropTypeError(message, data) {
          this.message = message;
          this.data = data && typeof data === "object" ? data : {};
          this.stack = "";
        }
        PropTypeError.prototype = Error.prototype;
        function createChainableTypeChecker(validate) {
          if (true) {
            var manualPropTypeCallCache = {};
            var manualPropTypeWarningCount = 0;
          }
          function checkType(isRequired, props, propName, componentName, location, propFullName, secret) {
            componentName = componentName || ANONYMOUS;
            propFullName = propFullName || propName;
            if (secret !== ReactPropTypesSecret) {
              if (throwOnDirectAccess) {
                var err = new Error(
                  "Calling PropTypes validators directly is not supported by the `prop-types` package. Use `PropTypes.checkPropTypes()` to call them. Read more at http://fb.me/use-check-prop-types"
                );
                err.name = "Invariant Violation";
                throw err;
              } else if (typeof console !== "undefined") {
                var cacheKey = componentName + ":" + propName;
                if (!manualPropTypeCallCache[cacheKey] && // Avoid spamming the console because they are often not actionable except for lib authors
                manualPropTypeWarningCount < 3) {
                  printWarning(
                    "You are manually calling a React.PropTypes validation function for the `" + propFullName + "` prop on `" + componentName + "`. This is deprecated and will throw in the standalone `prop-types` package. You may be seeing this warning due to a third-party PropTypes library. See https://fb.me/react-warning-dont-call-proptypes for details."
                  );
                  manualPropTypeCallCache[cacheKey] = true;
                  manualPropTypeWarningCount++;
                }
              }
            }
            if (props[propName] == null) {
              if (isRequired) {
                if (props[propName] === null) {
                  return new PropTypeError("The " + location + " `" + propFullName + "` is marked as required " + ("in `" + componentName + "`, but its value is `null`."));
                }
                return new PropTypeError("The " + location + " `" + propFullName + "` is marked as required in " + ("`" + componentName + "`, but its value is `undefined`."));
              }
              return null;
            } else {
              return validate(props, propName, componentName, location, propFullName);
            }
          }
          var chainedCheckType = checkType.bind(null, false);
          chainedCheckType.isRequired = checkType.bind(null, true);
          return chainedCheckType;
        }
        function createPrimitiveTypeChecker(expectedType) {
          function validate(props, propName, componentName, location, propFullName, secret) {
            var propValue = props[propName];
            var propType = getPropType(propValue);
            if (propType !== expectedType) {
              var preciseType = getPreciseType(propValue);
              return new PropTypeError(
                "Invalid " + location + " `" + propFullName + "` of type " + ("`" + preciseType + "` supplied to `" + componentName + "`, expected ") + ("`" + expectedType + "`."),
                { expectedType }
              );
            }
            return null;
          }
          return createChainableTypeChecker(validate);
        }
        function createAnyTypeChecker() {
          return createChainableTypeChecker(emptyFunctionThatReturnsNull);
        }
        function createArrayOfTypeChecker(typeChecker) {
          function validate(props, propName, componentName, location, propFullName) {
            if (typeof typeChecker !== "function") {
              return new PropTypeError("Property `" + propFullName + "` of component `" + componentName + "` has invalid PropType notation inside arrayOf.");
            }
            var propValue = props[propName];
            if (!Array.isArray(propValue)) {
              var propType = getPropType(propValue);
              return new PropTypeError("Invalid " + location + " `" + propFullName + "` of type " + ("`" + propType + "` supplied to `" + componentName + "`, expected an array."));
            }
            for (var i = 0; i < propValue.length; i++) {
              var error = typeChecker(propValue, i, componentName, location, propFullName + "[" + i + "]", ReactPropTypesSecret);
              if (error instanceof Error) {
                return error;
              }
            }
            return null;
          }
          return createChainableTypeChecker(validate);
        }
        function createElementTypeChecker() {
          function validate(props, propName, componentName, location, propFullName) {
            var propValue = props[propName];
            if (!isValidElement8(propValue)) {
              var propType = getPropType(propValue);
              return new PropTypeError("Invalid " + location + " `" + propFullName + "` of type " + ("`" + propType + "` supplied to `" + componentName + "`, expected a single ReactElement."));
            }
            return null;
          }
          return createChainableTypeChecker(validate);
        }
        function createElementTypeTypeChecker() {
          function validate(props, propName, componentName, location, propFullName) {
            var propValue = props[propName];
            if (!ReactIs.isValidElementType(propValue)) {
              var propType = getPropType(propValue);
              return new PropTypeError("Invalid " + location + " `" + propFullName + "` of type " + ("`" + propType + "` supplied to `" + componentName + "`, expected a single ReactElement type."));
            }
            return null;
          }
          return createChainableTypeChecker(validate);
        }
        function createInstanceTypeChecker(expectedClass) {
          function validate(props, propName, componentName, location, propFullName) {
            if (!(props[propName] instanceof expectedClass)) {
              var expectedClassName = expectedClass.name || ANONYMOUS;
              var actualClassName = getClassName(props[propName]);
              return new PropTypeError("Invalid " + location + " `" + propFullName + "` of type " + ("`" + actualClassName + "` supplied to `" + componentName + "`, expected ") + ("instance of `" + expectedClassName + "`."));
            }
            return null;
          }
          return createChainableTypeChecker(validate);
        }
        function createEnumTypeChecker(expectedValues) {
          if (!Array.isArray(expectedValues)) {
            if (true) {
              if (arguments.length > 1) {
                printWarning(
                  "Invalid arguments supplied to oneOf, expected an array, got " + arguments.length + " arguments. A common mistake is to write oneOf(x, y, z) instead of oneOf([x, y, z])."
                );
              } else {
                printWarning("Invalid argument supplied to oneOf, expected an array.");
              }
            }
            return emptyFunctionThatReturnsNull;
          }
          function validate(props, propName, componentName, location, propFullName) {
            var propValue = props[propName];
            for (var i = 0; i < expectedValues.length; i++) {
              if (is2(propValue, expectedValues[i])) {
                return null;
              }
            }
            var valuesString = JSON.stringify(expectedValues, function replacer(key, value) {
              var type = getPreciseType(value);
              if (type === "symbol") {
                return String(value);
              }
              return value;
            });
            return new PropTypeError("Invalid " + location + " `" + propFullName + "` of value `" + String(propValue) + "` " + ("supplied to `" + componentName + "`, expected one of " + valuesString + "."));
          }
          return createChainableTypeChecker(validate);
        }
        function createObjectOfTypeChecker(typeChecker) {
          function validate(props, propName, componentName, location, propFullName) {
            if (typeof typeChecker !== "function") {
              return new PropTypeError("Property `" + propFullName + "` of component `" + componentName + "` has invalid PropType notation inside objectOf.");
            }
            var propValue = props[propName];
            var propType = getPropType(propValue);
            if (propType !== "object") {
              return new PropTypeError("Invalid " + location + " `" + propFullName + "` of type " + ("`" + propType + "` supplied to `" + componentName + "`, expected an object."));
            }
            for (var key in propValue) {
              if (has2(propValue, key)) {
                var error = typeChecker(propValue, key, componentName, location, propFullName + "." + key, ReactPropTypesSecret);
                if (error instanceof Error) {
                  return error;
                }
              }
            }
            return null;
          }
          return createChainableTypeChecker(validate);
        }
        function createUnionTypeChecker(arrayOfTypeCheckers) {
          if (!Array.isArray(arrayOfTypeCheckers)) {
            true ? printWarning("Invalid argument supplied to oneOfType, expected an instance of array.") : void 0;
            return emptyFunctionThatReturnsNull;
          }
          for (var i = 0; i < arrayOfTypeCheckers.length; i++) {
            var checker = arrayOfTypeCheckers[i];
            if (typeof checker !== "function") {
              printWarning(
                "Invalid argument supplied to oneOfType. Expected an array of check functions, but received " + getPostfixForTypeWarning(checker) + " at index " + i + "."
              );
              return emptyFunctionThatReturnsNull;
            }
          }
          function validate(props, propName, componentName, location, propFullName) {
            var expectedTypes = [];
            for (var i2 = 0; i2 < arrayOfTypeCheckers.length; i2++) {
              var checker2 = arrayOfTypeCheckers[i2];
              var checkerResult = checker2(props, propName, componentName, location, propFullName, ReactPropTypesSecret);
              if (checkerResult == null) {
                return null;
              }
              if (checkerResult.data && has2(checkerResult.data, "expectedType")) {
                expectedTypes.push(checkerResult.data.expectedType);
              }
            }
            var expectedTypesMessage = expectedTypes.length > 0 ? ", expected one of type [" + expectedTypes.join(", ") + "]" : "";
            return new PropTypeError("Invalid " + location + " `" + propFullName + "` supplied to " + ("`" + componentName + "`" + expectedTypesMessage + "."));
          }
          return createChainableTypeChecker(validate);
        }
        function createNodeChecker() {
          function validate(props, propName, componentName, location, propFullName) {
            if (!isNode(props[propName])) {
              return new PropTypeError("Invalid " + location + " `" + propFullName + "` supplied to " + ("`" + componentName + "`, expected a ReactNode."));
            }
            return null;
          }
          return createChainableTypeChecker(validate);
        }
        function invalidValidatorError(componentName, location, propFullName, key, type) {
          return new PropTypeError(
            (componentName || "React class") + ": " + location + " type `" + propFullName + "." + key + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + type + "`."
          );
        }
        function createShapeTypeChecker(shapeTypes) {
          function validate(props, propName, componentName, location, propFullName) {
            var propValue = props[propName];
            var propType = getPropType(propValue);
            if (propType !== "object") {
              return new PropTypeError("Invalid " + location + " `" + propFullName + "` of type `" + propType + "` " + ("supplied to `" + componentName + "`, expected `object`."));
            }
            for (var key in shapeTypes) {
              var checker = shapeTypes[key];
              if (typeof checker !== "function") {
                return invalidValidatorError(componentName, location, propFullName, key, getPreciseType(checker));
              }
              var error = checker(propValue, key, componentName, location, propFullName + "." + key, ReactPropTypesSecret);
              if (error) {
                return error;
              }
            }
            return null;
          }
          return createChainableTypeChecker(validate);
        }
        function createStrictShapeTypeChecker(shapeTypes) {
          function validate(props, propName, componentName, location, propFullName) {
            var propValue = props[propName];
            var propType = getPropType(propValue);
            if (propType !== "object") {
              return new PropTypeError("Invalid " + location + " `" + propFullName + "` of type `" + propType + "` " + ("supplied to `" + componentName + "`, expected `object`."));
            }
            var allKeys = assign2({}, props[propName], shapeTypes);
            for (var key in allKeys) {
              var checker = shapeTypes[key];
              if (has2(shapeTypes, key) && typeof checker !== "function") {
                return invalidValidatorError(componentName, location, propFullName, key, getPreciseType(checker));
              }
              if (!checker) {
                return new PropTypeError(
                  "Invalid " + location + " `" + propFullName + "` key `" + key + "` supplied to `" + componentName + "`.\nBad object: " + JSON.stringify(props[propName], null, "  ") + "\nValid keys: " + JSON.stringify(Object.keys(shapeTypes), null, "  ")
                );
              }
              var error = checker(propValue, key, componentName, location, propFullName + "." + key, ReactPropTypesSecret);
              if (error) {
                return error;
              }
            }
            return null;
          }
          return createChainableTypeChecker(validate);
        }
        function isNode(propValue) {
          switch (typeof propValue) {
            case "number":
            case "string":
            case "undefined":
              return true;
            case "boolean":
              return !propValue;
            case "object":
              if (Array.isArray(propValue)) {
                return propValue.every(isNode);
              }
              if (propValue === null || isValidElement8(propValue)) {
                return true;
              }
              var iteratorFn = getIteratorFn(propValue);
              if (iteratorFn) {
                var iterator = iteratorFn.call(propValue);
                var step;
                if (iteratorFn !== propValue.entries) {
                  while (!(step = iterator.next()).done) {
                    if (!isNode(step.value)) {
                      return false;
                    }
                  }
                } else {
                  while (!(step = iterator.next()).done) {
                    var entry = step.value;
                    if (entry) {
                      if (!isNode(entry[1])) {
                        return false;
                      }
                    }
                  }
                }
              } else {
                return false;
              }
              return true;
            default:
              return false;
          }
        }
        function isSymbol(propType, propValue) {
          if (propType === "symbol") {
            return true;
          }
          if (!propValue) {
            return false;
          }
          if (propValue["@@toStringTag"] === "Symbol") {
            return true;
          }
          if (typeof Symbol === "function" && propValue instanceof Symbol) {
            return true;
          }
          return false;
        }
        function getPropType(propValue) {
          var propType = typeof propValue;
          if (Array.isArray(propValue)) {
            return "array";
          }
          if (propValue instanceof RegExp) {
            return "object";
          }
          if (isSymbol(propType, propValue)) {
            return "symbol";
          }
          return propType;
        }
        function getPreciseType(propValue) {
          if (typeof propValue === "undefined" || propValue === null) {
            return "" + propValue;
          }
          var propType = getPropType(propValue);
          if (propType === "object") {
            if (propValue instanceof Date) {
              return "date";
            } else if (propValue instanceof RegExp) {
              return "regexp";
            }
          }
          return propType;
        }
        function getPostfixForTypeWarning(value) {
          var type = getPreciseType(value);
          switch (type) {
            case "array":
            case "object":
              return "an " + type;
            case "boolean":
            case "date":
            case "regexp":
              return "a " + type;
            default:
              return type;
          }
        }
        function getClassName(propValue) {
          if (!propValue.constructor || !propValue.constructor.name) {
            return ANONYMOUS;
          }
          return propValue.constructor.name;
        }
        ReactPropTypes.checkPropTypes = checkPropTypes;
        ReactPropTypes.resetWarningCache = checkPropTypes.resetWarningCache;
        ReactPropTypes.PropTypes = ReactPropTypes;
        return ReactPropTypes;
      };
    }
  });

  // client/node_modules/prop-types/index.js
  var require_prop_types = __commonJS({
    "client/node_modules/prop-types/index.js"(exports, module) {
      init_define_import_meta_env();
      if (true) {
        ReactIs = require_react_is_shim();
        throwOnDirectAccess = true;
        module.exports = require_factoryWithTypeCheckers()(ReactIs.isElement, throwOnDirectAccess);
      } else {
        module.exports = null();
      }
      var ReactIs;
      var throwOnDirectAccess;
    }
  });

  // client/node_modules/mimic-fn/index.js
  var require_mimic_fn = __commonJS({
    "client/node_modules/mimic-fn/index.js"(exports, module) {
      "use strict";
      init_define_import_meta_env();
      var copyProperty = (to, from, property, ignoreNonConfigurable) => {
        if (property === "length" || property === "prototype") {
          return;
        }
        if (property === "arguments" || property === "caller") {
          return;
        }
        const toDescriptor = Object.getOwnPropertyDescriptor(to, property);
        const fromDescriptor = Object.getOwnPropertyDescriptor(from, property);
        if (!canCopyProperty(toDescriptor, fromDescriptor) && ignoreNonConfigurable) {
          return;
        }
        Object.defineProperty(to, property, fromDescriptor);
      };
      var canCopyProperty = function(toDescriptor, fromDescriptor) {
        return toDescriptor === void 0 || toDescriptor.configurable || toDescriptor.writable === fromDescriptor.writable && toDescriptor.enumerable === fromDescriptor.enumerable && toDescriptor.configurable === fromDescriptor.configurable && (toDescriptor.writable || toDescriptor.value === fromDescriptor.value);
      };
      var changePrototype = (to, from) => {
        const fromPrototype = Object.getPrototypeOf(from);
        if (fromPrototype === Object.getPrototypeOf(to)) {
          return;
        }
        Object.setPrototypeOf(to, fromPrototype);
      };
      var wrappedToString = (withName, fromBody) => `/* Wrapped ${withName}*/
${fromBody}`;
      var toStringDescriptor = Object.getOwnPropertyDescriptor(Function.prototype, "toString");
      var toStringName = Object.getOwnPropertyDescriptor(Function.prototype.toString, "name");
      var changeToString = (to, from, name) => {
        const withName = name === "" ? "" : `with ${name.trim()}() `;
        const newToString = wrappedToString.bind(null, withName, from.toString());
        Object.defineProperty(newToString, "name", toStringName);
        Object.defineProperty(to, "toString", { ...toStringDescriptor, value: newToString });
      };
      var mimicFn = (to, from, { ignoreNonConfigurable = false } = {}) => {
        const { name } = to;
        for (const property of Reflect.ownKeys(from)) {
          copyProperty(to, from, property, ignoreNonConfigurable);
        }
        changePrototype(to, from);
        changeToString(to, from, name);
        return to;
      };
      module.exports = mimicFn;
    }
  });

  // client/node_modules/p-defer/index.js
  var require_p_defer = __commonJS({
    "client/node_modules/p-defer/index.js"(exports, module) {
      "use strict";
      init_define_import_meta_env();
      module.exports = () => {
        const ret = {};
        ret.promise = new Promise((resolve, reject) => {
          ret.resolve = resolve;
          ret.reject = reject;
        });
        return ret;
      };
    }
  });

  // client/node_modules/map-age-cleaner/dist/index.js
  var require_dist = __commonJS({
    "client/node_modules/map-age-cleaner/dist/index.js"(exports, module) {
      "use strict";
      init_define_import_meta_env();
      var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
        return new (P || (P = Promise))(function(resolve, reject) {
          function fulfilled(value) {
            try {
              step(generator.next(value));
            } catch (e) {
              reject(e);
            }
          }
          function rejected(value) {
            try {
              step(generator["throw"](value));
            } catch (e) {
              reject(e);
            }
          }
          function step(result) {
            result.done ? resolve(result.value) : new P(function(resolve2) {
              resolve2(result.value);
            }).then(fulfilled, rejected);
          }
          step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
      };
      var __importDefault = exports && exports.__importDefault || function(mod) {
        return mod && mod.__esModule ? mod : { "default": mod };
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      var p_defer_1 = __importDefault(require_p_defer());
      function mapAgeCleaner(map3, property = "maxAge") {
        let processingKey;
        let processingTimer;
        let processingDeferred;
        const cleanup = () => __awaiter(this, void 0, void 0, function* () {
          if (processingKey !== void 0) {
            return;
          }
          const setupTimer = (item) => __awaiter(this, void 0, void 0, function* () {
            processingDeferred = p_defer_1.default();
            const delay = item[1][property] - Date.now();
            if (delay <= 0) {
              map3.delete(item[0]);
              processingDeferred.resolve();
              return;
            }
            processingKey = item[0];
            processingTimer = setTimeout(() => {
              map3.delete(item[0]);
              if (processingDeferred) {
                processingDeferred.resolve();
              }
            }, delay);
            if (typeof processingTimer.unref === "function") {
              processingTimer.unref();
            }
            return processingDeferred.promise;
          });
          try {
            for (const entry of map3) {
              yield setupTimer(entry);
            }
          } catch (_a3) {
          }
          processingKey = void 0;
        });
        const reset = () => {
          processingKey = void 0;
          if (processingTimer !== void 0) {
            clearTimeout(processingTimer);
            processingTimer = void 0;
          }
          if (processingDeferred !== void 0) {
            processingDeferred.reject(void 0);
            processingDeferred = void 0;
          }
        };
        const originalSet = map3.set.bind(map3);
        map3.set = (key, value) => {
          if (map3.has(key)) {
            map3.delete(key);
          }
          const result = originalSet(key, value);
          if (processingKey && processingKey === key) {
            reset();
          }
          cleanup();
          return result;
        };
        cleanup();
        return map3;
      }
      exports.default = mapAgeCleaner;
      module.exports = mapAgeCleaner;
      module.exports.default = mapAgeCleaner;
    }
  });

  // client/node_modules/mem/dist/index.js
  var require_dist2 = __commonJS({
    "client/node_modules/mem/dist/index.js"(exports, module) {
      "use strict";
      init_define_import_meta_env();
      var mimicFn = require_mimic_fn();
      var mapAgeCleaner = require_dist();
      var decoratorInstanceMap = /* @__PURE__ */ new WeakMap();
      var cacheStore = /* @__PURE__ */ new WeakMap();
      var mem2 = (fn, { cacheKey, cache = /* @__PURE__ */ new Map(), maxAge } = {}) => {
        if (typeof maxAge === "number") {
          mapAgeCleaner(cache);
        }
        const memoized = function(...arguments_) {
          const key = cacheKey ? cacheKey(arguments_) : arguments_[0];
          const cacheItem = cache.get(key);
          if (cacheItem) {
            return cacheItem.data;
          }
          const result = fn.apply(this, arguments_);
          cache.set(key, {
            data: result,
            maxAge: maxAge ? Date.now() + maxAge : Number.POSITIVE_INFINITY
          });
          return result;
        };
        mimicFn(memoized, fn, {
          ignoreNonConfigurable: true
        });
        cacheStore.set(memoized, cache);
        return memoized;
      };
      mem2.decorator = (options = {}) => (target, propertyKey, descriptor) => {
        const input = target[propertyKey];
        if (typeof input !== "function") {
          throw new TypeError("The decorated value must be a function");
        }
        delete descriptor.value;
        delete descriptor.writable;
        descriptor.get = function() {
          if (!decoratorInstanceMap.has(this)) {
            const value = mem2(input, options);
            decoratorInstanceMap.set(this, value);
            return value;
          }
          return decoratorInstanceMap.get(this);
        };
      };
      mem2.clear = (fn) => {
        const cache = cacheStore.get(fn);
        if (!cache) {
          throw new TypeError("Can't clear a function that was not memoized!");
        }
        if (typeof cache.clear !== "function") {
          throw new TypeError("The cache Map can't be cleared!");
        }
        cache.clear();
      };
      module.exports = mem2;
    }
  });

  // client/node_modules/warning/warning.js
  var require_warning = __commonJS({
    "client/node_modules/warning/warning.js"(exports, module) {
      "use strict";
      init_define_import_meta_env();
      var __DEV__ = true;
      var warning3 = function() {
      };
      if (__DEV__) {
        printWarning = function printWarning2(format2, args) {
          var len = arguments.length;
          args = new Array(len > 1 ? len - 1 : 0);
          for (var key = 1; key < len; key++) {
            args[key - 1] = arguments[key];
          }
          var argIndex = 0;
          var message = "Warning: " + format2.replace(/%s/g, function() {
            return args[argIndex++];
          });
          if (typeof console !== "undefined") {
            console.error(message);
          }
          try {
            throw new Error(message);
          } catch (x2) {
          }
        };
        warning3 = function(condition, format2, args) {
          var len = arguments.length;
          args = new Array(len > 2 ? len - 2 : 0);
          for (var key = 2; key < len; key++) {
            args[key - 2] = arguments[key];
          }
          if (format2 === void 0) {
            throw new Error(
              "`warning(condition, format, ...args)` requires a warning message argument"
            );
          }
          if (!condition) {
            printWarning.apply(null, [format2].concat(args));
          }
        };
      }
      var printWarning;
      module.exports = warning3;
    }
  });

  // client/src/ds-entry.js
  var ds_entry_exports = {};
  __export(ds_entry_exports, {
    ActionButtons: () => ActionButtons_default,
    CalendarWidget: () => CalendarWidget_default,
    Modal: () => Modal_default,
    SearchableDropdown: () => SearchableDropdown_default,
    SummaryCard: () => SummaryCard_default
  });
  init_define_import_meta_env();

  // client/src/components/Modal.jsx
  init_define_import_meta_env();
  var import_react = __toESM(require_react_shim());
  var import_react_dom = __toESM(require_react_dom_shim());
  var Modal = ({ isOpen, onClose, children }) => {
    (0, import_react.useEffect)(() => {
      if (isOpen) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "unset";
      }
      return () => {
        document.body.style.overflow = "unset";
      };
    }, [isOpen]);
    if (!isOpen) return null;
    return import_react_dom.default.createPortal(
      /* @__PURE__ */ import_react.default.createElement("div", { className: "modal-overlay", onClick: onClose }, /* @__PURE__ */ import_react.default.createElement("div", { className: "modal", onClick: (e) => e.stopPropagation() }, children)),
      document.getElementById("modal-root")
    );
  };
  var Modal_default = Modal;

  // client/src/components/SummaryCard.jsx
  init_define_import_meta_env();
  var import_react37 = __toESM(require_react_shim());

  // client/node_modules/recharts/es6/index.js
  init_define_import_meta_env();

  // client/node_modules/recharts/es6/container/Surface.js
  init_define_import_meta_env();
  var React2 = __toESM(require_react_shim());
  var import_react4 = __toESM(require_react_shim());

  // client/node_modules/clsx/dist/clsx.mjs
  init_define_import_meta_env();
  function r(e) {
    var t, f, n = "";
    if ("string" == typeof e || "number" == typeof e) n += e;
    else if ("object" == typeof e) if (Array.isArray(e)) {
      var o = e.length;
      for (t = 0; t < o; t++) e[t] && (f = r(e[t])) && (n && (n += " "), n += f);
    } else for (f in e) e[f] && (n && (n += " "), n += f);
    return n;
  }
  function clsx() {
    for (var e, t, f = 0, n = "", o = arguments.length; f < o; f++) (e = arguments[f]) && (t = r(e)) && (n && (n += " "), n += t);
    return n;
  }
  var clsx_default = clsx;

  // client/node_modules/recharts/es6/util/ReactUtils.js
  init_define_import_meta_env();
  var import_get2 = __toESM(require_get2());
  var import_react3 = __toESM(require_react_shim());
  var import_react_is = __toESM(require_react_is_shim());

  // client/node_modules/recharts/es6/util/DataUtils.js
  init_define_import_meta_env();
  var import_get = __toESM(require_get2());
  var mathSign = (value) => {
    if (value === 0) {
      return 0;
    }
    if (value > 0) {
      return 1;
    }
    return -1;
  };
  var isNan = (value) => {
    return typeof value == "number" && value != +value;
  };
  var isPercent = (value) => typeof value === "string" && value.indexOf("%") === value.length - 1;
  var isNumber = (value) => (typeof value === "number" || value instanceof Number) && !isNan(value);
  var isNumOrStr = (value) => isNumber(value) || typeof value === "string";
  var idCounter = 0;
  var uniqueId = (prefix) => {
    var id = ++idCounter;
    return "".concat(prefix || "").concat(id);
  };
  var getPercentValue = function getPercentValue2(percent, totalValue) {
    var defaultValue = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 0;
    var validate = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : false;
    if (!isNumber(percent) && typeof percent !== "string") {
      return defaultValue;
    }
    var value;
    if (isPercent(percent)) {
      if (totalValue == null) {
        return defaultValue;
      }
      var index = percent.indexOf("%");
      value = totalValue * parseFloat(percent.slice(0, index)) / 100;
    } else {
      value = +percent;
    }
    if (isNan(value)) {
      value = defaultValue;
    }
    if (validate && totalValue != null && value > totalValue) {
      value = totalValue;
    }
    return value;
  };
  var hasDuplicate = (ary) => {
    if (!Array.isArray(ary)) {
      return false;
    }
    var len = ary.length;
    var cache = {};
    for (var i = 0; i < len; i++) {
      if (!cache[ary[i]]) {
        cache[ary[i]] = true;
      } else {
        return true;
      }
    }
    return false;
  };
  var interpolateNumber = (numberA, numberB) => {
    if (isNumber(numberA) && isNumber(numberB)) {
      return (t) => numberA + t * (numberB - numberA);
    }
    return () => numberB;
  };
  function findEntryInArray(ary, specifiedKey, specifiedValue) {
    if (!ary || !ary.length) {
      return void 0;
    }
    return ary.find((entry) => entry && (typeof specifiedKey === "function" ? specifiedKey(entry) : (0, import_get.default)(entry, specifiedKey)) === specifiedValue);
  }
  var isNullish = (value) => {
    return value === null || typeof value === "undefined";
  };
  var upperFirst = (value) => {
    if (isNullish(value)) {
      return value;
    }
    return "".concat(value.charAt(0).toUpperCase()).concat(value.slice(1));
  };

  // client/node_modules/recharts/es6/util/types.js
  init_define_import_meta_env();
  var import_react2 = __toESM(require_react_shim());
  var SVGContainerPropKeys = ["viewBox", "children"];
  var SVGElementPropKeys = [
    "aria-activedescendant",
    "aria-atomic",
    "aria-autocomplete",
    "aria-busy",
    "aria-checked",
    "aria-colcount",
    "aria-colindex",
    "aria-colspan",
    "aria-controls",
    "aria-current",
    "aria-describedby",
    "aria-details",
    "aria-disabled",
    "aria-errormessage",
    "aria-expanded",
    "aria-flowto",
    "aria-haspopup",
    "aria-hidden",
    "aria-invalid",
    "aria-keyshortcuts",
    "aria-label",
    "aria-labelledby",
    "aria-level",
    "aria-live",
    "aria-modal",
    "aria-multiline",
    "aria-multiselectable",
    "aria-orientation",
    "aria-owns",
    "aria-placeholder",
    "aria-posinset",
    "aria-pressed",
    "aria-readonly",
    "aria-relevant",
    "aria-required",
    "aria-roledescription",
    "aria-rowcount",
    "aria-rowindex",
    "aria-rowspan",
    "aria-selected",
    "aria-setsize",
    "aria-sort",
    "aria-valuemax",
    "aria-valuemin",
    "aria-valuenow",
    "aria-valuetext",
    "className",
    "color",
    "height",
    "id",
    "lang",
    "max",
    "media",
    "method",
    "min",
    "name",
    "style",
    /*
     * removed 'type' SVGElementPropKey because we do not currently use any SVG elements
     * that can use it, and it conflicts with the recharts prop 'type'
     * https://github.com/recharts/recharts/pull/3327
     * https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/type
     */
    // 'type',
    "target",
    "width",
    "role",
    "tabIndex",
    "accentHeight",
    "accumulate",
    "additive",
    "alignmentBaseline",
    "allowReorder",
    "alphabetic",
    "amplitude",
    "arabicForm",
    "ascent",
    "attributeName",
    "attributeType",
    "autoReverse",
    "azimuth",
    "baseFrequency",
    "baselineShift",
    "baseProfile",
    "bbox",
    "begin",
    "bias",
    "by",
    "calcMode",
    "capHeight",
    "clip",
    "clipPath",
    "clipPathUnits",
    "clipRule",
    "colorInterpolation",
    "colorInterpolationFilters",
    "colorProfile",
    "colorRendering",
    "contentScriptType",
    "contentStyleType",
    "cursor",
    "cx",
    "cy",
    "d",
    "decelerate",
    "descent",
    "diffuseConstant",
    "direction",
    "display",
    "divisor",
    "dominantBaseline",
    "dur",
    "dx",
    "dy",
    "edgeMode",
    "elevation",
    "enableBackground",
    "end",
    "exponent",
    "externalResourcesRequired",
    "fill",
    "fillOpacity",
    "fillRule",
    "filter",
    "filterRes",
    "filterUnits",
    "floodColor",
    "floodOpacity",
    "focusable",
    "fontFamily",
    "fontSize",
    "fontSizeAdjust",
    "fontStretch",
    "fontStyle",
    "fontVariant",
    "fontWeight",
    "format",
    "from",
    "fx",
    "fy",
    "g1",
    "g2",
    "glyphName",
    "glyphOrientationHorizontal",
    "glyphOrientationVertical",
    "glyphRef",
    "gradientTransform",
    "gradientUnits",
    "hanging",
    "horizAdvX",
    "horizOriginX",
    "href",
    "ideographic",
    "imageRendering",
    "in2",
    "in",
    "intercept",
    "k1",
    "k2",
    "k3",
    "k4",
    "k",
    "kernelMatrix",
    "kernelUnitLength",
    "kerning",
    "keyPoints",
    "keySplines",
    "keyTimes",
    "lengthAdjust",
    "letterSpacing",
    "lightingColor",
    "limitingConeAngle",
    "local",
    "markerEnd",
    "markerHeight",
    "markerMid",
    "markerStart",
    "markerUnits",
    "markerWidth",
    "mask",
    "maskContentUnits",
    "maskUnits",
    "mathematical",
    "mode",
    "numOctaves",
    "offset",
    "opacity",
    "operator",
    "order",
    "orient",
    "orientation",
    "origin",
    "overflow",
    "overlinePosition",
    "overlineThickness",
    "paintOrder",
    "panose1",
    "pathLength",
    "patternContentUnits",
    "patternTransform",
    "patternUnits",
    "pointerEvents",
    "pointsAtX",
    "pointsAtY",
    "pointsAtZ",
    "preserveAlpha",
    "preserveAspectRatio",
    "primitiveUnits",
    "r",
    "radius",
    "refX",
    "refY",
    "renderingIntent",
    "repeatCount",
    "repeatDur",
    "requiredExtensions",
    "requiredFeatures",
    "restart",
    "result",
    "rotate",
    "rx",
    "ry",
    "seed",
    "shapeRendering",
    "slope",
    "spacing",
    "specularConstant",
    "specularExponent",
    "speed",
    "spreadMethod",
    "startOffset",
    "stdDeviation",
    "stemh",
    "stemv",
    "stitchTiles",
    "stopColor",
    "stopOpacity",
    "strikethroughPosition",
    "strikethroughThickness",
    "string",
    "stroke",
    "strokeDasharray",
    "strokeDashoffset",
    "strokeLinecap",
    "strokeLinejoin",
    "strokeMiterlimit",
    "strokeOpacity",
    "strokeWidth",
    "surfaceScale",
    "systemLanguage",
    "tableValues",
    "targetX",
    "targetY",
    "textAnchor",
    "textDecoration",
    "textLength",
    "textRendering",
    "to",
    "transform",
    "u1",
    "u2",
    "underlinePosition",
    "underlineThickness",
    "unicode",
    "unicodeBidi",
    "unicodeRange",
    "unitsPerEm",
    "vAlphabetic",
    "values",
    "vectorEffect",
    "version",
    "vertAdvY",
    "vertOriginX",
    "vertOriginY",
    "vHanging",
    "vIdeographic",
    "viewTarget",
    "visibility",
    "vMathematical",
    "widths",
    "wordSpacing",
    "writingMode",
    "x1",
    "x2",
    "x",
    "xChannelSelector",
    "xHeight",
    "xlinkActuate",
    "xlinkArcrole",
    "xlinkHref",
    "xlinkRole",
    "xlinkShow",
    "xlinkTitle",
    "xlinkType",
    "xmlBase",
    "xmlLang",
    "xmlns",
    "xmlnsXlink",
    "xmlSpace",
    "y1",
    "y2",
    "y",
    "yChannelSelector",
    "z",
    "zoomAndPan",
    "ref",
    "key",
    "angle"
  ];
  var PolyElementKeys = ["points", "pathLength"];
  var FilteredElementKeyMap = {
    svg: SVGContainerPropKeys,
    polygon: PolyElementKeys,
    polyline: PolyElementKeys
  };
  var EventKeys = ["dangerouslySetInnerHTML", "onCopy", "onCopyCapture", "onCut", "onCutCapture", "onPaste", "onPasteCapture", "onCompositionEnd", "onCompositionEndCapture", "onCompositionStart", "onCompositionStartCapture", "onCompositionUpdate", "onCompositionUpdateCapture", "onFocus", "onFocusCapture", "onBlur", "onBlurCapture", "onChange", "onChangeCapture", "onBeforeInput", "onBeforeInputCapture", "onInput", "onInputCapture", "onReset", "onResetCapture", "onSubmit", "onSubmitCapture", "onInvalid", "onInvalidCapture", "onLoad", "onLoadCapture", "onError", "onErrorCapture", "onKeyDown", "onKeyDownCapture", "onKeyPress", "onKeyPressCapture", "onKeyUp", "onKeyUpCapture", "onAbort", "onAbortCapture", "onCanPlay", "onCanPlayCapture", "onCanPlayThrough", "onCanPlayThroughCapture", "onDurationChange", "onDurationChangeCapture", "onEmptied", "onEmptiedCapture", "onEncrypted", "onEncryptedCapture", "onEnded", "onEndedCapture", "onLoadedData", "onLoadedDataCapture", "onLoadedMetadata", "onLoadedMetadataCapture", "onLoadStart", "onLoadStartCapture", "onPause", "onPauseCapture", "onPlay", "onPlayCapture", "onPlaying", "onPlayingCapture", "onProgress", "onProgressCapture", "onRateChange", "onRateChangeCapture", "onSeeked", "onSeekedCapture", "onSeeking", "onSeekingCapture", "onStalled", "onStalledCapture", "onSuspend", "onSuspendCapture", "onTimeUpdate", "onTimeUpdateCapture", "onVolumeChange", "onVolumeChangeCapture", "onWaiting", "onWaitingCapture", "onAuxClick", "onAuxClickCapture", "onClick", "onClickCapture", "onContextMenu", "onContextMenuCapture", "onDoubleClick", "onDoubleClickCapture", "onDrag", "onDragCapture", "onDragEnd", "onDragEndCapture", "onDragEnter", "onDragEnterCapture", "onDragExit", "onDragExitCapture", "onDragLeave", "onDragLeaveCapture", "onDragOver", "onDragOverCapture", "onDragStart", "onDragStartCapture", "onDrop", "onDropCapture", "onMouseDown", "onMouseDownCapture", "onMouseEnter", "onMouseLeave", "onMouseMove", "onMouseMoveCapture", "onMouseOut", "onMouseOutCapture", "onMouseOver", "onMouseOverCapture", "onMouseUp", "onMouseUpCapture", "onSelect", "onSelectCapture", "onTouchCancel", "onTouchCancelCapture", "onTouchEnd", "onTouchEndCapture", "onTouchMove", "onTouchMoveCapture", "onTouchStart", "onTouchStartCapture", "onPointerDown", "onPointerDownCapture", "onPointerMove", "onPointerMoveCapture", "onPointerUp", "onPointerUpCapture", "onPointerCancel", "onPointerCancelCapture", "onPointerEnter", "onPointerEnterCapture", "onPointerLeave", "onPointerLeaveCapture", "onPointerOver", "onPointerOverCapture", "onPointerOut", "onPointerOutCapture", "onGotPointerCapture", "onGotPointerCaptureCapture", "onLostPointerCapture", "onLostPointerCaptureCapture", "onScroll", "onScrollCapture", "onWheel", "onWheelCapture", "onAnimationStart", "onAnimationStartCapture", "onAnimationEnd", "onAnimationEndCapture", "onAnimationIteration", "onAnimationIterationCapture", "onTransitionEnd", "onTransitionEndCapture"];
  var adaptEventHandlers = (props, newHandler) => {
    if (!props || typeof props === "function" || typeof props === "boolean") {
      return null;
    }
    var inputProps = props;
    if (/* @__PURE__ */ (0, import_react2.isValidElement)(props)) {
      inputProps = props.props;
    }
    if (typeof inputProps !== "object" && typeof inputProps !== "function") {
      return null;
    }
    var out = {};
    Object.keys(inputProps).forEach((key) => {
      if (EventKeys.includes(key)) {
        out[key] = newHandler || ((e) => inputProps[key](inputProps, e));
      }
    });
    return out;
  };

  // client/node_modules/recharts/es6/util/ReactUtils.js
  var getDisplayName = (Comp) => {
    if (typeof Comp === "string") {
      return Comp;
    }
    if (!Comp) {
      return "";
    }
    return Comp.displayName || Comp.name || "Component";
  };
  var lastChildren = null;
  var lastResult = null;
  var toArray = (children) => {
    if (children === lastChildren && Array.isArray(lastResult)) {
      return lastResult;
    }
    var result = [];
    import_react3.Children.forEach(children, (child) => {
      if (isNullish(child)) return;
      if ((0, import_react_is.isFragment)(child)) {
        result = result.concat(toArray(child.props.children));
      } else {
        result.push(child);
      }
    });
    lastResult = result;
    lastChildren = children;
    return result;
  };
  function findAllByType(children, type) {
    var result = [];
    var types = [];
    if (Array.isArray(type)) {
      types = type.map((t) => getDisplayName(t));
    } else {
      types = [getDisplayName(type)];
    }
    toArray(children).forEach((child) => {
      var childType = (0, import_get2.default)(child, "type.displayName") || (0, import_get2.default)(child, "type.name");
      if (types.indexOf(childType) !== -1) {
        result.push(child);
      }
    });
    return result;
  }
  var isClipDot = (dot) => {
    if (dot && typeof dot === "object" && "clipDot" in dot) {
      return Boolean(dot.clipDot);
    }
    return true;
  };
  var isValidSpreadableProp = (property, key, includeEvents, svgElementType) => {
    var _ref;
    var matchingElementTypeKeys = (_ref = svgElementType && (FilteredElementKeyMap === null || FilteredElementKeyMap === void 0 ? void 0 : FilteredElementKeyMap[svgElementType])) !== null && _ref !== void 0 ? _ref : [];
    return key.startsWith("data-") || typeof property !== "function" && (svgElementType && matchingElementTypeKeys.includes(key) || SVGElementPropKeys.includes(key)) || includeEvents && EventKeys.includes(key);
  };
  var filterProps = (props, includeEvents, svgElementType) => {
    if (!props || typeof props === "function" || typeof props === "boolean") {
      return null;
    }
    var inputProps = props;
    if (/* @__PURE__ */ (0, import_react3.isValidElement)(props)) {
      inputProps = props.props;
    }
    if (typeof inputProps !== "object" && typeof inputProps !== "function") {
      return null;
    }
    var out = {};
    Object.keys(inputProps).forEach((key) => {
      var _inputProps;
      if (isValidSpreadableProp((_inputProps = inputProps) === null || _inputProps === void 0 ? void 0 : _inputProps[key], key, includeEvents, svgElementType)) {
        out[key] = inputProps[key];
      }
    });
    return out;
  };

  // client/node_modules/recharts/es6/container/Surface.js
  var _excluded = ["children", "width", "height", "viewBox", "className", "style", "title", "desc"];
  function _extends() {
    return _extends = Object.assign ? Object.assign.bind() : function(n) {
      for (var e = 1; e < arguments.length; e++) {
        var t = arguments[e];
        for (var r2 in t) ({}).hasOwnProperty.call(t, r2) && (n[r2] = t[r2]);
      }
      return n;
    }, _extends.apply(null, arguments);
  }
  function _objectWithoutProperties(e, t) {
    if (null == e) return {};
    var o, r2, i = _objectWithoutPropertiesLoose(e, t);
    if (Object.getOwnPropertySymbols) {
      var n = Object.getOwnPropertySymbols(e);
      for (r2 = 0; r2 < n.length; r2++) o = n[r2], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]);
    }
    return i;
  }
  function _objectWithoutPropertiesLoose(r2, e) {
    if (null == r2) return {};
    var t = {};
    for (var n in r2) if ({}.hasOwnProperty.call(r2, n)) {
      if (-1 !== e.indexOf(n)) continue;
      t[n] = r2[n];
    }
    return t;
  }
  var Surface = /* @__PURE__ */ (0, import_react4.forwardRef)((props, ref) => {
    var {
      children,
      width,
      height,
      viewBox,
      className: className8,
      style,
      title,
      desc
    } = props, others = _objectWithoutProperties(props, _excluded);
    var svgView = viewBox || {
      width,
      height,
      x: 0,
      y: 0
    };
    var layerClass = clsx("recharts-surface", className8);
    return /* @__PURE__ */ React2.createElement("svg", _extends({}, filterProps(others, true, "svg"), {
      className: layerClass,
      width,
      height,
      style,
      viewBox: "".concat(svgView.x, " ").concat(svgView.y, " ").concat(svgView.width, " ").concat(svgView.height),
      ref
    }), /* @__PURE__ */ React2.createElement("title", null, title), /* @__PURE__ */ React2.createElement("desc", null, desc), children);
  });

  // client/node_modules/recharts/es6/container/Layer.js
  init_define_import_meta_env();
  var React3 = __toESM(require_react_shim());
  var _excluded2 = ["children", "className"];
  function _extends2() {
    return _extends2 = Object.assign ? Object.assign.bind() : function(n) {
      for (var e = 1; e < arguments.length; e++) {
        var t = arguments[e];
        for (var r2 in t) ({}).hasOwnProperty.call(t, r2) && (n[r2] = t[r2]);
      }
      return n;
    }, _extends2.apply(null, arguments);
  }
  function _objectWithoutProperties2(e, t) {
    if (null == e) return {};
    var o, r2, i = _objectWithoutPropertiesLoose2(e, t);
    if (Object.getOwnPropertySymbols) {
      var n = Object.getOwnPropertySymbols(e);
      for (r2 = 0; r2 < n.length; r2++) o = n[r2], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]);
    }
    return i;
  }
  function _objectWithoutPropertiesLoose2(r2, e) {
    if (null == r2) return {};
    var t = {};
    for (var n in r2) if ({}.hasOwnProperty.call(r2, n)) {
      if (-1 !== e.indexOf(n)) continue;
      t[n] = r2[n];
    }
    return t;
  }
  var Layer = /* @__PURE__ */ React3.forwardRef((props, ref) => {
    var {
      children,
      className: className8
    } = props, others = _objectWithoutProperties2(props, _excluded2);
    var layerClass = clsx("recharts-layer", className8);
    return /* @__PURE__ */ React3.createElement("g", _extends2({
      className: layerClass
    }, filterProps(others, true), {
      ref
    }), children);
  });

  // client/node_modules/recharts/es6/context/legendPortalContext.js
  init_define_import_meta_env();
  var import_react5 = __toESM(require_react_shim());
  var LegendPortalContext = /* @__PURE__ */ (0, import_react5.createContext)(null);

  // client/node_modules/victory-vendor/es/d3-shape.js
  init_define_import_meta_env();

  // client/node_modules/d3-shape/src/index.js
  init_define_import_meta_env();

  // client/node_modules/d3-shape/src/constant.js
  init_define_import_meta_env();
  function constant_default(x2) {
    return function constant() {
      return x2;
    };
  }

  // client/node_modules/d3-shape/src/path.js
  init_define_import_meta_env();

  // client/node_modules/d3-path/src/index.js
  init_define_import_meta_env();

  // client/node_modules/d3-path/src/path.js
  init_define_import_meta_env();
  var pi = Math.PI;
  var tau = 2 * pi;
  var epsilon = 1e-6;
  var tauEpsilon = tau - epsilon;
  function append(strings) {
    this._ += strings[0];
    for (let i = 1, n = strings.length; i < n; ++i) {
      this._ += arguments[i] + strings[i];
    }
  }
  function appendRound(digits) {
    let d = Math.floor(digits);
    if (!(d >= 0)) throw new Error(`invalid digits: ${digits}`);
    if (d > 15) return append;
    const k = 10 ** d;
    return function(strings) {
      this._ += strings[0];
      for (let i = 1, n = strings.length; i < n; ++i) {
        this._ += Math.round(arguments[i] * k) / k + strings[i];
      }
    };
  }
  var Path = class {
    constructor(digits) {
      this._x0 = this._y0 = // start of current subpath
      this._x1 = this._y1 = null;
      this._ = "";
      this._append = digits == null ? append : appendRound(digits);
    }
    moveTo(x2, y2) {
      this._append`M${this._x0 = this._x1 = +x2},${this._y0 = this._y1 = +y2}`;
    }
    closePath() {
      if (this._x1 !== null) {
        this._x1 = this._x0, this._y1 = this._y0;
        this._append`Z`;
      }
    }
    lineTo(x2, y2) {
      this._append`L${this._x1 = +x2},${this._y1 = +y2}`;
    }
    quadraticCurveTo(x1, y1, x2, y2) {
      this._append`Q${+x1},${+y1},${this._x1 = +x2},${this._y1 = +y2}`;
    }
    bezierCurveTo(x1, y1, x2, y2, x3, y3) {
      this._append`C${+x1},${+y1},${+x2},${+y2},${this._x1 = +x3},${this._y1 = +y3}`;
    }
    arcTo(x1, y1, x2, y2, r2) {
      x1 = +x1, y1 = +y1, x2 = +x2, y2 = +y2, r2 = +r2;
      if (r2 < 0) throw new Error(`negative radius: ${r2}`);
      let x0 = this._x1, y0 = this._y1, x21 = x2 - x1, y21 = y2 - y1, x01 = x0 - x1, y01 = y0 - y1, l01_2 = x01 * x01 + y01 * y01;
      if (this._x1 === null) {
        this._append`M${this._x1 = x1},${this._y1 = y1}`;
      } else if (!(l01_2 > epsilon)) ;
      else if (!(Math.abs(y01 * x21 - y21 * x01) > epsilon) || !r2) {
        this._append`L${this._x1 = x1},${this._y1 = y1}`;
      } else {
        let x20 = x2 - x0, y20 = y2 - y0, l21_2 = x21 * x21 + y21 * y21, l20_2 = x20 * x20 + y20 * y20, l21 = Math.sqrt(l21_2), l01 = Math.sqrt(l01_2), l = r2 * Math.tan((pi - Math.acos((l21_2 + l01_2 - l20_2) / (2 * l21 * l01))) / 2), t01 = l / l01, t21 = l / l21;
        if (Math.abs(t01 - 1) > epsilon) {
          this._append`L${x1 + t01 * x01},${y1 + t01 * y01}`;
        }
        this._append`A${r2},${r2},0,0,${+(y01 * x20 > x01 * y20)},${this._x1 = x1 + t21 * x21},${this._y1 = y1 + t21 * y21}`;
      }
    }
    arc(x2, y2, r2, a0, a1, ccw) {
      x2 = +x2, y2 = +y2, r2 = +r2, ccw = !!ccw;
      if (r2 < 0) throw new Error(`negative radius: ${r2}`);
      let dx = r2 * Math.cos(a0), dy = r2 * Math.sin(a0), x0 = x2 + dx, y0 = y2 + dy, cw = 1 ^ ccw, da = ccw ? a0 - a1 : a1 - a0;
      if (this._x1 === null) {
        this._append`M${x0},${y0}`;
      } else if (Math.abs(this._x1 - x0) > epsilon || Math.abs(this._y1 - y0) > epsilon) {
        this._append`L${x0},${y0}`;
      }
      if (!r2) return;
      if (da < 0) da = da % tau + tau;
      if (da > tauEpsilon) {
        this._append`A${r2},${r2},0,1,${cw},${x2 - dx},${y2 - dy}A${r2},${r2},0,1,${cw},${this._x1 = x0},${this._y1 = y0}`;
      } else if (da > epsilon) {
        this._append`A${r2},${r2},0,${+(da >= pi)},${cw},${this._x1 = x2 + r2 * Math.cos(a1)},${this._y1 = y2 + r2 * Math.sin(a1)}`;
      }
    }
    rect(x2, y2, w, h) {
      this._append`M${this._x0 = this._x1 = +x2},${this._y0 = this._y1 = +y2}h${w = +w}v${+h}h${-w}Z`;
    }
    toString() {
      return this._;
    }
  };
  function path() {
    return new Path();
  }
  path.prototype = Path.prototype;

  // client/node_modules/d3-shape/src/path.js
  function withPath(shape) {
    let digits = 3;
    shape.digits = function(_) {
      if (!arguments.length) return digits;
      if (_ == null) {
        digits = null;
      } else {
        const d = Math.floor(_);
        if (!(d >= 0)) throw new RangeError(`invalid digits: ${_}`);
        digits = d;
      }
      return shape;
    };
    return () => new Path(digits);
  }

  // client/node_modules/d3-shape/src/area.js
  init_define_import_meta_env();

  // client/node_modules/d3-shape/src/array.js
  init_define_import_meta_env();
  var slice = Array.prototype.slice;
  function array_default(x2) {
    return typeof x2 === "object" && "length" in x2 ? x2 : Array.from(x2);
  }

  // client/node_modules/d3-shape/src/curve/linear.js
  init_define_import_meta_env();
  function Linear(context) {
    this._context = context;
  }
  Linear.prototype = {
    areaStart: function() {
      this._line = 0;
    },
    areaEnd: function() {
      this._line = NaN;
    },
    lineStart: function() {
      this._point = 0;
    },
    lineEnd: function() {
      if (this._line || this._line !== 0 && this._point === 1) this._context.closePath();
      this._line = 1 - this._line;
    },
    point: function(x2, y2) {
      x2 = +x2, y2 = +y2;
      switch (this._point) {
        case 0:
          this._point = 1;
          this._line ? this._context.lineTo(x2, y2) : this._context.moveTo(x2, y2);
          break;
        case 1:
          this._point = 2;
        // falls through
        default:
          this._context.lineTo(x2, y2);
          break;
      }
    }
  };
  function linear_default(context) {
    return new Linear(context);
  }

  // client/node_modules/d3-shape/src/line.js
  init_define_import_meta_env();

  // client/node_modules/d3-shape/src/point.js
  init_define_import_meta_env();
  function x(p) {
    return p[0];
  }
  function y(p) {
    return p[1];
  }

  // client/node_modules/d3-shape/src/line.js
  function line_default(x2, y2) {
    var defined2 = constant_default(true), context = null, curve = linear_default, output = null, path2 = withPath(line);
    x2 = typeof x2 === "function" ? x2 : x2 === void 0 ? x : constant_default(x2);
    y2 = typeof y2 === "function" ? y2 : y2 === void 0 ? y : constant_default(y2);
    function line(data) {
      var i, n = (data = array_default(data)).length, d, defined0 = false, buffer;
      if (context == null) output = curve(buffer = path2());
      for (i = 0; i <= n; ++i) {
        if (!(i < n && defined2(d = data[i], i, data)) === defined0) {
          if (defined0 = !defined0) output.lineStart();
          else output.lineEnd();
        }
        if (defined0) output.point(+x2(d, i, data), +y2(d, i, data));
      }
      if (buffer) return output = null, buffer + "" || null;
    }
    line.x = function(_) {
      return arguments.length ? (x2 = typeof _ === "function" ? _ : constant_default(+_), line) : x2;
    };
    line.y = function(_) {
      return arguments.length ? (y2 = typeof _ === "function" ? _ : constant_default(+_), line) : y2;
    };
    line.defined = function(_) {
      return arguments.length ? (defined2 = typeof _ === "function" ? _ : constant_default(!!_), line) : defined2;
    };
    line.curve = function(_) {
      return arguments.length ? (curve = _, context != null && (output = curve(context)), line) : curve;
    };
    line.context = function(_) {
      return arguments.length ? (_ == null ? context = output = null : output = curve(context = _), line) : context;
    };
    return line;
  }

  // client/node_modules/d3-shape/src/area.js
  function area_default(x0, y0, y1) {
    var x1 = null, defined2 = constant_default(true), context = null, curve = linear_default, output = null, path2 = withPath(area);
    x0 = typeof x0 === "function" ? x0 : x0 === void 0 ? x : constant_default(+x0);
    y0 = typeof y0 === "function" ? y0 : y0 === void 0 ? constant_default(0) : constant_default(+y0);
    y1 = typeof y1 === "function" ? y1 : y1 === void 0 ? y : constant_default(+y1);
    function area(data) {
      var i, j, k, n = (data = array_default(data)).length, d, defined0 = false, buffer, x0z = new Array(n), y0z = new Array(n);
      if (context == null) output = curve(buffer = path2());
      for (i = 0; i <= n; ++i) {
        if (!(i < n && defined2(d = data[i], i, data)) === defined0) {
          if (defined0 = !defined0) {
            j = i;
            output.areaStart();
            output.lineStart();
          } else {
            output.lineEnd();
            output.lineStart();
            for (k = i - 1; k >= j; --k) {
              output.point(x0z[k], y0z[k]);
            }
            output.lineEnd();
            output.areaEnd();
          }
        }
        if (defined0) {
          x0z[i] = +x0(d, i, data), y0z[i] = +y0(d, i, data);
          output.point(x1 ? +x1(d, i, data) : x0z[i], y1 ? +y1(d, i, data) : y0z[i]);
        }
      }
      if (buffer) return output = null, buffer + "" || null;
    }
    function arealine() {
      return line_default().defined(defined2).curve(curve).context(context);
    }
    area.x = function(_) {
      return arguments.length ? (x0 = typeof _ === "function" ? _ : constant_default(+_), x1 = null, area) : x0;
    };
    area.x0 = function(_) {
      return arguments.length ? (x0 = typeof _ === "function" ? _ : constant_default(+_), area) : x0;
    };
    area.x1 = function(_) {
      return arguments.length ? (x1 = _ == null ? null : typeof _ === "function" ? _ : constant_default(+_), area) : x1;
    };
    area.y = function(_) {
      return arguments.length ? (y0 = typeof _ === "function" ? _ : constant_default(+_), y1 = null, area) : y0;
    };
    area.y0 = function(_) {
      return arguments.length ? (y0 = typeof _ === "function" ? _ : constant_default(+_), area) : y0;
    };
    area.y1 = function(_) {
      return arguments.length ? (y1 = _ == null ? null : typeof _ === "function" ? _ : constant_default(+_), area) : y1;
    };
    area.lineX0 = area.lineY0 = function() {
      return arealine().x(x0).y(y0);
    };
    area.lineY1 = function() {
      return arealine().x(x0).y(y1);
    };
    area.lineX1 = function() {
      return arealine().x(x1).y(y0);
    };
    area.defined = function(_) {
      return arguments.length ? (defined2 = typeof _ === "function" ? _ : constant_default(!!_), area) : defined2;
    };
    area.curve = function(_) {
      return arguments.length ? (curve = _, context != null && (output = curve(context)), area) : curve;
    };
    area.context = function(_) {
      return arguments.length ? (_ == null ? context = output = null : output = curve(context = _), area) : context;
    };
    return area;
  }

  // client/node_modules/d3-shape/src/curve/bump.js
  init_define_import_meta_env();
  var Bump = class {
    constructor(context, x2) {
      this._context = context;
      this._x = x2;
    }
    areaStart() {
      this._line = 0;
    }
    areaEnd() {
      this._line = NaN;
    }
    lineStart() {
      this._point = 0;
    }
    lineEnd() {
      if (this._line || this._line !== 0 && this._point === 1) this._context.closePath();
      this._line = 1 - this._line;
    }
    point(x2, y2) {
      x2 = +x2, y2 = +y2;
      switch (this._point) {
        case 0: {
          this._point = 1;
          if (this._line) this._context.lineTo(x2, y2);
          else this._context.moveTo(x2, y2);
          break;
        }
        case 1:
          this._point = 2;
        // falls through
        default: {
          if (this._x) this._context.bezierCurveTo(this._x0 = (this._x0 + x2) / 2, this._y0, this._x0, y2, x2, y2);
          else this._context.bezierCurveTo(this._x0, this._y0 = (this._y0 + y2) / 2, x2, this._y0, x2, y2);
          break;
        }
      }
      this._x0 = x2, this._y0 = y2;
    }
  };
  function bumpX(context) {
    return new Bump(context, true);
  }
  function bumpY(context) {
    return new Bump(context, false);
  }

  // client/node_modules/d3-shape/src/curve/basisClosed.js
  init_define_import_meta_env();

  // client/node_modules/d3-shape/src/noop.js
  init_define_import_meta_env();
  function noop_default() {
  }

  // client/node_modules/d3-shape/src/curve/basis.js
  init_define_import_meta_env();
  function point(that, x2, y2) {
    that._context.bezierCurveTo(
      (2 * that._x0 + that._x1) / 3,
      (2 * that._y0 + that._y1) / 3,
      (that._x0 + 2 * that._x1) / 3,
      (that._y0 + 2 * that._y1) / 3,
      (that._x0 + 4 * that._x1 + x2) / 6,
      (that._y0 + 4 * that._y1 + y2) / 6
    );
  }
  function Basis(context) {
    this._context = context;
  }
  Basis.prototype = {
    areaStart: function() {
      this._line = 0;
    },
    areaEnd: function() {
      this._line = NaN;
    },
    lineStart: function() {
      this._x0 = this._x1 = this._y0 = this._y1 = NaN;
      this._point = 0;
    },
    lineEnd: function() {
      switch (this._point) {
        case 3:
          point(this, this._x1, this._y1);
        // falls through
        case 2:
          this._context.lineTo(this._x1, this._y1);
          break;
      }
      if (this._line || this._line !== 0 && this._point === 1) this._context.closePath();
      this._line = 1 - this._line;
    },
    point: function(x2, y2) {
      x2 = +x2, y2 = +y2;
      switch (this._point) {
        case 0:
          this._point = 1;
          this._line ? this._context.lineTo(x2, y2) : this._context.moveTo(x2, y2);
          break;
        case 1:
          this._point = 2;
          break;
        case 2:
          this._point = 3;
          this._context.lineTo((5 * this._x0 + this._x1) / 6, (5 * this._y0 + this._y1) / 6);
        // falls through
        default:
          point(this, x2, y2);
          break;
      }
      this._x0 = this._x1, this._x1 = x2;
      this._y0 = this._y1, this._y1 = y2;
    }
  };
  function basis_default(context) {
    return new Basis(context);
  }

  // client/node_modules/d3-shape/src/curve/basisClosed.js
  function BasisClosed(context) {
    this._context = context;
  }
  BasisClosed.prototype = {
    areaStart: noop_default,
    areaEnd: noop_default,
    lineStart: function() {
      this._x0 = this._x1 = this._x2 = this._x3 = this._x4 = this._y0 = this._y1 = this._y2 = this._y3 = this._y4 = NaN;
      this._point = 0;
    },
    lineEnd: function() {
      switch (this._point) {
        case 1: {
          this._context.moveTo(this._x2, this._y2);
          this._context.closePath();
          break;
        }
        case 2: {
          this._context.moveTo((this._x2 + 2 * this._x3) / 3, (this._y2 + 2 * this._y3) / 3);
          this._context.lineTo((this._x3 + 2 * this._x2) / 3, (this._y3 + 2 * this._y2) / 3);
          this._context.closePath();
          break;
        }
        case 3: {
          this.point(this._x2, this._y2);
          this.point(this._x3, this._y3);
          this.point(this._x4, this._y4);
          break;
        }
      }
    },
    point: function(x2, y2) {
      x2 = +x2, y2 = +y2;
      switch (this._point) {
        case 0:
          this._point = 1;
          this._x2 = x2, this._y2 = y2;
          break;
        case 1:
          this._point = 2;
          this._x3 = x2, this._y3 = y2;
          break;
        case 2:
          this._point = 3;
          this._x4 = x2, this._y4 = y2;
          this._context.moveTo((this._x0 + 4 * this._x1 + x2) / 6, (this._y0 + 4 * this._y1 + y2) / 6);
          break;
        default:
          point(this, x2, y2);
          break;
      }
      this._x0 = this._x1, this._x1 = x2;
      this._y0 = this._y1, this._y1 = y2;
    }
  };
  function basisClosed_default(context) {
    return new BasisClosed(context);
  }

  // client/node_modules/d3-shape/src/curve/basisOpen.js
  init_define_import_meta_env();
  function BasisOpen(context) {
    this._context = context;
  }
  BasisOpen.prototype = {
    areaStart: function() {
      this._line = 0;
    },
    areaEnd: function() {
      this._line = NaN;
    },
    lineStart: function() {
      this._x0 = this._x1 = this._y0 = this._y1 = NaN;
      this._point = 0;
    },
    lineEnd: function() {
      if (this._line || this._line !== 0 && this._point === 3) this._context.closePath();
      this._line = 1 - this._line;
    },
    point: function(x2, y2) {
      x2 = +x2, y2 = +y2;
      switch (this._point) {
        case 0:
          this._point = 1;
          break;
        case 1:
          this._point = 2;
          break;
        case 2:
          this._point = 3;
          var x0 = (this._x0 + 4 * this._x1 + x2) / 6, y0 = (this._y0 + 4 * this._y1 + y2) / 6;
          this._line ? this._context.lineTo(x0, y0) : this._context.moveTo(x0, y0);
          break;
        case 3:
          this._point = 4;
        // falls through
        default:
          point(this, x2, y2);
          break;
      }
      this._x0 = this._x1, this._x1 = x2;
      this._y0 = this._y1, this._y1 = y2;
    }
  };
  function basisOpen_default(context) {
    return new BasisOpen(context);
  }

  // client/node_modules/d3-shape/src/curve/linearClosed.js
  init_define_import_meta_env();
  function LinearClosed(context) {
    this._context = context;
  }
  LinearClosed.prototype = {
    areaStart: noop_default,
    areaEnd: noop_default,
    lineStart: function() {
      this._point = 0;
    },
    lineEnd: function() {
      if (this._point) this._context.closePath();
    },
    point: function(x2, y2) {
      x2 = +x2, y2 = +y2;
      if (this._point) this._context.lineTo(x2, y2);
      else this._point = 1, this._context.moveTo(x2, y2);
    }
  };
  function linearClosed_default(context) {
    return new LinearClosed(context);
  }

  // client/node_modules/d3-shape/src/curve/monotone.js
  init_define_import_meta_env();
  function sign(x2) {
    return x2 < 0 ? -1 : 1;
  }
  function slope3(that, x2, y2) {
    var h0 = that._x1 - that._x0, h1 = x2 - that._x1, s0 = (that._y1 - that._y0) / (h0 || h1 < 0 && -0), s1 = (y2 - that._y1) / (h1 || h0 < 0 && -0), p = (s0 * h1 + s1 * h0) / (h0 + h1);
    return (sign(s0) + sign(s1)) * Math.min(Math.abs(s0), Math.abs(s1), 0.5 * Math.abs(p)) || 0;
  }
  function slope2(that, t) {
    var h = that._x1 - that._x0;
    return h ? (3 * (that._y1 - that._y0) / h - t) / 2 : t;
  }
  function point2(that, t02, t12) {
    var x0 = that._x0, y0 = that._y0, x1 = that._x1, y1 = that._y1, dx = (x1 - x0) / 3;
    that._context.bezierCurveTo(x0 + dx, y0 + dx * t02, x1 - dx, y1 - dx * t12, x1, y1);
  }
  function MonotoneX(context) {
    this._context = context;
  }
  MonotoneX.prototype = {
    areaStart: function() {
      this._line = 0;
    },
    areaEnd: function() {
      this._line = NaN;
    },
    lineStart: function() {
      this._x0 = this._x1 = this._y0 = this._y1 = this._t0 = NaN;
      this._point = 0;
    },
    lineEnd: function() {
      switch (this._point) {
        case 2:
          this._context.lineTo(this._x1, this._y1);
          break;
        case 3:
          point2(this, this._t0, slope2(this, this._t0));
          break;
      }
      if (this._line || this._line !== 0 && this._point === 1) this._context.closePath();
      this._line = 1 - this._line;
    },
    point: function(x2, y2) {
      var t12 = NaN;
      x2 = +x2, y2 = +y2;
      if (x2 === this._x1 && y2 === this._y1) return;
      switch (this._point) {
        case 0:
          this._point = 1;
          this._line ? this._context.lineTo(x2, y2) : this._context.moveTo(x2, y2);
          break;
        case 1:
          this._point = 2;
          break;
        case 2:
          this._point = 3;
          point2(this, slope2(this, t12 = slope3(this, x2, y2)), t12);
          break;
        default:
          point2(this, this._t0, t12 = slope3(this, x2, y2));
          break;
      }
      this._x0 = this._x1, this._x1 = x2;
      this._y0 = this._y1, this._y1 = y2;
      this._t0 = t12;
    }
  };
  function MonotoneY(context) {
    this._context = new ReflectContext(context);
  }
  (MonotoneY.prototype = Object.create(MonotoneX.prototype)).point = function(x2, y2) {
    MonotoneX.prototype.point.call(this, y2, x2);
  };
  function ReflectContext(context) {
    this._context = context;
  }
  ReflectContext.prototype = {
    moveTo: function(x2, y2) {
      this._context.moveTo(y2, x2);
    },
    closePath: function() {
      this._context.closePath();
    },
    lineTo: function(x2, y2) {
      this._context.lineTo(y2, x2);
    },
    bezierCurveTo: function(x1, y1, x2, y2, x3, y3) {
      this._context.bezierCurveTo(y1, x1, y2, x2, y3, x3);
    }
  };
  function monotoneX(context) {
    return new MonotoneX(context);
  }
  function monotoneY(context) {
    return new MonotoneY(context);
  }

  // client/node_modules/d3-shape/src/curve/natural.js
  init_define_import_meta_env();
  function Natural(context) {
    this._context = context;
  }
  Natural.prototype = {
    areaStart: function() {
      this._line = 0;
    },
    areaEnd: function() {
      this._line = NaN;
    },
    lineStart: function() {
      this._x = [];
      this._y = [];
    },
    lineEnd: function() {
      var x2 = this._x, y2 = this._y, n = x2.length;
      if (n) {
        this._line ? this._context.lineTo(x2[0], y2[0]) : this._context.moveTo(x2[0], y2[0]);
        if (n === 2) {
          this._context.lineTo(x2[1], y2[1]);
        } else {
          var px = controlPoints(x2), py = controlPoints(y2);
          for (var i0 = 0, i1 = 1; i1 < n; ++i0, ++i1) {
            this._context.bezierCurveTo(px[0][i0], py[0][i0], px[1][i0], py[1][i0], x2[i1], y2[i1]);
          }
        }
      }
      if (this._line || this._line !== 0 && n === 1) this._context.closePath();
      this._line = 1 - this._line;
      this._x = this._y = null;
    },
    point: function(x2, y2) {
      this._x.push(+x2);
      this._y.push(+y2);
    }
  };
  function controlPoints(x2) {
    var i, n = x2.length - 1, m, a = new Array(n), b = new Array(n), r2 = new Array(n);
    a[0] = 0, b[0] = 2, r2[0] = x2[0] + 2 * x2[1];
    for (i = 1; i < n - 1; ++i) a[i] = 1, b[i] = 4, r2[i] = 4 * x2[i] + 2 * x2[i + 1];
    a[n - 1] = 2, b[n - 1] = 7, r2[n - 1] = 8 * x2[n - 1] + x2[n];
    for (i = 1; i < n; ++i) m = a[i] / b[i - 1], b[i] -= m, r2[i] -= m * r2[i - 1];
    a[n - 1] = r2[n - 1] / b[n - 1];
    for (i = n - 2; i >= 0; --i) a[i] = (r2[i] - a[i + 1]) / b[i];
    b[n - 1] = (x2[n] + a[n - 1]) / 2;
    for (i = 0; i < n - 1; ++i) b[i] = 2 * x2[i + 1] - a[i + 1];
    return [a, b];
  }
  function natural_default(context) {
    return new Natural(context);
  }

  // client/node_modules/d3-shape/src/curve/step.js
  init_define_import_meta_env();
  function Step(context, t) {
    this._context = context;
    this._t = t;
  }
  Step.prototype = {
    areaStart: function() {
      this._line = 0;
    },
    areaEnd: function() {
      this._line = NaN;
    },
    lineStart: function() {
      this._x = this._y = NaN;
      this._point = 0;
    },
    lineEnd: function() {
      if (0 < this._t && this._t < 1 && this._point === 2) this._context.lineTo(this._x, this._y);
      if (this._line || this._line !== 0 && this._point === 1) this._context.closePath();
      if (this._line >= 0) this._t = 1 - this._t, this._line = 1 - this._line;
    },
    point: function(x2, y2) {
      x2 = +x2, y2 = +y2;
      switch (this._point) {
        case 0:
          this._point = 1;
          this._line ? this._context.lineTo(x2, y2) : this._context.moveTo(x2, y2);
          break;
        case 1:
          this._point = 2;
        // falls through
        default: {
          if (this._t <= 0) {
            this._context.lineTo(this._x, y2);
            this._context.lineTo(x2, y2);
          } else {
            var x1 = this._x * (1 - this._t) + x2 * this._t;
            this._context.lineTo(x1, this._y);
            this._context.lineTo(x1, y2);
          }
          break;
        }
      }
      this._x = x2, this._y = y2;
    }
  };
  function step_default(context) {
    return new Step(context, 0.5);
  }
  function stepBefore(context) {
    return new Step(context, 0);
  }
  function stepAfter(context) {
    return new Step(context, 1);
  }

  // client/node_modules/d3-shape/src/stack.js
  init_define_import_meta_env();

  // client/node_modules/d3-shape/src/offset/none.js
  init_define_import_meta_env();
  function none_default(series, order) {
    if (!((n = series.length) > 1)) return;
    for (var i = 1, j, s0, s1 = series[order[0]], n, m = s1.length; i < n; ++i) {
      s0 = s1, s1 = series[order[i]];
      for (j = 0; j < m; ++j) {
        s1[j][1] += s1[j][0] = isNaN(s0[j][1]) ? s0[j][0] : s0[j][1];
      }
    }
  }

  // client/node_modules/d3-shape/src/order/none.js
  init_define_import_meta_env();
  function none_default2(series) {
    var n = series.length, o = new Array(n);
    while (--n >= 0) o[n] = n;
    return o;
  }

  // client/node_modules/d3-shape/src/stack.js
  function stackValue(d, key) {
    return d[key];
  }
  function stackSeries(key) {
    const series = [];
    series.key = key;
    return series;
  }
  function stack_default() {
    var keys = constant_default([]), order = none_default2, offset = none_default, value = stackValue;
    function stack(data) {
      var sz = Array.from(keys.apply(this, arguments), stackSeries), i, n = sz.length, j = -1, oz;
      for (const d of data) {
        for (i = 0, ++j; i < n; ++i) {
          (sz[i][j] = [0, +value(d, sz[i].key, j, data)]).data = d;
        }
      }
      for (i = 0, oz = array_default(order(sz)); i < n; ++i) {
        sz[oz[i]].index = i;
      }
      offset(sz, oz);
      return sz;
    }
    stack.keys = function(_) {
      return arguments.length ? (keys = typeof _ === "function" ? _ : constant_default(Array.from(_)), stack) : keys;
    };
    stack.value = function(_) {
      return arguments.length ? (value = typeof _ === "function" ? _ : constant_default(+_), stack) : value;
    };
    stack.order = function(_) {
      return arguments.length ? (order = _ == null ? none_default2 : typeof _ === "function" ? _ : constant_default(Array.from(_)), stack) : order;
    };
    stack.offset = function(_) {
      return arguments.length ? (offset = _ == null ? none_default : _, stack) : offset;
    };
    return stack;
  }

  // client/node_modules/d3-shape/src/offset/expand.js
  init_define_import_meta_env();
  function expand_default(series, order) {
    if (!((n = series.length) > 0)) return;
    for (var i, n, j = 0, m = series[0].length, y2; j < m; ++j) {
      for (y2 = i = 0; i < n; ++i) y2 += series[i][j][1] || 0;
      if (y2) for (i = 0; i < n; ++i) series[i][j][1] /= y2;
    }
    none_default(series, order);
  }

  // client/node_modules/d3-shape/src/offset/silhouette.js
  init_define_import_meta_env();
  function silhouette_default(series, order) {
    if (!((n = series.length) > 0)) return;
    for (var j = 0, s0 = series[order[0]], n, m = s0.length; j < m; ++j) {
      for (var i = 0, y2 = 0; i < n; ++i) y2 += series[i][j][1] || 0;
      s0[j][1] += s0[j][0] = -y2 / 2;
    }
    none_default(series, order);
  }

  // client/node_modules/d3-shape/src/offset/wiggle.js
  init_define_import_meta_env();
  function wiggle_default(series, order) {
    if (!((n = series.length) > 0) || !((m = (s0 = series[order[0]]).length) > 0)) return;
    for (var y2 = 0, j = 1, s0, m, n; j < m; ++j) {
      for (var i = 0, s1 = 0, s2 = 0; i < n; ++i) {
        var si = series[order[i]], sij0 = si[j][1] || 0, sij1 = si[j - 1][1] || 0, s3 = (sij0 - sij1) / 2;
        for (var k = 0; k < i; ++k) {
          var sk = series[order[k]], skj0 = sk[j][1] || 0, skj1 = sk[j - 1][1] || 0;
          s3 += skj0 - skj1;
        }
        s1 += sij0, s2 += s3 * sij0;
      }
      s0[j - 1][1] += s0[j - 1][0] = y2;
      if (s1) y2 -= s2 / s1;
    }
    s0[j - 1][1] += s0[j - 1][0] = y2;
    none_default(series, order);
  }

  // client/node_modules/recharts/es6/state/hooks.js
  init_define_import_meta_env();
  var import_with_selector = __toESM(require_with_selector());
  var import_react7 = __toESM(require_react_shim());

  // client/node_modules/recharts/es6/state/RechartsReduxContext.js
  init_define_import_meta_env();
  var import_react6 = __toESM(require_react_shim());
  var RechartsReduxContext = /* @__PURE__ */ (0, import_react6.createContext)(null);

  // client/node_modules/recharts/es6/state/hooks.js
  var noopDispatch = (a) => a;
  var useAppDispatch = () => {
    var context = (0, import_react7.useContext)(RechartsReduxContext);
    if (context) {
      return context.store.dispatch;
    }
    return noopDispatch;
  };
  var noop = () => {
  };
  var addNestedSubNoop = () => noop;
  var refEquality = (a, b) => a === b;
  function useAppSelector(selector) {
    var context = (0, import_react7.useContext)(RechartsReduxContext);
    return (0, import_with_selector.useSyncExternalStoreWithSelector)(context ? context.subscription.addNestedSub : addNestedSubNoop, context ? context.store.getState : noop, context ? context.store.getState : noop, context ? selector : noop, refEquality);
  }

  // client/node_modules/recharts/es6/state/selectors/legendSelectors.js
  init_define_import_meta_env();

  // client/node_modules/reselect/dist/reselect.mjs
  init_define_import_meta_env();
  var runIdentityFunctionCheck = (resultFunc, inputSelectorsResults, outputSelectorResult) => {
    if (inputSelectorsResults.length === 1 && inputSelectorsResults[0] === outputSelectorResult) {
      let isInputSameAsOutput = false;
      try {
        const emptyObject = {};
        if (resultFunc(emptyObject) === emptyObject)
          isInputSameAsOutput = true;
      } catch {
      }
      if (isInputSameAsOutput) {
        let stack = void 0;
        try {
          throw new Error();
        } catch (e) {
          ;
          ({ stack } = e);
        }
        console.warn(
          "The result function returned its own inputs without modification. e.g\n`createSelector([state => state.todos], todos => todos)`\nThis could lead to inefficient memoization and unnecessary re-renders.\nEnsure transformation logic is in the result function, and extraction logic is in the input selectors.",
          { stack }
        );
      }
    }
  };
  var runInputStabilityCheck = (inputSelectorResultsObject, options, inputSelectorArgs) => {
    const { memoize: memoize2, memoizeOptions } = options;
    const { inputSelectorResults, inputSelectorResultsCopy } = inputSelectorResultsObject;
    const createAnEmptyObject = memoize2(() => ({}), ...memoizeOptions);
    const areInputSelectorResultsEqual = createAnEmptyObject.apply(null, inputSelectorResults) === createAnEmptyObject.apply(null, inputSelectorResultsCopy);
    if (!areInputSelectorResultsEqual) {
      let stack = void 0;
      try {
        throw new Error();
      } catch (e) {
        ;
        ({ stack } = e);
      }
      console.warn(
        "An input selector returned a different result when passed same arguments.\nThis means your output selector will likely run more frequently than intended.\nAvoid returning a new reference inside your input selector, e.g.\n`createSelector([state => state.todos.map(todo => todo.id)], todoIds => todoIds.length)`",
        {
          arguments: inputSelectorArgs,
          firstInputs: inputSelectorResults,
          secondInputs: inputSelectorResultsCopy,
          stack
        }
      );
    }
  };
  var globalDevModeChecks = {
    inputStabilityCheck: "once",
    identityFunctionCheck: "once"
  };
  function assertIsFunction(func, errorMessage = `expected a function, instead received ${typeof func}`) {
    if (typeof func !== "function") {
      throw new TypeError(errorMessage);
    }
  }
  function assertIsObject(object, errorMessage = `expected an object, instead received ${typeof object}`) {
    if (typeof object !== "object") {
      throw new TypeError(errorMessage);
    }
  }
  function assertIsArrayOfFunctions(array, errorMessage = `expected all items to be functions, instead received the following types: `) {
    if (!array.every((item) => typeof item === "function")) {
      const itemTypes = array.map(
        (item) => typeof item === "function" ? `function ${item.name || "unnamed"}()` : typeof item
      ).join(", ");
      throw new TypeError(`${errorMessage}[${itemTypes}]`);
    }
  }
  var ensureIsArray = (item) => {
    return Array.isArray(item) ? item : [item];
  };
  function getDependencies(createSelectorArgs) {
    const dependencies = Array.isArray(createSelectorArgs[0]) ? createSelectorArgs[0] : createSelectorArgs;
    assertIsArrayOfFunctions(
      dependencies,
      `createSelector expects all input-selectors to be functions, but received the following types: `
    );
    return dependencies;
  }
  function collectInputSelectorResults(dependencies, inputSelectorArgs) {
    const inputSelectorResults = [];
    const { length } = dependencies;
    for (let i = 0; i < length; i++) {
      inputSelectorResults.push(dependencies[i].apply(null, inputSelectorArgs));
    }
    return inputSelectorResults;
  }
  var getDevModeChecksExecutionInfo = (firstRun, devModeChecks) => {
    const { identityFunctionCheck, inputStabilityCheck } = {
      ...globalDevModeChecks,
      ...devModeChecks
    };
    return {
      identityFunctionCheck: {
        shouldRun: identityFunctionCheck === "always" || identityFunctionCheck === "once" && firstRun,
        run: runIdentityFunctionCheck
      },
      inputStabilityCheck: {
        shouldRun: inputStabilityCheck === "always" || inputStabilityCheck === "once" && firstRun,
        run: runInputStabilityCheck
      }
    };
  };
  var proto = Object.getPrototypeOf({});
  var StrongRef = class {
    constructor(value) {
      this.value = value;
    }
    deref() {
      return this.value;
    }
  };
  var Ref = typeof WeakRef !== "undefined" ? WeakRef : StrongRef;
  var UNTERMINATED = 0;
  var TERMINATED = 1;
  function createCacheNode() {
    return {
      s: UNTERMINATED,
      v: void 0,
      o: null,
      p: null
    };
  }
  function weakMapMemoize(func, options = {}) {
    let fnNode = createCacheNode();
    const { resultEqualityCheck } = options;
    let lastResult2;
    let resultsCount = 0;
    function memoized() {
      let cacheNode = fnNode;
      const { length } = arguments;
      for (let i = 0, l = length; i < l; i++) {
        const arg = arguments[i];
        if (typeof arg === "function" || typeof arg === "object" && arg !== null) {
          let objectCache = cacheNode.o;
          if (objectCache === null) {
            cacheNode.o = objectCache = /* @__PURE__ */ new WeakMap();
          }
          const objectNode = objectCache.get(arg);
          if (objectNode === void 0) {
            cacheNode = createCacheNode();
            objectCache.set(arg, cacheNode);
          } else {
            cacheNode = objectNode;
          }
        } else {
          let primitiveCache = cacheNode.p;
          if (primitiveCache === null) {
            cacheNode.p = primitiveCache = /* @__PURE__ */ new Map();
          }
          const primitiveNode = primitiveCache.get(arg);
          if (primitiveNode === void 0) {
            cacheNode = createCacheNode();
            primitiveCache.set(arg, cacheNode);
          } else {
            cacheNode = primitiveNode;
          }
        }
      }
      const terminatedNode = cacheNode;
      let result;
      if (cacheNode.s === TERMINATED) {
        result = cacheNode.v;
      } else {
        result = func.apply(null, arguments);
        resultsCount++;
        if (resultEqualityCheck) {
          const lastResultValue = lastResult2?.deref?.() ?? lastResult2;
          if (lastResultValue != null && resultEqualityCheck(lastResultValue, result)) {
            result = lastResultValue;
            resultsCount !== 0 && resultsCount--;
          }
          const needsWeakRef = typeof result === "object" && result !== null || typeof result === "function";
          lastResult2 = needsWeakRef ? new Ref(result) : result;
        }
      }
      terminatedNode.s = TERMINATED;
      terminatedNode.v = result;
      return result;
    }
    memoized.clearCache = () => {
      fnNode = createCacheNode();
      memoized.resetResultsCount();
    };
    memoized.resultsCount = () => resultsCount;
    memoized.resetResultsCount = () => {
      resultsCount = 0;
    };
    return memoized;
  }
  function createSelectorCreator(memoizeOrOptions, ...memoizeOptionsFromArgs) {
    const createSelectorCreatorOptions = typeof memoizeOrOptions === "function" ? {
      memoize: memoizeOrOptions,
      memoizeOptions: memoizeOptionsFromArgs
    } : memoizeOrOptions;
    const createSelector2 = (...createSelectorArgs) => {
      let recomputations = 0;
      let dependencyRecomputations = 0;
      let lastResult2;
      let directlyPassedOptions = {};
      let resultFunc = createSelectorArgs.pop();
      if (typeof resultFunc === "object") {
        directlyPassedOptions = resultFunc;
        resultFunc = createSelectorArgs.pop();
      }
      assertIsFunction(
        resultFunc,
        `createSelector expects an output function after the inputs, but received: [${typeof resultFunc}]`
      );
      const combinedOptions = {
        ...createSelectorCreatorOptions,
        ...directlyPassedOptions
      };
      const {
        memoize: memoize2,
        memoizeOptions = [],
        argsMemoize = weakMapMemoize,
        argsMemoizeOptions = [],
        devModeChecks = {}
      } = combinedOptions;
      const finalMemoizeOptions = ensureIsArray(memoizeOptions);
      const finalArgsMemoizeOptions = ensureIsArray(argsMemoizeOptions);
      const dependencies = getDependencies(createSelectorArgs);
      const memoizedResultFunc = memoize2(function recomputationWrapper() {
        recomputations++;
        return resultFunc.apply(
          null,
          arguments
        );
      }, ...finalMemoizeOptions);
      let firstRun = true;
      const selector = argsMemoize(function dependenciesChecker() {
        dependencyRecomputations++;
        const inputSelectorResults = collectInputSelectorResults(
          dependencies,
          arguments
        );
        lastResult2 = memoizedResultFunc.apply(null, inputSelectorResults);
        if (true) {
          const { identityFunctionCheck, inputStabilityCheck } = getDevModeChecksExecutionInfo(firstRun, devModeChecks);
          if (identityFunctionCheck.shouldRun) {
            identityFunctionCheck.run(
              resultFunc,
              inputSelectorResults,
              lastResult2
            );
          }
          if (inputStabilityCheck.shouldRun) {
            const inputSelectorResultsCopy = collectInputSelectorResults(
              dependencies,
              arguments
            );
            inputStabilityCheck.run(
              { inputSelectorResults, inputSelectorResultsCopy },
              { memoize: memoize2, memoizeOptions: finalMemoizeOptions },
              arguments
            );
          }
          if (firstRun)
            firstRun = false;
        }
        return lastResult2;
      }, ...finalArgsMemoizeOptions);
      return Object.assign(selector, {
        resultFunc,
        memoizedResultFunc,
        dependencies,
        dependencyRecomputations: () => dependencyRecomputations,
        resetDependencyRecomputations: () => {
          dependencyRecomputations = 0;
        },
        lastResult: () => lastResult2,
        recomputations: () => recomputations,
        resetRecomputations: () => {
          recomputations = 0;
        },
        memoize: memoize2,
        argsMemoize
      });
    };
    Object.assign(createSelector2, {
      withTypes: () => createSelector2
    });
    return createSelector2;
  }
  var createSelector = /* @__PURE__ */ createSelectorCreator(weakMapMemoize);
  var createStructuredSelector = Object.assign(
    (inputSelectorsObject, selectorCreator = createSelector) => {
      assertIsObject(
        inputSelectorsObject,
        `createStructuredSelector expects first argument to be an object where each property is a selector, instead received a ${typeof inputSelectorsObject}`
      );
      const inputSelectorKeys = Object.keys(inputSelectorsObject);
      const dependencies = inputSelectorKeys.map(
        (key) => inputSelectorsObject[key]
      );
      const structuredSelector = selectorCreator(
        dependencies,
        (...inputSelectorResults) => {
          return inputSelectorResults.reduce((composition, value, index) => {
            composition[inputSelectorKeys[index]] = value;
            return composition;
          }, {});
        }
      );
      return structuredSelector;
    },
    { withTypes: () => createStructuredSelector }
  );

  // client/node_modules/recharts/es6/state/selectors/legendSelectors.js
  var selectLegendSettings = (state) => state.legend.settings;
  var selectLegendSize = (state) => state.legend.size;
  var selectAllLegendPayload2DArray = (state) => state.legend.payload;
  var selectLegendPayload = createSelector([selectAllLegendPayload2DArray], (payloads) => payloads.flat(1));

  // client/node_modules/recharts/es6/context/chartLayoutContext.js
  init_define_import_meta_env();
  var import_react10 = __toESM(require_react_shim());

  // client/node_modules/recharts/es6/state/layoutSlice.js
  init_define_import_meta_env();

  // client/node_modules/recharts/node_modules/@reduxjs/toolkit/dist/redux-toolkit.modern.mjs
  init_define_import_meta_env();

  // client/node_modules/recharts/node_modules/redux/dist/redux.mjs
  init_define_import_meta_env();
  var $$observable = /* @__PURE__ */ (() => typeof Symbol === "function" && Symbol.observable || "@@observable")();
  var symbol_observable_default = $$observable;
  var randomString = () => Math.random().toString(36).substring(7).split("").join(".");
  var ActionTypes = {
    INIT: `@@redux/INIT${/* @__PURE__ */ randomString()}`,
    REPLACE: `@@redux/REPLACE${/* @__PURE__ */ randomString()}`,
    PROBE_UNKNOWN_ACTION: () => `@@redux/PROBE_UNKNOWN_ACTION${randomString()}`
  };
  var actionTypes_default = ActionTypes;
  function isPlainObject(obj) {
    if (typeof obj !== "object" || obj === null)
      return false;
    let proto2 = obj;
    while (Object.getPrototypeOf(proto2) !== null) {
      proto2 = Object.getPrototypeOf(proto2);
    }
    return Object.getPrototypeOf(obj) === proto2 || Object.getPrototypeOf(obj) === null;
  }
  function miniKindOf(val) {
    if (val === void 0)
      return "undefined";
    if (val === null)
      return "null";
    const type = typeof val;
    switch (type) {
      case "boolean":
      case "string":
      case "number":
      case "symbol":
      case "function": {
        return type;
      }
    }
    if (Array.isArray(val))
      return "array";
    if (isDate(val))
      return "date";
    if (isError(val))
      return "error";
    const constructorName = ctorName(val);
    switch (constructorName) {
      case "Symbol":
      case "Promise":
      case "WeakMap":
      case "WeakSet":
      case "Map":
      case "Set":
        return constructorName;
    }
    return Object.prototype.toString.call(val).slice(8, -1).toLowerCase().replace(/\s/g, "");
  }
  function ctorName(val) {
    return typeof val.constructor === "function" ? val.constructor.name : null;
  }
  function isError(val) {
    return val instanceof Error || typeof val.message === "string" && val.constructor && typeof val.constructor.stackTraceLimit === "number";
  }
  function isDate(val) {
    if (val instanceof Date)
      return true;
    return typeof val.toDateString === "function" && typeof val.getDate === "function" && typeof val.setDate === "function";
  }
  function kindOf(val) {
    let typeOfVal = typeof val;
    if (true) {
      typeOfVal = miniKindOf(val);
    }
    return typeOfVal;
  }
  function createStore(reducer, preloadedState, enhancer) {
    if (typeof reducer !== "function") {
      throw new Error(false ? formatProdErrorMessage(2) : `Expected the root reducer to be a function. Instead, received: '${kindOf(reducer)}'`);
    }
    if (typeof preloadedState === "function" && typeof enhancer === "function" || typeof enhancer === "function" && typeof arguments[3] === "function") {
      throw new Error(false ? formatProdErrorMessage(0) : "It looks like you are passing several store enhancers to createStore(). This is not supported. Instead, compose them together to a single function. See https://redux.js.org/tutorials/fundamentals/part-4-store#creating-a-store-with-enhancers for an example.");
    }
    if (typeof preloadedState === "function" && typeof enhancer === "undefined") {
      enhancer = preloadedState;
      preloadedState = void 0;
    }
    if (typeof enhancer !== "undefined") {
      if (typeof enhancer !== "function") {
        throw new Error(false ? formatProdErrorMessage(1) : `Expected the enhancer to be a function. Instead, received: '${kindOf(enhancer)}'`);
      }
      return enhancer(createStore)(reducer, preloadedState);
    }
    let currentReducer = reducer;
    let currentState = preloadedState;
    let currentListeners = /* @__PURE__ */ new Map();
    let nextListeners = currentListeners;
    let listenerIdCounter = 0;
    let isDispatching = false;
    function ensureCanMutateNextListeners() {
      if (nextListeners === currentListeners) {
        nextListeners = /* @__PURE__ */ new Map();
        currentListeners.forEach((listener2, key) => {
          nextListeners.set(key, listener2);
        });
      }
    }
    function getState() {
      if (isDispatching) {
        throw new Error(false ? formatProdErrorMessage(3) : "You may not call store.getState() while the reducer is executing. The reducer has already received the state as an argument. Pass it down from the top reducer instead of reading it from the store.");
      }
      return currentState;
    }
    function subscribe(listener2) {
      if (typeof listener2 !== "function") {
        throw new Error(false ? formatProdErrorMessage(4) : `Expected the listener to be a function. Instead, received: '${kindOf(listener2)}'`);
      }
      if (isDispatching) {
        throw new Error(false ? formatProdErrorMessage(5) : "You may not call store.subscribe() while the reducer is executing. If you would like to be notified after the store has been updated, subscribe from a component and invoke store.getState() in the callback to access the latest state. See https://redux.js.org/api/store#subscribelistener for more details.");
      }
      let isSubscribed = true;
      ensureCanMutateNextListeners();
      const listenerId = listenerIdCounter++;
      nextListeners.set(listenerId, listener2);
      return function unsubscribe() {
        if (!isSubscribed) {
          return;
        }
        if (isDispatching) {
          throw new Error(false ? formatProdErrorMessage(6) : "You may not unsubscribe from a store listener while the reducer is executing. See https://redux.js.org/api/store#subscribelistener for more details.");
        }
        isSubscribed = false;
        ensureCanMutateNextListeners();
        nextListeners.delete(listenerId);
        currentListeners = null;
      };
    }
    function dispatch(action) {
      if (!isPlainObject(action)) {
        throw new Error(false ? formatProdErrorMessage(7) : `Actions must be plain objects. Instead, the actual type was: '${kindOf(action)}'. You may need to add middleware to your store setup to handle dispatching other values, such as 'redux-thunk' to handle dispatching functions. See https://redux.js.org/tutorials/fundamentals/part-4-store#middleware and https://redux.js.org/tutorials/fundamentals/part-6-async-logic#using-the-redux-thunk-middleware for examples.`);
      }
      if (typeof action.type === "undefined") {
        throw new Error(false ? formatProdErrorMessage(8) : 'Actions may not have an undefined "type" property. You may have misspelled an action type string constant.');
      }
      if (typeof action.type !== "string") {
        throw new Error(false ? formatProdErrorMessage(17) : `Action "type" property must be a string. Instead, the actual type was: '${kindOf(action.type)}'. Value was: '${action.type}' (stringified)`);
      }
      if (isDispatching) {
        throw new Error(false ? formatProdErrorMessage(9) : "Reducers may not dispatch actions.");
      }
      try {
        isDispatching = true;
        currentState = currentReducer(currentState, action);
      } finally {
        isDispatching = false;
      }
      const listeners = currentListeners = nextListeners;
      listeners.forEach((listener2) => {
        listener2();
      });
      return action;
    }
    function replaceReducer(nextReducer) {
      if (typeof nextReducer !== "function") {
        throw new Error(false ? formatProdErrorMessage(10) : `Expected the nextReducer to be a function. Instead, received: '${kindOf(nextReducer)}`);
      }
      currentReducer = nextReducer;
      dispatch({
        type: actionTypes_default.REPLACE
      });
    }
    function observable() {
      const outerSubscribe = subscribe;
      return {
        /**
         * The minimal observable subscription method.
         * @param observer Any object that can be used as an observer.
         * The observer object should have a `next` method.
         * @returns An object with an `unsubscribe` method that can
         * be used to unsubscribe the observable from the store, and prevent further
         * emission of values from the observable.
         */
        subscribe(observer) {
          if (typeof observer !== "object" || observer === null) {
            throw new Error(false ? formatProdErrorMessage(11) : `Expected the observer to be an object. Instead, received: '${kindOf(observer)}'`);
          }
          function observeState() {
            const observerAsObserver = observer;
            if (observerAsObserver.next) {
              observerAsObserver.next(getState());
            }
          }
          observeState();
          const unsubscribe = outerSubscribe(observeState);
          return {
            unsubscribe
          };
        },
        [symbol_observable_default]() {
          return this;
        }
      };
    }
    dispatch({
      type: actionTypes_default.INIT
    });
    const store = {
      dispatch,
      subscribe,
      getState,
      replaceReducer,
      [symbol_observable_default]: observable
    };
    return store;
  }
  function warning(message) {
    if (typeof console !== "undefined" && typeof console.error === "function") {
      console.error(message);
    }
    try {
      throw new Error(message);
    } catch (e) {
    }
  }
  function getUnexpectedStateShapeWarningMessage(inputState, reducers, action, unexpectedKeyCache) {
    const reducerKeys = Object.keys(reducers);
    const argumentName = action && action.type === actionTypes_default.INIT ? "preloadedState argument passed to createStore" : "previous state received by the reducer";
    if (reducerKeys.length === 0) {
      return "Store does not have a valid reducer. Make sure the argument passed to combineReducers is an object whose values are reducers.";
    }
    if (!isPlainObject(inputState)) {
      return `The ${argumentName} has unexpected type of "${kindOf(inputState)}". Expected argument to be an object with the following keys: "${reducerKeys.join('", "')}"`;
    }
    const unexpectedKeys = Object.keys(inputState).filter((key) => !reducers.hasOwnProperty(key) && !unexpectedKeyCache[key]);
    unexpectedKeys.forEach((key) => {
      unexpectedKeyCache[key] = true;
    });
    if (action && action.type === actionTypes_default.REPLACE)
      return;
    if (unexpectedKeys.length > 0) {
      return `Unexpected ${unexpectedKeys.length > 1 ? "keys" : "key"} "${unexpectedKeys.join('", "')}" found in ${argumentName}. Expected to find one of the known reducer keys instead: "${reducerKeys.join('", "')}". Unexpected keys will be ignored.`;
    }
  }
  function assertReducerShape(reducers) {
    Object.keys(reducers).forEach((key) => {
      const reducer = reducers[key];
      const initialState11 = reducer(void 0, {
        type: actionTypes_default.INIT
      });
      if (typeof initialState11 === "undefined") {
        throw new Error(false ? formatProdErrorMessage(12) : `The slice reducer for key "${key}" returned undefined during initialization. If the state passed to the reducer is undefined, you must explicitly return the initial state. The initial state may not be undefined. If you don't want to set a value for this reducer, you can use null instead of undefined.`);
      }
      if (typeof reducer(void 0, {
        type: actionTypes_default.PROBE_UNKNOWN_ACTION()
      }) === "undefined") {
        throw new Error(false ? formatProdErrorMessage(13) : `The slice reducer for key "${key}" returned undefined when probed with a random type. Don't try to handle '${actionTypes_default.INIT}' or other actions in "redux/*" namespace. They are considered private. Instead, you must return the current state for any unknown actions, unless it is undefined, in which case you must return the initial state, regardless of the action type. The initial state may not be undefined, but can be null.`);
      }
    });
  }
  function combineReducers(reducers) {
    const reducerKeys = Object.keys(reducers);
    const finalReducers = {};
    for (let i = 0; i < reducerKeys.length; i++) {
      const key = reducerKeys[i];
      if (true) {
        if (typeof reducers[key] === "undefined") {
          warning(`No reducer provided for key "${key}"`);
        }
      }
      if (typeof reducers[key] === "function") {
        finalReducers[key] = reducers[key];
      }
    }
    const finalReducerKeys = Object.keys(finalReducers);
    let unexpectedKeyCache;
    if (true) {
      unexpectedKeyCache = {};
    }
    let shapeAssertionError;
    try {
      assertReducerShape(finalReducers);
    } catch (e) {
      shapeAssertionError = e;
    }
    return function combination(state = {}, action) {
      if (shapeAssertionError) {
        throw shapeAssertionError;
      }
      if (true) {
        const warningMessage = getUnexpectedStateShapeWarningMessage(state, finalReducers, action, unexpectedKeyCache);
        if (warningMessage) {
          warning(warningMessage);
        }
      }
      let hasChanged = false;
      const nextState = {};
      for (let i = 0; i < finalReducerKeys.length; i++) {
        const key = finalReducerKeys[i];
        const reducer = finalReducers[key];
        const previousStateForKey = state[key];
        const nextStateForKey = reducer(previousStateForKey, action);
        if (typeof nextStateForKey === "undefined") {
          const actionType = action && action.type;
          throw new Error(false ? formatProdErrorMessage(14) : `When called with an action of type ${actionType ? `"${String(actionType)}"` : "(unknown type)"}, the slice reducer for key "${key}" returned undefined. To ignore an action, you must explicitly return the previous state. If you want this reducer to hold no value, you can return null instead of undefined.`);
        }
        nextState[key] = nextStateForKey;
        hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
      }
      hasChanged = hasChanged || finalReducerKeys.length !== Object.keys(state).length;
      return hasChanged ? nextState : state;
    };
  }
  function compose(...funcs) {
    if (funcs.length === 0) {
      return (arg) => arg;
    }
    if (funcs.length === 1) {
      return funcs[0];
    }
    return funcs.reduce((a, b) => (...args) => a(b(...args)));
  }
  function applyMiddleware(...middlewares) {
    return (createStore2) => (reducer, preloadedState) => {
      const store = createStore2(reducer, preloadedState);
      let dispatch = () => {
        throw new Error(false ? formatProdErrorMessage(15) : "Dispatching while constructing your middleware is not allowed. Other middleware would not be applied to this dispatch.");
      };
      const middlewareAPI = {
        getState: store.getState,
        dispatch: (action, ...args) => dispatch(action, ...args)
      };
      const chain = middlewares.map((middleware) => middleware(middlewareAPI));
      dispatch = compose(...chain)(store.dispatch);
      return {
        ...store,
        dispatch
      };
    };
  }
  function isAction(action) {
    return isPlainObject(action) && "type" in action && typeof action.type === "string";
  }

  // client/node_modules/immer/dist/immer.mjs
  init_define_import_meta_env();
  var NOTHING = /* @__PURE__ */ Symbol.for("immer-nothing");
  var DRAFTABLE = /* @__PURE__ */ Symbol.for("immer-draftable");
  var DRAFT_STATE = /* @__PURE__ */ Symbol.for("immer-state");
  var errors = true ? [
    // All error codes, starting by 0:
    function(plugin) {
      return `The plugin for '${plugin}' has not been loaded into Immer. To enable the plugin, import and call \`enable${plugin}()\` when initializing your application.`;
    },
    function(thing) {
      return `produce can only be called on things that are draftable: plain objects, arrays, Map, Set or classes that are marked with '[immerable]: true'. Got '${thing}'`;
    },
    "This object has been frozen and should not be mutated",
    function(data) {
      return "Cannot use a proxy that has been revoked. Did you pass an object from inside an immer function to an async process? " + data;
    },
    "An immer producer returned a new value *and* modified its draft. Either return a new value *or* modify the draft.",
    "Immer forbids circular references",
    "The first or second argument to `produce` must be a function",
    "The third argument to `produce` must be a function or undefined",
    "First argument to `createDraft` must be a plain object, an array, or an immerable object",
    "First argument to `finishDraft` must be a draft returned by `createDraft`",
    function(thing) {
      return `'current' expects a draft, got: ${thing}`;
    },
    "Object.defineProperty() cannot be used on an Immer draft",
    "Object.setPrototypeOf() cannot be used on an Immer draft",
    "Immer only supports deleting array indices",
    "Immer only supports setting array indices and the 'length' property",
    function(thing) {
      return `'original' expects a draft, got: ${thing}`;
    }
    // Note: if more errors are added, the errorOffset in Patches.ts should be increased
    // See Patches.ts for additional errors
  ] : [];
  function die(error, ...args) {
    if (true) {
      const e = errors[error];
      const msg = typeof e === "function" ? e.apply(null, args) : e;
      throw new Error(`[Immer] ${msg}`);
    }
    throw new Error(
      `[Immer] minified error nr: ${error}. Full error at: https://bit.ly/3cXEKWf`
    );
  }
  var getPrototypeOf = Object.getPrototypeOf;
  function isDraft(value) {
    return !!value && !!value[DRAFT_STATE];
  }
  function isDraftable(value) {
    if (!value)
      return false;
    return isPlainObject2(value) || Array.isArray(value) || !!value[DRAFTABLE] || !!value.constructor?.[DRAFTABLE] || isMap(value) || isSet(value);
  }
  var objectCtorString = Object.prototype.constructor.toString();
  function isPlainObject2(value) {
    if (!value || typeof value !== "object")
      return false;
    const proto2 = getPrototypeOf(value);
    if (proto2 === null) {
      return true;
    }
    const Ctor = Object.hasOwnProperty.call(proto2, "constructor") && proto2.constructor;
    if (Ctor === Object)
      return true;
    return typeof Ctor == "function" && Function.toString.call(Ctor) === objectCtorString;
  }
  function each(obj, iter) {
    if (getArchtype(obj) === 0) {
      Reflect.ownKeys(obj).forEach((key) => {
        iter(key, obj[key], obj);
      });
    } else {
      obj.forEach((entry, index) => iter(index, entry, obj));
    }
  }
  function getArchtype(thing) {
    const state = thing[DRAFT_STATE];
    return state ? state.type_ : Array.isArray(thing) ? 1 : isMap(thing) ? 2 : isSet(thing) ? 3 : 0;
  }
  function has(thing, prop) {
    return getArchtype(thing) === 2 ? thing.has(prop) : Object.prototype.hasOwnProperty.call(thing, prop);
  }
  function set(thing, propOrOldValue, value) {
    const t = getArchtype(thing);
    if (t === 2)
      thing.set(propOrOldValue, value);
    else if (t === 3) {
      thing.add(value);
    } else
      thing[propOrOldValue] = value;
  }
  function is(x2, y2) {
    if (x2 === y2) {
      return x2 !== 0 || 1 / x2 === 1 / y2;
    } else {
      return x2 !== x2 && y2 !== y2;
    }
  }
  function isMap(target) {
    return target instanceof Map;
  }
  function isSet(target) {
    return target instanceof Set;
  }
  function latest(state) {
    return state.copy_ || state.base_;
  }
  function shallowCopy(base, strict) {
    if (isMap(base)) {
      return new Map(base);
    }
    if (isSet(base)) {
      return new Set(base);
    }
    if (Array.isArray(base))
      return Array.prototype.slice.call(base);
    const isPlain2 = isPlainObject2(base);
    if (strict === true || strict === "class_only" && !isPlain2) {
      const descriptors = Object.getOwnPropertyDescriptors(base);
      delete descriptors[DRAFT_STATE];
      let keys = Reflect.ownKeys(descriptors);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const desc = descriptors[key];
        if (desc.writable === false) {
          desc.writable = true;
          desc.configurable = true;
        }
        if (desc.get || desc.set)
          descriptors[key] = {
            configurable: true,
            writable: true,
            // could live with !!desc.set as well here...
            enumerable: desc.enumerable,
            value: base[key]
          };
      }
      return Object.create(getPrototypeOf(base), descriptors);
    } else {
      const proto2 = getPrototypeOf(base);
      if (proto2 !== null && isPlain2) {
        return { ...base };
      }
      const obj = Object.create(proto2);
      return Object.assign(obj, base);
    }
  }
  function freeze(obj, deep = false) {
    if (isFrozen(obj) || isDraft(obj) || !isDraftable(obj))
      return obj;
    if (getArchtype(obj) > 1) {
      obj.set = obj.add = obj.clear = obj.delete = dontMutateFrozenCollections;
    }
    Object.freeze(obj);
    if (deep)
      Object.entries(obj).forEach(([key, value]) => freeze(value, true));
    return obj;
  }
  function dontMutateFrozenCollections() {
    die(2);
  }
  function isFrozen(obj) {
    return Object.isFrozen(obj);
  }
  var plugins = {};
  function getPlugin(pluginKey) {
    const plugin = plugins[pluginKey];
    if (!plugin) {
      die(0, pluginKey);
    }
    return plugin;
  }
  var currentScope;
  function getCurrentScope() {
    return currentScope;
  }
  function createScope(parent_, immer_) {
    return {
      drafts_: [],
      parent_,
      immer_,
      // Whenever the modified draft contains a draft from another scope, we
      // need to prevent auto-freezing so the unowned draft can be finalized.
      canAutoFreeze_: true,
      unfinalizedDrafts_: 0
    };
  }
  function usePatchesInScope(scope, patchListener) {
    if (patchListener) {
      getPlugin("Patches");
      scope.patches_ = [];
      scope.inversePatches_ = [];
      scope.patchListener_ = patchListener;
    }
  }
  function revokeScope(scope) {
    leaveScope(scope);
    scope.drafts_.forEach(revokeDraft);
    scope.drafts_ = null;
  }
  function leaveScope(scope) {
    if (scope === currentScope) {
      currentScope = scope.parent_;
    }
  }
  function enterScope(immer2) {
    return currentScope = createScope(currentScope, immer2);
  }
  function revokeDraft(draft) {
    const state = draft[DRAFT_STATE];
    if (state.type_ === 0 || state.type_ === 1)
      state.revoke_();
    else
      state.revoked_ = true;
  }
  function processResult(result, scope) {
    scope.unfinalizedDrafts_ = scope.drafts_.length;
    const baseDraft = scope.drafts_[0];
    const isReplaced = result !== void 0 && result !== baseDraft;
    if (isReplaced) {
      if (baseDraft[DRAFT_STATE].modified_) {
        revokeScope(scope);
        die(4);
      }
      if (isDraftable(result)) {
        result = finalize(scope, result);
        if (!scope.parent_)
          maybeFreeze(scope, result);
      }
      if (scope.patches_) {
        getPlugin("Patches").generateReplacementPatches_(
          baseDraft[DRAFT_STATE].base_,
          result,
          scope.patches_,
          scope.inversePatches_
        );
      }
    } else {
      result = finalize(scope, baseDraft, []);
    }
    revokeScope(scope);
    if (scope.patches_) {
      scope.patchListener_(scope.patches_, scope.inversePatches_);
    }
    return result !== NOTHING ? result : void 0;
  }
  function finalize(rootScope, value, path2) {
    if (isFrozen(value))
      return value;
    const state = value[DRAFT_STATE];
    if (!state) {
      each(
        value,
        (key, childValue) => finalizeProperty(rootScope, state, value, key, childValue, path2)
      );
      return value;
    }
    if (state.scope_ !== rootScope)
      return value;
    if (!state.modified_) {
      maybeFreeze(rootScope, state.base_, true);
      return state.base_;
    }
    if (!state.finalized_) {
      state.finalized_ = true;
      state.scope_.unfinalizedDrafts_--;
      const result = state.copy_;
      let resultEach = result;
      let isSet2 = false;
      if (state.type_ === 3) {
        resultEach = new Set(result);
        result.clear();
        isSet2 = true;
      }
      each(
        resultEach,
        (key, childValue) => finalizeProperty(rootScope, state, result, key, childValue, path2, isSet2)
      );
      maybeFreeze(rootScope, result, false);
      if (path2 && rootScope.patches_) {
        getPlugin("Patches").generatePatches_(
          state,
          path2,
          rootScope.patches_,
          rootScope.inversePatches_
        );
      }
    }
    return state.copy_;
  }
  function finalizeProperty(rootScope, parentState, targetObject, prop, childValue, rootPath, targetIsSet) {
    if (childValue === targetObject)
      die(5);
    if (isDraft(childValue)) {
      const path2 = rootPath && parentState && parentState.type_ !== 3 && // Set objects are atomic since they have no keys.
      !has(parentState.assigned_, prop) ? rootPath.concat(prop) : void 0;
      const res = finalize(rootScope, childValue, path2);
      set(targetObject, prop, res);
      if (isDraft(res)) {
        rootScope.canAutoFreeze_ = false;
      } else
        return;
    } else if (targetIsSet) {
      targetObject.add(childValue);
    }
    if (isDraftable(childValue) && !isFrozen(childValue)) {
      if (!rootScope.immer_.autoFreeze_ && rootScope.unfinalizedDrafts_ < 1) {
        return;
      }
      finalize(rootScope, childValue);
      if ((!parentState || !parentState.scope_.parent_) && typeof prop !== "symbol" && Object.prototype.propertyIsEnumerable.call(targetObject, prop))
        maybeFreeze(rootScope, childValue);
    }
  }
  function maybeFreeze(scope, value, deep = false) {
    if (!scope.parent_ && scope.immer_.autoFreeze_ && scope.canAutoFreeze_) {
      freeze(value, deep);
    }
  }
  function createProxyProxy(base, parent) {
    const isArray = Array.isArray(base);
    const state = {
      type_: isArray ? 1 : 0,
      // Track which produce call this is associated with.
      scope_: parent ? parent.scope_ : getCurrentScope(),
      // True for both shallow and deep changes.
      modified_: false,
      // Used during finalization.
      finalized_: false,
      // Track which properties have been assigned (true) or deleted (false).
      assigned_: {},
      // The parent draft state.
      parent_: parent,
      // The base state.
      base_: base,
      // The base proxy.
      draft_: null,
      // set below
      // The base copy with any updated values.
      copy_: null,
      // Called by the `produce` function.
      revoke_: null,
      isManual_: false
    };
    let target = state;
    let traps = objectTraps;
    if (isArray) {
      target = [state];
      traps = arrayTraps;
    }
    const { revoke, proxy } = Proxy.revocable(target, traps);
    state.draft_ = proxy;
    state.revoke_ = revoke;
    return proxy;
  }
  var objectTraps = {
    get(state, prop) {
      if (prop === DRAFT_STATE)
        return state;
      const source = latest(state);
      if (!has(source, prop)) {
        return readPropFromProto(state, source, prop);
      }
      const value = source[prop];
      if (state.finalized_ || !isDraftable(value)) {
        return value;
      }
      if (value === peek(state.base_, prop)) {
        prepareCopy(state);
        return state.copy_[prop] = createProxy(value, state);
      }
      return value;
    },
    has(state, prop) {
      return prop in latest(state);
    },
    ownKeys(state) {
      return Reflect.ownKeys(latest(state));
    },
    set(state, prop, value) {
      const desc = getDescriptorFromProto(latest(state), prop);
      if (desc?.set) {
        desc.set.call(state.draft_, value);
        return true;
      }
      if (!state.modified_) {
        const current2 = peek(latest(state), prop);
        const currentState = current2?.[DRAFT_STATE];
        if (currentState && currentState.base_ === value) {
          state.copy_[prop] = value;
          state.assigned_[prop] = false;
          return true;
        }
        if (is(value, current2) && (value !== void 0 || has(state.base_, prop)))
          return true;
        prepareCopy(state);
        markChanged(state);
      }
      if (state.copy_[prop] === value && // special case: handle new props with value 'undefined'
      (value !== void 0 || prop in state.copy_) || // special case: NaN
      Number.isNaN(value) && Number.isNaN(state.copy_[prop]))
        return true;
      state.copy_[prop] = value;
      state.assigned_[prop] = true;
      return true;
    },
    deleteProperty(state, prop) {
      if (peek(state.base_, prop) !== void 0 || prop in state.base_) {
        state.assigned_[prop] = false;
        prepareCopy(state);
        markChanged(state);
      } else {
        delete state.assigned_[prop];
      }
      if (state.copy_) {
        delete state.copy_[prop];
      }
      return true;
    },
    // Note: We never coerce `desc.value` into an Immer draft, because we can't make
    // the same guarantee in ES5 mode.
    getOwnPropertyDescriptor(state, prop) {
      const owner = latest(state);
      const desc = Reflect.getOwnPropertyDescriptor(owner, prop);
      if (!desc)
        return desc;
      return {
        writable: true,
        configurable: state.type_ !== 1 || prop !== "length",
        enumerable: desc.enumerable,
        value: owner[prop]
      };
    },
    defineProperty() {
      die(11);
    },
    getPrototypeOf(state) {
      return getPrototypeOf(state.base_);
    },
    setPrototypeOf() {
      die(12);
    }
  };
  var arrayTraps = {};
  each(objectTraps, (key, fn) => {
    arrayTraps[key] = function() {
      arguments[0] = arguments[0][0];
      return fn.apply(this, arguments);
    };
  });
  arrayTraps.deleteProperty = function(state, prop) {
    if (isNaN(parseInt(prop)))
      die(13);
    return arrayTraps.set.call(this, state, prop, void 0);
  };
  arrayTraps.set = function(state, prop, value) {
    if (prop !== "length" && isNaN(parseInt(prop)))
      die(14);
    return objectTraps.set.call(this, state[0], prop, value, state[0]);
  };
  function peek(draft, prop) {
    const state = draft[DRAFT_STATE];
    const source = state ? latest(state) : draft;
    return source[prop];
  }
  function readPropFromProto(state, source, prop) {
    const desc = getDescriptorFromProto(source, prop);
    return desc ? `value` in desc ? desc.value : (
      // This is a very special case, if the prop is a getter defined by the
      // prototype, we should invoke it with the draft as context!
      desc.get?.call(state.draft_)
    ) : void 0;
  }
  function getDescriptorFromProto(source, prop) {
    if (!(prop in source))
      return void 0;
    let proto2 = getPrototypeOf(source);
    while (proto2) {
      const desc = Object.getOwnPropertyDescriptor(proto2, prop);
      if (desc)
        return desc;
      proto2 = getPrototypeOf(proto2);
    }
    return void 0;
  }
  function markChanged(state) {
    if (!state.modified_) {
      state.modified_ = true;
      if (state.parent_) {
        markChanged(state.parent_);
      }
    }
  }
  function prepareCopy(state) {
    if (!state.copy_) {
      state.copy_ = shallowCopy(
        state.base_,
        state.scope_.immer_.useStrictShallowCopy_
      );
    }
  }
  var Immer2 = class {
    constructor(config) {
      this.autoFreeze_ = true;
      this.useStrictShallowCopy_ = false;
      this.produce = (base, recipe, patchListener) => {
        if (typeof base === "function" && typeof recipe !== "function") {
          const defaultBase = recipe;
          recipe = base;
          const self2 = this;
          return function curriedProduce(base2 = defaultBase, ...args) {
            return self2.produce(base2, (draft) => recipe.call(this, draft, ...args));
          };
        }
        if (typeof recipe !== "function")
          die(6);
        if (patchListener !== void 0 && typeof patchListener !== "function")
          die(7);
        let result;
        if (isDraftable(base)) {
          const scope = enterScope(this);
          const proxy = createProxy(base, void 0);
          let hasError = true;
          try {
            result = recipe(proxy);
            hasError = false;
          } finally {
            if (hasError)
              revokeScope(scope);
            else
              leaveScope(scope);
          }
          usePatchesInScope(scope, patchListener);
          return processResult(result, scope);
        } else if (!base || typeof base !== "object") {
          result = recipe(base);
          if (result === void 0)
            result = base;
          if (result === NOTHING)
            result = void 0;
          if (this.autoFreeze_)
            freeze(result, true);
          if (patchListener) {
            const p = [];
            const ip = [];
            getPlugin("Patches").generateReplacementPatches_(base, result, p, ip);
            patchListener(p, ip);
          }
          return result;
        } else
          die(1, base);
      };
      this.produceWithPatches = (base, recipe) => {
        if (typeof base === "function") {
          return (state, ...args) => this.produceWithPatches(state, (draft) => base(draft, ...args));
        }
        let patches, inversePatches;
        const result = this.produce(base, recipe, (p, ip) => {
          patches = p;
          inversePatches = ip;
        });
        return [result, patches, inversePatches];
      };
      if (typeof config?.autoFreeze === "boolean")
        this.setAutoFreeze(config.autoFreeze);
      if (typeof config?.useStrictShallowCopy === "boolean")
        this.setUseStrictShallowCopy(config.useStrictShallowCopy);
    }
    createDraft(base) {
      if (!isDraftable(base))
        die(8);
      if (isDraft(base))
        base = current(base);
      const scope = enterScope(this);
      const proxy = createProxy(base, void 0);
      proxy[DRAFT_STATE].isManual_ = true;
      leaveScope(scope);
      return proxy;
    }
    finishDraft(draft, patchListener) {
      const state = draft && draft[DRAFT_STATE];
      if (!state || !state.isManual_)
        die(9);
      const { scope_: scope } = state;
      usePatchesInScope(scope, patchListener);
      return processResult(void 0, scope);
    }
    /**
     * Pass true to automatically freeze all copies created by Immer.
     *
     * By default, auto-freezing is enabled.
     */
    setAutoFreeze(value) {
      this.autoFreeze_ = value;
    }
    /**
     * Pass true to enable strict shallow copy.
     *
     * By default, immer does not copy the object descriptors such as getter, setter and non-enumrable properties.
     */
    setUseStrictShallowCopy(value) {
      this.useStrictShallowCopy_ = value;
    }
    applyPatches(base, patches) {
      let i;
      for (i = patches.length - 1; i >= 0; i--) {
        const patch = patches[i];
        if (patch.path.length === 0 && patch.op === "replace") {
          base = patch.value;
          break;
        }
      }
      if (i > -1) {
        patches = patches.slice(i + 1);
      }
      const applyPatchesImpl = getPlugin("Patches").applyPatches_;
      if (isDraft(base)) {
        return applyPatchesImpl(base, patches);
      }
      return this.produce(
        base,
        (draft) => applyPatchesImpl(draft, patches)
      );
    }
  };
  function createProxy(value, parent) {
    const draft = isMap(value) ? getPlugin("MapSet").proxyMap_(value, parent) : isSet(value) ? getPlugin("MapSet").proxySet_(value, parent) : createProxyProxy(value, parent);
    const scope = parent ? parent.scope_ : getCurrentScope();
    scope.drafts_.push(draft);
    return draft;
  }
  function current(value) {
    if (!isDraft(value))
      die(10, value);
    return currentImpl(value);
  }
  function currentImpl(value) {
    if (!isDraftable(value) || isFrozen(value))
      return value;
    const state = value[DRAFT_STATE];
    let copy3;
    if (state) {
      if (!state.modified_)
        return state.base_;
      state.finalized_ = true;
      copy3 = shallowCopy(value, state.scope_.immer_.useStrictShallowCopy_);
    } else {
      copy3 = shallowCopy(value, true);
    }
    each(copy3, (key, childValue) => {
      set(copy3, key, currentImpl(childValue));
    });
    if (state) {
      state.finalized_ = false;
    }
    return copy3;
  }
  var immer = new Immer2();
  var produce = immer.produce;
  var produceWithPatches = immer.produceWithPatches.bind(
    immer
  );
  var setAutoFreeze = immer.setAutoFreeze.bind(immer);
  var setUseStrictShallowCopy = immer.setUseStrictShallowCopy.bind(immer);
  var applyPatches = immer.applyPatches.bind(immer);
  var createDraft = immer.createDraft.bind(immer);
  var finishDraft = immer.finishDraft.bind(immer);
  function castDraft(value) {
    return value;
  }

  // client/node_modules/recharts/node_modules/redux-thunk/dist/redux-thunk.mjs
  init_define_import_meta_env();
  function createThunkMiddleware(extraArgument) {
    const middleware = ({ dispatch, getState }) => (next) => (action) => {
      if (typeof action === "function") {
        return action(dispatch, getState, extraArgument);
      }
      return next(action);
    };
    return middleware;
  }
  var thunk = createThunkMiddleware();
  var withExtraArgument = createThunkMiddleware;

  // client/node_modules/recharts/node_modules/@reduxjs/toolkit/dist/redux-toolkit.modern.mjs
  var composeWithDevTools = typeof window !== "undefined" && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ : function() {
    if (arguments.length === 0) return void 0;
    if (typeof arguments[0] === "object") return compose;
    return compose.apply(null, arguments);
  };
  var devToolsEnhancer = typeof window !== "undefined" && window.__REDUX_DEVTOOLS_EXTENSION__ ? window.__REDUX_DEVTOOLS_EXTENSION__ : function() {
    return function(noop32) {
      return noop32;
    };
  };
  var hasMatchFunction = (v) => {
    return v && typeof v.match === "function";
  };
  function createAction(type, prepareAction) {
    function actionCreator(...args) {
      if (prepareAction) {
        let prepared = prepareAction(...args);
        if (!prepared) {
          throw new Error(false ? formatProdErrorMessage(0) : "prepareAction did not return an object");
        }
        return {
          type,
          payload: prepared.payload,
          ..."meta" in prepared && {
            meta: prepared.meta
          },
          ..."error" in prepared && {
            error: prepared.error
          }
        };
      }
      return {
        type,
        payload: args[0]
      };
    }
    actionCreator.toString = () => `${type}`;
    actionCreator.type = type;
    actionCreator.match = (action) => isAction(action) && action.type === type;
    return actionCreator;
  }
  function isActionCreator(action) {
    return typeof action === "function" && "type" in action && // hasMatchFunction only wants Matchers but I don't see the point in rewriting it
    hasMatchFunction(action);
  }
  function getMessage(type) {
    const splitType = type ? `${type}`.split("/") : [];
    const actionName = splitType[splitType.length - 1] || "actionCreator";
    return `Detected an action creator with type "${type || "unknown"}" being dispatched. 
Make sure you're calling the action creator before dispatching, i.e. \`dispatch(${actionName}())\` instead of \`dispatch(${actionName})\`. This is necessary even if the action has no payload.`;
  }
  function createActionCreatorInvariantMiddleware(options = {}) {
    if (false) {
      return () => (next) => (action) => next(action);
    }
    const {
      isActionCreator: isActionCreator2 = isActionCreator
    } = options;
    return () => (next) => (action) => {
      if (isActionCreator2(action)) {
        console.warn(getMessage(action.type));
      }
      return next(action);
    };
  }
  function getTimeMeasureUtils(maxDelay, fnName) {
    let elapsed = 0;
    return {
      measureTime(fn) {
        const started = Date.now();
        try {
          return fn();
        } finally {
          const finished = Date.now();
          elapsed += finished - started;
        }
      },
      warnIfExceeded() {
        if (elapsed > maxDelay) {
          console.warn(`${fnName} took ${elapsed}ms, which is more than the warning threshold of ${maxDelay}ms. 
If your state or actions are very large, you may want to disable the middleware as it might cause too much of a slowdown in development mode. See https://redux-toolkit.js.org/api/getDefaultMiddleware for instructions.
It is disabled in production builds, so you don't need to worry about that.`);
        }
      }
    };
  }
  var Tuple = class _Tuple extends Array {
    constructor(...items) {
      super(...items);
      Object.setPrototypeOf(this, _Tuple.prototype);
    }
    static get [Symbol.species]() {
      return _Tuple;
    }
    concat(...arr) {
      return super.concat.apply(this, arr);
    }
    prepend(...arr) {
      if (arr.length === 1 && Array.isArray(arr[0])) {
        return new _Tuple(...arr[0].concat(this));
      }
      return new _Tuple(...arr.concat(this));
    }
  };
  function freezeDraftable(val) {
    return isDraftable(val) ? produce(val, () => {
    }) : val;
  }
  function getOrInsertComputed(map3, key, compute) {
    if (map3.has(key)) return map3.get(key);
    return map3.set(key, compute(key)).get(key);
  }
  function isImmutableDefault(value) {
    return typeof value !== "object" || value == null || Object.isFrozen(value);
  }
  function trackForMutations(isImmutable, ignorePaths, obj) {
    const trackedProperties = trackProperties(isImmutable, ignorePaths, obj);
    return {
      detectMutations() {
        return detectMutations(isImmutable, ignorePaths, trackedProperties, obj);
      }
    };
  }
  function trackProperties(isImmutable, ignorePaths = [], obj, path2 = "", checkedObjects = /* @__PURE__ */ new Set()) {
    const tracked = {
      value: obj
    };
    if (!isImmutable(obj) && !checkedObjects.has(obj)) {
      checkedObjects.add(obj);
      tracked.children = {};
      for (const key in obj) {
        const childPath = path2 ? path2 + "." + key : key;
        if (ignorePaths.length && ignorePaths.indexOf(childPath) !== -1) {
          continue;
        }
        tracked.children[key] = trackProperties(isImmutable, ignorePaths, obj[key], childPath);
      }
    }
    return tracked;
  }
  function detectMutations(isImmutable, ignoredPaths = [], trackedProperty, obj, sameParentRef = false, path2 = "") {
    const prevObj = trackedProperty ? trackedProperty.value : void 0;
    const sameRef = prevObj === obj;
    if (sameParentRef && !sameRef && !Number.isNaN(obj)) {
      return {
        wasMutated: true,
        path: path2
      };
    }
    if (isImmutable(prevObj) || isImmutable(obj)) {
      return {
        wasMutated: false
      };
    }
    const keysToDetect = {};
    for (let key in trackedProperty.children) {
      keysToDetect[key] = true;
    }
    for (let key in obj) {
      keysToDetect[key] = true;
    }
    const hasIgnoredPaths = ignoredPaths.length > 0;
    for (let key in keysToDetect) {
      const nestedPath = path2 ? path2 + "." + key : key;
      if (hasIgnoredPaths) {
        const hasMatches = ignoredPaths.some((ignored) => {
          if (ignored instanceof RegExp) {
            return ignored.test(nestedPath);
          }
          return nestedPath === ignored;
        });
        if (hasMatches) {
          continue;
        }
      }
      const result = detectMutations(isImmutable, ignoredPaths, trackedProperty.children[key], obj[key], sameRef, nestedPath);
      if (result.wasMutated) {
        return result;
      }
    }
    return {
      wasMutated: false
    };
  }
  function createImmutableStateInvariantMiddleware(options = {}) {
    if (false) {
      return () => (next) => (action) => next(action);
    } else {
      let stringify2 = function(obj, serializer, indent, decycler) {
        return JSON.stringify(obj, getSerialize2(serializer, decycler), indent);
      }, getSerialize2 = function(serializer, decycler) {
        let stack = [], keys = [];
        if (!decycler) decycler = function(_, value) {
          if (stack[0] === value) return "[Circular ~]";
          return "[Circular ~." + keys.slice(0, stack.indexOf(value)).join(".") + "]";
        };
        return function(key, value) {
          if (stack.length > 0) {
            var thisPos = stack.indexOf(this);
            ~thisPos ? stack.splice(thisPos + 1) : stack.push(this);
            ~thisPos ? keys.splice(thisPos, Infinity, key) : keys.push(key);
            if (~stack.indexOf(value)) value = decycler.call(this, key, value);
          } else stack.push(value);
          return serializer == null ? value : serializer.call(this, key, value);
        };
      };
      var stringify = stringify2, getSerialize = getSerialize2;
      let {
        isImmutable = isImmutableDefault,
        ignoredPaths,
        warnAfter = 32
      } = options;
      const track = trackForMutations.bind(null, isImmutable, ignoredPaths);
      return ({
        getState
      }) => {
        let state = getState();
        let tracker = track(state);
        let result;
        return (next) => (action) => {
          const measureUtils = getTimeMeasureUtils(warnAfter, "ImmutableStateInvariantMiddleware");
          measureUtils.measureTime(() => {
            state = getState();
            result = tracker.detectMutations();
            tracker = track(state);
            if (result.wasMutated) {
              throw new Error(false ? formatProdErrorMessage(19) : `A state mutation was detected between dispatches, in the path '${result.path || ""}'.  This may cause incorrect behavior. (https://redux.js.org/style-guide/style-guide#do-not-mutate-state)`);
            }
          });
          const dispatchedAction = next(action);
          measureUtils.measureTime(() => {
            state = getState();
            result = tracker.detectMutations();
            tracker = track(state);
            if (result.wasMutated) {
              throw new Error(false ? formatProdErrorMessage(20) : `A state mutation was detected inside a dispatch, in the path: ${result.path || ""}. Take a look at the reducer(s) handling the action ${stringify2(action)}. (https://redux.js.org/style-guide/style-guide#do-not-mutate-state)`);
            }
          });
          measureUtils.warnIfExceeded();
          return dispatchedAction;
        };
      };
    }
  }
  function isPlain(val) {
    const type = typeof val;
    return val == null || type === "string" || type === "boolean" || type === "number" || Array.isArray(val) || isPlainObject(val);
  }
  function findNonSerializableValue(value, path2 = "", isSerializable = isPlain, getEntries, ignoredPaths = [], cache) {
    let foundNestedSerializable;
    if (!isSerializable(value)) {
      return {
        keyPath: path2 || "<root>",
        value
      };
    }
    if (typeof value !== "object" || value === null) {
      return false;
    }
    if (cache?.has(value)) return false;
    const entries = getEntries != null ? getEntries(value) : Object.entries(value);
    const hasIgnoredPaths = ignoredPaths.length > 0;
    for (const [key, nestedValue] of entries) {
      const nestedPath = path2 ? path2 + "." + key : key;
      if (hasIgnoredPaths) {
        const hasMatches = ignoredPaths.some((ignored) => {
          if (ignored instanceof RegExp) {
            return ignored.test(nestedPath);
          }
          return nestedPath === ignored;
        });
        if (hasMatches) {
          continue;
        }
      }
      if (!isSerializable(nestedValue)) {
        return {
          keyPath: nestedPath,
          value: nestedValue
        };
      }
      if (typeof nestedValue === "object") {
        foundNestedSerializable = findNonSerializableValue(nestedValue, nestedPath, isSerializable, getEntries, ignoredPaths, cache);
        if (foundNestedSerializable) {
          return foundNestedSerializable;
        }
      }
    }
    if (cache && isNestedFrozen(value)) cache.add(value);
    return false;
  }
  function isNestedFrozen(value) {
    if (!Object.isFrozen(value)) return false;
    for (const nestedValue of Object.values(value)) {
      if (typeof nestedValue !== "object" || nestedValue === null) continue;
      if (!isNestedFrozen(nestedValue)) return false;
    }
    return true;
  }
  function createSerializableStateInvariantMiddleware(options = {}) {
    if (false) {
      return () => (next) => (action) => next(action);
    } else {
      const {
        isSerializable = isPlain,
        getEntries,
        ignoredActions = [],
        ignoredActionPaths = ["meta.arg", "meta.baseQueryMeta"],
        ignoredPaths = [],
        warnAfter = 32,
        ignoreState = false,
        ignoreActions = false,
        disableCache = false
      } = options;
      const cache = !disableCache && WeakSet ? /* @__PURE__ */ new WeakSet() : void 0;
      return (storeAPI) => (next) => (action) => {
        if (!isAction(action)) {
          return next(action);
        }
        const result = next(action);
        const measureUtils = getTimeMeasureUtils(warnAfter, "SerializableStateInvariantMiddleware");
        if (!ignoreActions && !(ignoredActions.length && ignoredActions.indexOf(action.type) !== -1)) {
          measureUtils.measureTime(() => {
            const foundActionNonSerializableValue = findNonSerializableValue(action, "", isSerializable, getEntries, ignoredActionPaths, cache);
            if (foundActionNonSerializableValue) {
              const {
                keyPath,
                value
              } = foundActionNonSerializableValue;
              console.error(`A non-serializable value was detected in an action, in the path: \`${keyPath}\`. Value:`, value, "\nTake a look at the logic that dispatched this action: ", action, "\n(See https://redux.js.org/faq/actions#why-should-type-be-a-string-or-at-least-serializable-why-should-my-action-types-be-constants)", "\n(To allow non-serializable values see: https://redux-toolkit.js.org/usage/usage-guide#working-with-non-serializable-data)");
            }
          });
        }
        if (!ignoreState) {
          measureUtils.measureTime(() => {
            const state = storeAPI.getState();
            const foundStateNonSerializableValue = findNonSerializableValue(state, "", isSerializable, getEntries, ignoredPaths, cache);
            if (foundStateNonSerializableValue) {
              const {
                keyPath,
                value
              } = foundStateNonSerializableValue;
              console.error(`A non-serializable value was detected in the state, in the path: \`${keyPath}\`. Value:`, value, `
Take a look at the reducer(s) handling this action type: ${action.type}.
(See https://redux.js.org/faq/organizing-state#can-i-put-functions-promises-or-other-non-serializable-items-in-my-store-state)`);
            }
          });
          measureUtils.warnIfExceeded();
        }
        return result;
      };
    }
  }
  function isBoolean(x2) {
    return typeof x2 === "boolean";
  }
  var buildGetDefaultMiddleware = () => function getDefaultMiddleware(options) {
    const {
      thunk: thunk2 = true,
      immutableCheck = true,
      serializableCheck = true,
      actionCreatorCheck = true
    } = options ?? {};
    let middlewareArray = new Tuple();
    if (thunk2) {
      if (isBoolean(thunk2)) {
        middlewareArray.push(thunk);
      } else {
        middlewareArray.push(withExtraArgument(thunk2.extraArgument));
      }
    }
    if (true) {
      if (immutableCheck) {
        let immutableOptions = {};
        if (!isBoolean(immutableCheck)) {
          immutableOptions = immutableCheck;
        }
        middlewareArray.unshift(createImmutableStateInvariantMiddleware(immutableOptions));
      }
      if (serializableCheck) {
        let serializableOptions = {};
        if (!isBoolean(serializableCheck)) {
          serializableOptions = serializableCheck;
        }
        middlewareArray.push(createSerializableStateInvariantMiddleware(serializableOptions));
      }
      if (actionCreatorCheck) {
        let actionCreatorOptions = {};
        if (!isBoolean(actionCreatorCheck)) {
          actionCreatorOptions = actionCreatorCheck;
        }
        middlewareArray.unshift(createActionCreatorInvariantMiddleware(actionCreatorOptions));
      }
    }
    return middlewareArray;
  };
  var SHOULD_AUTOBATCH = "RTK_autoBatch";
  var createQueueWithTimer = (timeout) => {
    return (notify) => {
      setTimeout(notify, timeout);
    };
  };
  var autoBatchEnhancer = (options = {
    type: "raf"
  }) => (next) => (...args) => {
    const store = next(...args);
    let notifying = true;
    let shouldNotifyAtEndOfTick = false;
    let notificationQueued = false;
    const listeners = /* @__PURE__ */ new Set();
    const queueCallback = options.type === "tick" ? queueMicrotask : options.type === "raf" ? (
      // requestAnimationFrame won't exist in SSR environments. Fall back to a vague approximation just to keep from erroring.
      typeof window !== "undefined" && window.requestAnimationFrame ? window.requestAnimationFrame : createQueueWithTimer(10)
    ) : options.type === "callback" ? options.queueNotification : createQueueWithTimer(options.timeout);
    const notifyListeners = () => {
      notificationQueued = false;
      if (shouldNotifyAtEndOfTick) {
        shouldNotifyAtEndOfTick = false;
        listeners.forEach((l) => l());
      }
    };
    return Object.assign({}, store, {
      // Override the base `store.subscribe` method to keep original listeners
      // from running if we're delaying notifications
      subscribe(listener2) {
        const wrappedListener = () => notifying && listener2();
        const unsubscribe = store.subscribe(wrappedListener);
        listeners.add(listener2);
        return () => {
          unsubscribe();
          listeners.delete(listener2);
        };
      },
      // Override the base `store.dispatch` method so that we can check actions
      // for the `shouldAutoBatch` flag and determine if batching is active
      dispatch(action) {
        try {
          notifying = !action?.meta?.[SHOULD_AUTOBATCH];
          shouldNotifyAtEndOfTick = !notifying;
          if (shouldNotifyAtEndOfTick) {
            if (!notificationQueued) {
              notificationQueued = true;
              queueCallback(notifyListeners);
            }
          }
          return store.dispatch(action);
        } finally {
          notifying = true;
        }
      }
    });
  };
  var buildGetDefaultEnhancers = (middlewareEnhancer) => function getDefaultEnhancers(options) {
    const {
      autoBatch = true
    } = options ?? {};
    let enhancerArray = new Tuple(middlewareEnhancer);
    if (autoBatch) {
      enhancerArray.push(autoBatchEnhancer(typeof autoBatch === "object" ? autoBatch : void 0));
    }
    return enhancerArray;
  };
  function configureStore(options) {
    const getDefaultMiddleware = buildGetDefaultMiddleware();
    const {
      reducer = void 0,
      middleware,
      devTools = true,
      duplicateMiddlewareCheck = true,
      preloadedState = void 0,
      enhancers = void 0
    } = options || {};
    let rootReducer2;
    if (typeof reducer === "function") {
      rootReducer2 = reducer;
    } else if (isPlainObject(reducer)) {
      rootReducer2 = combineReducers(reducer);
    } else {
      throw new Error(false ? formatProdErrorMessage(1) : "`reducer` is a required argument, and must be a function or an object of functions that can be passed to combineReducers");
    }
    if (middleware && typeof middleware !== "function") {
      throw new Error(false ? formatProdErrorMessage(2) : "`middleware` field must be a callback");
    }
    let finalMiddleware;
    if (typeof middleware === "function") {
      finalMiddleware = middleware(getDefaultMiddleware);
      if (!Array.isArray(finalMiddleware)) {
        throw new Error(false ? formatProdErrorMessage(3) : "when using a middleware builder function, an array of middleware must be returned");
      }
    } else {
      finalMiddleware = getDefaultMiddleware();
    }
    if (finalMiddleware.some((item) => typeof item !== "function")) {
      throw new Error(false ? formatProdErrorMessage(4) : "each middleware provided to configureStore must be a function");
    }
    if (duplicateMiddlewareCheck) {
      let middlewareReferences = /* @__PURE__ */ new Set();
      finalMiddleware.forEach((middleware2) => {
        if (middlewareReferences.has(middleware2)) {
          throw new Error(false ? formatProdErrorMessage(42) : "Duplicate middleware references found when creating the store. Ensure that each middleware is only included once.");
        }
        middlewareReferences.add(middleware2);
      });
    }
    let finalCompose = compose;
    if (devTools) {
      finalCompose = composeWithDevTools({
        // Enable capture of stack traces for dispatched Redux actions
        trace: true,
        ...typeof devTools === "object" && devTools
      });
    }
    const middlewareEnhancer = applyMiddleware(...finalMiddleware);
    const getDefaultEnhancers = buildGetDefaultEnhancers(middlewareEnhancer);
    if (enhancers && typeof enhancers !== "function") {
      throw new Error(false ? formatProdErrorMessage(5) : "`enhancers` field must be a callback");
    }
    let storeEnhancers = typeof enhancers === "function" ? enhancers(getDefaultEnhancers) : getDefaultEnhancers();
    if (!Array.isArray(storeEnhancers)) {
      throw new Error(false ? formatProdErrorMessage(6) : "`enhancers` callback must return an array");
    }
    if (storeEnhancers.some((item) => typeof item !== "function")) {
      throw new Error(false ? formatProdErrorMessage(7) : "each enhancer provided to configureStore must be a function");
    }
    if (finalMiddleware.length && !storeEnhancers.includes(middlewareEnhancer)) {
      console.error("middlewares were provided, but middleware enhancer was not included in final enhancers - make sure to call `getDefaultEnhancers`");
    }
    const composedEnhancer = finalCompose(...storeEnhancers);
    return createStore(rootReducer2, preloadedState, composedEnhancer);
  }
  function executeReducerBuilderCallback(builderCallback) {
    const actionsMap = {};
    const actionMatchers = [];
    let defaultCaseReducer;
    const builder = {
      addCase(typeOrActionCreator, reducer) {
        if (true) {
          if (actionMatchers.length > 0) {
            throw new Error(false ? formatProdErrorMessage(26) : "`builder.addCase` should only be called before calling `builder.addMatcher`");
          }
          if (defaultCaseReducer) {
            throw new Error(false ? formatProdErrorMessage(27) : "`builder.addCase` should only be called before calling `builder.addDefaultCase`");
          }
        }
        const type = typeof typeOrActionCreator === "string" ? typeOrActionCreator : typeOrActionCreator.type;
        if (!type) {
          throw new Error(false ? formatProdErrorMessage(28) : "`builder.addCase` cannot be called with an empty action type");
        }
        if (type in actionsMap) {
          throw new Error(false ? formatProdErrorMessage(29) : `\`builder.addCase\` cannot be called with two reducers for the same action type '${type}'`);
        }
        actionsMap[type] = reducer;
        return builder;
      },
      addMatcher(matcher, reducer) {
        if (true) {
          if (defaultCaseReducer) {
            throw new Error(false ? formatProdErrorMessage(30) : "`builder.addMatcher` should only be called before calling `builder.addDefaultCase`");
          }
        }
        actionMatchers.push({
          matcher,
          reducer
        });
        return builder;
      },
      addDefaultCase(reducer) {
        if (true) {
          if (defaultCaseReducer) {
            throw new Error(false ? formatProdErrorMessage(31) : "`builder.addDefaultCase` can only be called once");
          }
        }
        defaultCaseReducer = reducer;
        return builder;
      }
    };
    builderCallback(builder);
    return [actionsMap, actionMatchers, defaultCaseReducer];
  }
  function isStateFunction(x2) {
    return typeof x2 === "function";
  }
  function createReducer(initialState11, mapOrBuilderCallback) {
    if (true) {
      if (typeof mapOrBuilderCallback === "object") {
        throw new Error(false ? formatProdErrorMessage(8) : "The object notation for `createReducer` has been removed. Please use the 'builder callback' notation instead: https://redux-toolkit.js.org/api/createReducer");
      }
    }
    let [actionsMap, finalActionMatchers, finalDefaultCaseReducer] = executeReducerBuilderCallback(mapOrBuilderCallback);
    let getInitialState;
    if (isStateFunction(initialState11)) {
      getInitialState = () => freezeDraftable(initialState11());
    } else {
      const frozenInitialState = freezeDraftable(initialState11);
      getInitialState = () => frozenInitialState;
    }
    function reducer(state = getInitialState(), action) {
      let caseReducers = [actionsMap[action.type], ...finalActionMatchers.filter(({
        matcher
      }) => matcher(action)).map(({
        reducer: reducer2
      }) => reducer2)];
      if (caseReducers.filter((cr) => !!cr).length === 0) {
        caseReducers = [finalDefaultCaseReducer];
      }
      return caseReducers.reduce((previousState, caseReducer) => {
        if (caseReducer) {
          if (isDraft(previousState)) {
            const draft = previousState;
            const result = caseReducer(draft, action);
            if (result === void 0) {
              return previousState;
            }
            return result;
          } else if (!isDraftable(previousState)) {
            const result = caseReducer(previousState, action);
            if (result === void 0) {
              if (previousState === null) {
                return previousState;
              }
              throw Error("A case reducer on a non-draftable value must not return undefined");
            }
            return result;
          } else {
            return produce(previousState, (draft) => {
              return caseReducer(draft, action);
            });
          }
        }
        return previousState;
      }, state);
    }
    reducer.getInitialState = getInitialState;
    return reducer;
  }
  var matches = (matcher, action) => {
    if (hasMatchFunction(matcher)) {
      return matcher.match(action);
    } else {
      return matcher(action);
    }
  };
  function isAnyOf(...matchers) {
    return (action) => {
      return matchers.some((matcher) => matches(matcher, action));
    };
  }
  var urlAlphabet = "ModuleSymbhasOwnPr-0123456789ABCDEFGHNRVfgctiUvz_KqYTJkLxpZXIjQW";
  var nanoid = (size = 21) => {
    let id = "";
    let i = size;
    while (i--) {
      id += urlAlphabet[Math.random() * 64 | 0];
    }
    return id;
  };
  var commonProperties = ["name", "message", "stack", "code"];
  var RejectWithValue = class {
    constructor(payload, meta) {
      /*
      type-only property to distinguish between RejectWithValue and FulfillWithMeta
      does not exist at runtime
      */
      __publicField(this, "_type");
      this.payload = payload;
      this.meta = meta;
    }
  };
  var FulfillWithMeta = class {
    constructor(payload, meta) {
      /*
      type-only property to distinguish between RejectWithValue and FulfillWithMeta
      does not exist at runtime
      */
      __publicField(this, "_type");
      this.payload = payload;
      this.meta = meta;
    }
  };
  var miniSerializeError = (value) => {
    if (typeof value === "object" && value !== null) {
      const simpleError = {};
      for (const property of commonProperties) {
        if (typeof value[property] === "string") {
          simpleError[property] = value[property];
        }
      }
      return simpleError;
    }
    return {
      message: String(value)
    };
  };
  var externalAbortMessage = "External signal was aborted";
  var createAsyncThunk = /* @__PURE__ */ (() => {
    function createAsyncThunk2(typePrefix, payloadCreator, options) {
      const fulfilled = createAction(typePrefix + "/fulfilled", (payload, requestId, arg, meta) => ({
        payload,
        meta: {
          ...meta || {},
          arg,
          requestId,
          requestStatus: "fulfilled"
        }
      }));
      const pending = createAction(typePrefix + "/pending", (requestId, arg, meta) => ({
        payload: void 0,
        meta: {
          ...meta || {},
          arg,
          requestId,
          requestStatus: "pending"
        }
      }));
      const rejected = createAction(typePrefix + "/rejected", (error, requestId, arg, payload, meta) => ({
        payload,
        error: (options && options.serializeError || miniSerializeError)(error || "Rejected"),
        meta: {
          ...meta || {},
          arg,
          requestId,
          rejectedWithValue: !!payload,
          requestStatus: "rejected",
          aborted: error?.name === "AbortError",
          condition: error?.name === "ConditionError"
        }
      }));
      function actionCreator(arg, {
        signal
      } = {}) {
        return (dispatch, getState, extra) => {
          const requestId = options?.idGenerator ? options.idGenerator(arg) : nanoid();
          const abortController = new AbortController();
          let abortHandler;
          let abortReason;
          function abort(reason) {
            abortReason = reason;
            abortController.abort();
          }
          if (signal) {
            if (signal.aborted) {
              abort(externalAbortMessage);
            } else {
              signal.addEventListener("abort", () => abort(externalAbortMessage), {
                once: true
              });
            }
          }
          const promise = (async function() {
            let finalAction;
            try {
              let conditionResult = options?.condition?.(arg, {
                getState,
                extra
              });
              if (isThenable(conditionResult)) {
                conditionResult = await conditionResult;
              }
              if (conditionResult === false || abortController.signal.aborted) {
                throw {
                  name: "ConditionError",
                  message: "Aborted due to condition callback returning false."
                };
              }
              const abortedPromise = new Promise((_, reject) => {
                abortHandler = () => {
                  reject({
                    name: "AbortError",
                    message: abortReason || "Aborted"
                  });
                };
                abortController.signal.addEventListener("abort", abortHandler);
              });
              dispatch(pending(requestId, arg, options?.getPendingMeta?.({
                requestId,
                arg
              }, {
                getState,
                extra
              })));
              finalAction = await Promise.race([abortedPromise, Promise.resolve(payloadCreator(arg, {
                dispatch,
                getState,
                extra,
                requestId,
                signal: abortController.signal,
                abort,
                rejectWithValue: (value, meta) => {
                  return new RejectWithValue(value, meta);
                },
                fulfillWithValue: (value, meta) => {
                  return new FulfillWithMeta(value, meta);
                }
              })).then((result) => {
                if (result instanceof RejectWithValue) {
                  throw result;
                }
                if (result instanceof FulfillWithMeta) {
                  return fulfilled(result.payload, requestId, arg, result.meta);
                }
                return fulfilled(result, requestId, arg);
              })]);
            } catch (err) {
              finalAction = err instanceof RejectWithValue ? rejected(null, requestId, arg, err.payload, err.meta) : rejected(err, requestId, arg);
            } finally {
              if (abortHandler) {
                abortController.signal.removeEventListener("abort", abortHandler);
              }
            }
            const skipDispatch = options && !options.dispatchConditionRejection && rejected.match(finalAction) && finalAction.meta.condition;
            if (!skipDispatch) {
              dispatch(finalAction);
            }
            return finalAction;
          })();
          return Object.assign(promise, {
            abort,
            requestId,
            arg,
            unwrap() {
              return promise.then(unwrapResult);
            }
          });
        };
      }
      return Object.assign(actionCreator, {
        pending,
        rejected,
        fulfilled,
        settled: isAnyOf(rejected, fulfilled),
        typePrefix
      });
    }
    createAsyncThunk2.withTypes = () => createAsyncThunk2;
    return createAsyncThunk2;
  })();
  function unwrapResult(action) {
    if (action.meta && action.meta.rejectedWithValue) {
      throw action.payload;
    }
    if (action.error) {
      throw action.error;
    }
    return action.payload;
  }
  function isThenable(value) {
    return value !== null && typeof value === "object" && typeof value.then === "function";
  }
  var asyncThunkSymbol = /* @__PURE__ */ Symbol.for("rtk-slice-createasyncthunk");
  var asyncThunkCreator = {
    [asyncThunkSymbol]: createAsyncThunk
  };
  function getType(slice2, actionKey) {
    return `${slice2}/${actionKey}`;
  }
  function buildCreateSlice({
    creators
  } = {}) {
    const cAT = creators?.asyncThunk?.[asyncThunkSymbol];
    return function createSlice2(options) {
      const {
        name,
        reducerPath = name
      } = options;
      if (!name) {
        throw new Error(false ? formatProdErrorMessage(11) : "`name` is a required option for createSlice");
      }
      if (typeof process !== "undefined" && true) {
        if (options.initialState === void 0) {
          console.error("You must provide an `initialState` value that is not `undefined`. You may have misspelled `initialState`");
        }
      }
      const reducers = (typeof options.reducers === "function" ? options.reducers(buildReducerCreators()) : options.reducers) || {};
      const reducerNames = Object.keys(reducers);
      const context = {
        sliceCaseReducersByName: {},
        sliceCaseReducersByType: {},
        actionCreators: {},
        sliceMatchers: []
      };
      const contextMethods = {
        addCase(typeOrActionCreator, reducer2) {
          const type = typeof typeOrActionCreator === "string" ? typeOrActionCreator : typeOrActionCreator.type;
          if (!type) {
            throw new Error(false ? formatProdErrorMessage(12) : "`context.addCase` cannot be called with an empty action type");
          }
          if (type in context.sliceCaseReducersByType) {
            throw new Error(false ? formatProdErrorMessage(13) : "`context.addCase` cannot be called with two reducers for the same action type: " + type);
          }
          context.sliceCaseReducersByType[type] = reducer2;
          return contextMethods;
        },
        addMatcher(matcher, reducer2) {
          context.sliceMatchers.push({
            matcher,
            reducer: reducer2
          });
          return contextMethods;
        },
        exposeAction(name2, actionCreator) {
          context.actionCreators[name2] = actionCreator;
          return contextMethods;
        },
        exposeCaseReducer(name2, reducer2) {
          context.sliceCaseReducersByName[name2] = reducer2;
          return contextMethods;
        }
      };
      reducerNames.forEach((reducerName) => {
        const reducerDefinition = reducers[reducerName];
        const reducerDetails = {
          reducerName,
          type: getType(name, reducerName),
          createNotation: typeof options.reducers === "function"
        };
        if (isAsyncThunkSliceReducerDefinition(reducerDefinition)) {
          handleThunkCaseReducerDefinition(reducerDetails, reducerDefinition, contextMethods, cAT);
        } else {
          handleNormalReducerDefinition(reducerDetails, reducerDefinition, contextMethods);
        }
      });
      function buildReducer() {
        if (true) {
          if (typeof options.extraReducers === "object") {
            throw new Error(false ? formatProdErrorMessage(14) : "The object notation for `createSlice.extraReducers` has been removed. Please use the 'builder callback' notation instead: https://redux-toolkit.js.org/api/createSlice");
          }
        }
        const [extraReducers = {}, actionMatchers = [], defaultCaseReducer = void 0] = typeof options.extraReducers === "function" ? executeReducerBuilderCallback(options.extraReducers) : [options.extraReducers];
        const finalCaseReducers = {
          ...extraReducers,
          ...context.sliceCaseReducersByType
        };
        return createReducer(options.initialState, (builder) => {
          for (let key in finalCaseReducers) {
            builder.addCase(key, finalCaseReducers[key]);
          }
          for (let sM of context.sliceMatchers) {
            builder.addMatcher(sM.matcher, sM.reducer);
          }
          for (let m of actionMatchers) {
            builder.addMatcher(m.matcher, m.reducer);
          }
          if (defaultCaseReducer) {
            builder.addDefaultCase(defaultCaseReducer);
          }
        });
      }
      const selectSelf = (state) => state;
      const injectedSelectorCache = /* @__PURE__ */ new Map();
      const injectedStateCache = /* @__PURE__ */ new WeakMap();
      let _reducer;
      function reducer(state, action) {
        if (!_reducer) _reducer = buildReducer();
        return _reducer(state, action);
      }
      function getInitialState() {
        if (!_reducer) _reducer = buildReducer();
        return _reducer.getInitialState();
      }
      function makeSelectorProps(reducerPath2, injected = false) {
        function selectSlice(state) {
          let sliceState = state[reducerPath2];
          if (typeof sliceState === "undefined") {
            if (injected) {
              sliceState = getOrInsertComputed(injectedStateCache, selectSlice, getInitialState);
            } else if (true) {
              throw new Error(false ? formatProdErrorMessage(15) : "selectSlice returned undefined for an uninjected slice reducer");
            }
          }
          return sliceState;
        }
        function getSelectors(selectState = selectSelf) {
          const selectorCache = getOrInsertComputed(injectedSelectorCache, injected, () => /* @__PURE__ */ new WeakMap());
          return getOrInsertComputed(selectorCache, selectState, () => {
            const map3 = {};
            for (const [name2, selector] of Object.entries(options.selectors ?? {})) {
              map3[name2] = wrapSelector(selector, selectState, () => getOrInsertComputed(injectedStateCache, selectState, getInitialState), injected);
            }
            return map3;
          });
        }
        return {
          reducerPath: reducerPath2,
          getSelectors,
          get selectors() {
            return getSelectors(selectSlice);
          },
          selectSlice
        };
      }
      const slice2 = {
        name,
        reducer,
        actions: context.actionCreators,
        caseReducers: context.sliceCaseReducersByName,
        getInitialState,
        ...makeSelectorProps(reducerPath),
        injectInto(injectable, {
          reducerPath: pathOpt,
          ...config
        } = {}) {
          const newReducerPath = pathOpt ?? reducerPath;
          injectable.inject({
            reducerPath: newReducerPath,
            reducer
          }, config);
          return {
            ...slice2,
            ...makeSelectorProps(newReducerPath, true)
          };
        }
      };
      return slice2;
    };
  }
  function wrapSelector(selector, selectState, getInitialState, injected) {
    function wrapper(rootState, ...args) {
      let sliceState = selectState(rootState);
      if (typeof sliceState === "undefined") {
        if (injected) {
          sliceState = getInitialState();
        } else if (true) {
          throw new Error(false ? formatProdErrorMessage(16) : "selectState returned undefined for an uninjected slice reducer");
        }
      }
      return selector(sliceState, ...args);
    }
    wrapper.unwrapped = selector;
    return wrapper;
  }
  var createSlice = /* @__PURE__ */ buildCreateSlice();
  function buildReducerCreators() {
    function asyncThunk(payloadCreator, config) {
      return {
        _reducerDefinitionType: "asyncThunk",
        payloadCreator,
        ...config
      };
    }
    asyncThunk.withTypes = () => asyncThunk;
    return {
      reducer(caseReducer) {
        return Object.assign({
          // hack so the wrapping function has the same name as the original
          // we need to create a wrapper so the `reducerDefinitionType` is not assigned to the original
          [caseReducer.name](...args) {
            return caseReducer(...args);
          }
        }[caseReducer.name], {
          _reducerDefinitionType: "reducer"
          /* reducer */
        });
      },
      preparedReducer(prepare, reducer) {
        return {
          _reducerDefinitionType: "reducerWithPrepare",
          prepare,
          reducer
        };
      },
      asyncThunk
    };
  }
  function handleNormalReducerDefinition({
    type,
    reducerName,
    createNotation
  }, maybeReducerWithPrepare, context) {
    let caseReducer;
    let prepareCallback;
    if ("reducer" in maybeReducerWithPrepare) {
      if (createNotation && !isCaseReducerWithPrepareDefinition(maybeReducerWithPrepare)) {
        throw new Error(false ? formatProdErrorMessage(17) : "Please use the `create.preparedReducer` notation for prepared action creators with the `create` notation.");
      }
      caseReducer = maybeReducerWithPrepare.reducer;
      prepareCallback = maybeReducerWithPrepare.prepare;
    } else {
      caseReducer = maybeReducerWithPrepare;
    }
    context.addCase(type, caseReducer).exposeCaseReducer(reducerName, caseReducer).exposeAction(reducerName, prepareCallback ? createAction(type, prepareCallback) : createAction(type));
  }
  function isAsyncThunkSliceReducerDefinition(reducerDefinition) {
    return reducerDefinition._reducerDefinitionType === "asyncThunk";
  }
  function isCaseReducerWithPrepareDefinition(reducerDefinition) {
    return reducerDefinition._reducerDefinitionType === "reducerWithPrepare";
  }
  function handleThunkCaseReducerDefinition({
    type,
    reducerName
  }, reducerDefinition, context, cAT) {
    if (!cAT) {
      throw new Error(false ? formatProdErrorMessage(18) : "Cannot use `create.asyncThunk` in the built-in `createSlice`. Use `buildCreateSlice({ creators: { asyncThunk: asyncThunkCreator } })` to create a customised version of `createSlice`.");
    }
    const {
      payloadCreator,
      fulfilled,
      pending,
      rejected,
      settled,
      options
    } = reducerDefinition;
    const thunk2 = cAT(type, payloadCreator, options);
    context.exposeAction(reducerName, thunk2);
    if (fulfilled) {
      context.addCase(thunk2.fulfilled, fulfilled);
    }
    if (pending) {
      context.addCase(thunk2.pending, pending);
    }
    if (rejected) {
      context.addCase(thunk2.rejected, rejected);
    }
    if (settled) {
      context.addMatcher(thunk2.settled, settled);
    }
    context.exposeCaseReducer(reducerName, {
      fulfilled: fulfilled || noop2,
      pending: pending || noop2,
      rejected: rejected || noop2,
      settled: settled || noop2
    });
  }
  function noop2() {
  }
  var task = "task";
  var listener = "listener";
  var completed = "completed";
  var cancelled = "cancelled";
  var taskCancelled = `task-${cancelled}`;
  var taskCompleted = `task-${completed}`;
  var listenerCancelled = `${listener}-${cancelled}`;
  var listenerCompleted = `${listener}-${completed}`;
  var TaskAbortError = class {
    constructor(code) {
      __publicField(this, "name", "TaskAbortError");
      __publicField(this, "message");
      this.code = code;
      this.message = `${task} ${cancelled} (reason: ${code})`;
    }
  };
  var assertFunction = (func, expected) => {
    if (typeof func !== "function") {
      throw new TypeError(false ? formatProdErrorMessage(32) : `${expected} is not a function`);
    }
  };
  var noop22 = () => {
  };
  var catchRejection = (promise, onError = noop22) => {
    promise.catch(onError);
    return promise;
  };
  var addAbortSignalListener = (abortSignal, callback) => {
    abortSignal.addEventListener("abort", callback, {
      once: true
    });
    return () => abortSignal.removeEventListener("abort", callback);
  };
  var abortControllerWithReason = (abortController, reason) => {
    const signal = abortController.signal;
    if (signal.aborted) {
      return;
    }
    if (!("reason" in signal)) {
      Object.defineProperty(signal, "reason", {
        enumerable: true,
        value: reason,
        configurable: true,
        writable: true
      });
    }
    ;
    abortController.abort(reason);
  };
  var validateActive = (signal) => {
    if (signal.aborted) {
      const {
        reason
      } = signal;
      throw new TaskAbortError(reason);
    }
  };
  function raceWithSignal(signal, promise) {
    let cleanup = noop22;
    return new Promise((resolve, reject) => {
      const notifyRejection = () => reject(new TaskAbortError(signal.reason));
      if (signal.aborted) {
        notifyRejection();
        return;
      }
      cleanup = addAbortSignalListener(signal, notifyRejection);
      promise.finally(() => cleanup()).then(resolve, reject);
    }).finally(() => {
      cleanup = noop22;
    });
  }
  var runTask = async (task2, cleanUp) => {
    try {
      await Promise.resolve();
      const value = await task2();
      return {
        status: "ok",
        value
      };
    } catch (error) {
      return {
        status: error instanceof TaskAbortError ? "cancelled" : "rejected",
        error
      };
    } finally {
      cleanUp?.();
    }
  };
  var createPause = (signal) => {
    return (promise) => {
      return catchRejection(raceWithSignal(signal, promise).then((output) => {
        validateActive(signal);
        return output;
      }));
    };
  };
  var createDelay = (signal) => {
    const pause = createPause(signal);
    return (timeoutMs) => {
      return pause(new Promise((resolve) => setTimeout(resolve, timeoutMs)));
    };
  };
  var {
    assign
  } = Object;
  var INTERNAL_NIL_TOKEN = {};
  var alm = "listenerMiddleware";
  var createFork = (parentAbortSignal, parentBlockingPromises) => {
    const linkControllers = (controller) => addAbortSignalListener(parentAbortSignal, () => abortControllerWithReason(controller, parentAbortSignal.reason));
    return (taskExecutor, opts) => {
      assertFunction(taskExecutor, "taskExecutor");
      const childAbortController = new AbortController();
      linkControllers(childAbortController);
      const result = runTask(async () => {
        validateActive(parentAbortSignal);
        validateActive(childAbortController.signal);
        const result2 = await taskExecutor({
          pause: createPause(childAbortController.signal),
          delay: createDelay(childAbortController.signal),
          signal: childAbortController.signal
        });
        validateActive(childAbortController.signal);
        return result2;
      }, () => abortControllerWithReason(childAbortController, taskCompleted));
      if (opts?.autoJoin) {
        parentBlockingPromises.push(result.catch(noop22));
      }
      return {
        result: createPause(parentAbortSignal)(result),
        cancel() {
          abortControllerWithReason(childAbortController, taskCancelled);
        }
      };
    };
  };
  var createTakePattern = (startListening, signal) => {
    const take = async (predicate, timeout) => {
      validateActive(signal);
      let unsubscribe = () => {
      };
      const tuplePromise = new Promise((resolve, reject) => {
        let stopListening = startListening({
          predicate,
          effect: (action, listenerApi) => {
            listenerApi.unsubscribe();
            resolve([action, listenerApi.getState(), listenerApi.getOriginalState()]);
          }
        });
        unsubscribe = () => {
          stopListening();
          reject();
        };
      });
      const promises = [tuplePromise];
      if (timeout != null) {
        promises.push(new Promise((resolve) => setTimeout(resolve, timeout, null)));
      }
      try {
        const output = await raceWithSignal(signal, Promise.race(promises));
        validateActive(signal);
        return output;
      } finally {
        unsubscribe();
      }
    };
    return (predicate, timeout) => catchRejection(take(predicate, timeout));
  };
  var getListenerEntryPropsFrom = (options) => {
    let {
      type,
      actionCreator,
      matcher,
      predicate,
      effect
    } = options;
    if (type) {
      predicate = createAction(type).match;
    } else if (actionCreator) {
      type = actionCreator.type;
      predicate = actionCreator.match;
    } else if (matcher) {
      predicate = matcher;
    } else if (predicate) {
    } else {
      throw new Error(false ? formatProdErrorMessage(21) : "Creating or removing a listener requires one of the known fields for matching an action");
    }
    assertFunction(effect, "options.listener");
    return {
      predicate,
      type,
      effect
    };
  };
  var createListenerEntry = /* @__PURE__ */ assign((options) => {
    const {
      type,
      predicate,
      effect
    } = getListenerEntryPropsFrom(options);
    const entry = {
      id: nanoid(),
      effect,
      type,
      predicate,
      pending: /* @__PURE__ */ new Set(),
      unsubscribe: () => {
        throw new Error(false ? formatProdErrorMessage(22) : "Unsubscribe not initialized");
      }
    };
    return entry;
  }, {
    withTypes: () => createListenerEntry
  });
  var findListenerEntry = (listenerMap, options) => {
    const {
      type,
      effect,
      predicate
    } = getListenerEntryPropsFrom(options);
    return Array.from(listenerMap.values()).find((entry) => {
      const matchPredicateOrType = typeof type === "string" ? entry.type === type : entry.predicate === predicate;
      return matchPredicateOrType && entry.effect === effect;
    });
  };
  var cancelActiveListeners = (entry) => {
    entry.pending.forEach((controller) => {
      abortControllerWithReason(controller, listenerCancelled);
    });
  };
  var createClearListenerMiddleware = (listenerMap) => {
    return () => {
      listenerMap.forEach(cancelActiveListeners);
      listenerMap.clear();
    };
  };
  var safelyNotifyError = (errorHandler, errorToNotify, errorInfo) => {
    try {
      errorHandler(errorToNotify, errorInfo);
    } catch (errorHandlerError) {
      setTimeout(() => {
        throw errorHandlerError;
      }, 0);
    }
  };
  var addListener = /* @__PURE__ */ assign(/* @__PURE__ */ createAction(`${alm}/add`), {
    withTypes: () => addListener
  });
  var clearAllListeners = /* @__PURE__ */ createAction(`${alm}/removeAll`);
  var removeListener = /* @__PURE__ */ assign(/* @__PURE__ */ createAction(`${alm}/remove`), {
    withTypes: () => removeListener
  });
  var defaultErrorHandler = (...args) => {
    console.error(`${alm}/error`, ...args);
  };
  var createListenerMiddleware = (middlewareOptions = {}) => {
    const listenerMap = /* @__PURE__ */ new Map();
    const {
      extra,
      onError = defaultErrorHandler
    } = middlewareOptions;
    assertFunction(onError, "onError");
    const insertEntry = (entry) => {
      entry.unsubscribe = () => listenerMap.delete(entry.id);
      listenerMap.set(entry.id, entry);
      return (cancelOptions) => {
        entry.unsubscribe();
        if (cancelOptions?.cancelActive) {
          cancelActiveListeners(entry);
        }
      };
    };
    const startListening = (options) => {
      const entry = findListenerEntry(listenerMap, options) ?? createListenerEntry(options);
      return insertEntry(entry);
    };
    assign(startListening, {
      withTypes: () => startListening
    });
    const stopListening = (options) => {
      const entry = findListenerEntry(listenerMap, options);
      if (entry) {
        entry.unsubscribe();
        if (options.cancelActive) {
          cancelActiveListeners(entry);
        }
      }
      return !!entry;
    };
    assign(stopListening, {
      withTypes: () => stopListening
    });
    const notifyListener = async (entry, action, api, getOriginalState) => {
      const internalTaskController = new AbortController();
      const take = createTakePattern(startListening, internalTaskController.signal);
      const autoJoinPromises = [];
      try {
        entry.pending.add(internalTaskController);
        await Promise.resolve(entry.effect(
          action,
          // Use assign() rather than ... to avoid extra helper functions added to bundle
          assign({}, api, {
            getOriginalState,
            condition: (predicate, timeout) => take(predicate, timeout).then(Boolean),
            take,
            delay: createDelay(internalTaskController.signal),
            pause: createPause(internalTaskController.signal),
            extra,
            signal: internalTaskController.signal,
            fork: createFork(internalTaskController.signal, autoJoinPromises),
            unsubscribe: entry.unsubscribe,
            subscribe: () => {
              listenerMap.set(entry.id, entry);
            },
            cancelActiveListeners: () => {
              entry.pending.forEach((controller, _, set2) => {
                if (controller !== internalTaskController) {
                  abortControllerWithReason(controller, listenerCancelled);
                  set2.delete(controller);
                }
              });
            },
            cancel: () => {
              abortControllerWithReason(internalTaskController, listenerCancelled);
              entry.pending.delete(internalTaskController);
            },
            throwIfCancelled: () => {
              validateActive(internalTaskController.signal);
            }
          })
        ));
      } catch (listenerError) {
        if (!(listenerError instanceof TaskAbortError)) {
          safelyNotifyError(onError, listenerError, {
            raisedBy: "effect"
          });
        }
      } finally {
        await Promise.all(autoJoinPromises);
        abortControllerWithReason(internalTaskController, listenerCompleted);
        entry.pending.delete(internalTaskController);
      }
    };
    const clearListenerMiddleware = createClearListenerMiddleware(listenerMap);
    const middleware = (api) => (next) => (action) => {
      if (!isAction(action)) {
        return next(action);
      }
      if (addListener.match(action)) {
        return startListening(action.payload);
      }
      if (clearAllListeners.match(action)) {
        clearListenerMiddleware();
        return;
      }
      if (removeListener.match(action)) {
        return stopListening(action.payload);
      }
      let originalState = api.getState();
      const getOriginalState = () => {
        if (originalState === INTERNAL_NIL_TOKEN) {
          throw new Error(false ? formatProdErrorMessage(23) : `${alm}: getOriginalState can only be called synchronously`);
        }
        return originalState;
      };
      let result;
      try {
        result = next(action);
        if (listenerMap.size > 0) {
          const currentState = api.getState();
          const listenerEntries = Array.from(listenerMap.values());
          for (const entry of listenerEntries) {
            let runListener = false;
            try {
              runListener = entry.predicate(action, currentState, originalState);
            } catch (predicateError) {
              runListener = false;
              safelyNotifyError(onError, predicateError, {
                raisedBy: "predicate"
              });
            }
            if (!runListener) {
              continue;
            }
            notifyListener(entry, action, api, getOriginalState);
          }
        }
      } finally {
        originalState = INTERNAL_NIL_TOKEN;
      }
      return result;
    };
    return {
      middleware,
      startListening,
      stopListening,
      clearListeners: clearListenerMiddleware
    };
  };

  // client/node_modules/recharts/es6/state/layoutSlice.js
  var initialState = {
    layoutType: "horizontal",
    width: 0,
    height: 0,
    margin: {
      top: 5,
      right: 5,
      bottom: 5,
      left: 5
    },
    scale: 1
  };
  var chartLayoutSlice = createSlice({
    name: "chartLayout",
    initialState,
    reducers: {
      setLayout(state, action) {
        state.layoutType = action.payload;
      },
      setChartSize(state, action) {
        state.width = action.payload.width;
        state.height = action.payload.height;
      },
      setMargin(state, action) {
        state.margin.top = action.payload.top;
        state.margin.right = action.payload.right;
        state.margin.bottom = action.payload.bottom;
        state.margin.left = action.payload.left;
      },
      setScale(state, action) {
        state.scale = action.payload;
      }
    }
  });
  var {
    setMargin,
    setLayout,
    setChartSize,
    setScale
  } = chartLayoutSlice.actions;
  var chartLayoutReducer = chartLayoutSlice.reducer;

  // client/node_modules/recharts/es6/state/selectors/selectChartOffset.js
  init_define_import_meta_env();
  var import_get4 = __toESM(require_get2());

  // client/node_modules/recharts/es6/util/ChartUtils.js
  init_define_import_meta_env();
  var import_sortBy = __toESM(require_sortBy2());
  var import_get3 = __toESM(require_get2());

  // client/node_modules/recharts/es6/util/PolarUtils.js
  init_define_import_meta_env();
  var import_react8 = __toESM(require_react_shim());
  function ownKeys(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys(Object(t), true).forEach(function(r3) {
        _defineProperty(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  function _defineProperty(e, r2, t) {
    return (r2 = _toPropertyKey(r2)) in e ? Object.defineProperty(e, r2, { value: t, enumerable: true, configurable: true, writable: true }) : e[r2] = t, e;
  }
  function _toPropertyKey(t) {
    var i = _toPrimitive(t, "string");
    return "symbol" == typeof i ? i : i + "";
  }
  function _toPrimitive(t, r2) {
    if ("object" != typeof t || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r2 || "default");
      if ("object" != typeof i) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r2 ? String : Number)(t);
  }
  var RADIAN = Math.PI / 180;
  var radianToDegree = (angleInRadian) => angleInRadian * 180 / Math.PI;
  var polarToCartesian = (cx, cy, radius, angle) => ({
    x: cx + Math.cos(-RADIAN * angle) * radius,
    y: cy + Math.sin(-RADIAN * angle) * radius
  });
  var getMaxRadius = function getMaxRadius2(width, height) {
    var offset = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    };
    return Math.min(Math.abs(width - (offset.left || 0) - (offset.right || 0)), Math.abs(height - (offset.top || 0) - (offset.bottom || 0))) / 2;
  };
  var distanceBetweenPoints = (point4, anotherPoint) => {
    var {
      x: x1,
      y: y1
    } = point4;
    var {
      x: x2,
      y: y2
    } = anotherPoint;
    return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
  };
  var getAngleOfPoint = (_ref, _ref2) => {
    var {
      x: x2,
      y: y2
    } = _ref;
    var {
      cx,
      cy
    } = _ref2;
    var radius = distanceBetweenPoints({
      x: x2,
      y: y2
    }, {
      x: cx,
      y: cy
    });
    if (radius <= 0) {
      return {
        radius,
        angle: 0
      };
    }
    var cos = (x2 - cx) / radius;
    var angleInRadian = Math.acos(cos);
    if (y2 > cy) {
      angleInRadian = 2 * Math.PI - angleInRadian;
    }
    return {
      radius,
      angle: radianToDegree(angleInRadian),
      angleInRadian
    };
  };
  var formatAngleOfSector = (_ref3) => {
    var {
      startAngle,
      endAngle
    } = _ref3;
    var startCnt = Math.floor(startAngle / 360);
    var endCnt = Math.floor(endAngle / 360);
    var min2 = Math.min(startCnt, endCnt);
    return {
      startAngle: startAngle - min2 * 360,
      endAngle: endAngle - min2 * 360
    };
  };
  var reverseFormatAngleOfSector = (angle, _ref4) => {
    var {
      startAngle,
      endAngle
    } = _ref4;
    var startCnt = Math.floor(startAngle / 360);
    var endCnt = Math.floor(endAngle / 360);
    var min2 = Math.min(startCnt, endCnt);
    return angle + min2 * 360;
  };
  var inRangeOfSector = (_ref5, viewBox) => {
    var {
      x: x2,
      y: y2
    } = _ref5;
    var {
      radius,
      angle
    } = getAngleOfPoint({
      x: x2,
      y: y2
    }, viewBox);
    var {
      innerRadius,
      outerRadius
    } = viewBox;
    if (radius < innerRadius || radius > outerRadius) {
      return null;
    }
    if (radius === 0) {
      return null;
    }
    var {
      startAngle,
      endAngle
    } = formatAngleOfSector(viewBox);
    var formatAngle = angle;
    var inRange2;
    if (startAngle <= endAngle) {
      while (formatAngle > endAngle) {
        formatAngle -= 360;
      }
      while (formatAngle < startAngle) {
        formatAngle += 360;
      }
      inRange2 = formatAngle >= startAngle && formatAngle <= endAngle;
    } else {
      while (formatAngle > startAngle) {
        formatAngle -= 360;
      }
      while (formatAngle < endAngle) {
        formatAngle += 360;
      }
      inRange2 = formatAngle >= endAngle && formatAngle <= startAngle;
    }
    if (inRange2) {
      return _objectSpread(_objectSpread({}, viewBox), {}, {
        radius,
        angle: reverseFormatAngleOfSector(formatAngle, viewBox)
      });
    }
    return null;
  };

  // client/node_modules/recharts/es6/util/ChartUtils.js
  function ownKeys2(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread2(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys2(Object(t), true).forEach(function(r3) {
        _defineProperty2(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys2(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  function _defineProperty2(e, r2, t) {
    return (r2 = _toPropertyKey2(r2)) in e ? Object.defineProperty(e, r2, { value: t, enumerable: true, configurable: true, writable: true }) : e[r2] = t, e;
  }
  function _toPropertyKey2(t) {
    var i = _toPrimitive2(t, "string");
    return "symbol" == typeof i ? i : i + "";
  }
  function _toPrimitive2(t, r2) {
    if ("object" != typeof t || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r2 || "default");
      if ("object" != typeof i) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r2 ? String : Number)(t);
  }
  function getValueByDataKey(obj, dataKey, defaultValue) {
    if (isNullish(obj) || isNullish(dataKey)) {
      return defaultValue;
    }
    if (isNumOrStr(dataKey)) {
      return (0, import_get3.default)(obj, dataKey, defaultValue);
    }
    if (typeof dataKey === "function") {
      return dataKey(obj);
    }
    return defaultValue;
  }
  var calculateActiveTickIndex = (coordinate, ticks2, unsortedTicks, axisType, range4) => {
    var _ticks$length;
    var index = -1;
    var len = (_ticks$length = ticks2 === null || ticks2 === void 0 ? void 0 : ticks2.length) !== null && _ticks$length !== void 0 ? _ticks$length : 0;
    if (len <= 1 || coordinate == null) {
      return 0;
    }
    if (axisType === "angleAxis" && range4 != null && Math.abs(Math.abs(range4[1] - range4[0]) - 360) <= 1e-6) {
      for (var i = 0; i < len; i++) {
        var before = i > 0 ? unsortedTicks[i - 1].coordinate : unsortedTicks[len - 1].coordinate;
        var cur = unsortedTicks[i].coordinate;
        var after = i >= len - 1 ? unsortedTicks[0].coordinate : unsortedTicks[i + 1].coordinate;
        var sameDirectionCoord = void 0;
        if (mathSign(cur - before) !== mathSign(after - cur)) {
          var diffInterval = [];
          if (mathSign(after - cur) === mathSign(range4[1] - range4[0])) {
            sameDirectionCoord = after;
            var curInRange = cur + range4[1] - range4[0];
            diffInterval[0] = Math.min(curInRange, (curInRange + before) / 2);
            diffInterval[1] = Math.max(curInRange, (curInRange + before) / 2);
          } else {
            sameDirectionCoord = before;
            var afterInRange = after + range4[1] - range4[0];
            diffInterval[0] = Math.min(cur, (afterInRange + cur) / 2);
            diffInterval[1] = Math.max(cur, (afterInRange + cur) / 2);
          }
          var sameInterval = [Math.min(cur, (sameDirectionCoord + cur) / 2), Math.max(cur, (sameDirectionCoord + cur) / 2)];
          if (coordinate > sameInterval[0] && coordinate <= sameInterval[1] || coordinate >= diffInterval[0] && coordinate <= diffInterval[1]) {
            ({
              index
            } = unsortedTicks[i]);
            break;
          }
        } else {
          var minValue = Math.min(before, after);
          var maxValue = Math.max(before, after);
          if (coordinate > (minValue + cur) / 2 && coordinate <= (maxValue + cur) / 2) {
            ({
              index
            } = unsortedTicks[i]);
            break;
          }
        }
      }
    } else if (ticks2) {
      for (var _i = 0; _i < len; _i++) {
        if (_i === 0 && coordinate <= (ticks2[_i].coordinate + ticks2[_i + 1].coordinate) / 2 || _i > 0 && _i < len - 1 && coordinate > (ticks2[_i].coordinate + ticks2[_i - 1].coordinate) / 2 && coordinate <= (ticks2[_i].coordinate + ticks2[_i + 1].coordinate) / 2 || _i === len - 1 && coordinate > (ticks2[_i].coordinate + ticks2[_i - 1].coordinate) / 2) {
          ({
            index
          } = ticks2[_i]);
          break;
        }
      }
    }
    return index;
  };
  var appendOffsetOfLegend = (offset, legendSettings, legendSize) => {
    if (legendSettings && legendSize) {
      var {
        width: boxWidth,
        height: boxHeight
      } = legendSize;
      var {
        align,
        verticalAlign,
        layout
      } = legendSettings;
      if ((layout === "vertical" || layout === "horizontal" && verticalAlign === "middle") && align !== "center" && isNumber(offset[align])) {
        return _objectSpread2(_objectSpread2({}, offset), {}, {
          [align]: offset[align] + (boxWidth || 0)
        });
      }
      if ((layout === "horizontal" || layout === "vertical" && align === "center") && verticalAlign !== "middle" && isNumber(offset[verticalAlign])) {
        return _objectSpread2(_objectSpread2({}, offset), {}, {
          [verticalAlign]: offset[verticalAlign] + (boxHeight || 0)
        });
      }
    }
    return offset;
  };
  var isCategoricalAxis = (layout, axisType) => layout === "horizontal" && axisType === "xAxis" || layout === "vertical" && axisType === "yAxis" || layout === "centric" && axisType === "angleAxis" || layout === "radial" && axisType === "radiusAxis";
  var EPS = 1e-4;
  var checkDomainOfScale = (scale) => {
    var domain = scale.domain();
    if (!domain || domain.length <= 2) {
      return;
    }
    var len = domain.length;
    var range4 = scale.range();
    var minValue = Math.min(range4[0], range4[1]) - EPS;
    var maxValue = Math.max(range4[0], range4[1]) + EPS;
    var first = scale(domain[0]);
    var last2 = scale(domain[len - 1]);
    if (first < minValue || first > maxValue || last2 < minValue || last2 > maxValue) {
      scale.domain([domain[0], domain[len - 1]]);
    }
  };
  var offsetSign = (series) => {
    var n = series.length;
    if (n <= 0) {
      return;
    }
    for (var j = 0, m = series[0].length; j < m; ++j) {
      var positive = 0;
      var negative = 0;
      for (var i = 0; i < n; ++i) {
        var value = isNan(series[i][j][1]) ? series[i][j][0] : series[i][j][1];
        if (value >= 0) {
          series[i][j][0] = positive;
          series[i][j][1] = positive + value;
          positive = series[i][j][1];
        } else {
          series[i][j][0] = negative;
          series[i][j][1] = negative + value;
          negative = series[i][j][1];
        }
      }
    }
  };
  var offsetPositive = (series) => {
    var n = series.length;
    if (n <= 0) {
      return;
    }
    for (var j = 0, m = series[0].length; j < m; ++j) {
      var positive = 0;
      for (var i = 0; i < n; ++i) {
        var value = isNan(series[i][j][1]) ? series[i][j][0] : series[i][j][1];
        if (value >= 0) {
          series[i][j][0] = positive;
          series[i][j][1] = positive + value;
          positive = series[i][j][1];
        } else {
          series[i][j][0] = 0;
          series[i][j][1] = 0;
        }
      }
    }
  };
  var STACK_OFFSET_MAP = {
    sign: offsetSign,
    // @ts-expect-error definitelytyped types are incorrect
    expand: expand_default,
    // @ts-expect-error definitelytyped types are incorrect
    none: none_default,
    // @ts-expect-error definitelytyped types are incorrect
    silhouette: silhouette_default,
    // @ts-expect-error definitelytyped types are incorrect
    wiggle: wiggle_default,
    positive: offsetPositive
  };
  var getStackedData = (data, dataKeys, offsetType) => {
    var offsetAccessor = STACK_OFFSET_MAP[offsetType];
    var stack = stack_default().keys(dataKeys).value((d, key) => +getValueByDataKey(d, key, 0)).order(none_default2).offset(offsetAccessor);
    return stack(data);
  };
  function getNormalizedStackId(publicStackId) {
    return publicStackId == null ? void 0 : String(publicStackId);
  }
  function getCateCoordinateOfLine(_ref) {
    var {
      axis,
      ticks: ticks2,
      bandSize,
      entry,
      index,
      dataKey
    } = _ref;
    if (axis.type === "category") {
      if (!axis.allowDuplicatedCategory && axis.dataKey && !isNullish(entry[axis.dataKey])) {
        var matchedTick = findEntryInArray(ticks2, "value", entry[axis.dataKey]);
        if (matchedTick) {
          return matchedTick.coordinate + bandSize / 2;
        }
      }
      return ticks2[index] ? ticks2[index].coordinate + bandSize / 2 : null;
    }
    var value = getValueByDataKey(entry, !isNullish(dataKey) ? dataKey : axis.dataKey);
    return !isNullish(value) ? axis.scale(value) : null;
  }
  var getDomainOfSingle = (data) => {
    var flat = data.flat(2).filter(isNumber);
    return [Math.min(...flat), Math.max(...flat)];
  };
  var makeDomainFinite = (domain) => {
    return [domain[0] === Infinity ? 0 : domain[0], domain[1] === -Infinity ? 0 : domain[1]];
  };
  var getDomainOfStackGroups = (stackGroups, startIndex, endIndex) => {
    if (stackGroups == null) {
      return void 0;
    }
    return makeDomainFinite(Object.keys(stackGroups).reduce((result, stackId) => {
      var group = stackGroups[stackId];
      var {
        stackedData
      } = group;
      var domain = stackedData.reduce((res, entry) => {
        var s = getDomainOfSingle(entry.slice(startIndex, endIndex + 1));
        return [Math.min(res[0], s[0]), Math.max(res[1], s[1])];
      }, [Infinity, -Infinity]);
      return [Math.min(domain[0], result[0]), Math.max(domain[1], result[1])];
    }, [Infinity, -Infinity]));
  };
  var MIN_VALUE_REG = /^dataMin[\s]*-[\s]*([0-9]+([.]{1}[0-9]+){0,1})$/;
  var MAX_VALUE_REG = /^dataMax[\s]*\+[\s]*([0-9]+([.]{1}[0-9]+){0,1})$/;
  var getBandSizeOfAxis = (axis, ticks2, isBar) => {
    if (axis && axis.scale && axis.scale.bandwidth) {
      var bandWidth = axis.scale.bandwidth();
      if (!isBar || bandWidth > 0) {
        return bandWidth;
      }
    }
    if (axis && ticks2 && ticks2.length >= 2) {
      var orderedTicks = (0, import_sortBy.default)(ticks2, (o) => o.coordinate);
      var bandSize = Infinity;
      for (var i = 1, len = orderedTicks.length; i < len; i++) {
        var cur = orderedTicks[i];
        var prev = orderedTicks[i - 1];
        bandSize = Math.min((cur.coordinate || 0) - (prev.coordinate || 0), bandSize);
      }
      return bandSize === Infinity ? 0 : bandSize;
    }
    return isBar ? void 0 : 0;
  };
  function getTooltipEntry(_ref4) {
    var {
      tooltipEntrySettings,
      dataKey,
      payload,
      value,
      name
    } = _ref4;
    return _objectSpread2(_objectSpread2({}, tooltipEntrySettings), {}, {
      dataKey,
      payload,
      value,
      name
    });
  }
  function getTooltipNameProp(nameFromItem, dataKey) {
    if (nameFromItem) {
      return String(nameFromItem);
    }
    if (typeof dataKey === "string") {
      return dataKey;
    }
    return void 0;
  }
  function inRange(x2, y2, layout, polarViewBox, offset) {
    if (layout === "horizontal" || layout === "vertical") {
      var isInRange = x2 >= offset.left && x2 <= offset.left + offset.width && y2 >= offset.top && y2 <= offset.top + offset.height;
      return isInRange ? {
        x: x2,
        y: y2
      } : null;
    }
    if (polarViewBox) {
      return inRangeOfSector({
        x: x2,
        y: y2
      }, polarViewBox);
    }
    return null;
  }
  var getActiveCoordinate = (layout, tooltipTicks, activeIndex, rangeObj) => {
    var entry = tooltipTicks.find((tick) => tick && tick.index === activeIndex);
    if (entry) {
      if (layout === "horizontal") {
        return {
          x: entry.coordinate,
          y: rangeObj.y
        };
      }
      if (layout === "vertical") {
        return {
          x: rangeObj.x,
          y: entry.coordinate
        };
      }
      if (layout === "centric") {
        var _angle = entry.coordinate;
        var {
          radius: _radius
        } = rangeObj;
        return _objectSpread2(_objectSpread2(_objectSpread2({}, rangeObj), polarToCartesian(rangeObj.cx, rangeObj.cy, _radius, _angle)), {}, {
          angle: _angle,
          radius: _radius
        });
      }
      var radius = entry.coordinate;
      var {
        angle
      } = rangeObj;
      return _objectSpread2(_objectSpread2(_objectSpread2({}, rangeObj), polarToCartesian(rangeObj.cx, rangeObj.cy, radius, angle)), {}, {
        angle,
        radius
      });
    }
    return {
      x: 0,
      y: 0
    };
  };
  var calculateTooltipPos = (rangeObj, layout) => {
    if (layout === "horizontal") {
      return rangeObj.x;
    }
    if (layout === "vertical") {
      return rangeObj.y;
    }
    if (layout === "centric") {
      return rangeObj.angle;
    }
    return rangeObj.radius;
  };

  // client/node_modules/recharts/es6/state/selectors/containerSelectors.js
  init_define_import_meta_env();
  var selectChartWidth = (state) => state.layout.width;
  var selectChartHeight = (state) => state.layout.height;
  var selectContainerScale = (state) => state.layout.scale;
  var selectMargin = (state) => state.layout.margin;

  // client/node_modules/recharts/es6/state/selectors/selectAllAxes.js
  init_define_import_meta_env();
  var selectAllXAxes = createSelector((state) => state.cartesianAxis.xAxis, (xAxisMap) => {
    return Object.values(xAxisMap);
  });
  var selectAllYAxes = createSelector((state) => state.cartesianAxis.yAxis, (yAxisMap) => {
    return Object.values(yAxisMap);
  });

  // client/node_modules/recharts/es6/util/Constants.js
  init_define_import_meta_env();
  var DATA_ITEM_INDEX_ATTRIBUTE_NAME = "data-recharts-item-index";
  var DATA_ITEM_DATAKEY_ATTRIBUTE_NAME = "data-recharts-item-data-key";
  var DEFAULT_Y_AXIS_WIDTH = 60;

  // client/node_modules/recharts/es6/state/selectors/selectChartOffset.js
  function ownKeys3(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread3(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys3(Object(t), true).forEach(function(r3) {
        _defineProperty3(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys3(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  function _defineProperty3(e, r2, t) {
    return (r2 = _toPropertyKey3(r2)) in e ? Object.defineProperty(e, r2, { value: t, enumerable: true, configurable: true, writable: true }) : e[r2] = t, e;
  }
  function _toPropertyKey3(t) {
    var i = _toPrimitive3(t, "string");
    return "symbol" == typeof i ? i : i + "";
  }
  function _toPrimitive3(t, r2) {
    if ("object" != typeof t || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r2 || "default");
      if ("object" != typeof i) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r2 ? String : Number)(t);
  }
  var selectBrushHeight = (state) => state.brush.height;
  var selectChartOffset = createSelector([selectChartWidth, selectChartHeight, selectMargin, selectBrushHeight, selectAllXAxes, selectAllYAxes, selectLegendSettings, selectLegendSize], (chartWidth, chartHeight, margin, brushHeight, xAxes, yAxes, legendSettings, legendSize) => {
    var offsetH = yAxes.reduce((result, entry) => {
      var {
        orientation
      } = entry;
      if (!entry.mirror && !entry.hide) {
        var width = typeof entry.width === "number" ? entry.width : DEFAULT_Y_AXIS_WIDTH;
        return _objectSpread3(_objectSpread3({}, result), {}, {
          [orientation]: result[orientation] + width
        });
      }
      return result;
    }, {
      left: margin.left || 0,
      right: margin.right || 0
    });
    var offsetV = xAxes.reduce((result, entry) => {
      var {
        orientation
      } = entry;
      if (!entry.mirror && !entry.hide) {
        return _objectSpread3(_objectSpread3({}, result), {}, {
          [orientation]: (0, import_get4.default)(result, "".concat(orientation)) + entry.height
        });
      }
      return result;
    }, {
      top: margin.top || 0,
      bottom: margin.bottom || 0
    });
    var offset = _objectSpread3(_objectSpread3({}, offsetV), offsetH);
    var brushBottom = offset.bottom;
    offset.bottom += brushHeight;
    offset = appendOffsetOfLegend(offset, legendSettings, legendSize);
    var offsetWidth = chartWidth - offset.left - offset.right;
    var offsetHeight = chartHeight - offset.top - offset.bottom;
    return _objectSpread3(_objectSpread3({
      brushBottom
    }, offset), {}, {
      // never return negative values for height and width
      width: Math.max(offsetWidth, 0),
      height: Math.max(offsetHeight, 0)
    });
  });
  var selectChartViewBox = createSelector(selectChartOffset, (offset) => ({
    x: offset.left,
    y: offset.top,
    width: offset.width,
    height: offset.height
  }));
  var selectAxisViewBox = createSelector(selectChartWidth, selectChartHeight, (width, height) => ({
    x: 0,
    y: 0,
    width,
    height
  }));

  // client/node_modules/recharts/es6/context/PanoramaContext.js
  init_define_import_meta_env();
  var React4 = __toESM(require_react_shim());
  var import_react9 = __toESM(require_react_shim());
  var PanoramaContext = /* @__PURE__ */ (0, import_react9.createContext)(null);
  var useIsPanorama = () => (0, import_react9.useContext)(PanoramaContext) != null;

  // client/node_modules/recharts/es6/state/selectors/brushSelectors.js
  init_define_import_meta_env();
  var selectBrushSettings = (state) => state.brush;
  var selectBrushDimensions = createSelector([selectBrushSettings, selectChartOffset, selectMargin], (brushSettings, offset, margin) => ({
    height: brushSettings.height,
    x: isNumber(brushSettings.x) ? brushSettings.x : offset.left,
    y: isNumber(brushSettings.y) ? brushSettings.y : offset.top + offset.height + offset.brushBottom - ((margin === null || margin === void 0 ? void 0 : margin.bottom) || 0),
    width: isNumber(brushSettings.width) ? brushSettings.width : offset.width
  }));

  // client/node_modules/recharts/es6/context/chartLayoutContext.js
  var useViewBox = () => {
    var _useAppSelector;
    var panorama = useIsPanorama();
    var rootViewBox = useAppSelector(selectChartViewBox);
    var brushDimensions = useAppSelector(selectBrushDimensions);
    var brushPadding = (_useAppSelector = useAppSelector(selectBrushSettings)) === null || _useAppSelector === void 0 ? void 0 : _useAppSelector.padding;
    if (!panorama || !brushDimensions || !brushPadding) {
      return rootViewBox;
    }
    return {
      width: brushDimensions.width - brushPadding.left - brushPadding.right,
      height: brushDimensions.height - brushPadding.top - brushPadding.bottom,
      x: brushPadding.left,
      y: brushPadding.top
    };
  };
  var manyComponentsThrowErrorsIfOffsetIsUndefined = {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    width: 0,
    height: 0,
    brushBottom: 0
  };
  var useOffset = () => {
    var _useAppSelector2;
    return (_useAppSelector2 = useAppSelector(selectChartOffset)) !== null && _useAppSelector2 !== void 0 ? _useAppSelector2 : manyComponentsThrowErrorsIfOffsetIsUndefined;
  };
  var useChartWidth = () => {
    return useAppSelector(selectChartWidth);
  };
  var useChartHeight = () => {
    return useAppSelector(selectChartHeight);
  };
  var selectChartLayout = (state) => state.layout.layoutType;
  var useChartLayout = () => useAppSelector(selectChartLayout);

  // client/node_modules/recharts/es6/state/legendSlice.js
  init_define_import_meta_env();
  var initialState2 = {
    settings: {
      layout: "horizontal",
      align: "center",
      verticalAlign: "middle"
    },
    size: {
      width: 0,
      height: 0
    },
    payload: []
  };
  var legendSlice = createSlice({
    name: "legend",
    initialState: initialState2,
    reducers: {
      setLegendSize(state, action) {
        state.size.width = action.payload.width;
        state.size.height = action.payload.height;
      },
      setLegendSettings(state, action) {
        state.settings.align = action.payload.align;
        state.settings.layout = action.payload.layout;
        state.settings.verticalAlign = action.payload.verticalAlign;
      },
      addLegendPayload(state, action) {
        state.payload.push(castDraft(action.payload));
      },
      removeLegendPayload(state, action) {
        var index = current(state).payload.indexOf(castDraft(action.payload));
        if (index > -1) {
          state.payload.splice(index, 1);
        }
      }
    }
  });
  var {
    setLegendSize,
    setLegendSettings,
    addLegendPayload,
    removeLegendPayload
  } = legendSlice.actions;
  var legendReducer = legendSlice.reducer;

  // client/node_modules/recharts/es6/util/Global.js
  init_define_import_meta_env();
  var parseIsSsrByDefault = () => !(typeof window !== "undefined" && window.document && Boolean(window.document.createElement) && window.setTimeout);
  var Global = {
    isSsr: parseIsSsrByDefault()
  };

  // client/node_modules/recharts/es6/context/accessibilityContext.js
  init_define_import_meta_env();
  var useAccessibilityLayer = () => useAppSelector((state) => state.rootProps.accessibilityLayer);

  // client/node_modules/recharts/es6/shape/Curve.js
  init_define_import_meta_env();
  var React5 = __toESM(require_react_shim());

  // client/node_modules/recharts/es6/util/isWellBehavedNumber.js
  init_define_import_meta_env();
  function isWellBehavedNumber(n) {
    return Number.isFinite(n);
  }
  function isPositiveNumber(n) {
    return typeof n === "number" && n > 0 && Number.isFinite(n);
  }

  // client/node_modules/recharts/es6/shape/Curve.js
  function _extends3() {
    return _extends3 = Object.assign ? Object.assign.bind() : function(n) {
      for (var e = 1; e < arguments.length; e++) {
        var t = arguments[e];
        for (var r2 in t) ({}).hasOwnProperty.call(t, r2) && (n[r2] = t[r2]);
      }
      return n;
    }, _extends3.apply(null, arguments);
  }
  function ownKeys4(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread4(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys4(Object(t), true).forEach(function(r3) {
        _defineProperty4(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys4(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  function _defineProperty4(e, r2, t) {
    return (r2 = _toPropertyKey4(r2)) in e ? Object.defineProperty(e, r2, { value: t, enumerable: true, configurable: true, writable: true }) : e[r2] = t, e;
  }
  function _toPropertyKey4(t) {
    var i = _toPrimitive4(t, "string");
    return "symbol" == typeof i ? i : i + "";
  }
  function _toPrimitive4(t, r2) {
    if ("object" != typeof t || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r2 || "default");
      if ("object" != typeof i) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r2 ? String : Number)(t);
  }
  var CURVE_FACTORIES = {
    curveBasisClosed: basisClosed_default,
    curveBasisOpen: basisOpen_default,
    curveBasis: basis_default,
    curveBumpX: bumpX,
    curveBumpY: bumpY,
    curveLinearClosed: linearClosed_default,
    curveLinear: linear_default,
    curveMonotoneX: monotoneX,
    curveMonotoneY: monotoneY,
    curveNatural: natural_default,
    curveStep: step_default,
    curveStepAfter: stepAfter,
    curveStepBefore: stepBefore
  };
  var defined = (p) => isWellBehavedNumber(p.x) && isWellBehavedNumber(p.y);
  var getX = (p) => p.x;
  var getY = (p) => p.y;
  var getCurveFactory = (type, layout) => {
    if (typeof type === "function") {
      return type;
    }
    var name = "curve".concat(upperFirst(type));
    if ((name === "curveMonotone" || name === "curveBump") && layout) {
      return CURVE_FACTORIES["".concat(name).concat(layout === "vertical" ? "Y" : "X")];
    }
    return CURVE_FACTORIES[name] || linear_default;
  };
  var getPath = (_ref) => {
    var {
      type = "linear",
      points = [],
      baseLine,
      layout,
      connectNulls = false
    } = _ref;
    var curveFactory = getCurveFactory(type, layout);
    var formatPoints = connectNulls ? points.filter(defined) : points;
    var lineFunction;
    if (Array.isArray(baseLine)) {
      var formatBaseLine = connectNulls ? baseLine.filter((base) => defined(base)) : baseLine;
      var areaPoints = formatPoints.map((entry, index) => _objectSpread4(_objectSpread4({}, entry), {}, {
        base: formatBaseLine[index]
      }));
      if (layout === "vertical") {
        lineFunction = area_default().y(getY).x1(getX).x0((d) => d.base.x);
      } else {
        lineFunction = area_default().x(getX).y1(getY).y0((d) => d.base.y);
      }
      lineFunction.defined(defined).curve(curveFactory);
      return lineFunction(areaPoints);
    }
    if (layout === "vertical" && isNumber(baseLine)) {
      lineFunction = area_default().y(getY).x1(getX).x0(baseLine);
    } else if (isNumber(baseLine)) {
      lineFunction = area_default().x(getX).y1(getY).y0(baseLine);
    } else {
      lineFunction = line_default().x(getX).y(getY);
    }
    lineFunction.defined(defined).curve(curveFactory);
    return lineFunction(formatPoints);
  };
  var Curve = (props) => {
    var {
      className: className8,
      points,
      path: path2,
      pathRef
    } = props;
    if ((!points || !points.length) && !path2) {
      return null;
    }
    var realPath = points && points.length ? getPath(props) : path2;
    return /* @__PURE__ */ React5.createElement("path", _extends3({}, filterProps(props, false), adaptEventHandlers(props), {
      className: clsx("recharts-curve", className8),
      d: realPath === null ? void 0 : realPath,
      ref: pathRef
    }));
  };

  // client/node_modules/recharts/es6/util/resolveDefaultProps.js
  init_define_import_meta_env();
  function ownKeys5(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread5(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys5(Object(t), true).forEach(function(r3) {
        _defineProperty5(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys5(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  function _defineProperty5(e, r2, t) {
    return (r2 = _toPropertyKey5(r2)) in e ? Object.defineProperty(e, r2, { value: t, enumerable: true, configurable: true, writable: true }) : e[r2] = t, e;
  }
  function _toPropertyKey5(t) {
    var i = _toPrimitive5(t, "string");
    return "symbol" == typeof i ? i : i + "";
  }
  function _toPrimitive5(t, r2) {
    if ("object" != typeof t || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r2 || "default");
      if ("object" != typeof i) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r2 ? String : Number)(t);
  }
  function resolveDefaultProps(realProps, defaultProps2) {
    var resolvedProps = _objectSpread5({}, realProps);
    var dp = defaultProps2;
    var keys = Object.keys(defaultProps2);
    var withDefaults = keys.reduce((acc, key) => {
      if (acc[key] === void 0 && dp[key] !== void 0) {
        acc[key] = dp[key];
      }
      return acc;
    }, resolvedProps);
    return withDefaults;
  }

  // client/node_modules/recharts/es6/animation/Animate.js
  init_define_import_meta_env();
  var React6 = __toESM(require_react_shim());
  var import_react11 = __toESM(require_react_shim());
  var import_isEqual = __toESM(require_isEqual2());

  // client/node_modules/recharts/es6/animation/AnimationManager.js
  init_define_import_meta_env();
  function createAnimateManager(timeoutController) {
    var currStyle = {};
    var handleChange = () => null;
    var shouldStop = false;
    var cancelTimeout = null;
    var setStyle = (_style) => {
      if (shouldStop) {
        return;
      }
      if (Array.isArray(_style)) {
        if (!_style.length) {
          return;
        }
        var styles = _style;
        var [curr, ...restStyles] = styles;
        if (typeof curr === "number") {
          cancelTimeout = timeoutController.setTimeout(setStyle.bind(null, restStyles), curr);
          return;
        }
        setStyle(curr);
        cancelTimeout = timeoutController.setTimeout(setStyle.bind(null, restStyles));
        return;
      }
      if (typeof _style === "object") {
        currStyle = _style;
        handleChange(currStyle);
      }
      if (typeof _style === "function") {
        _style();
      }
    };
    return {
      stop: () => {
        shouldStop = true;
      },
      start: (style) => {
        shouldStop = false;
        if (cancelTimeout) {
          cancelTimeout();
          cancelTimeout = null;
        }
        setStyle(style);
      },
      subscribe: (_handleChange) => {
        handleChange = _handleChange;
        return () => {
          handleChange = () => null;
        };
      },
      getTimeoutController: () => timeoutController
    };
  }

  // client/node_modules/recharts/es6/animation/easing.js
  init_define_import_meta_env();
  var ACCURACY = 1e-4;
  var cubicBezierFactor = (c1, c2) => [0, 3 * c1, 3 * c2 - 6 * c1, 3 * c1 - 3 * c2 + 1];
  var evaluatePolynomial = (params, t) => params.map((param, i) => param * t ** i).reduce((pre, curr) => pre + curr);
  var cubicBezier = (c1, c2) => (t) => {
    var params = cubicBezierFactor(c1, c2);
    return evaluatePolynomial(params, t);
  };
  var derivativeCubicBezier = (c1, c2) => (t) => {
    var params = cubicBezierFactor(c1, c2);
    var newParams = [...params.map((param, i) => param * i).slice(1), 0];
    return evaluatePolynomial(newParams, t);
  };
  var configBezier = function configBezier2() {
    var x1, x2, y1, y2;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    if (args.length === 1) {
      switch (args[0]) {
        case "linear":
          [x1, y1, x2, y2] = [0, 0, 1, 1];
          break;
        case "ease":
          [x1, y1, x2, y2] = [0.25, 0.1, 0.25, 1];
          break;
        case "ease-in":
          [x1, y1, x2, y2] = [0.42, 0, 1, 1];
          break;
        case "ease-out":
          [x1, y1, x2, y2] = [0.42, 0, 0.58, 1];
          break;
        case "ease-in-out":
          [x1, y1, x2, y2] = [0, 0, 0.58, 1];
          break;
        default: {
          var easing = args[0].split("(");
          if (easing[0] === "cubic-bezier" && easing[1].split(")")[0].split(",").length === 4) {
            [x1, y1, x2, y2] = easing[1].split(")")[0].split(",").map((x3) => parseFloat(x3));
          }
        }
      }
    } else if (args.length === 4) {
      [x1, y1, x2, y2] = args;
    }
    var curveX = cubicBezier(x1, x2);
    var curveY = cubicBezier(y1, y2);
    var derCurveX = derivativeCubicBezier(x1, x2);
    var rangeValue = (value) => {
      if (value > 1) {
        return 1;
      }
      if (value < 0) {
        return 0;
      }
      return value;
    };
    var bezier = (_t) => {
      var t = _t > 1 ? 1 : _t;
      var x3 = t;
      for (var i = 0; i < 8; ++i) {
        var evalT = curveX(x3) - t;
        var derVal = derCurveX(x3);
        if (Math.abs(evalT - t) < ACCURACY || derVal < ACCURACY) {
          return curveY(x3);
        }
        x3 = rangeValue(x3 - evalT / derVal);
      }
      return curveY(x3);
    };
    bezier.isStepper = false;
    return bezier;
  };
  var configSpring = function configSpring2() {
    var config = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    var {
      stiff = 100,
      damping = 8,
      dt = 17
    } = config;
    var stepper = (currX, destX, currV) => {
      var FSpring = -(currX - destX) * stiff;
      var FDamping = currV * damping;
      var newV = currV + (FSpring - FDamping) * dt / 1e3;
      var newX = currV * dt / 1e3 + currX;
      if (Math.abs(newX - destX) < ACCURACY && Math.abs(newV) < ACCURACY) {
        return [destX, 0];
      }
      return [newX, newV];
    };
    stepper.isStepper = true;
    stepper.dt = dt;
    return stepper;
  };
  var configEasing = (easing) => {
    if (typeof easing === "string") {
      switch (easing) {
        case "ease":
        case "ease-in-out":
        case "ease-out":
        case "ease-in":
        case "linear":
          return configBezier(easing);
        case "spring":
          return configSpring();
        default:
          if (easing.split("(")[0] === "cubic-bezier") {
            return configBezier(easing);
          }
      }
    }
    if (typeof easing === "function") {
      return easing;
    }
    return null;
  };

  // client/node_modules/recharts/es6/animation/configUpdate.js
  init_define_import_meta_env();

  // client/node_modules/recharts/es6/animation/util.js
  init_define_import_meta_env();
  function ownKeys6(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread6(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys6(Object(t), true).forEach(function(r3) {
        _defineProperty6(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys6(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  function _defineProperty6(e, r2, t) {
    return (r2 = _toPropertyKey6(r2)) in e ? Object.defineProperty(e, r2, { value: t, enumerable: true, configurable: true, writable: true }) : e[r2] = t, e;
  }
  function _toPropertyKey6(t) {
    var i = _toPrimitive6(t, "string");
    return "symbol" == typeof i ? i : i + "";
  }
  function _toPrimitive6(t, r2) {
    if ("object" != typeof t || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r2 || "default");
      if ("object" != typeof i) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r2 ? String : Number)(t);
  }
  var getDashCase = (name) => name.replace(/([A-Z])/g, (v) => "-".concat(v.toLowerCase()));
  var getTransitionVal = (props, duration, easing) => props.map((prop) => "".concat(getDashCase(prop), " ").concat(duration, "ms ").concat(easing)).join(",");
  var getIntersectionKeys = (preObj, nextObj) => [Object.keys(preObj), Object.keys(nextObj)].reduce((a, b) => a.filter((c) => b.includes(c)));
  var mapObject = (fn, obj) => Object.keys(obj).reduce((res, key) => _objectSpread6(_objectSpread6({}, res), {}, {
    [key]: fn(key, obj[key])
  }), {});

  // client/node_modules/recharts/es6/animation/configUpdate.js
  function ownKeys7(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread7(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys7(Object(t), true).forEach(function(r3) {
        _defineProperty7(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys7(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  function _defineProperty7(e, r2, t) {
    return (r2 = _toPropertyKey7(r2)) in e ? Object.defineProperty(e, r2, { value: t, enumerable: true, configurable: true, writable: true }) : e[r2] = t, e;
  }
  function _toPropertyKey7(t) {
    var i = _toPrimitive7(t, "string");
    return "symbol" == typeof i ? i : i + "";
  }
  function _toPrimitive7(t, r2) {
    if ("object" != typeof t || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r2 || "default");
      if ("object" != typeof i) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r2 ? String : Number)(t);
  }
  var alpha = (begin, end, k) => begin + (end - begin) * k;
  var needContinue = (_ref) => {
    var {
      from,
      to
    } = _ref;
    return from !== to;
  };
  var calStepperVals = (easing, preVals, steps) => {
    var nextStepVals = mapObject((key, val) => {
      if (needContinue(val)) {
        var [newX, newV] = easing(val.from, val.to, val.velocity);
        return _objectSpread7(_objectSpread7({}, val), {}, {
          from: newX,
          velocity: newV
        });
      }
      return val;
    }, preVals);
    if (steps < 1) {
      return mapObject((key, val) => {
        if (needContinue(val)) {
          return _objectSpread7(_objectSpread7({}, val), {}, {
            velocity: alpha(val.velocity, nextStepVals[key].velocity, steps),
            from: alpha(val.from, nextStepVals[key].from, steps)
          });
        }
        return val;
      }, preVals);
    }
    return calStepperVals(easing, nextStepVals, steps - 1);
  };
  function createStepperUpdate(from, to, easing, interKeys, render, timeoutController) {
    var preTime;
    var stepperStyle = interKeys.reduce((res, key) => _objectSpread7(_objectSpread7({}, res), {}, {
      [key]: {
        from: from[key],
        velocity: 0,
        to: to[key]
      }
    }), {});
    var getCurrStyle = () => mapObject((key, val) => val.from, stepperStyle);
    var shouldStopAnimation = () => !Object.values(stepperStyle).filter(needContinue).length;
    var stopAnimation = null;
    var stepperUpdate = (now) => {
      if (!preTime) {
        preTime = now;
      }
      var deltaTime = now - preTime;
      var steps = deltaTime / easing.dt;
      stepperStyle = calStepperVals(easing, stepperStyle, steps);
      render(_objectSpread7(_objectSpread7(_objectSpread7({}, from), to), getCurrStyle()));
      preTime = now;
      if (!shouldStopAnimation()) {
        stopAnimation = timeoutController.setTimeout(stepperUpdate);
      }
    };
    return () => {
      stopAnimation = timeoutController.setTimeout(stepperUpdate);
      return () => {
        stopAnimation();
      };
    };
  }
  function createTimingUpdate(from, to, easing, duration, interKeys, render, timeoutController) {
    var stopAnimation = null;
    var timingStyle = interKeys.reduce((res, key) => _objectSpread7(_objectSpread7({}, res), {}, {
      [key]: [from[key], to[key]]
    }), {});
    var beginTime;
    var timingUpdate = (now) => {
      if (!beginTime) {
        beginTime = now;
      }
      var t = (now - beginTime) / duration;
      var currStyle = mapObject((key, val) => alpha(...val, easing(t)), timingStyle);
      render(_objectSpread7(_objectSpread7(_objectSpread7({}, from), to), currStyle));
      if (t < 1) {
        stopAnimation = timeoutController.setTimeout(timingUpdate);
      } else {
        var finalStyle = mapObject((key, val) => alpha(...val, easing(1)), timingStyle);
        render(_objectSpread7(_objectSpread7(_objectSpread7({}, from), to), finalStyle));
      }
    };
    return () => {
      stopAnimation = timeoutController.setTimeout(timingUpdate);
      return () => {
        stopAnimation();
      };
    };
  }
  var configUpdate_default = (from, to, easing, duration, render, timeoutController) => {
    var interKeys = getIntersectionKeys(from, to);
    return easing.isStepper === true ? createStepperUpdate(from, to, easing, interKeys, render, timeoutController) : createTimingUpdate(from, to, easing, duration, interKeys, render, timeoutController);
  };

  // client/node_modules/recharts/es6/animation/timeoutController.js
  init_define_import_meta_env();
  var RequestAnimationFrameTimeoutController = class {
    setTimeout(callback) {
      var delay = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
      var startTime = performance.now();
      var requestId = null;
      var executeCallback = (now) => {
        if (now - startTime >= delay) {
          callback(now);
        } else if (typeof requestAnimationFrame === "function") {
          requestId = requestAnimationFrame(executeCallback);
        }
      };
      requestId = requestAnimationFrame(executeCallback);
      return () => {
        cancelAnimationFrame(requestId);
      };
    }
  };

  // client/node_modules/recharts/es6/animation/Animate.js
  var _excluded3 = ["children", "begin", "duration", "attributeName", "easing", "isActive", "from", "to", "canBegin", "onAnimationEnd", "shouldReAnimate", "onAnimationReStart", "animationManager"];
  function _extends4() {
    return _extends4 = Object.assign ? Object.assign.bind() : function(n) {
      for (var e = 1; e < arguments.length; e++) {
        var t = arguments[e];
        for (var r2 in t) ({}).hasOwnProperty.call(t, r2) && (n[r2] = t[r2]);
      }
      return n;
    }, _extends4.apply(null, arguments);
  }
  function _objectWithoutProperties3(e, t) {
    if (null == e) return {};
    var o, r2, i = _objectWithoutPropertiesLoose3(e, t);
    if (Object.getOwnPropertySymbols) {
      var n = Object.getOwnPropertySymbols(e);
      for (r2 = 0; r2 < n.length; r2++) o = n[r2], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]);
    }
    return i;
  }
  function _objectWithoutPropertiesLoose3(r2, e) {
    if (null == r2) return {};
    var t = {};
    for (var n in r2) if ({}.hasOwnProperty.call(r2, n)) {
      if (-1 !== e.indexOf(n)) continue;
      t[n] = r2[n];
    }
    return t;
  }
  function ownKeys8(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread8(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys8(Object(t), true).forEach(function(r3) {
        _defineProperty8(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys8(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  function _defineProperty8(e, r2, t) {
    return (r2 = _toPropertyKey8(r2)) in e ? Object.defineProperty(e, r2, { value: t, enumerable: true, configurable: true, writable: true }) : e[r2] = t, e;
  }
  function _toPropertyKey8(t) {
    var i = _toPrimitive8(t, "string");
    return "symbol" == typeof i ? i : i + "";
  }
  function _toPrimitive8(t, r2) {
    if ("object" != typeof t || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r2 || "default");
      if ("object" != typeof i) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r2 ? String : Number)(t);
  }
  function createDefaultAnimationManager() {
    return createAnimateManager(new RequestAnimationFrameTimeoutController());
  }
  var AnimateImpl = class extends import_react11.PureComponent {
    constructor(props, context) {
      super(props, context);
      _defineProperty8(this, "mounted", false);
      _defineProperty8(this, "manager", null);
      _defineProperty8(this, "stopJSAnimation", null);
      _defineProperty8(this, "unSubscribe", null);
      var {
        isActive,
        attributeName,
        from,
        to,
        children,
        duration,
        animationManager
      } = this.props;
      this.manager = animationManager;
      this.handleStyleChange = this.handleStyleChange.bind(this);
      this.changeStyle = this.changeStyle.bind(this);
      if (!isActive || duration <= 0) {
        this.state = {
          style: {}
        };
        if (typeof children === "function") {
          this.state = {
            style: to
          };
        }
        return;
      }
      if (from) {
        if (typeof children === "function") {
          this.state = {
            style: from
          };
          return;
        }
        this.state = {
          style: attributeName ? {
            [attributeName]: from
          } : from
        };
      } else {
        this.state = {
          style: {}
        };
      }
    }
    componentDidMount() {
      var {
        isActive,
        canBegin
      } = this.props;
      this.mounted = true;
      if (!isActive || !canBegin) {
        return;
      }
      this.runAnimation(this.props);
    }
    componentDidUpdate(prevProps) {
      var {
        isActive,
        canBegin,
        attributeName,
        shouldReAnimate,
        to,
        from: currentFrom
      } = this.props;
      var {
        style
      } = this.state;
      if (!canBegin) {
        return;
      }
      if (!isActive) {
        var newState = {
          style: attributeName ? {
            [attributeName]: to
          } : to
        };
        if (this.state && style) {
          if (attributeName && style[attributeName] !== to || !attributeName && style !== to) {
            this.setState(newState);
          }
        }
        return;
      }
      if ((0, import_isEqual.default)(prevProps.to, to) && prevProps.canBegin && prevProps.isActive) {
        return;
      }
      var isTriggered = !prevProps.canBegin || !prevProps.isActive;
      this.manager.stop();
      if (this.stopJSAnimation) {
        this.stopJSAnimation();
      }
      var from = isTriggered || shouldReAnimate ? currentFrom : prevProps.to;
      if (this.state && style) {
        var _newState = {
          style: attributeName ? {
            [attributeName]: from
          } : from
        };
        if (attributeName && style[attributeName] !== from || !attributeName && style !== from) {
          this.setState(_newState);
        }
      }
      this.runAnimation(_objectSpread8(_objectSpread8({}, this.props), {}, {
        from,
        begin: 0
      }));
    }
    componentWillUnmount() {
      this.mounted = false;
      var {
        onAnimationEnd
      } = this.props;
      if (this.unSubscribe) {
        this.unSubscribe();
      }
      this.manager.stop();
      if (this.stopJSAnimation) {
        this.stopJSAnimation();
      }
      if (onAnimationEnd) {
        onAnimationEnd();
      }
    }
    handleStyleChange(style) {
      this.changeStyle(style);
    }
    changeStyle(style) {
      if (this.mounted) {
        this.setState({
          style
        });
      }
    }
    runJSAnimation(props) {
      var {
        from,
        to,
        duration,
        easing,
        begin,
        onAnimationEnd,
        onAnimationStart
      } = props;
      var startAnimation = configUpdate_default(from, to, configEasing(easing), duration, this.changeStyle, this.manager.getTimeoutController());
      var finalStartAnimation = () => {
        this.stopJSAnimation = startAnimation();
      };
      this.manager.start([onAnimationStart, begin, finalStartAnimation, duration, onAnimationEnd]);
    }
    runAnimation(props) {
      var {
        begin,
        duration,
        attributeName,
        to: propsTo,
        easing,
        onAnimationStart,
        onAnimationEnd,
        children
      } = props;
      this.unSubscribe = this.manager.subscribe(this.handleStyleChange);
      if (typeof easing === "function" || typeof children === "function" || easing === "spring") {
        this.runJSAnimation(props);
        return;
      }
      var to = attributeName ? {
        [attributeName]: propsTo
      } : propsTo;
      var transition = getTransitionVal(Object.keys(to), duration, easing);
      this.manager.start([onAnimationStart, begin, _objectSpread8(_objectSpread8({}, to), {}, {
        transition
      }), duration, onAnimationEnd]);
    }
    render() {
      var _this$props = this.props, {
        children,
        begin,
        duration,
        attributeName,
        easing,
        isActive,
        from,
        to,
        canBegin,
        onAnimationEnd,
        shouldReAnimate,
        onAnimationReStart,
        animationManager
      } = _this$props, others = _objectWithoutProperties3(_this$props, _excluded3);
      var count = import_react11.Children.count(children);
      var stateStyle = this.state.style;
      if (typeof children === "function") {
        return children(stateStyle);
      }
      if (!isActive || count === 0 || duration <= 0) {
        return children;
      }
      var cloneContainer = (container) => {
        var {
          style = {},
          className: className8
        } = container.props;
        var res = /* @__PURE__ */ (0, import_react11.cloneElement)(container, _objectSpread8(_objectSpread8({}, others), {}, {
          style: _objectSpread8(_objectSpread8({}, style), stateStyle),
          className: className8
        }));
        return res;
      };
      if (count === 1) {
        return cloneContainer(import_react11.Children.only(children));
      }
      return /* @__PURE__ */ React6.createElement("div", null, import_react11.Children.map(children, (child) => cloneContainer(child)));
    }
  };
  _defineProperty8(AnimateImpl, "displayName", "Animate");
  _defineProperty8(AnimateImpl, "defaultProps", {
    begin: 0,
    duration: 1e3,
    attributeName: "",
    easing: "ease",
    isActive: true,
    canBegin: true,
    onAnimationEnd: () => {
    },
    onAnimationStart: () => {
    }
  });
  var AnimationManagerContext = /* @__PURE__ */ (0, import_react11.createContext)(null);
  function Animate(props) {
    var _ref, _props$animationManag;
    var contextAnimationManager = (0, import_react11.useContext)(AnimationManagerContext);
    return /* @__PURE__ */ React6.createElement(AnimateImpl, _extends4({}, props, {
      animationManager: (_ref = (_props$animationManag = props.animationManager) !== null && _props$animationManag !== void 0 ? _props$animationManag : contextAnimationManager) !== null && _ref !== void 0 ? _ref : createDefaultAnimationManager()
    }));
  }

  // client/node_modules/recharts/es6/context/useTooltipAxis.js
  init_define_import_meta_env();

  // client/node_modules/recharts/es6/state/selectors/tooltipSelectors.js
  init_define_import_meta_env();

  // client/node_modules/recharts/es6/state/selectors/axisSelectors.js
  init_define_import_meta_env();
  var import_range2 = __toESM(require_range2());

  // client/node_modules/victory-vendor/es/d3-scale.js
  var d3_scale_exports = {};
  __export(d3_scale_exports, {
    scaleBand: () => band,
    scaleDiverging: () => diverging,
    scaleDivergingLog: () => divergingLog,
    scaleDivergingPow: () => divergingPow,
    scaleDivergingSqrt: () => divergingSqrt,
    scaleDivergingSymlog: () => divergingSymlog,
    scaleIdentity: () => identity2,
    scaleImplicit: () => implicit,
    scaleLinear: () => linear2,
    scaleLog: () => log,
    scaleOrdinal: () => ordinal,
    scalePoint: () => point3,
    scalePow: () => pow,
    scaleQuantile: () => quantile2,
    scaleQuantize: () => quantize,
    scaleRadial: () => radial,
    scaleSequential: () => sequential,
    scaleSequentialLog: () => sequentialLog,
    scaleSequentialPow: () => sequentialPow,
    scaleSequentialQuantile: () => sequentialQuantile,
    scaleSequentialSqrt: () => sequentialSqrt,
    scaleSequentialSymlog: () => sequentialSymlog,
    scaleSqrt: () => sqrt,
    scaleSymlog: () => symlog,
    scaleThreshold: () => threshold,
    scaleTime: () => time,
    scaleUtc: () => utcTime,
    tickFormat: () => tickFormat
  });
  init_define_import_meta_env();

  // client/node_modules/d3-scale/src/index.js
  init_define_import_meta_env();

  // client/node_modules/d3-scale/src/band.js
  init_define_import_meta_env();

  // client/node_modules/d3-array/src/index.js
  init_define_import_meta_env();

  // client/node_modules/d3-array/src/bisect.js
  init_define_import_meta_env();

  // client/node_modules/d3-array/src/ascending.js
  init_define_import_meta_env();
  function ascending(a, b) {
    return a == null || b == null ? NaN : a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
  }

  // client/node_modules/d3-array/src/bisector.js
  init_define_import_meta_env();

  // client/node_modules/d3-array/src/descending.js
  init_define_import_meta_env();
  function descending(a, b) {
    return a == null || b == null ? NaN : b < a ? -1 : b > a ? 1 : b >= a ? 0 : NaN;
  }

  // client/node_modules/d3-array/src/bisector.js
  function bisector(f) {
    let compare1, compare2, delta;
    if (f.length !== 2) {
      compare1 = ascending;
      compare2 = (d, x2) => ascending(f(d), x2);
      delta = (d, x2) => f(d) - x2;
    } else {
      compare1 = f === ascending || f === descending ? f : zero;
      compare2 = f;
      delta = f;
    }
    function left(a, x2, lo = 0, hi = a.length) {
      if (lo < hi) {
        if (compare1(x2, x2) !== 0) return hi;
        do {
          const mid = lo + hi >>> 1;
          if (compare2(a[mid], x2) < 0) lo = mid + 1;
          else hi = mid;
        } while (lo < hi);
      }
      return lo;
    }
    function right(a, x2, lo = 0, hi = a.length) {
      if (lo < hi) {
        if (compare1(x2, x2) !== 0) return hi;
        do {
          const mid = lo + hi >>> 1;
          if (compare2(a[mid], x2) <= 0) lo = mid + 1;
          else hi = mid;
        } while (lo < hi);
      }
      return lo;
    }
    function center(a, x2, lo = 0, hi = a.length) {
      const i = left(a, x2, lo, hi - 1);
      return i > lo && delta(a[i - 1], x2) > -delta(a[i], x2) ? i - 1 : i;
    }
    return { left, center, right };
  }
  function zero() {
    return 0;
  }

  // client/node_modules/d3-array/src/number.js
  init_define_import_meta_env();
  function number(x2) {
    return x2 === null ? NaN : +x2;
  }
  function* numbers(values, valueof) {
    if (valueof === void 0) {
      for (let value of values) {
        if (value != null && (value = +value) >= value) {
          yield value;
        }
      }
    } else {
      let index = -1;
      for (let value of values) {
        if ((value = valueof(value, ++index, values)) != null && (value = +value) >= value) {
          yield value;
        }
      }
    }
  }

  // client/node_modules/d3-array/src/bisect.js
  var ascendingBisect = bisector(ascending);
  var bisectRight = ascendingBisect.right;
  var bisectLeft = ascendingBisect.left;
  var bisectCenter = bisector(number).center;
  var bisect_default = bisectRight;

  // client/node_modules/internmap/src/index.js
  init_define_import_meta_env();
  var InternMap = class extends Map {
    constructor(entries, key = keyof) {
      super();
      Object.defineProperties(this, { _intern: { value: /* @__PURE__ */ new Map() }, _key: { value: key } });
      if (entries != null) for (const [key2, value] of entries) this.set(key2, value);
    }
    get(key) {
      return super.get(intern_get(this, key));
    }
    has(key) {
      return super.has(intern_get(this, key));
    }
    set(key, value) {
      return super.set(intern_set(this, key), value);
    }
    delete(key) {
      return super.delete(intern_delete(this, key));
    }
  };
  function intern_get({ _intern, _key }, value) {
    const key = _key(value);
    return _intern.has(key) ? _intern.get(key) : value;
  }
  function intern_set({ _intern, _key }, value) {
    const key = _key(value);
    if (_intern.has(key)) return _intern.get(key);
    _intern.set(key, value);
    return value;
  }
  function intern_delete({ _intern, _key }, value) {
    const key = _key(value);
    if (_intern.has(key)) {
      value = _intern.get(key);
      _intern.delete(key);
    }
    return value;
  }
  function keyof(value) {
    return value !== null && typeof value === "object" ? value.valueOf() : value;
  }

  // client/node_modules/d3-array/src/sort.js
  init_define_import_meta_env();
  function compareDefined(compare = ascending) {
    if (compare === ascending) return ascendingDefined;
    if (typeof compare !== "function") throw new TypeError("compare is not a function");
    return (a, b) => {
      const x2 = compare(a, b);
      if (x2 || x2 === 0) return x2;
      return (compare(b, b) === 0) - (compare(a, a) === 0);
    };
  }
  function ascendingDefined(a, b) {
    return (a == null || !(a >= a)) - (b == null || !(b >= b)) || (a < b ? -1 : a > b ? 1 : 0);
  }

  // client/node_modules/d3-array/src/ticks.js
  init_define_import_meta_env();
  var e10 = Math.sqrt(50);
  var e5 = Math.sqrt(10);
  var e2 = Math.sqrt(2);
  function tickSpec(start, stop, count) {
    const step = (stop - start) / Math.max(0, count), power = Math.floor(Math.log10(step)), error = step / Math.pow(10, power), factor = error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1;
    let i1, i2, inc;
    if (power < 0) {
      inc = Math.pow(10, -power) / factor;
      i1 = Math.round(start * inc);
      i2 = Math.round(stop * inc);
      if (i1 / inc < start) ++i1;
      if (i2 / inc > stop) --i2;
      inc = -inc;
    } else {
      inc = Math.pow(10, power) * factor;
      i1 = Math.round(start / inc);
      i2 = Math.round(stop / inc);
      if (i1 * inc < start) ++i1;
      if (i2 * inc > stop) --i2;
    }
    if (i2 < i1 && 0.5 <= count && count < 2) return tickSpec(start, stop, count * 2);
    return [i1, i2, inc];
  }
  function ticks(start, stop, count) {
    stop = +stop, start = +start, count = +count;
    if (!(count > 0)) return [];
    if (start === stop) return [start];
    const reverse2 = stop < start, [i1, i2, inc] = reverse2 ? tickSpec(stop, start, count) : tickSpec(start, stop, count);
    if (!(i2 >= i1)) return [];
    const n = i2 - i1 + 1, ticks2 = new Array(n);
    if (reverse2) {
      if (inc < 0) for (let i = 0; i < n; ++i) ticks2[i] = (i2 - i) / -inc;
      else for (let i = 0; i < n; ++i) ticks2[i] = (i2 - i) * inc;
    } else {
      if (inc < 0) for (let i = 0; i < n; ++i) ticks2[i] = (i1 + i) / -inc;
      else for (let i = 0; i < n; ++i) ticks2[i] = (i1 + i) * inc;
    }
    return ticks2;
  }
  function tickIncrement(start, stop, count) {
    stop = +stop, start = +start, count = +count;
    return tickSpec(start, stop, count)[2];
  }
  function tickStep(start, stop, count) {
    stop = +stop, start = +start, count = +count;
    const reverse2 = stop < start, inc = reverse2 ? tickIncrement(stop, start, count) : tickIncrement(start, stop, count);
    return (reverse2 ? -1 : 1) * (inc < 0 ? 1 / -inc : inc);
  }

  // client/node_modules/d3-array/src/quantile.js
  init_define_import_meta_env();

  // client/node_modules/d3-array/src/max.js
  init_define_import_meta_env();
  function max(values, valueof) {
    let max2;
    if (valueof === void 0) {
      for (const value of values) {
        if (value != null && (max2 < value || max2 === void 0 && value >= value)) {
          max2 = value;
        }
      }
    } else {
      let index = -1;
      for (let value of values) {
        if ((value = valueof(value, ++index, values)) != null && (max2 < value || max2 === void 0 && value >= value)) {
          max2 = value;
        }
      }
    }
    return max2;
  }

  // client/node_modules/d3-array/src/min.js
  init_define_import_meta_env();
  function min(values, valueof) {
    let min2;
    if (valueof === void 0) {
      for (const value of values) {
        if (value != null && (min2 > value || min2 === void 0 && value >= value)) {
          min2 = value;
        }
      }
    } else {
      let index = -1;
      for (let value of values) {
        if ((value = valueof(value, ++index, values)) != null && (min2 > value || min2 === void 0 && value >= value)) {
          min2 = value;
        }
      }
    }
    return min2;
  }

  // client/node_modules/d3-array/src/quickselect.js
  init_define_import_meta_env();
  function quickselect(array, k, left = 0, right = Infinity, compare) {
    k = Math.floor(k);
    left = Math.floor(Math.max(0, left));
    right = Math.floor(Math.min(array.length - 1, right));
    if (!(left <= k && k <= right)) return array;
    compare = compare === void 0 ? ascendingDefined : compareDefined(compare);
    while (right > left) {
      if (right - left > 600) {
        const n = right - left + 1;
        const m = k - left + 1;
        const z = Math.log(n);
        const s = 0.5 * Math.exp(2 * z / 3);
        const sd = 0.5 * Math.sqrt(z * s * (n - s) / n) * (m - n / 2 < 0 ? -1 : 1);
        const newLeft = Math.max(left, Math.floor(k - m * s / n + sd));
        const newRight = Math.min(right, Math.floor(k + (n - m) * s / n + sd));
        quickselect(array, k, newLeft, newRight, compare);
      }
      const t = array[k];
      let i = left;
      let j = right;
      swap(array, left, k);
      if (compare(array[right], t) > 0) swap(array, left, right);
      while (i < j) {
        swap(array, i, j), ++i, --j;
        while (compare(array[i], t) < 0) ++i;
        while (compare(array[j], t) > 0) --j;
      }
      if (compare(array[left], t) === 0) swap(array, left, j);
      else ++j, swap(array, j, right);
      if (j <= k) left = j + 1;
      if (k <= j) right = j - 1;
    }
    return array;
  }
  function swap(array, i, j) {
    const t = array[i];
    array[i] = array[j];
    array[j] = t;
  }

  // client/node_modules/d3-array/src/quantile.js
  function quantile(values, p, valueof) {
    values = Float64Array.from(numbers(values, valueof));
    if (!(n = values.length) || isNaN(p = +p)) return;
    if (p <= 0 || n < 2) return min(values);
    if (p >= 1) return max(values);
    var n, i = (n - 1) * p, i0 = Math.floor(i), value0 = max(quickselect(values, i0).subarray(0, i0 + 1)), value1 = min(values.subarray(i0 + 1));
    return value0 + (value1 - value0) * (i - i0);
  }
  function quantileSorted(values, p, valueof = number) {
    if (!(n = values.length) || isNaN(p = +p)) return;
    if (p <= 0 || n < 2) return +valueof(values[0], 0, values);
    if (p >= 1) return +valueof(values[n - 1], n - 1, values);
    var n, i = (n - 1) * p, i0 = Math.floor(i), value0 = +valueof(values[i0], i0, values), value1 = +valueof(values[i0 + 1], i0 + 1, values);
    return value0 + (value1 - value0) * (i - i0);
  }

  // client/node_modules/d3-array/src/range.js
  init_define_import_meta_env();
  function range(start, stop, step) {
    start = +start, stop = +stop, step = (n = arguments.length) < 2 ? (stop = start, start = 0, 1) : n < 3 ? 1 : +step;
    var i = -1, n = Math.max(0, Math.ceil((stop - start) / step)) | 0, range4 = new Array(n);
    while (++i < n) {
      range4[i] = start + i * step;
    }
    return range4;
  }

  // client/node_modules/d3-scale/src/init.js
  init_define_import_meta_env();
  function initRange(domain, range4) {
    switch (arguments.length) {
      case 0:
        break;
      case 1:
        this.range(domain);
        break;
      default:
        this.range(range4).domain(domain);
        break;
    }
    return this;
  }
  function initInterpolator(domain, interpolator) {
    switch (arguments.length) {
      case 0:
        break;
      case 1: {
        if (typeof domain === "function") this.interpolator(domain);
        else this.range(domain);
        break;
      }
      default: {
        this.domain(domain);
        if (typeof interpolator === "function") this.interpolator(interpolator);
        else this.range(interpolator);
        break;
      }
    }
    return this;
  }

  // client/node_modules/d3-scale/src/ordinal.js
  init_define_import_meta_env();
  var implicit = /* @__PURE__ */ Symbol("implicit");
  function ordinal() {
    var index = new InternMap(), domain = [], range4 = [], unknown = implicit;
    function scale(d) {
      let i = index.get(d);
      if (i === void 0) {
        if (unknown !== implicit) return unknown;
        index.set(d, i = domain.push(d) - 1);
      }
      return range4[i % range4.length];
    }
    scale.domain = function(_) {
      if (!arguments.length) return domain.slice();
      domain = [], index = new InternMap();
      for (const value of _) {
        if (index.has(value)) continue;
        index.set(value, domain.push(value) - 1);
      }
      return scale;
    };
    scale.range = function(_) {
      return arguments.length ? (range4 = Array.from(_), scale) : range4.slice();
    };
    scale.unknown = function(_) {
      return arguments.length ? (unknown = _, scale) : unknown;
    };
    scale.copy = function() {
      return ordinal(domain, range4).unknown(unknown);
    };
    initRange.apply(scale, arguments);
    return scale;
  }

  // client/node_modules/d3-scale/src/band.js
  function band() {
    var scale = ordinal().unknown(void 0), domain = scale.domain, ordinalRange = scale.range, r0 = 0, r1 = 1, step, bandwidth, round = false, paddingInner = 0, paddingOuter = 0, align = 0.5;
    delete scale.unknown;
    function rescale() {
      var n = domain().length, reverse2 = r1 < r0, start = reverse2 ? r1 : r0, stop = reverse2 ? r0 : r1;
      step = (stop - start) / Math.max(1, n - paddingInner + paddingOuter * 2);
      if (round) step = Math.floor(step);
      start += (stop - start - step * (n - paddingInner)) * align;
      bandwidth = step * (1 - paddingInner);
      if (round) start = Math.round(start), bandwidth = Math.round(bandwidth);
      var values = range(n).map(function(i) {
        return start + step * i;
      });
      return ordinalRange(reverse2 ? values.reverse() : values);
    }
    scale.domain = function(_) {
      return arguments.length ? (domain(_), rescale()) : domain();
    };
    scale.range = function(_) {
      return arguments.length ? ([r0, r1] = _, r0 = +r0, r1 = +r1, rescale()) : [r0, r1];
    };
    scale.rangeRound = function(_) {
      return [r0, r1] = _, r0 = +r0, r1 = +r1, round = true, rescale();
    };
    scale.bandwidth = function() {
      return bandwidth;
    };
    scale.step = function() {
      return step;
    };
    scale.round = function(_) {
      return arguments.length ? (round = !!_, rescale()) : round;
    };
    scale.padding = function(_) {
      return arguments.length ? (paddingInner = Math.min(1, paddingOuter = +_), rescale()) : paddingInner;
    };
    scale.paddingInner = function(_) {
      return arguments.length ? (paddingInner = Math.min(1, _), rescale()) : paddingInner;
    };
    scale.paddingOuter = function(_) {
      return arguments.length ? (paddingOuter = +_, rescale()) : paddingOuter;
    };
    scale.align = function(_) {
      return arguments.length ? (align = Math.max(0, Math.min(1, _)), rescale()) : align;
    };
    scale.copy = function() {
      return band(domain(), [r0, r1]).round(round).paddingInner(paddingInner).paddingOuter(paddingOuter).align(align);
    };
    return initRange.apply(rescale(), arguments);
  }
  function pointish(scale) {
    var copy3 = scale.copy;
    scale.padding = scale.paddingOuter;
    delete scale.paddingInner;
    delete scale.paddingOuter;
    scale.copy = function() {
      return pointish(copy3());
    };
    return scale;
  }
  function point3() {
    return pointish(band.apply(null, arguments).paddingInner(1));
  }

  // client/node_modules/d3-scale/src/identity.js
  init_define_import_meta_env();

  // client/node_modules/d3-scale/src/linear.js
  init_define_import_meta_env();

  // client/node_modules/d3-scale/src/continuous.js
  init_define_import_meta_env();

  // client/node_modules/d3-interpolate/src/index.js
  init_define_import_meta_env();

  // client/node_modules/d3-interpolate/src/value.js
  init_define_import_meta_env();

  // client/node_modules/d3-color/src/index.js
  init_define_import_meta_env();

  // client/node_modules/d3-color/src/color.js
  init_define_import_meta_env();

  // client/node_modules/d3-color/src/define.js
  init_define_import_meta_env();
  function define_default(constructor, factory, prototype) {
    constructor.prototype = factory.prototype = prototype;
    prototype.constructor = constructor;
  }
  function extend(parent, definition) {
    var prototype = Object.create(parent.prototype);
    for (var key in definition) prototype[key] = definition[key];
    return prototype;
  }

  // client/node_modules/d3-color/src/color.js
  function Color() {
  }
  var darker = 0.7;
  var brighter = 1 / darker;
  var reI = "\\s*([+-]?\\d+)\\s*";
  var reN = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)\\s*";
  var reP = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)%\\s*";
  var reHex = /^#([0-9a-f]{3,8})$/;
  var reRgbInteger = new RegExp(`^rgb\\(${reI},${reI},${reI}\\)$`);
  var reRgbPercent = new RegExp(`^rgb\\(${reP},${reP},${reP}\\)$`);
  var reRgbaInteger = new RegExp(`^rgba\\(${reI},${reI},${reI},${reN}\\)$`);
  var reRgbaPercent = new RegExp(`^rgba\\(${reP},${reP},${reP},${reN}\\)$`);
  var reHslPercent = new RegExp(`^hsl\\(${reN},${reP},${reP}\\)$`);
  var reHslaPercent = new RegExp(`^hsla\\(${reN},${reP},${reP},${reN}\\)$`);
  var named = {
    aliceblue: 15792383,
    antiquewhite: 16444375,
    aqua: 65535,
    aquamarine: 8388564,
    azure: 15794175,
    beige: 16119260,
    bisque: 16770244,
    black: 0,
    blanchedalmond: 16772045,
    blue: 255,
    blueviolet: 9055202,
    brown: 10824234,
    burlywood: 14596231,
    cadetblue: 6266528,
    chartreuse: 8388352,
    chocolate: 13789470,
    coral: 16744272,
    cornflowerblue: 6591981,
    cornsilk: 16775388,
    crimson: 14423100,
    cyan: 65535,
    darkblue: 139,
    darkcyan: 35723,
    darkgoldenrod: 12092939,
    darkgray: 11119017,
    darkgreen: 25600,
    darkgrey: 11119017,
    darkkhaki: 12433259,
    darkmagenta: 9109643,
    darkolivegreen: 5597999,
    darkorange: 16747520,
    darkorchid: 10040012,
    darkred: 9109504,
    darksalmon: 15308410,
    darkseagreen: 9419919,
    darkslateblue: 4734347,
    darkslategray: 3100495,
    darkslategrey: 3100495,
    darkturquoise: 52945,
    darkviolet: 9699539,
    deeppink: 16716947,
    deepskyblue: 49151,
    dimgray: 6908265,
    dimgrey: 6908265,
    dodgerblue: 2003199,
    firebrick: 11674146,
    floralwhite: 16775920,
    forestgreen: 2263842,
    fuchsia: 16711935,
    gainsboro: 14474460,
    ghostwhite: 16316671,
    gold: 16766720,
    goldenrod: 14329120,
    gray: 8421504,
    green: 32768,
    greenyellow: 11403055,
    grey: 8421504,
    honeydew: 15794160,
    hotpink: 16738740,
    indianred: 13458524,
    indigo: 4915330,
    ivory: 16777200,
    khaki: 15787660,
    lavender: 15132410,
    lavenderblush: 16773365,
    lawngreen: 8190976,
    lemonchiffon: 16775885,
    lightblue: 11393254,
    lightcoral: 15761536,
    lightcyan: 14745599,
    lightgoldenrodyellow: 16448210,
    lightgray: 13882323,
    lightgreen: 9498256,
    lightgrey: 13882323,
    lightpink: 16758465,
    lightsalmon: 16752762,
    lightseagreen: 2142890,
    lightskyblue: 8900346,
    lightslategray: 7833753,
    lightslategrey: 7833753,
    lightsteelblue: 11584734,
    lightyellow: 16777184,
    lime: 65280,
    limegreen: 3329330,
    linen: 16445670,
    magenta: 16711935,
    maroon: 8388608,
    mediumaquamarine: 6737322,
    mediumblue: 205,
    mediumorchid: 12211667,
    mediumpurple: 9662683,
    mediumseagreen: 3978097,
    mediumslateblue: 8087790,
    mediumspringgreen: 64154,
    mediumturquoise: 4772300,
    mediumvioletred: 13047173,
    midnightblue: 1644912,
    mintcream: 16121850,
    mistyrose: 16770273,
    moccasin: 16770229,
    navajowhite: 16768685,
    navy: 128,
    oldlace: 16643558,
    olive: 8421376,
    olivedrab: 7048739,
    orange: 16753920,
    orangered: 16729344,
    orchid: 14315734,
    palegoldenrod: 15657130,
    palegreen: 10025880,
    paleturquoise: 11529966,
    palevioletred: 14381203,
    papayawhip: 16773077,
    peachpuff: 16767673,
    peru: 13468991,
    pink: 16761035,
    plum: 14524637,
    powderblue: 11591910,
    purple: 8388736,
    rebeccapurple: 6697881,
    red: 16711680,
    rosybrown: 12357519,
    royalblue: 4286945,
    saddlebrown: 9127187,
    salmon: 16416882,
    sandybrown: 16032864,
    seagreen: 3050327,
    seashell: 16774638,
    sienna: 10506797,
    silver: 12632256,
    skyblue: 8900331,
    slateblue: 6970061,
    slategray: 7372944,
    slategrey: 7372944,
    snow: 16775930,
    springgreen: 65407,
    steelblue: 4620980,
    tan: 13808780,
    teal: 32896,
    thistle: 14204888,
    tomato: 16737095,
    turquoise: 4251856,
    violet: 15631086,
    wheat: 16113331,
    white: 16777215,
    whitesmoke: 16119285,
    yellow: 16776960,
    yellowgreen: 10145074
  };
  define_default(Color, color, {
    copy(channels) {
      return Object.assign(new this.constructor(), this, channels);
    },
    displayable() {
      return this.rgb().displayable();
    },
    hex: color_formatHex,
    // Deprecated! Use color.formatHex.
    formatHex: color_formatHex,
    formatHex8: color_formatHex8,
    formatHsl: color_formatHsl,
    formatRgb: color_formatRgb,
    toString: color_formatRgb
  });
  function color_formatHex() {
    return this.rgb().formatHex();
  }
  function color_formatHex8() {
    return this.rgb().formatHex8();
  }
  function color_formatHsl() {
    return hslConvert(this).formatHsl();
  }
  function color_formatRgb() {
    return this.rgb().formatRgb();
  }
  function color(format2) {
    var m, l;
    format2 = (format2 + "").trim().toLowerCase();
    return (m = reHex.exec(format2)) ? (l = m[1].length, m = parseInt(m[1], 16), l === 6 ? rgbn(m) : l === 3 ? new Rgb(m >> 8 & 15 | m >> 4 & 240, m >> 4 & 15 | m & 240, (m & 15) << 4 | m & 15, 1) : l === 8 ? rgba(m >> 24 & 255, m >> 16 & 255, m >> 8 & 255, (m & 255) / 255) : l === 4 ? rgba(m >> 12 & 15 | m >> 8 & 240, m >> 8 & 15 | m >> 4 & 240, m >> 4 & 15 | m & 240, ((m & 15) << 4 | m & 15) / 255) : null) : (m = reRgbInteger.exec(format2)) ? new Rgb(m[1], m[2], m[3], 1) : (m = reRgbPercent.exec(format2)) ? new Rgb(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, 1) : (m = reRgbaInteger.exec(format2)) ? rgba(m[1], m[2], m[3], m[4]) : (m = reRgbaPercent.exec(format2)) ? rgba(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, m[4]) : (m = reHslPercent.exec(format2)) ? hsla(m[1], m[2] / 100, m[3] / 100, 1) : (m = reHslaPercent.exec(format2)) ? hsla(m[1], m[2] / 100, m[3] / 100, m[4]) : named.hasOwnProperty(format2) ? rgbn(named[format2]) : format2 === "transparent" ? new Rgb(NaN, NaN, NaN, 0) : null;
  }
  function rgbn(n) {
    return new Rgb(n >> 16 & 255, n >> 8 & 255, n & 255, 1);
  }
  function rgba(r2, g, b, a) {
    if (a <= 0) r2 = g = b = NaN;
    return new Rgb(r2, g, b, a);
  }
  function rgbConvert(o) {
    if (!(o instanceof Color)) o = color(o);
    if (!o) return new Rgb();
    o = o.rgb();
    return new Rgb(o.r, o.g, o.b, o.opacity);
  }
  function rgb(r2, g, b, opacity) {
    return arguments.length === 1 ? rgbConvert(r2) : new Rgb(r2, g, b, opacity == null ? 1 : opacity);
  }
  function Rgb(r2, g, b, opacity) {
    this.r = +r2;
    this.g = +g;
    this.b = +b;
    this.opacity = +opacity;
  }
  define_default(Rgb, rgb, extend(Color, {
    brighter(k) {
      k = k == null ? brighter : Math.pow(brighter, k);
      return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
    },
    darker(k) {
      k = k == null ? darker : Math.pow(darker, k);
      return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
    },
    rgb() {
      return this;
    },
    clamp() {
      return new Rgb(clampi(this.r), clampi(this.g), clampi(this.b), clampa(this.opacity));
    },
    displayable() {
      return -0.5 <= this.r && this.r < 255.5 && (-0.5 <= this.g && this.g < 255.5) && (-0.5 <= this.b && this.b < 255.5) && (0 <= this.opacity && this.opacity <= 1);
    },
    hex: rgb_formatHex,
    // Deprecated! Use color.formatHex.
    formatHex: rgb_formatHex,
    formatHex8: rgb_formatHex8,
    formatRgb: rgb_formatRgb,
    toString: rgb_formatRgb
  }));
  function rgb_formatHex() {
    return `#${hex(this.r)}${hex(this.g)}${hex(this.b)}`;
  }
  function rgb_formatHex8() {
    return `#${hex(this.r)}${hex(this.g)}${hex(this.b)}${hex((isNaN(this.opacity) ? 1 : this.opacity) * 255)}`;
  }
  function rgb_formatRgb() {
    const a = clampa(this.opacity);
    return `${a === 1 ? "rgb(" : "rgba("}${clampi(this.r)}, ${clampi(this.g)}, ${clampi(this.b)}${a === 1 ? ")" : `, ${a})`}`;
  }
  function clampa(opacity) {
    return isNaN(opacity) ? 1 : Math.max(0, Math.min(1, opacity));
  }
  function clampi(value) {
    return Math.max(0, Math.min(255, Math.round(value) || 0));
  }
  function hex(value) {
    value = clampi(value);
    return (value < 16 ? "0" : "") + value.toString(16);
  }
  function hsla(h, s, l, a) {
    if (a <= 0) h = s = l = NaN;
    else if (l <= 0 || l >= 1) h = s = NaN;
    else if (s <= 0) h = NaN;
    return new Hsl(h, s, l, a);
  }
  function hslConvert(o) {
    if (o instanceof Hsl) return new Hsl(o.h, o.s, o.l, o.opacity);
    if (!(o instanceof Color)) o = color(o);
    if (!o) return new Hsl();
    if (o instanceof Hsl) return o;
    o = o.rgb();
    var r2 = o.r / 255, g = o.g / 255, b = o.b / 255, min2 = Math.min(r2, g, b), max2 = Math.max(r2, g, b), h = NaN, s = max2 - min2, l = (max2 + min2) / 2;
    if (s) {
      if (r2 === max2) h = (g - b) / s + (g < b) * 6;
      else if (g === max2) h = (b - r2) / s + 2;
      else h = (r2 - g) / s + 4;
      s /= l < 0.5 ? max2 + min2 : 2 - max2 - min2;
      h *= 60;
    } else {
      s = l > 0 && l < 1 ? 0 : h;
    }
    return new Hsl(h, s, l, o.opacity);
  }
  function hsl(h, s, l, opacity) {
    return arguments.length === 1 ? hslConvert(h) : new Hsl(h, s, l, opacity == null ? 1 : opacity);
  }
  function Hsl(h, s, l, opacity) {
    this.h = +h;
    this.s = +s;
    this.l = +l;
    this.opacity = +opacity;
  }
  define_default(Hsl, hsl, extend(Color, {
    brighter(k) {
      k = k == null ? brighter : Math.pow(brighter, k);
      return new Hsl(this.h, this.s, this.l * k, this.opacity);
    },
    darker(k) {
      k = k == null ? darker : Math.pow(darker, k);
      return new Hsl(this.h, this.s, this.l * k, this.opacity);
    },
    rgb() {
      var h = this.h % 360 + (this.h < 0) * 360, s = isNaN(h) || isNaN(this.s) ? 0 : this.s, l = this.l, m2 = l + (l < 0.5 ? l : 1 - l) * s, m1 = 2 * l - m2;
      return new Rgb(
        hsl2rgb(h >= 240 ? h - 240 : h + 120, m1, m2),
        hsl2rgb(h, m1, m2),
        hsl2rgb(h < 120 ? h + 240 : h - 120, m1, m2),
        this.opacity
      );
    },
    clamp() {
      return new Hsl(clamph(this.h), clampt(this.s), clampt(this.l), clampa(this.opacity));
    },
    displayable() {
      return (0 <= this.s && this.s <= 1 || isNaN(this.s)) && (0 <= this.l && this.l <= 1) && (0 <= this.opacity && this.opacity <= 1);
    },
    formatHsl() {
      const a = clampa(this.opacity);
      return `${a === 1 ? "hsl(" : "hsla("}${clamph(this.h)}, ${clampt(this.s) * 100}%, ${clampt(this.l) * 100}%${a === 1 ? ")" : `, ${a})`}`;
    }
  }));
  function clamph(value) {
    value = (value || 0) % 360;
    return value < 0 ? value + 360 : value;
  }
  function clampt(value) {
    return Math.max(0, Math.min(1, value || 0));
  }
  function hsl2rgb(h, m1, m2) {
    return (h < 60 ? m1 + (m2 - m1) * h / 60 : h < 180 ? m2 : h < 240 ? m1 + (m2 - m1) * (240 - h) / 60 : m1) * 255;
  }

  // client/node_modules/d3-interpolate/src/rgb.js
  init_define_import_meta_env();

  // client/node_modules/d3-interpolate/src/basis.js
  init_define_import_meta_env();
  function basis(t12, v0, v1, v2, v3) {
    var t2 = t12 * t12, t3 = t2 * t12;
    return ((1 - 3 * t12 + 3 * t2 - t3) * v0 + (4 - 6 * t2 + 3 * t3) * v1 + (1 + 3 * t12 + 3 * t2 - 3 * t3) * v2 + t3 * v3) / 6;
  }
  function basis_default2(values) {
    var n = values.length - 1;
    return function(t) {
      var i = t <= 0 ? t = 0 : t >= 1 ? (t = 1, n - 1) : Math.floor(t * n), v1 = values[i], v2 = values[i + 1], v0 = i > 0 ? values[i - 1] : 2 * v1 - v2, v3 = i < n - 1 ? values[i + 2] : 2 * v2 - v1;
      return basis((t - i / n) * n, v0, v1, v2, v3);
    };
  }

  // client/node_modules/d3-interpolate/src/basisClosed.js
  init_define_import_meta_env();
  function basisClosed_default2(values) {
    var n = values.length;
    return function(t) {
      var i = Math.floor(((t %= 1) < 0 ? ++t : t) * n), v0 = values[(i + n - 1) % n], v1 = values[i % n], v2 = values[(i + 1) % n], v3 = values[(i + 2) % n];
      return basis((t - i / n) * n, v0, v1, v2, v3);
    };
  }

  // client/node_modules/d3-interpolate/src/color.js
  init_define_import_meta_env();

  // client/node_modules/d3-interpolate/src/constant.js
  init_define_import_meta_env();
  var constant_default2 = (x2) => () => x2;

  // client/node_modules/d3-interpolate/src/color.js
  function linear(a, d) {
    return function(t) {
      return a + t * d;
    };
  }
  function exponential(a, b, y2) {
    return a = Math.pow(a, y2), b = Math.pow(b, y2) - a, y2 = 1 / y2, function(t) {
      return Math.pow(a + t * b, y2);
    };
  }
  function gamma(y2) {
    return (y2 = +y2) === 1 ? nogamma : function(a, b) {
      return b - a ? exponential(a, b, y2) : constant_default2(isNaN(a) ? b : a);
    };
  }
  function nogamma(a, b) {
    var d = b - a;
    return d ? linear(a, d) : constant_default2(isNaN(a) ? b : a);
  }

  // client/node_modules/d3-interpolate/src/rgb.js
  var rgb_default = (function rgbGamma(y2) {
    var color2 = gamma(y2);
    function rgb2(start, end) {
      var r2 = color2((start = rgb(start)).r, (end = rgb(end)).r), g = color2(start.g, end.g), b = color2(start.b, end.b), opacity = nogamma(start.opacity, end.opacity);
      return function(t) {
        start.r = r2(t);
        start.g = g(t);
        start.b = b(t);
        start.opacity = opacity(t);
        return start + "";
      };
    }
    rgb2.gamma = rgbGamma;
    return rgb2;
  })(1);
  function rgbSpline(spline) {
    return function(colors) {
      var n = colors.length, r2 = new Array(n), g = new Array(n), b = new Array(n), i, color2;
      for (i = 0; i < n; ++i) {
        color2 = rgb(colors[i]);
        r2[i] = color2.r || 0;
        g[i] = color2.g || 0;
        b[i] = color2.b || 0;
      }
      r2 = spline(r2);
      g = spline(g);
      b = spline(b);
      color2.opacity = 1;
      return function(t) {
        color2.r = r2(t);
        color2.g = g(t);
        color2.b = b(t);
        return color2 + "";
      };
    };
  }
  var rgbBasis = rgbSpline(basis_default2);
  var rgbBasisClosed = rgbSpline(basisClosed_default2);

  // client/node_modules/d3-interpolate/src/array.js
  init_define_import_meta_env();

  // client/node_modules/d3-interpolate/src/numberArray.js
  init_define_import_meta_env();
  function numberArray_default(a, b) {
    if (!b) b = [];
    var n = a ? Math.min(b.length, a.length) : 0, c = b.slice(), i;
    return function(t) {
      for (i = 0; i < n; ++i) c[i] = a[i] * (1 - t) + b[i] * t;
      return c;
    };
  }
  function isNumberArray(x2) {
    return ArrayBuffer.isView(x2) && !(x2 instanceof DataView);
  }

  // client/node_modules/d3-interpolate/src/array.js
  function genericArray(a, b) {
    var nb = b ? b.length : 0, na = a ? Math.min(nb, a.length) : 0, x2 = new Array(na), c = new Array(nb), i;
    for (i = 0; i < na; ++i) x2[i] = value_default(a[i], b[i]);
    for (; i < nb; ++i) c[i] = b[i];
    return function(t) {
      for (i = 0; i < na; ++i) c[i] = x2[i](t);
      return c;
    };
  }

  // client/node_modules/d3-interpolate/src/date.js
  init_define_import_meta_env();
  function date_default(a, b) {
    var d = /* @__PURE__ */ new Date();
    return a = +a, b = +b, function(t) {
      return d.setTime(a * (1 - t) + b * t), d;
    };
  }

  // client/node_modules/d3-interpolate/src/number.js
  init_define_import_meta_env();
  function number_default(a, b) {
    return a = +a, b = +b, function(t) {
      return a * (1 - t) + b * t;
    };
  }

  // client/node_modules/d3-interpolate/src/object.js
  init_define_import_meta_env();
  function object_default(a, b) {
    var i = {}, c = {}, k;
    if (a === null || typeof a !== "object") a = {};
    if (b === null || typeof b !== "object") b = {};
    for (k in b) {
      if (k in a) {
        i[k] = value_default(a[k], b[k]);
      } else {
        c[k] = b[k];
      }
    }
    return function(t) {
      for (k in i) c[k] = i[k](t);
      return c;
    };
  }

  // client/node_modules/d3-interpolate/src/string.js
  init_define_import_meta_env();
  var reA = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g;
  var reB = new RegExp(reA.source, "g");
  function zero2(b) {
    return function() {
      return b;
    };
  }
  function one(b) {
    return function(t) {
      return b(t) + "";
    };
  }
  function string_default(a, b) {
    var bi = reA.lastIndex = reB.lastIndex = 0, am, bm, bs, i = -1, s = [], q = [];
    a = a + "", b = b + "";
    while ((am = reA.exec(a)) && (bm = reB.exec(b))) {
      if ((bs = bm.index) > bi) {
        bs = b.slice(bi, bs);
        if (s[i]) s[i] += bs;
        else s[++i] = bs;
      }
      if ((am = am[0]) === (bm = bm[0])) {
        if (s[i]) s[i] += bm;
        else s[++i] = bm;
      } else {
        s[++i] = null;
        q.push({ i, x: number_default(am, bm) });
      }
      bi = reB.lastIndex;
    }
    if (bi < b.length) {
      bs = b.slice(bi);
      if (s[i]) s[i] += bs;
      else s[++i] = bs;
    }
    return s.length < 2 ? q[0] ? one(q[0].x) : zero2(b) : (b = q.length, function(t) {
      for (var i2 = 0, o; i2 < b; ++i2) s[(o = q[i2]).i] = o.x(t);
      return s.join("");
    });
  }

  // client/node_modules/d3-interpolate/src/value.js
  function value_default(a, b) {
    var t = typeof b, c;
    return b == null || t === "boolean" ? constant_default2(b) : (t === "number" ? number_default : t === "string" ? (c = color(b)) ? (b = c, rgb_default) : string_default : b instanceof color ? rgb_default : b instanceof Date ? date_default : isNumberArray(b) ? numberArray_default : Array.isArray(b) ? genericArray : typeof b.valueOf !== "function" && typeof b.toString !== "function" || isNaN(b) ? object_default : number_default)(a, b);
  }

  // client/node_modules/d3-interpolate/src/round.js
  init_define_import_meta_env();
  function round_default(a, b) {
    return a = +a, b = +b, function(t) {
      return Math.round(a * (1 - t) + b * t);
    };
  }

  // client/node_modules/d3-interpolate/src/piecewise.js
  init_define_import_meta_env();
  function piecewise(interpolate, values) {
    if (values === void 0) values = interpolate, interpolate = value_default;
    var i = 0, n = values.length - 1, v = values[0], I = new Array(n < 0 ? 0 : n);
    while (i < n) I[i] = interpolate(v, v = values[++i]);
    return function(t) {
      var i2 = Math.max(0, Math.min(n - 1, Math.floor(t *= n)));
      return I[i2](t - i2);
    };
  }

  // client/node_modules/d3-scale/src/constant.js
  init_define_import_meta_env();
  function constants(x2) {
    return function() {
      return x2;
    };
  }

  // client/node_modules/d3-scale/src/number.js
  init_define_import_meta_env();
  function number2(x2) {
    return +x2;
  }

  // client/node_modules/d3-scale/src/continuous.js
  var unit = [0, 1];
  function identity(x2) {
    return x2;
  }
  function normalize(a, b) {
    return (b -= a = +a) ? function(x2) {
      return (x2 - a) / b;
    } : constants(isNaN(b) ? NaN : 0.5);
  }
  function clamper(a, b) {
    var t;
    if (a > b) t = a, a = b, b = t;
    return function(x2) {
      return Math.max(a, Math.min(b, x2));
    };
  }
  function bimap(domain, range4, interpolate) {
    var d0 = domain[0], d1 = domain[1], r0 = range4[0], r1 = range4[1];
    if (d1 < d0) d0 = normalize(d1, d0), r0 = interpolate(r1, r0);
    else d0 = normalize(d0, d1), r0 = interpolate(r0, r1);
    return function(x2) {
      return r0(d0(x2));
    };
  }
  function polymap(domain, range4, interpolate) {
    var j = Math.min(domain.length, range4.length) - 1, d = new Array(j), r2 = new Array(j), i = -1;
    if (domain[j] < domain[0]) {
      domain = domain.slice().reverse();
      range4 = range4.slice().reverse();
    }
    while (++i < j) {
      d[i] = normalize(domain[i], domain[i + 1]);
      r2[i] = interpolate(range4[i], range4[i + 1]);
    }
    return function(x2) {
      var i2 = bisect_default(domain, x2, 1, j) - 1;
      return r2[i2](d[i2](x2));
    };
  }
  function copy(source, target) {
    return target.domain(source.domain()).range(source.range()).interpolate(source.interpolate()).clamp(source.clamp()).unknown(source.unknown());
  }
  function transformer() {
    var domain = unit, range4 = unit, interpolate = value_default, transform, untransform, unknown, clamp = identity, piecewise2, output, input;
    function rescale() {
      var n = Math.min(domain.length, range4.length);
      if (clamp !== identity) clamp = clamper(domain[0], domain[n - 1]);
      piecewise2 = n > 2 ? polymap : bimap;
      output = input = null;
      return scale;
    }
    function scale(x2) {
      return x2 == null || isNaN(x2 = +x2) ? unknown : (output || (output = piecewise2(domain.map(transform), range4, interpolate)))(transform(clamp(x2)));
    }
    scale.invert = function(y2) {
      return clamp(untransform((input || (input = piecewise2(range4, domain.map(transform), number_default)))(y2)));
    };
    scale.domain = function(_) {
      return arguments.length ? (domain = Array.from(_, number2), rescale()) : domain.slice();
    };
    scale.range = function(_) {
      return arguments.length ? (range4 = Array.from(_), rescale()) : range4.slice();
    };
    scale.rangeRound = function(_) {
      return range4 = Array.from(_), interpolate = round_default, rescale();
    };
    scale.clamp = function(_) {
      return arguments.length ? (clamp = _ ? true : identity, rescale()) : clamp !== identity;
    };
    scale.interpolate = function(_) {
      return arguments.length ? (interpolate = _, rescale()) : interpolate;
    };
    scale.unknown = function(_) {
      return arguments.length ? (unknown = _, scale) : unknown;
    };
    return function(t, u) {
      transform = t, untransform = u;
      return rescale();
    };
  }
  function continuous() {
    return transformer()(identity, identity);
  }

  // client/node_modules/d3-scale/src/tickFormat.js
  init_define_import_meta_env();

  // client/node_modules/d3-format/src/index.js
  init_define_import_meta_env();

  // client/node_modules/d3-format/src/defaultLocale.js
  init_define_import_meta_env();

  // client/node_modules/d3-format/src/locale.js
  init_define_import_meta_env();

  // client/node_modules/d3-format/src/exponent.js
  init_define_import_meta_env();

  // client/node_modules/d3-format/src/formatDecimal.js
  init_define_import_meta_env();
  function formatDecimal_default(x2) {
    return Math.abs(x2 = Math.round(x2)) >= 1e21 ? x2.toLocaleString("en").replace(/,/g, "") : x2.toString(10);
  }
  function formatDecimalParts(x2, p) {
    if ((i = (x2 = p ? x2.toExponential(p - 1) : x2.toExponential()).indexOf("e")) < 0) return null;
    var i, coefficient = x2.slice(0, i);
    return [
      coefficient.length > 1 ? coefficient[0] + coefficient.slice(2) : coefficient,
      +x2.slice(i + 1)
    ];
  }

  // client/node_modules/d3-format/src/exponent.js
  function exponent_default(x2) {
    return x2 = formatDecimalParts(Math.abs(x2)), x2 ? x2[1] : NaN;
  }

  // client/node_modules/d3-format/src/formatGroup.js
  init_define_import_meta_env();
  function formatGroup_default(grouping, thousands) {
    return function(value, width) {
      var i = value.length, t = [], j = 0, g = grouping[0], length = 0;
      while (i > 0 && g > 0) {
        if (length + g + 1 > width) g = Math.max(1, width - length);
        t.push(value.substring(i -= g, i + g));
        if ((length += g + 1) > width) break;
        g = grouping[j = (j + 1) % grouping.length];
      }
      return t.reverse().join(thousands);
    };
  }

  // client/node_modules/d3-format/src/formatNumerals.js
  init_define_import_meta_env();
  function formatNumerals_default(numerals) {
    return function(value) {
      return value.replace(/[0-9]/g, function(i) {
        return numerals[+i];
      });
    };
  }

  // client/node_modules/d3-format/src/formatSpecifier.js
  init_define_import_meta_env();
  var re = /^(?:(.)?([<>=^]))?([+\-( ])?([$#])?(0)?(\d+)?(,)?(\.\d+)?(~)?([a-z%])?$/i;
  function formatSpecifier(specifier) {
    if (!(match = re.exec(specifier))) throw new Error("invalid format: " + specifier);
    var match;
    return new FormatSpecifier({
      fill: match[1],
      align: match[2],
      sign: match[3],
      symbol: match[4],
      zero: match[5],
      width: match[6],
      comma: match[7],
      precision: match[8] && match[8].slice(1),
      trim: match[9],
      type: match[10]
    });
  }
  formatSpecifier.prototype = FormatSpecifier.prototype;
  function FormatSpecifier(specifier) {
    this.fill = specifier.fill === void 0 ? " " : specifier.fill + "";
    this.align = specifier.align === void 0 ? ">" : specifier.align + "";
    this.sign = specifier.sign === void 0 ? "-" : specifier.sign + "";
    this.symbol = specifier.symbol === void 0 ? "" : specifier.symbol + "";
    this.zero = !!specifier.zero;
    this.width = specifier.width === void 0 ? void 0 : +specifier.width;
    this.comma = !!specifier.comma;
    this.precision = specifier.precision === void 0 ? void 0 : +specifier.precision;
    this.trim = !!specifier.trim;
    this.type = specifier.type === void 0 ? "" : specifier.type + "";
  }
  FormatSpecifier.prototype.toString = function() {
    return this.fill + this.align + this.sign + this.symbol + (this.zero ? "0" : "") + (this.width === void 0 ? "" : Math.max(1, this.width | 0)) + (this.comma ? "," : "") + (this.precision === void 0 ? "" : "." + Math.max(0, this.precision | 0)) + (this.trim ? "~" : "") + this.type;
  };

  // client/node_modules/d3-format/src/formatTrim.js
  init_define_import_meta_env();
  function formatTrim_default(s) {
    out: for (var n = s.length, i = 1, i0 = -1, i1; i < n; ++i) {
      switch (s[i]) {
        case ".":
          i0 = i1 = i;
          break;
        case "0":
          if (i0 === 0) i0 = i;
          i1 = i;
          break;
        default:
          if (!+s[i]) break out;
          if (i0 > 0) i0 = 0;
          break;
      }
    }
    return i0 > 0 ? s.slice(0, i0) + s.slice(i1 + 1) : s;
  }

  // client/node_modules/d3-format/src/formatTypes.js
  init_define_import_meta_env();

  // client/node_modules/d3-format/src/formatPrefixAuto.js
  init_define_import_meta_env();
  var prefixExponent;
  function formatPrefixAuto_default(x2, p) {
    var d = formatDecimalParts(x2, p);
    if (!d) return x2 + "";
    var coefficient = d[0], exponent = d[1], i = exponent - (prefixExponent = Math.max(-8, Math.min(8, Math.floor(exponent / 3))) * 3) + 1, n = coefficient.length;
    return i === n ? coefficient : i > n ? coefficient + new Array(i - n + 1).join("0") : i > 0 ? coefficient.slice(0, i) + "." + coefficient.slice(i) : "0." + new Array(1 - i).join("0") + formatDecimalParts(x2, Math.max(0, p + i - 1))[0];
  }

  // client/node_modules/d3-format/src/formatRounded.js
  init_define_import_meta_env();
  function formatRounded_default(x2, p) {
    var d = formatDecimalParts(x2, p);
    if (!d) return x2 + "";
    var coefficient = d[0], exponent = d[1];
    return exponent < 0 ? "0." + new Array(-exponent).join("0") + coefficient : coefficient.length > exponent + 1 ? coefficient.slice(0, exponent + 1) + "." + coefficient.slice(exponent + 1) : coefficient + new Array(exponent - coefficient.length + 2).join("0");
  }

  // client/node_modules/d3-format/src/formatTypes.js
  var formatTypes_default = {
    "%": (x2, p) => (x2 * 100).toFixed(p),
    "b": (x2) => Math.round(x2).toString(2),
    "c": (x2) => x2 + "",
    "d": formatDecimal_default,
    "e": (x2, p) => x2.toExponential(p),
    "f": (x2, p) => x2.toFixed(p),
    "g": (x2, p) => x2.toPrecision(p),
    "o": (x2) => Math.round(x2).toString(8),
    "p": (x2, p) => formatRounded_default(x2 * 100, p),
    "r": formatRounded_default,
    "s": formatPrefixAuto_default,
    "X": (x2) => Math.round(x2).toString(16).toUpperCase(),
    "x": (x2) => Math.round(x2).toString(16)
  };

  // client/node_modules/d3-format/src/identity.js
  init_define_import_meta_env();
  function identity_default(x2) {
    return x2;
  }

  // client/node_modules/d3-format/src/locale.js
  var map = Array.prototype.map;
  var prefixes = ["y", "z", "a", "f", "p", "n", "\xB5", "m", "", "k", "M", "G", "T", "P", "E", "Z", "Y"];
  function locale_default(locale3) {
    var group = locale3.grouping === void 0 || locale3.thousands === void 0 ? identity_default : formatGroup_default(map.call(locale3.grouping, Number), locale3.thousands + ""), currencyPrefix = locale3.currency === void 0 ? "" : locale3.currency[0] + "", currencySuffix = locale3.currency === void 0 ? "" : locale3.currency[1] + "", decimal = locale3.decimal === void 0 ? "." : locale3.decimal + "", numerals = locale3.numerals === void 0 ? identity_default : formatNumerals_default(map.call(locale3.numerals, String)), percent = locale3.percent === void 0 ? "%" : locale3.percent + "", minus = locale3.minus === void 0 ? "\u2212" : locale3.minus + "", nan = locale3.nan === void 0 ? "NaN" : locale3.nan + "";
    function newFormat(specifier) {
      specifier = formatSpecifier(specifier);
      var fill = specifier.fill, align = specifier.align, sign2 = specifier.sign, symbol = specifier.symbol, zero3 = specifier.zero, width = specifier.width, comma = specifier.comma, precision = specifier.precision, trim = specifier.trim, type = specifier.type;
      if (type === "n") comma = true, type = "g";
      else if (!formatTypes_default[type]) precision === void 0 && (precision = 12), trim = true, type = "g";
      if (zero3 || fill === "0" && align === "=") zero3 = true, fill = "0", align = "=";
      var prefix = symbol === "$" ? currencyPrefix : symbol === "#" && /[boxX]/.test(type) ? "0" + type.toLowerCase() : "", suffix = symbol === "$" ? currencySuffix : /[%p]/.test(type) ? percent : "";
      var formatType = formatTypes_default[type], maybeSuffix = /[defgprs%]/.test(type);
      precision = precision === void 0 ? 6 : /[gprs]/.test(type) ? Math.max(1, Math.min(21, precision)) : Math.max(0, Math.min(20, precision));
      function format2(value) {
        var valuePrefix = prefix, valueSuffix = suffix, i, n, c;
        if (type === "c") {
          valueSuffix = formatType(value) + valueSuffix;
          value = "";
        } else {
          value = +value;
          var valueNegative = value < 0 || 1 / value < 0;
          value = isNaN(value) ? nan : formatType(Math.abs(value), precision);
          if (trim) value = formatTrim_default(value);
          if (valueNegative && +value === 0 && sign2 !== "+") valueNegative = false;
          valuePrefix = (valueNegative ? sign2 === "(" ? sign2 : minus : sign2 === "-" || sign2 === "(" ? "" : sign2) + valuePrefix;
          valueSuffix = (type === "s" ? prefixes[8 + prefixExponent / 3] : "") + valueSuffix + (valueNegative && sign2 === "(" ? ")" : "");
          if (maybeSuffix) {
            i = -1, n = value.length;
            while (++i < n) {
              if (c = value.charCodeAt(i), 48 > c || c > 57) {
                valueSuffix = (c === 46 ? decimal + value.slice(i + 1) : value.slice(i)) + valueSuffix;
                value = value.slice(0, i);
                break;
              }
            }
          }
        }
        if (comma && !zero3) value = group(value, Infinity);
        var length = valuePrefix.length + value.length + valueSuffix.length, padding = length < width ? new Array(width - length + 1).join(fill) : "";
        if (comma && zero3) value = group(padding + value, padding.length ? width - valueSuffix.length : Infinity), padding = "";
        switch (align) {
          case "<":
            value = valuePrefix + value + valueSuffix + padding;
            break;
          case "=":
            value = valuePrefix + padding + value + valueSuffix;
            break;
          case "^":
            value = padding.slice(0, length = padding.length >> 1) + valuePrefix + value + valueSuffix + padding.slice(length);
            break;
          default:
            value = padding + valuePrefix + value + valueSuffix;
            break;
        }
        return numerals(value);
      }
      format2.toString = function() {
        return specifier + "";
      };
      return format2;
    }
    function formatPrefix2(specifier, value) {
      var f = newFormat((specifier = formatSpecifier(specifier), specifier.type = "f", specifier)), e = Math.max(-8, Math.min(8, Math.floor(exponent_default(value) / 3))) * 3, k = Math.pow(10, -e), prefix = prefixes[8 + e / 3];
      return function(value2) {
        return f(k * value2) + prefix;
      };
    }
    return {
      format: newFormat,
      formatPrefix: formatPrefix2
    };
  }

  // client/node_modules/d3-format/src/defaultLocale.js
  var locale;
  var format;
  var formatPrefix;
  defaultLocale({
    thousands: ",",
    grouping: [3],
    currency: ["$", ""]
  });
  function defaultLocale(definition) {
    locale = locale_default(definition);
    format = locale.format;
    formatPrefix = locale.formatPrefix;
    return locale;
  }

  // client/node_modules/d3-format/src/precisionFixed.js
  init_define_import_meta_env();
  function precisionFixed_default(step) {
    return Math.max(0, -exponent_default(Math.abs(step)));
  }

  // client/node_modules/d3-format/src/precisionPrefix.js
  init_define_import_meta_env();
  function precisionPrefix_default(step, value) {
    return Math.max(0, Math.max(-8, Math.min(8, Math.floor(exponent_default(value) / 3))) * 3 - exponent_default(Math.abs(step)));
  }

  // client/node_modules/d3-format/src/precisionRound.js
  init_define_import_meta_env();
  function precisionRound_default(step, max2) {
    step = Math.abs(step), max2 = Math.abs(max2) - step;
    return Math.max(0, exponent_default(max2) - exponent_default(step)) + 1;
  }

  // client/node_modules/d3-scale/src/tickFormat.js
  function tickFormat(start, stop, count, specifier) {
    var step = tickStep(start, stop, count), precision;
    specifier = formatSpecifier(specifier == null ? ",f" : specifier);
    switch (specifier.type) {
      case "s": {
        var value = Math.max(Math.abs(start), Math.abs(stop));
        if (specifier.precision == null && !isNaN(precision = precisionPrefix_default(step, value))) specifier.precision = precision;
        return formatPrefix(specifier, value);
      }
      case "":
      case "e":
      case "g":
      case "p":
      case "r": {
        if (specifier.precision == null && !isNaN(precision = precisionRound_default(step, Math.max(Math.abs(start), Math.abs(stop))))) specifier.precision = precision - (specifier.type === "e");
        break;
      }
      case "f":
      case "%": {
        if (specifier.precision == null && !isNaN(precision = precisionFixed_default(step))) specifier.precision = precision - (specifier.type === "%") * 2;
        break;
      }
    }
    return format(specifier);
  }

  // client/node_modules/d3-scale/src/linear.js
  function linearish(scale) {
    var domain = scale.domain;
    scale.ticks = function(count) {
      var d = domain();
      return ticks(d[0], d[d.length - 1], count == null ? 10 : count);
    };
    scale.tickFormat = function(count, specifier) {
      var d = domain();
      return tickFormat(d[0], d[d.length - 1], count == null ? 10 : count, specifier);
    };
    scale.nice = function(count) {
      if (count == null) count = 10;
      var d = domain();
      var i0 = 0;
      var i1 = d.length - 1;
      var start = d[i0];
      var stop = d[i1];
      var prestep;
      var step;
      var maxIter = 10;
      if (stop < start) {
        step = start, start = stop, stop = step;
        step = i0, i0 = i1, i1 = step;
      }
      while (maxIter-- > 0) {
        step = tickIncrement(start, stop, count);
        if (step === prestep) {
          d[i0] = start;
          d[i1] = stop;
          return domain(d);
        } else if (step > 0) {
          start = Math.floor(start / step) * step;
          stop = Math.ceil(stop / step) * step;
        } else if (step < 0) {
          start = Math.ceil(start * step) / step;
          stop = Math.floor(stop * step) / step;
        } else {
          break;
        }
        prestep = step;
      }
      return scale;
    };
    return scale;
  }
  function linear2() {
    var scale = continuous();
    scale.copy = function() {
      return copy(scale, linear2());
    };
    initRange.apply(scale, arguments);
    return linearish(scale);
  }

  // client/node_modules/d3-scale/src/identity.js
  function identity2(domain) {
    var unknown;
    function scale(x2) {
      return x2 == null || isNaN(x2 = +x2) ? unknown : x2;
    }
    scale.invert = scale;
    scale.domain = scale.range = function(_) {
      return arguments.length ? (domain = Array.from(_, number2), scale) : domain.slice();
    };
    scale.unknown = function(_) {
      return arguments.length ? (unknown = _, scale) : unknown;
    };
    scale.copy = function() {
      return identity2(domain).unknown(unknown);
    };
    domain = arguments.length ? Array.from(domain, number2) : [0, 1];
    return linearish(scale);
  }

  // client/node_modules/d3-scale/src/log.js
  init_define_import_meta_env();

  // client/node_modules/d3-scale/src/nice.js
  init_define_import_meta_env();
  function nice(domain, interval) {
    domain = domain.slice();
    var i0 = 0, i1 = domain.length - 1, x0 = domain[i0], x1 = domain[i1], t;
    if (x1 < x0) {
      t = i0, i0 = i1, i1 = t;
      t = x0, x0 = x1, x1 = t;
    }
    domain[i0] = interval.floor(x0);
    domain[i1] = interval.ceil(x1);
    return domain;
  }

  // client/node_modules/d3-scale/src/log.js
  function transformLog(x2) {
    return Math.log(x2);
  }
  function transformExp(x2) {
    return Math.exp(x2);
  }
  function transformLogn(x2) {
    return -Math.log(-x2);
  }
  function transformExpn(x2) {
    return -Math.exp(-x2);
  }
  function pow10(x2) {
    return isFinite(x2) ? +("1e" + x2) : x2 < 0 ? 0 : x2;
  }
  function powp(base) {
    return base === 10 ? pow10 : base === Math.E ? Math.exp : (x2) => Math.pow(base, x2);
  }
  function logp(base) {
    return base === Math.E ? Math.log : base === 10 && Math.log10 || base === 2 && Math.log2 || (base = Math.log(base), (x2) => Math.log(x2) / base);
  }
  function reflect(f) {
    return (x2, k) => -f(-x2, k);
  }
  function loggish(transform) {
    const scale = transform(transformLog, transformExp);
    const domain = scale.domain;
    let base = 10;
    let logs;
    let pows;
    function rescale() {
      logs = logp(base), pows = powp(base);
      if (domain()[0] < 0) {
        logs = reflect(logs), pows = reflect(pows);
        transform(transformLogn, transformExpn);
      } else {
        transform(transformLog, transformExp);
      }
      return scale;
    }
    scale.base = function(_) {
      return arguments.length ? (base = +_, rescale()) : base;
    };
    scale.domain = function(_) {
      return arguments.length ? (domain(_), rescale()) : domain();
    };
    scale.ticks = (count) => {
      const d = domain();
      let u = d[0];
      let v = d[d.length - 1];
      const r2 = v < u;
      if (r2) [u, v] = [v, u];
      let i = logs(u);
      let j = logs(v);
      let k;
      let t;
      const n = count == null ? 10 : +count;
      let z = [];
      if (!(base % 1) && j - i < n) {
        i = Math.floor(i), j = Math.ceil(j);
        if (u > 0) for (; i <= j; ++i) {
          for (k = 1; k < base; ++k) {
            t = i < 0 ? k / pows(-i) : k * pows(i);
            if (t < u) continue;
            if (t > v) break;
            z.push(t);
          }
        }
        else for (; i <= j; ++i) {
          for (k = base - 1; k >= 1; --k) {
            t = i > 0 ? k / pows(-i) : k * pows(i);
            if (t < u) continue;
            if (t > v) break;
            z.push(t);
          }
        }
        if (z.length * 2 < n) z = ticks(u, v, n);
      } else {
        z = ticks(i, j, Math.min(j - i, n)).map(pows);
      }
      return r2 ? z.reverse() : z;
    };
    scale.tickFormat = (count, specifier) => {
      if (count == null) count = 10;
      if (specifier == null) specifier = base === 10 ? "s" : ",";
      if (typeof specifier !== "function") {
        if (!(base % 1) && (specifier = formatSpecifier(specifier)).precision == null) specifier.trim = true;
        specifier = format(specifier);
      }
      if (count === Infinity) return specifier;
      const k = Math.max(1, base * count / scale.ticks().length);
      return (d) => {
        let i = d / pows(Math.round(logs(d)));
        if (i * base < base - 0.5) i *= base;
        return i <= k ? specifier(d) : "";
      };
    };
    scale.nice = () => {
      return domain(nice(domain(), {
        floor: (x2) => pows(Math.floor(logs(x2))),
        ceil: (x2) => pows(Math.ceil(logs(x2)))
      }));
    };
    return scale;
  }
  function log() {
    const scale = loggish(transformer()).domain([1, 10]);
    scale.copy = () => copy(scale, log()).base(scale.base());
    initRange.apply(scale, arguments);
    return scale;
  }

  // client/node_modules/d3-scale/src/symlog.js
  init_define_import_meta_env();
  function transformSymlog(c) {
    return function(x2) {
      return Math.sign(x2) * Math.log1p(Math.abs(x2 / c));
    };
  }
  function transformSymexp(c) {
    return function(x2) {
      return Math.sign(x2) * Math.expm1(Math.abs(x2)) * c;
    };
  }
  function symlogish(transform) {
    var c = 1, scale = transform(transformSymlog(c), transformSymexp(c));
    scale.constant = function(_) {
      return arguments.length ? transform(transformSymlog(c = +_), transformSymexp(c)) : c;
    };
    return linearish(scale);
  }
  function symlog() {
    var scale = symlogish(transformer());
    scale.copy = function() {
      return copy(scale, symlog()).constant(scale.constant());
    };
    return initRange.apply(scale, arguments);
  }

  // client/node_modules/d3-scale/src/pow.js
  init_define_import_meta_env();
  function transformPow(exponent) {
    return function(x2) {
      return x2 < 0 ? -Math.pow(-x2, exponent) : Math.pow(x2, exponent);
    };
  }
  function transformSqrt(x2) {
    return x2 < 0 ? -Math.sqrt(-x2) : Math.sqrt(x2);
  }
  function transformSquare(x2) {
    return x2 < 0 ? -x2 * x2 : x2 * x2;
  }
  function powish(transform) {
    var scale = transform(identity, identity), exponent = 1;
    function rescale() {
      return exponent === 1 ? transform(identity, identity) : exponent === 0.5 ? transform(transformSqrt, transformSquare) : transform(transformPow(exponent), transformPow(1 / exponent));
    }
    scale.exponent = function(_) {
      return arguments.length ? (exponent = +_, rescale()) : exponent;
    };
    return linearish(scale);
  }
  function pow() {
    var scale = powish(transformer());
    scale.copy = function() {
      return copy(scale, pow()).exponent(scale.exponent());
    };
    initRange.apply(scale, arguments);
    return scale;
  }
  function sqrt() {
    return pow.apply(null, arguments).exponent(0.5);
  }

  // client/node_modules/d3-scale/src/radial.js
  init_define_import_meta_env();
  function square(x2) {
    return Math.sign(x2) * x2 * x2;
  }
  function unsquare(x2) {
    return Math.sign(x2) * Math.sqrt(Math.abs(x2));
  }
  function radial() {
    var squared = continuous(), range4 = [0, 1], round = false, unknown;
    function scale(x2) {
      var y2 = unsquare(squared(x2));
      return isNaN(y2) ? unknown : round ? Math.round(y2) : y2;
    }
    scale.invert = function(y2) {
      return squared.invert(square(y2));
    };
    scale.domain = function(_) {
      return arguments.length ? (squared.domain(_), scale) : squared.domain();
    };
    scale.range = function(_) {
      return arguments.length ? (squared.range((range4 = Array.from(_, number2)).map(square)), scale) : range4.slice();
    };
    scale.rangeRound = function(_) {
      return scale.range(_).round(true);
    };
    scale.round = function(_) {
      return arguments.length ? (round = !!_, scale) : round;
    };
    scale.clamp = function(_) {
      return arguments.length ? (squared.clamp(_), scale) : squared.clamp();
    };
    scale.unknown = function(_) {
      return arguments.length ? (unknown = _, scale) : unknown;
    };
    scale.copy = function() {
      return radial(squared.domain(), range4).round(round).clamp(squared.clamp()).unknown(unknown);
    };
    initRange.apply(scale, arguments);
    return linearish(scale);
  }

  // client/node_modules/d3-scale/src/quantile.js
  init_define_import_meta_env();
  function quantile2() {
    var domain = [], range4 = [], thresholds = [], unknown;
    function rescale() {
      var i = 0, n = Math.max(1, range4.length);
      thresholds = new Array(n - 1);
      while (++i < n) thresholds[i - 1] = quantileSorted(domain, i / n);
      return scale;
    }
    function scale(x2) {
      return x2 == null || isNaN(x2 = +x2) ? unknown : range4[bisect_default(thresholds, x2)];
    }
    scale.invertExtent = function(y2) {
      var i = range4.indexOf(y2);
      return i < 0 ? [NaN, NaN] : [
        i > 0 ? thresholds[i - 1] : domain[0],
        i < thresholds.length ? thresholds[i] : domain[domain.length - 1]
      ];
    };
    scale.domain = function(_) {
      if (!arguments.length) return domain.slice();
      domain = [];
      for (let d of _) if (d != null && !isNaN(d = +d)) domain.push(d);
      domain.sort(ascending);
      return rescale();
    };
    scale.range = function(_) {
      return arguments.length ? (range4 = Array.from(_), rescale()) : range4.slice();
    };
    scale.unknown = function(_) {
      return arguments.length ? (unknown = _, scale) : unknown;
    };
    scale.quantiles = function() {
      return thresholds.slice();
    };
    scale.copy = function() {
      return quantile2().domain(domain).range(range4).unknown(unknown);
    };
    return initRange.apply(scale, arguments);
  }

  // client/node_modules/d3-scale/src/quantize.js
  init_define_import_meta_env();
  function quantize() {
    var x0 = 0, x1 = 1, n = 1, domain = [0.5], range4 = [0, 1], unknown;
    function scale(x2) {
      return x2 != null && x2 <= x2 ? range4[bisect_default(domain, x2, 0, n)] : unknown;
    }
    function rescale() {
      var i = -1;
      domain = new Array(n);
      while (++i < n) domain[i] = ((i + 1) * x1 - (i - n) * x0) / (n + 1);
      return scale;
    }
    scale.domain = function(_) {
      return arguments.length ? ([x0, x1] = _, x0 = +x0, x1 = +x1, rescale()) : [x0, x1];
    };
    scale.range = function(_) {
      return arguments.length ? (n = (range4 = Array.from(_)).length - 1, rescale()) : range4.slice();
    };
    scale.invertExtent = function(y2) {
      var i = range4.indexOf(y2);
      return i < 0 ? [NaN, NaN] : i < 1 ? [x0, domain[0]] : i >= n ? [domain[n - 1], x1] : [domain[i - 1], domain[i]];
    };
    scale.unknown = function(_) {
      return arguments.length ? (unknown = _, scale) : scale;
    };
    scale.thresholds = function() {
      return domain.slice();
    };
    scale.copy = function() {
      return quantize().domain([x0, x1]).range(range4).unknown(unknown);
    };
    return initRange.apply(linearish(scale), arguments);
  }

  // client/node_modules/d3-scale/src/threshold.js
  init_define_import_meta_env();
  function threshold() {
    var domain = [0.5], range4 = [0, 1], unknown, n = 1;
    function scale(x2) {
      return x2 != null && x2 <= x2 ? range4[bisect_default(domain, x2, 0, n)] : unknown;
    }
    scale.domain = function(_) {
      return arguments.length ? (domain = Array.from(_), n = Math.min(domain.length, range4.length - 1), scale) : domain.slice();
    };
    scale.range = function(_) {
      return arguments.length ? (range4 = Array.from(_), n = Math.min(domain.length, range4.length - 1), scale) : range4.slice();
    };
    scale.invertExtent = function(y2) {
      var i = range4.indexOf(y2);
      return [domain[i - 1], domain[i]];
    };
    scale.unknown = function(_) {
      return arguments.length ? (unknown = _, scale) : unknown;
    };
    scale.copy = function() {
      return threshold().domain(domain).range(range4).unknown(unknown);
    };
    return initRange.apply(scale, arguments);
  }

  // client/node_modules/d3-scale/src/time.js
  init_define_import_meta_env();

  // client/node_modules/d3-time/src/index.js
  init_define_import_meta_env();

  // client/node_modules/d3-time/src/interval.js
  init_define_import_meta_env();
  var t0 = /* @__PURE__ */ new Date();
  var t1 = /* @__PURE__ */ new Date();
  function timeInterval(floori, offseti, count, field) {
    function interval(date2) {
      return floori(date2 = arguments.length === 0 ? /* @__PURE__ */ new Date() : /* @__PURE__ */ new Date(+date2)), date2;
    }
    interval.floor = (date2) => {
      return floori(date2 = /* @__PURE__ */ new Date(+date2)), date2;
    };
    interval.ceil = (date2) => {
      return floori(date2 = new Date(date2 - 1)), offseti(date2, 1), floori(date2), date2;
    };
    interval.round = (date2) => {
      const d0 = interval(date2), d1 = interval.ceil(date2);
      return date2 - d0 < d1 - date2 ? d0 : d1;
    };
    interval.offset = (date2, step) => {
      return offseti(date2 = /* @__PURE__ */ new Date(+date2), step == null ? 1 : Math.floor(step)), date2;
    };
    interval.range = (start, stop, step) => {
      const range4 = [];
      start = interval.ceil(start);
      step = step == null ? 1 : Math.floor(step);
      if (!(start < stop) || !(step > 0)) return range4;
      let previous;
      do
        range4.push(previous = /* @__PURE__ */ new Date(+start)), offseti(start, step), floori(start);
      while (previous < start && start < stop);
      return range4;
    };
    interval.filter = (test) => {
      return timeInterval((date2) => {
        if (date2 >= date2) while (floori(date2), !test(date2)) date2.setTime(date2 - 1);
      }, (date2, step) => {
        if (date2 >= date2) {
          if (step < 0) while (++step <= 0) {
            while (offseti(date2, -1), !test(date2)) {
            }
          }
          else while (--step >= 0) {
            while (offseti(date2, 1), !test(date2)) {
            }
          }
        }
      });
    };
    if (count) {
      interval.count = (start, end) => {
        t0.setTime(+start), t1.setTime(+end);
        floori(t0), floori(t1);
        return Math.floor(count(t0, t1));
      };
      interval.every = (step) => {
        step = Math.floor(step);
        return !isFinite(step) || !(step > 0) ? null : !(step > 1) ? interval : interval.filter(field ? (d) => field(d) % step === 0 : (d) => interval.count(0, d) % step === 0);
      };
    }
    return interval;
  }

  // client/node_modules/d3-time/src/millisecond.js
  init_define_import_meta_env();
  var millisecond = timeInterval(() => {
  }, (date2, step) => {
    date2.setTime(+date2 + step);
  }, (start, end) => {
    return end - start;
  });
  millisecond.every = (k) => {
    k = Math.floor(k);
    if (!isFinite(k) || !(k > 0)) return null;
    if (!(k > 1)) return millisecond;
    return timeInterval((date2) => {
      date2.setTime(Math.floor(date2 / k) * k);
    }, (date2, step) => {
      date2.setTime(+date2 + step * k);
    }, (start, end) => {
      return (end - start) / k;
    });
  };
  var milliseconds = millisecond.range;

  // client/node_modules/d3-time/src/second.js
  init_define_import_meta_env();

  // client/node_modules/d3-time/src/duration.js
  init_define_import_meta_env();
  var durationSecond = 1e3;
  var durationMinute = durationSecond * 60;
  var durationHour = durationMinute * 60;
  var durationDay = durationHour * 24;
  var durationWeek = durationDay * 7;
  var durationMonth = durationDay * 30;
  var durationYear = durationDay * 365;

  // client/node_modules/d3-time/src/second.js
  var second = timeInterval((date2) => {
    date2.setTime(date2 - date2.getMilliseconds());
  }, (date2, step) => {
    date2.setTime(+date2 + step * durationSecond);
  }, (start, end) => {
    return (end - start) / durationSecond;
  }, (date2) => {
    return date2.getUTCSeconds();
  });
  var seconds = second.range;

  // client/node_modules/d3-time/src/minute.js
  init_define_import_meta_env();
  var timeMinute = timeInterval((date2) => {
    date2.setTime(date2 - date2.getMilliseconds() - date2.getSeconds() * durationSecond);
  }, (date2, step) => {
    date2.setTime(+date2 + step * durationMinute);
  }, (start, end) => {
    return (end - start) / durationMinute;
  }, (date2) => {
    return date2.getMinutes();
  });
  var timeMinutes = timeMinute.range;
  var utcMinute = timeInterval((date2) => {
    date2.setUTCSeconds(0, 0);
  }, (date2, step) => {
    date2.setTime(+date2 + step * durationMinute);
  }, (start, end) => {
    return (end - start) / durationMinute;
  }, (date2) => {
    return date2.getUTCMinutes();
  });
  var utcMinutes = utcMinute.range;

  // client/node_modules/d3-time/src/hour.js
  init_define_import_meta_env();
  var timeHour = timeInterval((date2) => {
    date2.setTime(date2 - date2.getMilliseconds() - date2.getSeconds() * durationSecond - date2.getMinutes() * durationMinute);
  }, (date2, step) => {
    date2.setTime(+date2 + step * durationHour);
  }, (start, end) => {
    return (end - start) / durationHour;
  }, (date2) => {
    return date2.getHours();
  });
  var timeHours = timeHour.range;
  var utcHour = timeInterval((date2) => {
    date2.setUTCMinutes(0, 0, 0);
  }, (date2, step) => {
    date2.setTime(+date2 + step * durationHour);
  }, (start, end) => {
    return (end - start) / durationHour;
  }, (date2) => {
    return date2.getUTCHours();
  });
  var utcHours = utcHour.range;

  // client/node_modules/d3-time/src/day.js
  init_define_import_meta_env();
  var timeDay = timeInterval(
    (date2) => date2.setHours(0, 0, 0, 0),
    (date2, step) => date2.setDate(date2.getDate() + step),
    (start, end) => (end - start - (end.getTimezoneOffset() - start.getTimezoneOffset()) * durationMinute) / durationDay,
    (date2) => date2.getDate() - 1
  );
  var timeDays = timeDay.range;
  var utcDay = timeInterval((date2) => {
    date2.setUTCHours(0, 0, 0, 0);
  }, (date2, step) => {
    date2.setUTCDate(date2.getUTCDate() + step);
  }, (start, end) => {
    return (end - start) / durationDay;
  }, (date2) => {
    return date2.getUTCDate() - 1;
  });
  var utcDays = utcDay.range;
  var unixDay = timeInterval((date2) => {
    date2.setUTCHours(0, 0, 0, 0);
  }, (date2, step) => {
    date2.setUTCDate(date2.getUTCDate() + step);
  }, (start, end) => {
    return (end - start) / durationDay;
  }, (date2) => {
    return Math.floor(date2 / durationDay);
  });
  var unixDays = unixDay.range;

  // client/node_modules/d3-time/src/week.js
  init_define_import_meta_env();
  function timeWeekday(i) {
    return timeInterval((date2) => {
      date2.setDate(date2.getDate() - (date2.getDay() + 7 - i) % 7);
      date2.setHours(0, 0, 0, 0);
    }, (date2, step) => {
      date2.setDate(date2.getDate() + step * 7);
    }, (start, end) => {
      return (end - start - (end.getTimezoneOffset() - start.getTimezoneOffset()) * durationMinute) / durationWeek;
    });
  }
  var timeSunday = timeWeekday(0);
  var timeMonday = timeWeekday(1);
  var timeTuesday = timeWeekday(2);
  var timeWednesday = timeWeekday(3);
  var timeThursday = timeWeekday(4);
  var timeFriday = timeWeekday(5);
  var timeSaturday = timeWeekday(6);
  var timeSundays = timeSunday.range;
  var timeMondays = timeMonday.range;
  var timeTuesdays = timeTuesday.range;
  var timeWednesdays = timeWednesday.range;
  var timeThursdays = timeThursday.range;
  var timeFridays = timeFriday.range;
  var timeSaturdays = timeSaturday.range;
  function utcWeekday(i) {
    return timeInterval((date2) => {
      date2.setUTCDate(date2.getUTCDate() - (date2.getUTCDay() + 7 - i) % 7);
      date2.setUTCHours(0, 0, 0, 0);
    }, (date2, step) => {
      date2.setUTCDate(date2.getUTCDate() + step * 7);
    }, (start, end) => {
      return (end - start) / durationWeek;
    });
  }
  var utcSunday = utcWeekday(0);
  var utcMonday = utcWeekday(1);
  var utcTuesday = utcWeekday(2);
  var utcWednesday = utcWeekday(3);
  var utcThursday = utcWeekday(4);
  var utcFriday = utcWeekday(5);
  var utcSaturday = utcWeekday(6);
  var utcSundays = utcSunday.range;
  var utcMondays = utcMonday.range;
  var utcTuesdays = utcTuesday.range;
  var utcWednesdays = utcWednesday.range;
  var utcThursdays = utcThursday.range;
  var utcFridays = utcFriday.range;
  var utcSaturdays = utcSaturday.range;

  // client/node_modules/d3-time/src/month.js
  init_define_import_meta_env();
  var timeMonth = timeInterval((date2) => {
    date2.setDate(1);
    date2.setHours(0, 0, 0, 0);
  }, (date2, step) => {
    date2.setMonth(date2.getMonth() + step);
  }, (start, end) => {
    return end.getMonth() - start.getMonth() + (end.getFullYear() - start.getFullYear()) * 12;
  }, (date2) => {
    return date2.getMonth();
  });
  var timeMonths = timeMonth.range;
  var utcMonth = timeInterval((date2) => {
    date2.setUTCDate(1);
    date2.setUTCHours(0, 0, 0, 0);
  }, (date2, step) => {
    date2.setUTCMonth(date2.getUTCMonth() + step);
  }, (start, end) => {
    return end.getUTCMonth() - start.getUTCMonth() + (end.getUTCFullYear() - start.getUTCFullYear()) * 12;
  }, (date2) => {
    return date2.getUTCMonth();
  });
  var utcMonths = utcMonth.range;

  // client/node_modules/d3-time/src/year.js
  init_define_import_meta_env();
  var timeYear = timeInterval((date2) => {
    date2.setMonth(0, 1);
    date2.setHours(0, 0, 0, 0);
  }, (date2, step) => {
    date2.setFullYear(date2.getFullYear() + step);
  }, (start, end) => {
    return end.getFullYear() - start.getFullYear();
  }, (date2) => {
    return date2.getFullYear();
  });
  timeYear.every = (k) => {
    return !isFinite(k = Math.floor(k)) || !(k > 0) ? null : timeInterval((date2) => {
      date2.setFullYear(Math.floor(date2.getFullYear() / k) * k);
      date2.setMonth(0, 1);
      date2.setHours(0, 0, 0, 0);
    }, (date2, step) => {
      date2.setFullYear(date2.getFullYear() + step * k);
    });
  };
  var timeYears = timeYear.range;
  var utcYear = timeInterval((date2) => {
    date2.setUTCMonth(0, 1);
    date2.setUTCHours(0, 0, 0, 0);
  }, (date2, step) => {
    date2.setUTCFullYear(date2.getUTCFullYear() + step);
  }, (start, end) => {
    return end.getUTCFullYear() - start.getUTCFullYear();
  }, (date2) => {
    return date2.getUTCFullYear();
  });
  utcYear.every = (k) => {
    return !isFinite(k = Math.floor(k)) || !(k > 0) ? null : timeInterval((date2) => {
      date2.setUTCFullYear(Math.floor(date2.getUTCFullYear() / k) * k);
      date2.setUTCMonth(0, 1);
      date2.setUTCHours(0, 0, 0, 0);
    }, (date2, step) => {
      date2.setUTCFullYear(date2.getUTCFullYear() + step * k);
    });
  };
  var utcYears = utcYear.range;

  // client/node_modules/d3-time/src/ticks.js
  init_define_import_meta_env();
  function ticker(year, month, week, day, hour, minute) {
    const tickIntervals = [
      [second, 1, durationSecond],
      [second, 5, 5 * durationSecond],
      [second, 15, 15 * durationSecond],
      [second, 30, 30 * durationSecond],
      [minute, 1, durationMinute],
      [minute, 5, 5 * durationMinute],
      [minute, 15, 15 * durationMinute],
      [minute, 30, 30 * durationMinute],
      [hour, 1, durationHour],
      [hour, 3, 3 * durationHour],
      [hour, 6, 6 * durationHour],
      [hour, 12, 12 * durationHour],
      [day, 1, durationDay],
      [day, 2, 2 * durationDay],
      [week, 1, durationWeek],
      [month, 1, durationMonth],
      [month, 3, 3 * durationMonth],
      [year, 1, durationYear]
    ];
    function ticks2(start, stop, count) {
      const reverse2 = stop < start;
      if (reverse2) [start, stop] = [stop, start];
      const interval = count && typeof count.range === "function" ? count : tickInterval(start, stop, count);
      const ticks3 = interval ? interval.range(start, +stop + 1) : [];
      return reverse2 ? ticks3.reverse() : ticks3;
    }
    function tickInterval(start, stop, count) {
      const target = Math.abs(stop - start) / count;
      const i = bisector(([, , step2]) => step2).right(tickIntervals, target);
      if (i === tickIntervals.length) return year.every(tickStep(start / durationYear, stop / durationYear, count));
      if (i === 0) return millisecond.every(Math.max(tickStep(start, stop, count), 1));
      const [t, step] = tickIntervals[target / tickIntervals[i - 1][2] < tickIntervals[i][2] / target ? i - 1 : i];
      return t.every(step);
    }
    return [ticks2, tickInterval];
  }
  var [utcTicks, utcTickInterval] = ticker(utcYear, utcMonth, utcSunday, unixDay, utcHour, utcMinute);
  var [timeTicks, timeTickInterval] = ticker(timeYear, timeMonth, timeSunday, timeDay, timeHour, timeMinute);

  // client/node_modules/d3-time-format/src/index.js
  init_define_import_meta_env();

  // client/node_modules/d3-time-format/src/defaultLocale.js
  init_define_import_meta_env();

  // client/node_modules/d3-time-format/src/locale.js
  init_define_import_meta_env();
  function localDate(d) {
    if (0 <= d.y && d.y < 100) {
      var date2 = new Date(-1, d.m, d.d, d.H, d.M, d.S, d.L);
      date2.setFullYear(d.y);
      return date2;
    }
    return new Date(d.y, d.m, d.d, d.H, d.M, d.S, d.L);
  }
  function utcDate(d) {
    if (0 <= d.y && d.y < 100) {
      var date2 = new Date(Date.UTC(-1, d.m, d.d, d.H, d.M, d.S, d.L));
      date2.setUTCFullYear(d.y);
      return date2;
    }
    return new Date(Date.UTC(d.y, d.m, d.d, d.H, d.M, d.S, d.L));
  }
  function newDate(y2, m, d) {
    return { y: y2, m, d, H: 0, M: 0, S: 0, L: 0 };
  }
  function formatLocale(locale3) {
    var locale_dateTime = locale3.dateTime, locale_date = locale3.date, locale_time = locale3.time, locale_periods = locale3.periods, locale_weekdays = locale3.days, locale_shortWeekdays = locale3.shortDays, locale_months = locale3.months, locale_shortMonths = locale3.shortMonths;
    var periodRe = formatRe(locale_periods), periodLookup = formatLookup(locale_periods), weekdayRe = formatRe(locale_weekdays), weekdayLookup = formatLookup(locale_weekdays), shortWeekdayRe = formatRe(locale_shortWeekdays), shortWeekdayLookup = formatLookup(locale_shortWeekdays), monthRe = formatRe(locale_months), monthLookup = formatLookup(locale_months), shortMonthRe = formatRe(locale_shortMonths), shortMonthLookup = formatLookup(locale_shortMonths);
    var formats = {
      "a": formatShortWeekday2,
      "A": formatWeekday2,
      "b": formatShortMonth,
      "B": formatMonth2,
      "c": null,
      "d": formatDayOfMonth,
      "e": formatDayOfMonth,
      "f": formatMicroseconds,
      "g": formatYearISO,
      "G": formatFullYearISO,
      "H": formatHour24,
      "I": formatHour12,
      "j": formatDayOfYear,
      "L": formatMilliseconds,
      "m": formatMonthNumber,
      "M": formatMinutes,
      "p": formatPeriod,
      "q": formatQuarter,
      "Q": formatUnixTimestamp,
      "s": formatUnixTimestampSeconds,
      "S": formatSeconds,
      "u": formatWeekdayNumberMonday,
      "U": formatWeekNumberSunday,
      "V": formatWeekNumberISO,
      "w": formatWeekdayNumberSunday,
      "W": formatWeekNumberMonday,
      "x": null,
      "X": null,
      "y": formatYear,
      "Y": formatFullYear,
      "Z": formatZone,
      "%": formatLiteralPercent
    };
    var utcFormats = {
      "a": formatUTCShortWeekday,
      "A": formatUTCWeekday,
      "b": formatUTCShortMonth,
      "B": formatUTCMonth,
      "c": null,
      "d": formatUTCDayOfMonth,
      "e": formatUTCDayOfMonth,
      "f": formatUTCMicroseconds,
      "g": formatUTCYearISO,
      "G": formatUTCFullYearISO,
      "H": formatUTCHour24,
      "I": formatUTCHour12,
      "j": formatUTCDayOfYear,
      "L": formatUTCMilliseconds,
      "m": formatUTCMonthNumber,
      "M": formatUTCMinutes,
      "p": formatUTCPeriod,
      "q": formatUTCQuarter,
      "Q": formatUnixTimestamp,
      "s": formatUnixTimestampSeconds,
      "S": formatUTCSeconds,
      "u": formatUTCWeekdayNumberMonday,
      "U": formatUTCWeekNumberSunday,
      "V": formatUTCWeekNumberISO,
      "w": formatUTCWeekdayNumberSunday,
      "W": formatUTCWeekNumberMonday,
      "x": null,
      "X": null,
      "y": formatUTCYear,
      "Y": formatUTCFullYear,
      "Z": formatUTCZone,
      "%": formatLiteralPercent
    };
    var parses = {
      "a": parseShortWeekday,
      "A": parseWeekday,
      "b": parseShortMonth,
      "B": parseMonth,
      "c": parseLocaleDateTime,
      "d": parseDayOfMonth,
      "e": parseDayOfMonth,
      "f": parseMicroseconds,
      "g": parseYear,
      "G": parseFullYear,
      "H": parseHour24,
      "I": parseHour24,
      "j": parseDayOfYear,
      "L": parseMilliseconds,
      "m": parseMonthNumber,
      "M": parseMinutes,
      "p": parsePeriod,
      "q": parseQuarter,
      "Q": parseUnixTimestamp,
      "s": parseUnixTimestampSeconds,
      "S": parseSeconds,
      "u": parseWeekdayNumberMonday,
      "U": parseWeekNumberSunday,
      "V": parseWeekNumberISO,
      "w": parseWeekdayNumberSunday,
      "W": parseWeekNumberMonday,
      "x": parseLocaleDate,
      "X": parseLocaleTime,
      "y": parseYear,
      "Y": parseFullYear,
      "Z": parseZone,
      "%": parseLiteralPercent
    };
    formats.x = newFormat(locale_date, formats);
    formats.X = newFormat(locale_time, formats);
    formats.c = newFormat(locale_dateTime, formats);
    utcFormats.x = newFormat(locale_date, utcFormats);
    utcFormats.X = newFormat(locale_time, utcFormats);
    utcFormats.c = newFormat(locale_dateTime, utcFormats);
    function newFormat(specifier, formats2) {
      return function(date2) {
        var string = [], i = -1, j = 0, n = specifier.length, c, pad2, format2;
        if (!(date2 instanceof Date)) date2 = /* @__PURE__ */ new Date(+date2);
        while (++i < n) {
          if (specifier.charCodeAt(i) === 37) {
            string.push(specifier.slice(j, i));
            if ((pad2 = pads[c = specifier.charAt(++i)]) != null) c = specifier.charAt(++i);
            else pad2 = c === "e" ? " " : "0";
            if (format2 = formats2[c]) c = format2(date2, pad2);
            string.push(c);
            j = i + 1;
          }
        }
        string.push(specifier.slice(j, i));
        return string.join("");
      };
    }
    function newParse(specifier, Z) {
      return function(string) {
        var d = newDate(1900, void 0, 1), i = parseSpecifier(d, specifier, string += "", 0), week, day;
        if (i != string.length) return null;
        if ("Q" in d) return new Date(d.Q);
        if ("s" in d) return new Date(d.s * 1e3 + ("L" in d ? d.L : 0));
        if (Z && !("Z" in d)) d.Z = 0;
        if ("p" in d) d.H = d.H % 12 + d.p * 12;
        if (d.m === void 0) d.m = "q" in d ? d.q : 0;
        if ("V" in d) {
          if (d.V < 1 || d.V > 53) return null;
          if (!("w" in d)) d.w = 1;
          if ("Z" in d) {
            week = utcDate(newDate(d.y, 0, 1)), day = week.getUTCDay();
            week = day > 4 || day === 0 ? utcMonday.ceil(week) : utcMonday(week);
            week = utcDay.offset(week, (d.V - 1) * 7);
            d.y = week.getUTCFullYear();
            d.m = week.getUTCMonth();
            d.d = week.getUTCDate() + (d.w + 6) % 7;
          } else {
            week = localDate(newDate(d.y, 0, 1)), day = week.getDay();
            week = day > 4 || day === 0 ? timeMonday.ceil(week) : timeMonday(week);
            week = timeDay.offset(week, (d.V - 1) * 7);
            d.y = week.getFullYear();
            d.m = week.getMonth();
            d.d = week.getDate() + (d.w + 6) % 7;
          }
        } else if ("W" in d || "U" in d) {
          if (!("w" in d)) d.w = "u" in d ? d.u % 7 : "W" in d ? 1 : 0;
          day = "Z" in d ? utcDate(newDate(d.y, 0, 1)).getUTCDay() : localDate(newDate(d.y, 0, 1)).getDay();
          d.m = 0;
          d.d = "W" in d ? (d.w + 6) % 7 + d.W * 7 - (day + 5) % 7 : d.w + d.U * 7 - (day + 6) % 7;
        }
        if ("Z" in d) {
          d.H += d.Z / 100 | 0;
          d.M += d.Z % 100;
          return utcDate(d);
        }
        return localDate(d);
      };
    }
    function parseSpecifier(d, specifier, string, j) {
      var i = 0, n = specifier.length, m = string.length, c, parse;
      while (i < n) {
        if (j >= m) return -1;
        c = specifier.charCodeAt(i++);
        if (c === 37) {
          c = specifier.charAt(i++);
          parse = parses[c in pads ? specifier.charAt(i++) : c];
          if (!parse || (j = parse(d, string, j)) < 0) return -1;
        } else if (c != string.charCodeAt(j++)) {
          return -1;
        }
      }
      return j;
    }
    function parsePeriod(d, string, i) {
      var n = periodRe.exec(string.slice(i));
      return n ? (d.p = periodLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
    }
    function parseShortWeekday(d, string, i) {
      var n = shortWeekdayRe.exec(string.slice(i));
      return n ? (d.w = shortWeekdayLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
    }
    function parseWeekday(d, string, i) {
      var n = weekdayRe.exec(string.slice(i));
      return n ? (d.w = weekdayLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
    }
    function parseShortMonth(d, string, i) {
      var n = shortMonthRe.exec(string.slice(i));
      return n ? (d.m = shortMonthLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
    }
    function parseMonth(d, string, i) {
      var n = monthRe.exec(string.slice(i));
      return n ? (d.m = monthLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
    }
    function parseLocaleDateTime(d, string, i) {
      return parseSpecifier(d, locale_dateTime, string, i);
    }
    function parseLocaleDate(d, string, i) {
      return parseSpecifier(d, locale_date, string, i);
    }
    function parseLocaleTime(d, string, i) {
      return parseSpecifier(d, locale_time, string, i);
    }
    function formatShortWeekday2(d) {
      return locale_shortWeekdays[d.getDay()];
    }
    function formatWeekday2(d) {
      return locale_weekdays[d.getDay()];
    }
    function formatShortMonth(d) {
      return locale_shortMonths[d.getMonth()];
    }
    function formatMonth2(d) {
      return locale_months[d.getMonth()];
    }
    function formatPeriod(d) {
      return locale_periods[+(d.getHours() >= 12)];
    }
    function formatQuarter(d) {
      return 1 + ~~(d.getMonth() / 3);
    }
    function formatUTCShortWeekday(d) {
      return locale_shortWeekdays[d.getUTCDay()];
    }
    function formatUTCWeekday(d) {
      return locale_weekdays[d.getUTCDay()];
    }
    function formatUTCShortMonth(d) {
      return locale_shortMonths[d.getUTCMonth()];
    }
    function formatUTCMonth(d) {
      return locale_months[d.getUTCMonth()];
    }
    function formatUTCPeriod(d) {
      return locale_periods[+(d.getUTCHours() >= 12)];
    }
    function formatUTCQuarter(d) {
      return 1 + ~~(d.getUTCMonth() / 3);
    }
    return {
      format: function(specifier) {
        var f = newFormat(specifier += "", formats);
        f.toString = function() {
          return specifier;
        };
        return f;
      },
      parse: function(specifier) {
        var p = newParse(specifier += "", false);
        p.toString = function() {
          return specifier;
        };
        return p;
      },
      utcFormat: function(specifier) {
        var f = newFormat(specifier += "", utcFormats);
        f.toString = function() {
          return specifier;
        };
        return f;
      },
      utcParse: function(specifier) {
        var p = newParse(specifier += "", true);
        p.toString = function() {
          return specifier;
        };
        return p;
      }
    };
  }
  var pads = { "-": "", "_": " ", "0": "0" };
  var numberRe = /^\s*\d+/;
  var percentRe = /^%/;
  var requoteRe = /[\\^$*+?|[\]().{}]/g;
  function pad(value, fill, width) {
    var sign2 = value < 0 ? "-" : "", string = (sign2 ? -value : value) + "", length = string.length;
    return sign2 + (length < width ? new Array(width - length + 1).join(fill) + string : string);
  }
  function requote(s) {
    return s.replace(requoteRe, "\\$&");
  }
  function formatRe(names) {
    return new RegExp("^(?:" + names.map(requote).join("|") + ")", "i");
  }
  function formatLookup(names) {
    return new Map(names.map((name, i) => [name.toLowerCase(), i]));
  }
  function parseWeekdayNumberSunday(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 1));
    return n ? (d.w = +n[0], i + n[0].length) : -1;
  }
  function parseWeekdayNumberMonday(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 1));
    return n ? (d.u = +n[0], i + n[0].length) : -1;
  }
  function parseWeekNumberSunday(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 2));
    return n ? (d.U = +n[0], i + n[0].length) : -1;
  }
  function parseWeekNumberISO(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 2));
    return n ? (d.V = +n[0], i + n[0].length) : -1;
  }
  function parseWeekNumberMonday(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 2));
    return n ? (d.W = +n[0], i + n[0].length) : -1;
  }
  function parseFullYear(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 4));
    return n ? (d.y = +n[0], i + n[0].length) : -1;
  }
  function parseYear(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 2));
    return n ? (d.y = +n[0] + (+n[0] > 68 ? 1900 : 2e3), i + n[0].length) : -1;
  }
  function parseZone(d, string, i) {
    var n = /^(Z)|([+-]\d\d)(?::?(\d\d))?/.exec(string.slice(i, i + 6));
    return n ? (d.Z = n[1] ? 0 : -(n[2] + (n[3] || "00")), i + n[0].length) : -1;
  }
  function parseQuarter(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 1));
    return n ? (d.q = n[0] * 3 - 3, i + n[0].length) : -1;
  }
  function parseMonthNumber(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 2));
    return n ? (d.m = n[0] - 1, i + n[0].length) : -1;
  }
  function parseDayOfMonth(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 2));
    return n ? (d.d = +n[0], i + n[0].length) : -1;
  }
  function parseDayOfYear(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 3));
    return n ? (d.m = 0, d.d = +n[0], i + n[0].length) : -1;
  }
  function parseHour24(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 2));
    return n ? (d.H = +n[0], i + n[0].length) : -1;
  }
  function parseMinutes(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 2));
    return n ? (d.M = +n[0], i + n[0].length) : -1;
  }
  function parseSeconds(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 2));
    return n ? (d.S = +n[0], i + n[0].length) : -1;
  }
  function parseMilliseconds(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 3));
    return n ? (d.L = +n[0], i + n[0].length) : -1;
  }
  function parseMicroseconds(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 6));
    return n ? (d.L = Math.floor(n[0] / 1e3), i + n[0].length) : -1;
  }
  function parseLiteralPercent(d, string, i) {
    var n = percentRe.exec(string.slice(i, i + 1));
    return n ? i + n[0].length : -1;
  }
  function parseUnixTimestamp(d, string, i) {
    var n = numberRe.exec(string.slice(i));
    return n ? (d.Q = +n[0], i + n[0].length) : -1;
  }
  function parseUnixTimestampSeconds(d, string, i) {
    var n = numberRe.exec(string.slice(i));
    return n ? (d.s = +n[0], i + n[0].length) : -1;
  }
  function formatDayOfMonth(d, p) {
    return pad(d.getDate(), p, 2);
  }
  function formatHour24(d, p) {
    return pad(d.getHours(), p, 2);
  }
  function formatHour12(d, p) {
    return pad(d.getHours() % 12 || 12, p, 2);
  }
  function formatDayOfYear(d, p) {
    return pad(1 + timeDay.count(timeYear(d), d), p, 3);
  }
  function formatMilliseconds(d, p) {
    return pad(d.getMilliseconds(), p, 3);
  }
  function formatMicroseconds(d, p) {
    return formatMilliseconds(d, p) + "000";
  }
  function formatMonthNumber(d, p) {
    return pad(d.getMonth() + 1, p, 2);
  }
  function formatMinutes(d, p) {
    return pad(d.getMinutes(), p, 2);
  }
  function formatSeconds(d, p) {
    return pad(d.getSeconds(), p, 2);
  }
  function formatWeekdayNumberMonday(d) {
    var day = d.getDay();
    return day === 0 ? 7 : day;
  }
  function formatWeekNumberSunday(d, p) {
    return pad(timeSunday.count(timeYear(d) - 1, d), p, 2);
  }
  function dISO(d) {
    var day = d.getDay();
    return day >= 4 || day === 0 ? timeThursday(d) : timeThursday.ceil(d);
  }
  function formatWeekNumberISO(d, p) {
    d = dISO(d);
    return pad(timeThursday.count(timeYear(d), d) + (timeYear(d).getDay() === 4), p, 2);
  }
  function formatWeekdayNumberSunday(d) {
    return d.getDay();
  }
  function formatWeekNumberMonday(d, p) {
    return pad(timeMonday.count(timeYear(d) - 1, d), p, 2);
  }
  function formatYear(d, p) {
    return pad(d.getFullYear() % 100, p, 2);
  }
  function formatYearISO(d, p) {
    d = dISO(d);
    return pad(d.getFullYear() % 100, p, 2);
  }
  function formatFullYear(d, p) {
    return pad(d.getFullYear() % 1e4, p, 4);
  }
  function formatFullYearISO(d, p) {
    var day = d.getDay();
    d = day >= 4 || day === 0 ? timeThursday(d) : timeThursday.ceil(d);
    return pad(d.getFullYear() % 1e4, p, 4);
  }
  function formatZone(d) {
    var z = d.getTimezoneOffset();
    return (z > 0 ? "-" : (z *= -1, "+")) + pad(z / 60 | 0, "0", 2) + pad(z % 60, "0", 2);
  }
  function formatUTCDayOfMonth(d, p) {
    return pad(d.getUTCDate(), p, 2);
  }
  function formatUTCHour24(d, p) {
    return pad(d.getUTCHours(), p, 2);
  }
  function formatUTCHour12(d, p) {
    return pad(d.getUTCHours() % 12 || 12, p, 2);
  }
  function formatUTCDayOfYear(d, p) {
    return pad(1 + utcDay.count(utcYear(d), d), p, 3);
  }
  function formatUTCMilliseconds(d, p) {
    return pad(d.getUTCMilliseconds(), p, 3);
  }
  function formatUTCMicroseconds(d, p) {
    return formatUTCMilliseconds(d, p) + "000";
  }
  function formatUTCMonthNumber(d, p) {
    return pad(d.getUTCMonth() + 1, p, 2);
  }
  function formatUTCMinutes(d, p) {
    return pad(d.getUTCMinutes(), p, 2);
  }
  function formatUTCSeconds(d, p) {
    return pad(d.getUTCSeconds(), p, 2);
  }
  function formatUTCWeekdayNumberMonday(d) {
    var dow = d.getUTCDay();
    return dow === 0 ? 7 : dow;
  }
  function formatUTCWeekNumberSunday(d, p) {
    return pad(utcSunday.count(utcYear(d) - 1, d), p, 2);
  }
  function UTCdISO(d) {
    var day = d.getUTCDay();
    return day >= 4 || day === 0 ? utcThursday(d) : utcThursday.ceil(d);
  }
  function formatUTCWeekNumberISO(d, p) {
    d = UTCdISO(d);
    return pad(utcThursday.count(utcYear(d), d) + (utcYear(d).getUTCDay() === 4), p, 2);
  }
  function formatUTCWeekdayNumberSunday(d) {
    return d.getUTCDay();
  }
  function formatUTCWeekNumberMonday(d, p) {
    return pad(utcMonday.count(utcYear(d) - 1, d), p, 2);
  }
  function formatUTCYear(d, p) {
    return pad(d.getUTCFullYear() % 100, p, 2);
  }
  function formatUTCYearISO(d, p) {
    d = UTCdISO(d);
    return pad(d.getUTCFullYear() % 100, p, 2);
  }
  function formatUTCFullYear(d, p) {
    return pad(d.getUTCFullYear() % 1e4, p, 4);
  }
  function formatUTCFullYearISO(d, p) {
    var day = d.getUTCDay();
    d = day >= 4 || day === 0 ? utcThursday(d) : utcThursday.ceil(d);
    return pad(d.getUTCFullYear() % 1e4, p, 4);
  }
  function formatUTCZone() {
    return "+0000";
  }
  function formatLiteralPercent() {
    return "%";
  }
  function formatUnixTimestamp(d) {
    return +d;
  }
  function formatUnixTimestampSeconds(d) {
    return Math.floor(+d / 1e3);
  }

  // client/node_modules/d3-time-format/src/defaultLocale.js
  var locale2;
  var timeFormat;
  var timeParse;
  var utcFormat;
  var utcParse;
  defaultLocale2({
    dateTime: "%x, %X",
    date: "%-m/%-d/%Y",
    time: "%-I:%M:%S %p",
    periods: ["AM", "PM"],
    days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    shortDays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    shortMonths: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  });
  function defaultLocale2(definition) {
    locale2 = formatLocale(definition);
    timeFormat = locale2.format;
    timeParse = locale2.parse;
    utcFormat = locale2.utcFormat;
    utcParse = locale2.utcParse;
    return locale2;
  }

  // client/node_modules/d3-scale/src/time.js
  function date(t) {
    return new Date(t);
  }
  function number3(t) {
    return t instanceof Date ? +t : +/* @__PURE__ */ new Date(+t);
  }
  function calendar(ticks2, tickInterval, year, month, week, day, hour, minute, second2, format2) {
    var scale = continuous(), invert = scale.invert, domain = scale.domain;
    var formatMillisecond = format2(".%L"), formatSecond = format2(":%S"), formatMinute = format2("%I:%M"), formatHour = format2("%I %p"), formatDay2 = format2("%a %d"), formatWeek = format2("%b %d"), formatMonth2 = format2("%B"), formatYear3 = format2("%Y");
    function tickFormat2(date2) {
      return (second2(date2) < date2 ? formatMillisecond : minute(date2) < date2 ? formatSecond : hour(date2) < date2 ? formatMinute : day(date2) < date2 ? formatHour : month(date2) < date2 ? week(date2) < date2 ? formatDay2 : formatWeek : year(date2) < date2 ? formatMonth2 : formatYear3)(date2);
    }
    scale.invert = function(y2) {
      return new Date(invert(y2));
    };
    scale.domain = function(_) {
      return arguments.length ? domain(Array.from(_, number3)) : domain().map(date);
    };
    scale.ticks = function(interval) {
      var d = domain();
      return ticks2(d[0], d[d.length - 1], interval == null ? 10 : interval);
    };
    scale.tickFormat = function(count, specifier) {
      return specifier == null ? tickFormat2 : format2(specifier);
    };
    scale.nice = function(interval) {
      var d = domain();
      if (!interval || typeof interval.range !== "function") interval = tickInterval(d[0], d[d.length - 1], interval == null ? 10 : interval);
      return interval ? domain(nice(d, interval)) : scale;
    };
    scale.copy = function() {
      return copy(scale, calendar(ticks2, tickInterval, year, month, week, day, hour, minute, second2, format2));
    };
    return scale;
  }
  function time() {
    return initRange.apply(calendar(timeTicks, timeTickInterval, timeYear, timeMonth, timeSunday, timeDay, timeHour, timeMinute, second, timeFormat).domain([new Date(2e3, 0, 1), new Date(2e3, 0, 2)]), arguments);
  }

  // client/node_modules/d3-scale/src/utcTime.js
  init_define_import_meta_env();
  function utcTime() {
    return initRange.apply(calendar(utcTicks, utcTickInterval, utcYear, utcMonth, utcSunday, utcDay, utcHour, utcMinute, second, utcFormat).domain([Date.UTC(2e3, 0, 1), Date.UTC(2e3, 0, 2)]), arguments);
  }

  // client/node_modules/d3-scale/src/sequential.js
  init_define_import_meta_env();
  function transformer2() {
    var x0 = 0, x1 = 1, t02, t12, k10, transform, interpolator = identity, clamp = false, unknown;
    function scale(x2) {
      return x2 == null || isNaN(x2 = +x2) ? unknown : interpolator(k10 === 0 ? 0.5 : (x2 = (transform(x2) - t02) * k10, clamp ? Math.max(0, Math.min(1, x2)) : x2));
    }
    scale.domain = function(_) {
      return arguments.length ? ([x0, x1] = _, t02 = transform(x0 = +x0), t12 = transform(x1 = +x1), k10 = t02 === t12 ? 0 : 1 / (t12 - t02), scale) : [x0, x1];
    };
    scale.clamp = function(_) {
      return arguments.length ? (clamp = !!_, scale) : clamp;
    };
    scale.interpolator = function(_) {
      return arguments.length ? (interpolator = _, scale) : interpolator;
    };
    function range4(interpolate) {
      return function(_) {
        var r0, r1;
        return arguments.length ? ([r0, r1] = _, interpolator = interpolate(r0, r1), scale) : [interpolator(0), interpolator(1)];
      };
    }
    scale.range = range4(value_default);
    scale.rangeRound = range4(round_default);
    scale.unknown = function(_) {
      return arguments.length ? (unknown = _, scale) : unknown;
    };
    return function(t) {
      transform = t, t02 = t(x0), t12 = t(x1), k10 = t02 === t12 ? 0 : 1 / (t12 - t02);
      return scale;
    };
  }
  function copy2(source, target) {
    return target.domain(source.domain()).interpolator(source.interpolator()).clamp(source.clamp()).unknown(source.unknown());
  }
  function sequential() {
    var scale = linearish(transformer2()(identity));
    scale.copy = function() {
      return copy2(scale, sequential());
    };
    return initInterpolator.apply(scale, arguments);
  }
  function sequentialLog() {
    var scale = loggish(transformer2()).domain([1, 10]);
    scale.copy = function() {
      return copy2(scale, sequentialLog()).base(scale.base());
    };
    return initInterpolator.apply(scale, arguments);
  }
  function sequentialSymlog() {
    var scale = symlogish(transformer2());
    scale.copy = function() {
      return copy2(scale, sequentialSymlog()).constant(scale.constant());
    };
    return initInterpolator.apply(scale, arguments);
  }
  function sequentialPow() {
    var scale = powish(transformer2());
    scale.copy = function() {
      return copy2(scale, sequentialPow()).exponent(scale.exponent());
    };
    return initInterpolator.apply(scale, arguments);
  }
  function sequentialSqrt() {
    return sequentialPow.apply(null, arguments).exponent(0.5);
  }

  // client/node_modules/d3-scale/src/sequentialQuantile.js
  init_define_import_meta_env();
  function sequentialQuantile() {
    var domain = [], interpolator = identity;
    function scale(x2) {
      if (x2 != null && !isNaN(x2 = +x2)) return interpolator((bisect_default(domain, x2, 1) - 1) / (domain.length - 1));
    }
    scale.domain = function(_) {
      if (!arguments.length) return domain.slice();
      domain = [];
      for (let d of _) if (d != null && !isNaN(d = +d)) domain.push(d);
      domain.sort(ascending);
      return scale;
    };
    scale.interpolator = function(_) {
      return arguments.length ? (interpolator = _, scale) : interpolator;
    };
    scale.range = function() {
      return domain.map((d, i) => interpolator(i / (domain.length - 1)));
    };
    scale.quantiles = function(n) {
      return Array.from({ length: n + 1 }, (_, i) => quantile(domain, i / n));
    };
    scale.copy = function() {
      return sequentialQuantile(interpolator).domain(domain);
    };
    return initInterpolator.apply(scale, arguments);
  }

  // client/node_modules/d3-scale/src/diverging.js
  init_define_import_meta_env();
  function transformer3() {
    var x0 = 0, x1 = 0.5, x2 = 1, s = 1, t02, t12, t2, k10, k21, interpolator = identity, transform, clamp = false, unknown;
    function scale(x3) {
      return isNaN(x3 = +x3) ? unknown : (x3 = 0.5 + ((x3 = +transform(x3)) - t12) * (s * x3 < s * t12 ? k10 : k21), interpolator(clamp ? Math.max(0, Math.min(1, x3)) : x3));
    }
    scale.domain = function(_) {
      return arguments.length ? ([x0, x1, x2] = _, t02 = transform(x0 = +x0), t12 = transform(x1 = +x1), t2 = transform(x2 = +x2), k10 = t02 === t12 ? 0 : 0.5 / (t12 - t02), k21 = t12 === t2 ? 0 : 0.5 / (t2 - t12), s = t12 < t02 ? -1 : 1, scale) : [x0, x1, x2];
    };
    scale.clamp = function(_) {
      return arguments.length ? (clamp = !!_, scale) : clamp;
    };
    scale.interpolator = function(_) {
      return arguments.length ? (interpolator = _, scale) : interpolator;
    };
    function range4(interpolate) {
      return function(_) {
        var r0, r1, r2;
        return arguments.length ? ([r0, r1, r2] = _, interpolator = piecewise(interpolate, [r0, r1, r2]), scale) : [interpolator(0), interpolator(0.5), interpolator(1)];
      };
    }
    scale.range = range4(value_default);
    scale.rangeRound = range4(round_default);
    scale.unknown = function(_) {
      return arguments.length ? (unknown = _, scale) : unknown;
    };
    return function(t) {
      transform = t, t02 = t(x0), t12 = t(x1), t2 = t(x2), k10 = t02 === t12 ? 0 : 0.5 / (t12 - t02), k21 = t12 === t2 ? 0 : 0.5 / (t2 - t12), s = t12 < t02 ? -1 : 1;
      return scale;
    };
  }
  function diverging() {
    var scale = linearish(transformer3()(identity));
    scale.copy = function() {
      return copy2(scale, diverging());
    };
    return initInterpolator.apply(scale, arguments);
  }
  function divergingLog() {
    var scale = loggish(transformer3()).domain([0.1, 1, 10]);
    scale.copy = function() {
      return copy2(scale, divergingLog()).base(scale.base());
    };
    return initInterpolator.apply(scale, arguments);
  }
  function divergingSymlog() {
    var scale = symlogish(transformer3());
    scale.copy = function() {
      return copy2(scale, divergingSymlog()).constant(scale.constant());
    };
    return initInterpolator.apply(scale, arguments);
  }
  function divergingPow() {
    var scale = powish(transformer3());
    scale.copy = function() {
      return copy2(scale, divergingPow()).exponent(scale.exponent());
    };
    return initInterpolator.apply(scale, arguments);
  }
  function divergingSqrt() {
    return divergingPow.apply(null, arguments).exponent(0.5);
  }

  // client/node_modules/recharts/es6/state/selectors/dataSelectors.js
  init_define_import_meta_env();
  var selectChartDataWithIndexes = (state) => state.chartData;
  var selectChartDataAndAlwaysIgnoreIndexes = createSelector([selectChartDataWithIndexes], (dataState) => {
    var dataEndIndex = dataState.chartData != null ? dataState.chartData.length - 1 : 0;
    return {
      chartData: dataState.chartData,
      computedData: dataState.computedData,
      dataEndIndex,
      dataStartIndex: 0
    };
  });
  var selectChartDataWithIndexesIfNotInPanorama = (state, _xAxisId, _yAxisId, isPanorama) => {
    if (isPanorama) {
      return selectChartDataAndAlwaysIgnoreIndexes(state);
    }
    return selectChartDataWithIndexes(state);
  };

  // client/node_modules/recharts/es6/util/isDomainSpecifiedByUser.js
  init_define_import_meta_env();
  function isWellFormedNumberDomain(v) {
    if (Array.isArray(v) && v.length === 2) {
      var [min2, max2] = v;
      if (isWellBehavedNumber(min2) && isWellBehavedNumber(max2)) {
        return true;
      }
    }
    return false;
  }
  function extendDomain(providedDomain, boundaryDomain, allowDataOverflow) {
    if (allowDataOverflow) {
      return providedDomain;
    }
    return [Math.min(providedDomain[0], boundaryDomain[0]), Math.max(providedDomain[1], boundaryDomain[1])];
  }
  function numericalDomainSpecifiedWithoutRequiringData(userDomain, allowDataOverflow) {
    if (!allowDataOverflow) {
      return void 0;
    }
    if (typeof userDomain === "function") {
      return void 0;
    }
    if (Array.isArray(userDomain) && userDomain.length === 2) {
      var [providedMin, providedMax] = userDomain;
      var finalMin, finalMax;
      if (isWellBehavedNumber(providedMin)) {
        finalMin = providedMin;
      } else if (typeof providedMin === "function") {
        return void 0;
      }
      if (isWellBehavedNumber(providedMax)) {
        finalMax = providedMax;
      } else if (typeof providedMax === "function") {
        return void 0;
      }
      var candidate = [finalMin, finalMax];
      if (isWellFormedNumberDomain(candidate)) {
        return candidate;
      }
    }
    return void 0;
  }
  function parseNumericalUserDomain(userDomain, dataDomain, allowDataOverflow) {
    if (!allowDataOverflow && dataDomain == null) {
      return void 0;
    }
    if (typeof userDomain === "function" && dataDomain != null) {
      try {
        var result = userDomain(dataDomain, allowDataOverflow);
        if (isWellFormedNumberDomain(result)) {
          return extendDomain(result, dataDomain, allowDataOverflow);
        }
      } catch (_unused) {
      }
    }
    if (Array.isArray(userDomain) && userDomain.length === 2) {
      var [providedMin, providedMax] = userDomain;
      var finalMin, finalMax;
      if (providedMin === "auto") {
        if (dataDomain != null) {
          finalMin = Math.min(...dataDomain);
        }
      } else if (isNumber(providedMin)) {
        finalMin = providedMin;
      } else if (typeof providedMin === "function") {
        try {
          if (dataDomain != null) {
            finalMin = providedMin(dataDomain === null || dataDomain === void 0 ? void 0 : dataDomain[0]);
          }
        } catch (_unused2) {
        }
      } else if (typeof providedMin === "string" && MIN_VALUE_REG.test(providedMin)) {
        var match = MIN_VALUE_REG.exec(providedMin);
        if (match == null || dataDomain == null) {
          finalMin = void 0;
        } else {
          var value = +match[1];
          finalMin = dataDomain[0] - value;
        }
      } else {
        finalMin = dataDomain === null || dataDomain === void 0 ? void 0 : dataDomain[0];
      }
      if (providedMax === "auto") {
        if (dataDomain != null) {
          finalMax = Math.max(...dataDomain);
        }
      } else if (isNumber(providedMax)) {
        finalMax = providedMax;
      } else if (typeof providedMax === "function") {
        try {
          if (dataDomain != null) {
            finalMax = providedMax(dataDomain === null || dataDomain === void 0 ? void 0 : dataDomain[1]);
          }
        } catch (_unused3) {
        }
      } else if (typeof providedMax === "string" && MAX_VALUE_REG.test(providedMax)) {
        var _match = MAX_VALUE_REG.exec(providedMax);
        if (_match == null || dataDomain == null) {
          finalMax = void 0;
        } else {
          var _value = +_match[1];
          finalMax = dataDomain[1] + _value;
        }
      } else {
        finalMax = dataDomain === null || dataDomain === void 0 ? void 0 : dataDomain[1];
      }
      var candidate = [finalMin, finalMax];
      if (isWellFormedNumberDomain(candidate)) {
        if (dataDomain == null) {
          return candidate;
        }
        return extendDomain(candidate, dataDomain, allowDataOverflow);
      }
    }
    return void 0;
  }

  // client/node_modules/recharts/es6/util/scale/index.js
  init_define_import_meta_env();

  // client/node_modules/recharts/es6/util/scale/getNiceTickValues.js
  init_define_import_meta_env();
  var import_decimal2 = __toESM(require_decimal());

  // client/node_modules/recharts/es6/util/scale/util/utils.js
  init_define_import_meta_env();
  var identity3 = (i) => i;
  var PLACE_HOLDER = {
    "@@functional/placeholder": true
  };
  var isPlaceHolder = (val) => val === PLACE_HOLDER;
  var curry0 = (fn) => function _curried() {
    if (arguments.length === 0 || arguments.length === 1 && isPlaceHolder(arguments.length <= 0 ? void 0 : arguments[0])) {
      return _curried;
    }
    return fn(...arguments);
  };
  var curryN = (n, fn) => {
    if (n === 1) {
      return fn;
    }
    return curry0(function() {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      var argsLength = args.filter((arg) => arg !== PLACE_HOLDER).length;
      if (argsLength >= n) {
        return fn(...args);
      }
      return curryN(n - argsLength, curry0(function() {
        for (var _len2 = arguments.length, restArgs = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          restArgs[_key2] = arguments[_key2];
        }
        var newArgs = args.map((arg) => isPlaceHolder(arg) ? restArgs.shift() : arg);
        return fn(...newArgs, ...restArgs);
      }));
    });
  };
  var curry = (fn) => curryN(fn.length, fn);
  var range2 = (begin, end) => {
    var arr = [];
    for (var i = begin; i < end; ++i) {
      arr[i - begin] = i;
    }
    return arr;
  };
  var map2 = curry((fn, arr) => {
    if (Array.isArray(arr)) {
      return arr.map(fn);
    }
    return Object.keys(arr).map((key) => arr[key]).map(fn);
  });
  var compose2 = function compose3() {
    for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      args[_key3] = arguments[_key3];
    }
    if (!args.length) {
      return identity3;
    }
    var fns = args.reverse();
    var firstFn = fns[0];
    var tailsFn = fns.slice(1);
    return function() {
      return tailsFn.reduce((res, fn) => fn(res), firstFn(...arguments));
    };
  };
  var reverse = (arr) => {
    if (Array.isArray(arr)) {
      return arr.reverse();
    }
    return arr.split("").reverse().join("");
  };
  var memoize = (fn) => {
    var lastArgs = null;
    var lastResult2 = null;
    return function() {
      for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        args[_key4] = arguments[_key4];
      }
      if (lastArgs && args.every((val, i) => {
        var _lastArgs;
        return val === ((_lastArgs = lastArgs) === null || _lastArgs === void 0 ? void 0 : _lastArgs[i]);
      })) {
        return lastResult2;
      }
      lastArgs = args;
      lastResult2 = fn(...args);
      return lastResult2;
    };
  };

  // client/node_modules/recharts/es6/util/scale/util/arithmetic.js
  init_define_import_meta_env();
  var import_decimal = __toESM(require_decimal());
  function getDigitCount(value) {
    var result;
    if (value === 0) {
      result = 1;
    } else {
      result = Math.floor(new import_decimal.default(value).abs().log(10).toNumber()) + 1;
    }
    return result;
  }
  function rangeStep(start, end, step) {
    var num = new import_decimal.default(start);
    var i = 0;
    var result = [];
    while (num.lt(end) && i < 1e5) {
      result.push(num.toNumber());
      num = num.add(step);
      i++;
    }
    return result;
  }
  var interpolateNumber2 = curry((a, b, t) => {
    var newA = +a;
    var newB = +b;
    return newA + t * (newB - newA);
  });
  var uninterpolateNumber = curry((a, b, x2) => {
    var diff = b - +a;
    diff = diff || Infinity;
    return (x2 - a) / diff;
  });
  var uninterpolateTruncation = curry((a, b, x2) => {
    var diff = b - +a;
    diff = diff || Infinity;
    return Math.max(0, Math.min(1, (x2 - a) / diff));
  });

  // client/node_modules/recharts/es6/util/scale/getNiceTickValues.js
  var getValidInterval = (_ref) => {
    var [min2, max2] = _ref;
    var [validMin, validMax] = [min2, max2];
    if (min2 > max2) {
      [validMin, validMax] = [max2, min2];
    }
    return [validMin, validMax];
  };
  var getFormatStep = (roughStep, allowDecimals, correctionFactor) => {
    if (roughStep.lte(0)) {
      return new import_decimal2.default(0);
    }
    var digitCount = getDigitCount(roughStep.toNumber());
    var digitCountValue = new import_decimal2.default(10).pow(digitCount);
    var stepRatio = roughStep.div(digitCountValue);
    var stepRatioScale = digitCount !== 1 ? 0.05 : 0.1;
    var amendStepRatio = new import_decimal2.default(Math.ceil(stepRatio.div(stepRatioScale).toNumber())).add(correctionFactor).mul(stepRatioScale);
    var formatStep = amendStepRatio.mul(digitCountValue);
    return allowDecimals ? new import_decimal2.default(formatStep.toNumber()) : new import_decimal2.default(Math.ceil(formatStep.toNumber()));
  };
  var getTickOfSingleValue = (value, tickCount, allowDecimals) => {
    var step = new import_decimal2.default(1);
    var middle = new import_decimal2.default(value);
    if (!middle.isint() && allowDecimals) {
      var absVal = Math.abs(value);
      if (absVal < 1) {
        step = new import_decimal2.default(10).pow(getDigitCount(value) - 1);
        middle = new import_decimal2.default(Math.floor(middle.div(step).toNumber())).mul(step);
      } else if (absVal > 1) {
        middle = new import_decimal2.default(Math.floor(value));
      }
    } else if (value === 0) {
      middle = new import_decimal2.default(Math.floor((tickCount - 1) / 2));
    } else if (!allowDecimals) {
      middle = new import_decimal2.default(Math.floor(value));
    }
    var middleIndex = Math.floor((tickCount - 1) / 2);
    var fn = compose2(map2((n) => middle.add(new import_decimal2.default(n - middleIndex).mul(step)).toNumber()), range2);
    return fn(0, tickCount);
  };
  var _calculateStep = function calculateStep(min2, max2, tickCount, allowDecimals) {
    var correctionFactor = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : 0;
    if (!Number.isFinite((max2 - min2) / (tickCount - 1))) {
      return {
        step: new import_decimal2.default(0),
        tickMin: new import_decimal2.default(0),
        tickMax: new import_decimal2.default(0)
      };
    }
    var step = getFormatStep(new import_decimal2.default(max2).sub(min2).div(tickCount - 1), allowDecimals, correctionFactor);
    var middle;
    if (min2 <= 0 && max2 >= 0) {
      middle = new import_decimal2.default(0);
    } else {
      middle = new import_decimal2.default(min2).add(max2).div(2);
      middle = middle.sub(new import_decimal2.default(middle).mod(step));
    }
    var belowCount = Math.ceil(middle.sub(min2).div(step).toNumber());
    var upCount = Math.ceil(new import_decimal2.default(max2).sub(middle).div(step).toNumber());
    var scaleCount = belowCount + upCount + 1;
    if (scaleCount > tickCount) {
      return _calculateStep(min2, max2, tickCount, allowDecimals, correctionFactor + 1);
    }
    if (scaleCount < tickCount) {
      upCount = max2 > 0 ? upCount + (tickCount - scaleCount) : upCount;
      belowCount = max2 > 0 ? belowCount : belowCount + (tickCount - scaleCount);
    }
    return {
      step,
      tickMin: middle.sub(new import_decimal2.default(belowCount).mul(step)),
      tickMax: middle.add(new import_decimal2.default(upCount).mul(step))
    };
  };
  function getNiceTickValuesFn(_ref2) {
    var [min2, max2] = _ref2;
    var tickCount = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 6;
    var allowDecimals = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : true;
    var count = Math.max(tickCount, 2);
    var [cormin, cormax] = getValidInterval([min2, max2]);
    if (cormin === -Infinity || cormax === Infinity) {
      var _values = cormax === Infinity ? [cormin, ...range2(0, tickCount - 1).map(() => Infinity)] : [...range2(0, tickCount - 1).map(() => -Infinity), cormax];
      return min2 > max2 ? reverse(_values) : _values;
    }
    if (cormin === cormax) {
      return getTickOfSingleValue(cormin, tickCount, allowDecimals);
    }
    var {
      step,
      tickMin,
      tickMax
    } = _calculateStep(cormin, cormax, count, allowDecimals, 0);
    var values = rangeStep(tickMin, tickMax.add(new import_decimal2.default(0.1).mul(step)), step);
    return min2 > max2 ? reverse(values) : values;
  }
  function getTickValuesFixedDomainFn(_ref3, tickCount) {
    var [min2, max2] = _ref3;
    var allowDecimals = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : true;
    var [cormin, cormax] = getValidInterval([min2, max2]);
    if (cormin === -Infinity || cormax === Infinity) {
      return [min2, max2];
    }
    if (cormin === cormax) {
      return [cormin];
    }
    var count = Math.max(tickCount, 2);
    var step = getFormatStep(new import_decimal2.default(cormax).sub(cormin).div(count - 1), allowDecimals, 0);
    var values = [...rangeStep(new import_decimal2.default(cormin), new import_decimal2.default(cormax).sub(new import_decimal2.default(0.99).mul(step)), step), cormax];
    return min2 > max2 ? reverse(values) : values;
  }
  var getNiceTickValues = memoize(getNiceTickValuesFn);
  var getTickValuesFixedDomain = memoize(getTickValuesFixedDomainFn);

  // client/node_modules/recharts/es6/state/selectors/rootPropsSelectors.js
  init_define_import_meta_env();
  var selectBarCategoryGap = (state) => state.rootProps.barCategoryGap;
  var selectStackOffsetType = (state) => state.rootProps.stackOffset;
  var selectChartName = (state) => state.options.chartName;
  var selectSyncId = (state) => state.rootProps.syncId;
  var selectSyncMethod = (state) => state.rootProps.syncMethod;
  var selectEventEmitter = (state) => state.options.eventEmitter;

  // client/node_modules/recharts/es6/state/selectors/polarAxisSelectors.js
  init_define_import_meta_env();

  // client/node_modules/recharts/es6/polar/defaultPolarAngleAxisProps.js
  init_define_import_meta_env();
  var defaultPolarAngleAxisProps = {
    allowDuplicatedCategory: true,
    // if I set this to false then Tooltip synchronisation stops working in Radar, wtf
    angleAxisId: 0,
    axisLine: true,
    cx: 0,
    cy: 0,
    orientation: "outer",
    reversed: false,
    scale: "auto",
    tick: true,
    tickLine: true,
    tickSize: 8,
    type: "category"
  };

  // client/node_modules/recharts/es6/polar/defaultPolarRadiusAxisProps.js
  init_define_import_meta_env();
  var defaultPolarRadiusAxisProps = {
    allowDataOverflow: false,
    allowDuplicatedCategory: true,
    angle: 0,
    axisLine: true,
    cx: 0,
    cy: 0,
    orientation: "right",
    radiusAxisId: 0,
    scale: "auto",
    stroke: "#ccc",
    tick: true,
    tickCount: 5,
    type: "number"
  };

  // client/node_modules/recharts/es6/state/selectors/combiners/combineAxisRangeWithReverse.js
  init_define_import_meta_env();
  var combineAxisRangeWithReverse = (axisSettings, axisRange) => {
    if (!axisSettings || !axisRange) {
      return void 0;
    }
    if (axisSettings !== null && axisSettings !== void 0 && axisSettings.reversed) {
      return [axisRange[1], axisRange[0]];
    }
    return axisRange;
  };

  // client/node_modules/recharts/es6/state/selectors/polarAxisSelectors.js
  var implicitAngleAxis = {
    allowDataOverflow: false,
    allowDecimals: false,
    allowDuplicatedCategory: false,
    // defaultPolarAngleAxisProps.allowDuplicatedCategory has it set to true but the actual axis rendering ignores the prop because reasons,
    dataKey: void 0,
    domain: void 0,
    id: defaultPolarAngleAxisProps.angleAxisId,
    includeHidden: false,
    name: void 0,
    reversed: defaultPolarAngleAxisProps.reversed,
    scale: defaultPolarAngleAxisProps.scale,
    tick: defaultPolarAngleAxisProps.tick,
    tickCount: void 0,
    ticks: void 0,
    type: defaultPolarAngleAxisProps.type,
    unit: void 0
  };
  var implicitRadiusAxis = {
    allowDataOverflow: defaultPolarRadiusAxisProps.allowDataOverflow,
    allowDecimals: false,
    allowDuplicatedCategory: defaultPolarRadiusAxisProps.allowDuplicatedCategory,
    dataKey: void 0,
    domain: void 0,
    id: defaultPolarRadiusAxisProps.radiusAxisId,
    includeHidden: false,
    name: void 0,
    reversed: false,
    scale: defaultPolarRadiusAxisProps.scale,
    tick: defaultPolarRadiusAxisProps.tick,
    tickCount: defaultPolarRadiusAxisProps.tickCount,
    ticks: void 0,
    type: defaultPolarRadiusAxisProps.type,
    unit: void 0
  };
  var implicitRadialBarAngleAxis = {
    allowDataOverflow: false,
    allowDecimals: false,
    allowDuplicatedCategory: defaultPolarAngleAxisProps.allowDuplicatedCategory,
    dataKey: void 0,
    domain: void 0,
    id: defaultPolarAngleAxisProps.angleAxisId,
    includeHidden: false,
    name: void 0,
    reversed: false,
    scale: defaultPolarAngleAxisProps.scale,
    tick: defaultPolarAngleAxisProps.tick,
    tickCount: void 0,
    ticks: void 0,
    type: "number",
    unit: void 0
  };
  var implicitRadialBarRadiusAxis = {
    allowDataOverflow: defaultPolarRadiusAxisProps.allowDataOverflow,
    allowDecimals: false,
    allowDuplicatedCategory: defaultPolarRadiusAxisProps.allowDuplicatedCategory,
    dataKey: void 0,
    domain: void 0,
    id: defaultPolarRadiusAxisProps.radiusAxisId,
    includeHidden: false,
    name: void 0,
    reversed: false,
    scale: defaultPolarRadiusAxisProps.scale,
    tick: defaultPolarRadiusAxisProps.tick,
    tickCount: defaultPolarRadiusAxisProps.tickCount,
    ticks: void 0,
    type: "category",
    unit: void 0
  };
  var selectAngleAxis = (state, angleAxisId) => {
    if (state.polarAxis.angleAxis[angleAxisId] != null) {
      return state.polarAxis.angleAxis[angleAxisId];
    }
    if (state.layout.layoutType === "radial") {
      return implicitRadialBarAngleAxis;
    }
    return implicitAngleAxis;
  };
  var selectRadiusAxis = (state, radiusAxisId) => {
    if (state.polarAxis.radiusAxis[radiusAxisId] != null) {
      return state.polarAxis.radiusAxis[radiusAxisId];
    }
    if (state.layout.layoutType === "radial") {
      return implicitRadialBarRadiusAxis;
    }
    return implicitRadiusAxis;
  };
  var selectPolarOptions = (state) => state.polarOptions;
  var selectMaxRadius = createSelector([selectChartWidth, selectChartHeight, selectChartOffset], getMaxRadius);
  var selectInnerRadius = createSelector([selectPolarOptions, selectMaxRadius], (polarChartOptions, maxRadius) => {
    if (polarChartOptions == null) {
      return void 0;
    }
    return getPercentValue(polarChartOptions.innerRadius, maxRadius, 0);
  });
  var selectOuterRadius = createSelector([selectPolarOptions, selectMaxRadius], (polarChartOptions, maxRadius) => {
    if (polarChartOptions == null) {
      return void 0;
    }
    return getPercentValue(polarChartOptions.outerRadius, maxRadius, maxRadius * 0.8);
  });
  var combineAngleAxisRange = (polarOptions) => {
    if (polarOptions == null) {
      return [0, 0];
    }
    var {
      startAngle,
      endAngle
    } = polarOptions;
    return [startAngle, endAngle];
  };
  var selectAngleAxisRange = createSelector([selectPolarOptions], combineAngleAxisRange);
  var selectAngleAxisRangeWithReversed = createSelector([selectAngleAxis, selectAngleAxisRange], combineAxisRangeWithReverse);
  var selectRadiusAxisRange = createSelector([selectMaxRadius, selectInnerRadius, selectOuterRadius], (maxRadius, innerRadius, outerRadius) => {
    if (maxRadius == null || innerRadius == null || outerRadius == null) {
      return void 0;
    }
    return [innerRadius, outerRadius];
  });
  var selectRadiusAxisRangeWithReversed = createSelector([selectRadiusAxis, selectRadiusAxisRange], combineAxisRangeWithReverse);
  var selectPolarViewBox = createSelector([selectChartLayout, selectPolarOptions, selectInnerRadius, selectOuterRadius, selectChartWidth, selectChartHeight], (layout, polarOptions, innerRadius, outerRadius, width, height) => {
    if (layout !== "centric" && layout !== "radial" || polarOptions == null || innerRadius == null || outerRadius == null) {
      return void 0;
    }
    var {
      cx,
      cy,
      startAngle,
      endAngle
    } = polarOptions;
    return {
      cx: getPercentValue(cx, width, width / 2),
      cy: getPercentValue(cy, height, height / 2),
      innerRadius,
      outerRadius,
      startAngle,
      endAngle,
      clockWise: false
    };
  });

  // client/node_modules/recharts/es6/state/selectors/pickAxisType.js
  init_define_import_meta_env();
  var pickAxisType = (_state, axisType) => axisType;

  // client/node_modules/recharts/es6/state/selectors/pickAxisId.js
  init_define_import_meta_env();
  var pickAxisId = (_state, _axisType, axisId) => axisId;

  // client/node_modules/recharts/es6/state/selectors/axisSelectors.js
  function ownKeys9(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread9(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys9(Object(t), true).forEach(function(r3) {
        _defineProperty9(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys9(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  function _defineProperty9(e, r2, t) {
    return (r2 = _toPropertyKey9(r2)) in e ? Object.defineProperty(e, r2, { value: t, enumerable: true, configurable: true, writable: true }) : e[r2] = t, e;
  }
  function _toPropertyKey9(t) {
    var i = _toPrimitive9(t, "string");
    return "symbol" == typeof i ? i : i + "";
  }
  function _toPrimitive9(t, r2) {
    if ("object" != typeof t || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r2 || "default");
      if ("object" != typeof i) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r2 ? String : Number)(t);
  }
  var defaultNumericDomain = [0, "auto"];
  var implicitXAxis = {
    allowDataOverflow: false,
    allowDecimals: true,
    allowDuplicatedCategory: true,
    angle: 0,
    dataKey: void 0,
    domain: void 0,
    height: 30,
    hide: true,
    id: 0,
    includeHidden: false,
    interval: "preserveEnd",
    minTickGap: 5,
    mirror: false,
    name: void 0,
    orientation: "bottom",
    padding: {
      left: 0,
      right: 0
    },
    reversed: false,
    scale: "auto",
    tick: true,
    tickCount: 5,
    tickFormatter: void 0,
    ticks: void 0,
    type: "category",
    unit: void 0
  };
  var selectXAxisSettings = (state, axisId) => {
    var axis = state.cartesianAxis.xAxis[axisId];
    if (axis == null) {
      return implicitXAxis;
    }
    return axis;
  };
  var implicitYAxis = {
    allowDataOverflow: false,
    allowDecimals: true,
    allowDuplicatedCategory: true,
    angle: 0,
    dataKey: void 0,
    domain: defaultNumericDomain,
    hide: true,
    id: 0,
    includeHidden: false,
    interval: "preserveEnd",
    minTickGap: 5,
    mirror: false,
    name: void 0,
    orientation: "left",
    padding: {
      top: 0,
      bottom: 0
    },
    reversed: false,
    scale: "auto",
    tick: true,
    tickCount: 5,
    tickFormatter: void 0,
    ticks: void 0,
    type: "number",
    unit: void 0,
    width: DEFAULT_Y_AXIS_WIDTH
  };
  var selectYAxisSettings = (state, axisId) => {
    var axis = state.cartesianAxis.yAxis[axisId];
    if (axis == null) {
      return implicitYAxis;
    }
    return axis;
  };
  var implicitZAxis = {
    domain: [0, "auto"],
    includeHidden: false,
    reversed: false,
    allowDataOverflow: false,
    allowDuplicatedCategory: false,
    dataKey: void 0,
    id: 0,
    name: "",
    range: [64, 64],
    scale: "auto",
    type: "number",
    unit: ""
  };
  var selectZAxisSettings = (state, axisId) => {
    var axis = state.cartesianAxis.zAxis[axisId];
    if (axis == null) {
      return implicitZAxis;
    }
    return axis;
  };
  var selectBaseAxis = (state, axisType, axisId) => {
    switch (axisType) {
      case "xAxis": {
        return selectXAxisSettings(state, axisId);
      }
      case "yAxis": {
        return selectYAxisSettings(state, axisId);
      }
      case "zAxis": {
        return selectZAxisSettings(state, axisId);
      }
      case "angleAxis": {
        return selectAngleAxis(state, axisId);
      }
      case "radiusAxis": {
        return selectRadiusAxis(state, axisId);
      }
      default:
        throw new Error("Unexpected axis type: ".concat(axisType));
    }
  };
  var selectCartesianAxisSettings = (state, axisType, axisId) => {
    switch (axisType) {
      case "xAxis": {
        return selectXAxisSettings(state, axisId);
      }
      case "yAxis": {
        return selectYAxisSettings(state, axisId);
      }
      default:
        throw new Error("Unexpected axis type: ".concat(axisType));
    }
  };
  var selectAxisSettings = (state, axisType, axisId) => {
    switch (axisType) {
      case "xAxis": {
        return selectXAxisSettings(state, axisId);
      }
      case "yAxis": {
        return selectYAxisSettings(state, axisId);
      }
      case "angleAxis": {
        return selectAngleAxis(state, axisId);
      }
      case "radiusAxis": {
        return selectRadiusAxis(state, axisId);
      }
      default:
        throw new Error("Unexpected axis type: ".concat(axisType));
    }
  };
  var selectHasBar = (state) => state.graphicalItems.countOfBars > 0;
  function itemAxisPredicate(axisType, axisId) {
    return (item) => {
      switch (axisType) {
        case "xAxis":
          return "xAxisId" in item && item.xAxisId === axisId;
        case "yAxis":
          return "yAxisId" in item && item.yAxisId === axisId;
        case "zAxis":
          return "zAxisId" in item && item.zAxisId === axisId;
        case "angleAxis":
          return "angleAxisId" in item && item.angleAxisId === axisId;
        case "radiusAxis":
          return "radiusAxisId" in item && item.radiusAxisId === axisId;
        default:
          return false;
      }
    };
  }
  var selectUnfilteredCartesianItems = (state) => state.graphicalItems.cartesianItems;
  var selectAxisPredicate = createSelector([pickAxisType, pickAxisId], itemAxisPredicate);
  var combineGraphicalItemsSettings = (graphicalItems, axisSettings, axisPredicate) => graphicalItems.filter(axisPredicate).filter((item) => {
    if ((axisSettings === null || axisSettings === void 0 ? void 0 : axisSettings.includeHidden) === true) {
      return true;
    }
    return !item.hide;
  });
  var selectCartesianItemsSettings = createSelector([selectUnfilteredCartesianItems, selectBaseAxis, selectAxisPredicate], combineGraphicalItemsSettings);
  var filterGraphicalNotStackedItems = (cartesianItems) => cartesianItems.filter((item) => item.stackId === void 0);
  var selectCartesianItemsSettingsExceptStacked = createSelector([selectCartesianItemsSettings], filterGraphicalNotStackedItems);
  var combineGraphicalItemsData = (cartesianItems) => cartesianItems.map((item) => item.data).filter(Boolean).flat(1);
  var selectCartesianGraphicalItemsData = createSelector([selectCartesianItemsSettings], combineGraphicalItemsData);
  var combineDisplayedData = (graphicalItemsData, _ref) => {
    var {
      chartData = [],
      dataStartIndex,
      dataEndIndex
    } = _ref;
    if (graphicalItemsData.length > 0) {
      return graphicalItemsData;
    }
    return chartData.slice(dataStartIndex, dataEndIndex + 1);
  };
  var selectDisplayedData = createSelector([selectCartesianGraphicalItemsData, selectChartDataWithIndexesIfNotInPanorama], combineDisplayedData);
  var combineAppliedValues = (data, axisSettings, items) => {
    if ((axisSettings === null || axisSettings === void 0 ? void 0 : axisSettings.dataKey) != null) {
      return data.map((item) => ({
        value: getValueByDataKey(item, axisSettings.dataKey)
      }));
    }
    if (items.length > 0) {
      return items.map((item) => item.dataKey).flatMap((dataKey) => data.map((entry) => ({
        value: getValueByDataKey(entry, dataKey)
      })));
    }
    return data.map((entry) => ({
      value: entry
    }));
  };
  var selectAllAppliedValues = createSelector([selectDisplayedData, selectBaseAxis, selectCartesianItemsSettings], combineAppliedValues);
  function isErrorBarRelevantForAxisType(axisType, errorBar) {
    switch (axisType) {
      case "xAxis":
        return errorBar.direction === "x";
      case "yAxis":
        return errorBar.direction === "y";
      default:
        return false;
    }
  }
  function onlyAllowNumbers(data) {
    return data.filter((v) => isNumOrStr(v) || v instanceof Date).map(Number).filter((n) => isNan(n) === false);
  }
  function getErrorDomainByDataKey(entry, appliedValue, relevantErrorBars) {
    if (!relevantErrorBars || typeof appliedValue !== "number" || isNan(appliedValue)) {
      return [];
    }
    if (!relevantErrorBars.length) {
      return [];
    }
    return onlyAllowNumbers(relevantErrorBars.flatMap((eb) => {
      var errorValue = getValueByDataKey(entry, eb.dataKey);
      var lowBound, highBound;
      if (Array.isArray(errorValue)) {
        [lowBound, highBound] = errorValue;
      } else {
        lowBound = highBound = errorValue;
      }
      if (!isWellBehavedNumber(lowBound) || !isWellBehavedNumber(highBound)) {
        return void 0;
      }
      return [appliedValue - lowBound, appliedValue + highBound];
    }));
  }
  var combineStackGroups = (displayedData, items, stackOffsetType) => {
    var initialItemsGroups = {};
    var itemsGroup = items.reduce((acc, item) => {
      if (item.stackId == null) {
        return acc;
      }
      if (acc[item.stackId] == null) {
        acc[item.stackId] = [];
      }
      acc[item.stackId].push(item);
      return acc;
    }, initialItemsGroups);
    return Object.fromEntries(Object.entries(itemsGroup).map((_ref2) => {
      var [stackId, graphicalItems] = _ref2;
      var dataKeys = graphicalItems.map((i) => i.dataKey);
      return [stackId, {
        // @ts-expect-error getStackedData requires that the input is array of objects, Recharts does not test for that
        stackedData: getStackedData(displayedData, dataKeys, stackOffsetType),
        graphicalItems
      }];
    }));
  };
  var selectStackGroups = createSelector([selectDisplayedData, selectCartesianItemsSettings, selectStackOffsetType], combineStackGroups);
  var combineDomainOfStackGroups = (stackGroups, _ref3, axisType) => {
    var {
      dataStartIndex,
      dataEndIndex
    } = _ref3;
    if (axisType === "zAxis") {
      return void 0;
    }
    var domainOfStackGroups = getDomainOfStackGroups(stackGroups, dataStartIndex, dataEndIndex);
    if (domainOfStackGroups != null && domainOfStackGroups[0] === 0 && domainOfStackGroups[1] === 0) {
      return void 0;
    }
    return domainOfStackGroups;
  };
  var selectDomainOfStackGroups = createSelector([selectStackGroups, selectChartDataWithIndexes, pickAxisType], combineDomainOfStackGroups);
  var combineAppliedNumericalValuesIncludingErrorValues = (data, axisSettings, items, axisType) => {
    if (items.length > 0) {
      return data.flatMap((entry) => {
        return items.flatMap((item) => {
          var _item$errorBars, _axisSettings$dataKey;
          var relevantErrorBars = (_item$errorBars = item.errorBars) === null || _item$errorBars === void 0 ? void 0 : _item$errorBars.filter((errorBar) => isErrorBarRelevantForAxisType(axisType, errorBar));
          var valueByDataKey = getValueByDataKey(entry, (_axisSettings$dataKey = axisSettings.dataKey) !== null && _axisSettings$dataKey !== void 0 ? _axisSettings$dataKey : item.dataKey);
          return {
            value: valueByDataKey,
            errorDomain: getErrorDomainByDataKey(entry, valueByDataKey, relevantErrorBars)
          };
        });
      }).filter(Boolean);
    }
    if ((axisSettings === null || axisSettings === void 0 ? void 0 : axisSettings.dataKey) != null) {
      return data.map((item) => ({
        value: getValueByDataKey(item, axisSettings.dataKey),
        errorDomain: []
      }));
    }
    return data.map((entry) => ({
      value: entry,
      errorDomain: []
    }));
  };
  var selectAllAppliedNumericalValuesIncludingErrorValues = createSelector(selectDisplayedData, selectBaseAxis, selectCartesianItemsSettingsExceptStacked, pickAxisType, combineAppliedNumericalValuesIncludingErrorValues);
  function onlyAllowNumbersAndStringsAndDates(item) {
    var {
      value
    } = item;
    if (isNumOrStr(value) || value instanceof Date) {
      return value;
    }
    return void 0;
  }
  var computeNumericalDomain = (dataWithErrorDomains) => {
    var allDataSquished = dataWithErrorDomains.flatMap((d) => [d.value, d.errorDomain]).flat(1);
    var onlyNumbers = onlyAllowNumbers(allDataSquished);
    if (onlyNumbers.length === 0) {
      return void 0;
    }
    return [Math.min(...onlyNumbers), Math.max(...onlyNumbers)];
  };
  var computeDomainOfTypeCategory = (allDataSquished, axisSettings, isCategorical) => {
    var categoricalDomain = allDataSquished.map(onlyAllowNumbersAndStringsAndDates).filter((v) => v != null);
    if (isCategorical && (axisSettings.dataKey == null || axisSettings.allowDuplicatedCategory && hasDuplicate(categoricalDomain))) {
      return (0, import_range2.default)(0, allDataSquished.length);
    }
    if (axisSettings.allowDuplicatedCategory) {
      return categoricalDomain;
    }
    return Array.from(new Set(categoricalDomain));
  };
  var getDomainDefinition = (axisSettings) => {
    var _axisSettings$domain;
    if (axisSettings == null || !("domain" in axisSettings)) {
      return defaultNumericDomain;
    }
    if (axisSettings.domain != null) {
      return axisSettings.domain;
    }
    if (axisSettings.ticks != null) {
      if (axisSettings.type === "number") {
        var allValues = onlyAllowNumbers(axisSettings.ticks);
        return [Math.min(...allValues), Math.max(...allValues)];
      }
      if (axisSettings.type === "category") {
        return axisSettings.ticks.map(String);
      }
    }
    return (_axisSettings$domain = axisSettings === null || axisSettings === void 0 ? void 0 : axisSettings.domain) !== null && _axisSettings$domain !== void 0 ? _axisSettings$domain : defaultNumericDomain;
  };
  var mergeDomains = function mergeDomains2() {
    for (var _len = arguments.length, domains = new Array(_len), _key = 0; _key < _len; _key++) {
      domains[_key] = arguments[_key];
    }
    var allDomains = domains.filter(Boolean);
    if (allDomains.length === 0) {
      return void 0;
    }
    var allValues = allDomains.flat();
    var min2 = Math.min(...allValues);
    var max2 = Math.max(...allValues);
    return [min2, max2];
  };
  var selectReferenceDots = (state) => state.referenceElements.dots;
  var filterReferenceElements = (elements, axisType, axisId) => {
    return elements.filter((el) => el.ifOverflow === "extendDomain").filter((el) => {
      if (axisType === "xAxis") {
        return el.xAxisId === axisId;
      }
      return el.yAxisId === axisId;
    });
  };
  var selectReferenceDotsByAxis = createSelector([selectReferenceDots, pickAxisType, pickAxisId], filterReferenceElements);
  var selectReferenceAreas = (state) => state.referenceElements.areas;
  var selectReferenceAreasByAxis = createSelector([selectReferenceAreas, pickAxisType, pickAxisId], filterReferenceElements);
  var selectReferenceLines = (state) => state.referenceElements.lines;
  var selectReferenceLinesByAxis = createSelector([selectReferenceLines, pickAxisType, pickAxisId], filterReferenceElements);
  var combineDotsDomain = (dots, axisType) => {
    var allCoords = onlyAllowNumbers(dots.map((dot) => axisType === "xAxis" ? dot.x : dot.y));
    if (allCoords.length === 0) {
      return void 0;
    }
    return [Math.min(...allCoords), Math.max(...allCoords)];
  };
  var selectReferenceDotsDomain = createSelector(selectReferenceDotsByAxis, pickAxisType, combineDotsDomain);
  var combineAreasDomain = (areas, axisType) => {
    var allCoords = onlyAllowNumbers(areas.flatMap((area) => [axisType === "xAxis" ? area.x1 : area.y1, axisType === "xAxis" ? area.x2 : area.y2]));
    if (allCoords.length === 0) {
      return void 0;
    }
    return [Math.min(...allCoords), Math.max(...allCoords)];
  };
  var selectReferenceAreasDomain = createSelector([selectReferenceAreasByAxis, pickAxisType], combineAreasDomain);
  var combineLinesDomain = (lines, axisType) => {
    var allCoords = onlyAllowNumbers(lines.map((line) => axisType === "xAxis" ? line.x : line.y));
    if (allCoords.length === 0) {
      return void 0;
    }
    return [Math.min(...allCoords), Math.max(...allCoords)];
  };
  var selectReferenceLinesDomain = createSelector(selectReferenceLinesByAxis, pickAxisType, combineLinesDomain);
  var selectReferenceElementsDomain = createSelector(selectReferenceDotsDomain, selectReferenceLinesDomain, selectReferenceAreasDomain, (dotsDomain, linesDomain, areasDomain) => {
    return mergeDomains(dotsDomain, areasDomain, linesDomain);
  });
  var selectDomainDefinition = createSelector([selectBaseAxis], getDomainDefinition);
  var combineNumericalDomain = (axisSettings, domainDefinition, domainOfStackGroups, allDataWithErrorDomains, referenceElementsDomain) => {
    var domainFromUserPreference = numericalDomainSpecifiedWithoutRequiringData(domainDefinition, axisSettings.allowDataOverflow);
    if (domainFromUserPreference != null) {
      return domainFromUserPreference;
    }
    return parseNumericalUserDomain(domainDefinition, mergeDomains(domainOfStackGroups, referenceElementsDomain, computeNumericalDomain(allDataWithErrorDomains)), axisSettings.allowDataOverflow);
  };
  var selectNumericalDomain = createSelector([selectBaseAxis, selectDomainDefinition, selectDomainOfStackGroups, selectAllAppliedNumericalValuesIncludingErrorValues, selectReferenceElementsDomain], combineNumericalDomain);
  var expandDomain = [0, 1];
  var combineAxisDomain = (axisSettings, layout, displayedData, allAppliedValues, stackOffsetType, axisType, numericalDomain) => {
    if (axisSettings == null || displayedData == null || displayedData.length === 0) {
      return void 0;
    }
    var {
      dataKey,
      type
    } = axisSettings;
    var isCategorical = isCategoricalAxis(layout, axisType);
    if (isCategorical && dataKey == null) {
      return (0, import_range2.default)(0, displayedData.length);
    }
    if (type === "category") {
      return computeDomainOfTypeCategory(allAppliedValues, axisSettings, isCategorical);
    }
    if (stackOffsetType === "expand") {
      return expandDomain;
    }
    return numericalDomain;
  };
  var selectAxisDomain = createSelector([selectBaseAxis, selectChartLayout, selectDisplayedData, selectAllAppliedValues, selectStackOffsetType, pickAxisType, selectNumericalDomain], combineAxisDomain);
  var combineRealScaleType = (axisConfig, layout, hasBar, chartType, axisType) => {
    if (axisConfig == null) {
      return void 0;
    }
    var {
      scale,
      type
    } = axisConfig;
    if (scale === "auto") {
      if (layout === "radial" && axisType === "radiusAxis") {
        return "band";
      }
      if (layout === "radial" && axisType === "angleAxis") {
        return "linear";
      }
      if (type === "category" && chartType && (chartType.indexOf("LineChart") >= 0 || chartType.indexOf("AreaChart") >= 0 || chartType.indexOf("ComposedChart") >= 0 && !hasBar)) {
        return "point";
      }
      if (type === "category") {
        return "band";
      }
      return "linear";
    }
    if (typeof scale === "string") {
      var name = "scale".concat(upperFirst(scale));
      return name in d3_scale_exports ? name : "point";
    }
    return void 0;
  };
  var selectRealScaleType = createSelector([selectBaseAxis, selectChartLayout, selectHasBar, selectChartName, pickAxisType], combineRealScaleType);
  function getD3ScaleFromType(realScaleType) {
    if (realScaleType == null) {
      return void 0;
    }
    if (realScaleType in d3_scale_exports) {
      return d3_scale_exports[realScaleType]();
    }
    var name = "scale".concat(upperFirst(realScaleType));
    if (name in d3_scale_exports) {
      return d3_scale_exports[name]();
    }
    return void 0;
  }
  function combineScaleFunction(axis, realScaleType, axisDomain, axisRange) {
    if (axisDomain == null || axisRange == null) {
      return void 0;
    }
    if (typeof axis.scale === "function") {
      return axis.scale.copy().domain(axisDomain).range(axisRange);
    }
    var d3ScaleFunction = getD3ScaleFromType(realScaleType);
    if (d3ScaleFunction == null) {
      return void 0;
    }
    var scale = d3ScaleFunction.domain(axisDomain).range(axisRange);
    checkDomainOfScale(scale);
    return scale;
  }
  var combineNiceTicks = (axisDomain, axisSettings, realScaleType) => {
    var domainDefinition = getDomainDefinition(axisSettings);
    if (realScaleType !== "auto" && realScaleType !== "linear") {
      return void 0;
    }
    if (axisSettings != null && axisSettings.tickCount && Array.isArray(domainDefinition) && (domainDefinition[0] === "auto" || domainDefinition[1] === "auto") && isWellFormedNumberDomain(axisDomain)) {
      return getNiceTickValues(axisDomain, axisSettings.tickCount, axisSettings.allowDecimals);
    }
    if (axisSettings != null && axisSettings.tickCount && axisSettings.type === "number" && axisDomain != null) {
      return getTickValuesFixedDomain(axisDomain, axisSettings.tickCount, axisSettings.allowDecimals);
    }
    return void 0;
  };
  var selectNiceTicks = createSelector([selectAxisDomain, selectAxisSettings, selectRealScaleType], combineNiceTicks);
  var combineAxisDomainWithNiceTicks = (axisSettings, domain, niceTicks, axisType) => {
    if (
      /*
       * Angle axis for some reason uses nice ticks when rendering axis tick labels,
       * but doesn't use nice ticks for extending domain like all the other axes do.
       * Not really sure why? Is there a good reason,
       * or is it just because someone added support for nice ticks to the other axes and forgot this one?
       */
      axisType !== "angleAxis" && (axisSettings === null || axisSettings === void 0 ? void 0 : axisSettings.type) === "number" && isWellFormedNumberDomain(domain) && Array.isArray(niceTicks) && niceTicks.length > 0
    ) {
      var minFromDomain = domain[0];
      var minFromTicks = niceTicks[0];
      var maxFromDomain = domain[1];
      var maxFromTicks = niceTicks[niceTicks.length - 1];
      return [Math.min(minFromDomain, minFromTicks), Math.max(maxFromDomain, maxFromTicks)];
    }
    return domain;
  };
  var selectAxisDomainIncludingNiceTicks = createSelector([selectBaseAxis, selectAxisDomain, selectNiceTicks, pickAxisType], combineAxisDomainWithNiceTicks);
  var selectSmallestDistanceBetweenValues = createSelector(selectAllAppliedValues, selectBaseAxis, (allDataSquished, axisSettings) => {
    if (!axisSettings || axisSettings.type !== "number") {
      return void 0;
    }
    var smallestDistanceBetweenValues = Infinity;
    var sortedValues = Array.from(onlyAllowNumbers(allDataSquished.map((d) => d.value))).sort((a, b) => a - b);
    if (sortedValues.length < 2) {
      return Infinity;
    }
    var diff = sortedValues[sortedValues.length - 1] - sortedValues[0];
    if (diff === 0) {
      return Infinity;
    }
    for (var i = 0; i < sortedValues.length - 1; i++) {
      var distance = sortedValues[i + 1] - sortedValues[i];
      smallestDistanceBetweenValues = Math.min(smallestDistanceBetweenValues, distance);
    }
    return smallestDistanceBetweenValues / diff;
  });
  var selectCalculatedPadding = createSelector(selectSmallestDistanceBetweenValues, selectChartLayout, selectBarCategoryGap, selectChartOffset, (_1, _2, _3, padding) => padding, (smallestDistanceInPercent, layout, barCategoryGap, offset, padding) => {
    if (!isWellBehavedNumber(smallestDistanceInPercent)) {
      return 0;
    }
    var rangeWidth = layout === "vertical" ? offset.height : offset.width;
    if (padding === "gap") {
      return smallestDistanceInPercent * rangeWidth / 2;
    }
    if (padding === "no-gap") {
      var gap = getPercentValue(barCategoryGap, smallestDistanceInPercent * rangeWidth);
      var halfBand = smallestDistanceInPercent * rangeWidth / 2;
      return halfBand - gap - (halfBand - gap) / rangeWidth * gap;
    }
    return 0;
  });
  var selectCalculatedXAxisPadding = (state, axisId) => {
    var xAxisSettings = selectXAxisSettings(state, axisId);
    if (xAxisSettings == null || typeof xAxisSettings.padding !== "string") {
      return 0;
    }
    return selectCalculatedPadding(state, "xAxis", axisId, xAxisSettings.padding);
  };
  var selectCalculatedYAxisPadding = (state, axisId) => {
    var yAxisSettings = selectYAxisSettings(state, axisId);
    if (yAxisSettings == null || typeof yAxisSettings.padding !== "string") {
      return 0;
    }
    return selectCalculatedPadding(state, "yAxis", axisId, yAxisSettings.padding);
  };
  var selectXAxisPadding = createSelector(selectXAxisSettings, selectCalculatedXAxisPadding, (xAxisSettings, calculated) => {
    var _padding$left, _padding$right;
    if (xAxisSettings == null) {
      return {
        left: 0,
        right: 0
      };
    }
    var {
      padding
    } = xAxisSettings;
    if (typeof padding === "string") {
      return {
        left: calculated,
        right: calculated
      };
    }
    return {
      left: ((_padding$left = padding.left) !== null && _padding$left !== void 0 ? _padding$left : 0) + calculated,
      right: ((_padding$right = padding.right) !== null && _padding$right !== void 0 ? _padding$right : 0) + calculated
    };
  });
  var selectYAxisPadding = createSelector(selectYAxisSettings, selectCalculatedYAxisPadding, (yAxisSettings, calculated) => {
    var _padding$top, _padding$bottom;
    if (yAxisSettings == null) {
      return {
        top: 0,
        bottom: 0
      };
    }
    var {
      padding
    } = yAxisSettings;
    if (typeof padding === "string") {
      return {
        top: calculated,
        bottom: calculated
      };
    }
    return {
      top: ((_padding$top = padding.top) !== null && _padding$top !== void 0 ? _padding$top : 0) + calculated,
      bottom: ((_padding$bottom = padding.bottom) !== null && _padding$bottom !== void 0 ? _padding$bottom : 0) + calculated
    };
  });
  var combineXAxisRange = createSelector([selectChartOffset, selectXAxisPadding, selectBrushDimensions, selectBrushSettings, (_state, _axisId, isPanorama) => isPanorama], (offset, padding, brushDimensions, _ref4, isPanorama) => {
    var {
      padding: brushPadding
    } = _ref4;
    if (isPanorama) {
      return [brushPadding.left, brushDimensions.width - brushPadding.right];
    }
    return [offset.left + padding.left, offset.left + offset.width - padding.right];
  });
  var combineYAxisRange = createSelector([selectChartOffset, selectChartLayout, selectYAxisPadding, selectBrushDimensions, selectBrushSettings, (_state, _axisId, isPanorama) => isPanorama], (offset, layout, padding, brushDimensions, _ref5, isPanorama) => {
    var {
      padding: brushPadding
    } = _ref5;
    if (isPanorama) {
      return [brushDimensions.height - brushPadding.bottom, brushPadding.top];
    }
    if (layout === "horizontal") {
      return [offset.top + offset.height - padding.bottom, offset.top + padding.top];
    }
    return [offset.top + padding.top, offset.top + offset.height - padding.bottom];
  });
  var selectAxisRange = (state, axisType, axisId, isPanorama) => {
    var _selectZAxisSettings;
    switch (axisType) {
      case "xAxis":
        return combineXAxisRange(state, axisId, isPanorama);
      case "yAxis":
        return combineYAxisRange(state, axisId, isPanorama);
      case "zAxis":
        return (_selectZAxisSettings = selectZAxisSettings(state, axisId)) === null || _selectZAxisSettings === void 0 ? void 0 : _selectZAxisSettings.range;
      case "angleAxis":
        return selectAngleAxisRange(state);
      case "radiusAxis":
        return selectRadiusAxisRange(state, axisId);
      default:
        return void 0;
    }
  };
  var selectAxisRangeWithReverse = createSelector([selectBaseAxis, selectAxisRange], combineAxisRangeWithReverse);
  var selectAxisScale = createSelector([selectBaseAxis, selectRealScaleType, selectAxisDomainIncludingNiceTicks, selectAxisRangeWithReverse], combineScaleFunction);
  var selectErrorBarsSettings = createSelector(selectCartesianItemsSettings, pickAxisType, (items, axisType) => {
    return items.flatMap((item) => {
      var _item$errorBars2;
      return (_item$errorBars2 = item.errorBars) !== null && _item$errorBars2 !== void 0 ? _item$errorBars2 : [];
    }).filter((e) => {
      return isErrorBarRelevantForAxisType(axisType, e);
    });
  });
  function compareIds(a, b) {
    if (a.id < b.id) {
      return -1;
    }
    if (a.id > b.id) {
      return 1;
    }
    return 0;
  }
  var pickAxisOrientation = (_state, orientation) => orientation;
  var pickMirror = (_state, _orientation, mirror) => mirror;
  var selectAllXAxesWithOffsetType = createSelector(selectAllXAxes, pickAxisOrientation, pickMirror, (allAxes, orientation, mirror) => allAxes.filter((axis) => axis.orientation === orientation).filter((axis) => axis.mirror === mirror).sort(compareIds));
  var selectAllYAxesWithOffsetType = createSelector(selectAllYAxes, pickAxisOrientation, pickMirror, (allAxes, orientation, mirror) => allAxes.filter((axis) => axis.orientation === orientation).filter((axis) => axis.mirror === mirror).sort(compareIds));
  var getXAxisSize = (offset, axisSettings) => {
    return {
      width: offset.width,
      height: axisSettings.height
    };
  };
  var getYAxisSize = (offset, axisSettings) => {
    var width = typeof axisSettings.width === "number" ? axisSettings.width : DEFAULT_Y_AXIS_WIDTH;
    return {
      width,
      height: offset.height
    };
  };
  var selectXAxisSize = createSelector(selectChartOffset, selectXAxisSettings, getXAxisSize);
  var combineXAxisPositionStartingPoint = (offset, orientation, chartHeight) => {
    switch (orientation) {
      case "top":
        return offset.top;
      case "bottom":
        return chartHeight - offset.bottom;
      default:
        return 0;
    }
  };
  var combineYAxisPositionStartingPoint = (offset, orientation, chartWidth) => {
    switch (orientation) {
      case "left":
        return offset.left;
      case "right":
        return chartWidth - offset.right;
      default:
        return 0;
    }
  };
  var selectAllXAxesOffsetSteps = createSelector(selectChartHeight, selectChartOffset, selectAllXAxesWithOffsetType, pickAxisOrientation, pickMirror, (chartHeight, offset, allAxesWithSameOffsetType, orientation, mirror) => {
    var steps = {};
    var position;
    allAxesWithSameOffsetType.forEach((axis) => {
      var axisSize = getXAxisSize(offset, axis);
      if (position == null) {
        position = combineXAxisPositionStartingPoint(offset, orientation, chartHeight);
      }
      var needSpace = orientation === "top" && !mirror || orientation === "bottom" && mirror;
      steps[axis.id] = position - Number(needSpace) * axisSize.height;
      position += (needSpace ? -1 : 1) * axisSize.height;
    });
    return steps;
  });
  var selectAllYAxesOffsetSteps = createSelector(selectChartWidth, selectChartOffset, selectAllYAxesWithOffsetType, pickAxisOrientation, pickMirror, (chartWidth, offset, allAxesWithSameOffsetType, orientation, mirror) => {
    var steps = {};
    var position;
    allAxesWithSameOffsetType.forEach((axis) => {
      var axisSize = getYAxisSize(offset, axis);
      if (position == null) {
        position = combineYAxisPositionStartingPoint(offset, orientation, chartWidth);
      }
      var needSpace = orientation === "left" && !mirror || orientation === "right" && mirror;
      steps[axis.id] = position - Number(needSpace) * axisSize.width;
      position += (needSpace ? -1 : 1) * axisSize.width;
    });
    return steps;
  });
  var selectYAxisSize = createSelector(selectChartOffset, selectYAxisSettings, (offset, axisSettings) => {
    var width = typeof axisSettings.width === "number" ? axisSettings.width : DEFAULT_Y_AXIS_WIDTH;
    return {
      width,
      height: offset.height
    };
  });
  var combineDuplicateDomain = (chartLayout, appliedValues, axis, axisType) => {
    if (axis == null) {
      return void 0;
    }
    var {
      allowDuplicatedCategory,
      type,
      dataKey
    } = axis;
    var isCategorical = isCategoricalAxis(chartLayout, axisType);
    var allData = appliedValues.map((av) => av.value);
    if (dataKey && isCategorical && type === "category" && allowDuplicatedCategory && hasDuplicate(allData)) {
      return allData;
    }
    return void 0;
  };
  var selectDuplicateDomain = createSelector([selectChartLayout, selectAllAppliedValues, selectBaseAxis, pickAxisType], combineDuplicateDomain);
  var combineCategoricalDomain = (layout, appliedValues, axis, axisType) => {
    if (axis == null || axis.dataKey == null) {
      return void 0;
    }
    var {
      type,
      scale
    } = axis;
    var isCategorical = isCategoricalAxis(layout, axisType);
    if (isCategorical && (type === "number" || scale !== "auto")) {
      return appliedValues.map((d) => d.value);
    }
    return void 0;
  };
  var selectCategoricalDomain = createSelector([selectChartLayout, selectAllAppliedValues, selectAxisSettings, pickAxisType], combineCategoricalDomain);
  var selectAxisPropsNeededForCartesianGridTicksGenerator = createSelector([selectChartLayout, selectCartesianAxisSettings, selectRealScaleType, selectAxisScale, selectDuplicateDomain, selectCategoricalDomain, selectAxisRange, selectNiceTicks, pickAxisType], (layout, axis, realScaleType, scale, duplicateDomain, categoricalDomain, axisRange, niceTicks, axisType) => {
    if (axis == null) {
      return null;
    }
    var isCategorical = isCategoricalAxis(layout, axisType);
    return {
      angle: axis.angle,
      interval: axis.interval,
      minTickGap: axis.minTickGap,
      orientation: axis.orientation,
      tick: axis.tick,
      tickCount: axis.tickCount,
      tickFormatter: axis.tickFormatter,
      ticks: axis.ticks,
      type: axis.type,
      unit: axis.unit,
      axisType,
      categoricalDomain,
      duplicateDomain,
      isCategorical,
      niceTicks,
      range: axisRange,
      realScaleType,
      scale
    };
  });
  var combineAxisTicks = (layout, axis, realScaleType, scale, niceTicks, axisRange, duplicateDomain, categoricalDomain, axisType) => {
    if (axis == null || scale == null) {
      return void 0;
    }
    var isCategorical = isCategoricalAxis(layout, axisType);
    var {
      type,
      ticks: ticks2,
      tickCount
    } = axis;
    var offsetForBand = realScaleType === "scaleBand" && typeof scale.bandwidth === "function" ? scale.bandwidth() / 2 : 2;
    var offset = type === "category" && scale.bandwidth ? scale.bandwidth() / offsetForBand : 0;
    offset = axisType === "angleAxis" && axisRange != null && axisRange.length >= 2 ? mathSign(axisRange[0] - axisRange[1]) * 2 * offset : offset;
    var ticksOrNiceTicks = ticks2 || niceTicks;
    if (ticksOrNiceTicks) {
      var result = ticksOrNiceTicks.map((entry, index) => {
        var scaleContent = duplicateDomain ? duplicateDomain.indexOf(entry) : entry;
        return {
          index,
          // If the scaleContent is not a number, the coordinate will be NaN.
          // That could be the case for example with a PointScale and a string as domain.
          coordinate: scale(scaleContent) + offset,
          value: entry,
          offset
        };
      });
      return result.filter((row) => !isNan(row.coordinate));
    }
    if (isCategorical && categoricalDomain) {
      return categoricalDomain.map((entry, index) => ({
        coordinate: scale(entry) + offset,
        value: entry,
        index,
        offset
      }));
    }
    if (scale.ticks) {
      return scale.ticks(tickCount).map((entry) => ({
        coordinate: scale(entry) + offset,
        value: entry,
        offset
      }));
    }
    return scale.domain().map((entry, index) => ({
      coordinate: scale(entry) + offset,
      value: duplicateDomain ? duplicateDomain[entry] : entry,
      index,
      offset
    }));
  };
  var selectTicksOfAxis = createSelector([selectChartLayout, selectAxisSettings, selectRealScaleType, selectAxisScale, selectNiceTicks, selectAxisRange, selectDuplicateDomain, selectCategoricalDomain, pickAxisType], combineAxisTicks);
  var combineGraphicalItemTicks = (layout, axis, scale, axisRange, duplicateDomain, categoricalDomain, axisType) => {
    if (axis == null || scale == null || axisRange == null || axisRange[0] === axisRange[1]) {
      return void 0;
    }
    var isCategorical = isCategoricalAxis(layout, axisType);
    var {
      tickCount
    } = axis;
    var offset = 0;
    offset = axisType === "angleAxis" && (axisRange === null || axisRange === void 0 ? void 0 : axisRange.length) >= 2 ? mathSign(axisRange[0] - axisRange[1]) * 2 * offset : offset;
    if (isCategorical && categoricalDomain) {
      return categoricalDomain.map((entry, index) => ({
        coordinate: scale(entry) + offset,
        value: entry,
        index,
        offset
      }));
    }
    if (scale.ticks) {
      return scale.ticks(tickCount).map((entry) => ({
        coordinate: scale(entry) + offset,
        value: entry,
        offset
      }));
    }
    return scale.domain().map((entry, index) => ({
      coordinate: scale(entry) + offset,
      value: duplicateDomain ? duplicateDomain[entry] : entry,
      index,
      offset
    }));
  };
  var selectTicksOfGraphicalItem = createSelector([selectChartLayout, selectAxisSettings, selectAxisScale, selectAxisRange, selectDuplicateDomain, selectCategoricalDomain, pickAxisType], combineGraphicalItemTicks);
  var selectAxisWithScale = createSelector(selectBaseAxis, selectAxisScale, (axis, scale) => {
    if (axis == null || scale == null) {
      return void 0;
    }
    return _objectSpread9(_objectSpread9({}, axis), {}, {
      scale
    });
  });
  var selectZAxisScale = createSelector([selectBaseAxis, selectRealScaleType, selectAxisDomain, selectAxisRangeWithReverse], combineScaleFunction);
  var selectZAxisWithScale = createSelector((state, _axisType, axisId) => selectZAxisSettings(state, axisId), selectZAxisScale, (axis, scale) => {
    if (axis == null || scale == null) {
      return void 0;
    }
    return _objectSpread9(_objectSpread9({}, axis), {}, {
      scale
    });
  });
  var selectChartDirection = createSelector([selectChartLayout, selectAllXAxes, selectAllYAxes], (layout, allXAxes, allYAxes) => {
    switch (layout) {
      case "horizontal": {
        return allXAxes.some((axis) => axis.reversed) ? "right-to-left" : "left-to-right";
      }
      case "vertical": {
        return allYAxes.some((axis) => axis.reversed) ? "bottom-to-top" : "top-to-bottom";
      }
      // TODO: make this better. For now, right arrow triggers "forward", left arrow "back"
      // however, the tooltip moves an unintuitive direction because of how the indices are rendered
      case "centric":
      case "radial": {
        return "left-to-right";
      }
      default: {
        return void 0;
      }
    }
  });

  // client/node_modules/recharts/es6/state/selectors/selectTooltipEventType.js
  init_define_import_meta_env();
  var selectDefaultTooltipEventType = (state) => state.options.defaultTooltipEventType;
  var selectValidateTooltipEventTypes = (state) => state.options.validateTooltipEventTypes;
  function combineTooltipEventType(shared, defaultTooltipEventType, validateTooltipEventTypes) {
    if (shared == null) {
      return defaultTooltipEventType;
    }
    var eventType = shared ? "axis" : "item";
    if (validateTooltipEventTypes == null) {
      return defaultTooltipEventType;
    }
    return validateTooltipEventTypes.includes(eventType) ? eventType : defaultTooltipEventType;
  }
  function selectTooltipEventType(state, shared) {
    var defaultTooltipEventType = selectDefaultTooltipEventType(state);
    var validateTooltipEventTypes = selectValidateTooltipEventTypes(state);
    return combineTooltipEventType(shared, defaultTooltipEventType, validateTooltipEventTypes);
  }

  // client/node_modules/recharts/es6/state/selectors/combiners/combineActiveLabel.js
  init_define_import_meta_env();
  var combineActiveLabel = (tooltipTicks, activeIndex) => {
    var _tooltipTicks$n;
    var n = Number(activeIndex);
    if (isNan(n) || activeIndex == null) {
      return void 0;
    }
    return n >= 0 ? tooltipTicks === null || tooltipTicks === void 0 || (_tooltipTicks$n = tooltipTicks[n]) === null || _tooltipTicks$n === void 0 ? void 0 : _tooltipTicks$n.value : void 0;
  };

  // client/node_modules/recharts/es6/state/selectors/selectTooltipSettings.js
  init_define_import_meta_env();
  var selectTooltipSettings = (state) => state.tooltip.settings;

  // client/node_modules/recharts/es6/state/selectors/combiners/combineTooltipInteractionState.js
  init_define_import_meta_env();

  // client/node_modules/recharts/es6/state/tooltipSlice.js
  init_define_import_meta_env();
  var noInteraction = {
    active: false,
    index: null,
    dataKey: void 0,
    coordinate: void 0
  };
  var initialState3 = {
    itemInteraction: {
      click: noInteraction,
      hover: noInteraction
    },
    axisInteraction: {
      click: noInteraction,
      hover: noInteraction
    },
    keyboardInteraction: noInteraction,
    syncInteraction: {
      active: false,
      index: null,
      dataKey: void 0,
      label: void 0,
      coordinate: void 0
    },
    tooltipItemPayloads: [],
    settings: {
      shared: void 0,
      trigger: "hover",
      axisId: 0,
      active: false,
      defaultIndex: void 0
    }
  };
  var tooltipSlice = createSlice({
    name: "tooltip",
    initialState: initialState3,
    reducers: {
      addTooltipEntrySettings(state, action) {
        state.tooltipItemPayloads.push(castDraft(action.payload));
      },
      removeTooltipEntrySettings(state, action) {
        var index = current(state).tooltipItemPayloads.indexOf(castDraft(action.payload));
        if (index > -1) {
          state.tooltipItemPayloads.splice(index, 1);
        }
      },
      setTooltipSettingsState(state, action) {
        state.settings = action.payload;
      },
      setActiveMouseOverItemIndex(state, action) {
        state.syncInteraction.active = false;
        state.keyboardInteraction.active = false;
        state.itemInteraction.hover.active = true;
        state.itemInteraction.hover.index = action.payload.activeIndex;
        state.itemInteraction.hover.dataKey = action.payload.activeDataKey;
        state.itemInteraction.hover.coordinate = action.payload.activeCoordinate;
      },
      mouseLeaveChart(state) {
        state.itemInteraction.hover.active = false;
        state.axisInteraction.hover.active = false;
      },
      mouseLeaveItem(state) {
        state.itemInteraction.hover.active = false;
      },
      setActiveClickItemIndex(state, action) {
        state.syncInteraction.active = false;
        state.itemInteraction.click.active = true;
        state.keyboardInteraction.active = false;
        state.itemInteraction.click.index = action.payload.activeIndex;
        state.itemInteraction.click.dataKey = action.payload.activeDataKey;
        state.itemInteraction.click.coordinate = action.payload.activeCoordinate;
      },
      setMouseOverAxisIndex(state, action) {
        state.syncInteraction.active = false;
        state.axisInteraction.hover.active = true;
        state.keyboardInteraction.active = false;
        state.axisInteraction.hover.index = action.payload.activeIndex;
        state.axisInteraction.hover.dataKey = action.payload.activeDataKey;
        state.axisInteraction.hover.coordinate = action.payload.activeCoordinate;
      },
      setMouseClickAxisIndex(state, action) {
        state.syncInteraction.active = false;
        state.keyboardInteraction.active = false;
        state.axisInteraction.click.active = true;
        state.axisInteraction.click.index = action.payload.activeIndex;
        state.axisInteraction.click.dataKey = action.payload.activeDataKey;
        state.axisInteraction.click.coordinate = action.payload.activeCoordinate;
      },
      setSyncInteraction(state, action) {
        state.syncInteraction = action.payload;
      },
      setKeyboardInteraction(state, action) {
        state.keyboardInteraction.active = action.payload.active;
        state.keyboardInteraction.index = action.payload.activeIndex;
        state.keyboardInteraction.coordinate = action.payload.activeCoordinate;
        state.keyboardInteraction.dataKey = action.payload.activeDataKey;
      }
    }
  });
  var {
    addTooltipEntrySettings,
    removeTooltipEntrySettings,
    setTooltipSettingsState,
    setActiveMouseOverItemIndex,
    mouseLeaveItem,
    mouseLeaveChart,
    setActiveClickItemIndex,
    setMouseOverAxisIndex,
    setMouseClickAxisIndex,
    setSyncInteraction,
    setKeyboardInteraction
  } = tooltipSlice.actions;
  var tooltipReducer = tooltipSlice.reducer;

  // client/node_modules/recharts/es6/state/selectors/combiners/combineTooltipInteractionState.js
  function ownKeys10(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread10(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys10(Object(t), true).forEach(function(r3) {
        _defineProperty10(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys10(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  function _defineProperty10(e, r2, t) {
    return (r2 = _toPropertyKey10(r2)) in e ? Object.defineProperty(e, r2, { value: t, enumerable: true, configurable: true, writable: true }) : e[r2] = t, e;
  }
  function _toPropertyKey10(t) {
    var i = _toPrimitive10(t, "string");
    return "symbol" == typeof i ? i : i + "";
  }
  function _toPrimitive10(t, r2) {
    if ("object" != typeof t || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r2 || "default");
      if ("object" != typeof i) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r2 ? String : Number)(t);
  }
  function chooseAppropriateMouseInteraction(tooltipState, tooltipEventType, trigger) {
    if (tooltipEventType === "axis") {
      if (trigger === "click") {
        return tooltipState.axisInteraction.click;
      }
      return tooltipState.axisInteraction.hover;
    }
    if (trigger === "click") {
      return tooltipState.itemInteraction.click;
    }
    return tooltipState.itemInteraction.hover;
  }
  function hasBeenActivePreviously(tooltipInteractionState) {
    return tooltipInteractionState.index != null;
  }
  var combineTooltipInteractionState = (tooltipState, tooltipEventType, trigger, defaultIndex) => {
    if (tooltipEventType == null) {
      return noInteraction;
    }
    var appropriateMouseInteraction = chooseAppropriateMouseInteraction(tooltipState, tooltipEventType, trigger);
    if (appropriateMouseInteraction == null) {
      return noInteraction;
    }
    if (appropriateMouseInteraction.active) {
      return appropriateMouseInteraction;
    }
    if (tooltipState.keyboardInteraction.active) {
      return tooltipState.keyboardInteraction;
    }
    if (tooltipState.syncInteraction.active && tooltipState.syncInteraction.index != null) {
      return tooltipState.syncInteraction;
    }
    var activeFromProps = tooltipState.settings.active === true;
    if (hasBeenActivePreviously(appropriateMouseInteraction)) {
      if (activeFromProps) {
        return _objectSpread10(_objectSpread10({}, appropriateMouseInteraction), {}, {
          active: true
        });
      }
    } else if (defaultIndex != null) {
      return {
        active: true,
        coordinate: void 0,
        dataKey: void 0,
        index: defaultIndex
      };
    }
    return _objectSpread10(_objectSpread10({}, noInteraction), {}, {
      coordinate: appropriateMouseInteraction.coordinate
    });
  };

  // client/node_modules/recharts/es6/state/selectors/combiners/combineActiveTooltipIndex.js
  init_define_import_meta_env();
  var combineActiveTooltipIndex = (tooltipInteraction, chartData) => {
    var desiredIndex = tooltipInteraction === null || tooltipInteraction === void 0 ? void 0 : tooltipInteraction.index;
    if (desiredIndex == null) {
      return null;
    }
    var indexAsNumber = Number(desiredIndex);
    if (!isWellBehavedNumber(indexAsNumber)) {
      return desiredIndex;
    }
    var lowerLimit = 0;
    var upperLimit = Infinity;
    if (chartData.length > 0) {
      upperLimit = chartData.length - 1;
    }
    return String(Math.max(lowerLimit, Math.min(indexAsNumber, upperLimit)));
  };

  // client/node_modules/recharts/es6/state/selectors/combiners/combineCoordinateForDefaultIndex.js
  init_define_import_meta_env();
  var combineCoordinateForDefaultIndex = (width, height, layout, offset, tooltipTicks, defaultIndex, tooltipConfigurations, tooltipPayloadSearcher) => {
    if (defaultIndex == null || tooltipPayloadSearcher == null) {
      return void 0;
    }
    var firstConfiguration = tooltipConfigurations[0];
    var maybePosition = firstConfiguration == null ? void 0 : tooltipPayloadSearcher(firstConfiguration.positions, defaultIndex);
    if (maybePosition != null) {
      return maybePosition;
    }
    var tick = tooltipTicks === null || tooltipTicks === void 0 ? void 0 : tooltipTicks[Number(defaultIndex)];
    if (!tick) {
      return void 0;
    }
    switch (layout) {
      case "horizontal": {
        return {
          x: tick.coordinate,
          y: (offset.top + height) / 2
        };
      }
      default: {
        return {
          x: (offset.left + width) / 2,
          y: tick.coordinate
        };
      }
    }
  };

  // client/node_modules/recharts/es6/state/selectors/combiners/combineTooltipPayloadConfigurations.js
  init_define_import_meta_env();
  var combineTooltipPayloadConfigurations = (tooltipState, tooltipEventType, trigger, defaultIndex) => {
    if (tooltipEventType === "axis") {
      return tooltipState.tooltipItemPayloads;
    }
    if (tooltipState.tooltipItemPayloads.length === 0) {
      return [];
    }
    var filterByDataKey;
    if (trigger === "hover") {
      filterByDataKey = tooltipState.itemInteraction.hover.dataKey;
    } else {
      filterByDataKey = tooltipState.itemInteraction.click.dataKey;
    }
    if (filterByDataKey == null && defaultIndex != null) {
      return [tooltipState.tooltipItemPayloads[0]];
    }
    return tooltipState.tooltipItemPayloads.filter((tpc) => {
      var _tpc$settings;
      return ((_tpc$settings = tpc.settings) === null || _tpc$settings === void 0 ? void 0 : _tpc$settings.dataKey) === filterByDataKey;
    });
  };

  // client/node_modules/recharts/es6/state/selectors/selectTooltipPayloadSearcher.js
  init_define_import_meta_env();
  var selectTooltipPayloadSearcher = (state) => state.options.tooltipPayloadSearcher;

  // client/node_modules/recharts/es6/state/selectors/selectTooltipState.js
  init_define_import_meta_env();
  var selectTooltipState = (state) => state.tooltip;

  // client/node_modules/recharts/es6/state/selectors/tooltipSelectors.js
  var selectTooltipAxisType = (state) => {
    var layout = selectChartLayout(state);
    if (layout === "horizontal") {
      return "xAxis";
    }
    if (layout === "vertical") {
      return "yAxis";
    }
    if (layout === "centric") {
      return "angleAxis";
    }
    return "radiusAxis";
  };
  var selectTooltipAxisId = (state) => state.tooltip.settings.axisId;
  var selectTooltipAxis = (state) => {
    var axisType = selectTooltipAxisType(state);
    var axisId = selectTooltipAxisId(state);
    return selectAxisSettings(state, axisType, axisId);
  };
  var selectTooltipAxisRealScaleType = createSelector([selectTooltipAxis, selectChartLayout, selectHasBar, selectChartName, selectTooltipAxisType], combineRealScaleType);
  var selectAllUnfilteredGraphicalItems = createSelector([(state) => state.graphicalItems.cartesianItems, (state) => state.graphicalItems.polarItems], (cartesianItems, polarItems) => [...cartesianItems, ...polarItems]);
  var selectTooltipAxisPredicate = createSelector([selectTooltipAxisType, selectTooltipAxisId], itemAxisPredicate);
  var selectAllGraphicalItemsSettings = createSelector([selectAllUnfilteredGraphicalItems, selectTooltipAxis, selectTooltipAxisPredicate], combineGraphicalItemsSettings);
  var selectTooltipGraphicalItemsData = createSelector([selectAllGraphicalItemsSettings], combineGraphicalItemsData);
  var selectTooltipDisplayedData = createSelector([selectTooltipGraphicalItemsData, selectChartDataWithIndexes], combineDisplayedData);
  var selectAllTooltipAppliedValues = createSelector([selectTooltipDisplayedData, selectTooltipAxis, selectAllGraphicalItemsSettings], combineAppliedValues);
  var selectTooltipAxisDomainDefinition = createSelector([selectTooltipAxis], getDomainDefinition);
  var selectTooltipStackGroups = createSelector([selectTooltipDisplayedData, selectAllGraphicalItemsSettings, selectStackOffsetType], combineStackGroups);
  var selectTooltipDomainOfStackGroups = createSelector([selectTooltipStackGroups, selectChartDataWithIndexes, selectTooltipAxisType], combineDomainOfStackGroups);
  var selectTooltipItemsSettingsExceptStacked = createSelector([selectAllGraphicalItemsSettings], filterGraphicalNotStackedItems);
  var selectTooltipAllAppliedNumericalValuesIncludingErrorValues = createSelector([selectTooltipDisplayedData, selectTooltipAxis, selectTooltipItemsSettingsExceptStacked, selectTooltipAxisType], combineAppliedNumericalValuesIncludingErrorValues);
  var selectReferenceDotsByTooltipAxis = createSelector([selectReferenceDots, selectTooltipAxisType, selectTooltipAxisId], filterReferenceElements);
  var selectTooltipReferenceDotsDomain = createSelector([selectReferenceDotsByTooltipAxis, selectTooltipAxisType], combineDotsDomain);
  var selectReferenceAreasByTooltipAxis = createSelector([selectReferenceAreas, selectTooltipAxisType, selectTooltipAxisId], filterReferenceElements);
  var selectTooltipReferenceAreasDomain = createSelector([selectReferenceAreasByTooltipAxis, selectTooltipAxisType], combineAreasDomain);
  var selectReferenceLinesByTooltipAxis = createSelector([selectReferenceLines, selectTooltipAxisType, selectTooltipAxisId], filterReferenceElements);
  var selectTooltipReferenceLinesDomain = createSelector([selectReferenceLinesByTooltipAxis, selectTooltipAxisType], combineLinesDomain);
  var selectTooltipReferenceElementsDomain = createSelector([selectTooltipReferenceDotsDomain, selectTooltipReferenceLinesDomain, selectTooltipReferenceAreasDomain], mergeDomains);
  var selectTooltipNumericalDomain = createSelector([selectTooltipAxis, selectTooltipAxisDomainDefinition, selectTooltipDomainOfStackGroups, selectTooltipAllAppliedNumericalValuesIncludingErrorValues, selectTooltipReferenceElementsDomain], combineNumericalDomain);
  var selectTooltipAxisDomain = createSelector([selectTooltipAxis, selectChartLayout, selectTooltipDisplayedData, selectAllTooltipAppliedValues, selectStackOffsetType, selectTooltipAxisType, selectTooltipNumericalDomain], combineAxisDomain);
  var selectTooltipNiceTicks = createSelector([selectTooltipAxisDomain, selectTooltipAxis, selectTooltipAxisRealScaleType], combineNiceTicks);
  var selectTooltipAxisDomainIncludingNiceTicks = createSelector([selectTooltipAxis, selectTooltipAxisDomain, selectTooltipNiceTicks, selectTooltipAxisType], combineAxisDomainWithNiceTicks);
  var selectTooltipAxisRange = (state) => {
    var axisType = selectTooltipAxisType(state);
    var axisId = selectTooltipAxisId(state);
    var isPanorama = false;
    return selectAxisRange(state, axisType, axisId, isPanorama);
  };
  var selectTooltipAxisRangeWithReverse = createSelector([selectTooltipAxis, selectTooltipAxisRange], combineAxisRangeWithReverse);
  var selectTooltipAxisScale = createSelector([selectTooltipAxis, selectTooltipAxisRealScaleType, selectTooltipAxisDomainIncludingNiceTicks, selectTooltipAxisRangeWithReverse], combineScaleFunction);
  var selectTooltipDuplicateDomain = createSelector([selectChartLayout, selectAllTooltipAppliedValues, selectTooltipAxis, selectTooltipAxisType], combineDuplicateDomain);
  var selectTooltipCategoricalDomain = createSelector([selectChartLayout, selectAllTooltipAppliedValues, selectTooltipAxis, selectTooltipAxisType], combineCategoricalDomain);
  var combineTicksOfTooltipAxis = (layout, axis, realScaleType, scale, range4, duplicateDomain, categoricalDomain, axisType) => {
    if (!axis) {
      return void 0;
    }
    var {
      type
    } = axis;
    var isCategorical = isCategoricalAxis(layout, axisType);
    if (!scale) {
      return void 0;
    }
    var offsetForBand = realScaleType === "scaleBand" && scale.bandwidth ? scale.bandwidth() / 2 : 2;
    var offset = type === "category" && scale.bandwidth ? scale.bandwidth() / offsetForBand : 0;
    offset = axisType === "angleAxis" && range4 != null && (range4 === null || range4 === void 0 ? void 0 : range4.length) >= 2 ? mathSign(range4[0] - range4[1]) * 2 * offset : offset;
    if (isCategorical && categoricalDomain) {
      return categoricalDomain.map((entry, index) => ({
        coordinate: scale(entry) + offset,
        value: entry,
        index,
        offset
      }));
    }
    return scale.domain().map((entry, index) => ({
      coordinate: scale(entry) + offset,
      value: duplicateDomain ? duplicateDomain[entry] : entry,
      index,
      offset
    }));
  };
  var selectTooltipAxisTicks = createSelector([selectChartLayout, selectTooltipAxis, selectTooltipAxisRealScaleType, selectTooltipAxisScale, selectTooltipAxisRange, selectTooltipDuplicateDomain, selectTooltipCategoricalDomain, selectTooltipAxisType], combineTicksOfTooltipAxis);
  var selectTooltipEventType2 = createSelector([selectDefaultTooltipEventType, selectValidateTooltipEventTypes, selectTooltipSettings], (defaultTooltipEventType, validateTooltipEventType, settings) => combineTooltipEventType(settings.shared, defaultTooltipEventType, validateTooltipEventType));
  var selectTooltipTrigger = (state) => state.tooltip.settings.trigger;
  var selectDefaultIndex = (state) => state.tooltip.settings.defaultIndex;
  var selectTooltipInteractionState = createSelector([selectTooltipState, selectTooltipEventType2, selectTooltipTrigger, selectDefaultIndex], combineTooltipInteractionState);
  var selectActiveTooltipIndex = createSelector([selectTooltipInteractionState, selectTooltipDisplayedData], combineActiveTooltipIndex);
  var selectActiveLabel = createSelector([selectTooltipAxisTicks, selectActiveTooltipIndex], combineActiveLabel);
  var selectActiveTooltipDataKey = createSelector([selectTooltipInteractionState], (tooltipInteraction) => {
    if (!tooltipInteraction) {
      return void 0;
    }
    return tooltipInteraction.dataKey;
  });
  var selectTooltipPayloadConfigurations = createSelector([selectTooltipState, selectTooltipEventType2, selectTooltipTrigger, selectDefaultIndex], combineTooltipPayloadConfigurations);
  var selectTooltipCoordinateForDefaultIndex = createSelector([selectChartWidth, selectChartHeight, selectChartLayout, selectChartOffset, selectTooltipAxisTicks, selectDefaultIndex, selectTooltipPayloadConfigurations, selectTooltipPayloadSearcher], combineCoordinateForDefaultIndex);
  var selectActiveTooltipCoordinate = createSelector([selectTooltipInteractionState, selectTooltipCoordinateForDefaultIndex], (tooltipInteractionState, defaultIndexCoordinate) => {
    if (tooltipInteractionState !== null && tooltipInteractionState !== void 0 && tooltipInteractionState.coordinate) {
      return tooltipInteractionState.coordinate;
    }
    return defaultIndexCoordinate;
  });
  var selectIsTooltipActive = createSelector([selectTooltipInteractionState], (tooltipInteractionState) => tooltipInteractionState.active);

  // client/node_modules/recharts/es6/context/useTooltipAxis.js
  var useTooltipAxis = () => useAppSelector(selectTooltipAxis);

  // client/node_modules/recharts/es6/state/selectors/selectors.js
  init_define_import_meta_env();
  var import_sortBy2 = __toESM(require_sortBy2());
  function ownKeys11(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread11(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys11(Object(t), true).forEach(function(r3) {
        _defineProperty11(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys11(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  function _defineProperty11(e, r2, t) {
    return (r2 = _toPropertyKey11(r2)) in e ? Object.defineProperty(e, r2, { value: t, enumerable: true, configurable: true, writable: true }) : e[r2] = t, e;
  }
  function _toPropertyKey11(t) {
    var i = _toPrimitive11(t, "string");
    return "symbol" == typeof i ? i : i + "";
  }
  function _toPrimitive11(t, r2) {
    if ("object" != typeof t || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r2 || "default");
      if ("object" != typeof i) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r2 ? String : Number)(t);
  }
  var pickTooltipEventType = (_state, tooltipEventType) => tooltipEventType;
  var pickTrigger = (_state, _tooltipEventType, trigger) => trigger;
  var pickDefaultIndex = (_state, _tooltipEventType, _trigger, defaultIndex) => defaultIndex;
  function getSliced(arr, startIndex, endIndex) {
    if (!Array.isArray(arr)) {
      return arr;
    }
    if (arr && startIndex + endIndex !== 0) {
      return arr.slice(startIndex, endIndex + 1);
    }
    return arr;
  }
  var selectOrderedTooltipTicks = createSelector(selectTooltipAxisTicks, (ticks2) => (0, import_sortBy2.default)(ticks2, (o) => o.coordinate));
  var selectTooltipInteractionState2 = createSelector([selectTooltipState, pickTooltipEventType, pickTrigger, pickDefaultIndex], combineTooltipInteractionState);
  var selectActiveIndex = createSelector([selectTooltipInteractionState2, selectTooltipDisplayedData], combineActiveTooltipIndex);
  var selectTooltipPayloadConfigurations2 = createSelector([selectTooltipState, pickTooltipEventType, pickTrigger, pickDefaultIndex], combineTooltipPayloadConfigurations);
  var selectCoordinateForDefaultIndex = createSelector([selectChartWidth, selectChartHeight, selectChartLayout, selectChartOffset, selectTooltipAxisTicks, pickDefaultIndex, selectTooltipPayloadConfigurations2, selectTooltipPayloadSearcher], combineCoordinateForDefaultIndex);
  var selectActiveCoordinate = createSelector([selectTooltipInteractionState2, selectCoordinateForDefaultIndex], (tooltipInteractionState, defaultIndexCoordinate) => {
    var _tooltipInteractionSt;
    return (_tooltipInteractionSt = tooltipInteractionState.coordinate) !== null && _tooltipInteractionSt !== void 0 ? _tooltipInteractionSt : defaultIndexCoordinate;
  });
  var selectActiveLabel2 = createSelector(selectTooltipAxisTicks, selectActiveIndex, combineActiveLabel);
  function selectFinalData(dataDefinedOnItem, dataDefinedOnChart) {
    if (dataDefinedOnItem != null) {
      return dataDefinedOnItem;
    }
    return dataDefinedOnChart;
  }
  var combineTooltipPayload = (tooltipPayloadConfigurations, activeIndex, chartDataState, tooltipAxis, activeLabel, tooltipPayloadSearcher, tooltipEventType) => {
    if (activeIndex == null || tooltipPayloadSearcher == null) {
      return void 0;
    }
    var {
      chartData,
      computedData,
      dataStartIndex,
      dataEndIndex
    } = chartDataState;
    var init = [];
    return tooltipPayloadConfigurations.reduce((agg, _ref) => {
      var _settings$dataKey;
      var {
        dataDefinedOnItem,
        settings
      } = _ref;
      var finalData = selectFinalData(dataDefinedOnItem, chartData);
      var sliced = getSliced(finalData, dataStartIndex, dataEndIndex);
      var finalDataKey = (_settings$dataKey = settings === null || settings === void 0 ? void 0 : settings.dataKey) !== null && _settings$dataKey !== void 0 ? _settings$dataKey : tooltipAxis === null || tooltipAxis === void 0 ? void 0 : tooltipAxis.dataKey;
      var finalNameKey = settings === null || settings === void 0 ? void 0 : settings.nameKey;
      var tooltipPayload;
      if (tooltipAxis !== null && tooltipAxis !== void 0 && tooltipAxis.dataKey && !(tooltipAxis !== null && tooltipAxis !== void 0 && tooltipAxis.allowDuplicatedCategory) && Array.isArray(sliced) && /*
       * If the tooltipEventType is 'axis', we should search for the dataKey in the sliced data
       * because thanks to allowDuplicatedCategory=false, the order of elements in the array
       * no longer matches the order of elements in the original data
       * and so we need to search by the active dataKey + label rather than by index.
       *
       * On the other hand the tooltipEventType 'item' should always search by index
       * because we get the index from interacting over the individual elements
       * which is always accurate, irrespective of the allowDuplicatedCategory setting.
       */
      tooltipEventType === "axis") {
        tooltipPayload = findEntryInArray(sliced, tooltipAxis.dataKey, activeLabel);
      } else {
        tooltipPayload = tooltipPayloadSearcher(sliced, activeIndex, computedData, finalNameKey);
      }
      if (Array.isArray(tooltipPayload)) {
        tooltipPayload.forEach((item) => {
          var newSettings = _objectSpread11(_objectSpread11({}, settings), {}, {
            name: item.name,
            unit: item.unit,
            // color and fill are erased to keep 100% the identical behaviour to recharts 2.x - but there's nothing stopping us from returning them here. It's technically a breaking change.
            color: void 0,
            // color and fill are erased to keep 100% the identical behaviour to recharts 2.x - but there's nothing stopping us from returning them here. It's technically a breaking change.
            fill: void 0
          });
          agg.push(getTooltipEntry({
            tooltipEntrySettings: newSettings,
            dataKey: item.dataKey,
            payload: item.payload,
            // @ts-expect-error getValueByDataKey does not validate the output type
            value: getValueByDataKey(item.payload, item.dataKey),
            name: item.name
          }));
        });
      } else {
        var _getValueByDataKey;
        agg.push(getTooltipEntry({
          tooltipEntrySettings: settings,
          dataKey: finalDataKey,
          payload: tooltipPayload,
          // @ts-expect-error getValueByDataKey does not validate the output type
          value: getValueByDataKey(tooltipPayload, finalDataKey),
          // @ts-expect-error getValueByDataKey does not validate the output type
          name: (_getValueByDataKey = getValueByDataKey(tooltipPayload, finalNameKey)) !== null && _getValueByDataKey !== void 0 ? _getValueByDataKey : settings === null || settings === void 0 ? void 0 : settings.name
        }));
      }
      return agg;
    }, init);
  };
  var selectTooltipPayload = createSelector([selectTooltipPayloadConfigurations2, selectActiveIndex, selectChartDataWithIndexes, selectTooltipAxis, selectActiveLabel2, selectTooltipPayloadSearcher, pickTooltipEventType], combineTooltipPayload);
  var selectIsTooltipActive2 = createSelector([selectTooltipInteractionState2], (tooltipInteractionState) => {
    return {
      isActive: tooltipInteractionState.active,
      activeIndex: tooltipInteractionState.index
    };
  });
  var combineActiveProps = (chartEvent, layout, polarViewBox, tooltipAxisType, tooltipAxisRange, tooltipTicks, orderedTooltipTicks, offset) => {
    if (!chartEvent || !layout || !tooltipAxisType || !tooltipAxisRange || !tooltipTicks) {
      return void 0;
    }
    var rangeObj = inRange(chartEvent.chartX, chartEvent.chartY, layout, polarViewBox, offset);
    if (!rangeObj) {
      return void 0;
    }
    var pos = calculateTooltipPos(rangeObj, layout);
    var activeIndex = calculateActiveTickIndex(pos, orderedTooltipTicks, tooltipTicks, tooltipAxisType, tooltipAxisRange);
    var activeCoordinate = getActiveCoordinate(layout, tooltipTicks, activeIndex, rangeObj);
    return {
      activeIndex: String(activeIndex),
      activeCoordinate
    };
  };

  // client/node_modules/recharts/es6/context/tooltipPortalContext.js
  init_define_import_meta_env();
  var import_react12 = __toESM(require_react_shim());
  var TooltipPortalContext = /* @__PURE__ */ (0, import_react12.createContext)(null);

  // client/node_modules/recharts/es6/synchronisation/useChartSynchronisation.js
  init_define_import_meta_env();
  var import_react13 = __toESM(require_react_shim());

  // client/node_modules/recharts/es6/util/Events.js
  init_define_import_meta_env();

  // client/node_modules/eventemitter3/index.mjs
  init_define_import_meta_env();
  var import_index = __toESM(require_eventemitter3(), 1);
  var eventemitter3_default = import_index.default;

  // client/node_modules/recharts/es6/util/Events.js
  var eventCenter = new eventemitter3_default();
  var TOOLTIP_SYNC_EVENT = "recharts.syncEvent.tooltip";
  var BRUSH_SYNC_EVENT = "recharts.syncEvent.brush";

  // client/node_modules/recharts/es6/state/optionsSlice.js
  init_define_import_meta_env();
  function arrayTooltipSearcher(data, strIndex) {
    if (!strIndex) return void 0;
    var numIndex = Number.parseInt(strIndex, 10);
    if (isNan(numIndex)) {
      return void 0;
    }
    return data === null || data === void 0 ? void 0 : data[numIndex];
  }
  var initialState4 = {
    chartName: "",
    tooltipPayloadSearcher: void 0,
    eventEmitter: void 0,
    defaultTooltipEventType: "axis"
  };
  var optionsSlice = createSlice({
    name: "options",
    initialState: initialState4,
    reducers: {
      createEventEmitter: (state) => {
        if (state.eventEmitter == null) {
          state.eventEmitter = /* @__PURE__ */ Symbol("rechartsEventEmitter");
        }
      }
    }
  });
  var optionsReducer = optionsSlice.reducer;
  var {
    createEventEmitter
  } = optionsSlice.actions;

  // client/node_modules/recharts/es6/state/chartDataSlice.js
  init_define_import_meta_env();
  var initialChartDataState = {
    chartData: void 0,
    computedData: void 0,
    dataStartIndex: 0,
    dataEndIndex: 0
  };
  var chartDataSlice = createSlice({
    name: "chartData",
    initialState: initialChartDataState,
    reducers: {
      setChartData(state, action) {
        state.chartData = action.payload;
        if (action.payload == null) {
          state.dataStartIndex = 0;
          state.dataEndIndex = 0;
          return;
        }
        if (action.payload.length > 0 && state.dataEndIndex !== action.payload.length - 1) {
          state.dataEndIndex = action.payload.length - 1;
        }
      },
      setComputedData(state, action) {
        state.computedData = action.payload;
      },
      setDataStartEndIndexes(state, action) {
        var {
          startIndex,
          endIndex
        } = action.payload;
        if (startIndex != null) {
          state.dataStartIndex = startIndex;
        }
        if (endIndex != null) {
          state.dataEndIndex = endIndex;
        }
      }
    }
  });
  var {
    setChartData,
    setDataStartEndIndexes,
    setComputedData
  } = chartDataSlice.actions;
  var chartDataReducer = chartDataSlice.reducer;

  // client/node_modules/recharts/es6/synchronisation/useChartSynchronisation.js
  var noop3 = () => {
  };
  function useTooltipSyncEventsListener() {
    var mySyncId = useAppSelector(selectSyncId);
    var myEventEmitter = useAppSelector(selectEventEmitter);
    var dispatch = useAppDispatch();
    var syncMethod = useAppSelector(selectSyncMethod);
    var tooltipTicks = useAppSelector(selectTooltipAxisTicks);
    var layout = useChartLayout();
    var viewBox = useViewBox();
    var className8 = useAppSelector((state) => state.rootProps.className);
    (0, import_react13.useEffect)(() => {
      if (mySyncId == null) {
        return noop3;
      }
      var listener2 = (incomingSyncId, action, emitter) => {
        if (myEventEmitter === emitter) {
          return;
        }
        if (mySyncId !== incomingSyncId) {
          return;
        }
        if (syncMethod === "index") {
          dispatch(action);
          return;
        }
        if (tooltipTicks == null) {
          return;
        }
        var activeTick;
        if (typeof syncMethod === "function") {
          var syncMethodParam = {
            activeTooltipIndex: action.payload.index == null ? void 0 : Number(action.payload.index),
            isTooltipActive: action.payload.active,
            activeIndex: action.payload.index == null ? void 0 : Number(action.payload.index),
            activeLabel: action.payload.label,
            activeDataKey: action.payload.dataKey,
            activeCoordinate: action.payload.coordinate
          };
          var activeTooltipIndex = syncMethod(tooltipTicks, syncMethodParam);
          activeTick = tooltipTicks[activeTooltipIndex];
        } else if (syncMethod === "value") {
          activeTick = tooltipTicks.find((tick) => String(tick.value) === action.payload.label);
        }
        var {
          coordinate
        } = action.payload;
        if (activeTick == null || action.payload.active === false || coordinate == null || viewBox == null) {
          dispatch(setSyncInteraction({
            active: false,
            coordinate: void 0,
            dataKey: void 0,
            index: null,
            label: void 0
          }));
          return;
        }
        var {
          x: x2,
          y: y2
        } = coordinate;
        var validateChartX = Math.min(x2, viewBox.x + viewBox.width);
        var validateChartY = Math.min(y2, viewBox.y + viewBox.height);
        var activeCoordinate = {
          x: layout === "horizontal" ? activeTick.coordinate : validateChartX,
          y: layout === "horizontal" ? validateChartY : activeTick.coordinate
        };
        var syncAction = setSyncInteraction({
          active: action.payload.active,
          coordinate: activeCoordinate,
          dataKey: action.payload.dataKey,
          index: String(activeTick.index),
          label: action.payload.label
        });
        dispatch(syncAction);
      };
      eventCenter.on(TOOLTIP_SYNC_EVENT, listener2);
      return () => {
        eventCenter.off(TOOLTIP_SYNC_EVENT, listener2);
      };
    }, [className8, dispatch, myEventEmitter, mySyncId, syncMethod, tooltipTicks, layout, viewBox]);
  }
  function useBrushSyncEventsListener() {
    var mySyncId = useAppSelector(selectSyncId);
    var myEventEmitter = useAppSelector(selectEventEmitter);
    var dispatch = useAppDispatch();
    (0, import_react13.useEffect)(() => {
      if (mySyncId == null) {
        return noop3;
      }
      var listener2 = (incomingSyncId, action, emitter) => {
        if (myEventEmitter === emitter) {
          return;
        }
        if (mySyncId === incomingSyncId) {
          dispatch(setDataStartEndIndexes(action));
        }
      };
      eventCenter.on(BRUSH_SYNC_EVENT, listener2);
      return () => {
        eventCenter.off(BRUSH_SYNC_EVENT, listener2);
      };
    }, [dispatch, myEventEmitter, mySyncId]);
  }
  function useSynchronisedEventsFromOtherCharts() {
    var dispatch = useAppDispatch();
    (0, import_react13.useEffect)(() => {
      dispatch(createEventEmitter());
    }, [dispatch]);
    useTooltipSyncEventsListener();
    useBrushSyncEventsListener();
  }

  // client/node_modules/recharts/es6/component/ResponsiveContainer.js
  init_define_import_meta_env();
  var React7 = __toESM(require_react_shim());
  var import_react14 = __toESM(require_react_shim());
  var import_throttle = __toESM(require_throttle2());

  // client/node_modules/recharts/es6/util/LogUtils.js
  init_define_import_meta_env();
  var isDev = true;
  var warn = function warn2(condition, format2) {
    for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      args[_key - 2] = arguments[_key];
    }
    if (isDev && typeof console !== "undefined" && console.warn) {
      if (format2 === void 0) {
        console.warn("LogUtils requires an error message argument");
      }
      if (!condition) {
        if (format2 === void 0) {
          console.warn("Minified exception occurred; use the non-minified dev environment for the full error message and additional helpful warnings.");
        } else {
          var argIndex = 0;
          console.warn(format2.replace(/%s/g, () => args[argIndex++]));
        }
      }
    }
  };

  // client/node_modules/recharts/es6/component/ResponsiveContainer.js
  function ownKeys12(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread12(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys12(Object(t), true).forEach(function(r3) {
        _defineProperty12(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys12(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  function _defineProperty12(e, r2, t) {
    return (r2 = _toPropertyKey12(r2)) in e ? Object.defineProperty(e, r2, { value: t, enumerable: true, configurable: true, writable: true }) : e[r2] = t, e;
  }
  function _toPropertyKey12(t) {
    var i = _toPrimitive12(t, "string");
    return "symbol" == typeof i ? i : i + "";
  }
  function _toPrimitive12(t, r2) {
    if ("object" != typeof t || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r2 || "default");
      if ("object" != typeof i) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r2 ? String : Number)(t);
  }
  var ResponsiveContainer = /* @__PURE__ */ (0, import_react14.forwardRef)((_ref, ref) => {
    var {
      aspect,
      initialDimension = {
        width: -1,
        height: -1
      },
      width = "100%",
      height = "100%",
      /*
       * default min-width to 0 if not specified - 'auto' causes issues with flexbox
       * https://github.com/recharts/recharts/issues/172
       */
      minWidth = 0,
      minHeight,
      maxHeight,
      children,
      debounce = 0,
      id,
      className: className8,
      onResize,
      style = {}
    } = _ref;
    var containerRef = (0, import_react14.useRef)(null);
    var onResizeRef = (0, import_react14.useRef)();
    onResizeRef.current = onResize;
    (0, import_react14.useImperativeHandle)(ref, () => containerRef.current);
    var [sizes, setSizes] = (0, import_react14.useState)({
      containerWidth: initialDimension.width,
      containerHeight: initialDimension.height
    });
    var setContainerSize = (0, import_react14.useCallback)((newWidth, newHeight) => {
      setSizes((prevState) => {
        var roundedWidth = Math.round(newWidth);
        var roundedHeight = Math.round(newHeight);
        if (prevState.containerWidth === roundedWidth && prevState.containerHeight === roundedHeight) {
          return prevState;
        }
        return {
          containerWidth: roundedWidth,
          containerHeight: roundedHeight
        };
      });
    }, []);
    (0, import_react14.useEffect)(() => {
      var callback = (entries) => {
        var _onResizeRef$current;
        var {
          width: containerWidth2,
          height: containerHeight2
        } = entries[0].contentRect;
        setContainerSize(containerWidth2, containerHeight2);
        (_onResizeRef$current = onResizeRef.current) === null || _onResizeRef$current === void 0 || _onResizeRef$current.call(onResizeRef, containerWidth2, containerHeight2);
      };
      if (debounce > 0) {
        callback = (0, import_throttle.default)(callback, debounce, {
          trailing: true,
          leading: false
        });
      }
      var observer = new ResizeObserver(callback);
      var {
        width: containerWidth,
        height: containerHeight
      } = containerRef.current.getBoundingClientRect();
      setContainerSize(containerWidth, containerHeight);
      observer.observe(containerRef.current);
      return () => {
        observer.disconnect();
      };
    }, [setContainerSize, debounce]);
    var chartContent = (0, import_react14.useMemo)(() => {
      var {
        containerWidth,
        containerHeight
      } = sizes;
      if (containerWidth < 0 || containerHeight < 0) {
        return null;
      }
      warn(isPercent(width) || isPercent(height), "The width(%s) and height(%s) are both fixed numbers,\n       maybe you don't need to use a ResponsiveContainer.", width, height);
      warn(!aspect || aspect > 0, "The aspect(%s) must be greater than zero.", aspect);
      var calculatedWidth = isPercent(width) ? containerWidth : width;
      var calculatedHeight = isPercent(height) ? containerHeight : height;
      if (aspect && aspect > 0) {
        if (calculatedWidth) {
          calculatedHeight = calculatedWidth / aspect;
        } else if (calculatedHeight) {
          calculatedWidth = calculatedHeight * aspect;
        }
        if (maxHeight && calculatedHeight > maxHeight) {
          calculatedHeight = maxHeight;
        }
      }
      warn(calculatedWidth > 0 || calculatedHeight > 0, "The width(%s) and height(%s) of chart should be greater than 0,\n       please check the style of container, or the props width(%s) and height(%s),\n       or add a minWidth(%s) or minHeight(%s) or use aspect(%s) to control the\n       height and width.", calculatedWidth, calculatedHeight, width, height, minWidth, minHeight, aspect);
      return React7.Children.map(children, (child) => {
        return /* @__PURE__ */ (0, import_react14.cloneElement)(child, {
          width: calculatedWidth,
          height: calculatedHeight,
          // calculate the actual size and override it.
          style: _objectSpread12({
            height: "100%",
            width: "100%",
            maxHeight: calculatedHeight,
            maxWidth: calculatedWidth
          }, child.props.style)
        });
      });
    }, [aspect, children, height, maxHeight, minHeight, minWidth, sizes, width]);
    return /* @__PURE__ */ React7.createElement("div", {
      id: id ? "".concat(id) : void 0,
      className: clsx("recharts-responsive-container", className8),
      style: _objectSpread12(_objectSpread12({}, style), {}, {
        width,
        height,
        minWidth,
        minHeight,
        maxHeight
      }),
      ref: containerRef
    }, chartContent);
  });

  // client/node_modules/recharts/es6/component/Text.js
  init_define_import_meta_env();
  var React8 = __toESM(require_react_shim());
  var import_react15 = __toESM(require_react_shim());

  // client/node_modules/recharts/es6/util/DOMUtils.js
  init_define_import_meta_env();
  function ownKeys13(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread13(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys13(Object(t), true).forEach(function(r3) {
        _defineProperty13(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys13(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  function _defineProperty13(e, r2, t) {
    return (r2 = _toPropertyKey13(r2)) in e ? Object.defineProperty(e, r2, { value: t, enumerable: true, configurable: true, writable: true }) : e[r2] = t, e;
  }
  function _toPropertyKey13(t) {
    var i = _toPrimitive13(t, "string");
    return "symbol" == typeof i ? i : i + "";
  }
  function _toPrimitive13(t, r2) {
    if ("object" != typeof t || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r2 || "default");
      if ("object" != typeof i) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r2 ? String : Number)(t);
  }
  var stringCache = {
    widthCache: {},
    cacheCount: 0
  };
  var MAX_CACHE_NUM = 2e3;
  var SPAN_STYLE = {
    position: "absolute",
    top: "-20000px",
    left: 0,
    padding: 0,
    margin: 0,
    border: "none",
    whiteSpace: "pre"
  };
  var MEASUREMENT_SPAN_ID = "recharts_measurement_span";
  function removeInvalidKeys(obj) {
    var copyObj = _objectSpread13({}, obj);
    Object.keys(copyObj).forEach((key) => {
      if (!copyObj[key]) {
        delete copyObj[key];
      }
    });
    return copyObj;
  }
  var getStringSize = function getStringSize2(text) {
    var style = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (text === void 0 || text === null || Global.isSsr) {
      return {
        width: 0,
        height: 0
      };
    }
    var copyStyle = removeInvalidKeys(style);
    var cacheKey = JSON.stringify({
      text,
      copyStyle
    });
    if (stringCache.widthCache[cacheKey]) {
      return stringCache.widthCache[cacheKey];
    }
    try {
      var measurementSpan = document.getElementById(MEASUREMENT_SPAN_ID);
      if (!measurementSpan) {
        measurementSpan = document.createElement("span");
        measurementSpan.setAttribute("id", MEASUREMENT_SPAN_ID);
        measurementSpan.setAttribute("aria-hidden", "true");
        document.body.appendChild(measurementSpan);
      }
      var measurementSpanStyle = _objectSpread13(_objectSpread13({}, SPAN_STYLE), copyStyle);
      Object.assign(measurementSpan.style, measurementSpanStyle);
      measurementSpan.textContent = "".concat(text);
      var rect = measurementSpan.getBoundingClientRect();
      var result = {
        width: rect.width,
        height: rect.height
      };
      stringCache.widthCache[cacheKey] = result;
      if (++stringCache.cacheCount > MAX_CACHE_NUM) {
        stringCache.cacheCount = 0;
        stringCache.widthCache = {};
      }
      return result;
    } catch (_unused) {
      return {
        width: 0,
        height: 0
      };
    }
  };

  // client/node_modules/recharts/es6/util/ReduceCSSCalc.js
  init_define_import_meta_env();
  var MULTIPLY_OR_DIVIDE_REGEX = /(-?\d+(?:\.\d+)?[a-zA-Z%]*)([*/])(-?\d+(?:\.\d+)?[a-zA-Z%]*)/;
  var ADD_OR_SUBTRACT_REGEX = /(-?\d+(?:\.\d+)?[a-zA-Z%]*)([+-])(-?\d+(?:\.\d+)?[a-zA-Z%]*)/;
  var CSS_LENGTH_UNIT_REGEX = /^px|cm|vh|vw|em|rem|%|mm|in|pt|pc|ex|ch|vmin|vmax|Q$/;
  var NUM_SPLIT_REGEX = /(-?\d+(?:\.\d+)?)([a-zA-Z%]+)?/;
  var CONVERSION_RATES = {
    cm: 96 / 2.54,
    mm: 96 / 25.4,
    pt: 96 / 72,
    pc: 96 / 6,
    in: 96,
    Q: 96 / (2.54 * 40),
    px: 1
  };
  var FIXED_CSS_LENGTH_UNITS = Object.keys(CONVERSION_RATES);
  var STR_NAN = "NaN";
  function convertToPx(value, unit2) {
    return value * CONVERSION_RATES[unit2];
  }
  var DecimalCSS = class _DecimalCSS {
    static parse(str) {
      var _NUM_SPLIT_REGEX$exec;
      var [, numStr, unit2] = (_NUM_SPLIT_REGEX$exec = NUM_SPLIT_REGEX.exec(str)) !== null && _NUM_SPLIT_REGEX$exec !== void 0 ? _NUM_SPLIT_REGEX$exec : [];
      return new _DecimalCSS(parseFloat(numStr), unit2 !== null && unit2 !== void 0 ? unit2 : "");
    }
    constructor(num, unit2) {
      this.num = num;
      this.unit = unit2;
      this.num = num;
      this.unit = unit2;
      if (isNan(num)) {
        this.unit = "";
      }
      if (unit2 !== "" && !CSS_LENGTH_UNIT_REGEX.test(unit2)) {
        this.num = NaN;
        this.unit = "";
      }
      if (FIXED_CSS_LENGTH_UNITS.includes(unit2)) {
        this.num = convertToPx(num, unit2);
        this.unit = "px";
      }
    }
    add(other) {
      if (this.unit !== other.unit) {
        return new _DecimalCSS(NaN, "");
      }
      return new _DecimalCSS(this.num + other.num, this.unit);
    }
    subtract(other) {
      if (this.unit !== other.unit) {
        return new _DecimalCSS(NaN, "");
      }
      return new _DecimalCSS(this.num - other.num, this.unit);
    }
    multiply(other) {
      if (this.unit !== "" && other.unit !== "" && this.unit !== other.unit) {
        return new _DecimalCSS(NaN, "");
      }
      return new _DecimalCSS(this.num * other.num, this.unit || other.unit);
    }
    divide(other) {
      if (this.unit !== "" && other.unit !== "" && this.unit !== other.unit) {
        return new _DecimalCSS(NaN, "");
      }
      return new _DecimalCSS(this.num / other.num, this.unit || other.unit);
    }
    toString() {
      return "".concat(this.num).concat(this.unit);
    }
    isNaN() {
      return isNan(this.num);
    }
  };
  function calculateArithmetic(expr) {
    if (expr.includes(STR_NAN)) {
      return STR_NAN;
    }
    var newExpr = expr;
    while (newExpr.includes("*") || newExpr.includes("/")) {
      var _MULTIPLY_OR_DIVIDE_R;
      var [, leftOperand, operator, rightOperand] = (_MULTIPLY_OR_DIVIDE_R = MULTIPLY_OR_DIVIDE_REGEX.exec(newExpr)) !== null && _MULTIPLY_OR_DIVIDE_R !== void 0 ? _MULTIPLY_OR_DIVIDE_R : [];
      var lTs = DecimalCSS.parse(leftOperand !== null && leftOperand !== void 0 ? leftOperand : "");
      var rTs = DecimalCSS.parse(rightOperand !== null && rightOperand !== void 0 ? rightOperand : "");
      var result = operator === "*" ? lTs.multiply(rTs) : lTs.divide(rTs);
      if (result.isNaN()) {
        return STR_NAN;
      }
      newExpr = newExpr.replace(MULTIPLY_OR_DIVIDE_REGEX, result.toString());
    }
    while (newExpr.includes("+") || /.-\d+(?:\.\d+)?/.test(newExpr)) {
      var _ADD_OR_SUBTRACT_REGE;
      var [, _leftOperand, _operator, _rightOperand] = (_ADD_OR_SUBTRACT_REGE = ADD_OR_SUBTRACT_REGEX.exec(newExpr)) !== null && _ADD_OR_SUBTRACT_REGE !== void 0 ? _ADD_OR_SUBTRACT_REGE : [];
      var _lTs = DecimalCSS.parse(_leftOperand !== null && _leftOperand !== void 0 ? _leftOperand : "");
      var _rTs = DecimalCSS.parse(_rightOperand !== null && _rightOperand !== void 0 ? _rightOperand : "");
      var _result = _operator === "+" ? _lTs.add(_rTs) : _lTs.subtract(_rTs);
      if (_result.isNaN()) {
        return STR_NAN;
      }
      newExpr = newExpr.replace(ADD_OR_SUBTRACT_REGEX, _result.toString());
    }
    return newExpr;
  }
  var PARENTHESES_REGEX = /\(([^()]*)\)/;
  function calculateParentheses(expr) {
    var newExpr = expr;
    var match;
    while ((match = PARENTHESES_REGEX.exec(newExpr)) != null) {
      var [, parentheticalExpression] = match;
      newExpr = newExpr.replace(PARENTHESES_REGEX, calculateArithmetic(parentheticalExpression));
    }
    return newExpr;
  }
  function evaluateExpression(expression) {
    var newExpr = expression.replace(/\s+/g, "");
    newExpr = calculateParentheses(newExpr);
    newExpr = calculateArithmetic(newExpr);
    return newExpr;
  }
  function safeEvaluateExpression(expression) {
    try {
      return evaluateExpression(expression);
    } catch (_unused) {
      return STR_NAN;
    }
  }
  function reduceCSSCalc(expression) {
    var result = safeEvaluateExpression(expression.slice(5, -1));
    if (result === STR_NAN) {
      return "";
    }
    return result;
  }

  // client/node_modules/recharts/es6/component/Text.js
  var _excluded4 = ["x", "y", "lineHeight", "capHeight", "scaleToFit", "textAnchor", "verticalAnchor", "fill"];
  var _excluded22 = ["dx", "dy", "angle", "className", "breakAll"];
  function _extends5() {
    return _extends5 = Object.assign ? Object.assign.bind() : function(n) {
      for (var e = 1; e < arguments.length; e++) {
        var t = arguments[e];
        for (var r2 in t) ({}).hasOwnProperty.call(t, r2) && (n[r2] = t[r2]);
      }
      return n;
    }, _extends5.apply(null, arguments);
  }
  function _objectWithoutProperties4(e, t) {
    if (null == e) return {};
    var o, r2, i = _objectWithoutPropertiesLoose4(e, t);
    if (Object.getOwnPropertySymbols) {
      var n = Object.getOwnPropertySymbols(e);
      for (r2 = 0; r2 < n.length; r2++) o = n[r2], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]);
    }
    return i;
  }
  function _objectWithoutPropertiesLoose4(r2, e) {
    if (null == r2) return {};
    var t = {};
    for (var n in r2) if ({}.hasOwnProperty.call(r2, n)) {
      if (-1 !== e.indexOf(n)) continue;
      t[n] = r2[n];
    }
    return t;
  }
  var BREAKING_SPACES = /[ \f\n\r\t\v\u2028\u2029]+/;
  var calculateWordWidths = (_ref) => {
    var {
      children,
      breakAll,
      style
    } = _ref;
    try {
      var words = [];
      if (!isNullish(children)) {
        if (breakAll) {
          words = children.toString().split("");
        } else {
          words = children.toString().split(BREAKING_SPACES);
        }
      }
      var wordsWithComputedWidth = words.map((word) => ({
        word,
        width: getStringSize(word, style).width
      }));
      var spaceWidth = breakAll ? 0 : getStringSize("\xA0", style).width;
      return {
        wordsWithComputedWidth,
        spaceWidth
      };
    } catch (_unused) {
      return null;
    }
  };
  var calculateWordsByLines = (_ref2, initialWordsWithComputedWith, spaceWidth, lineWidth, scaleToFit) => {
    var {
      maxLines,
      children,
      style,
      breakAll
    } = _ref2;
    var shouldLimitLines = isNumber(maxLines);
    var text = children;
    var calculate = function calculate2() {
      var words = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : [];
      return words.reduce((result2, _ref3) => {
        var {
          word,
          width
        } = _ref3;
        var currentLine = result2[result2.length - 1];
        if (currentLine && (lineWidth == null || scaleToFit || currentLine.width + width + spaceWidth < Number(lineWidth))) {
          currentLine.words.push(word);
          currentLine.width += width + spaceWidth;
        } else {
          var newLine = {
            words: [word],
            width
          };
          result2.push(newLine);
        }
        return result2;
      }, []);
    };
    var originalResult = calculate(initialWordsWithComputedWith);
    var findLongestLine = (words) => words.reduce((a, b) => a.width > b.width ? a : b);
    if (!shouldLimitLines || scaleToFit) {
      return originalResult;
    }
    var overflows = originalResult.length > maxLines || findLongestLine(originalResult).width > Number(lineWidth);
    if (!overflows) {
      return originalResult;
    }
    var suffix = "\u2026";
    var checkOverflow = (index) => {
      var tempText = text.slice(0, index);
      var words = calculateWordWidths({
        breakAll,
        style,
        children: tempText + suffix
      }).wordsWithComputedWidth;
      var result2 = calculate(words);
      var doesOverflow = result2.length > maxLines || findLongestLine(result2).width > Number(lineWidth);
      return [doesOverflow, result2];
    };
    var start = 0;
    var end = text.length - 1;
    var iterations = 0;
    var trimmedResult;
    while (start <= end && iterations <= text.length - 1) {
      var middle = Math.floor((start + end) / 2);
      var prev = middle - 1;
      var [doesPrevOverflow, result] = checkOverflow(prev);
      var [doesMiddleOverflow] = checkOverflow(middle);
      if (!doesPrevOverflow && !doesMiddleOverflow) {
        start = middle + 1;
      }
      if (doesPrevOverflow && doesMiddleOverflow) {
        end = middle - 1;
      }
      if (!doesPrevOverflow && doesMiddleOverflow) {
        trimmedResult = result;
        break;
      }
      iterations++;
    }
    return trimmedResult || originalResult;
  };
  var getWordsWithoutCalculate = (children) => {
    var words = !isNullish(children) ? children.toString().split(BREAKING_SPACES) : [];
    return [{
      words
    }];
  };
  var getWordsByLines = (_ref4) => {
    var {
      width,
      scaleToFit,
      children,
      style,
      breakAll,
      maxLines
    } = _ref4;
    if ((width || scaleToFit) && !Global.isSsr) {
      var wordsWithComputedWidth, spaceWidth;
      var wordWidths = calculateWordWidths({
        breakAll,
        children,
        style
      });
      if (wordWidths) {
        var {
          wordsWithComputedWidth: wcw,
          spaceWidth: sw
        } = wordWidths;
        wordsWithComputedWidth = wcw;
        spaceWidth = sw;
      } else {
        return getWordsWithoutCalculate(children);
      }
      return calculateWordsByLines({
        breakAll,
        children,
        maxLines,
        style
      }, wordsWithComputedWidth, spaceWidth, width, scaleToFit);
    }
    return getWordsWithoutCalculate(children);
  };
  var DEFAULT_FILL = "#808080";
  var Text = /* @__PURE__ */ (0, import_react15.forwardRef)((_ref5, ref) => {
    var {
      x: propsX = 0,
      y: propsY = 0,
      lineHeight = "1em",
      // Magic number from d3
      capHeight = "0.71em",
      scaleToFit = false,
      textAnchor = "start",
      // Maintain compat with existing charts / default SVG behavior
      verticalAnchor = "end",
      fill = DEFAULT_FILL
    } = _ref5, props = _objectWithoutProperties4(_ref5, _excluded4);
    var wordsByLines = (0, import_react15.useMemo)(() => {
      return getWordsByLines({
        breakAll: props.breakAll,
        children: props.children,
        maxLines: props.maxLines,
        scaleToFit,
        style: props.style,
        width: props.width
      });
    }, [props.breakAll, props.children, props.maxLines, scaleToFit, props.style, props.width]);
    var {
      dx,
      dy,
      angle,
      className: className8,
      breakAll
    } = props, textProps = _objectWithoutProperties4(props, _excluded22);
    if (!isNumOrStr(propsX) || !isNumOrStr(propsY)) {
      return null;
    }
    var x2 = propsX + (isNumber(dx) ? dx : 0);
    var y2 = propsY + (isNumber(dy) ? dy : 0);
    var startDy;
    switch (verticalAnchor) {
      case "start":
        startDy = reduceCSSCalc("calc(".concat(capHeight, ")"));
        break;
      case "middle":
        startDy = reduceCSSCalc("calc(".concat((wordsByLines.length - 1) / 2, " * -").concat(lineHeight, " + (").concat(capHeight, " / 2))"));
        break;
      default:
        startDy = reduceCSSCalc("calc(".concat(wordsByLines.length - 1, " * -").concat(lineHeight, ")"));
        break;
    }
    var transforms = [];
    if (scaleToFit) {
      var lineWidth = wordsByLines[0].width;
      var {
        width
      } = props;
      transforms.push("scale(".concat(isNumber(width) ? width / lineWidth : 1, ")"));
    }
    if (angle) {
      transforms.push("rotate(".concat(angle, ", ").concat(x2, ", ").concat(y2, ")"));
    }
    if (transforms.length) {
      textProps.transform = transforms.join(" ");
    }
    return /* @__PURE__ */ React8.createElement("text", _extends5({}, filterProps(textProps, true), {
      ref,
      x: x2,
      y: y2,
      className: clsx("recharts-text", className8),
      textAnchor,
      fill: fill.includes("url") ? DEFAULT_FILL : fill
    }), wordsByLines.map((line, index) => {
      var words = line.words.join(breakAll ? "" : " ");
      return (
        // duplicate words will cause duplicate keys
        // eslint-disable-next-line react/no-array-index-key
        /* @__PURE__ */ React8.createElement("tspan", {
          x: x2,
          dy: index === 0 ? startDy : lineHeight,
          key: "".concat(words, "-").concat(index)
        }, words)
      );
    }));
  });
  Text.displayName = "Text";

  // client/node_modules/recharts/es6/component/Label.js
  init_define_import_meta_env();
  var React9 = __toESM(require_react_shim());
  var import_react16 = __toESM(require_react_shim());
  var _excluded5 = ["offset"];
  function _objectWithoutProperties5(e, t) {
    if (null == e) return {};
    var o, r2, i = _objectWithoutPropertiesLoose5(e, t);
    if (Object.getOwnPropertySymbols) {
      var n = Object.getOwnPropertySymbols(e);
      for (r2 = 0; r2 < n.length; r2++) o = n[r2], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]);
    }
    return i;
  }
  function _objectWithoutPropertiesLoose5(r2, e) {
    if (null == r2) return {};
    var t = {};
    for (var n in r2) if ({}.hasOwnProperty.call(r2, n)) {
      if (-1 !== e.indexOf(n)) continue;
      t[n] = r2[n];
    }
    return t;
  }
  function ownKeys14(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread14(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys14(Object(t), true).forEach(function(r3) {
        _defineProperty14(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys14(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  function _defineProperty14(e, r2, t) {
    return (r2 = _toPropertyKey14(r2)) in e ? Object.defineProperty(e, r2, { value: t, enumerable: true, configurable: true, writable: true }) : e[r2] = t, e;
  }
  function _toPropertyKey14(t) {
    var i = _toPrimitive14(t, "string");
    return "symbol" == typeof i ? i : i + "";
  }
  function _toPrimitive14(t, r2) {
    if ("object" != typeof t || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r2 || "default");
      if ("object" != typeof i) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r2 ? String : Number)(t);
  }
  function _extends6() {
    return _extends6 = Object.assign ? Object.assign.bind() : function(n) {
      for (var e = 1; e < arguments.length; e++) {
        var t = arguments[e];
        for (var r2 in t) ({}).hasOwnProperty.call(t, r2) && (n[r2] = t[r2]);
      }
      return n;
    }, _extends6.apply(null, arguments);
  }
  var getLabel = (props) => {
    var {
      value,
      formatter
    } = props;
    var label = isNullish(props.children) ? value : props.children;
    if (typeof formatter === "function") {
      return formatter(label);
    }
    return label;
  };
  var isLabelContentAFunction = (content) => {
    return content != null && typeof content === "function";
  };
  var getDeltaAngle = (startAngle, endAngle) => {
    var sign2 = mathSign(endAngle - startAngle);
    var deltaAngle = Math.min(Math.abs(endAngle - startAngle), 360);
    return sign2 * deltaAngle;
  };
  var renderRadialLabel = (labelProps, label, attrs) => {
    var {
      position,
      viewBox,
      offset,
      className: className8
    } = labelProps;
    var {
      cx,
      cy,
      innerRadius,
      outerRadius,
      startAngle,
      endAngle,
      clockWise
    } = viewBox;
    var radius = (innerRadius + outerRadius) / 2;
    var deltaAngle = getDeltaAngle(startAngle, endAngle);
    var sign2 = deltaAngle >= 0 ? 1 : -1;
    var labelAngle, direction;
    if (position === "insideStart") {
      labelAngle = startAngle + sign2 * offset;
      direction = clockWise;
    } else if (position === "insideEnd") {
      labelAngle = endAngle - sign2 * offset;
      direction = !clockWise;
    } else if (position === "end") {
      labelAngle = endAngle + sign2 * offset;
      direction = clockWise;
    }
    direction = deltaAngle <= 0 ? direction : !direction;
    var startPoint = polarToCartesian(cx, cy, radius, labelAngle);
    var endPoint = polarToCartesian(cx, cy, radius, labelAngle + (direction ? 1 : -1) * 359);
    var path2 = "M".concat(startPoint.x, ",").concat(startPoint.y, "\n    A").concat(radius, ",").concat(radius, ",0,1,").concat(direction ? 0 : 1, ",\n    ").concat(endPoint.x, ",").concat(endPoint.y);
    var id = isNullish(labelProps.id) ? uniqueId("recharts-radial-line-") : labelProps.id;
    return /* @__PURE__ */ React9.createElement("text", _extends6({}, attrs, {
      dominantBaseline: "central",
      className: clsx("recharts-radial-bar-label", className8)
    }), /* @__PURE__ */ React9.createElement("defs", null, /* @__PURE__ */ React9.createElement("path", {
      id,
      d: path2
    })), /* @__PURE__ */ React9.createElement("textPath", {
      xlinkHref: "#".concat(id)
    }, label));
  };
  var getAttrsOfPolarLabel = (props) => {
    var {
      viewBox,
      offset,
      position
    } = props;
    var {
      cx,
      cy,
      innerRadius,
      outerRadius,
      startAngle,
      endAngle
    } = viewBox;
    var midAngle = (startAngle + endAngle) / 2;
    if (position === "outside") {
      var {
        x: _x,
        y: _y
      } = polarToCartesian(cx, cy, outerRadius + offset, midAngle);
      return {
        x: _x,
        y: _y,
        textAnchor: _x >= cx ? "start" : "end",
        verticalAnchor: "middle"
      };
    }
    if (position === "center") {
      return {
        x: cx,
        y: cy,
        textAnchor: "middle",
        verticalAnchor: "middle"
      };
    }
    if (position === "centerTop") {
      return {
        x: cx,
        y: cy,
        textAnchor: "middle",
        verticalAnchor: "start"
      };
    }
    if (position === "centerBottom") {
      return {
        x: cx,
        y: cy,
        textAnchor: "middle",
        verticalAnchor: "end"
      };
    }
    var r2 = (innerRadius + outerRadius) / 2;
    var {
      x: x2,
      y: y2
    } = polarToCartesian(cx, cy, r2, midAngle);
    return {
      x: x2,
      y: y2,
      textAnchor: "middle",
      verticalAnchor: "middle"
    };
  };
  var getAttrsOfCartesianLabel = (props) => {
    var {
      viewBox,
      parentViewBox,
      offset,
      position
    } = props;
    var {
      x: x2,
      y: y2,
      width,
      height
    } = viewBox;
    var verticalSign = height >= 0 ? 1 : -1;
    var verticalOffset = verticalSign * offset;
    var verticalEnd = verticalSign > 0 ? "end" : "start";
    var verticalStart = verticalSign > 0 ? "start" : "end";
    var horizontalSign = width >= 0 ? 1 : -1;
    var horizontalOffset = horizontalSign * offset;
    var horizontalEnd = horizontalSign > 0 ? "end" : "start";
    var horizontalStart = horizontalSign > 0 ? "start" : "end";
    if (position === "top") {
      var attrs = {
        x: x2 + width / 2,
        y: y2 - verticalSign * offset,
        textAnchor: "middle",
        verticalAnchor: verticalEnd
      };
      return _objectSpread14(_objectSpread14({}, attrs), parentViewBox ? {
        height: Math.max(y2 - parentViewBox.y, 0),
        width
      } : {});
    }
    if (position === "bottom") {
      var _attrs = {
        x: x2 + width / 2,
        y: y2 + height + verticalOffset,
        textAnchor: "middle",
        verticalAnchor: verticalStart
      };
      return _objectSpread14(_objectSpread14({}, _attrs), parentViewBox ? {
        height: Math.max(parentViewBox.y + parentViewBox.height - (y2 + height), 0),
        width
      } : {});
    }
    if (position === "left") {
      var _attrs2 = {
        x: x2 - horizontalOffset,
        y: y2 + height / 2,
        textAnchor: horizontalEnd,
        verticalAnchor: "middle"
      };
      return _objectSpread14(_objectSpread14({}, _attrs2), parentViewBox ? {
        width: Math.max(_attrs2.x - parentViewBox.x, 0),
        height
      } : {});
    }
    if (position === "right") {
      var _attrs3 = {
        x: x2 + width + horizontalOffset,
        y: y2 + height / 2,
        textAnchor: horizontalStart,
        verticalAnchor: "middle"
      };
      return _objectSpread14(_objectSpread14({}, _attrs3), parentViewBox ? {
        width: Math.max(parentViewBox.x + parentViewBox.width - _attrs3.x, 0),
        height
      } : {});
    }
    var sizeAttrs = parentViewBox ? {
      width,
      height
    } : {};
    if (position === "insideLeft") {
      return _objectSpread14({
        x: x2 + horizontalOffset,
        y: y2 + height / 2,
        textAnchor: horizontalStart,
        verticalAnchor: "middle"
      }, sizeAttrs);
    }
    if (position === "insideRight") {
      return _objectSpread14({
        x: x2 + width - horizontalOffset,
        y: y2 + height / 2,
        textAnchor: horizontalEnd,
        verticalAnchor: "middle"
      }, sizeAttrs);
    }
    if (position === "insideTop") {
      return _objectSpread14({
        x: x2 + width / 2,
        y: y2 + verticalOffset,
        textAnchor: "middle",
        verticalAnchor: verticalStart
      }, sizeAttrs);
    }
    if (position === "insideBottom") {
      return _objectSpread14({
        x: x2 + width / 2,
        y: y2 + height - verticalOffset,
        textAnchor: "middle",
        verticalAnchor: verticalEnd
      }, sizeAttrs);
    }
    if (position === "insideTopLeft") {
      return _objectSpread14({
        x: x2 + horizontalOffset,
        y: y2 + verticalOffset,
        textAnchor: horizontalStart,
        verticalAnchor: verticalStart
      }, sizeAttrs);
    }
    if (position === "insideTopRight") {
      return _objectSpread14({
        x: x2 + width - horizontalOffset,
        y: y2 + verticalOffset,
        textAnchor: horizontalEnd,
        verticalAnchor: verticalStart
      }, sizeAttrs);
    }
    if (position === "insideBottomLeft") {
      return _objectSpread14({
        x: x2 + horizontalOffset,
        y: y2 + height - verticalOffset,
        textAnchor: horizontalStart,
        verticalAnchor: verticalEnd
      }, sizeAttrs);
    }
    if (position === "insideBottomRight") {
      return _objectSpread14({
        x: x2 + width - horizontalOffset,
        y: y2 + height - verticalOffset,
        textAnchor: horizontalEnd,
        verticalAnchor: verticalEnd
      }, sizeAttrs);
    }
    if (!!position && typeof position === "object" && (isNumber(position.x) || isPercent(position.x)) && (isNumber(position.y) || isPercent(position.y))) {
      return _objectSpread14({
        x: x2 + getPercentValue(position.x, width),
        y: y2 + getPercentValue(position.y, height),
        textAnchor: "end",
        verticalAnchor: "end"
      }, sizeAttrs);
    }
    return _objectSpread14({
      x: x2 + width / 2,
      y: y2 + height / 2,
      textAnchor: "middle",
      verticalAnchor: "middle"
    }, sizeAttrs);
  };
  var isPolar = (viewBox) => "cx" in viewBox && isNumber(viewBox.cx);
  function Label(_ref) {
    var {
      offset = 5
    } = _ref, restProps = _objectWithoutProperties5(_ref, _excluded5);
    var props = _objectSpread14({
      offset
    }, restProps);
    var {
      viewBox,
      position,
      value,
      children,
      content,
      className: className8 = "",
      textBreakAll,
      labelRef
    } = props;
    if (!viewBox || isNullish(value) && isNullish(children) && !/* @__PURE__ */ (0, import_react16.isValidElement)(content) && typeof content !== "function") {
      return null;
    }
    if (/* @__PURE__ */ (0, import_react16.isValidElement)(content)) {
      return /* @__PURE__ */ (0, import_react16.cloneElement)(content, props);
    }
    var label;
    if (typeof content === "function") {
      label = /* @__PURE__ */ (0, import_react16.createElement)(content, props);
      if (/* @__PURE__ */ (0, import_react16.isValidElement)(label)) {
        return label;
      }
    } else {
      label = getLabel(props);
    }
    var isPolarLabel = isPolar(viewBox);
    var attrs = filterProps(props, true);
    if (isPolarLabel && (position === "insideStart" || position === "insideEnd" || position === "end")) {
      return renderRadialLabel(props, label, attrs);
    }
    var positionAttrs = isPolarLabel ? getAttrsOfPolarLabel(props) : getAttrsOfCartesianLabel(props);
    return /* @__PURE__ */ React9.createElement(Text, _extends6({
      ref: labelRef,
      className: clsx("recharts-label", className8)
    }, attrs, positionAttrs, {
      breakAll: textBreakAll
    }), label);
  }
  Label.displayName = "Label";
  var parseViewBox = (props) => {
    var {
      cx,
      cy,
      angle,
      startAngle,
      endAngle,
      r: r2,
      radius,
      innerRadius,
      outerRadius,
      x: x2,
      y: y2,
      top,
      left,
      width,
      height,
      clockWise,
      labelViewBox
    } = props;
    if (labelViewBox) {
      return labelViewBox;
    }
    if (isNumber(width) && isNumber(height)) {
      if (isNumber(x2) && isNumber(y2)) {
        return {
          x: x2,
          y: y2,
          width,
          height
        };
      }
      if (isNumber(top) && isNumber(left)) {
        return {
          x: top,
          y: left,
          width,
          height
        };
      }
    }
    if (isNumber(x2) && isNumber(y2)) {
      return {
        x: x2,
        y: y2,
        width: 0,
        height: 0
      };
    }
    if (isNumber(cx) && isNumber(cy)) {
      return {
        cx,
        cy,
        startAngle: startAngle || angle || 0,
        endAngle: endAngle || angle || 0,
        innerRadius: innerRadius || 0,
        outerRadius: outerRadius || radius || r2 || 0,
        clockWise
      };
    }
    if (props.viewBox) {
      return props.viewBox;
    }
    return {};
  };
  var parseLabel = (label, viewBox, labelRef) => {
    if (!label) {
      return null;
    }
    var commonProps = {
      viewBox,
      labelRef
    };
    if (label === true) {
      return /* @__PURE__ */ React9.createElement(Label, _extends6({
        key: "label-implicit"
      }, commonProps));
    }
    if (isNumOrStr(label)) {
      return /* @__PURE__ */ React9.createElement(Label, _extends6({
        key: "label-implicit",
        value: label
      }, commonProps));
    }
    if (/* @__PURE__ */ (0, import_react16.isValidElement)(label)) {
      if (label.type === Label) {
        return /* @__PURE__ */ (0, import_react16.cloneElement)(label, _objectSpread14({
          key: "label-implicit"
        }, commonProps));
      }
      return /* @__PURE__ */ React9.createElement(Label, _extends6({
        key: "label-implicit",
        content: label
      }, commonProps));
    }
    if (isLabelContentAFunction(label)) {
      return /* @__PURE__ */ React9.createElement(Label, _extends6({
        key: "label-implicit",
        content: label
      }, commonProps));
    }
    if (label && typeof label === "object") {
      return /* @__PURE__ */ React9.createElement(Label, _extends6({}, label, {
        key: "label-implicit"
      }, commonProps));
    }
    return null;
  };
  var renderCallByParent = function renderCallByParent2(parentProps, viewBox) {
    var checkPropsLabel = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : true;
    if (!parentProps || !parentProps.children && checkPropsLabel && !parentProps.label) {
      return null;
    }
    var {
      children,
      labelRef
    } = parentProps;
    var parentViewBox = parseViewBox(parentProps);
    var explicitChildren = findAllByType(children, Label).map((child, index) => {
      return /* @__PURE__ */ (0, import_react16.cloneElement)(child, {
        viewBox: viewBox || parentViewBox,
        // eslint-disable-next-line react/no-array-index-key
        key: "label-".concat(index)
      });
    });
    if (!checkPropsLabel) {
      return explicitChildren;
    }
    var implicitLabel = parseLabel(parentProps.label, viewBox || parentViewBox, labelRef);
    return [implicitLabel, ...explicitChildren];
  };
  Label.parseViewBox = parseViewBox;
  Label.renderCallByParent = renderCallByParent;

  // client/node_modules/recharts/es6/component/LabelList.js
  init_define_import_meta_env();
  var React10 = __toESM(require_react_shim());
  var import_react17 = __toESM(require_react_shim());
  var import_last = __toESM(require_last3());
  var _excluded6 = ["valueAccessor"];
  var _excluded23 = ["data", "dataKey", "clockWise", "id", "textBreakAll"];
  function _extends7() {
    return _extends7 = Object.assign ? Object.assign.bind() : function(n) {
      for (var e = 1; e < arguments.length; e++) {
        var t = arguments[e];
        for (var r2 in t) ({}).hasOwnProperty.call(t, r2) && (n[r2] = t[r2]);
      }
      return n;
    }, _extends7.apply(null, arguments);
  }
  function ownKeys15(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread15(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys15(Object(t), true).forEach(function(r3) {
        _defineProperty15(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys15(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  function _defineProperty15(e, r2, t) {
    return (r2 = _toPropertyKey15(r2)) in e ? Object.defineProperty(e, r2, { value: t, enumerable: true, configurable: true, writable: true }) : e[r2] = t, e;
  }
  function _toPropertyKey15(t) {
    var i = _toPrimitive15(t, "string");
    return "symbol" == typeof i ? i : i + "";
  }
  function _toPrimitive15(t, r2) {
    if ("object" != typeof t || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r2 || "default");
      if ("object" != typeof i) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r2 ? String : Number)(t);
  }
  function _objectWithoutProperties6(e, t) {
    if (null == e) return {};
    var o, r2, i = _objectWithoutPropertiesLoose6(e, t);
    if (Object.getOwnPropertySymbols) {
      var n = Object.getOwnPropertySymbols(e);
      for (r2 = 0; r2 < n.length; r2++) o = n[r2], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]);
    }
    return i;
  }
  function _objectWithoutPropertiesLoose6(r2, e) {
    if (null == r2) return {};
    var t = {};
    for (var n in r2) if ({}.hasOwnProperty.call(r2, n)) {
      if (-1 !== e.indexOf(n)) continue;
      t[n] = r2[n];
    }
    return t;
  }
  var defaultAccessor = (entry) => Array.isArray(entry.value) ? (0, import_last.default)(entry.value) : entry.value;
  function LabelList(_ref) {
    var {
      valueAccessor = defaultAccessor
    } = _ref, restProps = _objectWithoutProperties6(_ref, _excluded6);
    var {
      data,
      dataKey,
      clockWise,
      id,
      textBreakAll
    } = restProps, others = _objectWithoutProperties6(restProps, _excluded23);
    if (!data || !data.length) {
      return null;
    }
    return /* @__PURE__ */ React10.createElement(Layer, {
      className: "recharts-label-list"
    }, data.map((entry, index) => {
      var value = isNullish(dataKey) ? valueAccessor(entry, index) : getValueByDataKey(entry && entry.payload, dataKey);
      var idProps = isNullish(id) ? {} : {
        id: "".concat(id, "-").concat(index)
      };
      return /* @__PURE__ */ React10.createElement(Label, _extends7({}, filterProps(entry, true), others, idProps, {
        parentViewBox: entry.parentViewBox,
        value,
        textBreakAll,
        viewBox: Label.parseViewBox(isNullish(clockWise) ? entry : _objectSpread15(_objectSpread15({}, entry), {}, {
          clockWise
        })),
        key: "label-".concat(index),
        index
      }));
    }));
  }
  LabelList.displayName = "LabelList";
  function parseLabelList(label, data) {
    if (!label) {
      return null;
    }
    if (label === true) {
      return /* @__PURE__ */ React10.createElement(LabelList, {
        key: "labelList-implicit",
        data
      });
    }
    if (/* @__PURE__ */ React10.isValidElement(label) || isLabelContentAFunction(label)) {
      return /* @__PURE__ */ React10.createElement(LabelList, {
        key: "labelList-implicit",
        data,
        content: label
      });
    }
    if (typeof label === "object") {
      return /* @__PURE__ */ React10.createElement(LabelList, _extends7({
        data
      }, label, {
        key: "labelList-implicit"
      }));
    }
    return null;
  }
  function renderCallByParent3(parentProps, data) {
    var checkPropsLabel = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : true;
    if (!parentProps || !parentProps.children && checkPropsLabel && !parentProps.label) {
      return null;
    }
    var {
      children
    } = parentProps;
    var explicitChildren = findAllByType(children, LabelList).map((child, index) => /* @__PURE__ */ (0, import_react17.cloneElement)(child, {
      data,
      // eslint-disable-next-line react/no-array-index-key
      key: "labelList-".concat(index)
    }));
    if (!checkPropsLabel) {
      return explicitChildren;
    }
    var implicitLabelList = parseLabelList(parentProps.label, data);
    return [implicitLabelList, ...explicitChildren];
  }
  LabelList.renderCallByParent = renderCallByParent3;

  // client/node_modules/recharts/es6/shape/Dot.js
  init_define_import_meta_env();
  var React11 = __toESM(require_react_shim());
  function _extends8() {
    return _extends8 = Object.assign ? Object.assign.bind() : function(n) {
      for (var e = 1; e < arguments.length; e++) {
        var t = arguments[e];
        for (var r2 in t) ({}).hasOwnProperty.call(t, r2) && (n[r2] = t[r2]);
      }
      return n;
    }, _extends8.apply(null, arguments);
  }
  var Dot = (props) => {
    var {
      cx,
      cy,
      r: r2,
      className: className8
    } = props;
    var layerClass = clsx("recharts-dot", className8);
    if (cx === +cx && cy === +cy && r2 === +r2) {
      return /* @__PURE__ */ React11.createElement("circle", _extends8({}, filterProps(props, false), adaptEventHandlers(props), {
        className: layerClass,
        cx,
        cy,
        r: r2
      }));
    }
    return null;
  };

  // client/node_modules/recharts/es6/state/polarAxisSlice.js
  init_define_import_meta_env();
  var initialState5 = {
    radiusAxis: {},
    angleAxis: {}
  };
  var polarAxisSlice = createSlice({
    name: "polarAxis",
    initialState: initialState5,
    reducers: {
      addRadiusAxis(state, action) {
        state.radiusAxis[action.payload.id] = castDraft(action.payload);
      },
      removeRadiusAxis(state, action) {
        delete state.radiusAxis[action.payload.id];
      },
      addAngleAxis(state, action) {
        state.angleAxis[action.payload.id] = castDraft(action.payload);
      },
      removeAngleAxis(state, action) {
        delete state.angleAxis[action.payload.id];
      }
    }
  });
  var {
    addRadiusAxis,
    removeRadiusAxis,
    addAngleAxis,
    removeAngleAxis
  } = polarAxisSlice.actions;
  var polarAxisReducer = polarAxisSlice.reducer;

  // client/node_modules/recharts/es6/state/SetGraphicalItem.js
  init_define_import_meta_env();
  var import_react18 = __toESM(require_react_shim());

  // client/node_modules/recharts/es6/state/graphicalItemsSlice.js
  init_define_import_meta_env();
  var initialState6 = {
    countOfBars: 0,
    cartesianItems: [],
    polarItems: []
  };
  var graphicalItemsSlice = createSlice({
    name: "graphicalItems",
    initialState: initialState6,
    reducers: {
      addBar(state) {
        state.countOfBars += 1;
      },
      removeBar(state) {
        state.countOfBars -= 1;
      },
      addCartesianGraphicalItem(state, action) {
        state.cartesianItems.push(castDraft(action.payload));
      },
      removeCartesianGraphicalItem(state, action) {
        var index = current(state).cartesianItems.indexOf(castDraft(action.payload));
        if (index > -1) {
          state.cartesianItems.splice(index, 1);
        }
      },
      addPolarGraphicalItem(state, action) {
        state.polarItems.push(castDraft(action.payload));
      },
      removePolarGraphicalItem(state, action) {
        var index = current(state).polarItems.indexOf(castDraft(action.payload));
        if (index > -1) {
          state.polarItems.splice(index, 1);
        }
      }
    }
  });
  var {
    addBar,
    removeBar,
    addCartesianGraphicalItem,
    removeCartesianGraphicalItem,
    addPolarGraphicalItem,
    removePolarGraphicalItem
  } = graphicalItemsSlice.actions;
  var graphicalItemsReducer = graphicalItemsSlice.reducer;

  // client/node_modules/recharts/es6/state/SetGraphicalItem.js
  function ownKeys16(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread16(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys16(Object(t), true).forEach(function(r3) {
        _defineProperty16(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys16(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  function _defineProperty16(e, r2, t) {
    return (r2 = _toPropertyKey16(r2)) in e ? Object.defineProperty(e, r2, { value: t, enumerable: true, configurable: true, writable: true }) : e[r2] = t, e;
  }
  function _toPropertyKey16(t) {
    var i = _toPrimitive16(t, "string");
    return "symbol" == typeof i ? i : i + "";
  }
  function _toPrimitive16(t, r2) {
    if ("object" != typeof t || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r2 || "default");
      if ("object" != typeof i) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r2 ? String : Number)(t);
  }
  function SetCartesianGraphicalItem(props) {
    var dispatch = useAppDispatch();
    (0, import_react18.useEffect)(() => {
      var settings = _objectSpread16(_objectSpread16({}, props), {}, {
        stackId: getNormalizedStackId(props.stackId)
      });
      dispatch(addCartesianGraphicalItem(settings));
      return () => {
        dispatch(removeCartesianGraphicalItem(settings));
      };
    }, [dispatch, props]);
    return null;
  }

  // client/node_modules/recharts/es6/state/SetTooltipEntrySettings.js
  init_define_import_meta_env();
  var import_react19 = __toESM(require_react_shim());
  function SetTooltipEntrySettings(_ref) {
    var {
      fn,
      args
    } = _ref;
    var dispatch = useAppDispatch();
    var isPanorama = useIsPanorama();
    (0, import_react19.useEffect)(() => {
      if (isPanorama) {
        return void 0;
      }
      var tooltipEntrySettings = fn(args);
      dispatch(addTooltipEntrySettings(tooltipEntrySettings));
      return () => {
        dispatch(removeTooltipEntrySettings(tooltipEntrySettings));
      };
    }, [fn, args, dispatch, isPanorama]);
    return null;
  }

  // client/node_modules/recharts/es6/state/SetLegendPayload.js
  init_define_import_meta_env();
  var import_react20 = __toESM(require_react_shim());
  var noop4 = () => {
  };
  function SetLegendPayload(_ref) {
    var {
      legendPayload
    } = _ref;
    var dispatch = useAppDispatch();
    var isPanorama = useIsPanorama();
    (0, import_react20.useEffect)(() => {
      if (isPanorama) {
        return noop4;
      }
      dispatch(addLegendPayload(legendPayload));
      return () => {
        dispatch(removeLegendPayload(legendPayload));
      };
    }, [dispatch, isPanorama, legendPayload]);
    return null;
  }

  // client/node_modules/recharts/es6/util/useAnimationId.js
  init_define_import_meta_env();
  var import_react21 = __toESM(require_react_shim());
  function useAnimationId(input) {
    var prefix = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "animation-";
    var animationId = (0, import_react21.useRef)(uniqueId(prefix));
    var prevProps = (0, import_react21.useRef)(input);
    if (prevProps.current !== input) {
      animationId.current = uniqueId(prefix);
      prevProps.current = input;
    }
    return animationId.current;
  }

  // client/node_modules/recharts/es6/component/ActivePoints.js
  init_define_import_meta_env();
  var React12 = __toESM(require_react_shim());
  var import_react22 = __toESM(require_react_shim());
  function ownKeys17(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread17(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys17(Object(t), true).forEach(function(r3) {
        _defineProperty17(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys17(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  function _defineProperty17(e, r2, t) {
    return (r2 = _toPropertyKey17(r2)) in e ? Object.defineProperty(e, r2, { value: t, enumerable: true, configurable: true, writable: true }) : e[r2] = t, e;
  }
  function _toPropertyKey17(t) {
    var i = _toPrimitive17(t, "string");
    return "symbol" == typeof i ? i : i + "";
  }
  function _toPrimitive17(t, r2) {
    if ("object" != typeof t || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r2 || "default");
      if ("object" != typeof i) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r2 ? String : Number)(t);
  }
  var renderActivePoint = (_ref) => {
    var {
      point: point4,
      childIndex,
      mainColor,
      activeDot,
      dataKey
    } = _ref;
    if (activeDot === false || point4.x == null || point4.y == null) {
      return null;
    }
    var dotProps = _objectSpread17(_objectSpread17({
      index: childIndex,
      dataKey,
      cx: point4.x,
      cy: point4.y,
      r: 4,
      fill: mainColor !== null && mainColor !== void 0 ? mainColor : "none",
      strokeWidth: 2,
      stroke: "#fff",
      payload: point4.payload,
      value: point4.value
    }, filterProps(activeDot, false)), adaptEventHandlers(activeDot));
    var dot;
    if (/* @__PURE__ */ (0, import_react22.isValidElement)(activeDot)) {
      dot = /* @__PURE__ */ (0, import_react22.cloneElement)(activeDot, dotProps);
    } else if (typeof activeDot === "function") {
      dot = activeDot(dotProps);
    } else {
      dot = /* @__PURE__ */ React12.createElement(Dot, dotProps);
    }
    return /* @__PURE__ */ React12.createElement(Layer, {
      className: "recharts-active-dot"
    }, dot);
  };
  function ActivePoints(_ref2) {
    var {
      points,
      mainColor,
      activeDot,
      itemDataKey
    } = _ref2;
    var tooltipAxis = useTooltipAxis();
    var activeTooltipIndex = useAppSelector(selectActiveTooltipIndex);
    var activeLabel = useAppSelector(selectActiveLabel);
    if (!activeTooltipIndex) {
      return null;
    }
    var activePoint;
    var tooltipAxisDataKey = tooltipAxis.dataKey;
    if (tooltipAxisDataKey && !tooltipAxis.allowDuplicatedCategory) {
      var specifiedKey = typeof tooltipAxisDataKey === "function" ? (point4) => tooltipAxisDataKey(point4.payload) : "payload.".concat(tooltipAxisDataKey);
      activePoint = findEntryInArray(points, specifiedKey, activeLabel);
    } else {
      activePoint = points === null || points === void 0 ? void 0 : points[Number(activeTooltipIndex)];
    }
    if (isNullish(activePoint)) {
      return null;
    }
    return renderActivePoint({
      point: activePoint,
      childIndex: Number(activeTooltipIndex),
      mainColor,
      dataKey: itemDataKey,
      activeDot
    });
  }

  // client/node_modules/recharts/es6/cartesian/ErrorBar.js
  init_define_import_meta_env();
  var React14 = __toESM(require_react_shim());
  var import_react24 = __toESM(require_react_shim());

  // client/node_modules/recharts/es6/context/CartesianGraphicalItemContext.js
  init_define_import_meta_env();
  var React13 = __toESM(require_react_shim());
  var import_react23 = __toESM(require_react_shim());
  var _excluded7 = ["children"];
  function _objectWithoutProperties7(e, t) {
    if (null == e) return {};
    var o, r2, i = _objectWithoutPropertiesLoose7(e, t);
    if (Object.getOwnPropertySymbols) {
      var n = Object.getOwnPropertySymbols(e);
      for (r2 = 0; r2 < n.length; r2++) o = n[r2], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]);
    }
    return i;
  }
  function _objectWithoutPropertiesLoose7(r2, e) {
    if (null == r2) return {};
    var t = {};
    for (var n in r2) if ({}.hasOwnProperty.call(r2, n)) {
      if (-1 !== e.indexOf(n)) continue;
      t[n] = r2[n];
    }
    return t;
  }
  var noop5 = () => {
  };
  var ErrorBarDirectionDispatchContext = /* @__PURE__ */ (0, import_react23.createContext)({
    addErrorBar: noop5,
    removeErrorBar: noop5
  });
  var initialContextState = {
    data: [],
    xAxisId: "xAxis-0",
    yAxisId: "yAxis-0",
    dataPointFormatter: () => ({
      x: 0,
      y: 0,
      value: 0
    }),
    errorBarOffset: 0
  };
  var ErrorBarContext = /* @__PURE__ */ (0, import_react23.createContext)(initialContextState);
  function SetErrorBarContext(props) {
    var {
      children
    } = props, rest = _objectWithoutProperties7(props, _excluded7);
    return /* @__PURE__ */ React13.createElement(ErrorBarContext.Provider, {
      value: rest
    }, children);
  }
  var useErrorBarContext = () => (0, import_react23.useContext)(ErrorBarContext);
  var CartesianGraphicalItemContext = (_ref) => {
    var {
      children,
      xAxisId,
      yAxisId,
      zAxisId,
      dataKey,
      data,
      stackId,
      hide,
      type,
      barSize
    } = _ref;
    var [errorBars, updateErrorBars] = React13.useState([]);
    var addErrorBar = (0, import_react23.useCallback)((errorBar) => {
      updateErrorBars((prev) => [...prev, errorBar]);
    }, [updateErrorBars]);
    var removeErrorBar = (0, import_react23.useCallback)((errorBar) => {
      updateErrorBars((prev) => prev.filter((eb) => eb !== errorBar));
    }, [updateErrorBars]);
    var isPanorama = useIsPanorama();
    return /* @__PURE__ */ React13.createElement(ErrorBarDirectionDispatchContext.Provider, {
      value: {
        addErrorBar,
        removeErrorBar
      }
    }, /* @__PURE__ */ React13.createElement(SetCartesianGraphicalItem, {
      type,
      data,
      xAxisId,
      yAxisId,
      zAxisId,
      dataKey,
      errorBars,
      stackId,
      hide,
      barSize,
      isPanorama
    }), children);
  };
  function ReportErrorBarSettings(props) {
    var {
      addErrorBar,
      removeErrorBar
    } = (0, import_react23.useContext)(ErrorBarDirectionDispatchContext);
    (0, import_react23.useEffect)(() => {
      addErrorBar(props);
      return () => {
        removeErrorBar(props);
      };
    }, [addErrorBar, removeErrorBar, props]);
    return null;
  }

  // client/node_modules/recharts/es6/hooks.js
  init_define_import_meta_env();
  var useXAxis = (xAxisId) => {
    var isPanorama = useIsPanorama();
    return useAppSelector((state) => selectAxisWithScale(state, "xAxis", xAxisId, isPanorama));
  };
  var useYAxis = (yAxisId) => {
    var isPanorama = useIsPanorama();
    return useAppSelector((state) => selectAxisWithScale(state, "yAxis", yAxisId, isPanorama));
  };

  // client/node_modules/recharts/es6/cartesian/ErrorBar.js
  var _excluded8 = ["direction", "width", "dataKey", "isAnimationActive", "animationBegin", "animationDuration", "animationEasing"];
  function _defineProperty18(e, r2, t) {
    return (r2 = _toPropertyKey18(r2)) in e ? Object.defineProperty(e, r2, { value: t, enumerable: true, configurable: true, writable: true }) : e[r2] = t, e;
  }
  function _toPropertyKey18(t) {
    var i = _toPrimitive18(t, "string");
    return "symbol" == typeof i ? i : i + "";
  }
  function _toPrimitive18(t, r2) {
    if ("object" != typeof t || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r2 || "default");
      if ("object" != typeof i) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r2 ? String : Number)(t);
  }
  function _extends9() {
    return _extends9 = Object.assign ? Object.assign.bind() : function(n) {
      for (var e = 1; e < arguments.length; e++) {
        var t = arguments[e];
        for (var r2 in t) ({}).hasOwnProperty.call(t, r2) && (n[r2] = t[r2]);
      }
      return n;
    }, _extends9.apply(null, arguments);
  }
  function _objectWithoutProperties8(e, t) {
    if (null == e) return {};
    var o, r2, i = _objectWithoutPropertiesLoose8(e, t);
    if (Object.getOwnPropertySymbols) {
      var n = Object.getOwnPropertySymbols(e);
      for (r2 = 0; r2 < n.length; r2++) o = n[r2], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]);
    }
    return i;
  }
  function _objectWithoutPropertiesLoose8(r2, e) {
    if (null == r2) return {};
    var t = {};
    for (var n in r2) if ({}.hasOwnProperty.call(r2, n)) {
      if (-1 !== e.indexOf(n)) continue;
      t[n] = r2[n];
    }
    return t;
  }
  function ErrorBarImpl(props) {
    var {
      direction,
      width,
      dataKey,
      isAnimationActive,
      animationBegin,
      animationDuration,
      animationEasing
    } = props, others = _objectWithoutProperties8(props, _excluded8);
    var svgProps = filterProps(others, false);
    var {
      data,
      dataPointFormatter,
      xAxisId,
      yAxisId,
      errorBarOffset: offset
    } = useErrorBarContext();
    var xAxis = useXAxis(xAxisId);
    var yAxis = useYAxis(yAxisId);
    if ((xAxis === null || xAxis === void 0 ? void 0 : xAxis.scale) == null || (yAxis === null || yAxis === void 0 ? void 0 : yAxis.scale) == null || data == null) {
      return null;
    }
    if (direction === "x" && xAxis.type !== "number") {
      return null;
    }
    var errorBars = data.map((entry) => {
      var {
        x: x2,
        y: y2,
        value,
        errorVal
      } = dataPointFormatter(entry, dataKey, direction);
      if (!errorVal) {
        return null;
      }
      var lineCoordinates = [];
      var lowBound, highBound;
      if (Array.isArray(errorVal)) {
        [lowBound, highBound] = errorVal;
      } else {
        lowBound = highBound = errorVal;
      }
      if (direction === "x") {
        var {
          scale
        } = xAxis;
        var yMid = y2 + offset;
        var yMin = yMid + width;
        var yMax = yMid - width;
        var xMin = scale(value - lowBound);
        var xMax = scale(value + highBound);
        lineCoordinates.push({
          x1: xMax,
          y1: yMin,
          x2: xMax,
          y2: yMax
        });
        lineCoordinates.push({
          x1: xMin,
          y1: yMid,
          x2: xMax,
          y2: yMid
        });
        lineCoordinates.push({
          x1: xMin,
          y1: yMin,
          x2: xMin,
          y2: yMax
        });
      } else if (direction === "y") {
        var {
          scale: _scale
        } = yAxis;
        var xMid = x2 + offset;
        var _xMin = xMid - width;
        var _xMax = xMid + width;
        var _yMin = _scale(value - lowBound);
        var _yMax = _scale(value + highBound);
        lineCoordinates.push({
          x1: _xMin,
          y1: _yMax,
          x2: _xMax,
          y2: _yMax
        });
        lineCoordinates.push({
          x1: xMid,
          y1: _yMin,
          x2: xMid,
          y2: _yMax
        });
        lineCoordinates.push({
          x1: _xMin,
          y1: _yMin,
          x2: _xMax,
          y2: _yMin
        });
      }
      var transformOrigin = "".concat(x2 + offset, "px ").concat(y2 + offset, "px");
      return /* @__PURE__ */ React14.createElement(Layer, _extends9({
        className: "recharts-errorBar",
        key: "bar-".concat(lineCoordinates.map((c) => "".concat(c.x1, "-").concat(c.x2, "-").concat(c.y1, "-").concat(c.y2)))
      }, svgProps), lineCoordinates.map((coordinates) => {
        var lineStyle = isAnimationActive ? {
          transformOrigin: "".concat(coordinates.x1 - 5, "px")
        } : void 0;
        return /* @__PURE__ */ React14.createElement(Animate, {
          from: {
            transform: "scaleY(0)",
            transformOrigin
          },
          to: {
            transform: "scaleY(1)",
            transformOrigin
          },
          begin: animationBegin,
          easing: animationEasing,
          isActive: isAnimationActive,
          duration: animationDuration,
          key: "line-".concat(coordinates.x1, "-").concat(coordinates.x2, "-").concat(coordinates.y1, "-").concat(coordinates.y2),
          style: {
            transformOrigin
          }
        }, /* @__PURE__ */ React14.createElement("line", _extends9({}, coordinates, {
          style: lineStyle
        })));
      }));
    });
    return /* @__PURE__ */ React14.createElement(Layer, {
      className: "recharts-errorBars"
    }, errorBars);
  }
  var ErrorBarPreferredDirection = /* @__PURE__ */ (0, import_react24.createContext)(void 0);
  function useErrorBarDirection(directionFromProps) {
    var preferredDirection = (0, import_react24.useContext)(ErrorBarPreferredDirection);
    if (directionFromProps != null) {
      return directionFromProps;
    }
    if (preferredDirection != null) {
      return preferredDirection;
    }
    return "x";
  }
  function SetErrorBarPreferredDirection(_ref) {
    var {
      direction,
      children
    } = _ref;
    return /* @__PURE__ */ React14.createElement(ErrorBarPreferredDirection.Provider, {
      value: direction
    }, children);
  }
  var errorBarDefaultProps = {
    stroke: "black",
    strokeWidth: 1.5,
    width: 5,
    offset: 0,
    isAnimationActive: true,
    animationBegin: 0,
    animationDuration: 400,
    animationEasing: "ease-in-out"
  };
  function ErrorBarInternal(props) {
    var realDirection = useErrorBarDirection(props.direction);
    var {
      width,
      isAnimationActive,
      animationBegin,
      animationDuration,
      animationEasing
    } = resolveDefaultProps(props, errorBarDefaultProps);
    return /* @__PURE__ */ React14.createElement(React14.Fragment, null, /* @__PURE__ */ React14.createElement(ReportErrorBarSettings, {
      dataKey: props.dataKey,
      direction: realDirection
    }), /* @__PURE__ */ React14.createElement(ErrorBarImpl, _extends9({}, props, {
      direction: realDirection,
      width,
      isAnimationActive,
      animationBegin,
      animationDuration,
      animationEasing
    })));
  }
  var ErrorBar = class extends import_react24.Component {
    render() {
      return /* @__PURE__ */ React14.createElement(ErrorBarInternal, this.props);
    }
  };
  _defineProperty18(ErrorBar, "defaultProps", errorBarDefaultProps);
  _defineProperty18(ErrorBar, "displayName", "ErrorBar");

  // client/node_modules/recharts/es6/cartesian/GraphicalItemClipPath.js
  init_define_import_meta_env();
  var React15 = __toESM(require_react_shim());
  function useNeedsClip(xAxisId, yAxisId) {
    var _xAxis$allowDataOverf, _yAxis$allowDataOverf;
    var xAxis = useAppSelector((state) => selectXAxisSettings(state, xAxisId));
    var yAxis = useAppSelector((state) => selectYAxisSettings(state, yAxisId));
    var needClipX = (_xAxis$allowDataOverf = xAxis === null || xAxis === void 0 ? void 0 : xAxis.allowDataOverflow) !== null && _xAxis$allowDataOverf !== void 0 ? _xAxis$allowDataOverf : implicitXAxis.allowDataOverflow;
    var needClipY = (_yAxis$allowDataOverf = yAxis === null || yAxis === void 0 ? void 0 : yAxis.allowDataOverflow) !== null && _yAxis$allowDataOverf !== void 0 ? _yAxis$allowDataOverf : implicitYAxis.allowDataOverflow;
    var needClip = needClipX || needClipY;
    return {
      needClip,
      needClipX,
      needClipY
    };
  }
  function GraphicalItemClipPath(_ref) {
    var {
      xAxisId,
      yAxisId,
      clipPathId
    } = _ref;
    var offset = useOffset();
    var {
      needClipX,
      needClipY,
      needClip
    } = useNeedsClip(xAxisId, yAxisId);
    if (!needClip) {
      return null;
    }
    var {
      left,
      top,
      width,
      height
    } = offset;
    return /* @__PURE__ */ React15.createElement("clipPath", {
      id: "clipPath-".concat(clipPathId)
    }, /* @__PURE__ */ React15.createElement("rect", {
      x: needClipX ? left : left - width / 2,
      y: needClipY ? top : top - height / 2,
      width: needClipX ? width : width * 2,
      height: needClipY ? height : height * 2
    }));
  }

  // client/node_modules/recharts/es6/context/chartDataContext.js
  init_define_import_meta_env();
  var import_react25 = __toESM(require_react_shim());
  var ChartDataContextProvider = (props) => {
    var {
      chartData
    } = props;
    var dispatch = useAppDispatch();
    var isPanorama = useIsPanorama();
    (0, import_react25.useEffect)(() => {
      if (isPanorama) {
        return () => {
        };
      }
      dispatch(setChartData(chartData));
      return () => {
        dispatch(setChartData(void 0));
      };
    }, [chartData, dispatch, isPanorama]);
    return null;
  };

  // client/node_modules/recharts/es6/state/brushSlice.js
  init_define_import_meta_env();
  var initialState7 = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    padding: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    }
  };
  var brushSlice = createSlice({
    name: "brush",
    initialState: initialState7,
    reducers: {
      setBrushSettings(_state, action) {
        if (action.payload == null) {
          return initialState7;
        }
        return action.payload;
      }
    }
  });
  var {
    setBrushSettings
  } = brushSlice.actions;
  var brushReducer = brushSlice.reducer;

  // client/node_modules/recharts/es6/state/referenceElementsSlice.js
  init_define_import_meta_env();
  var initialState8 = {
    dots: [],
    areas: [],
    lines: []
  };
  var referenceElementsSlice = createSlice({
    name: "referenceElements",
    initialState: initialState8,
    reducers: {
      addDot: (state, action) => {
        state.dots.push(action.payload);
      },
      removeDot: (state, action) => {
        var index = current(state).dots.findIndex((dot) => dot === action.payload);
        if (index !== -1) {
          state.dots.splice(index, 1);
        }
      },
      addArea: (state, action) => {
        state.areas.push(action.payload);
      },
      removeArea: (state, action) => {
        var index = current(state).areas.findIndex((area) => area === action.payload);
        if (index !== -1) {
          state.areas.splice(index, 1);
        }
      },
      addLine: (state, action) => {
        state.lines.push(action.payload);
      },
      removeLine: (state, action) => {
        var index = current(state).lines.findIndex((line) => line === action.payload);
        if (index !== -1) {
          state.lines.splice(index, 1);
        }
      }
    }
  });
  var {
    addDot,
    removeDot,
    addArea,
    removeArea,
    addLine,
    removeLine
  } = referenceElementsSlice.actions;
  var referenceElementsReducer = referenceElementsSlice.reducer;

  // client/node_modules/recharts/es6/container/ClipPathProvider.js
  init_define_import_meta_env();
  var React16 = __toESM(require_react_shim());
  var import_react26 = __toESM(require_react_shim());
  var ClipPathIdContext = /* @__PURE__ */ (0, import_react26.createContext)(void 0);
  var ClipPathProvider = (_ref) => {
    var {
      children
    } = _ref;
    var [clipPathId] = (0, import_react26.useState)("".concat(uniqueId("recharts"), "-clip"));
    var offset = useOffset();
    if (offset == null) {
      return null;
    }
    var {
      left,
      top,
      height,
      width
    } = offset;
    return /* @__PURE__ */ React16.createElement(ClipPathIdContext.Provider, {
      value: clipPathId
    }, /* @__PURE__ */ React16.createElement("defs", null, /* @__PURE__ */ React16.createElement("clipPath", {
      id: clipPathId
    }, /* @__PURE__ */ React16.createElement("rect", {
      x: left,
      y: top,
      height,
      width
    }))), children);
  };

  // client/node_modules/recharts/es6/cartesian/Line.js
  init_define_import_meta_env();
  var React17 = __toESM(require_react_shim());
  var import_react27 = __toESM(require_react_shim());

  // client/node_modules/recharts/es6/state/selectors/lineSelectors.js
  init_define_import_meta_env();
  var selectXAxisWithScale = (state, xAxisId, _yAxisId, isPanorama) => selectAxisWithScale(state, "xAxis", xAxisId, isPanorama);
  var selectXAxisTicks = (state, xAxisId, _yAxisId, isPanorama) => selectTicksOfGraphicalItem(state, "xAxis", xAxisId, isPanorama);
  var selectYAxisWithScale = (state, _xAxisId, yAxisId, isPanorama) => selectAxisWithScale(state, "yAxis", yAxisId, isPanorama);
  var selectYAxisTicks = (state, _xAxisId, yAxisId, isPanorama) => selectTicksOfGraphicalItem(state, "yAxis", yAxisId, isPanorama);
  var selectBandSize = createSelector([selectChartLayout, selectXAxisWithScale, selectYAxisWithScale, selectXAxisTicks, selectYAxisTicks], (layout, xAxis, yAxis, xAxisTicks, yAxisTicks) => {
    if (isCategoricalAxis(layout, "xAxis")) {
      return getBandSizeOfAxis(xAxis, xAxisTicks, false);
    }
    return getBandSizeOfAxis(yAxis, yAxisTicks, false);
  });
  var pickLineSettings = (_state, _xAxisId, _yAxisId, _isPanorama, lineSettings) => lineSettings;
  var selectSynchronisedLineSettings = createSelector([selectUnfilteredCartesianItems, pickLineSettings], (graphicalItems, lineSettingsFromProps) => {
    if (graphicalItems.some((cgis) => cgis.type === "line" && lineSettingsFromProps.dataKey === cgis.dataKey && lineSettingsFromProps.data === cgis.data)) {
      return lineSettingsFromProps;
    }
    return void 0;
  });
  var selectLinePoints = createSelector([selectChartLayout, selectXAxisWithScale, selectYAxisWithScale, selectXAxisTicks, selectYAxisTicks, selectSynchronisedLineSettings, selectBandSize, selectChartDataWithIndexesIfNotInPanorama], (layout, xAxis, yAxis, xAxisTicks, yAxisTicks, lineSettings, bandSize, _ref) => {
    var {
      chartData,
      dataStartIndex,
      dataEndIndex
    } = _ref;
    if (lineSettings == null || xAxis == null || yAxis == null || xAxisTicks == null || yAxisTicks == null || xAxisTicks.length === 0 || yAxisTicks.length === 0 || bandSize == null) {
      return void 0;
    }
    var {
      dataKey,
      data
    } = lineSettings;
    var displayedData;
    if (data != null && data.length > 0) {
      displayedData = data;
    } else {
      displayedData = chartData === null || chartData === void 0 ? void 0 : chartData.slice(dataStartIndex, dataEndIndex + 1);
    }
    if (displayedData == null) {
      return void 0;
    }
    return computeLinePoints({
      layout,
      xAxis,
      yAxis,
      xAxisTicks,
      yAxisTicks,
      dataKey,
      bandSize,
      displayedData
    });
  });

  // client/node_modules/recharts/es6/cartesian/Line.js
  var _excluded9 = ["type", "layout", "connectNulls", "needClip"];
  var _excluded24 = ["activeDot", "animateNewValues", "animationBegin", "animationDuration", "animationEasing", "connectNulls", "dot", "hide", "isAnimationActive", "label", "legendType", "xAxisId", "yAxisId"];
  function _objectWithoutProperties9(e, t) {
    if (null == e) return {};
    var o, r2, i = _objectWithoutPropertiesLoose9(e, t);
    if (Object.getOwnPropertySymbols) {
      var n = Object.getOwnPropertySymbols(e);
      for (r2 = 0; r2 < n.length; r2++) o = n[r2], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]);
    }
    return i;
  }
  function _objectWithoutPropertiesLoose9(r2, e) {
    if (null == r2) return {};
    var t = {};
    for (var n in r2) if ({}.hasOwnProperty.call(r2, n)) {
      if (-1 !== e.indexOf(n)) continue;
      t[n] = r2[n];
    }
    return t;
  }
  function ownKeys18(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread18(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys18(Object(t), true).forEach(function(r3) {
        _defineProperty19(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys18(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  function _defineProperty19(e, r2, t) {
    return (r2 = _toPropertyKey19(r2)) in e ? Object.defineProperty(e, r2, { value: t, enumerable: true, configurable: true, writable: true }) : e[r2] = t, e;
  }
  function _toPropertyKey19(t) {
    var i = _toPrimitive19(t, "string");
    return "symbol" == typeof i ? i : i + "";
  }
  function _toPrimitive19(t, r2) {
    if ("object" != typeof t || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r2 || "default");
      if ("object" != typeof i) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r2 ? String : Number)(t);
  }
  function _extends10() {
    return _extends10 = Object.assign ? Object.assign.bind() : function(n) {
      for (var e = 1; e < arguments.length; e++) {
        var t = arguments[e];
        for (var r2 in t) ({}).hasOwnProperty.call(t, r2) && (n[r2] = t[r2]);
      }
      return n;
    }, _extends10.apply(null, arguments);
  }
  var computeLegendPayloadFromAreaData = (props) => {
    var {
      dataKey,
      name,
      stroke,
      legendType,
      hide
    } = props;
    return [{
      inactive: hide,
      dataKey,
      type: legendType,
      color: stroke,
      value: getTooltipNameProp(name, dataKey),
      payload: props
    }];
  };
  function getTooltipEntrySettings(props) {
    var {
      dataKey,
      data,
      stroke,
      strokeWidth,
      fill,
      name,
      hide,
      unit: unit2
    } = props;
    return {
      dataDefinedOnItem: data,
      positions: void 0,
      settings: {
        stroke,
        strokeWidth,
        fill,
        dataKey,
        nameKey: void 0,
        name: getTooltipNameProp(name, dataKey),
        hide,
        type: props.tooltipType,
        color: props.stroke,
        unit: unit2
      }
    };
  }
  var generateSimpleStrokeDasharray = (totalLength, length) => {
    return "".concat(length, "px ").concat(totalLength - length, "px");
  };
  function repeat(lines, count) {
    var linesUnit = lines.length % 2 !== 0 ? [...lines, 0] : lines;
    var result = [];
    for (var i = 0; i < count; ++i) {
      result = [...result, ...linesUnit];
    }
    return result;
  }
  var getStrokeDasharray = (length, totalLength, lines) => {
    var lineLength = lines.reduce((pre, next) => pre + next);
    if (!lineLength) {
      return generateSimpleStrokeDasharray(totalLength, length);
    }
    var count = Math.floor(length / lineLength);
    var remainLength = length % lineLength;
    var restLength = totalLength - length;
    var remainLines = [];
    for (var i = 0, sum = 0; i < lines.length; sum += lines[i], ++i) {
      if (sum + lines[i] > remainLength) {
        remainLines = [...lines.slice(0, i), remainLength - sum];
        break;
      }
    }
    var emptyLines = remainLines.length % 2 === 0 ? [0, restLength] : [restLength];
    return [...repeat(lines, count), ...remainLines, ...emptyLines].map((line) => "".concat(line, "px")).join(", ");
  };
  function renderDotItem(option, props) {
    var dotItem;
    if (/* @__PURE__ */ React17.isValidElement(option)) {
      dotItem = /* @__PURE__ */ React17.cloneElement(option, props);
    } else if (typeof option === "function") {
      dotItem = option(props);
    } else {
      var className8 = clsx("recharts-line-dot", typeof option !== "boolean" ? option.className : "");
      dotItem = /* @__PURE__ */ React17.createElement(Dot, _extends10({}, props, {
        className: className8
      }));
    }
    return dotItem;
  }
  function shouldRenderDots(points, dot) {
    if (points == null) {
      return false;
    }
    if (dot) {
      return true;
    }
    return points.length === 1;
  }
  function Dots(_ref) {
    var {
      clipPathId,
      points,
      props
    } = _ref;
    var {
      dot,
      dataKey,
      needClip
    } = props;
    if (!shouldRenderDots(points, dot)) {
      return null;
    }
    var clipDot = isClipDot(dot);
    var lineProps = filterProps(props, false);
    var customDotProps = filterProps(dot, true);
    var dots = points.map((entry, i) => {
      var dotProps = _objectSpread18(_objectSpread18(_objectSpread18({
        key: "dot-".concat(i),
        r: 3
      }, lineProps), customDotProps), {}, {
        index: i,
        cx: entry.x,
        cy: entry.y,
        dataKey,
        value: entry.value,
        payload: entry.payload,
        points
      });
      return renderDotItem(dot, dotProps);
    });
    var dotsProps = {
      clipPath: needClip ? "url(#clipPath-".concat(clipDot ? "" : "dots-").concat(clipPathId, ")") : null
    };
    return /* @__PURE__ */ React17.createElement(Layer, _extends10({
      className: "recharts-line-dots",
      key: "dots"
    }, dotsProps), dots);
  }
  function StaticCurve(_ref2) {
    var {
      clipPathId,
      pathRef,
      points,
      strokeDasharray,
      props,
      showLabels
    } = _ref2;
    var {
      type,
      layout,
      connectNulls,
      needClip
    } = props, others = _objectWithoutProperties9(props, _excluded9);
    var curveProps = _objectSpread18(_objectSpread18({}, filterProps(others, true)), {}, {
      fill: "none",
      className: "recharts-line-curve",
      clipPath: needClip ? "url(#clipPath-".concat(clipPathId, ")") : null,
      points,
      type,
      layout,
      connectNulls,
      strokeDasharray: strokeDasharray !== null && strokeDasharray !== void 0 ? strokeDasharray : props.strokeDasharray
    });
    return /* @__PURE__ */ React17.createElement(React17.Fragment, null, (points === null || points === void 0 ? void 0 : points.length) > 1 && /* @__PURE__ */ React17.createElement(Curve, _extends10({}, curveProps, {
      pathRef
    })), /* @__PURE__ */ React17.createElement(Dots, {
      points,
      clipPathId,
      props
    }), showLabels && LabelList.renderCallByParent(props, points));
  }
  function getTotalLength(mainCurve) {
    try {
      return mainCurve && mainCurve.getTotalLength && mainCurve.getTotalLength() || 0;
    } catch (_unused) {
      return 0;
    }
  }
  function CurveWithAnimation(_ref3) {
    var {
      clipPathId,
      props,
      pathRef,
      previousPointsRef,
      longestAnimatedLengthRef
    } = _ref3;
    var {
      points,
      strokeDasharray,
      isAnimationActive,
      animationBegin,
      animationDuration,
      animationEasing,
      animateNewValues,
      width,
      height,
      onAnimationEnd,
      onAnimationStart
    } = props;
    var prevPoints = previousPointsRef.current;
    var animationId = useAnimationId(props, "recharts-line-");
    var [isAnimating, setIsAnimating] = (0, import_react27.useState)(false);
    var handleAnimationEnd = (0, import_react27.useCallback)(() => {
      if (typeof onAnimationEnd === "function") {
        onAnimationEnd();
      }
      setIsAnimating(false);
    }, [onAnimationEnd]);
    var handleAnimationStart = (0, import_react27.useCallback)(() => {
      if (typeof onAnimationStart === "function") {
        onAnimationStart();
      }
      setIsAnimating(true);
    }, [onAnimationStart]);
    var totalLength = getTotalLength(pathRef.current);
    var startingPoint = longestAnimatedLengthRef.current;
    return /* @__PURE__ */ React17.createElement(Animate, {
      begin: animationBegin,
      duration: animationDuration,
      isActive: isAnimationActive,
      easing: animationEasing,
      from: {
        t: 0
      },
      to: {
        t: 1
      },
      onAnimationEnd: handleAnimationEnd,
      onAnimationStart: handleAnimationStart,
      key: animationId
    }, (_ref4) => {
      var {
        t
      } = _ref4;
      var interpolator = interpolateNumber(startingPoint, totalLength + startingPoint);
      var curLength = Math.min(interpolator(t), totalLength);
      var currentStrokeDasharray;
      if (strokeDasharray) {
        var lines = "".concat(strokeDasharray).split(/[,\s]+/gim).map((num) => parseFloat(num));
        currentStrokeDasharray = getStrokeDasharray(curLength, totalLength, lines);
      } else {
        currentStrokeDasharray = generateSimpleStrokeDasharray(totalLength, curLength);
      }
      if (prevPoints) {
        var prevPointsDiffFactor = prevPoints.length / points.length;
        var stepData = t === 1 ? points : points.map((entry, index) => {
          var prevPointIndex = Math.floor(index * prevPointsDiffFactor);
          if (prevPoints[prevPointIndex]) {
            var prev = prevPoints[prevPointIndex];
            var interpolatorX = interpolateNumber(prev.x, entry.x);
            var interpolatorY = interpolateNumber(prev.y, entry.y);
            return _objectSpread18(_objectSpread18({}, entry), {}, {
              x: interpolatorX(t),
              y: interpolatorY(t)
            });
          }
          if (animateNewValues) {
            var _interpolatorX = interpolateNumber(width * 2, entry.x);
            var _interpolatorY = interpolateNumber(height / 2, entry.y);
            return _objectSpread18(_objectSpread18({}, entry), {}, {
              x: _interpolatorX(t),
              y: _interpolatorY(t)
            });
          }
          return _objectSpread18(_objectSpread18({}, entry), {}, {
            x: entry.x,
            y: entry.y
          });
        });
        previousPointsRef.current = stepData;
        return /* @__PURE__ */ React17.createElement(StaticCurve, {
          props,
          points: stepData,
          clipPathId,
          pathRef,
          showLabels: !isAnimating,
          strokeDasharray: currentStrokeDasharray
        });
      }
      if (t > 0 && totalLength > 0) {
        previousPointsRef.current = points;
        longestAnimatedLengthRef.current = curLength;
      }
      return /* @__PURE__ */ React17.createElement(StaticCurve, {
        props,
        points,
        clipPathId,
        pathRef,
        showLabels: !isAnimating,
        strokeDasharray: currentStrokeDasharray
      });
    });
  }
  function RenderCurve(_ref5) {
    var {
      clipPathId,
      props
    } = _ref5;
    var {
      points,
      isAnimationActive
    } = props;
    var previousPointsRef = (0, import_react27.useRef)(null);
    var longestAnimatedLengthRef = (0, import_react27.useRef)(0);
    var pathRef = (0, import_react27.useRef)(null);
    var prevPoints = previousPointsRef.current;
    if (isAnimationActive && points && points.length && prevPoints !== points) {
      return /* @__PURE__ */ React17.createElement(CurveWithAnimation, {
        props,
        clipPathId,
        previousPointsRef,
        longestAnimatedLengthRef,
        pathRef
      });
    }
    return /* @__PURE__ */ React17.createElement(StaticCurve, {
      props,
      points,
      clipPathId,
      pathRef,
      showLabels: true
    });
  }
  var errorBarDataPointFormatter = (dataPoint, dataKey) => {
    return {
      x: dataPoint.x,
      y: dataPoint.y,
      value: dataPoint.value,
      // @ts-expect-error getValueByDataKey does not validate the output type
      errorVal: getValueByDataKey(dataPoint.payload, dataKey)
    };
  };
  var LineWithState = class extends import_react27.Component {
    constructor() {
      super(...arguments);
      _defineProperty19(this, "id", uniqueId("recharts-line-"));
    }
    render() {
      var _filterProps;
      var {
        hide,
        dot,
        points,
        className: className8,
        xAxisId,
        yAxisId,
        top,
        left,
        width,
        height,
        id,
        needClip,
        layout
      } = this.props;
      if (hide) {
        return null;
      }
      var layerClass = clsx("recharts-line", className8);
      var clipPathId = isNullish(id) ? this.id : id;
      var {
        r: r2 = 3,
        strokeWidth = 2
      } = (_filterProps = filterProps(dot, false)) !== null && _filterProps !== void 0 ? _filterProps : {
        r: 3,
        strokeWidth: 2
      };
      var clipDot = isClipDot(dot);
      var dotSize = r2 * 2 + strokeWidth;
      return /* @__PURE__ */ React17.createElement(React17.Fragment, null, /* @__PURE__ */ React17.createElement(Layer, {
        className: layerClass
      }, needClip && /* @__PURE__ */ React17.createElement("defs", null, /* @__PURE__ */ React17.createElement(GraphicalItemClipPath, {
        clipPathId,
        xAxisId,
        yAxisId
      }), !clipDot && /* @__PURE__ */ React17.createElement("clipPath", {
        id: "clipPath-dots-".concat(clipPathId)
      }, /* @__PURE__ */ React17.createElement("rect", {
        x: left - dotSize / 2,
        y: top - dotSize / 2,
        width: width + dotSize,
        height: height + dotSize
      }))), /* @__PURE__ */ React17.createElement(RenderCurve, {
        props: this.props,
        clipPathId
      }), /* @__PURE__ */ React17.createElement(SetErrorBarPreferredDirection, {
        direction: layout === "horizontal" ? "y" : "x"
      }, /* @__PURE__ */ React17.createElement(SetErrorBarContext, {
        xAxisId,
        yAxisId,
        data: points,
        dataPointFormatter: errorBarDataPointFormatter,
        errorBarOffset: 0
      }, this.props.children))), /* @__PURE__ */ React17.createElement(ActivePoints, {
        activeDot: this.props.activeDot,
        points,
        mainColor: this.props.stroke,
        itemDataKey: this.props.dataKey
      }));
    }
  };
  var defaultLineProps = {
    activeDot: true,
    animateNewValues: true,
    animationBegin: 0,
    animationDuration: 1500,
    animationEasing: "ease",
    connectNulls: false,
    dot: true,
    fill: "#fff",
    hide: false,
    isAnimationActive: !Global.isSsr,
    label: false,
    legendType: "line",
    stroke: "#3182bd",
    strokeWidth: 1,
    xAxisId: 0,
    yAxisId: 0
  };
  function LineImpl(props) {
    var _resolveDefaultProps = resolveDefaultProps(props, defaultLineProps), {
      activeDot,
      animateNewValues,
      animationBegin,
      animationDuration,
      animationEasing,
      connectNulls,
      dot,
      hide,
      isAnimationActive,
      label,
      legendType,
      xAxisId,
      yAxisId
    } = _resolveDefaultProps, everythingElse = _objectWithoutProperties9(_resolveDefaultProps, _excluded24);
    var {
      needClip
    } = useNeedsClip(xAxisId, yAxisId);
    var {
      height,
      width,
      left,
      top
    } = useOffset();
    var layout = useChartLayout();
    var isPanorama = useIsPanorama();
    var lineSettings = (0, import_react27.useMemo)(() => ({
      dataKey: props.dataKey,
      data: props.data
    }), [props.dataKey, props.data]);
    var points = useAppSelector((state) => selectLinePoints(state, xAxisId, yAxisId, isPanorama, lineSettings));
    if (layout !== "horizontal" && layout !== "vertical") {
      return null;
    }
    return /* @__PURE__ */ React17.createElement(LineWithState, _extends10({}, everythingElse, {
      connectNulls,
      dot,
      activeDot,
      animateNewValues,
      animationBegin,
      animationDuration,
      animationEasing,
      isAnimationActive,
      hide,
      label,
      legendType,
      xAxisId,
      yAxisId,
      points,
      layout,
      height,
      width,
      left,
      top,
      needClip
    }));
  }
  function computeLinePoints(_ref6) {
    var {
      layout,
      xAxis,
      yAxis,
      xAxisTicks,
      yAxisTicks,
      dataKey,
      bandSize,
      displayedData
    } = _ref6;
    return displayedData.map((entry, index) => {
      var value = getValueByDataKey(entry, dataKey);
      if (layout === "horizontal") {
        return {
          x: getCateCoordinateOfLine({
            axis: xAxis,
            ticks: xAxisTicks,
            bandSize,
            entry,
            index
          }),
          y: isNullish(value) ? null : yAxis.scale(value),
          value,
          payload: entry
        };
      }
      return {
        x: isNullish(value) ? null : xAxis.scale(value),
        y: getCateCoordinateOfLine({
          axis: yAxis,
          ticks: yAxisTicks,
          bandSize,
          entry,
          index
        }),
        value,
        payload: entry
      };
    });
  }
  var Line = class extends import_react27.PureComponent {
    render() {
      return /* @__PURE__ */ React17.createElement(CartesianGraphicalItemContext, {
        type: "line",
        data: this.props.data,
        xAxisId: this.props.xAxisId,
        yAxisId: this.props.yAxisId,
        zAxisId: 0,
        dataKey: this.props.dataKey,
        stackId: void 0,
        hide: this.props.hide,
        barSize: void 0
      }, /* @__PURE__ */ React17.createElement(SetLegendPayload, {
        legendPayload: computeLegendPayloadFromAreaData(this.props)
      }), /* @__PURE__ */ React17.createElement(SetTooltipEntrySettings, {
        fn: getTooltipEntrySettings,
        args: this.props
      }), /* @__PURE__ */ React17.createElement(LineImpl, this.props));
    }
  };
  _defineProperty19(Line, "displayName", "Line");
  _defineProperty19(Line, "defaultProps", defaultLineProps);

  // client/node_modules/recharts/es6/state/cartesianAxisSlice.js
  init_define_import_meta_env();
  function ownKeys19(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread19(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys19(Object(t), true).forEach(function(r3) {
        _defineProperty20(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys19(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  function _defineProperty20(e, r2, t) {
    return (r2 = _toPropertyKey20(r2)) in e ? Object.defineProperty(e, r2, { value: t, enumerable: true, configurable: true, writable: true }) : e[r2] = t, e;
  }
  function _toPropertyKey20(t) {
    var i = _toPrimitive20(t, "string");
    return "symbol" == typeof i ? i : i + "";
  }
  function _toPrimitive20(t, r2) {
    if ("object" != typeof t || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r2 || "default");
      if ("object" != typeof i) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r2 ? String : Number)(t);
  }
  var initialState9 = {
    xAxis: {},
    yAxis: {},
    zAxis: {}
  };
  var cartesianAxisSlice = createSlice({
    name: "cartesianAxis",
    initialState: initialState9,
    reducers: {
      addXAxis(state, action) {
        state.xAxis[action.payload.id] = castDraft(action.payload);
      },
      removeXAxis(state, action) {
        delete state.xAxis[action.payload.id];
      },
      addYAxis(state, action) {
        state.yAxis[action.payload.id] = castDraft(action.payload);
      },
      removeYAxis(state, action) {
        delete state.yAxis[action.payload.id];
      },
      addZAxis(state, action) {
        state.zAxis[action.payload.id] = castDraft(action.payload);
      },
      removeZAxis(state, action) {
        delete state.zAxis[action.payload.id];
      },
      updateYAxisWidth(state, action) {
        var {
          id,
          width
        } = action.payload;
        if (state.yAxis[id]) {
          state.yAxis[id] = _objectSpread19(_objectSpread19({}, state.yAxis[id]), {}, {
            width
          });
        }
      }
    }
  });
  var {
    addXAxis,
    removeXAxis,
    addYAxis,
    removeYAxis,
    addZAxis,
    removeZAxis,
    updateYAxisWidth
  } = cartesianAxisSlice.actions;
  var cartesianAxisReducer = cartesianAxisSlice.reducer;

  // client/node_modules/recharts/es6/chart/LineChart.js
  init_define_import_meta_env();
  var React24 = __toESM(require_react_shim());
  var import_react36 = __toESM(require_react_shim());

  // client/node_modules/recharts/es6/chart/CartesianChart.js
  init_define_import_meta_env();
  var React23 = __toESM(require_react_shim());
  var import_react35 = __toESM(require_react_shim());

  // client/node_modules/recharts/es6/state/RechartsStoreProvider.js
  init_define_import_meta_env();
  var React19 = __toESM(require_react_shim());
  var import_react28 = __toESM(require_react_shim());

  // client/node_modules/recharts/node_modules/react-redux/dist/react-redux.mjs
  init_define_import_meta_env();
  var React18 = __toESM(require_react_shim(), 1);
  var import_with_selector2 = __toESM(require_with_selector2(), 1);
  var REACT_FORWARD_REF_TYPE = /* @__PURE__ */ Symbol.for("react.forward_ref");
  var REACT_MEMO_TYPE = /* @__PURE__ */ Symbol.for("react.memo");
  var ForwardRef = REACT_FORWARD_REF_TYPE;
  var Memo = REACT_MEMO_TYPE;
  function defaultNoopBatch(callback) {
    callback();
  }
  function createListenerCollection() {
    let first = null;
    let last2 = null;
    return {
      clear() {
        first = null;
        last2 = null;
      },
      notify() {
        defaultNoopBatch(() => {
          let listener2 = first;
          while (listener2) {
            listener2.callback();
            listener2 = listener2.next;
          }
        });
      },
      get() {
        const listeners = [];
        let listener2 = first;
        while (listener2) {
          listeners.push(listener2);
          listener2 = listener2.next;
        }
        return listeners;
      },
      subscribe(callback) {
        let isSubscribed = true;
        const listener2 = last2 = {
          callback,
          next: null,
          prev: last2
        };
        if (listener2.prev) {
          listener2.prev.next = listener2;
        } else {
          first = listener2;
        }
        return function unsubscribe() {
          if (!isSubscribed || first === null) return;
          isSubscribed = false;
          if (listener2.next) {
            listener2.next.prev = listener2.prev;
          } else {
            last2 = listener2.prev;
          }
          if (listener2.prev) {
            listener2.prev.next = listener2.next;
          } else {
            first = listener2.next;
          }
        };
      }
    };
  }
  var nullListeners = {
    notify() {
    },
    get: () => []
  };
  function createSubscription(store, parentSub) {
    let unsubscribe;
    let listeners = nullListeners;
    let subscriptionsAmount = 0;
    let selfSubscribed = false;
    function addNestedSub(listener2) {
      trySubscribe();
      const cleanupListener = listeners.subscribe(listener2);
      let removed = false;
      return () => {
        if (!removed) {
          removed = true;
          cleanupListener();
          tryUnsubscribe();
        }
      };
    }
    function notifyNestedSubs() {
      listeners.notify();
    }
    function handleChangeWrapper() {
      if (subscription.onStateChange) {
        subscription.onStateChange();
      }
    }
    function isSubscribed() {
      return selfSubscribed;
    }
    function trySubscribe() {
      subscriptionsAmount++;
      if (!unsubscribe) {
        unsubscribe = parentSub ? parentSub.addNestedSub(handleChangeWrapper) : store.subscribe(handleChangeWrapper);
        listeners = createListenerCollection();
      }
    }
    function tryUnsubscribe() {
      subscriptionsAmount--;
      if (unsubscribe && subscriptionsAmount === 0) {
        unsubscribe();
        unsubscribe = void 0;
        listeners.clear();
        listeners = nullListeners;
      }
    }
    function trySubscribeSelf() {
      if (!selfSubscribed) {
        selfSubscribed = true;
        trySubscribe();
      }
    }
    function tryUnsubscribeSelf() {
      if (selfSubscribed) {
        selfSubscribed = false;
        tryUnsubscribe();
      }
    }
    const subscription = {
      addNestedSub,
      notifyNestedSubs,
      handleChangeWrapper,
      isSubscribed,
      trySubscribe: trySubscribeSelf,
      tryUnsubscribe: tryUnsubscribeSelf,
      getListeners: () => listeners
    };
    return subscription;
  }
  var canUseDOM = () => !!(typeof window !== "undefined" && typeof window.document !== "undefined" && typeof window.document.createElement !== "undefined");
  var isDOM = /* @__PURE__ */ canUseDOM();
  var isRunningInReactNative = () => typeof navigator !== "undefined" && navigator.product === "ReactNative";
  var isReactNative = /* @__PURE__ */ isRunningInReactNative();
  var getUseIsomorphicLayoutEffect = () => isDOM || isReactNative ? React18.useLayoutEffect : React18.useEffect;
  var useIsomorphicLayoutEffect = /* @__PURE__ */ getUseIsomorphicLayoutEffect();
  var FORWARD_REF_STATICS = {
    $$typeof: true,
    render: true,
    defaultProps: true,
    displayName: true,
    propTypes: true
  };
  var MEMO_STATICS = {
    $$typeof: true,
    compare: true,
    defaultProps: true,
    displayName: true,
    propTypes: true,
    type: true
  };
  var TYPE_STATICS = {
    [ForwardRef]: FORWARD_REF_STATICS,
    [Memo]: MEMO_STATICS
  };
  var objectPrototype = Object.prototype;
  var ContextKey = /* @__PURE__ */ Symbol.for(`react-redux-context`);
  var gT = typeof globalThis !== "undefined" ? globalThis : (
    /* fall back to a per-module scope (pre-8.1 behaviour) if `globalThis` is not available */
    {}
  );
  function getContext() {
    if (!React18.createContext) return {};
    const contextMap = gT[ContextKey] ?? (gT[ContextKey] = /* @__PURE__ */ new Map());
    let realContext = contextMap.get(React18.createContext);
    if (!realContext) {
      realContext = React18.createContext(
        null
      );
      if (true) {
        realContext.displayName = "ReactRedux";
      }
      contextMap.set(React18.createContext, realContext);
    }
    return realContext;
  }
  var ReactReduxContext = /* @__PURE__ */ getContext();
  function Provider(providerProps) {
    const { children, context, serverState, store } = providerProps;
    const contextValue = React18.useMemo(() => {
      const subscription = createSubscription(store);
      const baseContextValue = {
        store,
        subscription,
        getServerState: serverState ? () => serverState : void 0
      };
      if (false) {
        return baseContextValue;
      } else {
        const { identityFunctionCheck = "once", stabilityCheck = "once" } = providerProps;
        return /* @__PURE__ */ Object.assign(baseContextValue, {
          stabilityCheck,
          identityFunctionCheck
        });
      }
    }, [store, serverState]);
    const previousState = React18.useMemo(() => store.getState(), [store]);
    useIsomorphicLayoutEffect(() => {
      const { subscription } = contextValue;
      subscription.onStateChange = subscription.notifyNestedSubs;
      subscription.trySubscribe();
      if (previousState !== store.getState()) {
        subscription.notifyNestedSubs();
      }
      return () => {
        subscription.tryUnsubscribe();
        subscription.onStateChange = void 0;
      };
    }, [contextValue, previousState]);
    const Context = context || ReactReduxContext;
    return /* @__PURE__ */ React18.createElement(Context.Provider, { value: contextValue }, children);
  }
  var Provider_default = Provider;

  // client/node_modules/recharts/es6/state/store.js
  init_define_import_meta_env();

  // client/node_modules/recharts/es6/state/mouseEventsMiddleware.js
  init_define_import_meta_env();

  // client/node_modules/recharts/es6/state/selectors/selectActivePropsFromChartPointer.js
  init_define_import_meta_env();
  var pickChartPointer = (_state, chartPointer) => chartPointer;
  var selectActivePropsFromChartPointer = createSelector([pickChartPointer, selectChartLayout, selectPolarViewBox, selectTooltipAxisType, selectTooltipAxisRangeWithReverse, selectTooltipAxisTicks, selectOrderedTooltipTicks, selectChartOffset], combineActiveProps);

  // client/node_modules/recharts/es6/util/getChartPointer.js
  init_define_import_meta_env();
  var getChartPointer = (event) => {
    var rect = event.currentTarget.getBoundingClientRect();
    var scaleX = rect.width / event.currentTarget.offsetWidth;
    var scaleY = rect.height / event.currentTarget.offsetHeight;
    return {
      /*
       * Here it's important to use:
       * - event.clientX and event.clientY to get the mouse position relative to the viewport, including scroll.
       * - pageX and pageY are not used because they are relative to the whole document, and ignore scroll.
       * - rect.left and rect.top are used to get the position of the chart relative to the viewport.
       * - offsetX and offsetY are not used because they are relative to the offset parent
       *  which may or may not be the same as the clientX and clientY, depending on the position of the chart in the DOM
       *  and surrounding element styles. CSS position: relative, absolute, fixed, will change the offset parent.
       * - scaleX and scaleY are necessary for when the chart element is scaled using CSS `transform: scale(N)`.
       */
      chartX: Math.round((event.clientX - rect.left) / scaleX),
      chartY: Math.round((event.clientY - rect.top) / scaleY)
    };
  };

  // client/node_modules/recharts/es6/state/mouseEventsMiddleware.js
  var mouseClickAction = createAction("mouseClick");
  var mouseClickMiddleware = createListenerMiddleware();
  mouseClickMiddleware.startListening({
    actionCreator: mouseClickAction,
    effect: (action, listenerApi) => {
      var mousePointer = action.payload;
      var activeProps = selectActivePropsFromChartPointer(listenerApi.getState(), getChartPointer(mousePointer));
      if ((activeProps === null || activeProps === void 0 ? void 0 : activeProps.activeIndex) != null) {
        listenerApi.dispatch(setMouseClickAxisIndex({
          activeIndex: activeProps.activeIndex,
          activeDataKey: void 0,
          activeCoordinate: activeProps.activeCoordinate
        }));
      }
    }
  });
  var mouseMoveAction = createAction("mouseMove");
  var mouseMoveMiddleware = createListenerMiddleware();
  mouseMoveMiddleware.startListening({
    actionCreator: mouseMoveAction,
    effect: (action, listenerApi) => {
      var mousePointer = action.payload;
      var state = listenerApi.getState();
      var tooltipEventType = selectTooltipEventType(state, state.tooltip.settings.shared);
      var activeProps = selectActivePropsFromChartPointer(state, getChartPointer(mousePointer));
      if (tooltipEventType === "axis") {
        if ((activeProps === null || activeProps === void 0 ? void 0 : activeProps.activeIndex) != null) {
          listenerApi.dispatch(setMouseOverAxisIndex({
            activeIndex: activeProps.activeIndex,
            activeDataKey: void 0,
            activeCoordinate: activeProps.activeCoordinate
          }));
        } else {
          listenerApi.dispatch(mouseLeaveChart());
        }
      }
    }
  });

  // client/node_modules/recharts/es6/state/reduxDevtoolsJsonStringifyReplacer.js
  init_define_import_meta_env();
  function reduxDevtoolsJsonStringifyReplacer(_key, value) {
    if (value instanceof HTMLElement) {
      return "HTMLElement <".concat(value.tagName, ' class="').concat(value.className, '">');
    }
    if (value === window) {
      return "global.window";
    }
    return value;
  }

  // client/node_modules/recharts/es6/state/rootPropsSlice.js
  init_define_import_meta_env();
  var initialState10 = {
    accessibilityLayer: true,
    barCategoryGap: "10%",
    barGap: 4,
    barSize: void 0,
    className: void 0,
    maxBarSize: void 0,
    stackOffset: "none",
    syncId: void 0,
    syncMethod: "index"
  };
  var rootPropsSlice = createSlice({
    name: "rootProps",
    initialState: initialState10,
    reducers: {
      updateOptions: (state, action) => {
        var _action$payload$barGa;
        state.accessibilityLayer = action.payload.accessibilityLayer;
        state.barCategoryGap = action.payload.barCategoryGap;
        state.barGap = (_action$payload$barGa = action.payload.barGap) !== null && _action$payload$barGa !== void 0 ? _action$payload$barGa : initialState10.barGap;
        state.barSize = action.payload.barSize;
        state.maxBarSize = action.payload.maxBarSize;
        state.stackOffset = action.payload.stackOffset;
        state.syncId = action.payload.syncId;
        state.syncMethod = action.payload.syncMethod;
        state.className = action.payload.className;
      }
    }
  });
  var rootPropsReducer = rootPropsSlice.reducer;
  var {
    updateOptions
  } = rootPropsSlice.actions;

  // client/node_modules/recharts/es6/state/polarOptionsSlice.js
  init_define_import_meta_env();
  var polarOptionsSlice = createSlice({
    name: "polarOptions",
    initialState: null,
    reducers: {
      updatePolarOptions: (_state, action) => {
        return action.payload;
      }
    }
  });
  var {
    updatePolarOptions
  } = polarOptionsSlice.actions;
  var polarOptionsReducer = polarOptionsSlice.reducer;

  // client/node_modules/recharts/es6/state/keyboardEventsMiddleware.js
  init_define_import_meta_env();
  var keyDownAction = createAction("keyDown");
  var focusAction = createAction("focus");
  var keyboardEventsMiddleware = createListenerMiddleware();
  keyboardEventsMiddleware.startListening({
    actionCreator: keyDownAction,
    effect: (action, listenerApi) => {
      var state = listenerApi.getState();
      var accessibilityLayerIsActive = state.rootProps.accessibilityLayer !== false;
      if (!accessibilityLayerIsActive) {
        return;
      }
      var {
        keyboardInteraction
      } = state.tooltip;
      var key = action.payload;
      if (key !== "ArrowRight" && key !== "ArrowLeft" && key !== "Enter") {
        return;
      }
      var currentIndex = Number(combineActiveTooltipIndex(keyboardInteraction, selectTooltipDisplayedData(state)));
      var tooltipTicks = selectTooltipAxisTicks(state);
      if (key === "Enter") {
        var _coordinate = selectCoordinateForDefaultIndex(state, "axis", "hover", String(keyboardInteraction.index));
        listenerApi.dispatch(setKeyboardInteraction({
          active: !keyboardInteraction.active,
          activeIndex: keyboardInteraction.index,
          activeDataKey: keyboardInteraction.dataKey,
          activeCoordinate: _coordinate
        }));
        return;
      }
      var direction = selectChartDirection(state);
      var directionMultiplier = direction === "left-to-right" ? 1 : -1;
      var movement = key === "ArrowRight" ? 1 : -1;
      var nextIndex = currentIndex + movement * directionMultiplier;
      if (tooltipTicks == null || nextIndex >= tooltipTicks.length || nextIndex < 0) {
        return;
      }
      var coordinate = selectCoordinateForDefaultIndex(state, "axis", "hover", String(nextIndex));
      listenerApi.dispatch(setKeyboardInteraction({
        active: true,
        activeIndex: nextIndex.toString(),
        activeDataKey: void 0,
        activeCoordinate: coordinate
      }));
    }
  });
  keyboardEventsMiddleware.startListening({
    actionCreator: focusAction,
    effect: (_action, listenerApi) => {
      var state = listenerApi.getState();
      var accessibilityLayerIsActive = state.rootProps.accessibilityLayer !== false;
      if (!accessibilityLayerIsActive) {
        return;
      }
      var {
        keyboardInteraction
      } = state.tooltip;
      if (keyboardInteraction.active) {
        return;
      }
      if (keyboardInteraction.index == null) {
        var nextIndex = "0";
        var coordinate = selectCoordinateForDefaultIndex(state, "axis", "hover", String(nextIndex));
        listenerApi.dispatch(setKeyboardInteraction({
          activeDataKey: void 0,
          active: true,
          activeIndex: nextIndex,
          activeCoordinate: coordinate
        }));
      }
    }
  });

  // client/node_modules/recharts/es6/state/externalEventsMiddleware.js
  init_define_import_meta_env();
  var externalEventAction = createAction("externalEvent");
  var externalEventsMiddleware = createListenerMiddleware();
  externalEventsMiddleware.startListening({
    actionCreator: externalEventAction,
    effect: (action, listenerApi) => {
      if (action.payload.handler == null) {
        return;
      }
      var state = listenerApi.getState();
      var nextState = {
        activeCoordinate: selectActiveTooltipCoordinate(state),
        activeDataKey: selectActiveTooltipDataKey(state),
        activeIndex: selectActiveTooltipIndex(state),
        activeLabel: selectActiveLabel(state),
        activeTooltipIndex: selectActiveTooltipIndex(state),
        isTooltipActive: selectIsTooltipActive(state)
      };
      action.payload.handler(nextState, action.payload.reactEvent);
    }
  });

  // client/node_modules/recharts/es6/state/touchEventsMiddleware.js
  init_define_import_meta_env();

  // client/node_modules/recharts/es6/state/selectors/touchSelectors.js
  init_define_import_meta_env();
  var selectAllTooltipPayloadConfiguration = createSelector([selectTooltipState], (tooltipState) => tooltipState.tooltipItemPayloads);
  var selectTooltipCoordinate = createSelector([selectAllTooltipPayloadConfiguration, selectTooltipPayloadSearcher, (_state, tooltipIndex, _dataKey) => tooltipIndex, (_state, _tooltipIndex, dataKey) => dataKey], (allTooltipConfigurations, tooltipPayloadSearcher, tooltipIndex, dataKey) => {
    var mostRelevantTooltipConfiguration = allTooltipConfigurations.find((tooltipConfiguration) => {
      return tooltipConfiguration.settings.dataKey === dataKey;
    });
    if (mostRelevantTooltipConfiguration == null) {
      return void 0;
    }
    var {
      positions
    } = mostRelevantTooltipConfiguration;
    if (positions == null) {
      return void 0;
    }
    var maybePosition = tooltipPayloadSearcher(positions, tooltipIndex);
    return maybePosition;
  });

  // client/node_modules/recharts/es6/state/touchEventsMiddleware.js
  var touchEventAction = createAction("touchMove");
  var touchEventMiddleware = createListenerMiddleware();
  touchEventMiddleware.startListening({
    actionCreator: touchEventAction,
    effect: (action, listenerApi) => {
      var touchEvent = action.payload;
      var state = listenerApi.getState();
      var tooltipEventType = selectTooltipEventType(state, state.tooltip.settings.shared);
      if (tooltipEventType === "axis") {
        var activeProps = selectActivePropsFromChartPointer(state, getChartPointer({
          clientX: touchEvent.touches[0].clientX,
          clientY: touchEvent.touches[0].clientY,
          currentTarget: touchEvent.currentTarget
        }));
        if ((activeProps === null || activeProps === void 0 ? void 0 : activeProps.activeIndex) != null) {
          listenerApi.dispatch(setMouseOverAxisIndex({
            activeIndex: activeProps.activeIndex,
            activeDataKey: void 0,
            activeCoordinate: activeProps.activeCoordinate
          }));
        }
      } else if (tooltipEventType === "item") {
        var _target$getAttribute;
        var touch = touchEvent.touches[0];
        var target = document.elementFromPoint(touch.clientX, touch.clientY);
        if (!target || !target.getAttribute) {
          return;
        }
        var itemIndex = target.getAttribute(DATA_ITEM_INDEX_ATTRIBUTE_NAME);
        var dataKey = (_target$getAttribute = target.getAttribute(DATA_ITEM_DATAKEY_ATTRIBUTE_NAME)) !== null && _target$getAttribute !== void 0 ? _target$getAttribute : void 0;
        var coordinate = selectTooltipCoordinate(listenerApi.getState(), itemIndex, dataKey);
        listenerApi.dispatch(setActiveMouseOverItemIndex({
          activeDataKey: dataKey,
          activeIndex: itemIndex,
          activeCoordinate: coordinate
        }));
      }
    }
  });

  // client/node_modules/recharts/es6/state/store.js
  var rootReducer = combineReducers({
    brush: brushReducer,
    cartesianAxis: cartesianAxisReducer,
    chartData: chartDataReducer,
    graphicalItems: graphicalItemsReducer,
    layout: chartLayoutReducer,
    legend: legendReducer,
    options: optionsReducer,
    polarAxis: polarAxisReducer,
    polarOptions: polarOptionsReducer,
    referenceElements: referenceElementsReducer,
    rootProps: rootPropsReducer,
    tooltip: tooltipReducer
  });
  var createRechartsStore = function createRechartsStore2(preloadedState) {
    var chartName = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "Chart";
    return configureStore({
      reducer: rootReducer,
      // redux-toolkit v1 types are unhappy with the preloadedState type. Remove the `as any` when bumping to v2
      preloadedState,
      // @ts-expect-error redux-toolkit v1 types are unhappy with the middleware array. Remove this comment when bumping to v2
      middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: false
      }).concat([mouseClickMiddleware.middleware, mouseMoveMiddleware.middleware, keyboardEventsMiddleware.middleware, externalEventsMiddleware.middleware, touchEventMiddleware.middleware]),
      devTools: {
        serialize: {
          replacer: reduxDevtoolsJsonStringifyReplacer
        },
        name: "recharts-".concat(chartName)
      }
    });
  };

  // client/node_modules/recharts/es6/state/RechartsStoreProvider.js
  function RechartsStoreProvider(_ref) {
    var {
      preloadedState,
      children,
      reduxStoreName
    } = _ref;
    var isPanorama = useIsPanorama();
    var storeRef = (0, import_react28.useRef)(null);
    if (isPanorama) {
      return children;
    }
    if (storeRef.current == null) {
      storeRef.current = createRechartsStore(preloadedState, reduxStoreName);
    }
    var nonNullContext = RechartsReduxContext;
    return /* @__PURE__ */ React19.createElement(Provider_default, {
      context: nonNullContext,
      store: storeRef.current
    }, children);
  }

  // client/node_modules/recharts/es6/state/ReportMainChartProps.js
  init_define_import_meta_env();
  var import_react29 = __toESM(require_react_shim());
  function ReportMainChartProps(_ref) {
    var {
      layout,
      width,
      height,
      margin
    } = _ref;
    var dispatch = useAppDispatch();
    var isPanorama = useIsPanorama();
    (0, import_react29.useEffect)(() => {
      if (!isPanorama) {
        dispatch(setLayout(layout));
        dispatch(setChartSize({
          width,
          height
        }));
        dispatch(setMargin(margin));
      }
    }, [dispatch, isPanorama, layout, width, height, margin]);
    return null;
  }

  // client/node_modules/recharts/es6/state/ReportChartProps.js
  init_define_import_meta_env();
  var import_react30 = __toESM(require_react_shim());
  function ReportChartProps(props) {
    var dispatch = useAppDispatch();
    (0, import_react30.useEffect)(() => {
      dispatch(updateOptions(props));
    }, [dispatch, props]);
    return null;
  }

  // client/node_modules/recharts/es6/chart/CategoricalChart.js
  init_define_import_meta_env();
  var React22 = __toESM(require_react_shim());
  var import_react34 = __toESM(require_react_shim());

  // client/node_modules/recharts/es6/container/RootSurface.js
  init_define_import_meta_env();
  var React20 = __toESM(require_react_shim());
  var import_react31 = __toESM(require_react_shim());
  var _excluded10 = ["children"];
  function _objectWithoutProperties10(e, t) {
    if (null == e) return {};
    var o, r2, i = _objectWithoutPropertiesLoose10(e, t);
    if (Object.getOwnPropertySymbols) {
      var n = Object.getOwnPropertySymbols(e);
      for (r2 = 0; r2 < n.length; r2++) o = n[r2], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]);
    }
    return i;
  }
  function _objectWithoutPropertiesLoose10(r2, e) {
    if (null == r2) return {};
    var t = {};
    for (var n in r2) if ({}.hasOwnProperty.call(r2, n)) {
      if (-1 !== e.indexOf(n)) continue;
      t[n] = r2[n];
    }
    return t;
  }
  function _extends11() {
    return _extends11 = Object.assign ? Object.assign.bind() : function(n) {
      for (var e = 1; e < arguments.length; e++) {
        var t = arguments[e];
        for (var r2 in t) ({}).hasOwnProperty.call(t, r2) && (n[r2] = t[r2]);
      }
      return n;
    }, _extends11.apply(null, arguments);
  }
  var FULL_WIDTH_AND_HEIGHT = {
    width: "100%",
    height: "100%"
  };
  var MainChartSurface = /* @__PURE__ */ (0, import_react31.forwardRef)((props, ref) => {
    var width = useChartWidth();
    var height = useChartHeight();
    var hasAccessibilityLayer = useAccessibilityLayer();
    if (!isPositiveNumber(width) || !isPositiveNumber(height)) {
      return null;
    }
    var {
      children,
      otherAttributes,
      title,
      desc
    } = props;
    var tabIndex, role;
    if (typeof otherAttributes.tabIndex === "number") {
      tabIndex = otherAttributes.tabIndex;
    } else {
      tabIndex = hasAccessibilityLayer ? 0 : void 0;
    }
    if (typeof otherAttributes.role === "string") {
      role = otherAttributes.role;
    } else {
      role = hasAccessibilityLayer ? "application" : void 0;
    }
    return /* @__PURE__ */ React20.createElement(Surface, _extends11({}, otherAttributes, {
      title,
      desc,
      role,
      tabIndex,
      width,
      height,
      style: FULL_WIDTH_AND_HEIGHT,
      ref
    }), children);
  });
  var BrushPanoramaSurface = (_ref) => {
    var {
      children
    } = _ref;
    var brushDimensions = useAppSelector(selectBrushDimensions);
    if (!brushDimensions) {
      return null;
    }
    var {
      width,
      height,
      y: y2,
      x: x2
    } = brushDimensions;
    return /* @__PURE__ */ React20.createElement(Surface, {
      width,
      height,
      x: x2,
      y: y2
    }, children);
  };
  var RootSurface = /* @__PURE__ */ (0, import_react31.forwardRef)((_ref2, ref) => {
    var {
      children
    } = _ref2, rest = _objectWithoutProperties10(_ref2, _excluded10);
    var isPanorama = useIsPanorama();
    if (isPanorama) {
      return /* @__PURE__ */ React20.createElement(BrushPanoramaSurface, null, children);
    }
    return /* @__PURE__ */ React20.createElement(MainChartSurface, _extends11({
      ref
    }, rest), children);
  });

  // client/node_modules/recharts/es6/chart/RechartsWrapper.js
  init_define_import_meta_env();
  var React21 = __toESM(require_react_shim());
  var import_react33 = __toESM(require_react_shim());

  // client/node_modules/recharts/es6/util/useReportScale.js
  init_define_import_meta_env();
  var import_react32 = __toESM(require_react_shim());
  function useReportScale() {
    var dispatch = useAppDispatch();
    var [ref, setRef] = (0, import_react32.useState)(null);
    var scale = useAppSelector(selectContainerScale);
    (0, import_react32.useEffect)(() => {
      if (ref == null) {
        return;
      }
      var rect = ref.getBoundingClientRect();
      var newScale = rect.width / ref.offsetWidth;
      if (isWellBehavedNumber(newScale) && newScale !== scale) {
        dispatch(setScale(newScale));
      }
    }, [ref, dispatch, scale]);
    return setRef;
  }

  // client/node_modules/recharts/es6/chart/RechartsWrapper.js
  function ownKeys20(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread20(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys20(Object(t), true).forEach(function(r3) {
        _defineProperty21(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys20(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  function _defineProperty21(e, r2, t) {
    return (r2 = _toPropertyKey21(r2)) in e ? Object.defineProperty(e, r2, { value: t, enumerable: true, configurable: true, writable: true }) : e[r2] = t, e;
  }
  function _toPropertyKey21(t) {
    var i = _toPrimitive21(t, "string");
    return "symbol" == typeof i ? i : i + "";
  }
  function _toPrimitive21(t, r2) {
    if ("object" != typeof t || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r2 || "default");
      if ("object" != typeof i) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r2 ? String : Number)(t);
  }
  var RechartsWrapper = /* @__PURE__ */ (0, import_react33.forwardRef)((_ref, ref) => {
    var {
      children,
      className: className8,
      height,
      onClick,
      onContextMenu,
      onDoubleClick,
      onMouseDown,
      onMouseEnter,
      onMouseLeave,
      onMouseMove,
      onMouseUp,
      onTouchEnd,
      onTouchMove,
      onTouchStart,
      style,
      width
    } = _ref;
    var dispatch = useAppDispatch();
    var [tooltipPortal, setTooltipPortal] = (0, import_react33.useState)(null);
    var [legendPortal, setLegendPortal] = (0, import_react33.useState)(null);
    useSynchronisedEventsFromOtherCharts();
    var setScaleRef = useReportScale();
    var innerRef = (0, import_react33.useCallback)((node) => {
      setScaleRef(node);
      if (typeof ref === "function") {
        ref(node);
      }
      setTooltipPortal(node);
      setLegendPortal(node);
    }, [setScaleRef, ref, setTooltipPortal, setLegendPortal]);
    var myOnClick = (0, import_react33.useCallback)((e) => {
      dispatch(mouseClickAction(e));
      dispatch(externalEventAction({
        handler: onClick,
        reactEvent: e
      }));
    }, [dispatch, onClick]);
    var myOnMouseEnter = (0, import_react33.useCallback)((e) => {
      dispatch(mouseMoveAction(e));
      dispatch(externalEventAction({
        handler: onMouseEnter,
        reactEvent: e
      }));
    }, [dispatch, onMouseEnter]);
    var myOnMouseLeave = (0, import_react33.useCallback)((e) => {
      dispatch(mouseLeaveChart());
      dispatch(externalEventAction({
        handler: onMouseLeave,
        reactEvent: e
      }));
    }, [dispatch, onMouseLeave]);
    var myOnMouseMove = (0, import_react33.useCallback)((e) => {
      dispatch(mouseMoveAction(e));
      dispatch(externalEventAction({
        handler: onMouseMove,
        reactEvent: e
      }));
    }, [dispatch, onMouseMove]);
    var onFocus = (0, import_react33.useCallback)(() => {
      dispatch(focusAction());
    }, [dispatch]);
    var onKeyDown = (0, import_react33.useCallback)((e) => {
      dispatch(keyDownAction(e.key));
    }, [dispatch]);
    var myOnContextMenu = (0, import_react33.useCallback)((e) => {
      dispatch(externalEventAction({
        handler: onContextMenu,
        reactEvent: e
      }));
    }, [dispatch, onContextMenu]);
    var myOnDoubleClick = (0, import_react33.useCallback)((e) => {
      dispatch(externalEventAction({
        handler: onDoubleClick,
        reactEvent: e
      }));
    }, [dispatch, onDoubleClick]);
    var myOnMouseDown = (0, import_react33.useCallback)((e) => {
      dispatch(externalEventAction({
        handler: onMouseDown,
        reactEvent: e
      }));
    }, [dispatch, onMouseDown]);
    var myOnMouseUp = (0, import_react33.useCallback)((e) => {
      dispatch(externalEventAction({
        handler: onMouseUp,
        reactEvent: e
      }));
    }, [dispatch, onMouseUp]);
    var myOnTouchStart = (0, import_react33.useCallback)((e) => {
      dispatch(externalEventAction({
        handler: onTouchStart,
        reactEvent: e
      }));
    }, [dispatch, onTouchStart]);
    var myOnTouchMove = (0, import_react33.useCallback)((e) => {
      dispatch(touchEventAction(e));
      dispatch(externalEventAction({
        handler: onTouchMove,
        reactEvent: e
      }));
    }, [dispatch, onTouchMove]);
    var myOnTouchEnd = (0, import_react33.useCallback)((e) => {
      dispatch(externalEventAction({
        handler: onTouchEnd,
        reactEvent: e
      }));
    }, [dispatch, onTouchEnd]);
    return /* @__PURE__ */ React21.createElement(TooltipPortalContext.Provider, {
      value: tooltipPortal
    }, /* @__PURE__ */ React21.createElement(LegendPortalContext.Provider, {
      value: legendPortal
    }, /* @__PURE__ */ React21.createElement("div", {
      className: clsx("recharts-wrapper", className8),
      style: _objectSpread20({
        position: "relative",
        cursor: "default",
        width,
        height
      }, style),
      role: "application",
      onClick: myOnClick,
      onContextMenu: myOnContextMenu,
      onDoubleClick: myOnDoubleClick,
      onFocus,
      onKeyDown,
      onMouseDown: myOnMouseDown,
      onMouseEnter: myOnMouseEnter,
      onMouseLeave: myOnMouseLeave,
      onMouseMove: myOnMouseMove,
      onMouseUp: myOnMouseUp,
      onTouchEnd: myOnTouchEnd,
      onTouchMove: myOnTouchMove,
      onTouchStart: myOnTouchStart,
      ref: innerRef
    }, children)));
  });

  // client/node_modules/recharts/es6/chart/CategoricalChart.js
  var _excluded11 = ["children", "className", "width", "height", "style", "compact", "title", "desc"];
  function _objectWithoutProperties11(e, t) {
    if (null == e) return {};
    var o, r2, i = _objectWithoutPropertiesLoose11(e, t);
    if (Object.getOwnPropertySymbols) {
      var n = Object.getOwnPropertySymbols(e);
      for (r2 = 0; r2 < n.length; r2++) o = n[r2], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]);
    }
    return i;
  }
  function _objectWithoutPropertiesLoose11(r2, e) {
    if (null == r2) return {};
    var t = {};
    for (var n in r2) if ({}.hasOwnProperty.call(r2, n)) {
      if (-1 !== e.indexOf(n)) continue;
      t[n] = r2[n];
    }
    return t;
  }
  var CategoricalChart = /* @__PURE__ */ (0, import_react34.forwardRef)((props, ref) => {
    var {
      children,
      className: className8,
      width,
      height,
      style,
      compact,
      title,
      desc
    } = props, others = _objectWithoutProperties11(props, _excluded11);
    var attrs = filterProps(others, false);
    if (compact) {
      return /* @__PURE__ */ React22.createElement(RootSurface, {
        otherAttributes: attrs,
        title,
        desc
      }, children);
    }
    return /* @__PURE__ */ React22.createElement(RechartsWrapper, {
      className: className8,
      style,
      width,
      height,
      onClick: props.onClick,
      onMouseLeave: props.onMouseLeave,
      onMouseEnter: props.onMouseEnter,
      onMouseMove: props.onMouseMove,
      onMouseDown: props.onMouseDown,
      onMouseUp: props.onMouseUp,
      onContextMenu: props.onContextMenu,
      onDoubleClick: props.onDoubleClick,
      onTouchStart: props.onTouchStart,
      onTouchMove: props.onTouchMove,
      onTouchEnd: props.onTouchEnd
    }, /* @__PURE__ */ React22.createElement(RootSurface, {
      otherAttributes: attrs,
      title,
      desc,
      ref
    }, /* @__PURE__ */ React22.createElement(ClipPathProvider, null, children)));
  });

  // client/node_modules/recharts/es6/chart/CartesianChart.js
  var _excluded12 = ["width", "height"];
  function _extends12() {
    return _extends12 = Object.assign ? Object.assign.bind() : function(n) {
      for (var e = 1; e < arguments.length; e++) {
        var t = arguments[e];
        for (var r2 in t) ({}).hasOwnProperty.call(t, r2) && (n[r2] = t[r2]);
      }
      return n;
    }, _extends12.apply(null, arguments);
  }
  function _objectWithoutProperties12(e, t) {
    if (null == e) return {};
    var o, r2, i = _objectWithoutPropertiesLoose12(e, t);
    if (Object.getOwnPropertySymbols) {
      var n = Object.getOwnPropertySymbols(e);
      for (r2 = 0; r2 < n.length; r2++) o = n[r2], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]);
    }
    return i;
  }
  function _objectWithoutPropertiesLoose12(r2, e) {
    if (null == r2) return {};
    var t = {};
    for (var n in r2) if ({}.hasOwnProperty.call(r2, n)) {
      if (-1 !== e.indexOf(n)) continue;
      t[n] = r2[n];
    }
    return t;
  }
  var defaultMargin = {
    top: 5,
    right: 5,
    bottom: 5,
    left: 5
  };
  var defaultProps = {
    accessibilityLayer: true,
    layout: "horizontal",
    stackOffset: "none",
    barCategoryGap: "10%",
    barGap: 4,
    margin: defaultMargin,
    reverseStackOrder: false,
    syncMethod: "index"
  };
  var CartesianChart = /* @__PURE__ */ (0, import_react35.forwardRef)(function CartesianChart2(props, ref) {
    var _categoricalChartProp;
    var rootChartProps = resolveDefaultProps(props.categoricalChartProps, defaultProps);
    var {
      width,
      height
    } = rootChartProps, otherCategoricalProps = _objectWithoutProperties12(rootChartProps, _excluded12);
    if (!isPositiveNumber(width) || !isPositiveNumber(height)) {
      return null;
    }
    var {
      chartName,
      defaultTooltipEventType,
      validateTooltipEventTypes,
      tooltipPayloadSearcher,
      categoricalChartProps
    } = props;
    var options = {
      chartName,
      defaultTooltipEventType,
      validateTooltipEventTypes,
      tooltipPayloadSearcher,
      eventEmitter: void 0
    };
    return /* @__PURE__ */ React23.createElement(RechartsStoreProvider, {
      preloadedState: {
        options
      },
      reduxStoreName: (_categoricalChartProp = categoricalChartProps.id) !== null && _categoricalChartProp !== void 0 ? _categoricalChartProp : chartName
    }, /* @__PURE__ */ React23.createElement(ChartDataContextProvider, {
      chartData: categoricalChartProps.data
    }), /* @__PURE__ */ React23.createElement(ReportMainChartProps, {
      width,
      height,
      layout: rootChartProps.layout,
      margin: rootChartProps.margin
    }), /* @__PURE__ */ React23.createElement(ReportChartProps, {
      accessibilityLayer: rootChartProps.accessibilityLayer,
      barCategoryGap: rootChartProps.barCategoryGap,
      maxBarSize: rootChartProps.maxBarSize,
      stackOffset: rootChartProps.stackOffset,
      barGap: rootChartProps.barGap,
      barSize: rootChartProps.barSize,
      syncId: rootChartProps.syncId,
      syncMethod: rootChartProps.syncMethod,
      className: rootChartProps.className
    }), /* @__PURE__ */ React23.createElement(CategoricalChart, _extends12({}, otherCategoricalProps, {
      width,
      height,
      ref
    })));
  });

  // client/node_modules/recharts/es6/chart/LineChart.js
  var allowedTooltipTypes = ["axis"];
  var LineChart = /* @__PURE__ */ (0, import_react36.forwardRef)((props, ref) => {
    return /* @__PURE__ */ React24.createElement(CartesianChart, {
      chartName: "LineChart",
      defaultTooltipEventType: "axis",
      validateTooltipEventTypes: allowedTooltipTypes,
      tooltipPayloadSearcher: arrayTooltipSearcher,
      categoricalChartProps: props,
      ref
    });
  });

  // client/src/components/SummaryCard.jsx
  var SummaryCard = ({
    title,
    value,
    year,
    percentChange,
    isPositive,
    chartData,
    lineColor
  }) => {
    const formatValue = (val) => {
      if (typeof val === "number") {
        if (val >= 1e6) {
          return `$${(val / 1e6).toFixed(1)}M`;
        } else if (val >= 1e3) {
          return `$${(val / 1e3).toFixed(0)}k`;
        } else {
          return val.toString();
        }
      }
      return val;
    };
    return /* @__PURE__ */ import_react37.default.createElement("div", { className: "summary-card" }, /* @__PURE__ */ import_react37.default.createElement("div", { className: "card-content" }, /* @__PURE__ */ import_react37.default.createElement("div", { className: "card-header" }, /* @__PURE__ */ import_react37.default.createElement("span", { className: "card-year" }, year)), /* @__PURE__ */ import_react37.default.createElement("div", { className: "card-main" }, /* @__PURE__ */ import_react37.default.createElement("h3", { className: "card-title" }, title), /* @__PURE__ */ import_react37.default.createElement("p", { className: "card-value" }, formatValue(value)), /* @__PURE__ */ import_react37.default.createElement("div", { className: `card-trend ${isPositive ? "positive" : "negative"}` }, /* @__PURE__ */ import_react37.default.createElement("span", { className: "trend-arrow" }, isPositive ? "\u2197" : "\u2198"), /* @__PURE__ */ import_react37.default.createElement("span", { className: "trend-percentage" }, isPositive ? "+" : "", percentChange, "%")))), /* @__PURE__ */ import_react37.default.createElement("div", { className: "card-sparkline" }, /* @__PURE__ */ import_react37.default.createElement(ResponsiveContainer, { width: "100%", height: 60 }, /* @__PURE__ */ import_react37.default.createElement(LineChart, { data: chartData }, /* @__PURE__ */ import_react37.default.createElement(
      Line,
      {
        type: "monotone",
        dataKey: "value",
        stroke: lineColor,
        strokeWidth: 2,
        dot: false,
        activeDot: false
      }
    )))));
  };
  var SummaryCard_default = SummaryCard;

  // client/src/components/SearchableDropdown.jsx
  init_define_import_meta_env();
  var import_react38 = __toESM(require_react_shim());
  var SearchableDropdown = ({
    options = [],
    value,
    onChange,
    placeholder,
    getOptionLabel = (option) => option.name,
    getOptionValue = (option) => option.id,
    className: className8 = "",
    disabled = false,
    isLoading = false,
    error = null,
    renderOption = null,
    optionGroups = null,
    "aria-label": ariaLabel = "Searchable dropdown"
  }) => {
    const [isOpen, setIsOpen] = (0, import_react38.useState)(false);
    const [searchTerm, setSearchTerm] = (0, import_react38.useState)("");
    const [filteredOptions, setFilteredOptions] = (0, import_react38.useState)(options);
    const [focusedIndex, setFocusedIndex] = (0, import_react38.useState)(-1);
    const dropdownRef = (0, import_react38.useRef)(null);
    const inputRef = (0, import_react38.useRef)(null);
    const listRef = (0, import_react38.useRef)(null);
    (0, import_react38.useEffect)(() => {
      if (searchTerm.trim() === "") {
        setFilteredOptions(options);
      } else {
        const filtered = options.filter(
          (option) => getOptionLabel(option).toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredOptions(filtered);
      }
    }, [searchTerm, options, getOptionLabel]);
    (0, import_react38.useEffect)(() => {
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setIsOpen(false);
          setSearchTerm("");
          setFocusedIndex(-1);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    const handleKeyDown = (e) => {
      if (!isOpen) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setIsOpen(true);
          inputRef.current?.focus();
        }
        return;
      }
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setFocusedIndex(
            (prev) => prev < filteredOptions.length - 1 ? prev + 1 : prev
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setFocusedIndex((prev) => prev > 0 ? prev - 1 : prev);
          break;
        case "Enter":
          e.preventDefault();
          if (focusedIndex >= 0 && focusedIndex < filteredOptions.length) {
            handleSelect(filteredOptions[focusedIndex]);
          }
          break;
        case "Escape":
          e.preventDefault();
          setIsOpen(false);
          setSearchTerm("");
          setFocusedIndex(-1);
          break;
        default:
          break;
      }
    };
    (0, import_react38.useEffect)(() => {
      if (focusedIndex >= 0 && listRef.current) {
        const focusedItem = listRef.current.children[focusedIndex];
        if (focusedItem) {
          focusedItem.scrollIntoView({ block: "nearest" });
        }
      }
    }, [focusedIndex]);
    const handleSelect = (option) => {
      onChange(option);
      setIsOpen(false);
      setSearchTerm("");
      setFocusedIndex(-1);
    };
    const handleInputChange = (e) => {
      setSearchTerm(e.target.value);
      setIsOpen(true);
      setFocusedIndex(-1);
    };
    const handleInputClick = (e) => {
      e.stopPropagation();
      if (!disabled) {
        setIsOpen(true);
        inputRef.current?.focus();
      }
    };
    const handleHeaderClick = () => {
      if (!disabled) {
        setIsOpen(!isOpen);
        if (!isOpen) {
          inputRef.current?.focus();
        }
      }
    };
    const selectedOption = options.find((opt) => getOptionValue(opt) === value);
    const getInputValue = () => {
      if (searchTerm !== "") {
        return searchTerm;
      }
      return selectedOption ? getOptionLabel(selectedOption) : "";
    };
    const renderOptionContent = (option) => {
      if (renderOption) {
        return renderOption(option);
      }
      return getOptionLabel(option);
    };
    const renderOptions = () => {
      if (isLoading) {
        return /* @__PURE__ */ import_react38.default.createElement("div", { className: "dropdown-item loading" }, "Loading...");
      }
      if (error) {
        return /* @__PURE__ */ import_react38.default.createElement("div", { className: "dropdown-item error" }, error);
      }
      if (filteredOptions.length === 0) {
        return /* @__PURE__ */ import_react38.default.createElement("div", { className: "dropdown-item no-results" }, "No results found");
      }
      if (optionGroups) {
        return Object.entries(optionGroups).map(([groupName, groupOptions]) => /* @__PURE__ */ import_react38.default.createElement("div", { key: groupName, className: "option-group" }, /* @__PURE__ */ import_react38.default.createElement("div", { className: "option-group-header" }, groupName), groupOptions.map((option) => /* @__PURE__ */ import_react38.default.createElement(
          "div",
          {
            key: getOptionValue(option),
            className: `dropdown-item ${focusedIndex === filteredOptions.indexOf(option) ? "focused" : ""}`,
            onClick: () => handleSelect(option),
            role: "option",
            "aria-selected": focusedIndex === filteredOptions.indexOf(option)
          },
          renderOptionContent(option)
        ))));
      }
      return filteredOptions.map((option, index) => /* @__PURE__ */ import_react38.default.createElement(
        "div",
        {
          key: getOptionValue(option),
          className: `dropdown-item ${focusedIndex === index ? "focused" : ""}`,
          onClick: () => handleSelect(option),
          role: "option",
          "aria-selected": focusedIndex === index
        },
        renderOptionContent(option)
      ));
    };
    return /* @__PURE__ */ import_react38.default.createElement(
      "div",
      {
        className: `searchable-dropdown ${className8} ${error ? "error" : ""}`,
        ref: dropdownRef,
        role: "combobox",
        "aria-expanded": isOpen,
        "aria-haspopup": "listbox",
        "aria-label": ariaLabel
      },
      /* @__PURE__ */ import_react38.default.createElement(
        "div",
        {
          className: "dropdown-header",
          onClick: handleHeaderClick
        },
        /* @__PURE__ */ import_react38.default.createElement(
          "input",
          {
            ref: inputRef,
            type: "text",
            value: getInputValue(),
            onChange: handleInputChange,
            onClick: handleInputClick,
            onKeyDown: handleKeyDown,
            placeholder,
            disabled,
            "aria-autocomplete": "list",
            "aria-controls": "dropdown-list",
            readOnly: disabled
          }
        ),
        /* @__PURE__ */ import_react38.default.createElement("span", { className: "dropdown-arrow" }, "\u25BC")
      ),
      isOpen && /* @__PURE__ */ import_react38.default.createElement(
        "div",
        {
          className: "dropdown-list",
          ref: listRef,
          role: "listbox",
          id: "dropdown-list"
        },
        renderOptions()
      )
    );
  };
  var SearchableDropdown_default = SearchableDropdown;

  // client/src/components/ActionButtons.jsx
  init_define_import_meta_env();
  var import_react39 = __toESM(require_react_shim());
  function ActionButtons() {
    return /* @__PURE__ */ import_react39.default.createElement("div", { className: "sidebar-actions" }, /* @__PURE__ */ import_react39.default.createElement("button", { className: "action-button reschedule" }, /* @__PURE__ */ import_react39.default.createElement("i", { className: "fas fa-calendar-alt" }), "Reschedule"), /* @__PURE__ */ import_react39.default.createElement("button", { className: "action-button add-event" }, /* @__PURE__ */ import_react39.default.createElement("i", { className: "fas fa-plus" }), "Add Event"), /* @__PURE__ */ import_react39.default.createElement("button", { className: "action-button import-export" }, /* @__PURE__ */ import_react39.default.createElement("i", { className: "fas fa-file-import" }), "Import/Export"));
  }
  var ActionButtons_default = ActionButtons;

  // client/src/components/CalendarWidget.jsx
  init_define_import_meta_env();
  var import_react60 = __toESM(require_react_shim());

  // client/node_modules/react-calendar/dist/esm/index.js
  init_define_import_meta_env();

  // client/node_modules/react-calendar/dist/esm/Calendar.js
  init_define_import_meta_env();
  var import_react59 = __toESM(require_react_shim(), 1);
  var import_prop_types5 = __toESM(require_prop_types(), 1);

  // client/node_modules/react-calendar/dist/esm/Calendar/Navigation.js
  init_define_import_meta_env();
  var import_react40 = __toESM(require_react_shim(), 1);

  // client/node_modules/get-user-locale/dist/esm/index.js
  init_define_import_meta_env();
  var import_mem = __toESM(require_dist2(), 1);
  function isString(el) {
    return typeof el === "string";
  }
  function isUnique(el, index, arr) {
    return arr.indexOf(el) === index;
  }
  function isAllLowerCase(el) {
    return el.toLowerCase() === el;
  }
  function fixCommas(el) {
    return el.indexOf(",") === -1 ? el : el.split(",");
  }
  function normalizeLocale(locale3) {
    if (!locale3) {
      return locale3;
    }
    if (locale3 === "C" || locale3 === "posix" || locale3 === "POSIX") {
      return "en-US";
    }
    if (locale3.indexOf(".") !== -1) {
      var _a3 = locale3.split(".")[0], actualLocale = _a3 === void 0 ? "" : _a3;
      return normalizeLocale(actualLocale);
    }
    if (locale3.indexOf("@") !== -1) {
      var _b = locale3.split("@")[0], actualLocale = _b === void 0 ? "" : _b;
      return normalizeLocale(actualLocale);
    }
    if (locale3.indexOf("-") === -1 || !isAllLowerCase(locale3)) {
      return locale3;
    }
    var _c = locale3.split("-"), splitEl1 = _c[0], _d = _c[1], splitEl2 = _d === void 0 ? "" : _d;
    return "".concat(splitEl1, "-").concat(splitEl2.toUpperCase());
  }
  function getUserLocalesInternal(_a3) {
    var _b = _a3 === void 0 ? {} : _a3, _c = _b.useFallbackLocale, useFallbackLocale = _c === void 0 ? true : _c, _d = _b.fallbackLocale, fallbackLocale = _d === void 0 ? "en-US" : _d;
    var languageList = [];
    if (typeof navigator !== "undefined") {
      var rawLanguages = navigator.languages || [];
      var languages = [];
      for (var _i = 0, rawLanguages_1 = rawLanguages; _i < rawLanguages_1.length; _i++) {
        var rawLanguagesItem = rawLanguages_1[_i];
        languages = languages.concat(fixCommas(rawLanguagesItem));
      }
      var rawLanguage = navigator.language;
      var language = rawLanguage ? fixCommas(rawLanguage) : rawLanguage;
      languageList = languageList.concat(languages, language);
    }
    if (useFallbackLocale) {
      languageList.push(fallbackLocale);
    }
    return languageList.filter(isString).map(normalizeLocale).filter(isUnique);
  }
  var getUserLocales = (0, import_mem.default)(getUserLocalesInternal, { cacheKey: JSON.stringify });
  function getUserLocaleInternal(options) {
    return getUserLocales(options)[0] || null;
  }
  var getUserLocale = (0, import_mem.default)(getUserLocaleInternal, { cacheKey: JSON.stringify });
  var esm_default = getUserLocale;

  // client/node_modules/react-calendar/dist/esm/shared/dates.js
  init_define_import_meta_env();

  // client/node_modules/@wojtekmaj/date-utils/dist/esm/index.js
  init_define_import_meta_env();
  function makeGetEdgeOfNeighbor(getPeriod, getEdgeOfPeriod, defaultOffset) {
    return function makeGetEdgeOfNeighborInternal(date2, offset) {
      if (offset === void 0) {
        offset = defaultOffset;
      }
      var previousPeriod = getPeriod(date2) + offset;
      return getEdgeOfPeriod(previousPeriod);
    };
  }
  function makeGetEnd(getBeginOfNextPeriod) {
    return function makeGetEndInternal(date2) {
      return new Date(getBeginOfNextPeriod(date2).getTime() - 1);
    };
  }
  function makeGetRange(getStart, getEnd2) {
    return function makeGetRangeInternal(date2) {
      return [getStart(date2), getEnd2(date2)];
    };
  }
  function getYear(date2) {
    if (date2 instanceof Date) {
      return date2.getFullYear();
    }
    if (typeof date2 === "number") {
      return date2;
    }
    var year = parseInt(date2, 10);
    if (typeof date2 === "string" && !isNaN(year)) {
      return year;
    }
    throw new Error("Failed to get year from date: ".concat(date2, "."));
  }
  function getMonth(date2) {
    if (date2 instanceof Date) {
      return date2.getMonth();
    }
    throw new Error("Failed to get month from date: ".concat(date2, "."));
  }
  function getDate(date2) {
    if (date2 instanceof Date) {
      return date2.getDate();
    }
    throw new Error("Failed to get year from date: ".concat(date2, "."));
  }
  function getCenturyStart(date2) {
    var year = getYear(date2);
    var centuryStartYear = year + (-year + 1) % 100;
    var centuryStartDate = /* @__PURE__ */ new Date();
    centuryStartDate.setFullYear(centuryStartYear, 0, 1);
    centuryStartDate.setHours(0, 0, 0, 0);
    return centuryStartDate;
  }
  var getPreviousCenturyStart = makeGetEdgeOfNeighbor(getYear, getCenturyStart, -100);
  var getNextCenturyStart = makeGetEdgeOfNeighbor(getYear, getCenturyStart, 100);
  var getCenturyEnd = makeGetEnd(getNextCenturyStart);
  var getPreviousCenturyEnd = makeGetEdgeOfNeighbor(getYear, getCenturyEnd, -100);
  var getNextCenturyEnd = makeGetEdgeOfNeighbor(getYear, getCenturyEnd, 100);
  var getCenturyRange = makeGetRange(getCenturyStart, getCenturyEnd);
  function getDecadeStart(date2) {
    var year = getYear(date2);
    var decadeStartYear = year + (-year + 1) % 10;
    var decadeStartDate = /* @__PURE__ */ new Date();
    decadeStartDate.setFullYear(decadeStartYear, 0, 1);
    decadeStartDate.setHours(0, 0, 0, 0);
    return decadeStartDate;
  }
  var getPreviousDecadeStart = makeGetEdgeOfNeighbor(getYear, getDecadeStart, -10);
  var getNextDecadeStart = makeGetEdgeOfNeighbor(getYear, getDecadeStart, 10);
  var getDecadeEnd = makeGetEnd(getNextDecadeStart);
  var getPreviousDecadeEnd = makeGetEdgeOfNeighbor(getYear, getDecadeEnd, -10);
  var getNextDecadeEnd = makeGetEdgeOfNeighbor(getYear, getDecadeEnd, 10);
  var getDecadeRange = makeGetRange(getDecadeStart, getDecadeEnd);
  function getYearStart(date2) {
    var year = getYear(date2);
    var yearStartDate = /* @__PURE__ */ new Date();
    yearStartDate.setFullYear(year, 0, 1);
    yearStartDate.setHours(0, 0, 0, 0);
    return yearStartDate;
  }
  var getPreviousYearStart = makeGetEdgeOfNeighbor(getYear, getYearStart, -1);
  var getNextYearStart = makeGetEdgeOfNeighbor(getYear, getYearStart, 1);
  var getYearEnd = makeGetEnd(getNextYearStart);
  var getPreviousYearEnd = makeGetEdgeOfNeighbor(getYear, getYearEnd, -1);
  var getNextYearEnd = makeGetEdgeOfNeighbor(getYear, getYearEnd, 1);
  var getYearRange = makeGetRange(getYearStart, getYearEnd);
  function makeGetEdgeOfNeighborMonth(getEdgeOfPeriod, defaultOffset) {
    return function makeGetEdgeOfNeighborMonthInternal(date2, offset) {
      if (offset === void 0) {
        offset = defaultOffset;
      }
      var year = getYear(date2);
      var month = getMonth(date2) + offset;
      var previousPeriod = /* @__PURE__ */ new Date();
      previousPeriod.setFullYear(year, month, 1);
      previousPeriod.setHours(0, 0, 0, 0);
      return getEdgeOfPeriod(previousPeriod);
    };
  }
  function getMonthStart(date2) {
    var year = getYear(date2);
    var month = getMonth(date2);
    var monthStartDate = /* @__PURE__ */ new Date();
    monthStartDate.setFullYear(year, month, 1);
    monthStartDate.setHours(0, 0, 0, 0);
    return monthStartDate;
  }
  var getPreviousMonthStart = makeGetEdgeOfNeighborMonth(getMonthStart, -1);
  var getNextMonthStart = makeGetEdgeOfNeighborMonth(getMonthStart, 1);
  var getMonthEnd = makeGetEnd(getNextMonthStart);
  var getPreviousMonthEnd = makeGetEdgeOfNeighborMonth(getMonthEnd, -1);
  var getNextMonthEnd = makeGetEdgeOfNeighborMonth(getMonthEnd, 1);
  var getMonthRange = makeGetRange(getMonthStart, getMonthEnd);
  function makeGetEdgeOfNeighborDay(getEdgeOfPeriod, defaultOffset) {
    return function makeGetEdgeOfNeighborDayInternal(date2, offset) {
      if (offset === void 0) {
        offset = defaultOffset;
      }
      var year = getYear(date2);
      var month = getMonth(date2);
      var day = getDate(date2) + offset;
      var previousPeriod = /* @__PURE__ */ new Date();
      previousPeriod.setFullYear(year, month, day);
      previousPeriod.setHours(0, 0, 0, 0);
      return getEdgeOfPeriod(previousPeriod);
    };
  }
  function getDayStart(date2) {
    var year = getYear(date2);
    var month = getMonth(date2);
    var day = getDate(date2);
    var dayStartDate = /* @__PURE__ */ new Date();
    dayStartDate.setFullYear(year, month, day);
    dayStartDate.setHours(0, 0, 0, 0);
    return dayStartDate;
  }
  var getPreviousDayStart = makeGetEdgeOfNeighborDay(getDayStart, -1);
  var getNextDayStart = makeGetEdgeOfNeighborDay(getDayStart, 1);
  var getDayEnd = makeGetEnd(getNextDayStart);
  var getPreviousDayEnd = makeGetEdgeOfNeighborDay(getDayEnd, -1);
  var getNextDayEnd = makeGetEdgeOfNeighborDay(getDayEnd, 1);
  var getDayRange = makeGetRange(getDayStart, getDayEnd);
  function getDaysInMonth(date2) {
    return getDate(getMonthEnd(date2));
  }

  // client/node_modules/react-calendar/dist/esm/shared/const.js
  init_define_import_meta_env();
  var _a;
  var CALENDAR_TYPES = {
    GREGORY: "gregory",
    HEBREW: "hebrew",
    ISLAMIC: "islamic",
    ISO_8601: "iso8601"
  };
  var DEPRECATED_CALENDAR_TYPES = {
    ARABIC: "Arabic",
    HEBREW: "Hebrew",
    ISO_8601: "ISO 8601",
    US: "US"
  };
  var CALENDAR_TYPE_LOCALES = (_a = {}, _a[CALENDAR_TYPES.GREGORY] = [
    "en-CA",
    "en-US",
    "es-AR",
    "es-BO",
    "es-CL",
    "es-CO",
    "es-CR",
    "es-DO",
    "es-EC",
    "es-GT",
    "es-HN",
    "es-MX",
    "es-NI",
    "es-PA",
    "es-PE",
    "es-PR",
    "es-SV",
    "es-VE",
    "pt-BR"
  ], _a[CALENDAR_TYPES.HEBREW] = ["he", "he-IL"], _a[CALENDAR_TYPES.ISLAMIC] = [
    // ar-LB, ar-MA intentionally missing
    "ar",
    "ar-AE",
    "ar-BH",
    "ar-DZ",
    "ar-EG",
    "ar-IQ",
    "ar-JO",
    "ar-KW",
    "ar-LY",
    "ar-OM",
    "ar-QA",
    "ar-SA",
    "ar-SD",
    "ar-SY",
    "ar-YE",
    "dv",
    "dv-MV",
    "ps",
    "ps-AR"
  ], _a);
  var WEEKDAYS = [0, 1, 2, 3, 4, 5, 6];

  // client/node_modules/react-calendar/dist/esm/shared/dateFormatter.js
  init_define_import_meta_env();
  var formatterCache = /* @__PURE__ */ new Map();
  function getFormatter(options) {
    return function formatter(locale3, date2) {
      var localeWithDefault = locale3 || esm_default();
      if (!formatterCache.has(localeWithDefault)) {
        formatterCache.set(localeWithDefault, /* @__PURE__ */ new Map());
      }
      var formatterCacheLocale = formatterCache.get(localeWithDefault);
      if (!formatterCacheLocale.has(options)) {
        formatterCacheLocale.set(options, new Intl.DateTimeFormat(localeWithDefault || void 0, options).format);
      }
      return formatterCacheLocale.get(options)(date2);
    };
  }
  function toSafeHour(date2) {
    var safeDate = new Date(date2);
    return new Date(safeDate.setHours(12));
  }
  function getSafeFormatter(options) {
    return function(locale3, date2) {
      return getFormatter(options)(locale3, toSafeHour(date2));
    };
  }
  var formatDateOptions = {
    day: "numeric",
    month: "numeric",
    year: "numeric"
  };
  var formatDayOptions = { day: "numeric" };
  var formatLongDateOptions = {
    day: "numeric",
    month: "long",
    year: "numeric"
  };
  var formatMonthOptions = { month: "long" };
  var formatMonthYearOptions = {
    month: "long",
    year: "numeric"
  };
  var formatShortWeekdayOptions = { weekday: "short" };
  var formatWeekdayOptions = { weekday: "long" };
  var formatYearOptions = { year: "numeric" };
  var formatDate = getSafeFormatter(formatDateOptions);
  var formatDay = getSafeFormatter(formatDayOptions);
  var formatLongDate = getSafeFormatter(formatLongDateOptions);
  var formatMonth = getSafeFormatter(formatMonthOptions);
  var formatMonthYear = getSafeFormatter(formatMonthYearOptions);
  var formatShortWeekday = getSafeFormatter(formatShortWeekdayOptions);
  var formatWeekday = getSafeFormatter(formatWeekdayOptions);
  var formatYear2 = getSafeFormatter(formatYearOptions);

  // client/node_modules/react-calendar/dist/esm/shared/dates.js
  var SUNDAY = WEEKDAYS[0];
  var FRIDAY = WEEKDAYS[5];
  var SATURDAY = WEEKDAYS[6];
  function getDayOfWeek(date2, calendarType) {
    if (calendarType === void 0) {
      calendarType = CALENDAR_TYPES.ISO_8601;
    }
    var weekday = date2.getDay();
    switch (calendarType) {
      case CALENDAR_TYPES.ISO_8601:
        return (weekday + 6) % 7;
      case CALENDAR_TYPES.ISLAMIC:
        return (weekday + 1) % 7;
      case CALENDAR_TYPES.HEBREW:
      case CALENDAR_TYPES.GREGORY:
        return weekday;
      default:
        throw new Error("Unsupported calendar type.");
    }
  }
  function getBeginOfCenturyYear(date2) {
    var beginOfCentury = getCenturyStart(date2);
    return getYear(beginOfCentury);
  }
  function getBeginOfDecadeYear(date2) {
    var beginOfDecade = getDecadeStart(date2);
    return getYear(beginOfDecade);
  }
  function getBeginOfWeek(date2, calendarType) {
    if (calendarType === void 0) {
      calendarType = CALENDAR_TYPES.ISO_8601;
    }
    var year = getYear(date2);
    var monthIndex = getMonth(date2);
    var day = date2.getDate() - getDayOfWeek(date2, calendarType);
    return new Date(year, monthIndex, day);
  }
  function getWeekNumber(date2, calendarType) {
    if (calendarType === void 0) {
      calendarType = CALENDAR_TYPES.ISO_8601;
    }
    var calendarTypeForWeekNumber = calendarType === CALENDAR_TYPES.GREGORY ? CALENDAR_TYPES.GREGORY : CALENDAR_TYPES.ISO_8601;
    var beginOfWeek = getBeginOfWeek(date2, calendarType);
    var year = getYear(date2) + 1;
    var dayInWeekOne;
    var beginOfFirstWeek;
    do {
      dayInWeekOne = new Date(year, 0, calendarTypeForWeekNumber === CALENDAR_TYPES.ISO_8601 ? 4 : 1);
      beginOfFirstWeek = getBeginOfWeek(dayInWeekOne, calendarType);
      year -= 1;
    } while (date2 < beginOfFirstWeek);
    return Math.round((beginOfWeek.getTime() - beginOfFirstWeek.getTime()) / (864e5 * 7)) + 1;
  }
  function getBegin(rangeType, date2) {
    switch (rangeType) {
      case "century":
        return getCenturyStart(date2);
      case "decade":
        return getDecadeStart(date2);
      case "year":
        return getYearStart(date2);
      case "month":
        return getMonthStart(date2);
      case "day":
        return getDayStart(date2);
      default:
        throw new Error("Invalid rangeType: ".concat(rangeType));
    }
  }
  function getBeginPrevious(rangeType, date2) {
    switch (rangeType) {
      case "century":
        return getPreviousCenturyStart(date2);
      case "decade":
        return getPreviousDecadeStart(date2);
      case "year":
        return getPreviousYearStart(date2);
      case "month":
        return getPreviousMonthStart(date2);
      default:
        throw new Error("Invalid rangeType: ".concat(rangeType));
    }
  }
  function getBeginNext(rangeType, date2) {
    switch (rangeType) {
      case "century":
        return getNextCenturyStart(date2);
      case "decade":
        return getNextDecadeStart(date2);
      case "year":
        return getNextYearStart(date2);
      case "month":
        return getNextMonthStart(date2);
      default:
        throw new Error("Invalid rangeType: ".concat(rangeType));
    }
  }
  function getBeginPrevious2(rangeType, date2) {
    switch (rangeType) {
      case "decade":
        return getPreviousDecadeStart(date2, -100);
      case "year":
        return getPreviousYearStart(date2, -10);
      case "month":
        return getPreviousMonthStart(date2, -12);
      default:
        throw new Error("Invalid rangeType: ".concat(rangeType));
    }
  }
  function getBeginNext2(rangeType, date2) {
    switch (rangeType) {
      case "decade":
        return getNextDecadeStart(date2, 100);
      case "year":
        return getNextYearStart(date2, 10);
      case "month":
        return getNextMonthStart(date2, 12);
      default:
        throw new Error("Invalid rangeType: ".concat(rangeType));
    }
  }
  function getEnd(rangeType, date2) {
    switch (rangeType) {
      case "century":
        return getCenturyEnd(date2);
      case "decade":
        return getDecadeEnd(date2);
      case "year":
        return getYearEnd(date2);
      case "month":
        return getMonthEnd(date2);
      case "day":
        return getDayEnd(date2);
      default:
        throw new Error("Invalid rangeType: ".concat(rangeType));
    }
  }
  function getEndPrevious(rangeType, date2) {
    switch (rangeType) {
      case "century":
        return getPreviousCenturyEnd(date2);
      case "decade":
        return getPreviousDecadeEnd(date2);
      case "year":
        return getPreviousYearEnd(date2);
      case "month":
        return getPreviousMonthEnd(date2);
      default:
        throw new Error("Invalid rangeType: ".concat(rangeType));
    }
  }
  function getEndPrevious2(rangeType, date2) {
    switch (rangeType) {
      case "decade":
        return getPreviousDecadeEnd(date2, -100);
      case "year":
        return getPreviousYearEnd(date2, -10);
      case "month":
        return getPreviousMonthEnd(date2, -12);
      default:
        throw new Error("Invalid rangeType: ".concat(rangeType));
    }
  }
  function getRange(rangeType, date2) {
    switch (rangeType) {
      case "century":
        return getCenturyRange(date2);
      case "decade":
        return getDecadeRange(date2);
      case "year":
        return getYearRange(date2);
      case "month":
        return getMonthRange(date2);
      case "day":
        return getDayRange(date2);
      default:
        throw new Error("Invalid rangeType: ".concat(rangeType));
    }
  }
  function getValueRange(rangeType, date1, date2) {
    var rawNextValue = [date1, date2].sort(function(a, b) {
      return a.getTime() - b.getTime();
    });
    return [getBegin(rangeType, rawNextValue[0]), getEnd(rangeType, rawNextValue[1])];
  }
  function toYearLabel(locale3, formatYear3, dates) {
    if (formatYear3 === void 0) {
      formatYear3 = formatYear2;
    }
    return dates.map(function(date2) {
      return formatYear3(locale3, date2);
    }).join(" \u2013 ");
  }
  function getCenturyLabel(locale3, formatYear3, date2) {
    return toYearLabel(locale3, formatYear3, getCenturyRange(date2));
  }
  function getDecadeLabel(locale3, formatYear3, date2) {
    return toYearLabel(locale3, formatYear3, getDecadeRange(date2));
  }
  function isCurrentDayOfWeek(date2) {
    return date2.getDay() === (/* @__PURE__ */ new Date()).getDay();
  }
  function isWeekend(date2, calendarType) {
    if (calendarType === void 0) {
      calendarType = CALENDAR_TYPES.ISO_8601;
    }
    var weekday = date2.getDay();
    switch (calendarType) {
      case CALENDAR_TYPES.ISLAMIC:
      case CALENDAR_TYPES.HEBREW:
        return weekday === FRIDAY || weekday === SATURDAY;
      case CALENDAR_TYPES.ISO_8601:
      case CALENDAR_TYPES.GREGORY:
        return weekday === SATURDAY || weekday === SUNDAY;
      default:
        throw new Error("Unsupported calendar type.");
    }
  }

  // client/node_modules/react-calendar/dist/esm/Calendar/Navigation.js
  var className = "react-calendar__navigation";
  function Navigation(_a3) {
    var activeStartDate = _a3.activeStartDate, drillUp = _a3.drillUp, _b = _a3.formatMonthYear, formatMonthYear2 = _b === void 0 ? formatMonthYear : _b, _c = _a3.formatYear, formatYear3 = _c === void 0 ? formatYear2 : _c, locale3 = _a3.locale, maxDate = _a3.maxDate, minDate = _a3.minDate, _d = _a3.navigationAriaLabel, navigationAriaLabel = _d === void 0 ? "" : _d, navigationAriaLive = _a3.navigationAriaLive, navigationLabel = _a3.navigationLabel, _e = _a3.next2AriaLabel, next2AriaLabel = _e === void 0 ? "" : _e, _f = _a3.next2Label, next2Label = _f === void 0 ? "\xBB" : _f, _g = _a3.nextAriaLabel, nextAriaLabel = _g === void 0 ? "" : _g, _h = _a3.nextLabel, nextLabel = _h === void 0 ? "\u203A" : _h, _j = _a3.prev2AriaLabel, prev2AriaLabel = _j === void 0 ? "" : _j, _k = _a3.prev2Label, prev2Label = _k === void 0 ? "\xAB" : _k, _l = _a3.prevAriaLabel, prevAriaLabel = _l === void 0 ? "" : _l, _m = _a3.prevLabel, prevLabel = _m === void 0 ? "\u2039" : _m, setActiveStartDate = _a3.setActiveStartDate, showDoubleView = _a3.showDoubleView, view = _a3.view, views = _a3.views;
    var drillUpAvailable = views.indexOf(view) > 0;
    var shouldShowPrevNext2Buttons = view !== "century";
    var previousActiveStartDate = getBeginPrevious(view, activeStartDate);
    var previousActiveStartDate2 = shouldShowPrevNext2Buttons ? getBeginPrevious2(view, activeStartDate) : void 0;
    var nextActiveStartDate = getBeginNext(view, activeStartDate);
    var nextActiveStartDate2 = shouldShowPrevNext2Buttons ? getBeginNext2(view, activeStartDate) : void 0;
    var prevButtonDisabled = (function() {
      if (previousActiveStartDate.getFullYear() < 0) {
        return true;
      }
      var previousActiveEndDate = getEndPrevious(view, activeStartDate);
      return minDate && minDate >= previousActiveEndDate;
    })();
    var prev2ButtonDisabled = shouldShowPrevNext2Buttons && (function() {
      if (previousActiveStartDate2.getFullYear() < 0) {
        return true;
      }
      var previousActiveEndDate = getEndPrevious2(view, activeStartDate);
      return minDate && minDate >= previousActiveEndDate;
    })();
    var nextButtonDisabled = maxDate && maxDate < nextActiveStartDate;
    var next2ButtonDisabled = shouldShowPrevNext2Buttons && maxDate && maxDate < nextActiveStartDate2;
    function onClickPrevious() {
      setActiveStartDate(previousActiveStartDate, "prev");
    }
    function onClickPrevious2() {
      setActiveStartDate(previousActiveStartDate2, "prev2");
    }
    function onClickNext() {
      setActiveStartDate(nextActiveStartDate, "next");
    }
    function onClickNext2() {
      setActiveStartDate(nextActiveStartDate2, "next2");
    }
    function renderLabel(date2) {
      var label = (function() {
        switch (view) {
          case "century":
            return getCenturyLabel(locale3, formatYear3, date2);
          case "decade":
            return getDecadeLabel(locale3, formatYear3, date2);
          case "year":
            return formatYear3(locale3, date2);
          case "month":
            return formatMonthYear2(locale3, date2);
          default:
            throw new Error("Invalid view: ".concat(view, "."));
        }
      })();
      return navigationLabel ? navigationLabel({
        date: date2,
        label,
        locale: locale3 || getUserLocale() || void 0,
        view
      }) : label;
    }
    function renderButton() {
      var labelClassName = "".concat(className, "__label");
      return import_react40.default.createElement(
        "button",
        { "aria-label": navigationAriaLabel, "aria-live": navigationAriaLive, className: labelClassName, disabled: !drillUpAvailable, onClick: drillUp, style: { flexGrow: 1 }, type: "button" },
        import_react40.default.createElement("span", { className: "".concat(labelClassName, "__labelText ").concat(labelClassName, "__labelText--from") }, renderLabel(activeStartDate)),
        showDoubleView ? import_react40.default.createElement(
          import_react40.default.Fragment,
          null,
          import_react40.default.createElement("span", { className: "".concat(labelClassName, "__divider") }, " \u2013 "),
          import_react40.default.createElement("span", { className: "".concat(labelClassName, "__labelText ").concat(labelClassName, "__labelText--to") }, renderLabel(nextActiveStartDate))
        ) : null
      );
    }
    return import_react40.default.createElement(
      "div",
      { className },
      prev2Label !== null && shouldShowPrevNext2Buttons ? import_react40.default.createElement("button", { "aria-label": prev2AriaLabel, className: "".concat(className, "__arrow ").concat(className, "__prev2-button"), disabled: prev2ButtonDisabled, onClick: onClickPrevious2, type: "button" }, prev2Label) : null,
      prevLabel !== null && import_react40.default.createElement("button", { "aria-label": prevAriaLabel, className: "".concat(className, "__arrow ").concat(className, "__prev-button"), disabled: prevButtonDisabled, onClick: onClickPrevious, type: "button" }, prevLabel),
      renderButton(),
      nextLabel !== null && import_react40.default.createElement("button", { "aria-label": nextAriaLabel, className: "".concat(className, "__arrow ").concat(className, "__next-button"), disabled: nextButtonDisabled, onClick: onClickNext, type: "button" }, nextLabel),
      next2Label !== null && shouldShowPrevNext2Buttons ? import_react40.default.createElement("button", { "aria-label": next2AriaLabel, className: "".concat(className, "__arrow ").concat(className, "__next2-button"), disabled: next2ButtonDisabled, onClick: onClickNext2, type: "button" }, next2Label) : null
    );
  }

  // client/node_modules/react-calendar/dist/esm/CenturyView.js
  init_define_import_meta_env();
  var import_react46 = __toESM(require_react_shim(), 1);
  var import_prop_types2 = __toESM(require_prop_types(), 1);

  // client/node_modules/react-calendar/dist/esm/CenturyView/Decades.js
  init_define_import_meta_env();
  var import_react45 = __toESM(require_react_shim(), 1);

  // client/node_modules/react-calendar/dist/esm/TileGroup.js
  init_define_import_meta_env();
  var import_react42 = __toESM(require_react_shim(), 1);

  // client/node_modules/react-calendar/dist/esm/Flex.js
  init_define_import_meta_env();
  var import_react41 = __toESM(require_react_shim(), 1);
  var __assign = function() {
    __assign = Object.assign || function(t) {
      for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
          t[p] = s[p];
      }
      return t;
    };
    return __assign.apply(this, arguments);
  };
  var __rest = function(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
      t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
        if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
          t[p[i]] = s[p[i]];
      }
    return t;
  };
  function toPercent(num) {
    return "".concat(num, "%");
  }
  function Flex(_a3) {
    var children = _a3.children, className8 = _a3.className, count = _a3.count, direction = _a3.direction, offset = _a3.offset, style = _a3.style, wrap = _a3.wrap, otherProps = __rest(_a3, ["children", "className", "count", "direction", "offset", "style", "wrap"]);
    return import_react41.default.createElement("div", __assign({ className: className8, style: __assign({ display: "flex", flexDirection: direction, flexWrap: wrap ? "wrap" : "nowrap" }, style) }, otherProps), import_react41.default.Children.map(children, function(child, index) {
      var marginInlineStart = offset && index === 0 ? toPercent(100 * offset / count) : null;
      return import_react41.default.cloneElement(child, __assign(__assign({}, child.props), { style: {
        flexBasis: toPercent(100 / count),
        flexShrink: 0,
        flexGrow: 0,
        overflow: "hidden",
        marginLeft: marginInlineStart,
        marginInlineStart,
        marginInlineEnd: 0
      } }));
    }));
  }

  // client/node_modules/react-calendar/dist/esm/shared/utils.js
  init_define_import_meta_env();
  var import_warning = __toESM(require_warning(), 1);
  var _a2;
  function between(value, min2, max2) {
    if (min2 && min2 > value) {
      return min2;
    }
    if (max2 && max2 < value) {
      return max2;
    }
    return value;
  }
  function isValueWithinRange(value, range4) {
    return range4[0] <= value && range4[1] >= value;
  }
  function isRangeWithinRange(greaterRange, smallerRange) {
    return greaterRange[0] <= smallerRange[0] && greaterRange[1] >= smallerRange[1];
  }
  function doRangesOverlap(range1, range22) {
    return isValueWithinRange(range1[0], range22) || isValueWithinRange(range1[1], range22);
  }
  function getRangeClassNames(valueRange, dateRange, baseClassName2) {
    var isRange2 = doRangesOverlap(dateRange, valueRange);
    var classes = [];
    if (isRange2) {
      classes.push(baseClassName2);
      var isRangeStart = isValueWithinRange(valueRange[0], dateRange);
      var isRangeEnd = isValueWithinRange(valueRange[1], dateRange);
      if (isRangeStart) {
        classes.push("".concat(baseClassName2, "Start"));
      }
      if (isRangeEnd) {
        classes.push("".concat(baseClassName2, "End"));
      }
      if (isRangeStart && isRangeEnd) {
        classes.push("".concat(baseClassName2, "BothEnds"));
      }
    }
    return classes;
  }
  function isCompleteValue(value) {
    if (Array.isArray(value)) {
      return value[0] !== null && value[1] !== null;
    }
    return value !== null;
  }
  function getTileClasses(args) {
    if (!args) {
      throw new Error("args is required");
    }
    var value = args.value, date2 = args.date, hover = args.hover;
    var className8 = "react-calendar__tile";
    var classes = [className8];
    if (!date2) {
      return classes;
    }
    var now = /* @__PURE__ */ new Date();
    var dateRange = (function() {
      if (Array.isArray(date2)) {
        return date2;
      }
      var dateType = args.dateType;
      if (!dateType) {
        throw new Error("dateType is required when date is not an array of two dates");
      }
      return getRange(dateType, date2);
    })();
    if (isValueWithinRange(now, dateRange)) {
      classes.push("".concat(className8, "--now"));
    }
    if (!value || !isCompleteValue(value)) {
      return classes;
    }
    var valueRange = (function() {
      if (Array.isArray(value)) {
        return value;
      }
      var valueType = args.valueType;
      if (!valueType) {
        throw new Error("valueType is required when value is not an array of two dates");
      }
      return getRange(valueType, value);
    })();
    if (isRangeWithinRange(valueRange, dateRange)) {
      classes.push("".concat(className8, "--active"));
    } else if (doRangesOverlap(valueRange, dateRange)) {
      classes.push("".concat(className8, "--hasActive"));
    }
    var valueRangeClassNames = getRangeClassNames(valueRange, dateRange, "".concat(className8, "--range"));
    classes.push.apply(classes, valueRangeClassNames);
    var valueArray = Array.isArray(value) ? value : [value];
    if (hover && valueArray.length === 1) {
      var hoverRange = hover > valueRange[0] ? [valueRange[0], hover] : [hover, valueRange[0]];
      var hoverRangeClassNames = getRangeClassNames(hoverRange, dateRange, "".concat(className8, "--hover"));
      classes.push.apply(classes, hoverRangeClassNames);
    }
    return classes;
  }
  var calendarTypeMap = (_a2 = {}, _a2[DEPRECATED_CALENDAR_TYPES.ARABIC] = CALENDAR_TYPES.ISLAMIC, _a2[DEPRECATED_CALENDAR_TYPES.HEBREW] = CALENDAR_TYPES.HEBREW, _a2[DEPRECATED_CALENDAR_TYPES.ISO_8601] = CALENDAR_TYPES.ISO_8601, _a2[DEPRECATED_CALENDAR_TYPES.US] = CALENDAR_TYPES.GREGORY, _a2);
  function isDeprecatedCalendarType(calendarType) {
    return calendarType !== void 0 && calendarType in DEPRECATED_CALENDAR_TYPES;
  }
  var warned = false;
  function mapCalendarType(calendarTypeOrDeprecatedCalendarType) {
    if (isDeprecatedCalendarType(calendarTypeOrDeprecatedCalendarType)) {
      var calendarType = calendarTypeMap[calendarTypeOrDeprecatedCalendarType];
      (0, import_warning.default)(warned, 'Specifying calendarType="'.concat(calendarTypeOrDeprecatedCalendarType, '" is deprecated. Use calendarType="').concat(calendarType, '" instead.'));
      warned = true;
      return calendarType;
    }
    return calendarTypeOrDeprecatedCalendarType;
  }

  // client/node_modules/react-calendar/dist/esm/TileGroup.js
  function TileGroup(_a3) {
    var className8 = _a3.className, _b = _a3.count, count = _b === void 0 ? 3 : _b, dateTransform = _a3.dateTransform, dateType = _a3.dateType, end = _a3.end, hover = _a3.hover, offset = _a3.offset, renderTile = _a3.renderTile, start = _a3.start, _c = _a3.step, step = _c === void 0 ? 1 : _c, value = _a3.value, valueType = _a3.valueType;
    var tiles = [];
    for (var point4 = start; point4 <= end; point4 += step) {
      var date2 = dateTransform(point4);
      tiles.push(renderTile({
        classes: getTileClasses({
          date: date2,
          dateType,
          hover,
          value,
          valueType
        }),
        date: date2
      }));
    }
    return import_react42.default.createElement(Flex, { className: className8, count, offset, wrap: true }, tiles);
  }

  // client/node_modules/react-calendar/dist/esm/CenturyView/Decade.js
  init_define_import_meta_env();
  var import_react44 = __toESM(require_react_shim(), 1);

  // client/node_modules/react-calendar/dist/esm/Tile.js
  init_define_import_meta_env();
  var import_react43 = __toESM(require_react_shim(), 1);
  function Tile(props) {
    var activeStartDate = props.activeStartDate, children = props.children, classes = props.classes, date2 = props.date, formatAbbr = props.formatAbbr, locale3 = props.locale, maxDate = props.maxDate, maxDateTransform = props.maxDateTransform, minDate = props.minDate, minDateTransform = props.minDateTransform, onClick = props.onClick, onMouseOver = props.onMouseOver, style = props.style, tileClassNameProps = props.tileClassName, tileContentProps = props.tileContent, tileDisabled = props.tileDisabled, view = props.view;
    var tileClassName = (0, import_react43.useMemo)(function() {
      var args = { activeStartDate, date: date2, view };
      return typeof tileClassNameProps === "function" ? tileClassNameProps(args) : tileClassNameProps;
    }, [activeStartDate, date2, tileClassNameProps, view]);
    var tileContent = (0, import_react43.useMemo)(function() {
      var args = { activeStartDate, date: date2, view };
      return typeof tileContentProps === "function" ? tileContentProps(args) : tileContentProps;
    }, [activeStartDate, date2, tileContentProps, view]);
    return import_react43.default.createElement(
      "button",
      { className: clsx_default(classes, tileClassName), disabled: minDate && minDateTransform(minDate) > date2 || maxDate && maxDateTransform(maxDate) < date2 || tileDisabled && tileDisabled({ activeStartDate, date: date2, view }), onClick: onClick ? function(event) {
        return onClick(date2, event);
      } : void 0, onFocus: onMouseOver ? function() {
        return onMouseOver(date2);
      } : void 0, onMouseOver: onMouseOver ? function() {
        return onMouseOver(date2);
      } : void 0, style, type: "button" },
      formatAbbr ? import_react43.default.createElement("abbr", { "aria-label": formatAbbr(locale3, date2) }, children) : children,
      tileContent
    );
  }

  // client/node_modules/react-calendar/dist/esm/CenturyView/Decade.js
  var __assign2 = function() {
    __assign2 = Object.assign || function(t) {
      for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
          t[p] = s[p];
      }
      return t;
    };
    return __assign2.apply(this, arguments);
  };
  var __rest2 = function(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
      t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
        if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
          t[p[i]] = s[p[i]];
      }
    return t;
  };
  var className2 = "react-calendar__century-view__decades__decade";
  function Decade(_a3) {
    var _b = _a3.classes, classes = _b === void 0 ? [] : _b, currentCentury = _a3.currentCentury, _c = _a3.formatYear, formatYear3 = _c === void 0 ? formatYear2 : _c, otherProps = __rest2(_a3, ["classes", "currentCentury", "formatYear"]);
    var date2 = otherProps.date, locale3 = otherProps.locale;
    var classesProps = [];
    if (classes) {
      classesProps.push.apply(classesProps, classes);
    }
    if (className2) {
      classesProps.push(className2);
    }
    if (getCenturyStart(date2).getFullYear() !== currentCentury) {
      classesProps.push("".concat(className2, "--neighboringCentury"));
    }
    return import_react44.default.createElement(Tile, __assign2({}, otherProps, { classes: classesProps, maxDateTransform: getDecadeEnd, minDateTransform: getDecadeStart, view: "century" }), getDecadeLabel(locale3, formatYear3, date2));
  }

  // client/node_modules/react-calendar/dist/esm/CenturyView/Decades.js
  var __assign3 = function() {
    __assign3 = Object.assign || function(t) {
      for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
          t[p] = s[p];
      }
      return t;
    };
    return __assign3.apply(this, arguments);
  };
  var __rest3 = function(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
      t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
        if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
          t[p[i]] = s[p[i]];
      }
    return t;
  };
  function Decades(props) {
    var activeStartDate = props.activeStartDate, hover = props.hover, showNeighboringCentury = props.showNeighboringCentury, value = props.value, valueType = props.valueType, otherProps = __rest3(props, ["activeStartDate", "hover", "showNeighboringCentury", "value", "valueType"]);
    var start = getBeginOfCenturyYear(activeStartDate);
    var end = start + (showNeighboringCentury ? 119 : 99);
    return import_react45.default.createElement(TileGroup, { className: "react-calendar__century-view__decades", dateTransform: getDecadeStart, dateType: "decade", end, hover, renderTile: function(_a3) {
      var date2 = _a3.date, otherTileProps = __rest3(_a3, ["date"]);
      return import_react45.default.createElement(Decade, __assign3({ key: date2.getTime() }, otherProps, otherTileProps, { activeStartDate, currentCentury: start, date: date2 }));
    }, start, step: 10, value, valueType });
  }

  // client/node_modules/react-calendar/dist/esm/shared/propTypes.js
  init_define_import_meta_env();
  var import_prop_types = __toESM(require_prop_types(), 1);
  var __spreadArray = function(to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
      if (ar || !(i in from)) {
        if (!ar) ar = Array.prototype.slice.call(from, 0, i);
        ar[i] = from[i];
      }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
  };
  var calendarTypes = Object.values(CALENDAR_TYPES);
  var deprecatedCalendarTypes = Object.values(DEPRECATED_CALENDAR_TYPES);
  var allViews = ["century", "decade", "year", "month"];
  var isCalendarType = import_prop_types.default.oneOf(__spreadArray(__spreadArray([], calendarTypes, true), deprecatedCalendarTypes, true));
  var isClassName = import_prop_types.default.oneOfType([
    import_prop_types.default.string,
    import_prop_types.default.arrayOf(import_prop_types.default.string)
  ]);
  var isMinDate = function isMinDate2(props, propName, componentName) {
    var _a3 = props, _b = propName, minDate = _a3[_b];
    if (!minDate) {
      return null;
    }
    if (!(minDate instanceof Date)) {
      return new Error("Invalid prop `".concat(propName, "` of type `").concat(typeof minDate, "` supplied to `").concat(componentName, "`, expected instance of `Date`."));
    }
    var maxDate = props.maxDate;
    if (maxDate && minDate > maxDate) {
      return new Error("Invalid prop `".concat(propName, "` of type `").concat(typeof minDate, "` supplied to `").concat(componentName, "`, minDate cannot be larger than maxDate."));
    }
    return null;
  };
  var isMaxDate = function isMaxDate2(props, propName, componentName) {
    var _a3 = props, _b = propName, maxDate = _a3[_b];
    if (!maxDate) {
      return null;
    }
    if (!(maxDate instanceof Date)) {
      return new Error("Invalid prop `".concat(propName, "` of type `").concat(typeof maxDate, "` supplied to `").concat(componentName, "`, expected instance of `Date`."));
    }
    var minDate = props.minDate;
    if (minDate && maxDate < minDate) {
      return new Error("Invalid prop `".concat(propName, "` of type `").concat(typeof maxDate, "` supplied to `").concat(componentName, "`, maxDate cannot be smaller than minDate."));
    }
    return null;
  };
  var isRef = import_prop_types.default.oneOfType([
    import_prop_types.default.func,
    import_prop_types.default.exact({
      current: import_prop_types.default.any
    })
  ]);
  var isRange = import_prop_types.default.arrayOf(import_prop_types.default.oneOfType([import_prop_types.default.instanceOf(Date), import_prop_types.default.oneOf([null])]).isRequired);
  var isValue = import_prop_types.default.oneOfType([
    import_prop_types.default.instanceOf(Date),
    import_prop_types.default.oneOf([null]),
    isRange
  ]);
  var isViews = import_prop_types.default.arrayOf(import_prop_types.default.oneOf(allViews));
  var isView = function isView2(props, propName, componentName) {
    var _a3 = props, _b = propName, view = _a3[_b];
    if (view !== void 0 && (typeof view !== "string" || allViews.indexOf(view) === -1)) {
      return new Error("Invalid prop `".concat(propName, "` of value `").concat(view, "` supplied to `").concat(componentName, "`, expected one of [").concat(allViews.map(function(a) {
        return '"'.concat(a, '"');
      }).join(", "), "]."));
    }
    return null;
  };
  isView.isRequired = function isViewIsRequired(props, propName, componentName, location, propFullName) {
    var _a3 = props, _b = propName, view = _a3[_b];
    if (!view) {
      return new Error("The prop `".concat(propName, "` is marked as required in `").concat(componentName, "`, but its value is `").concat(view, "`."));
    }
    return isView(props, propName, componentName, location, propFullName);
  };
  var rangeOf = function(type) {
    return import_prop_types.default.arrayOf(type);
  };
  var tileGroupProps = {
    activeStartDate: import_prop_types.default.instanceOf(Date).isRequired,
    hover: import_prop_types.default.instanceOf(Date),
    locale: import_prop_types.default.string,
    maxDate: isMaxDate,
    minDate: isMinDate,
    onClick: import_prop_types.default.func,
    onMouseOver: import_prop_types.default.func,
    tileClassName: import_prop_types.default.oneOfType([import_prop_types.default.func, isClassName]),
    tileContent: import_prop_types.default.oneOfType([import_prop_types.default.func, import_prop_types.default.node]),
    value: isValue,
    valueType: import_prop_types.default.oneOf(["century", "decade", "year", "month", "day"]).isRequired
  };
  var tileProps = {
    activeStartDate: import_prop_types.default.instanceOf(Date).isRequired,
    classes: import_prop_types.default.arrayOf(import_prop_types.default.string.isRequired).isRequired,
    date: import_prop_types.default.instanceOf(Date).isRequired,
    locale: import_prop_types.default.string,
    maxDate: isMaxDate,
    minDate: isMinDate,
    onClick: import_prop_types.default.func,
    onMouseOver: import_prop_types.default.func,
    style: import_prop_types.default.objectOf(import_prop_types.default.oneOfType([import_prop_types.default.string, import_prop_types.default.number])),
    tileClassName: import_prop_types.default.oneOfType([import_prop_types.default.func, isClassName]),
    tileContent: import_prop_types.default.oneOfType([import_prop_types.default.func, import_prop_types.default.node]),
    tileDisabled: import_prop_types.default.func
  };

  // client/node_modules/react-calendar/dist/esm/CenturyView.js
  var __assign4 = function() {
    __assign4 = Object.assign || function(t) {
      for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
          t[p] = s[p];
      }
      return t;
    };
    return __assign4.apply(this, arguments);
  };
  var CenturyView = function CenturyView2(props) {
    function renderDecades() {
      return import_react46.default.createElement(Decades, __assign4({}, props));
    }
    return import_react46.default.createElement("div", { className: "react-calendar__century-view" }, renderDecades());
  };
  CenturyView.propTypes = __assign4(__assign4({}, tileGroupProps), { showNeighboringCentury: import_prop_types2.default.bool });
  var CenturyView_default = CenturyView;

  // client/node_modules/react-calendar/dist/esm/DecadeView.js
  init_define_import_meta_env();
  var import_react49 = __toESM(require_react_shim(), 1);
  var import_prop_types3 = __toESM(require_prop_types(), 1);

  // client/node_modules/react-calendar/dist/esm/DecadeView/Years.js
  init_define_import_meta_env();
  var import_react48 = __toESM(require_react_shim(), 1);

  // client/node_modules/react-calendar/dist/esm/DecadeView/Year.js
  init_define_import_meta_env();
  var import_react47 = __toESM(require_react_shim(), 1);
  var __assign5 = function() {
    __assign5 = Object.assign || function(t) {
      for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
          t[p] = s[p];
      }
      return t;
    };
    return __assign5.apply(this, arguments);
  };
  var __rest4 = function(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
      t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
        if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
          t[p[i]] = s[p[i]];
      }
    return t;
  };
  var className3 = "react-calendar__decade-view__years__year";
  function Year(_a3) {
    var _b = _a3.classes, classes = _b === void 0 ? [] : _b, currentDecade = _a3.currentDecade, _c = _a3.formatYear, formatYear3 = _c === void 0 ? formatYear2 : _c, otherProps = __rest4(_a3, ["classes", "currentDecade", "formatYear"]);
    var date2 = otherProps.date, locale3 = otherProps.locale;
    var classesProps = [];
    if (classes) {
      classesProps.push.apply(classesProps, classes);
    }
    if (className3) {
      classesProps.push(className3);
    }
    if (getDecadeStart(date2).getFullYear() !== currentDecade) {
      classesProps.push("".concat(className3, "--neighboringDecade"));
    }
    return import_react47.default.createElement(Tile, __assign5({}, otherProps, { classes: classesProps, maxDateTransform: getYearEnd, minDateTransform: getYearStart, view: "decade" }), formatYear3(locale3, date2));
  }

  // client/node_modules/react-calendar/dist/esm/DecadeView/Years.js
  var __assign6 = function() {
    __assign6 = Object.assign || function(t) {
      for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
          t[p] = s[p];
      }
      return t;
    };
    return __assign6.apply(this, arguments);
  };
  var __rest5 = function(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
      t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
        if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
          t[p[i]] = s[p[i]];
      }
    return t;
  };
  function Years(props) {
    var activeStartDate = props.activeStartDate, hover = props.hover, showNeighboringDecade = props.showNeighboringDecade, value = props.value, valueType = props.valueType, otherProps = __rest5(props, ["activeStartDate", "hover", "showNeighboringDecade", "value", "valueType"]);
    var start = getBeginOfDecadeYear(activeStartDate);
    var end = start + (showNeighboringDecade ? 11 : 9);
    return import_react48.default.createElement(TileGroup, { className: "react-calendar__decade-view__years", dateTransform: getYearStart, dateType: "year", end, hover, renderTile: function(_a3) {
      var date2 = _a3.date, otherTileProps = __rest5(_a3, ["date"]);
      return import_react48.default.createElement(Year, __assign6({ key: date2.getTime() }, otherProps, otherTileProps, { activeStartDate, currentDecade: start, date: date2 }));
    }, start, value, valueType });
  }

  // client/node_modules/react-calendar/dist/esm/DecadeView.js
  var __assign7 = function() {
    __assign7 = Object.assign || function(t) {
      for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
          t[p] = s[p];
      }
      return t;
    };
    return __assign7.apply(this, arguments);
  };
  var DecadeView = function DecadeView2(props) {
    function renderYears() {
      return import_react49.default.createElement(Years, __assign7({}, props));
    }
    return import_react49.default.createElement("div", { className: "react-calendar__decade-view" }, renderYears());
  };
  DecadeView.propTypes = __assign7(__assign7({}, tileGroupProps), { showNeighboringDecade: import_prop_types3.default.bool });
  var DecadeView_default = DecadeView;

  // client/node_modules/react-calendar/dist/esm/YearView.js
  init_define_import_meta_env();
  var import_react52 = __toESM(require_react_shim(), 1);

  // client/node_modules/react-calendar/dist/esm/YearView/Months.js
  init_define_import_meta_env();
  var import_react51 = __toESM(require_react_shim(), 1);

  // client/node_modules/react-calendar/dist/esm/YearView/Month.js
  init_define_import_meta_env();
  var import_react50 = __toESM(require_react_shim(), 1);
  var __assign8 = function() {
    __assign8 = Object.assign || function(t) {
      for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
          t[p] = s[p];
      }
      return t;
    };
    return __assign8.apply(this, arguments);
  };
  var __rest6 = function(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
      t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
        if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
          t[p[i]] = s[p[i]];
      }
    return t;
  };
  var __spreadArray2 = function(to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
      if (ar || !(i in from)) {
        if (!ar) ar = Array.prototype.slice.call(from, 0, i);
        ar[i] = from[i];
      }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
  };
  var className4 = "react-calendar__year-view__months__month";
  function Month(_a3) {
    var _b = _a3.classes, classes = _b === void 0 ? [] : _b, _c = _a3.formatMonth, formatMonth2 = _c === void 0 ? formatMonth : _c, _d = _a3.formatMonthYear, formatMonthYear2 = _d === void 0 ? formatMonthYear : _d, otherProps = __rest6(_a3, ["classes", "formatMonth", "formatMonthYear"]);
    var date2 = otherProps.date, locale3 = otherProps.locale;
    return import_react50.default.createElement(Tile, __assign8({}, otherProps, { classes: __spreadArray2(__spreadArray2([], classes, true), [className4], false), formatAbbr: formatMonthYear2, maxDateTransform: getMonthEnd, minDateTransform: getMonthStart, view: "year" }), formatMonth2(locale3, date2));
  }

  // client/node_modules/react-calendar/dist/esm/YearView/Months.js
  var __assign9 = function() {
    __assign9 = Object.assign || function(t) {
      for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
          t[p] = s[p];
      }
      return t;
    };
    return __assign9.apply(this, arguments);
  };
  var __rest7 = function(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
      t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
        if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
          t[p[i]] = s[p[i]];
      }
    return t;
  };
  function Months(props) {
    var activeStartDate = props.activeStartDate, hover = props.hover, value = props.value, valueType = props.valueType, otherProps = __rest7(props, ["activeStartDate", "hover", "value", "valueType"]);
    var start = 0;
    var end = 11;
    var year = getYear(activeStartDate);
    return import_react51.default.createElement(TileGroup, { className: "react-calendar__year-view__months", dateTransform: function(monthIndex) {
      var date2 = /* @__PURE__ */ new Date();
      date2.setFullYear(year, monthIndex, 1);
      return getMonthStart(date2);
    }, dateType: "month", end, hover, renderTile: function(_a3) {
      var date2 = _a3.date, otherTileProps = __rest7(_a3, ["date"]);
      return import_react51.default.createElement(Month, __assign9({ key: date2.getTime() }, otherProps, otherTileProps, { activeStartDate, date: date2 }));
    }, start, value, valueType });
  }

  // client/node_modules/react-calendar/dist/esm/YearView.js
  var __assign10 = function() {
    __assign10 = Object.assign || function(t) {
      for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
          t[p] = s[p];
      }
      return t;
    };
    return __assign10.apply(this, arguments);
  };
  var YearView = function YearView2(props) {
    function renderMonths() {
      return import_react52.default.createElement(Months, __assign10({}, props));
    }
    return import_react52.default.createElement("div", { className: "react-calendar__year-view" }, renderMonths());
  };
  YearView.propTypes = __assign10({}, tileGroupProps);
  var YearView_default = YearView;

  // client/node_modules/react-calendar/dist/esm/MonthView.js
  init_define_import_meta_env();
  var import_react58 = __toESM(require_react_shim(), 1);
  var import_prop_types4 = __toESM(require_prop_types(), 1);

  // client/node_modules/react-calendar/dist/esm/MonthView/Days.js
  init_define_import_meta_env();
  var import_react54 = __toESM(require_react_shim(), 1);

  // client/node_modules/react-calendar/dist/esm/MonthView/Day.js
  init_define_import_meta_env();
  var import_react53 = __toESM(require_react_shim(), 1);
  var __assign11 = function() {
    __assign11 = Object.assign || function(t) {
      for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
          t[p] = s[p];
      }
      return t;
    };
    return __assign11.apply(this, arguments);
  };
  var __rest8 = function(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
      t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
        if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
          t[p[i]] = s[p[i]];
      }
    return t;
  };
  var className5 = "react-calendar__month-view__days__day";
  function Day(_a3) {
    var calendarTypeOrDeprecatedCalendarType = _a3.calendarType, _b = _a3.classes, classes = _b === void 0 ? [] : _b, currentMonthIndex = _a3.currentMonthIndex, _c = _a3.formatDay, formatDay2 = _c === void 0 ? formatDay : _c, _d = _a3.formatLongDate, formatLongDate2 = _d === void 0 ? formatLongDate : _d, otherProps = __rest8(_a3, ["calendarType", "classes", "currentMonthIndex", "formatDay", "formatLongDate"]);
    var calendarType = mapCalendarType(calendarTypeOrDeprecatedCalendarType);
    var date2 = otherProps.date, locale3 = otherProps.locale;
    var classesProps = [];
    if (classes) {
      classesProps.push.apply(classesProps, classes);
    }
    if (className5) {
      classesProps.push(className5);
    }
    if (isWeekend(date2, calendarType)) {
      classesProps.push("".concat(className5, "--weekend"));
    }
    if (date2.getMonth() !== currentMonthIndex) {
      classesProps.push("".concat(className5, "--neighboringMonth"));
    }
    return import_react53.default.createElement(Tile, __assign11({}, otherProps, { classes: classesProps, formatAbbr: formatLongDate2, maxDateTransform: getDayEnd, minDateTransform: getDayStart, view: "month" }), formatDay2(locale3, date2));
  }

  // client/node_modules/react-calendar/dist/esm/MonthView/Days.js
  var __assign12 = function() {
    __assign12 = Object.assign || function(t) {
      for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
          t[p] = s[p];
      }
      return t;
    };
    return __assign12.apply(this, arguments);
  };
  var __rest9 = function(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
      t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
        if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
          t[p[i]] = s[p[i]];
      }
    return t;
  };
  function Days(props) {
    var activeStartDate = props.activeStartDate, calendarTypeOrDeprecatedCalendarType = props.calendarType, hover = props.hover, showFixedNumberOfWeeks = props.showFixedNumberOfWeeks, showNeighboringMonth = props.showNeighboringMonth, value = props.value, valueType = props.valueType, otherProps = __rest9(props, ["activeStartDate", "calendarType", "hover", "showFixedNumberOfWeeks", "showNeighboringMonth", "value", "valueType"]);
    var calendarType = mapCalendarType(calendarTypeOrDeprecatedCalendarType);
    var year = getYear(activeStartDate);
    var monthIndex = getMonth(activeStartDate);
    var hasFixedNumberOfWeeks = showFixedNumberOfWeeks || showNeighboringMonth;
    var dayOfWeek = getDayOfWeek(activeStartDate, calendarType);
    var offset = hasFixedNumberOfWeeks ? 0 : dayOfWeek;
    var start = (hasFixedNumberOfWeeks ? -dayOfWeek : 0) + 1;
    var end = (function() {
      if (showFixedNumberOfWeeks) {
        return start + 6 * 7 - 1;
      }
      var daysInMonth = getDaysInMonth(activeStartDate);
      if (showNeighboringMonth) {
        var activeEndDate = /* @__PURE__ */ new Date();
        activeEndDate.setFullYear(year, monthIndex, daysInMonth);
        activeEndDate.setHours(0, 0, 0, 0);
        var daysUntilEndOfTheWeek = 7 - getDayOfWeek(activeEndDate, calendarType) - 1;
        return daysInMonth + daysUntilEndOfTheWeek;
      }
      return daysInMonth;
    })();
    return import_react54.default.createElement(TileGroup, { className: "react-calendar__month-view__days", count: 7, dateTransform: function(day) {
      var date2 = /* @__PURE__ */ new Date();
      date2.setFullYear(year, monthIndex, day);
      return getDayStart(date2);
    }, dateType: "day", hover, end, renderTile: function(_a3) {
      var date2 = _a3.date, otherTileProps = __rest9(_a3, ["date"]);
      return import_react54.default.createElement(Day, __assign12({ key: date2.getTime() }, otherProps, otherTileProps, { activeStartDate, calendarType: calendarTypeOrDeprecatedCalendarType, currentMonthIndex: monthIndex, date: date2 }));
    }, offset, start, value, valueType });
  }

  // client/node_modules/react-calendar/dist/esm/MonthView/Weekdays.js
  init_define_import_meta_env();
  var import_react55 = __toESM(require_react_shim(), 1);
  var className6 = "react-calendar__month-view__weekdays";
  var weekdayClassName = "".concat(className6, "__weekday");
  function Weekdays(props) {
    var calendarTypeOrDeprecatedCalendarType = props.calendarType, _a3 = props.formatShortWeekday, formatShortWeekday2 = _a3 === void 0 ? formatShortWeekday : _a3, _b = props.formatWeekday, formatWeekday2 = _b === void 0 ? formatWeekday : _b, locale3 = props.locale, onMouseLeave = props.onMouseLeave;
    var calendarType = mapCalendarType(calendarTypeOrDeprecatedCalendarType);
    var anyDate = /* @__PURE__ */ new Date();
    var beginOfMonth = getMonthStart(anyDate);
    var year = getYear(beginOfMonth);
    var monthIndex = getMonth(beginOfMonth);
    var weekdays = [];
    for (var weekday = 1; weekday <= 7; weekday += 1) {
      var weekdayDate = new Date(year, monthIndex, weekday - getDayOfWeek(beginOfMonth, calendarType));
      var abbr = formatWeekday2(locale3, weekdayDate);
      weekdays.push(import_react55.default.createElement(
        "div",
        { key: weekday, className: clsx_default(weekdayClassName, isCurrentDayOfWeek(weekdayDate) && "".concat(weekdayClassName, "--current"), isWeekend(weekdayDate, calendarType) && "".concat(weekdayClassName, "--weekend")) },
        import_react55.default.createElement("abbr", { "aria-label": abbr, title: abbr }, formatShortWeekday2(locale3, weekdayDate).replace(".", ""))
      ));
    }
    return import_react55.default.createElement(Flex, { className: className6, count: 7, onFocus: onMouseLeave, onMouseOver: onMouseLeave }, weekdays);
  }

  // client/node_modules/react-calendar/dist/esm/MonthView/WeekNumbers.js
  init_define_import_meta_env();
  var import_react57 = __toESM(require_react_shim(), 1);

  // client/node_modules/react-calendar/dist/esm/MonthView/WeekNumber.js
  init_define_import_meta_env();
  var import_react56 = __toESM(require_react_shim(), 1);
  var __assign13 = function() {
    __assign13 = Object.assign || function(t) {
      for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
          t[p] = s[p];
      }
      return t;
    };
    return __assign13.apply(this, arguments);
  };
  var __rest10 = function(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
      t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
        if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
          t[p[i]] = s[p[i]];
      }
    return t;
  };
  var className7 = "react-calendar__tile";
  function WeekNumber(props) {
    var onClickWeekNumber = props.onClickWeekNumber, weekNumber = props.weekNumber;
    var children = import_react56.default.createElement("span", null, weekNumber);
    if (onClickWeekNumber) {
      var date_1 = props.date, onClickWeekNumber_1 = props.onClickWeekNumber, weekNumber_1 = props.weekNumber, otherProps = __rest10(props, ["date", "onClickWeekNumber", "weekNumber"]);
      return import_react56.default.createElement("button", __assign13({}, otherProps, { className: className7, onClick: function(event) {
        return onClickWeekNumber_1(weekNumber_1, date_1, event);
      }, type: "button" }), children);
    } else {
      var date2 = props.date, onClickWeekNumber_2 = props.onClickWeekNumber, weekNumber_2 = props.weekNumber, otherProps = __rest10(props, ["date", "onClickWeekNumber", "weekNumber"]);
      return import_react56.default.createElement("div", __assign13({}, otherProps, { className: className7 }), children);
    }
  }

  // client/node_modules/react-calendar/dist/esm/MonthView/WeekNumbers.js
  function WeekNumbers(props) {
    var activeStartDate = props.activeStartDate, calendarTypeOrDeprecatedCalendarType = props.calendarType, onClickWeekNumber = props.onClickWeekNumber, onMouseLeave = props.onMouseLeave, showFixedNumberOfWeeks = props.showFixedNumberOfWeeks;
    var calendarType = mapCalendarType(calendarTypeOrDeprecatedCalendarType);
    var numberOfWeeks = (function() {
      if (showFixedNumberOfWeeks) {
        return 6;
      }
      var numberOfDays = getDaysInMonth(activeStartDate);
      var startWeekday = getDayOfWeek(activeStartDate, calendarType);
      var days = numberOfDays - (7 - startWeekday);
      return 1 + Math.ceil(days / 7);
    })();
    var dates = (function() {
      var year = getYear(activeStartDate);
      var monthIndex = getMonth(activeStartDate);
      var day = getDate(activeStartDate);
      var result = [];
      for (var index = 0; index < numberOfWeeks; index += 1) {
        result.push(getBeginOfWeek(new Date(year, monthIndex, day + index * 7), calendarType));
      }
      return result;
    })();
    var weekNumbers = dates.map(function(date2) {
      return getWeekNumber(date2, calendarType);
    });
    return import_react57.default.createElement(Flex, { className: "react-calendar__month-view__weekNumbers", count: numberOfWeeks, direction: "column", onFocus: onMouseLeave, onMouseOver: onMouseLeave, style: { flexBasis: "calc(100% * (1 / 8)", flexShrink: 0 } }, weekNumbers.map(function(weekNumber, weekIndex) {
      var date2 = dates[weekIndex];
      if (!date2) {
        throw new Error("date is not defined");
      }
      return import_react57.default.createElement(WeekNumber, { key: weekNumber, date: date2, onClickWeekNumber, weekNumber });
    }));
  }

  // client/node_modules/react-calendar/dist/esm/MonthView.js
  var __assign14 = function() {
    __assign14 = Object.assign || function(t) {
      for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
          t[p] = s[p];
      }
      return t;
    };
    return __assign14.apply(this, arguments);
  };
  var __rest11 = function(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
      t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
        if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
          t[p[i]] = s[p[i]];
      }
    return t;
  };
  function getCalendarTypeFromLocale(locale3) {
    if (locale3) {
      for (var _i = 0, _a3 = Object.entries(CALENDAR_TYPE_LOCALES); _i < _a3.length; _i++) {
        var _b = _a3[_i], calendarType = _b[0], locales = _b[1];
        if (locales.includes(locale3)) {
          return calendarType;
        }
      }
    }
    return CALENDAR_TYPES.ISO_8601;
  }
  var MonthView = function MonthView2(props) {
    var activeStartDate = props.activeStartDate, locale3 = props.locale, onMouseLeave = props.onMouseLeave, showFixedNumberOfWeeks = props.showFixedNumberOfWeeks;
    var _a3 = props.calendarType, calendarType = _a3 === void 0 ? getCalendarTypeFromLocale(locale3) : _a3, formatShortWeekday2 = props.formatShortWeekday, formatWeekday2 = props.formatWeekday, onClickWeekNumber = props.onClickWeekNumber, showWeekNumbers = props.showWeekNumbers, childProps = __rest11(props, ["calendarType", "formatShortWeekday", "formatWeekday", "onClickWeekNumber", "showWeekNumbers"]);
    function renderWeekdays() {
      return import_react58.default.createElement(Weekdays, { calendarType, formatShortWeekday: formatShortWeekday2, formatWeekday: formatWeekday2, locale: locale3, onMouseLeave });
    }
    function renderWeekNumbers() {
      if (!showWeekNumbers) {
        return null;
      }
      return import_react58.default.createElement(WeekNumbers, { activeStartDate, calendarType, onClickWeekNumber, onMouseLeave, showFixedNumberOfWeeks });
    }
    function renderDays() {
      return import_react58.default.createElement(Days, __assign14({ calendarType }, childProps));
    }
    var className8 = "react-calendar__month-view";
    return import_react58.default.createElement(
      "div",
      { className: clsx_default(className8, showWeekNumbers ? "".concat(className8, "--weekNumbers") : "") },
      import_react58.default.createElement(
        "div",
        { style: {
          display: "flex",
          alignItems: "flex-end"
        } },
        renderWeekNumbers(),
        import_react58.default.createElement(
          "div",
          { style: {
            flexGrow: 1,
            width: "100%"
          } },
          renderWeekdays(),
          renderDays()
        )
      )
    );
  };
  MonthView.propTypes = __assign14(__assign14({}, tileGroupProps), { calendarType: isCalendarType, formatDay: import_prop_types4.default.func, formatLongDate: import_prop_types4.default.func, formatShortWeekday: import_prop_types4.default.func, formatWeekday: import_prop_types4.default.func, onClickWeekNumber: import_prop_types4.default.func, onMouseLeave: import_prop_types4.default.func, showFixedNumberOfWeeks: import_prop_types4.default.bool, showNeighboringMonth: import_prop_types4.default.bool, showWeekNumbers: import_prop_types4.default.bool });
  var MonthView_default = MonthView;

  // client/node_modules/react-calendar/dist/esm/Calendar.js
  var __assign15 = function() {
    __assign15 = Object.assign || function(t) {
      for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
          t[p] = s[p];
      }
      return t;
    };
    return __assign15.apply(this, arguments);
  };
  var baseClassName = "react-calendar";
  var allViews2 = ["century", "decade", "year", "month"];
  var allValueTypes = ["decade", "year", "month", "day"];
  var defaultMinDate = /* @__PURE__ */ new Date();
  defaultMinDate.setFullYear(1, 0, 1);
  defaultMinDate.setHours(0, 0, 0, 0);
  var defaultMaxDate = /* @__PURE__ */ new Date(864e13);
  function toDate(value) {
    if (value instanceof Date) {
      return value;
    }
    return new Date(value);
  }
  function getLimitedViews(minDetail, maxDetail) {
    return allViews2.slice(allViews2.indexOf(minDetail), allViews2.indexOf(maxDetail) + 1);
  }
  function isViewAllowed(view, minDetail, maxDetail) {
    var views = getLimitedViews(minDetail, maxDetail);
    return views.indexOf(view) !== -1;
  }
  function getView(view, minDetail, maxDetail) {
    if (!view) {
      return maxDetail;
    }
    if (isViewAllowed(view, minDetail, maxDetail)) {
      return view;
    }
    return maxDetail;
  }
  function getValueType(view) {
    var index = allViews2.indexOf(view);
    return allValueTypes[index];
  }
  function getValue(value, index) {
    var rawValue = Array.isArray(value) ? value[index] : value;
    if (!rawValue) {
      return null;
    }
    var valueDate = toDate(rawValue);
    if (isNaN(valueDate.getTime())) {
      throw new Error("Invalid date: ".concat(value));
    }
    return valueDate;
  }
  function getDetailValue(_a3, index) {
    var value = _a3.value, minDate = _a3.minDate, maxDate = _a3.maxDate, maxDetail = _a3.maxDetail;
    var valuePiece = getValue(value, index);
    if (!valuePiece) {
      return null;
    }
    var valueType = getValueType(maxDetail);
    var detailValueFrom = (function() {
      switch (index) {
        case 0:
          return getBegin(valueType, valuePiece);
        case 1:
          return getEnd(valueType, valuePiece);
        default:
          throw new Error("Invalid index value: ".concat(index));
      }
    })();
    return between(detailValueFrom, minDate, maxDate);
  }
  var getDetailValueFrom = function(args) {
    return getDetailValue(args, 0);
  };
  var getDetailValueTo = function(args) {
    return getDetailValue(args, 1);
  };
  var getDetailValueArray = function(args) {
    return [getDetailValueFrom, getDetailValueTo].map(function(fn) {
      return fn(args);
    });
  };
  function getActiveStartDate(_a3) {
    var maxDate = _a3.maxDate, maxDetail = _a3.maxDetail, minDate = _a3.minDate, minDetail = _a3.minDetail, value = _a3.value, view = _a3.view;
    var rangeType = getView(view, minDetail, maxDetail);
    var valueFrom = getDetailValueFrom({
      value,
      minDate,
      maxDate,
      maxDetail
    }) || /* @__PURE__ */ new Date();
    return getBegin(rangeType, valueFrom);
  }
  function getInitialActiveStartDate(_a3) {
    var activeStartDate = _a3.activeStartDate, defaultActiveStartDate = _a3.defaultActiveStartDate, defaultValue = _a3.defaultValue, defaultView = _a3.defaultView, maxDate = _a3.maxDate, maxDetail = _a3.maxDetail, minDate = _a3.minDate, minDetail = _a3.minDetail, value = _a3.value, view = _a3.view;
    var rangeType = getView(view, minDetail, maxDetail);
    var valueFrom = activeStartDate || defaultActiveStartDate;
    if (valueFrom) {
      return getBegin(rangeType, valueFrom);
    }
    return getActiveStartDate({
      maxDate,
      maxDetail,
      minDate,
      minDetail,
      value: value || defaultValue,
      view: view || defaultView
    });
  }
  function getIsSingleValue(value) {
    return value && (!Array.isArray(value) || value.length === 1);
  }
  function areDatesEqual(date1, date2) {
    return date1 instanceof Date && date2 instanceof Date && date1.getTime() === date2.getTime();
  }
  var Calendar = (0, import_react59.forwardRef)(function Calendar2(props, ref) {
    var activeStartDateProps = props.activeStartDate, allowPartialRange = props.allowPartialRange, calendarType = props.calendarType, className8 = props.className, defaultActiveStartDate = props.defaultActiveStartDate, defaultValue = props.defaultValue, defaultView = props.defaultView, formatDay2 = props.formatDay, formatLongDate2 = props.formatLongDate, formatMonth2 = props.formatMonth, formatMonthYear2 = props.formatMonthYear, formatShortWeekday2 = props.formatShortWeekday, formatWeekday2 = props.formatWeekday, formatYear3 = props.formatYear, _a3 = props.goToRangeStartOnSelect, goToRangeStartOnSelect = _a3 === void 0 ? true : _a3, inputRef = props.inputRef, locale3 = props.locale, _b = props.maxDate, maxDate = _b === void 0 ? defaultMaxDate : _b, _c = props.maxDetail, maxDetail = _c === void 0 ? "month" : _c, _d = props.minDate, minDate = _d === void 0 ? defaultMinDate : _d, _e = props.minDetail, minDetail = _e === void 0 ? "century" : _e, navigationAriaLabel = props.navigationAriaLabel, navigationAriaLive = props.navigationAriaLive, navigationLabel = props.navigationLabel, next2AriaLabel = props.next2AriaLabel, next2Label = props.next2Label, nextAriaLabel = props.nextAriaLabel, nextLabel = props.nextLabel, onActiveStartDateChange = props.onActiveStartDateChange, onChangeProps = props.onChange, onClickDay = props.onClickDay, onClickDecade = props.onClickDecade, onClickMonth = props.onClickMonth, onClickWeekNumber = props.onClickWeekNumber, onClickYear = props.onClickYear, onDrillDown = props.onDrillDown, onDrillUp = props.onDrillUp, onViewChange = props.onViewChange, prev2AriaLabel = props.prev2AriaLabel, prev2Label = props.prev2Label, prevAriaLabel = props.prevAriaLabel, prevLabel = props.prevLabel, _f = props.returnValue, returnValue = _f === void 0 ? "start" : _f, selectRange = props.selectRange, showDoubleView = props.showDoubleView, showFixedNumberOfWeeks = props.showFixedNumberOfWeeks, _g = props.showNavigation, showNavigation = _g === void 0 ? true : _g, showNeighboringCentury = props.showNeighboringCentury, showNeighboringDecade = props.showNeighboringDecade, _h = props.showNeighboringMonth, showNeighboringMonth = _h === void 0 ? true : _h, showWeekNumbers = props.showWeekNumbers, tileClassName = props.tileClassName, tileContent = props.tileContent, tileDisabled = props.tileDisabled, valueProps = props.value, viewProps = props.view;
    var _j = (0, import_react59.useState)(defaultActiveStartDate), activeStartDateState = _j[0], setActiveStartDateState = _j[1];
    var _k = (0, import_react59.useState)(null), hoverState = _k[0], setHoverState = _k[1];
    var _l = (0, import_react59.useState)(Array.isArray(defaultValue) ? defaultValue.map(function(el) {
      return el !== null ? toDate(el) : null;
    }) : defaultValue !== null && defaultValue !== void 0 ? toDate(defaultValue) : null), valueState = _l[0], setValueState = _l[1];
    var _m = (0, import_react59.useState)(defaultView), viewState = _m[0], setViewState = _m[1];
    var activeStartDate = activeStartDateProps || activeStartDateState || getInitialActiveStartDate({
      activeStartDate: activeStartDateProps,
      defaultActiveStartDate,
      defaultValue,
      defaultView,
      maxDate,
      maxDetail,
      minDate,
      minDetail,
      value: valueProps,
      view: viewProps
    });
    var value = (function() {
      var rawValue = (function() {
        if (selectRange && getIsSingleValue(valueState)) {
          return valueState;
        }
        return valueProps !== void 0 ? valueProps : valueState;
      })();
      if (!rawValue) {
        return null;
      }
      return Array.isArray(rawValue) ? rawValue.map(function(el) {
        return el !== null ? toDate(el) : null;
      }) : rawValue !== null ? toDate(rawValue) : null;
    })();
    var valueType = getValueType(maxDetail);
    var view = getView(viewProps || viewState, minDetail, maxDetail);
    var views = getLimitedViews(minDetail, maxDetail);
    var hover = selectRange ? hoverState : null;
    var drillDownAvailable = views.indexOf(view) < views.length - 1;
    var drillUpAvailable = views.indexOf(view) > 0;
    var getProcessedValue = (0, import_react59.useCallback)(function(value2) {
      var processFunction = (function() {
        switch (returnValue) {
          case "start":
            return getDetailValueFrom;
          case "end":
            return getDetailValueTo;
          case "range":
            return getDetailValueArray;
          default:
            throw new Error("Invalid returnValue.");
        }
      })();
      return processFunction({
        maxDate,
        maxDetail,
        minDate,
        value: value2
      });
    }, [maxDate, maxDetail, minDate, returnValue]);
    var setActiveStartDate = (0, import_react59.useCallback)(function(nextActiveStartDate, action) {
      setActiveStartDateState(nextActiveStartDate);
      var args = {
        action,
        activeStartDate: nextActiveStartDate,
        value,
        view
      };
      if (onActiveStartDateChange && !areDatesEqual(activeStartDate, nextActiveStartDate)) {
        onActiveStartDateChange(args);
      }
    }, [activeStartDate, onActiveStartDateChange, value, view]);
    var onClickTile = (0, import_react59.useCallback)(function(value2, event) {
      var callback = (function() {
        switch (view) {
          case "century":
            return onClickDecade;
          case "decade":
            return onClickYear;
          case "year":
            return onClickMonth;
          case "month":
            return onClickDay;
          default:
            throw new Error("Invalid view: ".concat(view, "."));
        }
      })();
      if (callback)
        callback(value2, event);
    }, [onClickDay, onClickDecade, onClickMonth, onClickYear, view]);
    var drillDown = (0, import_react59.useCallback)(function(nextActiveStartDate, event) {
      if (!drillDownAvailable) {
        return;
      }
      onClickTile(nextActiveStartDate, event);
      var nextView = views[views.indexOf(view) + 1];
      if (!nextView) {
        throw new Error("Attempted to drill down from the lowest view.");
      }
      setActiveStartDateState(nextActiveStartDate);
      setViewState(nextView);
      var args = {
        action: "drillDown",
        activeStartDate: nextActiveStartDate,
        value,
        view: nextView
      };
      if (onActiveStartDateChange && !areDatesEqual(activeStartDate, nextActiveStartDate)) {
        onActiveStartDateChange(args);
      }
      if (onViewChange && view !== nextView) {
        onViewChange(args);
      }
      if (onDrillDown) {
        onDrillDown(args);
      }
    }, [
      activeStartDate,
      drillDownAvailable,
      onActiveStartDateChange,
      onClickTile,
      onDrillDown,
      onViewChange,
      value,
      view,
      views
    ]);
    var drillUp = (0, import_react59.useCallback)(function() {
      if (!drillUpAvailable) {
        return;
      }
      var nextView = views[views.indexOf(view) - 1];
      if (!nextView) {
        throw new Error("Attempted to drill up from the highest view.");
      }
      var nextActiveStartDate = getBegin(nextView, activeStartDate);
      setActiveStartDateState(nextActiveStartDate);
      setViewState(nextView);
      var args = {
        action: "drillUp",
        activeStartDate: nextActiveStartDate,
        value,
        view: nextView
      };
      if (onActiveStartDateChange && !areDatesEqual(activeStartDate, nextActiveStartDate)) {
        onActiveStartDateChange(args);
      }
      if (onViewChange && view !== nextView) {
        onViewChange(args);
      }
      if (onDrillUp) {
        onDrillUp(args);
      }
    }, [
      activeStartDate,
      drillUpAvailable,
      onActiveStartDateChange,
      onDrillUp,
      onViewChange,
      value,
      view,
      views
    ]);
    var onChange = (0, import_react59.useCallback)(function(rawNextValue, event) {
      var previousValue = value;
      onClickTile(rawNextValue, event);
      var isFirstValueInRange = selectRange && !getIsSingleValue(previousValue);
      var nextValue;
      if (selectRange) {
        if (isFirstValueInRange) {
          nextValue = getBegin(valueType, rawNextValue);
        } else {
          if (!previousValue) {
            throw new Error("previousValue is required");
          }
          if (Array.isArray(previousValue)) {
            throw new Error("previousValue must not be an array");
          }
          nextValue = getValueRange(valueType, previousValue, rawNextValue);
        }
      } else {
        nextValue = getProcessedValue(rawNextValue);
      }
      var nextActiveStartDate = (
        // Range selection turned off
        !selectRange || // Range selection turned on, first value
        isFirstValueInRange || // Range selection turned on, second value, goToRangeStartOnSelect toggled on
        goToRangeStartOnSelect ? getActiveStartDate({
          maxDate,
          maxDetail,
          minDate,
          minDetail,
          value: nextValue,
          view
        }) : null
      );
      event.persist();
      setActiveStartDateState(nextActiveStartDate);
      setValueState(nextValue);
      var args = {
        action: "onChange",
        activeStartDate: nextActiveStartDate,
        value: nextValue,
        view
      };
      if (onActiveStartDateChange && !areDatesEqual(activeStartDate, nextActiveStartDate)) {
        onActiveStartDateChange(args);
      }
      if (onChangeProps) {
        if (selectRange) {
          var isSingleValue = getIsSingleValue(nextValue);
          if (!isSingleValue) {
            onChangeProps(nextValue || null, event);
          } else if (allowPartialRange) {
            if (Array.isArray(nextValue)) {
              throw new Error("value must not be an array");
            }
            onChangeProps([nextValue || null, null], event);
          }
        } else {
          onChangeProps(nextValue || null, event);
        }
      }
    }, [
      activeStartDate,
      allowPartialRange,
      getProcessedValue,
      goToRangeStartOnSelect,
      maxDate,
      maxDetail,
      minDate,
      minDetail,
      onActiveStartDateChange,
      onChangeProps,
      onClickTile,
      selectRange,
      value,
      valueType,
      view
    ]);
    function onMouseOver(nextHover) {
      setHoverState(nextHover);
    }
    function onMouseLeave() {
      setHoverState(null);
    }
    (0, import_react59.useImperativeHandle)(ref, function() {
      return {
        activeStartDate,
        drillDown,
        drillUp,
        onChange,
        setActiveStartDate,
        value,
        view
      };
    }, [activeStartDate, drillDown, drillUp, onChange, setActiveStartDate, value, view]);
    function renderContent(next) {
      var currentActiveStartDate = next ? getBeginNext(view, activeStartDate) : getBegin(view, activeStartDate);
      var onClick = drillDownAvailable ? drillDown : onChange;
      var commonProps = {
        activeStartDate: currentActiveStartDate,
        hover,
        locale: locale3,
        maxDate,
        minDate,
        onClick,
        onMouseOver: selectRange ? onMouseOver : void 0,
        tileClassName,
        tileContent,
        tileDisabled,
        value,
        valueType
      };
      switch (view) {
        case "century": {
          return import_react59.default.createElement(CenturyView_default, __assign15({ formatYear: formatYear3, showNeighboringCentury }, commonProps));
        }
        case "decade": {
          return import_react59.default.createElement(DecadeView_default, __assign15({ formatYear: formatYear3, showNeighboringDecade }, commonProps));
        }
        case "year": {
          return import_react59.default.createElement(YearView_default, __assign15({ formatMonth: formatMonth2, formatMonthYear: formatMonthYear2 }, commonProps));
        }
        case "month": {
          return import_react59.default.createElement(MonthView_default, __assign15({ calendarType, formatDay: formatDay2, formatLongDate: formatLongDate2, formatShortWeekday: formatShortWeekday2, formatWeekday: formatWeekday2, onClickWeekNumber, onMouseLeave: selectRange ? onMouseLeave : void 0, showFixedNumberOfWeeks: typeof showFixedNumberOfWeeks !== "undefined" ? showFixedNumberOfWeeks : showDoubleView, showNeighboringMonth, showWeekNumbers }, commonProps));
        }
        default:
          throw new Error("Invalid view: ".concat(view, "."));
      }
    }
    function renderNavigation() {
      if (!showNavigation) {
        return null;
      }
      return import_react59.default.createElement(Navigation, { activeStartDate, drillUp, formatMonthYear: formatMonthYear2, formatYear: formatYear3, locale: locale3, maxDate, minDate, navigationAriaLabel, navigationAriaLive, navigationLabel, next2AriaLabel, next2Label, nextAriaLabel, nextLabel, prev2AriaLabel, prev2Label, prevAriaLabel, prevLabel, setActiveStartDate, showDoubleView, view, views });
    }
    var valueArray = Array.isArray(value) ? value : [value];
    return import_react59.default.createElement(
      "div",
      { className: clsx_default(baseClassName, selectRange && valueArray.length === 1 && "".concat(baseClassName, "--selectRange"), showDoubleView && "".concat(baseClassName, "--doubleView"), className8), ref: inputRef },
      renderNavigation(),
      import_react59.default.createElement(
        "div",
        { className: "".concat(baseClassName, "__viewContainer"), onBlur: selectRange ? onMouseLeave : void 0, onMouseLeave: selectRange ? onMouseLeave : void 0 },
        renderContent(),
        showDoubleView ? renderContent(true) : null
      )
    );
  });
  var isActiveStartDate = import_prop_types5.default.instanceOf(Date);
  var isValue2 = import_prop_types5.default.oneOfType([import_prop_types5.default.string, import_prop_types5.default.instanceOf(Date)]);
  var isValueOrValueArray = import_prop_types5.default.oneOfType([isValue2, rangeOf(isValue2)]);
  Calendar.propTypes = {
    activeStartDate: isActiveStartDate,
    allowPartialRange: import_prop_types5.default.bool,
    calendarType: isCalendarType,
    className: isClassName,
    defaultActiveStartDate: isActiveStartDate,
    defaultValue: isValueOrValueArray,
    defaultView: isView,
    formatDay: import_prop_types5.default.func,
    formatLongDate: import_prop_types5.default.func,
    formatMonth: import_prop_types5.default.func,
    formatMonthYear: import_prop_types5.default.func,
    formatShortWeekday: import_prop_types5.default.func,
    formatWeekday: import_prop_types5.default.func,
    formatYear: import_prop_types5.default.func,
    goToRangeStartOnSelect: import_prop_types5.default.bool,
    inputRef: isRef,
    locale: import_prop_types5.default.string,
    maxDate: isMaxDate,
    maxDetail: import_prop_types5.default.oneOf(allViews2),
    minDate: isMinDate,
    minDetail: import_prop_types5.default.oneOf(allViews2),
    navigationAriaLabel: import_prop_types5.default.string,
    navigationAriaLive: import_prop_types5.default.oneOf(["off", "polite", "assertive"]),
    navigationLabel: import_prop_types5.default.func,
    next2AriaLabel: import_prop_types5.default.string,
    next2Label: import_prop_types5.default.node,
    nextAriaLabel: import_prop_types5.default.string,
    nextLabel: import_prop_types5.default.node,
    onActiveStartDateChange: import_prop_types5.default.func,
    onChange: import_prop_types5.default.func,
    onClickDay: import_prop_types5.default.func,
    onClickDecade: import_prop_types5.default.func,
    onClickMonth: import_prop_types5.default.func,
    onClickWeekNumber: import_prop_types5.default.func,
    onClickYear: import_prop_types5.default.func,
    onDrillDown: import_prop_types5.default.func,
    onDrillUp: import_prop_types5.default.func,
    onViewChange: import_prop_types5.default.func,
    prev2AriaLabel: import_prop_types5.default.string,
    prev2Label: import_prop_types5.default.node,
    prevAriaLabel: import_prop_types5.default.string,
    prevLabel: import_prop_types5.default.node,
    returnValue: import_prop_types5.default.oneOf(["start", "end", "range"]),
    selectRange: import_prop_types5.default.bool,
    showDoubleView: import_prop_types5.default.bool,
    showFixedNumberOfWeeks: import_prop_types5.default.bool,
    showNavigation: import_prop_types5.default.bool,
    showNeighboringCentury: import_prop_types5.default.bool,
    showNeighboringDecade: import_prop_types5.default.bool,
    showNeighboringMonth: import_prop_types5.default.bool,
    showWeekNumbers: import_prop_types5.default.bool,
    tileClassName: import_prop_types5.default.oneOfType([import_prop_types5.default.func, isClassName]),
    tileContent: import_prop_types5.default.oneOfType([import_prop_types5.default.func, import_prop_types5.default.node]),
    tileDisabled: import_prop_types5.default.func,
    value: isValueOrValueArray,
    view: isView
  };
  var Calendar_default = Calendar;

  // client/node_modules/react-calendar/dist/esm/index.js
  var esm_default2 = Calendar_default;

  // client/src/components/CalendarWidget.jsx
  function CalendarWidget() {
    const [date2, setDate] = (0, import_react60.useState)(/* @__PURE__ */ new Date());
    return /* @__PURE__ */ import_react60.default.createElement("div", { className: "calendar-widget" }, /* @__PURE__ */ import_react60.default.createElement("div", { className: "calendar-header" }, /* @__PURE__ */ import_react60.default.createElement("span", null, date2.toLocaleString("default", { month: "long", year: "numeric" }))), /* @__PURE__ */ import_react60.default.createElement(
      esm_default2,
      {
        onChange: setDate,
        value: date2,
        className: "calendar-core",
        calendarType: "gregory"
      }
    ));
  }
  var CalendarWidget_default = CalendarWidget;
  return __toCommonJS(ds_entry_exports);
})();
/*! Bundled license information:

use-sync-external-store/cjs/use-sync-external-store-shim.development.js:
  (**
   * @license React
   * use-sync-external-store-shim.development.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

use-sync-external-store/cjs/use-sync-external-store-shim/with-selector.development.js:
  (**
   * @license React
   * use-sync-external-store-shim/with-selector.development.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

decimal.js-light/decimal.js:
  (*! decimal.js-light v2.5.1 https://github.com/MikeMcl/decimal.js-light/LICENCE *)

use-sync-external-store/cjs/use-sync-external-store-with-selector.development.js:
  (**
   * @license React
   * use-sync-external-store-with-selector.development.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

object-assign/index.js:
  (*
  object-assign
  (c) Sindre Sorhus
  @license MIT
  *)
*/
window.Mobius=Mobius.__dsMainNs?Object.assign({},Mobius,Mobius.__dsMainNs,{__dsMainNs:undefined}):Mobius;
