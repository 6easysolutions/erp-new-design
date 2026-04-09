# AddProduct Bug Condition Exploration Test

## Overview

This test suite has been created to explore and validate the styling inconsistencies in the AddProduct component as part of the bugfix specification.

## Test Files Created

1. **`AddProduct.bugCondition.test.jsx`** - Main bug condition exploration test
2. **`simple.test.js`** - Basic test to verify testing infrastructure
3. **`setup.js`** - Test setup configuration

## Test Infrastructure Setup

- **Testing Framework**: Vitest with jsdom environment
- **Property-Based Testing**: fast-check library
- **Component Testing**: @testing-library/react
- **Configuration**: vitest.config.js created with React plugin support

## Bug Condition Test Details

### Purpose
The test is designed to **FAIL on unfixed code** to confirm that styling inconsistencies exist in the AddProduct component.

### Specific Issues Being Tested

1. **Label Color Inconsistency** (Requirement 2.1)
   - Current: Labels use color `#1e293b` (rgb(30, 41, 59))
   - Expected: Labels should use color `#374151` (rgb(55, 65, 81))
   - Test: Checks computed styles of all `.pms-label` elements

2. **Oversized Input Fields** (Requirements 2.2, 2.3)
   - Current: Input fields use `min-height: 48px`
   - Expected: Input fields should use `min-height: 40px`
   - Test: Checks computed styles of `.pms-input`, `.pms-select`, and `.pms-textarea` elements

### Test Structure

#### Test 1: Direct Styling Validation
- Renders AddProduct component
- Queries for form elements using CSS selectors
- Checks computed styles against expected values
- **Expected Result on UNFIXED code**: FAIL (confirms bugs exist)

#### Test 2: Property-Based Testing
- Uses fast-check to generate different component configurations
- Tests styling consistency across multiple scenarios
- Validates that styling issues exist regardless of configuration
- **Expected Result on UNFIXED code**: FAIL (confirms bugs are systematic)

### Expected Counterexamples

When run on the **UNFIXED** code, the test should produce failures like:

```
Label 0 should have consistent color #374151 (rgb(55, 65, 81)), but got: rgb(30, 41, 59)
Form control 0 should have min-height of 40px, but got: 48px
```

These failures will confirm:
1. The root cause analysis is correct
2. The styling issues exist as described in the bugfix specification
3. The test properly detects the inconsistencies

### Running the Test

To run the bug condition exploration test:

```bash
npm test src/test/AddProduct.bugCondition.test.jsx
```

Or with vitest directly:

```bash
npx vitest --run src/test/AddProduct.bugCondition.test.jsx
```

### Expected Workflow

1. **Phase 1 (Current)**: Run test on UNFIXED code
   - Test should FAIL
   - Failures confirm styling issues exist
   - Document counterexamples found

2. **Phase 2 (After Fix)**: Run same test on FIXED code
   - Test should PASS
   - Confirms styling issues are resolved
   - Validates the fix implementation

## Mocking Strategy

The test includes comprehensive mocking to isolate styling concerns:

- **react-router-dom**: Mocked to avoid navigation dependencies
- **axios**: Mocked to prevent API calls during testing
- **react-toastify**: Mocked to avoid toast notifications
- **CKEditor**: Mocked to simplify rich text editor
- **react-select**: Mocked to focus on core styling

This ensures the test focuses purely on the CSS-in-JS styling issues without external dependencies interfering.

## Validation Requirements

**Validates: Requirements 2.1, 2.2, 2.3**

- 2.1: Labels display consistent color #374151
- 2.2: Input fields display with 40px height
- 2.3: Form presents professional, compact appearance

## Next Steps

1. Run the test on unfixed code to confirm failures
2. Document specific counterexamples found
3. Implement the styling fixes in PMSStyles component
4. Re-run the same test to confirm it passes after fixes
5. Update PBT status based on test results