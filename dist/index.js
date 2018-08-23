"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const _ = __importStar(require("lodash"));
/**
 * normalizer to convert objects to another object
 */
class Normalizer {
    /**
     * creates a new normalizer instance
     * @constructor
     * @param options normalizes options
     */
    constructor(options = {}) {
        this.options = options;
    }
    /**
     * normalizes any object to a new object.
     *
     * NOTE: does not mutate the original data
     * @param data the data to normailze
     */
    normalize(data) {
        const errors = {};
        let normalized = null;
        let result = null;
        // check if the data is an array
        if (_.isArray(data)) {
            normalized = this.normalizedArray(data);
        }
        // check if the data is an object
        else if (_.isObject(data)) {
            normalized = this.normalizeObject(data);
        }
        // data must be a primitive type
        else {
            normalized = this.normalizePrimitiveType(data);
        }
        // if there are errors, we assume the normalization failed
        if (normalized && !_.isEmpty(normalized.errors)) {
            _.merge(normalized.errors, errors);
        }
        // other wise we make sure the normalized result exists
        else if (normalized.result) {
            result = normalized.result;
        }
        // return the normalized result
        return { result, errors };
    }
    /**
     * normalizes an array of objects to a new array of objects
     * @param data the array to normalize
     */
    normalizedArray(data) {
        const initial = [];
        const errors = {};
        if (_.isArray(data)) {
            // reduce the data in the array
            const result = data.reduce((acc, value) => {
                // normalize the current value in the array
                const normalized = this.normalize(value);
                // if there are errors we assume the normalization failed
                if (normalized.errors && normalized.result === null) {
                    _.merge(errors, normalized.errors);
                }
                // if there is a result, we need to push it to the accumulator
                else if (normalized.result != null) {
                    acc.push(normalized.result);
                }
                // return the accumulator
                return acc;
            }, initial);
            // return the normalized result
            return { result, errors };
        }
        return {
            errors: {
                data: 'data was not an instance of an array',
            },
            result: null,
        };
    }
    /**
     * normalizes an object to a new object
     * @param data the object to normalize
     */
    normalizeObject(data) {
        const result = Object
            .keys(data)
            .reduce((acc, key) => {
            // normalize each key of the object to the dest object
            this.normalizeProperty(data, key, acc);
            // return the dest object
            return acc;
        }, {});
        // return the normalized result
        return { result };
    }
    /**
     * normalizes non-object data
     * @param data data to normalize
     */
    normalizePrimitiveType(data) {
        // primitive types can't actually be normalized
        // so we just need to cast it to any and return it
        return { result: data };
    }
    /**
     * normalize a property from a source object to a destination object.
     *
     * NOTE: mutates the dest object
     * @param source source object
     * @param key source key
     * @param dest destination object
     */
    normalizeProperty(source, key, dest) {
        // source value
        const srcValue = _.get(source, key);
        // destination key
        const destKey = this.recase(key, this.options.case);
        // if options.deep == true and the source value is an object
        // the dest property needs to be a normalized
        if (_.isObject(srcValue) && this.options.deep) {
            _.set(dest, destKey, this.normalize(srcValue).result);
        }
        // just set the dest property to source value
        else {
            _.set(dest, destKey, srcValue);
        }
    }
    /**
     * re-cases a string to a new case
     * @param value value to re-case
     * @param newCase the case to change the value to
     */
    recase(value, newCase) {
        switch (newCase) {
            case 'kebab': return _.kebabCase(value);
            case 'snake': return _.snakeCase(value);
            case 'camel': return _.camelCase(value);
            default: return value;
        }
    }
}
exports.Normalizer = Normalizer;
//# sourceMappingURL=index.js.map