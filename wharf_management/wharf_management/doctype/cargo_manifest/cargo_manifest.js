// Copyright (c) 2017, Caitlah Technology and contributors
// For license information, please see license.txt

frappe.ui.form.on('Cargo Manifest', {

    setup: function(frm) {
        frm.get_field('cargo_manifest_table').grid.editable_fields = [
            { fieldname: 'cargo_refrence', columns: 1 },
            { fieldname: 'container_no', columns: 1 },
            { fieldname: 'cargo_type', columns: 1 },
            { fieldname: 'work_type', columns: 1 },
            { fieldname: 'container_content', columns: 1 },
            { fieldname: 'manifest_confirm', columns: 1 }
        ];

        frm.get_field('manifest_summary_table').grid.editable_fields = [
            { fieldname: 'cargo_type', columns: 1 },
            { fieldname: 'container_content', columns: 1 },
            { fieldname: 'work_type', columns: 1 },
            { fieldname: 'container_size', columns: 1 },
            { fieldname: 'number', columns: 1 },
            { fieldname: 'handling_fee', columns: 1 },
            { fieldname: 'handling_fee_discount', columns: 1 }
        ];

        frm.get_field('bbulks_summary_table').grid.editable_fields = [
            { fieldname: 'cargo_type', columns: 1 },
            { fieldname: 'work_type', columns: 1 },
            { fieldname: 'weight', columns: 1 },
            { fieldname: 'volume', columns: 1 },
            { fieldname: 'number', columns: 1 },
            { fieldname: 'handling_fee', columns: 1 }
        ];
    },

    refresh: function(frm) {


    },

    booking_ref: function(frm) {
        frappe.call({
            method: "frappe.client.get",
            args: {
                doctype: "Booking Request",
                filters: {
                    'name': frm.doc.booking_ref
                },
            },
            callback: function(r) {
                cur_frm.set_value("voyage_no", r.message["voyage_no"])
                cur_frm.set_value("agents", r.message["agents"]);
                cur_frm.set_value("vessel", r.message["vessel"]);
                cur_frm.set_value("eta_date", r.message["eta_date"]);
                cur_frm.set_value("etd_date", r.message["etd_date"]);
                cur_frm.set_value("pod", r.message["pod"]);
                cur_frm.set_value("pol", r.message["pol"]);
                cur_frm.set_value("final_dest_port", r.message["final_dest_port"]);

            }
        })

    },
    apply_manifest_fee: function(frm) {
        if (frm.doc.apply_manifest_fee == 1) {
            cur_frm.set_value("manifest_fee", "600.00");
        } else {
            cur_frm.set_value("manifest_fee", );
        }
    },


    get_manifest_list: function(frm) {
        display_manifest_list(frm);
    },

    get_summary_list: function(frm) {
        display_summary_list(frm);
    },

    get_bbulks_summary_list: function(frm) {
        display_bbulk_summary_list(frm);
    },
});

var display_manifest_list = function(frm) {
    frappe.call({
        method: "wharf_management.wharf_management.doctype.cargo_manifest.cargo_manifest.get_manifest",
        args: {
            "booking_ref": frm.doc.booking_ref
        },
        callback: function(r) {
            if (r.message) {
                $.each(r.message, function(i, item) {
                    var item_row = frm.add_child("cargo_manifest_table")
                    item_row.container_size = item.container_size,
                        item_row.container_no = item.container_no,
                        item_row.cargo_type = item.cargo_type,
                        item_row.work_type = item.work_type,
                        item_row.container_content = item.container_content,
                        item_row.status = item.status,
                        item_row.container_size = item.container_size,
                        item_row.voyage_no = item.voyage_no,
                        item_row.handling_fee = item.handling_fee,
                        item_row.storage_fee = item.storage_fee,
                        item_row.chasis_no = item.chasis_no,
                        item_row.mark = item.mark,
                        item_row.manifest_check = item.manifest_check,
                        item_row.booking_ref = item.booking_ref,
                        item_row.cargo_refrence = item.cargo_refrence
                });
                frm.refresh()
            }
        }
    });
}

var display_summary_list = function(frm) {
    frappe.call({
        method: "wharf_management.wharf_management.doctype.cargo_manifest.cargo_manifest.get_manifest_summary_list",
        args: {
            "booking_ref": frm.doc.booking_ref
        },
        callback: function(r) {
            if (r.message) {
                $.each(r.message, function(i, item) {
                    var item_row = frm.add_child("manifest_summary_table")
                    item_row.cargo_type = item.cargo_type,
                        item_row.container_content = item.container_content,
                        item_row.work_type = item.work_type,
                        item_row.container_size = item.container_size,
                        item_row.handling_fee_discount = item.handling_fee_discount,
                        item_row.number = item.number,
                        item_row.handling_fee = item.handling_fee,
                        item_row.storage_fee = item.storage_fee,
                        item_row.wharfage_fee = item.wharfage_fee
                });
                frm.refresh()
            }
        }
    });
}

var display_bbulk_summary_list = function(frm) {
    frappe.call({
        method: "wharf_management.wharf_management.doctype.cargo_manifest.cargo_manifest.get_bbulks_summary_list",
        args: {
            "booking_ref": frm.doc.booking_ref
        },
        callback: function(r) {
            if (r.message) {
                $.each(r.message, function(i, item) {
                    var item_row = frm.add_child("bbulks_summary_table")
                    item_row.cargo_type = item.cargo_type,
                        item_row.work_type = item.work_type,
                        item_row.number = item.number,
                        item_row.weight = item.weight,
                        item_row.volume = item.volume,
                        item_row.handling_fee = item.handling_fee,
                        item_row.storage_fee = item.storage_fee,
                        item_row.wharfage_fee = item.wharfage_fee
                });
                frm.refresh()
            }
        }
    });
}