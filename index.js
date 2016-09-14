var xml2js = require('xml2js');
var Hdfs = require('hdfs247');
var names = require('moniker');
var oseed = require('./seed.json');
var Apiclient = require('apiclient');
var Events = require('events').EventEmitter;

/**
 * Oozie class constructor
 * @param {Object} config Config object.
 */
function Oozie (config) {
  var self = this;
  this.xml = {};
  this.config = config;
  this.setName();

  oseed.base.protocol = config.node.oozie.protocol;
  oseed.base.hostname = config.node.oozie.hostname;
  oseed.base.port = config.node.oozie.port;

  this.rest = new Apiclient(oseed);

  if (config.artefact) {
    this.wfloc = config.artefact.workflow + '/' || '/user/' + config.node.hdfs.user + '/oozie-artefact/workflow/';
    this.jarloc = config.artefact.jar + '/' || '/user/' + config.node.hdfs.user + '/oozie-artefact/jar/';
  } else {
    this.wfloc = '/user/' + config.node.hdfs.user + '/oozie-artefact/workflow/';
    this.jarloc = '/user/' + config.node.hdfs.user + '/oozie-artefact/jar/';
  }

  this.hdfsConfig = {
    node: {
      protocol: config.node.hdfs.protocol || 'http',
      hostname: config.node.hdfs.hostname,
      port: config.node.hdfs.port || 50070,
    },
    user: config.node.hdfs.user,
    overwrite: config.node.hdfs.overwrite || true,
  };
  this.hdfsOpt = {
    'user.name': config.node.hdfs.user,
    overwrite: true
  };

  this.hdfs = new Hdfs(this.hdfsConfig.node);

  this.hdfs.mkdirs({path: this.wfloc, 'user.name': config.node.hdfs.user}, function (e, r, b) {
    if (e) {
      self.error = e;
      self.emit('error');
      throw e;
    }
    self.hdfs.mkdirs({path: self.jarloc, 'user.name': config.node.hdfs.user}, function (e, r, b) {
      if (e) {
        self.error = e;
        self.emit('error');
        throw e;
      }

      try {
        out = JSON.parse(b);
        self.emit('ready');
      } catch (er) {
        console.log(er);
        self.error = er.toString();
        self.emit('error');
      }
    });
  });
}

Oozie.prototype = new Events();
Oozie.prototype.constructor = Oozie;

/**
 * Set name of running job.
 * @param {String} name Name of job
 */
Oozie.prototype.setName = function (name) {
  if (!name) {
    this.name = names.choose();
  } else {
    this.name = name;
  }
  return this;
};

/**
 * get name of job.
 * @return {String} job name
 */
Oozie.prototype.getName = function () {
  return this.name;
};

/**
 * Set private property
 * @param {Object} property Property to be set.
 */
Oozie.prototype.setProperty = function (property) {
  if (property) {
    this.property = property;
  } else {
    this.property = this.getDefaultProperty();
  }

  return this;
  // simpan property ke this.property
};

/**
 * Generate oozie workflow-app
 * @param  {Array}   arg      Job workflow arguments
 * @param  {Object}   wfconfig Full workflow config
 * @param  {Function} cb       Callback function
 */
Oozie.prototype.genwf = function (arg, wfconfig, cb) {
  var fs = require('fs');
  var self = this;
  var tmp = require('tmp');
  var tmpfile = tmp.tmpNameSync();
  var xmlbuild = new xml2js.Builder({
    rootName: 'workflow-app',
  });
  if (wfconfig.action.hasOwnProperty('spark')) {
    var defaultxml = {
      $: {
        xmlns: 'uri:oozie:workflow:0.5',
        name: '${wfName}'
      },
      start: {
        $: {
          to: 'spark-node'
        }
      },
      action: {
        $: {
          name: 'spark-node'
        },
        spark: {
          'job-tracker': '${jobTracker}',
          'name-node': '${nameNode}',
          configuration: {
            property: {
              name: 'mapred.job.queue.name',
              value: '${queueName}'
            }
          },
          'master': '${clustername}',
          'name': wfconfig.name,
          'class': '${classname}',
          'jar': '${jarfile}',
          'spark-opts': {},
        },
        ok: {
          $: {
            to: 'end'
          }
        },
        error: {
          $: {
            to: 'fail'
          }
        }
      },
      kill: {
        $: {
          name: 'fail'
        },
        message: "Workflow failed, error          message[${wf:errorMessage(wf:lastErrorNode())}]      "
      },
      end: {
        $: {
          name: 'end'
        }
      }
    };
  }else{
    var defaultxml = {
      $: {
        xmlns: 'uri:oozie:workflow:0.2',
        name: '${wfName}'
      },
      start: {
        $: {
          to: 'java-node'
        }
      },
      action: {
        $: {
          name: 'java-node'
        },
        java: {
          'job-tracker': '${jobTracker}',
          'name-node': '${nameNode}',
          configuration: {
            property: {
              name: 'mapred.job.queue.name',
              value: '${queueName}'
            }
          },
          'main-class': '${main-class}',
          'java-opts': {},
          'capture-output': ''
        },
        ok: {
          $: {
            to: 'end'
          }
        },
        error: {
          $: {
            to: 'fail'
          }
        }
      },
      kill: {
        $: {
          name: 'fail'
        },
        message: "Workflow failed, error          message[${wf:errorMessage(wf:lastErrorNode())}]      "
      },
      end: {
        $: {
          name: 'end'
        }
      }
    };
  }
  var statxml = JSON.parse(JSON.stringify(defaultxml));

  var choosedName = this.name;

  if (wfconfig) {
    console.log(require('util').inspect(wfconfig, { depth: null }));
    statxml.$.name = wfconfig.name || choosedName;
    statxml.action = wfconfig.action || defaultxml.action;
    if(wfconfig.action.hasOwnProperty('spark')){
      statxml.action.spark = (wfconfig.action && wfconfig.action.spark) || defaultxml.action.spark;
    }else{
      statxml.action.java = (wfconfig.action && wfconfig.action.java) || defaultxml.action.java;
    }

    if (wfconfig.action.name) {
      statxml.action.$ = {
        name: wfconfig.action.name
      };
      delete statxml.action.name;
    }

    statxml.$.name = wfconfig.name || defaultxml.$.name;
    statxml.start.$.to = wfconfig.startTo || choosedName;

    if (wfconfig.action.okTo) {
      statxml.action.ok = { $: { to: wfconfig.action.okTo } };
    } else {
      statxml.action.ok = defaultxml.action.ok;
    }
    if (wfconfig.action.errorTo) {
      statxml.action.error = { $: { to: wfconfig.action.errorTo } };
    } else {
      statxml.action.error = defaultxml.action.error;
    }


    statxml.end.$.name = wfconfig.endName || defaultxml.end.$.name;
    statxml.kill.$.name = wfconfig.killName || defaultxml.kill.$.name;
    statxml.kill.message = wfconfig.killMessage || defaultxml.kill.message;
    if(wfconfig.action.hasOwnProperty('spark')){
      statxml.action.spark.arg = arg || wfconfig.action.spark.arg;    //FIXME: ini akan timbul error ketika tidak ada arg
    }else {
      statxml.action.java.arg = arg || wfconfig.action.java.arg;    //FIXME: ini akan timbul error ketika tidak ada arg
    }
  } else {
    statxml.$.name = choosedName;
    statxml.action.$.name = choosedName;
    statxml.start.$.to = choosedName;
    statxml.action.java.arg = arg;    //FIXME: ini akan timbul error ketika tidak ada arg
  }
  if(wfconfig.action.hasOwnProperty('spark')){
    statxml.action.spark.jar = '${nameNode}' + this.jarloc + '${namajar}';
  }else {
    statxml.action.java.file = '${nameNode}' + this.jarloc + '${namajar}';
  }

  // console.log(wfconfig);
  var xml = xmlbuild.buildObject(statxml);
  this.workflow = statxml;
  this.xml.workflow = xml;
  console.log(xml);
  // console.log(statxml);
  var hdfsOpt = JSON.parse(JSON.stringify(this.hdfsOpt));

  hdfsOpt.localpath = tmpfile;
  hdfsOpt.path = this.wfloc + choosedName + '.xml';

  fs.writeFile(tmpfile, xml, function writeFilecb (err) {
    if (err) { throw err; } else {
      self.hdfs.upload(hdfsOpt, function (e, r, b) {
        if (e || r.statusCode != '200') {
          console.error(r);
          console.error(b);
          if(e){
            self.error = e;
            self.emit('error');
            cb(e);
          }else{
            self.error = b;
            self.emit('error');
            cb(b);
          }
        } else {
          fs.unlinkSync(tmpfile);
          self.wffile = self.wfloc + choosedName + '.xml';
          self.emit('wfReady');
          cb(null, self.wfloc + choosedName + '.xml');
        }
      });
    }
  });
  self.emit('wfGenerated');
  return this;
};
/**
 * Generate oozie coordinator-app
 * @param  {Object}   coordconfig Full coordinator config
 * @param  {Function} cb       Callback function
 */
Oozie.prototype.gencoord = function (coordconfig, cb) {
  var fs = require('fs');
  var self = this;
  var tmp = require('tmp');
  var tmpfile = tmp.tmpNameSync();
  var xmlbuild = new xml2js.Builder({
    rootName: 'coordinator-app',
  });

  var defaultxml = {
    $: {
      xmlns: 'uri:oozie:coordinator:0.2',
      name: '${sahyung-coord}',
      frequency: '${freq}',
      start: '${start}',
      end: '${end}',
      timezone: 'UTC'
    },
    action: {
      workflow: {
        'app-path': '${workflowAppUri}',
        configuration: {
          property: [
            {
              name: 'mapred.job.queue.name',
              value: '${queueName}'
            },
            {
              name: 'jobTracker',
              value: '${jobTracker}'
            },
            {
              name: 'nameNode',
              value: '${nameNode}'
            }
          ]
        }
      },
    },
  };
  var statxml = JSON.parse(JSON.stringify(defaultxml));

  var choosedName = this.name;

  if (coordconfig) {
    console.log(require('util').inspect(coordconfig, { depth: null }));
    statxml.$.name = coordconfig.name || choosedName;
    statxml.action = coordconfig.action || defaultxml.action;
    statxml.action.workflow = (coordconfig.workflow && coordconfig.action.workflow) || defaultxml.action.workflow;

    if (coordconfig.action.name) {
      statxml.action.$ = {
        name: coordconfig.action.name
      };
      delete statxml.action.name;
    }
  } else {
    statxml.$.name = choosedName;
  }

  var xml = xmlbuild.buildObject(statxml);
  this.workflow = statxml;
  this.xml.workflow = xml;
  var hdfsOpt = JSON.parse(JSON.stringify(this.hdfsOpt));

  hdfsOpt.localpath = tmpfile;
  hdfsOpt.path = this.wfloc + choosedName + '.xml';


  fs.writeFile(tmpfile, xml, function writeFilecb (err) {
    if (err) { throw err; } else {
      self.hdfs.upload(hdfsOpt, function (e, r, b) {
        if (e || r.statusCode != '200') {
          console.error(r);
          console.error(b);
          if(e){
            self.error = e;
            self.emit('coordError');
            cb(e);
          }else{
            self.error = b;
            self.emit('coordError');
            cb(b);
          }
        } else {
          fs.unlinkSync(tmpfile);
          self.wffile = self.wfloc + choosedName + '.xml';
          self.emit('coordReady');
          cb(null, self.wfloc + choosedName + '.xml');
        }
      });
    }
  });
  self.emit('coordGenerated');
  return this;
};

/**
 * Get default property
 * @return {Object} Default property object.
 */
Oozie.prototype.getDefaultProperty = function () {
  var url = require('url');

  var hdfsurl = JSON.parse(JSON.stringify(this.config.node.nameNode));
  hdfsurl.protocol = 'hdfs';
  hdfsurl.slashes = true;

  return {
    property: [
      {
        name: 'nameNode',
        value: url.format(hdfsurl)
      },
      {
        name: 'jobTracker',
        value: this.config.node.jobTracker.hostname + ':' + this.config.node.jobTracker.port
      },
      {
        name: 'oozie.use.system.libpath',
        value: true
      },
      {
        name: 'oozie.libpath',
        value: '${nameNode}' + this.config.libpath
      },
      {
        name: 'queueName',
        value: this.config.queueName
      },
      {
        name: 'user.name',
        value: this.config.node.oozie.user
      },
      {
        name: 'mapreduce.job.queuename',
        value: '${queueName}'
      },
      {
        name: 'mapred.job.queue.name',
        value: '${queueName}'
      }
    ]
  };
};

/**
 * Get default workflow
 * @return {Object} Default workflow object.
 */
Oozie.prototype.getDefaultWorkflow = function () {
  var wfconfig = {
    name: this.name,
    startTo: this.name,  // ini node action, bisa dikosongkan.
    endName: 'end',
    killName: 'fail',
    killMessage: 'Workflow failed, error message[${wf:errorMessage(wf:lastErrorNode())}]',  // pesan error ketika gagal.
    action: {
      name: this.name,  // action name bisa dikosongkan.
      java: {     // ini kalau action ini menjalankan aplikasi java, selain java belum
        'job-tracker': '${jobTracker}',
        'name-node': '${nameNode}',
        configuration: {
          property: [{
            name: 'mapred.job.queue.name',
            value: '${queueName}'
          }]
        },
        'main-class': '${classname}', // class ambil dari input
        'java-opts': [],
        arg: [                        // argument ambil dari input
          '/biasanya/path/ke/input',
          '/biasanya/path/ke/output'
        ],
        file: 'file.jar'  // nama file-nya ambil dari input, lokasi jar didefinisikan saat new oozie.
      }
    }
  };

  return wfconfig;
};

Oozie.prototype.getDefaultCoord = function () {
  var coordconfig = {
    name: 'coord-'+this.name,
    startTo: this.name,  // ini node action, bisa dikosongkan.
    endName: 'end',
    killName: 'fail',
    killMessage: 'Coordinator failed, error message[${wf:errorMessage(wf:lastErrorNode())}]',  // pesan error ketika gagal.
    action: {
      name: this.name,  // action name bisa dikosongkan.
      frequency: '${freq}',
      start: '${start}',
      end: '${end}',
      timezone: 'UTC',
      workflow: {
        'app-path': '${workflowAppUri}',
        configuration: {
            property: [
              {
                name: 'jobTracker',
                value: '${jobTracker}'
              },
              {
                name: 'nameNode',
                value: '${nameNode}'
              },
              {
                name: 'queueName',
                value: '${queueName}'
              }
            ]
        }
      }
    }
  };

  return coordconfig;
};

/**
 * submit job to oozie
 * @param  {String}   type       Type of submitted job
 * @param  {String}   name       Name of job, set to random if null
 * @param  {String}   jobfile    Name of file, only name without path, path have been set on constructor.
 * @param  {String}   className  Class path of job.
 * @param  {Array}    arg        Array of job arguments, set empty array to set no argument.
 * @param  {Array}    prop       Array of object properties, this array will be concatenated to default properties, set empty array if using default properties only.
 * @param  {Object}   wfconfig   Object of custom workflow config
 * @param  {Function} cb         Callback function.
 */
Oozie.prototype.submit = function (type, name, jobfile, className, arg, prop, wfconfig, cb) {
  var self = this;
  var propraw = this.getDefaultProperty(), wfraw,
    xmlbuild = new xml2js.Builder({
      rootName: 'configuration'
    });

  propraw.property = propraw.property.concat(prop);   // FIXME: this lead to duplicate key.
  if (name) {
    this.name = name;
  }

  if (wfconfig) {
    wfraw = wfconfig;
  } else {
    wfraw = this.getDefaultWorkflow();
  }

  if (this.name) {
    wfraw.name = this.name;
    wfraw.startTo = this.name;
    wfraw.action.name = this.name;
  }

  switch (type) {
    case 'spark':
      if (wfraw.action.spark) {
        wfraw.action.spark.arg = arg;
        wfraw.action.spark.jar = jobfile;
      }
    break;

    default:
      // wfraw.action.java['main-class'] = className;
      if (wfraw.action.java) {
        wfraw.action.java.arg = arg;
        wfraw.action.java.file = jobfile;
      }
  }

  if (process.env.NODE_ENV === 'development') {
    console.trace(propraw);
  }

  this.genwf(null, wfraw, function (err, path) {
    if (err) { throw err; } else {
      propraw.property.push({
        name: 'oozie.wf.application.path',
        value: path
      });
      propraw.property.push({
        name: 'classname',
        value: className
      });
      propraw.property.push({
        name: 'namajar',
        value: jobfile
      });
      switch (type) {
        case 'spark':
          propraw.property.push({
            name: 'sparkname',
            value: wfraw.name
          });
          break;
        default:
        //XXX: moved to line 607
          // if (wfraw.action.java) {
            // propraw.property.push({
            //   name: 'oozie.wf.application.path',
            //   value: path
            // });
            // propraw.property.push({
            //   name: 'namajar',
            //   value: jobfile
            // });
            // propraw.property.push({
            //   name: 'classname',
            //   value: className
            // });
          // }
      }

      self.property = propraw;
      self.xml.property = xmlbuild.buildObject(propraw);

      if (process.env.NODE_ENV === 'development') {
        console.trace(xmlbuild.buildObject(propraw));
      }
      self.rest.post('jobs', {}, {
        body: xmlbuild.buildObject(propraw),
        headers: {
          'Content-Type': 'application/xml;charset=UTF-8'
        }
      }, function (e, r, b) {
        if (process.env.NODE_ENV === 'development') {
          // console.trace(require('util').inspect(r, { depth: null }));
        }
        if (e) {
          self.error = e;
          self.emit('error');
        } else {
          var out;
          try {
            out = JSON.parse(b);
            self.jobid = out.id;
            self.emit('jobSubmitted');
          } catch (er) {
            self.error = r.caseless.dict['oozie-error-message'];
            console.log(self.error);debugger
            self.emit('error');
          }
        }
      });
    }
  });
  // butuh workflow dan properties
  // workflow harus sudah ada di hdfs
  // properties harus sesuai dengan workflow
  // workflow harus tahu lokasi file jar
  // untuk sekarang ignore type
};

/**
 * submit coordinator to oozie
 * @param  {String}   name       Name of job, set to random if null
 * @param  {Array}    prop       Array of object properties, this array will be concatenated to default properties, set empty array if using default properties only.
 * @param  {Object}   coordconfig   Object of custom workflow config
 * @param  {Function} cb         Callback function.
 */
Oozie.prototype.submitcoord = function (type, name, jobfile, className, arg, prop, coordconfig, cb) {
  var self = this;
  var propraw = this.getDefaultProperty(), coordraw,
    xmlbuild = new xml2js.Builder({
      rootName: 'configuration'
    });

  propraw.property = propraw.property.concat(prop);   // FIXME: this lead to duplicate key.

  if (name) {
    this.name = name;
  }

  if (coordconfig) {
    coordraw = coordconfig;
  } else {
    coordraw = this.getDefaultCoord();
  }

  if (this.name) {
    coordraw.name = this.name;
  }

  if (process.env.NODE_ENV === 'development') {
    console.trace('propraw');
    console.trace(propraw);
  }
  // console.log('coordraw');
  // console.log(coordraw);

  this.gencoord(coordraw, function (err, path) {
    if (err) { console.log('cekidot'); throw err; } else {
      if (coordraw.action.workflow) {
        propraw.property.push({
          name: 'oozie.coord.application.path',
          value: path
        });
        propraw.property.push({
          name: 'namajar',
          value: jobfile
        });
        propraw.property.push({
          name: 'classname',
          value: className
        });
      }
      console.log(propraw);

      self.property = propraw;
      self.xml.property = xmlbuild.buildObject(propraw);

      if (process.env.NODE_ENV === 'development') {
        console.trace(xmlbuild.buildObject(propraw));
      }
      console.log('(propraw)');
      console.log((propraw));
      self.rest.post('jobs', {}, {
        body: xmlbuild.buildObject(propraw),
        headers: {
          'Content-Type': 'application/xml;charset=UTF-8'
        }
      }, function (e, r, b) {
        if (process.env.NODE_ENV === 'development') {
          console.trace(require('util').inspect(r, { depth: null }));
        }
        if (e) { console.log('sini cuy'); cb(e);} else {
          var out;
          try {
            out = JSON.parse(b);
            self.jobid = out.id;
            self.emit('coordSubmitted');
            // cb(null, out);
          } catch (er) {
            self.error = r.caseless.dict['oozie-error-message'];
            self.emit('coordError');
            // cb(null, b);
          }
        }
      });
    }
  });
};

/**
 * Response default for start, rerun, get.
 * @param  {Object} e Error Object from request.
 * @param  {Object} r Response Object from request.
 * @param  {Mixed} b Response body from request.
 */
function defaultResponse(e, r, b) {
  if (process.env.NODE_ENV === 'development') {
    // console.trace(require('util').inspect(r, { depth: null }));
  }
  if (e) { throw e; }
}

/**
 * Start Job
 * @param  {String} jobid Job ID to be Start.
 */
Oozie.prototype.start = function (jobid) {
  var self = this, id;

  if (jobid) {
    id = jobid;
  } else {
    id = this.jobid;
  }

  this.rest.put('job', {id: id}, {
    qs: {
      action: 'start'
    }
  }, function (e, r, b) {
    if (e) {
      self.error = e;
      self.emit('error');
    } else {
      if (r.statusCode == '200'){
        self.emit('started');
      }else{
        self.error = r.caseless.dict['oozie-error-message'];
        self.emit('error');
      }
    }
  });
};

/**
 * Kill Job
 * @param  {String} jobid Job ID to be Killed.
 */
Oozie.prototype.kill = function (jobid) {
  var self = this, id;

  if (jobid) {
    id = jobid;
  } else {
    id = this.jobid;
  }

  this.rest.put('job', {id: id}, {
    qs: {
      action: 'kill'
    }
  }, function (e,r,b){
    if (r.statusCode == '200'){
      self.emit('killed');
    }else{
      self.error = r.caseless.dict['oozie-error-message'];
      self.emit('error');
    }
  });
};

/**
 * Suspend Job
 * @param  {String} jobid Job ID to be Suspended.
 */
Oozie.prototype.suspend = function (jobid) {
  var self = this, id;

  if (jobid) {
    id = jobid;
  } else {
    id = this.jobid;
  }

  this.rest.put('job', {id: id}, {
    qs: {
      action: 'suspend'
    }
  }, function (e,r,b){
    if (r.statusCode == '200'){
      self.emit('suspended');
    }else{
      self.error = r.caseless.dict['oozie-error-message'];
      self.emit('error');
    }
  });
};

/**
 * Resume Job
 * @param  {String} jobid Job ID to be Resumed.
 */
Oozie.prototype.resume = function (jobid) {
  var self = this, id;

  if (jobid) {
    id = jobid;
  } else {
    id = this.jobid;
  }

  this.rest.put('job', {id: id}, {
    qs: {
      action: 'resume'
    }
  }, function (e,r,b){
    if (r.statusCode == '200'){
      self.emit('resumed');
    }else{
      self.error = r.caseless.dict['oozie-error-message'];
      self.emit('error');
    }
  });
};

/**
 * Re running job, identified by jobid.
 * @param  {String} jobid Job id that needed to run.
 */
Oozie.prototype.rerun = function (jobid) {
  // TODO: add property alternative as parameter. each property must be unique.
  var self = this, id;

  if (jobid) {
    id = jobid;
  } else {
    id = this.jobid;
  }

  this.rest.put('job', {id: id}, {
    qs: {
      action: 'rerun'
    },
    body: self.xml.property
  }, defaultResponse);
};

/**
 * Get job info identified by jobId.
 * @param  {String}   jobid Job Id that needed to get.
 */
Oozie.prototype.get = function (jobid) {
  var self = this, id, info;

  if (jobid) {
    id = jobid;
  } else {
    id = this.jobid;
  }

  this.rest.get('jobInfo', {id: id}, {}, function (e, r, b) {
    if (process.env.NODE_ENV === 'development') {
      // console.trace(require('util').inspect(r, { depth: null }));
    }
    if (e) {
      self.error = e;
      self.emit('error');
    } else {
      try {
        info = JSON.parse(b);
        self.info = info;
        self.emit('infoReady');
      } catch (er) {
        self.error = r.caseless.dict['oozie-error-message'];
        self.emit('error');
      }
    }
  });
};

exports = module.exports = Oozie;
