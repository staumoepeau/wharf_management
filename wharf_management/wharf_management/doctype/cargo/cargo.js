// Copyright (c) 2017, Caitlah Technology and contributors
// For license information, please see license.txt

frappe.ui.form.on('Cargo', {

	refresh: function(frm) {
			cur_frm.add_fetch('booking_ref','voyage_no','voyage_no');
			cur_frm.add_fetch('booking_ref','agents','agents');
			cur_frm.add_fetch('booking_ref','vessel','vessel');
			cur_frm.add_fetch('booking_ref','eta_date','eta_date');
			cur_frm.add_fetch('booking_ref','eta_time','eta_time');
			cur_frm.add_fetch('booking_ref','pol','pol');
			cur_frm.add_fetch('booking_ref','pod','pod');
			cur_frm.add_fetch('booking_ref','final_dest_port','final_dest_port');
		
			if ((frappe.user.has_role("Administrator") || frappe.user.has_role("Yard Inspection User") || frappe.user.has_role("Yard Inspection Supervisor")) 
				&& frm.doc.inspection_status != "Closed"){
				frm.add_custom_button(__('Inspection'), function() {
					frappe.route_options = {
										"cargo_ref": frm.doc.name
											}
					frappe.new_doc("Inspection");
					frappe.set_route("Form", "Inspection", doc.name);

				});
			}
		
			if ((frappe.user.has_role("Administrator") || frappe.user.has_role("Yard Operation User") && frm.doc.yard_status != "Closed" && frm.doc.inspection_status == "Closed")){
					frm.add_custom_button(__('Yard'), function() {
						frappe.route_options = {
												"cargo_ref": frm.doc.name
												}
						frappe.new_doc("Yard");
						frappe.set_route("Form", "Yard", doc.name);
				});
			}
			if ((frappe.user.has_role("Administrator") || frappe.user.has_role("Cargo Operation User") && frm.doc.payment_status != "Closed" && frm.doc.yard_status == "Closed" && frm.doc.inspection_status == "Closed")){
				frm.add_custom_button(__('Payment'), function() {
						frappe.route_options = {
												"cargo_ref": frm.doc.name
												}
						frappe.new_doc("Wharf Payment Fee");
						frappe.set_route("Form", "Wharf Payment Fee", doc.name);
				});
			}
			
			if ((frappe.user.has_role("Administrator") || frappe.user.has_role("Wharf Security Officer") && frm.doc.gate1_status != "Closed" && frm.doc.payment_status == "Closed" && frm.doc.yard_status == "Closed" && frm.doc.inspection_status == "Closed")){
				frm.add_custom_button(__('Gate 1'), function() {
						frappe.route_options = {
												"cargo_ref": frm.doc.name
												}
						frappe.new_doc("Gate1");
						frappe.set_route("Form", "Gate1", doc.name);
				});
			}
			
			if ((frappe.user.has_role("Administrator") || frappe.user.has_role("Wharf Security Officer") && frm.doc.gate2_status != "Closed" && frm.doc.gate1_status == "Closed" && frm.doc.payment_status == "Closed" && frm.doc.yard_status == "Closed" && frm.doc.inspection_status == "Closed")){
				frm.add_custom_button(__('Gate 2'), function() {
						frappe.route_options = {
												"cargo_ref": frm.doc.name
												}
						frappe.new_doc("Gate2");
						frappe.set_route("Form", "Gate2", doc.name);
				});
			}
		


		},

});
