{include file='_head.tpl'}
{include file='_header.tpl'}

<!-- page header -->
<div class="page-header">
    <div class="circle-2"></div>
    <div class="circle-3"></div>
    <div class="inner">
        <h2>{$static['page_title']}</h2>
    </div>
</div>
<!-- page header -->

<!-- page content -->
<div class="container {if $user->_logged_in}offcanvas{/if}" style="margin-top: -25px;">
    <div class="row">

	    <!-- side panel -->
	    {if $user->_logged_in}
		    <div class="col-12 d-block d-sm-none offcanvas-sidebar">
		        {include file='_sidebar.tpl'}
		    </div>
	    {/if}
	    <!-- side panel -->

	    <!-- content panel -->
	    <div class="col-12 {if $user->_logged_in}offcanvas-mainbar{/if}">
    		<div class="card shadow">
    			<div class="card-body page-content text-xlg text-with-list">
			        {$static['page_text']}
    			</div>
    		</div>
	    </div>
	    <!-- content panel -->
	    
	</div>
</div>
<!-- page content -->

{include file='_footer.tpl'}