// Copyright (c) 2017, Sione Taumoepeau and contributors
// For license information, please see license.txt

frappe.ui.form.on('Bulk Item Count', {
	refresh: function(frm) {

	},
	onload: function(frm) {
		
				frappe.call({
					"method": "frappe.client.get",
					args: {
						doctype: "Pre Advice",
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
						cur_frm.set_value("yard_slot", data.message["yard_slot"]);
						cur_frm.set_value("qty", data.message["qty"]);
						cur_frm.set_value("break_bulk_item_count", data.message["break_bulk_item_count"]);
		
						cur_frm.set_df_property("cargo_ref", "read_only", 1);
						cur_frm.set_df_property("yard_slot", "read_only", 1);
						cur_frm.set_df_property("customer", "read_only", 1);
						cur_frm.set_df_property("cargo_type", "read_only", 1);
						cur_frm.set_df_property("cargo_description", "read_only", 1);
						cur_frm.set_df_property("qty", "read_only", 1);
						cur_frm.set_df_property("status", "read_only", 1);		
						cur_frm.set_df_property("break_bulk_item_count", "read_only", 1);
					}
				})
			}
});
