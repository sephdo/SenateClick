var ev_arr = import_json("seats");
var colors = import_json("colors");
var demgop_colors = colors["demgop"]
var greenlib_colors = colors["greenlib"]
var all_colors = {"GOP4":"#D32F2F","DEM4":"#1976D2"}
for (i=0;i<colors["demgop"].length;i++){

	all_colors[colors["demgop"][i]["party"]] = colors["demgop"][i]["color"]
	all_colors[colors["greenlib"][i]["party"]] = colors["greenlib"][i]["color"]
}
var nocontest = {"DEM3":22,"GOP3":42}
var scoreboard = [
	{party:"DEM1",score:0},
	{party:"DEM2",score:0},
	{party:"DEM3",score:0},
	{party:"GOP1",score:0},
	{party:"GOP2",score:0},
	{party:"GOP3",score:0},
	{party:"GREEN1",score:0},
	{party:"GREEN2",score:0},
	{party:"GREEN3",score:0},
	{party:"LIB1",score:0},
	{party:"LIB2",score:0},
	{party:"LIB3",score:0},
	{party:"SWING",score:0	},
]

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
	for(i = 0; i < scoreboard.length; i++){
		scoreboard[i]["score"]=0
	}
	for (var party in nocontest){
		var party_index = findWithAttr(scoreboard,"party",party)
		scoreboard[party_index]["score"] = nocontest[party]
	}
	for (var seat in ev_arr){
		var party_index = findWithAttr(scoreboard,"party",ev_arr[seat]["party"])
		scoreboard[party_index]["score"] += 1
	}
	for(i = 0; i < scoreboard.length; i++){
		scoreid = "#"+scoreboard[i]["party"]
		$(scoreid).css("width","calc("+scoreboard[i]["score"].toString()+"% / 1.00)")
		if (scoreboard[i]["score"]>0){
			$(scoreid).css("display","inline-block")
		} else {
			$(scoreid).css("display","none")
		}
	}
	$(".scoretext").empty()
	dem_score = scoreboard[0]["score"]+scoreboard[1]["score"]+scoreboard[2]["score"]
	gop_score = scoreboard[3]["score"]+scoreboard[4]["score"]+scoreboard[5]["score"]
	green_score = scoreboard[6]["score"]+scoreboard[7]["score"]+scoreboard[8]["score"]
	lib_score = scoreboard[9]["score"]+scoreboard[10]["score"]+scoreboard[11]["score"]
	$("#lefttext").append("DEM "+dem_score.toString())
	$("#righttext").append(gop_score.toString()+" GOP")
	if (green_score>0){
		$("#lefttext").append(" / GRN "+green_score.toString())
	}
	if (lib_score>0){
		$("#righttext").prepend(lib_score.toString()+" LIB / ")
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
					var party_index = findWithAttr(demgop_colors,"party",party)
					$(stateid).attr("fill",greenlib_colors[party_index]["color"])
					$(stateid).attr("party",greenlib_colors[party_index]["party"])
					ev_arr[state]["party"] = greenlib_colors[party_index]["party"]
					ev_arr[state]["axis"] = "greenlib"
					break
				case "greenlib":
					ev_arr[state]["axis"] = "demgop"
					var party = ev_arr[state]["party"]
					var party_index = findWithAttr(greenlib_colors,"party",party)
					$(stateid).attr("fill",demgop_colors[party_index]["color"])
					$(stateid).attr("party",demgop_colors[party_index]["party"])
					ev_arr[state]["party"] = demgop_colors[party_index]["party"]
					ev_arr[state]["axis"] = "demgop"
					break
			}
		} else{
			if (ev_arr[state]["axis"]=="demgop"){
				var party_colors = demgop_colors
			} else {
				var party_colors = greenlib_colors
			}
			var party = ev_arr[state]["party"]
			var party_index = findWithAttr(party_colors,"party",party)
			switch (event.which){
				case 1:
					if (event.ctrlKey){
						if (party_index<6){
							$(stateid).attr("fill",party_colors[party_index+1]["color"])
							ev_arr[state]["party"] = party_colors[party_index+1]["party"]
						}	
					} else if (party_index>0){
						$(stateid).attr("fill",party_colors[party_index-1]["color"])
						ev_arr[state]["party"] = party_colors[party_index-1]["party"]
					}
					break;
				case 2:
					break;
				case 3:
					if (party_index<6){
						$(stateid).attr("fill",party_colors[party_index+1]["color"])
						ev_arr[state]["party"] = party_colors[party_index+1]["party"]
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
	for (var seat in ev_arr){
		if (localStorage[seat]!==undefined){
			ev_arr[seat] = JSON.parse(localStorage[seat])
			$("#"+seat).attr("fill",all_colors[ev_arr[seat]["party"]])
		}
		
	}
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
	for (seat in ev2){
		ev_arr[seat] = ev2[seat]
		$("#"+seat).attr("fill",all_colors[ev_arr[seat]["party"]])
	}
	localStorage.clear();
	adjust_scoreboard();
}

function fontsize () {
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
    
};