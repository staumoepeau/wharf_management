# -*- coding: utf-8 -*-
# Copyright (c) 2020, Sione Taumoepeau and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document
from frappe import _
from frappe.utils import cstr, flt, fmt_money, formatdate, now
from wharf_management.wharf_management.utils import update_main_gate_status, update_gate1_status


class WharfAccess(Document):
    def on_submit(self):
        self.validate_log_type()
        self.validate_access_type()
        self.validate_reason()

        if self.drop_or_pickup == "Drop":
            self.validate_drop()
        if self.drop_or_pickup == "Custom Inspection":
            self.validate_custom_inspection_pickup()
        if self.drop_or_pickup == "Pickup":
            self.validate_cargo_pickup()

    def validate(self):
        self.validate_duplicate_log()
		

    def validate_log_type(self):
	    if not self.log_type:
    			frappe.throw(_('Require Log IN or OUT'))
    
    def validate_reason(self):
        if self.log_type == "IN":
            if not self.log_type:
                frappe.throw(_('Require a Reason for Entering the Restricted Area'))

    def validate_access_type(self):
        if not self.access_type:
            frappe.throw(_('Require Access Type'))

    
    def validate_duplicate_log(self):
        doc = frappe.db.exists('Wharf Access', {
			'customer_id': self.customer_id,
			'check_in_out_time': self.check_in_out_time,
			'name': ['!=', self.name]})
        if doc:
            doc_link = frappe.get_desk_link('Wharf Access', doc)
            frappe.throw(_('This person already has a log with the same timestamp.{0}')
				.format("<Br>" + doc_link))

    def validate_drop(self):
        if self.drop_or_pickup == "Drop":
            export_table = frappe.db.sql("""SELECT cargo_ref
			FROM `tabExport Cargo Table Drop`
			WHERE parent = %s """,(self.name), as_dict=1)

            for e in export_table:
                val = frappe.db.get_value("Export", {"name": e.cargo_ref}, ["name","status","cargo_type","container_no","agents","container_type","container_size","container_content","cargo_description"], as_dict=True)
                update_main_gate_status(val.name, self.license_plate, self.customer_full_name)

                update_gate1_status(val.name)
    
    def validate_custom_inspection_pickup(self):
        if self.drop_or_pickup == "Custom Inspection":
            custom_inspection_table = frappe.db.sql("""SELECT cargo_ref
			FROM `tabCargo Inspection Pickup`
			WHERE parent = %s """,(self.name), as_dict=1)

            for c in custom_inspection_table:
                 frappe.db.sql("""UPDATE `tabCargo` SET status='Inspection Delivered', yard_slot='', custom_inspection_deliver='Closed', custom_inspection_deliver_date=%s WHERE name=%s""", (now(), c.cargo_ref))
    
    def validate_cargo_pickup(self):
        if self.drop_or_pickup == "Pickup":
            cargo_table = frappe.db.sql("""SELECT cargo_ref
			FROM `tabCargo Pickup`
			WHERE parent = %s """,(self.name), as_dict=1)

            for c in cargo_table:
                 frappe.db.sql("""UPDATE `tabCargo` SET status='Inspection Delivered', yard_slot='', custom_inspection_deliver='Closed', custom_inspection_deliver_date=%s WHERE name=%s""", (now(), c.cargo_ref))

#                val = frappe.db.get_value("Cargo", {"name": e.cargo_ref}, ["name","status","cargo_type","container_no","agents","container_type","container_size","container_content","cargo_description"], as_dict=True)
#                update_main_gate_status(val.name, self.license_plate, self.customer_full_name)

#                update_gate1_status(val.name)