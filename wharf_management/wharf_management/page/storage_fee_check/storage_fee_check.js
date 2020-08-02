frappe.provide("frappe.storage-fee-check");
frappe.pages['storage-fee-check'].on_page_load = function(wrapper) {
    var me = this;
    var page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'Check for Storage Fee',
        single_column: true
    });

    frappe.breadcrumbs.add("Cargo");
    let pid = '';
    page.main.html(frappe.render_template("storage_fee_check", {}));
    var me = this;
    this.cargo = frappe.ui.form.make_control({
        df: {
            fieldtype: "Link",
            options: "Cargo",
            fieldname: "cargo",
            filters: { "status": "Yard" },
        },
        only_input: true,
        parent: page.main.find(".cargo"),
    });
    this.cargo.make_input();
    this.cargo.$input.on("change", function() {
        var cargo = me.cargo.$input.val();
        get_container_info(cargo)
    });

    this.eta = frappe.ui.form.make_control({
        df: {
            "fieldname": "to_date",
            "label": __("To Date"),
            "fieldtype": "Date",
            "default": frappe.datetime.get_today(),
            "reqd": 1,
            "width": "80"
        },
        only_input: true,
        parent: page.main.find(".date"),
    });
    this.cargo.make_input();
    this.cargo.$input.on("change", function() {
        var cargo = me.cargo.$input.val();
        get_container_info(cargo)
    });
};

var get_container_info = function(cargo, me) {
    frappe.call({
        "method": "wharf_management.wharf_management.page.storage_fee_check.storage_fee_check.get_container_info",
        args: {
            "cargo_ref": cargo,
        },
        callback: function(r) {
            var data = r.message;
            console(data)
            parent: page.main.find(".cargo_details")
        }
    });
}