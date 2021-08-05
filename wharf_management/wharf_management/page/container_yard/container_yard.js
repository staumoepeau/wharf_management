frappe.provide("wharf_management.container_yard");
let bayid = '';
let page = '';
frappe.pages['container_yard'].on_page_load = function(wrapper) {
    let me = this;
    page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'Container Yard',
        single_column: true
    });

    var state = "Close";

    page.set_secondary_action(__("Express"), function() {
        if (state == "Close") {
            state = "Open"
        } else if (state == "Open") {
            state = "Close"
        }
            
        toggle_leftMenu(state);
    }).addClass("btn-success");

    page.set_secondary_action(__(""), function() {

        show_yard_details(page, bayid)
        $('.container_yard_content').load(document.URL + ' .container_yard_content');
    }, "refresh")


    page.set_primary_action(__("Inspection"), function() {
        if (state == "Close") {
            state = "Open"
        } else if (state == "Open") {
            state = "Close"
        }
        //   alert(state)
        toggle_rightMenu(state);
        get_inspection(page);
        

    });

    let bid = '';
    page.main.html(frappe.render_template('container_yard_index', {}));

    let bay = frappe.ui.form.make_control({
        parent: page.main.find('.yard_menu'),
        df: {
            fieldtype: 'Link',
            options: 'Yard Bay',
            fieldname: 'bay',
            placeholder: __('Select Yard Bay'),
            only_select: true,
            change: function() {
                console.log(bay.get_value());
                let bay_id = bay.get_value();
                bayid = bay_id;
                if (bid != bay_id && bay_id) {
                    me.start = 0;
//                    me.page.main.find('#page-content-wrapper').html('');
//                    $('.container_yard_content').load(document.URL + ' .container_yard_content');
                    page.main.find('#page-content-wrapper').html('');
                    show_yard_details(page, bay_id);
                }
                bid = bay_id;
            }
        },
    });
    bay.refresh();

};


let show_yard_details = function(page, bay) {
    frappe.call({
        method: "wharf_management.wharf_management.page.container_yard.container_yard.get_items",
        args: {
            bay: bay,
        },
        callback: function(r) {
            console.log(r)
//            let items = r.message || []
//            page.main.find('#page-content-wrapper').html('');
//            page.main.append(frappe.render_template('container_yard_content', {items: r.message || [] }))
            $(frappe.render_template('container_yard_content', {items: r.message || [] })).appendTo('#page-content-wrapper');
        }
    });
};

var get_inspection = function(page) {
    frappe.call({
        method: "wharf_management.wharf_management.page.container_yard.container_yard.get_inspection_items",
        callback: function(y) {

            page.main.find('#right-sidebar-wrapper').html(frappe.render_template('container_yard_rightbar', {
                    inspection_items: y.message || []
                }))
                //            console.log(y.message)
        }
    });

    //    frappe.call({
    //        method: "wharf_management.wharf_management.page.container_yard.container_yard.get_express_items",
    //        callback: function(express) {

    //            page.main.find('#left-sidebar-wrapper').html(frappe.render_template('container_yard_leftbar', {
    //                express_items: express.message || []
    //            }))
    //            console.log(express.message)
    //        }
    //    });

};




function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev, ref) {
    ev.dataTransfer.setData('Text/html', ev.target.id);
    objeto = ref.id;

    yard_id = ev.target.id;
    alert(yard_id)
    if (!yard_id == 'Inspection') {
        frappe.db.set_value('Yard Settings', yard_id, 'occupy', 0);
    }
}


function drop(ev, target) {
    ev.preventDefault();

    console.log(objeto, ev.target.id)

    var data = ev.dataTransfer.getData('Text/html');
    destino = ev.target.id;

    frappe.db.set_value('Cargo', objeto, 'yard_slot', destino);

    if (yard_id == "Inspection") {
        frappe.db.set_value('Cargo', objeto, { 'status': 'Yard', 'yard_status': 'Closed' });
    }

    update_yard_slot();
}

function update_yard_slot() {

    frappe.db.set_value('Yard Settings', destino, 'occupy', 1);
    frappe.ui.toolbar.clear_cache();
}


function toggle_leftMenu(state) {
    if (state == "Close") {
        leftcloseNav()
    } else if (state == "Open") {
        leftopenNav()
    }
}

function toggle_rightMenu(state) {
    if (state == "Close") {
        document.getElementById("right-sidebar-wrapper").style.width = "0px";
        document.getElementById("page-content-wrapper").style.paddingRight = "0px";
        document.getElementById("page-content-wrapper").style.marginRight = "0px";

    } else if (state == "Open") {
//        alert("Open")
        document.getElementById("right-sidebar-wrapper").style.width = "120px";
        document.getElementById("page-content-wrapper").style.marginRight = "120px";
    }
}

function closeNav() {
    document.getElementById("right-sidebar-wrapper").style.width = "0px";
    document.getElementById("page-content-wrapper").style.paddingRight = "0px";
    document.getElementById("page-content-wrapper").style.marginRight = "0px";
}

function openNav() {
    document.getElementById("right-sidebar-wrapper").style.width = "120px";
    document.getElementById("page-content-wrapper").style.marginRight = "120px";
}

function leftcloseNav() {
    document.getElementById("left-sidebar-wrapper").style.width = "0px";
    document.getElementById("wrapper").style.paddingLeft = "0px";
    document.getElementById("wrapper").style.marginLeft = "0px";
}

function leftopenNav() {
    document.getElementById("left-sidebar-wrapper").style.width = "120px";
    document.getElementById("wrapper").style.marginLeft = "120px";
}


var cargo_ref, yard_id, status;

function update_onDragStart(cargo_ref) {

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


function DragStart(e, ref) {

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
        //        alert(status, ref.id, yard_id);
        //        console.log(status, ref.id, yard_id);
    });

}

function DragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function DragEnter(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
}

function DragLeave(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
}

function allowDrop(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
}

function Drop(e, ref) {
    //    if (e.preventDefault) {
    //        e.preventDefault();
    //    }
    /*  Gettting IDs 
     *  dragstart, drag, dragenter, dragleave, dragover, drop, dragend
     */

    var drop_cargo_ref = e.dataTransfer.getData("Text/html");
    new_yard = ref.id;

    //    console.log(new_yard, drop_cargo_ref, drop_cargo_ref.id)

    Update_dropZone(status, cargo_ref, new_yard, drop_cargo_ref)

    //return false;
}

function DragEnd(e) {

}

function Update_dropZone(status, cargo_ref, new_yard, drop_cargo_ref) {

    console.log(status, cargo_ref, new_yard, drop_cargo_ref)
    if (status == "Inspection") {
        frappe.db.set_value('Cargo', cargo_ref, 'yard_slot', new_yard);
        frappe.db.set_value('Cargo', cargo_ref, { 'status': 'Yard', 'yard_status': 'Closed', 'yard_date': frappe.datetime.now_datetime() });
    }
    //    if (status == "Express") {
    //        frappe.db.set_value('Cargo', cargo_ref, 'yard_slot', new_yard);
    //        frappe.db.set_value('Cargo', cargo_ref, { 'status': 'Yard', 'yard_status': 'Closed', 'yard_date': frappe.datetime.now_datetime() });

    //} 
    else if (yard_id != "Inspection") {
        frappe.db.set_value('Cargo', drop_cargo_ref, 'yard_slot', new_yard);
    }
    //    console.log(yard_id, new_yard, status, cargo_ref, drop_cargo_ref)
    frappe.db.set_value('Yard Settings', new_yard, 'occupy', 1);

    //	frappe.ui.toolbar.clear_cache();
    //	show_yard_details(page, bayid)
    //	$('.container_yard_content').load(document.URL +  ' .container_yard_content');


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

$(document).ready(function() {
    $('[data-toggle="tooltip"]').tooltip();
});