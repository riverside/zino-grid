/**
 * Javascript Grid Web Component v1.0.3
 *
 * https://github.com/riverside/zino-grid
 *
 * Copyright 2018-2020, Dimitar Ivanov
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 */
"use strict";

const template = document.createElement("template");

template.innerHTML = `
    <link rel="stylesheet" href="https://unpkg.com/font-awesome@4.7.0/css/font-awesome.min.css">
    <link rel="stylesheet" href="https://unpkg.com/zino-grid@1.0.2/zino-grid.css">
    <div class="wrap" dir="ltr">
        <div class="wrap-head">
            <table role="grid" id="grid-head">
                <thead role="rowgroup">
                    <tr role="row" aria-rowindex="1"></tr>
                    <tr role="row" aria-rowindex="2"></tr>
                </thead>
            </table>
        </div>
        <div class="wrap-body">
            <table role="grid" id="grid-body">
                <tbody role="rowgroup"></tbody>
            </table>
        </div>
        <div class="wrap-foot">
            <table role="grid" id="grid-foot" style="display: none">
                <tfoot role="rowgroup">
                    <tr role="row" aria-rowindex="1">
                        <td role="gridcell" aria-colindex="1" colspan="1">
                            Go to <input type="number" class="goto-page" min="1" step="1"> page
                        </td>
                        <td role="gridcell" aria-colindex="2" colspan="1">
                            <button type="button" class="btn-first" title="Go to first page" aria-label="Go to first page" disabled><i class="fa fa-step-backward"></i></button>
                            <button type="button" class="btn-prev" title="Go to prev page" aria-label="Go to prev page" disabled><i class="fa fa-backward"></i></button>
                            <button type="button" class="btn-next" title="Go to next page" aria-label="Go to next page" disabled><i class="fa fa-forward"></i></button>
                            <button type="button" class="btn-last" title="Go to last page" aria-label="Go to last page" disabled><i class="fa fa-step-forward"></i></button>
                            <button type="button" class="btn-refresh" title="Refresh" aria-label="Refresh"><i class="fa fa-refresh"></i></button>
                            <select class="per-page">
                                <option value="5">5</option>
                                <option value="10">10</option>
                                <option value="20">20</option>
                                <option value="50">50</option>
                                <option value="100">100</option>
                                <option value="200">200</option>
                            </select>
                        </td>
                        <td role="gridcell" aria-colindex="3" colspan="1">
                            <span class="low"></span> - <span class="high"></span> of <span class="total"></span> items
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>
    </div>`;

class ZinoGrid extends HTMLElement {
    constructor(options={}) {
        super();

        this.state = {
            page: 1,
            perPage: 5,
            debug: false,
            filter: false,
            sort: false,
            reorder: false,
            dir: "ltr"
        };
        this.data = [];
        this._data = [];
        this.columns = [];

        const shadowRoot = this.attachShadow({
            mode: "open"
        });

        shadowRoot.appendChild(template.content.cloneNode(true));

        for (const [key, value] of Object.entries(options)) {
            if (key in this) {
                this[key] = value;
                this.state[key] = value;
            }
        }

        this.log("constructor");
    }
    static get observedAttributes() {
        return ["data-url", "data-page", "data-per-page", "data-debug", "data-filter", "data-sort", "data-dir", "data-reorder"];
    }
    get page() {
        return this.getAttribute("data-page");
    }
    set page(val) {
        this.setAttribute("data-page", val);
    }
    get perPage() {
        return this.getAttribute("data-per-page");
    }
    set perPage(val) {
        this.setAttribute("data-per-page", val);
    }
    get debug() {
        return (this.getAttribute("data-debug") === "true");
    }
    set debug(val) {
        this.setAttribute("data-debug", val);
    }
    get dir() {
        return this.getAttribute("data-dir");
    }
    set dir(val) {
        val = val.toString().toLowerCase();
        if (["ltr", "rtl"].includes(val)) {
            this.setAttribute("data-dir", val);
        }
    }
    get filter() {
        return (this.getAttribute("data-filter") === "true");
    }
    set filter(val) {
        this.setAttribute("data-filter", val);
    }
    get reorder() {
        return (this.getAttribute("data-reorder") === "true");
    }
    set reorder(val) {
        this.setAttribute("data-reorder", val);
    }
    get sort() {
        return (this.getAttribute("data-sort") === "true");
    }
    set sort(val) {
        this.setAttribute("data-sort", val);
    }
    get url() {
        return this.getAttribute("data-url");
    }
    set url(val) {
        this.setAttribute("data-url", val);
    }
    connectedCallback() {

        this.log("connectedCallback");

        this.btnFirst = this.shadowRoot.querySelector(".btn-first");
        this.btnPrev = this.shadowRoot.querySelector(".btn-prev");
        this.btnNext = this.shadowRoot.querySelector(".btn-next");
        this.btnLast = this.shadowRoot.querySelector(".btn-last");
        this.btnRefresh = this.shadowRoot.querySelector(".btn-refresh");
        this.selectPerPage = this.shadowRoot.querySelector(".per-page");
        this.inputPage = this.shadowRoot.querySelector(".goto-page");

        this.getFirst = this.getFirst.bind(this);
        this.getPrev = this.getPrev.bind(this);
        this.getNext = this.getNext.bind(this);
        this.getLast = this.getLast.bind(this);
        this.refresh = this.refresh.bind(this);
        this.changePerPage = this.changePerPage.bind(this);
        this.gotoPage = this.gotoPage.bind(this);

        this.btnFirst.addEventListener("click", this.getFirst);
        this.btnPrev.addEventListener("click", this.getPrev);
        this.btnNext.addEventListener("click", this.getNext);
        this.btnLast.addEventListener("click", this.getLast);
        this.btnRefresh.addEventListener("click", this.refresh);
        this.selectPerPage.addEventListener("change", this.changePerPage, {passive: true});
        this.inputPage.addEventListener("input", this.gotoPage);
    }
    disconnectedCallback() {
        this.log("disconnectedCallback");

        this.btnFirst.removeEventListener("click", this.getFirst);
        this.btnPrev.removeEventListener("click", this.getPrev);
        this.btnNext.removeEventListener("click", this.getNext);
        this.btnLast.removeEventListener("click", this.getLast);
        this.btnRefresh.removeEventListener("click", this.refresh);
        this.selectPerPage.removeEventListener("change", this.changePerPage, {passive: true});
        this.inputPage.removeEventListener("input", this.gotoPage);
    }
    /*adoptedCallback(oldDocument, newDocument) {
        this.log("adoptedCallback");
    }*/
    attributeChangedCallback(attributeName, oldValue, newValue, namespace) {
        this.log("attributeChangedCallback", attributeName);
        switch (attributeName) {
        case "data-url":
            this.state.url = newValue;
            this.loadData();
            break;
        case "data-page":
            this.state.page = Number(newValue);
            this.fixPage();
            this.updateGoto();
            this.paginate();
            break;
        case "data-per-page":
            this.state.perPage = Number(newValue);
            let element;
            if (this.selectPerPage) {
                element = this.selectPerPage;
            } else {
                element = this.shadowRoot.querySelector(".per-page");
            }
            element.value = newValue;
            this.state.pages = Math.ceil(this.state.total / this.state.perPage);
            if (this.inputPage) {
                this.inputPage.setAttribute("max", this.state.pages);
            } else {
                this.shadowRoot.querySelector(".goto-page").setAttribute("max", this.state.pages);
            }
            this.fixPage();
            this.updateGoto();
            this.paginate();
            break;
        case "data-debug":
            this.state.debug = (newValue === "true");
            break;
        case "data-dir":
            this.state.dir = newValue;
            this.shadowRoot.querySelector(".wrap").dir = this.state.dir;
            break;
        case "data-filter":
            this.state.filter = (newValue === "true");
            this.toggleFilter();
            break;
        case "data-reorder":
            this.state.reorder = (newValue === "true");
            this.toggleReorder();
            break;
        case "data-sort":
            this.state.sort = (newValue === "true");
            this.toggleSort();
            break;
        }
    }
    fixPage() {
        if (this.state.pages < this.state.page) {
            this.state.page = this.state.pages;
        }

        if (this.state.page < 1) {
            this.state.page = 1;
        }
    }
    toggleFilter() {
        const row = this.shadowRoot.querySelector("#grid-head tr[aria-rowindex='2']");
        if (this.state.filter) {
            row.classList.remove("hidden");
        } else {
            row.classList.add("hidden");
        }
    }
    toggleReorder() {
        let that = this;
        [].forEach.call(this.shadowRoot.querySelectorAll("#grid-head tr[aria-rowindex='1'] th"), function (th) {
            if (that.state.reorder) {
                th.draggable = true;
            } else {
                th.removeAttribute("draggable");
            }
        });
    }
    toggleSort() {
        let that = this;
        [].forEach.call(this.shadowRoot.querySelectorAll("#grid-head tr[aria-rowindex='1'] th"), function (th) {
            if (that.state.sort) {
                th.setAttribute("aria-sort", "none");
            } else {
                th.removeAttribute("aria-sort");
            }
        });
    }
    updateGoto() {
        let element;
        if (this.inputPage) {
            element = this.inputPage;
        } else {
            element = this.shadowRoot.querySelector(".goto-page");
        }
        element.value = this.state.page;
        element.disabled = this.state.pages === 1;
    }
    loadData() {
        this.log("loadData");
        let that = this;
        this.fetchData().then(function (data) {
            that.data = data;
            that._data = data.slice();
            that.state.pages = Math.ceil(data.length / that.state.perPage);
            that.fixPage();
            that.state.total = data.length;
            that.shadowRoot.querySelector("#grid-body").setAttribute("aria-rowcount", data.length);
            that.renderData.call(that);
        });
    }
    getFirst() {
        this.page = 1;
    }
    getLast() {
        this.page = this.state.pages;
    }
    getPrev() {
        this.page = this.state.page - 1;
    }
    getNext() {
        this.page = this.state.page + 1;
    }
    refresh() {
        this.loadData();
    }
    changePerPage() {
        this.perPage = this.selectPerPage.options[this.selectPerPage.selectedIndex].value;
    }
    gotoPage(event) {
        if (event.type === "keypress") {
            const key = event.which || event.keyCode;
            if (key === 13) {
                event.preventDefault();
            } else {
                return;
            }
        }
        this.page = this.inputPage.value;
    }
    filterData() {
        this.log("filter data");

        const that = this;
        this.data = this._data.slice();

        [].forEach.call(this.shadowRoot.querySelectorAll("#grid-head input"), function (input) {
            let value = input.value;
            if (value) {
                let name = input.name;
                that.data = that.data.filter(item => {
                    let str = item[name] + "";
                    return str.toLowerCase().indexOf(value.toLowerCase()) !== -1;
                });
            }
        });

        this.state.pages = Math.ceil(this.data.length / this.state.perPage);
        this.state.total = this.data.length;
        this.page = 1;


        let col = this.shadowRoot.querySelector("#grid-head tr[aria-rowindex='1'] th[aria-sort$='scending']");
        if (this.state.sort && col) {
            this.sortData(col);
        } else {
            this.renderBody();
        }
    }
    sortData(col) {
        this.log("sort data");

        [].forEach.call(this.shadowRoot.querySelectorAll("#grid-head tr:first-child th"), function (th) {
            if (th !== col) {
                th.setAttribute("aria-sort", "none");
            }
        });

        if (!col.hasAttribute("aria-sort") || col.getAttribute("aria-sort") === "none") {
            col.setAttribute("aria-sort", "ascending");
        } else if (col.getAttribute("aria-sort") === "ascending") {
            col.setAttribute("aria-sort", "descending");
        } else if (col.getAttribute("aria-sort") === "descending") {
            col.setAttribute("aria-sort", "none");
        }

        const sort = col.getAttribute("aria-sort");
        if (sort === "none") {
            //this.data = this._data.slice();
            let that = this;
            let stack = [];
            this._data.some(function (itemA) {
                that.data.some(function (itemB) {
                    if (JSON.stringify(itemA) === JSON.stringify(itemB)) {
                        stack.push(itemB);
                        return true;
                    }
                    return false;
                });
                return stack.length === that.data.length;
            });

            this.data = stack;
        } else {
            const field = col.getAttribute("data-field");
            this.data.sort(function (a, b) {

                if (!isNaN(a[field]) && !isNaN(b[field])) {
                    return sort === "ascending" ? a[field] - b[field] : b[field] - a[field];
                }

                const valueA = sort === "ascending" ? a[field].toUpperCase() : b[field].toUpperCase();
                const valueB = sort === "ascending" ? b[field].toUpperCase() : a[field].toUpperCase();

                if (valueA > valueB) {
                    return 1;
                }

                if (valueA < valueB) {
                    return -1;
                }

                return 0;
            });
        }

        this.renderBody();
    }
    fetchData() {
        let url = new URL(this.url, window.location.href);
        const params = {
            r: Math.ceil(Math.random() * 9999999)
        };

        Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

        return fetch(url).then(function (response) {
            return response.json();
        });
    }
    renderData() {
        this.log("render data");
        let tr;
        let th;
        let input;
        const that = this;
        const table = this.shadowRoot.querySelector("#grid-head");
        const thead = table.querySelector("thead");
        this.columns = Object.keys(this._data[0]);

        tr = document.createElement("tr");
        tr.setAttribute("role", "row");
        tr.setAttribute("aria-rowindex", 1);
        [].forEach.call(this.columns, function (column, i) {
            th = document.createElement("th");
            th.setAttribute("role", "columnheader button");
            th.setAttribute("aria-colindex", i + 1);
            if (that.state.sort) {
                th.setAttribute("aria-sort", column !== "id" ? "none" : "ascending");
            }
            th.setAttribute("data-field", column);
            th.tabIndex = 0;
            th.textContent = column;
            if (that.state.reorder) {
                th.draggable = true;
            }
            th.addEventListener("dragstart", function (e) {
                e.dataTransfer.effectAllowed = "move";
                e.dataTransfer.setData("text/plain", e.target.getAttribute("aria-colindex"));
            });
            th.addEventListener("dragover", function (e) {
                if (e.preventDefault) {
                    e.preventDefault();
                }
                e.dataTransfer.dropEffect = "move";
                return false;
            });
            th.addEventListener("drop", function (e) {
                if (e.stopPropagation) {
                    e.stopPropagation();
                }
                const index = e.dataTransfer.getData("text/plain");
                const targetIndex = e.target.getAttribute("aria-colindex");

                if (index === targetIndex) {
                    return;
                }

                const tmp = that.columns[index - 1];
                that.columns[index - 1] = that.columns[targetIndex - 1];
                that.columns[targetIndex - 1] = tmp;

                let node = this;
                while (node.nodeName !== "#document-fragment") {
                    node = node.parentNode;
                }

                const swapNodes = function (selector, el1) {
                    const rowIndex = el1.parentNode.getAttribute("aria-rowindex");
                    const el2 = node.querySelector(selector + " tr[aria-rowindex='" + rowIndex + "'] [aria-colindex='" + targetIndex + "']");
                    el1.setAttribute("aria-colindex", targetIndex);
                    el2.setAttribute("aria-colindex", index);
                    const newNode = document.createElement("th");
                    el1.parentNode.insertBefore(newNode, el1);
                    el2.parentNode.replaceChild(el1, el2);
                    newNode.parentNode.replaceChild(el2, newNode);
                };

                [].forEach.call(node.querySelectorAll("#grid-head th[aria-colindex='" + index + "']"), function (el1) {
                    swapNodes("#grid-head", el1);
                });

                [].forEach.call(node.querySelectorAll('#grid-body td[aria-colindex="' + index + '"]'), function (el1) {
                    swapNodes("#grid-body", el1);
                });

                return false;
            });
            tr.appendChild(th);
        });
        thead.replaceChild(tr, thead.querySelector("tr[aria-rowindex='1']"));

        [].forEach.call(thead.querySelectorAll("[aria-sort]"), function (btn) {
            btn.addEventListener("click", function () {
                that.sortData.call(that, this);
            });
        });

        // Filters
        tr = document.createElement("tr");
        tr.setAttribute("role", "row");
        tr.setAttribute("aria-rowindex", "2");
        if (!this.state.filter) {
            tr.classList.add("hidden");
        }
        [].forEach.call(this.columns, function (column, i) {
            th = document.createElement("th");
            th.setAttribute("aria-colindex", i + 1);
            input = document.createElement("input");
            input.type = "text";
            input.autocomplete = "off";
            input.spellcheck = false;
            input.name = column;
            if (!that.state.filter) {
                th.tabIndex = 0;
            } else {
                input.tabIndex = 0;
            }
            th.appendChild(input);
            tr.appendChild(th);
        });
        thead.replaceChild(tr, thead.querySelector("tr[aria-rowindex='2']"));

        [].forEach.call(thead.querySelectorAll("input"), function(input) {
            input.addEventListener("keypress", function(event) {
                const key = event.which || event.keyCode;
                if (key === 13) {
                    that.filterData.call(that);
                }
            });
        });

        table.setAttribute("aria-colcount", this.columns.length.toString());

        this.renderBody();

        this.shadowRoot.querySelector("#grid-foot").style.display = "";
    }
    renderBody() {
        this.log("render body");
        let tr;
        let td;
        const that = this;
        const table = this.shadowRoot.querySelector("#grid-body");
        const tbody = document.createElement("tbody");

        [].forEach.call(this.data, function(item, i) {
            tr = document.createElement("tr");
            tr.setAttribute("role", "row");
            tr.setAttribute("aria-rowindex", i + 1);
            tr.tabIndex = 0;
            [].forEach.call(that.columns, function(column, j) {
                td = document.createElement("td");
                td.setAttribute("role", "gridcell");
                td.setAttribute("aria-colindex", j + 1);
                td.tabIndex = -1;
                td.textContent = item[column];
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });

        tbody.setAttribute("role", "rowgroup");
        table.replaceChild(tbody, table.querySelector("tbody"));
        this.paginate();
    }
    paginate() {
        /*if (!this.data.length) {
            return;
        }*/
        this.log("paginate");
        let index;
        let high = this.state.page * this.state.perPage;
        let low = high - this.state.perPage + 1;
        const tbody = this.shadowRoot.querySelector("#grid-body tbody");
        const tfoot = this.shadowRoot.querySelector("#grid-foot tfoot");

        if (high > this.state.total) {
            high = this.state.total;
        }
        if (!this.state.total) {
            low = 0;
        }

        [].forEach.call(tbody.querySelectorAll("tr"), function(row) {
            index = Number(row.getAttribute("aria-rowindex"));
            if (index > high || index < low) {
                row.classList.add("hidden");
            } else {
                row.classList.remove("hidden");
            }
        });

        if (this.btnFirst) {
            this.btnFirst.disabled = this.state.page <= 1;
            this.btnPrev.disabled = this.state.page <= 1;
            this.btnNext.disabled = this.state.page >= this.state.pages;
            this.btnLast.disabled = this.state.page >= this.state.pages;
        }

        tfoot.querySelector(".low").textContent = low.toString();
        tfoot.querySelector(".high").textContent = high.toString();
        tfoot.querySelector(".total").textContent = this.data.length.toString();
    }
    log() {
        if (this.debug) {
            console.log.apply(console, arguments);
        }
    }
}

if (typeof customElements !== "undefined") {
    customElements.define("zino-grid", ZinoGrid);
}

export { ZinoGrid };
