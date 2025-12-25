<?php
/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the
 * installation. You don't have to use the web site, you can
 * copy this file to "wp-config.php" and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * MySQL settings
 * * Secret keys
 * * Database table prefix
 * * ABSPATH
 *
 * @link https://codex.wordpress.org/Editing_wp-config.php
 *
 * @package WordPress
 */

// Site URL configuration for local development
// Supports both HTTP (port 8080) and HTTPS (port 8443)
// WordPress will detect the protocol automatically based on the request
if (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') {
    // HTTPS request
    define('WP_HOME', 'https://local.farmerjohnsbotanicals.com:8443');
    define('WP_SITEURL', 'https://local.farmerjohnsbotanicals.com:8443');
} else {
    // HTTP request
    define('WP_HOME', 'http://local.farmerjohnsbotanicals.com:8080');
    define('WP_SITEURL', 'http://local.farmerjohnsbotanicals.com:8080');
}

// Force SSL for admin area (optional - uncomment if you want to force HTTPS for admin)
// define('FORCE_SSL_ADMIN', true);

define('DB_NAME', 'fjb_db');
define('DB_USER', 'russell_fjb_user');
define('DB_PASSWORD', 'EZsDNwLGpIPKi4E');
define('DB_HOST', 'db');

/** Database Charset to use in creating database tables. */
define('DB_CHARSET', 'utf8mb4');
define('DB_COLLATE', '');

/**#@+
 * Authentication Unique Keys and Salts.
 *
 * Change these to different unique phrases!
 * You can generate these using the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}
 * You can change these at any point in time to invalidate all existing cookies. This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define('AUTH_KEY',         '__6#:_Q,wL`<3oxJ;vJ6f*|-jgMv~S_Ck[(IXj+QCJ8,-v]%6r+Tl5;-Z[~&)u9S');
define('SECURE_AUTH_KEY',  '-rPDZ=LbiiA:P;xos%b[M >pK1n3@=~Ifk$n!8d_upLrCyoRMF^fQX_8#]:>SOeQ');
define('LOGGED_IN_KEY',    'bq1[6r{PA}TO aEA~bBb-`/4C|xsACqsIJU8.Oo8isk6jzqQ>qWpP?nXm<kpBc+q');
define('NONCE_KEY',        'S5k;|1:^_`<7wpbm>-/@$_-49Yos$*-%R<Z>X-$tI,ce1f] iuN*qFWF$qGkQN<D');
define('AUTH_SALT',        '_8T/iC8I+6<[(&a&-q-)yYJ:`?fg|[q*0,%PvYb*C%PdnaY0s0B$*G@m^w}fF ~l');
define('SECURE_AUTH_SALT', 'dVG!M985x>< KObE.6eRDxw&?Tx1;=,{a5raNlR0t%%WF*ii4?hK`!-D}j_2Nb,;');
define('LOGGED_IN_SALT',   'Ag.2.5D;~_MncH!Q(#p-E{6HX.|(y0%)mTmrzzo|unR=O,$@j]ZJgj|sH&<+6NIB');
define('NONCE_SALT',       'yt3M/QM2]S$K.iTGZK7=+mdU<8<P@qF<p^KMK;O^+{PKuR&&$?kntwn SYOP_ug[');

/**#@-*/

/**
 * WordPress Database Table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 */
$table_prefix  = 'wp_';

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the Codex.
 *
 * @link https://codex.wordpress.org/Debugging_in_WordPress
 */
define('WP_DEBUG', false);

/**
 * Force direct file system access (no FTP required)
 * This allows WordPress to install plugins directly without FTP credentials
 */
define('FS_METHOD', 'direct');

/* That's all, stop editing! Happy blogging. */

/** Absolute path to the WordPress directory. */
if ( !defined('ABSPATH') )
	define('ABSPATH', dirname(__FILE__) . '/');

/** Sets up WordPress vars and included files. */
require_once(ABSPATH . 'wp-settings.php');


