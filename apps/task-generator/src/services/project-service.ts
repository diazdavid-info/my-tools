export const allProjects = async () => {
  const response = await fetch("/api/projects")
  if (!response.ok) return [];

  return await response.json();
}
