# -*- coding: utf-8 -*-
# Copyright (c) 2017, Caitlah Technology and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
from frappe.utils import add_days, cint, cstr, flt, getdate, rounded, date_diff, money_in_words
import frappe
from frappe import _, msgprint, throw
from frappe.model.document import Document

class WharfPaymentFee(Document):

	def on_submit(self):
		self.update_payment_status()
		self.update_export_status()
		

	def update_payment_status(self):
    		if self.status != 'Export':
    				frappe.db.sql("""Update `tabCargo` set payment_status="Closed", custom_warrant=%s, custom_code=%s, delivery_code=%s, status='Paid' where name=%s""", (self.custom_warrant, self.custom_code, self.delivery_code, self.cargo_ref))
	
	def update_export_status(self):
    		if self.status == 'Export':
    				frappe.db.sql("""Update `tabCargo` set export_status="Paid" where name=%s""", (self.cargo_ref))

	def get_working_days(self):

		holidays = self.get_holidays(self.eta_date, self.posting_date)
		working_days = date_diff(self.posting_date, self.eta_date) + 1
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
	
	def get_storage_fee(self):

		sfee = frappe.db.sql("""Select fee_amount from `tabStorage Fee` 
			where cargo_type=%s and container_size=%s and container_content=%s""", (self.cargo_type, self.container_size, self.container_content))
		return sfee
	
	def get_wharfage_fee(self):

		wfee = frappe.db.sql("""Select fee_amount from `tabWharfage Fee` 
			where cargo_type=%s and container_size=%s""", (self.cargo_type, self.container_size))
		return wfee
	
	def get_item_name(self):
		
		item_name = frappe.db.sql("""Select item_name from `tabStorage Fee` 
			where cargo_type=%s and container_size=%s and container_content=%s""", (self.cargo_type, self.container_size, self.container_content))
		
		return item_name
		
	def insert_fees(self):
			
		item_name = frappe.db.get_value("Storage Fee", {"cargo_type" : self.cargo_type, 
												   "container_size" : self.container_size,
												  "container_content" : self.container_content}, "item_name")
		
		vals = frappe.db.get_value("Item", item_name, ["description", "standard_rate"], as_dict=True)
		self.append("wharf_fee_item", { 
			"item": item_name,
			"description": vals.description,
			"price": vals.standard_rate,
			"qty": self.storage_days_charged,
			"total": float(self.storage_days_charged * vals.standard_rate)
		})

		item_name = frappe.db.get_value("Wharfage Fee", {"cargo_type" : self.cargo_type, 
												   "container_size" : self.container_size}, "item_name")
		val = frappe.db.get_value("Item", item_name, ["description", "standard_rate"], as_dict=True)
		self.append("wharf_fee_item", { 
			"item": item_name,
			"description": val.description,
			"price": val.standard_rate,
			"qty": "1",
			"total": float(1 * val.standard_rate)
		})
		
		if self.devanning=="Yes":
    			item_name = frappe.db.get_value("Devanning Fee", {"cargo_type" : self.cargo_type, "container_size" : self.container_size}, "item_name")
			devan = frappe.db.get_value("Item", item_name, ["description", "standard_rate"], as_dict=True)
			fees = float(1 * devan.standard_rate)
			self.append("wharf_fee_item", { 
					"item": item_name,
					"description": devan.description,
					"price": devan.standard_rate,
					"qty": "1",
					"total": float(1 * devan.standard_rate)
			
			})
		if self.devanning=="No":
    			fees=0

		self.total_fee = float((self.storage_days_charged * vals.standard_rate)+(1 * val.standard_rate)+(1 * fees))