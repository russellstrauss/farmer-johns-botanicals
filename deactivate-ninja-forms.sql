-- Deactivate Ninja Forms plugin
UPDATE wp_options 
SET option_value = 'a:8:{i:0;s:30:"advanced-custom-fields/acf.php";i:1;s:49:"enhanced-media-library/enhanced-media-library.php";i:2;s:25:"formidable/formidable.php";i:3;s:9:"hello.php";i:4;s:37:"post-types-order/post-types-order.php";i:5;s:47:"regenerate-thumbnails/regenerate-thumbnails.php";i:6;s:47:"term-management-tools/term-management-tools.php";i:7;s:27:"woocommerce/woocommerce.php";}' 
WHERE option_name = 'active_plugins';

