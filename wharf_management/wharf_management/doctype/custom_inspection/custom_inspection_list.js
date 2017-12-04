frappe.listview_settings['Custom Inspection'] = {
	add_fields: ["status","docstatus"],
	has_indicator_for_draft: 1,
	get_indicator: function(doc) {
        if(doc.status=== "Inspection"){
        	return [__("Inspection"), "orange", "status,=,'Inspection'"];

		} else if (doc.status === "Deliver"){
			return [__("Deliver"), "green", "status,=,'Deliver'"];

		}
	}
};