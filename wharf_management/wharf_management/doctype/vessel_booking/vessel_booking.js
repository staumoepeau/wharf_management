// Copyright (c) 2017, Caitlah Technology and contributors
// For license information, please see license.txt

frappe.ui.form.on('Vessel Booking', {

	setup: function(frm) {
		frm.get_field('ship_requirements_link').grid.editable_fields = [
			{fieldname: 'ship_requirements', columns: 2},
			{fieldname: 'ship_requirements_yes_no', columns: 2},
			{fieldname: 'ship_requirements_specify', columns: 2}
		];
	},

	refresh: function(frm) {

	}
});
