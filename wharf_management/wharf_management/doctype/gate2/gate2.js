// Copyright (c) 2017, Caitlah Technology and contributors
// For license information, please see license.txt

frappe.ui.form.on('Gate2', {


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

        if (frm.doc.docstatus != 1) {

            if (frm.doc.mydoctype == "CARGO") {
                frappe.call({
                    "method": "frappe.client.get",
                    args: {
                        doctype: "Cargo",
                        name: frm.doc.cargo_ref,
                        filters: {
                            'docstatus': 1,
                            'gate2_status': "Open"
                        },
                    },
                    callback: function(data) {
                        cur_frm.set_value("customer", data.message["consignee"]);
                        cur_frm.set_value("container_no", data.message["container_no"]);
                        cur_frm.set_value("custom_warrant", data.message["custom_warrant"]);
                        cur_frm.set_value("custom_code", data.message["custom_code"]);
                        cur_frm.set_value("delivery_code", data.message["delivery_code"]);
                        cur_frm.set_value("chasis_no", data.message["chasis_no"]);
                        cur_frm.set_value("cargo_type", data.message["cargo_type"]);
                        cur_frm.set_value("cargo_description", data.message["cargo_description"]);
                        cur_frm.set_value("status", data.message["status"]);
                        cur_frm.set_value("container_content", data.message["container_content"]);
                        cur_frm.set_value("container_size", data.message["container_size"]);
                        cur_frm.set_value("consignee", data.message["consignee"]);

                        if (frm.doc.work_type != "Loading") {
                            frappe.call({
                                "method": "frappe.client.get",
                                args: {
                                    doctype: "Gate1",
                                    cargo_ref: frm.doc.cargo_ref,
                                    filters: {
                                        'docstatus': 1
                                    },
                                },
                                callback: function(data) {
                                    cur_frm.set_value("truck_licenses_plate", data.message["truck_licenses_plate"]);
                                    cur_frm.set_value("company", data.message["company"]);
                                    cur_frm.set_value("drivers_information", data.message["drivers_information"]);
                                    cur_frm.set_df_property("drivers_information", "read_only", 1);
                                    cur_frm.set_df_property("company", "read_only", 1);
                                    cur_frm.set_df_property("truck_licenses_plate", "read_only", 1);
                                }
                            })
                        }

                        cur_frm.set_df_property("container_no", "read_only", 1);
                        cur_frm.set_df_property("customer", "read_only", 1);
                        cur_frm.set_df_property("delivery_code", "read_only", 1);
                        cur_frm.set_df_property("custom_code", "read_only", 1);
                        cur_frm.set_df_property("custom_warrant", "read_only", 1);
                        cur_frm.set_df_property("chasis_no", "read_only", 1);
                        cur_frm.set_df_property("cargo_type", "read_only", 1);
                        cur_frm.set_df_property("cargo_description", "read_only", 1);
                        cur_frm.set_df_property("container_content", "read_only", 1);
                        cur_frm.set_df_property("container_size", "read_only", 1);
                        cur_frm.set_df_property("consignee", "read_only", 1);


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


                        frappe.call({
                            "method": "frappe.client.get",
                            args: {
                                doctype: "Gate1",
                                cargo_ref: frm.doc.cargo_ref,
                                filters: {
                                    'docstatus': 1
                                },
                            },
                            callback: function(data) {
                                cur_frm.set_value("truck_licenses_plate", data.message["truck_licenses_plate"]);
                                cur_frm.set_value("company", data.message["company"]);
                                cur_frm.set_value("drivers_information", data.message["drivers_information"]);
                                cur_frm.set_df_property("drivers_information", "read_only", 1);
                                cur_frm.set_df_property("company", "read_only", 1);
                                cur_frm.set_df_property("truck_licenses_plate", "read_only", 1);
                            }
                        })

                        cur_frm.set_df_property("mydoctype", "read_only", 1);
                        cur_frm.set_df_property("cargo_ref", "read_only", 1);
                        cur_frm.set_df_property("delivery_code", "read_only", 1);
                        cur_frm.set_df_property("custom_code", "read_only", 1);
                        cur_frm.set_df_property("custom_warrant", "read_only", 1);
                        cur_frm.set_df_property("warrant_no", "read_only", 1);
                        cur_frm.set_df_property("custom_code_section", "hidden", 1);
                        cur_frm.set_df_property("bulk_payment", "hidden", 1);
                        cur_frm.set_df_property("status", "hidden", 1);
                        cur_frm.set_df_property("work_type", "hidden", 1);
                        cur_frm.set_df_property("chasis_no", "hidden", 1);
                        cur_frm.set_df_property("qty", "hidden", 1);

                    }

                })
            }
        }
    },


    different_truck: function(frm) {
        if (frm.doc.different_truck == 1) {
            cur_frm.set_df_property("drivers_information", "read_only", 0);
            cur_frm.set_df_property("company", "read_only", 0);
            cur_frm.set_df_property("truck_licenses_plate", "read_only", 0);

        } else {
            cur_frm.set_df_property("drivers_information", "read_only", 1);
            cur_frm.set_df_property("company", "read_only", 1);
            cur_frm.set_df_property("truck_licenses_plate", "read_only", 1);

        }
    }
});