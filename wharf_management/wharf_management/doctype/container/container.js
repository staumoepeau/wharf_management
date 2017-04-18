// Copyright (c) 2017, Caitlah Technology and contributors
// For license information, please see license.txt

frappe.ui.form.on('Container', {
	refresh: function(frm) {
		cur_frm.add_fetch('voyage_no','vessel','vessel');
		cur_frm.add_fetch('voyage_no','vessel_arrival_date','vessel_arrival_date');
		
		
		
		if (frm.doc.status != "Arrived"){
			frm.add_custom_button(__('Yard Operations'), function() {
				frappe.route_options = {
										"container_no": frm.doc.name
										}
				frappe.new_doc("Yard Operation");
				frappe.set_route("Form", "Yard Operation", doc.name);
			});
		}
		
		frm.add_custom_button(__('Payment'), function() {
				frappe.route_options = {
										"container_no": frm.doc.name
										}
				frappe.new_doc("Wharf Payment Fee");
				frappe.set_route("Form", "Wharf Payment Fee", doc.name);
		});
		frm.add_custom_button(__('Gate 1'), function() {
//			frappe.route_options = {
//									"mctn": frm.doc.name
//									}
//			frappe.new_doc("Received Money");
//			frappe.set_route("Form", "Received Money", doc.name);
		});

		frm.add_custom_button(__('Gate 2'), function() {
//			frappe.route_options = {
//									"mctn": frm.doc.name
//									}
//			frappe.new_doc("Received Money");
//			frappe.set_route("Form", "Received Money", doc.name);
		});
		
		
	}
});
