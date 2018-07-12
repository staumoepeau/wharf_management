# -*- coding: utf-8 -*-
# Copyright (c) 2017, Sione Taumoepeau and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
from frappe.utils import add_days, cint, cstr, flt, getdate, rounded, date_diff, money_in_words
import frappe
from frappe import _, msgprint, throw
from frappe.model.document import Document

class WarehouseFeePayment(Document):

	def on_submit(self):
		self.update_payment_status()

	def update_payment_status(self):
 			frappe.db.sql("""Update `tabCargo Warehouse` set payment_status="Closed", status='Paid' where name=%s""", (self.cargo_warehouse_ref))
	
	def get_working_days(self):

		holidays = self.get_holidays(self.devanning_date, self.posting_date)
		working_days = date_diff(self.posting_date, self.devanning_date)
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
		
		if self.cargo_type == 'Loose Cargo':
				strqty = 0
				if self.weight < self.volume: strqty = float(self.volume * self.storage_days_charged)
				if self.weight > self.volume: strqty = float(self.weight * self.storage_days_charged)
				item_name = frappe.db.get_value("Warehouse Storage Fee", {"cargo_type" : self.cargo_type}, "item_name")

				val = frappe.db.get_value("Item", item_name, ["description", "standard_rate"], as_dict=True)
				self.append("wharf_fee_item", { 
					"item": item_name,
					"description": val.description,
					"price": val.standard_rate,
					"qty": strqty,
					"total": float(strqty * val.standard_rate)
				})
				self.total_fee = float((val.standard_rate * strqty))

		if self.cargo_type == 'Vehicles':
				strqty = 0
				strqty = self.storage_days_charged
				item_name = frappe.db.get_value("Warehouse Storage Fee", {"cargo_type" : self.cargo_type}, "item_name")

				val = frappe.db.get_value("Item", item_name, ["description", "standard_rate"], as_dict=True)
				self.append("wharf_fee_item", { 
					"item": item_name,
					"description": val.description,
					"price": val.standard_rate,
					"qty": strqty,
					"total": float(strqty * val.standard_rate)
				})
				self.total_fee = float((val.standard_rate * strqty))
		
		
