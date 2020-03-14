const gulp = require('gulp');
const sass = require('gulp-sass');
const browserify = require('browserify');
const babelify = require("babelify");
const uglify = require('gulp-uglify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const sourcemaps = require('gulp-sourcemaps');
const browserSync = require('browser-sync').create();
const imagemin = require('gulp-imagemin');
const cache = require('gulp-cache');
var del = require('del');
const reload = browserSync.reload;
const autoprefixer = require('gulp-autoprefixer');

const runSequence = require('gulp4-run-sequence').use(gulp);

function htmlFiles() {
  return gulp.src('./src/html/**/*.html')
            .pipe(gulp.dest('./dist'))
            .pipe(browserSync.stream());
}

function style() {
  return gulp.src('./src/scss/app.scss')
            .pipe(autoprefixer())
            .pipe(sass().on('error', sass.logError))
            .pipe(gulp.dest('./dist'))
            .pipe(browserSync.stream());
};

function es6Compile() {
  return browserify({debug: true})
            .transform(babelify.configure({
              presets: ["@babel/preset-env"]
            }))
            .require('./src/js/app.js', {entry: true})
            .bundle()
            .pipe(source('app.min.js'))
            .pipe(buffer())
            .pipe(uglify())
            .pipe(sourcemaps.init({loadMaps: true}))
            .pipe(sourcemaps.write('./maps'))
            .pipe(gulp.dest('./dist'))
            .pipe(browserSync.stream());
}

function public() {
  return gulp.src('./src/public/img/**/*.+(png|jpg|jpeg|gif|svg)')
            .pipe(cache(imagemin({
                  interlaced: true
                })))
            .pipe(gulp.dest('dist/images'));
}

function fonts() {
  return gulp.src('./src/public/fonts/**/*')
  .pipe(gulp.dest('dist/fonts'))
}

function watch() {
  browserSync.init({
    server: {
      baseDir: './dist'
    }
  });
  gulp.watch('./src/scss/**/*.scss', style);
  gulp.watch('./src/js/**/*.js', es6Compile);
  gulp.watch('./src/html/**/*.html', htmlFiles);
} 

function clean(done) {
  del.sync('dist');
  done();
}

exports.htmlFiles = htmlFiles;
exports.style = style;
exports.es6Compile = es6Compile;
exports.watch = watch;
exports.clean = clean;
exports.public = public;
exports.build = gulp.series(clean, gulp.parallel(htmlFiles,style,es6Compile,fonts,public), watch);