## Como generar los tipos de Jira automáticamente

Si algúna de las peticiones de Jira se cambia para que Jira devuelva más o menos cambios, hay que volver a generar los
tipos.
Para generarlos lanzamos una petición a Jira:

```
curl -sX POST -u "<email_jira>:<token_jira>" -H "Content-Type: application/json" -H "Accept: application/json" https://<domain_jira>/rest/api/3/search --data '{"expand":["names"],"maxResults":50,"fieldsByKeys":false,"fields":["summary","issuetype"],"startAt":0,"jql":"status = \"In Progress\""}' | jq
```

Copiamos el resultado y nos vamos a [app.quicktype.io](https://app.quicktype.io/)
Esta herramienta generará los tipos y solo tenemos que pegarlos.
