# Artichoke ComicBook Catalog

## Install Instructions

* Right now this project has packages from Bower, NPM and Composer. You must run the installs for all three before it will be up and running

* __Note__ This application still relies heavily on PHP and PEAR Packages. The quickest way to satisfy these requirements is to user Composer (the
PHP Package manager).

* There is a `composer.json` file in the app/root that needs to be run with the following command: `composer install`

* You can install composer via `brew` on OS X or by downloading the composer.phar file from the Composer website

* The application uses AngularJS 1.5 and can be run in the browser via `gulp` with the following command

* To start browser-sync and fire up a local server just type `gulp`  

## Update: May 30, 2019

This branch is way ahead of the Master branch and at this point `DOES NOT REQUIRE GULP`. It is using Webpack and Webpack-Dev-Server. Webpack is basically running an Express Server which then calls out api.php script. 

Webpack also handles bundling of SASS and JavaScript files.

__Note__ `src` is where Angular modules are before compiling

## Update: Sept 2017

There are two processes that you need to run the app. A backend service which is currently handled by `nodedemon` and runs the app in standalone mode at `localhost:3000` and a front end which you can run two ways depending on what you want to do. 

The frontend needs `Webpack` to handle javascript and scss compiling. So running `npm run wp` will start webpack in watch mode. If you want hot-reloading / browser-sync like features you JS and SCSS files then you would run `wp run dev-server`.

To just run the app you only need one command `npm run dev-server` which you can then use at `localhost:8080`. To work and recompile the app with reload you would wanr `npm run dev-client` if you want the hot reloading. If you do care about that, then `npm run wp` will do that same thing.

__Note__ `Nodedemon` is smart enough to reload the server when you save any file it's watching. Sometimes this cause the frontend client server to fail because it proxies to the backend for API calls and then it goes down it can throw and error before it reloads.

## Update: July 2017

`npm run dev-client` and then `npm run wp`

## Update: June 2017

Webpack-Dev-Server working. To run use NPM scripts.

`npm run dev-client` and `npm run dev-server`

## Update: May 2017

The project now requires Webpack to compile the JavaScript. All configurations can be found in the `webpack.config.js`in the project's root.

### Bugs
1. Delete issue, delete the entire series
2. When updating a Comic issue condition does not stay

## Requirements
1. A user can browse all titles, series and issues in a collection
2. A user can see meta data about the any issue
3. A user can see a photo of the cover with the metadata
4. An admin can add and remove titles, series and issue
5. An admin needs to be authenticated

## Upgrades
1. Refactor old SQL - remove EOF lines
2. Implement new Grid Class
3. Add autoload function spl_autoloaf
4. Add photos
5. Add multiple issues at once

### Dependencies
**Node, NPM, Webpack, SASS, Express, Angular 1.5.x**
