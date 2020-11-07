// Copyright (c) 2017, Caitlah Technology and contributors
// For license information, please see license.txt

frappe.listview_settings['Booking Request'] = {
    hide_name_column: true,
    add_fields: ["docstatus", "status"],
    get_indicator: function(doc) {
        if (doc.docstatus === 0) {
            return [__("Unpaid"), "red", "docstatus,=,0"];

        } else if (doc.docstatus === 1) {
            if (doc.status === "Paid") {
                return [__("Paid"), "blue", "status,=,'Paid'"];
            } else if (doc.status === "Pending") {
                return [__("Unpaid"), "orange", "status,=,'Pending'"];
            } else if (doc.status === "Approved") {
                return [__("Approved"), "green", "status,=,'Approved'"];
            }
        }
    },
    refresh: function(frm) {
        if (frappe.user.has_role("System Manager") || frappe.user.has_role("Wharf Operation User") || frappe.user.has_role("Yard Operation User")) {
            frm.page.sidebar.show(); // this removes the sidebar
            $(".timeline").show()
            frm.page.wrapper.find(".layout-main-section-wrapper").addClass("col-md-10");
        } else {
            frm.page.sidebar.hide(); // this removes the sidebar
            $(".timeline").hide()
            frm.page.wrapper.find(".layout-main-section-wrapper").removeClass("col-md-10"); // this removes class "col-md-10" from content block, which sets width to 83%
        }
    }

};