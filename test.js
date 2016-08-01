/* jslint esversion: 6 */
var Oozie = require('./index.js');
var assert = require('assert');

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
        '/user/apps/asep/testin.txt',
        '/user/apps/asep/output'
      ],
      // file: 'file.jar'  // lokasi jar didefinisikan saat new oozie.
    }
  }
};

var config = {
  node: {
    hdfs: {
      protocol: 'http',
      hostname: '192.168.1.225',
      port: 50070,
      user: 'apps',
      overwrite: true
    },
    jobTracker: {
      protocol: 'http',
      hostname: '192.168.1.225',
      port: 8032
    },
    nameNode: {
      hostname: '192.168.1.225',
      port: 8020
    },
    oozie: {
      protocol: 'http',
      hostname: '192.168.1.225',
      port: 11000,
      user: 'apps'
    }
  },
  libpath: '/user/apps/lib/247',
  queueName: 'root.default',
  artefact: {
    jar: '/user/apps/oozie-artefact/jar/',
    workflow: '/user/apps/oozie-artefact/workflow/'
  }
};


var subject01 = new Oozie(config);
var subject02 = new Oozie(config);
var subject03 = new Oozie(config);  // for defining events.
var subject04 = new Oozie(config);  // for defining events.

// oozie.on('ready', function () {
//   console.log('siap.');
// });

describe('Submit Job', function () {
  describe(`subject01: Submit job from custom defined workflow config.
            Workflow config can be defined from outside, despite it's default to java`, function () {
    it('Should submit job using custom config, with result of job id', function (done) {
      subject01.on('ready', function () {
        subject01.submit('java', null, 'casetwo.jar', 'dummy.casetwo', [], [{
          name: 'namajar',
          value: 'casetwo.jar'
        }], wfconfig);
      });
      subject01.on('jobSubmitted', function () {
        console.log(subject01.jobid);
        assert(subject01.jobid);
        done();
      });
    });
  });

  describe(`subject02: Submit job using default workflow java config.
            This way, we can define our java job only using classname, filename,
            and arguments.`, function () {
    it('Should submit job using default config, with result of job id', function (done) {
      subject02.on('ready', function () {
        subject02.submit('java', null, 'casetwo.jar', 'dummy.casetwo', [], [{
          name: 'namajar',
          value: 'casetwo.jar'
        }]);
        subject02.on('jobSubmitted', function () {
          console.log(subject02.jobid);
          assert(subject02.jobid);
          done();
        });
      });
    });
  });
});

subject03.on('ready', function () {
  subject03.submit('java', null, 'casetwo.jar', 'dummy.casetwo', [], [{
    name: 'namajar',
    value: 'casetwo.jar'
  }]);
  subject03.on('jobSubmitted', function () {
    console.log(subject01.jobid);
    assert(subject01.jobid);
    done();
  });
});

describe('Events that occured during job definition lifecycle.', function () {
  describe('ready: This event will emitted when directory created in HDFS.', function () {
    it('Should emit when Oozie class ready to receive job.', function (done) {
      var timeout = setTimeout(function () {
        assert(false, 'Oozie fail to emit Ready.');
        done();
      }, 2000);

      subject04.on('ready', function () {
        subject04.submit('java', null, 'casetwo.jar', 'dummy.casetwo', [], [{
          name: 'namajar',
          value: 'casetwo.jar'
        }]);

        clearTimeout(timeout);
        assert(true);
        done();
      });
    });
  });
  describe('wfGenerated: This event will emitted when workflow are generarated in memory.', function () {
    it('Should emit wfGenerated event when workflow already generated in memory.', function (done) {
      var timeout = setTimeout(function () {
        assert(false, 'Oozie fail to emit wfGenerated.');
        done();
      }, 2000);

      subject01.on('wfGenerated', function () {
        clearTimeout(timeout);
        assert(true);
        assert(subject01.xml.workflow);
        done();
      });
    });
  });
  describe('wfReady: This event will emitted when workflow are uploaded to HDFS.', function () {
    it('Should emit wfReady event when workflow already uploaded to HDFS.', function (done) {
      var timeout = setTimeout(function () {
        assert(false, 'Oozie fail to emit wfReady.');
        done();
      }, 2000);

      subject01.on('wfReady', function () {
        clearTimeout(timeout);
        assert(true);
        done();
      });
    });
  });
  describe('jobSubmitted: This event will emitted when jobs are submitted to oozie.', function () {
    it('Should emit jobSubmitted event when workflow successfuly submitted to oozie.', function (done) {
      var timeout = setTimeout(function () {
        assert(false, 'Oozie fail to emit jobSubmitted.');
        done();
      }, 2000);

      subject04.
      subject04.on('jobSubmitted', function () {
        clearTimeout(timeout);
        subject04.get();
        assert(true);
        assert(subject04.jobid);
        done();
      });
    });
  });
  describe('infoReady: This event will emitted when job info already get.', function () {
    it('Should emit infoReady when success retrieving job from oozie.', function (done) {
      var timeout = setTimeout(function () {
        assert(false, 'Oozie fail to emit infoReady.');
        done();
      }, 2000);

      subject04.on('infoReady', function () {
        clearTimeout(timeout);
        assert(true);
        assert(subject04.info);
        done();
      });

      // subject02.on('jobSubmitted', function () {
      //   subject02.get();
      //   subject02.on('infoReady', function () {
      //     clearTimeout(timeout);
      //     assert(true);
      //     assert(subject02.info);
      //     done();
      //   });
      // });
    });
  });
});
// oozie.on('ready', function () {
//   // console.log(oozie);
//   oozie.submit('java', null, 'casetwo.jar', 'dummy.casetwo', [
//     '/user/apps/asep/testin.txt', '/user/apps/asep/output'], [{
//     name: 'namajar',
//     value: 'casetwo.jar'
//   }]);
//   oozie.on('wfGenerated', function () {
//     console.log('hei');
//     // console.trace(require('util').inspect(oozie.workflow, { depth: null }));
//   });
// });
//
// oozie.on('jobSubmitted', function () {
//   oozie.get();
// });
// oozie.on('infoReady', function () {
//   // console.log('test');
//   console.log(oozie.info);
// });
//
// oozie.on('jobSubmitted', function () {
//   oozie.start();
// });

// oozie.rerun('jobid');
// oozie.coordinator();

// oozie.genwf(['satu', 'dua'], {}, function (err) {
//   console.log(err);
// });
