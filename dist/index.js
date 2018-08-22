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
 * serializer to convert objects to another object
 */
class Serializer {
    /**
     * creates a new serializer instance
     * @constructor
     * @param options serializers options
     */
    constructor(options = {}) {
        this.options = options;
    }
    /**
     * serializes any object to a new object.
     *
     * NOTE: does not mutate the original data
     * @param data the data to serialize
     */
    serialize(data) {
        const errors = {};
        let serialized = null;
        let result = null;
        // check if the data is an array
        if (_.isArray(data)) {
            serialized = this.serializeArray(data);
        }
        // check if the data is an object
        else if (_.isObject(data)) {
            serialized = this.serializeObject(data);
        }
        // data must be a primitive type
        else {
            serialized = this.serializePrimitiveType(data);
        }
        // if there are errors, we assume the serialization failed
        if (serialized && !_.isEmpty(serialized.errors)) {
            _.merge(serialized.errors, errors);
        }
        // other wise we make sure the serialized result exists
        else if (serialized.result) {
            result = serialized.result;
        }
        // return the serialization result
        return { result, errors };
    }
    /**
     * serializes an array of objects to a new array of objects
     * @param data the array to serialize
     */
    serializeArray(data) {
        const initial = [];
        const errors = {};
        // reduce the data in the array
        const result = data.reduce((acc, value) => {
            // serialize the current value in the array
            const serialized = this.serialize(value);
            // if there are errors we assume the serialization failed
            if (serialized.errors && serialized.result === null) {
                _.merge(errors, serialized.errors);
            }
            // if there is a result, we need to push it to the accumulator
            else if (serialized.result != null) {
                acc.push(serialized.result);
            }
            // return the accumulator
            return acc;
        }, initial);
        // return the serialized result
        return { result, errors };
    }
    /**
     * serializes an object to a new object
     * @param data the object to serialize
     */
    serializeObject(data) {
        const result = Object
            .keys(data)
            .reduce((acc, key) => {
            // serialize each key of the object to the dest object
            this.serializeProperty(data, key, acc);
            // return the dest object
            return acc;
        }, {});
        // return the serialized result
        return { result };
    }
    /**
     * serializes non-object data
     * @param data data to serialize
     */
    serializePrimitiveType(data) {
        // primitive types can't actually be serialized
        // so we just need to cast it to any and return it
        return { result: data };
    }
    /**
     * serializes a property from a source object to a destination object.
     *
     * NOTE: mutates the dest object
     * @param source source object
     * @param key source key
     * @param dest destination object
     */
    serializeProperty(source, key, dest) {
        // source value
        const srcValue = _.get(source, key);
        // destination key
        const destKey = this.recase(key, this.options.case);
        // if options.deep == true and the source value is an object
        // the dest property needs to be a serialized array
        if (_.isObject(srcValue) && this.options.deep) {
            _.set(dest, destKey, this.serialize(srcValue).result);
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
exports.Serializer = Serializer;
//# sourceMappingURL=index.js.map