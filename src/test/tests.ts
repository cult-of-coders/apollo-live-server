// chai style expect().to.be.true  violates no-unused-expression
/* tslint:disable:no-unused-expression */
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { spy } from 'sinon';
import * as sinonChai from 'sinon-chai';
import { isAsyncIterable } from 'iterall';
import { ExecutionResult } from 'graphql';

chai.use(chaiAsPromised);
chai.use(sinonChai);
const expect = chai.expect;
