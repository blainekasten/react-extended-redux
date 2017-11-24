import { Component } from 'react';
import PropTypes from 'prop-types';

const constructor = Component.prototype.constructor;

function ReduxComponent(props, context, updater) {
  constructor.call(this, props, context, updater);

  this._componentWillMount = this.componentWillMount;

  this.componentWillMount = function() {
    if (this.actions) {
      // should happen sooner?
      Object.keys(this.actions).forEach(key => {
        const method = this.actions[key];
        this.actions[key] = (...args) => this.context.store.dispatch(method(...args));
      });
    }

    if (this.appState) {
      this.context.store.subscribe(() => {
        console.log(this.context.store.getState())
        this.setState({
          ...this.state,
          ...this.appState(this.context.store.getState()),
        });
      })

      this.setState({
        ...this.state,
        ...this.appState(this.context.store.getState()),
      });
    }

    if (this._componentWillMount) {
      this._componentWillMount();
    }
  }
}

// Make sure we always have `store` in context.
Object.defineProperty(ReduxComponent, 'contextTypes', {
  get() {
    return this._contextTypes;
  },
  set(a) {
    this._contextTypes = {
      ...a,
      store: PropTypes.object,
    }
  }
});


ReduxComponent.prototype = Object.create(Component.prototype);

export default ReduxComponent;
