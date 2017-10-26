# -*- coding: utf-8 -*-
# Copyright (c) 2017, Sione Taumoepeau and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe import _, msgprint, throw
from frappe.model.document import Document

class PreAdvice(Document):


	def on_submit(self):
		self.create_cargo_list_items()
	
	def create_cargo_list_items(self):
#		user = frappe.get_doc("Agents", self.transfer_from_agent)
		doc = frappe.new_doc("Cargo")
		doc.update({
					"company" : self.company,
					"docstatus" : 1,
					"booking_ref" : self.booking_ref,
					"pat_code" : self.pat_code,
					"net_weight" : self.net_weight,
		#			"export_status" : self.export_status,
					"cargo_type" : self.cargo_type,
		#			"pre_advise_status" : self.pre_advise_status,
					"qty" : self.qty,
					"container_no" : self.container_no,
					"voyage_no" : self.voyage_no,
					"bol" : self.bol,
					"work_type" : self.work_type,
					"secondary_work_type" : self.secondary_work_type,
					"third_work_type" : self.third_work_type,
					"pol" : self.pol,
					"agents" : self.agents,
					"commodity_code" : self.commodity_code,
					"vessel" : self.vessel,
					"pod" : self.pod,
					"temperature" : self.temperature,
					"container_type" : self.container_type,
					"mark" : self.mark,
					"final_dest_port" : self.final_dest_port,
					"volume" : self.volume,
		#			"export_arrival_date" : self.export_arrival_date,
					"container_size" : self.container_size,
					"consignee" : self.consignee,
					"container_content" : self.container_content,
					"stowage" : self.stowage,
					"hazardous" : self.hazardous,
					"hazardous_code" : self.hazardous_code,
					"status" : self.status,
					"seal_1" : self.seal_1,
					"seal_2" : self.seal_2,
					"eta_date" : self.eta_date,
					"cargo_description" : self.cargo_description,
					"etd_date" : self.etd_date,
					"chasis_no" : self.chasis_no,
					"yard_slot" : self.yard_slot
				})
		doc.insert()
		doc.submit()
