// Copyright (c) 2017, Sione Taumoepeau and contributors
// For license information, please see license.txt

frappe.ui.form.on('Export', {

    refresh: function(frm) {

        if (frappe.user.has_role("System Manager") || (frappe.user.has_role("Wharf Operation Cashier"))){
            cur_frm.set_df_property("export_payment", "hidden", 0);
            } else {
            cur_frm.set_df_property("export_payment", "hidden", 1);
        }
        if (frappe.user.has_role("System Manager")){
            cur_frm.set_df_property("export_movement", "hidden", 0);

            } else {
            cur_frm.set_df_property("export_movement", "hidden", 1);

        }

        if ((frappe.user.has_role("System Manager") || frappe.user.has_role("Wharf Security Officer Main Gate") &&
                frm.doc.status == "Export" && frm.doc.docstatus == 1
            )) {

            frm.add_custom_button(__('Main Gate'), function() {
                frappe.route_options = {
                    "container_no": frm.doc.container_no
                }
                frappe.new_doc("Main Gate Export");
                frappe.set_route("Form", "Maint Gate Export", doc.name);
            }).addClass("btn-warning");

        }
        if ((frappe.user.has_role("System Manager") || frappe.user.has_role("Wharf Security Officer") &&
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


    },

    load: function(frm){


    },
    apply_wharfage_fee: function(frm){

        frappe.call({
            "method": "frappe.client.get",
            args: {
                doctype: "Wharfage Fee",
                filters: {
                    cargo_type: frm.doc.cargo_type,
                    container_size: frm.doc.container_size
                }
            },
            callback: function(data) {
                cur_frm.set_value("wharfage_fee", data.message["fee_amount"]);
            }
        })

    },
    apply_vgm_fee: function(frm){

        if (frm.doc.container_size == 20){
            cur_frm.set_value("vgm_fee", 77.05);         

        } else if (frm.doc.container_size == 40){
            cur_frm.set_value("vgm_fee", (77.05*2));
        }

    }
});