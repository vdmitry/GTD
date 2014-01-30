var GTD = GTD || {};

/**
 * Controller of the main notion of the application - tickets.
 * Mostly focused on updating tickets: changing the name or the status.
 * It emits appropriate events when it doesnt know how to handle a particular situiation,
 * e.g. for moving a ticket from one status to another.
 */
GTD.Ticket = function(ticket_data, index, status_id, event_bus) {
  this.template = $('#gdt-ticket-template').html();
  this.ticket_data = ticket_data;
  this.index = index;
  this.status_id = status_id;
  this.event_bus = event_bus;
}

GTD.Ticket.prototype.$render = function() {
  var $el = $(_.template(this.template, {
    index: this.index,
    status_id: this.status_id,
    ticket: this.ticket_data
  }));

  // event handlers
  $el.on('click', $.proxy(this.edit_mode_on, this));
  $el.find('.name-input').on('blur', $.proxy(this.edit_mode_off, this));
  $el.find('.ticket').on('dragstart', $.proxy(this._drag_ticket, this));
  $el.find('.save').on('click', $.proxy(this._save, this));
  $el.find('.remove').on('click', $.proxy(this._remove, this));

  this.$el = $el;
  return $el;
}

/**
 * Makes inline editor visible instead of normal view.
 */
GTD.Ticket.prototype.edit_mode_on = function() {
  this.$el.addClass('edit-mode');
  this.$el.find('.name-input').focus();
}

/**
 * Returns the ticket into normal view.
 */
GTD.Ticket.prototype.edit_mode_off = function() {
  // allow buttons (like save) to catch click event before if gets out of the edit mode
  setTimeout($.proxy(function() {
    this.$el.removeClass('edit-mode');
    this.$el.find('.name-input').val(this.ticket_data.name);
  }, this), 200);
}

// Replaces current view with rerendered one
GTD.Ticket.prototype._rerender = function(e) {
  var old_el = this.$el;
  var new_el = this.$render();
  old_el.replaceWith(new_el);
}

// Handles start of the dragging process, takes required inforation and put it into the dataTransfer object
GTD.Ticket.prototype._drag_ticket = function(e) {
  var $target = $(e.target);
  e.originalEvent.dataTransfer.setData('old_position', $target.data('position'));
  e.originalEvent.dataTransfer.setData('from_status', $target.data('status'));
}

// Saves what the user made in the edit mode
GTD.Ticket.prototype._save = function(e) {
  this.ticket_data.name = this.$el.find('.name-input').val();
  this.event_bus.trigger('gtd:update_ticket', {
    status_id: this.status_id
  });
  e.preventDefault();
}

// Sends remove ticket signeal to someone that can handle this properly.
GTD.Ticket.prototype._remove = function(e) {
  this.event_bus.trigger('gtd:remove_ticket', {
    status_id: this.status_id,
    position: this.index
  });
}
