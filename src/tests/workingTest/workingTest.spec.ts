import { IRepositoryAdapter } from '../../adapters/IRepositoryAdapter';
import DynamoRepository from '../../integrations/DynamoRepository';
import { AWSError } from 'aws-sdk';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { v4 as uuidv4 } from 'uuid';

type TestType = {
  id: string;
};

jest.mock('aws-sdk', () => {
  const config = {
    update: jest.fn(() => ({
      region: 'region-mock',
      dynamodb: {
        endpoint: 'dynamodb-mock',
      },
    })),
  };
  const listCache: Array<TestType> = [];

  return {
    config,
    DynamoDB: {
      DocumentClient: jest.fn(() => ({
        put: jest.fn((
          params: DocumentClient.PutItemInput,
          callback?: (err: AWSError, data: DocumentClient.PutItemOutput) => void,
        ) => {
          listCache.push({
            id: params.Item.id,
          });

          callback(null, null);
        }),
        update: jest.fn((
          params: DocumentClient.UpdateItemInput,
          callback?: (err: AWSError, data: DocumentClient.UpdateItemOutput) => void,
        ) => {
          const { id } = params.Key;
          const index = listCache.findIndex((t) => t.id === id);

          const atts = Object.entries(params.ExpressionAttributeValues);

          atts.forEach((t) => {
            // eslint-disable-next-line prefer-destructuring
            listCache[index][t[0].substr(1)] = t[1];
          });

          callback(null, null);
        }),
        delete: jest.fn((
          params: DocumentClient.DeleteItemInput,
          callback?: (err: AWSError, data: DocumentClient.DeleteItemOutput) => void,
        ) => {
          const { id } = params.Key;
          const index = listCache.findIndex((t) => t.id === id);

          delete listCache[index];

          callback(null, null);
        }),
        get: jest.fn((
          params: DocumentClient.GetItemInput,
          callback?: (
            err: AWSError,
            data: DocumentClient.GetItemOutput
          ) => void,
        ) => {
          const { id } = params.Key;
          const item = listCache.find((t) => t.id === id);

          callback(null, {
            Item: item,
          });
        }),
        scan: jest.fn((
          params: DocumentClient.ScanInput,
          callback?: (
            err: AWSError,
            data: DocumentClient.ScanOutput
          ) => void,
        ) => {
          const result = params.ExpressionAttributeValues
            ? listCache.filter((t) => t.id === params.ExpressionAttributeValues[':id'])
            : listCache;

          callback(null, {
            Items: result,
            Count: result.length,
          });
        }),
      })),
    },
  };
});

describe('Test DynamoRepository (working test, SHOULD PASS)', () => {
  const repo: IRepositoryAdapter = DynamoRepository;
  const tableName = 'tb_teste';
  const id = uuidv4();

  it('should pass', async () => {
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
