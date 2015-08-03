
(function(require,exports){

var parse    = require("./esprima.js").parse; // TODO: use node_modules/ ?

var traverse = require("./ast_utils.js").traverse;

var tags = [];

var plugins = [];


// parse JS file, extract tags by traversing AST while tracking scopes
function generateTags(sourcefile,source) {

    try {
      var result = parse(source,{loc:true});
    } catch (e) {
      console.error("parse error in "+sourcefile,e);
      return;
    }

    var scopes = [];  // stack of function body scopes

    plugins.forEach(function(plugin) { 
        plugin.init(tags);
    });

    function extractTags(node,children){
        var scope;

        // TODO: various module systems
        //        (for the moment, we fake it by tracking 'exports')
        //       not to mention various class/mixin systems or ember's 
        //         lifted object system..
        //       var f = function(){}
        //       { f : function(){} }

        // NOTE: location info is start of parsed text to start of unparsed text;
        //          also, lines are 1-based, columns are 0-based;
        //          for 1-based line/colums, we need to adjust start columns

        if ((node.type==='FunctionDeclaration')
          ||(node.type==='FunctionExpression')) {

          scopes.push(node.loc.start.line+":"+(node.loc.start.column+1)+"-"
                     +node.loc.end.line+":"+node.loc.end.column);

          scope = scopes.length>1 ? scopes[scopes.length-2] : "global";

          if (node.type==='FunctionDeclaration')

            tags.push({name: node.id.name
                      ,file: sourcefile
                      ,addr: node.id.loc.start.line
                      ,kind: "f"
                      ,lineno: node.id.loc.start.line
                      ,scope: scope
                      });

          else if (node.id)

            tags.push({name: node.id.name
                      ,file: sourcefile
                      ,addr: node.id.loc.start.line
                      ,kind: "fe"
                      ,lineno: node.id.loc.start.line
                      ,scope: node.loc.start.line+":"+(node.loc.start.column+1)+"-"
                             +node.loc.end.line+":"+node.loc.end.column
                      });

          var paramScope = node.loc.start.line+":"+(node.loc.start.column+1)+"-"
                          +node.loc.end.line+":"+node.loc.end.column;

          node.params.forEach(function(param){
            tags.push({name: param.name
                      ,file: sourcefile
                      ,addr: param.loc.start.line
                      ,kind: "vp"
                      ,lineno: param.loc.start.line
                      ,scope: paramScope
                      });
          });

        } else if (node.type==='VariableDeclarator') {

          scope = scopes.length>0 ? scopes[scopes.length-1] : "global";

          tags.push({name: node.id.name
                    ,file: sourcefile
                    ,addr: node.id.loc.start.line
                    ,kind: "v"
                    ,lineno: node.id.loc.start.line
                    ,scope: scope
                    });

        } else if (node.type==='CatchClause') {

          tags.push({name: node.param.name
                    ,file: sourcefile
                    ,addr: node.param.loc.start.line
                    ,kind: "ve"
                    ,lineno: node.param.loc.start.line
                    ,scope: node.loc.start.line+":"+(node.loc.start.column+1)+"-"
                           +node.loc.end.line+":"+node.loc.end.column
                    });

        } else if (node.type==='AssignmentExpression') {

          if (node.operator==='='
           && node.left.type==='MemberExpression'
           && !node.left.computed) {

            if (node.left.object.type==='Identifier'
             && node.left.object.name==='exports') {

              // approximation: we don't handle module systems properly,
              // so record tags for 'exports' properties, at least
              tags.push({name: node.left.property.name
                        ,file: sourcefile
                        ,addr: node.left.property.loc.start.line
                        ,kind: "export"
                        ,lineno: node.left.property.loc.start.line
                        ,scope: "global"
                        });

            } else if (node.left.object.type==='MemberExpression'
                    && !node.left.object.computed
                    && node.left.object.property.type==='Identifier'
                    && node.left.object.property.name==='prototype'
                    && node.left.property.type==='Identifier') {

              // approximation: we don't handle object properties properly,
              // so record tags for 'prototype' properties as globals
              tags.push({name: node.left.property.name
                        ,file: sourcefile
                        ,addr: node.left.property.loc.start.line
                        ,kind: "prototype"
                        ,lineno: node.left.property.loc.start.line
                        ,scope: "global"
                        });

            } else if (classic && node.right.type==='FunctionExpression') {

              // approximation: record tags for function assignments as globals
              tags.push({name: node.left.property.name
                        ,file: sourcefile
                        ,addr: node.left.property.loc.start.line
                        ,kind: "fa"
                        ,lineno: node.left.property.loc.start.line
                        ,scope: "global"
                        });

            }
          }
        } else if (classic && node.type==='ObjectExpression') {

          node.properties.forEach(function(property){

            if (property.value.type==='FunctionExpression') {
              if (property.key.value) {

                // approximation: we don't handle object properties properly,
                // so record tags for function properties as globals
                tags.push({name: property.key.value
                          ,file: sourcefile
                          ,addr: property.loc.start.line
                          ,kind: "property"
                          ,lineno: property.loc.start.line
                          ,scope: "global"
                          });

              } else if (property.key.name) {

                // approximation: we don't handle object properties properly,
                // so record tags for function properties as globals
                tags.push({name: property.key.name
                          ,file: sourcefile
                          ,addr: property.loc.start.line
                          ,kind: "property"
                          ,lineno: property.loc.start.line
                          ,scope: "global"
                          });

              }
            }

          });

        } else if (node.type==='CallExpression') {            
            plugins.forEach(function(plugin) { 
              plugin.visitCallExpression(node, sourcefile);
            });
        }

        children.forEach(traverse(extractTags));

        if ((node.type==='FunctionDeclaration')
          ||(node.type==='FunctionExpression')) {

          scopes.pop();

        }
      }

    traverse(extractTags)(result);
}

// create tag file, as array of lines, in (sorted) tag-file format
function tagFile() {

  // TODO: sort by further fields, too
  tags.sort(function(x,y){ return x.name > y.name ? 1 : x.name == y.name ? 0 : -1 });

  var tagFile = [];

  tagFile.push('!_TAG_FILE_SORTED\t1\t');
  tagFile.push('!_TAG_PROGRAM_AUTHOR\tClaus Reinke\t');
  tagFile.push('!_TAG_PROGRAM_NAME\testr\t');
  tagFile.push('!_TAG_PROGRAM_URL\thttps://github.com/clausreinke/estr\t');
  tagFile.push('!_TAG_PROGRAM_VERSION\t0.0\t');

  tags.forEach(function(tag){
    tagFile.push(tag.name+"\t"+tag.file+"\t"+tag.addr+";\"\t"+tag.kind
               +"\tlineno:"+tag.lineno+"\tscope:"+tag.scope);
  });

  return tagFile;
}

var classic = false;
function flags() {
  var tagFile = "tags",
      exclude = [];
  while (process.argv.length > 1)
  {
      var option = process.argv.shift(),
          remain = process.argv.length > 0;
        
      if (option === '--classic')
      {
         classic = true;     
      } else if (option === '-o' && remain)
      {
         tagFile = process.argv.shift();
      } else if ((option === '-exclude' || option === '--exclude') && remain)
      {         
        var ex = process.argv.shift();
        exclude.push( ex );
      }
  }
  // if (classic = process.argv[0]==="--classic")
  //   process.argv.shift();
  // if (process.argv[0]==="-o") {
  //   process.argv.shift();
  //   tagFile = process.argv.shift();
  // }
  return {
      tagFile: tagFile,
      exclude: exclude
   };
}

//TODO:SenchaTouchPlugin - Move it to its own file Begin Plugin
function SenchaTouchPlugin () {  
  this.tags = undefined;
}

SenchaTouchPlugin.prototype.init = function(tags) {
  this.tags = tags;
}

SenchaTouchPlugin.prototype.visitCallExpression = function(ndCall,sourcefile) {
  //* Class: Ext.define('Company.Project.Module.ClassName', { ... });
  if (ndCall.callee && ndCall.callee.object && ndCall.callee.object.name === 'Ext')
  {
    if (ndCall.callee && ndCall.callee.property && ndCall.callee.property.name === 'define')
    {
        var argName = ndCall.arguments && ndCall.arguments.length > 0 && ndCall.arguments[0];
        if (argName && argName.type === 'Literal' && argName.value)
        {
          var arr = argName.value.split('.');
          this.tags.push({name: arr[arr.length - 1] 
                          ,file: sourcefile
                          ,addr: argName.loc.start.line
                          ,kind: "class"
                          ,lineno: argName.loc.start.line
                          ,scope: "global"
                          });
          
        }   

    } 
  } //* Event handlers: objThatFiresTheEvent.on('eventName',...). 
  else if (ndCall.callee && ndCall.callee.property && ndCall.callee.property.name === 'on')
  {
      var argName = ndCall.arguments && ndCall.arguments.length > 0 && ndCall.arguments[0];
        if (argName && argName.type === 'Literal' && argName.value)
        { 
          this.tags.push({name: argName.value 
                          ,file: sourcefile
                          ,addr: argName.loc.start.line
                          ,kind: "eventHandler"
                          ,lineno: argName.loc.start.line
                          ,scope: "global"
                          });
          
        }   
      //* Note: Currently, other forms of eventHandlers are tagged as properties:
      //* <something>.on{eventName: ...} and listeners: { eventName: .... }
  } 
}

plugins.push(new SenchaTouchPlugin());

//End Plugin
exports.tags = tags;

exports.generateTags = generateTags;

exports.tagFile = tagFile;

exports.flags = flags;

}(typeof require==='function'
   ? require
   : function(dependency) { return require.cache[dependency] }
 ,typeof exports==='object'
   ? exports
   : (require.cache?require.cache:require.cache={})['./tags.js'] = {}
 ));

