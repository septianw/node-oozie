var Oozie = require('../oozie.js'),
    fs = require('fs'),
    assert = require('assert');

var jsonxml = require('jsontoxml');

var location = {
    protocol: 'http',
    hostname: '192.168.1.225',
    port: '11000'
  };
var oozie = new Oozie(location);


describe('Get', function() {
  /*describe('#Get oozie versions', function() {
    it('get oozie versions', function(done) {
      var param = {},
          option = {};
      
      oozie.getVersions(param, option, function(err, res, body){
        console.log(err);
        console.log(res);
        console.log(body);
        
//        assert.equal(true, body.isArray());
        done();
      })
    });
  });
  
  describe('#Get admin status', function() {
    it('get admin status', function(done) {
      
      var param = {},
          option = {};
      
      oozie.getAdminStatus(param, option, function(err, res, body){
        console.log(err);
        console.log(res);
        console.log(body);
        
//        assert.equal(true, body.isArray());
        done();
      })
    });
  });
  
  describe('#Get OsEv', function() {
    it('get OsEv', function(done) {
      
      var param = {},
          option = {};
      
      oozie.getOsEnv(param, option, function(err, res, body){
        console.log(err);
        console.log(res);
        console.log(body);
        
//        assert.equal(true, body.isArray());
        done();
      })
    });
  });
  
  describe('#Get Java Sys Properties', function() {
    it('get java sys properties', function(done) {
      
      var param = {},
          option = {};
      
      oozie.getJavaSysProperties(param, option, function(err, res, body){
        console.log(err);
        console.log(res);
        console.log(body);
        
//        assert.equal(true, body.isArray());
        done();
      })
    });
  });
  
  describe('#Get Configuration', function() {
    it('get configuration', function(done) {
      
      var param = {},
          option = {};
      
      oozie.getConfiguration(param, option, function(err, res, body){
        console.log(err);
        console.log(res);
        console.log(body);
        
//        assert.equal(true, body.isArray());
        done();
      })
    });
  });
  
  describe('#Get Instrumentation', function() {
    it('get instrumentation', function(done) {
      
      var param = {},
          option = {};
      
      oozie.getInstrumentation(param, option, function(err, res, body){
        console.log(err);
        console.log(res);
        console.log(body);
        
//        assert.equal(true, body.isArray());
        done();
      })
    });
  });
  
  describe('#Get Build Version', function() {
    it('get build version', function(done) {
      
      var param = {},
          option = {};
      
      oozie.getBuildVersion(param, option, function(err, res, body){
        console.log(err);
        console.log(res);
        console.log(body);
        
//        assert.equal(true, body.isArray());
        done();
      })
    });
  });
  
  describe('#Get Available Timezones', function() {
    it('get available timezones', function(done) {
      
      var param = {},
          option = {};
      
      oozie.getAvailableTimezones(param, option, function(err, res, body){
        console.log(err);
        console.log(res);
        console.log(body);
        
//        assert.equal(true, body.isArray());
        done();
      })
    });
  });
  
  describe('#Get Queue Dump', function() {
    it('get queue dump', function(done) {
      
      var param = {},
          option = {};
      
      oozie.getQueueDump(param, option, function(err, res, body){
        console.log(err);
        console.log(res);
        console.log(body);
        
//        assert.equal(true, body.isArray());
        done();
      })
    });
  });
  
  describe('#Get Job Graph', function() {
    it('get job graph', function(done) {
      
      var param = {id: "0000000-160301150657385-oozie-oozi-W"},
          option = {};
      
      oozie.getJobGraph(param, option, function(err, res, body){
        console.log(err);
        console.log(res);
        console.log(body);
        
//        assert.equal(true, body.isArray());
        done();
      })
    });
  });
  */
  
/*  describe('#Get Job Info', function() {
    it('get job info', function(done) {
      
      var param = {id: "0000000-151005103631092-oozie-oozi-W"},
          option = {};
      
      oozie.getJobInfo(param, option, function(err, res, body){
        console.log(err);   
        console.log(body);
        
//        assert.equal(true, body.isArray());
        done();
      })
    });
  });
  */
/*  describe('#Get Job Definition', function() {
    it('get job definition', function(done) {
      
      var param = {id: "0000000-151005103631092-oozie-oozi-W"},
          option = {};
      
      oozie.getJobDefinition(param, option, function(err, res, body){
        console.log(err);
        console.log(body);
        
//        assert.equal(true, body.isArray());
        done();
      })
    });
  });*/
  
  
 /* describe('#Get Job Log', function() {
    it('get job Log', function(done) {
      
      var param = {id: "0000000-151005103631092-oozie-oozi-W"},
          option = {};
      
      oozie.getJobLog(param, option, function(err, res, body){
        console.log(err);
        console.log(body);
        
//        assert.equal(true, body.isArray());
        done();
      })
    });
  });*/
  
   /*describe('#Jobs', function() {
    it('get jobs', function(done) {
    
      The syntax for the filter is

      [NAME=VALUE][;NAME=VALUE]

      Valid filter names are:

          name: the application name from the workflow/coordinator/bundle definition
          user: the user that submitted the job
          group: the group for the job
          status: the status of the job
    
      
      var param = {},
          option = {};
      
//      var user = 'apps';
      var user = '',
          status = '',
          name = 'Tez_Coba';
      
      var filter = '';
      if(user){
        filter = filter + "user=" + user + ";";
      }
      
      if(status){
        filter = filter + "status=" + status + ";";
      }
      
      if(name){
        filter = filter + "name=" + name + ";";
      }
      
      option.qs = {
                    "filter": filter,
                    "offset":1,
                    "len": 50,
                    "timezone": "GMT"
                  };
      
      oozie.getJobs(param, option, function(err, res, body){
        console.log(err);
        console.log(body);
        
//        assert.equal(true, body.isArray());
        done();
      })
    });
  });*/
  
  
});


describe('Post', function() {
  describe('#Post Jobs', function() {
    it('post jobs', function(done) {
      var param = {},
          headers = {
            "content-type" : "application/xml"
          },
          option = {};
      
      /*data = {
                "configuration": [
                                    {
                                      "property": {"name": "user.name", "value": "bansalm"},
                                    },
                                    {
                                      "property": {"name": "oozie.wf.application.path", "value": "hdfs://foo:8020/user/bansalm/myapp/"}
                                    }
                                  ]   
             }*/
      
      //dummy xml
      data = '<?xml version="1.0" encoding="UTF-8"?><configuration><property><name>user.name</name><value>apps</value></property><property><name>oozie.use.system.libpath</name><value>true</value></property><property><name>oozie.libpath</name><value>hdfs://cassandra01.solusi247.com:8020/user/apps/lib/Solusi247lib</value></property><property><name>mapreduce.job.user.name</name><value>apps</value></property><property><name>queueName</name><value>default</value></property><property><name>nameNode</name><value>hdfs://cassandra01.solusi247.com:8020</value></property><property><name>jobTracker</name><value>cassandra01.solusi247.com:8030</value></property><property><name>oozie.wf.application.path</name><value>hdfs://cassandra01.solusi247.com:8020/user/apps/workflows/workflow.xml</value></property></configuration>';
      
      
      option.headers = headers;
      option.body = data;
//      option.body = jsonxml(data);
      
      oozie.jobs(param, option, function(err, res, body){
        console.log(err);
        console.log(res);
        console.log(body);
        
//        assert.equal(true, body.isArray());
        done();
      })
    });
  });
  
  
});

/*
describe('Put', function() {
  describe('#Update Jobs', function() {
    it('update jobs', function(done) {
      var param = {"id": "0000002-160216120548994-oozie-oozi-W"},
          headers = {},
          option = {};
      
      //A HTTP PUT request starts, suspends, resumes, kills, or dryruns a job.
      //Valid values for the 'action' parameter are 'start', 'suspend', 'resume', 'kill', 'dryrun', 'rerun', and 'change'.
      //response : 200 OK:
      
      var action = 'resume';
      
      option.qs = {"action": action}      
      
      oozie.job(param, option, function(err, res, body){
        console.log(err);
        console.log(res.statusCode);
        
//        assert.equal(true, body.isArray());
        done();
      })
    });
  });
  
  
});*/