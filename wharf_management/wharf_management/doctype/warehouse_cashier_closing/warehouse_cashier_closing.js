// Copyright (c) 2020, Sione Taumoepeau and contributors
// For license information, please see license.txt

frappe.ui.form.on('Warehouse Cashier Closing', {
    onload: function(frm) {

        frm.set_query("user", function(doc) {
            return {
                filters: {
                    'user': frappe.session.user
                }
            };
        });
    },
    all_cashier: function(frm) {
        frm.set_value("user", NULL);
    },

    get_transactions: function(frm) {

        get_fees_summary(frm);
        get_transactions_list(frm);

    },



    updates: function(frm) {
        return frappe.call({
            method: "updates_list",
            doc: frm.doc,
            callback: function(data) {
                frm.refresh_fields();
                console.log(data.message);
            }
        });

    },

});

var get_fees_summary = function(frm) {

    frappe.call({
        method: "wharf_management.wharf_management.doctype.warehouse_cashier_closing.warehouse_cashier_closing.get_fees_summary",
        args: {
            "posting_date": frm.doc.posting_date,
        },
        callback: function(r) {
            console.log(r.message)
            if (r.message) {
                $.each(r.message, function(i, item) {
                    var item_row = frm.add_child("fees_summary")
                    item_row.wharf_fees = item.category,
                        item_row.total_discount = item.discount,
                        item_row.total_amount = item.total
                });
                frm.refresh()
            }

        }

    });

    //        frm.save()
    //        frm.refresh()

}

var get_transactions_list = function(frm) {
    if (frm.doc.all_cashier == 1) {
        var cashier = ""
    } else {
        frm.doc.all_cashier == 0
        cashier = frm.doc.user
    }
    //        console.log(cashier)
    frappe.call({
        method: "wharf_management.wharf_management.doctype.warehouse_cashier_closing.warehouse_cashier_closing.get_transactions_list",
        args: {
            "posting_date": frm.doc.posting_date,
            //                "cashier": cashier
        },
        callback: function(data) {
            console.log(data.message)
            if (data.message) {
                $.each(data.message, function(i, item) {
                    var item_row = frm.add_child("warehouse_payment_list")
                        //                        console.log(item)
                    item_row.warehouse_payment = item.name,
                        item_row.posting_date = item.posting_date,
                        item_row.customer = item.consignee,
                        item_row.amount = item.total_amount
                });
                frm.refresh()
            }

        }

    });

    //        frm.save()
    //        frm.refresh()

}

frappe.ui.form.on('Cash Denomination Table', {
    qty: function(frm, cdt, cdn) {
        var d = locals[cdt][cdn];
        frappe.model.set_value(d.doctype, d.name, "total", d.denomination * d.qty);

        var totalcash = 0;
        frm.doc.cash_denomination.forEach(function(d) { totalcash += d.total; });
        frm.set_value("total_cash", totalcash);
        refresh_field("total_cash");
    },
    cash_denomination_remove: function(frm, cdt, cdn) {
        var totalcash = 0;
        frm.doc.cash_denomination.forEach(function(d) { totalcash += d.total; });
        frm.doc.total_cash = totalcash;
        refresh_field("total_cash");
    },
})

frappe.ui.form.on('Wharf Payment Reconciliation', {
    collected_amount: function(frm, cdt, cdn) {
        var d = locals[cdt][cdn];
        frappe.model.set_value(d.doctype, d.name, "difference", flt(d.collected_amount - d.expected_amount));
    },
})