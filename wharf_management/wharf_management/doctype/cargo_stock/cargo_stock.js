// Copyright (c) 2018, Sione Taumoepeau and contributors
// For license information, please see license.txt

frappe.ui.form.on('Cargo Stock', {
	refresh: function(frm) {
		cur_frm.add_fetch('container_type', 'size', 'container_size');
        cur_frm.add_fetch('container_type', 'pat_code', 'pat_code');

	},

//	cargo_type: function(frm){

//		if (frm.doc.cargo_type == "Container" || frm.doc.cargo_type == "Tank Tainers")  {

//			cur_frm.set_df_property("container_details", "hidden", 0);
//			cur_frm.set_df_property("vehicles_details", "hidden", 1);
//			cur_frm.set_df_property("break_bulk_details", "hidden", 1);
//			frm.refresh_fields();
//		}

//		if (frm.doc.cargo_type == "Vehicles"){
//			cur_frm.set_df_property("container_details", "hidden", 1);
//			cur_frm.set_df_property("vehicles_details", "hidden", 0);
//			cur_frm.set_df_property("break_bulk_details", "hidden", 1);
//			frm.refresh_fields();

//		}
//		if (frm.doc.cargo_type == "Break Bulk"){
//			cur_frm.set_df_property("container_details", "hidden", 1);
//			cur_frm.set_df_property("vehicles_details", "hidden", 1);
//			cur_frm.set_df_property("break_bulk_details", "hidden", 0);
//			frm.refresh_fields();

//		}
//	}
});
