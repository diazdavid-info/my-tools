## ⛲ Fuentes

* https://developers.google.com/identity/protocols/oauth2/scopes?hl=es-419
* https://developers.google.com/identity/protocols/oauth2/web-server?hl=es-419#httprest
* https://developers.google.com/identity/protocols/oauth2/web-server?hl=es-419#node.js
* [Motivos de expiración del refresh token](https://developers.google.com/identity/protocols/oauth2?hl=es-419#expiration)


## Base de datos
```
CREATE TABLE `user` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(100) NOT NULL DEFAULT '',
  `token` text NOT NULL,
  `refreshToken` text NOT NULL,
  `expiredDate` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```
