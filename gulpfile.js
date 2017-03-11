/* jshint node: true */
/* gulpfile.js */

var gulp   = require('gulp'),
    concat = require('gulp-concat'),
    sass   = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer');


// convert sass to css
gulp.task('styles', function () {
    gulp.src('src/css/**/*.scss')
        .pipe(concat('quotes_app.scss'))
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: ['last 2 versions']  // config object
        }))
        .pipe(gulp.dest('dist/css'));
});
