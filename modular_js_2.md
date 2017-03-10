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

    <!-- features go here -->
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

```javascript
// app.js
$(document).ready(function () {
 
    Quotes.init();
    Backgrounds.init();
    Greeting.init();
 
});
```
