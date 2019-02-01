var gulp = require('gulp'),
    browserSync = require('browser-sync').create();
rename = require('gulp-rename'),
    uglify = require("gulp-uglify");

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

gulp.task('minify', done => {
    gulp.src('./scripts/main.js')
        .pipe(uglify())
        .pipe(rename('epse.min.js'))
        .pipe(gulp.dest('./build/dist/js'));
    done();
});