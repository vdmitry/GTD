var GTD = GTD || {};

/**
 * The main application controller.
 */
GTD.App = function() {
  this.eventBus = $(window);
  this.$el = $('#gtd');
  this.$statuses = this.$el.find('.statuses');
  this.first_status = null; // view of the first status, to be defined during rendering
  this.statuses = {}; // status id to status view object
  this.id_base = 0;

  this._get_data($.proxy(function(data) {
    this.data = data;
    this._render_statuses();

    // determine the biggest id
    _.each(data.statuses, $.proxy(function(status) {
      _.each(status.tickets, $.proxy(function(ticket) {
        this.id_base = Math.max(ticket.id, this.id_base);
      }, this));
    }, this));
  }, this));

  // handler bindings
  this.$el.find('.add-ticket-btn').click($.proxy(function(e) {
    var ticket = {
      id: ++this.id_base,
      name: '',
      type: $(e.target).data('ticket-type')
    }
    this.first_status.insert_ticket(ticket);
    this.first_status.edit_last_ticket();
  }, this));

  this.eventBus.on('gtd:status_change', $.proxy(function(e, data) {
    var ticket = this.statuses[data.from_status].remove_ticket(data.old_position);
    this.statuses[data.to_status].insert_ticket(ticket, data.new_position);
    this._save_data();
  }, this));
  this.eventBus.on('gtd:remove_ticket', $.proxy(function(e, data) {
    this.statuses[data.status_id].remove_ticket(data.position);
    this._save_data();
  }, this));
  this.eventBus.on('gtd:update_ticket', $.proxy(function(e, data) {
    this.statuses[data.status_id].$rerender();
    this._save_data();
  }, this));
}

/**
 * Get data from local storage if there is data saved or from server otherwise.
 */
GTD.App.prototype._get_data = function(on_data_received) {
  if (localStorage['gdt:data']) {
    on_data_received(JSON.parse(localStorage['gdt:data']));
  } else {
    $.get('init_data.json', $.proxy(function(data) {
      on_data_received(JSON.parse(data));
    }, this))
  }
}

/**
 * Saves data to persistent storage (window.localStorage for now)
 */
GTD.App.prototype._save_data = function(on_data_received) {
  localStorage['gdt:data'] = JSON.stringify(this.data);
}

GTD.App.prototype._render_statuses = function() {
  this.$statuses.empty();
  this.statuses = {}

  _.each(this.data.statuses, $.proxy(function(status, index) {
    this.statuses[status.id] = new GTD.Status(status, this.eventBus);
    this.$statuses.append(this.statuses[status.id].$render());
    if (index == 0) {
      this.first_status = this.statuses[status.id];
    }
  }, this));
}
