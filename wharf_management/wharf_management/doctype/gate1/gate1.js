// Copyright (c) 2017, Caitlah Technology and contributors
// For license information, please see license.txt

frappe.ui.form.on('Gate1', {
    refresh: function(frm) {

    },

    onload: function(frm) {

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
                cur_frm.set_value("customer", data.message["consignee"]);
                cur_frm.set_value("container_no", data.message["container_no"]);
                cur_frm.set_value("custom_warrant", data.message["custom_warrant"]);
                cur_frm.set_value("custom_code", data.message["custom_code"]);
                cur_frm.set_value("delivery_code", data.message["delivery_code"]);

                cur_frm.set_df_property("cargo_ref", "read_only", 1);
                cur_frm.set_df_property("container_no", "read_only", 1);
                cur_frm.set_df_property("customer", "read_only", 1);
                cur_frm.set_df_property("delivery_code", "read_only", 1);
                cur_frm.set_df_property("custom_code", "read_only", 1);
                cur_frm.set_df_property("custom_warrant", "read_only", 1);


            }
        })

        frappe.call({
            "method": "frappe.client.get",
            args: {
                doctype: "Cargo",
                name: frm.doc.cargo_ref,
                filters: {
                    'docstatus': 0
                },
            },
            callback: function(data) {
                cur_frm.set_value("customer", data.message["consignee"]);
                cur_frm.set_value("container_no", data.message["container_no"]);
                cur_frm.set_value("work_type", data.message["work_type"]);
                cur_frm.set_df_property("work_type", "read_only", 1);
                cur_frm.set_df_property("cargo_ref", "read_only", 1);
                cur_frm.set_df_property("delivery_code", "read_only", 1);
                cur_frm.set_df_property("custom_code", "read_only", 1);
                //                cur_frm.set_df_property("custom_warrant", "read_only", 1);
                //                cur_frm.set_df_property("warrant_no", "read_only", 1);
                //cur_frm.set_df_property("custom_code_section", "hidden", 1);

            }
        })

    }
});