// Copyright (c) 2018, Sione Taumoepeau and contributors
// For license information, please see license.txt

frappe.ui.form.on('Pilot Log', {
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
                frappe.call({
                    "method": "frappe.client.get",
                    args: {
                        doctype: "Vessels",
                        filters: { 'name': data.message["vessel"] }
                    },
                    callback: function(d) {
                        console.log(d);
                        cur_frm.set_value("gross_tonnage", d.message["vessel_gross_tonnage"])
                    }
                })
                cur_frm.set_value("voyage_no", data.message["voyage_no"]);
                cur_frm.set_value("eta", data.message["eta_date"]);
                cur_frm.set_value("etd", data.message["etd_date"]);
                //cur_frm.set_value("cargo_ref", "read_only", 1);
            }
        })
        
    },

    change_grt: function(frm){
        if (frm.doc.change_grt == 1){
            cur_frm.set_df_property("gross_tonnage", "read_only", 0);
        } else{
            cur_frm.set_df_property("gross_tonnage", "read_only", 1);
        }
    },
});