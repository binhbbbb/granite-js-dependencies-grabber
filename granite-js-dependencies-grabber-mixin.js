/**
@license Apache 2.0
@copyright Horacio Gonzalez <horacio.gonzalez@gmail.com> 2017
@author Horacio Gonzalez <horacio.gonzalez@gmail.com>
*/

import '@polymer/polymer/polymer-element.js';

/* eslint no-unused-vars: "off" */
/*
 * A mixin to ensure that non-componentalized mon-modularized external
 * JavaScript libraries are loader once and only once, and in the right order,
 * importing all the needed dependencies only if they aren't already loaded
 *
 * @polymer
 * @mixinFunction
 */
export const GraniteJsDependenciesGrabberMixin = (superclass) => class extends superclass {
  static get properties() {
    return {
      /**
       * Keeping a log of name recovery
       */
      history: {
        type: String,
        value: '',
        notify: true,
      },
      /**
       * If true, send logs to the console
       */
      debug: {
        type: Boolean,
        value: false,
      },
    };
  }

  connectedCallback() {
    super.connectedCallback();
  }

  _getDependency(resolve) {
    return () => { return new Promise(resolve); };
  }


  _namespaceExists(name) {
    let namespace = window;
    let splittedName = name.split('.');
    for (let i in splittedName) { // eslint-disable-line guard-for-in
      let item = splittedName[i];
      if (!namespace[item]) {
        return false;
      }
      namespace = namespace[item];
    }
    return true;
  }

  /**
   * @param {string} name
   * @param {string} url
   * @return {void}
   * @private
   */
  _getDependencyPromiseResolve(name, url) {
    return (resolve) => {
      if (!this._namespaceExists(name)) {
        if (this.debug) {
          console.log('[GraniteJsDependenciesGrabberMixin] _getDependency - unmet', name);
        }
        this.history += `_getDependency - unmet ${name} <br>`;
        if (!window[`_downloading_${name}`]) {
          window[`_downloading_${name}`] = true;
          this._loadDependency(name, url, resolve);
        } else {
          this._waitToLoadDependency(name, url, resolve);
        }
      } else {
        if (this.debug) {
          console.log('[GraniteJsDependenciesGrabberMixin] _getDependency - found', name);
        }
        this.history += `_getDependency - found ${name} <br>`;
        this.dispatchEvent(new CustomEvent('dependency-is-ready',
          {detail: {name: name, url: url}}));
        resolve();
      }
    };
  }

  /**
   * @param {string} name
   * @param {string} url
   * @param {function} resolve
   * @return {void}
   * @private
   */
  _loadDependency(name, url, resolve) {
    var script = document.createElement('script');
    script.src = this.resolveUrl(url);
    if (this.debug) { console.log('[GraniteJsDependenciesGrabberMixin] _loadDependency - resolveUrl', this.resolveUrl(url)); }
    script.onload = () => {
      if (this.debug) { console.log('[GraniteJsDependenciesGrabberMixin] _loadDependency - loaded', name); }
      this.history += `_loadDependency - loaded ${name} <br>`;
      this._waitToLoadDependency(name, url, resolve);
    };
    document.body.appendChild(script);
  }

  /**
   * @param {string} name
   * @param {string} url
   * @param {function} resolve
   * @return {void}
   * @private
   */
  _waitToLoadDependency(name, url, resolve) {
    let namespace = window;

    if (!this._namespaceExists(name)) {
        window.setTimeout( () => {
          this._waitToLoadDependency(name, url, resolve);
        }, 5);
        return;
    }

    if (this.debug) { console.log('[GraniteJsDependenciesGrabberMixin] _waitToLoadDependency - got', name); }
    this.history += `_waitToLoadDependency - got ${name} <br>`;
    this.dispatchEvent(new CustomEvent('dependency-is-ready',
      {detail: {name: name, url: url}}));
    resolve();
  }
};
