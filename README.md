amfjs
=====

AMFJS is an AMF 3 Client JavaScript library 

It is based on Surrey's R-AMF (AMF 99) implementation https://code.google.com/p/r-amf/

## Why no AMF 0

The library does enough AMF 0 to be able to send message headers, anything more would only add weight. 

# Basic Example

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


# Framework Integration

1. [EnyoJs](https://github.com/enyojs/enyo) [plugin](https://github.com/emilkm/enyo-amf)

