## Usage
```
  var Oozie = require('./index.js');

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

  var oozie = new Oozie(config);

  oozie.on('ready', function () {
    oozie.submit('java', null, 'casetwo.jar', 'dummy.casetwo', [], [{
      name: 'namajar',
      value: 'casetwo.jar'
    }], wfconfig);

    oozie.on('jobSubmitted', function () {
      console.log(subject01.jobid);
    });
  });
```

## Functions

<dl>
<dt><a href="#Oozie">Oozie(config)</a></dt>
<dd><p>Oozie class constructor</p>
</dd>
<dt><a href="#defaultResponse">defaultResponse(e, r, b)</a></dt>
<dd><p>Response default for start, rerun, get.</p>
</dd>
</dl>

<a name="Oozie"></a>

## Oozie(config)
Oozie class constructor

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| config | <code>Object</code> | Config object. |


* [Oozie(config)](#Oozie)
    * [.setName(name)](#Oozie+setName)
    * [.getName()](#Oozie+getName) ⇒ <code>String</code>
    * [.setProperty(property)](#Oozie+setProperty)
    * [.genwf(arg, wfconfig, cb)](#Oozie+genwf)
    * [.getDefaultProperty()](#Oozie+getDefaultProperty) ⇒ <code>Object</code>
    * [.getDefaultWorkflow()](#Oozie+getDefaultWorkflow) ⇒ <code>Object</code>
    * [.submit(type, name, jobfile, className, arg, prop, wfconfig, cb)](#Oozie+submit)
    * [.start(jobid)](#Oozie+start)
    * [.rerun(jobid)](#Oozie+rerun)
    * [.get(jobid)](#Oozie+get)

<a name="Oozie+setName"></a>

### oozie.setName(name)
Set name of running job.

**Kind**: instance method of <code>[Oozie](#Oozie)</code>  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>String</code> | Name of job |

<a name="Oozie+getName"></a>

### oozie.getName() ⇒ <code>String</code>
get name of job.

**Kind**: instance method of <code>[Oozie](#Oozie)</code>  
**Returns**: <code>String</code> - job name  
<a name="Oozie+setProperty"></a>

### oozie.setProperty(property)
Set private property

**Kind**: instance method of <code>[Oozie](#Oozie)</code>  

| Param | Type | Description |
| --- | --- | --- |
| property | <code>Object</code> | Property to be set. |

<a name="Oozie+genwf"></a>

### oozie.genwf(arg, wfconfig, cb)
Generate oozie workflow-app

**Kind**: instance method of <code>[Oozie](#Oozie)</code>  

| Param | Type | Description |
| --- | --- | --- |
| arg | <code>Array</code> | Job workflow arguments |
| wfconfig | <code>Object</code> | Full workflow config |
| cb | <code>function</code> | Callback function |

<a name="Oozie+getDefaultProperty"></a>

### oozie.getDefaultProperty() ⇒ <code>Object</code>
Get default property

**Kind**: instance method of <code>[Oozie](#Oozie)</code>  
**Returns**: <code>Object</code> - Default property object.  
<a name="Oozie+getDefaultWorkflow"></a>

### oozie.getDefaultWorkflow() ⇒ <code>Object</code>
Get default workflow

**Kind**: instance method of <code>[Oozie](#Oozie)</code>  
**Returns**: <code>Object</code> - Default workflow object.  
<a name="Oozie+submit"></a>

### oozie.submit(type, name, jobfile, className, arg, prop, wfconfig, cb)
submit job to oozie

**Kind**: instance method of <code>[Oozie](#Oozie)</code>  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>String</code> | Type of submitted job |
| name | <code>String</code> | Name of job, set to random if null |
| jobfile | <code>String</code> | Name of file, only name without path, path have been set on constructor. |
| className | <code>String</code> | Class path of job. |
| arg | <code>Array</code> | Array of job arguments, set empty array to set no argument. |
| prop | <code>Array</code> | Array of object properties, this array will be concatenated to default properties, set empty array if using default properties only. |
| wfconfig | <code>Object</code> | Object of custom workflow config |
| cb | <code>function</code> | Callback function. |

<a name="Oozie+start"></a>

### oozie.start(jobid)
Start Job

**Kind**: instance method of <code>[Oozie](#Oozie)</code>  

| Param | Type | Description |
| --- | --- | --- |
| jobid | <code>String</code> | Job ID to be Start. |

<a name="Oozie+rerun"></a>

### oozie.rerun(jobid)
Re running job, identified by jobid.

**Kind**: instance method of <code>[Oozie](#Oozie)</code>  

| Param | Type | Description |
| --- | --- | --- |
| jobid | <code>String</code> | Job id that needed to run. |

<a name="Oozie+get"></a>

### oozie.get(jobid)
Get job info identified by jobId.

**Kind**: instance method of <code>[Oozie](#Oozie)</code>  

| Param | Type | Description |
| --- | --- | --- |
| jobid | <code>String</code> | Job Id that needed to get. |

<a name="defaultResponse"></a>

## defaultResponse(e, r, b)
Response default for start, rerun, get.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| e | <code>Object</code> | Error Object from request. |
| r | <code>Object</code> | Response Object from request. |
| b | <code>Mixed</code> | Response body from request. |
