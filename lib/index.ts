import * as _ from 'lodash';
import recase from './utils/recase';

/**
 * string case types
 */
export type Case = 'kebab' | 'snake' | 'camel';

/**
 * normalization options
 */
export interface INormalizerOptions {
    /**
     * the case type to use when normalizing object keys
     */
    case?: Case;
    /**
     * if the normalizer should normalize nested objects/arrays
     */
    deep?: boolean;
    /**
     * a namespace key to exclude from case normalization
     */
    namespaceKey?: string;
}

/**
 * the result of a normalization
 */
export interface INormalizationResult<TResult> {
    result: TResult;
    errors?: any;
}

/**
 * an interface for normalizing objects
 */
export interface INormalizer {
    /**
     * normalizes any object to a new object
     *
     * NOTE: does not mutate the original data
     * @param data the data to normalize
     */
    normalize<TIn>(data: TIn): INormalizationResult<any | null>;
}

/**
 * normalizer to convert objects to another object
 */
export class Normalizer implements INormalizer {
    /**
     * creates a new normalizer instance
     * @constructor
     * @param options normalizes options
     */
    constructor(
        public options: INormalizerOptions = {},
    ) { }

    /**
     * normalizes any object to a new object.
     *
     * NOTE: does not mutate the original data
     * @param data the data to normailze
     */
    public normalize<TIn>(data: TIn): INormalizationResult<any> {
        const errors: any = {};
        let normalized: INormalizationResult<any> | null = null;
        let result: any = null;

        // check if the data is an array
        if (_.isArray(data)) {
            normalized = this._normalizedArray<TIn>(data);
        }
        // date is to be considered a primitive type
        else if (_.isDate(data)) {
            normalized = this._normalizePrimitiveType(data);
        }
        // check if the data is an object
        else if (_.isObject(data)) {
            normalized = this._normalizeObject<TIn>(data);
        }
        // data must be a primitive type
        else {
            normalized = this._normalizePrimitiveType<TIn>(data);
        }

        // if there are errors, we assume the normalization failed
        if (normalized && !_.isEmpty(normalized.errors)) {
            _.merge(normalized.errors, errors);
        }
        // other wise we make sure the normalized result exists
        else if (normalized.result !== null || normalized.result !== undefined) {
            result = normalized.result;
        }

        // return the normalized result
        return { result, errors };
    }

    /**
     * normalizes an array of objects to a new array of objects
     * @param data the array to normalize
     */
    private _normalizedArray<TIn>(data: TIn): INormalizationResult<any> {
        const initial: any = [];
        const errors: any = {};

        if (_.isArray(data)) {
            // reduce the data in the array
            const result: any = data.reduce((acc: any, value: TIn) => {
                // normalize the current value in the array
                const normalized = this.normalize<typeof value>(value);

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
    private _normalizeObject<TIn>(data: TIn): INormalizationResult<any> {
        if (_.isObject(data)) {
            const result =
                Object
                    .keys(data)
                    .reduce((acc: any, key) => {
                        // normalize each key of the object to the dest object
                        this._normalizeProperty(data, key, acc);
                        // return the dest object
                        return acc;
                    }, {});
            // return the normalized result
            return { result };
        }

        return {
            errors: {
                data: 'data was not an object but was trying to be normalized as an object',
            },
            result: null,
        };
    }

    /**
     * normalizes non-object data
     * @param data data to normalize
     */
    private _normalizePrimitiveType<TIn>(data: TIn): INormalizationResult<any> {
        // primitive types can't actually be normalized (for now)
        // so we just need to return it
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
    private _normalizeProperty<TIn>(source: TIn, key: string, dest: object) {
        // source value
        const srcValue = _.get(source, key);
        // destination key
        const destKey = this._normalizePropertyKey(key);

        // if options.deep == true the dest property needs to be a normalized
        if (this.options.deep) {
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
    private _normalizePropertyKey(key: string): string {
        const newCase = this.options.case;

        // if there is no case option set, we do not have to continue the normalization
        if (newCase === undefined) {
            return key;
        }

        // this means we don't need to worry about namespaced keys. just simply recase the value and return it
        if (this.options.namespaceKey === undefined) {
            return recase(key, newCase);
        }

        // otherwise we need to worry about a namespace being on the key.
        /*
            to handle this, we need to split the key on the namespace then recase the parts.
            after recaseing the parts, we have to rejoin them with the namespace.
        */
        const keyParts = key.split(this.options.namespaceKey);
        const normalizedKeyParts = keyParts.map((k) => recase(k, newCase));

        return normalizedKeyParts.join(this.options.namespaceKey);
    }
}
