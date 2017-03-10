#Writing Modular JavaScript — Pt 2

This is part 2 of a series on writing modular JavaScript applications. In part 1, I explained why modularity is desirable and presented a simple modular application design structure. In part 3, we will use Gulp, the Node task runner, to prepare our application for deployment.

###Introduction

Whereas the previous article was more conceptual, this installment is going to be very hands-on.  We will be writing a relatively simple random quote application using the modular patterns discussed in part 1.  Our application will have three features, each written in its own module, with each in a separate file.  And we'll link each of these separate modules together so they can talk to each other.

Because we will write modular code, we will satisfy the design goals set forth in part 1.  re-use (call methods anywhere), legibility (small focused modules), and team-enabling (modules all connect using a common "api").

Our application is simple by design - our goal is to understand the design concepts. With that in mind, we will not get too deep into the JavaScript features used.  I assume that you have basic familiarity with client-side / front-end JavaScript and jQuery.  We will be using jQuery because it makes AJAX and DOM manipulation much easier.  We will be using [promises](link) with our AJAX calls instead of callbacks.


###Application Features

This is going to be a random quote application, but we're going to add a little bit more to make it more interesting. There will be three main features:

1. **greeting** - this feature will render a different greeting message based on the time of day.

2. **random background image** - this will make ajax requests to an open image API and render the images to our view.

3. **random quote** - this also makes AJAX requests to a 3rd-party API, process the response and render the quote to our view.


###Application Structure

We're going to use the 'by type' structure presented in part 1.  To begin, create a project directory and build out subdirectories to achieve the following:

```
|— /src
|    |
|    |— /js
|    |
|    |— /css
|
| index.html
```

###The Nitty and the Gritty

Let's begin with `index.html`.  This file will load our CSS and JavaScript files, and set up "containers" for our feature modules to attach themselves to.  It's enough to start with a basic html5 document, with nothing more than a link to jQuery and a containers for our features.  We'll be adding to this as we go.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">

  <title>Modular Random Quote Machine</title>

  <!-- ===================== css ====================== -->

</head>
<body>

  <div class="container">

    <!-- feature containers -->
    <div id="background"></div>
    <div id="greeting"></div>
    <div id="quote"></div>

  </div>

  <!-- =============== vendor javascript ================ -->
  <script src="https://code.jquery.com/jquery-3.1.1.js"></script>

  <!-- ================ our javascript ================== -->

</body>
</html>
```

We might as well begin our main CSS stylesheet now too.  Create a new file `style.css` in your `/src/css` folder:

```css
/* /src/css/style.css */

html,
body {
  margin: 0;
  padding: 0;
  background: #222;
  color: #fff;
}
```

**Random Background Feature**

We're going to modify the example module presented in part 1 of this series.

When planning any app, begin by thinking about what it needs.  We already know our app needs three features.  Next: what do those features need?  This is how you structure your modules.

For example, the backgrounds module needs to:

1. cache DOM elements,
2. asynchronously call images API,
3. assemble an element using the image we received,
4. render that to the DOM, and
5. initialize itself somehow.

You can take that list and convert it to pseudo code in your module - instant function documentation!

```javascript
/* /src/js/backgrounds.js */

var Backgrounds = (function() {

  'use strict';

  // placeholder for cached DOM elements
  var DOM = {};

  /* =================== private methods ================= */

  /* cache DOM elements
  */
  function cacheDom() {
    DOM.$background = $('#background');
  }
  

  /* coordinate async assembly of image element and rendering
  */
  function loadImage() {

    var imgUrl = 'https://source.unsplash.com/category/nature/1920x1080';

    $.when(assembleElement(imgUrl)).done(render);

  }


  /* assemble image element
   *
   * @params    [string]   source   [the image API endpoint]
   * @returns   [object]            [promise object]
  */
  function assembleElement(source) {

    return $.Deferred(function (task) {

      var image = new Image();
      image.onload = function() { task.resolve(image); }; 
      image.onerror = function() { task.reject(); };
      image.src = source;

    }).promise();

  }


  /* render to the DOM
   *
   * @params   [object]   image   [image element object]
  */
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

The above module just sets the CSS background of our target `<div>` once it receives an image from [unSplash](link).  There's a bit of promise voodoo going on in there, because getting the image is [asynchronous](link) and we can't set a `background-image` property until we actually have an image!  So we have to wait, which promises happen to excel at.  We'll see them again in the random quote feature.

Now that we have a module, we can load it with a `<script>` tag in our `index.html` file.  But our app doesn't do anything yet because we haven't writen our `app.js`. So let's do that:

```javascript
/* /src/js/app.js */

$(document).ready(function () {

  Backgrounds.init();

});
```

That's it for now.  We only have one module and it only has a single public method, which is called once the document has finished loading.  You can now launch `index.html` in a browser and it will fetch and display a random image.  Yay - it works!  Also boo - it looks like @$$!  Let's address that with a bit of CSS.  

> Just like we write separate JavaScript modules for each feature, we will also write separate external CSS stylesheets for each feature.  This further promotes code re-use - copy a previously-written module's JavaScript and CSS files into your new project - and makes your code more readable.  Don't forget to `<link>` to the separate stylesheet(s) in the `<head>` of your `index.html`.

Create a new file `backgrounds.css` in your `/src/css` folder:

```css
/* /src/css/backgrounds.css */

/* =========== background feature =========== */
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

> Remember to _namespace_ each selector in your module stylesheets.  This is so you don't accidentally override some other stylesheet's rule.  For example, above we only target our `#backgrounds` element and its child elements: `#backgrounds > img`.  You might have other modules with images, and we wouldn't want our background image's rules to affect them.  Namespacing selectors to each feature or module will help prevent this.

And with that, the backgrounds feature is done!  The other modules follow similar patterns.

**Greeting Feature**

What does this module need to do?

1. cache DOM elements,
2. determine the time of day,
3. craft a greeting based on the time of day,
4. render the greeting to the DOM, and
5. initialize itself

Let's do it - create a new file `greeting.js` in your `/src/js/` folder:

```
var Greeting = (function() {
    
  var DOM = {},
      theDate,
      defaultNames = [
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
    
    
  // pick a name from defaultNames array
  function selectName() {
    var ind = Math.floor(Math.random() * defaultNames.length);
        
    return defaultNames[ind];
  }

    
  // assemble time-based greeting message
  function makeMessage() {
    var timeOfDay,
        theDate = new Date(),
        initialHour = theDate.getHours();
        
    if (initialHour < 12) {
      timeOfDay = "morning";
    } else if (initialHour >= 12 && initialHour < 17) {
      timeOfDay = "afternoon";
    } else {
      timeOfDay = "evening";
    }

    return `Good ${timeOfDay}, ${dummy}.`;
  }
    
    
  // render DOM and call
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
