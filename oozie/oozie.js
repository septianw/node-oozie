var Api = require('apiclient'),
    seed = require('./seed.json');

function Oozie(data){
  seed.base.protocol = data.protocol;
  seed.base.hostname = data.hostname;
  seed.base.port = data.port;
  
 var rest = new Api(seed);
  
  this.send = function (method, endpoint, param, option, callback) {
    option.followAllRedirects = true;
    rest[method](endpoint, param, option, callback);
  };
}

//get methode
Oozie.prototype.getVersions = function (param, option, callback){
  this.send('get', 'versions', param, option, callback);
}

Oozie.prototype.getAdminStatus = function (param, option, callback){
  this.send('get', 'adminStatus', param, option, callback);
}

Oozie.prototype.getOsEnv = function (param, option, callback){  
  this.send('get', 'OsEnv', param, option, callback);
}

Oozie.prototype.getJavaSysProperties = function (param, option, callback){  
  this.send('get', 'javaSysProperties', param, option, callback);
}

Oozie.prototype.getConfiguration = function (param, option, callback){
  this.send('get', 'configuration', param, option, callback);
}

Oozie.prototype.getInstrumentation = function (param, option, callback){
  this.send('get', 'instrumentation', param, option, callback);
}

Oozie.prototype.getBuildVersion = function (param, option, callback){
  this.send('get', 'buildVersion', param, option, callback);
}

Oozie.prototype.getAvailableTimezones = function (param, option, callback){
  this.send('get', 'availableTimezones', param, option, callback);
}

Oozie.prototype.getQueueDump = function (param, option, callback){
  this.send('get', 'queueDump', param, option, callback);
}

Oozie.prototype.getJobGraph = function (param, option, callback){
  //set no option, format GET /oozie/v1/job/job-3?show=graph[&show-kill=true]
  this.send('get', 'jobGraph', param, option, callback);
}

Oozie.prototype.getJobInfo = function (param, option, callback){
  this.send('get', 'jobInfo', param, option, callback);
}

Oozie.prototype.getJobDefinition = function (param, option, callback){
  this.send('get', 'jobDefinition', param, option, callback);
}

Oozie.prototype.getJobLog = function (param, option, callback){
  this.send('get', 'jobLog', param, option, callback);
}

Oozie.prototype.getJobs = function (param, option, callback){
  /*
  The syntax for the filter is

  [NAME=VALUE][;NAME=VALUE]*

  Valid filter names are:

      name: the application name from the workflow/coordinator/bundle definition
      user: the user that submitted the job
      group: the group for the job
      status: the status of the job
  */
  this.send('get', 'jobs', param, option, callback);
}


//post method
Oozie.prototype.jobs = function (param, option, callback){
  this.send('post', 'jobs', param, option, callback);
}

Oozie.prototype.jobsMapReduce = function (param, option, callback){
  this.send('post', 'jobsMapReduce', param, option, callback);
}

Oozie.prototype.jobsPig = function (param, option, callback){
  this.send('post', 'jobsPig', param, option, callback);
}

Oozie.prototype.jobsHive = function (param, option, callback){
  this.send('post', 'jobsHive', param, option, callback);
}


//put method
Oozie.prototype.updateAdminStatus = function (param, option, callback){
  //With a HTTP PUT request it is possible to change the system status between NORMAL , NOWEBSERVICE , and SAFEMODE .
  this.send('put', 'adminStatus', param, option, callback);
}

Oozie.prototype.job = function (param, option, callback){
  //Valid values for the 'action' parameter are 'start', 'suspend', 'resume', 'kill', 'dryrun', 'rerun', and 'change'.
  //support reruning a coordinator job
  //support reruning a bundle job
  //support changing endtime/concurrency/pausetime of a Coordinator Job
  
  this.send('put', 'job', param, option, callback);
}

module.exports = Oozie;