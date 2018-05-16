// Copyright (c) 2017, Sione Taumoepeau and contributors
// For license information, please see license.txt

frappe.ui.form.on('Yard Export', {
	refresh: function(frm) {

	},
	onload: function(frm){

		frappe.call({
				"method": "frappe.client.get",
							args: {
								doctype: "Export",
								name: frm.doc.cargo_ref,
								filters: {
									'docstatus': 1
								},	
							},
							callback: function (data) {
									cur_frm.set_value("cargo_ref", data.message["name"]);
									cur_frm.set_value("container_no", data.message["container_no"]);


									cur_frm.set_df_property("drivers_information", "read_only", 1);
									cur_frm.set_df_property("company", "read_only", 1);
									cur_frm.set_df_property("truck_licenses_plate", "read_only", 1);								
								}								
		})
		
	}
});
