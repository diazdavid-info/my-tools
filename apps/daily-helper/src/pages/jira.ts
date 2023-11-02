export const searchTasks = async () => {
  const response = await fetch(`${process.env.JIRA_DOMAIN}/rest/api/3/search`, {
    method: 'POST',
    body: JSON.stringify({
      maxResults: 50,
      jql: 'Sprint in openSprints() AND assignee != null'
    }),
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Basic ${process.env.JIRA_AUTHORIZATION}`
    }
  })
  let {issues = []} = await response.json();
  return issues;
}
