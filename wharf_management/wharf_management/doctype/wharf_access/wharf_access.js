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
        frm.save();
        frm.refresh();


    }
});

$.extend(wharf_management.wharf_access, {

    setup_export_queries: function(frm) {
        frm.fields_dict['export_cargo_table'].grid.get_field("cargo_ref").get_query = function(doc, cdt, cdn) {
            return {
                filters: [
                    ['Export', 'docstatus', '=', 1],
                    ['Export', 'status', 'in', ['Booked']],
                ]
            }
        }
    },
});