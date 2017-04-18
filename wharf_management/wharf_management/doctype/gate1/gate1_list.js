// Copyright (c) 2017, Caitlah Technology and contributors
// For license information, please see license.txt

frappe.listview_settings['Gate1'] = {
	add_fields: ["docstatus"],
	get_indicator: function(doc) {
        if(doc.docstatus=== 0){
        	return [__("Require Check"), "red", "docstatus,=,0"];

		} else if (doc.docstatus === 1){
			return [__("Passed Gate1"), "green", "docstatus,=,1"];

		} 
	}
};
