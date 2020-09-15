# -*- coding: utf-8 -*-
# Copyright (c) 2017, Sione Taumoepeau and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document
from frappe import msgprint, _, scrub

class SecurityCheck(Document):

	def on_submit(self):
		self.check_status()

	def validate(self):
		self.update_booking_request()


	def update_booking_request(self):
		frappe.db.sql("""Update `tabBooking Request` set security_status=%s, security_comment=%s where name=%s""", (self.security_status, self.comments, self.booking_ref))


	def check_status(self):
		if not self.security_status:
			msgprint(_("Security Status is Manadory").format(self.security_status), raise_exception=1)