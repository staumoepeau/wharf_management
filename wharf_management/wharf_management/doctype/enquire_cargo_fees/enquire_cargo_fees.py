# -*- coding: utf-8 -*-
# Copyright (c) 2020, Sione Taumoepeau and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.core.doctype.user_permission.user_permission import get_permitted_documents
from frappe import _
from frappe.model.document import Document
from frappe.utils import cstr, today, flt
from wharf_management.wharf_management.doctype.wharf_payment_entry.wharf_payment_entry import get_storage_days

class EnquireCargoFees(Document):

    def get_storage(self):
        charged_days, storage_fee, wharfage, wharfage_fee, storage_days, grace_days, qty = 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
        #    currency = frappe.get_value('Company',  "Ports Authority Tonga",  "default_currency")
        cargo_ref = self.cargo_ref
        eta_date_cargo = frappe.db.get_value("Cargo", cargo_ref, "eta_date")
        storage_days = get_storage_days(eta_date_cargo, today())
        
        if cargo_ref or cargo_ref != " ":
            container_size, container_content, cargo_type, volume, net_weight, litre  = frappe.db.get_value('Cargo', cargo_ref, ['container_size',
            'container_content', 'cargo_type', 'volume', 'net_weight','litre'])

        if cargo_type == 'Vehicles':
            grace_days, fee_amount, storage_item_code, storage_description = frappe.db.get_value("Wharf Fees", {"wharf_fee_category":"Storage Fee","cargo_type":cargo_type}, ["grace_days", "fee_amount", "item_code", "description"])
            wharfage_fee, wharf_item_code, wharfage_description = frappe.db.get_value("Wharf Fees", {"wharf_fee_category":"Wharfage Fee", "cargo_type":cargo_type}, ["fee_amount", "item_code", "description"])
            if storage_days > flt(grace_days):
                charged_days = storage_days - flt(grace_days)
                storage_fee =  ((storage_days - flt(grace_days)) * fee_amount)

            if volume > net_weight:
                wharfage = volume * wharfage_fee
                qty = volume
            if volume < net_weight:
                wharfage = net_weight * wharfage_fee
                qty = net_weight

        if cargo_type in ('Container', 'Tank Tainers', 'Flatrack'):
            grace_days, fee_amount, storage_item_code, storage_description = frappe.db.get_value("Wharf Fees", {"wharf_fee_category":"Storage Fee","cargo_type":cargo_type, 
            "container_size":container_size, "container_content":container_content}, ["grace_days", "fee_amount", "item_code", "description"])

            if storage_days > flt(grace_days):
                charged_days = storage_days - flt(grace_days)
                storage_fee =  ((storage_days - flt(grace_days)) * fee_amount)

        if cargo_type in ('Container', 'Flatrack'):
            wharfage_fee, wharf_item_code, wharfage_description = frappe.db.get_value("Wharf Fees", {"wharf_fee_category":"Wharfage Fee","cargo_type":cargo_type, 
            "container_size":container_size}, ["fee_amount", "item_code", "description"])
            qty = 1

        if cargo_type == 'Tank Tainers':
            wharfage_fee, wharf_item_code, wharfage_description = frappe.db.get_value("Wharf Fees", {"wharf_fee_category":"Wharfage Fee","cargo_type":cargo_type, 
            "container_size":container_size}, ["fee_amount", "item_code", "description"])
            wharfage = flt(litre/1000) * wharfage_fee
            qty = 1


        if cargo_type in ('Heavy Vehicles', 'Break Bulk', 'Loose Cargo'):
            grace_days, fee_amount, storage_item_code, storage_description = frappe.db.get_value("Wharf Fees", {"wharf_fee_category":"Storage Fee","cargo_type":cargo_type}, ["grace_days", "fee_amount", "item_code", "description"])
            wharfage_fee, wharf_item_code, wharfage_description = frappe.db.get_value("Wharf Fees", {"wharf_fee_category":"Wharfage Fee","cargo_type":cargo_type}, ["fee_amount", "item_code", "description"])

            if volume > net_weight:
                if storage_days > flt(grace_days):
                    charged_days = storage_days - flt(grace_days)
                    storage_fee =  ((storage_days - flt(grace_days)) * fee_amount * flt(volume))
                wharfage = volume * wharfage_fee
                qty = volume

            if volume < net_weight:
                if storage_days > flt(grace_days):
                    charged_days = storage_days - flt(grace_days)
                    storage_fee =  ((storage_days - flt(grace_days)) * fee_amount * flt(net_weight))
                wharfage = net_weight * wharfage_fee
                qty = net_weight

        if storage_days <= flt(grace_days):
            storage_fee = 0.0
            charged_days = 0.0
        
        self.append("wharf_fee_item_check", { 
    				"item": storage_item_code,
    				"description": storage_description,
    				"price": fee_amount,
    				"qty": charged_days,
    				"total": float(storage_fee)
    			})
        
        self.append("wharf_fee_item_check", { 
    				"item": wharf_item_code,
    				"description": wharfage_description,
    				"price": wharfage_fee,
    				"qty": qty,
    				"total": float(wharfage_fee * qty)
    			})
        
        self.total_fee_to_paid = float(storage_fee + (wharfage_fee * qty))
    #    return storage_days, grace_days, charged_days, fee_amount, storage_fee, wharfage, flt(storage_fee + wharfage)


@frappe.whitelist()
def get_storage_fees(docname):
    return frappe.db.sql("""select docB.item_code, docA.description,
		Sum(docB.charged_storage_days) as qty,
		Sum(docB.storage_fee_price) as price,
		Sum(docB.storage_fee) as total
		from `tabCargo References Check` as docB, `tabWharf Fees` as docA
		WHERE docB.wharfage_item_code = docA.item_name AND docB.parent = %s group by docB.item_code""", (docname), as_dict=1)

@frappe.whitelist()
def get_wharfage_fees(docname):
    return frappe.db.sql("""select docB.wharfage_item_code, docA.description, docB.wharfage_fee_price as price,
        CASE 
            WHEN docB.cargo_type IN ("Heavy Vehicles", "Break Bulk", "Loose Cargo", "Vehicles", "Split Ports") 
            THEN 
                CASE 
                WHEN Sum(docB.volume) < Sum(docB.net_weight)
                    THEN Sum(docB.net_weight) ELSE Sum(docB.volume) END
        WHEN docB.cargo_type IN ("Container", "Flatrack") THEN Count(docA.item_name)
        WHEN docB.cargo_type IN ("Tank Tainers") THEN Sum(docB.litre/1000) 
        END AS qty,
        Sum(docB.wharfage_fee) as total
        from `tabCargo References Check` as docB, `tabWharf Fees` as docA
		where docB.wharfage_item_code = docA.item_name and docB.parent = %s group by docB.wharfage_item_code""", (docname), as_dict=1)

@frappe.whitelist()
def clear_table():
    frappe.db.sql(""" DELETE from `tabCargo References Check`""", as_dict=1)
    frappe.db.sql(""" DELETE from `tabWharf Fee Item Check`""", as_dict=1)