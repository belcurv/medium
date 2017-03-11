/* /src/js/quotes.js */

/* jshint esversion:6 */
/* globals $, document, console */

var Quotes = (function () {

    'use strict';

    var DOM = {};


    /* =================== private methods ================= */

    // cache DOM elements
    function cacheDom() {
        DOM.$quoteFeature = $('#quote');
        DOM.quoteLink     = $(document.createElement('a'));
        DOM.author        = $(document.createElement('p'));
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
        
        DOM.quoteLink
            .attr('target', '_blank')
            .attr('href', response[0].link)
            .html(response[0].content);
        
        DOM.author
            .text(response[0].title);

        DOM.$quoteFeature
            .addClass('quoteFeature')
            .attr('href', response[0].link)
            .attr('target', '_blank')
            .html(DOM.quoteLink)
            .append(DOM.author);
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
