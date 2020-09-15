// Copyright (c) 2020, Sione Taumoepeau and contributors
// For license information, please see license.txt
frappe.provide("wharf_management.cargo_stock_reconciliation");

frappe.ui.form.on('Cargo Stock Reconciliation', {

    refresh: function(frm) {

        if (frm.doc.docstatus == 0) {
            if (!frm.doc.posting_date) {
                frm.set_value('posting_date', frappe.datetime.nowdate());
            }
            if (!frm.doc.posting_time) {
                frm.set_value('posting_time', frappe.datetime.now_time());
            }
            set_posting_date_time(frm)
        }
    },

    onload: function(frm) {
        wharf_management.cargo_stock_reconciliation.setup_queries(frm);
        //        if (!frappe.user.has_role("Cargo Operation Manager")) {
        //            cur_frm.set_df_property("set_posting_time", "hidden", 1);
        //        } else if (frappe.user.has_role("Cargo Operation Manager")) {
        //            cur_frm.set_df_property("set_posting_time", "hidden", 0);
        //        }

    },
    set_posting_time: function(frm) {
        set_posting_date_time(frm)
    }
});

$.extend(wharf_management.cargo_stock_reconciliation, {
    setup_queries: function(frm) {
        frm.fields_dict['cargo_reconciliation_table'].grid.get_field("reference_doctype").get_query = function(doc, cdt, cdn) {
            return {
                filters: [
                    ['Cargo', 'docstatus', '=', 1],
                    ['Cargo', 'status', 'in', ['Yard', 'Inspection Delivered', 'Paid']],
                ]
            }
        }
    }
});

var set_posting_date_time = function(frm) {
    if (frm.doc.docstatus == 0 && frm.doc.set_posting_time) {
        frm.set_df_property('posting_date', 'read_only', 0);
        frm.set_df_property('posting_time', 'read_only', 0);
    } else {
        frm.set_df_property('posting_date', 'read_only', 1);
        frm.set_df_property('posting_time', 'read_only', 1);
    }
}