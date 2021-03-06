// Copyright (c) 2021, Sione Taumoepeau and contributors
// For license information, please see license.txt
frappe.provide("wharf_management.warehouse_quote");

frappe.ui.form.on('Warehouse Quote', {
    refresh: function(frm) {

    },

    onload: function(frm) {

        wharf_management.warehouse_quote.setup_cargo_queries(frm);

    },

    insert_fees: function(frm) {
        get_storage_fee(frm)

    },

    paid_amount: function(frm) {

        if (frm.doc.total_amount > frm.doc.paid_amount) {
            frm.set_value("outstanding_amount", (frm.doc.total_amount - frm.doc.paid_amount));
            frm.set_value("change_amount", 0.00)
            cur_frm.set_df_property("change_amount", "read_only", 1)
            cur_frm.set_df_property("outstanding_amount", "read_only", 1)

        }
        if (frm.doc.total_amount < frm.doc.paid_amount) {
            frm.set_value("change_amount", (frm.doc.paid_amount - frm.doc.total_amount));
            frm.set_value("outstanding_amount", 0.00);
            cur_frm.set_df_property("change_amount", "read_only", 1)
            cur_frm.set_df_property("outstanding_amount", "read_only", 1)
        }
        if (frm.doc.total_amount == frm.doc.paid_amount) {
            frm.set_value("change_amount", 0.00)
            frm.set_value("outstanding_amount", 0.00);
            cur_frm.set_df_property("change_amount", "read_only", 1)
            cur_frm.set_df_property("outstanding_amount", "read_only", 1)
        }
    },

    set_posting_time: function(frm) {
        set_posting_date_time(frm)
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

var get_storage_fee = function(frm) {
    var nettotal = 0;
    frappe.call({
        method: "wharf_management.wharf_management.doctype.warehouse_fee_payment.warehouse_fee_payment.get_storage_fees",
        args: {
            "docname": frm.doc.name,
        },
        callback: function(r) {
            console.log(r.message)
            if (r.message) {

                $.each(r.message, function(i, item) {

                    var item_row = frm.add_child("wharf_fee_item")

                    item_row.item = item.item_code,
                        item_row.description = item.description,
                        item_row.price = item.price,
                        item_row.qty = item.qty,
                        item_row.total = item.total
                    nettotal += item.total
                    frm.refresh()
                        //                    get_net_total_fee(frm)
                        //                    frm.refresh()
                        //                    frm.save()
                        //                    frm.refresh()
                });
                frm.set_value("net_total", nettotal);
                frm.set_value("total_amount", nettotal);

            }
        }
    });
}

var get_net_total_fee = function(frm) {
    var doc = frm.doc;

    doc.net_total = 0.0
    if (doc.wharf_fee_item) {
        $.each(doc.wharf_fee_item, function(index, data) {
            doc.net_total += data.total
        })
    }
    frm.set_value("total_amount", doc.net_total);
    refresh_field('net_total')
    refresh_field('total_amount')
}

$.extend(wharf_management.warehouse_fee_payment, {

    setup_cargo_queries: function(frm) {
        frm.fields_dict['cargo_warehouse_table'].grid.get_field("cargo_warehouse").get_query = function(doc, cdt, cdn) {
            return {
                filters: [
                    ['Cargo Warehouse', 'docstatus', '=', 1],
                    ['Cargo Warehouse', 'status', 'in', ['Custom Check']],
                    ['Cargo Warehouse', 'consignee', '=', frm.doc.consignee],
                ]
            }
        }
    },

});

frappe.ui.form.on("Wharf Fee Item", {
    qty: function(frm, cdt, cdn) {
        var d = locals[cdt][cdn];

        frappe.model.set_value(d.doctype, d.name, "total", d.price * d.qty);

        var total = 0;
        frm.doc.wharf_fee_item.forEach(function(d) { total += d.total; });
        console.log(total)
        frm.set_value("net_total", total);
        frm.set_value("total_amount", total);
        frm.refresh();
    },

    discount: function(frm, cdt, cdn) {
        var d = locals[cdt][cdn];

        frappe.model.set_value(d.doctype, d.name, "total", (d.price * d.qty) - d.discount);
        frappe.model.set_value(d.doctype, d.name, "discount_percent", (d.discount / (d.price * d.qty) * 100));

        var total = 0;
        frm.doc.wharf_fee_item.forEach(function(d) { total += d.total; });

        frm.set_value("net_total", total);
        frm.set_value("total_amount", total);
        frm.refresh();
    },
    discount_percent: function(frm, cdt, cdn) {
        var d = locals[cdt][cdn];

        frappe.model.set_value(d.doctype, d.name, "total", (d.price * d.qty) - ((d.price * d.qty) * (d.discount_percent / 100)));
        frappe.model.set_value(d.doctype, d.name, "discount", ((d.price * d.qty) * (d.discount_percent / 100)));
        var total = 0;
        frm.doc.wharf_fee_item.forEach(function(d) { total += d.total; });
        frm.set_value("net_total", total);
        frm.set_value("total_amount", total);
        frm.refresh();
    },


    total: function(frm, cdt, cdn) {
        var d = locals[cdt][cdn];
        frappe.model.set_value(d.doctype, d.name, "net_total", d.total);
        var total_fees = 0;
        frm.doc.wharf_fee_item.forEach(function(i) { total_fees += i.total; });
        frm.set_value("net_total", total_fees);
        frm.set_value("total_amount", total);
    },

    wharf_fee_item_remove: function(frm, cdt, cdn) {
        var total = 0;
        frm.doc.wharf_fee_item.forEach(function(d) { total += d.total; });

        frm.set_value("net_total", total);
        frm.set_value("total_amount", total);
        frm.refresh();
    }

});


frappe.ui.form.on("Cargo Warehouse Table", {
    cargo_warehouse: function(frm, cdt, cdn) {
        var d = locals[cdt][cdn];

        if (d.cargo_warehouse) {
            var cargo_b = ["Heavy Vehicles", "Break Bulk", "Loose Cargo"];
            var j = 5;
            for (var i = 0; i < j; i++) {
                if (cargo_b.includes(d.cargo_type)) {
                    frappe.call({
                        "method": "frappe.client.get",
                        args: {
                            doctype: "Wharf Fees",
                            filters: {
                                wharf_fee_category: "Storage Fee",
                                cargo_type: d.cargo_type,
                            }
                        },
                        callback: function(data) {
                            console.log(data.message["grace_days"])
                            frappe.model.set_value(d.doctype, d.name, "free_storage_days", data.message["grace_days"]);
                            frappe.model.set_value(d.doctype, d.name, "storage_fee_price", data.message["fee_amount"]);
                            frappe.model.set_value(d.doctype, d.name, "item_code", data.message["name"]);
                        }
                    })

                } else if (d.cargo_type == "Vehicles") {
                    frappe.call({
                        "method": "frappe.client.get",
                        args: {
                            doctype: "Wharf Fees",
                            filters: {
                                wharf_fee_category: "Storage Fee",
                                cargo_type: d.cargo_type,
                            }
                        },
                        callback: function(data) {
                            console.log(data.message["grace_days"])
                            frappe.model.set_value(d.doctype, d.name, "free_storage_days", fs_days);
                            frappe.model.set_value(d.doctype, d.name, "storage_fee_price", data.message["fee_amount"]);
                            frappe.model.set_value(d.doctype, d.name, "item_code", data.message["name"]);
                        }
                    })
                }
            }
            var j = 7;
            for (var i = 0; i < j; i++) {
                frappe.call({
                    method: "wharf_management.wharf_management.doctype.warehouse_fee_payment.warehouse_fee_payment.get_storage_days",
                    args: {
                        "eta_date": d.devaning_date,
                        "posting_date": frm.doc.posting_date
                    },
                    callback: function(r) {
                        //                        console.log(r.message)
                        frappe.model.set_value(d.doctype, d.name, "storage_days", r.message);
                        //                        console.log(d.storage_days - d.free_storage_days)
                        let sdays = flt(d.storage_days - d.free_storage_days);
                        if (sdays) {
                            if (sdays > 0) {

                                frappe.model.set_value(d.doctype, d.name, "charged_storage_days", sdays);

                                if (cargo_b.includes(d.cargo_type)) {
                                    if (d.net_weight > d.volume) {
                                        frappe.model.set_value(d.doctype, d.name, "storage_fee", sdays * d.net_weight * d.storage_fee_price);
                                    }
                                    if (d.net_weight < d.volume) {
                                        frappe.model.set_value(d.doctype, d.name, "storage_fee", sdays * d.volume * d.storage_fee_price);
                                    }
                                }
                                if (d.cargo_type == "Vehicles") {
                                    frappe.model.set_value(d.doctype, d.name, "storage_fee", sdays * d.storage_fee_price);
                                }
                            }
                            if (sdays <= 0) {

                                frappe.model.set_value(d.doctype, d.name, "charged_storage_days", 0);
                                frappe.model.set_value(d.doctype, d.name, "storage_fee", 0 * d.storage_fee_price);
                            }
                        } else {
                            msgprint("Please Check Storage Fees")
                        }
                    }
                })
            }
        } else if (!d.cargo_warehouse) {
            msgprint("Please select a Cargo")
        }
    }
});