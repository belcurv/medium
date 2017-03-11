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

    $.when(buildElement(imgUrl)).done(render);

  }


  /* assemble image element
   *
   * @params    [string]   source   [the image API endpoint]
   * @returns   [object]            [promise object]
  */
  function buildElement(source) {
	  
	var deferred = $.Deferred(function (task) {

      var image = new Image();
	  
      image.onload = function() {
		task.resolve(image);
	  }; 
      
	  image.onerror = function() {
		task.reject();
	  };
      
	  image.src = source;

    });
	
	return deferred.promise();

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