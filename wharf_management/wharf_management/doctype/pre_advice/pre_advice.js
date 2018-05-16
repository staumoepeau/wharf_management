// Copyright (c) 2017, Sione Taumoepeau and contributors
// For license information, please see license.txt

frappe.ui.form.on('Pre Advice', {

    onload: function(frm) {
        if (frm.doc.cargo_type == "Split Ports") {
            cur_frm.set_df_property("last_port", "hidden", 0);
            
        } else if (frm.doc.cargo_type != "Split Ports") {
            cur_frm.set_df_property("last_port", "hidden", 1);
        }

    },
    cargo_type: function(frm){
        if (frm.doc.cargo_type == "Split Ports") {
            cur_frm.set_df_property("last_port", "hidden", 0);
            
        } else if (frm.doc.cargo_type != "Split Ports") {
            cur_frm.set_df_property("last_port", "hidden", 1);
        }

    },

    refresh: function(frm) {
        cur_frm.add_fetch('container_type', 'size', 'container_size');
        cur_frm.add_fetch('container_type', 'pat_code', 'pat_code');
        cur_frm.add_fetch('booking_ref', 'voyage_no', 'voyage_no');
        cur_frm.add_fetch('booking_ref', 'agents', 'agents');
        cur_frm.add_fetch('booking_ref', 'vessel', 'vessel');
        cur_frm.add_fetch('booking_ref', 'eta_date', 'eta_date');
        cur_frm.add_fetch('booking_ref', 'etd_date', 'etd_date');
        cur_frm.add_fetch('booking_ref', 'pol', 'pol');
        cur_frm.add_fetch('booking_ref', 'pod', 'pod');
        cur_frm.add_fetch('booking_ref', 'final_dest_port', 'final_dest_port');


        if ((frappe.user.has_role("Administrator") || frappe.user.has_role("Yard Inspection User") || frappe.user.has_role("Yard Inspection Supervisor")) &&
                frm.doc.work_type == "Discharged" &&
                frm.doc.secondary_work_type == "Devanning" &&
                frm.doc.docstatus == 1
                ) {

                frm.add_custom_button(__('Vehicles'), function() {
                        frappe.call({
                            method: "devanning_create_vehicles",
                            doc: frm.doc,
                            callback: function(d) {
                            console.log(d)
                            cur_frm.refresh();
                            }
                    })     

                }, __("Devanning"));
                cur_frm.page.set_inner_btn_group_as_primary(__("Devanning"));
                
                frm.add_custom_button(__('Break Bulk'), function() {
                    frappe.call({
                        method: "devanning_create_bbulk",
                        doc: frm.doc,
                        callback: function(d) {
                        console.log(d)
                        cur_frm.refresh();
                        }
                })     
            }, __("Devanning"));
            cur_frm.page.set_inner_btn_group_as_primary(__("Devanning"));
                
            }

        if ((frappe.user.has_role("Administrator") || frappe.user.has_role("Yard Inspection User") || frappe.user.has_role("Yard Inspection Supervisor")) &&
                frm.doc.gate2_status != "Closed" &&
                frm.doc.gate1_status != "Closed" &&
                frm.doc.payment_status != "Closed" &&
                frm.doc.yard_status != "Closed" &&
                frm.doc.inspection_status != "Closed" &&
                frm.doc.docstatus == 1
                    ) {
                    frm.add_custom_button(__('Inspection'), function() {
                        
                        frappe.call({
                            method: "check_export_container",
                            doc: frm.doc,
                            callback: function(r) {
                                if (r.message > 1){
                                       frappe.call({
                                        "method": "frappe.client.get",
                                        args: {
                                            doctype: "Export",
                                            filters: {
                                                container_no: frm.doc.container_no,
                                            }
                                        },
                                        callback: function(data) {

                                            if ((data.message["container_content"] == "FULL") && (data.message["paid_status"] == "Paid")){
                                                                                
                                                frappe.route_options = {
                                                    "cargo_ref": frm.doc.name
                                                }
                                                frappe.new_doc("Inspection");
                                                frappe.set_route("Form", "Inspection", doc.name);
                                                                            }
                                            if ((data.message["container_content"] == "FULL") && (data.message["paid_status"] == "Unpaid")){
                                                frappe.throw("Please check this Container for UNPAID Fees.")

                                                }
                                            }
                                        })
                                } else {
                                    frappe.route_options = {
                                        "cargo_ref": frm.doc.name
                                    }
                                    frappe.new_doc("Inspection");
                                    frappe.set_route("Form", "Inspection", doc.name);
                                }
                            }
                        })

                         frappe.route_options = {
                            "cargo_ref": frm.doc.name
                            }
                            frappe.new_doc("Inspection");
                            frappe.set_route("Form", "Inspection", doc.name);

                    }).addClass("btn-primary");
            }

        if ((frappe.user.has_role("Administrator") || frappe.user.has_role("Yard Operation User") &&
                frm.doc.yard_status != "Closed" &&
                frm.doc.inspection_status == "Closed"
                    )) {
                    frm.add_custom_button(__('Yard'), function() {
                        frappe.route_options = {
                            "cargo_ref": frm.doc.name
                        }
                        frappe.new_doc("Yard");
                        frappe.set_route("Form", "Yard", doc.name);
                    }).addClass("btn-primary");
            }
        
        if ((frappe.user.has_role("Administrator") || frappe.user.has_role("Yard Inspection User") || frappe.user.has_role("Yard Inspection Supervisor")) &&
            frm.doc.inspection_status == "Closed" &&
            frm.doc.qty > 1 &&
            frm.doc.break_bulk_item_count != frm.doc.qty
        ) {
            frm.add_custom_button(__('Bulk Item Count'), function() {
                frappe.route_options = {
                    "cargo_ref": frm.doc.name
                }
                frappe.new_doc("Bulk Item Count");
                frappe.set_route("Form", "Bulk Item Count", doc.name);

            }).addClass("btn-warning");
        }
    },
    
});

