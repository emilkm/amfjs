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
let amfc = new amf.Client("app", "http://127.0.0.1/server/amf.php");
let p = amfClient.invoke("test", "ping", []);

p.then((res: amf.Response) => {
    console.log(res.data);
}).catch((res: amf.Response) => {
    console.log(res.message);
});
```

## Block Request Queue

The AMF Client operates a request queue. When multiple requests are sent close together, they are batched in the same AMF packet. During startup of an application one may need to do some initialisation before requests are sent. When the queue is blocked it is the responsibility of the user to release it.

```typescript
let p1 = amfc.invoke<amf.Response>("SessionService", "establishSession", [], true);

p1.then((res: amf.Response) => {
    //do something on success, and release the queue
    amfc.releaseQueue();
}).catch((res: amf.Response) => {
    //do something on failure
});

let p2 = amfc.invoke<amf.Response>("DataService", "getSomeData", []);

p2.then((res: amf.Response) => {
    //do something on success
}).catch((res: amf.Response) => {
    //do something on failure
});

```

In the example above two requests are invoked, but as the first one blocks the request queue, the second one is not sent, unless the first one succeeds and the queue is released. Releasing the queue with `amfc.releaseQueue()` sends the queued requests. This may be useful to avoid strucutring user code in incovenient ways in order to achieve the same result.


## Request Batching

Requests are sent close together are batched in the same AMF packet automatically. There is nothing the end user needs to do to achieve this. However, on occasion (for example testing) one may need to prevent a particular request be batched. This can be achieved with the fifth paramenter of the AMF Client `invoke()` method.


```typescript
let p1 = amfc.invoke<amf.Response>("DataService1", "getSomeData");

p1.then((res: amf.Response) => {
    //do something on success
}).catch((res: amf.Response) => {
    //do something on failure
});

let p2 = amfc.invoke<amf.Response>("DataService2", "getSomeData", [], false, true);

p2.then((res: amf.Response) => {
    //do something on success
}).catch((res: amf.Response) => {
    //do something on failure
});
```

In the example above, the second request is sent immediately after the first one in a separate AMF packet.


## History

Originally based on Surrey's R-AMF (AMF 99) implementation https://code.google.com/p/r-amf/

I found R-AMF while looking for a JavaScript AMF implementation. Unfortunately my server (at the time) was based on AMFPHP, and that meant I could not use the R-AMF Java server. Implementing AMF 99 in PHP was not too hard, but after spending some time working on the C implementaition for the AMFEXT PHP extension I realised it would take longer than the time I had available for the project. Using AMF 99 also meant that the HTTP debugging proxy was not fully functional.

While Surrey's AMF 99 provides an interesting variation of AMF, as http://www.reignite.com.au/binary-communication-using-ajax-and-amf/, it also requires an AMF 99 server.

Ultimately I decided to implement AMF 3 with limited AMF 0 support. Then write my own server library EFXPHP (https://github.com/emilkm/efxphp), and update the AMFEXT C extension for PHP (https://github.com/emilkm/amfext) to work with PHP 7 and greater.

As the effort on the AMFEXT C extension for PHP swallowed enormous amounts of time, writing documentation and tests for this library got delayed.

  
## TODO

* Documentation
* More tests
