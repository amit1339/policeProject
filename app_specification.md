# App Specification: Cognitive Test Preparation Platform

## 1. System Overview
This is a single-page web application (SPA) designed to help users prepare for cognitive and logical reasoning tests. The application provides a streamlined user flow consisting of category selection, dynamic question generation, and immediate performance feedback.

## 2. User Flow & UI Requirements
* **Initial Screen:** A landing page displaying two distinct test options:
  1. Series Test (Mathematical Number Patterns)
  2. Matrices Test (Visual Shape Patterns)
* **Question Interface:** Upon selecting a category, the user is presented with a single question prompt and exactly 5 multiple-choice answers.
* **Feedback Mechanism:** After the user clicks an answer, the application must immediately evaluate the selection, display a "Correct" or "Incorrect" indicator, and highlight the correct answer before allowing the user to click "Next Question".

## 3. Module Specifications

### Module A: Matrices Test (Visual Sequences)
* **Grid Format:** The test consists of a 3x3 matrix containing 9 shapes. The bottom-right shape is always missing (replaced by a '?'). 
* **User Goal:** The user must deduce the underlying logic across the rows and/or columns to select the correct missing shape from 5 generated options.
* **Element Variables:** The generated shapes can vary by base shape type, color, size, and line style (solid, dashed, etc.).
* **Generation Engine Logic Rules:** The system must generate grids based on one (or a combination) of the following logical patterns:
    1. **Rotation/Permutation:** The elements in a row/column remain the same but swap positions.
    2. **Movement:** Internal elements or lines shift progressively (e.g., a line moves closer to the center across the sequence).
    3. **Addition:** A specific element or part is progressively added to the base shape across the sequence.
    4. **Deletion:** A specific element or part is progressively removed from the base shape.
    5. **Union (A + B = C):** Combining the first two shapes in a row/column directly creates the third shape.
    6. **Subtraction (A - B = C):** Subtracting the elements of the second shape from the first shape leaves the third shape.
    7. **Transformation:** The base shapes undergo a systematic change (e.g., rotating by 90 degrees, mirroring, or changing line type).
    8. **Arithmetic/Math representation:** Shapes represent numerical values, and two shapes in a row form a math equation whose result dictates the third shape.
    9. **XOR Logic (Symmetric Difference):** Elements that are common to both the first and second shapes are deleted; only the unique, non-overlapping elements from both are combined to form the third shape.
    * **Progressive Difficulty:** As the user advances, the engine should combine multiple rules into a single matrix (e.g., Addition + Rotation simultaneously).

### Module B: Number Series Test (Mathematical)
* **Question Format:** Users are presented with a sequence of numbers (e.g., `3, 6, 12, 24, 48, 96, ?`) and must deduce the underlying mathematical rule to find the missing value among 5 numerical options.
* **Generation Engine Logic Rules:** The backend should dynamically generate these sequences based on:
    1. **Difference-Based Series:**
        * *Constant Differences:* Fixed operation between numbers (+2, x2).
        * *Variable Differences:* The gap changes systematically (+1, +2, +3).
        * *Composite Operations:* Two distinct operations per step (x1+1, x2+2).
        * *Alternating Operations:* Switching between two operations (+5, -2, +5, -2).
    2. **Multi-Tiered Differences (Floors):** The primary sequence differences form their own sequence. The pattern is only revealed at the 2nd or 3rd level of differences.
    3. **Interleaved Series:** Two separate mathematical series woven into one long sequence (minimum 8 numbers). Characterized by non-linear ups and downs.
    4. **Fibonacci-Style Series:**
        * *Standard:* A number is the sum/result of the two preceding numbers.
        * *Offset Fibonacci:* Standard math rules apply for the first few steps before the recursive Fibonacci logic begins.

## 4. Tech Stack & Implementation Notes
* **Frontend:** React (or plain HTML/JS/CSS depending on agent choice). Tailwind CSS for styling.
* **Matrices Rendering:** Use dynamic SVGs to draw the 3x3 grids and shapes so they can be procedurally generated without needing static image files.
* **Distractors:** For both modules, the 4 incorrect answers must be logically sound "near-misses" to ensure the test is challenging.