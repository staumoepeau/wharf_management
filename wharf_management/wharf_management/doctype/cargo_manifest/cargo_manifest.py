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


		def create_manifest_list(self):
			self.create_list()
			condition = ""
			cargo_list = frappe.db.sql("""select cargo_refrence, container_no, bol, cargo_type, work_type, container_content, status, voyage_no, booking_ref
				from `tabCargo Table` where parent = %s {0}""".format(condition), (self.name), as_dict=1)

			entries = sorted(list(cargo_list),
				key=lambda k: k['booking_ref'])

			self.set('cagro_list', [])

			for d in entries:
				row = self.append('cargo_list', {})



		def create_list(self):
			frappe.db.sql("""Insert into `tabCargo Table` (name, parent, parentfield, parenttype, cargo_refrence, container_no, bol, cargo_type,
			work_type, container_content, status, voyage_no, booking_ref) select
			concat(container_no, '-',booking_ref), %s, %s, %s, name, container_no, bol, cargo_type,
			work_type, container_contents, status, voyage_no, booking_ref
			from `tabCargo` where booking_ref = %s""",(self.name, "cargo_list", "Cargo Manifest", self.booking_ref))


		def create_manifest_summary_list(self):
			condition = ""
			manifest_summary_table = frappe.db.sql("""select count(*)
				from `tabCargo` where booking_ref = %s group by pat_code""", (self.booking_ref))

			entries = sorted(list(manifest_summary_table))

			self.set('manifest_summary_table', [])

			for d in entries:
				row = self.append('manifest_summary_table', {})

#@frappe.whitelist()
#def get_child_table(doc):
#	doc_a = frappe.get_doc("Cargo",doc)
#	list1 = []
#	for t in doc_a.get("manifest_table"):
#		list1.append({
#					'cargo_refrence':t.cargo_refrence,
#					'container_no':t.container_no
#					})
#	return list1