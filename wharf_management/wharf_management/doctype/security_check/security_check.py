# -*- coding: utf-8 -*-
# Copyright (c) 2017, Sione Taumoepeau and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

class SecurityCheck(Document):

#	def on_submit(self):
#		self.create_security_timesheets()

	def validate(self):
    		
		self.update_booking_request()


	def update_booking_request(self):
		frappe.db.sql("""Update `tabBooking Request` set security_status=%s, reject_comments=%s where name=%s""", (self.security_status, self.reject_comments, self.booking_ref))