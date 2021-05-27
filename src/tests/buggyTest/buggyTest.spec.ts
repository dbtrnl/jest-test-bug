import { IRepositoryAdapter } from '../../adapters/IRepositoryAdapter';
import { v4 as uuidv4 } from 'uuid';
import DynamoRepository from '../../integrations/DynamoRepository';

type TestType = {
  id: string;
};


/* 
  Original code, doesn't work because of how hoisting works
  O jest.mock é executado antes mesmo dos imports.
*/
// jest.mock('aws-sdk', () => mockDynamoRepository<TestType>([]));

/* 
  The possible solution is to implement the Mock Function INSIDE the jest.mock call.
*/


// jest.mock('aws-sdk', () => jest.fn(DynamoRepository<TestType>([])))

jest.mock('aws-sdk', async () => {
  // 1 - First attempts (do not work)

    // 1.1 Typescript won't accept import inside a function
    // import { DynamoRepositoryMock } from './DynamoRepositoryMock'
    // import * as DynamoRepositoryMock from './DynamoRepositoryMock';
    // import DynamoRepositoryMock from './DynamoRepositoryMock'

    // 1.2 Error - Cannot find name 'DynamoRepositoryMock'.
    // const DynamoMock = <DynamoRepositoryMock<TestType>> require('./DynamoRepositoryMock');
    // DynamoMock<TestType>([]);

    // 1.3 Error - Untyped function calls may not accept type arguments.
    // const DynamoMock = require('./DynamoRepositoryMock');
    // DynamoMock<TestType>([]);

  /*
   * 2 - TS accepts without any typing, but the mock isn't used by Jest, and gives the following error:
   * UnhandledPromiseRejection:
   *   This error originated either by throwing inside of an async function without a catch block,
   *   or by rejecting a promise which was not handled with .catch().
   *   The promise rejected with the reason "TypeError: DynamoRepositoryMock is not a function".
   */
  // const DynamoRepositoryMock = require('./DynamoRepositoryMock');
  // DynamoRepositoryMock([]);

  // 3 - Doesn't work
  // import('./DynamoRepositoryMock')
  //   .then(t => ( <Function> t<TestType>() )([]))

  // 4 - Mock isn't executed by Jest
  // 'mock' is declared but its value is never read.
  // var mock = import('./DynamoRepositoryMock')
  //   .then(t => function(mock){ console.log(t) })

  // 5 - Mock isn't executed by Jest
  const DynamoMock = await import('./DynamoRepositoryMock');
  // console.warn(DynamoMock.default);
  // return DynamoMock.default<TestType>([])
  return DynamoMock.default<TestType>([])

  // DynamoMock<TestType>([]);
});


describe('Test DynamoRepository (buggy test, SHOULD FAIL)', () => {
  const repo: IRepositoryAdapter = DynamoRepository;
  const tableName = 'test_table';
  const id = uuidv4();

  it('should fail', async () => {
    const data: TestType = {
      id,
    };
    const result = await repo.create<TestType>({
      item: data,
      tableName,
    });

    expect(result).toEqual(true);
  });
});