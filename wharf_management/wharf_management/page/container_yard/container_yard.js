frappe.provide("wharf_management.container_yard");
var bayvalue = "";
var state = "Close";
var booking_ref = "";

frappe.pages['container_yard'].on_page_load = function(wrapper) {
        page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'Container Yard',
        single_column: true
    });


    page.main.append(frappe.render_template('container_yard_main'));

    page.set_secondary_action(__("Express"), function() {
        if (state == "Close") {
            state = "Open"
        } else if (state == "Open") {
            state = "Close"
        }
        //    alert(state)
        toggle_leftMenu(state);
    }).addClass("btn-success");
    
    
    page.set_primary_action(__("Inspection"), function() {
        if (state == "Close") {
            state = "Open"
        } else if (state == "Open") {
            state = "Close"
        }
        toggle_rightMenu(state);
    });

        

    let bay_field = page.add_field({
        label: 'Bay',
        fieldtype: 'Link',
        fieldname: 'bay',
        options: "Yard Bay",
        change() {          
            show_yard_details(page, bay_field.get_value());
            bayvalue = bay_field.get_value();        
        }       
    });

    let booking_ref_field = page.add_field({
        label: 'Booking Ref',
        fieldtype: 'Link',
        fieldname: 'row',
        options: "Booking Request",
        change() {
            booking_ref = booking_ref_field.get_value()
            console.log(booking_ref)
       }        
   });
};


var show_yard_details = function(page, bay) {

    frappe.call({
        method: "wharf_management.wharf_management.page.container_yard.container_yard.get_items",
        args: {
           "bay": bay
        },
        callback: function(r) {                
            page.wrapper.find('#page-content-wrapper').append(frappe.render_template('container_yard_content', { items: r.message || [] }))
        }
    });
//    $("#page-content-wrapper").load(location.href + " #page-content-wrapper");
}


var cargo_ref, yard_id, status;

var toggle_leftMenu = function(state) {
    
    $("#left-sidebar-wrapper").load(location.href + " #container-yard-main");

    if (state == "Close") {
        document.getElementById("left-sidebar-wrapper").style.width = "0px";
        document.getElementById("wrapper").style.paddingLeft = "0px";
        document.getElementById("wrapper").style.marginLeft = "0px";

    } else if (state == "Open") {
        document.getElementById("left-sidebar-wrapper").style.width = "120px";
        document.getElementById("wrapper").style.marginLeft = "120px";
    }
    frappe.call({
        method: "wharf_management.wharf_management.page.container_yard.container_yard.get_express_items",
        callback: function(express) {
            page.main.find('#left-sidebar-wrapper').append(frappe.render_template('container_yard_leftbar', {
                express_items: express.message || []
            }))
        }
    });
}

var toggle_rightMenu = function(state) {

    $("#right-sidebar-wrapper").load(location.href + " #container-yard-main");

    if (state == "Close") {
        document.getElementById("right-sidebar-wrapper").style.width = "0px";
        document.getElementById("wrapper").style.paddingRight = "0px";
        document.getElementById("wrapper").style.marginRight = "0px";

    } else if (state == "Open") {
        document.getElementById("right-sidebar-wrapper").style.width = "120px";
        document.getElementById("wrapper").style.marginRight = "120px";
    }

    frappe.call({
        method: "wharf_management.wharf_management.page.container_yard.container_yard.get_inspection_items",
        args: {
            "booking_ref": booking_ref
            },
        callback: function(y) {
            
            page.main.find('#right-sidebar-wrapper').append(frappe.render_template('container_yard_rightbar', {
                inspection_items: y.message || []
            }))
        }
    });
}

var update_onDragStart = function(cargo_ref) {

    frappe.db.get_value('Cargo', { 'name': cargo_ref }, 'status', function(r) {
        status = r.status
        if (status != 'Inspection' || status != 'Express') {
            frappe.db.get_value('Cargo', { 'name': cargo_ref }, 'yard_slot', function(r) {
                yard_id = r.yard_slot,
                    frappe.db.set_value('Yard Settings', yard_id, 'occupy', 0);
            });
        }
    });
}


var DragStart = function(e, ref) {

    e.dataTransfer.setData('text/html', this.innerHTML);
    e.dataTransfer.setData('Text/html', e.target.id);
    //    yard_id = e.target.id
    cargo_ref = ref.id

    frappe.db.get_value('Cargo', { 'name': cargo_ref }, 'status', function(r) {
        status = r.status
        if (status != 'Inspection') {
            frappe.db.get_value('Cargo', { 'name': cargo_ref }, 'yard_slot', function(r) {
                yard_id = r.yard_slot,
                    frappe.db.set_value('Yard Settings', yard_id, 'occupy', 0);
            });
        }
    });

}

var DragOver = function(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    return false;
}

var DragEnter = function(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
}

var DragLeave = function(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
}

var allowDrop = function(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
}

var Drop = function(e, ref) {
    //    if (e.preventDefault) {
    //        e.preventDefault();
    //    }
    /*  Gettting IDs 
     *  dragstart, drag, dragenter, dragleave, dragover, drop, dragend
     */

//     console.log(bayvalue);
//     console.log(state);

    var drop_cargo_ref = e.dataTransfer.getData("Text/html");
    new_yard = ref.id;


    if (status == "Inspection") {
        frappe.db.set_value('Cargo', cargo_ref, {'yard_slot': new_yard, 'status': 'Yard', 'yard_status': 'Closed', 'yard_date': frappe.datetime.now_datetime() });
    }
    //    if (status == "Express") {
    //        frappe.db.set_value('Cargo', cargo_ref, 'yard_slot', new_yard);
    //        frappe.db.set_value('Cargo', cargo_ref, { 'status': 'Yard', 'yard_status': 'Closed', 'yard_date': frappe.datetime.now_datetime() });

    //} 
    else if (yard_id != "Inspection") {

        
        frappe.db.set_value('Cargo', drop_cargo_ref, 'yard_slot', new_yard);
    }

    frappe.db.set_value('Yard Settings', new_yard, 'occupy', 1);

        show_yard_details(page, bayvalue);
        
 //     frappe.ui.toolbar.clear_cache();
}


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
//$('[data-toggle="tooltip"]').tooltip({ html: true });