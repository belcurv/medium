#Writing Modular JavaScript  -  Pt 3

This is part 3 of a series on writing modular JavaScript applications. [Part 1](https://medium.com/@jrschwane/writing-modular-javascript-pt-1-b42a3bd23685) explained why modularity is desirable and presented a simple modular application design structure. In [part 2](https://medium.com/@jrschwane/writing-modular-javascript-pt-2-d7140d15c982), we built a simple modular application based on those principles. In this concluding article we will prepare our files for deployment.

![slice](img)

###Introduction

When we concluded part 2, we had a working modular web application.  We wrote our main our modules and their stylesheets as separate files, linked together in our `index.html` and main `app.js`. This is an efficient and scalable development process for all the reasons discussed in the previous two articles.

But eight separate files (not including our font and jQuery) means our browser has to make eight separate http requests to fetch our application's files. Although browsers make requests in parallel and even though our files not large, in a larger project the cumulative latency of all those requests will delay our application's load time. We should always strive to increase performance, especially when it can be achieved with minimal effort.

We can further decrease load times through [minification](https://en.wikipedia.org/wiki/Minification_(programming)). Minification is a form of compression where function and variable names are replaced with smaller characters, and comments, whitespace and line breaks are removed. This results in smaller file sizes, which results in quicker load times for clients.

The demo application's code includes a feature of es6: [template literals]((https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals).  Template literals are very useful, but their delimiting backticks can cause problems for some minifiers. To work around this problem, we need to [transpile](https://en.wikipedia.org/wiki/Source-to-source_compiler) our code from es6 to regular every-browser-understands-it es5 JavaScript.

Finally, we are going to pretend that we wrote SASS instead of CSS. We're not going to actually write SASS - we're just going to rename our `.css` files to `.scss`. Browsers do not natively understand `.scss` files, so we need a way to transpile those as well. While we're at it, we should probably add all the selector vendor prefixes so different browsers behave as expected.

We will use [Gulp](http://gulpjs.com/) to solve each of the above problems.  Gulp can concatenate (merge), minify and transpile our source files, renaming and outputting them to a destination directory of our choosing.

###Node.js and NPM

This will not be a detailed tutorial on [Node.js](https://nodejs.org/en/) - there are [many existing resources](https://scotch.io/tag/node-js) for that already. I assume you know what Node and NPM (the Node Package Manager) are and have them installed locally.  If you do not, please see the [official docs](https://nodejs.org/en/download/package-manager/).  We will only use two Node-specific features: `require` and `pipe`. The rest of our Gulp code will be regular JavaScript. We will, however, spend most of our time in the command line.

###Application Structure

When we wrapped up part 2 we were looking at this file/folder structure:

```
|-- /src
|    |
|    |— /css
|    |    |
|    |    |-- app.css
|    |    |-- background.css
|    |    |-- greeting.css
|    |    |-- quote.css
|    |
|    |-- /js
|    |    |
|    |    |-- app.js
|    |    |-- background.js
|    |    |-- greeting.js
|    |    |-- quote.js
|
| index.html
```

###Initialization

Before we can install and use Gulp, we need to initialize our project. In terminal, in your project's root directory:

`~/Documents/code/quote_app$ npm init -y`

The `init` command tells NPM to initialize the project; the `-y` flag accepts all the defaults.  A new file has been created in your project's root directory: `package.json`. It lists several properties of the application. We will not need to edit this file manually.


###Gulp

Gulp installs as two parts: a _global_ module and a _local_ per-project module. Note: to install Gulp globally in Debian/Ubuntu varieties of linux you need to preface the command with `sudo`.  Install Gulp globally first:

`$ sudo npm install gulp-cli -g`

The `-g` flag tells NPM to install a package globally - meaning it will be available to any and every other Node application. Now install Gulp locally:

`$ npm install gulp --save-dev`

The `--save-dev` command-line switch tells NPM to register the package as a developer dependency in `package.json`.  We will use that switch when installing all of the Gulp plugin as well.

Take a look at `package.json` now - you'll notice NPM has added a new property:

```javascript
"devDependencies": {
    "gulp": "^3.9.1"
}
```

Also note that a new `node_modules` folder has been created in our root directory. NPM stores all the files required by our dependencies in this folder. We do not need to manually do anything in there.

If you're tracking changes to your project with Git, create a `.gitignore` file and add `node_modules/` to it.  The files and subfolders in `node_modules` are not our own, and there's no reason for us to track them or push them to a remote repository.

Our directory structure now looks like this:

```
|-- /src
|    |
|    |— /css
|    |    |
|    |    |-- app.css
|    |    |-- background.css
|    |    |-- greeting.css
|    |    |-- quote.css
|    |
|    |-- /js
|    |    |
|    |    |-- app.js
|    |    |-- background.js
|    |    |-- greeting.js
|    |    |-- quote.js
|
|-- /node_modules
|
| .gitignore
| index.html
| package.json
```

Let's get to work.

###Processing CSS

In the introduction I mentioned that we'll transpile our SASS to CSS.  We don't technically have any SASS, and that's a topic for another article, so we'll fake it for now.  In our project's `/src/css/` folder, rename all the `.css` files to `.scss`. We want this:

```
|-- /src
     |
     |— /css
          |
          |-- app.scss
          |-- background.scss
          |-- greeting.scss
          |-- quote.scss
```

Gulp plugins extend Gulp's default abilities. We need plugins for:

1.  **concatenation** - [gulp-concat](https://www.npmjs.com/package/gulp-concat) will merge all our separate files together
2.  **SASS -> CSS** - [gulp-sass](https://www.npmjs.com/package/gulp-sass) will transpile our `.scss` files into traditional `.css` files
3.  **vendor prefixing** - [gulp-autoprefixer](https://www.npmjs.com/package/gulp-autoprefixer) will automatically add vendor-prefixed selectors to our stylesheets based on [CanIUse](http://caniuse.com/) rules

We install those plugins using NPM. Again, use the `--save-dev` switch to add these modules to our `package.json` file:

`$ npm install gulp-concat gulp-sass gulp-autoprefixer --save-dev`

Gulp now has everything it needs to process our SASS files. We still need to tell Gulp to do the work, and that means we need a `gulpfile.js`.  Create one in the root project directory and `require` all necessary modules:

```javascript
/* gulpfile.js */

var gulp   = require('gulp'),
    concat = require('gulp-concat'),
    sass   = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer');

```

Gulp is a _task runner_, so we need to give it a task before it will work for us.  Let's add one to our `gulpfile.js`:

```javascript
/* gulpfile.js */

var gulp   = require('gulp'),
    concat = require('gulp-concat'),
    sass   = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer');


// convert sass to css
gulp.task('styles', function () {
    gulp.src('src/css/**/*.scss')
        .pipe(concat('quotes_app.scss'))
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: ['last 2 versions']  // config object
        }))
        .pipe(gulp.dest('dist/css'));
});
```

We define the task with `gulp.task()`, which takes two arguments:

1.  the name of our task as a string (`'styles'`)
2.  an anonymous callback that actually does the work

Inside the callback, `gulp.src()` expects the location of our `.scss` files a string.  The wildcard `/**/` instructs Gulp to look into subfolders for `.scss` files to add to the task.  After that, we simply `.pipe()` the output of one method into the next method:

1.  We fist concatenate the files into a single `quotes_app.scss` file
2.  then transpile the resulting `.scss` to a `.css` file, logging any errors
3.  then we add any vendor prefixes based on the config object (in this case, we target the last two versions of all browsers)
4.  finally we output our processed CSS file to `/dist/css/` which Gulp creates on the fly.

That's all it takes.  Run the task from your terminal:

`$ gulp styles`

```
[17:20:34] Using gulpfile ~/Documents/code/quote_app/gulpfile.js
[17:20:34] Starting 'styles'...
[17:20:34] Finished 'styles' after 12 ms
```

Now take a look at `/dist/css/quotes_app.css` - the output of our Gulp task. All of our separate `.scss` files were merged, converted to `.css` and vendor-prefixed (the _flexbox_ properties specifically):

![processed css](../assets/gulp-css.png)

We can now replace the links to our four separate CSS files in `index.html` with a single  `<link>` and our application should continue to function normally:

```html
    <!-- ===================== css ====================== -->
    <link rel="stylesheet" href="dist/css/quotes_app.css">

</head>

```

Excellent - that takes care of the stylesheets.  Remember, if you make changes to the source `/src/css` files, you need to re-run `gulp styles` before those changes will propagate to our production CSS file in `/dist/css`.  We'll learn how to automate this step later on.

###Processing JavaScript

We will follow a similar strategy to process our modules' JavaScript files. The processing we require is different and necessitates installing a different set of Gulp plugins:

1.  **concatenation** - we'll reuse __gulp-concat__ for this
2.  **es6 -> es5** - [gulp-babel](https://www.npmjs.com/package/gulp-babel) will transpile any es6 into traditional es5 JavaScript. Babel accepts a configuration object that depends on a separate NPM package ([babel-preset-es2015](https://www.npmjs.com/package/babel-preset-es2015))
3.  **sourcemap generation** - [gulp-sourcemaps](https://www.npmjs.com/package/gulp-sourcemaps) will generate JavaScript a [sourcemap](https://www.html5rocks.com/en/tutorials/developertools/sourcemaps/) so that the browser's console output is actually useful when debugging errors.
4.  **minification** - [gulp-uglify](https://www.npmjs.com/package/gulp-uglify) will strip out all whitespace, comments and line breaks, and rename all variables and functions with shorter characters

Install the above with NPM (skip `gulp-concat` - it's already installed):

`$ npm install gulp-babel babel-preset-es2015 gulp-sourcemaps gulp-uglify --save-dev`

Gulp now has everything it needs to process our JavaScript.  We need to create a new task in our `gulpfile.js`, but before that we need to `require` our new modules:

```javascript
/* gulpfile.js */

var gulp   = require('gulp'),
    concat = require('gulp-concat'),
    sass   = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    sourcemaps   = require('gulp-sourcemaps'),
    uglify = require('gulp-uglify'),
    babel  = require('gulp-babel');
```

We also need to explicity tell `gulp-concat` in what order to add our JavaScript files.  Remember that our modules need to be initialized _before_ `app.js` - we specify file order using an array consisting of our source files as strings:

```javascript
/* gulpfile.js */

var gulp   = require('gulp'),
    concat = require('gulp-concat'),
    sass   = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    sourcemaps   = require('gulp-sourcemaps'),
    uglify = require('gulp-uglify'),
    babel  = require('gulp-babel');
    
// order is important for gulp-concat
sourceJS = [
    'src/js/background.js',
    'src/js/greeting.js',
    'src/js/quote.js',
    'src/js/app.js'        // *must* come last
];
    
    
```

Now we can add a `scripts` task to actually use these modules. Add it beneath our `styles` task:

```javascript
// process scripts
gulp.task('scripts', function () {
    gulp.src(sourceJS)
        .pipe(sourcemaps.init())
        .pipe(concat('dev-dash.js'))
        .pipe(babel({
            presets: ['es2015']  // babel config object
        }))
        .pipe(uglify())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('dist/js'));
});
```

The task begins by defining a name (`scripts`). Inside the callback function we hand `gulp.src` our array of source files and then `.pipe()` the output from one method to the next:

1.  We fist concatenate the files into a single `quotes_app.scss` file
2.  then transpile the resulting `.scss` to a `.css` file, logging any errors
3.  then we add any vendor prefixes based on the config object (in this case, we target the last two versions of all browsers)
4.  finally we output our processed CSS file to `/dist/css/` which Gulp creates on the fly.




###Summarizing


#That's It!

Thanks, etc

Now that we understand the principles of basic modular application design, we'll put them to use building a simple web application in [part 2](https://medium.com/@jrschwane/writing-modular-javascript-pt-2-d7140d15c982).
