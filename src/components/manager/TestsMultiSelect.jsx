// src/components/manager/TestsMultiSelect.jsx
import React, { useState, useRef, useEffect } from "react";
import { Select, Checkbox, Input, Button, Space, Badge } from 'antd';
import { 
  FaSearch, 
  FaFileAlt, 
  FaChevronDown, 
  FaCheck, 
  FaTimes,
  FaFilter
} from "react-icons/fa";
import { 
  HiOutlineSelector,
  HiOutlineCheckCircle 
} from "react-icons/hi";

const { Option } = Select;
const { Search } = Input;

/**
 * Simple dropdown multi-select. Hardcoded tests if none passed.
 * For PR1 the tests list is hardcoded to test1/test2/test3 (per request).
 */
const HARDCODED_TESTS = [
  { id: "t1", title: "test1 — Red Process", description: "Security assessment test" },
  { id: "t2", title: "test2 — Green Brief", description: "Compliance verification" },
  { id: "t3", title: "test3 — Mixed", description: "General knowledge evaluation" },
];

export default function TestsMultiSelect({ tests = HARDCODED_TESTS, value = [], onChange = () => {} }) {
  const [search, setSearch] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const ref = useRef();

  // Filter tests based on search
  const filteredTests = tests.filter(test =>
    test.title.toLowerCase().includes(search.toLowerCase()) ||
    test.description?.toLowerCase().includes(search.toLowerCase())
  );

  function toggle(id) {
    if (value.includes(id)) {
      onChange(value.filter((x) => x !== id));
    } else {
      onChange([...value, id]);
    }
  }

  function selectAll() {
    onChange(filteredTests.map(test => test.id));
  }

  function clearAll() {
    onChange([]);
  }

  function getSelectedTitles() {
    return tests
      .filter(test => value.includes(test.id))
      .map(test => test.title.split(' — ')[0])
      .join(', ');
  }

  // Function to handle Done button click
  function handleDone() {
    setDropdownVisible(false);
    // Blur the active element to close the dropdown
    document.activeElement?.blur();
  }

  // Custom dropdown render for better mobile experience
  const dropdownRender = (menu) => (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold text-gray-900 text-sm">Select Tests</h4>
          <Space size="small">
            <Button 
              type="link" 
              size="small" 
              onClick={selectAll}
              className="text-indigo-600 hover:text-indigo-700 p-0 h-auto text-xs"
            >
              Select All
            </Button>
            <Button 
              type="link" 
              size="small" 
              onClick={clearAll}
              className="text-gray-600 hover:text-gray-700 p-0 h-auto text-xs"
            >
              Clear
            </Button>
          </Space>
        </div>
        
        {/* Search */}
        <Search
          placeholder="Search tests..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          className="mb-1"
          prefix={<FaSearch className="text-gray-400" />}
        />
      </div>

      {/* Tests List */}
      <div className="max-h-48 overflow-y-auto">
        {filteredTests.length === 0 ? (
          <div className="text-center py-6 px-4">
            <FaFileAlt className="w-8 h-8 mx-auto text-gray-300 mb-2" />
            <p className="text-sm text-gray-500">No tests found</p>
          </div>
        ) : (
          <div className="p-1">
            {filteredTests.map((test) => (
              <div
                key={test.id}
                className={`flex items-start gap-2 p-2 rounded-lg cursor-pointer transition-all duration-200 ${
                  value.includes(test.id)
                    ? 'bg-indigo-50 border border-indigo-100'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => toggle(test.id)}
              >
                <Checkbox
                  checked={value.includes(test.id)}
                  className="mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 text-sm leading-tight">
                    {test.title}
                  </div>
                  {test.description && (
                    <div className="text-xs text-gray-500 mt-0.5 leading-tight">
                      {test.description}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600">
            {value.length} of {tests.length} selected
          </span>
          <Button 
            type="primary" 
            size="small"
            onClick={handleDone}
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  );

  // Mobile drawer component
  const MobileDrawer = () => {
    if (!mobileOpen) return null;

    return (
      <div className="fixed inset-0 z-50 lg:hidden">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black bg-opacity-50"
          onClick={() => setMobileOpen(false)}
        />
        
        {/* Drawer */}
        <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[80vh] overflow-hidden">
          {/* Handle */}
          <div className="flex justify-center p-2">
            <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
          </div>

          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Select Tests</h3>
              <Button 
                type="text" 
                icon={<FaTimes />}
                onClick={() => setMobileOpen(false)}
              />
            </div>
            
            {/* Search */}
            <Search
              placeholder="Search tests..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              size="large"
              prefix={<FaSearch className="text-gray-400" />}
            />
          </div>

          {/* Actions */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <Space size="middle">
              <Button 
                type="link" 
                onClick={selectAll}
                className="text-indigo-600 hover:text-indigo-700 p-0"
              >
                Select All
              </Button>
              <Button 
                type="link" 
                onClick={clearAll}
                className="text-gray-600 hover:text-gray-700 p-0"
              >
                Clear All
              </Button>
            </Space>
          </div>

          {/* Tests List */}
          <div className="flex-1 overflow-y-auto max-h-96 p-4">
            {filteredTests.length === 0 ? (
              <div className="text-center py-8">
                <FaFileAlt className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">No tests found</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredTests.map((test) => (
                  <div
                    key={test.id}
                    className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                      value.includes(test.id)
                        ? 'bg-indigo-50 border-indigo-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => toggle(test.id)}
                  >
                    <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      value.includes(test.id)
                        ? 'bg-indigo-600 border-indigo-600'
                        : 'border-gray-300 bg-white'
                    }`}>
                      {value.includes(test.id) && (
                        <FaCheck className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900">
                        {test.title}
                      </div>
                      {test.description && (
                        <div className="text-sm text-gray-500 mt-1">
                          {test.description}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">
                {value.length} of {tests.length} selected
              </span>
            </div>
            <Button 
              type="primary" 
              size="large" 
              block
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2"
            >
              <HiOutlineCheckCircle className="w-4 h-4" />
              Apply Selection
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full" ref={ref}>
      {/* Desktop Version with Ant Design */}
      <div className="hidden lg:block">
        <Select
          mode="multiple"
          placeholder="Select tests..."
          value={value}
          onChange={onChange}
          dropdownRender={dropdownRender}
          className="w-full min-w-[200px]"
          size="large"
          suffixIcon={<FaChevronDown className="text-gray-400" />}
          maxTagCount="responsive"
          showSearch={false} // We handle search in dropdownRender
          open={dropdownVisible}
          onDropdownVisibleChange={setDropdownVisible}
          dropdownMatchSelectWidth={false}
          dropdownStyle={{ 
            width: '400px',
            maxWidth: '90vw'
          }}
          tagRender={(props) => (
            <Badge 
              count={value.length} 
              size="small" 
              offset={[5, -5]}
            >
              <div className="ant-select-selection-item">
                <span className="ant-select-selection-item-content">
                  {props.label}
                </span>
              </div>
            </Badge>
          )}
        >
          {tests.map(test => (
            <Option key={test.id} value={test.id}>
              <div className="flex flex-col">
                <span className="font-medium">{test.title}</span>
                <span className="text-xs text-gray-500">{test.description}</span>
              </div>
            </Option>
          ))}
        </Select>
      </div>

      {/* Mobile Version */}
      <div className="lg:hidden">
        <Button
          onClick={() => setMobileOpen(true)}
          size="large"
          className="w-full h-12 flex items-center justify-between bg-white border-gray-300 hover:border-gray-400"
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <FaFilter className="text-gray-400 flex-shrink-0" />
            <div className="flex-1 min-w-0 text-left">
              {value.length > 0 ? (
                <div>
                  <div className="font-medium text-gray-900 text-sm truncate">
                    {getSelectedTitles()}
                  </div>
                  <div className="text-xs text-gray-500">{value.length} test(s) selected</div>
                </div>
              ) : (
                <div className="text-gray-500">Select tests...</div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            {value.length > 0 && (
              <Badge 
                count={value.length} 
                size="small" 
                style={{ backgroundColor: '#4f46e5' }}
              />
            )}
            <FaChevronDown className="text-gray-400" />
          </div>
        </Button>

        <MobileDrawer />
      </div>

      {/* Selected tests summary for mobile */}
      {value.length > 0 && (
        <div className="lg:hidden mt-2">
          <div className="flex flex-wrap gap-1">
            {tests
              .filter(test => value.includes(test.id))
              .map(test => (
                <span
                  key={test.id}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full"
                >
                  {test.title.split(' — ')[0]}
                  <button
                    onClick={() => toggle(test.id)}
                    className="hover:text-indigo-900"
                  >
                    <FaTimes className="w-3 h-3" />
                  </button>
                </span>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}