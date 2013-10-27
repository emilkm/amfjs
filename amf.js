/***
 * AMF 3 JavaScript library by Emil Malinov https://github.com/emilkm/amfjs
 * based on Surrey's R-AMF (AMF 99) implementation https://code.google.com/p/r-amf
 * For more information on R-AMF (AMF 99), including Java (Spring) R-AMF server
 * see http://www.reignite.com.au/binary-communication-using-ajax-and-amf
 */
var amf = {

    CONST: {
        EMPTY_STRING : "",
        NULL_STRING : "null",
        UNDEFINED_TYPE : 0,
        NULL_TYPE : 1,
        FALSE_TYPE : 2,
        TRUE_TYPE : 3,
        INTEGER_TYPE : 4,
        DOUBLE_TYPE : 5,
        STRING_TYPE : 6,
        XML_TYPE : 7,
        DATE_TYPE : 8,
        ARRAY_TYPE : 9,
        OBJECT_TYPE : 10,
        XMLSTRING_TYPE : 11,
        BYTEARRAY_TYPE : 12,
        AMF0_AMF3 : 17,
        UINT29_MASK : 536870911,
        INT28_MAX_VALUE : 268435455,
        INT28_MIN_VALUE : -268435456,
        CLASS_ALIAS : "_explicitType"
    },
    requestTimeout: 30000, //30 seconds
    requestPoolSize: 6,
    requestPool: [],
    messageQueue: [],
    sendMessageId: false,
    clientId: null,
    sequence: 1,
    destination: "",
    endpoint: "",
    headers: null,
    doNothing: new Function,

    init: function(destination, endpoint, timeout) {
        this.clientId = null;
        this.sequence = 1;
        this.destination = destination;
        this.endpoint = endpoint;
        this.requestTimeout = timeout ? timeout : 30000; //30 seconds
        this.headers = [];
    },

    addHeader: function(name, value) {
        var header = {};
        header[name] = value;
        this.headers.push(header);
    },

    ActionMessage: function() {
        return {
            _explicitType: "flex.messaging.io.amf.ActionMessage",
            version: 3,
            headers: [{name:"mobile", mustUnderstand:false, data:true}],
            bodies: []
        };
    },

    MessageBody: function() {
        return {
            //this._explicitType = "flex.messaging.io.amf.MessageBody";
            targetURI: "null",
            responseURI: "/1",
            data: []
        };
    },

    MessageHeader: function() {
        return {
            //this._explicitType = "flex.messaging.io.amf.MessageHeader";
            name: "",
            mustUnderstand: false,
            data: null
        };
    },

    CommandMessage: function() {
        return {
            _explicitType: "flex.messaging.messages.CommandMessage",
            destination: "",
            operation: 5,
            //body: [],
            //headers: {DSId:'nil'},
            clientId: null
        };
    },

    RemotingMessage: function() {
        return {
            _explicitType : "flex.messaging.messages.RemotingMessage",
            destination: "",
            source: "",
            operation: "",
            body: [],
            //headers: {DSId:'nil'},
            clientId: null
        };
    },

    AcknowledgeMessage: function() {
        return {
            _explicitType : "flex.messaging.messages.AcknowledgeMessage",
            body: null,
            headers: [],
            messageId: null,
            clientId: null
        }
    },
    
    createMessage: function(source, operation, params) {
        var actionMessage = new amf.ActionMessage();
        var messageBody = new amf.MessageBody();
        var message;
        if (source == "ping") {
            this.sequence = 1;
            messageBody.responseURI = "/" + this.sequence++;
            message = new amf.CommandMessage();
            message.destination = this.destination;
        } else {
            messageBody.responseURI = "/" + this.sequence++;
            message = new amf.RemotingMessage();
            message.destination = this.destination;
            message.source = source;
            message.operation = operation;
            message.body = params;
            if (this.sendMessageId) {
                message.messageId = amf.uuid(0, 0);
            }
            //message.headers['DSId'] = this.clientId;
            message.clientId = this.clientId;

            for (var i = 0; i < this.headers.length; i++) {
                var header = this.headers[i];
                for (var headerName in header) {
                    message.headers[headerName] = header[headerName];
                }
            }
        }

        messageBody.data.push(message);
        actionMessage.bodies.push(messageBody);
        return actionMessage;
    },

    invoke: function(source, operation, params, onResult, onStatus) {
        if (this.clientId == null && this.messageQueue.length == 0) {
            this.messageQueue.push([this.createMessage("ping"), onResult, onStatus]);
            this._processQueue();
        }
        this.messageQueue.push([this.createMessage(source, operation, params), onResult, onStatus]);
        if (this.clientId != null) {
            this._processQueue();
        }
    },

    _processQueue: function() {
        var i, request;
        for (i = 0; i < this.requestPoolSize && this.messageQueue.length > 0; i++) {
            if (this.requestPool.length == i) {
                request = new XMLHttpRequest();
                request.parent = this;
                request.busy = false;
                this.requestPool.push(request);
            } else {
                request = this.requestPool[i];
            }
            if (!request.busy) {
                var args = this.messageQueue.shift();
                this._send(request, args[0], args[1], args[2]);
                if (args[0].bodies[0].data[0]._explicitType == "flex.messaging.messages.CommandMessage") { //ping
                    return;
                }
            }
        }
    },

    _send: function(request, message, onResult, onStatus) {
        var serializer = new amf.Serializer();
        request.message = serializer.writeMessage(message);
        request.onreadystatechange = function() {
            if (this.readyState === 1) {
                if (!this.busy) {
                    this.busy = true;
                    this.setRequestHeader("Content-Type", "application/x-amf; charset=UTF-8");
                    this.responseType = "arraybuffer";
                    this.send(new Uint8Array(request.message));
                }
            } else if (this.readyState === 4) {
                this.onreadystatechange = amf.doNothing;
                try {
                    if (this.status >= 200 && this.status <= 300) {
                        if (this.getResponseHeader("Content-type").indexOf("application/x-amf") > -1) {
                            var deserializer = new amf.Deserializer(new Uint8Array(this.response));
                            var message = deserializer.readMessage();
                            for (var bodyIndex in message.bodies) {
                                var body = message.bodies[bodyIndex];
                                if (body.targetURI && body.targetURI.indexOf("/onResult") > -1) {
                                    if (body.targetURI == "/1/onResult") {
                                        this.parent.clientId = body.data.clientId;
                                        for (var i = 0; i < this.parent.messageQueue.length; i++) {
                                            this.parent.messageQueue[i][0].bodies[0].data[0].clientId = this.parent.clientId;
                                            //this.parent.messageQueue[i][0].bodies[0].data[0].headers.DSId = this.parent.clientId;
                                        }
                                    } else {
                                        onResult(body.data.body);
                                    }
                                } else {
                                    if (body.data._explicitType == "flex.messaging.messages.ErrorMessage") {
                                        onStatus({faultCode:body.data.faultCode, faultDetail:body.data.faultDetail, faultString:body.data.faultString});
                                    }
                                }
                            }
                            this.busy = false;
                            this.message = null;
                            this.parent._processQueue();
                        } else {
                            onStatus({faultCode:1, faultDetail:this.responseText, faultString:""});
                        }
                    } else {
                        onStatus({faultCode:1, faultDetail:this.responseText, faultString:""});
                    }
                } catch (e) {
                    onStatus({faultCode:2, faultDetail:"", faultString:""});
                }
            }
        };
        request.open("POST", this.endpoint, true);
    }

};

amf.Writer = function() {
    this.data = [];
    this.objects = [];
    this.traits = {};
    this.strings = {};
    this.stringCount = 0;
    this.traitCount = 0;
    this.objectCount = 0;
};

amf.Writer.prototype.write = function(v) {
    this.data.push(v);
};

amf.Writer.prototype.writeShort = function(v) {
    this.write((v >>> 8) & 255);
    this.write((v >>> 0) & 255);
};

amf.Writer.prototype.writeUTF = function(v, asAmf) {
    var bytearr, c, i, strlen, utflen;
    strlen = v.length;
    utflen = 0;
    for (i = 0; i < strlen; i++) {
        c = v.charCodeAt(i);
        if (c > 0 && c < 128) {
            utflen++;
        } else if (c > 2047) {
            utflen += 3;
        } else {
            utflen += 2;
        }
    }
    bytearr = [];
    if (asAmf) {
        this.writeUInt29((utflen << 1) | 1);
    } else {
        bytearr.push((utflen >>> 8) & 255);
        bytearr.push(utflen & 255);
    }
    for (i = 0; i < strlen; i++) {
        c = v.charCodeAt(i);
        if (c > 0 && c < 128) {
            bytearr.push(c);
        } else if (c > 2047) {
            bytearr.push(224 | (c >> 12));
            bytearr.push(128 | ((c >> 6) & 63));
            if (asAmf) {
                bytearr.push(128 | ((c >> 0) & 63));
            } else {
                bytearr.push(128 | (c & 63));
            }
        } else {
            bytearr.push(192 | (c >> 6));
            if (asAmf) {
                bytearr.push(128 | ((c >> 0) & 63));
            } else {
                bytearr.push(128 | (c & 63));
            }
        }
    }
    this.writeAll(bytearr);
    return asAmf ? utflen : utflen + 2;
};

amf.Writer.prototype.writeUInt29 = function(v) {
    if (v < 128) {
        this.write(v);
    } else if (v < 16384) {
        this.write(((v >> 7) & 127) | 128);
        this.write(v & 127);
    } else if (v < 2097152) {
        this.write(((v >> 14) & 127) | 128);
        this.write(((v >> 7) & 127) | 128);
        this.write(v & 127);
    } else if (v < 0x40000000) {
        this.write(((v >> 22) & 127) | 128);
        this.write(((v >> 15) & 127) | 128);
        this.write(((v >> 8) & 127) | 128);
        this.write(v & 255);
    } else {
        throw "Integer out of range: " + v;
    }
};

amf.Writer.prototype.writeAll = function(bytes) {
    for (var i = 0; i < bytes.length; i++) {
        this.write(bytes[i]);
    }
};

amf.Writer.prototype.writeBoolean = function(v) {
    this.write(v ? 1 : 0);
};

amf.Writer.prototype.writeInt = function(v) {
    this.write((v >>> 24) & 255);
    this.write((v >>> 16) & 255);
    this.write((v >>> 8) & 255);
    this.write((v >>> 0) & 255);
};

amf.Writer.prototype.writeUnsignedInt = function(v) {
    v < 0 && (v = -(v ^ 4294967295) - 1);
    v &= 4294967295;
    this.write((v >> 24) & 255);
    this.write((v >> 16) & 255);
    this.write((v >> 8) & 255);
    this.write(v & 255);
};

//origin unknown
amf.Writer.prototype._getDouble = function(v) {
    var r = [0,0];
    if (v != v) return r[0] = -524288, r;
    var d = v < 0 || v === 0 && 1 / v < 0 ? -2147483648 : 0, v = Math.abs(v);
    if (v === Number.POSITIVE_INFINITY) return r[0] = d | 2146435072, r;
    for (var e = 0; v >= 2 && e <= 1023;) e++, v /= 2;
    for (; v < 1 && e >= -1022;) e--, v *= 2;
    e += 1023;
    if (e == 2047) return r[0] = d | 2146435072, r;
    var i;
    e == 0 
        ? (i = v * Math.pow(2, 23) / 2, v = Math.round(v * Math.pow(2, 52) / 2)) 
        : (i = v * Math.pow(2, 20) - Math.pow(2, 20), v = Math.round(v * Math.pow(2, 52) - Math.pow(2, 52)));
    r[0] = d | e << 20 & 2147418112 | i & 1048575;
    r[1] = v;
    return r;
};

amf.Writer.prototype.writeDouble = function(v) {
    v = this._getDouble(v);
    this.writeUnsignedInt(v[0]);
    this.writeUnsignedInt(v[1])
};

amf.Writer.prototype.getResult = function() {
    return this.data.join("");
};

amf.Writer.prototype.reset = function() {
    this.objects = [];
    this.objectCount = 0;
    this.traits = {};
    this.traitCount = 0;
    this.strings = {};
    this.stringCount = 0;
};

amf.Writer.prototype.writeStringWithoutType = function(v) {
    if (v.length == 0) {
        this.writeUInt29(1);
    } else {
        if (!this.stringByReference(v)) {
            this.writeUTF(v, true);
        }
    }
};

amf.Writer.prototype.stringByReference = function(v) {
    var ref = this.strings[v];
    if (ref) {
        this.writeUInt29(ref << 1);
    } else {
        this.strings[v] = this.stringCount++;
    }
    return ref;
};

amf.Writer.prototype.objectByReference = function(v) {
    var ref = 0;
    var found = false;
    for (; ref < this.objects.length; ref++) {
        if (this.objects[ref] === v) {
            found = true;
            break;
        }
    }
    if (found) {
        this.writeUInt29(ref << 1);
    } else {
        this.objects.push(v);
        this.objectCount++;
    }

    return found ? ref : null;
};

amf.Writer.prototype.traitsByReference = function(v, alias) {
    var s = alias + "|";
    for ( var i = 0; i < v.length; i++) {
        s += v[i] + "|";
    }
    var ref = this.traits[s];
    if (ref) {
        this.writeUInt29((ref << 2) | 1);
    } else {
        this.traits[s] = this.traitCount++;
    }
    return ref;
};

amf.Writer.prototype.writeAmfInt = function(v) {
    if (v >= amf.CONST.INT28_MIN_VALUE && v <= amf.CONST.INT28_MAX_VALUE) {
        v = v & amf.CONST.UINT29_MASK;
        this.write(amf.CONST.INTEGER_TYPE);
        this.writeUInt29(v);
    } else {
        this.write(amf.CONST.DOUBLE_TYPE);
        this.writeDouble(v);
    }
};

amf.Writer.prototype.writeDate = function(v) {
    this.write(amf.CONST.DATE_TYPE);
    if (!this.objectByReference(v)) {
        this.writeUInt29(1);
        this.writeDouble(v.getTime());
    }
};

amf.Writer.prototype.writeObject = function(v) {
    if (v == null) {
        this.write(amf.CONST.NULL_TYPE);
        return;
    }
    if (v.constructor === String) {
        this.write(amf.CONST.STRING_TYPE);
        this.writeStringWithoutType(v);
    } else if (v.constructor === Number) {
        if (v === +v && v === (v | 0)) {
            this.writeAmfInt(v);
        } else {
            this.write(amf.CONST.DOUBLE_TYPE);
            this.writeDouble(v);
        }
    } else if (v.constructor === Boolean) {
        this.write((v
            ? amf.CONST.TRUE_TYPE
            : amf.CONST.FALSE_TYPE));
    } else if (v.constructor === Date) {
        this.writeDate(v);
    } else {
        if (v.constructor === Array) {
            this.writeArray(v);
        } else if (amf.CONST.CLASS_ALIAS in v) {
            this.writeCustomObject(v);
        } else {
            this.writeMap(v);
        }
    }
};

amf.Writer.prototype.writeCustomObject = function(v) {
    this.write(amf.CONST.OBJECT_TYPE);
    if (!this.objectByReference(v)) {
        var traits = this.writeTraits(v);
        for (var i = 0; i < traits.length; i++) {
            var prop = traits[i];
            this.writeObject(v[prop]);
        }
    }
};

amf.Writer.prototype.writeTraits = function(v) {
    var traits = [];
    var count = 0;
    var externalizable = false;
    var dynamic = false;

    for (var t in v) {
        if (t != amf.CONST.CLASS_ALIAS) {
            traits.push(t);
            count++;
        }
    }
    if (!this.traitsByReference(traits, v[amf.CONST.CLASS_ALIAS])) {
        this.writeUInt29(3 | (externalizable ? 4 : 0) | (dynamic ? 8 : 0) | (count << 4));
        this.writeStringWithoutType(v[amf.CONST.CLASS_ALIAS]);
        if (count > 0) {
            for (var prop in traits) {
                this.writeStringWithoutType(traits[prop]);
            }
        }
    }
    return traits;
};

/* Write map as array
amf.Writer.prototype.writeMap = function(v) {
    this.write(amf.CONST.ARRAY_TYPE);
    if (!this.objectByReference(map)) {
        this.writeUInt29((0 << 1) | 1);
        for (var key in v) {
            if (key) {
                this.writeStringWithoutType(key);
            } else {
                this.writeStringWithoutType(amf.CONST.EMPTY_STRING);
            }
            this.writeObject(v[key]);
        }
        this.writeStringWithoutType(amf.CONST.EMPTY_STRING);
    }
};*/

amf.Writer.prototype.writeMap = function(v) {
    this.write(amf.CONST.OBJECT_TYPE);
    if (!this.objectByReference(v)) {
        this.writeUInt29(11);
        this.traitCount++; //bogus traits entry here
        this.writeStringWithoutType(amf.CONST.EMPTY_STRING); //class name
        for (var key in v) {
            if (key) {
                this.writeStringWithoutType(key);
            } else {
                this.writeStringWithoutType(amf.CONST.EMPTY_STRING);
            }
            this.writeObject(v[key]);
        }
        this.writeStringWithoutType(amf.CONST.EMPTY_STRING); //empty string end of dynamic members
    }
};

amf.Writer.prototype.writeArray = function(v) {
    this.write(amf.CONST.ARRAY_TYPE);
    if (!this.objectByReference(v)) {
        this.writeUInt29((v.length << 1) | 1);
        this.writeUInt29(1); //empty string implying no named keys
        if (v.length > 0) {
            for (var i = 0; i < v.length; i++) {
                this.writeObject(v[i]);
            }
        }
    }
};

amf.Reader = function(data) {
    this.objects = [];
    this.traits = [];
    this.strings = [];
    this.data = data;
    this.pos = 0;
};

amf.Reader.prototype.read = function() {
    return this.data[this.pos++];
};

amf.Reader.prototype.readUnsignedShort = function() {
    var c1 = this.read(), c2 = this.read();
    return (c1 << 8) + (c2 << 0);
};

amf.Reader.prototype.readUInt29 = function() {
    // Each byte must be treated as unsigned
    var b = this.read() & 255;
    if (b < 128) {
        return b;
    }
    var value = (b & 127) << 7;
    b = this.read() & 255;
    if (b < 128) {
        return (value | b);
    }
    value = (value | (b & 127)) << 7;
    b = this.read() & 255;
    if (b < 128) {
        return (value | b);
    }
    value = (value | (b & 127)) << 8;
    b = this.read() & 255;
    return (value | b);
};

amf.Reader.prototype.readFully = function(buff, start, length) {
    for (var i = start; i < length; i++) {
        buff[i] = this.read();
    }
};

amf.Reader.prototype.readUTF = function(length) {
    var utflen = length ? length : this.readUnsignedShort();
    var chararr = [];
    var p = this.pos;
    var c1, c2, c3;

    while (this.pos < p + utflen) {
        c1 = this.read();
        if (c1 < 128) {
            chararr.push(String.fromCharCode(c1));
        } else if (c1 > 2047) {
            c2 = this.read();
            c3 = this.read();
            chararr.push(String.fromCharCode(((c1 & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63)));
        } else {
            c2 = this.read();
            chararr.push(String.fromCharCode(((c1 & 31) << 6) | (c2 & 63)));
        }
    }
    // The number of chars produced may be less than utflen
    return chararr.join("");
};

amf.Reader.prototype.reset = function() {
    this.objects = [];
    this.traits = [];
    this.strings = [];
};

amf.Reader.prototype.readObject = function() {
    var type = this.read();
    return this.readObjectValue(type);
};

amf.Reader.prototype.readString = function() {
    var ref = this.readUInt29();
    if ((ref & 1) == 0) {
        return this.getString(ref >> 1);
    } else {
        var len = (ref >> 1);
        if (len == 0) {
            return amf.CONST.EMPTY_STRING;
        }
        var str = this.readUTF(len);
        this.rememberString(str);
        return str;
    }
};

amf.Reader.prototype.rememberString = function(v) {
    this.strings.push(v);
};

amf.Reader.prototype.getString = function(v) {
    return this.strings[v];
};

amf.Reader.prototype.getObject = function(v) {
    return this.objects[v];
};

amf.Reader.prototype.getTraits = function(v) {
    return this.traits[v];
};

amf.Reader.prototype.rememberTraits = function(v) {
    this.traits.push(v);
};

amf.Reader.prototype.rememberObject = function(v) {
    this.objects.push(v);
};

amf.Reader.prototype.readTraits = function(ref) {
    if ((ref & 3) == 1) {
        return this.getTraits(ref >> 2);
    } else {
        var count = (ref >> 4);
        var className = this.readString();
        var traits = {};
        if (className != null && className != "") {
            traits[amf.CONST.CLASS_ALIAS] = className;
        }
        traits.props = [];
        for (var i = 0; i < count; i++) {
            traits.props.push(this.readString());
        }
        this.rememberTraits(traits);
        return traits;
    }
};

amf.Reader.prototype.readScriptObject = function() {
    var ref = this.readUInt29();
    if ((ref & 1) == 0) {
        return this.getObject(ref >> 1);
    } else {
        var traits = this.readTraits(ref);
        var obj = {};
        if (amf.CONST.CLASS_ALIAS in traits) {
            obj[amf.CONST.CLASS_ALIAS] = traits[amf.CONST.CLASS_ALIAS];
        }
        this.rememberObject(obj);
        if ((ref & 4) == 4 && obj[amf.CONST.CLASS_ALIAS] == "flex.messaging.io.ArrayCollection") {//externalizable
            return this.readObject();
        } else {
            for (var i in traits.props) {
                obj[traits.props[i]] = this.readObject();
            }
            if ((ref & 8) == 8) {//dynamic
                for (; ;) {
                    var name = this.readString();
                    if (name == null || name.length == 0) {
                        break;
                    }
                    obj[name] = this.readObject();
                }
            }
        }
        return obj;
    }
};

amf.Reader.prototype.readArray = function() {
    var ref = this.readUInt29();
    if ((ref & 1) == 0) {
        return this.getObject(ref >> 1);
    }
    var len = (ref >> 1);
    var map = null, i = 0;
    while (true) {
        var name = this.readString();
        if (!name) {
            break;
        }
        if (!map) {
            map = {};
            this.rememberObject(map);
        }
        map[name] = this.readObject();
    }
    if (!map) {
        var array = new Array(len);
        this.rememberObject(array);
        for (i = 0; i < len; i++) {
            array[i] = this.readObject();
        }
        return array;
    } else {
        for (i = 0; i < len; i++) {
            map[i] = this.readObject();
        }
        return map;
    }
};

//origin unknown
amf.Reader.prototype.readDouble = function() {
    var c1 = this.read() & 255, c2 = this.read() & 255;
    if (c1 === 255) {
        if (c2 === 248) return Number.NaN;
        if (c2 === 240) return Number.NEGATIVE_INFINITY
    } else if (c1 === 127 && c2 === 240) return Number.POSITIVE_INFINITY;
    var c3 = this.read() & 255, c4 = this.read() & 255, c5 = this.read() & 255, c6 = this.read() & 255, c7 = this.read() & 255, c8 = this.read() & 255;
    if (!c1 && !c2 && !c3 && !c4) return 0;
    for (var d = (c1 << 4 & 2047 | c2 >> 4) - 1023, c2 = ((c2 & 15) << 16 | c3 << 8 | c4).toString(2), c3 = c2.length; c3 < 20; c3++) c2 = "0" + c2;
    c6 = ((c5 & 127) << 24 | c6 << 16 | c7 << 8 | c8).toString(2);
    for (c3 = c6.length; c3 < 31; c3++) c6 = "0" + c6;
    c5 = parseInt(c2 + (c5 >> 7 ? "1" : "0") + c6, 2);
    if (c5 == 0 && d == -1023) return 0;
    return (1 - (c1 >> 7 << 1)) * (1 + Math.pow(2, -52) * c5) * Math.pow(2, d);
};

amf.Reader.prototype.readDate = function() {
    var ref = this.readUInt29();
    if ((ref & 1) == 0) {
        return this.getObject(ref >> 1);
    }
    var time = this.readDouble();
    var date = new Date(time);
    this.rememberObject(date);
    return date;
};

amf.Reader.prototype.readMap = function() {
    var ref = this.readUInt29();
    if ((ref & 1) == 0) {
        return this.getObject(ref >> 1);
    }
    var length = (ref >> 1);
    var map = null;
    if (length > 0) {
        map = {};
        this.rememberObject(map);
        var name = this.readObject();
        while (name != null) {
            map[name] = this.readObject();
            name = this.readObject();
        }
    }
    return map;
};

amf.Reader.prototype.readByteArray = function() {
    var ref = this.readUInt29();
    if ((ref & 1) == 0) {
        return this.getObject(ref >> 1);
    } else {
        var len = (ref >> 1);
        var ba = [];
        this.readFully(ba, 0, len);
        this.rememberObject(ba);
        return ba;
    }
};

amf.Reader.prototype.readObjectValue = function(type) {
    var value = null;

    switch (type) {
        case amf.CONST.STRING_TYPE:
            value = this.readString();
            break;
        case amf.CONST.OBJECT_TYPE:
            try {
                value = this.readScriptObject();
            } catch (e) {
                throw "Failed to deserialize:" + e;
            }
            break;
        case amf.CONST.ARRAY_TYPE:
            value = this.readArray();
            //value = this.readMap();
            break;
        case amf.CONST.FALSE_TYPE:
            value = false;
            break;
        case amf.CONST.TRUE_TYPE:
            value = true;
            break;
        case amf.CONST.INTEGER_TYPE:
            value = this.readUInt29();
            // Symmetric with writing an integer to fix sign bits for
            // negative values...
            value = (value << 3) >> 3;
            break;
        case amf.CONST.DOUBLE_TYPE:
            value = this.readDouble();
            break;
        case amf.CONST.UNDEFINED_TYPE:
        case amf.CONST.NULL_TYPE:
            break;
        case amf.CONST.DATE_TYPE:
            value = this.readDate();
            break;
        case amf.CONST.BYTEARRAY_TYPE:
            value = this.readByteArray();
            break;
        case amf.CONST.AMF0_AMF3:
            value = this.readObject();
            break;
        default:
            throw "Unknown AMF type: " + type;
    }
    return value;
};

amf.Reader.prototype.readBoolean = function() {
    return this.read() === 1;
};

amf.Serializer = function() {
    this.writer = new amf.Writer();
};

amf.Serializer.prototype.writeMessage = function(message) {
    try {
        this.writer.writeShort(message.version);
        this.writer.writeShort(message.headers.length);
        for (var header in message.headers) {
            this.writeHeader(message.headers[header]);
        }
        this.writer.writeShort(message.bodies.length);
        for (var body in message.bodies) {
            this.writeBody(message.bodies[body]);
        }
    } catch (error) {
        console.log(error);
    }
    //return this.writer.getResult();
    return this.writer.data;
};

amf.Serializer.prototype.writeObject = function(object) {
    this.writer.writeObject(object);
};

amf.Serializer.prototype.writeHeader = function(header) {
    this.writer.writeUTF(header.name);
    this.writer.writeBoolean(header.mustUnderstand);
    this.writer.writeInt(1); //UNKNOWN_CONTENT_LENGTH used to be -1
    this.writer.reset();
    //this.writer.writeObject(header.data);
    this.writer.write(1); //boolean amf0 marker
    this.writer.writeBoolean(true);
};

amf.Serializer.prototype.writeBody = function(body) {
    if (body.targetURI == null) {
        this.writer.writeUTF(amf.CONST.NULL_STRING);
    } else {
        this.writer.writeUTF(body.targetURI);
    }
    if (body.responseURI == null) {
        this.writer.writeUTF(amf.CONST.NULL_STRING);
    } else {
        this.writer.writeUTF(body.responseURI);
    }
    this.writer.writeInt(1); //UNKNOWN_CONTENT_LENGTH used to be -1
    this.writer.reset();
    this.writer.write(amf.CONST.AMF0_AMF3); //AMF0_AMF3
    this.writeObject(body.data);
};

amf.Deserializer = function(data) {
    this.reader = new amf.Reader(data);
};

amf.Deserializer.prototype.readMessage = function() {
    var message = new amf.ActionMessage();
    message.version = this.reader.readUnsignedShort();
    var headerCount = this.reader.readUnsignedShort();
    for (var i = 0; i < headerCount; i++) {
        message.headers.push(this.readHeader());
    }
    var bodyCount = this.reader.readUnsignedShort();
    for (i = 0; i < bodyCount; i++) {
        message.bodies.push(this.readBody());
    }
    return message;
};

amf.Deserializer.prototype.readHeader = function() {
    var header = new amf.MessageHeader();
    header.name = this.reader.readUTF();
    header.mustUnderstand = this.reader.readBoolean();
    this.reader.pos += 4; //length
    this.reader.reset();
    header.data = this.readObject();
    return header;
};

amf.Deserializer.prototype.readBody = function() {
    var body = new amf.MessageBody();
    body.targetURI = this.reader.readUTF();
    body.responseURI = this.reader.readUTF();
    this.reader.pos += 4; //length
    this.reader.reset();
    body.data = this.readObject();
    return body;
};

amf.Deserializer.prototype.readObject = function() {
    return this.reader.readObject();
};

//https://gist.github.com/jed/982883
amf.uuid = function c(a,b){
    return a?(b|Math.random()*16>>b/4).toString(16):([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/1|0|(8)/g,c);
};