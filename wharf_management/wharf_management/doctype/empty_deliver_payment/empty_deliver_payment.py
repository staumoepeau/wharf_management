# -*- coding: utf-8 -*-
# Copyright (c) 2018, Sione Taumoepeau and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
from frappe.utils import add_days, cint, cstr, flt, getdate, rounded, date_diff, money_in_words
import frappe
from frappe import _, msgprint, throw
from frappe.model.document import Document

class EmptyDeliverPayment(Document):


	def on_submit(self):
		self.update_empty_container_status()
	

	def update_empty_container_status(self):

		val = frappe.db.get_value("Export", {"name": self.cargo_ref}, ["pat_code","cargo_type","container_no","agents",
			"container_type","container_size","container_content","status","yard_slot"], as_dict=True)
		
		doc = frappe.new_doc("Empty Containers")
		doc.update({
					"docstatus" : 1,
					"cargo_ref" : self.cargo_ref,
					"pat_code" : val.pat_code,
					"cargo_type" : val.cargo_type,
					"container_no" : val.container_no,
					"voyage_no" : val.voyage_no,
					"agents" : val.agents,
					"container_type" : val.container_type,
					"container_size" : val.container_size,
					"consignee" : self.consignee,
					"container_content" : val.container_content,
					"status" : "PAID",
					"yard_slot" : val.yard_slot,
					"bulk_payment" : self.bulk_payment
					
				})
		doc.insert()
		doc.submit()

		frappe.db.sql("""delete from `tabExport` where container_no=%s""", self.container_no)


	def get_working_days(self):
		
		holidays = self.get_holidays(self.gate_in_date, self.posting_date)
		working_days = date_diff(self.posting_date, self.gate_in_date)
		working_days -= len(holidays)
		return working_days

	def get_holidays(self, start_date, end_date):
		holiday_list = frappe.db.get_value("Company", "Ports Authority Tonga", "default_holiday_list")
		holidays = frappe.db.sql_list('''select holiday_date  from `tabHoliday`
			where
				parent=%(holiday_list)s
				and holiday_date >= %(start_date)s
				and holiday_date <= %(end_date)s''', {
					"holiday_list": holiday_list,
					"start_date": start_date,
					"end_date": end_date
				})

		holidays = [cstr(i) for i in holidays]

		return holidays
	
	def insert_fees(self):
		strqty=0
		qty=0

					
		if self.cargo_type == 'Container' or self.cargo_type == 'Tank Tainers' or self.cargo_type == 'Flatrack':
			strqty = self.storage_days_charged
			vals = frappe.db.get_value("Storage Fee", {"cargo_type" : self.cargo_type,
													"container_size" : self.container_size,
													"container_content" : self.container_content}, ["fee_amount", "item_name","description"], as_dict=True)
			self.append("wharf_fee_item", { 
				"item": vals.item_name,
				"description": vals.description,
				"price": vals.fee_amount,
				"qty": strqty,
				"total": float(strqty * vals.fee_amount)
			})
		
		if self.storage_days_charged == 0:
			self.total_fee = 0
			self.total_amount = 0

		if self.storage_days_charged > 0:
			self.total_fee = float((vals.fee_amount * strqty))
			self.total_amount = self.total_fee

