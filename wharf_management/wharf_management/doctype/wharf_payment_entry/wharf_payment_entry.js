// Copyright (c) 2017, Sione Taumoepeau and contributors
// For license information, please see license.txt

frappe.provide("wharf_management.wharf_payment_entry");

frappe.ui.form.on('Wharf Payment Entry', {

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

    before_submit: function(frm) {
        if (!frm.doc.status) {
            frm.set_value("status", "Paid");
        }
        frm.save('Update');
    },

    onload: function(frm) {

        wharf_management.wharf_payment_entry.setup_queries(frm);
        if (!frappe.user.has_role("Cargo Operation Manager")) {
            cur_frm.set_df_property("set_posting_time", "hidden", 1);
        } else if (frappe.user.has_role("Cargo Operation Manager")) {
            cur_frm.set_df_property("set_posting_time", "hidden", 0);
        }

    },

    insert_fees_button: function(frm) {
        get_storage_fee(frm)
        get_wharfage_fee(frm)
    },

    discount: function(frm) {

        if (frm.doc.discount == "NO" || frm.doc.discount == "") {
            frm.set_value("total_amount", frm.doc.net_total);
            frm.set_value("discount_amount", 0);
        } else if (frm.doc.discount == "YES") {
            frm.set_value("total_amount", (frm.doc.net_total - frm.doc.discount_amount));
        }
    },

    discount_percent: function(frm) {

        frm.set_value("total_amount", (frm.doc.net_total - ((frm.doc.discount_percent / 100) * frm.doc.net_total)));
        frm.set_value("discount_amount", ((frm.doc.discount_percent / 100) * frm.doc.net_total));

    },

    discount_amount: function(frm) {

        frm.set_value("total_amount", (frm.doc.net_total - frm.doc.discount_amount));
        frm.set_value("discount_percent", ((frm.doc.discount_amount / frm.doc.net_total) * 100));
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

var get_storage_fee = function(frm) {
    frappe.call({
        method: "wharf_management.wharf_management.doctype.wharf_payment_entry.wharf_payment_entry.get_storage_fees",
        args: {
            "docname": frm.doc.name,
        },
        callback: function(r) {
            if (r.message) {
                if (frm.doc.wharf_fee_item) {
                    frm.set_value("wharf_fee_item", [])
                }
                $.each(r.message, function(i, item) {
                    var item_row = frm.add_child("wharf_fee_item")
                    console.log(item)
                    item_row.item = item.item_code,
                        item_row.description = item.description,
                        item_row.price = item.price,
                        item_row.qty = item.qty,
                        item_row.total = item.total

                });

            }
        }
    });
}
var get_wharfage_fee = function(frm) {
    frappe.call({
        method: "wharf_management.wharf_management.doctype.wharf_payment_entry.wharf_payment_entry.get_wharfage_fees",
        args: {
            "docname": frm.doc.name,
        },
        callback: function(r) {
            if (r.message) {
                $.each(r.message, function(i, item) {
                    var item_row = frm.add_child("wharf_fee_item")
                    console.log(item)
                    item_row.item = item.wharfage_item_code,
                        item_row.description = item.description,
                        item_row.price = item.price,

                        item_row.qty = item.qty,
                        item_row.total = item.total
                    get_net_total_fee(frm)
                    frm.save()
                });
            }
        }
    });
}

$.extend(wharf_management.wharf_payment_entry, {
    setup_queries: function(frm) {
        frm.fields_dict['cargo_references_table'].grid.get_field("reference_doctype").get_query = function(doc, cdt, cdn) {
            return {
                filters: [
                    ['Cargo', 'docstatus', '=', 1],
                    ['Cargo', 'status', 'in', ['Yard', 'Inspection Delivered']],
                    ['Cargo', 'consignee', '=', frm.doc.customer],
                ]
            }
        }
    }
});

frappe.ui.form.on("Wharf Fee Item", {
    qty: function(frm, cdt, cdn) {
        var d = locals[cdt][cdn];

        frappe.model.set_value(d.doctype, d.name, "total", d.price * d.qty);

        var total = 0;
        frm.doc.wharf_fee_item.forEach(function(d) { total += d.total; });

        frm.set_value("net_total", total);
        cur_frm.refresh();
    },
    total: function(frm, cdt, cdn) {
        var d = locals[cdt][cdn];
        frappe.model.set_value(d.doctype, d.name, "net_total", d.total);
        var total_fees = 0;
        frm.doc.wharf_fee_item.forEach(function(i) { total_fees += i.total; });

        frm.set_value("net_total", total_fees);

    },
    wharf_fee_item_remove: function(frm, cdt, cdn) {
        var total = 0;
        frm.doc.wharf_fee_item.forEach(function(d) { total += d.total; });

        frm.set_value("net_total", total);
        cur_frm.refresh();
    }

});


frappe.ui.form.on("Payment Method", "amount", function(frm, cdt, cdn) {
    var d = locals[cdt][cdn];
    frappe.model.set_value(d.doctype, d.name, "total_amount", d.amount);
    var total_amount = 0;
    frm.doc.payment_method.forEach(function(i) { total_amount += i.amount; });
    frm.set_value("paid_amount", total_amount);
});

frappe.ui.form.on("Cargo References", "reference_doctype", function(frm, cdt, cdn) {
    var d = locals[cdt][cdn];
    var cargo_a = ["Container", "Tank Tainers", "Flatrack"];

    if (d.reference_doctype) {

        if (cargo_a.includes(d.cargo_type)) {
            frappe.call({
                "method": "frappe.client.get",
                args: {
                    doctype: "Wharf Fees",
                    filters: {
                        wharf_fee_category: "Storage Fee",
                        cargo_type: d.cargo_type,
                        container_size: d.container_size,
                        container_content: d.container_content
                    }
                },
                callback: function(data) {
                    console.log(data)

                    frappe.model.set_value(d.doctype, d.name, "free_storage_days", data.message["grace_days"]);
                    frappe.model.set_value(d.doctype, d.name, "storage_fee_price", data.message["fee_amount"]);
                    frappe.model.set_value(d.doctype, d.name, "item_code", data.message["name"]);

                }
            })
        }
        var cargo_c = ["Container", "Tank Tainers"];
        if (cargo_c.includes(d.cargo_type)) {
            frappe.call({
                "method": "frappe.client.get",
                args: {
                    doctype: "Wharf Fees",
                    filters: {
                        wharf_fee_category: "Wharfage Fee",
                        cargo_type: d.cargo_type,
                        container_size: d.container_size,
                    }
                },
                callback: function(data) {
                    if (data.message) {
                        if (d.cargo_type == "Container") {
                            frappe.model.set_value(d.doctype, d.name, "wharfage_item_code", data.message["item_name"]);
                            frappe.model.set_value(d.doctype, d.name, "wharfage_fee_price", data.message["fee_amount"]);
                            frappe.model.set_value(d.doctype, d.name, "wharfage_fee", data.message["fee_amount"]);
                        }
                        if (d.cargo_type == "Tank Tainers") {
                            frappe.model.set_value(d.doctype, d.name, "wharfage_item_code", data.message["item_name"]);
                            frappe.model.set_value(d.doctype, d.name, "wharfage_fee_price", data.message["fee_amount"]);
                            frappe.model.set_value(d.doctype, d.name, "wharfage_fee", (data.message["fee_amount"] * d.litre / 100));
                        }
                    } else {
                        msgprint("Please check the Wharfage Fee Table for ", d.cargo_type)
                    }
                }
            })
        }
        if (d.cargo_type == "Flatrack") {
            frappe.call({
                "method": "frappe.client.get",
                args: {
                    doctype: "Wharf Fees",
                    filters: {
                        wharf_fee_category: "Wharfage Fee",
                        cargo_type: d.cargo_type,
                        container_size: d.container_size,
                    }
                },
                callback: function(data) {
                    frappe.model.set_value(d.doctype, d.name, "wharfage_item_code", data.message["item_name"]);
                    frappe.model.set_value(d.doctype, d.name, "wharfage_fee_price", data.message["fee_amount"]);
                    if (d.net_weight > d.volume) {
                        frappe.model.set_value(d.doctype, d.name, "wharfage_fee", (data.message["fee_amount"] * d.net_weight));
                    }
                    if (d.net_weight < d.volume) {
                        frappe.model.set_value(d.doctype, d.name, "wharfage_fee", (data.message["fee_amount"] * d.volume));
                    }
                }
            })
        }
        var cargo_b = ["Heavy Vehicles", "Break Bulk", "Loose Cargo"];
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
                    frappe.model.set_value(d.doctype, d.name, "free_storage_days", data.message["grace_days"]);
                    frappe.model.set_value(d.doctype, d.name, "storage_fee_price", data.message["fee_amount"]);
                    frappe.model.set_value(d.doctype, d.name, "item_code", data.message["name"]);
                }
            })
        }
        if (d.cargo_type == "Vehicles") {
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
                    frappe.model.set_value(d.doctype, d.name, "free_storage_days", data.message["grace_days"]);
                    frappe.model.set_value(d.doctype, d.name, "storage_fee_price", data.message["fee_amount"]);
                    frappe.model.set_value(d.doctype, d.name, "item_code", data.message["name"]);
                }
            })
        }

        frappe.call({
            method: "wharf_management.wharf_management.doctype.wharf_payment_entry.wharf_payment_entry.get_storage_days",
            args: {
                "eta_date": d.eta_date,
                "posting_date": frm.doc.posting_date
            },
            callback: function(r) {
                frappe.model.set_value(d.doctype, d.name, "storage_days", r.message);
                if (d.free_storage_days < d.storage_days) {
                    var sdays = flt(d.storage_days - d.free_storage_days);
                    frappe.model.set_value(d.doctype, d.name, "charged_storage_days", sdays);
                    frappe.model.set_value(d.doctype, d.name, "storage_fee", sdays * d.storage_fee_price);
                } else if (d.free_storage_days >= d.storage_days) {
                    frappe.model.set_value(d.doctype, d.name, "charged_storage_days", 0);
                    frappe.model.set_value(d.doctype, d.name, "storage_fee", sdays * d.storage_fee_price);

                }

            }
        })
    } else if (!d.reference_doctype) {
        msgprint("Please select a Cargo")
    }
});