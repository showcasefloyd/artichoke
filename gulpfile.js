"use strict";

let gulp = require('gulp');
let sass = require('gulp-sass'),
    browserSync = require('browser-sync'),
    nodemon = require('gulp-nodemon'),
    webpack = require('webpack-stream'),
    jshint = require('gulp-jshint');

const PATHS = {
    sass: './src/sass/**/*.scss',
    js: './src/modules/js/**/*.js',
    html: './app/**/*.html',
    css: './app/build/css',
    root: './app'
};

//  Webpack Bundle
// gulp.task('webpack',['jshint'],() => {
gulp.task('webpack',() => {
    return gulp.src(PATHS.js)
        .pipe(webpack(require('./webpack.config.js')))
        .pipe(gulp.dest('./app/build/js'));
})

// JS Linting
gulp.task('jshint', () => {
    console.log("JS Linting");
    return gulp.src(['app/index.js', 'app/build/js/**/*.js']).
        pipe(jshint()).
        pipe(jshint.reporter("default"));
});

// SASS Tasks
gulp.task('sass', () => {
    return gulp.src(PATHS.sass).
        pipe(sass()).
        pipe(gulp.dest('./app/build/css')).
        pipe(browserSync.stream());
});

gulp.task('bs-reload', () => {
    console.log("Reloading");
    browserSync.reload();
})

// Browser Sync Server
gulp.task('browser-sync', ['nodemon'], () => {

    browserSync.init({
        proxy: "http://localhost:3000",
        port: 8000,
        //server ".app/"
    });


});

// These tasks setup nodemon.
gulp.task('nodemon', (cb) => {
    var started = false;

    return nodemon({
        watch: ["app/index.js"],
        script: "app/index.js",
    })
    .on('start', function() {
        // to avoid nodemon being started multiple times
        if (!started) {
            cb();
            started = true;
        }
    });
});

gulp.task('default', ['browser-sync'], function () {

    gulp.watch('app/build/js/**/*.js', ['bs-reload']);

    gulp.watch(PATHS.js ,['webpack']);

    gulp.watch(PATHS.sass, ['sass']);

    gulp.watch(PATHS.html, ['bs-reload']);
});
