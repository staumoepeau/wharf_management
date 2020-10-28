# -*- coding: utf-8 -*-
# Copyright (c) 2017, Sione Taumoepeau and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe, os, json
from frappe import throw, _
from frappe.model.document import Document
import datetime
from frappe.utils.user import get_user_fullname
from frappe.utils import cstr, formatdate, cint, getdate, date_diff, add_days, now

class Export(Document):
    pass
#	def validate(self):
#		self.validate_status()
#		self.check_cargo_type()
	
#	def on_submit(self):
#		if self.paid_status == "Paid":
#			self.create_sales_invoices_paid()
	

#	def validate_status(self):
#		if self.paid_status == "Paid" and not self.container_content and self.cargo_type in ["Tank Tainers", "Container", "Flatrack"]:
#			frappe.throw(_("Please make sure that Container Content is FULL or EMPTY"))
	
#	def check_cargo_type(self):
#		if self.cargo_type not in ["Tank Tainers", "Container", "Flatrack"]:
#			if not self.volume:
#				frappe.throw(_("Please make sure to input the Volume Value"))
#			if not self.weight:
#				frappe.throw(_("Please make sure to input the Weight Value"))
				
#	def create_sales_invoices_paid(self):

#		if self.cargo_type in ["Tank Tainers", "Container", "Flatrack"]:
#			item = frappe.db.get_value("Wharfage Fee", {"cargo_type" : self.cargo_type, "container_size" : self.container_size}, "item_name")
#			dc = frappe.db.get_value("Item", item, ["description", "standard_rate"], as_dict=True)
#		
#		if self.cargo_type not in ["Tank Tainers", "Container", "Flatrack"]:
#			item = frappe.db.get_value("Wharfage Fee", {"cargo_type" : self.cargo_type}, "item_name")
#			dc = frappe.db.get_value("Item", item, ["description", "standard_rate"], as_dict=True)
#
#		doc = frappe.new_doc("Sales Invoice")
#		doc.customer = self.customer
##		doc.export_ref = self.name
#		doc.is_pos = True
#		doc.status = "Paid"

#		doc.paid_amount = self.total_fee
#		doc.base_paid_amount = self.total_fee
#		doc.outstanding_amount = 0
#		payments = doc.append('payments', {
#		'mode_of_payment': self.payment_method,
#		'amount' : self.total_fee
#		})

#		item = doc.append('items', {
#		'item_code' : item,
#		'item_name' : item,
#		'description' : dc.description,
#		'rate' : dc.standard_rate,
#		'qty' : 1
#		})

#		if self.apply_vgm_fee:
#			item = doc.append('items', {
#			'item_name' : "VGM",
#			'description' : "VGM Fee",
#			'rate' : self.vgm_fee,
#			'qty' : 1
#			})
			
#		doc.save(ignore_permissions=True)
#		doc.submit()


#	def insert_fees(self):
#		vgm_fee=0

#		if self.apply_wharfage_fee == 1:
#			if self.cargo_type in ["Tank Tainers", "Container", "Flatrack"]:
#				qty = 1
#				item_name = frappe.db.get_value("Wharfage Fee", {"cargo_type" : self.cargo_type, "container_size" : self.container_size}, "item_name")
#				val = frappe.db.get_value("Item", item_name, ["description", "standard_rate"], as_dict=True)

#			if self.cargo_type not in ["Tank Tainers", "Container", "Flatrack"]:
#				qty = self.volume
#				item_name = frappe.db.get_value("Wharfage Fee", {"cargo_type" : self.cargo_type}, "item_name")
#				val = frappe.db.get_value("Item", item_name, ["description", "standard_rate"], as_dict=True)
				
#			self.append("fees_table", { 
#				"item": item_name,
#				"description": val.description,
#				"price": val.standard_rate,
#				"qty": qty,
#				"total" : (qty * val.standard_rate)
#			})
		
#		if self.apply_vgm_fee == 1:
			
#			if self.cargo_type in ["Tank Tainers", "Container", "Flatrack"]:
#				if self.container_size == "20":
#					vgm_fee = 77.05
#				if self.container_size == "40":
#					vgm_fee = (77.05 * 2)
#			if self.cargo_type not in ["Tank Tainers", "Container", "Flatrack"]:
#				vgm_fee = 0
			
#			self.append('fees_table', {
#			'item' : "VGM",
#			'item_name' : "VGM",
#			'description' : "VGM Fee",
#			'price' : vgm_fee,
#			'qty' : 1,
#			'total' : (1 * vgm_fee)
#			})

#		self.total_fee = ((qty * val.standard_rate) + (1 * vgm_fee))

@frappe.whitelist()
def update_main_gate_status(name_ref, truck_licenses_plate, drivers_information):
    full_name = get_user_fullname(frappe.session['user'])
    frappe.db.sql("""UPDATE `tabExport` SET truck_licenses_plate=%s, drivers_information=%s, main_gate_status="Closed", 
                    main_gate_date =%s, status="Main Gate IN", main_gate_created_by=%s, main_gate_user_name=%s
                    WHERE name=%s""", (truck_licenses_plate, drivers_information, now(), frappe.session.user, full_name, name_ref))
    
    val = frappe.db.get_value("Export", {"name": name_ref}, ["name","cargo_type","container_no","agents","container_type","container_size","container_content","cargo_description"], as_dict=True)
	
    if not val.cargo_type:
        if val.container_content == "EMPTY" or val.container_content == "FULL":
            val.cargo_type == "Container"

    doc = frappe.new_doc("Cargo Movement")
    doc.update({
			"docstatus" : 1,
			"cargo_type" : val.cargo_type,
			"container_no" : val.container_no,
			"agents" : val.agents,
			"container_type" : val.container_type,
			"container_size" : val.container_size,
			"consignee" : val.consignee,
			"main_gate_content" : val.container_content,
			"cargo_description" : val.cargo_description,
			"main_gate_status" : "IN",
			"main_gate_date" : now(),
			"main_gate_time" : now(),
			"truck" : truck_licenses_plate,
			"truck_driver" : drivers_information,
			"refrence": val.name
			})
    doc.insert()
    doc.submit()

@frappe.whitelist()
def update_gate1_status(name_ref):
    full_name = get_user_fullname(frappe.session['user'])
    frappe.db.sql("""UPDATE `tabExport` SET export_gate1_status="Closed", export_gate1_date =%s, status="Gate1 IN",
                    gate1_created_by=%s, gate1_user_name=%s
                    WHERE name=%s""", (now(), frappe.session.user, full_name, name_ref))

    val = frappe.db.get_value("Export", {"name": name_ref}, ["name","container_content"], as_dict=True)
    frappe.db.sql("""Update `tabCargo Movement` set gate_status='IN', container_content=%s, movement_date=%s, gate1_time=%s where refrence=%s""", 
    (val.container_content, now(), now(), name_ref))