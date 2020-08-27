frappe.pages['yard-planner'].on_page_load = function(wrapper) {
    var me = this;
    var page = frappe.ui.make_app_page({
        parent: wrapper,
        title: __('Yard Planner'),
        single_column: true
    });

    this.page.set_primary_action(__("Refresh"), function() {
        return frappe.ui.toolbar.clear_cache();
    }, "icon-refresh")

    //page.main.html(frappe.render_template("yard_planner", {}));

    //   var yard = frappe.ui.form.make_control({
    //       parent: page.main.find(".yard"),
    //       df: {
    //           fieldtype: "Link",
    //          options: "Yard Settings",
    //           fieldname: "yard_section",
    //           change: function() {
    //                if (pid != yard.get_value() && yard.get_value()) {
    //                    me.start = 0;
    //                    me.page.main.find(".yard_documents_list").html("");
    //                    get_documents(yard.get_value(), me);
    //                    show_patient_info(yard.get_value(), me);
    //               }
    //                pid = yard.get_value();
    //           }
    //       },
    //        only_input: true,
    //    });
    //    yard.refresh();
    show_yard_details(me);
};
var show_yard_details = function(me) {
    frappe.call({
        method: "wharf_management.wharf_management.page.yard_planner.yard_planner.get_items",
        callback: function(r) {

            me.page.main.html(frappe.render_template('yard_planner', { items: r.message || [] })).appendTo(page.content);
            page.content = $(page.body).find('.yard-planner-main');
            //            if (r.message) {
            //                var data = r.message;
            //                for (var i = 0; i<data.length; i++) {
            //                    if (data[i].status == "Paid") {
            //                        var show_yard_details_html = "<div class='col-sm-1'><div class='shipping_container'>\
            //                        <img class='shipping_container-img' src='/files/paid_container.png' alt='container image cap'>\
            //                        <div class='shipping_container-img-overlay'>\
            //                        <a href='desk#Form/Cargo/" + data[i].cargo_ref + "'>\
            //                        <h5 class='shipping_container-title text-red text-center'>FT</h5>\
            //                        </a>\</div></div></div>";
            //                        //                }
            //                        me.page.main.find(".row").html(show_yard_details_html);
            //                    }
            //                }
            //           }
        }
    })
};

//function called when drag starts
function dragIt(theEvent) {
//tell the browser what to drag
console.log("dragStart");
theEvent.dataTransfer.setData("Text", theEvent.target.getAttribute("id"));
}

function dropIt(theEvent) {
console.log("Drop");
//get a reference to the element being dragged
var theData = theEvent.dataTransfer.getData("Text");
//get the element
//var theDraggedElement = document.getElementById(theData);
//add it to the drop element
theEvent.target.appendChild(document.getElementById(theData));
//instruct the browser to allow the drop
theEvent.preventDefault();
}

//function dragStart(e) {
    // Sets the operation allowed for a drag source
//    e.dataTransfer.effectAllowed = "move";

    // Sets the value and type of the dragged data
//    e.dataTransfer.setData("Text", e.target.getAttribute("id"));
//}

//function dragOver(e) {
    // Prevent the browser default handling of the data
//    e.preventDefault();
//    e.stopPropagation();
//}

//function drop(e) {
    // Cancel this event for everyone else
//    e.stopPropagation();
//    e.preventDefault();

    // Retrieve the dragged data by type
//    var data = e.dataTransfer.getData("Text");

    // Append image to the drop box
//    e.target.appendChild(document.getElementById(data));
//}