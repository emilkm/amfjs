amfjs
=====

AMFJS is an AMF 3 Client JavaScript library 

It is based on Surrey's R-AMF (AMF 99) implementation https://code.google.com/p/r-amf/
For more information on R-AMF (AMF 99), including Java (Spring) R-AMF server,
see http://www.reignite.com.au/binary-communication-using-ajax-and-amf/ 
and some of the other blog entries at http://www.reignite.com.au/blog/.

## Why not AMF 99

I found R-AMF while looking for a JavaScript AMF implementation. Unfortunately my server is based on AMFPHP, and that meant I could not use the R-AMF Java server. Implementing AMF 99 in PHP was not too hard, but after spending some time working on the C implementaition for the AMFEXT PHP extension I realised it would take longer than the time I had available for the project. Using AMF 99 also meant that the HTTP debugging proxy was not fully functional.

## Why not AMF 0

It only adds weight to the library, and I have not had any real need for it.

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


The PHP service is very simple and looks like this.

```php
<?php
class test
{
    public function ping()
	{
		return 'pong';
	}
}
?>
```

If the AMF Client has not been assigned a _clientId_ by the server, a __flex.messaging.messages.CommandMessage__  with a _CLIENT_PING_OPERATION_ will be sent to the server first, in order to test connectivity over the current channel to the remote endpoint, and get a _clientId_ assigned.


# Future development

1. [EnyoJs](https://github.com/enyojs/enyo) [plugin](https://github.com/emilkm/enyo-amf)

2. AMF Server library for node.js

