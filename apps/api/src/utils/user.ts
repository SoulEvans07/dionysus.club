// Relational-query selection matching `PublicUserDTO`, so other users' private fields never leave the API.
export const publicUserQuery = {
  columns: { id: true, username: true },
  with: { profileImage: { columns: { id: true, filename: true, url: true } } },
} as const;
