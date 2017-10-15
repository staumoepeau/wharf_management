# -*- coding: utf-8 -*-
# Copyright (c) 2017, Caitlah Technology and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe, json
from frappe.model.document import Document
from frappe import msgprint, _, scrub
from frappe.utils import cstr, flt, fmt_money, formatdate


class Cargo(Document):

	def on_submit(self):
		self.validate_booking_ref()
#		self.check_bulk_cargo()

	def validate(self):
		self.check_bulk_cargo()
		self.clear_new_cargo()

	def check_bulk_cargo(self):
		if self.cargo_type == "Break Bulk":
			self.name = self.name +"-"+ self.break_bulk_items

	def clear_new_cargo(self):
		frappe.db.sql("""Update `tabCargo` set final_status="NULL", inspection_status="NULL" where name=%s""", (self.cargo_ref))

	
	def validate_booking_ref(self):
		if not self.booking_ref:
			msgprint(_("Booking Ref # is Manadory").format(self.booking_ref),
					raise_exception=1)
	


