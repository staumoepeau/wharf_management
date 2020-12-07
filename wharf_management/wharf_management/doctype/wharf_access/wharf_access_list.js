// Copyright (c) 2017, Sione Taumoepeau and contributors
// For license information, please see license.txt

frappe.listview_settings['Wharf Access'] = {
    hide_name_column: true,
    add_fields: ["access_status"],
    //    filters: [
    //        ["status", "=", "Yard"]
    //    ],
    has_indicator_for_draft: 1,
    get_indicator: function(doc) {
        if (doc.access_status) {
            var indicator = [__(doc.access_status), frappe.utils.guess_colour(doc.access_status), "access_status,=," + doc.access_status];
            indicator[1] = {
                "IN": "red",
                "OUT": "green",
            }[doc.access_status];
            return indicator;

        }
    },
};