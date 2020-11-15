// Copyright (c) 2017, Sione Taumoepeau and contributors
// For license information, please see license.txt

frappe.ui.form.on('Export', {

    onload: function(frm) {

        let is_allowed = (frappe.user_roles.includes("System Manager") || frappe.user_roles.includes("Cargo Operation Manager") ||
            frappe.user_roles.includes("Cargo Operation Cashier") || frappe.user_roles.includes("Operation Manifest User"));

        frm.toggle_display(['net_weight', 'volume', 'status', 'export_gate1_status', 'export_gate1_date'], is_allowed);

        frm.toggle_enable(['cargo_type', 'customer', 'container_size', 'container_content', 'yard_status', 'main_gate_date',
            'yard_date', 'yard_created_by', 'yard_created_name', 'yard_slot', 'container_no', 'main_gate_status'
        ], is_allowed);

    },

    refresh: function(frm) {

        //        if (frappe.user_roles.includes('Wharf Security Officer', 'Wharf Security Officer Main Gate', 'Wharf Security Supervisor')) {
        //            frm.page.sidebar.hide(); // this removes the sidebar
        //            $(".timeline").hide()
        //            frm.page.wrapper.find(".layout-main-section-wrapper").removeClass("col-md-10"); // this removes class "col-md-10" from content block, which sets width to 83%
        //        }
        if (frappe.user.has_role("System Manager") || frappe.user.has_role("Wharf Operation Manager")) {
            frm.page.sidebar.show(); // this removes the sidebar
            $(".timeline").show()
            frm.page.wrapper.find(".layout-main-section-wrapper").addClass("col-md-10");
        }
        if (frappe.user_roles.includes('Wharf Security Officer', 'Wharf Security Officer Main Gate', 'Wharf Security Supervisor', 'Yard Inspection User', 'Yard Operation User')) {
            frm.page.sidebar.hide(); // this removes the sidebar
            $(".timeline").hide()
            frm.page.wrapper.find(".layout-main-section-wrapper").removeClass("col-md-10"); // this removes class "col-md-10" from content block, which sets width to 83%
        }


        if (frappe.user.has_role("System Manager") || (frappe.user.has_role("Wharf Operation Manager")) || (frappe.user.has_role("Wharf Operation Cashier"))) {

            frm.page.set_primary_action(__("Payment"), function() {

                //            frm.page.add_action_icon(__("fa fa-money fa-2x text-success"), function() {
                frappe.route_options = {
                    "payment_type": "Receive",
                    "customer": frm.doc.customer,
                    "reference_doctype": "Export"
                }
                frappe.set_route("Form", "Wharf Payment Entry", "New Wharf Payment Entry 1");
            }).addClass("btn-success");
        }

        //        if (frappe.user.has_role("System Manager") || (frappe.user.has_role("Wharf Operation Cashier")) && frm.doc.container_content == "EMPTY") {

        //            frm.page.set_secondary_action(__("Deliver MTY"), function() {

        //frm.add_custom_button(__('DELIVER EMPTY'), function() {
        //                frappe.route_options = {
        //                    "cargo_ref": frm.doc.name,
        //                    "container_no": frm.doc.container_no
        //                }
        //                frappe.new_doc("Empty Deliver Payment");
        //                frappe.set_route("Form", "Empty Deliver Payment", doc.name);
        //            }).addClass("btn-warning");

        //            cur_frm.set_df_property("export_payment", "hidden", 0);

        //        } else {
        //            cur_frm.set_df_property("export_payment", "hidden", 1);
        //        }
        //        if (frappe.user.has_role("System Manager")) {
        //            cur_frm.set_df_property("export_movement", "hidden", 0);

        //        } else {
        //            cur_frm.set_df_property("export_movement", "hidden", 1);
        //       }

        //        if ((frappe.user.has_role("System Manager") || frappe.user.has_role("Wharf Security Officer Main Gate") &&
        //                frm.doc.main_gate_status != "Closed" &&
        //                frm.doc.docstatus == 1
        //            )) {

        //            frm.page.set_secondary_action(__('Main Gate'), function() {
        //                frm.events.export_main_gate(frm)
        //            }).addClass("btn-warning");

        //        }
        //        if ((frappe.user.has_role("System Manager") || frappe.user.has_role("Wharf Security Officer") &&
        //                frm.doc.main_gate_status == "Closed" &&
        //                frm.doc.export_gate1_status != "Closed" &&
        //                frm.doc.docstatus == 1
        //            )) {

        //            frm.page.set_secondary_action(__('Gate1'), function() {
        //                frm.events.export_gate1(frm)
        //            }).addClass("btn-teal");

        //}

        //        if ((frappe.user.has_role("Forklift Driver User") || frappe.user.has_role("Yard Inspection User") &&
        //                frm.doc.status == "Gate1" &&
        //                frm.doc.docstatus == 1
        //            )) {

        //            frm.page.set_secondary_action(__('Yard'), function() {
        //                frappe.route_options = {
        //                    "cargo_ref": frm.doc.name,
        //                    "container_no": frm.doc.container_no
        //                }
        //                frappe.new_doc("Yard Export");
        //                frappe.set_route("Form", "Yard Export", doc.name);
        //            }).addClass("btn-teal");
        //        }

        cur_frm.add_fetch('container_type', 'size', 'container_size');
        cur_frm.add_fetch('container_type', 'pat_code', 'pat_code');


    },

    cargo_type: function(frm) {
        if ((frm.doc.cargo_type == "Break Bulk") || (frm.doc.cargo_type == "Loose Cargo")) {

            cur_frm.set_df_property("apply_vgm_fee", "hidden", 1);
            cur_frm.set_df_property("container_size", "hidden", 1);
            cur_frm.set_df_property("container_type", "hidden", 1);
            cur_frm.set_df_property("container_no", "hidden", 1);
            cur_frm.set_df_property("pat_code", "hidden", 1);
            cur_frm.set_df_property("container_content", "hidden", 1);
        } else if (frm.doc.cargo_type != "Break Bulk") {
            cur_frm.set_df_property("apply_vgm_fee", "hidden", 0);
            cur_frm.set_df_property("container_size", "hidden", 0);
            cur_frm.set_df_property("container_type", "hidden", 0);
            cur_frm.set_df_property("container_no", "hidden", 0);
            cur_frm.set_df_property("pat_code", "hidden", 0);
            cur_frm.set_df_property("container_content", "hidden", 0);
        }

    },

    insert_fees_button: function(frm) {
        return frappe.call({
            method: "insert_fees",
            doc: frm.doc,
            callback: function(fees) {
                frm.refresh_fields();
                console.log(fees);
            }
        });
    },
    //    apply_wharfage_fee: function(frm){
    //       if ((frm.doc.cargo_type == "Container") || (frm.doc.cargo_type == "Flatrack")){
    //            frappe.call({
    //                "method": "frappe.client.get",
    //                args: {
    //                    doctype: "Wharfage Fee",
    //                    filters: {
    //                        cargo_type: frm.doc.cargo_type,
    //                        container_size: frm.doc.container_size
    //                    }
    //                },
    //                callback: function(data) {
    //                    cur_frm.set_value("wharfage_fee", data.message["fee_amount"]);
    //                }
    //            })
    //        } else if (frm.doc.cargo_type = "Tank Tainers") {
    //            cur_frm.set_value("wharfage_fee", 179.00);

    //        } else if (!frm.doc.cargo_type in ("Container","Tank Tainers","Flatrack")) {
    //            frappe.call({
    //                "method": "frappe.client.get",
    //                args: {
    //                    doctype: "Wharfage Fee",
    //                    filters: {
    //                        cargo_type: frm.doc.cargo_type,
    //                    }
    //                },
    //                callback: function(data) {
    //                    cur_frm.set_value("wharfage_fee", data.message["fee_amount"]);
    //                }
    //           })
    //        }
    //        calculate_total_fee(frm);
    //    },
    //    apply_vgm_fee: function(frm){

    //        if (frm.doc.container_size == 20){
    //            cur_frm.set_value("vgm_fee", 77.05);         

    //        } else if (frm.doc.container_size == 40){
    //            cur_frm.set_value("vgm_fee", (77.05*2));
    //        }

    //        calculate_total_fee(frm);
    //    },

    //    clear_fee: function(frm){
    //        
    //  
    //        cur_frm.set_value("total_fee", "");
    //        cur_frm.set_value("vgm_fee", 0);
    //        cur_frm.set_value("wharfage_fee", "")
    //        cur_frm.set_value("apply_wharfage_fee", 0)
    //        cur_frm.set_value("apply_vgm_fee", 0)        
    //    },

    export_gate1: function(frm) {
        let d = new frappe.ui.Dialog({
            title: 'Security Gate 1',
            fields: [{
                label: 'Confirm',
                fieldname: 'confirm',
                fieldtype: 'Select',
                options: ['NO',
                    'YES'
                ],
                reqd: 1
            }, ],
            primary_action_label: 'Submit',
            primary_action(values) {
                console.log(values);
                if (values.confirm == "YES") {
                    frappe.call({
                        method: "wharf_management.wharf_management.doctype.export.export.update_gate1_status",
                        args: {
                            "name_ref": frm.doc.name,
                        },
                        callback: function(r) {
                            d.hide();
                            //                            refresh_field("item_count");
                            location.reload(true);
                        }
                    })
                }
            }
        });

        d.show();
    },

    export_main_gate: function(frm) {
        let d = new frappe.ui.Dialog({
            title: 'Security Main Gate',
            fields: [{
                    label: 'Truck Licenses Plate',
                    fieldname: 'truck_licenses_plate',
                    fieldtype: 'Link',
                    options: 'Container Truck',
                    reqd: 1,
                },
                {
                    label: 'Driver Information',
                    fieldname: 'drivers_information',
                    fieldtype: 'Link',
                    options: 'Truck Drivers',
                    reqd: 1
                }
            ],
            primary_action_label: 'Submit',
            primary_action(values) {
                frappe.call({
                    method: "wharf_management.wharf_management.doctype.export.export.update_main_gate_status",
                    args: {
                        "name_ref": frm.doc.name,
                        "truck_licenses_plate": values.truck_licenses_plate,
                        "drivers_information": values.drivers_information
                    },
                    callback: function(r) {
                        d.hide();
                        //                        refresh_field("item_count");
                        location.reload(true);
                    }
                })
            }
        });

        d.show();
    },

});