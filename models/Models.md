The model location is defined in the config stack.

Here is a sample DB config:

```
{
  "DB_CONFIG": {
    zest: {
      dialect: "sqlite",
      verbose: false,
      dbConfig: "sqlite::memory",
    },
  }
}
```

This is the standard, default DB config for Zest.

The DB configuration defines:
 - the RDBMS dialect (sqlite | others)
 - the verbosity - how much the RDBMS talks
 - the actual config information for that particular RDBMS - this can change depending on the RDBMS being used

DB configurations are placed under keys that represent application names. In the above example, the application name is "__zest__".

You can store different applications under __DB_CONFIG__, each under their own key-name:

```
{
  "DB_CONFIG": {
    "local": {
      "dialect": "sqlite",
      "verbose": true,
      "dbConfig": "sqlite::memory"
    },
    "my-blog": {
      "dialect": "sqlite",
      "verbose": true,
      "dbConfig": "sqlite::memory"
    }
  }
}
```

In the above example, the __DB_CONFIG__ specifies two applications: __local__ and __my-blog__.

With this config Zest will expect the models folder structure on-disk to look like this:

```
models
  |
  +-- local
  |     |
  |     +-- development
  |     |     |
  |     |     +-- modelfile1.js
  |     |     |
  |     |     +-- modelfile2.js
  |     |
  |     +-- test
  |     |
  |     +-- production
  |
  +-- my-blog
        |
        +-- development
        |     |
        |     +-- modelfile1.js
        |
        +-- test
        |     |
        |     +-- modelfile1.js
        |
        +-- production
```

Directly under the models folder are folders that represent the application(s) supported: '__local__' and '__my-blog__'.

Under the application name folder is a folder for each of the environments you are working on: e.g. _development_, _test_ or _production_. Environments are defined using the __NODE_ENV__ environment variable.

For example, if I start Zest like this:

```
NODE_ENV=demo node server.js
```

Then Zest is going to 
Finally, under each environment are the model-definition files for that environment. 

This arrangement allows for Zest to host multiple applications with their own DB configuration keyed off of the environment.