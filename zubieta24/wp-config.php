<?php
/**
 * Configuración básica de WordPress.
 *
 * Este archivo contiene las siguientes configuraciones: ajustes de MySQL, prefijo de tablas,
 * claves secretas, idioma de WordPress y ABSPATH. Para obtener más información,
 * visita la página del Codex{@link http://codex.wordpress.org/Editing_wp-config.php Editing
 * wp-config.php} . Los ajustes de MySQL te los proporcionará tu proveedor de alojamiento web.
 *
 * This file is used by the wp-config.php creation script during the
 * installation. You don't have to use the web site, you can just copy this file
 * to "wp-config.php" and fill in the values.
 *
 * @package WordPress
 */

// ** Ajustes de MySQL. Solicita estos datos a tu proveedor de alojamiento web. ** //
/** El nombre de tu base de datos de WordPress */
define( 'DB_NAME', 'zubieta24' );

/** Tu nombre de usuario de MySQL */
define( 'DB_USER', 'root' );

/** Tu contraseña de MySQL */
define( 'DB_PASSWORD', '' );

/** Host de MySQL (es muy probable que no necesites cambiarlo) */
define( 'DB_HOST', 'localhost' );

/** Codificación de caracteres para la base de datos. */
define( 'DB_CHARSET', 'utf8mb4' );

/** Cotejamiento de la base de datos. No lo modifiques si tienes dudas. */
define('DB_COLLATE', '');

/**#@+
 * Claves únicas de autentificación.
 *
 * Define cada clave secreta con una frase aleatoria distinta.
 * Puedes generarlas usando el {@link https://api.wordpress.org/secret-key/1.1/salt/ servicio de claves secretas de WordPress}
 * Puedes cambiar las claves en cualquier momento para invalidar todas las cookies existentes. Esto forzará a todos los usuarios a volver a hacer login.
 *
 * @since 2.6.0
 */
define( 'AUTH_KEY', ' ?(+>X7~k.Xycba+O1?09;7X$Ui({YM(rBs&Revr#kYbq<T5P7Zk_d!Fc0v3A21B' );
define( 'SECURE_AUTH_KEY', 'gqrZ~kR<*}:JX8iJ:Wfu^MMOMQ8.Dyp>LOTerj]j>M@-w+0Fh[d$!@D+#-R3cMW=' );
define( 'LOGGED_IN_KEY', '>Sh4q>Oy~f~dwdX}9.lL:2cu]uYlT:vc#sMX?HCarPoUV=hWSy2:0m8W, Zu{ Y+' );
define( 'NONCE_KEY', ' {3m$<u!t)%sQJnoL~!e?EF%iV4y:#~&wZaD-G38P+:6_#N6|/x|1)`S5 7.CP&o' );
define( 'AUTH_SALT', '4Pwl%$I[jX{A(z<uRQj7m3Da>5h ymf%c;S@qRoQ2c!zRWb!1UcxD7@,(sO+pXfG' );
define( 'SECURE_AUTH_SALT', 'P1~$S?2M)1`!3:/FwlgJyUX5D<l!-v!Y?N81X?{.>(CPZ|7&HSArOHHYn!^3ODdf' );
define( 'LOGGED_IN_SALT', '_E<K/%X&=@wXc)gC$39$FV@FIdAUY+>oWEkTb0f<h1w>8|6B-pHPO#eE,~?d1n@y' );
define( 'NONCE_SALT', 'v;Jt9ay[[&;LHjZegAL[<+i?Ni5mu8O,rpjraY8kO._yg}v)Mx&>{Gq2`9@Vx1.E' );

/**#@-*/

/**
 * Prefijo de la base de datos de WordPress.
 *
 * Cambia el prefijo si deseas instalar multiples blogs en una sola base de datos.
 * Emplea solo números, letras y guión bajo.
 */
$table_prefix = 'wp_zubieta24';


/**
 * Para desarrolladores: modo debug de WordPress.
 *
 * Cambia esto a true para activar la muestra de avisos durante el desarrollo.
 * Se recomienda encarecidamente a los desarrolladores de temas y plugins que usen WP_DEBUG
 * en sus entornos de desarrollo.
 */
define('WP_DEBUG', false);

/* ¡Eso es todo, deja de editar! Feliz blogging */

/** WordPress absolute path to the Wordpress directory. */
if ( !defined('ABSPATH') )
	define('ABSPATH', dirname(__FILE__) . '/');

/** Sets up WordPress vars and included files. */
require_once(ABSPATH . 'wp-settings.php');

