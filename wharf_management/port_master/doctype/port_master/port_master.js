// Copyright (c) 2020, Sione Taumoepeau and contributors
// For license information, please see license.txt

frappe.ui.form.on('Port Master', {
    refresh: function(frm) {

    },
    onload: function(frm) {
        frappe.call({
            "method": "frappe.client.get",
            args: {
                doctype: "Booking Request",
                filters: {
                    'name': frm.doc.booking_ref,
                    'docstatus': 1,

                },
            },
            callback: function(data) {
                cur_frm.set_value("current_eta", data.message["eta_date"]);
                cur_frm.set_value("current_etd", data.message["etd_date"]);
                cur_frm.set_value("voyage_no", data.message["voyage_no"]);

                cur_frm.set_df_property("current_eta", "read_only", 1);
                cur_frm.set_df_property("current_etd", "read_only", 1);

            }
        })
    }
});