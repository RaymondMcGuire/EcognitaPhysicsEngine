var gulp = require('gulp'),
    browserSync = require('browser-sync').create();
rename = require('gulp-rename'),
    uglify = require("gulp-uglify"),
    concat = require('gulp-concat');

// Static Server + watching scss/html files
gulp.task('server', () => {

    browserSync.init({
        port: 3000,
        server: "./",
        ghostMode: false,
        notify: false
    });

    gulp.watch('**/*.html').on('change', browserSync.reload);
    gulp.watch('scripts/**/*.js').on('change', browserSync.reload);

});

//minify
gulp.task('minify', done => {
    gulp.src('./scripts/main.js')
        .pipe(uglify())
        .pipe(rename('epse.min.js'))
        .pipe(gulp.dest('./release/dist/js'));
    done();
});

gulp.task('minify_jqplot', done => {
    gulp.src(['./sim_physics/extlib/jqplot/jquery_1102.js', './sim_physics/extlib/jqplot/jquery_ui_1103.js', './sim_physics/extlib/jqplot/jquery_jqplot_108.js', './sim_physics/extlib/jqplot/plugins/*.js', './sim_physics/extlib/jqplot/plot2D_r82.js'])
        .pipe(concat('jqplot.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./sim_physics/release/dist/js'));
    done();
});