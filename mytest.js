var Oozie = require('./index.js');

// var wfconfig = {
//   // name: '${wfName}',
//   // startTo: 'terserah-biasanya-ada-node',  // ini node action, bisa dikosongkan.
//   endName: 'end',
//   killName: 'fail',
//   killMessage: 'Workflow failed, error message[${wf:errorMessage(wf:lastErrorNode())}]',  // pesan error ketika gagal.
//   action: {
//     // name: 'terserah-biasanya-ada-node',  // action name bisa dikosongkan.
//     java: {                             // ini kalau action ini menjalankan aplikasi java, selain java belum
//       'job-tracker': '${jobTracker}',   // property yang ada di dalam java harus lengkap, minimal seperti ini.
//       'name-node': '${nameNode}',
//       configuration: {
//         property: [{
//           name: 'mapred.job.queue.name',
//           value: '${queueName}'
//         }]
//       },
//       'main-class': '${classname}',
//       'java-opts': [],
//       arg: [
//         '/user/apps/asep/testin.txt',
//         '/user/apps/asep/output'
//       ],
//       // file: 'file.jar'  // lokasi jar didefinisikan saat new oozie.
//     }
//   }
// };

var config = {
  node: {
    hdfs: {
      protocol: 'http',
      hostname: 'yava230.solusi247.com',
      port: 50070,
      user: 'yava',
      overwrite: true
    },
    jobTracker: {
      protocol: 'http',
      hostname: 'yava231.solusi247.com',
      port: 8050
    },
    nameNode: {
      hostname: 'yava230.solusi247.com',
      port: 8020
    },
    oozie: {
      protocol: 'http',
      hostname: 'yava231.solusi247.com',
      port: 11000,
      user: 'yava'
    }
  },
  libpath: '/user/yava/spark',
  queueName: 'default',
  artefact: {
    jar: '/user/yava/java/lib',
    workflow: '/user/yava/java/lib'
  }
};



var sparkconfig = {
  // name: '${wfName}',
  // startTo: 'terserah-biasanya-ada-node',  // ini node action, bisa dikosongkan.
  endName: 'end',
  killName: 'fail',
  killMessage: 'Workflow failed, error message[${wf:errorMessage(wf:lastErrorNode())}]',  // pesan error ketika gagal.
  action: {
    // name: 'terserah-biasanya-ada-node',  // action name bisa dikosongkan.
    spark: {
      $: {
        xmlns: 'uri:oozie:spark-action:0.1'
      },                             // ini kalau action ini menjalankan aplikasi java, selain java belum
      'job-tracker': '${jobTracker}',   // property yang ada di dalam java harus lengkap, minimal seperti ini.
      'name-node': '${nameNode}',
      configuration: {
        property: [
          {
            name: 'mapred.job.queue.name',
            value: '${queueName}'
          },
          {
            name: 'oozie.launcher.mapred.job.queue.name',
            value: config.node.oozie.user
          },
          // {
          //   name: 'oozie.launcher.mapreduce.map.memory.mb',
          //   value: '1024'
          // },
          // {
          //   name: 'oozie.launcher.mapreduce.map.java.opts',
          //   value: '-Xmx1024m'
          // }
        ]
      },
      'master': '${clustername}',
      'name': '${sparkname}',
      'class': '${classname}',
      'jar': '${jarfile}',
      'spark-opts': ['--conf spark.driver.userClassPathFirst=true --executor-memory 512m --num-executors 1 --driver-memory 512m --executor-cores 1 --conf spark.driver.userClassPathFirst=true'],
      arg: [
        //'/user/research/sparkDM/sparkChurnPredictionHDFS6.xml'
      ],
    }
  }
};

// var coordconfig = {
//   frequency: '${freq}',
//   start: '${start}',
//   end: '${end}',
//   timezone: 'UTC',
//   action: {
//     // name: this.name,  // action name bisa dikosongkan.
//     workflow: {
//       'app-path': '${workflowAppUri}',
//       configuration: {
//           property: [
//             {
//               name: 'jobTracker',
//               value: '${jobTracker}'
//             },
//             {
//               name: 'nameNode',
//               value: '${nameNode}'
//             },
//             {
//               name: 'queueName',
//               value: '${queueName}'
//             }
//           ]
//       }
//     }
//   }
// };
//

var subject01 = new Oozie(config);
// var coord01 = new Oozie(config);

subject01.once('ready', function() {
  subject01.submit('spark', null, 'sparkWrapper.jar', 'com.solusi247.sparkWrapper.run.SparkWrapper', ['/user/yava/java/lib/twett.xml'], [
    {
      name: 'oozie.launcher.mapreduce.map.memory.mb',
      value: '512'
    },
    {
      name: 'oozie.launcher.mapreduce.map.java.opts',
      value: '-Xmx512m'
    },
    {
      name: 'clustername',
      value: 'yarn-cluster'
    },
    {
      name: 'oozie.action.sharelib.for.spark',
      value: '/user/oozie/share/lib/lib_20160808161636/spark'
    }
  ], sparkconfig);
  // subject01.get('0000283-160822154804622-oozie-oozi-C');
  // subject01.get('0000333-160822154804622-oozie-oozi-W');
});
subject01.once('jobSubmitted',function(){
  console.log(subject01.jobid);
  subject01.start(subject01.jobid);
});
subject01.once('error',function(){
  console.log(subject01.error);
});

// subject01.once('jobSubmitted', function () {
//   coord01.submitcoord('java', null, 'casetwo.jar', 'dummy.casetwo', [], [
//     {
//       name: 'freq',
//       value: '60'
//     },{
//       name: 'workflowAppUri',
//       value: subject01.wffile
//     },{
//       name: 'start',
//       value: '2016-08-22T00:00Z'
//     },{
//       name: 'end',
//       value: '2016-08-22T23:00Z'
//     }
//   ], coordconfig);
// });
//
// coord01.once('coordSubmitted', function () {
//   console.log('berhasil submit');
//   console.log(coord01.jobid);
// });
//
// coord01.on('coordError', function () {
//   console.log(coord01.error);
// });
