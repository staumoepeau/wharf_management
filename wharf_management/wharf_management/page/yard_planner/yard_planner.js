frappe.pages['yard-planner'].on_page_load = function(wrapper) {
    var page = frappe.ui.make_app_page({
        parent: wrapper,
        title: __('Yard Planner'),
        single_column: true
    });

    page.set_primary_action(__("Refresh"), function() {
        return frappe.ui.toolbar.clear_cache();
    }, "icon-refresh")

    show_yard_details(page);
};
var show_yard_details = function(page) {
    frappe.call({
        method: "wharf_management.wharf_management.page.yard_planner.yard_planner.get_items",
        callback: function(r) {

            page.main.html(frappe.render_template('yard_planner', {
                items: r.message || []
            })).appendTo(page.content);
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


function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData('Text/html', ev.target.id);

}

//function drop(ev, target) {
//    ev.preventDefault();
//    ev.stopPropagation(); // stops the browser from redirecting.

//    console.log(target.id, ev.target.id)
//    var data = ev.dataTransfer.getData('Text/html');
//    alert(data);
//    ev.target.appendChild(document.getElementById(data));
//}