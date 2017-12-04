// Copyright (c) 2017, Sione Taumoepeau and contributors
// For license information, please see license.txt

frappe.ui.form.on('Pilot', {
    refresh: function(frm) {

    },

    booking_ref: function(frm) {
        frappe.call({
            "method": "frappe.client.get",
            args: {
                doctype: "Booking Request",
                name: frm.doc.booking_ref,
                filters: {
                    'docstatus': 1
                },
            },
            callback: function(data) {
                cur_frm.set_value("vessel", data.message["vessel"]);
                cur_frm.set_value("voyage_no", data.message["voyage_no"]);
                cur_frm.set_value("eta", data.message["eta_date"]);
                cur_frm.set_value("etd", data.message["etd_date"]);
                //                cur_frm.set_df_property("cargo_ref", "read_only", 1);
            }
        })
    }
});