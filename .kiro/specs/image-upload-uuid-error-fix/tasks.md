# Implementation Plan

- [ ] 1. Write bug condition exploration test
  - **Property 1: Fault Condition** - Empty Variant Array SQL Error
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists
  - **Scoped PBT Approach**: Scope the property to concrete failing cases: product updates with empty currentVariantIds array
  - Test that updateProduct with empty currentVariantIds array causes SQL syntax error "invalid input syntax for type uuid: ''"
  - Test implementation details from Fault Condition: `isBugCondition(input)` where `input.currentVariantIds.length == 0 AND input.productHasOldVariants == true`
  - The test assertions should verify that the operation fails with 400 Bad Request error
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the bug exists)
  - Document counterexamples found:
    - Product with 2 old variants, update with empty currentVariantIds → SQL error
    - Product with 3 old variants, all removed in update → 400 Bad Request
    - Product update with image upload and empty variants → operation fails completely
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.1, 1.2, 1.3_

- [ ] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Non-Empty Variant Array Behavior
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for non-buggy inputs (when currentVariantIds contains one or more valid UUIDs)
  - Write property-based tests capturing observed behavior patterns from Preservation Requirements:
    - When currentVariantIds contains 1+ IDs, system deletes only variants NOT in the list
    - Product field updates (name, category, description) work correctly
    - Image processing (upload, delete, update URLs) works correctly
    - Variant management (existing + new variants) works correctly
  - Property-based testing generates many test cases for stronger guarantees
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 3. Fix for empty variant array SQL error

  - [x] 3.1 Implement the fix in updateProduct function
    - Add conditional check before executing variant deletion query
    - If `currentVariantIds.length === 0`: delete all variants using `.delete().eq('product_id', productId)` without `.not()` clause
    - If `currentVariantIds.length > 0`: preserve existing logic with `.not('id', 'in', \`(${currentVariantIds.join(',')})\`)`
    - Remove ineffective fallback `: 0` that doesn't resolve the issue
    - Add code comment explaining why empty array needs special handling
    - _Bug_Condition: isBugCondition(input) where input.currentVariantIds.length == 0 AND input.productHasOldVariants == true_
    - _Expected_Behavior: For empty currentVariantIds, successfully delete all old variants without SQL syntax errors, allowing product update to complete_
    - _Preservation: For non-empty currentVariantIds, maintain exact same selective deletion logic that preserves specified variants_
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 3.4_

  - [ ] 3.2 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Empty Variant Array Handled Correctly
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - Verify that products with empty currentVariantIds update successfully
    - Verify that all old variants are deleted when currentVariantIds is empty
    - Verify that no SQL syntax errors occur
    - _Requirements: 2.1, 2.2, 2.3_

  - [ ] 3.3 Verify preservation tests still pass
    - **Property 2: Preservation** - Non-Empty Variant Array Behavior Unchanged
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all tests still pass after fix (no regressions)
    - Verify selective deletion logic works identically for non-empty arrays
    - Verify product field updates, image processing, and variant management unchanged
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
