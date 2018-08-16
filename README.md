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
                console.log("ping error");
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
        console.log("res.message");
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


## TypeScript

Typings cover the main usage of the library.

```typescript
let amfClient = new amf.Client("app", "http://127.0.0.1/server/amf.php");
let p = amfClient.invoke("test", "ping", []);

p.then((res: amf.Response) => {
    console.log(res.data);
}).catch((res: amf.Response) => {
    console.log(res.message);
});
```


## History

Originally based on Surrey's R-AMF (AMF 99) implementation https://code.google.com/p/r-amf/

I found R-AMF while looking for a JavaScript AMF implementation. Unfortunately my server (at the time) was based on AMFPHP, and that meant I could not use the R-AMF Java server. Implementing AMF 99 in PHP was not too hard, but after spending some time working on the C implementaition for the AMFEXT PHP extension I realised it would take longer than the time I had available for the project. Using AMF 99 also meant that the HTTP debugging proxy was not fully functional.

While Surrey's AMF 99 provides an interesting variation of AMF, as http://www.reignite.com.au/binary-communication-using-ajax-and-amf/, it also requires an AMF 99 server.

Ultimately I decided to implement AMF 3 with limited AMF 0 support. Then write my own server library EFXPHP (https://github.com/emilkm/efxphp), and update the AMFEXT C extension for PHP (https://github.com/emilkm/amfext) to work with PHP 7 and greater.

As the effort on the AMFEXT C extension for PHP swallowed enormous amounts of time, writing documentation and tests for this library got delayed.

  
## TODO

* Documentation
* More tests
