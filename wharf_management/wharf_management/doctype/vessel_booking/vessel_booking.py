# -*- coding: utf-8 -*-
# Copyright (c) 2017, Caitlah Technology and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

class VesselBooking(Document):
	
	def validate(self):

		if not self.title:
			self.title = self.get_title()
			
		
	def get_title(self):
		self.name = self.voyage_no
		return self.voyage_no 
