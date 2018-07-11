// Copyright (c) 2017, Caitlah Technology and contributors
// For license information, please see license.txt

frappe.listview_settings['Cargo Warehouse'] = {
	add_fields: ["status"],
	has_indicator_for_draft: 1,
	get_indicator: function(doc) {

		if(doc.docstatus==0){
			if(doc.status==""){
				return [__("Need Attention"), "red", "status,=,'Booked'"];
			}
		} else if(doc.status=== "Booked"){
			return [__("Booked"), "purple", "status,=,Booked"];

		} else if (doc.status === "Inspection"){
			return [__("Inspection"), "green", "status,=,Inspection"];

		} else if (doc.status === "Shelves"){
			return [__("Shelves"), "blue", "status,=,Shelves"];
		
		}else if (doc.status === "Custom Check"){
			return [__("Custom Check"), "red", "status,=,'Custom Check'"];

		} else if (doc.status === "Paid"){
			return [__("Paid"), "orange", "status,=,Paid"];

		}else if (doc.status === "Security Check"){
			return [__("Gate Out"), "green", "status,=,'Security Check'"];
		}
	}
};
