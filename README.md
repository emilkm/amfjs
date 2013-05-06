amfjs
=====

AMFJS is an AMF 3 JavaScript library 

It is based on Surrey's R-AMF (AMF 99) implementation https://code.google.com/p/r-amf/
For more information on R-AMF (AMF 99), including Java (Spring) R-AMF server,
see http://www.reignite.com.au/binary-communication-using-ajax-and-amf/ 
and some of the other blog entries at http://www.reignite.com.au/blog/.

## Why not AMF 99

I found R-AMF while looking for a JavaScript AMF implementation. Unfortunately my server is based on AMFPHP, and that meant I could not use the R-AMF Java server. Implementing AMF 99 in PHP was not too hard, but after spending some time working on the C implementaition for the AMFEXT PHP extension I realised it would take longer than the time I had available for the project. Using AMF 99 also meant that the HTTP debugging proxy was not fully functional.

## Why not AMF 0

I don't use it, and it only adds weight to the library.

# Enough talk, give me a basic example

Here is a AMFJS Ping Pong example:

```html
<!doctype html>
<html>
<head>
	<title>AMFJS</title>
	<script src="amf.js" type="text/javascript"></script>
</head>
<body>
	<script type="text/javascript">
		amf.init("amfphp", "http://127.0.0.1/server/gateway.php");
        amf.invoke("test", "ping", [],
            function(data) {
                console.log(data);
            },
            function(data) {
                console.log("ping errror");
            }
        );
	</script>
</body>
</html>
```

This example loads an amf.js, which makes the amf global object available.

```javascript
amf.init("amfphp", "http://127.0.0.1/server/gateway.php");
```

__amf.init__ sets the _destination_ and _endpoint_ of the AMF Client.


```javascript
amf.invoke("test", "ping", [],
    function(data) {
        console.log(data);
    },
    function(data) {
        console.log("ping errror");
    }
);
```

Sends and AMF request to the _test_ service, invoking the _ping_ method with no parameters. _onResult_ and _onStatus_ callback functions are also passed to the the _invoke_ method.
