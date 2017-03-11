#Writing Modular JavaScript — Pt 2

This is part 2 in a series on writing modular JavaScript applications. [Part 1](https://medium.com/@jrschwane/writing-modular-javascript-pt-1-b42a3bd23685) explained why modularity is desirable and presented a simple modular application design structure. In this part we will actually build an application using those principles. In part 3 we will use Gulp, the Node task runner, to prepare our application for deployment.

###Introduction

In this instalment we will write a simple application applying the modular design concepts discussed in part 1 of the series. Our application will have multiple features, each controlled by its own module and written as a separate file.

Remember that modular code helps satisfy the design goals we set in part 1: encourage code reuse (modules “plug-in” to projects), enhance code legibility (smaller, more-focused code is  easier to make sense of), and facilitate collaboration (modules reveal a standard API for easy interconnection).

The demo application will be  simple by design — our goal is to understand the modular design concepts by putting them into practice, not to explore in-depth any features of the JavaScript language. You should have some familiarity with client-side / front-end JavaScript and jQuery. We use jQuery because it simplifies AJAX and DOM manipulation. We will use a few [promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) and [es6 template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals), but nothing too abstract or complex.


###Application Features

We are going to build a random quote application. If you've worked through [Free Code Camp](https://www.freecodecamp.com)'s front-end curriculum, you have probably already built one. We'll add a few extra features to ours for additional practice writing and wiring up modules.

Our application will consist of:

1.  a **greeting** feature that displays a different message based on the time of day,

2.  a **random background image** feature that asynchronously gets an image from a remote service and displays it as our background, and

3.  a **random quote** feature that makes an AJAX request to a remote API, processes the response and displays the quote in our view.


###Application Structure

We start with a simplified version of the _by type_ structure described in part 1 of this series. We don't need a `/dist` folder or anything related to Node just yet -  we'll add those in part 3. Begin by creating a project directory that contains the following files and sub-folders:

```
|— /src
|    |
|    |— /css
|    |
|    |— /js
|
| index.html
```

###Initial Boilerplate

Our `index.html` will load our separate application and module files, and define some "containers" for our feature modules to hook into. For now, we need a basic html5 document with a links to a font, our main stylesheet and jQuery, and `<div>`s for our features.


```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  
  <title>Modular Random Quote Machine</title>
  
  <!-- ==================== fonts ===================== -->
  <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto+Condensed">
  
  <!-- ===================== css ====================== -->
  <link rel="stylesheet" href="/src/css/app.css">

</head>
<body>

  <div id="background"></div>

  <div class="container">
    <div id="greeting"></div>
    <div id="quote"></div>
  </div>
  
  <!-- =============== vendor javascript ================ -->
  <script src="https://code.jquery.com/jquery-3.1.1.js"></script>
  
  <!-- ================ our javascript ================== -->

</body>
</html>
```

Let's create our application's main stylesheet now too. Create a new file `app.css` in your `/src/css` folder:

```css
/* /src/css/app.css */

html,
body {
  margin: 0;
  padding: 0;
}

body {
  background-color: #222;
  color: #fff;
  font-family: 'Roboto Condensed', sans-serif;
}

.container {
  display: flex;
  height: 100vh;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
```

With that out of the way, we can start writing our feature modules.

###Random Background Feature

We already know that our application needs three features, but what about those features  - what do they need? You can easily structure your modules by answering that question.

For example, our backgrounds module needs to:

1.  cache DOM elements,
2.  asynchronously get an image,
3.  assemble an element using the image we received,
4.  render that to the DOM, and
5.  initialize itself somehow.

You can convert and use that list of requirement as pseudo code in your module -  instant function documentation! Let's write the module - create a new file `background.js` in your `/src/js/` folder:

```javascript
* /src/js/background.js */

var Background = (function() {
  
  'use strict';
  
  // placeholder for cached DOM elements
  var DOM = {};
  
  
  /* =================== private methods ================= */
  
  // cache DOM elements
  function cacheDom() {
    DOM.$background = $('#background');
  }


  // coordinate async assembly of image element and rendering
  function loadImage() {
    var baseUrl = 'https://source.unsplash.com/category',
        cat     = 'nature',
        size    = '1920x1080';
    $.when(buildElement(`${baseUrl}/${cat}/${size}`))
      .done(render);
  }

  
  // assemble the image element
  function buildElement(source) {
    
    var deferred = $.Deferred(function (task) {
      var image = new Image();
      
      image.onload = function () {
        task.resolve(image);
      };
      
      image.onerror = function () {
        task.reject();
      };
      
      image.src = source;
    
    });
    
    return deferred.promise();
  }
  

  // render DOM
  function render(image) { 
    DOM.$background
      .append(image)
      .css('opacity', 1);
  }


  /* =================== public methods ================== */
  
  // main init method
  function init() {
    cacheDom();
    loadImage();
  }


  /* =============== export public methods =============== */
  return {
    init: init
  };

}());
```

This module appends an `<img>` to our target `<div>` once it receives an image from [unsplash](https://source.unsplash.com).  There's a bit of promise voodoo going on in there, because getting the image is [asynchronous](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Synchronous_and_Asynchronous_Requests) - we can't set an image's `src` attribute until we actually have a image!  So we have to wait; promises  happen to excel at waiting.  We'll see them again in the random quote  feature.

Now that we have a module, we should load it with a `<script>` tag in `index.html`.  But our app still won't do anything because we haven't written our `app.js`. You can manually call `Background.init()` in your browser's console, but that's ... um, not the best user experience! Remember: `app.js` bootstraps our modules. Let's instruct it to do so — create a new file `app.js` in your `/src/js/` folder:

```javascript
/* /src/js/app.js */

$(document).ready(function () {

  Background.init();

});
```

That's it for now  - we'll add more as we complete additional modules. Recap: our `app.js` has only one job: to call our modules' public methods once the document has finished loading. At this point, you can launch `index.html` in your browser and it will fetch and display a random image. Yay  -  it works!  Also boo  -  it looks like crap!  Let's fix that with a bit of CSS.

> Just like we are writing separate JavaScript files for each module, we will write separate stylesheets for each feature. This makes it even easier to reuse a whole module  -  javascript and CSS  -  in another application. Just copy both files. Don't forget to `<link>` to the separate stylesheet(s) in the `<head>` of your `index.html`.

Create a new file `background.css` in your `/src/css/` folder:

```css
/* /src/css/backgrounds.css */

#background {
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  width: 100%;

  background-attachment: fixed;
  background-position: bottom center;
  background-repeat: no-repeat;
  background-size: cover;

  opacity: 0;
  transition: opacity 0.75s linear;

  z-index: -1;
}

#background > img {
  height: 100vh;
  width: 100vw;
  object-fit: cover;
}
```

The above CSS positions, sizes and anchors the image on the page, and sets the opacity of the containing `<div>` to `0` - meaning it will be invisible.  The `<div>` begins life invisible so that our module's `render()` function can _fade-in_ the background feature using a CSS opacity transition.

> It's a good idea to _namespace_ each selector in your module stylesheets. Otherwise you may  accidentally override some other stylesheet's rules. For example, above we always include our feature's selector when referring to any child elements: `#backgrounds > img`.   We might have other modules with images, and we wouldn't want our background feature's rules to affect them.

That wraps up the random background feature  -  not too bad, right? The other modules follow a similar pattern.

###Greeting Feature

Define the module's requirements  -  this module needs to:

1.  cache DOM elements,

2.  determine the time of day,

3.  craft a greeting based on the time of day,

4.  render the greeting to our view, and

5.  provide us some way to initialize it.

We'll add a random name picker for fun. Create new file `greeting.js` in your `/src/js/` folder:

```javascript
/* /src/js/greeting.js */

var Greeting = (function() {
    
  var DOM = {},
      names = [
        'handsome',
        'smarty pants',
        'good looking',
        'classy',
        'junior dev',
        'Mr Roboto'
      ],
      dummy = selectName();
  
  
  /* =================== private methods ================= */
    
  // cache DOM elements
  function cacheDom() {
    DOM.$greeting = $('#greeting');
  }
    
    
  // pick a name from names array
  function selectName() {
    var ind = Math.floor(Math.random() * names.length);
        
    return names[ind];
  }

    
  // assemble time-based greeting message
  function makeMessage() {
    var timeOfDay,
        theDate = new Date(),
        theHour = theDate.getHours();
        
    if (theHour < 12) {
      timeOfDay = "morning";
    } else if (theHour >= 12 && theHour < 17) {
      timeOfDay = "afternoon";
    } else {
      timeOfDay = "evening";
    }

    return `Good ${timeOfDay}, ${dummy}.`;  // :D
  }
    
    
  // render DOM
  function displayMessage() {
    DOM.$greeting
      .text(makeMessage());
  }
    
    
  /* =================== public methods ================== */
    
  // main init method
  function init() {
    cacheDom();
    displayMessage();
  }
    
    
  /* =============== export public methods =============== */
  return {
    init: init
  };
    
}());
```

This module crafts a custom greeting using a name from the `names` array and a specific  message that depends on the current time.  Add a `<script>` tag to `index.html` for our new module, and include a call to its public `init()` method in `app.js`:

```javascript
/* /src/js/app.js */

$(document).ready(function () {

  Background.init();
  Greeting.init();

});
```

Let's quickly style our greeting.  Add a new file `greeting.css` to the `/src/css/` folder:

```css
/* /src/css/greeting.css */

#greeting {
  font-size: 4em;
  font-weight: bold;
  text-align: center;
  text-shadow: 0 0 30px #000;
}
```

Reload thy browser and be greeted!  On to our final feature...

###Random Quote Feature

Like we did with our previous modules, begin by defining what this module needs to do:

1. cache DOM elements,
2. fetch a random quote from a remote API,
3. process the JSON response,
4. render the quote to the DOM, and
5. provide us some way to initialize it.

> Note: you may have difficulty getting the API to respond if you are not serving your application from a proper server. Both Chrome and Firefox threw up CORS errors when I loaded the static files directly in those browsers. Brackets _Live Preview_ works fine. Hosting anywhere (GitHub pages, for example) would also work.

Create a new file `quote.js` in your `/src/js/` folder:

```javascript
/* /src/js/quote.js */

var Quote = (function () {

    'use strict';

    var DOM = {};


    /* =================== private methods ================= */

    // cache DOM elements
    function cacheDom() {
        DOM.$quoteFeature = $('#quote');
        DOM.$quoteLink    = $(document.createElement('a'));
        DOM.$author       = $(document.createElement('p'));
    }


    // get random quote
    function getQuote() {

        var api = {
            endpoint: 'https://quotesondesign.com/wp-json/posts',
            params: {
                'filter[orderby]'       : 'rand',
                'filter[posts_per_page]': 1,
                'cachingHack'           : (new Date()).getTime()
            }
        };

    // do the work
    $.getJSON(api.endpoint, api.params)
        .then(renderQuote)
        .catch(handleError);
    }


    // handle errors
    function handleError(err) {
        console.log(err);
    }


    // render
    function renderQuote(response) {
        
        DOM.$quoteLink
            .attr('target', '_blank')
            .attr('href', response[0].link)
            .html(response[0].content);
        
        DOM.$author
            .text(response[0].title);

        DOM.$quoteFeature
            .addClass('quoteFeature')
            .attr('href', response[0].link)
            .attr('target', '_blank')
            .html(DOM.$quoteLink)
            .append(DOM.$author);
        }


    /* =================== public methods ================== */
    function init() {
        cacheDom();
        getQuote();
    }
    
    
    /* =============== export public methods =============== */
    return {
        init: init
    };

}());
```

We use promise syntax again to coordinate the timing of the `.getJSON()` AJAX response with subsequent  function calls. In this case, once the request has successfully resolved,  we `.render()` the quote (wrapped in an anchor tag) and author's name.

> Special thanks to Chris Coyier for granting permission to use his [Quotes on Design API](https://quotesondesign.com/api-v4-0/).  In addition to curating all those quotes, Chris also founded [CSS-Tricks](https://css-tricks.com) and co-founded [Codepen](http://codepen.io). **Huge thanks!**

Add a `<script>` link for our random quote module to `index.html` and call the module's public method in `app.js`:

```javascript
$(document).ready(function () {

    Background.init();
    Greeting.init();
    Quote.init();

});
```

Almost done  -  we have one last file to write: the quote module's stylesheet. Create a new file `quote.css` in your `/src/css/` folder:

```css
/* /src/css/quote.css */

#quote {
    font-size: 1.5em;
    padding: .5em 1em;
    width: 80%;
    max-width: 720px;
    border-radius: 8px;
    text-shadow: 0 0 40px #000;
}

#quote > a {
    color: #fff;
    text-align: justify;
    text-decoration: none;
}

#quote > a:hover {
    color: #f33;
}

#quote p {
    padding: .25em 0;
    margin: 0;
}

#quote > p {
    font-style: italic;
    text-align: right
}
```

Add a link to the stylesheet in `index.html` and we are done. Our final `index.html` is a well-organized, logical foundation for our application:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    
    <title>Modular Random Quote Machine</title>
    
    <!-- ==================== fonts ===================== -->
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto+Condensed">

    <!-- ===================== css ====================== -->
    <link rel="stylesheet" href="src/css/background.css">
    <link rel="stylesheet" href="src/css/greeting.css">
    <link rel="stylesheet" href="src/css/quote.css">
    <link rel="stylesheet" href="src/css/app.css">

</head>
<body>

    <div id="background"></div>
    
    <div class="container">
        <div id="greeting"></div>
        <div id="quote"></div>
    </div>

    <!-- =============== vendor javascript ================ -->
    <script src="https://code.jquery.com/jquery-3.1.1.js"></script>

    <!-- ================ our javascript ================== -->
    <script src="src/js/background.js"></script>
    <script src="src/js/greeting.js"></script>
    <script src="src/js/quote.js"></script>
    <script src="src/js/app.js"></script>
  
</body>
</html>
```

###Summarizing

If all went well, your browser should show you  something like this:

![screenshot](./assets/Screenshot.jpg)

We wrote a simple web application based on the modular design principles [outlined previously](https://medium.com/@jrschwane/writing-modular-javascript-pt-1-b42a3bd23685). Each feature's application logic and CSS is contained in separate files, loaded by `index.html` and bootstrapped by our `app.js`.  We used a systematic requirements-based approach to build each module. Our   modules' public methods are namespaced to avoid collisions in the global scope. Their CSS selectors are similarly namespaced to avoid colliding with any  generic selectors.

At this point our application structure looks like this:


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

Looking good! Time to collect on all those promised mint juleps.

#Up Next: Preparing for Deployment

Our application, modules and stylesheets are working together. But the browser has to make a separate request for each of those eight separate files. While the files themselves are not large, the cumulative latency of all those requests delays application load time. In Part 3 we will prepare our application for deployment using Gulp to concatenate, transpile, and minify our files.
