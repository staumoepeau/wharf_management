// Copyright (c) 2017, Caitlah Technology and contributors
// For license information, please see license.txt

frappe.ui.form.on('Cargo', {


    onload: function(frm) {


        if (frappe.user.has_role("Wharf Security Officer") || frappe.user.has_role("Wharf Security Officer Main Gate")) {
            cur_frm.set_df_property("custom_warrant", "hidden", 1);
        } else {
            cur_frm.set_df_property("custom_warrant", "hidden", 0);
        }

        if (frappe.user.has_role("Wharf Operation Manifest User")) {

            cur_frm.set_df_property("manifest_section", "hidden", 0);
            cur_frm.set_df_property("handling_fee", "read_only", 0);
            cur_frm.set_df_property("wharfage_fee", "read_only", 0);


        } else {
            cur_frm.set_df_property("manifest_section", "hidden", 1);
            cur_frm.set_df_property("handling_fee", "read_only", 1);
            cur_frm.set_df_property("wharfage_fee", "read_only", 1);

        }

        if (frappe.user.has_role("System Manager")){
            cur_frm.set_df_property("inspection_status", "read_only", 0);
            cur_frm.set_df_property("yard_status", "read_only", 0);
            cur_frm.set_df_property("payment_status", "read_only", 0);
            cur_frm.set_df_property("gate1_status", "read_only", 0);
            cur_frm.set_df_property("gate2_status", "read_only", 0);
            cur_frm.set_df_property("final_status", "read_only", 0);
            cur_frm.set_df_property("status", "read_only", 0);

        } else{
            cur_frm.set_df_property("inspection_status", "read_only", 1);
            cur_frm.set_df_property("yard_status", "read_only", 1);
            cur_frm.set_df_property("payment_status", "read_only", 1);
            cur_frm.set_df_property("gate1_status", "read_only", 1);
            cur_frm.set_df_property("gate2_status", "read_only", 1);
            cur_frm.set_df_property("final_status", "read_only", 1);
            cur_frm.set_df_property("status", "read_only", 1);
        }


    },

    refresh: function(frm) {
        cur_frm.add_fetch('container_type', 'size', 'container_size');
        cur_frm.add_fetch('container_type', 'pat_code', 'pat_code');
        cur_frm.add_fetch('vessel', 'vessel_type', 'vessel_type');

        cur_frm.add_fetch('booking_ref', 'voyage_no', 'voyage_no');
        cur_frm.add_fetch('booking_ref', 'agents', 'agents');
        cur_frm.add_fetch('booking_ref', 'vessel', 'vessel');
        cur_frm.add_fetch('booking_ref', 'eta_date', 'eta_date');
        cur_frm.add_fetch('booking_ref', 'etd_date', 'etd_date');
        cur_frm.add_fetch('booking_ref', 'pol', 'pol');
        cur_frm.add_fetch('booking_ref', 'pod', 'pod');
        cur_frm.add_fetch('booking_ref', 'final_dest_port', 'final_dest_port');


        if ((frappe.user.has_role("Administrator") || frappe.user.has_role("Yard Inspection User") || frappe.user.has_role("Yard Inspection Supervisor")) &&
            frm.doc.gate2_status != "Closed" &&
            frm.doc.gate1_status != "Closed" &&
            frm.doc.payment_status != "Closed" &&
            frm.doc.yard_status != "Closed" &&
            frm.doc.inspection_status != "Closed"
        ) {
            frm.add_custom_button(__('Inspection'), function() {
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
        if ((frappe.user.has_role("Administrator") || frappe.user.has_role("Cargo Operation User") &&
                frm.doc.payment_status != "Closed" &&
                frm.doc.yard_status == "Closed" &&
                frm.doc.inspection_status == "Closed"
            )) {
            frm.add_custom_button(__('Payment'), function() {
                frappe.route_options = {
                    "cargo_ref": frm.doc.name
                }
                frappe.new_doc("Wharf Payment Fee");
                frappe.set_route("Form", "Wharf Payment Fee", doc.name);
            }).addClass("btn-primary");
        }

        if ((frappe.user.has_role("Administrator") || frappe.user.has_role("Wharf Security Officer") &&
                frm.doc.gate1_status != "Closed" &&
                frm.doc.payment_status == "Closed" &&
                frm.doc.yard_status == "Closed" &&
                frm.doc.inspection_status == "Closed"
            )) {
            cur_frm.set_df_property("custom_warrant", "hidden", 1);
            frm.add_custom_button(__('Gate 1'), function() {
                frappe.route_options = {
                    "cargo_ref": frm.doc.name
                }
                frappe.new_doc("Gate1");
                frappe.set_route("Form", "Gate1", doc.name);
            }).addClass("btn-primary");

        }

        if ((frappe.user.has_role("Administrator") || frappe.user.has_role("Wharf Security Officer Main Gate") &&
                frm.doc.gate2_status != "Closed" &&
                frm.doc.gate1_status == "Closed" &&
                frm.doc.payment_status == "Closed" &&
                frm.doc.yard_status == "Closed" &&
                frm.doc.inspection_status == "Closed"
            )) {
            frm.add_custom_button(__('Main Gate'), function() {
                frappe.route_options = {
                    "cargo_ref": frm.doc.name
                }
                frappe.new_doc("Gate2");
                frappe.set_route("Form", "Gate2", doc.name);
            }).addClass("btn-primary");
        }

        //       if ((frappe.user.has_role("Administrator") || frappe.user.has_role("Wharf Security Officer Main Gate") &&
        //                frm.doc.gate2_status == "Open" &&
        //                frm.doc.gate1_status == "Open" &&
        //                frm.doc.payment_status == "Open" &&
        //                frm.doc.yard_status == "Open" &&
        //                frm.doc.inspection_status == "Open" &&
        //                frm.doc.work_type == "Loading" &&
        //                frm.doc.export_status != "Main Gate"
        //            )) {
        //            frm.add_custom_button(__('Main Gate'), function() {
        //                frappe.route_options = {
        //                    "cargo_ref": frm.doc.name
        //                }
        //                frappe.new_doc("Gate2");
        //                frappe.set_route("Form", "Gate2", doc.name);
        //            }).addClass("btn-primary");
        //        }



        //        if ((frappe.user.has_role("Administrator") || frappe.user.has_role("Forklift Driver User") &&
        //                frm.doc.gate2_status == "Open" &&
        //                frm.doc.gate1_status == "Open" &&
        //                frm.doc.payment_status == "Open" &&
        //                frm.doc.yard_status == "Open" &&
        //                frm.doc.inspection_status == "Open" &&
        //                frm.doc.work_type == "Loading" &&
        //                frm.doc.export_status == "Gate1"
        //            )) {
        //            frm.add_custom_button(__('Driver'), function() {
        //                frappe.route_options = {
        //                    "cargo_ref": frm.doc.name
        //                }
        //                frappe.new_doc("Yard");
        //                frappe.set_route("Form", "Yard", doc.name);
        //            }).addClass("btn-primary");
        //        }
        if ((frappe.user.has_role("Administrator") || frappe.user.has_role("Yard Inspection User") || frappe.user.has_role("Yard Inspection Supervisor")) &&
            frm.doc.gate2_status != "Closed" &&
            frm.doc.gate1_status != "Closed" &&
            frm.doc.payment_status != "Closed" &&
            frm.doc.yard_status != "Closed" &&
            frm.doc.inspection_status != "Closed" &&
            frm.doc.work_type == "Loading"
        ) {
            frm.add_custom_button(__('Inspection'), function() {
                frappe.route_options = {
                    "cargo_ref": frm.doc.name
                }
                frappe.new_doc("Inspection");
                frappe.set_route("Form", "Inspection", doc.name);

            }).addClass("btn-info");
        }


        if ((frappe.user.has_role("Administrator") || frappe.user.has_role("Yard Inspection User") || frappe.user.has_role("Yard Inspection Supervisor")) &&
            //frm.doc.gate2_status != "Closed" &&
            //frm.doc.gate1_status != "Closed" &&
            //frm.doc.payment_status != "Closed" &&
            //frm.doc.yard_status != "Closed" &&
            frm.doc.inspection_status == "Closed" &&
            //frm.doc.inspection_status == "Closed" &&
            frm.doc.qty > 0 &&
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

        if ((frappe.user.has_role("Administrator") || frappe.user.has_role("Wharf Security Officer") &&
                frm.doc.inspection_status == "Closed" &&
                frm.doc.yard_status == "Closed" &&
                frm.doc.payment_status == "Closed" &&
                frm.doc.gate1_status == "Closed" &&
                frm.doc.qty > 0 &&
                frm.doc.security_item_count != frm.doc.qty
            )) {
            frm.add_custom_button(__('Gate1 Count'), function() {
                frappe.route_options = {
                    "cargo_ref": frm.doc.name
                }
                frappe.new_doc("Gate1 Item Count");
                frappe.set_route("Form", "Gate1 Item Count", doc.name);
            }).addClass("btn-warning");
        }

        if ((frappe.user.has_role("Administrator") || frappe.user.has_role("Wharf Operation Cashier") &&
                frm.doc.payment_status != "Closed" &&
                frm.doc.yard_status == "Closed" &&
                frm.doc.inspection_status == "Closed" &&
                frm.doc.custom_inspection_status != "Closed"

            )) {
            frm.add_custom_button(__('Custom Inspection'), function() {
                frappe.route_options = {
                    "cargo_ref": frm.doc.name
                }
                frappe.new_doc("Custom Inspection");
                frappe.set_route("Form", "Custom Inspection", doc.name);
            }).addClass("btn-danger");
        }

        //        if ((frappe.user.has_role("Administrator") || frappe.user.has_role("Yard Inspection User") &&
        //                frm.doc.gate2_status == "Open" &&
        //                frm.doc.gate1_status == "Open" &&
        //                frm.doc.payment_status == "Open" &&
        //                frm.doc.yard_status == "Open" &&
        //                frm.doc.inspection_status == "Open" &&
        //                frm.doc.work_type == "Loading" &&
        //                frm.doc.export_status == "Paid"
        //            )) {
        //            frm.add_custom_button(__('Inspection'), function() {
        //                frappe.route_options = {
        //                    "cargo_ref": frm.doc.name
        //                }
        //                frappe.new_doc("Inspection");
        //                frappe.set_route("Form", "Inspection", doc.name);
        //            }).addClass("btn-primary");
        //        }
    },
    handling_fee_discount: function(frm) {
        if (frm.doc.handling_fee_discount == "YES") {

            if (frm.doc.cargo_type == "Container") {
                frappe.call({
                    "method": "frappe.client.get",
                    args: {
                        doctype: "Wharf Handling Fee",
                        filters: {
                            cargo_type: frm.doc.cargo_type,
                            container_size: frm.doc.container_size,
                            container_content: frm.doc.container_content,
                            work_type: frm.doc.work_type
                        }
                    },
                    callback: function(data) {
                        var discount_rate = (data.message["fee_amount"] - (data.message["fee_amount"] * 20 / 100))
                        cur_frm.set_value("handling_fee", discount_rate);
                    }
                })
            } else if (frm.doc.cargo_type != "Container") {
                frappe.call({
                    "method": "frappe.client.get",
                    args: {
                        doctype: "Wharf Handling Fee",
                        filters: {
                            cargo_type: frm.doc.cargo_type,
                        }
                    },
                    callback: function(data) {
                        if (frm.doc.volume > frm.doc.net_weight) {
                            var handling_fee = frm.doc.volume * data.message["fee_amount"]
                        } else if (frm.doc.volume < frm.doc.net_weight) {
                            var handling_fee = frm.doc.net_weight * data.message["fee_amount"]
                        }
                        cur_frm.set_value("handling_fee", handling_fee);
                    }
                })
            }

        } else if (frm.doc.handling_fee_discount == "NO") {

            if (frm.doc.cargo_type == "Container") {
                frappe.call({
                    "method": "frappe.client.get",
                    args: {
                        doctype: "Wharf Handling Fee",
                        filters: {
                            cargo_type: frm.doc.cargo_type,
                            container_size: frm.doc.container_size,
                            container_content: frm.doc.container_content,
                            work_type: frm.doc.work_type
                        }
                    },
                    callback: function(data) {
                        cur_frm.set_value("handling_fee", data.message["fee_amount"]);
                    }
                })
            } else if (frm.doc.cargo_type == "Vehicles") {
                frappe.call({
                    "method": "frappe.client.get",
                    args: {
                        doctype: "Wharf Handling Fee",
                        filters: {
                            cargo_type: frm.doc.cargo_type,
                        }
                    },
                    callback: function(data) {
                        cur_frm.set_value("handling_fee", data.message["fee_amount"]);
                    }
                })
            } else if (frm.doc.cargo_type != "Container" || frm.doc.cargo_type != "Vehicles") {
                frappe.call({
                    "method": "frappe.client.get",
                    args: {
                        doctype: "Wharf Handling Fee",
                        filters: {
                            cargo_type: frm.doc.cargo_type,
                        }
                    },
                    callback: function(data) {
                        if (frm.doc.volume > frm.doc.net_weight) {
                            var handling_fee = frm.doc.volume * data.message["fee_amount"]
                        } else if (frm.doc.volume < frm.doc.net_weight) {
                            var handling_fee = frm.doc.net_weight * data.message["fee_amount"]
                        }
                        cur_frm.set_value("handling_fee", handling_fee);
                    }
                })
            }
        }
    },

});