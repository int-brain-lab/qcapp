/*************************************************************************************************/
/*  Scripts                                                                                      */
/*************************************************************************************************/



/*************************************************************************************************/
/*  Utils                                                                                        */
/*************************************************************************************************/

function clamp(num, min, max) { return Math.min(Math.max(num, min), max); };



function throttle(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    if (!options) options = {};
    var later = function () {
        previous = options.leading === false ? 0 : Date.now();
        timeout = null;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
    };
    return function () {
        var now = Date.now();
        if (!previous && options.leading === false) previous = now;
        var remaining = wait - (now - previous);
        context = this;
        args = arguments;
        if (remaining <= 0 || remaining > wait) {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
            previous = now;
            result = func.apply(context, args);
            if (!timeout) context = args = null;
        } else if (!timeout && options.trailing !== false) {
            timeout = setTimeout(later, remaining);
        }
        return result;
    };
};



/*************************************************************************************************/
/*  Video playback                                                                              */
/*************************************************************************************************/

function updateBuffered() {

    const video = document.querySelector("#video");

    const control = document.querySelector("#control");
    const canvas = document.querySelector("#canvas");
    const ctx = canvas.getContext("2d");

    // Update canvas size.
    canvas.width = control.offsetWidth;
    canvas.height = control.offsetHeight;

    let b = video.buffered,  /// get buffer object
        i = b.length,      /// counter for loop
        w = canvas.width,  /// cache canvas width and height
        h = canvas.height,
        vl = video.duration, /// total video duration in seconds
        x1, x2;            /// buffer segment mark positions

    ctx.fillStyle = '#c00';
    while (i--) {
        x1 = b.start(i) / vl * w;
        x2 = b.end(i) / vl * w;
        ctx.fillRect(x1, 0, x2 - x1, h);
    }
}



function setVideoTime(x) {
    const video = document.querySelector("#video");
    let t = video.duration * x;
    video.currentTime = t.toString();
};



/*************************************************************************************************/
/*  Callbacks                                                                                    */
/*************************************************************************************************/

function playPause(ev) {
    const video = document.querySelector("#video");
    video.paused ? video.play() : video.pause();
}



function videoChanged(ev) {
    const selector = document.querySelector("#selector");

    const video = document.querySelector("#video");
    video.src = "videos/" + selector.value;
}




/*************************************************************************************************/
/*  Entry-point                                                                                  */
/*************************************************************************************************/

function load() {
    const control = document.querySelector("#control");
    const bar = document.querySelector("#bar");
    const video = document.querySelector("#video");

    video.addEventListener('progress', (event) => { updateBuffered(); });

    const position = { x: control.offsetLeft, y: 0 }

    // Throttle function.
    // const setVideoTime_th = throttle(setVideoTime, 500, {});

    interact(bar).draggable({
        startAxis: 'x',
        lockAxis: 'x',
        modifiers: [
            interact.modifiers.restrictRect({
                restriction: 'parent',
            })
        ]
    }).on('dragmove', (event) => {
        position.x += event.dx;
        event.target.style.transform = `translate(${position.x}px, 0)`;
    }).on('dragend', (event) => {
        let x = (position.x - control.offsetLeft) / (control.clientWidth - bar.clientWidth);
        setVideoTime(x);
    });
}



window.addEventListener("DOMContentLoaded", load);
