frappe.provide("wharf_management.container_yard");

var state = "Close";
var bay_id = "";
var booking_ref = "";

frappe.pages['container_yard'].on_page_load = function(wrapper) {
    let me = this;
    let page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'Container Yard',
        single_column: true
    });

    frappe.breadcrumbs.add('Wharf Management');

    page.main.append(frappe.render_template('container_yard_main'));

    let bay_field = page.add_field({
        label: 'Bay',
        fieldtype: 'Link',
        fieldname: 'bay',
        options: "Yard Bay",
        onchange: function() {
            bay_id = bay_field.get_value();
            //            if (bay_id) {
            //                get_html_template(page);
            show_yard_details(page, bay_id);
            //            }
        }
    });

    let booking_ref_field = page.add_field({
        label: 'Booking Ref',
        fieldtype: 'Link',
        fieldname: 'row',
        options: "Booking Request",
        onchange() {
            booking_ref = booking_ref_field.get_value()
                //            show_yard_details(page, bay_id, booking_ref);
            console.log(bay_id, booking_ref)
        }
    });
};


let show_yard_details = function(page, bay, booking_ref) {

    var j = 1;
    for (var i = 0; i < j; i++) {
        $("#page-content-wrapper").load(location.href + " #page-content-wrapper");
    }
    var j = 2;
    for (var i = 0; i < j; i++) {

        frappe.call({
            method: "wharf_management.wharf_management.page.container_yard.container_yard.get_items",
            args: {
                "bay": bay,
            },
            callback: function(r) {
                page.wrapper.find('#page-content-wrapper').append(frappe.render_template('container_yard_content', { items: r.message || [] }))
            }
        });
    }
}