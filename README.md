# @timelaps/promise

a quick function for controlling how and when a promise resolves its subsequent then and catch handlers.

install with
```javascript
npm install
```
and see the tests pass with
```javascript
npm t
```

to use simply import at the root
```javascript
var Promise = require('@timelaps/promise');
```
or grab the synchronous version
```javascript
var Promise = require('@timelaps/promise/sync'); // resolves synchronously
```