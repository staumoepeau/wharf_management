// Copyright (c) 2017, Sione Taumoepeau and contributors
// For license information, please see license.txt

frappe.ui.form.on('Empty Containers', {
	refresh: function(frm) {


		if ((frappe.user.has_role("System Manager") || frappe.user.has_role("Wharf Security Officer Main Gate") &&
				frm.doc.status == "Gate 1" && 
				frm.doc.docstatus == 1
			)) {

			frm.add_custom_button(__('Main Gate'), function() {
				frappe.route_options = {
					"cargo_ref": frm.doc.name,
					"container_no": frm.doc.container_no,
					"mydoctype" : "EMPTY CONTAINERS"
				}
				frappe.new_doc("Gate2");
				frappe.set_route("Form", "Gate2", doc.name);
			}).addClass("btn-warning");

		}

		if ((frappe.user.has_role("System Manager") || frappe.user.has_role("Wharf Security Officer") &&
			frm.doc.status == "PAID" && 
			frm.doc.docstatus == 1
			)) {

			frm.add_custom_button(__('Gate1'), function() {
				frappe.route_options = {
					"cargo_ref": frm.doc.name,
					"container_no": frm.doc.container_no,
//					"container_content" : frm.doc.container_content,
					"mydoctype" : "EMPTY CONTAINERS"
				}
				frappe.new_doc("Gate1");
				frappe.set_route("Form", "Gate1", doc.name);
			}).addClass("btn-warning");

		}

	},


});
