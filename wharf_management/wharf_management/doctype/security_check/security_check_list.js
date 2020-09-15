// Copyright (c) 2017, Caitlah Technology and contributors
// For license information, please see license.txt

frappe.listview_settings['Security Check'] = {
    hide_name_column: true,
    add_fields: ["docstatus", "status"],
    get_indicator: function(doc) {
        if (doc.docstatus === 0) {
            return [__("Draft"), "red", "docstatus,=,0"];

        } else if (doc.docstatus === 1) {
            return [__("Security Check"), "green", "docstatus,=,1"];

        }
    }
};