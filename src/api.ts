const BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

export class UnauthorizedError extends Error {
  constructor() {
    super('Unauthorized');
  }
}

export class NotFoundError extends Error {
  constructor() {
    super('Not Found');
  }
}

function checkStatus(response: Response) {
  if (response.status === 401) {
    throw new UnauthorizedError();
  }
  if (response.status === 404) {
    throw new NotFoundError();
  }
  return response;
}

export type LoginResponse = {
  jwt: string
}

/**
 * Authenticate the user with the given credentials
 * @param username 
 * @param password 
 * @returns 
 */
export async function login(username: string, password: string): Promise<LoginResponse> {
  return await fetch(`${BASE_URL}/authentication/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password }),
  }).then(res => checkStatus(res).json())
}

export type GetUserByIdResponse = {
  id: string;
  username: string;
  pictureUrl: string;
}

/**
 * Get a user by their id
 * @param token 
 * @param id 
 * @returns 
 */
export async function getUserById(token: string, id: string): Promise<GetUserByIdResponse> {
  return await fetch(`${BASE_URL}/users/${id}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }).then(res => checkStatus(res).json())
}

export type GetMemesResponse = {
  total: number;
  pageSize: number;
  results: {
    id: string;
    authorId: string;
    pictureUrl: string;
    description: string;
    commentsCount: string;
    texts: {
      content: string;
      x: number;
      y: number;
    }[];
    createdAt: string;
  }[]
}

/**
 * Get the list of memes for a given page
 * @param token 
 * @param page 
 * @returns 
 */
export async function getMemes(token: string, page: number): Promise<GetMemesResponse> {
  return await fetch(`${BASE_URL}/memes?page=${page}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }).then(res => checkStatus(res).json())
}

export type GetMemeCommentsResponse = {
  total: number;
  pageSize: number;
  results: {
    id: string;
    authorId: string;
    memeId: string;
    content: string;
    createdAt: string;
  }[]
}

/**
 * Get comments for a meme
 * @param token
 * @param memeId
 * @returns
 */
export async function getMemeComments(token: string, memeId: string, page: number): Promise<GetMemeCommentsResponse> {
  return await fetch(`${BASE_URL}/memes/${memeId}/comments?page=${page}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }).then(res => checkStatus(res).json())
}

export type CreateCommentResponse = {
  id: string;
  content: string;
  createdAt: string;
  authorId: string;
  memeId: string;
}

/**
 * Create a comment for a meme
 * @param token
 * @param memeId
 * @param content
 */
export async function createMemeComment(token: string, memeId: string, content: string): Promise<CreateCommentResponse> {
  return await fetch(`${BASE_URL}/memes/${memeId}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ content }),
  }).then(res => checkStatus(res).json());
}

/**
 * Get multiple users by their ids
 * @param token 
 * @param ids 
 * @returns 
 */
export async function getUsersByIds(token: string, ids: string[]): Promise<GetUserByIdResponse[]> {
  const params = new URLSearchParams(ids.map(id => ['ids', id]));
  return await fetch(`${BASE_URL}/users?${params}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }).then(res => checkStatus(res).json())
}

export type MemeAuthor = {
  id: string;
  username: string;
  pictureUrl: string;
}

export type MemeComment = {
  id: string;
  authorId: string;
  memeId: string;
  content: string;
  createdAt: string;
  author: MemeAuthor;
}

export type MemeWithDetails = {
  id: string;
  authorId: string;
  pictureUrl: string;
  description: string;
  commentsCount: number;
  texts: {
    content: string;
    x: number;
    y: number;
  }[];
  createdAt: string;
  author: MemeAuthor;
  comments: MemeComment[];
}

export type GetMemesWithDetailsResponse = {
  total: number;
  pageSize: number;
  results: MemeWithDetails[];
}

/**
 * Get all memes with their comments and authors
 * @param token 
 * @returns 
 */
export async function getAllMemesWithCommentsAndAuthors(token: string): Promise<GetMemesWithDetailsResponse> {
  // Récupérer d'abord les memes
  const memesResponse: GetMemesResponse = await fetch(`${BASE_URL}/memes`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }).then(res => checkStatus(res).json());

  // Récupérer les commentaires pour chaque mème
  const memesWithComments = await Promise.all(memesResponse.results.map(async (meme) => {
    const commentsResponse = await getMemeComments(token, meme.id, 1);
    return {
      ...meme,
      comments: commentsResponse.results,
      commentsCount: parseInt(meme.commentsCount, 10)
    };
  }));

  // Extraire tous les authorIds uniques
  const authorIds = new Set<string>();
  memesWithComments.forEach(meme => {
    authorIds.add(meme.authorId);
    meme.comments.forEach(comment => authorIds.add(comment.authorId));
  });

  // Récupérer les auteurs
  const authors = await getUsersByIds(token, Array.from(authorIds));

  // Créer un map pour un accès rapide aux auteurs
  const authorMap = new Map(authors.map(author => [author.id, author]));

  // Ajouter les informations d'auteur aux memes et commentaires
  const memesWithDetails: MemeWithDetails[] = memesWithComments.map(meme => ({
    ...meme,
    author: authorMap.get(meme.authorId) as MemeAuthor,
    comments: meme.comments.map(comment => ({
      ...comment,
      author: authorMap.get(comment.authorId) as MemeAuthor
    }))
  }));

  return {
    ...memesResponse,
    results: memesWithDetails
  };
}

// Ajout des types pour Meme et Comment
export type MemeText = {
  content: string;
  x: number;
  y: number;
};

export type Meme = {
  id: string;
  authorId: string;
  pictureUrl: string;
  description: string;
  commentsCount: number;
  texts: MemeText[];
  createdAt: string;
};

export type Comment = {
  id: string;
  authorId: string;
  memeId: string;
  content: string;
  createdAt: string;
};

/**
 * Create a new meme
 * @param token
 * @param memeData
 */
export async function createMeme(
  token: string,
  memeData: FormData
): Promise<void> {
  await fetch(`${BASE_URL}/memes`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: memeData,
  }).then((res) => checkStatus(res));
}
