// Copyright (c) 2017, Caitlah Technology and contributors
// For license information, please see license.txt

frappe.listview_settings['Yard Operation'] = {
	add_fields: ["status"],
	get_indicator: function(doc) {
        if(doc.status=== "Unknown"){
        	return [__("Unknown"), "yellow", "status,=,Unknown"];

		} else if (doc.status === "Yard"){
			return [__("Yard"), "green", "status,=,Yard"];

		} else if (doc.status === "Paid"){
			return [__("Paid"), "blue", "status,=,Paid"];

		}
	}
};