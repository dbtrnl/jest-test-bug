import {
  DataCreate, DataDelete, DataFindAll, DataFindByQuery, DataFindOne, DataUpdate,
  ECondition, IRepositoryAdapter,
} from '../adapters/IRepositoryAdapter';
import AWS from 'aws-sdk';

AWS.config.update({
  region: "eu-west-1",
  dynamodb: {
    endpoint: "http://localhost:8000",
  },
});

const client = new AWS.DynamoDB.DocumentClient();

const findOne = async <T>(data: DataFindOne): Promise<T> => {
  try {
    const result = await new Promise<AWS.DynamoDB.GetItemOutput>((resolve, reject) => {
      client.get({
        TableName: data.tableName,
        Key: {
          ...data.identity,
        },
      }, (error, getData) => {
        if (error) {
          reject(error);
        } else {
          resolve(getData);
        }
      });
    });

    if (result.Item) {
      const value = {};

      Object.entries(result.Item)
        .forEach((t) => {
          // eslint-disable-next-line prefer-destructuring
          value[t[0]] = t[1];
        });

      return value as T;
    }

    return null;
  } catch (ex) {
    return null;
  }
};

const DynamoRepository: IRepositoryAdapter = {
  create: async <T>(data: DataCreate<T>): Promise<boolean> => {
    try {
      await new Promise<AWS.DynamoDB.PutItemOutput>((resolve, reject) => {
        client.put({
          TableName: data.tableName,
          Item: {
            ...data.item,
          },
        }, (err, dynData) => {
          if (err) {
            reject(err);
          } else {
            resolve(dynData);
          }
        });
      });

      return true;
    } catch (ex) {
      return false;
    }
  },
  update: async <T>(data: DataUpdate<T>): Promise<boolean> => {
    try {
      let upExpre = '';
      const attExpre = {};

      Object.entries(data.item)
        .forEach((t) => {
          upExpre = upExpre.concat(` ${t[0]} = :${t[0]}`);

          // eslint-disable-next-line prefer-destructuring
          attExpre[`:${t[0]}`] = t[1];
        });

      upExpre = `Set ${upExpre}`;

      await new Promise<AWS.DynamoDB.UpdateItemOutput>((resolve, reject) => {
        client.update({
          TableName: data.tableName,
          Key: {
            ...data.identity,
          },
          UpdateExpression: upExpre,
          ExpressionAttributeValues: {
            ...attExpre,
          },
        }, (err, dynData) => {
          if (err) {
            reject(err);
          } else {
            resolve(dynData);
          }
        });
      });

      return true;
    } catch (ex) {
      return false;
    }
  },
  delete: async (data: DataDelete): Promise<boolean> => {
    try {
      await new Promise<AWS.DynamoDB.DeleteItemOutput>((resolve, reject) => {
        client.delete({
          TableName: data.tableName,
          Key: {
            ...data.identity,
          },
        }, (error, dataDelete) => {
          if (error) {
            reject(error);
          } else {
            resolve(dataDelete);
          }
        });
      });

      return true;
    } catch (ex) {
      return false;
    }
  },
  findAll: async <T>(data: DataFindAll): Promise<T[]> => {
    try {
      const resp = await new Promise<AWS.DynamoDB.ScanOutput>((resolve, reject) => {
        client.scan({
          TableName: data.tableName,
        }, (error, dataDelete) => {
          if (error) {
            reject(error);
          } else {
            resolve(dataDelete);
          }
        });
      });

      const result: Array<T> = [];

      resp.Items.forEach((t) => {
        const item = {};

        Object.entries(t)
          .forEach((prop) => {
            // eslint-disable-next-line prefer-destructuring
            item[prop[0]] = prop[1];
          });

        result.push(<T>item);
      });

      return result;
    } catch (ex) {
      return null;
    }
  },
  findByQuery: async <T>(data: DataFindByQuery<T>): Promise<T[]> => {
    try {
      let keyConditionExpression = '';
      const expressionAttributeNames: { [prop: string]: string } = {};
      const expressionAttributeValues: { [prop: string]: string } = {};

      data.where.expression.conditions.forEach((t, i) => {
        expressionAttributeNames[t.aliasProp] = t.prop;

        if (t.condition !== ECondition.between) {
          keyConditionExpression += `${t.aliasProp} ${t.condition} ${t.values[0].aliasVal} ${data.where.expression.concat[i] ?? ''} `;
          expressionAttributeValues[t.values[0].aliasVal] = t.values[0].val;
        } else {
          keyConditionExpression += `${t.aliasProp} ${t.condition} ${t.values[0].aliasVal} and ${t.values[1].aliasVal} ${data.where.expression.concat[i] ?? ''} `;
          expressionAttributeValues[t.values[0].aliasVal] = t.values[0].val;
          expressionAttributeValues[t.values[1].aliasVal] = t.values[1].val;
        }
      });

      const resp = await new Promise<AWS.DynamoDB.ScanOutput>((resolve, reject) => {
        client.scan({
          TableName: data.tableName,
          FilterExpression: keyConditionExpression,
          ExpressionAttributeNames: expressionAttributeNames,
          ExpressionAttributeValues: expressionAttributeValues,
        }, (error, dataDelete) => {
          if (error) {
            reject(error);
          } else {
            resolve(dataDelete);
          }
        });
      });

      const result: Array<T> = [];

      resp.Items
        .forEach((t) => {
          const item = {};

          Object.entries(t)
            .forEach((prop) => {
              // eslint-disable-next-line prefer-destructuring
              item[prop[0]] = prop[1];
            });

          result.push(<T>item);
        });

      return result;
    } catch (ex) {
      return null;
    }
  },
  findOne,
};

export default DynamoRepository;
