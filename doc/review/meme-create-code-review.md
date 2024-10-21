# Meme Creator Feature Review

**Reviewer:** Bilal

**Date:** October 21, 2024

---

## Overview

The Meme Creator feature allows users to:

- **Upload an image** to use as the base of their meme.
- **Add a description** for their meme.
- **Add multiple captions** for the meme.
- **Submit the meme** and be redirected to the homepage to view it.

Currently, the feature has been partially implemented but remains unfinished. This review identifies what's not working and how it should work to complete the functionality.

## Issues Identified

### Minimal Functional Requirements

These are the essential features needed to make the Meme Creator functional.

#### 1. Missing Submission Logic

**Problem**

The `Submit` button lacks functionality. Clicking it does not result in any action, and the meme data (image, description, captions) is not sent to the backend API. Consequently, users cannot save their memes or see them on the homepage.

**Expected Behavior**

- **When the `Submit` button is clicked**:
  - The app should collect all meme data: the uploaded image, description, and captions.
  - The data should be sent to the backend API to create a new meme.
  - Upon successful submission, the user should be redirected to the homepage.
  - The newly created meme should appear in the meme feed on the homepage.

#### 2. Captions Not Updating

**Problem**

Editing the caption text in the input fields does not update the captions displayed on the meme image. Changes made by the user are not reflected in the meme preview or in the data intended for submission.

**Expected Behavior**

- **As users type or edit caption text**:
  - The corresponding caption should update in the application's state.
  - The updated captions should be included when submitting the meme.

#### 3. Missing API Function for Meme Creation

**Problem**

There is no API function (`createMeme`) implemented in `src/api.ts` to handle sending the meme data to the backend server. Without it, the application cannot communicate with the backend to save new memes.

**Expected Behavior**

- **An API function should exist to**:
  - Send a `POST` request to the backend endpoint responsible for meme creation.
  - Include all necessary data: image file, description, captions.
  - Handle authentication by including the user's token in the request headers.
  - Process the server's response and handle any errors appropriately.

#### 4. Missing Imports and Dependencies

**Problem**

Some required hooks and functions, such as `useAuthToken`, `useNavigate`, and the `createMeme` API function, are not imported or defined in `create.tsx`. This leads to errors and prevents the application from functioning as intended.

**Expected Behavior**

- **All necessary imports should be included**:
  - Ensure that all hooks from React and React Router are imported.
  - Import the `createMeme` function from `src/api.ts`.

#### 5. Lack of Error Handling and Validation

**Problem**

The application does not provide feedback when required inputs are missing or invalid. Users can attempt to submit a meme without uploading an image, adding a description, or including captions, leading to potential errors and confusion.

**Expected Behavior**

- **Input Validation**:
  - The application should validate that an image is uploaded.
  - It should ensure that a description is provided.
  - At least one caption should be added before allowing submission.
- **User Feedback**:
  - If required inputs are missing, inform the user with appropriate messages.
  - Disable the `Submit` button until all necessary inputs are valid.
- **Error Handling**:
  - If an error occurs during submission (e.g., network error), display an error message to the user.
  - Provide guidance on how to resolve the issue or retry.

### Bonus Features (Additional Enhancements)

These are enhancements that improve the user experience but are not critical for basic functionality.

#### 6. Captions Cannot Be Positioned

**Problem**

Users cannot position captions on the image. Captions are added with random positions, and there is no interface to move them. This restricts users from placing captions where they desire on the meme.

**Expected Behavior**

- **Users should be able to**:
  - Drag and drop captions on the image to position them precisely.
  - See immediate visual feedback as they move captions.
- **The application should**:
  - Update the positions (x and y coordinates) of captions in the state as they are moved.
  - Use the final positions when rendering the meme preview and when submitting the meme data.

## Recommendations

To resolve the issues identified, the following steps should be taken:

### Implement Minimal Functional Requirements

1. **Implement Submission Logic**:

   - Add an `onClick` handler to the `Submit` button.
   - Collect all meme data (image, description, captions) when the button is clicked.
   - Use a function to send this data to the backend API.
   - Upon successful submission, redirect the user to the homepage.

2. **Update Caption Inputs to Reflect Changes**:

   - Link the caption input fields to the application's state.
   - Ensure that changes in the input fields update the captions in the state.
   - Maintain synchronization between the input values and the captions' data.

3. **Create the `createMeme` API Function**:

   - Implement an API function in `src/api.ts` to handle meme creation.
   - Ensure it sends the correct data to the backend and handles authentication.
   - Include error handling for unsuccessful requests.

4. **Include Missing Imports and Dependencies**:

   - Review `create.tsx` and add any missing imports.
   - Ensure all external dependencies are installed and properly configured.
   - Test the application to confirm that all functionalities work without import-related errors.

5. **Add Error Handling and Validation**:

   - Validate user inputs before allowing submission.
   - Disable the `Submit` button if required fields are missing.
   - Provide clear error messages to guide the user.
   - Handle errors that may occur during submission gracefully.

### Implement Bonus Features

6. **Enable Caption Positioning**:

   - Enhance the meme editor to allow users to drag and drop captions on the image.
   - Update the captions' positions in the application's state as they are moved.
   - Provide a user-friendly interface for positioning captions.

## Conclusion

By addressing the minimal functional requirements, the Meme Creator feature will become operational, allowing users to create and submit memes. Implementing the bonus features will enhance user experience but can be deferred until after the essential functionality is in place.
