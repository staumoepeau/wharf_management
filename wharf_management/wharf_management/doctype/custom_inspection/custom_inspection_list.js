frappe.listview_settings['Custom Inspection'] = {
    add_fields: ["status", "docstatus"],
    has_indicator_for_draft: 1,

    get_indicator: function(doc) {
        if (doc.status === "Delivered") {
            return [__("Deliver Completed"), "green", "status,=,'Deliver'"];
        } else if (doc.status === "Inspection") {
            return [__("To Deliver for Inspection"), "orange", "status,=,'Inspection'"];
        }
    },
    refresh: function(frm) {

        if (frappe.user_roles.includes('Wharf Security Officer', 'Wharf Security Officer Main Gate', 'Wharf Security Supervisor')) {

            frm.page.sidebar.hide(); // this removes the sidebar
            $(".timeline").hide()
            frm.page.wrapper.find(".layout-main-section-wrapper").removeClass("col-md-10"); // this removes class "col-md-10" from content block, which sets width to 83%
        }
        if (frappe.user_roles.includes("System Manager")) {
            frm.page.sidebar.show(); // this removes the sidebar
            $(".timeline").show()
            frm.page.wrapper.find(".layout-main-section-wrapper").addClass("col-md-10");
        }
    },
};