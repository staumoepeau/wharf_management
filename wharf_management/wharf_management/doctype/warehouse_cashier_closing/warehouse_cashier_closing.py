# -*- coding: utf-8 -*-
# Copyright (c) 2020, Sione Taumoepeau and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document
from frappe.utils import cstr, flt, fmt_money, formatdate, now, date_diff
from frappe import _

class WarehouseCashierClosing(Document):

    def validate(self):
        if not self.posting_date:
            frappe.msgprint(_("Please check Posting Date"))

#        self.get_cheques()
#        self.get_mode_of_payment()
#        self.get_gov_voucher()

@frappe.whitelist()
def get_cheques(posting_date, cashier):

    if cashier:
        return frappe.db.sql("""SELECT name_on_the_cheque, bank, cheque_no, amount
        FROM `tabPayment Method`
        WHERE docstatus = 1
        AND parenttype = "Warehouse Fee Payment"
        AND mode_of_payment = "Cheque"
        AND posting_date = %s """, (posting_date), as_dict=1)

    if not cashier:
        return frappe.db.sql("""SELECT name_on_the_cheque, bank, cheque_no, amount
        FROM `tabPayment Method`
        WHERE docstatus = 1
        AND parenttype = "Warehouse Fee Payment"
        AND mode_of_payment = "Cheque"
        AND owner = %s
        AND posting_date = %s """, (cashier, posting_date), as_dict=1)

@frappe.whitelist()
def get_mode_of_payment(posting_date, cashier):

    if not cashier:
        return frappe.db.sql("""SELECT mode_of_payment, SUM(amount) as total
            FROM `tabPayment Method`
            WHERE docstatus = 1
            AND parenttype = "Warehouse Fee Payment"
            AND posting_date = %s
            GROUP BY mode_of_payment """, (posting_date), as_dict=1)
    
    if cashier:
        return frappe.db.sql("""SELECT mode_of_payment, SUM(amount) as total
            FROM `tabPayment Method`
            WHERE docstatus = 1
            AND parenttype = "Warehouse Fee Payment"
            AND owner = %s
            AND posting_date = %s
            GROUP BY mode_of_payment """, (cashier, posting_date), as_dict=1)
    
@frappe.whitelist()
def get_gov_voucher(posting_date, cashier):

    if cashier:
        return frappe.db.sql("""SELECT gov_ministry, po_number, receipt_no, amount
            FROM `tabPayment Method`
            WHERE docstatus = 1
            AND parenttype = "Warehouse Fee Payment"
            AND mode_of_payment = 'Gov Voucher'
            AND posting_date = %s """, (posting_date), as_dict=1)


    if not cashier:
        return frappe.db.sql("""SELECT gov_ministry, po_number, receipt_no, amount
            FROM `tabPayment Method`
            WHERE docstatus = 1
            AND parenttype = "Warehouse Fee Payment"
            AND mode_of_payment = 'Gov Voucher'
            AND owner = %s
            AND posting_date = %s """, (cashier, posting_date), as_dict=1)

@frappe.whitelist()
def get_transactions_list(posting_date):
    return frappe.db.sql("""SELECT name, posting_date, consignee, total_amount
        FROM `tabWarehouse Fee Payment`
        WHERE status = "Paid" 
        AND docstatus = 1
        AND posting_date = %s """, (posting_date), as_dict=1)


@frappe.whitelist()
def get_fees_summary(posting_date):
    return frappe.db.sql("""SELECT SUM(`tabWharf Fee Item`.`total`) AS total,
        SUM(`tabWharf Fee Item`.`discount`) AS discount,
        `tabWharf Fees`.`wharf_fee_category` AS category
        FROM `tabWharf Fee Item`, `tabWharf Fees`, `tabWarehouse Fee Payment`
        WHERE `tabWharf Fee Item`.`item` = `tabWharf Fees`.`name`
        AND `tabWharf Fee Item`.`docstatus` = 1
        AND `tabWharf Fee Item`.`parent` = `tabWarehouse Fee Payment`.`name`
        AND DATE(`tabWarehouse Fee Payment`.`posting_date`) = %s
        AND `tabWharf Fee Item`.`parenttype` = "Warehouse Fee Payment"
        GROUP BY `tabWharf Fees`.`wharf_fee_category`""", (posting_date), as_dict=1)