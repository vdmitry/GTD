var GTD = GTD || {};

/**
 * Being the "owner" of the tickets this class is responsible for operations with them,
 * like adding, removing, editing etc.
 */
GTD.Status = function(status_data, event_bus) {
  this.template = $('#gdt-status-template').html();
  this.status_data = status_data;
  this.event_bus = event_bus;
  this.last_ticket = null; // last added ticket view, used to set it into the edit mode
}

GTD.Status.prototype.$render = function() {
  var $el = $(_.template(this.template, this.status_data));
  var $tickets = $el.find('.tickets');
  _.each(this.status_data.tickets, $.proxy(function(ticket, index) {
    $tickets.append(new GTD.Position(index, this.status_data.id, this.event_bus).$render());
    this.last_ticket = new GTD.Ticket(ticket, index, this.status_data.id, this.event_bus);
    $tickets.append(this.last_ticket.$render());
  }, this));
  $tickets.append(new GTD.Position(this.status_data.tickets.length, this.status_data.id, this.event_bus).$render());

  this.$el = $el;
  return $el;
}

/**
 * Replaces current element with newly rendered one.
 * Returns new jQuery object.
 */
GTD.Status.prototype.$rerender = function() {
  var $old_el = this.$el;
  var $new_el = this.$render();
  $old_el.replaceWith($new_el);
  return $new_el;
}

/**
 * Removes ticket from specified position and returns this ticket.
 */
GTD.Status.prototype.remove_ticket = function(position) {
  var removed_ticket = this.status_data.tickets.splice(position, 1)[0];
  this.$rerender();
  return removed_ticket;
}

/**
 * Inserts ticket into specified position and rerender this status view.
 * If position is not provided tickets.length is taken instead, that means to append the ticket to the end.
 */
GTD.Status.prototype.insert_ticket = function(ticket, position) {
  position = position == undefined ? this.status_data.tickets.length : position;
  this.status_data.tickets.splice(position, 0, ticket);
  this.$rerender();
}

/**
 * Set the last ticket in the list in edit mode. E.g. it can be used right after the adding of new ticket.
 */
GTD.Status.prototype.edit_last_ticket = function() {
  this.last_ticket.edit_mode_on();
}
