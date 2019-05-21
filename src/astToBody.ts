import graphqlFields from 'graphql-fields';
import isEmpty from 'lodash/isEmpty';
import mapValues from 'lodash/mapValues';

const toMongoFieldSet = (fields = {}) =>
  mapValues(fields, fieldValue =>
    isEmpty(fieldValue) ? 1 : toMongoFieldSet(fieldValue)
  );

export function astToFields(ast) {
  return toMongoFieldSet(graphqlFields(ast).doc);
}
