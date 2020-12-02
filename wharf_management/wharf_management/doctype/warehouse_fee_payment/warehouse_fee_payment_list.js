// Copyright (c) 2017, Caitlah Technology and contributors
// For license information, please see license.txt

frappe.listview_settings['Warehouse Fee Payment'] = {
    hide_name_column: true,
    add_fields: ["docstatus"],
    get_indicator: function(doc) {
        if (doc.docstatus === 0) {
            return [__("Unpaid"), "red", "docstatus,=,0"];

        } else if (doc.docstatus === 1) {
            return [__("Paid"), "green", "docstatus,=,1"];

        }
    }
};