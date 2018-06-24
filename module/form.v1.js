//---------------------------------------------
if($vm.module==undefined) $vm.module={};
$vm.module["__ID"]={};
var m=$vm.module["__ID"];
m.name=$vm.vm['__ID'].name;
m.prefix=$vm.module_list[m.name].prefix;
m.db_pid="";
if($vm.module_list[m.name]['table_id']!=undefined) m.db_pid=$vm.module_list[m.name]['table_id'];
m.qid=$vm.module_list[m.name]['qid'];
//---------------------------------------------
m.load=function(){
    $('#F__ID')[0].reset();
    $('#submit__ID').show();
    var grid_record=$vm.vm['__ID'].input.record;
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
    var rid=undefined; if($vm.vm['__ID'].input.record!=undefined) rid=$vm.vm['__ID'].input.record.ID;
    var req={cmd:"add",db_pid:m.db_pid,data:data,dbv:dbv};
    if(rid!=undefined) req={cmd:"modify",rid:rid,db_pid:m.db_pid,data:data,dbv:dbv};
    $VmAPI.request({data:req,callback:function(res){
        $vm.refresh=1;
        if(rid!=undefined) window.history.go(-1);
        else if($vm.vm['__ID'].input!=undefined && $vm.vm['__ID'].input.goback!=undefined) window.history.go(-1);
        else $vm.alert('Your data has been successfully submitted');
    }});
    //--------------------------------------------------------
}
//--------------------------------------------------------
$('#delete__ID').on('click', function(){
    var record=$vm.vm['__ID'].input.record;
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
