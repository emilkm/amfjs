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
  var exp = {value: amf.toVector([1, 2, 3], amf.const.AMF3_VECTOR_INT)};
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
  var exp = {value: amf.toVector([-3, -2, -1], amf.const.AMF3_VECTOR_INT)};
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

/*test("readAmf3VectorUint", function (t) {
  $exp = array(2147483647, 2147483648, 4294967295);
  $data = unserialize(file_get_contents(__DIR__ . '/../../asset/value/vector-uint.amf3'));
  $this->in->setData($data);
  $obj = $this->in->readObject();
  $this->assertInstanceOf('emilkm\efxphp\Amf\Types\Vector', $obj->value);
  $this->assertEquals(Constants::AMF3_VECTOR_UINT, $obj->value->type);
  $this->assertEquals(false, $obj->value->fixed);
  $this->assertEquals($exp, $obj->value->data);
}*/