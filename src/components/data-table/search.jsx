import React, { useMemo } from "react";
import { debounce } from "../../utils/debounce";






const SearchFromApi = ({ callback }) => {
  // ⚡ Bolt Optimization: Memoize the debounced function to persist it across renders.
  // Without useMemo, a new debounce instance is created on every render,
  // causing the timeout to be lost and allowing excessive calls to the callback.
  // Expected impact: Reduces callback executions to at most 1 per 700ms during typing,
  // dramatically improving performance when typing in search bars across the app.
  const dataApi = useMemo(() => debounce(callback, 700), [callback]);

  const handleChange = (e) => {
    dataApi(e.target.value?.trim());
  };

  return (
    <>
      <div className="search-set">
        <div className="search-input">
          <span className="btn-searchset ">
            <i className="ti ti-search fs-14 feather-search " />
          </span>
          <div id="DataTables_Table_0_filter" className="dataTables_filter">
            <label>
              {" "}
              <input
                type="search"
                className="form-control form-control-sm d-table-search"
                aria-controls="DataTables_Table_0"
                onChange={handleChange}
                placeholder="Search" />

            </label>
          </div>
        </div>
      </div>
    </>);

};

export default SearchFromApi;