'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getStyleClasses = exports.getStyleImportNodeData = exports.getClassesMap = exports.getPropertyName = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fp = require('lodash/fp');

var _fp2 = _interopRequireDefault(_fp);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _gonzales = require('./gonzales');

var _gonzales2 = _interopRequireDefault(_gonzales);

var _traversalUtils = require('./traversalUtils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var styleExtensionRegex = /\.(s?css|less|styl)$/;

function dashesCamelCase(str) {
  return str.replace(/-+(\w)/g, function (match, firstLetter) {
    return firstLetter.toUpperCase();
  });
}

var getPropertyName = exports.getPropertyName = function getPropertyName(node) {
  var propertyName = node.computed
  /*
     square braces eg s['header']
     we won't use node.property.name because it is for cases like
     s[abc] where abc is a variable
   */
  ? node.property.value
  /* dot notation, eg s.header */
  : node.property.name;

  /*
     skip property names starting with _
     eg. special functions provided
     by css modules like _getCss()
      Tried to just skip function calls, but the parser
     thinks of normal property access like s._getCss and
     function calls like s._getCss() as same.
   */
  if (!propertyName || _lodash2.default.startsWith(propertyName, '_')) {
    return null;
  }

  return propertyName;
};

var getClassesMap = exports.getClassesMap = function getClassesMap(classes, camelCase) {
  var classesMap = {};

  // Unroll the loop because of performance!
  // Remember that this function will run on every lint (e.g.: on file save)
  switch (camelCase) {
    case true:
      _lodash2.default.forIn(classes, function (value, className) {
        classesMap[className] = className;
        classesMap[_lodash2.default.camelCase(className)] = className;
      });
      break;
    case 'dashes':
      _lodash2.default.forIn(classes, function (value, className) {
        classesMap[className] = className;
        classesMap[dashesCamelCase(className)] = className;
      });
      break;
    case 'only':
      _lodash2.default.forIn(classes, function (value, className) {
        classesMap[_lodash2.default.camelCase(className)] = className;
      });
      break;
    case 'dashes-only':
      _lodash2.default.forIn(classes, function (value, className) {
        classesMap[dashesCamelCase(className)] = className;
      });
      break;
    default:
      _lodash2.default.forIn(classes, function (value, className) {
        classesMap[className] = className;
      });
  }

  return classesMap;
};

var getStyleImportNodeData = exports.getStyleImportNodeData = function getStyleImportNodeData(node) {
  // path from which it was imported
  var styleFilePath = _fp2.default.get('source.value')(node);

  if (styleFilePath && styleExtensionRegex.test(styleFilePath)) {
    var importNode = _fp2.default.compose(_fp2.default.find({ type: 'ImportDefaultSpecifier' }), _fp2.default.get('specifiers'))(node);

    // the default imported name
    var importName = _fp2.default.get('local.name')(importNode);

    if (importName) {
      // it had a default import
      return { importName: importName, styleFilePath: styleFilePath, importNode: importNode };
    }
  }
};

var getStyleClasses = exports.getStyleClasses = function getStyleClasses(filePath) {
  try {
    // check if file exists
    _fs2.default.statSync(filePath);
  } catch (e) {
    return {}; // user will get error like class 'x' not found
  }

  var fileContent = _fs2.default.readFileSync(filePath);

  var syntax = _path2.default.extname(filePath).slice(1); // remove leading .

  var ast = _gonzales2.default.parse(fileContent.toString(), { syntax: syntax });

  if (!ast) {
    // it will be silent and will not show any error
    return null;
  }

  /*
     mutates ast by removing :global scopes
   */
  (0, _traversalUtils.eliminateGlobals)(ast);

  var classesMap = (0, _traversalUtils.getRegularClassesMap)(ast);
  var composedClassesMap = (0, _traversalUtils.getComposesClassesMap)(ast);
  var extendClassesMap = (0, _traversalUtils.getExtendClassesMap)(ast);
  var parentSelectorClassesMap = (0, _traversalUtils.getParentSelectorClassesMap)(ast);

  return _extends({}, classesMap, composedClassesMap, extendClassesMap, parentSelectorClassesMap);
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9jb3JlL2luZGV4LmpzIl0sIm5hbWVzIjpbInN0eWxlRXh0ZW5zaW9uUmVnZXgiLCJkYXNoZXNDYW1lbENhc2UiLCJzdHIiLCJyZXBsYWNlIiwibWF0Y2giLCJmaXJzdExldHRlciIsInRvVXBwZXJDYXNlIiwiZ2V0UHJvcGVydHlOYW1lIiwibm9kZSIsInByb3BlcnR5TmFtZSIsImNvbXB1dGVkIiwicHJvcGVydHkiLCJ2YWx1ZSIsIm5hbWUiLCJfIiwic3RhcnRzV2l0aCIsImdldENsYXNzZXNNYXAiLCJjbGFzc2VzIiwiY2FtZWxDYXNlIiwiY2xhc3Nlc01hcCIsImZvckluIiwiY2xhc3NOYW1lIiwiZ2V0U3R5bGVJbXBvcnROb2RlRGF0YSIsInN0eWxlRmlsZVBhdGgiLCJmcCIsImdldCIsInRlc3QiLCJpbXBvcnROb2RlIiwiY29tcG9zZSIsImZpbmQiLCJ0eXBlIiwiaW1wb3J0TmFtZSIsImdldFN0eWxlQ2xhc3NlcyIsImZpbGVQYXRoIiwiZnMiLCJzdGF0U3luYyIsImUiLCJmaWxlQ29udGVudCIsInJlYWRGaWxlU3luYyIsInN5bnRheCIsInBhdGgiLCJleHRuYW1lIiwic2xpY2UiLCJhc3QiLCJnb256YWxlcyIsInBhcnNlIiwidG9TdHJpbmciLCJjb21wb3NlZENsYXNzZXNNYXAiLCJleHRlbmRDbGFzc2VzTWFwIiwicGFyZW50U2VsZWN0b3JDbGFzc2VzTWFwIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFFQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBSUE7Ozs7QUFRQSxJQUFNQSxzQkFBc0Isc0JBQTVCOztBQUVBLFNBQVNDLGVBQVQsQ0FBMEJDLEdBQTFCLEVBQXVDO0FBQ3JDLFNBQU9BLElBQUlDLE9BQUosQ0FBWSxTQUFaLEVBQXVCLFVBQVVDLEtBQVYsRUFBaUJDLFdBQWpCLEVBQThCO0FBQzFELFdBQU9BLFlBQVlDLFdBQVosRUFBUDtBQUNELEdBRk0sQ0FBUDtBQUdEOztBQUVNLElBQU1D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QURVLENBQ0M7QUFDWjs7QUFFRCxNQUFNQyxjQUFjSCxhQUFHSSxZQUFILENBQWdCTCxRQUFoQixDQUFwQjs7QUFFQSxNQUFNTSxTQUFTQyxlQUFLQyxPQUFMLENBQWFSLFFBQWIsRUFBdUJTLEtBQXZCLENBQTZCLENBQTdCLENBQWYsQ0FWNEQsQ0FVWjs7QUFFaEQsTUFBTUMsTUFBTUMsbUJBQVNDLEtBQVQsQ0FBZVIsWUFBWVMsUUFBWixFQUFmLEVBQXVDLEVBQUVQLGNBQUYsRUFBdkMsQ0FBWjs7QUFFQSxNQUFJLENBQUNJLEdBQUwsRUFBVTtBQUNSO0FBQ0EsV0FBTyxJQUFQO0FBQ0Q7O0FBRUQ7OztBQUdBLHdDQUFpQkEsR0FBakI7O0FBRUEsTUFBTXhCLGFBQWEsMENBQXFCd0IsR0FBckIsQ0FBbkI7QUFDQSxNQUFNSSxxQkFBcUIsMkNBQXNCSixHQUF0QixDQUEzQjtBQUNBLE1BQU1LLG1CQUFtQix5Q0FBb0JMLEdBQXBCLENBQXpCO0FBQ0EsTUFBTU0sMkJBQTJCLGlEQUE0Qk4sR0FBNUIsQ0FBakM7O0FBRUEsc0JBQ0t4QixVQURMLEVBRUs0QixrQkFGTCxFQUdLQyxnQkFITCxFQUlLQyx3QkFKTDtBQU1ELENBbkNNIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQGZsb3dcblxuaW1wb3J0IGZzIGZyb20gJ2ZzJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IGZwIGZyb20gJ2xvZGFzaC9mcCc7XG5pbXBvcnQgXyBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IGdvbnphbGVzIGZyb20gJy4vZ29uemFsZXMnO1xuXG5pbXBvcnQgdHlwZSB7IEpzTm9kZSB9IGZyb20gJy4uL3R5cGVzJztcblxuaW1wb3J0IHtcbiAgZ2V0UmVndWxhckNsYXNzZXNNYXAsXG4gIGdldENvbXBvc2VzQ2xhc3Nlc01hcCxcbiAgZ2V0RXh0ZW5kQ2xhc3Nlc01hcCxcbiAgZ2V0UGFyZW50U2VsZWN0b3JDbGFzc2VzTWFwLFxuICBlbGltaW5hdGVHbG9iYWxzLFxufSBmcm9tICcuL3RyYXZlcnNhbFV0aWxzJztcblxuY29uc3Qgc3R5bGVFeHRlbnNpb25SZWdleCA9IC9cXC4ocz9jc3N8bGVzc3xzdHlsKSQvO1xuXG5mdW5jdGlvbiBkYXNoZXNDYW1lbENhc2UgKHN0cjogc3RyaW5nKSB7XG4gIHJldHVybiBzdHIucmVwbGFjZSgvLSsoXFx3KS9nLCBmdW5jdGlvbiAobWF0Y2gsIGZpcnN0TGV0dGVyKSB7XG4gICAgcmV0dXJuIGZpcnN0TGV0dGVyLnRvVXBwZXJDYXNlKCk7XG4gIH0pO1xufVxuXG5leHBvcnQgY29uc3QgZ2V0UHJvcGVydHlOYW1lID0gKG5vZGU6IEpzTm9kZSk6ID9zdHJpbmcgPT4ge1xuICBjb25zdCBwcm9wZXJ0eU5hbWUgPSBub2RlLmNvbXB1dGVkXG4gICAgLypcbiAgICAgICBzcXVhcmUgYnJhY2VzIGVnIHNbJ2hlYWRlciddXG4gICAgICAgd2Ugd29uJ3QgdXNlIG5vZGUucHJvcGVydHkubmFtZSBiZWNhdXNlIGl0IGlzIGZvciBjYXNlcyBsaWtlXG4gICAgICAgc1thYmNdIHdoZXJlIGFiYyBpcyBhIHZhcmlhYmxlXG4gICAgICovXG4gICAgID8gbm9kZS5wcm9wZXJ0eS52YWx1ZVxuICAgICAvKiBkb3Qgbm90YXRpb24sIGVnIHMuaGVhZGVyICovXG4gICAgIDogbm9kZS5wcm9wZXJ0eS5uYW1lO1xuXG4gIC8qXG4gICAgIHNraXAgcHJvcGVydHkgbmFtZXMgc3RhcnRpbmcgd2l0aCBfXG4gICAgIGVnLiBzcGVjaWFsIGZ1bmN0aW9ucyBwcm92aWRlZFxuICAgICBieSBjc3MgbW9kdWxlcyBsaWtlIF9nZXRDc3MoKVxuXG4gICAgIFRyaWVkIHRvIGp1c3Qgc2tpcCBmdW5jdGlvbiBjYWxscywgYnV0IHRoZSBwYXJzZXJcbiAgICAgdGhpbmtzIG9mIG5vcm1hbCBwcm9wZXJ0eSBhY2Nlc3MgbGlrZSBzLl9nZXRDc3MgYW5kXG4gICAgIGZ1bmN0aW9uIGNhbGxzIGxpa2Ugcy5fZ2V0Q3NzKCkgYXMgc2FtZS5cbiAgICovXG4gIGlmICghcHJvcGVydHlOYW1lIHx8IF8uc3RhcnRzV2l0aChwcm9wZXJ0eU5hbWUsICdfJykpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHJldHVybiBwcm9wZXJ0eU5hbWU7XG59O1xuXG5leHBvcnQgY29uc3QgZ2V0Q2xhc3Nlc01hcCA9IChjbGFzc2VzOiBPYmplY3QsIGNhbWVsQ2FzZTogc3RyaW5nfGJvb2xlYW4pOiBPYmplY3QgPT4ge1xuICBjb25zdCBjbGFzc2VzTWFwID0ge307XG5cbiAgLy8gVW5yb2xsIHRoZSBsb29wIGJlY2F1c2Ugb2YgcGVyZm9ybWFuY2UhXG4gIC8vIFJlbWVtYmVyIHRoYXQgdGhpcyBmdW5jdGlvbiB3aWxsIHJ1biBvbiBldmVyeSBsaW50IChlLmcuOiBvbiBmaWxlIHNhdmUpXG4gIHN3aXRjaCAoY2FtZWxDYXNlKSB7XG4gICAgY2FzZSB0cnVlOlxuICAgICAgXy5mb3JJbihjbGFzc2VzLCAodmFsdWUsIGNsYXNzTmFtZSkgPT4ge1xuICAgICAgICBjbGFzc2VzTWFwW2NsYXNzTmFtZV0gPSBjbGFzc05hbWU7XG4gICAgICAgIGNsYXNzZXNNYXBbXy5jYW1lbENhc2UoY2xhc3NOYW1lKV0gPSBjbGFzc05hbWU7XG4gICAgICB9KTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2Rhc2hlcyc6XG4gICAgICBfLmZvckluKGNsYXNzZXMsICh2YWx1ZSwgY2xhc3NOYW1lKSA9PiB7XG4gICAgICAgIGNsYXNzZXNNYXBbY2xhc3NOYW1lXSA9IGNsYXNzTmFtZTtcbiAgICAgICAgY2xhc3Nlc01hcFtkYXNoZXNDYW1lbENhc2UoY2xhc3NOYW1lKV0gPSBjbGFzc05hbWU7XG4gICAgICB9KTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ29ubHknOlxuICAgICAgXy5mb3JJbihjbGFzc2VzLCAodmFsdWUsIGNsYXNzTmFtZSkgPT4ge1xuICAgICAgICBjbGFzc2VzTWFwW18uY2FtZWxDYXNlKGNsYXNzTmFtZSldID0gY2xhc3NOYW1lO1xuICAgICAgfSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdkYXNoZXMtb25seSc6XG4gICAgICBfLmZvckluKGNsYXNzZXMsICh2YWx1ZSwgY2xhc3NOYW1lKSA9PiB7XG4gICAgICAgIGNsYXNzZXNNYXBbZGFzaGVzQ2FtZWxDYXNlKGNsYXNzTmFtZSldID0gY2xhc3NOYW1lO1xuICAgICAgfSk7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgXy5mb3JJbihjbGFzc2VzLCAodmFsdWUsIGNsYXNzTmFtZSkgPT4ge1xuICAgICAgICBjbGFzc2VzTWFwW2NsYXNzTmFtZV0gPSBjbGFzc05hbWU7XG4gICAgICB9KTtcbiAgfVxuXG4gIHJldHVybiBjbGFzc2VzTWFwO1xufTtcblxuZXhwb3J0IGNvbnN0IGdldFN0eWxlSW1wb3J0Tm9kZURhdGEgPSAobm9kZTogSnNOb2RlKTogP09iamVjdCA9PiB7XG4gIC8vIHBhdGggZnJvbSB3aGljaCBpdCB3YXMgaW1wb3J0ZWRcbiAgY29uc3Qgc3R5bGVGaWxlUGF0aCA9IGZwLmdldCgnc291cmNlLnZhbHVlJykobm9kZSk7XG5cbiAgaWYgKHN0eWxlRmlsZVBhdGggJiYgc3R5bGVFeHRlbnNpb25SZWdleC50ZXN0KHN0eWxlRmlsZVBhdGgpKSB7XG4gICAgY29uc3QgaW1wb3J0Tm9kZSA9IGZwLmNvbXBvc2UoXG4gICAgICBmcC5maW5kKHsgdHlwZTogJ0ltcG9ydERlZmF1bHRTcGVjaWZpZXInIH0pLFxuICAgICAgZnAuZ2V0KCdzcGVjaWZpZXJzJyksXG4gICAgKShub2RlKTtcblxuICAgIC8vIHRoZSBkZWZhdWx0IGltcG9ydGVkIG5hbWVcbiAgICBjb25zdCBpbXBvcnROYW1lID0gZnAuZ2V0KCdsb2NhbC5uYW1lJykoaW1wb3J0Tm9kZSk7XG5cbiAgICBpZiAoaW1wb3J0TmFtZSkgeyAvLyBpdCBoYWQgYSBkZWZhdWx0IGltcG9ydFxuICAgICAgcmV0dXJuIHsgaW1wb3J0TmFtZSwgc3R5bGVGaWxlUGF0aCwgaW1wb3J0Tm9kZSB9O1xuICAgIH1cbiAgfVxufTtcblxuZXhwb3J0IGNvbnN0IGdldFN0eWxlQ2xhc3NlcyA9IChmaWxlUGF0aDogc3RyaW5nKTogP09iamVjdCA9PiB7XG4gIHRyeSB7XG4gICAgLy8gY2hlY2sgaWYgZmlsZSBleGlzdHNcbiAgICBmcy5zdGF0U3luYyhmaWxlUGF0aCk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4ge307IC8vIHVzZXIgd2lsbCBnZXQgZXJyb3IgbGlrZSBjbGFzcyAneCcgbm90IGZvdW5kXG4gIH1cblxuICBjb25zdCBmaWxlQ29udGVudCA9IGZzLnJlYWRGaWxlU3luYyhmaWxlUGF0aCk7XG5cbiAgY29uc3Qgc3ludGF4ID0gcGF0aC5leHRuYW1lKGZpbGVQYXRoKS5zbGljZSgxKTsgLy8gcmVtb3ZlIGxlYWRpbmcgLlxuXG4gIGNvbnN0IGFzdCA9IGdvbnphbGVzLnBhcnNlKGZpbGVDb250ZW50LnRvU3RyaW5nKCksIHsgc3ludGF4IH0pO1xuXG4gIGlmICghYXN0KSB7XG4gICAgLy8gaXQgd2lsbCBiZSBzaWxlbnQgYW5kIHdpbGwgbm90IHNob3cgYW55IGVycm9yXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvKlxuICAgICBtdXRhdGVzIGFzdCBieSByZW1vdmluZyA6Z2xvYmFsIHNjb3Blc1xuICAgKi9cbiAgZWxpbWluYXRlR2xvYmFscyhhc3QpO1xuXG4gIGNvbnN0IGNsYXNzZXNNYXAgPSBnZXRSZWd1bGFyQ2xhc3Nlc01hcChhc3QpO1xuICBjb25zdCBjb21wb3NlZENsYXNzZXNNYXAgPSBnZXRDb21wb3Nlc0NsYXNzZXNNYXAoYXN0KTtcbiAgY29uc3QgZXh0ZW5kQ2xhc3Nlc01hcCA9IGdldEV4dGVuZENsYXNzZXNNYXAoYXN0KTtcbiAgY29uc3QgcGFyZW50U2VsZWN0b3JDbGFzc2VzTWFwID0gZ2V0UGFyZW50U2VsZWN0b3JDbGFzc2VzTWFwKGFzdCk7XG5cbiAgcmV0dXJuIHtcbiAgICAuLi5jbGFzc2VzTWFwLFxuICAgIC4uLmNvbXBvc2VkQ2xhc3Nlc01hcCxcbiAgICAuLi5leHRlbmRDbGFzc2VzTWFwLFxuICAgIC4uLnBhcmVudFNlbGVjdG9yQ2xhc3Nlc01hcFxuICB9O1xufTtcbiJdfQ==