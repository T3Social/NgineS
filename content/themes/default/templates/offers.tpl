{include file='_head.tpl'}
{include file='_header.tpl'}

<!-- page header -->
<div class="page-header">
    <img class="floating-img d-none d-md-block" src="{$system['system_url']}/content/themes/{$system['theme']}/images/headers/undraw_discount_d4bd.svg">
    <div class="circle-2"></div>
    <div class="circle-3"></div>
    <div class="container">
        <h2>{__("Offers")}</h2>
        <div class="row mt20">
            <div class="col-sm-9 col-lg-6 mx-sm-auto">
                <form class="js_search-form" data-handle="offers">
                    <div class="input-group">
                        <input type="text" class="form-control" name="query" placeholder='{__("Search for offers")}'>
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
                            <a href="{$system['system_url']}/offers">
                                {__("All")}
                            </a>
                        </li>
                        {foreach $categories as $category}
                            <li {if $view == "category" && $category_id == $category['category_id']}class="active"{/if}>
                                <a href="{$system['system_url']}/offers/category/{$category['category_id']}/{$category['category_url']}">
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

            {if $view == "" && $promoted_offers}
                <div class="articles-widget-header">
                    <div class="articles-widget-title">{__("Promoted Offers")}</div>
                </div>
                <div class="row mb20">
                    {foreach $promoted_offers as $post}
                        <div class="col-md-6 col-lg-4">
                            <div class="card product boosted">
                                <div class="boosted-icon" data-toggle="tooltip" title="{__("Promoted")}">
                                    <i class="fa fa-bullhorn"></i>
                                </div>
                                <div class="product-image">
                                    <div class="product-price with-offer">
                                        <i class="far fa-calendar-alt mr5"></i>{__("Expires")}: {$post['offer']['end_date']|date_format:"%d/%m/%Y"}
                                    </div>
                                    <img src="{$system['system_uploads']}/{$post['offer']['thumbnail']}">
                                    <div class="product-overlay">
                                        <a class="btn btn-sm btn-outline-secondary rounded-pill" href="{$system['system_url']}/posts/{$post['post_id']}">
                                            {__("More")}
                                        </a>
                                    </div>
                                </div>
                                <div class="product-info">
                                    <div class="product-meta title">
                                        <a href="{$system['system_url']}/posts/{$post['post_id']}" class="title">{$post['offer']['meta_title']}</a>
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
                                    <div class="product-price with-offer">
                                        <i class="far fa-calendar-alt mr5"></i>{__("Expires")}: {$post['offer']['end_date']|date_format:"%d/%m/%Y"}
                                    </div>
                                    <img src="{$system['system_uploads']}/{$post['offer']['thumbnail']}">
                                    <div class="product-overlay">
                                        <a class="btn btn-sm btn-outline-secondary rounded-pill" href="{$system['system_url']}/posts/{$post['post_id']}">
                                            {__("More")}
                                        </a>
                                    </div>
                                </div>
                                <div class="product-info">
                                    <div class="product-meta title">
                                        <a href="{$system['system_url']}/posts/{$post['post_id']}" class="title">{$post['offer']['meta_title']}</a>
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