frappe.provide("wharf_management.operations");
frappe.pages['operations'].on_page_load = function(wrapper) {
    var page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'Wharf Operations',
        single_column: true
    });

    page.add_action_icon(__("fa fa-refresh fa-2x text-primary"), function() {
        return frappe.ui.toolbar.clear_cache();
    });

    page.main.html(frappe.render_template("operations", {}));

    var cargo_operations = frappe.ui.form.make_control({
        parent: page.main.find(".vessel"),
        df: {
            field: "Link",
            options: "Booking Request",
            fieldname: "name"
        },
    });
}