var expect = require('expect.js')
  , sinon = require('sinon')
  , Criteria = require('./../src/index');

/* setup */
var stubMysqldb = function (err, result) {
  return {
    query: function (sql, callback) {
      return callback && callback(err, result);
    }
  }
};

suite('Criteria', function () {

  suite('Constructor', function () {

    test('expect Criteria to be a truthy defined class', function () {
      expect(Criteria).to.be.ok();
    });

    test('expect Criteria to be a constructor function', function () {
      expect(Criteria).to.be.a('function')
    });

    test('expect Criteria to throw an err with no arguments', function () {
      expect(Criteria).withArgs().to.throwException();
    });

    test('expect Criteria with mysqldb argument to not throw exception', function () {
      expect(Criteria).withArgs(stubMysqldb).to.not.throwException();
    });

  })

  suite('Instance', function () {

    var criteria
      , mysqldb = stubMysqldb(null, null);

    setup(function () {
      criteria = new Criteria(mysqldb);
    });

    test('expect criteria to have method createCriteria', function () {
      expect(criteria.createCriteria).to.be.ok();
    });

    test('expect criteria.createCriteria to be a function', function () {
      expect(criteria.createCriteria).to.be.a('function')
    });

    test('expect criteria to have method add', function () {
      expect(criteria.add).to.be.ok();
    });

    test('expect criteria.add to be a function', function () {
      expect(criteria.add).to.be.a('function')
    });

    test('expect criteria to have method next', function () {
      expect(criteria.next).to.be.ok();
    });

    test('expect criteria.next to be a function', function () {
      expect(criteria.next).to.be.a('function')
    });

    teardown(function () {
      criteria = null;
    });

  })

  suite('Methods', function () {

    var criteria
      , mysqldb;

    suite('createCriteria', function () {

      setup(function () {
        mysqldb = stubMysqldb(null, null);
        criteria = new Criteria(mysqldb);
      });

      test('expect criteria.createCriteria to return criteria object', function () {
        var returnValue = criteria.createCriteria('association');
        expect(returnValue).to.be.ok();
        for (var prop in criteria) {
          expect(returnValue[prop]).to.be.ok();
        }
      });

      test('expect criteria.createCriteria to throw exception if no arguments', function () {
        expect(criteria.createCriteria).withArgs().to.throwException();
      });

      test('expect criteria.createCriteria to throw exception if > 1 arguments', function () {
        expect(criteria.createCriteria).withArgs('arg1','arg2').to.throwException();
      });

      test('expect criteria.createCriteria to not throw exception if 1 argument', function () {
        expect(criteria.createCriteria).withArgs('arg').to.not.throwException();
      });

      test('expect criteria.createCriteria to throw exception if argument[0] is not a string', function () {
        expect(criteria.createCriteria).withArgs(1).to.throwException();
      });

      test('expect criteria.createCriteria to not throw exception if argument[0] is a string', function () {
        expect(criteria.createCriteria).withArgs('arg').to.not.throwException();
      });

      teardown(function () {
        mysqldb = null;
        criteria = null;
      });

    });

    suite('add', function () {

      setup(function () {
        mysqldb = stubMysqldb(null, null);
        criteria = new Criteria(mysqldb);
      });


      test('expect criteria.add to return criteria object', function () {
        var returnValue = criteria.add({});
        expect(returnValue).to.be.ok();
        for (var prop in criteria) {
          expect(returnValue[prop]).to.be.ok();
        }
      });

      test('expect criteria.add to throw exception if no arguments', function () {
        expect(criteria.add).withArgs().to.throwException();
      });

      test('expect criteria.add to throw exception if > 1 arguments', function () {
        expect(criteria.add).withArgs({},'arg2').to.throwException();
      });

      test('expect criteria.add to not throw exception if 1 argument', function () {
        expect(criteria.add).withArgs({}).to.not.throwException();
      });

      test('expect criteria.add to throw exception if argument[0] is not an object', function () {
        expect(criteria.add).withArgs('string').to.throwException();
      });

      test('expect criteria.add to not throw exception if argument[0] is an object', function () {
        expect(criteria.add).withArgs({}).to.not.throwException();
      });

      test('expect criteria.add to not throw exception if argument[0] is an object with prop', function () {
        expect(criteria.add).withArgs({property: 'test'}).to.not.throwException();
      });

      teardown(function () {
        mysqldb = null;
        criteria = null;
      });

    });

    suite('next', function () {

      test('expect criteria.next to throw exception arguments > 0 and not function', function () {
        mysqldb = stubMysqldb(null, [1]);
        criteria = new Criteria(mysqldb);
        expect(criteria.next).withArgs('notFn').to.throwException();
      });

      test('expect criteria.next to not throw exception if arguments > 0 and functions', function () {
        mysqldb = stubMysqldb(null, [1]);
        criteria = new Criteria(mysqldb);
        expect(criteria.next).withArgs(function(){}).to.not.throwException();
        expect(criteria.next).withArgs(function(){ throw new Error() }, function(){}).to.not.throwException();
      });

      test('expect criteria.net to not throw exception if arguments > 0 and functions and restrictions exists', function () {
        mysqldb = stubMysqldb(null, [1]);
        criteria = new Criteria(mysqldb);
        criteria
          .createCriteria('test')
          .add({property: 'test'})
          .add({property: 'more'});

        expect(criteria.next).withArgs(function(){}).to.not.throwException();
        expect(criteria.next).withArgs(function(){ throw new Error() }, function(){}).to.not.throwException();
      });

      test('expect criteria.next to call mysqldb.query', function () {
        var query = sinon.spy();
        criteria = new Criteria({query: query});
        criteria.next();

        expect(query.calledOnce).to.be(true);
      });

      test('expect criteria.next to throw exception on dberror', function () {
        mysqldb = stubMysqldb(new Error(), null);
        criteria = new Criteria(mysqldb);
        expect(criteria.next).withArgs().to.throwException();
      });

      test('expect criteria.next to call fn1 once on no results', function () {
        mysqldb = stubMysqldb(null, []);
        criteria = new Criteria(mysqldb);

        var fn1 = sinon.spy()
          , fn2 = sinon.spy()
          , fn3 = sinon.spy()
          ;

        criteria.next(fn1, fn2, fn3);
        expect(fn1.calledOnce).to.be(true);
        expect(fn2.calledOnce).to.be(false);
        expect(fn3.calledOnce).to.be(false);
      });

      test('expect criteria.next to call fn2 once on 1 results', function () {
        mysqldb = stubMysqldb(null, [1]);
        criteria = new Criteria(mysqldb);

        var fn1 = sinon.spy()
          , fn2 = sinon.spy()
          , fn3 = sinon.spy()
          ;

        criteria.next(fn1, fn2, fn3);
        expect(fn1.calledOnce).to.be(false);
        expect(fn2.calledOnce).to.be(true);
        expect(fn3.calledOnce).to.be(false);
      });

      test('expect criteria.next to call fn3 once on > 1 results', function () {
        mysqldb = stubMysqldb(null, [1,2]);
        criteria = new Criteria(mysqldb);

        var fn1 = sinon.spy()
          , fn2 = sinon.spy()
          , fn3 = sinon.spy()
          ;

        criteria.next(fn1, fn2, fn3);
        expect(fn1.calledOnce).to.be(false);
        expect(fn2.calledOnce).to.be(false);
        expect(fn3.calledOnce).to.be(true);
      });

      teardown(function () {
        mysqldb = null;
        criteria = null;
      });

    });

  });

});