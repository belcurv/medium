#Writing Modular JavaScript  -  Pt 3

This is the third and final part in an introductory series on writing modular JavaScript applications. [Part 1](https://medium.com/@jrschwane/writing-modular-javascript-pt-1-b42a3bd23685) explained why modularity is desirable and presented a modular application design structure. In [part 2](https://medium.com/@jrschwane/writing-modular-javascript-pt-2-d7140d15c982), we built a simple application based on those principles. We will conclude the series by preparing our project for deployment.

![slice](../assets/slice_pt3.jpg)

###Introduction

We ended part 2 with a working modular web application.  We wrote our modules and stylesheets as separate files, linked together through our `index.html` and bootstrapped by our `app.js`. This is an efficient and scalable development process for all the reasons discussed in the part 1 of the series.

But it's a process that produced eight separate files. Our browser has to open and maintain eight separate http requests to retrieve each of those files, and that's before we include the hosted font or jQuery. Although our files are not large and modern browsers can make these requests in parallel, in a large application the cumulative latency of those requests would result in slower page loads. We can reduce the number of http requests through [concatenatation](https://en.wikipedia.org/wiki/Concatenation).

We can also increase performance through [minification](https://en.wikipedia.org/wiki/Minification_(programming)), a kind of compression where our function and variable names are replaced with smaller "tokens", and all comments, white space and line breaks are removed. This results in smaller file sizes, which means quicker page loads for users.

Our demo application includes a feature of es6/es2015: [template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals). Template literals are amazingly useful, but their backtick delimiters cause problems for some code minifiers. Furthermore, not every browser supports es6/es2015 syntax. So we want to [transpile](https://en.wikipedia.org/wiki/Source-to-source_compiler) our source code into traditional _every-browser-understands-it_ es5 JavaScript.

Finally, imagine that we composed our stylesheets with SASS instead of CSS. Browsers do not natively understand SASS, we want to convert that into regular CSS. We won’t actually rewrite our stylesheets — instead we’ll cheat a little for demonstration purposes. And while we’re at it, we want to add all necessary vendor-prefixed selectors so different browsers behave as expected.

That's a lengthly wish list.  In this article we will use [Gulp](http://gulpjs.com/) to provide solutions to each of the above "wants". Gulp will process our source files and create new production-ready files that we can use when deploying our application.

Although our demo is a _front-end_ application, because Gulp depends on [Node.js](https://nodejs.org/en/) - typically used in _back-end_ applications - the reader should have basic familiarity with Node and [NPM](https://www.npmjs.com/) and have them installed locally. If you do not, please refer to the [official docs](https://nodejs.org/en/download/package-manager/) for installation instructions. And if you would like to learn more, [Scotch.io](https://scotch.io/tag/node-js) has excellent Node.js resources.

Aside from a few Node-specific functions (`require` and `pipe`), the rest of our code will use regular es5 JavaScript. We will spend a bit of time in the command line, but you needn't be a CLI ninja.

###Application Structure

Part 2 left us with the following file/folder structure:

```
|-- /src
|    |
|    |-- /css
|    |    |
|    |    |-- app.css
|    |    |-- background.css
|    |    |-- greeting.css
|    |    |-- quote.css
|    |
|    |-- /js
|         |
|         |-- app.js
|         |-- background.js
|         |-- greeting.js
|         |-- quote.js
|
| index.html
```

We will work mainly in the root of our project folder; Gulp will be working on all those `/src` files.

###Initialization

Before we can install and use Gulp, use NPM to initialize a new project. While in our project’s root directory, issue the following terminal command:

`npm init -y`

You can omit the `-y` flag and NPM will ask you a series of questions about your project. `-y` just tells NPM to accept all the default answers. `npm init` creates a new `package.json` file in your project's root directory. It lists several properties of your application (all based on the answers to `npm init`'s questions).

###Gulp

Gulp is a Node.js _task runner_.  It has limited functionality by itself  - we will need to install a series of plug-ins before Gulp can solve the problems described in the introduction.

Gulp runs in the command line and installs using NPM. There are three installation phases: first install Gulp globally, then install the local project module, and finally install any needed plug-ins.

>You may need elevated priviledges to instal Gulp globally. You'll know if the installation errors out! In a Debian/Ubuntu environment you need to preface the installation command with `sudo`. Elevated privileges are not required to install the _local_ Gulp package or any of the plugins we need.

Install the global Gulp package using the following command (`sudo` as needed):

`npm install gulp-cli -g`

Once that has finished, install Gulp locally. Make sure you are still in your demo project's root folder, and issue the following command:

`npm install gulp --save-dev`

The `--save-dev` command-line switch tells NPM to register the package as a _developer dependency_ in `package.json`.  We will use that switch again when installing our Gulp plugins.

If you open `package.json` now, you'll see that it has a new `"devDependencies" : {...}` property listing "gulp" as its sole dependency. All of our various plugins will be registered here after we install them.  Let's do that now.

We need the following plugins:

1.  [gulp-concat](https://www.npmjs.com/package/gulp-concat) - to concatenate (merge together) our separate JavaScript and SASS files

2.  [gulp-sass](https://www.npmjs.com/package/gulp-sass) - to convert our `.scss` files into traditional `.css` files

3.  [gulp-autoprefixer](https://www.npmjs.com/package/gulp-autoprefixer) - to automatically add vendor-prefixed selectors to our stylesheets based on [CanIUse](http://caniuse.com/) rules

4.  [gulp-babel](https://www.npmjs.com/package/gulp-babel) - to transpile any es6 syntax into traditional es5 JavaScript using Babel

5.  [babel-preset-es2015](https://www.npmjs.com/package/babel-preset-es2015) - a preset Babel configuration

5.  [gulp-sourcemaps](https://www.npmjs.com/package/gulp-sourcemaps) - to generate a JavaScript [sourcemap](https://www.html5rocks.com/en/tutorials/developertools/sourcemaps/) so that when we're debugging we can make sense of the browser's console output

6.  [gulp-uglify](https://www.npmjs.com/package/gulp-uglify) - to minify our JavaScript

We install these plugins using NPM, again using the `--save-dev` switch to add each module to `package.json`. You can install each individually or all at once:

`$ npm install gulp-concat gulp-sass gulp-autoprefixer gulp-babel babel-preset-es2015 gulp-sourcemaps gulp-uglify --save-dev`

You may have noticed the new `node_modules` folder that was created in your project’s root directory. NPM stores everything required by our dependencies in there. We will not need to touch anything in `node_modules`.

>If you use Git for version control, now would be a good time to add `node_modules/` to your `.gitignore` file. There's no reason for us to track or push those files to a remote repository. Should they be deleted, we can easily recreate them with a single `npm install` command.

Our `"devDependencies"` object should now look like this (version numbers current as of publication date):

```javascript
"devDependencies": {
    "babel-preset-es2015": "^6.22.0",
    "gulp": "^3.9.1",
    "gulp-autoprefixer": "^3.1.1",
    "gulp-babel": "^6.1.2",
    "gulp-concat": "^2.6.1",
    "gulp-sass": "^3.1.0",
    "gulp-sourcemaps": "^2.4.1",
    "gulp-uglify": "^2.1.0"
}
```

Gulp has everything it needs to process our JavaScript and SASS files. Now let's put it to work.

###Processing CSS

We will use Gulp to process our separate stylesheets, convert SASS to CSS, add any necessary vendor-prefixed selectors and output the result as a single file. But we don’t technically have any SASS. Lucky for us, traditional CSS is also valid SASS, so we can fake it by just renaming the file extensions. In our project's `/src/css/` folder, rename all the `.css` files to `.scss`:

```
|-- /src
|    |
|    |-- /css
|    |    |
|    |    |-- app.scss
|    |    |-- background.scss
|    |    |-- greeting.scss
|    |    |-- quote.scss
```

_Et voilà: SASS!_

We now need to tell Gulp to do the work, and that means we need a **gulpfile**.  Create a `gulpfile.js` in your root project directory and begin by importing our plug-in modules:

```javascript
/* gulpfile.js */

var gulp         = require('gulp'),
    concat       = require('gulp-concat'),
    sass         = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    sourcemaps   = require('gulp-sourcemaps'),
    uglify       = require('gulp-uglify'),
    babel        = require('gulp-babel');
```

Gulp is a _task runner _ -  we need to give it a **task** before it will do any actual work. Gulp tasks are functions that accept two arguments: the task’s name (as a string) and a callback function:

```javascript
// example
gulp.task('taskName', function () {

    // do stuff

});

```

Let's add a `styles` task to our `gulpfile.js` after the required modules:

```javascript
/* gulpfile.js */

var gulp         = require('gulp'),
    concat       = require('gulp-concat'),
    sass         = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    sourcemaps   = require('gulp-sourcemaps'),
    uglify       = require('gulp-uglify'),
    babel        = require('gulp-babel');
    

// process stylesheets
gulp.task('styles', function () {

    gulp.src('src/css/**/*.scss')
        .pipe(concat('quote-app.scss'))
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: ['last 2 versions']  // config object
        }))
        .pipe(gulp.dest('dist/css'));

});
```

Inside the callback, `gulp.src()` expects the location of our `.scss` files as a string.  The wildcard `/**/` instructs Gulp to look for matching files in `/src/css` _and its subfolders_ - especially handy if you elected to organize your project folders _by feature_. Then we `.pipe()` those source files through each of our plugins (the arguments passed to each `.pipe()`), processing them along the way:

1.  The separate `.scss` files are first concatenated into a single `quote-app.scss` file
2.  the concatenated `.scss` file is then converted to a standard `.css` file
3.  then vendor-prefixed selectors are added based on the config object (ours targets the two most-recent browser versions)
4.  finally, the processed CSS file is written to `/dist/css/` (Gulp will create folders if they don't already exist)

Task #1: _done_. Run it from your terminal: `gulp styles`

![gulp styles terminal](../assets/gulp_styles.png)

Gulp created new file `/dist/css/quote-app.css` - take a look at it in your editor. All of our separate `.scss` files were merged, converted to `.css` and vendor-prefixed (specifically the _flexbox_ properties):

![processed css](../assets/gulp-css.png)

In `index.html`, we can now replace the four separate links to our original `/src/css/` files with a single `<link>` to our new `/dist/css/quote-app.css`:

```html
<!-- ===================== css ====================== -->
<link rel="stylesheet" href="dist/css/quote-app.css">
```

If you make changes to your source `/src/css` files, those changes will not propagate to the production `/dist/css/quote-app.css` unless you re-run `gulp styles`.  That's annoying; we'll learn how to automate this process after we deal with our JavaScript.

###Processing JavaScript

Before we write the task to process our JavaScript files, we need to mention a potential issue. In the preceding section we used `gulp.src('src/css/**/*.scss')` to grab any SASS files found in `src/css` and its subfolders. There’s no problem doing so with SASS/CSS because selector order doesn't matter - especially since we namespaced our selectors. But order is critical to our modules' JavaScript files - **our modules need to be initialized first** so that `app.js` can call their public methods.

We can specify the file order using an array containing our source file names. We'll pass this array to `gulp.src()` instead of a path string. Create the new array below our imported modules:

```javascript
/* gulpfile.js */

var gulp         = require('gulp'),
    concat       = require('gulp-concat'),
    sass         = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    sourcemaps   = require('gulp-sourcemaps'),
    uglify       = require('gulp-uglify'),
    babel        = require('gulp-babel');


// ordered array of javascript source files
var sourceJS = [
    'src/js/background.js',
    'src/js/greeting.js',
    'src/js/quote.js',
    'src/js/app.js'        // must come last!
];    
```

Now we add a `scripts` task after our existing `styles` task:

```javascript
/* ... snip ... */

// process scripts
gulp.task('scripts', function () {

    gulp.src(sourceJS)           // <-- our new array
        .pipe(sourcemaps.init())
        .pipe(concat('quote-app.min.js'))
        .pipe(babel({
            presets: ['es2015']  // babel config object
        }))
        .pipe(uglify())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('dist/js'));

});
```

After passing our array of source files to `gulp.src` we `.pipe()` them from one plugin to the next, just like we did in our `styles` task:

1.  We first initialize the `sourcemaps` plugin
2.  then we concatenate our separate files into a single `quote-app.min.js` file
3.  Babel then transpiles the the file, converting any es6/es2015 to traditional es5 using the specified  Babel preset
4.  then we minify the transpiled code
5.  a sourcemap is appended to the the end of our JavaScript
6.  and finally we output the processed file to `/dist/js/`

Task #2: _done_. Now run it in your terminal: `gulp scripts`

![gulp scripts terminal](../assets/gulp_scripts.png)

Open the newly-created `/dist/js/quote-app.min.js` in your editor to see the effects of `uglify`:

![processed javascript](../assets/gulp-js.png)

That illegible mess is functionally equivalent to all of our original source code. And if you think that's funky, _check out line 2_ - that nonselse is the sourcemap.

We can now replace the separate links to each of our application and module files with a single `<script>` tag:

```html
<!-- ================ our javascript ================== -->
<script src="dist/js/quote-app.min.js"></script>
```

>You may have noticed that the total size of our four original files (5.3kB) is actually _less_ than our minified `quote-app.min.js` (12.3kB). That doesn’t seem right - what's going on? Our minified file grew in  size because we appended the sourcemap to it. If we omit `sourcemaps`, our minified file weighs in at a lithe 1.6kB.

###Watching Files for Changes

As mentioned earlier, manually re-running Gulp tasks after each minor code change adds an annoying interruption to our work flow. Gulp is supposed to make life easier. This section will introduce one of Gulp’s greatest features: **watchers**. A watcher can automatically run tasks in response to events. Ours will watch our source `.scss` files for changes, and run our `styles` task in response.

But first we have to create a default task (unsurprisingly called `default`) to contain our watcher. Add this new task after our `scripts` task: 

```javascript
// default task contains our watcher
gulp.task('default', ['styles'], function() {
    
    // watch source sass files and convert on changes
    gulp.watch('src/css/**/*.scss', ['styles']);

});
```

This task’s construction a lightly different than our previous tasks. Notice the additional array passed to `.task()` as its second parameter - think of that as a list of the tasks we'll be using inside our `default` task. We write our watcher inside the task's callback using `gulp.watch()`. We pass it two parameters: the path to the files we want to watch, and an array of tasks to run when they change (we have only one task: `styles`).

Gulp `default` tasks can be exectued by just typing `gulp` - we do not need to provide the task's name. Because it initiates a watcher, when we run our `default` task it will execute but not terminate -  it continues to run, watching for additional changes to our files:

![gulp watcher stays running](../assets/gulp-watch.png)

So let's change something.  Currently, our quote text turns red (`color: #F33`) on hover - let's try a grey-blue instead. Make the following change to `/src/css/quote.scss`:

```css
#quote > a:hover {
    color: #AAF;
}
```

Keep an eye on your terminal window and save the file  - you’ll see Gulp re-run our `styles` task in response to the save event. Our `styles` task has generated a new `/dist/css/quote-app.css`, so our change is live - reload your browser window and behold:

![screenshot after gulp watch](../assets/blue-hover.jpg)

Automatic production-ready CSS and no more work-flow interruption.

###Summarizing

At the end of [part 2](https://medium.com/@jrschwane/writing-modular-javascript-pt-2-d7140d15c982), we had a perfectly functional modular application. We could have left it at that; we had achieved our design goals after all. But in the process, we introduced the potential for degraded performance: the browser has to make separate requests for all our modular files, which could negatively affect page load times.

Forseeing that problem, we used Gulp to process our source files and generate production-ready files in preparation for deployment. We added vendor-prefixed selectors to our CSS, and concatenated, transpiled and minified our source files. Finally, we added a watcher so that we wouldn’t need to manually rerun our task each time we made a change to our source stylesheets.

#Conclusion

This wraps up this series on writing modular JavaScript. It presents one method for planning and building modular applications that is easy to understand and implement, and does not require any exotic libraries or frameworks. This makes it well-suited for beginning JavaScript programmers.

You might ask, "why _not_ use a framework?"  It's a fair question -  Angular for example, is modular by design. I have nothing against frameworks (I **love** Angular), but time is precious. The modular structure described in parts 1 and 2 of this series can be used by anyone - it does not require that you spend time first gaining proficiency with a framework's syntax and methods. And thinking in terms of modular application design _now_ will help you understand the 'why and how' of frameworks like Angular _later_.

But ultimately, _modular design_ is more foundational and theoretical; framework or no framework, the applications you build will benefit from a sound foundation in modular thinking.  I hope you can translate these ideas to your own projects.
