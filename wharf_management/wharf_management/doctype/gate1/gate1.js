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

                        cur_frm.set_df_property("mydoctype", "read_only", 1);
                        cur_frm.set_df_property("cargo_ref", "read_only", 1);
                        cur_frm.set_df_property("container_no", "read_only", 1);
                        cur_frm.set_df_property("customer", "read_only", 1);
                        cur_frm.set_df_property("delivery_code", "read_only", 1);
                        cur_frm.set_df_property("custom_code", "read_only", 1);
                        cur_frm.set_df_property("custom_warrant", "read_only", 1);

                        cur_frm.set_df_property("cargo_type", "read_only", 1);
                        cur_frm.set_df_property("cargo_description", "read_only", 1);
                        cur_frm.set_df_property("chasis_no", "read_only", 1);
                        cur_frm.set_df_property("container_content", "read_only", 1);

                        cur_frm.set_df_property("status", "hidden", 1);
                        cur_frm.set_df_property("work_type", "hidden", 1);

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
                        //                        cur_frm.set_value("pat_code", data.message["pat_code"]);

                        cur_frm.set_df_property("mydoctype", "read_only", 1);
                        cur_frm.set_df_property("cargo_ref", "read_only", 1);
                        cur_frm.set_df_property("delivery_code", "read_only", 1);
                        cur_frm.set_df_property("custom_code", "read_only", 1);
                        cur_frm.set_df_property("custom_warrant", "read_only", 1);
                        cur_frm.set_df_property("warrant_no", "read_only", 1);
                        cur_frm.set_df_property("custom_code_section", "hidden", 1);
                        cur_frm.set_df_property("status", "hidden", 1);
                        cur_frm.set_df_property("work_type", "hidden", 1);
                        cur_frm.set_df_property("chasis_no", "hidden", 1);
                        cur_frm.set_df_property("container_no", "read_only", 1);
                        cur_frm.set_df_property("customer", "read_only", 1);
                        cur_frm.set_df_property("delivery_code", "read_only", 1);
                        cur_frm.set_df_property("custom_code", "read_only", 1);
                        cur_frm.set_df_property("custom_warrant", "read_only", 1);
                        cur_frm.set_df_property("cargo_type", "read_only", 1);
                        cur_frm.set_df_property("cargo_description", "read_only", 1);
                        cur_frm.set_df_property("chasis_no", "read_only", 1);
                        cur_frm.set_df_property("container_content", "read_only", 1);
                        cur_frm.set_df_property("qty", "hidden", 1);

                    }

                })
            }
        }
    },
});