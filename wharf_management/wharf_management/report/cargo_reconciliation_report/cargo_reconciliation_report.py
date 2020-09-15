# Copyright (c) 2013, Sione Taumoepeau and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe import _
from frappe.utils import cstr

def execute(filters=None):
	columns, data = [], []
	columns=get_columns()
	data=get_cargo_stock_data(filters, columns)
	return columns, data

def get_columns():
	return [
		_("Reference #") + ":Link/Cargo:120",
		_("Cargo Type") + ":Data:90",
		_("Container No") + ":Data:120",
		_("Yard Slot") + ":Data:90",
		_("Chasis No") + ":Data:120",
		_("Mark") + ":Data:120",
		_("Status") + ":Data:60",
		_("Stock Date") + ":Date:110",
		_("Stock Count") + ":Check:90",
		_("Stock Take By") + ":Data:140",		
	]

def get_cargo_stock_data(filters, columns):
	data = []

	cargo_stock_data = get_cargo_stoc_reconciliation(filters)

	for cont in cargo_stock_data:
#		owner_posting_date = container["owner"]+cstr(container["posting_date"])
		row = [cont.name, cont.cargo_type, cont.container_no, cont.yard_slot, 
		cont.chasis_no, cont.mark, cont.status, cont.stock_date, cont.stock_count, cont.stock_take_by]
		data.append(row)
	return data

def get_conditions(filters):
	conditions = "1=1"
	if filters.get("stock_date"): conditions += " and stock_date >= %(stock_date)s"
	if filters.get("status"): conditions += " and status = %(status)s"
#	if filters.get("owner"): conditions += " and a.owner = %(owner)s"
#	if filters.get("pos_profile"): conditions += " and a.is_pos = %(pos_profile)s"
#	if filters.get("status"): conditions += " and a.status = %(status)s"
	return conditions


def get_cargo_stoc_reconciliation(filters):
	conditions = get_conditions(filters)
	return frappe.db.sql("""
		select
			name, cargo_type, cargo_description, container_no, yard_slot, 
			chasis_no, mark, status, stock_date, stock_count, stock_take_by
		from `tabCargo`
		where docstatus < 2
			and {conditions}			
	""".format(conditions=conditions), filters, as_dict=1)

