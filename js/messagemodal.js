'use strict';

class Modal {
  constructor () {
    this.curtain = document.querySelector('.modal-curtain');
    this.modal = document.getElementById('modal');
    this.content = document.getElementById('modal-content');

    this.knownTypes = ['error', 'warning', 'info', 'success'];

    this.modalTimer = null;
    this.timeout = 3000;

    this.afterClickFn = null;

    this.addClickEvent();
  }

  addClickEvent () {
    this.curtain.onclick = (evt) => {
      this.hide();
    }
  }

  clear () {
    this.setMessage('');
    this.hide();
  }

  clearTimer () {
    if (this.modalTimer) {
      window.clearTimeout(this.modalTimer);
    }
  }

  show () {
    this.curtain.classList.remove('modal-hidden');

    this.clearTimer();

    if (this.timeout > 0) {
      this.modalTimer = window.setTimeout(this.hide.bind(this), this.timeout);
    }
  }

  hide () {
    this.curtain.classList.add('modal-hidden');
    this.clearTimer();
    this.afterClick();
  }

  afterClick () {
    if (this.afterClickFn !== null) {
      this.afterClickFn();
    }
  }

  setType (type) {
    if (!this.knownTypes.includes(type)) {
      return;
    }

    for (const t of this.knownTypes) {
      this.modal.classList.remove(t);
    }
    this.modal.classList.add(type);
  }

  setMessage (msg) {
    this.content.textContent = msg;
    this.show();
  }

  message (msg, afterClickFn = null) {
    let displaymsg = '';
    if (msg instanceof Object) {
      this.timeout = !isNaN(msg.duration) ? msg.duration : 3000;
      this.setType(msg.type);
      displaymsg = msg.message
    } else {
      this.timeout = 3000;
      this.setType('info');
      displaymsg = msg;
    }

    // Set the after click function, but only if it's a function.
    this.afterClickFn = typeof afterClickFn === 'function' ? afterClickFn : null;

    this.setMessage(displaymsg);
  }
}

const modal = new Modal();
