// Copyright (c) 2017, Caitlah Technology and contributors
// For license information, please see license.txt

frappe.ui.form.on('Wharf Operations Booking', {

	setup: function(frm) {
		frm.get_field('shifttable').grid.editable_fields = [
			{fieldname: 'shift', columns: 2},
			{fieldname: 'from', columns: 2},
			{fieldname: 'to', columns: 2}
		];
	},

	refresh: function(frm) {
		cur_frm.add_fetch('voyage_no','vessel','vessel');
		cur_frm.add_fetch('voyage_no','eta_date','eta');
		cur_frm.add_fetch('voyage_no','eta_time','etd');

	}
});
