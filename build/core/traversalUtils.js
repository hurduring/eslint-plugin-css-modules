'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.eliminateGlobals = exports.getParentSelectorClassesMap = exports.getExtendClassesMap = exports.getComposesClassesMap = exports.getRegularClassesMap = undefined;

var _fp = require('lodash/fp');

var _fp2 = _interopRequireDefault(_fp);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var getRegularClassesMap = exports.getRegularClassesMap = function getRegularClassesMap(ast) {
  var ruleSets = [];
  ast.traverseByType('ruleset', function (node) {
    return ruleSets.push(node);
  });

  return _fp2.default.compose(_fp2.default.reduce(function (result, key) {
    result[key] = false; // classes haven't been used
    return result;
  }, {}), _fp2.default.map('content'), _fp2.default.filter({ type: 'ident' }), _fp2.default.flatMap('content'), _fp2.default.filter({ type: 'class' }), _fp2.default.flatMap('content'), _fp2.default.filter({ type: 'selector' }), _fp2.default.flatMap('content'))(ruleSets);
};
/* eslint-disable no-param-reassign */
var getComposesClassesMap = exports.getComposesClassesMap = function getComposesClassesMap(ast) {
  var declarations = [];
  ast.traverseByType('declaration', function (node) {
    return declarations.push(node);
  });

  return _fp2.default.compose(_fp2.default.reduce(function (result, key) {
    result[key] = true; // mark composed classes as true
    return result;
  }, {}), _fp2.default.flatMap(_fp2.default.compose(_fp2.default.map(_fp2.default.get('content')), _fp2.default.filter({ type: 'ident' }), _fp2.default.get('content'), _fp2.default.find({ type: 'value' }), _fp2.default.get('content'))),
  /*
     reject classes composing from other files
     eg.
     .foo {
     composes: .bar from './otherFile';
     }
   */
  _fp2.default.reject(_fp2.default.compose(_fp2.default.find({ type: 'ident', content: 'from' }), _fp2.default.get('content'), _fp2.default.find({ type: 'value' }), _fp2.default.get('content'))), _fp2.default.filter(_fp2.default.compose(_fp2.default.find({ type: 'ident', content: 'composes' }), _fp2.default.get('content'), _fp2.default.find({ type: 'property' }), _fp2.default.get('content'))))(declarations);
};

var getExtendClassesMap = exports.getExtendClassesMap = function getExtendClassesMap(ast) {
  var extendNodes = [];
  ast.traverseByType('extend', function (node) {
    return extendNodes.push(node);
  });

  return _fp2.default.compose(_fp2.default.reduce(function (result, key) {
    result[key] = true; // mark extend classes as true
    return result;
  }, {}), _fp2.default.map(_fp2.default.compose(_fp2.default.get('content'), _fp2.default.find({ type: 'ident' }), _fp2.default.get('content'), _fp2.default.find({ type: 'class' }), _fp2.default.get('content'), _fp2.default.find({ type: 'selector' }), _fp2.default.get('content'))))(extendNodes);
};

/**
 * Resolves parent selectors to their full class names.
 *
 * E.g. `.foo { &_bar {color: blue } }` to `.foo_bar`.
 */
var getParentSelectorClassesMap = exports.getParentSelectorClassesMap = function getParentSelectorClassesMap(ast) {
  var classesMap = {};

  // Recursively traverses down the tree looking for parent selector
  // extensions. Recursion is necessary as these selectors can be nested.
  var getExtensions = function getExtensions(nodeContent) {
    var blockContent = _fp2.default.compose(_fp2.default.flatMap('content'), _fp2.default.filter({ type: 'block' }))(nodeContent);

    var rulesetsContent = _fp2.default.flatMap('content', _fp2.default.concat(
    // `ruleset` children
    _fp2.default.filter({ type: 'ruleset' }, blockContent),

    // `ruleset` descendants nested in `include` nodes
    _fp2.default.compose(_fp2.default.filter({ type: 'ruleset' }), _fp2.default.flatMap('content'), _fp2.default.filter({ type: 'block' }), _fp2.default.flatMap('content'), _fp2.default.filter({ type: 'include' }))(blockContent)));

    var extensions = _fp2.default.compose(_fp2.default.map('content'), _fp2.default.filter({ type: 'ident' }), _fp2.default.flatMap('content'), _fp2.default.filter({ type: 'parentSelectorExtension' }), _fp2.default.flatMap('content'), _fp2.default.filter({ type: 'selector' }))(rulesetsContent);

    if (!extensions.length) return [];

    var nestedExtensions = getExtensions(rulesetsContent);
    var result = extensions;
    if (nestedExtensions.length) {
      nestedExtensions.forEach(function (nestedExt) {
        extensions.forEach(function (ext) {
          result.push(ext + nestedExt);
        });
      });
    }

    return result;
  };

  ast.traverseByType('ruleset', function (node) {
    var classNames = _fp2.default.compose(_fp2.default.map('content'), _fp2.default.filter({ type: 'ident' }), _fp2.default.flatMap('content'), _fp2.default.filter({ type: 'class' }), _fp2.default.flatMap('content'), _fp2.default.filter({ type: 'selector' }))(node.content);

    if (!classNames.length) return;

    var extensions = getExtensions(node.content);
    if (!extensions.length) return;

    classNames.forEach(function (className) {
      extensions.forEach(function (ext) {
        classesMap[className + ext] = false;
      });

      // Ignore the base class if it only exists for nesting parent selectors
      var hasDeclarations = _fp2.default.compose(_fp2.default.filter({ type: 'declaration' }), _fp2.default.flatMap('content'), _fp2.default.filter({ type: 'block' }))(node.content).length > 0;
      if (!hasDeclarations) classesMap[className] = true;
    });
  });

  return classesMap;
};

/*
   mutates ast by removing instances of :global
 */
var eliminateGlobals = exports.eliminateGlobals = function eliminateGlobals(ast) {
  ast.traverse(function (node, index, parent) {
    if (node.type === 'ruleset') {
      if (_fp2.default.compose(_fp2.default.negate(_fp2.default.isEmpty), _fp2.default.find({ type: 'ident', content: 'global' }), _fp2.default.get('content'), _fp2.default.find({ type: 'pseudoClass' }), _fp2.default.get('content'), _fp2.default.find({ type: 'selector' }), _fp2.default.get('content'))(node)) {
        parent.removeChild(index);
      }
    }
  });
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9jb3JlL3RyYXZlcnNhbFV0aWxzLmpzIl0sIm5hbWVzIjpbImdldFJlZ3VsYXJDbGFzc2VzTWFwIiwiYXN0IiwicnVsZVNldHMiLCJ0cmF2ZXJzZUJ5VHlwZSIsInB1c2giLCJub2RlIiwiZnAiLCJjb21wb3NlIiwicmVkdWNlIiwicmVzdWx0Iiwia2V5IiwibWFwIiwiZmlsdGVyIiwidHlwZSIsImZsYXRNYXAiLCJnZXRDb21wb3Nlc0NsYXNzZXNNYXAiLCJkZWNsYXJhdGlvbnMiLCJnZXQiLCJmaW5kIiwicmVqZWN0IiwiY29udGVudCIsImdldEV4dGVuZENsYXNzZXNNYXAiLCJleHRlbmROb2RlcyIsImdldFBhcmVudFNlbGVjdG9yQ2xhc3Nlc01hcCIsImNsYXNzZXNNYXAiLCJnZXRFeHRlbnNpb25zIiwiYmxvY2tDb250ZW50Iiwibm9kZUNvbnRlbnQiLCJydWxlc2V0c0NvbnRlbnQiLCJjb25jYXQiLCJleHRlbnNpb25zIiwibGVuZ3RoIiwibmVzdGVkRXh0ZW5zaW9ucyIsImZvckVhY2giLCJleHQiLCJuZXN0ZWRFeHQiLCJjbGFzc05hbWVzIiwiY2xhc3NOYW1lIiwiaGFzRGVjbGFyYXRpb25zIiwiZWxpbWluYXRlR2xvYmFscyIsInRyYXZlcnNlIiwiaW5kZXgiLCJwYXJlbnQiLCJuZWdhdGUiLCJpc0VtcHR5IiwicmVtb3ZlQ2hpbGQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFFQTs7Ozs7O0FBUU8sSUFBTUEsc0RBQXVCLFNBQXZCQSxvQkFBdUIsQ0FBQ0MsR0FBRCxFQUFpQztBQUNuRSxNQUFNQyxXQUE0QixFQUFsQztBQUNBRCxNQUFJRSxjQUFKLENBQW1CLFNBQW5CLEVBQThCO0FBQUEsV0FBUUQsU0FBU0UsSUFBVCxDQUFjQyxJQUFkLENBQVI7QUFBQSxHQUE5Qjs7QUFFQSxTQUFPQyxhQUFHQyxPQUFILENBQ0xELGFBQUdFLE1BQUgsQ0FBVSxVQUFDQyxNQUFELEVBQVNDLEdBQVQsRUFBaUI7QUFDekJELFdBQU9DLEdB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QVIsRUFBaUJPLFNBQVMsUUFBMUIsRUFBUixDQUZGLEVBR0VkLGFBQUdXLEdBQUgsQ0FBTyxTQUFQLENBSEYsRUFJRVgsYUFBR1ksSUFBSCxDQUFRLEVBQUVMLE1BQU0sYUFBUixFQUFSLENBSkYsRUFLRVAsYUFBR1csR0FBSCxDQUFPLFNBQVAsQ0FMRixFQU1FWCxhQUFHWSxJQUFILENBQVEsRUFBRUwsTUFBTSxVQUFSLEVBQVIsQ0FORixFQU9FUCxhQUFHVyxHQUFILENBQU8sU0FBUCxDQVBGLEVBUUVaLElBUkYsQ0FERixFQVVFO0FBQ0FxQyxlQUFPRyxXQUFQLENBQW1CSixLQUFuQjtBQUNEO0FBQ0Y7QUFDRixHQWhCRDtBQWlCRCxDQWxCTSIsImZpbGUiOiJ0cmF2ZXJzYWxVdGlscy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIEBmbG93XG4vKiBlc2xpbnQtZGlzYWJsZSBuby1wYXJhbS1yZWFzc2lnbiAqL1xuaW1wb3J0IGZwIGZyb20gJ2xvZGFzaC9mcCc7XG5cbmltcG9ydCB0eXBlIHsgZ0FTVE5vZGUgfSBmcm9tICcuLi90eXBlcyc7XG5cbnR5cGUgY2xhc3NNYXBUeXBlID0ge1xuICBba2V5OiBzdHJpbmddOiBib29sZWFuLFxufVxuXG5leHBvcnQgY29uc3QgZ2V0UmVndWxhckNsYXNzZXNNYXAgPSAoYXN0OiBnQVNUTm9kZSk6IGNsYXNzTWFwVHlwZSA9PiB7XG4gIGNvbnN0IHJ1bGVTZXRzOiBBcnJheTxnQVNUTm9kZT4gPSBbXTtcbiAgYXN0LnRyYXZlcnNlQnlUeXBlKCdydWxlc2V0Jywgbm9kZSA9PiBydWxlU2V0cy5wdXNoKG5vZGUpKTtcblxuICByZXR1cm4gZnAuY29tcG9zZShcbiAgICBmcC5yZWR1Y2UoKHJlc3VsdCwga2V5KSA9PiB7XG4gICAgICByZXN1bHRba2V5XSA9IGZhbHNlOyAvLyBjbGFzc2VzIGhhdmVuJ3QgYmVlbiB1c2VkXG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sIHt9KSxcbiAgICBmcC5tYXAoJ2NvbnRlbnQnKSxcbiAgICBmcC5maWx0ZXIoeyB0eXBlOiAnaWRlbnQnIH0pLFxuICAgIGZwLmZsYXRNYXAoJ2NvbnRlbnQnKSxcbiAgICBmcC5maWx0ZXIoeyB0eXBlOiAnY2xhc3MnIH0pLFxuICAgIGZwLmZsYXRNYXAoJ2NvbnRlbnQnKSxcbiAgICBmcC5maWx0ZXIoeyB0eXBlOiAnc2VsZWN0b3InIH0pLFxuICAgIGZwLmZsYXRNYXAoJ2NvbnRlbnQnKSxcbiAgKShydWxlU2V0cyk7XG59O1xuXG5leHBvcnQgY29uc3QgZ2V0Q29tcG9zZXNDbGFzc2VzTWFwID0gKGFzdDogZ0FTVE5vZGUpOiBjbGFzc01hcFR5cGUgPT4ge1xuICBjb25zdCBkZWNsYXJhdGlvbnMgPSBbXTtcbiAgYXN0LnRyYXZlcnNlQnlUeXBlKCdkZWNsYXJhdGlvbicsIG5vZGUgPT4gZGVjbGFyYXRpb25zLnB1c2gobm9kZSkpO1xuXG4gIHJldHVybiBmcC5jb21wb3NlKFxuICAgIGZwLnJlZHVjZSgocmVzdWx0LCBrZXkpID0+IHtcbiAgICAgIHJlc3VsdFtrZXldID0gdHJ1ZTsgLy8gbWFyayBjb21wb3NlZCBjbGFzc2VzIGFzIHRydWVcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSwge30pLFxuICAgIGZwLmZsYXRNYXAoZnAuY29tcG9zZShcbiAgICAgIGZwLm1hcChmcC5nZXQoJ2NvbnRlbnQnKSksXG4gICAgICBmcC5maWx0ZXIoeyB0eXBlOiAnaWRlbnQnIH0pLFxuICAgICAgZnAuZ2V0KCdjb250ZW50JyksXG4gICAgICBmcC5maW5kKHsgdHlwZTogJ3ZhbHVlJyB9KSxcbiAgICAgIGZwLmdldCgnY29udGVudCcpLFxuICAgICkpLFxuICAgIC8qXG4gICAgICAgcmVqZWN0IGNsYXNzZXMgY29tcG9zaW5nIGZyb20gb3RoZXIgZmlsZXNcbiAgICAgICBlZy5cbiAgICAgICAuZm9vIHtcbiAgICAgICBjb21wb3NlczogLmJhciBmcm9tICcuL290aGVyRmlsZSc7XG4gICAgICAgfVxuICAgICAqL1xuICAgIGZwLnJlamVjdChmcC5jb21wb3NlKFxuICAgICAgZnAuZmluZCh7IHR5cGU6ICdpZGVudCcsIGNvbnRlbnQ6ICdmcm9tJyB9KSxcbiAgICAgIGZwLmdldCgnY29udGVudCcpLFxuICAgICAgZnAuZmluZCh7IHR5cGU6ICd2YWx1ZScgfSksXG4gICAgICBmcC5nZXQoJ2NvbnRlbnQnKSxcbiAgICApKSxcbiAgICBmcC5maWx0ZXIoZnAuY29tcG9zZShcbiAgICAgIGZwLmZpbmQoeyB0eXBlOiAnaWRlbnQnLCBjb250ZW50OiAnY29tcG9zZXMnIH0pLFxuICAgICAgZnAuZ2V0KCdjb250ZW50JyksXG4gICAgICBmcC5maW5kKHsgdHlwZTogJ3Byb3BlcnR5JyB9KSxcbiAgICAgIGZwLmdldCgnY29udGVudCcpLFxuICAgICkpLFxuICApKGRlY2xhcmF0aW9ucyk7XG59O1xuXG5leHBvcnQgY29uc3QgZ2V0RXh0ZW5kQ2xhc3Nlc01hcCA9IChhc3Q6IGdBU1ROb2RlKTogY2xhc3NNYXBUeXBlID0+IHtcbiAgY29uc3QgZXh0ZW5kTm9kZXMgPSBbXTtcbiAgYXN0LnRyYXZlcnNlQnlUeXBlKCdleHRlbmQnLCBub2RlID0+IGV4dGVuZE5vZGVzLnB1c2gobm9kZSkpO1xuXG4gIHJldHVybiBmcC5jb21wb3NlKFxuICAgIGZwLnJlZHVjZSgocmVzdWx0LCBrZXkpID0+IHtcbiAgICAgIHJlc3VsdFtrZXldID0gdHJ1ZTsgLy8gbWFyayBleHRlbmQgY2xhc3NlcyBhcyB0cnVlXG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sIHt9KSxcbiAgICBmcC5tYXAoZnAuY29tcG9zZShcbiAgICAgIGZwLmdldCgnY29udGVudCcpLFxuICAgICAgZnAuZmluZCh7IHR5cGU6ICdpZGVudCcgfSksXG4gICAgICBmcC5nZXQoJ2NvbnRlbnQnKSxcbiAgICAgIGZwLmZpbmQoeyB0eXBlOiAnY2xhc3MnIH0pLFxuICAgICAgZnAuZ2V0KCdjb250ZW50JyksXG4gICAgICBmcC5maW5kKHsgdHlwZTogJ3NlbGVjdG9yJyB9KSxcbiAgICAgIGZwLmdldCgnY29udGVudCcpLFxuICAgICkpLFxuICApKGV4dGVuZE5vZGVzKTtcbn07XG5cbi8qKlxuICogUmVzb2x2ZXMgcGFyZW50IHNlbGVjdG9ycyB0byB0aGVpciBmdWxsIGNsYXNzIG5hbWVzLlxuICpcbiAqIEUuZy4gYC5mb28geyAmX2JhciB7Y29sb3I6IGJsdWUgfSB9YCB0byBgLmZvb19iYXJgLlxuICovXG5leHBvcnQgY29uc3QgZ2V0UGFyZW50U2VsZWN0b3JDbGFzc2VzTWFwID0gKGFzdDogZ0FTVE5vZGUpOiBjbGFzc01hcFR5cGUgPT4ge1xuICBjb25zdCBjbGFzc2VzTWFwOiBjbGFzc01hcFR5cGUgPSB7fTtcblxuICAvLyBSZWN1cnNpdmVseSB0cmF2ZXJzZXMgZG93biB0aGUgdHJlZSBsb29raW5nIGZvciBwYXJlbnQgc2VsZWN0b3JcbiAgLy8gZXh0ZW5zaW9ucy4gUmVjdXJzaW9uIGlzIG5lY2Vzc2FyeSBhcyB0aGVzZSBzZWxlY3RvcnMgY2FuIGJlIG5lc3RlZC5cbiAgY29uc3QgZ2V0RXh0ZW5zaW9ucyA9IG5vZGVDb250ZW50ID0+IHtcbiAgICBjb25zdCBibG9ja0NvbnRlbnQgPSBmcC5jb21wb3NlKFxuICAgICAgZnAuZmxhdE1hcCgnY29udGVudCcpLFxuICAgICAgZnAuZmlsdGVyKHsgdHlwZTogJ2Jsb2NrJyB9KVxuICAgICkobm9kZUNvbnRlbnQpO1xuXG4gICAgY29uc3QgcnVsZXNldHNDb250ZW50ID0gZnAuZmxhdE1hcCgnY29udGVudCcsIGZwLmNvbmNhdChcbiAgICAgIC8vIGBydWxlc2V0YCBjaGlsZHJlblxuICAgICAgZnAuZmlsdGVyKHsgdHlwZTogJ3J1bGVzZXQnIH0sIGJsb2NrQ29udGVudCksXG5cbiAgICAgIC8vIGBydWxlc2V0YCBkZXNjZW5kYW50cyBuZXN0ZWQgaW4gYGluY2x1ZGVgIG5vZGVzXG4gICAgICBmcC5jb21wb3NlKFxuICAgICAgICBmcC5maWx0ZXIoeyB0eXBlOiAncnVsZXNldCcgfSksXG4gICAgICAgIGZwLmZsYXRNYXAoJ2NvbnRlbnQnKSxcbiAgICAgICAgZnAuZmlsdGVyKHsgdHlwZTogJ2Jsb2NrJyB9KSxcbiAgICAgICAgZnAuZmxhdE1hcCgnY29udGVudCcpLFxuICAgICAgICBmcC5maWx0ZXIoeyB0eXBlOiAnaW5jbHVkZScgfSlcbiAgICAgICkoYmxvY2tDb250ZW50KVxuICAgICkpO1xuXG4gICAgY29uc3QgZXh0ZW5zaW9ucyA9IGZwLmNvbXBvc2UoXG4gICAgICBmcC5tYXAoJ2NvbnRlbnQnKSxcbiAgICAgIGZwLmZpbHRlcih7IHR5cGU6ICdpZGVudCcgfSksXG4gICAgICBmcC5mbGF0TWFwKCdjb250ZW50JyksXG4gICAgICBmcC5maWx0ZXIoeyB0eXBlOiAncGFyZW50U2VsZWN0b3JFeHRlbnNpb24nIH0pLFxuICAgICAgZnAuZmxhdE1hcCgnY29udGVudCcpLFxuICAgICAgZnAuZmlsdGVyKHsgdHlwZTogJ3NlbGVjdG9yJyB9KVxuICAgICkocnVsZXNldHNDb250ZW50KTtcblxuICAgIGlmICghZXh0ZW5zaW9ucy5sZW5ndGgpIHJldHVybiBbXTtcblxuICAgIGNvbnN0IG5lc3RlZEV4dGVuc2lvbnMgPSBnZXRFeHRlbnNpb25zKHJ1bGVzZXRzQ29udGVudCk7XG4gICAgY29uc3QgcmVzdWx0ID0gZXh0ZW5zaW9ucztcbiAgICBpZiAobmVzdGVkRXh0ZW5zaW9ucy5sZW5ndGgpIHtcbiAgICAgIG5lc3RlZEV4dGVuc2lvbnMuZm9yRWFjaChuZXN0ZWRFeHQgPT4ge1xuICAgICAgICBleHRlbnNpb25zLmZvckVhY2goZXh0ID0+IHtcbiAgICAgICAgICByZXN1bHQucHVzaChleHQgKyBuZXN0ZWRFeHQpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgYXN0LnRyYXZlcnNlQnlUeXBlKCdydWxlc2V0Jywgbm9kZSA9PiB7XG4gICAgY29uc3QgY2xhc3NOYW1lcyA9IGZwLmNvbXBvc2UoXG4gICAgICBmcC5tYXAoJ2NvbnRlbnQnKSxcbiAgICAgIGZwLmZpbHRlcih7IHR5cGU6ICdpZGVudCcgfSksXG4gICAgICBmcC5mbGF0TWFwKCdjb250ZW50JyksXG4gICAgICBmcC5maWx0ZXIoeyB0eXBlOiAnY2xhc3MnIH0pLFxuICAgICAgZnAuZmxhdE1hcCgnY29udGVudCcpLFxuICAgICAgZnAuZmlsdGVyKHsgdHlwZTogJ3NlbGVjdG9yJyB9KVxuICAgICkobm9kZS5jb250ZW50KTtcblxuICAgIGlmICghY2xhc3NOYW1lcy5sZW5ndGgpIHJldHVybjtcblxuICAgIGNvbnN0IGV4dGVuc2lvbnMgPSBnZXRFeHRlbnNpb25zKG5vZGUuY29udGVudCk7XG4gICAgaWYgKCFleHRlbnNpb25zLmxlbmd0aCkgcmV0dXJuO1xuXG4gICAgY2xhc3NOYW1lcy5mb3JFYWNoKGNsYXNzTmFtZSA9PiB7XG4gICAgICBleHRlbnNpb25zLmZvckVhY2goZXh0ID0+IHtcbiAgICAgICAgY2xhc3Nlc01hcFtjbGFzc05hbWUgKyBleHRdID0gZmFsc2U7XG4gICAgICB9KTtcblxuICAgICAgLy8gSWdub3JlIHRoZSBiYXNlIGNsYXNzIGlmIGl0IG9ubHkgZXhpc3RzIGZvciBuZXN0aW5nIHBhcmVudCBzZWxlY3RvcnNcbiAgICAgIGNvbnN0IGhhc0RlY2xhcmF0aW9ucyA9IGZwLmNvbXBvc2UoXG4gICAgICAgIGZwLmZpbHRlcih7IHR5cGU6ICdkZWNsYXJhdGlvbicgfSksXG4gICAgICAgIGZwLmZsYXRNYXAoJ2NvbnRlbnQnKSxcbiAgICAgICAgZnAuZmlsdGVyKHsgdHlwZTogJ2Jsb2NrJyB9KVxuICAgICAgKShub2RlLmNvbnRlbnQpLmxlbmd0aCA+IDA7XG4gICAgICBpZiAoIWhhc0RlY2xhcmF0aW9ucykgY2xhc3Nlc01hcFtjbGFzc05hbWVdID0gdHJ1ZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgcmV0dXJuIGNsYXNzZXNNYXA7XG59O1xuXG4vKlxuICAgbXV0YXRlcyBhc3QgYnkgcmVtb3ZpbmcgaW5zdGFuY2VzIG9mIDpnbG9iYWxcbiAqL1xuZXhwb3J0IGNvbnN0IGVsaW1pbmF0ZUdsb2JhbHMgPSAoYXN0OiBnQVNUTm9kZSkgPT4ge1xuICBhc3QudHJhdmVyc2UoKG5vZGUsIGluZGV4LCBwYXJlbnQpID0+IHtcbiAgICBpZiAobm9kZS50eXBlID09PSAncnVsZXNldCcpIHtcbiAgICAgIGlmIChcbiAgICAgICAgZnAuY29tcG9zZShcbiAgICAgICAgICBmcC5uZWdhdGUoZnAuaXNFbXB0eSksXG4gICAgICAgICAgZnAuZmluZCh7IHR5cGU6ICdpZGVudCcsIGNvbnRlbnQ6ICdnbG9iYWwnIH0pLFxuICAgICAgICAgIGZwLmdldCgnY29udGVudCcpLFxuICAgICAgICAgIGZwLmZpbmQoeyB0eXBlOiAncHNldWRvQ2xhc3MnIH0pLFxuICAgICAgICAgIGZwLmdldCgnY29udGVudCcpLFxuICAgICAgICAgIGZwLmZpbmQoeyB0eXBlOiAnc2VsZWN0b3InIH0pLFxuICAgICAgICAgIGZwLmdldCgnY29udGVudCcpLFxuICAgICAgICApKG5vZGUpXG4gICAgICApIHtcbiAgICAgICAgcGFyZW50LnJlbW92ZUNoaWxkKGluZGV4KTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xufTtcbiJdfQ==