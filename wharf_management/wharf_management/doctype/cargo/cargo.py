# -*- coding: utf-8 -*-
# Copyright (c) 2017, Caitlah Technology and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe, json
from frappe.model.document import Document
from frappe import msgprint, _, scrub
from frappe.utils import cstr, flt, fmt_money, formatdate, cint, getdate, rounded, date_diff, money_in_words, add_days


class Cargo(Document):

	def on_submit(self):
		self.validate_booking_ref()
		
#		self.check_bulk_cargo()

	def validate(self):
#		self.check_bulk_cargo()
		self.clear_new_cargo()
		if not self.title:
    			self.title = self.get_title()

#	def check_bulk_cargo(self):
#		if self.cargo_type == "Break Bulk":
#			self.name = self.name +"-"+ self.break_bulk_items

	def clear_new_cargo(self):
		self.inspection_status == ""
		self.final_status == ""
#		frappe.db.sql("""Update `tabCargo` set final_status="NULL", inspection_status="NULL" where name=%s""", (self.cargo_ref))

	
	def validate_booking_ref(self):
		if not self.booking_ref:
			msgprint(_("Booking Ref # is Manadory").format(self.booking_ref),
					raise_exception=1)
	

	def get_title(self):
		return self.consignee
	

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
		wfee = 0
		holidays = self.get_holidays(self.gate1_in, self.etd_date)
		working_days = date_diff(self.etd_date, self.gate1_in)
		working_days -= len(holidays)

		if self.cargo_type == 'Container':
			free_days = frappe.db.get_value("Storage Fee", {"cargo_type" : self.cargo_type, "container_size" : self.container_size, "container_content" : self.container_content }, "grace_days")
#			free_days = frappe.db.sql("""Select grace_days from `tabStorage Fee` 
#				where cargo_type=%s and container_size=%s and container_content=%s""", (self.cargo_type, self.container_size, self.container_content))
		
		elif self.cargo_type != 'Container':
			free_days = frappe.db.get_value("Storage Fee", {"cargo_type" : self.cargo_type}, "grace_days")

		if self.secondary_work_type == "Transhipment":
			if self.cargo_type == 'Container':
				wfee = frappe.db.get_value("Wharfage Fee", {"cargo_type" : self.cargo_type, "container_size" : self.container_size}, "fee_amount")
			
			if self.cargo_type != 'Container':
				wfee = frappe.db.get_value("Wharfage Fee", {"cargo_type" : self.cargo_type}, "fee_amount")

		self.wharfage_fee = wfee
#		if free_days < working_days:
#			charge_days = working_days - free_days
#		elif free_days >= working_days:
#			charge_days = 0
		charge_days = 0
		item_name = frappe.db.get_value("Storage Fee", {"cargo_type" : self.cargo_type, "container_size" : self.container_size, "container_content" : self.container_content}, "item_name")
		vals = frappe.db.get_value("Item", item_name, ["description", "standard_rate", "income_account"], as_dict=True)

		if flt(free_days) < flt(working_days):
			charge_days = flt(working_days) - flt(free_days)

		storagefee = flt(charge_days) * flt(vals.standard_rate)


		self.storage_fee = storagefee
		self.charge_days = charge_days
		self.free_days = free_days
		self.storage_days = working_days
		self.storage_rate = vals.standard_rate
		
		#frappe.throw(_("Charge Days : {0} Free Days {1} Working Days {2} Rate {3} Storate Fee {4}").format(charge_days, free_days, working_days, vals.standard_rate, storagefee))

#		return storagefee
