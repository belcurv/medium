/* /src/js/quote.js */

/* jshint esversion:6 */
/* globals $, Greeting, document, console */

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
                'processdate'           : (new Date()).getTime()
            }
        };

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
        
        Greeting.displayMessage();
        
        DOM.$quoteLink
            .attr('target', '_blank')
            .attr('href', response[0].link)
            .html(response[0].content);
        
        DOM.$author
            .html(response[0].title);

        DOM.$quoteFeature
            .css('background-color', 'rgba(0, 0, 0, .2)')
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
