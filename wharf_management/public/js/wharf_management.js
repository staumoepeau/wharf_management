frappe.get_desktop_icons = function (show_hidden, show_global) {
	// filter valid icons
	var out = [];

	var add_to_out = function (module) {
		var module = frappe.get_module(module.module_name, module);
		module.app_icon = frappe.ui.app_icon.get_html(module);
		out.push(module);
	}

	var show_module = function (module) {
		var out = true;
		if (m.type === "page") {
			out = m.link in frappe.boot.page_info;
		} else if (m._doctype) {
			out = frappe.model.can_read(m._doctype);
		} else {
			// limiting permission to system manager role
			if (m.module_name === 'HR' && frappe.user.has_role('System Manager')) {
				out = true;
			} else if (m.module_name === 'Setup' && frappe.user.has_role('System Manager')) {
				out = true;
			} else {
				out = frappe.boot.user.allow_modules.indexOf(m.module_name) !== -1
			}
		}
		if (m.hidden && !show_hidden) {
			out = false;
		}
		if (m.blocked && !show_global) {
			out = false;
		}
		return out;
	}

	for (var i = 0, l = frappe.boot.desktop_icons.length; i < l; i++) {
		var m = frappe.boot.desktop_icons[i];
		if ((['Setup', 'Core'].indexOf(m.module_name) === -1) &&
			show_module(m)) {
			add_to_out(m)
		}
	}

	if (roles.indexOf('System Manager') != -1) {
		var m = frappe.get_module('Setup');
		if (show_module(m)) add_to_out(m)
	}

	if (roles.indexOf('Administrator') != -1) {
		var m = frappe.get_module('Core');
		if (show_module(m)) add_to_out(m)
	}

	return out;
};
