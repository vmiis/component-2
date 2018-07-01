//-------------------------------------
if($vm.module==undefined) $vm.module={};
$vm.module["__ID"]={};
var m=$vm.module["__ID"];
m.name=$vm.vm['__ID'].name;
m.input=$vm.vm['__ID'].input; if(m.input==undefined) m.input={};
m.module=$vm.module_list[m.name];
m.preload=m.module.preload;
m.prefix=m.module.prefx; if(m.prefix==undefined) m.prefix="";
m.form_module=m.prefix+m.module.form_module;
m.db_pid=m.module.table_id;
m.qid=m.module.qid; if(m.qid==undefined) m.qid=$vm.qid;
//-------------------------------------
m.load=function(){
    m.input=$vm.vm['__ID'].input; if(m.input==undefined) m.input={};
    $('#F__ID')[0].reset();
    $('#submit__ID').show();
    var grid_record=m.input.record;
    $('#delete__ID').hide(); if(grid_record!=undefined && grid_record.ID!==undefined) $('#delete__ID').show();
    $vm.deserialize(grid_record,'#F__ID');
}
//-------------------------------
m.submit=function(event){
    //--------------------------------------------------------
    event.preventDefault();
    $('#submit__ID').hide();
    //--------------------------------------------------------
    var data=$vm.serialize('#F__ID');
    var dbv={}
    var r=true;
    if(m.before_submit!=undefined) r=m.before_submit(data,dbv);
    if(r==false) return;
    //--------------------------------------------------------
    var rid=undefined; if(m.input.record!=undefined) rid=m.input.record.ID;
    var req={cmd:"add",qid:m.qid,db_pid:m.db_pid,data:data,dbv:dbv};
    if(rid!=undefined) req={cmd:"modify",rid:rid,qid:m.qid,db_pid:m.db_pid,data:data,dbv:dbv};
    if($vm.online_questionnaire==1 || m.add_s2==1) req={cmd:"add-s2",qid:m.qid,db_pid:m.db_pid,data:data,dbv:dbv};
    else if(m.add_anonymous==1) req={cmd:"add-anonymous",qid:m.qid,db_pid:m.db_pid,data:data,dbv:dbv};
    $VmAPI.request({data:req,callback:function(res){
        if(rid==undefined && m.after_add!=undefined){
            m.after_add(data,dbv,res); return;
        }
        if(rid!=undefined && m.after_modify!=undefined){
            m.after_modify(data,dbv,res); return;
        }
        $vm.refresh=1;
        if(rid!=undefined) window.history.go(-1);                       //modify
        else if(m.input.goback!=undefined) window.history.go(-1);       //from grid
        else $vm.alert('Your data has been successfully submitted');    //standalone
    }});
    //--------------------------------------------------------
}
//--------------------------------------------------------
$('#D__ID').on('load',function(){ m.load();})
$('#F__ID').submit(function(event){m.submit(event);})
//--------------------------------------------------------
$('#delete__ID').on('click', function(){
    var record=m.input.record;
    if(record==undefined) return;
    var rid=record.ID;
    if(rid==undefined){
        return;
    }
    if(confirm("Are you sure to delete?\n")){
        var req={cmd:"delete",qid:m.qid,db_pid:m.db_pid,rid:rid,dbv:{}};
        $VmAPI.request({data:req,callback:function(res){
            //-------------------------------
            if(res.Error!==undefined) return false;
            if(res.ret=='NULL'){
                if(res.msg!==undefined) alert(res.msg);
                else alert("No permission!");
                return false;
            }
            //-------------------------------
            if(m.after_delete!==undefined)  m.after_delete(res);
            //-------------------------------
            $vm.refresh=1;
            window.history.go(-1);
        }});
    }
})
//-------------------------------------
$('#header__ID').on('click', function(event){
    if(event.ctrlKey){
        var x=document.getElementById("F__ID");
        var txt="";var nm0="";
        for (var i=0; i < x.length; i++) {
            var nm=x.elements[i].getAttribute("name");
            if(nm!=null && nm!=nm0){ if(txt!="") txt+=", "; txt+=nm; nm0=nm;}
        }
        //$vm.alert(txt);
        console.log(txt);
    }
});
//--------------------------------------------------------
