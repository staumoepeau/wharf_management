// Copyright (c) 2017, Caitlah Technology and contributors
// For license information, please see license.txt

frappe.ui.form.on('Booking Request', {
	
	setup: function(frm) {
		frm.get_field('ship_requirements_link').grid.editable_fields = [
			{fieldname: 'ship_requirements', columns: 2},
			{fieldname: 'ship_requirements_yes_no', columns: 2},
			{fieldname: 'ship_requirements_specify', columns: 2}
		];

		frm.get_field('cargo_booking_manifest_table').grid.editable_fields = [
			{fieldname: 'cargo_type', columns: 1},
			{fieldname: 'cargo_content', columns: 1},
			{fieldname: 'dis_charging', columns: 1},
			{fieldname: 'loading', columns: 1},
			{fieldname: 'total_weight', columns: 1}
		];

		frm.get_field('forklift_table').grid.editable_fields = [
			{fieldname: 'forklift_require', columns: 1},
			{fieldname: 'forklift_qty', columns: 1}
		];

	},

	refresh: function(frm) {
		
		
	},
	
	create_payment: function(frm){
		frappe.route_options = { "payment_ref": frm.doc.name }
		frappe.new_doc("Sales Invoice");
		frappe.set_route("Form", "Sales Invoice", doc.name);
	}
	
	
	
});

frappe.ui.form.on("Cargo Booking Manifest Table", "weight", function(frm, cdt, cdn){
  var d = locals[cdt][cdn];
  frappe.model.set_value(d.doctype, d.name, "total_weight", flt(d.weight));

  var total_weight_amount = 0;
  frm.doc.cargo_booking_manifest_table.forEach(function(d) { flt(total_weight_amount += flt(d.weight)); });

  frm.set_value("total_weight_amount", total_weight_amount);

});
