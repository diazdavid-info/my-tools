<p align="center">
  <img src="https://github.com/diazdavid-info/my-tools/blob/main/apps/tasks/tasks.png" alt="Tasks" width="500" />
</p>

<h1 align="center">❯ Tasks</h1>

<br />

## Instalación

Necesitas crear 2 env en tu máquina. Puedes ponerlas, por ejemplo, en el bashrc

1. JIRA_DOMAIN=https://example.atlassian.net -> Se usa para acceder a las tareas de Jira
2. JIRA_AUTHORIZATION=ZXhhbXBsZUBleGFtcGxlLmNvbToxMjM0NTU2Njc1NjU= -> Es el base64 de usuario_jira:token_jira. Para crear el token de Jira accede [aquí](https://id.atlassian.com/manage-profile/security/api-tokens)

## Correr el script

```
npx mytools-tasks@latest
```
