// Copyright (c) 2017, Sione Taumoepeau and contributors
// For license information, please see license.txt

frappe.ui.form.on('Pre Advice', {
    refresh: function(frm) {
        cur_frm.add_fetch('container_type', 'size', 'container_size');
        cur_frm.add_fetch('container_type', 'pat_code', 'pat_code');


        //        cur_frm.add_fetch('vessel', 'vessel_type', 'vessel_type');

        cur_frm.add_fetch('booking_ref', 'voyage_no', 'voyage_no');
        cur_frm.add_fetch('booking_ref', 'agents', 'agents');
        cur_frm.add_fetch('booking_ref', 'vessel', 'vessel');
        cur_frm.add_fetch('booking_ref', 'eta_date', 'eta_date');
        cur_frm.add_fetch('booking_ref', 'etd_date', 'etd_date');
        cur_frm.add_fetch('booking_ref', 'pol', 'pol');
        cur_frm.add_fetch('booking_ref', 'pod', 'pod');
        cur_frm.add_fetch('booking_ref', 'final_dest_port', 'final_dest_port');

        frm.add_custom_button(__('Insert Container'), function() {
            frappe.call({
                "method": "frappe.client.get",
                args: {
                    doctype: "Export",
                    filters: {
                        status: "Yard",
                        container_no: frm.doc.container_no
                    }
                },
                callback: function(data) {
                    if (!data.message["container_no"]){
                        frappe.throw(__("No Container"));
                    }
                    cur_frm.set_value("yard_slot", data.message["yard_slot"]);
                    cur_frm.set_value("main_gate_start", data.message["main_gate_start"]);
                    cur_frm.set_value("main_gate_ends", data.message["main_gate_ends"]);
                    cur_frm.set_value("gate1_start", data.message["gate1_start"]);
                    cur_frm.set_value("gate1_ends", data.message["gate1_ends"]);
                    cur_frm.set_value("driver_start", data.message["driver_start"]);
                    cur_frm.set_value("driver_ends", data.message["driver_ends"]);
                }
            })
            

        }).addClass("btn-success");

    },
    onsubmit: function(frm){
        

    }
    
});