// Copyright (c) 2017, Sione Taumoepeau and contributors
// For license information, please see license.txt

frappe.listview_settings['Cargo'] = {
    hide_name_column: true,
    add_fields: ["status", "container_content"],
    filters: [
        ["status", "=", "Yard"]
    ],
    has_indicator_for_draft: 1,
    get_indicator: function(doc) {
        if (doc.status) {
            var indicator = [__(doc.status), frappe.utils.guess_colour(doc.status), "status,=," + doc.status];
            indicator[1] = {
                "Need Attention": "red",
                "Export": "red",
                "Uploaded": "purple",
                "Re-stowing": "yellow",
                "Transhipment": "purple",
                "Outbound": "lightblue",
                "Inspection": "green",
                "Yard": "purple",
                "Paid": "orange",
                "Gate1": "blue",
                "Gate Out": "green",
                "Devanning": "black",
                "CCV": "black",
                "Split Ports": "black",
                "Custom Inspection": "orange",
            }[doc.status];
            return indicator;

        } else if (doc.container_content) {
            var indicator = [__(doc.container_content), frappe.utils.guess_colour(doc.container_content), "container_content,=," + doc.container_content];
            indicator[1] = {
                "FULL": "green",
                "EMPTY": "red",
            }[doc.container_content];
            return indicator;
        }
    }
};