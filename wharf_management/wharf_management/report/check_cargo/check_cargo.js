// Copyright (c) 2016, Sione Taumoepeau and contributors
// For license information, please see license.txt
/* eslint-disable */

frappe.query_reports["Check Cargo"] = {
    filters: [{
        fieldname: "cargo_ref",
        label: __("Cargo"),
        fieldtype: "Link",
        options: "Cargo",
        reqd: 1,
        filters: { "status": "yard" }
    }, ],

    onload: function() {
        var me = this;
        this.page.remove_inner_button('Menu', 'Edit')

        //       $(`.btn:contains("Menu"):visible`).hide();
        //        $(page.remove_inner_button('Set Chart'))
        //        frm.remove_custom_button("Installation Note", 'Make');
    }
};