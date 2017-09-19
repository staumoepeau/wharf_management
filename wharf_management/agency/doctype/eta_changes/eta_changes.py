# -*- coding: utf-8 -*-
# Copyright (c) 2017, Sione Taumoepeau and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

class ETAChanges(Document):
    	
	def on_submit(self):
    		self.update_eta()
	
	def update_eta(self):
    		frappe.db.sql("""Update `tabBooking Request` set eta_date=%s, etd_date=%s where name=%s""", (self.new_eta, self.new_etd, self.booking_ref))
	
