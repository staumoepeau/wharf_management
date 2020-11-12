// Copyright (c) 2020, Sione Taumoepeau and contributors
// For license information, please see license.txt

frappe.ui.form.on('Wharf Cashier Closing', {
    onload: function(frm) {

        frm.set_query("user", function(doc) {
            return {
                filters: {
                    'user': frappe.session.user
                }
            };
        });
    },

    get_transactions: function(frm) {
        frappe.call({
            method: "wharf_management.wharf_management.doctype.wharf_cashier_closing.wharf_cashier_closing.get_transactions_list",
            args: {
                "posting_date": frm.doc.posting_date,
                "cashier": frm.doc.user
            },
            callback: function(data) {
                if (data.message) {
                    $.each(data.message, function(i, item) {
                        var item_row = frm.add_child("wharf_payment_list")
                        console.log(item)
                        item_row.wharf_payment = item.name,
                            item_row.posting_date = item.posting_date,
                            item_row.customer = item.customer,
                            item_row.amount = item.total_amount
                    });
                }

            }
        });
        frm.save()
        frm.refresh()

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