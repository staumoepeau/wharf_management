// Copyright (c) 2017, Caitlah Technology and contributors
// For license information, please see license.txt

frappe.listview_settings['Cargo Operation'] = {
	add_fields: ["status"],
	get_indicator: function(doc) {

		if(doc.status=== "Unknown"){
        	return [__("Unknown"), "red", "status,=,Unknown"];

		} else if (doc.status === "Inspection"){
			return [__("Inspection"), "green", "status,=,Inspection"];

		} else if (doc.status === "Yard"){
			return [__("Yard"), "purple", "status,=,Yard"];

		} else if (doc.status === "Paid"){
			return [__("Paid"), "orange", "status,=,Paid"];

		} else if (doc.status === "Gate1"){
			return [__("Passed Gate1"), "blue", "status,=,Gate1"];

		}
	}
};
