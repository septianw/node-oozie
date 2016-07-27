var xml2js = require('xml2js');
var jsob = {
  properties: [
    {
      key: 'satu',
      value: '1'
    },
    {
      key: 'dua',
      value: '2'
    }
  ]
};

var builder = new xml2js.Builder({
  rootName: 'satu-saja'
});

console.log(builder.buildObject(jsob));
