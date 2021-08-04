//==============================================================
//==============================================================
// Password Visualisation - Worker script
//
// Custom worker created to allow multiple functions per worker
//
// Requirements: None
//
// Gary Read
// University of Surrey 2016
//==============================================================
//==============================================================

onmessage = function(e) {
    var call = e.data.call;
    
    switch(call) {
        
        case "calc":
            var first  = e.data.param[0];
            var second = e.data.param[1];
            var result = calc(first, second);
            postMessage(result);
            break;
        
        case "countDown":
            var seconds = e.data.param[0];
            countDown(seconds);
            break;

        default:
            postMessage('function:worker.js failed - No such call');
    }
}

function calc(first, second) {
    return (first * second);
}

function countDown(seconds) {
    var counter = 0;
    var th = setInterval(function() {
        if (counter < seconds) {
            counter++;

            var timeleft = seconds - counter;
            postMessage(timeleft);
        } else {
            clearInterval(th);
        }
    }, 1000);
}
