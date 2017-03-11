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
    
    
    // render DOM and call RepoSelect.getRepos()
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
	
    // export public methods
    return {
        init: init
    };
    
}());
