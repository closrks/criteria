var _ = require('underscore');

var Criteria = function (mysqldb) {

  if (!mysqldb || !mysqldb.query) {
    throw new Error();
  }

  var _association
    , _restrictions = [];

  this.createCriteria = function (association) {

    if (arguments.length !== 1) {
      throw new Error();
    } else if (!_.isString(association)) {
      throw new Error();
    } 

    _association = association;

    return this;

  }

  this.add = function (restriction) {

    if (arguments.length !== 1) {
      throw new Error();
    } else if (!_.isObject(restriction)) {
      throw new Error();
    }

    for (var prop in restriction) {
      var temp = prop.toString() + ' ' + restriction[prop];
      _restrictions.push(temp);
    }

    return this;

  }

  this.next = function (fn1, fn2, fn3) {

    if (arguments.length > 0) {
      for (var i = 0, len = arguments.length; i < len; i++) {
        if (!_.isFunction(arguments[i])) {
          throw new Error();
        }
      }
    }

    var sql = 'SELECT * FROM ' + _association + ' ';

    if (_restrictions.length) {
      sql += 'WHERE '
      for (var i = 0, len = _restrictions.length; i < len; i++) {
        sql += _restrictions[i];
        if (i < len-1) {
          sql += ' AND ';
        }
      }
    }

    var callback = function (err, result) {
      if (err) {
        throw err;
      } else if (result && result.length < 1) {
        if (fn1) fn1();
      } else if (result && result.length === 1){
        if (fn2) fn2();
      } else if (result && result.length > 1) {
        if (fn3) fn3();
      }
    }

    mysqldb.query(sql, callback);

  }

}

module.exports = Criteria;