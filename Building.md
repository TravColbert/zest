# Building and Using Zest

## Developing Locally

The easiest way to get started developing your app locally is:

### Create a .env file with local-only settings

Copy ```.env.sample``` to ```.env``` and make editions matching your setup.

### Start a Local Node Instance 

```
nvm install --lts
nvm use --lts
npm i
npm run dev
```

The above initializes your database and tables, but does not populate the database with any seed data. If you want to do that then:

```
npm run with-seed
```

### Start a Local Docker Build

This will run Node in PRODUCTION mode.

First build an image like this:

```
docker build -t _your_app_name_:latest .
```

For example: 

```
docker build -t zest-test:latest .
```

will build an image tagged as **zest-test**.

Then run:

```
docker run -it --env-file .env -p 3000:3000 --name _your_app_name_ _image_name_
```

For example:

```
docker run -it --env-file .env -p 3000:3000 --name zest-test-app zest-test
```

You might find that adding the **--rm** argument prevents Docker complaints.
 
Above, we call the container **zest-test-app**. This has a writable filesystem such that any local database entries in SQLites, for example, will persist between restarts of your container.

#### Restarting a container

Below would (re)start your container, preserving your app's state (database entries) exactly where you left off.

```
docker start zest-test-app
```

Adding an **-i** makes the container 'interactive', allowing you to see the server's log output on-screen.

```
docker start -i zest-test-app
```
