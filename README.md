The code for the issue in question is in `/src/tests/DynamoRepository.spec.ts`
- See comments for further info. Different implementations of jest.mock also do not work.

#### How to run

- Clone this repo, then
- `$ npm i` and `$ npm test`

Then, the test should fail with the following error on `src/tests/DynamoRepository.spec.ts:19:48`:
`ReferenceError: Cannot access 'mockDynamoRepository_1' before initialization`

`$ npx jest --clearCache` did not solve the problem.