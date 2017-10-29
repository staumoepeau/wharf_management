// Copyright (c) 2017, Sione Taumoepeau and contributors
// For license information, please see license.txt

frappe.ui.form.on('Gate1 Export', {
	refresh: function(frm) {

	},
	onload: function(frm){

		frappe.call({
			"method": "frappe.client.get",
						args: {
							doctype: "Main Gate Export",
							container_no: frm.doc.container_no,
							filters: {
								'docstatus': 1
							},	
						},
						callback: function (data) {
								cur_frm.set_value("truck_licenses_plate", data.message["truck_licenses_plate"]);
								cur_frm.set_value("company", data.message["company"]);
								cur_frm.set_value("drivers_information", data.message["drivers_information"]);															
								cur_frm.set_df_property("drivers_information", "read_only", 1);
								cur_frm.set_df_property("company", "read_only", 1);
								cur_frm.set_df_property("truck_licenses_plate", "read_only", 1);								
							}								
			})
	}

});
