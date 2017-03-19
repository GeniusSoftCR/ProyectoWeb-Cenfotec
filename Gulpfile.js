'use strict'
var gulp = require('gulp'),
  sass = require('gulp-sass'),
  nib = require('nib'),
  connect = require('gulp-connect');

// Servidor web de desarrollo
gulp.task('connect', function () {
  connect.server({
    port: 8000,
    livereload: true
  })
})

// Preprocesador sass
gulp.task('css', function () {
  gulp.src('./css/sass/generalStyles.scss')
    .pipe(sass({ use: nib() }))
    .pipe(gulp.dest('./css'))
    .pipe(connect.reload())
})

// Vigila cambios que se produzcan en el código
// y lanza las tareas relacionadas
gulp.task('watch', function () {
  gulp.watch(['./css/sass/**/*.scss'], ['css'])
})

gulp.task('serve', ['css', 'connect', 'watch'])

