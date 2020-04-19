# Haushalt API

# Requirements

* node.js
* mongodb `docker-compose -f docker-compose-dev.yml up -d`

# Configure it

## config.js

To configure the backend check out [config.js](config.js) first.

1. Make sure the link to the database instance is reachable from where you run the api
1. create your own salt for the passwords
1. set the url of the frontend to prevent cors issues

## User accounts

to get started create some user accounts with the cli-tool like so:
```bash
$ node haushalt-cli.js createuser demouser
```
The tool will ask for a password and full name of the user. 

To set a custom avatar for the user
```bash
$ node haushalt-cli.js setavatar demouser demo-user.jpg
```

Then place the corresponding file in the `public/` folder.

# Run it

    npm install
    npm start
