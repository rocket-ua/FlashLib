var gulp = require('gulp');
var concat = require('gulp-concat');

gulp.task('build', function() {
    return gulp.src('./jsfl/FlashLib/*.js')
        .pipe(concat('FlashLib.jsfl'))
        .pipe(gulp.dest('./jsfl/'));
});