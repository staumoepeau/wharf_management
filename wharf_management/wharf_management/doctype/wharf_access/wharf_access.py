# -*- coding: utf-8 -*-
# Copyright (c) 2020, Sione Taumoepeau and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe, json
from frappe.model.document import Document
from frappe import msgprint, _, scrub
from frappe.utils import cstr, flt, fmt_money, formatdate, now
from wharf_management.wharf_management.utils import update_main_gate_status, update_gate1_status


class WharfAccess(Document):

    def on_submit(self):
        self.validate_log_type()
        self.validate_access_type()
        self.validate_reason()
        self.update_status()

        if self.drop_or_pickup == "Drop":
            self.validate_export_drop()
        if self.drop_or_pickup == "Pickup MTY":
            self.validate_export_pickup()
        if self.drop_or_pickup == "Custom Inspection":
            self.validate_custom_inspection_pickup()
        if self.drop_or_pickup == "Pickup":
            self.validate_cargo_pickup()
            self.update_movement_status()
        

    def validate(self):
        self.validate_duplicate_log()
		

    def validate_log_type(self):
	    if not self.log_type:
    			frappe.throw(_('Require Log IN or OUT'))
    
    def validate_reason(self):
        if self.log_type == "IN":
            if not self.reason:
                frappe.throw(_('Require a Reason for Entering the Restricted Area'))

    def validate_access_type(self):
        if not self.access_type:
            frappe.throw(_('Require Access Type'))

    def update_status(self):
        if self.log_type == "IN":
            frappe.db.sql("""UPDATE `tabWharf Access` SET access_status='IN' WHERE name=%s""", (self.name))
        
        if self.log_type == "OUT":
            frappe.db.sql("""UPDATE `tabWharf Access` SET access_status='OUT' WHERE name=%s""", (self.access_ref))
            frappe.db.sql("""UPDATE `tabWharf Access` SET access_status='OUT' WHERE name=%s""", (self.name))
        
    def validate_duplicate_log(self):
        doc = frappe.db.exists('Wharf Access', {
			'customer_id': self.customer_id,
			'check_in_out_time': self.check_in_out_time,
			'name': ['!=', self.name]})
#        if doc:
#            doc_link = frappe.get_desk_link('Wharf Access', doc)
#            frappe.throw(_('This person already has a log with the same timestamp.{0}')
#				.format("<Br>" + doc_link))

    def validate_export_drop(self):
        if self.drop_or_pickup == "Drop":
            export_table = frappe.db.sql("""SELECT cargo_ref
			FROM `tabExport Cargo Table Drop`
			WHERE parent = %s """,(self.name), as_dict=1)

            for e in export_table:
                val = frappe.db.get_value("Export", {"name": e.cargo_ref}, ["name","status","cargo_type","container_no","agents","container_type","container_size","container_content","cargo_description"], as_dict=True)
                update_main_gate_status(val.name, self.license_plate, self.customer_full_name)

                update_gate1_status(val.name)
    
    def validate_export_pickup(self):
        if self.drop_or_pickup == "Pickup MTY":
            export_table = frappe.db.sql("""SELECT cargo_ref
			FROM `tabExport Cargo Table Drop`
			WHERE parent = %s """,(self.name), as_dict=1)

            for e in export_table:
                val = frappe.db.get_value("Export", {"name": e.cargo_ref}, ["name", "yard_slot","container_no",
                "main_gate_start","main_gate_ends","gate1_start","gate1_ends","driver_start",
                "container_type","container_size","pat_code","container_content","driver_ends","seal_1", "status"], as_dict=True)

                update_main_gate_status(val.name, self.license_plate, self.customer_full_name)

                update_gate1_status(val.name)

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
                        "container_no" : val.container_no
                        })
                doc.insert(ignore_permissions=True)
                doc.submit()

                frappe.db.delete('Export', {"container_no": val.container_no})
    
    def validate_custom_inspection_pickup(self):
        if self.drop_or_pickup == "Custom Inspection":
            custom_inspection_table = frappe.db.sql("""SELECT cargo_ref
			FROM `tabCargo Inspection Pickup`
			WHERE parent = %s """,(self.name), as_dict=1)

            for c in custom_inspection_table:
                 frappe.db.sql("""UPDATE `tabCargo` SET status='Inspection Delivered', yard_slot='', custom_inspection_deliver='Closed', custom_inspection_deliver_date=%s WHERE name=%s""", (now(), c.cargo_ref))
    
    def validate_cargo_pickup(self):
        if self.drop_or_pickup == "Pickup":

            cargo_table = frappe.db.sql("""SELECT pickup_cargo_ref
			FROM `tabCargo Pickup`
			WHERE parent = %s """,(self.name), as_dict=1)
            
            for c in cargo_table:
                val = frappe.db.get_value("Cargo", {"name": c.pickup_cargo_ref}, ["name","status","cargo_type","container_no","agents","consignee","eta_date", "etd_date",
                "container_type","container_size","container_content","cargo_description", "pat_code","work_type","custom_warrant"], as_dict=1)
           
                doc = frappe.new_doc("Cargo Movement")
                doc.update({
                    "docstatus" : 1,
                    "pat_code" : val.pat_code,
                    "cargo_type" : val.cargo_type,
                    "container_no" : val.container_no,
                    "work_type" : val.work_type,
                    "agents" : val.agents,
                    "container_type" : val.container_type,
                    "container_size" : val.container_size,
                    "consignee" : val.consignee,
                    "container_content" : val.container_content,
                    "cargo_description" : val.cargo_description,
                    "gate_status" : "OUT",
                    "movement_date" : now(),
                    "gate1_time" : now(),
                    "truck" : self.license_plate,
                    "truck_driver" : self.customer_full_name,
                    "refrence": c.pickup_cargo_ref,
                    "warrant_number" : val.custom_warrant
                    "eta_date" : val.eta_date,
                    "etd_date" : val.etd_date,
                    "refrence": val.name
                    })
                doc.insert(ignore_permissions=True)
                doc.submit()
    
    def update_movement_status(self):

        cargo_table = frappe.db.sql("""SELECT pickup_cargo_ref, item_counter, qty, item_counter, security_item_count
			FROM `tabCargo Pickup`
			WHERE parent = %s """,(self.name), as_dict=1)
            
        for c in cargo_table:
            val = frappe.db.get_value("Cargo", {"name": c.pickup_cargo_ref}, ["name","status","cargo_type","container_no","agents","consignee", "yard_slot","security_item_count",
            "container_type","container_size","container_content","cargo_description", "pat_code","work_type","custom_warrant",'qty'], as_dict=1)
           
            yardslot = None

            counter = val.security_item_count + c.security_item_count

            if val.cargo_type in ["Tank Tainers", "Container", "Flatrack", "Split Ports", "Vehicles", "Heavy Vehicles", "Petrolium"]:
                if val.yard_slot:
                    frappe.db.set_value('Yard Settings', val.yard_slot, 'occupy', 0)
                frappe.db.sql("""Update `tabCargo` set gate1_status="Closed", gate1_date=%s, status="Gate1", yard_slot=%s where name=%s""", (now(), yardslot, c.pickup_cargo_ref))

            if val.cargo_type in ["Loose Cargo", "Break Bulk"]:
                if c.qty > counter:
                    if val.yard_slot:
                        frappe.db.set_value('Yard Settings', val.yard_slot, 'occupy', 0)
                    frappe.db.sql("""Update `tabCargo` set security_item_count=%s, gate1_date=%s where name=%s""", (counter, now(), c.pickup_cargo_ref))
                
                if c.qty == counter:
                    if val.yard_slot:
                        frappe.db.set_value('Yard Settings', val.yard_slot, 'occupy', 0)
                    frappe.db.sql("""Update `tabCargo` set security_item_count=%s, gate1_status="Closed", gate1_date=%s, status="Gate1", yard_slot=%s where name=%s""", (counter, now(), yardslot, c.pickup_cargo_ref))

                if c.qty == 1:
                    if val.yard_slot:
                        frappe.db.set_value('Yard Settings', val.yard_slot, 'occupy', 0)
                    frappe.db.sql("""Update `tabCargo` set gate1_status="Closed", gate1_date=%s, status="Gate1", yard_slot=%s where name=%s""", (now(), yardslot, c.pickup_cargo_ref))

