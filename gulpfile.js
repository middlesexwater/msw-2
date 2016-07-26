var gulp = require("gulp");
var sass = require("gulp-sass");
var browserSync = require("browser-sync").create();
var useref = require("gulp-useref");
var uglify = require("gulp-uglify");
var gulpIf = require("gulp-if");
var cssnano = require("gulp-cssnano");
// var imagemin = require("gulp-imagemin");
// var cache = require("gulp-cache");
var del = require("del");
var runSequence = require("run-sequence");
var deploy = require('gulp-gh-pages');

/**
 * Push build to gh-pages
 */
gulp.task('deploy', function () {
    return gulp.src("./dist/**/*")
        .pipe(deploy())
});

// FIXME: there is a problem with imagemin and tracking bug rn
gulp.task("images", function () {
    return gulp.src("app/images/**/*.+(jpg|jpeg|png|svg|gif)")
        // .pipe(cache(imagemin()))
        .pipe(gulp.dest("dist/images"))
});

gulp.task("useref", function () {
    return gulp.src("app/*.html")
        .pipe(useref())
        .pipe(gulpIf("*.js", uglify()))
        .pipe(gulpIf("*.css", cssnano()))
        .pipe(gulp.dest("dist"))
});

gulp.task("fonts", function () {
    return gulp.src("app/fonts/**/*")
        .pipe(gulp.dest("dist/fonts"))
});

gulp.task("clean:dist", function () {
    return del.sync("dist");
});

// TODO: optional--clears local cached images
// gulp.task("cache:clear", function(callback) {
//    return cache.clearAll(callback);
// });

gulp.task("sass", function () {
    return gulp.src("app/scss/**/*.scss")
        .pipe(sass())
        .pipe(gulp.dest("app/css"))
        .pipe(browserSync.reload({
            stream: true
        }))
});

gulp.task("watch", ["browserSync", "sass"], function () {
    gulp.watch("app/scss/**/*.scss", ["sass"]);
    gulp.watch("app/*.html", browserSync.reload);
    gulp.watch("app/js/**/*.js", browserSync.reload);
});

gulp.task("browserSync", function () {
    browserSync.init({
        server: {
            baseDir: "app"
        }
    });
});

gulp.task("build", function (callback) {
    runSequence("clean:dist", ["sass", "useref", "fonts", "images"], callback);
});

gulp.task("default", function (callback) {
    runSequence(["sass", "browserSync", "watch"], callback);
});