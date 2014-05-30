var gulp = require('gulp');
var tsc = require('gulp-tsc');
var react = require('gulp-react');
var source = require('vinyl-source-stream');
var browserify = require('browserify');
var concat = require('gulp-concat');
var es = require('event-stream');
var karma = require('gulp-karma');
var generateSuite = require('gulp-mocha-browserify-suite');

var options = {
    "sourceMap": true,
    "declaration": true,
    "emitError": false,
    "module": "commonjs",
    "target": "ES5"
};

gulp.task('jsx', function() {
    return gulp.src('src/**/*.jsx')
      .pipe(react())
      .pipe(gulp.dest('build/src'));
});

gulp.task('tsc', ['jsx'], function() {
    return es.merge(
        gulp.src('src/**/*.ts')
            .pipe(tsc(options))
            .pipe(gulp.dest('build/src')),
        gulp.src('test/**/*.ts')
            .pipe(tsc(options))
            .pipe(gulp.dest('build/test'))
    );
});

gulp.task('default', ['tsc'], function() {
    return browserify({entries: './build/src/app.js'})
        .bundle({ debug: true })
        .pipe(source('deps.min.js'))
        .pipe(gulp.dest('dist'));
});

gulp.task('test-suite', ['tsc'], function() {
    return gulp.src('build/test/**/*spec.js')
        .pipe(generateSuite())
        .pipe(concat('suite.js'))
        .pipe(gulp.dest('dist'));
});

gulp.task('test-browserify', ['test-suite'], function() {
    return browserify({entries: './dist/suite.js'})
        .bundle({ debug: true })
        .pipe(source('deps.min.js'))
        .pipe(gulp.dest('dist'));
});

gulp.task('test', ['test-browserify'], function(){
    return gulp.src('dist/deps.min.js')
        .pipe(karma({
            configFile: 'karma.conf.js',
            action: 'run'
        }));
});
