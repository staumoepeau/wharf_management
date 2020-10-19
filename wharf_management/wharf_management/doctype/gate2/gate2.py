# -*- coding: utf-8 -*-
# -*- coding: utf-8 -*-
# Copyright (c) 2017, Caitlah Technology and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe, json
import frappe.defaults
from frappe.model.document import Document
from frappe.utils import cstr, flt, fmt_money, formatdate
from frappe import msgprint, _, scrub
from wharf_management.wharf_management.utils import get_create_cargo, create_cargo_movement

class Gate2(Document):

    def on_submit(self):

        if self.mydoctype == "CARGO":
            if not self.work_type == "Loading":
                self.update_gate2_status()
                self.update_cargo_movement()
                self.create_split_ports_cargo()

            if self.work_type == "Loading" and self.cargo_type == "Split Ports":
                self.update_gate2_status_inward()
                self.create_movement_split_ports()


        if self.mydoctype == "EMPTY CONTAINERS":
            self.update_empty_containers_movement()


    def update_gate2_status(self):
        frappe.db.sql("""Update `tabCargo` set gate1_status='Closed', gate2_status='Closed', gate1_date=%s, yard_slot=NULL, status='Gate Out' where name=%s""", (self.modified, self.cargo_ref))

    #Update Cargo Table with Inward Split Ports Cargo
    def update_gate2_status_inward(self):
        frappe.db.sql("""Update `tabCargo` set gate2_status='Closed', gate1_date=%s, status='Gate IN' where name=%s""", (self.modified, self.cargo_ref))


    def create_movement_split_ports(self):
        create_cargo_movement(self.cargo_ref, "Loading", "Gate IN", "Gate2")

#    def update_yard(self):
#            frappe.db.sql("""Delete `tabCargo` where name=%s""", (self.cargo_ref))

    def update_empty_containers_movement(self):
        frappe.db.sql("""UPDATE `tabCargo Movement`
        SET main_gate_status='OUT', main_gate_content="EMPTY",
        main_gate_date=%s, main_gate_time=%s, truck=%s, truck_driver=%s
        WHERE refrence=%s""", (self.modified, self.modified, self.truck_licenses_plate, self.drivers_information, self.cargo_ref))

        frappe.db.sql("""UPDATE `tabEmpty Containers` SET gate1_date=%s, status='OUT' WHERE name=%s""", (self.modified, self.cargo_ref))


    def update_cargo_movement(self):

        if self.custom_code == "MTY" or self.custom_code == "DLWS" or self.custom_code == "DDLW":
            gate_content = "EMPTY"
        elif self.custom_code != "MTY" or self.custom_code != "DLWS" or self.custom_code != "DDLW":
            gate_content = "FULL"

        if self.cargo_type in ["Container", "Tank Tainer", "Split Ports", "Tanker"]:
            vals = frappe.db.get_value("Cargo Movement", {"container_no": self.container_no, "warrant_number": self.custom_warrant}, ["refrence"], as_dict=True)

            if not vals.refrence:
                frappe.db.sql("""UPDATE `tabCargo Movement`
                SET main_gate_status='OUT', main_gate_content=%s, main_gate_date=%s, main_gate_time=%s,
                truck=%s, truck_driver=%s WHERE container_no=%s""",
                (gate_content, self.modified, self.modified, self.truck_licenses_plate, self.drivers_information, self.container_no))

            if vals.refrence:
                frappe.db.sql("""UPDATE `tabCargo Movement`
                SET main_gate_status='OUT', main_gate_content=%s, main_gate_date=%s, main_gate_time=%s,
                truck=%s, truck_driver=%s WHERE refrence=%s""",
                (gate_content, self.modified, self.modified, self.truck_licenses_plate, self.drivers_information, self.cargo_ref))

        if self.cargo_type not in ["Container", "Tank Tainer", "Split Ports", "Tanker"]:
            frappe.db.sql("""UPDATE `tabCargo Movement`
            SET main_gate_status='OUT', main_gate_content=%s, main_gate_date=%s,
            main_gate_time=%s, truck=%s, truck_driver=%s WHERE refrence=%s""",
            (gate_content, self.modified, self.modified, self.truck_licenses_plate, self.drivers_information, self.cargo_ref))


    def create_split_ports_cargo(self):
        val = frappe.db.get_value("Cargo", {"container_no": self.container_no, "name": self.cargo_ref}, ["last_port"], as_dict=True)

        if self.cargo_type == "Split Ports" and val.last_port == "NO":
                    get_create_cargo("Cargo", self.cargo_ref, "Loading", None, "Split Ports")
