// Copyright (c) 2017, Caitlah Technology and contributors
// For license information, please see license.txt

frappe.provide("wharf_management.cargo");

let cargo_type_a = ['Container', 'Tanktainers', 'Flatrack', 'Split Ports'];
let cargo_type_b = ["Break Bulk", "Heavy Vehicles", "Loose Cargo"];

frappe.ui.form.on('Cargo', {

    before_load: function(frm) {
        if (frm.doc.payment_status == "Closed" && frm.doc.gate1_status == "Open") {
            frappe.call({
                method: "wharf_management.wharf_management.doctype.gate1.gate1.get_storage_days",
                args: {
                    "eta_date": frm.doc.payment_date,
                    "posting_date": frappe.datetime.now_datetime()
                },
                callback: function(d) {
                    d.message
                        //                    alert(d.message)
                    if (d.message > 0) {
                        frappe.call({
                            method: 'wharf_management.wharf_management.doctype.cargo.cargo.set_overdue_storage',
                            args: {
                                "name_ref": frm.doc.name
                            }
                        })
                        frm.save()
                    }
                }
            });
        }

    },

    onload: function(frm) {

        wharf_management.cargo.setup_yard_queries(frm);


        let is_allowed = (frappe.user_roles.includes("System Manager") || frappe.user_roles.includes("Cargo Operation Manager") ||
            frappe.user_roles.includes("Cargo Operation Cashier") || frappe.user_roles.includes("Operation Manifest User"));

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



        if (frm.doc.docstatus == 1) {
            if (frm.doc.cargo_type == "Vehicles") {
                frm.set_df_property("chasis_no", "reqd", 1);
            }
        }

        if (frappe.user.has_role("Yard Inspection User") || frappe.user.has_role("Yard Inspection Supervisor")) {
            frm.disable_save();
        }
        if (frappe.user.has_role("System Manager") || frappe.user.has_role("Wharf Operation Manager")) {
            frm.enable_save();
        }

        if (frappe.user_roles.includes('Wharf Security Officer', 'Wharf Security Officer Main Gate', 'Wharf Security Supervisor')) {

            frm.page.sidebar.hide(); // this removes the sidebar
            $(".timeline").hide()
            frm.page.wrapper.find(".layout-main-section-wrapper").removeClass("col-md-10"); // this removes class "col-md-10" from content block, which sets width to 83%
        }
        if (frappe.user.has_role("System Manager") || frappe.user.has_role("Wharf Operation Manager")) {
            frm.page.sidebar.show(); // this removes the sidebar
            $(".timeline").show()
            frm.page.wrapper.find(".layout-main-section-wrapper").addClass("col-md-10");
        }

        if ((frappe.user.has_role("System Manager") || frappe.user.has_role("Wharf Operation Cashier") &&
                frm.doc.payment_status != "Closed" &&
                frm.doc.yard_status == "Closed" &&
                frm.doc.inspection_status == "Closed"
            )) {
            frm.page.set_primary_action(__('Payment'), function() {
                //frm.page.add_action_icon(__("fa fa-money fa-2x text-success"), function() {

                frappe.route_options = {
                    "payment_type": "Receive",
                    "customer": frm.doc.consignee,
                    "reference_doctype": "Cargo"
                }
                frappe.set_route("Form", "Wharf Payment Entry", "New Wharf Payment Entry 1");
                //            }).addClass("btn-success");
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

                frm.events.check_overdue_storage(frm);

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

                frm.events.get_gate_breakbulk_count(frm)
            }).addClass("btn-warning");
        }

        if ((frappe.user.has_role("Administrator") || frappe.user.has_role("Yard Inspection User") || frappe.user.has_role("Yard Inspection Supervisor")) &&
            frm.doc.inspection_status == "Closed" &&
            frm.doc.qty > 1 &&
            frm.doc.break_bulk_item_count != frm.doc.qty
        ) {
            frm.add_custom_button(__('Bulk Item Count'), function() {

                frm.events.get_breakbulk_count(frm)

            }).addClass("btn-warning");
        }
    },

    check_overdue_storage: function(frm) {

        frappe.call({
            method: "wharf_management.wharf_management.doctype.gate1.gate1.get_storage_days",
            args: {
                "eta_date": frm.doc.payment_date,
                "posting_date": frappe.datetime.now_datetime()
            },
            callback: function(d) {
                d.message
                    //                    alert(d.message)
                if (d.message > 0) {
                    frappe.throw(__('This Cargo have a UNPAID Storage Days Fee. Please refer to the Cashier for more Details. Ref # : {0}'.format(frm.doc.name)))
                } else {

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
                }
            }
        });
    },

    get_breakbulk_count: function(frm) {
        let d = new frappe.ui.Dialog({
            title: 'Yard Inspection',
            fields: [{
                    label: 'Item Count',
                    fieldname: 'item_count',
                    fieldtype: 'Int',
                    reqd: 1
                },
                {
                    label: 'Cargo Condition',
                    fieldname: 'cargo_condition',
                    fieldtype: 'Select',
                    options: ['OK',
                        'Damage'
                    ],
                    reqd: 1
                },
                {
                    label: 'Cargo Condition Comment',
                    fieldname: 'cargo_condition_comment',
                    fieldtype: 'Small Text',
                    depends_on: 'eval:doc.cargo_condition == "Damage"'
                }

            ],
            primary_action_label: 'Submit',
            primary_action(values) {
                if (!values.item_count) {
                    frappe.throw(__("Item Count is required"));
                }
                console.log(values);
                let counter = values.item_count + frm.doc.break_bulk_item_count;
                console.log(counter)
                if (frm.doc.qty < counter) {
                    frappe.msgprint(
                        msg = 'Item Count is Greater than the QTY',
                        title = 'Error',
                        raise_exception = FileNotFoundError
                    )
                } else {
                    frappe.call({
                        method: "wharf_management.wharf_management.doctype.cargo.cargo.update_breakbulk_inspection",
                        args: {
                            "name_ref": frm.doc.name,
                            "counter": counter,
                            "qty": frm.doc.qty
                        },
                        callback: function(r) {
                            //                            alert(counter)
                            d.hide();
                            refresh_field("item_count");
                            location.reload(true);
                        }
                    })
                }
            }
        });

        d.show();
    },

    get_gate_breakbulk_count: function(frm) {
        let d = new frappe.ui.Dialog({
            title: 'Security Break Bulk Count',
            fields: [{
                    label: 'Item Count',
                    fieldname: 'item_count',
                    fieldtype: 'Int',
                    reqd: 1
                },
                {
                    label: 'Cargo Condition',
                    fieldname: 'cargo_condition',
                    fieldtype: 'Select',
                    options: ['OK',
                        'Damage'
                    ],
                    reqd: 1
                },
                {
                    label: 'Cargo Condition Comment',
                    fieldname: 'cargo_condition_comment',
                    fieldtype: 'Small Text',
                    depends_on: 'eval:doc.cargo_condition == "Damage"'
                }

            ],
            primary_action_label: 'Submit',
            primary_action(values) {
                if (!values.item_count) {
                    frappe.throw(__("Item Count is required"));
                }
                console.log(values);
                let counter = values.item_count + frm.doc.security_item_count;
                console.log(counter)
                if (frm.doc.qty < counter) {
                    frappe.msgprint(
                        msg = 'Item Count is Greater than the QTY',
                        title = 'Error',
                        raise_exception = FileNotFoundError
                    )
                } else {
                    frappe.call({
                        method: "wharf_management.wharf_management.doctype.cargo.cargo.update_security_breakbulk",
                        args: {
                            "name_ref": frm.doc.name,
                            "counter": counter,
                            "qty": frm.doc.qty
                        },
                        callback: function(r) {
                            //                            alert(counter)
                            d.hide();
                            refresh_field("item_count");
                            location.reload(true);
                        }
                    })
                }
            }
        });

        d.show();
    },

    handling_fee_discount: function(frm) {

        if ((frm.doc.handling_fee_discount == "YES") && cargo_type_a.includes(frm.doc.cargo_type)) {
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
        }
        if ((frm.doc.handling_fee_discount == "YES") && cargo_type_b.includes(frm.doc.cargo_type)) {
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

        if ((frm.doc.handling_fee_discount == "NO") && cargo_type_a.includes(frm.doc.cargo_type)) {
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
                    console.log(data.message["fee_amount"])
                    cur_frm.set_value("handling_fee", data.message["fee_amount"]);
                }
            })
        }
        if ((frm.doc.handling_fee_discount == "NO") && (frm.doc.cargo_type == "Vehicles")) {
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
        }


        if ((frm.doc.handling_fee_discount == "NO") && cargo_type_b.includes(frm.doc.cargo_type)) {
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

        if (!frm.doc.handling_fee_discount || frm.doc.handling_fee_discount == "") {
            frm.set_value("handling_fee", 0.0);
        }

    },
    manifest_check: function(frm) {

        if (frm.doc.manifest_check == "Confirm") {
            if (frm.doc.work_type == "Loading") {
                //               alert("Hello")
                if (cargo_type_a.includes(frm.doc.cargo_type)) {
                    frappe.call({
                        "method": "frappe.client.get",
                        args: {
                            doctype: "Wharf Fees",
                            filters: {
                                wharf_fee_category: "Storage Fee",
                                cargo_type: frm.doc.cargo_type,
                                container_size: frm.doc.container_size,
                                container_content: frm.doc.container_content
                            }
                        },
                        callback: function(data) {
                            //                            console.log(data)
                            frm.set_value("free_days", data.message["grace_days"]);
                            frm.set_value("storage_rate", data.message["fee_amount"]);
                        }
                    })
                }
                if (cargo_type_b.includes(frm.doc.cargo_type)) {
                    frappe.call({
                        "method": "frappe.client.get",
                        args: {
                            doctype: "Wharf Fees",
                            filters: {
                                wharf_fee_category: "Storage Fee",
                                cargo_type: frm.doc.cargo_type,
                            }
                        },
                        callback: function(data) {
                            console.log(data)
                            frm.set_value("free_days", data.message["grace_days"]);
                            frm.set_value("storage_rate", data.message["fee_amount"]);
                        }
                    })
                }
                if (frm.doc.cargo_type == "Vehicles") {
                    frappe.call({
                        "method": "frappe.client.get",
                        args: {
                            doctype: "Wharf Fees",
                            filters: {
                                wharf_fee_category: "Storage Fee",
                                cargo_type: frm.doc.cargo_type,
                            }
                        },
                        callback: function(data) {
                            frm.set_value("free_days", data.message["grace_days"]);
                            frm.set_value("storage_rate", data.message["fee_amount"]);
                        }
                    });
                }

                frappe.call({
                    method: "wharf_management.wharf_management.doctype.wharf_payment_entry.wharf_payment_entry.get_storage_days",
                    args: {
                        "eta_date": frm.doc.gate1_date,
                        "posting_date": frm.doc.etd_date,
                    },
                    callback: function(r) {
                        frm.set_value("storage_days", r.message);

                        let sdays = flt(frm.doc.storage_days - frm.doc.free_days);

                        //                        alert(sdays)
                        if (sdays > 0) {

                            frm.set_value("charge_days", sdays);

                            if (cargo_type_a.includes(frm.doc.cargo_type)) {
                                frm.set_value("storage_fee", sdays * frm.doc.storage_rate);
                            }
                            if (cargo_type_b.includes(frm.doc.cargo_type)) {
                                if (frm.doc.net_weight > frm.doc.volume) {
                                    frm.set_value("storage_fee", sdays * frm.doc.net_weight * frm.doc.storage_rate);
                                }
                                if (frm.doc.net_weight < frm.doc.volume) {
                                    frm.set_value("storage_fee", sdays * frm.doc.volume * frm.doc.storage_rate);
                                }

                            }
                            if (frm.doc.cargo_type == "Vehicles") {
                                frm.set_value("storage_fee", sdays * frm.doc.storage_rate);
                            }

                            //                    frappe.model.set_value(d.doctype, d.name, "storage_fee", sdays * d.storage_fee_price);
                        }
                        if (sdays <= 0) {
                            console.log(sdays)
                            frm.set_value("charge_days", 0);
                            frm.set_value("storage_fee", 0 * frm.doc.storage_rate);
                        }
                    }
                })
            }
        }
        if (!frm.doc.manifest_check || frm.doc.manifest_check == "") {
            frm.set_value("free_days", 0);
            frm.set_value("storage_rate", 0);
            frm.set_value("storage_days", 0);
            frm.set_value("storage_fee", 0);
            frm.set_value("charge_days", 0);
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
    },
});