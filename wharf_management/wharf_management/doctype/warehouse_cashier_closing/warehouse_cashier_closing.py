# -*- coding: utf-8 -*-
# Copyright (c) 2020, Sione Taumoepeau and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document
from frappe.utils import cstr, flt, fmt_money, formatdate, now, date_diff
from frappe import _

class WarehouseCashierClosing(Document):

    def updates_list(self):
        self.get_cheques()
        self.get_mode_of_payment()
        self.get_gov_voucher()

    def get_cheques(self):

        if self.all_cashier:
            chequelist = frappe.db.sql("""SELECT name_on_the_cheque, bank, cheque_no, amount
            FROM `tabPayment Method`
            WHERE docstatus = 1
            AND parenttype = "Warehouse Fee Payment"
            AND mode_of_payment = "Cheque"
            AND posting_date = %s """, (self.posting_date), as_dict=1)
            totalcheque = 0.0
            for d in chequelist:
                self.append("cheque_details", {
                        "name_on_the_cheque": d.name_on_the_cheque,
                        "bank": d.bank,
                        "cheque_no": d.cheque_no,
                        "amount": d.amount
                    })
                totalcheque += flt(d.amount)
            self.total_cheques = totalcheque

        if not self.all_cashier:
            chequelist = frappe.db.sql("""SELECT name_on_the_cheque, bank, cheque_no, amount
            FROM `tabPayment Method`
            WHERE docstatus = 1
            AND parenttype = "Warehouse Fee Payment"
            AND mode_of_payment = "Cheque"
            AND owner = %s
            AND posting_date = %s """, (self.user, self.posting_date), as_dict=1)
            totalcheque = 0.0
            for d in chequelist:
                self.append("cheque_details", {
                        "name_on_the_cheque": d.name_on_the_cheque,
                        "bank": d.bank,
                        "cheque_no": d.cheque_no,
                        "amount": d.amount
                    })
                totalcheque += flt(d.amount)
            self.total_cheques = totalcheque

    def get_mode_of_payment(self):

        if self.all_cashier:
            paymentmode = frappe.db.sql("""SELECT mode_of_payment, SUM(amount) as total
                FROM `tabPayment Method`
                WHERE docstatus = 1
                AND parenttype = "Warehouse Fee Payment"
                AND posting_date = %s
                GROUP BY mode_of_payment """, (self.posting_date), as_dict=1)
            grandtotal = 0.0
            for d in paymentmode:
                self.append("payment_reconciliation", {
                        "mode_of_payment": d.mode_of_payment,
                        "expected_amount": d.total
                    })
                grandtotal += flt(d.total)
            self.grand_total = grandtotal

        if not self.all_cashier:
            paymentmode = frappe.db.sql("""SELECT mode_of_payment, SUM(amount) as total
                FROM `tabPayment Method`
                WHERE docstatus = 1
                AND parenttype = "Warehouse Fee Payment"
                AND owner = %s
                AND posting_date = %s
                GROUP BY mode_of_payment """, (self.user, self.posting_date), as_dict=1)
            grandtotal = 0.0
            for d in paymentmode:
                self.append("payment_reconciliation", {
                        "mode_of_payment": d.mode_of_payment,
                        "expected_amount": d.total
                    })
                grandtotal += flt(d.total)
            self.grand_total = grandtotal

    def get_gov_voucher(self):

        if self.all_cashier:
            gov_voucher = frappe.db.sql("""SELECT gov_ministry, po_number, receipt_no, amount
                FROM `tabPayment Method`
                WHERE docstatus = 1
                AND parenttype = "Warehouse Fee Payment"
                AND mode_of_payment = 'Gov Voucher'
                AND posting_date = %s """, (self.posting_date), as_dict=1)
            totalvoucher = 0.0
            if gov_voucher:
                for d in gov_voucher:
                    self.append("gov_voucher", {
                        "ministry": d.gov_ministry,
                        "po_number": d.po_number,
                        "receipt_number": d.receipt_no,
                        "amount": d.amount,
                    })
                totalvoucher += flt(d.amount)
            self.total_voucher = totalvoucher

        if not self.all_cashier:
            gov_voucher = frappe.db.sql("""SELECT gov_ministry, po_number, receipt_no, amount
                FROM `tabPayment Method`
                WHERE docstatus = 1
                AND parenttype = "Warehouse Fee Payment"
                AND mode_of_payment = 'Gov Voucher'
                AND owner = %s
                AND posting_date = %s """, (self.user, self.posting_date), as_dict=1)
            totalvoucher = 0.0
            if gov_voucher:
                for d in gov_voucher:
                    self.append("gov_voucher", {
                        "ministry": d.gov_ministry,
                        "po_number": d.po_number,
                        "receipt_number": d.receipt_no,
                        "amount": d.amount,
                    })
                totalvoucher += flt(d.amount)
            self.total_voucher = totalvoucher


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
        AND `tabWharf Fee Item`.`parent` = `tabWarehouse Fee Payment` .`name`
        AND DATE(`tabWarehouse Fee Payment`.`posting_date`) = %s
        AND `tabWharf Fee Item`.`parenttype` = "Warehouse Fee Payment"
        GROUP BY `tabWharf Fees`.`wharf_fee_category`""", (posting_date), as_dict=1)