// Copyright (c) 2017, Sione Taumoepeau and contributors
// For license information, please see license.txt

frappe.ui.form.on('Main Gate Export', {
	refresh: function(frm) {

		cur_frm.add_fetch('truck_licenses_plate', 'company', 'company');		

	},

	onload: function(frm){

		frappe.call({
			"method": "frappe.client.get",
						args: {
							doctype: "Export",
							name : frm.doc.cargo_ref,
							container_no: frm.doc.container_no,
							filters: {
								'docstatus': 1
							},	
						},
						callback: function (data) {
								cur_frm.set_value("cargo_ref", data.message["name"]);
								cur_frm.set_df_property("cargo_ref", "read_only", 1);
								cur_frm.set_df_property("container_no", "read_only", 1);							
							}								
		})
	}
});
