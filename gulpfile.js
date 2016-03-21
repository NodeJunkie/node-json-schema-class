/** Welcome the the json-schema-class gulpfile! */

require('babel-core/register');
const gulp = require('gulp');
require('gulp-release-it')(gulp);

//Test Runner & Code Coverage
const mocha = require('gulp-mocha');
const istanbul = require('gulp-babel-istanbul');
const coverageEnforcer = require("gulp-istanbul-enforcer");

//Documentation
const esdoc = require("gulp-esdoc");
const ghPages = require('gulp-gh-pages');

//Gulp Tools
const watch = require('gulp-watch');
const plumber = require('gulp-plumber');
const injectModules = require('gulp-inject-modules');

//Compilation
const babel = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');

//NodeJS Tools
const jsonfile = require('jsonfile');
const acquit = require('acquit');
const fs = require('fs');
const path = require('path');

/**
 * The Main Gulp Tasks
 */
gulp.task('default', ['build', 'watch']);

var reporters = {
  mocha: {reporter: 'min'},
  istanbul: {reporters: ["lcov", "json"]}
};

/**
 * The CI Checkerz
 */
if(process.env.CI){
  reporters = {
    mocha: {reporter: 'spec'},
    istanbul: {reporters: ["lcov", "text", "json"]}
  };
}

gulp.task('publish', ['deploy-docs']);
if (process.env['TRAVIS_BRANCH'] === "master") {
  gulp.task('publish', ['deploy-docs', 'release']);
}

gulp.task('build', ['compile', 'docs', 'test', 'enforce-code-coverage', 'enforce-doc-coverage']);
/**
 * Global Paths for the Gulp Task Runner
 * @type {{src: string[], tests: string[], docs: string, coverage: string}}
 */
const paths = {
  base: './src',
  src: ['src/**/*.js', '!src/**/*-test.js'],
  tests: ['src/*-test.js'],
  docs: './docs/**/*',
  coverage: 'coverage'
};


/**
 * Watcher Configuration
 * @type {{src: {path: *[], tasks: string[]}, cov: {path: string[], tasks: string[]}}}
 */
const watcher = {
  src: {
    path: [paths.src, paths.tests],
    tasks: ['test', 'docs']
  },
  cov: {
    path: ["./coverage/**/*"],
    tasks: ['enforce-code-coverage', 'enforce-doc-coverage']
  }
};
//File Watchers
gulp.task('watch', () => {
  gulp.watch(watcher.src.path, watcher.src.tasks);
  gulp.watch(watcher.cov.path, watcher.cov.tasks);
});


/**
 * Documentation Generation and Publishing
 * @type {{src: string, deploy: {force: boolean}, config: {destination: string, excludes: string[], plugins: *[], test: {type: string, source: string, includes: string[]}}}}
 */
const docs = {
  src: paths.docs,
  deploy: {
    force: true
  },
  config: {
    "destination": "./docs",
    "excludes": ["-compiled\\.(js)$"],
    "plugins": [
      {"name": "esdoc-es7-plugin"}
    ],
    "test": {
      "type": "mocha",
      "source": "./src",
      "includes": ["-test\\.(js)$"]
    }
  }
};

if(process.env.CI){
  var accessToken = process.env.GH_ACCESS_TOKEN;
  docs.deploy = {
    force: true,
    remoteUrl:  'https://' + accessToken + '@github.com/NodeJunkie/node-json-schema-class.git'
  };
}
//Generate Documentation
gulp.task('docs', () => {
  return gulp.src("./src")
    .pipe(esdoc(docs.config));
});
//Deploy Documentation to Githup Pages
gulp.task('deploy-docs', function () {
  return gulp.src(docs.src)
    .pipe(ghPages(docs.deploy));
});
//Enforce Documentation Coverage
gulp.task('enforce-doc-coverage', function () {
  var options = {
    threshold: 85,
    coverageDirectory: './docs'
  };
  var cov = jsonfile.readFileSync(options.coverageDirectory + "/coverage.json");
  if (cov && ( options.threshold > parseFloat(cov.coverage)))
    throw new Error(`Expected ${options.threshold}% coverage, got ${cov.coverage}`)
});


/**
 * Compilation and Transpile of ES6 to ES5
 * @type {{path: string, src: string[], babelrc: {presets: string[], ignore: string}}}
 */
const build = {
  path: 'lib',
  src: paths.src,
  babelrc: {
    presets: ['es2015', 'stage-0'],
    ignore: '**/*-test.js'
  }
};
//Compile ES6 to ES5 with source maps
gulp.task('compile', () => {
  return gulp.src(build.src)
    .pipe(sourcemaps.init())
    .pipe(babel(build.babelrc))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(build.path));
});


/**
 * The Tests for this Module
 */
gulp.task('test', (cb) => {
  gulp.src('src/**/*.js')
    .pipe(istanbul())
    .pipe(injectModules()) // or you could use .pipe(injectModules())
    .on('finish', () => {
      gulp.src('src/**/*-test.js')
        .pipe(babel())
        .pipe(injectModules())
        .pipe(mocha(reporters.mocha))
        .pipe(istanbul.writeReports(reporters.istanbul))
        .on('end', cb);
    });
});

gulp.task('enforce-code-coverage', function () {
  var options = {
    thresholds: {
      statements: 90,
      branches: 90,
      lines: 90,
      functions: 95
    },
    coverageDirectory: '',
    rootDirectory: 'coverage'
  };
  return gulp.src('coverage')
    .pipe(coverageEnforcer(options))

});

gulp.task('test-docs', () => {
  generateTestBasedDocs('./src/SchemaClass-test.js');
});

function generateTestBasedDocs(filePath) {
  var pathname = path.basename(path.dirname(filePath));
  var isSub = false;
  if (pathname !== "src") isSub = true;

  var content = fs.readFileSync(filePath).toString();

  // Parse the contents of the test file into acquit 'blocks'
  var blocks = acquit.parse(content);
  var header = require('fs').readFileSync('./.github/HEADER.md').toString();

  var mdOutput = header + '\n\n';

// For each describe() block
  for (var i = 0; i < blocks.length; ++i) {
    var describe = blocks[i];
    mdOutput += '## ' + describe.contents + '\n\n';
    mdOutput += describe.comments[0] ?
    acquit.trimEachLine(describe.comments[0]) + '\n\n' :
      '';

    // This test file only has it() blocks underneath a
    // describe() block, so just loop through all the
    // it() calls.
    for (var j = 0; j < describe.blocks.length; ++j) {
      var it = describe.blocks[j];
      mdOutput += '#### It ' + it.contents + '\n\n';
      mdOutput += it.comments[0] ?
      acquit.trimEachLine(it.comments[0]) + '\n\n' :
        '';
      mdOutput += '```javascript\n';
      mdOutput += '    ' + it.code + '\n';
      mdOutput += '```\n\n';
    }
  }

  if (!isSub)
    require('fs').writeFileSync('./README.md', mdOutput);
  else
    require('fs').writeFileSync('./src/' + pathname + '/README.md', mdOutput);


}