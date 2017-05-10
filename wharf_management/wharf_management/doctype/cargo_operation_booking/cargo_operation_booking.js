// Copyright (c) 2017, Caitlah Technology and contributors
// For license information, please see license.txt

frappe.ui.form.on('Cargo Operation Booking', {

	setup: function(frm) {
		frm.get_field('cargo_booking_manifest_table').grid.editable_fields = [
			{fieldname: 'cargo_type', columns: 1},
			{fieldname: 'cargo_content', columns: 1},
			{fieldname: 'dis_charging', columns: 1},
			{fieldname: 'loading', columns: 1},
			{fieldname: 'total_weight', columns: 4}
		];

		frm.get_field('forklift_table').grid.editable_fields = [
			{fieldname: 'forklift_require', columns: 1},
			{fieldname: 'forklift_qty', columns: 1}
		];

		frm.get_field('employee_working_table').grid.editable_fields = [
			{fieldname: 'employee', columns: 2},
			{fieldname: 'pick_up_time', columns: 2},
			{fieldname: 'drop_off_time', columns:2},
			{fieldname: 'pickup_place', columns: 2},
			{fieldname: 'drop_off_place', columns: 2}
		];

	},
	refresh: function(frm) {
		cur_frm.add_fetch('voyage_no','vessel','vessel');
		cur_frm.add_fetch('voyage_no','eta_date','eta_date');
		cur_frm.add_fetch('voyage_no','eta_time','eta_time');
	}
});

frappe.ui.form.on("Cargo Booking Manifest Table", "weight", function(frm, cdt, cdn){
  var d = locals[cdt][cdn];
  frappe.model.set_value(d.doctype, d.name, "total_weight", flt(d.weight));

  var total_weight_amount = 0;
  frm.doc.cargo_booking_manifest_table.forEach(function(d) { flt(total_weight_amount += flt(d.weight)); });

  frm.set_value("weight_total", total_weight_amount);

});
