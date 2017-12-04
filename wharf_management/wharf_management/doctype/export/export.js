// Copyright (c) 2017, Sione Taumoepeau and contributors
// For license information, please see license.txt

frappe.ui.form.on('Export', {

    refresh: function(frm) {

        if ((frappe.user.has_role("Administrator") || frappe.user.has_role("Wharf Security Officer Main Gate") &&
                frm.doc.status == "Export" &&
                frm.doc.docstatus == 1
            )) {

            frm.add_custom_button(__('Main Gate'), function() {
                frappe.route_options = {
                    "container_no": frm.doc.container_no
                }
                frappe.new_doc("Main Gate Export");
                frappe.set_route("Form", "Maint Gate Export", doc.name);
            }).addClass("btn-warning");

        }
        if ((frappe.user.has_role("Administrator") || frappe.user.has_role("Wharf Security Officer") &&
                frm.doc.status == "Main Gate" &&
                frm.doc.docstatus == 1
            )) {

            frm.add_custom_button(__('Gate1'), function() {
                frappe.route_options = {
                    "container_no": frm.doc.container_no
                }
                frappe.new_doc("Gate1 Export");
                frappe.set_route("Form", "Gate1 Export", doc.name);
            }).addClass("btn-warning");

        }
        if ((frappe.user.has_role("Forklift Driver User") || frappe.user.has_role("Yard Inspection User") &&
                frm.doc.status == "Gate1" &&
                frm.doc.docstatus == 1
            )) {

            frm.add_custom_button(__('Yard'), function() {
                frappe.route_options = {
                    "container_no": frm.doc.container_no
                }
                frappe.new_doc("Yard Export");
                frappe.set_route("Form", "Yard Export", doc.name);
            }).addClass("btn-warning");

        }
        cur_frm.add_fetch('container_type', 'size', 'container_size');
        cur_frm.add_fetch('container_type', 'pat_code', 'pat_code');


    }
});