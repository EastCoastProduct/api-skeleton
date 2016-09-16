'use strict';

const clean = require('gulp-clean');
const gulp = require('gulp');
const eslint = require('gulp-eslint');
const shell = require('gulp-shell');
const nodemon = require('gulp-nodemon');
const tape = require('gulp-tape');
const istanbul = require('gulp-istanbul');
const sequence = require('run-sequence');
const tapColorize = require('tap-colorize');

const paths = {
  src: [
    'app.js',
    './routes/*.js',
    './controllers/**/*.js',
    './middleware/**/*.js',
    './models/*.js',
    './utils/**/*.js',
    '!./**/*.test.js'
  ],
  extra: [
    './utils/**/*.js',
    './migrations/**/*.js',
    './models/**/*.js'
  ],
  test: [
    './utils/test/setup.js',
    './controllers/**/*.test.js',
    './middleware/**/*.test.js',
    './models/**/*.test.js',
    './utils/*.test.js'
  ]
};

const database = (arg) => shell.task(`node utils/fixtures/index.js ${arg}`);
const migrate = (arg = 'development') => shell.task([
    `NODE_ENV=${arg} ./node_modules/.bin/sequelize db:migrate`,
    `NODE_ENV=${arg} ./node_modules/.bin/sequelize db:seed:all`
  ]);


gulp.task('clear-seeds', () => gulp.src('./seedManifest.js').pipe(clean()));


/*
  Database tasks
*/
gulp.task('db-recreate', database('recreate'));
gulp.task('db-recreate-dev', database('recreate dev'));
gulp.task('migrate', migrate());
gulp.task('migrate-test', migrate('test'));


/*
  Development tasks
*/
gulp.task('dev-rebuild', callback => {
  process.env.NODE_ENV = 'development';
  sequence('clear-seeds', 'db-recreate-dev', 'migrate', callback);
});

gulp.task('lint-src', () => {
  return gulp.src(paths.src.concat(paths.extra))
    .pipe(eslint())
    .pipe(eslint.format());
});

gulp.task('lint-test', () => {
  return gulp.src(paths.test)
    .pipe(eslint('./.eslintrc.test'))
    .pipe(eslint.format());
});

gulp.task('lint', ['lint-src', 'lint-test']);


/*
  Test tasks
*/
gulp.task('test', function() {
  process.env.NODE_ENV = 'test';
  gulp.src(paths.test)
    .pipe(tape({timeout: 14000, reporter: tapColorize()}))
    .once('end', () => {
      process.exit(); // eslint-disable-line
    });
});

gulp.task('test-cover', () => {
  process.env.NODE_ENV = 'test';
  gulp.src(paths.src)
    .pipe(istanbul())
    .pipe(istanbul.hookRequire())
    .on('finish', () => {
      gulp.src(paths.test)
        .pipe(tape({timeout: 14000, reporter: tapColorize()}))
        .pipe(istanbul.writeReports())
        .pipe(istanbul.enforceThresholds({
          thresholds: {
            global: {
              statements: 90,
              branches: 75,
              lines: 90,
              functions: 90
            },
            each: {
              statements: 70,
              branches: 50,
              lines: 75,
              functions: 85
            }
          }
        }))
        .once('end', () => {
          // small workaround as centos quits terminal before coverage is fully
          // printed out TODO: see exactly why this is happening
          setTimeout(() => process.exit(0), 10);
        });
    });
});

gulp.task('test-build', cb => {
  sequence('clear-seeds', 'migrate-test', 'test-cover', cb);
});

gulp.task('test-rebuild', cb => {
  sequence('clear-seeds', 'db-recreate', 'migrate-test', 'test-cover', cb);
});


/*
  Server debug tasks
*/
gulp.task('server-debug', () => {
  nodemon({
    script: './bin/www',
    nodeArgs: ['--debug']
  });
});

gulp.task('debug', ['server-debug'],
  shell.task('node-inspector --web-port=3465'));


