class MyToast {
  deepest() {
    var {
        prop: x,
        prop2: {
          prop2: {
            nested: [ , , b]
          }
        }
      } = { prop: "Hello", prop2: { prop2: { nested: ["a", "b", "c"]}}};
   }
   one_flat_default_val() { 
       const {filesMetadata = []} = this.props;
   }
  
  arrow_func_param() {
    var names = users.map( ({ user }) => 
    { 
       return user;
    });
  }
  not_in_decl() {
    var a1, b1;
    ({ a1, b1 } = {a: 1, b: 2}); //Note: since assignment and not variable decl (var/let/const) --> shouldn't generate a tag
  }
  
  deep_array() {
    var [a, [b, [c, d]]] = [1, [2, [[[3, 4], 5], 6]]];  
  }  

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
  
  params_def_val()
  {
    var ajax = function ({ url: url = "localhost", port: p = 80}, ...data) {
        console.log("Url:", url, "Port:", p, "Rest:", data);
    };
  }
}

function render({param1,param2,param3}) {
    let foo = { bar: 'pony', baz: 3 };
    let {bar: bar_alias, baz: baz_alias} = foo;
}
