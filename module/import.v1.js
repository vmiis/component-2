//-------------------------------------
$('#import__ID').on('click',function(){
	$('#fileform__ID')[0].reset();
	$('#import_file__ID').trigger('click');
})
//-------------------------------------
$('#import_file__ID').on('change',function(evt){
	var files = evt.target.files;
	if(files.length>0){
		if(confirm("Are you sure to import "+files[0].name+"?\n")){
			var reader = new FileReader();
			reader.onload = (function(e) {processing_file_start(e.target.result); });
			reader.readAsText(files[0]);
		}
	}
})
//-------------------------------------
var gNumber_to_process,gNumber_completed,gDialog_module_id;
var gI=0,gLines,gTab,gFields,gHeader;
var gLoop;
var gOK;
//-------------------------------------
var one_loop=function(){
	if(gOK==0) return;
	gOK=0;
	var items=gLines[gI].splitCSV(gTab);
	//--------------------------------------
	//create a record rd
	var rd={};
	var dbv={};
	if(items.length==1 && items[0]==''){} //this is empty line
	else{
		for(var j=0;j<gFields.length;j++){
			var field_name=gFields[j].split('|')[0];
			var field_id=gFields[j].split('|').pop();
			var index=gHeader.indexOf(field_name.replace(/ /g,'_'));
			if(index!=-1 && index<items.length)  rd[field_id]=items[index];  //index>=items.length: the data line is too short
		}
	}
	//--------------------------------------
	if(jQuery.isEmptyObject(rd)===false){ //not empty record
		if(m.before_submit!==undefined){
			m.before_submit(rd,dbv);
		}
		//------------------------------------------
		if(m.import_check_record!==undefined){
			m.import_check_record(rd,dbv,function(r){
				if(r==1){ //1--add
					//add
					var req={cmd:"add",qid:m.qid,db_pid:m.db_pid.toString(),data:rd,dbv:dbv};
					$VmAPI.request({data:req,callback:function(res){
						gNumber_completed++;
						processing_file_end();
					}})
					//------------------------------------------
				}
				else if(r==0){ //0 skip to next, no add, looks like this line is an empty 
					//gNumber_completed++;
					gI--;
					gNumber_to_process--;
					processing_file_end();
				}
				else if(r=-1){ //-1 stop, jump to end, move both pointers (gNumber_to_process and gI) to end
					gNumber_to_process=gNumber_completed;
					gI=gNumber_completed;
					processing_file_end();
				}
			})
		}
		else{
			//add
			var req={cmd:"add",qid:m.qid,db_pid:m.db_pid.toString(),data:rd,dbv:dbv};
			$VmAPI.request({data:req,callback:function(res){
				gNumber_completed++;
				processing_file_end();
			}})
			//------------------------------------------
		}
	}
	else{
		gI--;
		gNumber_to_process--;
		processing_file_end();
	}
	console.log(gI+'/'+gNumber_to_process)
	if(gI>=gNumber_to_process){
		clearInterval(gLoop);
		return;
	}
	gI++;
}
//-------------------------------------
var processing_file_start=function(contents){
	//gLines=contents.replace(/\r/g,'\n').replace(/\n\n/g,'\n').split('\n');
	gLines=contents.split('\r\n');
	if(gLines.length>1){
		gNumber_to_process=gLines.length-1; //-1: not count header line
		gNumber_completed=0;
		gDialog_module_id=$vm.get_module_id({name:'_system_import_dialog_module'})
		gTab='\t';
		var n1=gLines[0].split('\t').length;
		var n2=gLines[0].split(',').length;
		if(n2>n1) gTab=',';
		gHeader=gLines[0].splitCSV(gTab);
		for(var k=0;k<gHeader.length;k++){gHeader[k]=gHeader[k].trim().replace(/ /g,'_');}
		gFields=m.form_fields.split(',');
		gI=1; //not 0, start from second line, the first line is header
		/*
		//check first record
		var items=gLines[gI].splitCSV(gTab);
		if(m.import_check_first_record!=undefined){
			m.import_check_first_record(items,function(r){
				if(r==1){
					$vm.open_dialog({name:'_system_import_dialog_module'});
					gOK=1;
					//start importing...
					gLoop=setInterval(one_loop, 500);
				}
			});
		}
		else{
			$vm.open_dialog({name:'_system_import_dialog_module'});
			gOK=1;
			//start importing...
			gLoop=setInterval(one_loop, 500);
		}
		*/
		$vm.open_dialog({name:'_system_import_dialog_module'});
		gOK=1;
		//start importing...
		gLoop=setInterval(one_loop, 500);
	}
}
//-------------------------------------
var processing_file_end=function(){
	gOK=1;
	$('#import_num'+gDialog_module_id).text(gNumber_completed.toString()+"/"+gNumber_to_process.toString());
	if(gNumber_to_process<=gNumber_completed){
		gNumber_to_process=-1;
		$vm.close_dialog({name:'_system_import_dialog_module'});
		alert(gNumber_completed.toString()+" records have been imported.");
		m.set_req(); m.request_data();
	}
}
//-------------------------------------
