var gulp = require("gulp"),
    concat = require("gulp-concat"),
    rename = require("gulp-rename"),
    sourcemaps = require('gulp-sourcemaps'),
    minify = require("gulp-minify"),
    watch = require("gulp-watch"),
    run = require("gulp-run"),
    path = require("path");

function getFileList() {
  
  return require("./match.json").map(function(fileName) {
    return path.join(__dirname, "/../", fileName) + ".js";
  });
  
}

gulp.task("default", function() {

  return gulp.src(getFileList())
          .pipe(sourcemaps.init())
          .pipe(concat("matchBuild.js"))
          .pipe(sourcemaps.write())
          .pipe(minify())
          .pipe(gulp.dest("build/"));
    
});

gulp.task("develop", function() {

  return gulp.src(getFileList())
          .pipe(sourcemaps.init())
          .pipe(concat("matchBuild.js"))
          .pipe(sourcemaps.write())
          .pipe(gulp.dest("build/"));
          
});

gulp.task("watch-develop", ["develop"], function() {
  gulp.watch(path.join(__dirname, "/../") + "**/*.js", ["develop"]);
});

gulp.task("run-server", function() {
  run("node app.js");
});