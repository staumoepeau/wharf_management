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
    }
};