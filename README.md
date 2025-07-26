Image Upload System
This is a web application for uploading and managing images, built with Next.js and React. It allows users to upload JPEG, PNG, or WebP image files (up to 10MB), view uploaded images, and delete them (either by moving to trash or permanent deletion).

Features
Image Upload: Upload JPEG, PNG, and WebP image formats.

File Validation: Client-side validation for file type and size (max 10MB).

Image Display: View successfully uploaded images with details like file ID, original name, type, size, and upload date.

Image Listing: Display a gallery of all uploaded images with options to view, download, or delete.

Delete Functionality: Option to "trash" an image (move to a trash bin, implying a soft delete) or "delete" permanently.

Responsive Design: Basic responsive styling using Tailwind CSS.

Frontend-Backend Communication: Interacts with a backend API (expected to be running on http://localhost:3001).

Technologies Used
Next.js

React

Tailwind CSS

Geist Font (for improved typography)

Setup and Installation
Clone the repository:

Bash

git clone <repository-url>
cd image-upload-system
Install dependencies:

Bash

npm install
# or
yarn install
Run the development server:

Bash

npm run dev
# or
yarn dev
This will start the Next.js development server at http://localhost:3000.
