// Copyright (c) 2016, Caitlah Technology and contributors
// For license information, please see license.txt

frappe.ui.form.on('Cargo Operation', {

	refresh: function(frm) {
		cur_frm.add_fetch('voyage_no','vessel','vessel');
		cur_frm.add_fetch('voyage_no','vessel_arrival_date','vessel_arrival_date');


		if (frm.doc.inspection_status != "Closed"){
			frm.add_custom_button(__('Inspection'), function() {
				frappe.route_options = {
										"container_no": frm.doc.name
										}
				frappe.new_doc("Inspection");
				frappe.set_route("Form", "Inspection", doc.name);
			});
		}
		if (frm.doc.yard_status != "Closed"){
			frm.add_custom_button(__('Yard'), function() {
				frappe.route_options = {
										"container_no": frm.doc.name
										}
				frappe.new_doc("Yard");
				frappe.set_route("Form", "Yard", doc.name);
			});
		}
		if (frm.doc.payment_status != "Closed"){
		frm.add_custom_button(__('Payment'), function() {
				frappe.route_options = {
										"container_no": frm.doc.name
										}
				frappe.new_doc("Wharf Payment Fee");
				frappe.set_route("Form", "Wharf Payment Fee", doc.name);
			});
		}
		if (frm.doc.gate1_status != "Closed"){
		frm.add_custom_button(__('Gate 1'), function() {
				frappe.route_options = {
										"container_no": frm.doc.name
										}
				frappe.new_doc("Gate1");
				frappe.set_route("Form", "Gate1", doc.name);
			});
		}
		frm.add_custom_button(__('Gate 2'), function() {
//			frappe.route_options = {
//									"mctn": frm.doc.name
//									}
//			frappe.new_doc("Received Money");
//			frappe.set_route("Form", "Received Money", doc.name);
		});


	}

});
