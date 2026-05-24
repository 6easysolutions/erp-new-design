import React, { useRef, useEffect } from "react";
import { debounce } from "../../utils/debounce";






const SearchFromApi = ({ callback }) => {
  // Use a ref to store the latest callback so we don't recreate the debounced function
  // every time the callback changes (which happens often when passed inline).
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Create the debounced function only once.
  // We use 700ms to match the previous implementation.
  // Using useRef ensures that this debounced function maintains its internal timer
  // state across re-renders, preventing duplicate API calls when the parent re-renders.
  const dataApi = useRef(
    debounce((val) => {
      if (callbackRef.current) {
        callbackRef.current(val);
      }
    }, 700)
  ).current;

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