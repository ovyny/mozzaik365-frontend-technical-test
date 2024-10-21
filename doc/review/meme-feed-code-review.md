# Meme Feed Code Review

**Reviewer:** Bilal

**Date:** October 21, 2024

---

## Overview

The meme feed is experiencing significant performance issues, making it extremely slow and affecting user experience. The primary cause is inefficient data fetching strategies used in the code, leading to an excessive number of network requests and sequential data processing. This review identifies these issues and provides recommendations for optimization.

## Performance Issues Identified

### 1. N+1 Query Problem

#### Description

The code suffers from the N+1 query problem, which occurs when an application makes N additional queries to fetch related data for each item in a list of N items. Specifically:

- **Fetching Memes Sequentially**

  ````typescript:src/routes/_authentication/index.tsx
  const memes: GetMemesResponse["results"] = [];
  const firstPage = await getMemes(token, 1);
  memes.push(...firstPage.results);
  const remainingPages =
    Math.ceil(firstPage.total / firstPage.pageSize) - 1;
  for (let i = 0; i < remainingPages; i++) {
    const page = await getMemes(token, i + 2);
    memes.push(...page.results);
  }  ```

  The code fetches the first page of memes and then sequentially fetches each remaining page one by one.

  ````

- **Fetching Author for Each Meme**

  ````typescript:src/routes/_authentication/index.tsx
  for (let meme of memes) {
    const author = await getUserById(token, meme.authorId);
    // ...
  }  ```

  An additional request is made to fetch the author of each meme.

  ````

- **Fetching Comments for Each Meme**

  ````typescript:src/routes/_authentication/index.tsx
  for (let meme of memes) {
    // ...
    const firstPage = await getMemeComments(token, meme.id, 1);
    comments.push(...firstPage.results);
    const remainingCommentPages =
      Math.ceil(firstPage.total / firstPage.pageSize) - 1;
    for (let i = 0; i < remainingCommentPages; i++) {
      const page = await getMemeComments(token, meme.id, i + 2);
      comments.push(...page.results);
    }
    // ...
  }  ```

  Comments for each meme are fetched one page at a time, sequentially.

  ````

- **Fetching Author for Each Comment**

  ````typescript:src/routes/_authentication/index.tsx
  for (let comment of comments) {
    const author = await getUserById(token, comment.authorId);
    commentsWithAuthor.push({ ...comment, author });
  }  ```

  An additional request is made for each comment to fetch the author's details.
  ````

#### Impact

This pattern leads to a massive number of network requests:

- **Total Requests for Memes and Authors**: `1 (initial memes request) + M (authors for memes)`
- **Total Requests for Comments and Authors**: `M * [C (comment pages per meme) + C * A (authors for comments)]`

Where `M` is the number of memes and `C` is the number of comment pages per meme. This not only increases load times but also strains network resources, making the app almost unusable.

### 2. Sequential Data Fetching

All data fetching is done sequentially using `await`, which blocks the execution until the previous request completes:
