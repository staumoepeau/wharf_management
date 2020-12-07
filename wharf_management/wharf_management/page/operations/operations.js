frappe.provide("wharf_management.operations");
frappe.pages['operations'].on_page_load = function(wrapper) {
    var page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'Wharf Operations',
        single_column: true
    });

    page.set_primary_action(__("Refresh"), function() {
        return frappe.ui.toolbar.clear_cache();
    });

    

    let container_no_field = page.add_field({
        label: 'Voyage',
        fieldtype: 'Link',
        fieldname: 'voyage',
        options: 'Booking Request',
        change() {
            console.log(container_no_field.get_value());
        }
    });

    page.main.append(frappe.render_template("operations"));

}