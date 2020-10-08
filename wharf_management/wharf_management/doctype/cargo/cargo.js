// Copyright (c) 2017, Caitlah Technology and contributors
// For license information, please see license.txt

frappe.provide("wharf_management.cargo");

frappe.ui.form.on('Cargo', {

    onload: function(frm) {

        wharf_management.cargo.setup_yard_queries(frm);


        let is_allowed = (frappe.user_roles.includes("System Manager") || frappe.user_roles.includes("Cargo Operation Manager"));

        frm.toggle_enable(['cargo_type', 'work_type', 'secondary_work_type', 'inspection_status', 'yard_status', 'payment_status', 'final_eta', 'final_etd',
            'gate1_status', 'gate2_status', 'final_status', 'status', 'custom_code', 'delivery_code', 'gate1_in', 'pol', 'pod', 'agents',
            'final_dest_port', 'consignee', 'master_bol', 'bol', 'last_port', 'container_size', 'container_content', 'net_weight', 'litre', 'seal_1',
            'container_no', 'pat_code', 'volume', 'mark', 'container_type', 'yard_slot', 'temperature', 'commodity_code', 'chasis_no', 'qty'
        ], is_allowed);

        frm.toggle_display(['booking_ref', 'eta_date', 'etd_date', 'cargo_work_type_section', 'custom_warrant', 'hazaempty_detailsrdous_goods',
            'consignee_details', 'seal_2', 'ports_details', 'stock_reconciliation_section', 'empty_details', 'status_section', 'hazardous_goods',
            'net_weight', 'litre', 'cargo_status', 'manifest_section', 'cargo_delivery_details'
        ], is_allowed);


        frm.toggle_display(['handling_fee', 'wharfage_fee', 'status_section', 'volume', 'container_type'], is_allowed);

        frm.toggle_display(['cargo_ref', 'cargo_information'],
            frappe.user_roles.includes("System Manager"));

        //  frappe.user_roles.includes("System Manager", "Cargo Operation Manager", "Operation Manifest User"));
        //frappe.has_common(frappe.user_roles, ['System Manager', 'Cargo Operation Manager', 'Operation Manifest User', 'Wharf Operation Manager']))

        frm.toggle_display(['break_bulk_items'], frm.doc.qty > 1);

        frm.toggle_display(['last_port'], frm.doc.cargo_type === "Split Ports");


    },

    cargo_type: function(frm) {

        frm.toggle_display(['last_port'], frm.doc.cargo_type === "Split Ports");
    },

    yard_slot: function(frm) {

        if (frm.doc.yard_slot) {
            frappe.db.set_value('Yard Settings', frm.doc.yard_slot, 'occupy', 1)
        }
    },

    refresh: function(frm) {

        if (frappe.user_roles.includes('Wharf Security Officer', 'Wharf Security Officer Main Gate', 'Wharf Security Supervisor')) {

            frm.page.sidebar.hide(); // this removes the sidebar
            $(".timeline").hide()
            frm.page.wrapper.find(".layout-main-section-wrapper").removeClass("col-md-10"); // this removes class "col-md-10" from content block, which sets width to 83%
        }
        if (frappe.user.has_role("System Manager")) {
            frm.page.sidebar.show(); // this removes the sidebar
            $(".timeline").show()
            frm.page.wrapper.find(".layout-main-section-wrapper").addClass("col-md-10");
        }

        if ((frappe.user.has_role("System Manager") || frappe.user.has_role("Wharf Operation Cashier") &&
                frm.doc.payment_status != "Closed" &&
                frm.doc.yard_status == "Closed" &&
                frm.doc.inspection_status == "Closed"
            )) {
            frm.add_custom_button(__('Payment'), function() {
                frappe.route_options = {
                    "payment_type": "Receive",
                    "customer": frm.doc.consignee,
                    "reference_doctype": "Cargo"
                }
                frappe.set_route("Form", "Wharf Payment Entry", "New Wharf Payment Entry 1");
            }).addClass("btn-success");
        }

        if ((frappe.user.has_role("System Manager") || frappe.user.has_role("Wharf Security Officer") &&
                frm.doc.gate1_status != "Closed" &&
                frm.doc.payment_status == "Closed" &&
                frm.doc.yard_status == "Closed" &&
                frm.doc.inspection_status == "Closed" &&
                frm.doc.work_type != "Loading"
            )) {

            frm.add_custom_button(__('Gate 1'), function() {
                frappe.route_options = {
                    "cargo_ref": frm.doc.name,
                    "customer": frm.doc.consignee,
                    "container_no": frm.doc.container_no,
                    "custom_warrant": frm.doc.custom_warrant,
                    "custom_code": frm.doc.custom_code,
                    "delivery_code": frm.doc.delivery_code,
                    "cargo_type": frm.doc.cargo_type,
                    "cargo_description": frm.doc.cargo_description,
                    "chasis_no": frm.doc.chasis_no,
                    "qty": frm.doc.qty,
                    "container_content": frm.doc.container_content,
                    "work_type": frm.doc.work_type,
                    "mydoctype": "CARGO"
                }
                frappe.set_route("Form", "Gate1", "New Gate1 1");
            }).addClass("btn-primary");

        }
        // Create Button for the Split Port INWARD
        if ((frappe.user.has_role("System Manager") || frappe.user.has_role("Wharf Security Officer Main Gate") &&
                frm.doc.gate2_status == "Closed" &&
                frm.doc.gate1_status == "Open" &&
                frm.doc.payment_status == "Closed" &&
                frm.doc.yard_status == "Closed" &&
                frm.doc.inspection_status == "Open" &&
                frm.doc.cargo_type == "Split Ports" &&
                frm.doc.work_type == "Loading"
            )) {

            frm.add_custom_button(__('Gate1'), function() {
                frappe.route_options = {
                    "cargo_ref": frm.doc.name,
                    "work_type": frm.doc.work_type,
                    "customer": frm.doc.consignee,
                    "container_no": frm.doc.container_no,
                    "mydoctype": "CARGO"
                }
                frappe.set_route("Form", "Gate1", "New Gate1 1");
            }).addClass("btn-default");
        }

        if ((frappe.user.has_role("System Manager") || frappe.user.has_role("Wharf Security Officer Main Gate") &&
                frm.doc.gate2_status != "Closed" &&
                frm.doc.gate1_status == "Closed" &&
                frm.doc.payment_status == "Closed" &&
                frm.doc.yard_status == "Closed" &&
                frm.doc.inspection_status == "Closed"
            )) {

            frm.add_custom_button(__('Main Gate'), function() {
                frappe.route_options = {
                    "cargo_ref": frm.doc.name,
                    "work_type": frm.doc.work_type,
                    "customer": frm.doc.consignee,
                    "container_no": frm.doc.container_no,
                    "mydoctype": "CARGO"
                }
                frappe.set_route("Form", "Gate2", "New Gate2 1");
            }).addClass("btn-default");
        }

        // Create Button for the Split Port INWARD
        if ((frappe.user.has_role("System Manager") || frappe.user.has_role("Wharf Security Officer Main Gate") &&
                frm.doc.gate2_status == "Open" &&
                frm.doc.gate1_status == "Open" &&
                frm.doc.payment_status == "Closed" &&
                frm.doc.yard_status == "Closed" &&
                frm.doc.inspection_status == "Open" &&
                frm.doc.cargo_type == "Split Ports" &&
                frm.doc.work_type == "Loading"
            )) {

            frm.add_custom_button(__('Main Gate'), function() {
                frappe.route_options = {
                    "cargo_ref": frm.doc.name,
                    "work_type": frm.doc.work_type,
                    "customer": frm.doc.consignee,
                    "container_no": frm.doc.container_no,
                    "mydoctype": "CARGO"
                }
                frappe.set_route("Form", "Gate2", "New Gate2 1");
            }).addClass("btn-info");
        }

        if ((frappe.user.has_role("System Manager") || frappe.user.has_role("Yard Inspection User") || frappe.user.has_role("Yard Inspection Supervisor")) &&
            frm.doc.gate2_status != "Closed" &&
            frm.doc.gate1_status != "Closed" &&
            frm.doc.payment_status != "Closed" &&
            frm.doc.yard_status != "Closed" &&
            frm.doc.inspection_status != "Closed" &&
            frm.doc.work_type == "Loading"
        ) {
            frm.add_custom_button(__('Inspection'), function() {
                frappe.route_options = {
                    "cargo_ref": frm.doc.name,
                    "container_no": frm.doc.container_no
                }
                frappe.new_doc("Inspection");
                frappe.set_route("Form", "Inspection", doc.name);

            }).addClass("btn-info");
        }

        if ((frappe.user.has_role("System Manager") || frappe.user.has_role("Wharf Operation Cashier") &&
                frm.doc.payment_status != "Closed" &&
                frm.doc.yard_status == "Closed" &&
                frm.doc.inspection_status == "Closed" &&
                frm.doc.status != "Inspection Delivered"

            )) {
            frm.add_custom_button(__('Custom Inspection'), function() {
                frappe.route_options = {
                    "cargo_ref": frm.doc.name
                }
                frappe.new_doc("Custom Inspection");
                frappe.set_route("Form", "Custom Inspection", doc.name);
            }).addClass("btn-danger");
        }

        if ((frappe.user.has_role("System Manager") || frappe.user.has_role("Wharf Security Officer") &&
                frm.doc.inspection_status == "Closed" &&
                frm.doc.yard_status == "Closed" &&
                frm.doc.payment_status == "Closed" &&
                frm.doc.gate1_status == "Closed" &&
                frm.doc.qty > 1 &&
                frm.doc.security_item_count != frm.doc.qty
            )) {
            frm.add_custom_button(__('Gate1 Count'), function() {
                frappe.route_options = {
                    "cargo_ref": frm.doc.name,
                    "mydoctype": "CARGO"

                }
                frappe.new_doc("Gate1 Item Count");
                frappe.set_route("Form", "Gate1 Item Count", doc.name);
            }).addClass("btn-warning");
        }
    },

    handling_fee_discount: function(frm) {
        if (frm.doc.handling_fee_discount == "YES") {

            if (frm.doc.cargo_type == "Container" || frm.doc.cargo_type == "Split Ports") {
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

            if (frm.doc.cargo_type == "Container" || frm.doc.cargo_type == "Split Ports") {
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
            } else if (frm.doc.cargo_type != "Container" || frm.doc.cargo_type != "Vehicles" || frm.doc.cargo_type == "Split Ports") {
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
                        }
                        if (frm.doc.volume < frm.doc.net_weight) {
                            var handling_fee = frm.doc.net_weight * data.message["fee_amount"]
                        }
                        cur_frm.set_value("handling_fee", handling_fee);
                    }
                })
            }
        }
    },
    manifest_check: function(frm) {

        if (frm.doc.manifest_check == "Confirm") {
            if (frm.doc.work_type == "Loading") {
                return frappe.call({
                    method: "get_storage_fee",
                    doc: frm.doc,
                    //                   callback: function(get_storage_fee) {
                    //                       frm.refresh_fields();
                    //                       cur_frm.set_value("storage_fee", get_storage_fee);
                    //                       console.log(get_storage_fee);
                    //                   }
                });
            } else if ((frm.doc.manifest_check != "Confirm") && (frm.doc.container_content == "FULL")) {
                cur_frm.set_value("storage_fee", 0);
            }
        }
    }
});

$.extend(wharf_management.cargo, {

    setup_yard_queries: function(frm) {
        frm.set_query('yard_slot', () => {
            return {
                filters: [
                    ['Yard Settings', 'occupy', '=', 0]
                ]
            }
        });
        //    frm.fields_dict['cargo_references_table'].grid.get_field("reference_doctype").get_query = function(doc, cdt, cdn) {
        //        return {
        //            filters: [
        //                ['Cargo', 'docstatus', '=', 1],
        //                ['Cargo', 'status', 'in', ['Yard', 'Inspection Delivered', 'Split Ports']],
        //                ['Cargo', 'consignee', '=', frm.doc.customer],
        //            ]
        //        }
        //    }
    },
});