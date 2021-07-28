//==============================================================
//==============================================================
// Password Visualisation - Utility Functions & Modules
//
// Requirements: d3.js, paracoord.js, colourbrewer.js
//
// Gary Read
// University of Surrey 2016
//==============================================================
//==============================================================

/**
 * Timer module
 */
var Timer = function() {
	var MILLI = 1000;
	var _start = 0, _stop = 0;

	var start   = function() { 
		_start = window.performance.now(); 
	}

	var stop    = function() { 
		_stop = window.performance.now();
		return elapsed();
	}
	
	var elapsed = function() { 
		return (_stop - _start) / MILLI ;
	}

	return {
		start   : start,
		stop    : stop,
		elapsed : elapsed
	}
}


/**
 * Progress module
 */
var Progress = function(n) {
	var _range       = n;
	var _progress    = 0;
	
	var setRange = function(range) {
		_range  = range;
	}

	var getProgress = function(value) {
		_progress = Math.ceil((value / _range) * 100);
		return _progress;
	}

	return {
		setRange    : setRange,
		getProgress : getProgress
	}
}


/**
 * Reads in a file, 
 */
function processPasswordDump(file) {
    
}


/**
 * Debugging/logging to console
 */
function out(str, stringify) {
    if (stringify == true) {
        console.log(JSON.stringify(str, null, 2));
    } else {
        console.log(str);
    }
}


/**
 * Escapes special charaters for use with d3 selector magic
 */
function jq( myid ) {
    return "#" + myid.replace( /(:|\.|\[|\]|,)/g, "\\$1" );
}

/**
 * Replace special encodings from charSet
 */
function removeHTMLEncoding(str) {
	return str.replace("&amp;", "&").replace("&gt;", ">").replace("&lt;", "<").replace("&quot;", "\"");
}


// Remove duplicates from a list
// http://stackoverflow.com/questions/9229645/remove-duplicates-from-javascript-array
function uniq_fast(a) {
    var seen = {};
    var out = [];
    var len = a.length;
    var j = 0;
    for(var i = 0; i < len; i++) {
         var item = a[i];
         if(seen[item] !== 1) {
               seen[item] = 1;
               out[j++] = item;
         }
    }
    return out;
}