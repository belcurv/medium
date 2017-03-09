#Introduction

This article is aimed at beginner to intermediate JavaScript developers who already have some experience writing JavaScript, but who may not yet know how to structure code into modules, or why the modular design pattern is valuable.

You have surely already heard the cardinal programming rule _Don't Repeat Yourself_: if you have to write some snippet of code more than once, stick that code in a function instead.  We can extend that idea further - from one project to another - by breaking our monolithic applications into smaller, *reusable* modules.  Want to use some utility module in a new application?  No need to re-write the whole thing; just copy your previously-written file into your current project and link to it with a `<script>` tag.  The time savings alone makes this a worthwhile endeavor.

But there's another, possibly greater benefit to modular design: it makes collaborating with other people a whole lot easier.  When you are working with a team of developers, where each of you is creating a part of a larger application, you will eventually need to merge all of those separate parts together.  If your team agrees on a modular design structure in advance, joining everything up at the end is trivially easy.  Develop modular habits today and you'll be the hero of your team tomorrow.

Finally, modular design patterns make it *much easier* to read your code.  You should personally care about this because you (or others - see previous paragraph) will eventually have to revisit some code and make sense of it all.  This is made easier with modular, self-contained chunks of code.

This article assumes that you have some familiarity with client-side (front-end) JavaScript.  My examples will use a small amount of jQuery, but no other libraries or frameworks.  I will mention IIFEs and closures, but not go into too much detail about them here.  The Gulp section assumes you have only basic familiarity with Node (really just `require` and `pipe`) and NPM (for installing Gulp and its accessory packages).  There is a Definitions / Resources section at the very end.

With that out of the way, let's be about it!

#Application Structure 

A modular scheme begins with a solid file/folder structure. There are many different ways to organize a project's files. When I'm writing a vanilla JS or jQuery front-end app, I structure the project folders and files in one of two ways: by **type of file** (css, js, assets, etc.) or by **feature** (header, landing, about, footer, etc).  On large projects, organizing by feature becomes almost a requirement.  But we're going to use the simpler _by type_ system for this article.

```
|--/dist
|    |
|    |--/js
|    |--/css
|    |--/assets
|
|--/src
|    |
|    |--/js
|    |   |
|    |   | app.js
|    |   | module1.js
|    |   | module2.js
|    |   | module3.js
|    |
|    |--/css
|    |   |
|    |   | style.css
|    |
|    |--/assets
|        |
|        | image.jpg
|        | etc.jpg
|
|--/node_modules
|
| .gitignore
| gulpfile.js
| package.json
| index.html
```

Briefly:

1.  `/dist` - this is where our production-ready files will go later.
2.  `/src` - this contains all our _in-development_ css, javascript and other assets.  These will be used later to produce the files in `/dist`. The file names used above are just examples - you should obviously use filenames with semantic meaning.
3.  `/node_modules` - Node modules for front-end apps?  Yes!  We will be using Node and NPM to install and run Gulp tasks.
4.  `.gitignore` - the files and folders in this file will not get pushed to github.  For our purposes, we'll only include `node_modules/`.
5.  `gulpfile.js` - we'll build our Gulp concatenation, transpilation and minifaction tasks in here.
6.  `index.html` - During development, we'll itemize all our scripts here. Later, it will just link to a single production-ready JavaScript file.
7.  `package.json` - Created by NPM, this file will catalog all the packages our app depends on. Ours will deal with Gulp and Gulp accessory packages.

# The Nitty and the Gritty

As noted above, we will write our application's files in the `/src` folders. Later on, we'll use Gulp to concatenate, transpile and minify our `/src` files and save them to our `/dist` folder.

For now, let's look at the basic structure of a traditional `index.html` file.  During development, we'll simply link to each of the JavaScript files in our `/src/js` folder. Our `index.html` might look like this:

####`/index.html`


```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Nice Boilerplate, Pal</title>
</head>
<body>
    
    <!-- ===================== vendor javascript ====================== -->
    <script src="https://example.com/for/example/jquery.min.js"></script>

    <!-- ====================== our javascript ======================== -->
    <script src="src/js/module1.js"> </script>
    <script src="src/js/module2.js"> </script>
    <script src="src/js/module3.js"> </script>
    <script src="src/js/app.js"> </script>
    
</body>
</html>```

*Order is important!* Our modules must load first so that their _public methods_ are available to be called. This will make more sense as we go.  But remember: your `app.js` must load last because we're going to use it to call all our other modules' _public methods_.  Otherwise, it's just a normal `index.html` file.  You can craft your app as you normally would.

Things start to look different when we look at our `app.js` file.  Our's looks like this:

####`/src/js/app.js`


```javascript
$(document).ready(function () {

    Module1.init();
    Module2.init();
    Module3.init();

);
```

If you're used to writing volumes of code inside of `$(document).ready()`, the above may look a little strange.  The only thing that our `app.js` does is call the separate modules' `.init()` methods.  That's it!  All of the actual application logic resides in those other modules.  Each time you add a new module to your application, you just add a call to its `.init()` method here.

Our `app.js` collects and bootstraps our modules once the DOM has finished loading.  Now you can see why we load our modules first in `index.html`.  If the modules were loaded _after_ `app.js`, calling their `.init()` methods would fail.

Our modules too look a little different.  Specifically, we're going to write them in a style commonly called the "revealing module pattern" (some sources shorten this to just the "module pattern").  I like the "revealing" qualifier, because it hints at the internal structure of the module: some features are private, others are _revealed_ to the public.  Here's an example module:

####`/src/js/module1.js`

```javascript
var Module1 = (function() {

    'use strict';

    // placeholder for cached DOM elements
    var DOM = {};


    /* ========================== private methods ======================== */

    // cache DOM elements
    function cacheDom() {
        DOM.$someElement = $('#some-element');
    }
    

    // bind events
    function bindEvents() {
        DOM.$someElement.click(handleClick);
    }


    // handle click events
    function handleClick(e) {
        render();   // etc
    }
    

    // render DOM
    function render() {
        DOM.$someElement
            .html('<p>Yeah!</p>');
    }

	
    /* ========================== public methods ========================= */
    
    // main init method
    function init() {
        cacheDom();
        bindEvents();
    }

    
    /* ======================= export public methods ===================== */
    
    return {
        init: init
    };

}());
```

We begin be assigning a function to the variable `Module1`.  All of the module's code will reside within this function.  Note that the function is wrapped in parentheses and ends with another set of parentheses:

```javascript
var Module1 = (function () {
    // IIFE - wrapped in parens w/parens at the end
}());
```

The set of `()` at the end turns the function into an expression.  This is known as an "IIFE", or Immediately Invoked Function Expression.  This means that we don't need to call the function separately - the function is called as soon as the JavaScript engine asigns it to our variable.  The surrounding `()` are not technically required, but are used by convention to let other programmers know that this function is an IIFE.

In addition to "auto-loading" our module, the function also creates its own local scope for all the variables and functions inside the function.  Anything decalred inside a function is scoped to the function - it can't be called or referenced outside of the function (except when it can! We'll get to this shortly).  We isolate scope with a function so that we're not addding all kinds of variables and functions to the global scope.
 
The example module above uses `// comments` to organize its code into four sections.

At the very top we just declare any variables we need in our module.  Standard stuff - no big deal.  The example only decalres one variable, an empty object that will receive some cached DOM elements.

Then we define our _private methods_ (functions) that are common in many front-end applications: `cacheDom()`, `bindEvents()`, and `render()`.  They do exactly what you expect them to do: handling the inner workings of your module's feature or utility functions.  They interact with the DOM, fetch JSON from APIs, manipulate data, etc.  What's important to note is that they're **private** - we don't need or want them to be available outside of the module they're defined in.  For example, there's no reason for one module's `bindEvents()` function to be available globally - it's irrelevant to any other module, so avoid polluting the global scope.

Aside --
Also note that multiple modules can have the same private functions.  They will never collide with each other because they are restricted to each module's function scope.  And actually, each module can have the same public methods as well, since each of those is _namespaced_ to its own module.  For example, you might have the following three modules, each with its own public `.init()` method: `modals.init()`, `greeting.init()`, `login.init()`.  Those identically-named methods will never collide with each other becuase they're all called on unique modules.

In the next section we define our _public methods_.  In this case we only have one: `init()`.  But you could have any number of them.  Notice that all our `init()` function does is call our private methods.  It _closes over_ module scoped variables and functions (closure!).  You may ask, "what makes this function public - it looks just like the other private functions above it?"  Please see the next paragraph dear reader!

The final section just returns an object literal.  Remember that an object's properties are `key : value` pairs.  What we're returning is a set of "links" to any private methods that we want to make available outside our module.  This is what allows us to separate private and public parts of our modules, and what makes `init()` a _public_ method.

```javascript
return {
    init : init
};

```

In the above, the left-hand 'key' is the name of the method we'll call _outside_ our module.  The right-hand 'value' refers to the name of the function _inside_ our module's IIFE.  Although it looks strange to see `init : init`, it's common practice to use the same name externally that we used internally.  It's also one less name you have to remember.

#The Glue

Returning our public methods through the object literal "attaches" them to the variable that we declared at the beginning (`Module1`).  And because `Module1` was declared globally, **it and its public methods** are available in the global namespace.  Once a module exposes its public methods globally, any other module can call those methods.  So we can call `Module1.init()` anywhere we like - just like we did earlier in `app.js`.

See how it's all starting to fit together?

I typically separate code into modules for unique app **features** and unique app **utilities**.  An app feature might have many private methods and not need anything other than its `init` method exposed publicly.  But a utility module might have few (or zero) private methods and instead expose a bunch of public methods.  Utility modules may not need an `init` method at all.

#Next Steps - Gulp
 
Once you have a bunch of separate JS modules all linked together by your `app.js`, you may want to concatenate, transpile (es6 > es5), and minify them all into a single JS file before deployment.  This is where utilities like Gulp, Grunt and Webpack come in.  Gulp is really easy to use, so we'll be using it.  But this article is already long, so we'll postpone Gulp for now and discuss it in a follow-up article.
