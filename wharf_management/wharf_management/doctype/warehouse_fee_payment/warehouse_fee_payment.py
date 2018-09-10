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
		self.check_warrant_number()


	def validate(self):
		self.check_duplicate_warrant_number()

	def check_warrant_number(self):
		if not self.custom_warrant:
			frappe.msgprint(_("Custom Warrant Number is Required"), raise_exception=True)


	def check_duplicate_warrant_number(self):
		check_duplicate = None
		check_duplicate = frappe.db.sql("""Select custom_warrant from `tabWarehouse Fee Payment` where custom_warrant=%s having count(custom_warrant) > 1""", (self.custom_warrant))
		
		if check_duplicate:
			frappe.throw(_("Sorry You are duplicating this Warrant No : {0} ").format(check_duplicate))

	def update_payment_status(self):
 			frappe.db.sql("""Update `tabCargo Warehouse` set payment_status="Closed", status='Paid', warrant_no=%s where name=%s""", (self.custom_warrant, self.cargo_warehouse_ref))
	
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
				val = frappe.db.get_value("Warehouse Storage Fee", {"cargo_type" : self.cargo_type}, ["fee_amount", "fee_name","description"], as_dict=True)

				self.append("wharf_fee_item", { 
					"item": val.fee_name,
					"description": val.description,
					"price": val.fee_amount,
					"qty": strqty,
					"total": float(strqty * val.fee_amount)
				})
				self.total_fee = float((val.fee_amount * strqty))

		if self.cargo_type == 'Vehicles':
				strqty = 0
				strqty = self.storage_days_charged
				val = frappe.db.get_value("Warehouse Storage Fee", {"cargo_type" : self.cargo_type}, ["fee_amount", "fee_name","description"], as_dict=True)

				self.append("wharf_fee_item", { 
					"item": val.fee_name,
					"description": val.description,
					"price": val.fee_amount,
					"qty": strqty,
					"total": float(strqty * val.fee_amount)
				})
				self.total_fee = float((val.fee_amount * strqty))
