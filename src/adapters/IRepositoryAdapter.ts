export enum ECondition {
  equal = '=',
  lessThan = '<',
  lessThanOrEqual = '<=',
  greaterThan = '>',
  greaterThanOrEqual = '>=',
  between = 'BETWEEN',
}
export type ExpressionType = {
  conditions: Array<{
    aliasProp: string,
    prop: string,
    condition: ECondition,
    values: Array<{
      aliasVal: string,
      val: any
    }>
  }>,
  concat: Array<string>
};

export class Where<T> {
  #expression: ExpressionType;
  public constructor() {
    this.#expression = {
      concat: [],
      conditions: [],
    };
  }

  public get expression() : ExpressionType {
    return this.#expression;
  }

  public condition(property: keyof T): Where<T> {
    this.#expression.conditions.push({
      aliasProp: `#${property}`,
      prop: String(property),
      condition: null,
      values: [],
    });
    return this;
  }

  public equal<TValue>(val: TValue) : Where<T> {
    this.#expression.conditions[this.#expression.conditions.length - 1]
      .condition = ECondition.equal;
    this.#expression.conditions[this.#expression.conditions.length - 1]
      .values.push({
        aliasVal: `:${this.#expression.conditions[this.#expression.conditions.length - 1].prop}`,
        val,
      });
    return this;
  }

  public lessThan<TValue>(val: TValue) : Where<T> {
    this.#expression.conditions[this.#expression.conditions.length - 1]
      .condition = ECondition.lessThan;
    this.#expression.conditions[this.#expression.conditions.length - 1]
      .values.push({
        aliasVal: `:${this.#expression.conditions[this.#expression.conditions.length - 1].prop}`,
        val,
      });
    return this;
  }

  public lessThanOrEqual<TValue>(val: TValue) : Where<T> {
    this.#expression.conditions[this.#expression.conditions.length - 1]
      .condition = ECondition.lessThanOrEqual;
    this.#expression.conditions[this.#expression.conditions.length - 1]
      .values.push({
        aliasVal: `:${this.#expression.conditions[this.#expression.conditions.length - 1].prop}`,
        val,
      });
    return this;
  }

  public greaterThan<TValue>(val: TValue) : Where<T> {
    this.#expression.conditions[this.#expression.conditions.length - 1]
      .condition = ECondition.greaterThan;
    this.#expression.conditions[this.#expression.conditions.length - 1]
      .values.push({
        aliasVal: `:${this.#expression.conditions[this.#expression.conditions.length - 1].prop}`,
        val,
      });
    return this;
  }

  public greaterThanOrEqual<TValue>(val: TValue) : Where<T> {
    this.#expression.conditions[this.#expression.conditions.length - 1]
      .condition = ECondition.greaterThanOrEqual;
    this.#expression.conditions[this.#expression.conditions.length - 1]
      .values.push({
        aliasVal: `:${this.#expression.conditions[this.#expression.conditions.length - 1].prop}`,
        val,
      });
    return this;
  }

  public between<TValue>(firstVal: TValue, secondVal: TValue) : Where<T> {
    this.#expression.conditions[this.#expression.conditions.length - 1]
      .condition = ECondition.between;
    this.#expression.conditions[this.#expression.conditions.length - 1]
      .values.push({
        aliasVal: `:${this.#expression.conditions[this.#expression.conditions.length - 1].prop}1`,
        val: firstVal,
      }, {
        aliasVal: `:${this.#expression.conditions[this.#expression.conditions.length - 1].prop}2`,
        val: secondVal,
      });
    return this;
  }

  public and(): Where<T> {
    this.#expression.concat.push('and');
    return this;
  }

  public or(): Where<T> {
    this.#expression.concat.push('or');
    return this;
  }
}
export type DataCreate<T> = {
  tableName: string,
  item: { [P in keyof T]?: T[P] }
};
export type DataUpdate<T> = {
  tableName: string,
  identity: { [prop: string]: string },
  item: { [P in keyof T]?: T[P] }
};
export type DataDelete = {
  tableName: string,
  identity: { [prop: string]: string },
};
export type DataFindAll = {
  tableName: string,
};
export type DataFindByQuery<T> = {
  tableName: string,
  where: Where<T>,
};
export type DataFindOne = {
  tableName: string,
  identity: { [prop: string]: string },
};
export interface IRepositoryAdapter {
  create<T>(data: DataCreate<T>): Promise<boolean>;
  update<T>(data: DataUpdate<T>): Promise<boolean>;
  delete(data: DataDelete): Promise<boolean>;
  findAll<T>(data: DataFindAll): Promise<T[]>;
  findByQuery<T>(data: DataFindByQuery<T>): Promise<T[]>;
  findOne<T>(data: DataFindOne): Promise<T>;
}
