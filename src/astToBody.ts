export default function astToBody(ast) {
  const fieldNodes = ast.fieldNodes;

  const body = extractSelectionSet(ast.fieldNodes[0].selectionSet);

  return body;
}

export function astToFields(ast) {
  return astToBody(ast).doc;
}

/**
 * @param set
 */
function extractSelectionSet(set): any {
  let body = {};
  set.selections.forEach(el => {
    if (!el.selectionSet) {
      body[el.name.value] = 1;
    } else {
      body[el.name.value] = extractSelectionSet(el.selectionSet);
      if (el.arguments.length) {
        let argumentMap = {};
        el.arguments.forEach(arg => {
          argumentMap[arg.name.value] = arg.value.value;
        });
      }
    }
  });

  return body;
}
