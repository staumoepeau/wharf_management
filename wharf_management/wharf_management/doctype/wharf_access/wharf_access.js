// Copyright (c) 2020, Sione Taumoepeau and contributors
// For license information, please see license.txt
frappe.provide("wharf_management.wharf_access");
frappe.ui.form.on('Wharf Access', {

    on_submit: function(frm) {
        frappe.set_route("List", "Wharf Access")
        location.reload(true);
    },

    setup: function(frm) {
        if (!frm.doc.time) {
            frm.set_value("check_in_out_time", frappe.datetime.now_datetime());
        }
    },
    onload: function(frm) {

        let is_allowed = frappe.user_roles.includes('System Manager', 'Cargo Operation Manager');
        frm.toggle_enable(['check_in_out_time'], is_allowed);

        wharf_management.wharf_access.setup_cargo_queries(frm);
        wharf_management.wharf_access.setup_cargo_overdue_pickup(frm)
        wharf_management.wharf_access.setup_cargo_pickup(frm);
        wharf_management.wharf_access.setup_export_queries(frm);

    },
    refresh: function(frm) {

        //    if (frm.doc.docstatus == 0) {
        //        if (!frm.doc.time) {
        //            frm.set_value('check_in_out_time', frappe.datetime.now_datetime());
        //        }
        //            set_posting_date_time(frm)
        //    }

    },
    customer_id: function(frm) {
        if (frm.user_status == "Red Flag") {
            frappe.throw(__('This User is RED FLAG'))
            frm.refresh();
        } else if (frm.user_status == "Expired") {
            frappe.throw(__('This User ID is EXPIRED'))
            frm.refresh();
        } else if (frm.user_status == "Hold") {
            frappe.throw(__('Please Contact Security Supervisor for this User ID'))
            frm.refresh();
        } else if (frm.user_status == "Active") {
            frm.save();
            frm.refresh();
        }
    }
});

$.extend(wharf_management.wharf_access, {

    setup_cargo_pickup: function(frm) {
        frm.fields_dict['cargo_pickup'].grid.get_field("pickup_cargo_ref").get_query = function(doc, cdt, cdn) {
            return {
                filters: [
                    ['Cargo', 'docstatus', '=', 1],
                    ['Cargo', 'status', 'in', ['Paid', 'Gate1']],
                    ['Cargo', 'security_item_count_status', '=', ['Open']],
                ]
            }
        }
    },
    setup_cargo_overdue_pickup: function(frm) {
        frm.fields_dict['cargo_pickup'].grid.get_field("pickup_cargo_ref").get_query = function(doc, cdt, cdn) {
            return {
                filters: [
                    ['Cargo', 'docstatus', '=', 1],
                    ['Cargo', 'status', 'in', ['Paid']],
                    ['Cargo', 'security_item_count_status', '=', ['Open']],
                    ['Cargo', 'overdue_storage_status', '=', ['Clear']],
                ]
            }
        }
    },
    setup_cargo_queries: function(frm) {
        frm.fields_dict['cargo_inspection_table'].grid.get_field("cargo_ref").get_query = function(doc, cdt, cdn) {
            return {
                filters: [
                    ['Cargo', 'docstatus', '=', 1],
                    ['Cargo', 'status', 'in', ['Custom Inspection']],
                ]
            }
        }
    },
    setup_export_queries: function(frm) {
        frm.fields_dict['export_cargo_table'].grid.get_field("cargo_ref").get_query = function(doc, cdt, cdn) {
            return {
                filters: [
                    ['Export', 'docstatus', '=', 1],
                    ['Export', 'status', 'in', ['Booked', 'Paid']],
                ]
            }
        }
    },
});


frappe.ui.form.on("Cargo Pickup", {

    pickup_cargo_ref: function(frm, cdt, cdn) {
        var d = locals[cdt][cdn];

        if (d.overdue_storage == 1 && d.overdue_storage_status != "Clear") {
            disable_button_state(frm)
            frappe.throw(__('This Cargo have an UNPAID Storage Days Fee. Please refer to the Cashier for more Details'))
        }
        if (d.overdue_storage == 0) {
            enable_button_state(frm)
        }


    },

    security_check: function(frm, cdt, cdn) {
        var d = locals[cdt][cdn];

        if (d.security_check === d.warrant_number) {

            enable_button_state(frm)
        }

        if (d.security_check != d.warrant_number) {
            disable_button_state(frm)
            frappe.throw(__('Please Make sure that is the correct WARRANT NUMBER'))
        }

    },
});

var enable_button_state = function(frm) {
    frm.save_disabled = false;
    frm.page.set_primary_action();
    frm.refresh();

}

var disable_button_state = function(frm, ref) {
    frm.disable_save();
}