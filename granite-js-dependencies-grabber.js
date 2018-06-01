import { PolymerElement } from '@polymer/polymer/polymer-element.js';
import { GraniteJsDependenciesGrabberMixin } from './granite-js-dependencies-grabber-mixin.js';
/* global GraniteJsDependenciesGrabberMixin */
/* eslint new-cap:  ["error", { "capIsNewExceptions": ["GraniteJsDependenciesGrabberMixin"] }] */

/**
 * `granite-js-dependencies-grabber`
 * A custom element to ensure that non-componentalized mon-modularized external
 * JavaScript libraries are loader once and only once, and in the right order
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */
class GraniteJsDependenciesGrabber extends GraniteJsDependenciesGrabberMixin(PolymerElement) {
  static get is() { return 'granite-js-dependencies-grabber'; }

  static get properties() {
    return {
      dependencies: {
        type: Array,
        observer: '_onDependenciesChange',
        value: () => {
          return [];
        },
      },
    };
  }

  _onDependenciesChange() {
    if (!this.dependencies || this.dependencies.length == 0 ) {
      return;
    }
    if (!this._areValidDependencies) {
      this.console.error('[granite-js-dependencies-grabber] Dependencies list malformed');
      this.history += 'Dependencies list malformed <br>';
      return;
    }

    let chain = Promise.resolve();

    this.dependencies.forEach((dep) => {
      if (this.debug) { console.log(`Adding dependency ${dep.name} to chain`); }
      this.history += `Adding dependency ${dep.name} to chain <br>`;
      chain = chain.then(this._getDependency( this._getDependencyPromiseResolve(dep.name, dep.url)));
    });
  }

  _areValidDependencies() {
    this.dependencies.forEach((dep) => {
      if (!dep.name ||
          typeof dep.name != 'string' ||
          !dep.url ||
          typeof dep.url != 'string') {
            return false;
      }
    });
    return true;
  }

  connectedCallback() {
    super.connectedCallback();
  }
}

window.customElements.define(GraniteJsDependenciesGrabber.is, GraniteJsDependenciesGrabber);
