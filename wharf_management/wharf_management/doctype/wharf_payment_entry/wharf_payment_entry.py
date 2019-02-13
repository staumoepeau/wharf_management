# -*- coding: utf-8 -*-
# Copyright (c) 2017, Sione Taumoepeau and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
import json
from frappe.utils import cstr, flt, fmt_money, formatdate
from frappe import msgprint, _, scrub
from frappe.model.document import Document
from erpnext.setup.utils import get_exchange_rate
from erpnext.controllers.accounts_controller import AccountsController
from erpnext.accounts.party import get_party_account


class WharfPaymentEntry(Document):
	
	def on_submit(self):
		self.make_entries()
	
	
	def make_entries(self, cancel=0, adv_adj=0):
		frappe.db.sql("""Update `tabBooking Request` set payment_status="Paid" , workflow_state="Booking Paid" where name=%s""", (self.booking_ref))
		from erpnext.accounts.general_ledger import make_gl_entries
		
		gl_map = []
			
		gl_map.append(
			frappe._dict({
				"posting_date": self.posting_date,
				"account": self.paid_to,
				"account_currency": self.company_currency,
				"debit": self.paid_amount,
				"voucher_type": self.doctype,
				"voucher_no": self.name,
				"against": self.party_name
				}))
		gl_map.append(
			frappe._dict({
				"posting_date": self.posting_date,
				"account": self.paid_from,
				"credit": self.paid_amount,
				"voucher_type": self.doctype,
				"voucher_no": self.name,
				"against": self.paid_to,
				"party_type": self.party_type,
				"party": self.party
				}))

		if gl_map:
			make_gl_entries(gl_map, cancel=(self.docstatus == 2))
