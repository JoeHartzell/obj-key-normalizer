
/* tslint:disable */
import * as chai from 'chai';
import { describe } from 'mocha';
import { Normalizer } from '../lib';

describe('normalizer', () => {
	describe('normalize function', () => {
		it('should not alter function values', () => {
			const normalizer = new Normalizer({
				case: 'kebab',
				deep: true
			})

			const data = {
				test: () => {},
				testAgain: function() {}
			}

			const { result } = normalizer.normalize(data)

			chai.expect(result).to.deep.eq({
				test: data.test,
				'test-again': data.testAgain
			})
		})
	})

	describe('normalize class', () => {
		it('should not alter class keys', () => {
			class Foo {
				constructor(public firstName: string, public lastName: string) {}
			}

			const normalizer = new Normalizer({
				case: 'kebab',
				deep: true
			})

			const data = { 
				test: new Foo('joe', 'hartzell')
			}

			const { result } = normalizer.normalize(data)

			chai.expect(result).to.deep.eq(data)
		})
	})

    describe('normalize date', () => {
        it('should not alter the date object', () => {
            const data = {
                date: new Date()
            }

            const normalizer = new Normalizer({
                case: 'kebab',
                deep: true,
            });

            const normalized = normalizer.normalize(data);

            chai.expect(normalized.result).to.deep.eq(data);
        })
    })

    describe('normalize plain object', () => {
        const objectData = {
            id: 1, 
            'first-name': 'Joe',
            'last_name': 'Hartzell',
            'middleInitial': 'D',
            address: {
                id: 1, 
                'line-1': '8791 loosely lane',
                'zip_code': 16249,
                'line2': 'P.O. Box 19',
            }
        }

        it('should respect namespaced object keys if configured too', () => {
            const normalizer = new Normalizer({
                case: 'kebab',
                deep: true,
                namespaceKey: '/'
            });

            const data = {
                'namespace/id': 1,
                'namespace/nested/helloWorld': {
                    'namespace/nested/camelCase': 'test',
                },
            }

            const expected = {
                'namespace/id': 1,
                'namespace/nested/hello-world': {
                    'namespace/nested/camel-case': 'test',
                },
            }

            const normalized = normalizer.normalize(data);

            chai.expect(normalized.result).to.deep.eq(expected);
        })

        it('configuring a namespaceKey should not effect non-namespaced keys', () => {
            const normalizer = new Normalizer({
                case: 'kebab',
                deep: true,
                namespaceKey: '/'
            })

            const expected = {
                id: 1, 
                'first-name': 'Joe',
                'last-name': 'Hartzell',
                'middle-initial': 'D',
                address: {
                    id: 1, 
                    'line-1': '8791 loosely lane',
                    'zip-code': 16249,
                    'line-2': 'P.O. Box 19',
                }
            }

            const normalized = normalizer.normalize(objectData);

            chai.expect(normalized.result).to.deep.eq(expected);
        })

        it('should handle both namespaced keys and non-namespaced keys in the same object', () => {
            const data = {
                'person/id': 1,
                'person/lastName': 'Hartzell',
                firstName: 'Joe',
            }

            const expected = {
                'person/id': 1,
                'person/last_name': 'Hartzell',
                first_name: 'Joe',
            }

            const normalizer = new Normalizer({
                case: 'snake',
                deep: true,
                namespaceKey: '/',
            })

            const normalized = normalizer.normalize(data);

            chai.expect(normalized.result).to.deep.eq(expected);
        })

        it('should properly handle 0s in the data', () => {
            const data = {
                id: 0
            }

            const normalizer = new Normalizer({
                case: 'camel',
                deep: true,
            });

            const normalized = normalizer.normalize(data);

            chai.expect(normalized.result).to.deep.eq(data);
        })

        it('should not modify nested objects when deep is set to false', () => {
            const normalizer = new Normalizer({
                case: 'camel',
                deep: false,
            });
            const expectedResult = {
                id: 1, 
                'firstName': 'Joe',
                'lastName': 'Hartzell',
                'middleInitial': 'D',
                address: {
                    id: 1, 
                    'line-1': '8791 loosely lane',
                    'zip_code': 16249,
                    'line2': 'P.O. Box 19',
                }
            }
            const normalized = normalizer.normalize(objectData);

            chai.expect(normalized.result).to.deep.eq(expectedResult);
        })

        it('should return new object with same keys and values, when no options are configured', () => {
            const normalizer = new Normalizer();
            const normalized = normalizer.normalize(objectData);
    
            chai.expect(normalized.result).to.deep.eq(objectData);
        })

        it('should convert all keys to camel case when the camel case option is configured', () => {
            const normalizer = new Normalizer({ 
                case: 'camel',
                deep: true
            });
            const expectedResult = {
                id: 1, 
                firstName: 'Joe',
                lastName: 'Hartzell',
                middleInitial: 'D',
                address: {
                    id: 1, 
                    'line1': '8791 loosely lane',
                    'zipCode': 16249,
                    'line2': 'P.O. Box 19',
                }
            };
            const normalized = normalizer.normalize(objectData);

            chai.expect(normalized.result).to.deep.eq(expectedResult);
        })

        it('should convert all keys to kebab when the kebab case option is configured', () => {
            const normalizer = new Normalizer({
                case: 'kebab', 
                deep: true,
            })
            const expectedResult = {
                id: 1, 
                'first-name': 'Joe',
                'last-name': 'Hartzell',
                'middle-initial': 'D',
                address: {
                    id: 1, 
                    'line-1': '8791 loosely lane',
                    'zip-code': 16249,
                    'line-2': 'P.O. Box 19',
                }
            }
            const result = normalizer.normalize(objectData);

            chai.expect(result.result).to.deep.eq(expectedResult);
        })

        it('should convert all keys to snake case when the snake case option is configured', () => {
            const normalizer = new Normalizer({
                case: 'snake',
                deep: true
            });
            const expectedResult = {
                id: 1, 
                'first_name': 'Joe',
                'last_name': 'Hartzell',
                'middle_initial': 'D',
                address: {
                    id: 1, 
                    'line_1': '8791 loosely lane',
                    'zip_code': 16249,
                    'line_2': 'P.O. Box 19',
                }
            };
            const normalized = normalizer.normalize(objectData);

            chai.expect(normalized.result).to.deep.eq(expectedResult);
        })
    })

    describe('normalize array', () => {
        it('should work with mixed type arrays', () => {
            const data = [
                { first_name: 'Joe' }, 3
            ];
            const expected = [
                { 'first-name': 'Joe' }, 3
            ];
            const normalizer = new Normalizer({
                case: 'kebab',
                deep: true,
            });
            const result = normalizer.normalize(data);

            chai.expect(result.result).to.deep.eq(expected);
        })

        it('should work with a single dimension', () => {
            const data = [
                { first_name: 'Joe' }, { 'first-name': 'Joe' }, { firstName: 'Joe' }
            ];  
            const expected = [
                { 'first-name': 'Joe' }, { 'first-name': 'Joe' }, { 'first-name': 'Joe' }
            ];
            const normalizer = new Normalizer({
                case: 'kebab',
                deep: true,
            });
            const result = normalizer.normalize(data);

            chai.expect(result.result).to.deep.eq(expected);
        })

        it('should work with a multi-dimension array', () => {
            const data3d = [
                [
                    [{ first_name: 'Joe' }, { firstName: 'Joe'}],
                    [{ first_name: 'Joe' }, { firstName: 'Joe'}]
                ],
                [
                    [{ first_name: 'Joe' }, { firstName: 'Joe'}],
                    [{ first_name: 'Joe' }, { firstName: 'Joe'}]
                ]
            ];
            const expected3dResult = [
                [
                    [{ 'first-name': 'Joe' }, { 'first-name': 'Joe' }],
                    [{ 'first-name': 'Joe' }, { 'first-name': 'Joe' }]
                ],
                [
                    [{ 'first-name': 'Joe' }, { 'first-name': 'Joe' }],
                    [{ 'first-name': 'Joe' }, { 'first-name': 'Joe' }]   
                ]
            ];
            const normalizer = new Normalizer({
                case: 'kebab',
                deep: true,
            });
            const result = normalizer.normalize(data3d);

            chai.expect(result.result).to.deep.eq(expected3dResult);
        })

    })
})
