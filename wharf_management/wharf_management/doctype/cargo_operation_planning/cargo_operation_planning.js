// Copyright (c) 2017, Caitlah Technology and contributors
// For license information, please see license.txt

frappe.ui.form.on('Cargo Operation Planning', {

	setup: function(frm) {
		frm.get_field('cargo_booking_manifest_table').grid.editable_fields = [
			{fieldname: 'cargo_type', columns: 2},
			{fieldname: 'cargo_content', columns: 2},
			{fieldname: 'dis_charging', columns: 2},
			{fieldname: 'loading', columns: 2},
			{fieldname: 'total_weight', columns: 2}
		];

		frm.get_field('forklift_table').grid.editable_fields = [
			{fieldname: 'forklift_require', columns: 1},
			{fieldname: 'forklift_qty', columns: 1}
		];

		frm.get_field('employee_table').grid.editable_fields = [
			{fieldname: 'employee_name', columns: 1},
			{fieldname: 'machinery', columns: 1},
			{fieldname: 'duty', columns: 1},
			{fieldname: 'pickup_time', columns: 1},
			{fieldname: 'drop_off_time', columns: 1},
		];

		frm.get_field('shifttable').grid.editable_fields = [
			{fieldname: 'shift', columns: 1},
			{fieldname: 'from', columns: 1},
			{fieldname: 'to', columns: 1}
		];

	},
	onload: function(frm){

		frm.set_query("booking_ref", function() {
			return {
				"filters": {
						"docstatus": ["=", 1],
				}
			};
		});
	},

	booking_ref: function(frm){
		cur_frm.add_fetch('booking_ref','voyage_no','voyage_no');
		cur_frm.add_fetch('booking_ref','vessel','vessel');
		cur_frm.add_fetch('booking_ref','eta_date','eta_date');
		cur_frm.add_fetch('booking_ref','eta_time','eta_time');
		cur_frm.add_fetch('booking_ref','labour_requirements','labour_requirements');
		cur_frm.add_fetch('booking_ref','gear_requirements','gear_requirements');
		cur_frm.add_fetch('booking_ref','crew_transport','crew_transport');


		frappe.call({
			method: "get_operation_list",
			doc: frm.doc,
			callback: function(r, rt) {
//				conosole.log("rt");
				frm.refresh_field("cargo_booking_manifest_table");
				frm.refresh_fields();
			}
		});

		frappe.call({
			method: "get_forklift_list",
			doc: frm.doc,
			callback: function(r, rt) {
//				conosole.log("rt");
				frm.refresh_field("forklift_table");
				frm.refresh_fields();
			}
		});

	},

	refresh: function(frm) {

	},

	get_operation_list: function(frm) {
		return
	},

});

frappe.ui.form.on("Cargo Booking Manifest Table", "weight", function(frm, cdt, cdn){
  var d = locals[cdt][cdn];
  frappe.model.set_value(d.doctype, d.name, "total_weight", flt(d.weight));

  var total_weight_amount = 0;
  frm.doc.cargo_booking_manifest_table.forEach(function(d) { flt(total_weight_amount += flt(d.weight)); });

  frm.set_value("weight_total", total_weight_amount);

});
