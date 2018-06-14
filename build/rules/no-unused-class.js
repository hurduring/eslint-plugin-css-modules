'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fp = require('lodash/fp');

var _fp2 = _interopRequireDefault(_fp);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _core = require('../core');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  meta: {
    docs: {
      description: 'Checks that you are using all css/scss/less classes',
      recommended: true
    },
    schema: [{
      type: 'object',
      properties: {
        camelCase: { enum: [true, 'dashes', 'only', 'dashes-only'] },
        markAsUsed: { type: 'array' }
      }
    }]
  },
  create: function create(context) {
    var dirName = _path2.default.dirname(context.getFilename());
    var markAsUsed = _lodash2.default.get(context, 'options[0].markAsUsed');
    var camelCase = _lodash2.default.get(context, 'options[0].camelCase');

    /*
       maps variable name to property Object
       map = {
         [variableName]: {
           classes: { foo: false, 'foo-bar': false },
           classesMap: { foo: 'foo', fooBar: 'foo-bar', 'foo-bar': 'foo-bar' },
           node: {...}
         }
       }
        example:
       import s from './foo.scss';
       s is variable name
        property Object has two keys
       1. classes: an object with className as key and a boolean as value. The boolean is marked if it is used in file
       2. classesMap: an object with propertyName as key and its className as value
       3. node: node that correspond to s (see example above)
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

        // this will be used to mark s.foo as used in MemberExpression
        var classes = (0, _core.getStyleClasses)(styleFileAbsolutePath);
        var classesMap = classes && (0, _core.getClassesMap)(classes, camelCase);

        _lodash2.default.set(map, importName + '.classes', classes);
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

        var className = _lodash2.default.get(map, objectName + '.classesMap.' + propertyName);

        if (className == null) {
          return;
        }

        // mark this property has used
        _lodash2.default.set(map, objectName + '.classes.' + className, true);
      },
      'Program:exit': function ProgramExit() {
        /*
           Check if all classes defined in css/scss file are used
         */

        /*
           we are looping over each import style node in program
           example:
           ```
             import s from './foo.css';
             import x from './bar.scss';
           ```
           then the loop will be run 2 times
         */
        _lodash2.default.forIn(map, function (o) {
          var classes = o.classes,
              node = o.node;

          /*
             if option is passed to mark a class as used, example:
             eslint css-modules/no-unused-class: [2, { markAsUsed: ['container'] }]
           */

          _lodash2.default.forEach(markAsUsed, function (usedClass) {
            classes[usedClass] = true;
          });

          // classNames not marked as true are unused
          var unusedClasses = _fp2.default.compose(_fp2.default.keys, _fp2.default.omitBy(_fp2.default.identity) // omit truthy values
          )(classes);

          if (!_lodash2.default.isEmpty(unusedClasses)) {
            context.report(node, 'Unused classes found: ' + unusedClasses.join(', '));
          }
        });
      }
    };
  }
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9ydWxlcy9uby11bnVzZWQtY2xhc3MuanMiXSwibmFtZXMiOlsibWV0YSIsImRvY3MiLCJkZXNjcmlwdGlvbiIsInJlY29tbWVuZGVkIiwic2NoZW1hIiwidHlwZSIsInByb3BlcnRpZXMiLCJjYW1lbENhc2UiLCJlbnVtIiwibWFya0FzVXNlZCIsImNyZWF0ZSIsImNvbnRleHQiLCJkaXJOYW1lIiwicGF0aCIsImRpcm5hbWUiLCJnZXRGaWxlbmFtZSIsIl8iLCJnZXQiLCJtYXAiLCJJbXBvcnREZWNsYXJhdGlvbiIsIm5vZGUiLCJzdHlsZUltcG9ydE5vZGVEYXRhIiwiaW1wb3J0TmFtZSIsInN0eWxlRmlsZVBhdGgiLCJpbXBvcnROb2RlIiwic3R5bGVGaWxlQWJzb2x1dGVQYXRoIiwicmVzb2x2ZSIsImNsYXNzZXMiLCJjbGFzc2VzTWFwIiwic2V0IiwiTWVtYmVyRXhwcmVzc2lvbiIsIm9iamVjdE5hbWUiLCJvYmplY3QiLCJuYW1lIiwicHJvcGVydHlOYW1lIiwiY2xhc3NOYW1lIiwiZm9ySW4iLCJvIiwiZm9yRWFjaCIsInVzZWRDbGFzcyIsInVudXNlZENsYXNzZXMiLCJmcCIsImNvbXBvc2UiLCJrZXlzIiwib21pdEJ5IiwiaWRlbnRpdHkiLCJpc0VtcHR5IiwicmVwb3J0Iiwiam9pbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBRUE7Ozs7a0JBU2U7QUFDYkEsUUFBTTtBQUNKQyxVQUFNO0FBQ0pDLG1CQUFhLHFEQURUO0FBRUpDLG1CQUFhO0FBRlQsS0FERjtBQUtKQyxZQUFRLENBQ047QUFDRUMsWUFBTSxRQURSO0FBRUVDLGtCQUFZO0FBQ1ZDLG1CQUFXLEVBQUVDLE1BQU0sQ0FBQyxJQUFELEVBQU8sUUFBUCxFQUFpQixNQUFqQixFQUF5QixhQUF6QixDQUFSLEVBREQ7QUFFVkMsb0JBQVksRUFBRUosTUFBTSxPQUFSO0FBRkY7QUFGZCxLQURNO0FBTEosR0FETztBQWdCYkssUUFo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cy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCBmcCBmcm9tICdsb2Rhc2gvZnAnO1xuaW1wb3J0IF8gZnJvbSAnbG9kYXNoJztcblxuaW1wb3J0IHtcbiAgZ2V0U3R5bGVJbXBvcnROb2RlRGF0YSxcbiAgZ2V0U3R5bGVDbGFzc2VzLFxuICBnZXRQcm9wZXJ0eU5hbWUsXG4gIGdldENsYXNzZXNNYXAsXG59IGZyb20gJy4uL2NvcmUnO1xuXG5pbXBvcnQgdHlwZSB7IEpzTm9kZSB9IGZyb20gJy4uL3R5cGVzJztcblxuZXhwb3J0IGRlZmF1bHQge1xuICBtZXRhOiB7XG4gICAgZG9jczoge1xuICAgICAgZGVzY3JpcHRpb246ICdDaGVja3MgdGhhdCB5b3UgYXJlIHVzaW5nIGFsbCBjc3Mvc2Nzcy9sZXNzIGNsYXNzZXMnLFxuICAgICAgcmVjb21tZW5kZWQ6IHRydWUsXG4gICAgfSxcbiAgICBzY2hlbWE6IFtcbiAgICAgIHtcbiAgICAgICAgdHlwZTogJ29iamVjdCcsXG4gICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICBjYW1lbENhc2U6IHsgZW51bTogW3RydWUsICdkYXNoZXMnLCAnb25seScsICdkYXNoZXMtb25seSddIH0sXG4gICAgICAgICAgbWFya0FzVXNlZDogeyB0eXBlOiAnYXJyYXknIH0sXG4gICAgICAgIH0sXG4gICAgICB9XG4gICAgXSxcbiAgfSxcbiAgY3JlYXRlIChjb250ZXh0OiBPYmplY3QpIHtcbiAgICBjb25zdCBkaXJOYW1lID0gcGF0aC5kaXJuYW1lKGNvbnRleHQuZ2V0RmlsZW5hbWUoKSk7XG4gICAgY29uc3QgbWFya0FzVXNlZCA9IF8uZ2V0KGNvbnRleHQsICdvcHRpb25zWzBdLm1hcmtBc1VzZWQnKTtcbiAgICBjb25zdCBjYW1lbENhc2UgPSBfLmdldChjb250ZXh0LCAnb3B0aW9uc1swXS5jYW1lbENhc2UnKTtcblxuICAgIC8qXG4gICAgICAgbWFwcyB2YXJpYWJsZSBuYW1lIHRvIHByb3BlcnR5IE9iamVjdFxuICAgICAgIG1hcCA9IHtcbiAgICAgICAgIFt2YXJpYWJsZU5hbWVdOiB7XG4gICAgICAgICAgIGNsYXNzZXM6IHsgZm9vOiBmYWxzZSwgJ2Zvby1iYXInOiBmYWxzZSB9LFxuICAgICAgICAgICBjbGFzc2VzTWFwOiB7IGZvbzogJ2ZvbycsIGZvb0JhcjogJ2Zvby1iYXInLCAnZm9vLWJhcic6ICdmb28tYmFyJyB9LFxuICAgICAgICAgICBub2RlOiB7Li4ufVxuICAgICAgICAgfVxuICAgICAgIH1cblxuICAgICAgIGV4YW1wbGU6XG4gICAgICAgaW1wb3J0IHMgZnJvbSAnLi9mb28uc2Nzcyc7XG4gICAgICAgcyBpcyB2YXJpYWJsZSBuYW1lXG5cbiAgICAgICBwcm9wZXJ0eSBPYmplY3QgaGFzIHR3byBrZXlzXG4gICAgICAgMS4gY2xhc3NlczogYW4gb2JqZWN0IHdpdGggY2xhc3NOYW1lIGFzIGtleSBhbmQgYSBib29sZWFuIGFzIHZhbHVlLiBUaGUgYm9vbGVhbiBpcyBtYXJrZWQgaWYgaXQgaXMgdXNlZCBpbiBmaWxlXG4gICAgICAgMi4gY2xhc3Nlc01hcDogYW4gb2JqZWN0IHdpdGggcHJvcGVydHlOYW1lIGFzIGtleSBhbmQgaXRzIGNsYXNzTmFtZSBhcyB2YWx1ZVxuICAgICAgIDMuIG5vZGU6IG5vZGUgdGhhdCBjb3JyZXNwb25kIHRvIHMgKHNlZSBleGFtcGxlIGFib3ZlKVxuICAgICAqL1xuICAgIGNvbnN0IG1hcCA9IHt9O1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIEltcG9ydERlY2xhcmF0aW9uIChub2RlOiBKc05vZGUpIHtcbiAgICAgICAgY29uc3Qgc3R5bGVJbXBvcnROb2RlRGF0YSA9IGdldFN0eWxlSW1wb3J0Tm9kZURhdGEobm9kZSk7XG5cbiAgICAgICAgaWYgKCFzdHlsZUltcG9ydE5vZGVEYXRhKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qge1xuICAgICAgICAgIGltcG9ydE5hbWUsXG4gICAgICAgICAgc3R5bGVGaWxlUGF0aCxcbiAgICAgICAgICBpbXBvcnROb2RlLFxuICAgICAgICB9ID0gc3R5bGVJbXBvcnROb2RlRGF0YTtcblxuICAgICAgICBjb25zdCBzdHlsZUZpbGVBYnNvbHV0ZVBhdGggPSBwYXRoLnJlc29sdmUoZGlyTmFtZSwgc3R5bGVGaWxlUGF0aCk7XG5cbiAgICAgICAgLy8gdGhpcyB3aWxsIGJlIHVzZWQgdG8gbWFyayBzLmZvbyBhcyB1c2VkIGluIE1lbWJlckV4cHJlc3Npb25cbiAgICAgICAgY29uc3QgY2xhc3NlcyA9IGdldFN0eWxlQ2xhc3NlcyhzdHlsZUZpbGVBYnNvbHV0ZVBhdGgpO1xuICAgICAgICBjb25zdCBjbGFzc2VzTWFwID0gY2xhc3NlcyAmJiBnZXRDbGFzc2VzTWFwKGNsYXNzZXMsIGNhbWVsQ2FzZSk7XG5cbiAgICAgICAgXy5zZXQobWFwLCBgJHtpbXBvcnROYW1lfS5jbGFzc2VzYCwgY2xhc3Nlcyk7XG4gICAgICAgIF8uc2V0KG1hcCwgYCR7aW1wb3J0TmFtZX0uY2xhc3Nlc01hcGAsIGNsYXNzZXNNYXApO1xuXG4gICAgICAgIC8vIHNhdmUgbm9kZSBmb3IgcmVwb3J0aW5nIHVudXNlZCBzdHlsZXNcbiAgICAgICAgXy5zZXQobWFwLCBgJHtpbXBvcnROYW1lfS5ub2RlYCwgaW1wb3J0Tm9kZSk7XG4gICAgICB9LFxuICAgICAgTWVtYmVyRXhwcmVzc2lvbjogKG5vZGU6IEpzTm9kZSkgPT4ge1xuICAgICAgICAvKlxuICAgICAgICAgICBDaGVjayBpZiBwcm9wZXJ0eSBleGlzdHMgaW4gY3NzL3Njc3MgZmlsZSBhcyBjbGFzc1xuICAgICAgICAgKi9cblxuICAgICAgICBjb25zdCBvYmplY3ROYW1lID0gbm9kZS5vYmplY3QubmFtZTtcbiAgICAgICAgY29uc3QgcHJvcGVydHlOYW1lID0gZ2V0UHJvcGVydHlOYW1lKG5vZGUsIGNhbWVsQ2FzZSk7XG5cbiAgICAgICAgaWYgKCFwcm9wZXJ0eU5hbWUpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBjbGFzc05hbWUgPSBfLmdldChtYXAsIGAke29iamVjdE5hbWV9LmNsYXNzZXNNYXAuJHtwcm9wZXJ0eU5hbWV9YCk7XG5cbiAgICAgICAgaWYgKGNsYXNzTmFtZSA9PSBudWxsKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gbWFyayB0aGlzIHByb3BlcnR5IGhhcyB1c2VkXG4gICAgICAgIF8uc2V0KG1hcCwgYCR7b2JqZWN0TmFtZX0uY2xhc3Nlcy4ke2NsYXNzTmFtZX1gLCB0cnVlKTtcbiAgICAgIH0sXG4gICAgICAnUHJvZ3JhbTpleGl0JyAoKSB7XG4gICAgICAgIC8qXG4gICAgICAgICAgIENoZWNrIGlmIGFsbCBjbGFzc2VzIGRlZmluZWQgaW4gY3NzL3Njc3MgZmlsZSBhcmUgdXNlZFxuICAgICAgICAgKi9cblxuICAgICAgICAvKlxuICAgICAgICAgICB3ZSBhcmUgbG9vcGluZyBvdmVyIGVhY2ggaW1wb3J0IHN0eWxlIG5vZGUgaW4gcHJvZ3JhbVxuICAgICAgICAgICBleGFtcGxlOlxuICAgICAgICAgICBgYGBcbiAgICAgICAgICAgICBpbXBvcnQgcyBmcm9tICcuL2Zvby5jc3MnO1xuICAgICAgICAgICAgIGltcG9ydCB4IGZyb20gJy4vYmFyLnNjc3MnO1xuICAgICAgICAgICBgYGBcbiAgICAgICAgICAgdGhlbiB0aGUgbG9vcCB3aWxsIGJlIHJ1biAyIHRpbWVzXG4gICAgICAgICAqL1xuICAgICAgICBfLmZvckluKG1hcCwgKG8pID0+IHtcbiAgICAgICAgICBjb25zdCB7IGNsYXNzZXMsIG5vZGUgfSA9IG87XG5cbiAgICAgICAgICAvKlxuICAgICAgICAgICAgIGlmIG9wdGlvbiBpcyBwYXNzZWQgdG8gbWFyayBhIGNsYXNzIGFzIHVzZWQsIGV4YW1wbGU6XG4gICAgICAgICAgICAgZXNsaW50IGNzcy1tb2R1bGVzL25vLXVudXNlZC1jbGFzczogWzIsIHsgbWFya0FzVXNlZDogWydjb250YWluZXInXSB9XVxuICAgICAgICAgICAqL1xuICAgICAgICAgIF8uZm9yRWFjaChtYXJrQXNVc2VkLCAodXNlZENsYXNzKSA9PiB7XG4gICAgICAgICAgICBjbGFzc2VzW3VzZWRDbGFzc10gPSB0cnVlO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgLy8gY2xhc3NOYW1lcyBub3QgbWFya2VkIGFzIHRydWUgYXJlIHVudXNlZFxuICAgICAgICAgIGNvbnN0IHVudXNlZENsYXNzZXMgPSBmcC5jb21wb3NlKFxuICAgICAgICAgICAgZnAua2V5cyxcbiAgICAgICAgICAgIGZwLm9taXRCeShmcC5pZGVudGl0eSksIC8vIG9taXQgdHJ1dGh5IHZhbHVlc1xuICAgICAgICAgICkoY2xhc3Nlcyk7XG5cbiAgICAgICAgICBpZiAoIV8uaXNFbXB0eSh1bnVzZWRDbGFzc2VzKSkge1xuICAgICAgICAgICAgY29udGV4dC5yZXBvcnQobm9kZSwgYFVudXNlZCBjbGFzc2VzIGZvdW5kOiAke3VudXNlZENsYXNzZXMuam9pbignLCAnKX1gKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH07XG4gIH1cbn07XG4iXX0=