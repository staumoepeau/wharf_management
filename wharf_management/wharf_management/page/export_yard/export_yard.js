frappe.pages['export-yard'].on_page_load = function(wrapper) {
    var page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'Export Yard',
        single_column: true
    });

    var state = "Close";

    //    page.set_secondary_action(__("Express"), function() {
    //        if (state == "Close") {
    //            state = "Open"
    //        } else if (state == "Open") {
    //            state = "Close"
    //        }
    //    alert(state)
    //        toggle_leftMenu(state);
    //    }).addClass("btn-success");

    page.set_secondary_action(__("Express"), function() {
        if (state == "Close") {
            state = "Open"
        } else if (state == "Open") {
            state = "Close"
        }
        //    alert(state)
        toggle_rightMenu(state);
    }).addClass("btn-success");

    page.set_primary_action(__("Refresh"), function() {
        return frappe.ui.toolbar.clear_cache();
    });

    show_yard_details(page);
    //    get_side_bar(page);
};

var show_yard_details = function(page) {
    frappe.call({
        method: "wharf_management.wharf_management.page.export_yard.export_yard.get_items",
        callback: function(r) {

            page.main.html(frappe.render_template('export_yard', {
                items: r.message || []
            })).appendTo(page.main);
            //            page.content = $(page.body).find('.page-content-wrapper')
        }
    });


    frappe.call({
        method: "wharf_management.wharf_management.page.export_yard.export_yard.get_export_items",
        callback: function(y) {

            page.main.find('#sidebar-wrapper').html(frappe.render_template('export_yard_rightbar', {
                export_items: y.message || []
            }))
        }
    });

};


function toggle_rightMenu(state) {
    if (state == "Close") {
        closeNav()
    } else if (state == "Open") {
        openNav()
    }
}

function closeNav() {
    document.getElementById("sidebar-wrapper").style.width = "0px";
    document.getElementById("wrapper").style.paddingRight = "0px";
    document.getElementById("wrapper").style.marginRight = "0px";
}

function openNav() {
    document.getElementById("sidebar-wrapper").style.width = "180px";
    document.getElementById("wrapper").style.marginRight = "180px";
}



var cargo_ref, yard_id, status;

function DragStart(e, ref) {

    e.dataTransfer.setData('text/html', this.innerHTML);
    e.dataTransfer.setData('Text/html', e.target.id);
    yard_id = e.target.id
    cargo_ref = ref.id

    //   console.log(cargo_ref, yard_id, status);

    frappe.db.get_value('Export', { 'name': cargo_ref }, 'status', function(r) {
        status = r.status
        if (r.status != 'Gate1 IN') {
            //            alert(r.status)
            frappe.db.get_value('Export', { 'name': cargo_ref }, 'yard_slot', function(r) {
                yard_id = r.yard_slot
                frappe.db.set_value('Export Yard Settings', r.yard_slot, 'occupy', 0);
            });
        }
        //        console.log(cargo_ref, r.status, r.yard_slot);
    });


};

function DragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function DragEnter(e) {
    //        this.classList.add('drag--hover');
}

function DragLeave(e) {
    //        this.classList.remove('drag--hover');
}

function allowDrop(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
}

function Drop(e, ref) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    /*  Gettting IDs 
     *  dragstart, drag, dragenter, dragleave, dragover, drop, dragend
     */

    var drop_cargo_ref = e.dataTransfer.getData("Text/html");
    new_yard = ref.id;

    //    console.log(cargo_ref, drop_cargo_ref, new_yard, status)
    Update_dropZone(status, cargo_ref, new_yard, drop_cargo_ref)


    //return false;
}

function DragEnd(e) {

}

function Update_dropZone(status, cargo_ref, new_yard, drop_cargo_ref) {

    //    if (status == "Gate1 IN") {
    //        alert(status)
    //        frappe.db.set_value('Export', cargo_ref, 'yard_slot', new_yard);
    frappe.db.set_value('Export', cargo_ref, { 'yard_slot': new_yard, 'status': 'Yard', 'yard_status': 'Closed', 'yard_created_by': frappe.session.user, 'yard_date': frappe.datetime.now_datetime() });
    //    } else if (yard_id != "Gate1 IN") {
    //    frappe.db.set_value('Export', drop_cargo_ref, 'yard_slot', new_yard);
    //    }
    console.log(yard_id, new_yard, status, cargo_ref, drop_cargo_ref)
    frappe.db.set_value('Export Yard Settings', new_yard, 'occupy', 1);

    frappe.ui.toolbar.clear_cache();

};


//-------------------------------------------------------------------------------------------------------------



//var touchToMouse = function(event) {
//    event.preventDefault();
//    if (event.touches.length > 1 || (event.type == "touchend" && event.touches.length > 0))
//        return; //allow default multi-touch gestures to work

//    var simulatedEvent = document.createEvent("MouseEvents");
//   var touch = null;
//    var type = null;


//    switch (event.type) {
//        case "touchstart":
//            type = "mousedown";
//            touch = event.changedTouches[0];
//            break;
//        case "touchmove":
//            type = "mousemove";
//            touch = event.changedTouches[0];
//            break;
//        case "touchend":
//            type = "mouseup";
//            touch = event.changedTouches[0];
//            break;
//        default:
//            return;
//    }

// https://developer.mozilla.org/en/DOM/event.initMouseEvent for API
//    var simulatedEvent = document.createEvent("MouseEvent");


//    simulatedEvent.initMouseEvent(type, true, true, window, 1,
//        touch.screenX, touch.screenY, touch.clientX, touch.clientY,
//        event.ctrlKey, event.altKey, event.shiftKey, event.metaKey, 0, null);

//    touch.target.dispatchEvent(simulatedEvent);
//    event.preventDefault();
//};

//--------------------------------------------------------------------------------------------------------------------------

var isMultiTouch = false;
var multiTouchStartPos;
var eventTarget;
var touchElements = {};

function preventMouseEvents(event) {
    //   event.preventDefault();
    //   event.stopPropagation();
};

function onMouse(touchType) {
    //    console.log(touchType)
    return function(event) {
        // prevent mouse events
        preventMouseEvents(event);

        if (event.which !== 1) {
            return;
        }

        // The EventTarget on which the touch point started when it was first placed on the surface,
        // even if the touch point has since moved outside the interactive area of that element.
        // also, when the target doesnt exist anymore, we update it
        if (event.type == 'mousedown' || !eventTarget || (eventTarget && !eventTarget.dispatchEvent)) {
            eventTarget = event.target;
        }

        // shiftKey has been lost, so trigger a touchend
        if (isMultiTouch && !event.shiftKey) {
            triggerTouch('touchend', event);
            isMultiTouch = false;
        }

        triggerTouch(touchType, event);

        // we're entering the multi-touch mode!
        if (!isMultiTouch && event.shiftKey) {
            isMultiTouch = true;
            multiTouchStartPos = {
                pageX: event.pageX,
                pageY: event.pageY,
                clientX: event.clientX,
                clientY: event.clientY,
                screenX: event.screenX,
                screenY: event.screenY
            };
            triggerTouch('touchstart', event);
        }

        // reset
        if (event.type == 'mouseup') {
            multiTouchStartPos = null;
            isMultiTouch = false;
            eventTarget = null;
        }
    }
};

function triggerTouch(eventName, mouseEv) {
    var touchEvent = document.createEvent('Event');
    touchEvent.initEvent(eventName, true, true);

    touchEvent.altKey = mouseEv.altKey;
    touchEvent.ctrlKey = mouseEv.ctrlKey;
    touchEvent.metaKey = mouseEv.metaKey;
    touchEvent.shiftKey = mouseEv.shiftKey;

    touchEvent.touches = getActiveTouches(mouseEv, eventName);
    touchEvent.targetTouches = getActiveTouches(mouseEv, eventName);
    touchEvent.changedTouches = getChangedTouches(mouseEv, eventName);

    eventTarget.dispatchEvent(touchEvent);
}

function getActiveTouches(mouseEv, eventName) {
    // empty list
    if (mouseEv.type == 'mouseup') {
        return new TouchList();
    }

    var touchList = createTouchList(mouseEv);
    if (isMultiTouch && mouseEv.type != 'mouseup' && eventName == 'touchend') {
        touchList.splice(1, 1);
    }
    return touchList;
}

/**
 * receive a filtered set of touches with only the changed pointers
 * @param mouseEv
 * @param eventName
 * @returns {TouchList}
 */
function getChangedTouches(mouseEv, eventName) {
    var touchList = createTouchList(mouseEv);

    // we only want to return the added/removed item on multitouch
    // which is the second pointer, so remove the first pointer from the touchList
    //
    // but when the mouseEv.type is mouseup, we want to send all touches because then
    // no new input will be possible
    if (isMultiTouch && mouseEv.type != 'mouseup' &&
        (eventName == 'touchstart' || eventName == 'touchend')) {
        touchList.splice(0, 1);
    }

    return touchList;
}

function TouchList() {
    var touchList = [];

    touchList.item = function(index) {
        return this[index] || null;
    };

    // specified by Mozilla
    touchList.identifiedTouch = function(id) {
        return this[id + 1] || null;
    };

    return touchList;
}

function Touch(target, identifier, pos, deltaX, deltaY) {
    deltaX = deltaX || 0;
    deltaY = deltaY || 0;

    this.identifier = identifier;
    this.target = target;
    this.clientX = pos.clientX + deltaX;
    this.clientY = pos.clientY + deltaY;
    this.screenX = pos.screenX + deltaX;
    this.screenY = pos.screenY + deltaY;
    this.pageX = pos.pageX + deltaX;
    this.pageY = pos.pageY + deltaY;
}

function createTouchList(mouseEv) {
    var touchList = new TouchList();

    if (isMultiTouch) {
        var f = TouchEmulator.multiTouchOffset;
        var deltaX = multiTouchStartPos.pageX - mouseEv.pageX;
        var deltaY = multiTouchStartPos.pageY - mouseEv.pageY;

        touchList.push(new Touch(eventTarget, 1, multiTouchStartPos, (deltaX * -1) - f, (deltaY * -1) + f));
        touchList.push(new Touch(eventTarget, 2, multiTouchStartPos, deltaX + f, deltaY - f));
    } else {
        touchList.push(new Touch(eventTarget, 1, mouseEv, 0, 0));
    }

    return touchList;
}

function showTouches(ev) {
    var touch, i, el, styles;
    //    console.log(ev.target)
    // first all visible touches
    for (i = 0; i < ev.touches.length; i++) {
        touch = ev.touches[i];
        el = touchElements[touch.identifier];
        //        console.log(touch)
        if (!el) {
            el = touchElements[touch.identifier] = document.createElement("div");
            document.body.appendChild(el);
            //            console.log(el)
        }

        styles = TouchEmulator.template(touch);
        for (var prop in styles) {
            el.style[prop] = styles[prop];
        }
        //        console.log(styles)
    }

    // remove all ended touches
    if (ev.type == 'touchend' || ev.type == 'touchcancel') {
        for (i = 0; i < ev.changedTouches.length; i++) {
            touch = ev.changedTouches[i];
            el = touchElements[touch.identifier];
            if (el) {
                el.parentNode.removeChild(el);
                delete touchElements[touch.identifier];
            }
        }
    }
}

function touch_start(ev) {

    // var id1 = document.getElementById('id'),
    //    boxleft, // left position of moving box
    //    startx, // starting x coordinate of touch point
    //    dist = 0, // distance traveled by touch point
    var touchobj = null

    touchobj = ev.changedTouches[0]
    ev.preventDefault();
    ev.stopPropagation();
    //    alert(touchobj)
}




function TouchEmulator() {
    if (hasTouchSupport()) {
        return;
    }
    fakeTouchSupport();

}

function fakeTouchSupport() {
    var objs = [window, document.documentElement];
    var props = ['ontouchstart', 'ontouchmove', 'ontouchcancel', 'ontouchend'];

    for (var o = 0; o < objs.length; o++) {
        for (var p = 0; p < props.length; p++) {
            if (objs[o] && objs[o][props[p]] == undefined) {
                objs[o][props[p]] = null;
            }
        }
    }
}

/**
 * we don't have to emulate on a touch device
 * @returns {boolean}
 */
function hasTouchSupport() {
    return ("ontouchstart" in window) || // touch events
        (window.Modernizr && window.Modernizr.touch) || // modernizr
        (navigator.msMaxTouchPoints || navigator.maxTouchPoints) > 2; // pointer events
}
// start distance when entering the multitouch mode
TouchEmulator.multiTouchOffset = 75;
/**
 * css template for the touch rendering
 * @param touch
 * @returns object
 */
TouchEmulator.template = function(touch) {
    var size = 30;
    var transform = 'translate(' + (touch.clientX - (size / 2)) + 'px, ' + (touch.clientY - (size / 2)) + 'px)';
    return {
        position: 'fixed',
        left: 0,
        top: 0,
        background: '#fff',
        border: 'solid 1px #999',
        opacity: .6,
        borderRadius: '100%',
        height: size + 'px',
        width: size + 'px',
        padding: 0,
        margin: 0,
        display: 'block',
        overflow: 'hidden',
        pointerEvents: 'none',
        webkitUserSelect: 'none',
        mozUserSelect: 'none',
        userSelect: 'none',
        webkitTransform: transform,
        mozTransform: transform,
        transform: transform
    }
};

document.addEventListener("mousedown", onMouse('touchstart'), true);
document.addEventListener("mousemove", onMouse('touchmove'), true);
document.addEventListener("mouseup", onMouse('touchend'), true);

document.addEventListener("mouseenter", preventMouseEvents, true);
document.addEventListener("mouseleave", preventMouseEvents, true);
document.addEventListener("mouseout", preventMouseEvents, true);
document.addEventListener("mouseover", preventMouseEvents, true);

document.addEventListener("touchstart", touch_start, false);
document.addEventListener("touchmove", showTouches, false);
document.addEventListener("touchend", showTouches, false);
document.addEventListener("touchcancel", showTouches, false);

//-------------------------------------------------------------------------------------------------------------------