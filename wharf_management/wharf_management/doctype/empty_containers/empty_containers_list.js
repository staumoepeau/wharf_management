// Copyright (c) 2018, Sione Taumoepeau and contributors
// For license information, please see license.txt

frappe.listview_settings['Empty Containers'] = {
	add_fields: ["status"],
	get_indicator: function(doc) {
        if(doc.status=== "PAID"){
        	return [__("PAID"), "green", "status,=,'PAID'"];

		} else if (doc.status === "OUT"){
			return [__("OUT"), "orange", "status,=,'OUT'"];

		} else if (doc.status === "Gate 1"){
			return [__("PASS GATE 1"), "grey", "status,=,'Gate 1'"];

		}


	}
};
