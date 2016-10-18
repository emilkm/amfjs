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

test("writeAmf3VectorInt", function (t) {
  var data = [].slice.call(fs.readFileSync("asset/value/vector-int.bin3"));
  var obj = {value: amf.toVector(amf.const.AMF3_VECTOR_INT, [1, 2, 3])};
  var writer = new amf.Writer();
  writer.writeObject(obj);
  writer.data.unshift(17);
  t.equal("[Vector (int)]", obj.value.toString());
  t.equal(amf.const.AMF3_VECTOR_INT, obj.value.type);
  t.equal(false, obj.value.fixed);
  t.equal(3, obj.value.length);
  t.equal(1, obj.value[0]);
  t.equal(2, obj.value[1]);
  t.equal(3, obj.value[2]);
  t.end();
});

test("writeAmf3VectorIntNegative", function (t) {
  var data = [].slice.call(fs.readFileSync("asset/value/vector-int-negative.bin3"));
  var obj = {value: amf.toVector(amf.const.AMF3_VECTOR_INT, [-3, -2, -1])};
  var writer = new amf.Writer();
  writer.writeObject(obj);
  writer.data.unshift(17);
  t.equal("[Vector (int)]", obj.value.toString());
  t.equal(amf.const.AMF3_VECTOR_INT, obj.value.type);
  t.equal(false, obj.value.fixed);
  t.equal(3, obj.value.length);
  t.equal(-3, obj.value[0]);
  t.equal(-2, obj.value[1]);
  t.equal(-1, obj.value[2]);
  t.end();
});

test("writeAmf3VectorDouble", function (t) {
  var data = [].slice.call(fs.readFileSync("asset/value/vector-double.bin3"));
  var obj = {value: amf.toVector(amf.const.AMF3_VECTOR_DOUBLE, [-31.57, 0, 31.57])};
  var writer = new amf.Writer();
  writer.writeObject(obj);
  writer.data.unshift(17);
  t.equal("[Vector (double)]", obj.value.toString());
  t.equal(amf.const.AMF3_VECTOR_DOUBLE, obj.value.type);
  t.equal(false, obj.value.fixed);
  t.equal(3, obj.value.length);
  t.equal(-31.57, obj.value[0]);
  t.equal(0, obj.value[1]);
  t.equal(31.57, obj.value[2]);
  t.end();
});

test("writeAmf3VectorObject", function (t) {
  var data = [].slice.call(fs.readFileSync("asset/value/vector-object.bin3"));
  var obj = {value: amf.toVector(amf.const.AMF3_VECTOR_OBJECT, [{value: 1}, {value: 2}, {value: 3}])};
  var writer = new amf.Writer();
  writer.writeObject(obj);
  writer.data.unshift(17);
  t.equal("[Vector (object)]", obj.value.toString());
  t.equal(amf.const.AMF3_VECTOR_OBJECT, obj.value.type);
  t.equal(false, obj.value.fixed);
  t.equal(3, obj.value.length);
  t.equal(1, obj.value[0].value);
  t.equal(2, obj.value[1].value);
  t.equal(3, obj.value[2].value);
  t.end();
});

