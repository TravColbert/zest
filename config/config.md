When you create a config.js file under the /config folder in the Zest root, you can refer to that configuration through the __NODE_ENV__ environment variable.

So, if you invoke Zest like this:

```
export NODE_ENV=demo node server.js
```

Zest is going to search for a config file called __/config/demo__ and load those configurations in the config stack.

The config file defines all of the variables used by Zest.
