The code for the issue in question is in `/src/tests/`
- There are two identical tests, one works and the other doesn't.
  * The difference is that the mock was moved to a different file.
- See comments for further info. Different implementations of jest.mock also do not work.

#### How to run

- Clone this repo, then
- `$ npm i` and `$ npm test`

One test should pass, and the other fail.

- Expected output:
```
 PASS  src/tests/workingTest/workingTest.spec.ts (6.316 s)
 FAIL  src/tests/buggyTest/buggyTest.spec.ts
  ● Test suite failed to run

    ReferenceError: Cannot access 'mockDynamoRepository_1' before initialization

      17 | // jest.mock('aws-sdk', () => { mockDynamoRepository; });
      18 |
    > 19 | jest.mock('aws-sdk', () => mockDynamoRepository<TestType>([]));
         |                                                ^
      20 |
      21 | describe('Test DynamoRepository (buggy test, SHOULD FAIL)', () => {
      22 |   const repo: IRepositoryAdapter = DynamoRepository;

      at src/tests/buggyTest/buggyTest.spec.ts:19:48
      at Object.<anonymous> (src/integrations/DynamoRepository.ts:5:1)
      at Object.<anonymous> (src/tests/buggyTest/buggyTest.spec.ts:3:1)
```

Also, `$ npx jest --clearCache` did not solve the problem.