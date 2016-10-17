var test = require("tape");
var fs = require("fs");

require("../amf");

test("readAmf3Null", function (t) {
  var data = fs.readFileSync("asset/value/null.bin3");
  var obj = {value: null};
  var reader = new amf.Reader(data);
  var res = reader.readObject();
  t.deepEqual(res, obj);
  t.end();
});

test("readAmf3BooleanTrue", function (t) {
  var data = fs.readFileSync("asset/value/boolean-true.bin3");
  var obj = {value: true};
  var reader = new amf.Reader(data);
  var res = reader.readObject();
  t.deepEqual(res, obj);
  t.end();
});

test("readAmf3BooleanFalse", function (t) {
  var data = fs.readFileSync("asset/value/boolean-false.bin3");
  var obj = {value: false};
  var reader = new amf.Reader(data);
  var res = reader.readObject();
  t.deepEqual(res, obj);
  t.end();
});

test("readAmf3StringUnicode", function (t) {
  var data = fs.readFileSync("asset/value/string-unicode.bin3");
  var obj = {value: "витоша, 富士山, 珠穆朗瑪峰, आमा"};
  var reader = new amf.Reader(data);
  var res = reader.readObject();
  t.deepEqual(res, obj);
  t.end();
});