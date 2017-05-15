// Copyright (c) 2017, Caitlah Technology and contributors
// For license information, please see license.txt

frappe.listview_settings['Cargo'] = {
	add_fields: ["status"],
	get_indicator: function(doc) {

		if(doc.status=== ""){
			return [__("Unknown"), "red", "status,=,"];
			
		} else if (doc.status === "Inward"){
			return [__("Inward"), "black", "status,=,Inward"];

		} else if (doc.status === "Inspection"){
			return [__("Inspection"), "green", "status,=,Inspection"];

		} else if (doc.status === "Yard"){
			return [__("Yard"), "purple", "status,=,Yard"];

		} else if (doc.status === "Paid"){
			return [__("Paid"), "orange", "status,=,Paid"];

		} else if (doc.status === "Gate1"){
			return [__("Passed Gate1"), "blue", "status,=,Gate1"];

		}else if (doc.status === "Gate2"){
			return [__("Outward"), "blue", "status,=,Gate2"];
		}
	}
};
