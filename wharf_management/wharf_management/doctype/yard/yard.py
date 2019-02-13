# -*- coding: utf-8 -*-
# Copyright (c) 2017, Caitlah Technology and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe import msgprint, _, scrub
from frappe import throw, _
from frappe.model.document import Document
from frappe.utils import formatdate
from datetime import datetime

class Yard(Document):

	def validate(self):
		self.update_yard_slot()
		self.update_export_status()
		self.validate_yard_slot()

	def on_submit(self):
		self.update_yard_timestamp()
		self.create_cargo_list_items()


	def validate_yard_slot(self):
		if not self.yard_slot:
			msgprint(_("Yard Slot is Manadory").format(self.yard_slot), raise_exception=1)

	def update_yard_slot(self):
		if self.status != 'Export':
			frappe.db.sql("""Update `tabPre Advice` set yard_slot=%s, yard_status="Closed", status='Transfer' where name=%s""", (self.yard_slot, self.cargo_ref))

	def update_export_status(self):
		if self.status == 'Export':
			frappe.db.sql("""Update `tabPre Advice` set export_status="Yard", yard_slot=%s, gate1_status="Open", gate2_status="Open", payment_status="Open", yard_status="Open", inspection_status="Open" where name=%s""", (self.yard_slot, self.cargo_ref))

	def update_yard_timestamp(self):
		if not self.yard_time_stamp:
			self.yard_time_stamp = self.modified

			self.status = "Yard"
	

	def create_cargo_list_items(self):
		val = frappe.db.get_value("Pre Advice", {"name": self.cargo_ref}, ["booking_ref","pat_code","net_weight","cargo_type","qty","container_no","voyage_no","bol","work_type","secondary_work_type","pol","agents","commodity_code","vessel","pod","temperature",
		"container_type","mark","final_dest_port","volume","container_size","consignee","container_content","stowage","hazardous","hazardous_code",
		"status","seal_1","seal_2","eta_date","cargo_description","etd_date","chasis_no","yard_slot","inspection_status","yard_status","final_status",
		"break_bulk_item_count","security_item_count"], as_dict=True)
		
		doc = frappe.new_doc("Cargo")
		doc.update({
	#				"company" : self.company,
					"docstatus" : 1,
					"booking_ref" : val.booking_ref,
					"pat_code" : val.pat_code,
					"net_weight" : val.net_weight,
		#			"export_status" : self.export_status,
					"cargo_type" : val.cargo_type,
		#			"pre_advise_status" : self.pre_advise_status,
					"qty" : val.qty,
					"container_no" : val.container_no,
					"voyage_no" : val.voyage_no,
					"bol" : val.bol,
					"work_type" : val.work_type,
					"secondary_work_type" : val.secondary_work_type,
		#			"third_work_type" : self.third_work_type,
					"pol" : val.pol,
					"agents" : val.agents,
					"commodity_code" : val.commodity_code,
					"vessel" : val.vessel,
					"pod" : val.pod,
					"temperature" : val.temperature,
					"container_type" : val.container_type,
					"mark" : val.mark,
					"final_dest_port" : val.final_dest_port,
					"volume" : val.volume,
		#			"export_arrival_date" : self.export_arrival_date,
					"container_size" : val.container_size,
					"consignee" : val.consignee,
					"container_content" : val.container_content,
					"stowage" : val.stowage,
					"hazardous" : val.hazardous,
					"hazardous_code" : val.hazardous_code,
					"status" : "Yard",
					"seal_1" : val.seal_1,
					"seal_2" : val.seal_2,
					"eta_date" : val.eta_date,
					"cargo_description" : val.cargo_description,
					"etd_date" : val.etd_date,
					"chasis_no" : val.chasis_no,
					"yard_slot" : val.yard_slot,
					"inspection_status" : val.inspection_status,
					"yard_status" : val.yard_status,
					"final_status" : val.final_status,
					"break_bulk_item_count" : val.break_bulk_item_count,
					"security_item_count" : val.security_item_count
				})
		doc.insert()
		doc.submit()