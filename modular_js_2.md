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

###Scaffolding

Let's begin with `index.html`.  This file will load our CSS and JavaScript files, and set up "containers" for our feature modules to attach themselves to.  It's enough to start with a basic html5 document, with nothing more than a links to a CSS font and jQuery and containers for our features.  We'll be adding to this as we go.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">

  <title>Modular Random Quote Machine</title>
  
  <!-- ==================== fonts ===================== -->
  <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto+Condensed">

  <!-- ===================== css ====================== -->
  <link rel="stylesheet" href="/src/css/style.css">

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

Let's create our main CSS stylesheet now too.  Create a new file `style.css` in your `/src/css` folder:

```css
/* /src/css/style.css */

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

###Random Background Feature

We're going to modify the example module presented in part 1 of this series.

When planning any app, begin by thinking about what it needs.  We already know our app needs three features.  Next: what do those features need?  This is how you structure your modules.

For example, the backgrounds module needs to:

1. cache DOM elements,
2. asynchronously get an image,
3. assemble an element using the image we received,
4. render that to the DOM, and
5. initialize itself somehow.

You modify that list to use as pseudo code in your module - instant function documentation!  Create new file `backgrounds.js` in your `/src/js/` folder:

```javascript
/* /src/js/backgrounds.js */

var Backgrounds = (function() {

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
    var imgUrl = 'https://source.unsplash.com/category/nature/1920x1080';

    $.when(assembleElement(imgUrl)).done(render);
  }


  // assemble the image element
  function assembleElement(source) {

    return $.Deferred(function (task) {

      var image = new Image();
      image.onload = function() { task.resolve(image); }; 
      image.onerror = function() { task.reject(); };
      image.src = source;

    }).promise();

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

The above module sets the CSS background of our target `<div>` once it has received an image from [unSplash](https://source.unsplash.com).  There's a bit of [promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) voodoo going on in there, because getting the image is [asynchronous](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Synchronous_and_Asynchronous_Requests) and we can't set a `background-image` property until we actually have an image!  So we have to wait; promises happen to excel at waiting.  We'll see them again in the random quote feature.

Now that we have a module, we can load it with a `<script>` tag in our `index.html` file.  But our app won't do anything yet because we haven't writen our `app.js`.  Remember: `app.js` bootstraps our modules. So let's write one - create new file `app.js` in your `/src/js/` folder:

```javascript
/* /src/js/app.js */

$(document).ready(function () {

  Backgrounds.init();

});
```

That's it for now.  We only have one module and it has only one public method, which is called once the document has finished loading.  You can now launch `index.html` in a browser and it will fetch and display a random image.  Yay - it works!  Also boo - it looks like @$$!  Let's address that with a bit of CSS.  

> Just like we write separate JavaScript modules for each feature, we will also write separate external CSS stylesheets for each feature.  This makes it easier to reuse a module _and its styles_ in other applications and makes code more readable by making it smaller.  Don't forget to `<link>` to the separate stylesheet(s) in the `<head>` of your `index.html`.

Create a new file `backgrounds.css` in your `/src/css/` folder:

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

The above CSS positions, sizes and anchors the image on the page, and sets the opacity of the containing `<div>` to `0` - meaning it will be invisible.  Refer to our module's `render()` function above - it _fades-in_ the background by changing the element's opacity after appending the image to the containing element.

> Remember to _namespace_ each selector in your module stylesheets.  This is so you don't accidentally override some other stylesheet's rule.  For example, above we only target our `#backgrounds` element and its child elements: `#backgrounds > img`.  You might have other modules with images, and we wouldn't want our background image's rules to affect them.  Namespacing selectors to each feature or module will help prevent this.

And with that, the backgrounds feature is done!  The other modules follow similar patterns.

###Greeting Feature

What does this module need to do?

1. cache DOM elements,
2. determine the time of day,
3. craft a greeting based on the time of day,
4. render the greeting to the DOM, and
5. initialize itself

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

The above module crafts a custom greeting with a random name from the `names` array, and a message that depends on the current time.  Add a new `<script>` tag to `index.html` for the new greeting module.  And include a call to the module's public `init()` method in `app.js`:

```javascript
/* /src/js/app.js */

$(document).ready(function () {

  Backgrounds.init();
  Greeting.init();

});
```

Let's quickly style the greeting.  Add a new file `greeting.css` to the `/src/css/` folder:

```css
/* /src/css/greeting.css */

#greeting {
  text-align: center;
  text-shadow: 0 0 30px #000;
  font-size: 4em;
  font-weight: bold;
}
```

Reload your browser and be greeted!  On to the final feature.

###Random Quote Feature

Just like the previous modules, begin by asking what we need this module to do:

1. cache DOM elements,
2. fetch a random quote from a remote API,
3. process the JSON response,
4. render the quote to the DOM, and
5. initialize itself

Create new file `quotes.js` in your `/src/js/` folder:

```javascript
/* /src/js/quotes.js */

var Quotes = (function () {
    
  'use strict';

  var DOM = {}
  

  // cache DOM elements
  function cacheDom() {
    DOM.$quoteFeature = $('#quote');
  }
  
  
  // get random quote
  function getQuote() {

    var api = {
        endpoint : 'https://quotesondesign.com/wp-json/posts',
        params   : {
          'filter[orderby]'        : 'rand',
          'filter[posts_per_page]' : 1,
          'processdate'            : (new Date()).getTime()
        }
    };

    // do the work
    $.getJSON(api.endpoint, api.params)
      .then(renderQuote)
      .catch(handleError);
    }


    // Clean quote response strings
    function clean(str) {
    
      var pTagRex = /(<([^>]+)>)|(&lt;([^>]+)&gt;)/ig,
          text = document.createElement("textarea");

      // set element = html quote string
      text.innerHTML = str;

      // .value converts 'special entities' to regular text.
      // .replace removes the <p> tags
      return text.value.replace(pTagRex, '');
  }


  // render
  function renderQuote(response) {
    
    var quote = clean(response[0].content)
    
    DOM.$quoteFeature
      .attr('href', response[0].link)
      .attr('target', '_blank')
      .html(quote);
  }


  // handle error
  function handleError(err) {
    console.log(err);
  }


  // export public methods
  return {
    getQuote: getQuote
  };

}());
```
