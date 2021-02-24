{include file='_head.tpl'}
{include file='_header.tpl'}

<!-- page header -->
<div class="page-header">
	<img class="floating-img d-none d-md-block" src="{$system['system_url']}/content/themes/{$system['theme']}/images/headers/undraw_interview_rmcf.svg">
    <div class="circle-2"></div>
    <div class="circle-3"></div>
    <div class="container">
        <h2>{__("Jobs")}</h2>
        <div class="row mt20">
            <div class="col-sm-9 col-lg-6 mx-sm-auto">
                <form class="js_search-form" data-handle="jobs">
                    <div class="input-group">
                        <input type="text" class="form-control" name="query" placeholder='{__("Search for jobs")}'>
                        <div class="input-group-append">
                            <button type="submit" class="btn btn-danger">{__("Search")}</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>
<!-- page header -->

<!-- page content -->
<div class="container mt20 offcanvas">
	<div class="row">

		<!-- left panel -->
		<div class="col-md-4 col-lg-3 offcanvas-sidebar">
            <!-- categories -->
			<div class="card">
				<div class="card-body with-nav">
					<ul class="side-nav">
						<li {if $view == "" || $view == "search"}class="active"{/if}>
							<a href="{$system['system_url']}/jobs">
                                {__("All")}
                            </a>
						</li>
						{foreach $categories as $category}
							<li {if $view == "category" && $category_id == $category['category_id']}class="active"{/if}>
								<a href="{$system['system_url']}/jobs/category/{$category['category_id']}/{$category['category_url']}">
	                                {__($category['category_name'])}
	                            </a>
							</li>
						{/foreach}
					</ul>
				</div>
			</div>
			<!-- categories -->
		</div>
		<!-- left panel -->

		<!-- right panel -->
		<div class="col-md-8 col-lg-9 offcanvas-mainbar">

			{include file='_ads.tpl'}

			{if $view == "search"}
				<div class="bs-callout bs-callout-info mt0">
                    <!-- results counter -->
                    <span class="badge badge-pill badge-lg badge-light">{$total}</span> {__("results were found for the search for")} "<strong class="text-primary">{htmlentities($query, ENT_QUOTES, 'utf-8')}</strong>"
                    <!-- results counter -->
                </div>
            {/if}

            {if $view == "" && $promoted_jobs}
				<div class="articles-widget-header">
                    <div class="articles-widget-title">{__("Promoted Jobs")}</div>
                </div>
				<div class="row mb20">
					{foreach $promoted_jobs as $post}
						<div class="col-md-6 col-lg-4">
							<div class="card product boosted">
								<div class="boosted-icon" data-toggle="tooltip" title="{__("Promoted")}">
					                <i class="fa fa-bullhorn"></i>
					            </div>
								<div class="product-image">
									<div class="product-price">
										{$system['system_currency_symbol']}{$post['job']['salary_minimum']} - {$system['system_currency_symbol']}{$post['job']['salary_maximum']} / {$post['job']['pay_salary_per_meta']}
									</div>
									<img src="{$system['system_uploads']}/{$post['job']['cover_image']}">
									<div class="product-overlay">
										<a class="btn btn-sm btn-outline-secondary rounded-pill" href="{$system['system_url']}/posts/{$post['post_id']}">
											{__("More")}
										</a>
										{if $post['author_id'] != $user->_data['user_id'] }
									        <button type="button" class="btn btn-sm btn-info rounded-pill js_job-apply" data-id="{$_post['post_id']}">
									        	<i class="fa fa-user-tie mr5"></i>{__("Apply Now")}
									        </button>
									    {/if}
									</div>
								</div>
								<div class="product-info">
									<div class="product-meta title">
										<a href="{$system['system_url']}/posts/{$post['post_id']}" class="title">{$post['job']['title']}</a>
									</div>
									<div class="product-meta">
										<i class="fa fa-briefcase fa-fw mr5" style="color: #2bb431;"></i>{$post['job']['type_meta']}
									</div>
									<div class="product-meta">
										<i class="fa fa-map-marker fa-fw mr5" style="color: #1f9cff;"></i>{if $post['job']['location']}{$post['job']['location']}{else}{__("N/A")}{/if}
									</div>
								</div>
							</div>
						</div>
					{/foreach}
				</div>
            {/if}
			
			{if $rows}
				<div class="row">
					{foreach $rows as $post}
						<div class="col-md-6 col-lg-4">
							<div class="card product">
								<div class="product-image">
									<div class="product-price">
						            	{$system['system_currency_symbol']}{$post['job']['salary_minimum']} - {$system['system_currency_symbol']}{$post['job']['salary_maximum']} / {$post['job']['pay_salary_per_meta']}
									</div>
									<img src="{$system['system_uploads']}/{$post['job']['cover_image']}">
									<div class="product-overlay">
										<a class="btn btn-sm btn-outline-secondary rounded-pill" href="{$system['system_url']}/posts/{$post['post_id']}">
											{__("More")}
										</a>
										{if $post['author_id'] != $user->_data['user_id'] }
									        <button type="button" class="btn btn-sm btn-info rounded-pill js_job-apply" data-id="{$post['post_id']}">
									        	<i class="fa fa-user-tie mr5"></i>{__("Apply Now")}
									        </button>
									    {/if}
									</div>
								</div>
								<div class="product-info">
									<div class="product-meta title">
										<a href="{$system['system_url']}/posts/{$post['post_id']}" class="title">{$post['job']['title']}</a>
									</div>
									<div class="product-meta">
										<i class="fa fa-briefcase fa-fw mr5" style="color: #2bb431;"></i>{$post['job']['type_meta']}
									</div>
									<div class="product-meta">
										<i class="fa fa-map-marker fa-fw mr5" style="color: #1f9cff;"></i>{if $post['job']['location']}{$post['job']['location']}{else}{__("N/A")}{/if}
									</div>
								</div>
							</div>
						</div>
					{/foreach}
				</div>

				{$pager}
			{else}
				{include file='_no_data.tpl'}
			{/if}
		</div>
		<!-- right panel -->

	</div>
</div>
<!-- page content -->

{include file='_footer.tpl'}