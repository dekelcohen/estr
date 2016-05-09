
const getInitialState = ()=>({});
//function getInitialState() { }
//const getInitialState = function() { }

function validateValue(newValue, rawField) {
  const FieldClass = fieldTypes[rawField.TypeAsString];
  return !FieldClass || !FieldClass.validate || FieldClass.validate(newValue, rawField)
};

function outerFunc() {

  const innerScopedFunc = function() { }

  innerScopedFunc();
}









getInitialState();

validateValue(1,2);