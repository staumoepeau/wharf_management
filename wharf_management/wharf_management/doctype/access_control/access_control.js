// Copyright (c) 2020, Sione Taumoepeau and contributors
// For license information, please see license.txt

frappe.ui.form.on('Access Control', {
    setup: function(frm) {
        if (!frm.doc.time) {
            frm.set_value("check_in_out_time", frappe.datetime.now_datetime());
        }
    },
    refresh: function(frm) {

        if (frm.doc.docstatus == 0) {
            if (!frm.doc.time) {
                frm.set_value('check_in_out_time', frappe.datetime.now_datetime());
            }
            //            set_posting_date_time(frm)
        }

    }
});