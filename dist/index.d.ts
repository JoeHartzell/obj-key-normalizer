/**
 * string case types
 */
export declare type Case = 'kebab' | 'snake' | 'camel';
/**
 * serialization options
 */
export interface IOptions {
    case?: Case;
    deep?: boolean;
}
/**
 * an interface for serializing objects
 */
export interface ISerializer {
    /**
     * serializes any object to a new object
     *
     * NOTE: does not mutate the original data
     * @param data the data to serialize
     */
    serialize<TSource extends object, TResult>(data: TSource): ISerializerResult<TResult | TResult[] | null>;
}
/**
 * the result of a serialization
 */
export interface ISerializerResult<TResult> {
    result: TResult;
    errors?: any;
}
/**
 * serializer to convert objects to another object
 */
export declare class Serializer implements ISerializer {
    options: IOptions;
    /**
     * creates a new serializer instance
     * @constructor
     * @param options serializers options
     */
    constructor(options?: IOptions);
    /**
     * serializes any object to a new object.
     *
     * NOTE: does not mutate the original data
     * @param data the data to serialize
     */
    serialize<TSource extends object, TResult>(data: TSource | TSource[]): ISerializerResult<TResult | TResult[] | null>;
    /**
     * serializes an array of objects to a new array of objects
     * @param data the array to serialize
     */
    private serializeArray;
    /**
     * serializes an object to a new object
     * @param data the object to serialize
     */
    private serializeObject;
    /**
     * serializes non-object data
     * @param data data to serialize
     */
    private serializePrimitiveType;
    /**
     * serializes a property from a source object to a destination object.
     *
     * NOTE: mutates the dest object
     * @param source source object
     * @param key source key
     * @param dest destination object
     */
    private serializeProperty;
    /**
     * re-cases a string to a new case
     * @param value value to re-case
     * @param newCase the case to change the value to
     */
    private recase;
}
