// Copyright (c) 2017, Sione Taumoepeau and contributors
// For license information, please see license.txt

frappe.ui.form.on('Cargo Warehouse', {

    setup: function(frm) {
    
//        frm.get_field('warehouse_cargo_table').grid.editable_fields = [
//			{fieldname: 'cargo_type', columns: 1},
//			{fieldname: 'cargo_description', columns: 1},
//			{fieldname: 'net_weight', columns: 1},
//            {fieldname: 'volume', columns: 1},
//            {fieldname: 'mark', columns: 1},
//		];
    },

	refresh: function(frm) {

		cur_frm.add_fetch('container_type', 'size', 'container_size');
        cur_frm.add_fetch('container_type', 'pat_code', 'pat_code');

        cur_frm.add_fetch('booking_ref', 'voyage_no', 'voyage_no');
        cur_frm.add_fetch('booking_ref', 'agents', 'agents');
        cur_frm.add_fetch('booking_ref', 'vessel', 'vessel');
        cur_frm.add_fetch('booking_ref', 'eta_date', 'eta_date');
        cur_frm.add_fetch('booking_ref', 'etd_date', 'etd_date');
        cur_frm.add_fetch('booking_ref', 'pol', 'pol');
        cur_frm.add_fetch('booking_ref', 'pod', 'pod');
        cur_frm.add_fetch('booking_ref', 'final_dest_port', 'final_dest_port');

        cur_frm.add_fetch('requesting_ref','agents','freight_forwarder');
        cur_frm.add_fetch('requesting_ref','devanning_date','request_date_devanning');
        cur_frm.add_fetch('requesting_ref','container_no','container_no');
        cur_frm.add_fetch('requesting_ref','container_size','container_size')
        cur_frm.add_fetch('requesting_ref','devanning_date','devanning_date');

        if ((frappe.user.has_role("Administrator") || frappe.user.has_role("Yard Inspection User") || frappe.user.has_role("Yard Inspection Supervisor")) &&
        frm.doc.security_check_status != "Closed" &&
        frm.doc.payment_status != "Closed" &&
        frm.doc.yard_status != "Closed" &&
        frm.doc.inspection_status != "Closed" &&
        frm.doc.docstatus == 1
        ) {
            frm.add_custom_button(__('Warehouse Inspection'), function() {
                frappe.route_options = {
                    "cargo_warehouse_ref": frm.doc.name
                }
                frappe.new_doc("Warehouse Inspection");
                frappe.set_route("Form", "Warehouse Inspection", doc.name);

            }).addClass("btn-info");
        }
        if ((frappe.user.has_role("Administrator") || frappe.user.has_role("Yard Operation User") &&
        frm.doc.security_check_status != "Closed" &&
        frm.doc.payment_status != "Closed" &&
        frm.doc.yard_status != "Closed" &&
        frm.doc.inspection_status == "Closed" &&
        frm.doc.docstatus == 1
        )) {
            frm.add_custom_button(__('Warehouse Yard'), function() {
                frappe.route_options = {
                    "cargo_warehouse_ref": frm.doc.name
                }
                frappe.new_doc("Warehouse Yard");
                frappe.set_route("Form", "Warehouse Yard", doc.name);

            }).addClass("btn-info");
        }
        if ((frappe.user.has_role("Administrator") || frappe.user.has_role("Wharf Operation Cashier") &&
        frm.doc.security_check_status != "Closed" &&
        frm.doc.payment_status != "Closed" &&
        frm.doc.custom_check_status != "Closed" &&
        frm.doc.yard_status == "Closed" &&
        frm.doc.inspection_status == "Closed" &&
        frm.doc.docstatus == 1
        )) {
            frm.add_custom_button(__('Custom Check'), function() {
                frappe.route_options = {
                    "cargo_warehouse_ref": frm.doc.name
                }
                frappe.new_doc("Warehouse Custom Check");
                frappe.set_route("Form", "Warehouse Custom Check", doc.name);

            }).addClass("btn-warning");
        }
        if ((frappe.user.has_role("Administrator") || frappe.user.has_role("Wharf Operation Cashier") &&
        frm.doc.security_check_status != "Closed" &&
        frm.doc.payment_status != "Closed" &&
        frm.doc.custom_check_status == "Closed" &&
        frm.doc.yard_status == "Closed" &&
        frm.doc.inspection_status == "Closed" &&
        frm.doc.docstatus == 1
        )) {
            frm.add_custom_button(__('Payment'), function() {
                frappe.route_options = {
                    "cargo_warehouse_ref": frm.doc.name
                }
                frappe.new_doc("Warehouse Fee Payment");
                frappe.set_route("Form", "Warehouse Fee Payment", doc.name);

            }).addClass("btn-info");
        }
        if ((frappe.user.has_role("Administrator") || frappe.user.has_role("Wharf Security Officer") &&
        frm.doc.gate1_status != "Closed" &&
        frm.doc.payment_status == "Closed" &&
        frm.doc.yard_status == "Closed" &&
        frm.doc.inspection_status == "Closed" &&
        frm.doc.docstatus == 1
         )) {
           cur_frm.set_df_property("custom_warrant", "hidden", 1);
        frm.add_custom_button(__('Gate 1'), function() {
            frappe.route_options = {
                "cargo_warehouse_ref": frm.doc.name
            }
            frappe.new_doc("Gate1");
            frappe.set_route("Form", "Gate1", doc.name);
        }).addClass("btn-primary");
        }


    },
    onload: function(frm){
        if (frappe.user.has_role("System Manager")){
            cur_frm.set_df_property("inspection_status", "read_only", 0);
            cur_frm.set_df_property("yard_status", "read_only", 0);
            cur_frm.set_df_property("custom_check_status", "read_only", 0);
            cur_frm.set_df_property("payment_status", "read_only", 0);
            cur_frm.set_df_property("security_check_status", "read_only", 0);
            cur_frm.set_df_property("status", "read_only", 0);

        } else{
            cur_frm.set_df_property("inspection_status", "read_only", 1);
            cur_frm.set_df_property("yard_status", "read_only", 1);
            cur_frm.set_df_property("custom_check_status", "read_only", 1);            
            cur_frm.set_df_property("payment_status", "read_only", 1);
            cur_frm.set_df_property("security_check_status", "read_only", 1);
            cur_frm.set_df_property("status", "read_only", 1);
        }
    }
});
