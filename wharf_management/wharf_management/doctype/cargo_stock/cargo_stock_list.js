// Copyright (c) 2017, Sione Taumoepeau and contributors
// For license information, please see license.txt

frappe.listview_settings['Cargo Stock'] = {
	add_fields: ["status"],
	has_indicator_for_draft: 1,
	get_indicator: function(doc) {

		if(doc.docstatus==0){
			if (doc.status==="Stock UnCompleted"){
				return [__("Stock Uncompleted"), "red", "status,=,Stock UnCompleted"];
			}

		} else if(doc.docstatus==1){
			if (doc.status=== "Stock Completed"){
				return [__("Stock Completed"), "green", "status,=,Stock Completed"];
				
			}
		} else if(doc.docstatus==2){
			return [__("Cancelled"), "black", "status,=,Cancelled"];			

	}
		
	
}
};
