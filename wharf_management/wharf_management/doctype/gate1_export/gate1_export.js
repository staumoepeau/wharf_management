// Copyright (c) 2017, Sione Taumoepeau and contributors
// For license information, please see license.txt

frappe.ui.form.on('Gate1 Export', {
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
								cur_frm.set_value("cargo_type", data.message["cargo_type"]);
								cur_frm.set_value("cargo_description", data.message["cargo_description"]);
								cur_frm.set_value("container_type", data.message["container_type"]);
								
								cur_frm.set_value("container_size", data.message["container_size"]);
								cur_frm.set_value("container_content", data.message["container_content"]);
								cur_frm.set_value("agents", data.message["agents"]);

//								cur_frm.set_df_property("drivers_information", "read_only", 1);
//								cur_frm.set_df_property("company", "read_only", 1);
//								cur_frm.set_df_property("truck_licenses_plate", "read_only", 1);								
							}								
	})

		frappe.call({
			"method": "frappe.client.get",
						args: {
							doctype: "Main Gate Export",
							filters: {
								'cargo_ref': frm.doc.cargo_ref,
								'container_no': frm.doc.container_no,
								'docstatus': 1
							},	
						},
						callback: function (data) {
								cur_frm.set_value("cargo_ref", data.message["cargo_ref"]);
								cur_frm.set_value("truck_licenses_plate", data.message["truck_licenses_plate"]);
								cur_frm.set_value("company", data.message["company"]);
								cur_frm.set_value("drivers_information", data.message["drivers_information"]);															
								cur_frm.set_df_property("drivers_information", "read_only", 1);
								cur_frm.set_df_property("cargo_ref", "read_only", 1);
								cur_frm.set_df_property("company", "read_only", 1);
								cur_frm.set_df_property("truck_licenses_plate", "read_only", 1);								
							}								
		})
		
	}

});
