
ESTR - JavaScript Modern CTags 
==============================

ES6/7 Javascript tool for working with Javascript code, using [babylon JavaScript parser](https://github.com/babel/babylon) 
Estr has a commandline interface, using nodejs, but its modules can
also be used from the browser. There is an [in-browser demo](http://clausreinke.github.com/estr) showing scoped
variable highlighting, navigation to variable occurrences, and
variable renaming.

Estr currently supports:

- generating scope-aware tags from [babylon](https://github.com/babel/babylon) ASTs, for use with the [SublimeText Ctags](CTags) and [scoped_tags Vim mode](https://github.com/clausreinke/scoped_tags)


Commandline usage
-----

```
node estr.js tags --classic -exclude **/*sencha-touch*.* -o .tags .
  traverse current working directory (.) and its sub-directories, extract tags from .js-files, excluding *sencha-touch* and write to file ".tags"

node estr.js tags --classic --module  -o .tags .
  ES6 + strict mode: traverse current working directory (.) and its sub-directories, extract tags from .js-files and write to file ".tags"

node estr.js rename file.js oldName <line> <column> newName
  rename oldName (at <line> <column>) to newName

node estr findVar file.js name <line> <column>
  find binding and other occurrences for name
```

Assumptions
-----------

- in rename, <line> <column> point to the beginning of an oldName occurrence;
  all oldName occurrences in the same scope will be renamed, provided that

  - oldName/newName are valid Identifiers
  - a binding for oldName is available
  - no existing binding for newName in the same scope
  - no existing occurrences of newName will be captured by renamed binding
  - no renamed occurrences of oldName will be captured by existing binding
  - renaming is not affected by same-name hoisting over catch (language edge case)

