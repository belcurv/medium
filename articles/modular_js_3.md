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

Gulp installs as two parts: a _global_ module and a _local_ per-project module. Note: to install Gulp globally in Debian/Ubuntu varieties of linux you need to preface the command with `sudo`.

Global: `~/Documents/code/quote_app$ sudo npm install gulp-cli -g`

Local: `~/Documents/code/quote_app$ npm install gulp --save-dev`

The `--save-dev` command-line switch tells NPM to register the package as a developer dependency in `package.json`.  We're going to use that switch when installing all of the Gulp accessory packages we need.

Take a look at `package.json` now - you'll notice NPM has added a new property:

```javascript
"devDependencies": {
    "gulp": "^3.9.1"
}
```

There is also a new `node_modules` folder in our root directory. NPM stores all the files required by our dependencies in this folder. We do not need to manually do anything in there.

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

###Gulp Plugins





###Summarizing


#That's It!

Thanks, etc

Now that we understand the principles of basic modular application design, we'll put them to use building a simple web application in [part 2](https://medium.com/@jrschwane/writing-modular-javascript-pt-2-d7140d15c982).
