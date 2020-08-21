// Copyright (c) 2017, Sione Taumoepeau and contributors
// For license information, please see license.txt

frappe.ui.form.on('Custom Inspection', {

    refresh: function(frm) {
        if (frm.doc.status == "Deliver") {
            frappe.set_route("List", "Cargo", "List");
            location.reload(true);

        }
    },
    on_submit: function(frm) {

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
                cur_frm.set_value("cargo_type", data.message["cargo_type"]);
                cur_frm.set_value("cargo_description", data.message["cargo_description"]);
                cur_frm.set_value("yard_slot", data.message["yard_slot"]);
                cur_frm.set_value("container_size", data.message["container_size"]);
                cur_frm.set_value("container_type", data.message["container_type"]);

                cur_frm.set_df_property("cargo_ref", "read_only", 1);
                cur_frm.set_df_property("yard_slot", "read_only", 1);
                cur_frm.set_df_property("container_no", "read_only", 1);
                cur_frm.set_df_property("customer", "read_only", 1);
                cur_frm.set_df_property("cargo_type", "read_only", 1);
                cur_frm.set_df_property("cargo_description", "read_only", 1);
                cur_frm.set_df_property("container_size", "read_only", 1);
                cur_frm.set_df_property("container_type", "read_only", 1);

            }
        })

    }
});