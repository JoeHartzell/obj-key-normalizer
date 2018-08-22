import * as _ from 'lodash';

/**
 * string case types
 */
export type Case = 'kebab' | 'snake' | 'camel';

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
export class Serializer implements ISerializer {
    /**
     * creates a new serializer instance
     * @constructor
     * @param options serializers options
     */
    constructor(
        public options: IOptions = {},
    ) { }

    /**
     * serializes any object to a new object.
     *
     * NOTE: does not mutate the original data
     * @param data the data to serialize
     */
    public serialize<TSource extends object, TResult>(data: TSource | TSource[]): ISerializerResult<TResult | TResult[] | null> {
        const errors: any = {};
        let serialized: ISerializerResult<TResult | TResult[] | null> | null = null;
        let result: TResult | TResult[] | null = null;

        // check if the data is an array
        if (_.isArray(data)) {
            serialized = this.serializeArray<TSource, TResult>(data);
        }
        // check if the data is an object
        else if (_.isObject(data)) {
            serialized = this.serializeObject<TSource, TResult>(data);
        }
        // data must be a primitive type
        else {
            serialized = this.serializePrimitiveType<TSource, TResult>(data);
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
    private serializeArray<TSource extends object, TResult>(data: TSource[]): ISerializerResult<TResult[] | null> {
        const initial: any = [];
        const errors: any = {};

        // reduce the data in the array
        const result = data.reduce((acc: any, value: TSource) => {
            // serialize the current value in the array
            const serialized = this.serialize<TSource, TResult>(value);

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
    private serializeObject<TSource extends object, TResult>(data: TSource): ISerializerResult<TResult | null> {
        const result =
            Object
                .keys(data)
                .reduce((acc: any, key) => {
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
    private serializePrimitiveType<TSource, TResult>(data: TSource): ISerializerResult<TResult> {
        // primitive types can't actually be serialized
        // so we just need to cast it to any and return it
        return { result: data as any};
    }

    /**
     * serializes a property from a source object to a destination object.
     *
     * NOTE: mutates the dest object
     * @param source source object
     * @param key source key
     * @param dest destination object
     */
    private serializeProperty<T extends object>(source: T, key: string, dest: object) {
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
    private recase(value: string, newCase?: Case): string {
        switch (newCase) {
            case 'kebab': return _.kebabCase(value);
            case 'snake': return _.snakeCase(value);
            case 'camel': return _.camelCase(value);
            default: return value;
        }
    }
}
