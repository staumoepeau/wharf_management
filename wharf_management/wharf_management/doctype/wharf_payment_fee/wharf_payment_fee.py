

# -*- coding: utf-8 -*-
# Copyright (c) 2017, Caitlah Technology and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
from frappe.utils import add_days, cint, cstr, flt, getdate, rounded, date_diff, money_in_words
import frappe
from frappe import _, msgprint, throw
from frappe.model.document import Document
from erpnext.accounts.party import get_party_account

class WharfPaymentFee(Document):

#	def validate(self):
#		self.check_duplicate_warrant_number()
#		self.update_warrant()
		
	
	def on_submit(self):
		self.update_payment_status()
#		self.update_export_status()
		self.change_status()
		self.make_payment()
		self.check_duplicate_warrant_number()
		self.check_warrant_number()

	
	def check_warrant_number(self):
		if self.deliver_empty != "Yes":
			if not self.custom_warrant:
				frappe.msgprint(_("Custom Warrant Number is Required"), raise_exception=True)


	def check_duplicate_warrant_number(self):
		check_duplicate = None
		check_duplicate = frappe.db.sql("""Select custom_warrant from `tabWharf Payment Fee` where custom_warrant=%s having count(custom_warrant) > 1""", (self.custom_warrant))
		
		if self.bulk_payment != "Yes":
			if check_duplicate:
				frappe.throw(_("Sorry You are duplicating this Warrant No : {0} ").format(check_duplicate))

		
	def make_payment(self):
		if self.payment_method == 'Credit' and self.work_type != 'Stock':
			self.create_sales_invoices_credit()
    	
		if self.payment_method == 'Credit' and self.work_type == 'Stock':
				self.create_sales_invoices_credit_mty()
		
		if self.payment_method != 'Credit' and self.bulk_payment != 'Yes':
			self.create_sales_invoices_paid()
			
#			if self.payment_method == 'Cash' || self.payment_method == 'Cheque':
#    				self.make_cash_entries()
#	def update_bulk_payment(self):
#		if self.bulk_payment == 'Yes':
#			self.bulk_payment_code = self.custom_warrant
	
#	def update_warrant(self):
#		if self.bulk_payment == 'Yes':
#			self.custom_warrant = self.bulk_payment_code, '-' ,self.bulk_item
	
	def change_status(self):
    		if self.bulk_payment == 'Yes':
        				frappe.db.sql("""Update `tabCargo` set bulk_payment="Yes", bulk_payment_code=%s where name=%s""", (self.bulk_payment_code, self.cargo_ref))

    		if self.status != 'Paid':
    				self.status == 'Paid'
		
	def update_payment_status(self):
 			frappe.db.sql("""Update `tabCargo` set payment_status="Closed", custom_warrant=%s, custom_code=%s, delivery_code=%s, status='Paid' where name=%s""", (self.custom_warrant, self.custom_code, self.delivery_code, self.cargo_ref))
	
#	def update_export_status(self):
#    		if self.status == 'Export':
#    				frappe.db.sql("""Update `tabCargo` set export_status="Paid" where name=%s""", (self.cargo_ref))

	def get_working_days(self):
		
#		val = frappe.db.get_value("Cargo", self.cargo_ref, ["final_eta"], as_dict=True)
#		val = frappe.db.get_value("Cargo", {"name" : self.cargo_ref}, "final_eta")

#		if not val.final_eta:
#			eta = self.eta_date
#		if val.final_eta:
#			eta = val.final_eta

		holidays = self.get_holidays(self.eta_date, self.posting_date)
		working_days = date_diff(self.posting_date, self.eta_date)
		working_days -= len(holidays)
		return working_days

	def get_holidays(self, start_date, end_date):
		holiday_list = frappe.db.get_value("Company", "Ports Authority Tonga", "default_holiday_list")
		holidays = frappe.db.sql_list('''select holiday_date  from `tabHoliday`
			where
				parent=%(holiday_list)s
				and holiday_date >= %(start_date)s
				and holiday_date <= %(end_date)s''', {
					"holiday_list": holiday_list,
					"start_date": start_date,
					"end_date": end_date
				})

		holidays = [cstr(i) for i in holidays]

		return holidays

	def get_charged_days(self):
		
		if (self.get_grace_days(self) < self.get_working_days(self)):
			charge_days = flt(self.get_working_days(self) - self.free_storage_days)
		if (self.free_storage_days >= self.storage_days):
			charge_days = 0
		
		return charge_days

#	def get_grace_days(self):
#		if self.cargo_type == 'Container':
#			free_days = frappe.db.sql("""Select grace_days from `tabStorage Fee` 
#				where cargo_type=%s and container_size=%s and container_content=%s""", (self.cargo_type, self.container_size, self.container_content))
		
#		if self.cargo_type != 'Container':
#			free_days = frappe.db.sql("""Select grace_days from `tabStorage Fee` where cargo_type=%s""", (self.cargo_type))

#		return free_days
	
	def get_storage_fee(self):
    		if self.cargo_type == 'Container':
			sfee = frappe.db.sql("""Select fee_amount from `tabStorage Fee` 
				where cargo_type=%s and container_size=%s and container_content=%s""", (self.cargo_type, self.container_size, self.container_content))
		
		if self.cargo_type != 'Container':
			sfee = frappe.db.sql("""Select fee_amount from `tabStorage Fee` where cargo_type=%s""", (self.cargo_type))

		return sfee
	
	def get_wharfage_fee(self):
		if self.cargo_type == 'Container':
			wfee = frappe.db.sql("""Select fee_amount from `tabWharfage Fee` 
				where cargo_type=%s and container_size=%s""", (self.cargo_type, self.container_size))
		
		if self.cargo_type != 'Container':
			wfee = frappe.db.sql("""Select fee_amount from `tabWharfage Fee` where cargo_type=%s""", (self.cargo_type))
		
		return wfee
	

	def get_item_name(self):
		item_name = frappe.db.sql("""Select item_name from `tabStorage Fee` 
			where cargo_type=%s and container_size=%s and container_content=%s""", (self.cargo_type, self.container_size, self.container_content))
		
		return item_name
		

	def insert_fees(self):
		fees=0

		if self.work_type != 'Stock' and self.container_content != 'EMPTY':
			if self.cargo_type == 'Vehicles':
					strqty = self.storage_days_charged
					item_name = frappe.db.get_value("Storage Fee", {"cargo_type" : self.cargo_type}, "item_name")
			
			if self.cargo_type == 'Split Ports':
					strqty = self.storage_days_charged
					item_name = frappe.db.get_value("Storage Fee", {"cargo_type" : self.cargo_type}, "item_name")
			
			if self.cargo_type == 'Container' or self.cargo_type == 'Tank Tainers' or self.cargo_type == 'Flatrack':
					strqty = self.storage_days_charged
					item_name = frappe.db.get_value("Storage Fee", {"cargo_type" : self.cargo_type,
													"container_size" : self.container_size,
													"container_content" : self.container_content}, "item_name")
			
			if self.cargo_type == 'Heavy Vehicles' or self.cargo_type == 'Break Bulk' or self.cargo_type == 'Loose Cargo':
					if self.volume > self.weight:
						strqty = float(self.storage_days_charged * self.volume)
					if self.volume < self.weight:
						strqty = float(self.storage_days_charged * self.weight)
					item_name = frappe.db.get_value("Storage Fee", {"cargo_type" : self.cargo_type}, "item_name")
			
			

			vals = frappe.db.get_value("Item", item_name, ["description", "standard_rate", "income_account"], as_dict=True)
			self.append("wharf_fee_item", { 
				"item": item_name,
				"description": vals.description,
				"price": vals.standard_rate,
				"qty": strqty,
				"total": float(strqty * vals.standard_rate),
				"income_account" : vals.income_accounts
			})

			if self.cargo_type == 'Container':
					qty = 1
					item_name = frappe.db.get_value("Wharfage Fee", {"cargo_type" : self.cargo_type, 
														"container_size" : self.container_size}, "item_name")
										
			if self.cargo_type != 'Container':
					qty = self.volume
					item_name = frappe.db.get_value("Wharfage Fee", {"cargo_type" : self.cargo_type}, "item_name")
			
			val = frappe.db.get_value("Item", item_name, ["description", "standard_rate" ,"income_account"], as_dict=True)
			self.append("wharf_fee_item", { 
				"item": item_name,
				"description": val.description,
				"price": val.standard_rate,
				"qty": qty,
				"total" : float(qty * val.standard_rate),
				"income_account" : val.income_accounts
			})
			
			if self.work_type=="Discharged" and self.secondary_work_type=="Devanning":
					item_name = frappe.db.get_value("Devanning Fee", {"cargo_type" : self.cargo_type, "container_size" : self.container_size}, "item_name")
					devan = frappe.db.get_value("Item", item_name, ["description", "standard_rate", "income_account"], as_dict=True)
					fees = float(1 * devan.standard_rate)
					self.append("wharf_fee_item", { 
							"item": item_name,
							"description": devan.description,
							"price": devan.standard_rate,
							"qty": "1",
							"total": float(1 * devan.standard_rate),
							"income_account" : devan.income_accounts	
					})
			elif self.work_type=="Devanning" and not self.secondary_work_type:
					item_name = frappe.db.get_value("Devanning Fee", {"cargo_type" : self.cargo_type, "container_size" : self.container_size}, "item_name")
					devan = frappe.db.get_value("Item", item_name, ["description", "standard_rate","income_account"], as_dict=True)
					fees = float(1 * devan.standard_rate)
					self.append("wharf_fee_item", { 
							"item": item_name,
							"description": devan.description,
							"price": devan.standard_rate,
							"qty": "1",
							"total": float(1 * devan.standard_rate),
							"income_account" : devan.income_accounts
					})
			if not self.secondary_work_type:
					fees=0

			self.total_fee = float((vals.standard_rate * strqty)+(qty * val.standard_rate)+(1 * fees))
			self.total_amount = self.total_fee

		elif ((self.work_type == 'Stock' or self.work_type == 'Discharged') and self.container_content == 'EMPTY'):
			if self.cargo_type == 'Container':
					strqty = self.storage_days_charged
					item_name = frappe.db.get_value("Storage Fee", {"cargo_type" : self.cargo_type,
													"container_size" : self.container_size,
													"container_content" : self.container_content}, "item_name")

			if self.cargo_type != 'Container':
					strqty = float(self.storage_days_charged * self.volume)
					item_name = frappe.db.get_value("Storage Fee", {"cargo_type" : self.cargo_type}, "item_name")

			vals = frappe.db.get_value("Item", item_name, ["description", "standard_rate", "income_account"], as_dict=True)
			self.append("wharf_fee_item", { 
				"item": item_name,
				"description": vals.description,
				"price": vals.standard_rate,
				"qty": strqty,
				"total": float(strqty * vals.standard_rate),
				"income_account" : vals.income_accounts
			})
	
			if not self.secondary_work_type:
					fees=0

			self.total_fee = float((vals.standard_rate * strqty)+(1 * fees))
			self.total_amount = self.total_fee
		
#	def make_credit_entries(self, cancel=0, adv_adj=0):
#   		from erpnext.accounts.general_ledger import make_gl_entries				
#		gl_map = []
#		cost_center = frappe.db.get_value("Company", "Ports Authority Tonga", "cost_center")	
#		gl_map.append(
#			frappe._dict({
#				"posting_date": self.posting_date,
#				"account": "Debtors - PAT",
#				"account_currency": "TOP",
#				"debit": self.credit_amount,
#				"voucher_type": self.doctype,
#				"voucher_no": self.name,
#				"against": "Storage Fee - PAT",
#				"party_type": "Customer",
#				"party": self.agents,
#				"cost_center" : "Operations - PAT"
#			}))
#		gl_map.append(
#			frappe._dict({
#				"posting_date": self.posting_date,
#				"account": "Storage Fee - PAT",
#				"credit": self.credit_amount,
#				"voucher_type": self.doctype,
#				"voucher_no": self.name,
#				"against": self.agents,
#				"cost_center" : "Operations - PAT"
#			}))
#		if gl_map:
#			make_gl_entries(gl_map, cancel=(self.docstatus == 2))
	
	def create_sales_invoices_credit_mty(self):

		items = frappe.db.sql("""select item, price, description, total, qty, income_account from `tabWharf Fee Item` where parent = %s """, (self.name), as_dict=1)
		entries = sorted(list(items))
		self.set('items', [])

		doc = frappe.new_doc("Sales Invoice")
		doc.customer = self.agents
		doc.pms_ref = self.name
		doc.due_date = self.posting_date

		for d in entries:
			item = doc.append('items', {
			'item_code' : d.item,
			'item_name' : d.item,
			'description' : d.description,
			'rate' : d.price,
			'qty' : d.qty
			})

		doc.save(ignore_permissions=True)
		doc.save()
		doc.submit()

	def create_sales_invoices_credit(self):

		items = frappe.db.sql("""select item, price, description, total, qty, income_account from `tabWharf Fee Item` where parent = %s """, (self.name), as_dict=1)
		entries = sorted(list(items))
		self.set('items', [])

		doc = frappe.new_doc("Sales Invoice")
		doc.customer = self.consignee
		doc.pms_ref = self.name
		doc.due_date = self.posting_date

		for d in entries:
			item = doc.append('items', {
			'item_code' : d.item,
			'item_name' : d.item,
			'description' : d.description,
			'rate' : d.price,
			'qty' : d.qty
			})

		doc.save(ignore_permissions=True)
		doc.submit()

	def create_sales_invoices_paid(self):

		items = frappe.db.sql("""select item, price, description, total, qty, income_account from `tabWharf Fee Item` where parent = %s """, (self.name), as_dict=1)
		entries = sorted(list(items))
		self.set('items', [])

		doc = frappe.new_doc("Sales Invoice")
		doc.customer = self.consignee
		doc.due_date = self.posting_date
		doc.pms_ref = self.name
		doc.is_pos = True
		doc.status = "Paid"

		doc.paid_amount = self.total_amount
		doc.base_paid_amount = self.total_amount
		
		if self.discount_amount:
			doc.discount_amount = self.discount_amount
		
		doc.outstanding_amount = 0
		payments = doc.append('payments', {
		'mode_of_payment': self.payment_method,
		'amount' : self.total_amount
		})

		for d in entries:
			item = doc.append('items', {
			'item_code' : d.item,
			'item_name' : d.item,
			'description' : d.description,
			'rate' : d.price,
			'qty' : d.qty
			})
		
		doc.save(ignore_permissions=True)
		doc.submit()

	def refund_sales(self):
		item_name = frappe.db.get_value("Sales Invoice", {"pms_ref": self.name}, "name")
		cargo_refrence = frappe.db.get_value("Cargo", {"name": self.cargo_ref}, "name")
		gate_status = frappe.db.get_value("Cargo", {"name": self.cargo_ref}, "gate1_status")

		if gate_status == "Open":
			frappe.db.sql("""Update `tabCargo` set payment_status="Open", status="Yard" where name = %s """, (cargo_refrence), as_dict=1)
			frappe.db.sql("""delete from `tabGL Entry` where voucher_no = %s """, (item_name), as_dict=1)
			frappe.db.sql("""delete from `tabSales Invoice Item` where parent = %s """, (item_name), as_dict=1)
			frappe.db.sql("""delete from `tabWharf Fee Item` where parent = %s """, (self.name), as_dict=1)
			frappe.db.sql("""Update `tabWharf Payment Fee` set docstatus=2 where name = %s """, (self.name), as_dict=1)
			frappe.db.sql("""delete from `tabSales Invoice` where pms_ref = %s """, (self.name), as_dict=1)
	#		frappe.throw(_("Transaction had been Cancel!"))
		
		if gate_status != "Open":
			frappe.throw(_("Sorry You cannot Cancel this transaction Check with your Supervisor first"))