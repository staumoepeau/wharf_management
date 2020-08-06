# -*- coding: utf-8 -*-
# Copyright (c) 2017, Caitlah Technology and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe, json
from frappe.utils import cstr, flt, fmt_money, formatdate
from frappe import msgprint, _, scrub
from frappe.model.document import Document
from erpnext.controllers.accounts_controller import AccountsController
from erpnext.accounts.party import get_party_account


class CargoManifest(Document):

	#	def validate(self):
	#		self.cretate_manifest_list()

#		def on_submit(self):
#			self.update_cargo_table()


#		def update_cargo_table(self):
#			frappe.db.sql("""Update `tabCargo` set vessel = %s, voyage_no = %s where parent = %s""", (self.vessel, self.voyage_no, self.name))
#			frappe.db.sql("""Update `tabCargo` set status='Unknown' where parent = %s""", (self.name))


		def get_manifest(self):
		
			manifest_entries = frappe.db.sql("""select name as cargo_refrence, container_no, bol, cargo_type,
			work_type, container_size, container_content, status, voyage_no, booking_ref, storage_fee, handling_fee, manifest_check from `tabCargo` where booking_ref = %s and manifest_check='Confirm'""",(self.booking_ref), as_dict=1)

#			manifest_entries = sorted(list(cargo_manifest_table))

			self.set('cargo_manifest_table', [])

			for f in manifest_entries:
				row = self.append('cargo_manifest_table', {
					'container_size':f.container_size,
					'container_no':f.container_no,
					'cargo_type':f.cargo_type,
					'work_type':f.work_type,
					'container_content':f.container_content,
					'status':f.status,
					'container_size':f.container_size,
					'voyage_no':f.voyage_no,
					'handling_fee' : f.handling_fee,
					'storage_fee' : f.storage_fee,
					'manifest_check': f.manifest_check,
					'booking_ref':f.booking_ref,
					'cargo_refrence': f.cargo_refrence
					
				})


		def get_manifest_summary_list(self):
			
#			manifest_summary_table = frappe.db.sql("""select cargo_type, container_content, work_type, container_size, count(name) as container
#				from `tabCargo` where cargo_type = "Container" and booking_ref = %s and final_status in ("Discharged","Loading") group by work_type, container_content, container_size""", (self.booking_ref), as_dict=1)
			entries = frappe.db.sql("""select cargo_type, work_type, container_size, container_content, handling_fee_discount, sum(handling_fee) as handling_fee, sum(storage_fee) as storage_fee, sum(wharfage_fee) as wharfage_fee, count(name) as number from `tabCargo` 
			 where booking_ref = %s and manifest_check="Confirm" and cargo_type in ("Container","Split Ports","Petrolium","Tank Tainers") group by work_type, cargo_type, container_content, container_size, handling_fee_discount""", (self.booking_ref), as_dict=1)
#			entries = sorted(list(manifest_summary_table))

			self.set('manifest_summary_table', [])

			for d in entries:
				row = self.append('manifest_summary_table', {
					'cargo_type': d.cargo_type,
					'container_content': d.container_content,
					'work_type': d.work_type,
					'container_size': d.container_size,
					'handling_fee_discount': d.handling_fee_discount,
					'number' : d.number,
					'handling_fee':d.handling_fee,
					'storage_fee' : d.storage_fee,
					'wharfage_fee' : d.wharfage_fee
				})
			
		def get_bbulks_summary_list(self):
			
			bbulks_entries = frappe.db.sql("""select cargo_type, work_type, count(name) as number, sum(net_weight) as weight, sum(volume) as volume, sum(handling_fee) as handling_fee, sum(storage_fee) as storage_fee, sum(wharfage_fee) as wharfage_fee from `tabCargo` where cargo_type in ("Break Bulk","Loose Cargo","Vehicles","Heavy Vehicles") and booking_ref = %s and manifest_check="Confirm" group by cargo_type, work_type""", (self.booking_ref), as_dict=1)

#			bbulks_entries = sorted(list(bbulks_summary_table))

			self.set('bbulks_summary_table', [])

			for b in bbulks_entries:
				row = self.append('bbulks_summary_table', {
					'cargo_type': b.cargo_type,
					'work_type': b.work_type,
					'number' : b.number,
					'weight':b.weight,
					'volume':b.volume,
					'handling_fee':b.handling_fee,
					'storage_fee' : b.storage_fee,
					'wharfage_fee' : b.wharfage_fee
				})
