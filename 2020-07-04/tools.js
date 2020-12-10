var localurl= location.href;    
function taobaoadd(){
    function go(){
        var alist = document.querySelectorAll('a.J_ClickStat');
        if(alist.length>0){
            for(var i=0;i<alist.length;i++){
                var attrs = alist[i].getAttributeNames();
                var itemid = alist[i].getAttribute('trace-nid');
                for(var j=0;j<attrs.length;j++){
                    alist[i].removeAttribute(attrs[j]);
                }
                alist[i].href='javascript:void(0)';
                var url = 'https://www.socheap.store/api/getlink?nnoo=2&itemid='+itemid;
                alist[i].setAttribute('onclick',`javascript:window.open('${url}')`);
            }
        }
    }
    setInterval(go,500);
    }

    function taobao(){
        var host='https://www.socheap.store';
        var itemid = localurl.match(/id=(\d*)/)[1];
        var linkurl = host+'/api/getlink?nnoo=3&itemid='+itemid;
        var btn_coupon = `<div style="margin-top:10px;" id="xsyhnbtb" class="tb-btn-buy tb-btn-sku"><a href="javascript:void(0)" onclick="javascipt:window.open('${linkurl}')">获取优惠券</a></div>`;
        var getmoreurl = host+'/api/similarsearch?itemid='+itemid;
        //var btn_getmore ='<div style="margin-top:10px;" class="tb-btn-basket tb-btn-add tb-btn-sku"><a target="_blank" href="'+getmoreurl+'">查询类似商品(大额券)</a></div>';
        var btn_getmore ='<div style="margin-top:10px;" class="tb-btn-basket tb-btn-add tb-btn-sku"><a><span id="btnsimilar" style="cursor:pointer;">查询类似商品(大额券)</span></a></div>';
        var tag = $('div.tb-action');
        var btn_link_coupon = '<div style="margin-top: 20px;" id="xsyhnbtb"><a target="_blank" href="http://www.redbean.top/coupon" style="font-size: 15px;background: red;padding: 5px;border-radius: 2px;color: white;" data-spm-anchor-id="2013.1.iteminfo.30">优惠券APP手机客户端</a></div>';
        var btn_link_coupon1 = '<div style="margin-top: 20px;" id="xsyhnbtb"><span id="linkcpn" style="font-size: 15px;cursor: pointer;background: red;padding: 5px;border-radius: 2px;color: white;" data-spm-anchor-id="2013.1.iteminfo.30">优惠券APP手机客户端</span></div>';
        tag.append(btn_coupon);
        tag.append(btn_getmore);
        document.querySelector('#btnsimilar').addEventListener('click',function(){window.open(getmoreurl)});
        //$('.tb-action').after(btn_link_coupon);
        $('.tb-action').after(btn_link_coupon1);
        $('#linkcpn').click(function(){window.open('http://www.redbean.top/coupon')});
    }

    function activetb(){
     if (localurl.search('tmall')>=0 || localurl.search('taobao')>=0){
            if(document.querySelectorAll('#xsyhnbtb').length==0 && localurl.search('item.htm')>=0){taobao();}
            else if(localurl.search('search')>=0 || localurl.search('list')>=0){taobaoadd();}
    }}
        activetb();