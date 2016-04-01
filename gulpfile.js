var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');

gulp.task('default', ['compile']);

gulp.task('compile', function() {
  // browserify Native/main.js -o Native/Falcor.js

  var b = browserify();
  b.add('./src/Falcor.js');
  return b.bundle()
    .pipe(source('Falcor.js'))
    .pipe(gulp.dest('Native'));
});

gulp.task('watch', ['compile'], function() {
  gulp.watch('src/*.js', ['compile']);
})
