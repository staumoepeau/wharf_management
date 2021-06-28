// Copyright (c) 2020, Sione Taumoepeau and contributors
// For license information, please see license.txt
//frappe.provide("wharf_management.wharf_cashier_closing");
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

    all_cashier: function(frm) {
        frm.set_value("user", "");
    },

    get_transactions: function(frm) {
        get_fees_summary(frm);
        get_transactions_list(frm);

    },

    updates: function(frm) {

        get_cheques_list(frm);
        get_payment_mode(frm);

    },
});

function get_payment_mode(frm) {
    if (frm.doc.all_cashier == 1) {
        var cashier = ""
    } else {
        frm.doc.all_cashier == 0
        cashier = frm.doc.user
    }
    frappe.call({
        method: "wharf_management.wharf_management.doctype.wharf_cashier_closing.wharf_cashier_closing.get_mode_of_payment",
        args: {
            "posting_date": frm.doc.posting_date,
            "cashier": cashier,
        },
        callback: function(r) {
            console.log(r.message);
            let gtotal = 0;
            $.each(r.message, function(i, item) {
                var item_row = frm.add_child("payment_reconciliation")
                item_row.mode_of_payment = item.mode_of_payment,
                    item_row.expected_amount = item.total
                gtotal += flt(item.total)

            });

            frm.set_value("grand_total", gtotal);
            refresh_fields(frm);
        }
    });
}

function get_cheques_list(frm) {
    if (frm.doc.all_cashier == 1) {
        var cashier = ""
    } else {
        frm.doc.all_cashier == 0
        cashier = frm.doc.user
    }
    frappe.call({
        method: "wharf_management.wharf_management.doctype.wharf_cashier_closing.wharf_cashier_closing.get_cheques",
        args: {
            "posting_date": frm.doc.posting_date,
            "cashier": cashier,
        },
        callback: function(r) {
            console.log(r.message);
            let total_cheques = 0
            $.each(r.message, function(i, item) {
                var item_row = frm.add_child("cheque_details")
                item_row.name_on_the_cheque = item.name_on_the_cheque,
                    item_row.bank = item.bank,
                    item_row.cheque_no = item.cheque_no,
                    item_row.amount = item.amount
                total_cheques += flt(item.amount)
            });
            frm.set_value('total_cheques', total_cheques)
            refresh_fields(frm);
        }
    });

}


function get_voucher_list(frm) {
    if (frm.doc.all_cashier == 1) {
        var cashier = ""
    } else {
        frm.doc.all_cashier == 0
        cashier = frm.doc.user
    }
    frappe.call({
        method: "wharf_management.wharf_management.doctype.wharf_cashier_closing.wharf_cashier_closing.get_gov_voucher",
        args: {
            "posting_date": frm.doc.posting_date,
            "cashier": cashier,
        },
        callback: function(r) {
            console.log(r.message);
            let t_voucher = 0;
            $.each(r.message, function(i, item) {
                var item_row = frm.add_child("gov_voucher")
                item_row.ministry = item.gov_ministry,
                    item_row.po_number = item.po_number,
                    item_row.receipt_number = item.receipt_no,
                    item_row.amount = item.amount
                t_voucher += flt(item.amount)
            });
            frm.set_value('total_voucher', t_voucher)
            refresh_fields(frm);

        }

    });
}

function get_fees_summary(frm) {
    frappe.call({
        method: "wharf_management.wharf_management.doctype.wharf_cashier_closing.wharf_cashier_closing.get_fees_summary",
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
}

function get_cashier(cashier, frm) {
    if (frm.doc.all_cashier == 1) {
        var cashier = ""
    } else {
        frm.doc.all_cashier == 0
        cashier = frm.doc.user
    }
}

function get_transactions_list(frm) {
    if (frm.doc.all_cashier == 1) {
        var cashier = ""
    } else {
        frm.doc.all_cashier == 0
        cashier = frm.doc.user
    }
    frappe.call({
        method: "wharf_management.wharf_management.doctype.wharf_cashier_closing.wharf_cashier_closing.get_transactions_list",
        args: {
            "posting_date": frm.doc.posting_date,
            "cashier": cashier
        },
        callback: function(data) {
            if (data.message) {
                $.each(data.message, function(i, item) {
                    var item_row = frm.add_child("wharf_payment_list")
                        //                        console.log(item)
                    item_row.wharf_payment = item.name,
                        item_row.posting_date = item.posting_date,
                        item_row.customer = item.customer,
                        item_row.amount = item.total_amount
                });
                frm.refresh()
            }
        }
    });
}

function refresh_fields(frm) {
    frm.refresh_field("payment_reconciliation");
    frm.refresh_field("cheque_details");
    frm.refresh_field("grand_total");
    frm.refresh_field("total_cheques");
}

frappe.ui.form.on('Cheque Details', {

    cheque_details_remove: function(frm, cdt, cdn) {
        var t_cheques = 0;
        frm.doc.cheque_details.forEach(function(d) { t_cheques += d.amount; });
        frm.doc.total_cheques = t_cheques;
        refresh_field("total_cheques");
    },
})

frappe.ui.form.on('Wharf Payment Reconciliation', {

    payment_reconciliation_remove: function(frm, cdt, cdn) {
        var g_total = 0;
        frm.doc.payment_reconciliation.forEach(function(d) { g_total += d.amount; });
        frm.doc.grand_total = g_total;
        refresh_field("grand_total");
    },
})

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