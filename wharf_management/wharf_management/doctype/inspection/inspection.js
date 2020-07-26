// Copyright (c) 2017, Caitlah Technology and contributors
// For license information, please see license.txt

frappe.ui.form.on('Inspection', {
    refresh: function(frm) {

    },

    on_submit: function(frm) {
        frappe.set_route("List", "Pre Advice", "List");
        location.reload(true);
    },

    onload: function(frm) {

        if (frappe.user.has_role("Cargo Operation Manager") || (frappe.user.has_role("System Manager"))) {
            cur_frm.set_df_property("container_content", "read_only", 0);
            cur_frm.set_df_property("secondary_work_type", "read_only", 0);
            cur_frm.set_df_property("mark", "read_only", 0);
            cur_frm.set_df_property("cargo_type", "read_only", 0);
            cur_frm.set_df_property("voyage_no", "read_only", 0);
            cur_frm.set_df_property("work_type", "read_only", 0);
            cur_frm.set_df_property("final_work_type", "read_only", 0);
            cur_frm.set_df_property("cargo_ref", "read_only", 0);
            cur_frm.set_df_property("vessel", "read_only", 0);
            cur_frm.set_df_property("vessel_arrival_date", "read_only", 0);
            cur_frm.set_df_property("bol", "read_only", 0);
            cur_frm.set_df_property("container_no", "read_only", 0);
            cur_frm.set_df_property("chasis_no", "read_only", 0);
            cur_frm.set_df_property("third_work_type", "read_only", 0);
            cur_frm.set_df_property("last_port", "read_only", 0);
        } else {
            cur_frm.set_df_property("container_content", "read_only", 1);
            cur_frm.set_df_property("secondary_work_type", "read_only", 1);
            cur_frm.set_df_property("mark", "read_only", 1);
            cur_frm.set_df_property("cargo_type", "read_only", 1);
            cur_frm.set_df_property("voyage_no", "read_only", 1);
            cur_frm.set_df_property("work_type", "read_only", 1);
            cur_frm.set_df_property("final_work_type", "read_only", 1);
            cur_frm.set_df_property("cargo_ref", "read_only", 1);
            cur_frm.set_df_property("vessel", "read_only", 1);
            cur_frm.set_df_property("vessel_arrival_date", "read_only", 1);
            cur_frm.set_df_property("bol", "read_only", 1);
            cur_frm.set_df_property("container_no", "read_only", 1);
            cur_frm.set_df_property("chasis_no", "read_only", 1);
            cur_frm.set_df_property("third_work_type", "read_only", 1);
            cur_frm.set_df_property("last_port", "read_only", 1);

            cur_frm.set_df_property("volume", "hidden", 1);
            cur_frm.set_df_property("seal_1", "hidden", 1);
            cur_frm.set_df_property("net_weight", "hidden", 1);
        }
        if (frm.doc.work_type == "Loading") {
            cur_frm.set_df_property("inspection_images", "hidden", 1);
            cur_frm.set_df_property("cargo_condition", "hidden", 1);
        } else {
            cur_frm.set_df_property("inspection_images", "hidden", 0);
            cur_frm.set_df_property("cargo_condition", "hidden", 0);
        }

        //       if (!frm.doc.container_no) {
        //          frm.set_df_property("container_no", "hidden", 1);
        //   }
    }
});