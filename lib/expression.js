'use strict';

var isNumber = require('is-number');
var define = require('define-property');
var flags = require('./parse/flags');
var utils = require('./utils');

function Expression(name, type) {
  define(this, 'val', name);
  name = name.trim();

  if (name.slice(0, 3) === '...') {
    this.expression = new Expression(name.slice(3));
    this.type = 'RestType';
    define(this, 'name', this.expression.name);
    return;
  }

  if (isNumber(name)) {
    this.type = 'NumericLiteralType';
    this.value = name;
    return;
  }

  if (type === 'StringLiteralType') {
    this.type = type;
    this.value = name;
    return;
  }

  switch (name) {
    case 'true':
    case 'false':
      this.type = 'BooleanLiteralType';
      this.value = name === 'true';
      break;
    case '*':
      this.type = 'AllLiteral';
      break;
    case '!':
      this.type = 'NonNullableLiteral';
      break;
    case '?':
      this.type = 'NullableLiteral';
      break;
    default: {
      this.type = 'NameExpression';
      this.name = name ? utils.clean(name) : null;
      define(this, 'val', this.name);
      var tok = flags(this);

      if (tok.val !== this.name || tok.type === 'OptionalType' || tok.type === 'NullableType' || tok.type === 'NonNullableType') {
        this.name = tok.val;
        if (tok.type === 'OptionalType' || tok.type === 'NullableType' || tok.type === 'NonNullableType') {
          delete this.name;
        }

        if (tok.type === 'OptionalType') {
          delete this.prefix;
        }
        this.expression = new Expression(tok.val);
      }
      break;
    }
  }
};

module.exports = Expression;