import * as _ from 'lodash';
/**
 * string case types
 */
export type Case = 'kebab' | 'snake' | 'camel';

export default (src: string, destCase: Case) => {
    switch (destCase) {
        case 'kebab': return _.kebabCase(src);
        case 'snake': return _.snakeCase(src);
        case 'camel': return _.camelCase(src);
        default: return src;
    }
};
