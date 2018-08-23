import * as _ from 'lodash';

/**
 * string case types
 */
export type Case = 'kebab' | 'snake' | 'camel';

/**
 * normalization options
 */
export interface INormalizerOptions {
    case?: Case;
    deep?: boolean;
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
    normalize<TSource extends object, TResult>(data: TSource): INormalizationResult<TResult | TResult[] | null>;
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
    public normalize<TIn, TOut>(data: TIn): INormalizationResult<TOut | null> {
        const errors: any = {};
        let normalized: INormalizationResult<TOut | null> | null = null;
        let result: TOut | null = null;

        // check if the data is an array
        if (_.isArray(data)) {
            normalized = this.normalizedArray<TIn, TOut>(data);
        }
        // check if the data is an object
        else if (_.isObject(data)) {
            normalized = this.normalizeObject<TIn, TOut>(data);
        }
        // data must be a primitive type
        else {
            normalized = this.normalizePrimitiveType<TIn, TOut>(data);
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
    private normalizedArray<TIn, TOut>(data: TIn): INormalizationResult<TOut | null> {
        const initial: any = [];
        const errors: any = {};

        if (_.isArray(data)) {
            // reduce the data in the array
            const result: TOut = data.reduce((acc: any, value: TIn) => {
                // normalize the current value in the array
                const normalized = this.normalize<typeof value, TOut>(value);

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
    private normalizeObject<TIn, TOut>(data: TIn): INormalizationResult<TOut | null> {
        const result =
            Object
                .keys(data)
                .reduce((acc: any, key) => {
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
    private normalizePrimitiveType<TSource, TResult>(data: TSource): INormalizationResult<TResult> {
        // primitive types can't actually be normalized
        // so we just need to cast it to any and return it
        return { result: data as any};
    }

    /**
     * normalize a property from a source object to a destination object.
     *
     * NOTE: mutates the dest object
     * @param source source object
     * @param key source key
     * @param dest destination object
     */
    private normalizeProperty<T>(source: T, key: string, dest: object) {
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
    private recase(value: string, newCase?: Case): string {
        switch (newCase) {
            case 'kebab': return _.kebabCase(value);
            case 'snake': return _.snakeCase(value);
            case 'camel': return _.camelCase(value);
            default: return value;
        }
    }
}
