class MyToast {
  two_deep_alias() { 
    var foo = { bar: { deep: 'pony', dangerouslySetInnerHTML: 'lol' } }
    var {bar: { deep : alias_deep, dangerouslySetInnerHTML: sure }} = foo
  }
  two_flat_alias() {
    let foo = { bar: 'pony', baz: 3 };
    let {bar: a, baz: b} = foo;
  }
  two_flat() {
    let foo = { bar: 'pony', baz: 3 }
    let {bar, baz} = foo
  }
  
  one_flat() { 
      const {onClose} = this.props;
  }
  
  params_flat({param1,param2,param3}) { 
  
  }
}

function render({param1,param2,param3}) {
    let foo = { bar: 'pony', baz: 3 };
    let {bar: a, baz: b} = foo;
}
