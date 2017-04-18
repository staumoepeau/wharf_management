// Copyright (c) 2017, Caitlah Technology and contributors
// For license information, please see license.txt

frappe.listview_settings['Container'] = {
	add_fields: ["status"],
	get_indicator: function(doc) {
        if(doc.status==="Draft"){
        	return [__("Unknown"), "grey", "status,=,Draft"];

		} else if (doc.status === "Arrived"){
			return [__("Yard"), "orange", "status=,Arrived"];

		} else if (doc.status === "Payment"){
			return [__("Payment"), "blue", "status=,Payment"];

		}
	}
};