// Copyright (c) 2017, Sione Taumoepeau and contributors
// For license information, please see license.txt

frappe.ui.form.on('ETA Changes', {

    onload: function(frm) {

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


                cur_frm.set_value("current_eta_pilot_date",data.message["eta_pilot_date"])
                cur_frm.set_value("current_mooring_date",data.message["mooring_date"])
                cur_frm.set_value("current_unmooring_date",data.message["unmooring_date"])
                cur_frm.set_value("current_lines_boat_date",data.message["lines_boat_date"])
                cur_frm.set_value("current_tugboat_standby_date",data.message["tugboat_standby_date"])
                cur_frm.set_value("current_ship_clearance_date",data.message["ship_clearance_date"])
                cur_frm.set_value("current_cargo_ops_start_date",data.message["cargo_ops_start_date"])
                cur_frm.set_value("current_cargo_ops_completed_date",data.message["cargo_ops_completed_date"])


                cur_frm.set_value("voyage_no", data.message["voyage_no"]);
                cur_frm.set_value("agent", data.message["agents"]);

                cur_frm.set_df_property("booking_ref", "read_only", 1);
                cur_frm.set_df_property("current_eta", "read_only", 1);
                cur_frm.set_df_property("current_etd", "read_only", 1);
                cur_frm.set_df_property("voyage_no", "read_only", 1);
                cur_frm.set_df_property("agent", "read_only", 1);



                cur_frm.set_df_property("current_eta_pilot_date","read_only", 1);
                cur_frm.set_df_property("current_mooring_date","read_only", 1);
                cur_frm.set_df_property("current_unmooring_date","read_only", 1);
                cur_frm.set_df_property("current_lines_boat_date","read_only", 1);
                cur_frm.set_df_property("current_tugboat_standby_date","read_only", 1);
                cur_frm.set_df_property("current_ship_clearance_date","read_only", 1);
                cur_frm.set_df_property("current_cargo_ops_start_date","read_only", 1);
                cur_frm.set_df_property("current_cargo_ops_completed_date","read_only", 1);



            }
        })

    },

    refresh: function(frm) {

    }
});