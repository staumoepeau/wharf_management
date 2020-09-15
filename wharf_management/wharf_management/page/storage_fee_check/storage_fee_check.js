frappe.pages['storage-fee-check'].on_page_load = (wrapper) => {
    var page = frappe.ui.make_app_page({
        parent: wrapper,
        title: __('Check for Storage Fee'),
        single_column: true
    });

    frappe.breadcrumbs.add("Cargo");

    $("<div class='storagefee-engine' style='min-height: 200px; padding: 15px;'></div>").appendTo(page.main);
    $(frappe.render_template("storage-fee-check", {})).appendTo(page.main);
    wrapper.storagefee_engine = new frappe.StoragefeeEngine(wrapper);
};

frappe.pages['storage-fee-check'].refresh = function(wrapper) {
    wrapper.storagefee_engine.set_from_route();
};

frappe.StoragefeeEngine = Class.extend({

    init: function(wrapper) {
        this.wrapper = wrapper;
        this.page = wrapper.page;
        this.body = $(this.wrapper).find(".storagefee-engine");
        this.setup_page();

    },

    setup_page: function() {
        var me = this;
        this.doctype_select = this.wrapper.page.add_select(__("Cargo"), [{ value: "", label: __("Select Cargo") + "..." }].concat(this.options.cargo))
            .change(function() {
                frappe.set_route("storage-fee-check", $(this).val());
            });
        //        this.role_select = this.wrapper.page.add_select(__("Roles"), [__("Select Role") + "..."].concat(this.options.roles))
        //            .change(function() {
        //                me.refresh();
        //            });

        //        this.page.add_inner_button(__('Set User Permissions'), () => {
        //            return frappe.set_route('List', 'User Permission');
        //        });
        //        this.set_from_route();
    },

});