// Copyright (c) 2017, Caitlah Technology and contributors
// For license information, please see license.txt

frappe.ui.form.on('Yard', {

    on_submit: function(frm) {
        frappe.set_route("List", "Pre Advice")
        location.reload(true);
    },

    refresh: function(frm) {

    },

    onload: function(frm) {

        frm.set_df_property("cargo_ref", "read_only", 1);
        frm.set_df_property("container_no", "read_only", 1);
        frm.set_df_property("voyage_no", "read_only", 1);
        frm.set_df_property("vessel", "read_only", 1);
        frm.set_df_property("eta_date", "read_only", 1);
        frm.set_df_property("bol", "read_only", 1);
        frm.set_df_property("consignee", "read_only", 1);
        frm.set_df_property("cargo_type", "read_only", 1);
        frm.set_df_property("chasis_no", "read_only", 1)

    }

});