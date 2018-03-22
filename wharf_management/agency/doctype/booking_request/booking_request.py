# -*- coding: utf-8 -*-
# Copyright (c) 2017, Caitlah Technology and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.utils import add_days, cint, cstr, flt, getdate, rounded, date_diff, money_in_words
from frappe import throw, _
from frappe.model.document import Document
from dateutil.relativedelta import relativedelta
from datetime import datetime
from time import mktime



class BookingRequest(Document):
    	

	def on_submit(self):
		self.check_security_status()
	
	def validate(self):
    		self.calculate_require_amount()
	
	def check_security_status(self):
		if not self.security_status:
			frappe.throw(_("Please make sure that Port Security have Review this Booking Request Documents").format(self.security_status))


	def calculate_require_amount(self):
#    		working_days = date_diff(self.etd_date, self.eta_date)
#			working_hours = int(working_days * 24)

			fmt = '%Y-%m-%d %H:%M:%S'
			tstamp1 = datetime.strptime(self.etd_date, fmt)
			tstamp2 = datetime.strptime(self.eta_date, fmt)

			if tstamp1 > tstamp2:
				td = tstamp1 - tstamp2
			else:
				td = tstamp2 - tstamp1
			working_hours = int(round(td.total_seconds() / 60 / 60 ))

			self.working_hours = working_hours
			self.berthed_half_amount = float(float(working_hours) * float(self.grt) * 0.1296)
			self.total_amount = (float(self.berthed_half_amount) + float(self.require_amount))/2
	
	def create_sales_invoices(self):

		if self.mode_of_payment == "Credit":
			paid_amount = 0
			pos = False
			paid = "Unpaid"
		if self.mode_of_payment != "Credit":
			paid_amount = self.paid_amount
			pos = True
			paid = "Paid"

		doc = frappe.new_doc("Sales Invoice")
		doc.customer = self.agents
		doc.wharf_payment_ref = self.name
		doc.is_pos = pos
		doc.status = paid

		doc.paid_amount = paid_amount
		doc.base_paid_amount = paid_amount
#		doc.outstanding_amount = 0
		payments = doc.append('payments', {
		'mode_of_payment': self.mode_of_payment,
		'amount' : paid_amount
		})
		item = doc.append('items', {
			'item_code' : "Handling Fee",
			'item_name' : "Handling Fee",
			'description' : "Handling Fee",
			'rate' : (self.require_amount)/2,
			'qty' : "1"
		})
		item = doc.append('items', {
			'item_code' : "Berthed",
			'item_name' : "Berthed",
			'description' : "Berthed Fee",
			'rate' : (self.berthed_half_amount)/2,
			'qty' : "1"
		})

		doc.save(ignore_permissions=True)
		doc.save()
		doc.submit()

		frappe.db.sql("""Update `tabBooking Request` set payment_status="Paid" , workflow_state="Booking Paid" where name=%s""", (self.name))
		frappe.clear_cache(doctype="Booking Request") 
