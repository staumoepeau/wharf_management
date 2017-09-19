// Copyright (c) 2017, Sione Taumoepeau and contributors
// For license information, please see license.txt

frappe.ui.form.on('ETA Changes', {

	onload: function(frm){

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
                cur_frm.set_value("current_eta", data.message["eta_date"]);
                cur_frm.set_value("current_etd", data.message["etd_date"]);

                cur_frm.set_df_property("booking_ref", "hidden", 1);
                cur_frm.set_df_property("current_eta", "read_only", 1);
                cur_frm.set_df_property("current_etd", "read_only", 1);


            }
        })

	},

	refresh: function(frm) {

	}
});
