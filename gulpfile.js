// Gulp and node
var gulp = require('gulp');
var u = require('gulp-util');
var log = u.log;
var c = u.colors;
var del = require('del');
var spawn = require('child_process').spawn;
var tasks = require('gulp-task-listing');

// Basic workflow plugins
var prefix = require('gulp-autoprefixer');
var sass = require('gulp-sass');

// Performance workflow plugins
var concat = require('gulp-concat');
var mincss = require('gulp-minify-css');
var imagemin = require('gulp-imagemin');
var uncss = require('gulp-uncss');
var uglify = require('gulp-uglify');
var critical = require('critical');


// -----------------------------------------------------------------------------
// Remove old CSS
//
// This task only deletes the files generated by the 'sass' and 'css' tasks.
// The 'uncss' task is slow to run and less frequently needed, so we keep the
// build process fast by making uncss a manually-executed task.
// -----------------------------------------------------------------------------
gulp.task('clean-css', function() {
  return del(['css/{all,main}*'], function (err) {
    if (err) { log(c.red('clean-css'), err); }
    else {
      log(
        c.green('clean-css'),
        'deleted old stylesheets'
      );
    }
  });
});

// -----------------------------------------------------------------------------
// Sass Task
//
// Compiles Sass and runs the CSS through autoprefixer. A separate task will
// combine the compiled CSS with vendor files and minify the aggregate.
// -----------------------------------------------------------------------------
gulp.task('sass', function() {
  return gulp.src('_sass/**/*.scss')
    .pipe(sass({
      outputStyle: 'nested',
      onSuccess: function(css) {
        var dest = css.stats.entry.split('/');
        log(c.green('sass'), 'compiled to', dest[dest.length - 1]);
      },
      onError: function(err, res) {
        log(c.red('Sass failed to compile'));
        log(c.red('> ') + err.file.split('/')[err.file.split('/').length - 1] + ' ' + c.underline('line ' + err.line) + ': ' + err.message);
      }
    }))
    .pipe(prefix("last 2 versions", "> 1%"))
    .pipe(gulp.dest('css'));
});

// -----------------------------------------------------------------------------
// Combine and Minify CSS
//
// This task minifies all the CSS found in the css/ directory, including the
// uncss-ed copies of bootstrap. The end result is a minified aggregate, ready
// to be served.
// -----------------------------------------------------------------------------
gulp.task('css', ['clean-css', 'sass'], function() {
  return gulp.src('css/*.css')
    .pipe(concat('all.min.css'))
    .pipe(mincss())
    .pipe(gulp.dest('css'));
});


// -----------------------------------------------------------------------------
// UnCSS Task
//
// Checks the site's usage of Bootstrap and strips unused styles out. Outputs
// the resulting files in the css/ directory where they will be combined and
// minified by a separate task.
//
// Note: this task requires a local server to be running because it references
// the actual compiled site to calculate the unused styles.
// -----------------------------------------------------------------------------
gulp.task('uncss', function() {
  return gulp.src([
      'node_modules/bootstrap/dist/css/bootstrap.css',
      'node_modules/bootstrap/dist/css/bootstrap-theme.css'
    ])
    .pipe(uncss({
      html: [
        'http://localhost:4000/',
        'http://localhost:4000/audit/',
        'http://localhost:4000/foundation/',
        'http://localhost:4000/budgets/'
      ]
    }))
    .pipe(gulp.dest('css/'));
});

// -----------------------------------------------------------------------------
// Combine and Minify JS
//
// Just like the CSS task, the end result of this task is a minified aggregate
// of JS ready to be served.
// -----------------------------------------------------------------------------
gulp.task('js', function() {
  return gulp.src('_js/**/*.js')
    .pipe(concat('all.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('js'));
});

// -----------------------------------------------------------------------------
// Generate critical-path CSS
//
// This task generates a small, minimal amount of your CSS based on which rules
// are visible (aka "above the fold") during a page load. We will use a Jekyll
// template command to inline the CSS when the site is generated.
//
// All styles should be directly applying to an element visible when your
// website renders. If the user has to scroll even a small amount, it's not
// critical CSS.
// -----------------------------------------------------------------------------
gulp.task('critical', function (cb) {
  critical.generate({
    base: '_site/',
    src: 'index.html',
    css: ['css/all.min.css'],
    dimensions: [{
      width: 320,
      height: 480
    },{
      width: 768,
      height: 1024
    },{
      width: 1280,
      height: 960
    }],
    dest: '../_includes/critical.css',
    minify: true,
    extract: false
  });
});

// -----------------------------------------------------------------------------
// Minify SVGs and compress images
//
// It's good to maintain high-quality, uncompressed assets in your codebase.
// However, it's not always appropriate to serve such high-bandwidth assets to
// users, in order to reduce mobile data plan usage.
// -----------------------------------------------------------------------------
gulp.task('imagemin', function() {
  return gulp.src('_img/**/*')
    .pipe(imagemin({
      progressive: true,
      svgoPlugins: [{removeViewBox: false}]
    }))
    .pipe(gulp.dest('img'));
});

// -----------------------------------------------------------------------------
// Watch tasks
//
// These tasks are run whenever a file is saved. Don't confuse the files being
// watched (gulp.watch blobs in this task) with the files actually operated on
// by the gulp.src blobs in each individual task.
// -----------------------------------------------------------------------------
gulp.task('watch', function() {
  gulp.watch('_sass/**/*.scss', ['css']);
  gulp.watch('_js/**/*.js', ['js']);
  gulp.watch('_img/**/*', ['imagemin']);
});

// -----------------------------------------------------------------------------
// Performance Test: Phantomas
//
// Phantomas can be used to test granular performance metrics. This example
// ensures that the site never exceeds a specific number of HTTP requests.
// -----------------------------------------------------------------------------
gulp.task('phantomas', function() {
  var limit = 5;
  var phantomas = spawn('./node_modules/.bin/phantomas', ['--url', 'http://localhost:4000', '--assert-requests=' + limit]);

  // Uncomment this block to see the full Phantomas output.
  // phantomas.stdout.on('data', function (data) {
  //   data = data.toString().slice(0, -1);
  //   log('Phantomas:', data);
  // });

  phantomas.on('error', function (err) {
    log(err);
  });

  phantomas.on('close', function (code) {
    // Exit status of 0 means success!
    if (code === 0) {
      log('Phantomas:', c.green('✔︎ Yay! The site makes ' + limit + ' or fewer HTTP requests.'))
    }

    // Exit status of 1 means the site failed the test.
    else if (code === 1) {
      log('Phantomas:', c.red('✘ Rats! The site makes more than ' + limit + ' HTTP requests.'));
    }

    // Other exit codes indicate problems with the test itself, not a failed test.
    else {
      log('Phantomas:', c.bgRed('', c.black('Something went wrong. Exit code'), code, ''));
    }
  });
});

// -----------------------------------------------------------------------------
// Default: load task listing
//
// Instead of launching some unspecified build process when someone innocently
// types `gulp` into the command line, we provide a task listing so they know
// what options they have without digging into the file.
// -----------------------------------------------------------------------------
gulp.task('help', tasks);
gulp.task('default', ['help']);
