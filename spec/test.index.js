var should = require('should')
  , sinon = require('sinon')
  , Criteria = require('./../src/index')
  , mysql = require('mysql')
  , mysqlConfig = require('./dbconfig.js');

var connection = mysql.createConnection(mysqlConfig);

var CREATE_TEST_DB = 'CREATE SCHEMA IF NOT EXISTS test_db;'
  , CREATE_TEST_TABLE = 'CREATE TABLE IF NOT EXISTS test_db.test_table ( \
      test_id int not null auto_increment, \
      test_property varchar(8), \
      PRIMARY KEY (test_id) \
    );'
  , INSERT_TEST_DATA = 'INSERT INTO test_db.test_table (test_property) VALUES ?'
  , DROP_TEST_DB = 'DROP SCHEMA test_db;'
  , TEST_DATA = [[['1'],['2'],['2']]];

describe('Criteria', function () {

  describe('Scenarios', function () {

      var criteria;

      before(function (done) {
        // setup db
        connection.query(CREATE_TEST_DB + CREATE_TEST_TABLE, function (err, result) {
          if (err) {
            throw err;
          }
          // insert test data
          connection.query(INSERT_TEST_DATA, TEST_DATA, function (err, result) {
            if (err) {
              throw err;
            }
            done();
          });
        });
      });

      beforeEach(function() {
        criteria = new Criteria(connection);
      });

      it('should call nextFunc1 if the result is < 1', function (done) {
        
        var spyFunc1 = sinon.spy()
          , nextFunc1 = function () {
              spyFunc1();
              spyFunc1.calledOnce.should.be.true;
              done();
            };

        criteria
          .createCriteria('test_db.test_table')
          .add({test_property: '= \'0\''})
          .next(nextFunc1);
      });

      it('should call nextFunc2 if the result is 1', function (done) {
        var spyFunc1 = sinon.spy()
          , spyFunc2 = sinon.spy()
          , nextFunc1 = function () {}
          , nextFunc2 = function () {
            spyFunc2();
            spyFunc1.called.should.be.false;
            spyFunc2.calledOnce.should.be.true;
            done();
          };

        criteria
          .createCriteria('test_db.test_table')
          .add({test_property: '= \'1\''})
          .add({test_property: '= \'1\''}) // second line coverage
          .next(nextFunc1, nextFunc2);
      });

      it('should call nextFunc3 if the result is > 1', function (done) {
        var spyFunc1 = sinon.spy()
          , spyFunc2 = sinon.spy()
          , spyFunc3 = sinon.spy()
          , nextFunc1 = function () {}
          , nextFunc2 = function () {}
          , nextFunc3 = function () {
            spyFunc3();
            spyFunc1.called.should.be.false;
            spyFunc2.called.should.be.false;
            spyFunc3.calledOnce.should.be.true;
            done();
          };

        criteria
          .createCriteria('test_db.test_table')
          .add({test_property: '= \'2\''})
          .next(nextFunc1, nextFunc2, nextFunc3);
      })

      afterEach(function() {
        criteria = new Criteria(connection);
      });

      after(function (done) {
        // drop test
        connection.query(DROP_TEST_DB, function (err, result) {
          if (err) {
            throw err;
          }
          done();
        });
      });

  });

  describe('Errors', function () {

    it('should throw error if there is not a valid connection passed in', function () {
      (function () {
        new Criteria();
      }).should.throwError();
    });

    it('should throw error on createCriteria if there is not exactly one argument', function () {
      (function () {
        var criteria = new Criteria(connection);
        criteria.createCriteria();
      }).should.throwError();
    });

    it('should throw error on createCriteria if there is one argument thats not a string', function () {
      (function () {
        var criteria = new Criteria(connection);
        criteria.createCriteria(1);
      }).should.throwError();
    });

    it('should throw error on add if there is not exactly one argument', function () {
      (function () {
        var criteria = new Criteria(connection);
        criteria.add();
      }).should.throwError();
    });

    it('should throw error on createCriteria if there is one argument thats not a string', function () {
      (function () {
        var criteria = new Criteria(connection);
        criteria.add(1);
      }).should.throwError();
    });

    it('should throw err on next if there is arguments that are not functions', function () {
      (function () {
        var criteria = new Criteria(connection);
        criteria.next(1);
      }).should.throwError();
    });

    it('should throw err on next if callback returns err from db', function () {
      (function () {
        var criteria = new Criteria({query: function (sql, callback){return callback(new Error())}});
        criteria.next();
      }).should.throwError();
    });

  });

});