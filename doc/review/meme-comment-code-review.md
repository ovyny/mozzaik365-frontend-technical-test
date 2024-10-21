# Meme Comment Functionality Fix - Code Review

**Reviewer:** Bilal

**Date:** October 21, 2024

---

**Problem:**

Users were unable to see their newly added comments immediately after submitting them. The comments only appeared after refreshing the page.

**Solution:**

Utilize React Query's `queryClient` to invalidate and refetch the `["memes"]` query upon successful creation of a comment. This ensures the UI updates with the latest data without requiring a page refresh.

**Changes Made:**

1. **Import `useQueryClient` from React Query**

   ```typescript
   import {
     useMutation,
     useQuery,
     useQueryClient,
   } from "@tanstack/react-query";
   // ... existing imports ...
   ```

2. **Initialize the `queryClient`**

   ```typescript
   // Inside MemeFeedPage component
   const queryClient = useQueryClient();
   // ... existing code ...
   ```

3. **Update the `useMutation` Hook to Invalidate Queries on Success**

   ```typescript
   const createCommentMutation = useMutation({
     mutationFn: async (data: { memeId: string; content: string }) => {
       await createMemeComment(token, data.memeId, data.content);
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ["memes"] });
     },
   });
   // ... existing code ...
   ```

**Explanation:**

- **Importing `useQueryClient`:** This hook provides access to the React Query `QueryClient`, which is essential for manually invalidating queries.

- **Initializing `queryClient`:** By calling `useQueryClient()`, we obtain the instance of the `QueryClient` to interact with the cached queries.

- **Updating the Mutation Hook:**

  - **`onSuccess` Callback:** Added an `onSuccess` function to the `useMutation` hook for `createCommentMutation`.
  - **Invalidating the Query:** Inside `onSuccess`, we call `queryClient.invalidateQueries({ queryKey: ["memes"] })`. This tells React Query to refetch any queries with the key `["memes"]`, ensuring that the latest data (including the new comment) is fetched and the UI is updated accordingly.

**Outcome:**

With these changes, when a user submits a new comment:

- The comment is successfully posted to the server.
- The `onSuccess` callback triggers, invalidating the `["memes"]` query.
- React Query refetches the memes data, now including the new comment.
- The UI re-renders with the updated comments, eliminating the need for a manual page refresh.
