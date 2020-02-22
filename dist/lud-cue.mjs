var commonjsGlobal =
    typeof globalThis !== 'undefined'
        ? globalThis
        : typeof window !== 'undefined'
        ? window
        : typeof global !== 'undefined'
        ? global
        : typeof self !== 'undefined'
        ? self
        : {};

function commonjsRequire() {
    throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
}

function unwrapExports(x) {
    return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default')
        ? x['default']
        : x;
}

function createCommonjsModule(fn, module) {
    return (module = { exports: {} }), fn(module, module.exports), module.exports;
}

function getCjsExportFromNamespace(n) {
    return (n && n['default']) || n;
}

var errors = createCommonjsModule(function(module, exports) {
    'use strict';
    var __extends =
        (commonjsGlobal && commonjsGlobal.__extends) ||
        (function() {
            var extendStatics = function(d, b) {
                extendStatics =
                    Object.setPrototypeOf ||
                    ({ __proto__: [] } instanceof Array &&
                        function(d, b) {
                            d.__proto__ = b;
                        }) ||
                    function(d, b) {
                        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
                    };
                return extendStatics(d, b);
            };
            return function(d, b) {
                extendStatics(d, b);
                function __() {
                    this.constructor = d;
                }
                d.prototype =
                    b === null ? Object.create(b) : ((__.prototype = b.prototype), new __());
            };
        })();
    Object.defineProperty(exports, '__esModule', { value: true });
    var ValidationError = /** @class */ (function(_super) {
        __extends(ValidationError, _super);
        function ValidationError(message, key) {
            var _this = _super.call(this, message) || this;
            _this.message = message;
            _this.key = key;
            _this.name = 'ValidationError';
            Object.setPrototypeOf(_this, ValidationError.prototype);
            return _this;
        }
        return ValidationError;
    })(Error);
    exports.ValidationError = ValidationError;
});

var errors$1 = unwrapExports(errors);
var errors_1 = errors.ValidationError;

var contract = createCommonjsModule(function(module, exports) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });

    function Contract() {
        var runtypes = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            runtypes[_i] = arguments[_i];
        }
        var lastIndex = runtypes.length - 1;
        var argTypes = runtypes.slice(0, lastIndex);
        var returnType = runtypes[lastIndex];
        return {
            enforce: function(f) {
                return function() {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    if (args.length < argTypes.length)
                        throw new errors.ValidationError(
                            'Expected ' +
                                argTypes.length +
                                ' arguments but only received ' +
                                args.length,
                        );
                    for (var i = 0; i < argTypes.length; i++) argTypes[i].check(args[i]);
                    return returnType.check(f.apply(void 0, args));
                };
            },
        };
    }
    exports.Contract = Contract;
});

var contract$1 = unwrapExports(contract);
var contract_1 = contract.Contract;

var match_1 = createCommonjsModule(function(module, exports) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    function match() {
        var cases = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            cases[_i] = arguments[_i];
        }
        return function(x) {
            for (var _i = 0, cases_1 = cases; _i < cases_1.length; _i++) {
                var _a = cases_1[_i],
                    T = _a[0],
                    f = _a[1];
                if (T.guard(x)) return f(x);
            }
            throw new Error('No alternatives were matched');
        };
    }
    exports.match = match;
});

var match = unwrapExports(match_1);
var match_2 = match_1.match;

var show_1 = createCommonjsModule(function(module, exports) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    var show = function(needsParens, circular) {
        if (circular === void 0) {
            circular = new Set();
        }
        return function(refl) {
            var parenthesize = function(s) {
                return needsParens ? '(' + s + ')' : s;
            };
            if (circular.has(refl)) {
                return parenthesize('CIRCULAR ' + refl.tag);
            }
            circular.add(refl);
            try {
                switch (refl.tag) {
                    // Primitive types
                    case 'unknown':
                    case 'never':
                    case 'void':
                    case 'boolean':
                    case 'number':
                    case 'string':
                    case 'symbol':
                    case 'function':
                        return refl.tag;
                    // Complex types
                    case 'literal': {
                        var value = refl.value;
                        return typeof value === 'string' ? '"' + value + '"' : String(value);
                    }
                    case 'array':
                        return '' + readonlyTag(refl) + show(true, circular)(refl.element) + '[]';
                    case 'dictionary':
                        return (
                            '{ [_: ' + refl.key + ']: ' + show(false, circular)(refl.value) + ' }'
                        );
                    case 'record': {
                        var keys = Object.keys(refl.fields);
                        return keys.length
                            ? '{ ' +
                                  keys
                                      .map(function(k) {
                                          return (
                                              '' +
                                              readonlyTag(refl) +
                                              k +
                                              ': ' +
                                              show(false, circular)(refl.fields[k]) +
                                              ';'
                                          );
                                      })
                                      .join(' ') +
                                  ' }'
                            : '{}';
                    }
                    case 'partial': {
                        var keys = Object.keys(refl.fields);
                        return keys.length
                            ? '{ ' +
                                  keys
                                      .map(function(k) {
                                          return (
                                              k +
                                              '?: ' +
                                              show(false, circular)(refl.fields[k]) +
                                              ';'
                                          );
                                      })
                                      .join(' ') +
                                  ' }'
                            : '{}';
                    }
                    case 'tuple':
                        return '[' + refl.components.map(show(false, circular)).join(', ') + ']';
                    case 'union':
                        return parenthesize(
                            '' + refl.alternatives.map(show(true, circular)).join(' | '),
                        );
                    case 'intersect':
                        return parenthesize(
                            '' + refl.intersectees.map(show(true, circular)).join(' & '),
                        );
                    case 'constraint':
                        return refl.name || show(needsParens, circular)(refl.underlying);
                    case 'instanceof':
                        var name_1 = refl.ctor.name;
                        return 'InstanceOf<' + name_1 + '>';
                    case 'brand':
                        return show(needsParens, circular)(refl.entity);
                }
            } finally {
                circular.delete(refl);
            }
            throw Error('impossible');
        };
    };
    exports.default = show(false);
    function readonlyTag(_a) {
        var isReadonly = _a.isReadonly;
        return isReadonly ? 'readonly ' : '';
    }
});

var show = unwrapExports(show_1);

var runtype = createCommonjsModule(function(module, exports) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });

    function create(validate, A) {
        A.check = check;
        A.validate = validate;
        A.guard = guard;
        A.Or = Or;
        A.And = And;
        A.withConstraint = withConstraint;
        A.withGuard = withGuard;
        A.withBrand = withBrand;
        A.reflect = A;
        A.toString = function() {
            return 'Runtype<' + show_1.default(A) + '>';
        };
        return A;
        function check(x) {
            var validated = validate(x);
            if (validated.success) {
                return validated.value;
            }
            throw new errors.ValidationError(validated.message, validated.key);
        }
        function guard(x) {
            return validate(x).success;
        }
        function Or(B) {
            return lib.Union(A, B);
        }
        function And(B) {
            return lib.Intersect(A, B);
        }
        function withConstraint(constraint, options) {
            return lib.Constraint(A, constraint, options);
        }
        function withGuard(guard, options) {
            return lib.Constraint(A, guard, options);
        }
        function withBrand(B) {
            return lib.Brand(B, A);
        }
    }
    exports.create = create;
});

var runtype$1 = unwrapExports(runtype);
var runtype_1 = runtype.create;

var unknown = createCommonjsModule(function(module, exports) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });

    /**
     * Validates anything, but provides no new type information about it.
     */
    exports.Unknown = runtype.create(
        function(value) {
            return { success: true, value: value };
        },
        { tag: 'unknown' },
    );
});

var unknown$1 = unwrapExports(unknown);
var unknown_1 = unknown.Unknown;

var never = createCommonjsModule(function(module, exports) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });

    /**
     * Validates nothing (unknown fails).
     */
    exports.Never = runtype.create(
        function(value) {
            return {
                success: false,
                message: 'Expected nothing, but was ' + (value === null ? value : typeof value),
            };
        },
        { tag: 'never' },
    );
});

var never$1 = unwrapExports(never);
var never_1 = never.Never;

var _void = createCommonjsModule(function(module, exports) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });

    /**
     * Void is an alias for Unknown
     *
     * @deprecated Please use Unknown instead
     */
    exports.Void = unknown.Unknown;
});

var _void$1 = unwrapExports(_void);
var _void_1 = _void.Void;

var literal_1 = createCommonjsModule(function(module, exports) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });

    /**
     * Be aware of an Array of Symbols `[Symbol()]` which would throw "TypeError: Cannot convert a Symbol value to a string"
     */
    function literal(value) {
        return Array.isArray(value) ? String(value.map(String)) : String(value);
    }
    /**
     * Construct a runtype for a type literal.
     */
    function Literal(valueBase) {
        return runtype.create(
            function(value) {
                return value === valueBase
                    ? { success: true, value: value }
                    : {
                          success: false,
                          message:
                              "Expected literal '" +
                              literal(valueBase) +
                              "', but was '" +
                              literal(value) +
                              "'",
                      };
            },
            { tag: 'literal', value: valueBase },
        );
    }
    exports.Literal = Literal;
    /**
     * An alias for Literal(undefined).
     */
    exports.Undefined = Literal(undefined);
    /**
     * An alias for Literal(null).
     */
    exports.Null = Literal(null);
});

var literal = unwrapExports(literal_1);
var literal_2 = literal_1.Literal;
var literal_3 = literal_1.Undefined;
var literal_4 = literal_1.Null;

var boolean_1 = createCommonjsModule(function(module, exports) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });

    /**
     * Validates that a value is a boolean.
     */
    exports.Boolean = runtype.create(
        function(value) {
            return typeof value === 'boolean'
                ? { success: true, value: value }
                : {
                      success: false,
                      message:
                          'Expected boolean, but was ' + (value === null ? value : typeof value),
                  };
        },
        { tag: 'boolean' },
    );
});

var boolean = unwrapExports(boolean_1);
var boolean_2 = boolean_1.Boolean;

var number = createCommonjsModule(function(module, exports) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });

    /**
     * Validates that a value is a number.
     */
    exports.Number = runtype.create(
        function(value) {
            return typeof value === 'number'
                ? { success: true, value: value }
                : {
                      success: false,
                      message:
                          'Expected number, but was ' + (value === null ? value : typeof value),
                  };
        },
        { tag: 'number' },
    );
});

var number$1 = unwrapExports(number);
var number_1 = number.Number;

var string = createCommonjsModule(function(module, exports) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });

    /**
     * Validates that a value is a string.
     */
    exports.String = runtype.create(
        function(value) {
            return typeof value === 'string'
                ? { success: true, value: value }
                : {
                      success: false,
                      message:
                          'Expected string, but was ' + (value === null ? value : typeof value),
                  };
        },
        { tag: 'string' },
    );
});

var string$1 = unwrapExports(string);
var string_1 = string.String;

var symbol = createCommonjsModule(function(module, exports) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });

    /**
     * Validates that a value is a symbol.
     */
    var Sym = runtype.create(
        function(value) {
            return typeof value === 'symbol'
                ? { success: true, value: value }
                : {
                      success: false,
                      message:
                          'Expected symbol, but was ' + (value === null ? value : typeof value),
                  };
        },
        { tag: 'symbol' },
    );
    exports.Symbol = Sym;
});

var symbol$1 = unwrapExports(symbol);
var symbol_1 = symbol.Symbol;

var array = createCommonjsModule(function(module, exports) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });

    /**
     * Construct an array runtype from a runtype for its elements.
     */
    function InternalArr(element, isReadonly) {
        return withExtraModifierFuncs(
            runtype.create(
                function(xs) {
                    if (!Array.isArray(xs)) {
                        return {
                            success: false,
                            message: 'Expected array, but was ' + (xs === null ? xs : typeof xs),
                        };
                    }
                    for (var _i = 0, xs_1 = xs; _i < xs_1.length; _i++) {
                        var x = xs_1[_i];
                        var validated = element.validate(x);
                        if (!validated.success) {
                            return {
                                success: false,
                                message: validated.message,
                                key: validated.key
                                    ? '[' + xs.indexOf(x) + '].' + validated.key
                                    : '[' + xs.indexOf(x) + ']',
                            };
                        }
                    }
                    return { success: true, value: xs };
                },
                { tag: 'array', isReadonly: isReadonly, element: element },
            ),
        );
    }
    function Arr(element) {
        return InternalArr(element, false);
    }
    exports.Array = Arr;
    function withExtraModifierFuncs(A) {
        A.asReadonly = asReadonly;
        return A;
        function asReadonly() {
            return InternalArr(A.element, true);
        }
    }
});

var array$1 = unwrapExports(array);
var array_1 = array.Array;

var tuple = createCommonjsModule(function(module, exports) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });

    function Tuple() {
        var components = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            components[_i] = arguments[_i];
        }
        return runtype.create(
            function(x) {
                var validated = array.Array(unknown.Unknown).validate(x);
                if (!validated.success) {
                    return {
                        success: false,
                        message: 'Expected tuple to be an array:\u00A0' + validated.message,
                        key: validated.key,
                    };
                }
                if (validated.value.length < components.length) {
                    return {
                        success: false,
                        message:
                            'Expected an array of length ' +
                            components.length +
                            ', but was ' +
                            validated.value.length,
                    };
                }
                for (var i = 0; i < components.length; i++) {
                    var validatedComponent = components[i].validate(validated.value[i]);
                    if (!validatedComponent.success) {
                        return {
                            success: false,
                            message: validatedComponent.message,
                            key: validatedComponent.key
                                ? '[' + i + '].' + validatedComponent.key
                                : '[' + i + ']',
                        };
                    }
                }
                return { success: true, value: x };
            },
            { tag: 'tuple', components: components },
        );
    }
    exports.Tuple = Tuple;
});

var tuple$1 = unwrapExports(tuple);
var tuple_1 = tuple.Tuple;

var util = createCommonjsModule(function(module, exports) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    // Type guard to determine if an object has a given key
    // If this feature gets implemented, we can use `in` instead: https://github.com/Microsoft/TypeScript/issues/10485
    function hasKey(k, o) {
        return typeof o === 'object' && k in o;
    }
    exports.hasKey = hasKey;
});

var util$1 = unwrapExports(util);
var util_1 = util.hasKey;

var record = createCommonjsModule(function(module, exports) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });

    /**
     * Construct a record runtype from runtypes for its values.
     */
    function InternalRecord(fields, isReadonly) {
        return withExtraModifierFuncs(
            runtype.create(
                function(x) {
                    if (x === null || x === undefined) {
                        var a = runtype.create(
                            function(_x) {
                                return { success: true, value: _x };
                            },
                            { tag: 'record', fields: fields },
                        );
                        return {
                            success: false,
                            message: 'Expected ' + show_1.default(a) + ', but was ' + x,
                        };
                    }
                    for (var key in fields) {
                        var validated = fields[key].validate(
                            util.hasKey(key, x) ? x[key] : undefined,
                        );
                        if (!validated.success) {
                            return {
                                success: false,
                                message: validated.message,
                                key: validated.key ? key + '.' + validated.key : key,
                            };
                        }
                    }
                    return { success: true, value: x };
                },
                { tag: 'record', isReadonly: isReadonly, fields: fields },
            ),
        );
    }
    exports.InternalRecord = InternalRecord;
    function Record(fields) {
        return InternalRecord(fields, false);
    }
    exports.Record = Record;
    function withExtraModifierFuncs(A) {
        A.asReadonly = asReadonly;
        return A;
        function asReadonly() {
            return InternalRecord(A.fields, true);
        }
    }
});

var record$1 = unwrapExports(record);
var record_1 = record.InternalRecord;
var record_2 = record.Record;

var partial = createCommonjsModule(function(module, exports) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });

    /**
     * Construct a runtype for partial records
     */
    function Part(fields) {
        return runtype.create(
            function(x) {
                if (x === null || x === undefined) {
                    var a = runtype.create(
                        function(_x) {
                            return { success: true, value: _x };
                        },
                        { tag: 'partial', fields: fields },
                    );
                    return {
                        success: false,
                        message: 'Expected ' + show_1.default(a) + ', but was ' + x,
                    };
                }
                for (var key in fields) {
                    if (util.hasKey(key, x) && x[key] !== undefined) {
                        var validated = fields[key].validate(x[key]);
                        if (!validated.success) {
                            return {
                                success: false,
                                message: validated.message,
                                key: validated.key ? key + '.' + validated.key : key,
                            };
                        }
                    }
                }
                return { success: true, value: x };
            },
            { tag: 'partial', fields: fields },
        );
    }
    exports.Part = Part;
    exports.Partial = Part;
});

var partial$1 = unwrapExports(partial);
var partial_1 = partial.Part;
var partial_2 = partial.Partial;

var dictionary = createCommonjsModule(function(module, exports) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });

    function Dictionary(value, key) {
        if (key === void 0) {
            key = 'string';
        }
        return runtype.create(
            function(x) {
                if (x === null || x === undefined) {
                    var a = runtype.create(x, { tag: 'dictionary', key: key, value: value });
                    return {
                        success: false,
                        message: 'Expected ' + show_1.default(a) + ', but was ' + x,
                    };
                }
                if (typeof x !== 'object') {
                    var a = runtype.create(x, { tag: 'dictionary', key: key, value: value });
                    return {
                        success: false,
                        message: 'Expected ' + show_1.default(a.reflect) + ', but was ' + typeof x,
                    };
                }
                if (Object.getPrototypeOf(x) !== Object.prototype) {
                    if (!Array.isArray(x)) {
                        var a = runtype.create(x, { tag: 'dictionary', key: key, value: value });
                        return {
                            success: false,
                            message:
                                'Expected ' +
                                show_1.default(a.reflect) +
                                ', but was ' +
                                Object.getPrototypeOf(x),
                        };
                    } else if (key === 'string')
                        return { success: false, message: 'Expected dictionary, but was array' };
                }
                for (var k in x) {
                    // Object keys are unknown strings
                    if (key === 'number') {
                        if (isNaN(+k))
                            return {
                                success: false,
                                message: 'Expected dictionary key to be a number, but was string',
                            };
                    }
                    var validated = value.validate(x[k]);
                    if (!validated.success) {
                        return {
                            success: false,
                            message: validated.message,
                            key: validated.key ? k + '.' + validated.key : k,
                        };
                    }
                }
                return { success: true, value: x };
            },
            { tag: 'dictionary', key: key, value: value },
        );
    }
    exports.Dictionary = Dictionary;
});

var dictionary$1 = unwrapExports(dictionary);
var dictionary_1 = dictionary.Dictionary;

var union = createCommonjsModule(function(module, exports) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });

    function Union() {
        var alternatives = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            alternatives[_i] = arguments[_i];
        }
        var match = function() {
            var cases = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                cases[_i] = arguments[_i];
            }
            return function(x) {
                for (var i = 0; i < alternatives.length; i++) {
                    if (alternatives[i].guard(x)) {
                        return cases[i](x);
                    }
                }
            };
        };
        return runtype.create(
            function(value) {
                for (var _i = 0, alternatives_1 = alternatives; _i < alternatives_1.length; _i++) {
                    var guard = alternatives_1[_i].guard;
                    if (guard(value)) {
                        return { success: true, value: value };
                    }
                }
                var a = runtype.create(value, { tag: 'union', alternatives: alternatives });
                return {
                    success: false,
                    message:
                        'Expected ' +
                        show_1.default(a) +
                        ', but was ' +
                        (value === null ? value : typeof value),
                };
            },
            { tag: 'union', alternatives: alternatives, match: match },
        );
    }
    exports.Union = Union;
});

var union$1 = unwrapExports(union);
var union_1 = union.Union;

var intersect = createCommonjsModule(function(module, exports) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });

    function Intersect() {
        var intersectees = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            intersectees[_i] = arguments[_i];
        }
        return runtype.create(
            function(value) {
                for (var _i = 0, intersectees_1 = intersectees; _i < intersectees_1.length; _i++) {
                    var validate = intersectees_1[_i].validate;
                    var validated = validate(value);
                    if (!validated.success) {
                        return validated;
                    }
                }
                return { success: true, value: value };
            },
            { tag: 'intersect', intersectees: intersectees },
        );
    }
    exports.Intersect = Intersect;
});

var intersect$1 = unwrapExports(intersect);
var intersect_1 = intersect.Intersect;

var _function = createCommonjsModule(function(module, exports) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });

    /**
     * Construct a runtype for functions.
     */
    exports.Function = runtype.create(
        function(value) {
            return typeof value === 'function'
                ? { success: true, value: value }
                : {
                      success: false,
                      message:
                          'Expected function, but was ' + (value === null ? value : typeof value),
                  };
        },
        { tag: 'function' },
    );
});

var _function$1 = unwrapExports(_function);
var _function_1 = _function.Function;

var _instanceof = createCommonjsModule(function(module, exports) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });

    function InstanceOf(ctor) {
        return runtype.create(
            function(value) {
                return value instanceof ctor
                    ? { success: true, value: value }
                    : {
                          success: false,
                          message:
                              'Expected ' +
                              ctor.name +
                              ', but was ' +
                              (value === null ? value : typeof value),
                      };
            },
            { tag: 'instanceof', ctor: ctor },
        );
    }
    exports.InstanceOf = InstanceOf;
});

var _instanceof$1 = unwrapExports(_instanceof);
var _instanceof_1 = _instanceof.InstanceOf;

var lazy = createCommonjsModule(function(module, exports) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });

    /**
     * Construct a possibly-recursive Runtype.
     */
    function Lazy(delayed) {
        var data = {
            get tag() {
                return getWrapped()['tag'];
            },
        };
        var cached;
        function getWrapped() {
            if (!cached) {
                cached = delayed();
                for (var k in cached) if (k !== 'tag') data[k] = cached[k];
            }
            return cached;
        }
        return runtype.create(function(x) {
            return getWrapped().validate(x);
        }, data);
    }
    exports.Lazy = Lazy;
});

var lazy$1 = unwrapExports(lazy);
var lazy_1 = lazy.Lazy;

var constraint = createCommonjsModule(function(module, exports) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });

    function Constraint(underlying, constraint, options) {
        return runtype.create(
            function(value) {
                var name = options && options.name;
                var validated = underlying.validate(value);
                if (!validated.success) {
                    return validated;
                }
                var result = constraint(validated.value);
                if (string.String.guard(result)) return { success: false, message: result };
                else if (!result)
                    return {
                        success: false,
                        message: 'Failed ' + (name || 'constraint') + ' check',
                    };
                return { success: true, value: validated.value };
            },
            {
                tag: 'constraint',
                underlying: underlying,
                constraint: constraint,
                name: options && options.name,
                args: options && options.args,
            },
        );
    }
    exports.Constraint = Constraint;
    exports.Guard = function(guard, options) {
        return unknown.Unknown.withGuard(guard, options);
    };
});

var constraint$1 = unwrapExports(constraint);
var constraint_1 = constraint.Constraint;
var constraint_2 = constraint.Guard;

var brand = createCommonjsModule(function(module, exports) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });

    exports.RuntypeName = Symbol('RuntypeName');
    function Brand(brand, entity) {
        return runtype.create(
            function(value) {
                var validated = entity.validate(value);
                return validated.success ? { success: true, value: validated.value } : validated;
            },
            {
                tag: 'brand',
                brand: brand,
                entity: entity,
            },
        );
    }
    exports.Brand = Brand;
});

var brand$1 = unwrapExports(brand);
var brand_1 = brand.RuntypeName;
var brand_2 = brand.Brand;

var decorator = createCommonjsModule(function(module, exports) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });

    var prototypes = new WeakMap();
    /**
     * A parameter decorator. Explicitly mark the parameter as checked on every method call in combination with `@checked` method decorator. The number of `@check` params must be the same as the number of provided runtypes into `@checked`.\
     * Usage:
     * ```ts
     * @checked(Runtype1, Runtype3)
     * method(@check p1: Static1, p2: number, @check p3: Static3) { ... }
     * ```
     */
    function check(target, propertyKey, parameterIndex) {
        var prototype = prototypes.get(target) || new Map();
        prototypes.set(target, prototype);
        var validParameterIndices = prototype.get(propertyKey) || [];
        prototype.set(propertyKey, validParameterIndices);
        validParameterIndices.push(parameterIndex);
    }
    exports.check = check;
    function getValidParameterIndices(target, propertyKey, runtypeCount) {
        var prototype = prototypes.get(target);
        var validParameterIndices = prototype && prototype.get(propertyKey);
        if (validParameterIndices) {
            // used with `@check` parameter decorator
            return validParameterIndices;
        }
        var indices = [];
        for (var i = 0; i < runtypeCount; i++) {
            indices.push(i);
        }
        return indices;
    }
    /**
     * A method decorator. Takes runtypes as arguments which correspond to the ones of the actual method.
     *
     * Usually, the number of provided runtypes must be _**the same as**_ or _**less than**_ the actual parameters.
     *
     * If you explicitly mark which parameter shall be checked using `@check` parameter decorator, the number of `@check` parameters must be _**the same as**_ the runtypes provided into `@checked`.
     *
     * Usage:
     * ```ts
     * @checked(Runtype1, Runtype2)
     * method1(param1: Static1, param2: Static2, param3: any) {
     *   ...
     * }
     *
     * @checked(Runtype1, Runtype3)
     * method2(@check param1: Static1, param2: any, @check param3: Static3) {
     *   ...
     * }
     * ```
     */
    function checked() {
        var runtypes = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            runtypes[_i] = arguments[_i];
        }
        if (runtypes.length === 0) {
            throw new Error('No runtype provided to `@checked`. Please remove the decorator.');
        }
        return function(target, propertyKey, descriptor) {
            var method = descriptor.value;
            var methodId =
                (target.name || target.constructor.name + '.prototype') +
                (typeof propertyKey === 'string'
                    ? '["' + propertyKey + '"]'
                    : '[' + String(propertyKey) + ']');
            var validParameterIndices = getValidParameterIndices(
                target,
                propertyKey,
                runtypes.length,
            );
            if (validParameterIndices.length !== runtypes.length) {
                throw new Error('Number of `@checked` runtypes and @check parameters not matched.');
            }
            if (validParameterIndices.length > method.length) {
                throw new Error('Number of `@checked` runtypes exceeds actual parameter length.');
            }
            descriptor.value = function() {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                runtypes.forEach(function(type, typeIndex) {
                    var parameterIndex = validParameterIndices[typeIndex];
                    var validated = type.validate(args[parameterIndex]);
                    if (!validated.success) {
                        throw new errors.ValidationError(
                            methodId + ', argument #' + parameterIndex + ': ' + validated.message,
                        );
                    }
                });
                return method.apply(this, args);
            };
        };
    }
    exports.checked = checked;
});

var decorator$1 = unwrapExports(decorator);
var decorator_1 = decorator.check;
var decorator_2 = decorator.checked;

var lib = createCommonjsModule(function(module, exports) {
    'use strict';
    function __export(m) {
        for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    }
    Object.defineProperty(exports, '__esModule', { value: true });
    __export(contract);
    __export(match_1);
    __export(errors);
    __export(unknown);
    __export(never);
    __export(_void);

    exports.Literal = literal_1.Literal;
    exports.Undefined = literal_1.Undefined;
    exports.Null = literal_1.Null;
    __export(boolean_1);
    __export(number);
    __export(string);
    __export(symbol);
    __export(array);
    __export(tuple);
    __export(record);
    __export(partial);
    __export(dictionary);
    __export(union);
    __export(intersect);
    __export(_function);

    exports.InstanceOf = _instanceof.InstanceOf;
    __export(lazy);
    __export(constraint);

    exports.Brand = brand.Brand;
    __export(decorator);
});

var import_runtypes = unwrapExports(lib);
var lib_1 = lib.Literal;
var lib_2 = lib.Undefined;
var lib_3 = lib.Null;
var lib_4 = lib.InstanceOf;
var lib_5 = lib.Brand;

/**
 *   This file is part of lûd, an opinionated browser based media player.
 *   Copyright (C) 2018  Kuno Woudt <kuno@frob.nl>
 *
 *   This program is free software: you can redistribute it and/or modify
 *   it under the terms of copyleft-next 0.3.1.  See copyleft-next-0.3.1.txt.
 *
 *   SPDX-License-Identifier: copyleft-next-0.3.1
 */

const {
    Boolean,
    Number: Number$1,
    Null,
    String: String$1,
    Lazy,
    Literal,
    Array: Array$1,
    Tuple,
    Record,
    Union,
} = import_runtypes;

const Mbid = {};

['artist', 'release', 'track', 'recording', 'series'].map(t => {
    const createRegex = type =>
        new RegExp(
            'https://musicbrainz.org/' +
                type +
                '/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}#_',
        );

    Mbid[t] = String$1.withConstraint(s => createRegex(t).test(s) || `${s} is not an ${t} MBID`);
});

const NaturalNumber = Number$1.withConstraint(n => n >= 0 || `${n} is not >= 0`);

const Artist = Record({
    name: String$1,
    mbid: Mbid.artist.Or(Null),
});

const PartialTrack = Record({
    pos: NaturalNumber,
    title: String$1,
    artist: String$1,
});

const MinutesSecondsFramesRegex = /^[0-9]*:[0-5][0-9]:(7[0-5]|[0-6][0-9])$/;
const MinutesSecondsFrames = String$1.withConstraint(
    s => MinutesSecondsFramesRegex.test(s) || `${s} is not in Minutes:Seconds:Frames format`,
);

const AudioOffset = Record({
    'minutes-seconds-frames': MinutesSecondsFrames,
    seconds: NaturalNumber,
});

const Track = Record({
    pos: NaturalNumber,
    title: String$1,
    artist: String$1,
    duration: NaturalNumber.Or(Null),
    pregap: AudioOffset.Or(Null),
    start: AudioOffset,

    //    index: NaturalNumber.Or(Null),

    // NOTE: the file key is not currently checked by runtypes, as it cannot handle
    // cyclical data.  https://github.com/pelotom/runtypes/issues/115
    // The key can still be set, runtypes doesn't complain about extra keys.
    //    file: File,
});

// export const Group = Record({
//     title: String.Or(Null),
//     tracks: Array(Track),
// });

const File = Record({
    filename: String$1,
    format: String$1.Or(Null),
    tracks: Array$1(Track),
    //    groups: Array(Group),
});

const Disc = Record({
    artist: String$1.Or(Null),
    title: String$1.Or(Null),
    barcode: String$1.Or(Null),
    comments: Array$1(String$1),
    mbid: Mbid.release.Or(Null),
    duration: NaturalNumber.Or(Null),
    // FIXME: enable pos
    pos: NaturalNumber.Or(Null),
    files: Array$1(File),
});

const Album = Record({
    title: String$1,
    artist: Artist,
    discs: Array$1(Disc.Or(Null)),
    duration: NaturalNumber.Or(Null),
});

var import_types = /*#__PURE__*/ Object.freeze({
    __proto__: null,
    Mbid: Mbid,
    NaturalNumber: NaturalNumber,
    Artist: Artist,
    PartialTrack: PartialTrack,
    MinutesSecondsFrames: MinutesSecondsFrames,
    AudioOffset: AudioOffset,
    Track: Track,
    File: File,
    Disc: Disc,
    Album: Album,
});

/**
 *   This file is part of lûd, an opinionated browser based media player.
 *   Copyright (C) 2020  Kuno Woudt <kuno@frob.nl>
 *
 *   This program is free software: you can redistribute it and/or modify
 *   it under the terms of copyleft-next 0.3.1.  See copyleft-next-0.3.1.txt.
 *
 *   SPDX-License-Identifier: copyleft-next-0.3.1
 */

if (typeof window !== 'undefined') {
    if (!window.lûd) {
        window.lûd = {};
    }

    if (typeof window.lûd.verbose === 'undefined') {
        window.lûd.verbose = true;
    }
} else {
    var __log_global_verbose = true;
}

function setVerbose(val) {
    if (typeof window !== 'undefined') {
        window.lûd.verbose = val;
    }

    __log_global_verbose = val;
}

function verbose() {
    if (typeof window !== 'undefined') {
        return window.lûd && window.lûd.verbose;
    }

    return __log_global_verbose;
}

function info() {
    if (verbose()) {
        console.error.apply(this, ['INFO:', ...arguments]);
    }
}

function warning() {
    if (verbose()) {
        console.error.apply(this, ['WARNING:', ...arguments]);
    }
}

function error() {
    if (verbose()) {
        console.error.apply(this, ['ERROR:', ...arguments]);
    }
}

/**
 *   This file is part of lûd, an opinionated browser based media player.
 *   Copyright (C) 2018  Kuno Woudt <kuno@frob.nl>
 *
 *   This program is free software: you can redistribute it and/or modify
 *   it under the terms of copyleft-next 0.3.1.  See copyleft-next-0.3.1.txt.
 *
 *   SPDX-License-Identifier: copyleft-next-0.3.1
 */

const runtypes = import_runtypes;
const types = import_types;

const t = runtypes;
const { Contract } = runtypes;
const { NaturalNumber: NaturalNumber$1, PartialTrack: PartialTrack$1, Track: Track$1 } = types;

const UUID_PATTERN = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';
const MBID_URL_REGEX = new RegExp('^https?://musicbrainz.org/([a-z-]*)/(' + UUID_PATTERN + ')');
const MBID_PLAIN_REGEX = new RegExp(UUID_PATTERN);

const makeMbid = Contract(t.String, t.String, t.String).enforce((type, id) => {
    return 'https://musicbrainz.org/' + type + '/' + id + '#_';
});

const normalizeMbid = Contract(t.String, t.String, t.String.Or(t.Null)).enforce((type, id) => {
    const matches = MBID_URL_REGEX.exec(id);
    if (matches) {
        return makeMbid(matches[1], matches[2]);
    }

    if (MBID_PLAIN_REGEX.exec(id)) {
        return makeMbid(type, id);
    }

    return null;
});

const framesToSeconds = Contract(t.String, NaturalNumber$1.Or(t.Null)).enforce(str => {
    const parts = str.split(':');
    if (parts.length < 3) {
        return null;
    }

    const minutes = parseInt(parts[0], 10);
    const seconds = parseInt(parts[1], 10);
    const frames = parseInt(parts[2], 10);

    // 75 frames per second.

    return minutes * 60 + seconds + frames / 75;
});

const removeQuotes = Contract(t.String, t.String).enforce(str => {
    if (str[0] != str[str.length - 1]) {
        // start and end quotes don't match
        return str;
    }

    if (str[0] === '"' || str[0] === "'") {
        return str.substr(1, str.length - 2);
    }

    return str;
});

function parseCommand(command, args, track) {
    switch (command) {
        case 'REM':
            if (args[0] == 'MUSICBRAINZ_ALBUM_ID' && args.length > 1) {
                return { mbid: normalizeMbid('release', args[1]) };
            }

            if (args[0] == 'COMMENT' && args.length > 1) {
                args.shift();
                const comments = track.comments ? track.comments : [];
                comments.push(args.join(' '));
                return { comments };
            }

            if (args[0] == 'LUD_DURATION_IN_SECONDS') {
                const duration = parseFloat(args[1]);
                return { duration: Number.isNaN(duration) ? null : duration };
            }

            info('Skipping unrecognized REM line', command, args);
            return {};
        case 'CATALOG':
            return { barcode: args.join(' ') };
        case 'TITLE':
            return { title: removeQuotes(args.join(' ')) };
        case 'PERFORMER':
            return { artist: removeQuotes(args.join(' ')) };
        case 'FILE':
            const format = args.pop();
            return {
                filename: removeQuotes(args.join(' ')),
                format: format,
            };
        case 'TRACK':
            if (args.pop() != 'AUDIO') {
                warning('non-audio tracks are untested');
            }
            return { pos: parseInt(args[0], 10) };
        case 'INDEX':
            const startTime = args.pop();
            const idx = args.pop();

            const indexes = track.indexes ? track.indexes : [];
            const seconds = framesToSeconds(startTime);
            indexes.push({
                index: parseInt(idx, 10),
                'minutes-seconds-frames': startTime,
                seconds,
            });

            return { indexes };
        case 'ISRC':
        case '':
            return {};
        default:
            info('Unrecognized command:', command, args);
            return {};
    }
}

function parseCue(cueStr, filename) {
    const lines = cueStr.split(/[\n|\r|\r\n]/).map(x => x.trim());

    const grouped = [];

    const tracks = lines.reduce(
        (memo, line) => {
            const parts = line.split(/ /);

            const command = parts.shift();
            if (command == 'TRACK') {
                memo.push({});
            }
            if (command == 'FILE') {
                grouped.push(memo);
                memo = [{}];
            }

            Object.assign(
                memo[memo.length - 1],
                parseCommand(command, parts, memo[memo.length - 1]),
            );

            return memo;
        },
        [{}],
    );

    grouped.push(tracks);

    const disc = grouped.shift()[0];
    const groupDuration = grouped.length > 1 ? null : disc.duration;

    if (!disc.duration) {
        error('disc length unknown for [' + (disc.artist || '') + ' - ' + (disc.title || '') + ']');
        disc.duration = null;
    }

    if (!disc.barcode) {
        disc.barcode = null;
    }

    disc.files = grouped.map(tracks => {
        const file = tracks.shift();
        file.tracks = addTrackLengths(processSubTracks(tracks), groupDuration);
        return file;
    });

    const matches = filename.match(/disc([0-9]+).cue$/);
    disc.pos = matches ? parseInt(matches[1], 10) : null;

    return disc;
}

function indexCue(records) {
    let error = false;

    if (records.length < 2) {
        return [];
    }

    const ret = records.slice(1).map((item, pos) => {
        if (item.start) {
            return item.start.seconds;
        } else {
            error = true;
            return 0;
        }
    });

    return error ? [] : ret;
}

function processSubTracks(records) {
    return records.reduce((memo, record) => {
        record.pregap = null;

        if (record.indexes.length === 0) {
            record.start = null;
            delete record.indexes;
            memo.push(record);
            return memo;
        }

        if (record.indexes.length === 1) {
            record.start = record.indexes[0];
            delete record.indexes;
            memo.push(record);
            return memo;
        }

        const pregap = record.indexes.filter(i => i.index === 0);
        if (pregap.length) {
            record.pregap = pregap[0];
            delete record.pregap.index;
        }

        const indexes = record.indexes.filter(i => i.index > 0);

        if (indexes.length === 1) {
            record.start = indexes[0];
            delete record.indexes;
            memo.push(record);
            return memo;
        }

        const matches = /^([^\/]*):(.*)$/.exec(record.title);

        const groupTitle = matches ? matches[1].trim() : null;
        const titles = matches ? matches[2].split('/') : record.title.split('/');
        const artists = record.artist.split('/');
        indexes.map((trackIndex, i) => {
            const subtrack = Object.assign({}, record);
            subtrack.start = trackIndex;
            delete subtrack.indexes;

            if (titles.length === indexes.length) {
                subtrack.title = titles[i].trim();
            }

            if (artists.length === indexes.length) {
                subtrack.artist = artists[i].trim();
            }

            if (groupTitle) {
                subtrack.groupTitle = groupTitle;
            }

            memo.push(subtrack);
        });

        return memo;
    }, []);
}

const addTrackLengths = Contract(
    t.Array(PartialTrack$1),
    NaturalNumber$1.Or(t.Null),
    t.Array(Track$1),
).enforce((records, duration) => {
    const lastIdx = records.length - 1;

    return records.map((record, idx) => {
        if (!record.start) {
            return record;
        }

        if (idx == lastIdx) {
            record.duration = duration ? (record.duration = duration - record.start.seconds) : null;
        } else {
            const nextRecord = records[idx + 1];
            if (!nextRecord.start) {
                return record;
            }

            record.duration = nextRecord.start.seconds - record.start.seconds;
        }

        return record;
    });
});

export {
    addTrackLengths,
    framesToSeconds,
    indexCue,
    makeMbid,
    normalizeMbid,
    parseCommand,
    parseCue,
    processSubTracks,
    removeQuotes,
    runtypes,
    types,
};
