var test = require("tape");
var fs = require("fs");

require("../amf");

test("writeAmf3Null", function (t) {
  var data = [].slice.call(fs.readFileSync("asset/value/null.bin3"));
  var obj = {value: null};
  var writer = new amf.Writer();
  writer.writeObject(obj);
  writer.data.unshift(17);
  t.deepEqual(data, writer.data);
  t.end();
});

test("writeAmf3BooleanTrue", function (t) {
  var data = [].slice.call(fs.readFileSync("asset/value/boolean-true.bin3"));
  var obj = {value: true};
  var writer = new amf.Writer();
  writer.writeObject(obj);
  writer.data.unshift(17);
  t.deepEqual(data, writer.data);
  t.end();
});

test("writeAmf3BooleanFalse", function (t) {
  var data = [].slice.call(fs.readFileSync("asset/value/boolean-false.bin3"));
  var obj = {value: false};
  var writer = new amf.Writer();
  writer.writeObject(obj);
  writer.data.unshift(17);
  t.deepEqual(data, writer.data);
  t.end();
});

test("writeAmf3StringUnicode", function (t) {
  var data = [].slice.call(fs.readFileSync("asset/value/string-unicode.bin3"));
  var obj = {value: "витоша, 富士山, 珠穆朗瑪峰, आमा"};
  var writer = new amf.Writer();
  writer.writeObject(obj);
  writer.data.unshift(17);
  t.deepEqual(data, writer.data);
  t.end();
});