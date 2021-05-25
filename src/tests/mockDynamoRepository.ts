import { AWSError } from 'aws-sdk';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';

// const DynamoRepositoryMock = <T> (list: Array<T>) => {
export default function DynamoRepositoryMock<T>(list: Array<T>) {
// const DynamoRepositoryMock = <T> (list: Array<T>) => {
  const config = {
    update: jest.fn(() => ({
      region: 'region-mock',
      dynamodb: {
        endpoint: 'dynamodb-mock',
      },
    })),
  };

  const listCache = list;

  return {
    config,
    DynamoDB: {
      DocumentClient: jest.fn(() => ({
        put: jest.fn((
          params: DocumentClient.PutItemInput,
          callback?: (err: AWSError, data: DocumentClient.PutItemOutput) => void,
        ) => {
          listCache.push(
            params.Item as T,
          );

          callback(null, null);
        }),
        update: jest.fn((
          params: DocumentClient.UpdateItemInput,
          callback?: (err: AWSError, data: DocumentClient.UpdateItemOutput) => void,
        ) => {
          const keys = Object.entries(params.Key);
          const index = listCache.findIndex((t) => {
            let result = false;

            // eslint-disable-next-line no-restricted-syntax
            for (const key of keys) {
              result = t[key[0]] === key[1];
              if (!result) break;
            }
            return result;
          });

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
          const keys = Object.entries(params.Key);
          const index = listCache.findIndex((t) => {
            let result = false;

            // eslint-disable-next-line no-restricted-syntax
            for (const key of keys) {
              result = t[key[0]] === key[1];
              if (!result) break;
            }
            return result;
          });

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
          const keys = Object.entries(params.Key);
          const item = listCache.find((t) => {
            let result = false;

            // eslint-disable-next-line no-restricted-syntax
            for (const key of keys) {
              result = t[key[0]] === key[1];
              if (!result) break;
            }
            return result;
          });

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
          const keys = Object.entries(params.ExpressionAttributeValues);

          const result = params.ExpressionAttributeValues
            ? listCache.filter((t) => {
              // Mudar o nome dessa variável horrível
              let anotherResult = false;
              // eslint-disable-next-line no-restricted-syntax
              for (const key of keys) {
                anotherResult = t[key[0].substr(1)] === key[1];
                if (!anotherResult) break;
              }
              return anotherResult;
            }) : listCache;

          callback(null, {
            Items: result,
            Count: result.length,
          });
        }),
      })),
    },
  };
}
