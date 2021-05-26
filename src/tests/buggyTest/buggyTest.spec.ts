import { IRepositoryAdapter } from '../../adapters/IRepositoryAdapter';
import { v4 as uuidv4 } from 'uuid';
import DynamoRepository from '../../integrations/DynamoRepository';
import mockDynamoRepository from './mockDynamoRepository';

type TestType = {
  id: string;
};

/* 
  Both commented implementations (lines 14-15 and line 17) also do not work and give the same error
 */

// const aws = mockDynamoRepository<TestType>([]);
// jest.mock('aws-sdk', () => aws);

// jest.mock('aws-sdk', () => { mockDynamoRepository; });

jest.mock('aws-sdk', () => mockDynamoRepository<TestType>([]));

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
