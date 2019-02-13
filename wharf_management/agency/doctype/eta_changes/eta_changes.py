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
		frappe.db.sql("""Update `tabBooking Request` set eta_date=%s, etd_date=%s, eta_pilot_date=%s, mooring_date=%s, unmooring_date=%s,
		lines_boat_date=%s,tugboat_standby_date=%s,ship_clearance_date=%s, cargo_ops_start_date=%s, cargo_ops_completed_date=%s 
		where name=%s""", (self.new_eta, self.new_etd, self.new_eta_pilot_date, self.new_mooring_date, self.new_unmooring_date,self.new_lines_boat_date,self.new_tugboat_standby_date,self.new_ship_clearance_date,
		self.new_cargo_ops_start_date, self.new_cargo_ops_completed_date, self.booking_ref))
	
