amfjs
=====

AMFJS is an AMF Client JavaScript library 

## Limited AMF 0

The library does enough AMF 0 to be able to send and receive packet headers. 

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
        var amfClient = new amf.Client("amfphp", "http://127.0.0.1/server/gateway.php");
        var p = amfClient.invoke("test", "ping", []);
        
        p.then(
            function(res) {
                console.log(res.data);
            },
            function(err) {
                console.log("ping errror");
            }
        );
    </script>
</body>
</html>
```

This example loads amf.js, which makes the amf global object available.

```javascript
var amfClient = amf.Client("amfphp", "http://127.0.0.1/server/gateway.php");
```

A new AMF Client instance is created, and initialized with the desired  _destination_ and _endpoint_.


```javascript
var p = amfClient.invoke("test", "ping", []);

p.then(
    function(res) {
        console.log(res.data);
    },
    function(err) {
        console.log("ping errror");
    }
);
```

Sends and AMF request to the _test_ service, invoking the _ping_ method with no parameters. The _invoke_ method returns a Promise, which is used to handle the response or error.


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

