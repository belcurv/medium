# INTRO

// todo

# NITTY

When I'm writing vanilla JS or jQuery front-end apps, I structure the project files like this:

```
|--/node_modules
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
|--/dist
|    |
|    |--/js
|    |--/css
|    |--/assets
|
| .gitignore
| gulpfile.js
| package.json
| index.html
```

I build everythig in `/src`. Later on, we'll concatenate, transpile and minify the source files with Gulp and output them in the `/dist` folder.

# GRITTY
 
Ok, in the root director we find our traditional `index.html` file.  While I'm still developing an app, I simply link to each separate JS file in the `/src/js` folder in `index.html`.  For example:

```html
<script src="src/js/module1.js"> </script>
<script src="src/js/module2.js"> </script>
<script src="src/js/module3.js"> </script>
<script src="src/js/app.js"> </script>
```

*Order is important.* `app.js` must load last because we're going to use it to call all our _other_ modules' public methods.  Our modules must load first so their public methods are available to be called.
 
Going forward, my examples will use jQuery.  The concepts apply to vanilla JS as well.  Our `app.js` might look like this:

```javascript
$(document).ready(function () {

    Module1.init();
    Module2.init();
    Module3.init();

);
```

Note that all `app.js` does it call our separate modules' `.init()` methods.  That's it!  All the actual app logic is written inside each module - `app.js` just collects and bootstraps them once the DOM is finished loading.
 
On to the modules.  One module might look like the following.  Note that we're using an IIFE to "auto-load" the module and scope local variables and functions to the module.

```
var Module1 = (function($) {

    var DOM = {};


    // cache DOM elements
    function cacheDom() {
        DOM.$someElement = $('#some-element');
    }
    

    // bind events
    function bindEvents() {
        DOM.$someElement.click(handleClick);
    }


    // handle click event
    function handleClick(e) {
        render();   // etc
    }
    

    // render DOM and call RepoSelect.getRepos()
    function render() {
        DOM.$someElement
            .html('<p>Yeah!</p>');
    }

	
    // public init method
    function init() {
        cacheDom();
        bindEvents();
    }

    
    // export public methods
    return {
        init: init
    };

}(jQuery));
```

This coding style is sometimes called the 'module pattern' or the 'revealing module pattern'.  It's also comparable to Angular JS (1.x) factories.
 
A lot of front-end modules will have `cacheDom()`, `bindEvents()`, `render()` and `init()` methods.
Most of which are private module-scoped functions.  For example, there's no reason for a module's `cacheDom()` function to be available globally.

You could have any number of private variables and functions inside the module - whatever your modules needs or wants.
But we need some things to be globally available, so at the very end of the each module we return an object literal that contains all the methods we need to be public.  In the example above, I'm only returning `init`.  init() is made public this way.  Note that all init() does is call the module's private methods.

What this does is sort of attach `init()` to `Module1` as a method.  Because we declared Module1 the way we did (`var Module1 = ...`), it _and its public methods_ are available in the global namespace.  So elsewhere we can call `Module1.init()` - which is exactly what we do inside `app.js`.  Once it's globally available, any other module can call that module's public methods.
 
I write modules typically for 2 things: unique app features, or unique app utilities.  An app feature might not need anything other than it's `init` method exposed publicly.  But a utility module might expose several public methods, and _not_ need an `init` method at all.  Only publicly expose methods that absolutely must be globally available.

I didn't write like this until working with a team.  In a team setting, where different people are working on different modules that all have to connect together, this sort of modular structure / style is really helpful.  Everyone's modules can use the public functions and methods from each others modules.

# NEXT STEPS - GULP
 
Once you have a bunch of separate JS modules, all linked up through your `app.js` you may want to concatenate, transpile (es6 > es5), and minify them all into a single JS file before deployment.  This is where Gulp comes in.  Gulp is really easy to use, even if you have limited experience with Node/NPM.
