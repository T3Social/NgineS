<?php
/**
 * jobs
 * 
 * @package Sngine
 * @author Zamblek
 */

// fetch bootloader
require('bootloader.php');

// jobs enabled
if(!$system['pages_enabled'] || !$system['jobs_enabled']) {
	_error(404);
}

// user access
if(!$system['system_public']) {
	user_access();
}

try {

	// get view content
	$_GET['view'] = (isset($_GET['view']))? $_GET['view'] : '';
	switch ($_GET['view']) {
		case '':
			// get promoted jobs
			$promoted_jobs = array();
			$get_promoted = $db->query("SELECT posts.post_id FROM posts INNER JOIN posts_jobs ON posts.post_id = posts_jobs.post_id WHERE posts.post_type = 'job' AND posts_jobs.available = '1' AND posts.boosted = '1' ORDER BY RAND() LIMIT 3") or _error("SQL_ERROR");
			while($promoted_job = $get_promoted->fetch_assoc()) {
				$promoted_job = $user->get_post($promoted_job['post_id']);
				if($promoted_job) {
					$promoted_jobs[] = $promoted_job;
				}
			}
			/* assign variables */
			$smarty->assign('promoted_jobs', $promoted_jobs);

			// prepare query
			/* prepare where query */
			$where_query = "";
			/* prepare pager url */
			$url = "";

			// page header
			page_header($system['system_title'].' - '.__("Jobs"), __($system['system_description_jobs']));
			break;

		case 'search':
			// check query
			if(!isset($_GET['query']) || is_empty($_GET['query'])) {
				redirect('/jobs');
			}
			/* assign variables */
			$smarty->assign('query', $_GET['query']);

			// prepare query
			/* prepare where query */
			$where_query = sprintf('AND (posts.text LIKE %1$s OR posts_jobs.title LIKE %1$s)', secure($_GET['query'], 'search') );
			/* prepare pager url */
			$url = "/search/".$_GET['query'];

			// page header
			page_header($system['system_title'].' - '.__("Jobs"), __($system['system_description_jobs']));
			break;

		case 'category':
			// check category
			$category = $user->get_jobs_category($_GET['category_id']);
			if(!$category) {
				_error(404);
			}
			/* assign variables */
			$smarty->assign('category_id', $_GET['category_id']);

			// prepare query
			/* prepare where query */
			$where_query = sprintf("AND posts_jobs.category_id = %s", secure($_GET['category_id'], 'int'));
			/* prepare pager url */
			$url = "/category/".$_GET['category_id']."/".$_GET['category_url'];

			// page header
			page_header($system['system_title'].' - '.__("Jobs").' - '.__($category['category_name']), __($category['category_description']));
			break;

		default:
			_error(404);
			break;
	}

	// get jobs categories
	$categories = $user->get_jobs_categories();
	/* assign variables */
	$smarty->assign('categories', $categories);

	// get jobs
	require('includes/class-pager.php');
	$params['selected_page'] = ( (int) $_GET['page'] == 0) ? 1 : $_GET['page'];
	$total = $db->query("SELECT COUNT(*) as count FROM posts INNER JOIN posts_jobs ON posts.post_id = posts_jobs.post_id WHERE posts.post_type = 'job' AND posts_jobs.available = '1'".$where_query) or _error("SQL_ERROR");
	$params['total_items'] = $total->fetch_assoc()['count'];
	$params['items_per_page'] = $system['min_results_even'];
	$params['url'] = $system['system_url'].'/jobs'.$url.'/%s';
	$pager = new Pager($params);
	$limit_query = $pager->getLimitSql();

	// get posts
	$rows = array();
	$get_rows = $db->query("SELECT posts.post_id FROM posts INNER JOIN posts_jobs ON posts.post_id = posts_jobs.post_id WHERE posts.post_type = 'job' AND posts_jobs.available = '1'".$where_query." ORDER BY post_id DESC ".$limit_query) or _error("SQL_ERROR");
	while($row = $get_rows->fetch_assoc()) {
		$row = $user->get_post($row['post_id']);
		if($row) {
			$rows[] = $row;
		}
	}
	/* assign variables */
	$smarty->assign('rows', $rows);
	$smarty->assign('total', $params['total_items']);
	$smarty->assign('pager', $pager->getPager());
	$smarty->assign('view', $_GET['view']);

	// get ads
	$ads = $user->ads('jobs');
	/* assign variables */
	$smarty->assign('ads', $ads);
	
} catch (Exception $e) {
	_error(__("Error"), $e->getMessage());
}

// page footer
page_footer("jobs");

?>