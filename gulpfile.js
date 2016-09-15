'use strict';

const gulp = require('gulp');
const eslint = require('gulp-eslint');
const shell = require('gulp-shell');
const mocha = require('gulp-mocha');
const istanbul = require('gulp-istanbul');
const sequence = require('run-sequence');


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
const migrate = (arg) => (arg === 'test')
  ? shell.task('NODE_ENV=test ./node_modules/.bin/sequelize db:migrate')
  : shell.task('./node_modules/.bin/sequelize db:migrate');

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

gulp.task('test-cover', () => {
  process.env.NODE_ENV = 'test';
  gulp.src(paths.src)
    .pipe(istanbul())
    .pipe(istanbul.hookRequire())
    .on('finish', () => {
      gulp.src(paths.test)
        .pipe(mocha({timeout: 14000}))
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

gulp.task('db-recreate-dev', database('recreate dev'));
gulp.task('migrate', migrate());

gulp.task('dev-rebuild', callback => {
  process.env.NODE_ENV = 'development';
  sequence('db-recreate-dev', 'migrate', callback);
});
