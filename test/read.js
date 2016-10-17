var test = require("tape");
var fs = require("fs");

require("../amf");

//  'витоша, 富士山, 珠穆朗瑪峰, आमा'

test("readUTF", function (t) {
  var data = fs.readFileSync("asset/value/string-unicode-fuji.bin3");
  var obj = {value: "富士山"};
  var reader = new amf.Reader(data);
  var res = reader.readObject();
  t.deepEqual(res, obj);
  t.end();
});