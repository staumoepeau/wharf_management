// Copyright (c) 2017, Caitlah Technology and contributors
// For license information, please see license.txt

frappe.ui.form.on('Gate1', {
	refresh: function(frm) {

	},
	
	onload: function(frm) {
		
		frappe.call({
			"method": "frappe.client.get",
						args: {
							doctype: "Cargo Operation",
							name: frm.doc.container_no,
							filters: {
								'docstatus' : 1
							},	
						},
						callback: function (data) {
								cur_frm.set_value("customer", data.message["consignee"]);
								

								cur_frm.set_df_property("container_no", "read_only", 1);
								cur_frm.set_df_property("customer", "read_only", 1);
								
							}								
			})
				
	}
});
