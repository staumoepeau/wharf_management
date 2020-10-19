// Copyright (c) 2020, Sione Taumoepeau and contributors
// For license information, please see license.txt

frappe.ui.form.on('Export Booking', {
    onload: function(frm) {

        if (frm.doc.docstatus == 0) {
            if (!frm.doc.posting_date) {
                frm.set_value('booking_date', frappe.datetime.nowdate());
            }
            if (!frm.doc.posting_time) {
                frm.set_value('booking_time', frappe.datetime.now_time());
            }
        }

    }
});