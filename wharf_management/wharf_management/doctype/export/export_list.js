// Copyright (c) 2017, Caitlah Technology and contributors
// For license information, please see license.txt

frappe.listview_settings['Export'] = {
	add_fields: ["status"],
	get_indicator: function(doc) {
        if(doc.status=== "Export"){
        	return [__("Export"), "purple", "status,=,'Export'"];

		} else if (doc.status === "Main Gate"){
			return [__("Gate In"), "green", "status,=,'Gate In'"];

		} else if (doc.status === "Gate1"){
			return [__("Gate1"), "orange", "status,=,'Gate1'"];

		}else if (doc.status === "Yard"){
			return [__("Yard"), "grey", "status,=,'Yard'"];
		
		}else if (doc.status === ""){
			return [__("Require Attention"), "black", "status,=,''"];
		}


	}
};
