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

```
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
    <div id="background">
    <div id="greeting">
    <div id="quote">

  </div>

  <!-- =============== vendor javascript ================ -->
  <script src="https://code.jquery.com/jquery-3.1.1.js"></script>

  <!-- ================ our javascript ================== -->

</body>
</html>
```

**Random Background Feature**

We're going to modify the example module presented in part 1 of this series.

```
var Background = (function() {

'use strict';

// placeholder for cached DOM elements
var DOM = {};

/* =================== private methods ================= */

// cache DOM elements
function cacheDom() {
DOM.$background = $('#background');
}

// fetch random image from unSplash API
function getImage() {

} 

// render DOM
function render() {
DOM.$background



}

/* =================== public methods ================== */

// main init method
function init() {
cacheDom();
getImage();
}

/* =============== export public methods =============== */

return {
init: init
};

}());
```

``` 
// app.js
$(document).ready(function () {
 
    Quotes.init();
    Backgrounds.init();
    Greeting.init();
 
});
```