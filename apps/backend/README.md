# MIN

Absolutely free and open-source messenger, you can host yourself.  
(or just use it here: https://msg-min.xyz)

## About repo

This repo is server only. You can find client here: https://github.com/gooseDes/min-frontend  
Things used:

-   `MariaDB` as database
-   `TypeScript` and `JavaScript` as programming languages
-   `Metered` as TURN server provider

## Settings

### .env configuration (_italic_ means optional):

-   **`EMAIL`** - your email required for web-push
-   **`VAPID_PUBLIC`** - your VAPID public key (you can generate it by running `gen_push_keys.js`)
-   **`VAPID_PRIVATE`** - your VAPID private key
-   **`FIREBASE_SERVICE_ACCOUNT`** - your Firebase service account JSON
-   **`METERED_SECRET`** - your secret key from metered.ca
-   **`METERED_DOMAIN`** - your pre-domain on metered (e.g., for `min.metered.live`, enter only `min`)
-   _`JWT_SECRET`_ - key for generating and validating tokens
-   _`DB_HOST`_ - address where the database is running
-   _`PORT`_ - port for running the server
