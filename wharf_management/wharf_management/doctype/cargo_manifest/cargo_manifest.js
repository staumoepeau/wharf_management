// Copyright (c) 2017, Caitlah Technology and contributors
// For license information, please see license.txt

frappe.ui.form.on('Cargo Manifest', {

	setup: function(frm) {
		frm.get_field('manifest_table').grid.editable_fields = [
			{fieldname: 'cargo_refrence', columns: 1},
			{fieldname: 'container_no', columns: 1},
			{fieldname: 'cargo_type', columns: 1},
			{fieldname: 'work_type', columns: 1},
			{fieldname: 'container_content', columns: 1}
		];

		frm.get_field('manifest_summary_table').grid.editable_fields = [
			{fieldname: 'cargo_type', columns: 1},
			{fieldname: 'cargo_content', columns: 1},
			{fieldname: 'dis_charging', columns: 1},
			{fieldname: 'loading', columns: 1},
			{fieldname: 'total_weight', columns: 1}
		];
	},

	refresh: function(frm) {


	},

	booking_ref: function(frm){
		frappe.call({
			method:"frappe.client.get",
				args: {
						doctype:"Booking Request",
						filters: {'name': frm.doc.booking_ref
						},
					},
				callback: function(r) {
					cur_frm.set_value("voyage_no", r.message["voyage_no"])
					cur_frm.set_value("agents", r.message["agents"]);
					cur_frm.set_value("vessel", r.message["vessel"]);
					cur_frm.set_value("eta_date", r.message["eta_date"]);
					cur_frm.set_value("eta_time", r.message["eta_time"]);
					cur_frm.set_value("pod", r.message["pod"]);
					cur_frm.set_value("pol", r.message["pol"]);
					cur_frm.set_value("final_dest_port", r.message["final_dest_port"]);

				}
		})
		
	},
	
	
	get_manifest_list: function(frm) {
		return frappe.call({
			method: "get_manifest",
			doc: frm.doc,
			callback: function(r) {
				frm.refresh_field("manifest_table");
				frm.refresh_fields();
			}
		});
	},
});
	

