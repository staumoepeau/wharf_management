# Copyright (c) 2017, Sione Taumoepeau and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.core.doctype.user_permission.user_permission import get_permitted_documents
from frappe import _
from frappe.utils import cstr, today, flt
from wharf_management.wharf_management.doctype.wharf_payment_entry.wharf_payment_entry import get_storage_days

def execute(filters=None):
    columns, data = [], []
    columns=get_columns()
    data=get_cargo_info(filters, columns)
    report_summary = get_report_summary(filters.cargo_ref)
    return columns, data, None, None, report_summary

#    return columns, data, report_summary

def get_columns():
    return [
		_("Cargo Type") + ":Data:100",
		_("Container No") + ":Data:120",
		_("Content") + ":Data:80",
		_("Size") + ":Data:80",
		_("Chasis No") + ":Data:120",
		_("Yard Slot") + ":Data:120",
		_("ETA") + ":Date:90",
		_("ETD") + ":Date:90",
		_("Consignee") + ":Data:200",
		_("Cargo Description") + ":Data:200",
		
		
	]

def get_conditions(filters):
    conditions = "1=1"
    if filters.get("cargo_ref"): conditions += " and name = %(cargo_ref)s"
    return conditions

def get_cargo_info(filters, columns):
    data = []
    cargo_info = get_cargo_details(filters)

    for cont in cargo_info:
        row = [cont.cargo_type, cont.container_no, cont.container_content, 
		cont.container_size, cont.chasis_no, cont.yard_slot, 
		cont.eta_date, cont.etd_date,  cont.consignee, cont.cargo_description]
        data.append(row)
    return data

def get_cargo_details(filters):

    conditions = get_conditions(filters)
    return frappe.db.sql("""
		select name, cargo_type, container_no, container_content, container_size, 
		cargo_description, consignee, chasis_no, yard_slot,
		eta_date, etd_date
		from `tabCargo`
		where docstatus < 2
			and {conditions}			
	""".format(conditions=conditions), filters, as_dict=1)

def get_report_summary(cargo_ref):
    
    charged_days, storage_fee, storage_days, grace_days = 0.0, 0.0, 0.0, 0.0

    currency = frappe.get_value('Company',  "Ports Authority Tonga",  "default_currency")
    eta_date_cargo = frappe.db.get_value("Cargo", cargo_ref, "eta_date")
    storage_days = get_storage_days(eta_date_cargo, today())
    
    container_size, container_content, cargo_type  = frappe.db.get_value('Cargo', cargo_ref, ['container_size', 'container_content', 'cargo_type'])
    
    grace_days, fee_amount = frappe.db.get_value("Storage Fee", {"cargo_type":cargo_type,
	                                "container_size":container_size, "container_content":container_content}, ["grace_days", "fee_amount"])
    
    wharfage = frappe.db.get_value("Wharfage Fee", {"cargo_type":cargo_type, 
	                               "container_size":container_size}, ["fee_amount"])
    
    if storage_days > flt(grace_days):
        charged_days = storage_days - flt(grace_days)
        storage_fee =  ((storage_days - flt(grace_days)) * fee_amount)

    if storage_days <= flt(grace_days):
        storage_fee = 0.0
        charged_days = 0.0


    return [
#		{
#			"value": storage_days,
#			"label": "Total Storage Days",
#			"indicator": "Green",
#			"datatype": "Data"
#		},
#		{
#			"value": grace_days,
#			"label": "Storage Grace Days",
#			"datatype": "Data",
#			"indicator": "Blue"
#		},
		{
			"value": charged_days,
			"label": "Storage Days Charge",
			"datatype": "Data",
			"indicator": "lightblue"
		},
#		{
#			"value": fee_amount,
#			"label": "Storage Fee",
#			"datatype": "Currency",
#			"indicator": "Yellow",
#			"currency" : currency
#		},
		
		{
			"value": storage_fee,
			"label": "Storage Fee",
			"datatype": "Currency",
			"indicator": "Red",
			"currency" : currency
		},
		{
			"value": wharfage,
			"label": "Wharfage Fee",
			"indicator": "Orange",
			"datatype": "Currency",
			"currency" : currency
		},
		{
			"value": flt(wharfage) + flt(storage_fee),
			"label": "Total Amount to Paid",
			"indicator": "Green",
			"datatype": "Currency",
			"currency" : currency
		},
	]    