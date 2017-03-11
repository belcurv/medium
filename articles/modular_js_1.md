#Writing Modular JavaScript  -  Pt 1

This is part 1 of a series on writing modular JavaScript applications. In [part 2](https://medium.com/@jrschwane/writing-modular-javascript-pt-2-d7140d15c982), we will actually build a simple modular application together. Finally, in part 3 we will use Gulp, the Node task runner, to prepare our files for deployment.

###Introduction

If you have so much as glanced at a computer programming language, you have surely heard the mantra: **Don't Repeat Yourself**. Basically, if you find yourself writing the same snippet of code more than once, you are better off sticking that code inside a function. In this post, I will show you how we can extend that mantra beyond its use within a single file. We'll apply the concept at the application level  -  within a single project and even across projects  -  by breaking monolithic applications into smaller, self-contained, reusable **modules**.

Maybe you want to use some previously-written utility in your new application  -  instead of rewriting the whole thing, you can just copy your file into your new project and link to it with a `<script>` tag. The time savings alone makes this a worthwhile endeavor.

But there's another, possibly greater benefit to modular design: it makes **collaborating with other people** a whole lot easier. When you are working with a team of developers, where each of you is creating a part of a larger application, you will eventually need to merge all of those separate parts together. If you've adopted a modular design structure in advance, joining everything up at the end is trivially easy. Develop modular habits today and you'll be the hero of your team tomorrow.

Finally, modular design patterns make it much easier to read your code. You should personally care about this because you (or others  -  see previous paragraph) will eventually have to make sense of code you previously wrote. The fewer lines of code, the quicker you and others can make sense of it. A module is _by definition_ a smaller, focused part of some larger whole.

This article is aimed at beginning JavaScript developers who already have some experience with the language, but who may not yet know how to structure code into modules, or why the modular design pattern is valuable.

I assume that you have basic familiarity with client-side / front-end JavaScript. My examples use a small amount of jQuery, but no other libraries or frameworks are required to get started. I will mention IIFEs and closures, but not go into too much detail about them here.

###Application Structure

A modular application begins with a solid file/folder structure. There are many ways to organize a project's files. I tend to use one of two ways: either by **type of file** (css, js, assets, etc.) or by **application feature** (header, landing, login, about, footer, etc). On large projects, organizing _by feature_ is almost a requirement. But we're going to use the simpler _by type_ system for this post.

```
|-- /dist
|    |
|    |-- /js
|    |-- /css
|    |-- /assets
|
|-- /src
|    |
|    |-- /js
|    |    |
|    |    | app.js
|    |    | module1.js
|    |    | module2.js
|    |    | module3.js
|    |
|    |-- /css
|    |    |
|    |    | style.css
|    |
|    |-- /assets
|         |
|         | image.jpg
|         | etc.jpg
|
|-- /node_modules
|
| .gitignore
| gulpfile.js
| package.json
| index.html
```

Briefly:

*   /dist - ultimately our production-ready files will live here. Gulp will create them later - we don't need to do anything here.

*   /src - we'll write all our in-development code here (css, JavaScript, etc). Later, Gulp will process these files to produce the files in `/dist`. The module file names used above are just examples - you should definitely use more meaningful file names!

*   /node_modules - Node for front-end apps? Yes! We will use Node and NPM to install and run Gulp tasks.

*   .gitignore - files and folders specified in this file will be ignored (not tracked) by Git. They also won't be pushed to GitHub. We'll be ignoring the `node_modules/` folder - no reason to track or push all those 3rd-party packages.

*   gulpfile.js - we'll write our Gulp concatenation, [transpilation](https://babeljs.io/) and minification tasks in here.

*   index.html - during development, we'll itemize each script separately. Later, we will just link to a single production-ready JavaScript file.

*   package.json - Created by NPM. Among other things, this file catalogs all the packages our application depends on. Ours will include dependencies for Gulp and various Gulp plugins.

###The Nitty and the Gritty

Let's begin by looking at the structure of our `index.html`. During development, we'll simply link to each of the JavaScript files in our `/src/js` folder. So our `index.html` might look like this:

```html
<!DOCTYPE html>
<html lang="en">
<head>
      <meta charset="UTF-8">
      <title>Nice Boilerplate</title>
</head>
<body>

    <!-- =============== vendor javascript ================ -->
    <script src="https://example.com/jquery.min.js"></script>

    <!-- ================ our javascript ================== -->
    <script src="src/js/module1.js"></script>
    <script src="src/js/module2.js"></script>
    <script src="src/js/module3.js"></script>
    <script src="src/js/app.js"    ></script>

</body>
</html>
```

Order is important! **Our modules must load first** so that their public methods are available to be called. That statement will make more sense as we progress. For now, know that `app.js` must load last because we're going to use it to call all our other modules' _public methods_. Other than that, it's just a normal `index.html` file. Scaffold your application as you would normally.

Things start to look a little different when we get to our `app.js` file:

```javascript
$(document).ready(function () {

    Module1.init();
    Module2.init();
    Module3.init();

);
```

That's it! If you're used to seeing/writing volumes of code inside of `$(document).ready()`, the above may look a little strange. Our `app.js` has only one responsibility: call our separate modules' `.init()` methods. All of the actual application logic resides in those other modules. Each time you add a new module to your application, you add a call to its `.init()` method here. Easy and organized.

Because we use `app.js` to _bootstrap_ our other modules, it now makes sense that index.html has to load those modules first. If the modules were loaded after `app.js`, calling their `.init()` methods would fail.

We will write each module in a separate file to promote reuse. And we'll adopt the style known as the [revealing module pattern](https://addyosmani.com/resources/essentialjsdesignpatterns/book/#revealingmodulepatternjavascript). The "revealing" qualifier hints at the module's internal structure: some features are private, others are _revealed_ publicly.

Here's an example:

```javascript
var Module1 = (function() {

    'use strict';

    // placeholder for cached DOM elements
    var DOM = {};


    /* =================== private methods ================= */

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
        render(); // etc
    }

    
    // render DOM
    function render() {
        DOM.$someElement
            .html('<p>Yeah!</p>');
    }
    

    /* =================== public methods ================== */

    // main init method
    function init() {
        cacheDom();
        bindEvents();
    }


    /* =============== export public methods =============== */

    return {
        init: init
    };

}());
```

We begin by declaring a variable (`Module1`) and assigning a function to it. **All of the module's code goes inside this function**.

Note that the function is both (wrapped in parentheses and ends with another set of parentheses)()):

```javascript
var Module1 = (function () {

    // all module logic goes here

}());
```

The parentheses `()` at the end causes the function to be interpreted and _evaluated_ as an expression. This is known as an IIFE, or Immediately [Invoked Function Expression](http://gregfranko.com/blog/i-love-my-iife/). The IIFE means we don't call the function separately  -  the function is called when the JavaScript engine assigns it to our variable. And that happens as soon as the module loads. The wrapping `()` are not technically required, but are used by convention to let other programmers know that this function is an IIFE.

In addition to "auto-loading" our module, the function also creates its own **local scope** for all the variables and functions within it. Anything declared inside a function is scoped to the function  -  it can't be called or referenced outside of the function (except when it can! We'll get to this shortly). Isolating scope this way also prevents adding all kinds of variables and functions to the global scope.

Within the IIFE, our example module uses `/* comments */` to organize its contents into four sections.

At the very beginning we declare all required module-scope variables. Standard stuff you already do  -  no big deal. This example only declares a single variable, an empty object that will cache a DOM element.

Next we define a few _private methods_. The example methods are commonly found in many front-end applications: `cacheDom()`, `bindEvents()`, and `render()`. They do exactly what you expect them to do. Additional private methods might handle form submission, AJAX requests, manipulating JSON responses, etc. What's important to note is that these methods are **private**  -  we don't need or want them to be available outside of the module they're defined in. And they're not, because they're encapsulated within our IIFE. For example, there's no reason for any module's `bindEvents()` function to be available globally  -  it's irrelevant to any other module, so we keep it private.

> Also note that multiple modules can have the same private functions. They will never collide with each other because they are restricted to each module's local function scope. Beyond that, each module can have the same public methods as well, since each of those is _namespaced_ to its own module. For example, you might have the three modules, each with the same public method: `modals.init()`, `greeting.init()`, `login.init()`. Those identically-named methods will never collide with each other because they're all called on unique modules. Very courteous.

In the next section we define our _public methods_. In this case we only have one: `init()`. But you could have any number of them. Notice that `init()` does only one thing: make calls to our _private methods_. When called, `init()` _closes over_ the private module-scoped variables and functions, making them available outside the scope they were declared in (yay, [closure](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures)).

You may ask, "what makes the `init()` function public?  -  it looks just like the other private functions above it." Good question  -  now go to the next paragraph!

The final section returns an object literal. **This is what makes the revealing module pattern so cool**. What we're returning is essentially a set of "links" to any private methods that we want to make public outside our module. This allows us to separate the private and public parts of our modules, and  -  to answer the preceding paragraph's question  -  is what makes `init()` a public method.

Remember that an object's properties are `{ key : value }` pairs:

```javascript
return {
    init : init
};
```

In the above, the left-hand 'key' is the name of the method we'll call _outside our module_. The right-hand 'value' refers to the name of the function defined _inside the module_. Although it looks strange to see `init : init`, it's common practice to use the same name externally that we use internally. It's also one less name you have to remember.

###Bringing Everything Together

By returning public methods via the object literal, we "attach" them to the variable that we declared at the beginning: `Module1` gets the `init()` method. And because `Module1` was declared globally, **it and its public methods are available in the global namespace**. Once a module exposes its public methods globally, any other module can call those methods. So we can call `Module1.init()` anywhere we like  -  which is exactly what we did earlier in `app.js`. `Module1` might have additional public methods  -  those can be called anywhere in the application as well.

See how it's all starting to fit together? And how, in a team setting, each team member can work independently and then publish their module's public methods, adding any necessary calls to their module's public method(s) in `app.js`?

I typically limit each module to a single **unique application feature** or a single **unique application utility**. An application feature might have many private methods and not need anything other than a single `init()` method exposed publicly. In contrast, a utility module might have few (or zero) private methods and instead expose all its methods publicly. And utility modules may not need `init()` methods at all.

###Summarizing

We break our application logic into chunks based on single feature or utility. Each team member composes their module(s) as an IIFE, consisting of all the business logic needed by the module. Each module reveals specific public methods, which can be called elsewhere in the application. Our main `app.js` bootstraps those modules by calling each of their public `init()` methods. Other project team members recognize your brilliance and buy you mint juleps.

#Up Next: Let's Build a Modular App!

Now that we understand the principles of basic modular application design, we'll put them to use building a simple web application in [part 2](https://medium.com/@jrschwane/writing-modular-javascript-pt-2-d7140d15c982).
