var test = require("tape");
var fs = require("fs");

require("../amf");

test("readAmf3Null", function (t) {
  var exp = {value: null};
  var data = fs.readFileSync("asset/value/null.bin3");
  var reader = new amf.Reader(data);
  var obj = reader.readObject();
  t.deepEqual(exp, obj);
  t.end();
});

test("readAmf3BooleanTrue", function (t) {
  var exp = {value: true};
  var data = fs.readFileSync("asset/value/boolean-true.bin3");
  var reader = new amf.Reader(data);
  var obj = reader.readObject();
  t.deepEqual(exp, obj);
  t.end();
});

test("readAmf3BooleanFalse", function (t) {
  var exp = {value: false};
  var data = fs.readFileSync("asset/value/boolean-false.bin3");
  var reader = new amf.Reader(data);
  var obj = reader.readObject();
  t.deepEqual(exp, obj);
  t.end();
});

test("readAmf3StringUnicode", function (t) {
  var exp = {value: "витоша, 富士山, 珠穆朗瑪峰, आमा"};
  var data = fs.readFileSync("asset/value/string-unicode.bin3");
  var reader = new amf.Reader(data);
  var obj = reader.readObject();
  t.deepEqual(exp, obj);
  t.end();
});

test("readAmf3VectorInt", function (t) {
  var exp = {value: amf.toVector(amf.const.AMF3_VECTOR_INT, [1, 2, 3])};
  var data = fs.readFileSync("asset/value/vector-int.bin3");
  var reader = new amf.Reader(data);
  var obj = reader.readObject();
  t.equal("[Vector of int (variable)]", obj.value.toString());
  t.equal(amf.const.AMF3_VECTOR_INT, obj.value.type);
  t.equal(false, obj.value.fixed);
  t.equal(3, obj.value.length);
  t.equal(1, obj.value[0]);
  t.equal(2, obj.value[1]);
  t.equal(3, obj.value[2]);
  t.end();
});

test("readAmf3VectorIntNegative", function (t) {
  var exp = {value: amf.toVector(amf.const.AMF3_VECTOR_INT, [-3, -2, -1])};
  var data = fs.readFileSync("asset/value/vector-int-negative.bin3");
  var reader = new amf.Reader(data);
  var obj = reader.readObject();
  t.equal("[Vector of int (variable)]", obj.value.toString());
  t.equal(amf.const.AMF3_VECTOR_INT, obj.value.type);
  t.equal(false, obj.value.fixed);
  t.equal(3, obj.value.length);
  t.equal(-3, obj.value[0]);
  t.equal(-2, obj.value[1]);
  t.equal(-1, obj.value[2]);
  t.end();
});

/*test("readAmf3VectorUInt", function (t) {
  var exp = {value: amf.toVector(amf.const.AMF3_VECTOR_UINT, [2147483647, 2147483648, 4294967295])};
  var data = fs.readFileSync("asset/value/vector-uint.bin3");
  var reader = new amf.Reader(data);
  var obj = reader.readObject();
  t.equal("[Vector of int (variable)]", obj.value.toString());
  t.equal(amf.const.AMF3_VECTOR_UINT, obj.value.type);
  t.equal(false, obj.value.fixed);
  t.equal(3, obj.value.length);
  t.equal(2147483647, obj.value[0]);
  t.equal(2147483648, obj.value[1]);
  t.equal(4294967295, obj.value[2]);
  t.end();
});*/

test("readAmf3VectorDouble", function (t) {
  var exp = {value: amf.toVector(amf.const.AMF3_VECTOR_DOUBLE, [-31.57, 0, 31.57])};
  var data = fs.readFileSync("asset/value/vector-double.bin3");
  var reader = new amf.Reader(data);
  var obj = reader.readObject();
  t.equal("[Vector of double (variable)]", obj.value.toString());
  t.equal(amf.const.AMF3_VECTOR_DOUBLE, obj.value.type);
  t.equal(false, obj.value.fixed);
  t.equal(3, obj.value.length);
  t.equal(-31.57, obj.value[0]);
  t.equal(0, obj.value[1]);
  t.equal(31.57, obj.value[2]);
  t.end();
});