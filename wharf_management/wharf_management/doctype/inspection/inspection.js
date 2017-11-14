// Copyright (c) 2017, Caitlah Technology and contributors
// For license information, please see license.txt

frappe.ui.form.on('Inspection', {
    refresh: function(frm) {

    },
    onload: function(frm) {

        frappe.call({
            "method": "frappe.client.get",
            args: {
                doctype: "Cargo",
                name: frm.doc.cargo_ref,
                filters: {
                    'docstatus': 1
                },
            },
            callback: function(data) {
                console.log(data);
                cur_frm.set_value("cargo_ref", data.message["name"]);
                cur_frm.set_value("container_no", data.message["container_no"]);
                cur_frm.set_value("voyage_no", data.message["voyage_no"]);
                cur_frm.set_value("vessel", data.message["vessel"]);
                cur_frm.set_value("bol", data.message["bol"]);
                cur_frm.set_value("work_type", data.message["work_type"]);
                cur_frm.set_value("chasis_no", data.message["chasis_no"]);
                cur_frm.set_value("qty", data.message["qty"]);
                cur_frm.set_value("final_work_type", data.message["work_type"]);
                cur_frm.set_df_property("voyage_no", "read_only", 1);
                cur_frm.set_df_property("work_type", "read_only", 1);
                cur_frm.set_df_property("final_work_type", "read_only", 1);
                cur_frm.set_df_property("cargo_ref", "read_only", 1);
                cur_frm.set_df_property("vessel", "read_only", 1);
                cur_frm.set_df_property("vessel_arrival_date", "read_only", 1);
                cur_frm.set_df_property("bol", "read_only", 1);
                cur_frm.set_df_property("container_no", "read_only", 1);
                cur_frm.set_df_property("chasis_no", "read_only", 1);


            }
        })

    }

});