var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _CustomElement() {
  return Reflect.construct(HTMLElement, [], this.__proto__.constructor);
}

;
Object.setPrototypeOf(_CustomElement.prototype, HTMLElement.prototype);
Object.setPrototypeOf(_CustomElement, HTMLElement);
var chains = [];

var MillerColumnsElement = function (_CustomElement2) {
  _inherits(MillerColumnsElement, _CustomElement2);

  function MillerColumnsElement() {
    _classCallCheck(this, MillerColumnsElement);

    return _possibleConstructorReturn(this, (MillerColumnsElement.__proto__ || Object.getPrototypeOf(MillerColumnsElement)).call(this));
  }

  _createClass(MillerColumnsElement, [{
    key: 'connectedCallback',
    value: function connectedCallback() {
      var list = this.list;
      if (list) {
        this.attachClickEvents(list);
        this.unnest(list);
      }
    }
  }, {
    key: 'disconnectedCallback',
    value: function disconnectedCallback() {}
  }, {
    key: 'unnest',


    /** Convert nested lists into columns using breadth-first traversal. */
    value: function unnest(root) {
      var millercolumns = this;

      var queue = [];
      var node = void 0;
      var listItems = void 0;
      var depth = 1;

      // Push the root unordered list item into the queue.
      root.className = 'app-miller-columns__column';
      root.dataset.level = '1';
      queue.push(root);

      while (queue.length) {
        node = queue.shift();

        if (node.children) {
          listItems = node.children;

          for (var i = 0; i < listItems.length; i++) {
            var child = listItems[i].querySelector('ul');
            var ancestor = listItems[i];

            if (child) {
              // Store level and depth
              var level = parseInt(node.dataset.level) + 1;
              child.dataset.level = level.toString();
              if (level > depth) depth = level;

              queue.push(child);

              // Mark list items with child lists as parents.
              if (ancestor) {
                ancestor.dataset.parent = 'true';
                ancestor.className = 'app-miller-columns__item--parent';

                if (level === 2) ancestor.dataset.root = 'true';

                // Expand the requested child node on click.
                var fn = this.revealColumn.bind(null, this, ancestor, child);
                ancestor.addEventListener('click', fn, false);

                var keys = [' ', 'Enter']; //'ArrowRight'
                ancestor.addEventListener('keydown', this.keydown(fn, keys), false);
              }

              // Hide columns.
              child.dataset.collapse = 'true';
              child.className = 'app-miller-columns__column app-miller-columns__column--collapse';
              // Causes item siblings to have a flattened DOM lineage.
              millercolumns.insertAdjacentElement('beforeend', child);
            }
          }
        }
      }

      this.dataset.depth = depth.toString();
    }

    /** Attach click events for list items. */

  }, {
    key: 'attachClickEvents',
    value: function attachClickEvents(root) {
      var items = root.querySelectorAll('li');

      for (var i = 0; i < items.length; i++) {
        var fn = this.selectItem.bind(null, this, items[i]);
        items[i].addEventListener('click', fn, false);

        var keys = [' ', 'Enter']; //'ArrowRight'
        items[i].addEventListener('keydown', this.keydown(fn, keys));

        items[i].tabIndex = 0;
      }
    }

    // /** Attach key events for lists. */
    // attachKeyEvents(root: HTMLUListElement) {
    //   const items = root.querySelectorAll('li')
    //
    //   for (let i = 0; i < items.length; i++) {
    //     const fn = this.selectItem.bind(null, this, items[i])
    //     items[i].tabIndex = 0
    //   }
    // }

  }, {
    key: 'keydown',
    value: function keydown(fn, keys) {
      return function (event) {
        if (keys.indexOf(event.key) >= 0) {
          event.preventDefault();
          fn(event);
        }
      };
    }

    /** Select item. */

  }, {
    key: 'selectItem',
    value: function selectItem(millercolumns, item) {
      // Store active chain
      // TODO: if the item is a sibling of the last selection, skip update active chain
      if (item.dataset.root === 'true' && item.dataset.selected !== 'true') {
        millercolumns.storeActiveChain();
      }

      item.dataset.selected = item.dataset.selected === 'true' ? 'false' : 'true';
      item.classList.toggle('app-miller-columns__item--selected');

      // TODO: ensure parents are selected

      millercolumns.updateActiveChain();
    }

    /** Reveal the column associated with a parent item. */

  }, {
    key: 'revealColumn',
    value: function revealColumn(millercolumns, item, column) {
      // Hide columns and remove selections
      millercolumns.hideColumns(millercolumns, column.dataset.level);
      millercolumns.resetAnimation(millercolumns, column);
      if (item.dataset.selected === 'true') {
        column.dataset.collapse = 'false';
        column.classList.remove('app-miller-columns__column--collapse');
        millercolumns.animateColumns(millercolumns, column);
      }
    }

    /** Hides all columns at a higher or equal level with the specified one. */
    /** Remove selections at a higher or equal level with the specified one. */

  }, {
    key: 'hideColumns',
    value: function hideColumns(millercolumns, level) {
      var levelInt = parseInt(level);
      var columnSelectors = [];
      var itemSelectors = [];

      for (var i = levelInt; i <= parseInt(millercolumns.dataset.depth); i++) {
        columnSelectors.push('[data-level=\'' + i.toString() + '\']');
        itemSelectors.push('[data-level=\'' + i.toString() + '\'] li');
      }

      var lists = millercolumns.querySelectorAll(columnSelectors.join(', '));
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = lists[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var item = _step.value;

          item.dataset.collapse = 'true';
          item.classList.add('app-miller-columns__column--collapse');
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      var items = millercolumns.querySelectorAll(itemSelectors.join(', '));
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = items[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var _item = _step2.value;

          _item.dataset.selected = 'false';
          _item.classList.remove('app-miller-columns__item--selected');
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      millercolumns.updateActiveChain();
    }

    /** Add the breadcrumb path using the chain of selected items. */

  }, {
    key: 'updateBreadcrumbs',
    value: function updateBreadcrumbs() {
      var breadcrumbs = document.querySelector('.govuk-breadcrumbs');
      if (breadcrumbs && chains) {
        breadcrumbs.innerHTML = '';
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          for (var _iterator3 = chains[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var chainItem = _step3.value;

            var chainElement = document.createElement('ol');
            chainElement.classList.add('govuk-breadcrumbs__list');
            // TODO: add a remove link to the chainElement
            this.updateChain(chainElement, chainItem);
            breadcrumbs.appendChild(chainElement);
          }
        } catch (err) {
          _didIteratorError3 = true;
          _iteratorError3 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion3 && _iterator3.return) {
              _iterator3.return();
            }
          } finally {
            if (_didIteratorError3) {
              throw _iteratorError3;
            }
          }
        }
      }
    }
  }, {
    key: 'updateChain',
    value: function updateChain(chainElement, chain) {
      chainElement.innerHTML = '';
      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = chain[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var item = _step4.value;

          var breadcrumb = document.createElement('li');
          breadcrumb.innerHTML = item.innerHTML;
          breadcrumb.classList.add('govuk-breadcrumbs__list-item');
          chainElement.appendChild(breadcrumb);
        }
      } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion4 && _iterator4.return) {
            _iterator4.return();
          }
        } finally {
          if (_didIteratorError4) {
            throw _iteratorError4;
          }
        }
      }
    }

    /** Ensure the viewport shows the entire newly expanded item. */

  }, {
    key: 'animateColumns',
    value: function animateColumns(millercolumns, column) {
      var level = column.dataset.level;
      var levelInt = parseInt(level);

      if (levelInt >= parseInt(millercolumns.dataset.depth) - 1) {
        var selectors = [];

        for (var i = 1; i < levelInt; i++) {
          selectors.push('[data-level=\'' + i.toString() + '\']');
        }

        var lists = millercolumns.querySelectorAll(selectors.join(', '));
        var _iteratorNormalCompletion5 = true;
        var _didIteratorError5 = false;
        var _iteratorError5 = undefined;

        try {
          for (var _iterator5 = lists[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
            var item = _step5.value;

            item.classList.add('app-miller-columns__column--narrow');
          }
        } catch (err) {
          _didIteratorError5 = true;
          _iteratorError5 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion5 && _iterator5.return) {
              _iterator5.return();
            }
          } finally {
            if (_didIteratorError5) {
              throw _iteratorError5;
            }
          }
        }
      }
    }

    /** Reset column width. */

  }, {
    key: 'resetAnimation',
    value: function resetAnimation(millercolumns, column) {
      var level = column.dataset.level;
      var levelInt = parseInt(level);

      if (levelInt < parseInt(millercolumns.dataset.depth)) {
        var allLists = millercolumns.querySelectorAll('.app-miller-columns__column');
        var _iteratorNormalCompletion6 = true;
        var _didIteratorError6 = false;
        var _iteratorError6 = undefined;

        try {
          for (var _iterator6 = allLists[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
            var list = _step6.value;

            list.classList.remove('app-miller-columns__column--narrow');
          }
        } catch (err) {
          _didIteratorError6 = true;
          _iteratorError6 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion6 && _iterator6.return) {
              _iterator6.return();
            }
          } finally {
            if (_didIteratorError6) {
              throw _iteratorError6;
            }
          }
        }
      }
    }

    /** Returns a list of the currently selected items. */

  }, {
    key: 'getActiveChain',
    value: function getActiveChain(millercolumns) {
      return millercolumns.querySelectorAll('.app-miller-columns__column li[data-selected="true"]');
    }

    /** Returns a list of the currently selected items. */

  }, {
    key: 'storeActiveChain',
    value: function storeActiveChain() {
      var chain = document.querySelectorAll('.app-miller-columns__column li[data-selected="true"]');

      // Store the current chain in a list
      chains.push(chain);

      // Convert selected items to stored items
      var _iteratorNormalCompletion7 = true;
      var _didIteratorError7 = false;
      var _iteratorError7 = undefined;

      try {
        for (var _iterator7 = chain[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
          var item = _step7.value;

          item.dataset.selected = 'false';
          item.classList.remove('app-miller-columns__item--selected');

          item.dataset.stored = 'true';
          item.classList.add('app-miller-columns__item--stored');
        }
      } catch (err) {
        _didIteratorError7 = true;
        _iteratorError7 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion7 && _iterator7.return) {
            _iterator7.return();
          }
        } finally {
          if (_didIteratorError7) {
            throw _iteratorError7;
          }
        }
      }
    }
  }, {
    key: 'updateActiveChain',
    value: function updateActiveChain() {
      var chain = document.querySelectorAll('.app-miller-columns__column li[data-selected="true"]');

      // Store the current chain in a list
      if (chains[chains.length - 1]) {
        chains[chains.length - 1] = chain;
      } else {
        chains.push(chain);
      }
      this.updateBreadcrumbs();
    }
  }, {
    key: 'list',
    get: function get() {
      var id = this.getAttribute('for');
      if (!id) return;
      var list = document.getElementById(id);
      return list instanceof HTMLUListElement ? list : null;
    }
  }, {
    key: 'breadcrumbs',
    get: function get() {
      var id = this.getAttribute('breadcrumbs');
      if (!id) return;
      var breadcrumbs = document.getElementById(id);
      return breadcrumbs instanceof HTMLDivElement ? breadcrumbs : null;
    }
  }]);

  return MillerColumnsElement;
}(_CustomElement);

if (!window.customElements.get('govuk-miller-columns')) {
  window.MillerColumnsElement = MillerColumnsElement;
  window.customElements.define('govuk-miller-columns', MillerColumnsElement);
}

export default MillerColumnsElement;
