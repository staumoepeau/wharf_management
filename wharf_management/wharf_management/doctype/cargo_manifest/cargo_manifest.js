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
		cur_frm.add_fetch('booking_ref','voyage_no','voyage_no');
		cur_frm.add_fetch('booking_ref','vessel','vessel');
		cur_frm.add_fetch('booking_ref','agents','agents');
		cur_frm.add_fetch('booking_ref','eta_date','eta_date');
		cur_frm.add_fetch('booking_ref','eta_time','eta_time');
		cur_frm.add_fetch('booking_ref','pod','pod');
		cur_frm.add_fetch('booking_ref','pol','pol');
		cur_frm.add_fetch('booking_ref','final_dest_port','final_dest_port');

		frappe.call({
			method: "create_manifest_summary_list",
			doc: frm.doc,
			callback: function(r, rt) {
				console.log(r)
				frm.refresh_field("manifest_summary_table");
				frm.refresh_fields();
			}
		});

	},

});
