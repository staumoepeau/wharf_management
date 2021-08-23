# -*- coding: utf-8 -*-
# Copyright (c) 2017, Caitlah Technology and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe, json
from frappe.utils import cstr, flt, fmt_money, formatdate
from frappe import msgprint, _, scrub
from frappe.model.document import Document


class CargoManifest(Document):

	def validate(self):
		if not self.booking_ref:
			frappe.msgprint(_("Please Check Booking Ref"))

#		def on_submit(self):
#			self.update_cargo_table()


#		def update_cargo_table(self):
#			frappe.db.sql("""Update `tabCargo` set vessel = %s, voyage_no = %s where parent = %s""", (self.vessel, self.voyage_no, self.name))
#			frappe.db.sql("""Update `tabCargo` set status='Unknown' where parent = %s""", (self.name))

@frappe.whitelist()
def get_manifest(booking_ref):	
	return frappe.db.sql("""SELECT name as cargo_refrence, container_no, bol, cargo_type, chasis_no, mark,
	work_type, container_size, container_content, status, voyage_no, booking_ref, storage_fee, handling_fee, manifest_check 
	FROM `tabCargo` 
	WHERE booking_ref = %s 
	AND docstatus = 1
	AND manifest_check = 'Confirm'""",(booking_ref), as_dict=1)

@frappe.whitelist()
def get_manifest_summary_list(booking_ref):
			
	return frappe.db.sql("""SELECT cargo_type, work_type, container_size, container_content, handling_fee_discount, 
	sum(handling_fee) as handling_fee, sum(storage_fee) as storage_fee, sum(wharfage_fee) as wharfage_fee, count(name) as number 
	FROM `tabCargo` 
	WHERE booking_ref = %s 
	AND manifest_check="Confirm" 
	AND cargo_type in ("Container","Split Ports","Petrolium","Tank Tainers") 
	GROUP BY work_type, cargo_type, container_content, container_size, handling_fee_discount""", (booking_ref), as_dict=1)

@frappe.whitelist()
def get_bbulks_summary_list(booking_ref):
	return frappe.db.sql("""SELECT cargo_type, work_type, count(name) as number, 
	sum(net_weight) as weight, sum(volume) as volume, sum(handling_fee) as handling_fee, 
	sum(storage_fee) as storage_fee, sum(wharfage_fee) as wharfage_fee 
	FROM `tabCargo` 
	WHERE booking_ref = %s
	AND cargo_type in ("Break Bulk","Loose Cargo","Vehicles","Heavy Vehicles") 
	AND docstatus = 1
	AND manifest_check="Confirm" 
	GROUP BY cargo_type, work_type""", (booking_ref), as_dict=1)
