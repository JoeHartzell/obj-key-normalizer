/**
 * string case types
 */
export declare type Case = 'kebab' | 'snake' | 'camel';
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
export declare class Normalizer implements INormalizer {
    options: INormalizerOptions;
    /**
     * creates a new normalizer instance
     * @constructor
     * @param options normalizes options
     */
    constructor(options?: INormalizerOptions);
    /**
     * normalizes any object to a new object.
     *
     * NOTE: does not mutate the original data
     * @param data the data to normailze
     */
    normalize<TSource extends object, TResult>(data: TSource | TSource[]): INormalizationResult<TResult | TResult[] | null>;
    /**
     * normalizes an array of objects to a new array of objects
     * @param data the array to normalize
     */
    private normalizedArray;
    /**
     * normalizes an object to a new object
     * @param data the object to normalize
     */
    private normalizeObject;
    /**
     * normalizes non-object data
     * @param data data to normalize
     */
    private normalizePrimitiveType;
    /**
     * normalize a property from a source object to a destination object.
     *
     * NOTE: mutates the dest object
     * @param source source object
     * @param key source key
     * @param dest destination object
     */
    private normalizeProperty;
    /**
     * re-cases a string to a new case
     * @param value value to re-case
     * @param newCase the case to change the value to
     */
    private recase;
}
