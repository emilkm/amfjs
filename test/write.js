var test = require("tape");
var fs = require("fs");

require("../amf");


//  'витоша, 富士山, 珠穆朗瑪峰, आमा'

test("writeUTF", function (t) {
  var data = [].slice.call(fs.readFileSync("asset/value/string-unicode.bin3"));
  var obj = {value: "витоша"};
  var writer = new amf.Writer();
  writer.writeObject(obj);
  writer.data.unshift(17);
  t.deepEqual(data, writer.data);
  t.end();
});