// Copyright (c) 2017, Sione Taumoepeau and contributors
// For license information, please see license.txt

frappe.ui.form.on('Warehouse Yard', {
	refresh: function(frm) {

	},

	on_submit: function(frm){
        frappe.set_route("List", "Cargo Warehouse");
        location.reload(true);
	},

	onload: function(frm) {
		
				frappe.call({
					"method": "frappe.client.get",
					args: {
						doctype: "Cargo Warehouse",
						name: frm.doc.cargo_warehouse_ref,
						filters: {
							'docstatus': 1
						},
					},
					callback: function(data) {
						console.log(data);
						cur_frm.set_value("bol", data.message["bol"]);
						cur_frm.set_value("consignee", data.message["consignee"]);
						cur_frm.set_value("mark", data.message["mark"]);
						cur_frm.set_value("cargo_type", data.message["cargo_type"]);
						

						cur_frm.set_df_property("cargo_type", "read_only", 1);
						cur_frm.set_df_property("consignee", "read_only", 1);
						cur_frm.set_df_property("mark", "read_only", 1);
						cur_frm.set_df_property("bol", "read_only", 1);

						cur_frm.set_df_property("status", "read_only", 1);
						cur_frm.set_df_property("cargo_warehouse_ref", "read_only", 1);
					}
				})
		
			}
});
