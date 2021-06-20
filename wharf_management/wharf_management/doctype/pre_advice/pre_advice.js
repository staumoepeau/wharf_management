// Copyright (c) 2017, Sione Taumoepeau and contributors
// For license information, please see license.txt

frappe.ui.form.on('Pre Advice', {

    on_submit: function(frm) {
        frappe.msgprint({
            title: __('Notification'),
            indicator: 'green',
            message: __('Document updated successfully')
        });
        frappe.set_route("List", "Pre Advice");
        location.reload(true);


    },

    onload: function(frm) {

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


        if (frm.doc.cargo_type == "Split Ports") {
            cur_frm.set_df_property("last_port", "hidden", 0);

        } else if (frm.doc.cargo_type != "Split Ports") {
            cur_frm.set_df_property("last_port", "hidden", 1);
        }
        // Toggle Fields to Read-Only
        let is_allowed = (frappe.user_roles.includes("System Manager") || frappe.user_roles.includes("Cargo Operation Manager"));

        frm.toggle_enable(['container_content', 'secondary_work_type', 'mark', 'cargo_type', 'final_work_type', 'cargo_ref', 'container_size', 'container_type', 'pat_code',
            'vessel', 'vessel_arrival_date', 'bol', 'container_no', 'chasis_no', 'third_work_type', 'last_port', 'voyage_no', 'work_type', 'seal1', 'work_information'
        ], is_allowed);
        // Hide Fields
        frm.toggle_display(['consignee_details', 'hazardous_goods', 'import_status', 'break_bulk_items', 'net_weight', 'volume', 'seal_2', 'commodity_code', 'yard_slot',
            'booking_ref', 'eta_date', 'etd_date', 'status_section', 'ports_details', 'temperature'
        ], is_allowed)

        frm.toggle_display(['qty', 'break_bulk_items'], frm.doc.cargo_type == "Break Bulk" || is_allowed)


    },


    cargo_type: function(frm) {
        if (frm.doc.cargo_type == "Split Ports") {
            cur_frm.set_df_property("last_port", "hidden", 0);

        } else if (frm.doc.cargo_type != "Split Ports") {
            cur_frm.set_df_property("last_port", "hidden", 1);
        }

    },

    refresh: function(frm) {



        if (frappe.user_roles.includes('Yard Inspection User', 'Yard Operation User')) {

            frm.page.sidebar.hide(); // this removes the sidebar
            $(".timeline").hide()
            frm.page.wrapper.find(".layout-main-section-wrapper").removeClass("col-md-10"); // this removes class "col-md-10" from content block, which sets width to 83%
        }
        if (frappe.user.has_role('System Manager', 'Yard Operation Supervisor')) {
            frm.page.sidebar.show(); // this removes the sidebar
            $(".timeline").show()
            frm.page.wrapper.find(".layout-main-section-wrapper").addClass("col-md-10");
        }


        //        if ((frappe.user.has_role("System Manager") || frappe.user.has_role("Yard Inspection User") || frappe.user.has_role("Yard Inspection Supervisor")) &&
        //            frm.doc.work_type == "Discharged" &&
        //            frm.doc.secondary_work_type == "Devanning" &&
        //            frm.doc.docstatus == 1
        //        ) {

        //            frm.add_custom_button(__('Vehicles'), function() {
        //                frappe.call({
        //                    method: "devanning_create_vehicles",
        //                    doc: frm.doc,
        //                    callback: function(d) {
        //                        console.log(d)
        //                        cur_frm.refresh();
        //                    }
        //                })

        //            }, __("Devanning"));
        //            cur_frm.page.set_inner_btn_group_as_primary(__("Devanning"));

        //            frm.add_custom_button(__('Break Bulk'), function() {
        //                frappe.call({
        //                    method: "devanning_create_bbulk",
        //                    doc: frm.doc,
        //                    callback: function(d) {
        //                        console.log(d)
        //                        cur_frm.refresh();
        //                    }
        //                })
        //            }, __("Devanning"));
        //            cur_frm.page.set_inner_btn_group_as_primary(__("Devanning"));
        //        }

        if ((frappe.user.has_role("System Manager") || frappe.user.has_role("Yard Inspection User") || frappe.user.has_role("Yard Inspection Supervisor")) &&
            frm.doc.gate2_status != "Closed" &&
            frm.doc.gate1_status != "Closed" &&
            frm.doc.payment_status != "Closed" &&
            frm.doc.yard_status != "Closed" &&
            frm.doc.inspection_status != "Closed" &&
            frm.doc.docstatus == 1
        ) {
            frm.add_custom_button(__('Inspection'), function() {

                if ((frm.doc.work_type === "Loanding") && (frm.doc.container_content === "FULL")) {
                    frappe.call({
                        "method": "check_export_container",
                        "doc": frm.doc,
                        callback: function(r) {
                            if (r.message > 1) {
                                frappe.call({
                                    "method": "frappe.client.get",
                                    "args": {
                                        "doctype": "Export",
                                        "filters": {
                                            "container_no": frm.doc.container_no,
                                        }
                                    },
                                    callback: function(data) {

                                        if ((data.message["container_content"] == "FULL") && (data.message["paid_status"] == "Paid")) {

                                            frappe.route_options = {
                                                "cargo_ref": frm.doc.name,
                                                "container_no": frm.doc.container_no,
                                                "container_content": frm.doc.container_content,
                                                "voyage_no": frm.doc.voyage_no,
                                                "vessel": frm.doc.vessel,
                                                "bol": frm.doc.bol,
                                                "work_type": frm.doc.work_type,
                                                "secondary_work_type": frm.doc.secondary_work_type,
                                                "last_port": frm.doc.last_port,
                                                "chasis_no": frm.doc.chasis_no,
                                                "qty": frm.doc.qty,
                                                "final_work_type": frm.doc.work_type,
                                                "third_work_type": frm.doc.third_work_type,
                                                "cargo_type": frm.doc.cargo_type,
                                                "mark": frm.doc.mark,
                                                "work_information": frm.doc.work_information
                                            };
                                            frappe.set_route("Form", "Inspection", "new-inspection-1");
                                        }
                                        if ((data.message["container_content"] == "FULL") && (data.message["paid_status"] == "Unpaid")) {
                                            frappe.throw("Please check this Container for UNPAID Fees.")

                                        }
                                    }
                                })
                            } else {

                                frappe.route_options = {
                                    "cargo_ref": frm.doc.name,
                                    "container_no": frm.doc.container_no,
                                    "container_content": frm.doc.container_content,
                                    "voyage_no": frm.doc.voyage_no,
                                    "vessel": frm.doc.vessel,
                                    "bol": frm.doc.bol,
                                    "work_type": frm.doc.work_type,
                                    "secondary_work_type": frm.doc.secondary_work_type,
                                    "last_port": frm.doc.last_port,
                                    "chasis_no": frm.doc.chasis_no,
                                    "qty": frm.doc.qty,
                                    "final_work_type": frm.doc.work_type,
                                    "third_work_type": frm.doc.third_work_type,
                                    "cargo_type": frm.doc.cargo_type,
                                    "mark": frm.doc.mark,
                                    "work_information": frm.doc.work_information
                                };
                                frappe.set_route("Form", "Inspection", "new-inspection-1");
                            }
                        }
                    })
                }
                //                if (frm.doc.work_type === "Discharged") {
                frappe.route_options = {
                    "booking_ref": frm.doc.booking_ref,
                    "cargo_ref": frm.doc.name,
                    "container_no": frm.doc.container_no,
                    "container_content": frm.doc.container_content,
                    "voyage_no": frm.doc.voyage_no,
                    "vessel": frm.doc.vessel,
                    "bol": frm.doc.bol,
                    "work_type": frm.doc.work_type,
                    "secondary_work_type": frm.doc.secondary_work_type,
                    "last_port": frm.doc.last_port,
                    "chasis_no": frm.doc.chasis_no,
                    "qty": frm.doc.qty,
                    "final_work_type": frm.doc.work_type,
                    "third_work_type": frm.doc.third_work_type,
                    "cargo_type": frm.doc.cargo_type,
                    "mark": frm.doc.mark,
                    "work_information": frm.doc.work_information
                };
                frappe.set_route("Form", "Inspection", "new-inspection-1");
                //                }

            }).addClass("btn-primary");
        }

        //        if ((frappe.user.has_role("System Manager") || frappe.user.has_role("Yard Operation User") &&
        //                frm.doc.yard_status != "Closed" &&
        //                frm.doc.inspection_status == "Closed" &&
        //                frm.doc.qty == frm.doc.break_bulk_item_count
        //            )) {
        //            frm.add_custom_button(__('Yard'), function() {

        //                frm.events.get_yard_slot(frm)

        //            }).addClass("btn-primary");
        //        }

        //        if ((frappe.user.has_role("Administrator") || frappe.user.has_role("Yard Inspection User") || frappe.user.has_role("Yard Inspection Supervisor")) &&
        //            frm.doc.inspection_status == "Closed" &&
        //            frm.doc.qty > 1 &&
        //            frm.doc.break_bulk_item_count != frm.doc.qty
        //        ) {
        //            frm.add_custom_button(__('Bulk Item Count'), function() {

        //                frm.events.get_breakbulk_count(frm)

        //            }).addClass("btn-warning");
        //        }
    },

    get_breakbulk_count: function(frm) {
        let d = new frappe.ui.Dialog({
            title: 'Enter details',
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
                    options: ['NO',
                        'YES'
                    ],
                    reqd: 1
                },
                {
                    label: 'Cargo Condition Comment',
                    fieldname: 'cargo_condition_comment',
                    fieldtype: 'Small Text',
                    depends_on: 'eval:doc.cargo_condition == "YES"'
                }
            ],
            primary_action_label: 'Submit',
            primary_action(values) {
                if (!values.item_count) {
                    frappe.throw(__("Item Count is required"));
                }
                console.log(values);
                let counter = values.item_count + frm.doc.break_bulk_item_count;

                if (frm.doc.qty < counter) {
                    frappe.msgprint(
                        msg = 'Item Count is Greater than the QTY',
                        title = 'Error',
                        raise_exception = FileNotFoundError
                    )
                } else {
                    frappe.call({
                        method: "wharf_management.wharf_management.doctype.pre_advice.pre_advice.update_breakbulk_inspection",
                        args: {
                            "name_ref": frm.doc.name,
                            "counter": counter,
                            "qty": frm.doc.qty
                        },
                        callback: function(r) {
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

    get_yard_slot: function(frm) {
        let d = new frappe.ui.Dialog({
            title: 'Enter details',
            fields: [{
                    label: 'Yard Slot',
                    fieldname: 'yard_slot',
                    fieldtype: 'Link',
                    options: 'Yard Settings',
                    reqd: 1,
                    get_query: function(doc) {
                        return { filters: { occupy: 0 } };
                    }
                },
                {
                    label: 'Cargo Condition',
                    fieldname: 'cargo_condition',
                    fieldtype: 'Select',
                    options: ['NO',
                        'YES'
                    ],
                    reqd: 1
                }
            ],
            primary_action_label: 'Submit',
            primary_action(values) {
                if (!values.item_count) {
                    frappe.throw(__("Item Count is required"));
                }
                console.log(values);
                let counter = values.item_count + frm.doc.break_bulk_item_count;

                if (frm.doc.qty < counter) {
                    frappe.msgprint(
                        msg = 'Item Count is Greater than the QTY',
                        title = 'Error',
                        raise_exception = FileNotFoundError
                    )
                } else {
                    frappe.call({
                        method: "wharf_management.wharf_management.doctype.pre_advice.pre_advice.update_yard",
                        args: {
                            "name_ref": frm.doc.name,
                            "counter": counter,
                            "qty": frm.doc.qty
                        },
                        callback: function(r) {
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

});