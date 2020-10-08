// Copyright (c) 2017, Caitlah Technology and contributors
// For license information, please see license.txt

frappe.ui.form.on('Gate1', {

    refresh: function(frm) {
        //        frm.add_fetch('truck_licenses_plate', 'company', 'company');

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
    },

    on_submit: function(frm) {
        if (frm.doc.mydoctype == "CARGO") {
            frappe.set_route("List", "Cargo")
            location.reload(true);
        }
        if (frm.doc.mydoctype == "EMPTY CONTAINERS") {
            frappe.set_route("List", "Empty Containers")
            location.reload(true);
        }
    },

    onload: function(frm) {


        let is_allowed = frappe.user_roles.includes('System Manager', 'Cargo Operation Manager');
        frm.toggle_enable(['mydoctype', 'cargo_ref', 'container_no', 'customer', 'delivery_code', 'custom_code', 'custom_warrant',
            'cargo_type', 'cargo_description', 'chasis_no', 'container_content', 'status', 'work_type',
        ], is_allowed);


        frm.toggle_display(['cargo_ref', 'in_reference', 'work_type', 'mydoctype'], frappe.user_roles.includes('System Manager', 'Cargo Operation Manager', 'Operation Manifest User'));

        if (frm.doc.docstatus != 1) {

            if (!frm.doc.truck_licenses_plate) {
                frm.set_value("company", " ");
            }

            if (frm.doc.mydoctype == "CARGO") {
                frappe.call({
                    "method": "frappe.client.get",
                    args: {
                        doctype: "Cargo",
                        name: frm.doc.cargo_ref,
                        filters: {
                            'docstatus': 1,
                            'gate1_status': "Open"
                        },
                    },
                    callback: function(data) {

                        if (data.message["cargo_type"] == "Split Ports" && data.message["last_port"] == "NO" && data.message["status"] != "Paid") {
                            frm.set_value("cargo_type", data.message["cargo_type"]);
                            frm.set_value("warrant_no", data.message["custom_warrant"]);
                            frm.set_value("delivery_code", data.message["delivery_code"]);
                            frm.set_value("custom_code", data.message["custom_code"]);

                            frappe.call({
                                "method": "frappe.client.get",
                                args: {
                                    doctype: "Gate2",
                                    cargo_ref: frm.doc.cargo_ref,
                                    filters: {
                                        'docstatus': 1
                                    },
                                },
                                callback: function(data) {
                                    frm.set_value("truck_licenses_plate", data.message["truck_licenses_plate"]);
                                    frm.set_value("company", data.message["company"]);
                                    frm.set_value("drivers_information", data.message["drivers_information"]);
                                    frm.set_value("in_reference", data.message["name"]);
                                }
                            });
                        }

                        if ((frm.doc.cargo_type == "Loose Cargo") || (frm.doc.cargo_type == "Break Bulk")) {
                            cur_frm.set_df_property("qty", "hidden", 0);
                        } else {
                            cur_frm.set_df_property("qty", "hidden", 1);
                        }
                    }
                })
            }

            if (frm.doc.mydoctype == "EMPTY CONTAINERS") {
                frappe.call({
                    "method": "frappe.client.get",
                    args: {
                        doctype: "Empty Containers",
                        name: frm.doc.cargo_ref,
                        filters: {
                            'docstatus': 1
                        },
                    },
                    callback: function(data) {
                        cur_frm.set_value("customer", data.message["consignee"]);
                        cur_frm.set_value("container_no", data.message["container_no"]);
                        //                        cur_frm.set_value("agents", data.message["agents"]);
                        cur_frm.set_value("cargo_type", data.message["cargo_type"]);
                        cur_frm.set_value("container_content", data.message["container_content"]);

                        cur_frm.set_df_property("qty", "hidden", 1);

                    }

                })
            }
        }
    },
});