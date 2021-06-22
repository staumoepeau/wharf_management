# -*- coding: utf-8 -*-
# Copyright (c) 2020, Sione Taumoepeau and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document
from frappe.utils import cstr, flt, fmt_money, formatdate, now, date_diff
from frappe import _

class WharfCashierClosing(Document):

    def on_submit(self):
        self.update_cargo_for_overdue_storage()

#@frappe.whitelist()
#def updates_list(posting_date, cashier, all_cashier):
#    self.get_cheques(posting_date, cashier, all_cashier)
#    self.get_mode_of_payment(posting_date, cashier, all_cashier)
#    self.get_gov_voucher(posting_date, cashier, all_cashier)


    def update_cargo_for_overdue_storage(self):
        cargolist = frappe.db.sql("""SELECT name, eta_date, payment_date FROM `tabCargo` WHERE status = 'Paid' and gate1_status != 'Closed' and storage_overdue = 0""", as_dict=1)

        for odlist in cargolist:
            oddays = date_diff(now(), odlist.payment_date)

            storage_days = date_diff(now(), odlist.eta_date)

            if oddays > 2 and storage_days > 10:
#                frappe.throw(_('Check 2'))
                frappe.db.sql("""UPDATE `tabCargo` SET storage_overdue=1 WHERE name=%s""", odlist.name, as_dict=1)
#                        frappe.throw(_('Check 3'))

@frappe.whitelist()
def get_voucher_total(posting_date, cashier):
    if cashier:
        return frappe.db.sql("""SELECT SUM(amount) as amount
        FROM `tabPayment Method`
        WHERE docstatus = 1
        AND parenttype = "Wharf Payment Entry"
        AND mode_of_payment = 'Gov Voucher'
        AND posting_date = %s """, (posting_date))
    
    if not cashier:
        return frappe.db.sql("""SELECT SUM(amount) as amount
        FROM `tabPayment Method`
        WHERE docstatus = 1
        AND parenttype = "Wharf Payment Entry"
        AND mode_of_payment = 'Gov Voucher'
        AND owner = %s
        AND posting_date = %s """, (cashier, posting_date))
    

@frappe.whitelist()
def get_gov_voucher(posting_date, cashier):
    if cashier:
        return frappe.db.sql("""SELECT gov_ministry, po_number, receipt_no, amount
        FROM `tabPayment Method`
        WHERE docstatus = 1
        AND parenttype = "Wharf Payment Entry"
        AND mode_of_payment = 'Gov Voucher'
        AND posting_date = %s """, (posting_date), as_dict=1)
    

    if not cashier:
        return frappe.db.sql("""SELECT gov_ministry, po_number, receipt_no, amount
        FROM `tabPayment Method`
        WHERE docstatus = 1
        AND parenttype = "Wharf Payment Entry"
        AND mode_of_payment = 'Gov Voucher'
        AND owner = %s
        AND posting_date = %s """, (cashier, posting_date), as_dict=1)
    

@frappe.whitelist()
def get_mode_of_payment(posting_date, cashier):
    if not cashier:
        return frappe.db.sql("""SELECT docA.mode_of_payment, SUM(amount) as total
            FROM `tabPayment Method` docA, `tabWharf Payment Entry` docB
            WHERE docA.docstatus = 1
            AND docA.parent = docB.name
            AND docA.parenttype = "Wharf Payment Entry"
            AND docB.posting_date = %s
            AND docB.reference_doctype IN ("Cargo", "Export", "Fees", "Overdue Storage")
            GROUP BY docA.mode_of_payment """, (posting_date), as_dict=1)

    if cashier:
        return frappe.db.sql("""SELECT docA.mode_of_payment, SUM(amount) as total
            FROM `tabPayment Method` docA, `tabWharf Payment Entry` docB
            WHERE docA.docstatus = 1
            AND docA.parent = docB.name
            AND docA.parenttype = "Wharf Payment Entry"
            AND docA.owner = %s
            AND docB.reference_doctype IN ("Cargo", "Export", "Fees", "Overdue Storage")
            AND docB.posting_date = %s
            GROUP BY docA.mode_of_payment """, (cashier, posting_date), as_dict=1)


@frappe.whitelist()
def get_mode_of_payment_total(posting_date, cashier):
    if not cashier:
        return frappe.db.sql("""SELECT SUM(amount) as total
            FROM `tabPayment Method` docA, `tabWharf Payment Entry` docB
            WHERE docA.docstatus = 1
            AND docA.parent = docB.name
            AND docA.parenttype = "Wharf Payment Entry"
            AND docB.posting_date = %s
            AND docB.reference_doctype IN ("Cargo", "Export", "Fees", "Overdue Storage")
            """, (posting_date))

    if cashier:
        return frappe.db.sql("""SELECT SUM(amount) as total
            FROM `tabPayment Method` docA, `tabWharf Payment Entry` docB
            WHERE docA.docstatus = 1
            AND docA.parent = docB.name
            AND docA.parenttype = "Wharf Payment Entry"
            AND docA.owner = %s
            AND docB.reference_doctype IN ("Cargo", "Export", "Fees", "Overdue Storage")
            AND docB.posting_date = %s
            """, (cashier, posting_date))


@frappe.whitelist()
def get_cheques(posting_date, cashier):
    if not cashier:
        return frappe.db.sql("""SELECT docA.name_on_the_cheque, docA.bank, docA.cheque_no, docA.amount
            FROM `tabPayment Method` docA, `tabWharf Payment Entry` docB
            WHERE docA.docstatus = 1
            AND docA.parent = docB.name
            AND docA.parenttype = "Wharf Payment Entry"
            AND docA.mode_of_payment = "Cheque"
            AND docB.reference_doctype IN ("Cargo", "Export", "Fees", "Overdue Storage")
            AND docB.posting_date = %s """, (posting_date), as_dict=1)

    if cashier:
        return frappe.db.sql("""SELECT docA.name_on_the_cheque, docA.bank, docA.cheque_no, docA.amount
            FROM `tabPayment Method` docA, `tabWharf Payment Entry` docB
            WHERE docA.docstatus = 1
            AND docA.parent = docB.name
            AND docA.parenttype = "Wharf Payment Entry"
            AND docA.mode_of_payment = "Cheque"
            AND docB.reference_doctype IN ("Cargo", "Export", "Fees", "Overdue Storage")
            AND docA.owner = %s
            AND docB.posting_date = %s """, (cashier, posting_date), as_dict=1)
        
@frappe.whitelist()
def get_cheques_total(posting_date, cashier):
    if not cashier:
        totalcheques = frappe.db.sql("""SELECT SUM(docA.amount) as amount
            FROM `tabPayment Method` docA, `tabWharf Payment Entry` docB
            WHERE docA.docstatus = 1
            AND docA.parent = docB.name
            AND docA.parenttype = "Wharf Payment Entry"
            AND docA.mode_of_payment = "Cheque"
            AND docB.reference_doctype IN ("Cargo", "Export", "Fees", "Overdue Storage")
            AND docB.posting_date = %s """, (posting_date))
    return totalcheques

    if cashier:
        totalcheques = frappe.db.sql("""SELECT SUM(docA.amount) as amount
            FROM `tabPayment Method` docA, `tabWharf Payment Entry` docB
            WHERE docA.docstatus = 1
            AND docA.parent = docB.name
            AND docA.parenttype = "Wharf Payment Entry"
            AND docA.mode_of_payment = "Cheque"
            AND docB.reference_doctype IN ("Cargo", "Export", "Fees", "Overdue Storage")
            AND docA.owner = %s
            AND docB.posting_date = %s """, (cashier, posting_date))
    return totalcheques

@frappe.whitelist()
def get_transactions_list(posting_date, cashier):
    if cashier:
        return frappe.db.sql("""SELECT name, posting_date, customer, total_amount, reference_doctype
            FROM `tabWharf Payment Entry`
            WHERE docstatus = 1
            AND owner = %s
            AND reference_doctype IN ("Cargo", "Export", "Fees", "Overdue Storage")
            AND posting_date = %s """, (cashier, posting_date), as_dict=1)

    if not cashier or cashier == "":
            return frappe.db.sql("""SELECT name, posting_date, customer, total_amount, reference_doctype
            FROM `tabWharf Payment Entry`
            WHERE docstatus = 1
            AND reference_doctype IN ("Cargo", "Export", "Fees", "Overdue Storage")
            AND posting_date = %s """, (posting_date), as_dict=1)


@frappe.whitelist()
def get_transactions(posting_date):
    return frappe.db.sql("""SELECT name 
    FROM `tabWharf Payment Entry` 
    WHERE docstatus = 1
    AND reference_doctype IN ("Cargo", "Export", "Fees", "Overdue Storage")
    AND posting_date = %s""", (posting_date), as_list=True)
 

@frappe.whitelist()
def get_fees_summary(posting_date):
    transactions = get_transactions(posting_date)
    return frappe.db.sql("""SELECT SUM(`tabWharf Fee Item`.`total`) AS total,
        SUM(`tabWharf Fee Item`.`discount`) AS discount,
        `tabWharf Fees`.`wharf_fee_category` AS category
        FROM `tabWharf Fee Item`, `tabWharf Fees`, `tabWharf Payment Entry`
        WHERE `tabWharf Fee Item`.`item` = `tabWharf Fees`.`name`
        AND `tabWharf Fee Item`.`docstatus` = 1
        AND `tabWharf Fee Item`.`parent` = `tabWharf Payment Entry` .`name`
        AND `tabWharf Payment Entry`.`posting_date` = %s
        AND `tabWharf Fee Item`.`parenttype` = "Wharf Payment Entry"
        AND `tabWharf Payment Entry`.reference_doctype IN ("Cargo", "Export", "Fees", "Overdue Storage")
        GROUP BY `tabWharf Fees`.`wharf_fee_category`""", (posting_date), as_dict = 1)