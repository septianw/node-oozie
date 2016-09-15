/* jslint esversion: 6 */
var Oozie = require('./index.js');
var assert = require('assert');

var config = {
  node: {
    hdfs: {
      protocol: 'http',
      hostname: 'yava.solusi247.com',
      port: 50070,
      user: 'yava',
      overwrite: true
    },
    jobTracker: {
      protocol: 'http',
      hostname: 'yava.solusi247.com',
      port: 8050
    },
    nameNode: {
      hostname: 'yava.solusi247.com',
      port: 8020
    },
    oozie: {
      protocol: 'http',
      hostname: 'yava.solusi247.com',
      port: 11000,
      user: 'yava'
    }
  },
  libpath: '/user/yava/lib/247',
  queueName: 'default',
  artefact: {
    jar: '/user/yava/oozie-artefact/jar',
    workflow: '/user/yava/oozie-artefact/workflow'
  }
};

var wfconfig = {
  // name: '${wfName}',
  // startTo: 'terserah-biasanya-ada-node',  // ini node action, bisa dikosongkan.
  endName: 'end',
  killName: 'fail',
  killMessage: 'Workflow failed, error message[${wf:errorMessage(wf:lastErrorNode())}]',  // pesan error ketika gagal.
  action: {
    // name: 'terserah-biasanya-ada-node',  // action name bisa dikosongkan.
    java: {                             // ini kalau action ini menjalankan aplikasi java, selain java belum
      'job-tracker': '${jobTracker}',   // property yang ada di dalam java harus lengkap, minimal seperti ini.
      'name-node': '${nameNode}',
      configuration: {
        property: [{
          name: 'mapred.job.queue.name',
          value: '${queueName}'
        }]
      },
      'main-class': '${classname}',
      'java-opts': [],
      arg: [
        '/user/yava/asep/testin.txt',
        '/user/yava/asep/output'
      ],
      file: ''
    }
  }
};

describe('node-oozie test file', function () {
  // describe('ready: This event will emitted when directory created in HDFS.', function () {
  //   it('Should emit when Oozie class ready to receive job.', function (done) {
  //     var readyFired = false;
  //     setTimeout(function () {
  //       assert(readyFired, 'Oozie fail to emit Ready.');
  //       done();
  //     }, 10000);
  //
  //
  //     subject03.on('ready', function () {
  //       readyFired = true;
  //     });
  //   });
  // });
  var subject01 = new Oozie(config);

  describe('submit java type job', function () {
    it('Should submit workflow to oozie but not run.', function (done) {

      subject01.on('ready', function () {
        subject01.submit('java', null, 'casetwo.jar', 'dummy.casetwo', [], [{
          name: 'namajar',
          value: 'casetwo.jar'
        }]);
      });

      subject01.on('jobSubmitted', function () {
        console.log(subject01.jobid);
        assert(subject01.jobid);
        done();
      });

    });

    it('Should run the submitted job.', function (done) {
      subject01.start(subject01.jobid);

      subject01.on('started', function(){
        assert(true);
        done();
      });
    });

    it('Should get info the submitted job.', function (done) {
      subject01.get(subject01.jobid);
      subject01.on('infoReady', function(){
        console.log(subject01.info);
        assert(true);
        done();
      });
    });

    it('Should suspend the submitted job.', function (done) {
      subject01.suspend(subject01.jobid);

      subject01.on('suspended', function(){
        assert(true);
        done();
      });
    });

    it('Should resume the suspended job.', function (done) {
      subject01.resume(subject01.jobid);

      subject01.on('resumed', function(){
        assert(true);
        done();
      });
    });

    it('Should kill the running/resumed job.', function (done) {
      subject01.kill(subject01.jobid);

      subject01.on('killed', function(){
        assert(true);
        done();
      });
    });

    it('Should rerun the killed/success job with same property.', function (done) {
      subject01.rerun(subject01.jobid);

      subject01.on('reruned', function(){
        assert(true);
        done();
      });
      subject01.once('error:rerun',function(){
        console.log('error rerun');
        console.log(subject01.error);
        done();
      });
    });

    it('Should rerun the killed/success job with different property.');

    // subject01.on('error',function(){
    //   console.log(subject01.error);
    //   done();
    // });

  });
});
