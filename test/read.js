var test = require("tape");
var fs = require("fs");

require("../amf");

test("readUTF", function (t) {
  var data = fs.readFileSync("asset/value/string-unicode.bin3");
  var obj = {value: "витоша, 富士山, 珠穆朗瑪峰, आमा"};
  var reader = new amf.Reader(data);
  var res = reader.readObject();
  t.deepEqual(res, obj);
  t.end();
});