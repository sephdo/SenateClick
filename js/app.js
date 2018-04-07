var ev_arr = import_json("seats");
var colors = import_json("colors");
var demgop_colors = colors["demgop"]
var greenlib_colors = colors["greenlib"]
var all_colors = colors["all"]
var partisan_colors = colors["partisan"]
var nocontest = {"DEM4":23,"GOP4":42}
var veep = "R"
var ShowAlabama = false
var scoreboard = {"DEM1":0,"DEM2":0,"DEM3":0,"DEM4":0,"GOP1":0,"GOP2":0,"GOP3":0,"GOP4":0,"GREEN1":0,"GREEN2":0,"GREEN3":0,"LIB1":0,"LIB2":0,"LIB3":0,"SWING":0}

function import_json(filename){
	xhr = new XMLHttpRequest();
	xhr.open("GET","./json/"+filename+".json",false);
	xhr.send("");
	return JSON.parse(xhr.responseText)
}

function import_svg(callback){
	xhr = new XMLHttpRequest();
	xhr.open("GET","./svg/map.svg",false);
	xhr.overrideMimeType("image/svg+xml");
	xhr.send("");
	document.getElementById("svgContainer").appendChild(xhr.responseXML.documentElement);
	//callback();
}
function handle_resize(){
	$('#container').css({
        'position' : 'absolute',
        'left' : '50%',
        'top' : '50%',
        'margin-left' : function() {return -$(this).outerWidth()/2},
        'margin-top' : function() {return -$(this).outerHeight()/2}
    });
}
function adjust_scoreboard(){
	/*for(i = 0; i < scoreboard.length; i++){
		scoreboard[i]["score"]=0
	}*/
	for (var party in scoreboard){
		scoreboard[party] = 0
	}
	for (var party in nocontest){
		scoreboard[party] = nocontest[party]
	}
	demgain = 0
	gopgain = 0
	for (var seat in ev_arr){
		var incumbent = ev_arr[seat]["incumbent"]["party"]
		var party = ev_arr[seat]["party"]
		if (party.indexOf("DEM")>=0 && incumbent === "R"){
			demgain += 1
			gopgain -= 1
		} else if (party.indexOf("GOP")>=0 && incumbent !== "R"){
			gopgain += 1
			demgain -= 1
		}
		scoreboard[ev_arr[seat]["party"]] += 1
	}
	for (var party in scoreboard){
		$("#"+party).css("width","calc("+scoreboard[party].toString()+"% / 1.00)")
		if (scoreboard[party]>0){
			$("#"+party).css("display","inline-block")
		} else {
			$("#"+party).css("display","none")
		}
	}
	$(".scoretext").empty()
	$(".caucusbar").empty()
    dem_score = scoreboard["DEM4"]+scoreboard["DEM1"]+scoreboard["DEM2"]+scoreboard["DEM3"]
	gop_score = scoreboard["GOP4"]+scoreboard["GOP1"]+scoreboard["GOP2"]+scoreboard["GOP3"]
	green_score = scoreboard["GREEN1"]+scoreboard["GREEN2"]+scoreboard["GREEN3"]
	lib_score = scoreboard["LIB1"]+scoreboard["LIB2"]+scoreboard["LIB3"]
	$("#demscore").append("DEM "+dem_score.toString())
	$("#gopscore").append(gop_score.toString()+" GOP")
	
	if (dem_score === 50 && veep === "D"){
		$("#veep").addClass("DEM3-text")
		$("#veep").removeClass("GOP3-text")
		$("#veep").append("VP")
		$("#demcaucus").append("MAJORITY")
	} else if (gop_score === 50 && veep === "R"){
		$("#veep").addClass("GOP3-text")
		$("#veep").removeClass("DEM3-text")
		$("#veep").append("VP")
		$("#gopcaucus").append("MAJORITY")
	} else {
		$("#veep").removeClass("DEM3-text GOP3-text")
	}
	
	if (dem_score > 50){
		$("#demcaucus").append("MAJORITY")
	} else if (gop_score > 50){
		$("#gopcaucus").append("MAJORITY")
	}
	
	if (demgain > 0){
		$("#demgain").append("+"+demgain.toString())
	    $("#gopgain").append(gopgain)
	} else if (gopgain > 0) {
	    $("#demgain").append(demgain)
		$("#gopgain").append("+"+gopgain.toString())
	} else {
		$("#demgain").append("-")
		$("#gopgain").append("-")
	}
	if (green_score>0){
		$("#demscore").append(" / GRN "+green_score.toString())
	}
	if (lib_score>0){
		$("#gopscore").prepend(lib_score.toString()+" LIB / ")
	}
	
}
function click_state(event) {
		var state = event.target.parentElement.id
		if (!(state in ev_arr)){
			return;
		}
		var stateid = "#"+state
		if (event.shiftKey){
			switch(ev_arr[state]["axis"]){
				case "demgop":
					ev_arr[state]["axis"] = "greenlib"
					var party = ev_arr[state]["party"]
					//var party_index = findWithAttr(demgop_colors,"party",party)
					var party_index = demgop_colors.indexOf(party)
					//$(stateid).attr("fill",greenlib_colors[party_index]["color"])
					if (party !== "SWING"){
					    $(stateid).addClass(greenlib_colors[party_index]);
					    $(stateid).removeClass(demgop_colors[party_index]);
					}
					ev_arr[state]["party"] = greenlib_colors[party_index]
					ev_arr[state]["axis"] = "greenlib"
					break
				case "greenlib":
					ev_arr[state]["axis"] = "demgop"
					var party = ev_arr[state]["party"]
					//var party_index = findWithAttr(greenlib_colors,"party",party)
					var party_index = greenlib_colors.indexOf(party)
					//$(stateid).attr("fill",demgop_colors[party_index]["color"])
					if (party !== "SWING"){
					    $(stateid).addClass(demgop_colors[party_index]);
					    $(stateid).removeClass(greenlib_colors[party_index]);
					}
					ev_arr[state]["party"] = demgop_colors[party_index]
					ev_arr[state]["axis"] = "demgop"
					break
			}
		} else{
			if (ev_arr[state]["axis"]=="demgop"){
				var axis = demgop_colors
			} else {
				var axis = greenlib_colors
			}
			var party = ev_arr[state]["party"]
			//var party_index = findWithAttr(axis,"party",party)
			var party_index = axis.indexOf(party)
			switch (event.which){
				case 1:
					if (event.ctrlKey){
						if (party_index<6){
							//$(stateid).attr("fill",axis[party_index+1]["color"])
						    $(stateid).addClass(axis[party_index+1]);
							$(stateid).removeClass(axis[party_index]);
							ev_arr[state]["party"] = axis[party_index+1]
						}	
					} else if (party_index>0){
						//$(stateid).attr("fill",axis[party_index-1]["color"])
						$(stateid).addClass(axis[party_index-1]);
						$(stateid).removeClass(axis[party_index]);
						ev_arr[state]["party"] = axis[party_index-1]
					}
					break;
				case 2:
					break;
				case 3:
					if (party_index<6){
						//$(stateid).attr("fill",axis[party_index+1]["color"])
						$(stateid).addClass(axis[party_index+1]);
					    $(stateid).removeClass(axis[party_index]);
						ev_arr[state]["party"] = axis[party_index+1]
					}
					break;
				default:
					break;
			}
		}
		
		adjust_scoreboard();
		update_local(state);
		
		
		
    }
function update_local(state){
	localStorage[state] = JSON.stringify(ev_arr[state])
}
function retrieve_local(){
	if (localStorage["ShowAlabama"]!==undefined){
		toggleAlabama(JSON.parse(localStorage["ShowAlabama"]));
	} else {
		toggleAlabama(ShowAlabama)
	}
	for (var seat in ev_arr){
		if (localStorage[seat]!==undefined){
			ev_arr[seat] = JSON.parse(localStorage[seat])
			//$("#"+seat).attr("fill",all_colors[ev_arr[seat]["party"]])
			if (ev_arr[seat]["party"]!=="SWING"){
			    $("#"+seat).toggleClass("SWING "+ev_arr[seat]["party"])	
			}
			
		}
		
	}
}
function toggleAlabama(arg){
	if (arg===undefined){
		arg = !ShowAlabama
	}
	ShowAlabama = arg
	localStorage["ShowAlabama"] = JSON.stringify(arg)
	if (arg===true){
		nocontest["DEM4"] = 22
		ev_arr["AL-II"]={"state": "Alabama","class": 2,"party": "SWING","axis": "demgop","incumbent": {"name": "Strange","party": "R","2012 result":"GOP3"}}
		$("#labelAL-II").css("display","inline")
		$("#AL-II").addClass("SWING")
		$("#AL-II").removeClass("DEM1 DEM2 DEM3 GOP1 GOP2 GOP3 GREEN1 GREEN2 GREEN3 LIB1 LIB2 LIB3 NOELECTION")
	} else {
		nocontest["DEM4"] = 23
		if (ev_arr.hasOwnProperty("AL-II")){
			$("#AL-II").toggleClass(ev_arr["AL-II"]["party"]+" NOELECTION")
		    delete ev_arr["AL-II"]
		} else {
			$("#AL-II").addClass("NOELECTION")
		}
		localStorage.removeItem("AL-II");
		$("#labelAL-II").css("display","none")
	}
	adjust_scoreboard()
}
function lastResult(){
	for (var seat in ev_arr){
		var party = ev_arr[seat]["party"]
		var previous = ev_arr[seat]["incumbent"]["2012 result"]
		if (party !== previous){
		    ev_arr[seat]["party"] = previous
		    $("#"+seat).toggleClass(previous+" "+party)
		}
		update_local(seat)
	}
	adjust_scoreboard()
}
function findWithAttr(array, attr, value) {
	try{
		for(var i = 0; i < array.length; i += 1) {
			if(array[i][attr] === value) {
				return i;
			}
		}
	} catch(err) {
		console.log(err)
		console.log(array+attr+value)
	}
}

function reset_map(){
	/*Seemingly easier to just do this:
	var ev_arr = import_json("seats");
	, but it's a nonlocal variable. Todo - wrap this in an object with reset method.*/
	var ev2 = import_json("seats");
	toggleAlabama(true)
	for (seat in ev2){
		if (ev_arr[seat]["party"]!==ev2[seat]["party"]){
			$("#"+seat).toggleClass(ev_arr[seat]["party"]+" "+ev2[seat]["party"])	
		}
		ev_arr[seat] = ev2[seat]
		//$("#"+seat).attr("fill",all_colors[ev_arr[seat]["party"]])
	}
	localStorage.clear();
	adjust_scoreboard();
}

/*function fontsize () {
     // 10% of container width
	if($(window).height()>$(window).width()){
		var fontSize = $("#scorebar").height()/2
		//$(".lowernote").css('font-size', fontSize);
		$(".scoretext").css('font-size', fontSize);
		$(".scoretext").css('top', fontSize/2);
		$(".scoretext").css('transform', "translateY(0%)");

	} else{
		var fontSize = $("#scorebar").height();
		//$(".lowernote").css('font-size', 2*fontSize/3);
		$(".scoretext").css('font-size', fontSize);
		$(".scoretext").css('top', fontSize/2);
		$(".scoretext").css('transform', "translateY(-50%)");
	
	}
	//console.log(fontSize)
    
};*/