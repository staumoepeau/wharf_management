frappe.listview_settings['Yard'] = {
	add_fields: ["docstatus"],
	get_indicator: function(doc) {
        if(doc.docstatus=== 0){
        	return [__("Unknown"), "yellow", "docstatus,=,0"];

		} else if (doc.docstatus === 1){
			return [__("Yard"), "blue", "docstatus,=,1"];

		} else if (doc.docstatus === 2){
			return [__("Cancelled"), "black", "docstatus,=,2"];

		}
	}
};