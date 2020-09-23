frappe.pages['check-cargo'].on_page_load = function(wrapper) {
    var me = this;
    var page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'Check Cargo Fee',
        single_column: true
    });

    this.page.set_primary_action(__("Refresh"), function() {
        return frappe.ui.toolbar.clear_cache();
    }, "icon-refresh")

    var field = page.add_field({
        label: 'Cargo',
        fieldtype: 'Link',
        fieldname: 'cargo',
        options: 'Cargo',
        change() {
            console.log(field.get_value());
        }
    });
}