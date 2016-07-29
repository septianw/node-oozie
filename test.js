var Oozie = require('./index.js');

var wfconfig = {
  // name: '${wfName}',
  // startTo: 'terserah-biasanya-ada-node',  // ini node action, bisa dikosongkan.
  endName: 'end',
  killName: 'fail',
  killMessage: 'Workflow failed, error message[${wf:errorMessage(wf:lastErrorNode())}]',  // pesan error ketika gagal.
  action: {
    // name: 'terserah-biasanya-ada-node',  // action name bisa dikosongkan.
    java: {     // ini kalau action ini menjalankan aplikasi java, selain java belum
      'job-tracker': '${jobTracker}',
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


var oozie = new Oozie(config);

// oozie.on('ready', function () {
//   console.log('siap.');
// });

oozie.on('ready', function () {
  // console.log(oozie);
  oozie.submit('java', null, 'casetwo.jar', 'dummy.casetwo', [], [{
    name: 'namajar',
    value: 'casetwo.jar'
  }], wfconfig);
  oozie.on('wfGenerated', function () {
    console.log('hei');
    // console.trace(require('util').inspect(oozie.workflow, { depth: null }));
  });
});

oozie.on('jobSubmitted', function () {
  oozie.get();
});
oozie.on('infoReady', function () {
  // console.log('test');
  console.log(oozie.info);
});

oozie.on('jobSubmitted', function () {
  oozie.start();
});

// oozie.rerun('jobid');
// oozie.coordinator();

// oozie.genwf(['satu', 'dua'], {}, function (err) {
//   console.log(err);
// });
