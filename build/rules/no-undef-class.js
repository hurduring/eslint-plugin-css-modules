'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _core = require('../core');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  meta: {
    docs: {
      description: 'Checks that you are using the existent css/scss/less classes',
      recommended: true
    },
    schema: [{
      type: 'object',
      properties: {
        camelCase: { enum: [true, 'dashes', 'only', 'dashes-only'] }
      }
    }]
  },
  create: function create(context) {
    var dirName = _path2.default.dirname(context.getFilename());
    var camelCase = _lodash2.default.get(context, 'options[0].camelCase');

    /*
       maps variable name to property Object
       map = {
         [variableName]: {
           classesMap: { foo: 'foo', fooBar: 'foo-bar', 'foo-bar': 'foo-bar' },
           node: {...}
         }
       }
        example:
       import s from './foo.scss';
       s is variable name
        property Object has two keys
       1. classesMap: an object with propertyName as key and its className as value
       2. node: node that correspond to s (see example above)
     */
    var map = {};

    return {
      ImportDeclaration: function ImportDeclaration(node) {
        var styleImportNodeData = (0, _core.getStyleImportNodeData)(node);

        if (!styleImportNodeData) {
          return;
        }

        var importName = styleImportNodeData.importName,
            styleFilePath = styleImportNodeData.styleFilePath,
            importNode = styleImportNodeData.importNode;


        var styleFileAbsolutePath = _path2.default.resolve(dirName, styleFilePath);
        var classes = (0, _core.getStyleClasses)(styleFileAbsolutePath);
        var classesMap = classes && (0, _core.getClassesMap)(classes, camelCase);

        // this will be used to check if classes are defined
        _lodash2.default.set(map, importName + '.classesMap', classesMap);

        // save node for reporting unused styles
        _lodash2.default.set(map, importName + '.node', importNode);
      },

      MemberExpression: function MemberExpression(node) {
        /*
           Check if property exists in css/scss file as class
         */

        var objectName = node.object.name;

        var propertyName = (0, _core.getPropertyName)(node, camelCase);

        if (!propertyName) {
          return;
        }

        var classesMap = _lodash2.default.get(map, objectName + '.classesMap');

        if (classesMap && classesMap[propertyName] == null) {
          context.report(node.property, 'Class \'' + propertyName + '\' not found');
        }
      }
    };
  }
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9ydWxlcy9uby11bmRlZi1jbGFzcy5qcyJdLCJuYW1lcyI6WyJtZXRhIiwiZG9jcyIsImRlc2NyaXB0aW9uIiwicmVjb21tZW5kZWQiLCJzY2hlbWEiLCJ0eXBlIiwicHJvcGVydGllcyIsImNhbWVsQ2FzZSIsImVudW0iLCJjcmVhdGUiLCJjb250ZXh0IiwiZGlyTmFtZSIsInBhdGgiLCJkaXJuYW1lIiwiZ2V0RmlsZW5hbWUiLCJfIiwiZ2V0IiwibWFwIiwiSW1wb3J0RGVjbGFyYXRpb24iLCJub2RlIiwic3R5bGVJbXBvcnROb2RlRGF0YSIsImltcG9ydE5hbWUiLCJzdHlsZUZpbGVQYXRoIiwiaW1wb3J0Tm9kZSIsInN0eWxlRmlsZUFic29sdXRlUGF0aCIsInJlc29sdmUiLCJjbGFzc2VzIiwiY2xhc3Nlc01hcCIsInNldCIsIk1lbWJlckV4cHJlc3Npb24iLCJvYmplY3ROYW1lIiwib2JqZWN0IiwibmFtZSIsInByb3BlcnR5TmFtZSIsInJlcG9ydCIsInByb3BlcnR5Il0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFDQTs7OztBQUNBOzs7O0FBRUE7Ozs7a0JBU2U7QUFDYkEsUUFBTTtBQUNKQyxVQUFNO0FBQ0pDLG1CQUFhLDhEQURUO0FBRUpDLG1CQUFhO0FBRlQsS0FERjtBQUtKQyxZQUFRLENBQ047QUFDRUMsWUFBTSxRQURSO0FBRUVDLGtCQUFZO0FBQ1ZDLG1CQUFXLEVBQUVDLE1BQU0sQ0FBQyxJQUFELEVBQU8sUUFBUCxFQUFpQixNQUFqQixFQUF5QixhQUF6QixDQUFSO0FBREQ7QUFGZCxLQURNO0FBTEosR0FETztBQWViQyxRQWZhLGtCQWVMQyxPQWZLLEVBZVk7QUFDdkIsUUFBTUMsVUFBVUMsZUFBS0MsT0FBTCxDQUFhSCxRQUFRSSxXQUFSLEVBQWIsQ0FBaEI7QUFDQSxRQUFNUCxZQUFZUSxpQkFBRUMsR0FBRixDQUFNTixPQUFOLEVBQWUsc0JBQWYsQ0FBbEI7O0FBRUE7Ozs7Ozs7Ozs7Ozs7OztBQWlCQSxRQUFNTyxNQUFNLEVBQVo7O0FBRUEsV0FBTztBQUNMQyx1QkFESyw2QkFDY0MsSUFEZCxFQUM0QjtBQUMvQixZQUFNQyxzQkFBc0Isa0NBQXVCRCxJQUF2QixDQUE1Qjs7QUFFQSxZQUFJLENBQUNDLG1CQUFMLEVBQTBCO0FBQ3hCO0FBQ0Q7O0FBTDhCLFlBUTdCQyxVQVI2QixHQVczQkQsbUJBWDJCLENBUTdCQyxVQVI2QjtBQUFBLFlBUzdCQyxhQVQ2QixHQVczQkYsbUJBWDJCLENBUzdCRSxhQVQ2QjtBQUFBLFlBVTdCQyxVQVY2QixHQVczQkgsbUJBWDJCLENBVTdCRyxVQVY2Qjs7O0FBYS9CLFlBQU1DLHdCQUF3QlosZUFBS2EsT0FBTCxDQUFhZCxPQUFiLEVBQXNCVyxhQUF0QixDQUE5QjtBQUNBLFlBQU1JLFVBQVUsMkJBQWdCRixxQkFBaEIsQ0FBaEI7QUFDQSxZQUFNRyxhQUFhRCxXQUFXLHlCQUFjQSxPQUFkLEVBQXVCbkIsU0FBdkIsQ0FBOUI7O0FBRUE7QUFDQVEseUJBQUVhLEdBQUYsQ0FBTVgsR0FBTixFQUFjSSxVQUFkLGtCQUF1Q00sVUFBdkM7O0FBRUE7QUFDQVoseUJBQUVhLEdBQUYsQ0FBTVgsR0FBTixFQUFjSSxVQUFkLFlBQWlDRSxVQUFqQztBQUNELE9BdkJJOztBQXdCTE0sd0JBQWtCLDBCQUFDVixJQUFELEVBQWtCO0FBQ2xDOzs7O0FBSUEsWUFBTVcsYUFBYVgsS0FBS1ksTUFBTCxDQUFZQyxJQUEvQjs7QUFFQSxZQUFNQyxlQUFlLDJCQUFnQmQsSUFBaEIsRUFBc0JaLFNBQXRCLENBQXJCOztBQUVBLFlBQUksQ0FBQzBCLFlBQUwsRUFBbUI7QUFDakI7QUFDRDs7QUFFRCxZQUFNTixhQUFhWixpQkFBRUMsR0FBRixDQUFNQyxHQUFOLEVBQWNhLFVBQWQsaUJBQW5COztBQUVBLFlBQUlILGNBQWNBLFdBQVdNLFlBQVgsS0FBNEIsSUFBOUMsRUFBb0Q7QUFDbER2QixrQkFBUXdCLE1BQVIsQ0FBZWYsS0FBS2dCLFFBQXBCLGVBQXdDRixZQUF4QztBQUNEO0FBQ0Y7QUExQ0ksS0FBUDtBQTRDRDtBQWxGWSxDIiwiZmlsZSI6Im5vLXVuZGVmLWNsYXNzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IF8gZnJvbSAnbG9kYXNoJztcblxuaW1wb3J0IHtcbiAgZ2V0U3R5bGVJbXBvcnROb2RlRGF0YSxcbiAgZ2V0U3R5bGVDbGFzc2VzLFxuICBnZXRQcm9wZXJ0eU5hbWUsXG4gIGdldENsYXNzZXNNYXAsXG59IGZyb20gJy4uL2NvcmUnO1xuXG5pbXBvcnQgdHlwZSB7IEpzTm9kZSB9IGZyb20gJy4uL3R5cGVzJztcblxuZXhwb3J0IGRlZmF1bHQge1xuICBtZXRhOiB7XG4gICAgZG9jczoge1xuICAgICAgZGVzY3JpcHRpb246ICdDaGVja3MgdGhhdCB5b3UgYXJlIHVzaW5nIHRoZSBleGlzdGVudCBjc3Mvc2Nzcy9sZXNzIGNsYXNzZXMnLFxuICAgICAgcmVjb21tZW5kZWQ6IHRydWUsXG4gICAgfSxcbiAgICBzY2hlbWE6IFtcbiAgICAgIHtcbiAgICAgICAgdHlwZTogJ29iamVjdCcsXG4gICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICBjYW1lbENhc2U6IHsgZW51bTogW3RydWUsICdkYXNoZXMnLCAnb25seScsICdkYXNoZXMtb25seSddIH1cbiAgICAgICAgfSxcbiAgICAgIH1cbiAgICBdLFxuICB9LFxuICBjcmVhdGUgKGNvbnRleHQ6IE9iamVjdCkge1xuICAgIGNvbnN0IGRpck5hbWUgPSBwYXRoLmRpcm5hbWUoY29udGV4dC5nZXRGaWxlbmFtZSgpKTtcbiAgICBjb25zdCBjYW1lbENhc2UgPSBfLmdldChjb250ZXh0LCAnb3B0aW9uc1swXS5jYW1lbENhc2UnKTtcblxuICAgIC8qXG4gICAgICAgbWFwcyB2YXJpYWJsZSBuYW1lIHRvIHByb3BlcnR5IE9iamVjdFxuICAgICAgIG1hcCA9IHtcbiAgICAgICAgIFt2YXJpYWJsZU5hbWVdOiB7XG4gICAgICAgICAgIGNsYXNzZXNNYXA6IHsgZm9vOiAnZm9vJywgZm9vQmFyOiAnZm9vLWJhcicsICdmb28tYmFyJzogJ2Zvby1iYXInIH0sXG4gICAgICAgICAgIG5vZGU6IHsuLi59XG4gICAgICAgICB9XG4gICAgICAgfVxuXG4gICAgICAgZXhhbXBsZTpcbiAgICAgICBpbXBvcnQgcyBmcm9tICcuL2Zvby5zY3NzJztcbiAgICAgICBzIGlzIHZhcmlhYmxlIG5hbWVcblxuICAgICAgIHByb3BlcnR5IE9iamVjdCBoYXMgdHdvIGtleXNcbiAgICAgICAxLiBjbGFzc2VzTWFwOiBhbiBvYmplY3Qgd2l0aCBwcm9wZXJ0eU5hbWUgYXMga2V5IGFuZCBpdHMgY2xhc3NOYW1lIGFzIHZhbHVlXG4gICAgICAgMi4gbm9kZTogbm9kZSB0aGF0IGNvcnJlc3BvbmQgdG8gcyAoc2VlIGV4YW1wbGUgYWJvdmUpXG4gICAgICovXG4gICAgY29uc3QgbWFwID0ge307XG5cbiAgICByZXR1cm4ge1xuICAgICAgSW1wb3J0RGVjbGFyYXRpb24gKG5vZGU6IEpzTm9kZSkge1xuICAgICAgICBjb25zdCBzdHlsZUltcG9ydE5vZGVEYXRhID0gZ2V0U3R5bGVJbXBvcnROb2RlRGF0YShub2RlKTtcblxuICAgICAgICBpZiAoIXN0eWxlSW1wb3J0Tm9kZURhdGEpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB7XG4gICAgICAgICAgaW1wb3J0TmFtZSxcbiAgICAgICAgICBzdHlsZUZpbGVQYXRoLFxuICAgICAgICAgIGltcG9ydE5vZGUsXG4gICAgICAgIH0gPSBzdHlsZUltcG9ydE5vZGVEYXRhO1xuXG4gICAgICAgIGNvbnN0IHN0eWxlRmlsZUFic29sdXRlUGF0aCA9IHBhdGgucmVzb2x2ZShkaXJOYW1lLCBzdHlsZUZpbGVQYXRoKTtcbiAgICAgICAgY29uc3QgY2xhc3NlcyA9IGdldFN0eWxlQ2xhc3NlcyhzdHlsZUZpbGVBYnNvbHV0ZVBhdGgpO1xuICAgICAgICBjb25zdCBjbGFzc2VzTWFwID0gY2xhc3NlcyAmJiBnZXRDbGFzc2VzTWFwKGNsYXNzZXMsIGNhbWVsQ2FzZSk7XG5cbiAgICAgICAgLy8gdGhpcyB3aWxsIGJlIHVzZWQgdG8gY2hlY2sgaWYgY2xhc3NlcyBhcmUgZGVmaW5lZFxuICAgICAgICBfLnNldChtYXAsIGAke2ltcG9ydE5hbWV9LmNsYXNzZXNNYXBgLCBjbGFzc2VzTWFwKTtcblxuICAgICAgICAvLyBzYXZlIG5vZGUgZm9yIHJlcG9ydGluZyB1bnVzZWQgc3R5bGVzXG4gICAgICAgIF8uc2V0KG1hcCwgYCR7aW1wb3J0TmFtZX0ubm9kZWAsIGltcG9ydE5vZGUpO1xuICAgICAgfSxcbiAgICAgIE1lbWJlckV4cHJlc3Npb246IChub2RlOiBKc05vZGUpID0+IHtcbiAgICAgICAgLypcbiAgICAgICAgICAgQ2hlY2sgaWYgcHJvcGVydHkgZXhpc3RzIGluIGNzcy9zY3NzIGZpbGUgYXMgY2xhc3NcbiAgICAgICAgICovXG5cbiAgICAgICAgY29uc3Qgb2JqZWN0TmFtZSA9IG5vZGUub2JqZWN0Lm5hbWU7XG5cbiAgICAgICAgY29uc3QgcHJvcGVydHlOYW1lID0gZ2V0UHJvcGVydHlOYW1lKG5vZGUsIGNhbWVsQ2FzZSk7XG5cbiAgICAgICAgaWYgKCFwcm9wZXJ0eU5hbWUpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBjbGFzc2VzTWFwID0gXy5nZXQobWFwLCBgJHtvYmplY3ROYW1lfS5jbGFzc2VzTWFwYCk7XG5cbiAgICAgICAgaWYgKGNsYXNzZXNNYXAgJiYgY2xhc3Nlc01hcFtwcm9wZXJ0eU5hbWVdID09IG51bGwpIHtcbiAgICAgICAgICBjb250ZXh0LnJlcG9ydChub2RlLnByb3BlcnR5LCBgQ2xhc3MgJyR7cHJvcGVydHlOYW1lfScgbm90IGZvdW5kYCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICB9XG59O1xuIl19