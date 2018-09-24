// Copyright (c) 2017, Sione Taumoepeau and contributors
// For license information, please see license.txt

frappe.ui.form.on('Gate1 Item Count', {
	refresh: function(frm) {

	},

	on_submit: function(frm){
        if (frm.doc.mydoctype == "CARGO"){
        	frappe.set_route("List", "Cargo")
			location.reload(true);
		}
		if (frm.doc.mydoctype == "Warehouse"){
			frappe.set_route("List", "Cargo Warehouse")
			location.reload(true);

		}
	},
	
	onload: function(frm) {

		if (frm.doc.mydoctype == "CARGO"){
				frappe.call({
					"method": "frappe.client.get",
					args: {
						doctype: "Cargo",
						name: frm.doc.cargo_ref,
						filters: {
							'docstatus': 1,
							'gate1_status': "Open"
						},
					},
					callback: function(data) {
						cur_frm.set_value("customer", data.message["consignee"]);
						cur_frm.set_value("cargo_type", data.message["cargo_type"]);
						cur_frm.set_value("cargo_description", data.message["cargo_description"]);
						cur_frm.set_value("qty", data.message["qty"]);
						cur_frm.set_value("security_item_count", data.message["security_item_count"]);
		
						cur_frm.set_df_property("cargo_ref", "read_only", 1);
						cur_frm.set_df_property("customer", "read_only", 1);
						cur_frm.set_df_property("cargo_type", "read_only", 1);
						cur_frm.set_df_property("cargo_description", "read_only", 1);
						cur_frm.set_df_property("qty", "read_only", 1);
						cur_frm.set_df_property("status", "read_only", 1);		
						cur_frm.set_df_property("security_item_count", "read_only", 1);
					}
				})
			}
		
		if (frm.doc.mydoctype == "Warehouse"){
				frappe.call({
					"method": "frappe.client.get",
					args: {
						doctype: "Cargo Warehouse",
						name: frm.doc.cargo_ref,
						filters: {
							'docstatus': 1,
							'gate1_status': "Open"
						},
					},
					callback: function(data) {

						cur_frm.set_value("customer", data.message["consignee"]);
						cur_frm.set_value("cargo_type", data.message["cargo_type"]);
						cur_frm.set_value("cargo_description", data.message["cargo_description"]);
						cur_frm.set_value("qty", data.message["qty"]);
						cur_frm.set_value("security_item_count", data.message["security_item_count"]);
		
						cur_frm.set_df_property("cargo_ref", "read_only", 1);
						cur_frm.set_df_property("customer", "read_only", 1);
						cur_frm.set_df_property("cargo_type", "read_only", 1);
						cur_frm.set_df_property("cargo_description", "read_only", 1);
						cur_frm.set_df_property("qty", "read_only", 1);
						cur_frm.set_df_property("status", "read_only", 1);		
						cur_frm.set_df_property("security_item_count", "read_only", 1);
						cur_frm.set_value("mydoctype", "read_only", 1);
					}
				})
			}
		}
});
