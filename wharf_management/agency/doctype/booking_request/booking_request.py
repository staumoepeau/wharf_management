# -*- coding: utf-8 -*-
# Copyright (c) 2017, Caitlah Technology and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe import throw, _
from frappe.model.document import Document

class BookingRequest(Document):
    	

	def on_submit(self):
		self.check_security_status()

	
	def check_security_status(self):
		if not self.security_status:
			frappe.throw(_("Please make sure that Port Security have Review this Booking Request Documents").format(self.security_status))


#	def validate(self):
#		if not self.require_amount or self.require_amount <= 0:
#			frappe.throw(_("Please make sure to input the Payment Amount"))
	
	
	pass
