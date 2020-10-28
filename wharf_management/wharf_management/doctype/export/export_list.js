// Copyright (c) 2017, Caitlah Technology and contributors
// For license information, please see license.txt

frappe.listview_settings['Export'] = {
    hide_name_column: true,
    add_fields: ["status"],
    get_indicator: function(doc) {
        if (doc.status === "Export") {
            return [__("Export"), "purple", "status,=,'Export'"];

        } else if (doc.status === "Main Gate IN") {
            return [__("Main Gate In"), "orange", "status,=,'Main Gate In'"];

        } else if (doc.status === "Gate1 IN") {
            return [__("Gate1 IN"), "lightblue", "status,=,'Gate1 IN'"];

        } else if (doc.status === "Yard") {
            return [__("Yard"), "blue", "status,=,'Yard'"];

        } else if (doc.status === "Paid") {
            return [__("Paid"), "green", "status,=,'Paid'"];

        } else if (doc.status === "") {
            return [__("Require Attention"), "black", "status,=,''"];
        }


    }
};