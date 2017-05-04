// Copyright (c) 2017, Caitlah Technology and contributors
// For license information, please see license.txt

frappe.ui.form.on('Cargo Manifest', {
	
	refresh: function(frm) {
		cur_frm.add_fetch('voyage_no','vessel','vessel');
		cur_frm.add_fetch('voyage_no','eta_date','eta_date');
		cur_frm.add_fetch('voyage_no','eta_time','eta_time');
	}
});
