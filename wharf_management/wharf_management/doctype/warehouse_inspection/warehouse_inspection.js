// Copyright (c) 2017, Sione Taumoepeau and contributors
// For license information, please see license.txt

frappe.ui.form.on('Warehouse Inspection', {
	refresh: function(frm) {

		if ((frappe.user.has_role("Administrator") || frappe.user.has_role("Yard Inspection User") || frappe.user.has_role("Yard Inspection Supervisor")) &&
		frm.doc.inspection_status == "Closed" &&
		frm.doc.qty > 1 &&
		frm.doc.break_bulk_item_count != frm.doc.qty
		) {
			frm.add_custom_button(__('Bulk Item Count'), function() {
				frappe.route_options = {
					"cargo_ref": frm.doc.name
				}
				frappe.new_doc("Bulk Item Count");
				frappe.set_route("Form", "Bulk Item Count", doc.name);

			}).addClass("btn-warning");
		}
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
						cur_frm.set_value("container_no", data.message["container_no"]);
						cur_frm.set_value("voyage_no", data.message["voyage_no"]);
						cur_frm.set_value("vessel", data.message["vessel"]);
						cur_frm.set_value("bol", data.message["bol"]);
						cur_frm.set_value("consignee", data.message["consignee"]);
						cur_frm.set_value("mark", data.message["mark"]);
						cur_frm.set_value("cargo_type", data.message["cargo_type"]);
						cur_frm.set_value("qty", data.message["qty"]);
						
						
						cur_frm.set_df_property("voyage_no", "read_only", 1);
						cur_frm.set_df_property("cargo_type", "read_only", 1);
						cur_frm.set_df_property("consignee", "read_only", 1);
						cur_frm.set_df_property("mark", "read_only", 1);
						cur_frm.set_df_property("vessel", "read_only", 1);
						cur_frm.set_df_property("work_type", "read_only", 1);
						cur_frm.set_df_property("bol", "read_only", 1);
						cur_frm.set_df_property("container_no", "read_only", 1);
						cur_frm.set_df_property("qty", "read_only", 1);

						cur_frm.set_df_property("status", "read_only", 1);
						cur_frm.set_df_property("cargo_warehouse_ref", "read_only", 1);
					}
				})
		
			}
		
});
