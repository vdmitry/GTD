var GTD = GTD || {};

/**
 * Position is place where a ticket can be put into. This controller handles
 * dropping and emits events that say about ticket status updates.
 */
GTD.Position = function(index, status_id, event_bus) {
  this.template = $('#gdt-position-template').html();
  this.index = index;
  this.status_id = status_id;
  this.event_bus = event_bus;
}

GTD.Position.prototype.$render = function() {
  var $el = $(_.template(this.template, {
    index: this.index,
    status_id: this.status_id
  }));

  // event handlers
  $el.on('drop', $.proxy(this._drop_ticket, this))
     .on('dragover', $.proxy(this._allow_drop, this))
     .on('dragenter dragleave', $.proxy(this._toggle_highlight, this));
  return $el;
}

GTD.Position.prototype._drop_ticket = function(e) {
  var data_transfer = e.originalEvent.dataTransfer;
  var $target = $(e.target);
  this.event_bus.trigger('gtd:status_change', {
    from_status: data_transfer.getData('from_status'),
    to_status: $target.data('status'),
    old_position: Number(data_transfer.getData('old_position')),
    new_position: Number($target.data('position'))
  });
}

GTD.Position.prototype._allow_drop = function(e) {
  e.originalEvent.preventDefault();
}

// Makes position the droppable area more visible
GTD.Position.prototype._toggle_highlight = function(e) {
  $(e.target).toggleClass('highlight');
}
