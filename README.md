

Config DG => back/config/config.json - Postgresql 
Insatall all packages : npm install -> back
                        npm install -> front
Run : back => nodemon server
      front => npm start

back/.env template : ////////////////////////////// JSON_TOKEN=StringKeyForJwtTokenEncryption SUPER_PASS=PasswordForAdminCreation AUTHORIZED_ADMIN_IPS=ipv6;list;of;authorized;ips;to;create:admins; (::1; = localhost)
