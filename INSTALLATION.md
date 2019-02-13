# Installation

## Notes
Firewalling and VPN tasks are left out as protection is unnecessary for the purpose of this challenge and infrastructure, but may be very important in different situations, or for development/production of private work or networks.

SSL setup was included as auto-detecting user current location API in chrome requires Secure HTTP.

## Setup
Spin up instance w/SSH keys on Cloud or VM, or just use your local machine

## Setup Users
Add a new user
``` console
$ adduser challenge
```

Give the new user sudo permission
``` console
$ usermod -aG sudo challenge
```

> Relog to update the changes or call ~./.bashrc

## Setup Apt
Update apt
``` console
$ sudo apt-get update
```

## Setup Postgres
Install postgresql
``` console
$ sudo apt-get install postgresql-9.4 postgresql-client-9.4
```

Switch to user postgres to initialize
``` console
$ sudo -u postgres -i
```

Create a user
``` console
$ createuser --interactive
```

> Enter challenge as the role name

Create a database
``` console
$ createdb challenge
```

Connect to Postgresql
``` console
$ psql
```

Set the password for our new role/account and Disconnect
``` console
\password challenge
\q
```

> If you like You can now connect and manage the database using a windows client, pgAdmin
> (https://www.postgresql.org/download/
> Its recommended to connect locally using the SSH tunnel method (if no VPN).

## Setup Git, Node, NPM and PM2
``` console
$ sudo apt-get install build-essential curl git
$ sudo curl -L https://git.io/n-install | bash
```

> Relog to update the changes or call ~./.bashrc

``` console
$ npm install pm2@latest -g
```

Boot up pm2
``` console
$ pm2 status
```

## Setup the server (express) and client (react)
Pull, or create the repo on Github including .gitignore as 'challenge'
``` console
$ mkdir ~/challenge
$ cd ~/challenge
$ git init 
$ git remote add origin https://github.com/<username>/air-challenge.git
$ git fetch
``` 
> Enter your credentials, if required

Checkout the repository
```console 
$ git checkout master
```

**This is where the coding challenge really begins basically since your main express/react app files need to be created**
**Alternatively, just pull my repository and skip steps as necessary.**

Initialize a new Npm project with express
```console
$ mkdir ~/challenge/server
$ cd ~/challenge/server
$ npm init
$ npm install express --save
```

Install the Express and React generators.
```console
$ npm install express-generator express-react-views react react-dom create-react-app -g --save
```

Generate the Express app
```console
$ cd ~/challenge/server
$ express --view=react challenge
$ npm install
$ npm install pug --save
```

Install a Postgresql integration
```console
$ cd cd ~/challenge/client
$ npm install pg-promise --save
```

Install any other dependencies you may want, like async, time and geo libs etc
```console
$ npm install async moment moment-timezone cors turf --save
```

Generate the react front-end app
```console
$ mkdir ~/challenge/client
$ cd ~/challenge/client
$ create-react-app client
```

Install any dependencies that might be useful, like maps
```console
$ npm install leaflet react-leaflet leaflet-rotatedmarker bootstrap react-bootstrap
```

Add a ```ecosystem.config.js``` for PM2 for both server and client
> See http://pm2.keymetrics.io/docs/usage/application-declaration/ for a guide

Server
 - Set "script" to 'bin/www' to startup
 - Create ".env" file for environment variables and add
 ```
DB_USERNAME=challenge
DB_PASSWORD=<password>
DB_NAME=challenge
DB_PORT=5432
DB_ADDRESS=localhost
PORT=3001
CORS_ORIGINS=https://<domain>,http://<bare_external_ip>:3000
```

Client:
 - Set "script" to 'npm' and "args" to 'run start' to startup
 - Create ".env" file for environment variables and add
	```
	PORT=3000
	REACT_APP_API_URL=https://<domain>/api
	```

## Add a Proxy to use for SSL termination and  API proxying
Install Nginx
```console
$ sudo apt-get install nginx nginx-extras
$ sudo useradd --no-create-home nginx
```
Add LetsEncrypt/Certbot to generate certificates
```console
$ echo 'deb http://ftp.debian.org/debian jessie-backports main' | sudo tee /etc/apt/sources.list.d/backports.list
$ sudo apt-get update
$ sudo apt-get install certbot -t jessie-backports
```

Edit the nginx.conf or create a new one
```console
$ sudo nano /etc/nginx/sites-available/default
```
My example configuration:
```
server {
        listen 80;
        listen 443 ssl;

        server_name <domain>;

	#SSL parameters
        ssl_certificate /etc/letsencrypt/live/<domain>/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/<domain>/privkey.pem;
        ssl_dhparam /etc/ssl/certs/dhparam.pem;

        ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
        ssl_prefer_server_ciphers on;
        ssl_ciphers "EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH";
        ssl_ecdh_curve secp384r1;
        ssl_session_cache shared:SSL:10m;
        ssl_session_tickets off;
        ssl_stapling on;
        ssl_stapling_verify on;
        resolver 8.8.8.8 8.8.4.4 valid=300s;
        resolver_timeout 5s;
        # Disable preloading HSTS for now.  You can use the commented out header line that includes
        # the "preload" directive if you understand the implications.
        #add_header Strict-Transport-Security "max-age=63072000; includeSubdomains; preload";
        add_header Strict-Transport-Security "max-age=63072000; includeSubdomains";
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;

	#Proxy /api to the back-end express app
        location /api/ {
                proxy_set_header X-Forwarded-For $remote_addr;
                proxy_set_header Host $http_host;
                proxy_pass "http://127.0.0.1:3001/";
        }

	#Allow lets-encrypt validations
        location ~ /.well-known {
                allow all;
        }

	#Proxy react socket connections for the react front-end
        location /sockjs-node {
                proxy_pass http://127.0.0.1:3000;
                proxy_http_version 1.1;
                proxy_set_header Upgrade $http_upgrade;
                proxy_set_header Connection "upgrade";
        }

	#Proxy react front end
        location / {
                proxy_set_header X-Forwarded-For $remote_addr;
                proxy_set_header Host $http_host;
                proxy_pass "http://127.0.0.1:3000";
        }
}
```

Generate the Diffie-Hellman params and SSL Certificates using LetsEncrypt
```
$ sudo certbot certonly -a webroot --webroot-path=/var/www/html -d <domain>
$ sudo openssl dhparam -out /etc/ssl/certs/dhparam.pem 2048
```

Start the proxy
```console
$ /etc/init.d/nginx start
```

## Bring up the back end and front end
```console
$ cd ~/challenge/server
$ pm2 start ecosystem.config.js
```
```console
$ cd ~/challenge/client
$ pm2 start ecosystem.config.js
```

## Watch the status/logs if necessary
```console
$ pm2 status
$ pm2 logs
```
## API Links for reference
> https://openweathermap.org/api

> https://opensky-network.org/apidoc/
