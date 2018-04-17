# -*- coding: utf-8 -*-
# Copyright (c) 2017, Caitlah Technology and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe, erpnext, json
from frappe import msgprint, _, scrub
from frappe.model.document import Document

class Inspection(Document):

	def validate(self):
    		
		self.validate_work_type()	
		self.validate_crane_no()

	def on_submit(self):

#		self.check_duplicate_entries()
		if self.final_work_type == "Discharged" and self.secondary_work_type == "Devanning" and self.third_work_type == "Stock":
#			self.create_empty_container()
			self.create_cargo_devanning()
			self.create_empty_on_cargo()
			self.update_final_status_devanning()
		
		if self.final_work_type == "Discharged" and self.secondary_work_type == "Devanning" and self.third_work_type == "Loading":	
			self.create_cargo_devanning()
			self.create_pre_advice_loading_empty()
			self.update_final_status_devanning()
#			self.update_inspection_status_pre_advice()

#		if self.final_work_type == "Discharged" and self.secondary_work_type == "Devanning":
#			self.update_final_status_devanning()
#			self.create_cargo_list_items()
			
		if self.final_work_type == "Discharged" and self.secondary_work_type == "Transhipment" and not self.third_work_type:
			self.create_cargo()
			self.create_transhipment_cargo()

		if self.final_work_type == "Discharged" and self.secondary_work_type == "Re-stowing" and not self.third_work_type:
			self.update_status()

		if self.final_work_type == "Devanning" and not self.secondary_work_type and not self.third_work_type:
			self.update_inspection_status()

		if self.final_work_type == "Loading" and not self.secondary_work_type and not self.third_work_type:
#			value = frappe.db.get_value("Export", {"container_no": self.container_no}, ["gate1_start"])
			self.create_cargo_item()
			self.update_final_status()
			self.check_empty_container()
			self.load_transhipment_cargo()

		if self.final_work_type == "Re-stowing" and not self.secondary_work_type and not self.third_work_type:
			self.create_cargo()
			self.update_final_status()
		
		if self.final_work_type == "Stock" and not self.secondary_work_type and not self.third_work_type:
			self.create_empty_on_cargo()

		if self.final_work_type == "Discharged" and not self.secondary_work_type and not self.third_work_type:
			self.update_inspection_status()


#	def check_duplicate_entries(self):
#		check_duplicate = None
#		check_duplicate = frappe.db.sql("""Select name, count(*) from `tabInspection` where cargo_ref=%s and container_no=%s """, (self.cargo_ref, self.container_no))
		
#		if check_duplicate > 1:
#			frappe.throw(_("Please You are duplicating this container no : {0} ").format(check_duplicate))
		
	def validate_work_type(self):
		if not self.final_work_type:
			msgprint(_("Work Type is Manadory").format(self.final_work_type),
					raise_exception=1)

	def validate_crane_no(self):
    		if not self.crane_no:
				msgprint(_("Crane No is Manadory").format(self.crane_no),
						raise_exception=1)

	def update_inspection_status(self):
    		if self.qty > 1:
    				frappe.db.sql("""Update `tabPre Advice` set break_bulk_item_count=1, inspection_status="Closed", final_status="Discharged", status="Inspection", image_01=%s, inspection_comment=%s where name=%s""", (self.file_attach, self.cargo_condition, self.cargo_ref))
		if self.qty == 1:
    			frappe.db.sql("""Update `tabPre Advice` set inspection_status="Closed", final_status="Discharged", status="Inspection", image_01=%s, inspection_comment=%s where name=%s""", (self.file_attach, self.cargo_condition, self.cargo_ref))
		if self.qty == 0:
    			frappe.db.sql("""Update `tabPre Advice` set inspection_status="Closed", final_status="Discharged", status="Inspection", image_01=%s, inspection_comment=%s where name=%s""", (self.file_attach, self.cargo_condition, self.cargo_ref))
	
	def update_status(self):
		self.create_cargo()
		self.create_restow_pre_advice_items()
    		frappe.db.sql("""Update `tabPre Advice` set inspection_status="Closed", yard_status="Closed", payment_status="Closed", gate1_status="Closed", gate2_status="Closed", final_status="Re-stowing", status="Transfer" where name=%s""", (self.cargo_ref))


	def update_final_status(self):
		frappe.db.sql("""Update `tabPre Advice` set status="Transfer", inspection_status="Closed", yard_status="Closed", payment_status="Closed", gate1_status="Closed", gate2_status="Closed", final_status=%s where name=%s""", (self.final_work_type, self.cargo_ref))
	
	def update_final_status_devanning(self):
		frappe.db.sql("""Update `tabPre Advice` set inspection_status="Closed", yard_status="Closed", payment_status="Closed", gate1_status="Closed", gate2_status="Closed", final_status="Discharged", status="Transfer" where name=%s""", (self.cargo_ref))
#		frappe.db.sql("""Update `tabPre Advice` set secondary_work_type="Devanning " where name=%s""", (self.cargo_ref))

	def create_cargo(self):
    		val = frappe.db.get_value("Pre Advice", {"name": self.cargo_ref}, ["booking_ref","pat_code","net_weight","cargo_type","qty",
			"container_no","voyage_no","bol","work_type","secondary_work_type","pol","agents","commodity_code","vessel","pod","temperature",
			"container_type","mark","final_dest_port","volume","container_size","consignee","container_content","stowage","hazardous","hazardous_code",
			"status","seal_1","seal_2","eta_date","cargo_description","etd_date","chasis_no","yard_slot","inspection_status","yard_status","final_status"], as_dict=True)
		
		if self.final_work_type == "Discharged":
			if self.secondary_work_type == "Re-stowing":
				worktype = self.final_work_type
				movement = "Re-stowing"
			elif self.secondary_work_type == "Transhipment":
				worktype = "Transhipment"
				movement = "Transhipment"
		elif self.final_work_type == "Re-stowing":
				worktype = "Re-stowing"
				movement = "Outbound"

		doc = frappe.new_doc("Cargo")
		doc.update({
	#				"company" : self.company,
					"docstatus" : 1,
					"booking_ref" : val.booking_ref,
					"pat_code" : val.pat_code,
					"net_weight" : val.net_weight,
					"cargo_type" : val.cargo_type,
		#			"pre_advise_status" : self.pre_advise_status,
					"qty" : val.qty,
					"container_no" : val.container_no,
					"voyage_no" : val.voyage_no,
					"bol" : val.bol,
					"work_type" : self.final_work_type,
					"secondary_work_type" : worktype,
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
					"container_size" : val.container_size,
					"consignee" : val.consignee,
					"container_content" : val.container_content,
					"stowage" : val.stowage,
					"hazardous" : val.hazardous,
					"hazardous_code" : val.hazardous_code,
					"status" : movement,
					"seal_1" : val.seal_1,
					"seal_2" : val.seal_2,
					"eta_date" : val.eta_date,
					"cargo_description" : val.cargo_description,
					"etd_date" : val.etd_date,
					"chasis_no" : val.chasis_no,
#					"yard_slot" : val.yard_slot,
					"inspection_status" : "Closed",
					"yard_status" : "Closed",
					"final_status" : self.final_work_type,
					"payment_status" : "Closed",
					"gate1_status" : "Closed",
					"gate2_status" : "Closed"
				})
		doc.insert()
		doc.submit()

	def create_transhipment_cargo(self):
    		val = frappe.db.get_value("Pre Advice", {"name": self.cargo_ref}, ["booking_ref","pat_code","net_weight","cargo_type","qty",
			"container_no","voyage_no","bol","work_type","secondary_work_type","pol","agents","commodity_code","vessel","pod","temperature",
			"container_type","mark","final_dest_port","volume","container_size","consignee","container_content","stowage","hazardous","hazardous_code",
			"status","seal_1","seal_2","eta_date","cargo_description","etd_date","chasis_no","yard_slot","inspection_status","yard_status","final_status"], as_dict=True)
		
		doc = frappe.new_doc("Transhipment Cargo")
		doc.update({
	#				"company" : self.company,
					"docstatus" : 1,
					"booking_ref" : val.booking_ref,
					"pat_code" : val.pat_code,
					"net_weight" : val.net_weight,
					"cargo_type" : val.cargo_type,
		#			"pre_advise_status" : self.pre_advise_status,
					"qty" : val.qty,
					"container_no" : val.container_no,
					"voyage_no" : val.voyage_no,
					"bol" : val.bol,
					"work_type" : "Loading",
					"secondary_work_type" : "Transhipment",
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
					"container_size" : val.container_size,
					"consignee" : val.consignee,
					"container_content" : val.container_content,
					"stowage" : val.stowage,
					"hazardous" : val.hazardous,
					"hazardous_code" : val.hazardous_code,
					"status" : "Transhipment",
					"seal_1" : val.seal_1,
					"seal_2" : val.seal_2,
					"eta_date" : val.eta_date,
					"cargo_description" : val.cargo_description,
					"etd_date" : val.etd_date,
					"chasis_no" : val.chasis_no,
#					"yard_slot" : val.yard_slot,
					"inspection_status" : "Closed",
					"yard_status" : "Closed",
					"final_status" : self.final_work_type,
					"payment_status" : "Closed",
					"gate1_status" : "Closed",
					"gate2_status" : "Closed"
				})
		doc.insert()
		doc.submit()
		frappe.db.sql("""Update `tabPre Advice` set inspection_status="Closed", yard_status="Closed", payment_status="Closed", gate1_status="Closed", gate2_status="Closed", final_status="Transhipment", status="Transfer" where name=%s""", (self.cargo_ref))

#	Create EMPTY Container in Cargo for Handling Fee	
	def create_cargo_item(self):
    		val = frappe.db.get_value("Pre Advice", {"name": self.cargo_ref}, ["booking_ref","pat_code","net_weight","cargo_type","qty",
			"container_no","voyage_no","bol","work_type","secondary_work_type","pol","agents","commodity_code","vessel","pod","temperature",
			"container_type","mark","final_dest_port","volume","container_size","consignee","container_content","stowage","hazardous","hazardous_code",
			"status","seal_1","seal_2","eta_date","cargo_description","etd_date","chasis_no","yard_slot","inspection_status","yard_status","final_status"], as_dict=True)
		
#		vals = frappe.db.get_value("Export", {"container_no": self.container_no}, ["gate1_start"], as_dict=True)
		doc = frappe.new_doc("Cargo")
		doc.update({
	#				"company" : self.company,
					"docstatus" : 1,
					"booking_ref" : val.booking_ref,
					"pat_code" : val.pat_code,
					"net_weight" : val.net_weight,
					"cargo_type" : val.cargo_type,
		#			"pre_advise_status" : self.pre_advise_status,
					"qty" : val.qty,
					"container_no" : val.container_no,
					"voyage_no" : val.voyage_no,
					"bol" : val.bol,
					"work_type" : self.final_work_type,
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
					"container_size" : val.container_size,
					"consignee" : val.consignee,
					"container_content" : val.container_content,
					"stowage" : val.stowage,
					"hazardous" : val.hazardous,
					"hazardous_code" : val.hazardous_code,
					"status" : "Outbound",
					"seal_1" : val.seal_1,
					"seal_2" : val.seal_2,
					"eta_date" : val.eta_date,
					"cargo_description" : val.cargo_description,
					"etd_date" : val.etd_date,
					"chasis_no" : val.chasis_no,
#					"yard_slot" : val.yard_slot,
					"inspection_status" : "Closed",
					"yard_status" : "Closed",
					"final_status" : self.final_work_type,
					"payment_status" : "Closed",
					"gate1_status" : "Closed",
					"gate2_status" : "Closed"
				})
		doc.insert()
		doc.submit()

# Create Cargo Devanning Status
	def create_cargo_devanning(self):
    		val = frappe.db.get_value("Pre Advice", {"name": self.cargo_ref}, ["booking_ref","pat_code","net_weight","cargo_type","qty",
			"container_no","voyage_no","bol","work_type","secondary_work_type","pol","agents","commodity_code","vessel","pod","temperature",
			"container_type","mark","final_dest_port","volume","container_size","consignee","container_content","stowage","hazardous","hazardous_code",
			"status","seal_1","seal_2","eta_date","cargo_description","etd_date","chasis_no","yard_slot","inspection_status","yard_status","final_status"], as_dict=True)
		doc = frappe.new_doc("Cargo")
		doc.update({
	#				"company" : self.company,
					"docstatus" : 1,
					"booking_ref" : val.booking_ref,
					"pat_code" : val.pat_code,
					"net_weight" : val.net_weight,
					"cargo_type" : val.cargo_type,
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
					"container_size" : val.container_size,
					"consignee" : val.consignee,
					"container_content" : val.container_content,
					"stowage" : val.stowage,
					"hazardous" : val.hazardous,
					"hazardous_code" : val.hazardous_code,
					"status" : "Devanning",
					"seal_1" : val.seal_1,
					"seal_2" : val.seal_2,
					"eta_date" : val.eta_date,
					"cargo_description" : val.cargo_description,
					"etd_date" : val.etd_date,
					"chasis_no" : val.chasis_no,
					"yard_slot" : val.yard_slot,
					"inspection_status" : "Closed",
					"yard_status" : "Closed",
					"final_status" : "Discharged",
					"payment_status" : "Closed",
					"gate1_status" : "Closed",
					"gate2_status" : "Closed"
				})
		doc.insert()
		doc.submit()
	
	#Create EMPTY Container on Cargo for STOCK
	def create_empty_on_cargo(self):
    		val = frappe.db.get_value("Pre Advice", {"name": self.cargo_ref}, ["booking_ref","pat_code","net_weight","cargo_type","qty",
			"container_no","voyage_no","bol","work_type","secondary_work_type","pol","agents","commodity_code","vessel","pod","temperature",
			"container_type","mark","final_dest_port","volume","container_size","consignee","container_content","stowage","hazardous","hazardous_code",
			"status","seal_1","seal_2","eta_date","cargo_description","etd_date","chasis_no","yard_slot","inspection_status","yard_status","final_status"], as_dict=True)		

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
					"work_type" : "Stock",
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
					"container_content" : "EMPTY",
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
					"yard_slot" : "MTY",
					"inspection_status" : "Closed",
					"yard_status" : "Closed",
					"final_status" : "Discharged",
					"payment_status" : "Open",
					"gate1_status" : "Open",
					"gate2_status" : "Open"
				})
		doc.insert()
		doc.submit()


#	Create EMPTY Container for Loading after Devanning
	def create_pre_advice_loading_empty(self):
    		val = frappe.db.get_value("Pre Advice", {"name": self.cargo_ref}, ["booking_ref","pat_code","net_weight","cargo_type","qty",
			"container_no","voyage_no","bol","work_type","secondary_work_type","pol","agents","commodity_code","vessel","pod","temperature",
			"container_type","mark","final_dest_port","volume","container_size","consignee","container_content","stowage","hazardous","hazardous_code",
			"status","seal_1","seal_2","eta_date","cargo_description","etd_date","chasis_no","yard_slot","inspection_status","yard_status","final_status"], as_dict=True)
		doc = frappe.new_doc("Pre Advice")
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
					"work_type" : "Loading",
		#			"secondary_work_type" : val.secondary_work_type,
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
					"container_content" : "EMPTY",
					"stowage" : val.stowage,
					"hazardous" : val.hazardous,
					"hazardous_code" : val.hazardous_code,
					"status" : "Uploaded",
					"seal_1" : val.seal_1,
					"seal_2" : val.seal_2,
					"eta_date" : val.eta_date,
					"cargo_description" : val.cargo_description,
					"etd_date" : val.etd_date,
					"chasis_no" : val.chasis_no,
					"yard_slot" : val.yard_slot,
					"inspection_status" : "Open"

				})
		doc.insert()
		doc.submit()
	
	def create_restow_pre_advice_items(self):
    		val = frappe.db.get_value("Pre Advice", {"name": self.cargo_ref}, ["booking_ref","pat_code","net_weight","cargo_type","qty",
			"container_no","voyage_no","bol","work_type","secondary_work_type","pol","agents","commodity_code","vessel","pod","temperature",
			"container_type","mark","final_dest_port","volume","container_size","consignee","container_content","stowage","hazardous","hazardous_code",
			"status","seal_1","seal_2","eta_date","cargo_description","etd_date","chasis_no","yard_slot","inspection_status","yard_status","final_status"], as_dict=True)
		doc = frappe.new_doc("Pre Advice")
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
					"work_type" : "Re-stowing",
		#			"secondary_work_type" : val.secondary_work_type,
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
					"container_size" : val.container_size,
					"consignee" : val.consignee,
	#				"container_content" : "EMPTY",
					"stowage" : val.stowage,
					"hazardous" : val.hazardous,
					"hazardous_code" : val.hazardous_code,
					"status" : "Uploaded",
					"seal_1" : val.seal_1,
					"seal_2" : val.seal_2,
					"eta_date" : val.eta_date,
					"cargo_description" : val.cargo_description,
					"etd_date" : val.etd_date,
					"chasis_no" : val.chasis_no,
					"yard_slot" : val.yard_slot,
					"inspection_status" : "Open"

				})
		doc.insert()
		doc.submit()

	def check_empty_container(self):
    		container_number=None
		vals = frappe.db.get_value("Pre Advice", {"container_no": self.container_no, "name" : self.cargo_ref}, ["booking_ref", "name"], as_dict=True)
		container_number = frappe.db.sql("""Select name from `tabExport` where container_no=%s """, (self.container_no))

		if container_number:
    			container_ref = frappe.db.get_value("Export", {"container_no": self.container_no}, "name")
    			val = frappe.db.get_value("Export", {"container_no": self.container_no}, ["yard_slot",
				"main_gate_start","main_gate_ends","gate1_start","gate1_ends","driver_start",
				"container_type","container_size","pat_code","container_content","driver_ends","seal_1"], as_dict=True)

			doc = frappe.new_doc("Export History")
			doc.update({
						"yard_slot" : val.yard_slot,
						"main_gate_start" : val.main_gate_start,
						"main_gate_ends" : val.main_gate_ends,
						"gate1_start": val.gate1_start,
						"gate1_ends" : val.gate1_ends,
						"driver_start" : val.driver_start,
						"driver_ends" : val.driver_ends,
						"container_type" : val.container_type,
						"container_size" : val.container_size,
						"pat_code" : val.pat_code,
						"container_content" : val.container_content,
						"seal_1" : val.seal_1,
						"container_no" : self.container_no
					})
			doc.insert()
			doc.submit()

#			frappe.throw(_("Gate 1 {0}").format(vals.gate1_start))
			frappe.db.sql("""Update `tabPre Advice` set main_gate_start=%s, gate1_start=%s, driver_start=%s where container_no=%s""", (val.main_gate_start, val.gate1_start, val.driver_ends, self.container_no ))
			frappe.db.sql("""Update `tabCargo` set gate1_in=%s, maingate_in=%s where container_no=%s and booking_ref=%s """, (val.gate1_start, val.main_gate_start, self.container_no, vals.booking_ref ))
			frappe.db.sql("""delete from `tabExport` where container_no=%s""", self.container_no)
	
	def load_transhipment_cargo(self):
    		container_number=None
		vals = frappe.db.get_value("Pre Advice", {"container_no": self.container_no, "name" : self.cargo_ref}, ["booking_ref", "name"], as_dict=True)
		container_number = frappe.db.sql("""Select name from `tabTranshipment Cargo` where container_no=%s """, (self.container_no))

		if container_number:
#   			container_ref = frappe.db.get_value("Transhipment Cargo", {"container_no": self.container_no}, "name")
    			val = frappe.db.get_value("Transhipment Cargo", {"container_no": self.container_no}, ["yard_slot",
				"main_gate_start","main_gate_ends","gate1_start","gate1_ends","driver_start",
				"container_type","container_size","pat_code","container_content","driver_ends","seal_1"], as_dict=True)

#			frappe.throw(_("Gate 1 {0}").format(vals.gate1_start))
#			frappe.db.sql("""Update `tabPre Advice` set main_gate_start=%s, gate1_start=%s, driver_start=%s where container_no=%s""", (val.main_gate_start, val.gate1_start, val.driver_ends, self.container_no ))
			frappe.db.sql("""Update `tabCargo` set gate1_in=%s, maingate_in=%s where container_no=%s and booking_ref=%s """, (self.container_no, vals.booking_ref ))
			frappe.db.sql("""delete from `tabTranshipment Cargo` where container_no=%s""", self.container_no)