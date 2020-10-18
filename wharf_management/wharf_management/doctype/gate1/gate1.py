# -*- coding: utf-8 -*-
# Copyright (c) 2017, Caitlah Technology and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe, json
from frappe.model.document import Document
from frappe.utils import cstr, flt, fmt_money, formatdate
from frappe import msgprint, _, scrub
from wharf_management.wharf_management.utils import get_create_cargo, create_cargo_movement

class Gate1(Document):

    def validate(self):
        self.validate_truck()
        self.validate_warrant_no()
        self.validate_driver()
        self.validate_company()


    def on_submit(self):

        if self.mydoctype == "CARGO":
            self.update_status()

            if self.work_type == "Discharged" and self.status != 'Export':
                self.update_movement_status()
                create_cargo_movement(self.cargo_ref, self.work_type, "OUT", "Gate1")
            
            if self.work_type == "Loading" and self.cargo_type == "Split Ports" and self.status != 'Export':
                self.update_cargo_movement()
            
            if self.status == 'Export':
                self.update_export_status()

        if self.mydoctype == "EMPTY CONTAINERS":
            self.update_empty_containers_movement()


    def update_status(self):
        self.status = "Passed Gate 1"

    def validate_warrant_no(self):
            if self.work_type != 'Loading':
                if self.warrant_no != self.custom_warrant:
                    msgprint(_("Please Make sure that is the correct WARRANT NO"), raise_exception=1)

    def validate_company(self):
        if not self.company:
            msgprint(_("Company is Manadory"), raise_exception=1)

    def validate_driver(self):
        if not self.drivers_information:
            msgprint(_("Drivers Information is Manadory"), raise_exception=1)

    def validate_truck(self):
        if not self.truck_licenses_plate:
            msgprint(_("Truck Information is Manadory"), raise_exception=1)

    def update_movement_status(self):

        yard = frappe.db.get_value('Cargo', self.cargo_ref, 'yard_slot')

        if self.cargo_type in ["Tank Tainers", "Container", "Flatrack", "Split Ports", "Vehicles", "Heavy Vehicles", "Petrolium"]:
            if yard:
                frappe.db.set_value('Yard Settings', yard, 'occupy', 0)
            frappe.db.sql("""Update `tabCargo` set gate1_status="Closed", status='Gate1' , yard_slot='' where name=%s""", (self.cargo_ref))

        if self.cargo_type in ["Loose Cargo", "Break Bulk"]:
            if int(self.qty) > 1:
               if yard:
                   frappe.db.set_value('Yard Settings', yard, 'occupy', 0)
               frappe.db.sql("""Update `tabCargo` set security_item_count=1, gate1_status="Closed", status='Gate1', yard_slot='' where name=%s""", (self.cargo_ref))

            if self.qty == 1:
                if yard:
                    frappe.db.set_value('Yard Settings', yard, 'occupy', 0)
                frappe.db.sql("""Update `tabCargo` set gate1_status="Closed", status='Gate1', yard_slot='' where name=%s""", (self.cargo_ref))

    def update_export_status(self):
        frappe.db.sql("""Update `tabCargo` set export_status="Gate1", gate1_status="Open", gate2_status="Open", payment_status="Open", yard_status="Open", inspection_status="Open" where name=%s""", (self.cargo_ref))

    #Update Cargo Movement with the INWARD Split Ports
    def update_cargo_movement(self):
    
        frappe.db.sql("""UPDATE `tabCargo Movement`
        SET gate_status='INWARD', movement_date=%s, gate1_time=%s,
        truck=%s, truck_driver=%s WHERE refrence=%s""",
        (self.modified, self.modified, self.truck_licenses_plate, self.drivers_information, self.in_reference))
        
        frappe.db.sql("""Update `tabCargo` set gate1_status="Closed", status='INWARD' where name=%s""", (self.cargo_ref))

    def update_empty_containers_movement(self):

        val = frappe.db.get_value("Empty Containers", {"name": self.cargo_ref}, ["pat_code","cargo_type","container_no","agents","container_type","container_size", "consignee",
        "container_content"], as_dict=True)

        doc = frappe.new_doc("Cargo Movement")
        doc.update({
                    "docstatus" : 1,
                    "pat_code" : val.pat_code,
                    "cargo_type" : val.cargo_type,
                    "container_no" : val.container_no,
                    "work_type" : self.work_type,
                    "agents" : val.agents,
                    "container_type" : val.container_type,
                    "container_size" : val.container_size,
                    "consignee" : val.consignee,
                    "container_content" : val.container_content,
                    "cargo_description" : "Empty Container",
                    "gate_status" : "OUT",
                    "movement_date" : self.modified,
                    "gate1_time" : self.modified,
                    "truck" : self.truck_licenses_plate,
                    "truck_driver" : self.drivers_information,
                    "refrence": self.cargo_ref,
                    "warrant_number" : "N/A"
                })
        doc.insert()
        doc.submit()

        frappe.db.sql("""Update `tabEmpty Containers` set gate1_date=%s, status='Gate 1' where name=%s""", (self.modified, self.cargo_ref))
