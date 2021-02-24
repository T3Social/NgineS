<?php
/**
 * market
 * 
 * @package Sngine
 * @author Zamblek
 */

// fetch bootloader
require('bootloader.php');

// market enabled
if(!$system['market_enabled']) {
	_error(404);
}

// user access
if(!$system['system_public']) {
	user_access();
}

// market
try {

	// get view content
	$_GET['view'] = (isset($_GET['view']))? $_GET['view'] : '';
	switch ($_GET['view']) {
		case '':
			// get promoted products
			$promoted_products = array();
			$get_promoted = $db->query("SELECT posts.post_id FROM posts INNER JOIN posts_products ON posts.post_id = posts_products.post_id WHERE posts.post_type = 'product' AND posts_products.available = '1' AND posts.boosted = '1' ORDER BY RAND() LIMIT 3") or _error("SQL_ERROR");
			while($promoted_product = $get_promoted->fetch_assoc()) {
				$promoted_product = $user->get_post($promoted_product['post_id']);
				if($promoted_product) {
					$promoted_products[] = $promoted_product;
				}
			}
			/* assign variables */
			$smarty->assign('promoted_products', $promoted_products);

			// prepare query
			/* prepare where query */
			$where_query = "";
			/* prepare pager url */
			$url = "";

			// page header
			page_header($system['system_title'].' - '.__("Marketplace"), __($system['system_description_marketplace']));
			break;

		case 'search':
			// check query
			if(!isset($_GET['query']) || is_empty($_GET['query'])) {
				redirect('/market');
			}
			/* assign variables */
			$smarty->assign('query', $_GET['query']);

			// prepare query
			/* prepare where query */
			$where_query = sprintf('AND (posts.text LIKE %1$s OR posts_products.name LIKE %1$s)', secure($_GET['query'], 'search') );
			/* prepare pager url */
			$url = "/search/".$_GET['query'];

			// page header
			page_header($system['system_title'].' - '.__("Marketplace"), __($system['system_description_marketplace']));
			break;

		case 'category':
			// check category
			$category = $user->get_market_category($_GET['category_id']);
			if(!$category) {
				_error(404);
			}
			/* assign variables */
			$smarty->assign('category_id', $_GET['category_id']);

			// prepare query
			/* prepare where query */
			$where_query = sprintf("AND posts_products.category_id = %s", secure($_GET['category_id'], 'int'));
			/* prepare pager url */
			$url = "/category/".$_GET['category_id']."/".$_GET['category_url'];

			// page header
			page_header($system['system_title'].' - '.__("Marketplace").' - '.__($category['category_name']), __($category['category_description']));
			break;

		default:
			_error(404);
			break;
	}

	// get market categories
	$categories = $user->get_market_categories();
	/* assign variables */
	$smarty->assign('categories', $categories);

	// prepare sort
	switch ($_GET['sort']) {
		case '':
		case 'latest':
			$order_query = " ORDER BY posts.post_id DESC ";
			break;

		case 'price-high':
			$order_query = " ORDER BY posts_products.price DESC ";
			break;

		case 'price-low':
			$order_query = " ORDER BY posts_products.price ASC ";
			break;
		
		default:
			_error(404);
			break;
	}

	// get products
	require('includes/class-pager.php');
	$params['selected_page'] = ( (int) $_GET['page'] == 0) ? 1 : $_GET['page'];
	$total = $db->query("SELECT COUNT(*) as count FROM posts INNER JOIN posts_products ON posts.post_id = posts_products.post_id WHERE posts.post_type = 'product' AND posts_products.available = '1'".$where_query.$order_query) or _error("SQL_ERROR");
	$params['total_items'] = $total->fetch_assoc()['count'];
	$params['items_per_page'] = $system['min_results_even'];
	$params['url'] = $system['system_url'].'/market'.$url.'/%s';
	$params['url'] .= (isset($_GET['sort']))? "?sort=".$_GET['sort'] : "";
	$pager = new Pager($params);
	$limit_query = $pager->getLimitSql();

	// get posts
	$rows = array();
	$get_rows = $db->query("SELECT posts.post_id FROM posts INNER JOIN posts_products ON posts.post_id = posts_products.post_id WHERE posts.post_type = 'product' AND posts_products.available = '1'".$where_query.$order_query.$limit_query) or _error("SQL_ERROR");
	while($row = $get_rows->fetch_assoc()) {
		$row = $user->get_post($row['post_id']);
		if($row) {
			$rows[] = $row;
		}
	}
	/* assign variables */
	$smarty->assign('sort', $_GET['sort']);
	$smarty->assign('rows', $rows);
	$smarty->assign('total', $params['total_items']);
	$smarty->assign('pager', $pager->getPager());
	$smarty->assign('view', $_GET['view']);

	// get ads
	$ads = $user->ads('market');
	/* assign variables */
	$smarty->assign('ads', $ads);

} catch (Exception $e) {
	_error(__("Error"), $e->getMessage());
}

// page footer
page_footer("market");

?>