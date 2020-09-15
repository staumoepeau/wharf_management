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

function dragStart(event) {
    //    var  = event.dataTransfer;
    //    dt.mozSetDataAt("text/uri-list", "URL1", 0);
    event.dataTransfer.setData("Text", event.target.id);
    event.currentTarget.style.border = "dashed";
}

function dragging(event) {
    document.getElementById("demo").innerHTML = "The p element is being dragged";
}

function allowDrop(event) {
    event.preventDefault();
}

function drop(event) {
    event.preventDefault();
    var data = event.dataTransfer.getData("Text");
    event.target.appendChild(document.getElementById(data));
    event.currentTarget.style.border = "";
    event.dataTransfer.clearData();
    //    document.getElementById("demo").innerHTML = "The p element was dropped";
}